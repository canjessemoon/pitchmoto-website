# PitchMoto Matching System Implementation Specification

**Version:** 1.0  
**Last Updated:** September 8, 2025  
**Status:** Ready for Implementation  
**Owner:** Jesse / PitchMoto Core  
**Implementor:** VS Code AI Agent (Next.js + Supabase + Stripe stack)

---

## 🎯 Executive Summary

**Goal:** Replace the previous upvote system with a structured, matching-first system that connects investors to startups based on explicit thesis criteria.

**Success Metrics (v1):**
- ≥80% of investors complete thesis setup in one session
- Median fit score displayed for each investor feed
- ≥60% of startups receive ≥1 investor match within 7 days of publish

**Out of Scope:** upvotes, social feeds, public leaderboards, complex CRM export

---

## 📋 Implementation Progress Tracker

### Phase A: Environment & Packages
- [ ] **A1.** Install required dependencies (`@supabase/supabase-js`, `zod`, `react-hook-form`)
- [ ] **A2.** Verify environment variables and Supabase connection

### Phase B: Database & Security
- [ ] **B3.** Create database schema migration (enums, tables, relationships)
- [ ] **B4.** Insert seed data (sectors, focus tags, countries)
- [ ] **B5.** Implement Row Level Security (RLS) policies
- [ ] **B6.** Add performance indexes

### Phase C: Matching Engine & API
- [ ] **C7.** Build scoring utility functions
- [ ] **C8.** Implement GET `/api/matching/thesis`
- [ ] **C9.** Implement PUT `/api/matching/thesis`
- [ ] **C10.** Implement GET `/api/matching/startups`
- [ ] **C11.** Implement POST `/api/matching/recompute`
- [ ] **C12.** Implement GET `/api/matching/summary`
- [ ] **C13.** Setup cron refresh job

### Phase D: Frontend (Investor)
- [ ] **D14.** Build Investor Thesis Setup Page
- [ ] **D15.** Build Investor Matches Page

### Phase E: Frontend (Founder)
- [ ] **E16.** Build Founder Match Summary

### Phase F: Validation & Quality
- [ ] **F17.** Create Zod validation schemas
- [ ] **F18.** Implement telemetry events
- [ ] **F19.** Write unit tests

### Phase G: Testing & QA
- [ ] **G20.** Create seed data for testing
- [ ] **G21.** Complete QA script validation

---

## 🏗️ Technical Architecture

### Database Schema Overview

#### Core Tables
1. **`investor_profiles`** - Basic investor information
2. **`investor_thesis`** - Investment criteria and preferences
3. **`sectors`** - Managed taxonomy of startup sectors
4. **`focus_tags`** - Managed taxonomy of special focus areas
5. **`thesis_sectors`** - Many-to-many: investor thesis ↔ sectors
6. **`thesis_focus_tags`** - Many-to-many: investor thesis ↔ focus tags
7. **`startups`** - Enhanced existing table with matching fields
8. **`investor_startup_matches`** - Materialized match cache with scores

#### Key Enums
- **`investing_stage_enum`**: `pre_seed`, `seed`, `series_a`, `series_b_plus`, `growth_pe`

### Matching Algorithm (v1)

**Scoring Dimensions & Weights:**
- **Stage**: 35% weight
- **Geography**: 25% weight  
- **Sector**: 30% weight
- **Check Size vs Raise**: 10% weight
- **Focus Tags**: Bonus up to +5 points

**Overall Formula:**
```
fit_score = (0.35 × stage_score) + (0.25 × geo_score) + (0.30 × sector_score) + (0.10 × check_score) + focus_bonus
Clamp to 0-100 range
```

**Fit Score Labels:**
- 85-100: "Excellent fit"
- 70-84: "Strong fit"  
- 50-69: "Potential fit"
- <50: Hidden by default (toggle to show)

---

## 🗃️ Database Schema (Full SQL)

```sql
-- Create enums
CREATE TYPE investing_stage_enum AS ENUM ('pre_seed','seed','series_a','series_b_plus','growth_pe');

-- Investor profiles
CREATE TABLE investor_profiles (
  id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  display_name text,
  org_name text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz
);

-- Investor thesis (core investment criteria)
CREATE TABLE investor_thesis (
  investor_id uuid PRIMARY KEY REFERENCES investor_profiles(id) ON DELETE CASCADE,
  stages investing_stage_enum[] NOT NULL,
  countries text[] NOT NULL,
  check_min_usd int,
  check_max_usd int,
  notes_other_focus text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz
);

-- Managed sector taxonomy
CREATE TABLE sectors (
  id serial PRIMARY KEY,
  slug text UNIQUE NOT NULL,
  label text NOT NULL,
  active boolean DEFAULT true
);

-- Managed focus tags taxonomy
CREATE TABLE focus_tags (
  id serial PRIMARY KEY,
  slug text UNIQUE NOT NULL,
  label text NOT NULL,
  active boolean DEFAULT true
);

-- Many-to-many: thesis ↔ sectors
CREATE TABLE thesis_sectors (
  investor_id uuid REFERENCES investor_profiles(id) ON DELETE CASCADE,
  sector_id int REFERENCES sectors(id) ON DELETE CASCADE,
  PRIMARY KEY (investor_id, sector_id)
);

-- Many-to-many: thesis ↔ focus tags
CREATE TABLE thesis_focus_tags (
  investor_id uuid REFERENCES investor_profiles(id) ON DELETE CASCADE,
  focus_id int REFERENCES focus_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (investor_id, focus_id)
);

-- Materialized match cache
CREATE TABLE investor_startup_matches (
  investor_id uuid NOT NULL,
  startup_id uuid NOT NULL,
  fit_score numeric(5,2) NOT NULL,
  explanations jsonb NOT NULL,
  computed_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (investor_id, startup_id)
);

-- Performance indexes
CREATE INDEX ON startups(status);
CREATE INDEX ON startups(country_code);
CREATE INDEX ON investor_startup_matches(investor_id, fit_score DESC);
CREATE INDEX ON startups USING gin(sectors);
```

---

## 🌱 Seed Data

### Sectors (Initial Set)
```sql
INSERT INTO sectors (slug, label) VALUES
  ('saas', 'SaaS'),
  ('fintech', 'FinTech'),
  ('cleantech', 'CleanTech'),
  ('consumer', 'Consumer'),
  ('healthtech', 'HealthTech'),
  ('biotech', 'BioTech'),
  ('ai_ml', 'AI/ML'),
  ('devtools', 'DevTools'),
  ('marketplace', 'Marketplaces'),
  ('climatetech', 'ClimateTech');
```

### Focus Tags (Initial Set)
```sql
INSERT INTO focus_tags (slug, label) VALUES
  ('impact', 'Impact'),
  ('women_founders', 'Women Founders'),
  ('deep_tech', 'Deep Tech'),
  ('first_time_founders', 'First-Time Founders'),
  ('climate_tech', 'Climate Tech'),
  ('underrepresented_founders', 'Underrepresented Founders');
```

### Countries (MVP)
- Canada (`CA`)
- United States (`US`)

---

## 🔌 API Endpoints

### Base Path: `/api/matching/*`

#### `GET /api/matching/thesis`
- **Auth:** Investor required
- **Response:** Current investor thesis
```typescript
{
  stages: investing_stage_enum[],
  countries: string[],
  sectors: number[],
  check_min_usd?: number,
  check_max_usd?: number,
  focus_tags: number[],
  notes_other_focus?: string
}
```

#### `PUT /api/matching/thesis`
- **Auth:** Investor required
- **Body:** Thesis update payload (same as GET response)
- **Behavior:** Transactional upsert with m:n relationship updates

#### `GET /api/matching/startups`
- **Auth:** Investor required
- **Query:** `?limit=20&offset=0&minScore=70`
- **Response:** Paginated matched startups with scores
```typescript
{
  startup: {
    id: string,
    name: string,
    stage: investing_stage_enum,
    sectors: number[],
    country_code: string,
    // ... other startup fields
  },
  fit_score: number,
  explanations: Record<string, string>
}[]
```

#### `POST /api/matching/recompute`
- **Auth:** Investor required
- **Behavior:** Rate-limited force recompute for current investor
- **Response:** `{ count: number }`

#### `GET /api/matching/summary`
- **Auth:** Founder required
- **Query:** `?startupId=uuid`
- **Response:** Aggregated match statistics
```typescript
{
  total_matches: number,
  by_stage: Record<string, number>,
  by_country: Record<string, number>,
  by_sector: Record<string, number>
}
```

---

## 🎨 User Interface Specifications

### Investor Thesis Setup Page (`/investor/thesis`)

**Components Required:**
- **StageSelector**: Multi-select pill buttons
- **CountrySelector**: Searchable multi-select dropdown with chips
- **SectorSelector**: Typeahead multi-select with chips
- **CheckSizeRange**: Dual-range slider + numeric inputs (USD)
- **FocusTags**: Checkbox tags + "Other" free text
- **PreviewCard**: Live sentence-builder preview

**Validation Rules:**
- At least 1 stage, 1 country, 1 sector required
- `check_min_usd ≤ check_max_usd` (both optional)
- Max selections: sectors ≤ 8, focus tags ≤ 5, countries ≤ 12

**Features:**
- Autosave every 5s (debounced)
- Explicit Save button
- Real-time preview updates
- Toast notifications for success/error

### Investor Matches Page (`/investor/matches`)

**Card Layout:**
- Startup name & logo
- Sector chips
- Country flag + name
- Stage badge
- Raise range (if available)
- **Fit score + label** (prominent)
- Explanations tooltip

**Features:**
- Sort by fit score (desc), last updated
- Filter by minimum score (slider)
- Toggle to show/hide <50 scores
- Pagination (20 per page)
- Empty state messaging

### Founder Match Summary (`/startup/[id]/matches-summary`)

**Components:**
- Summary card: "You match **N** investors"
- Breakdown modal with charts:
  - Top stages among matched investors
  - Geographic distribution
  - Sector preferences
- Data quality suggestions panel

---

## 🔄 Matching Algorithm Details

### Scoring Functions (Pseudocode)

```typescript
function score(investorThesis: InvestorThesis, startup: Startup): MatchResult {
  const stage = stageScore(investorThesis.stages, startup.stage);
  const country = countryScore(investorThesis.countries, startup.country_code);
  const sector = sectorScore(investorThesis.sectors, startup.sectors);
  const check = checkScore(
    investorThesis.check_min_usd, 
    investorThesis.check_max_usd, 
    startup.raise_min_usd, 
    startup.raise_max_usd
  );
  const bonus = focusBonus(investorThesis.focus_tags, startup.focus_tags);

  let fit = 0.35 * stage + 0.25 * country + 0.30 * sector + 0.10 * check + bonus;
  fit = Math.max(0, Math.min(100, fit));

  return {
    fit_score: fit,
    explanations: {
      stage: getStageExplanation(stage),
      country: getCountryExplanation(country),
      sector: getSectorExplanation(sector),
      check: getCheckExplanation(check),
      focus: getFocusExplanation(bonus)
    }
  };
}
```

### Individual Dimension Scoring

**Stage Scoring:**
- Exact match: 100 points
- Adjacent stage: 60 points
- No overlap: 0 points

**Geography Scoring:**
- Country match: 100 points
- No country match: 0 points

**Sector Scoring:**
- Any overlap: 100 points
- Related category (future): 70 points
- No overlap: 0 points

**Check Size Scoring:**
- Full overlap: 100 points
- Partial overlap: 60 points
- No overlap: 0 points
- Missing data: 60 points (neutral)

**Focus Tags Bonus:**
- +2 points per overlapping tag
- Maximum +5 points total

---

## 🛡️ Security & RLS Policies

### Row Level Security Rules

```sql
-- Investor profiles: own records only
ALTER TABLE investor_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own investor profile" ON investor_profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own investor profile" ON investor_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Investor thesis: own records only
ALTER TABLE investor_thesis ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Investors can manage own thesis" ON investor_thesis
  FOR ALL USING (auth.uid() = investor_id);

-- Sectors & focus tags: read-only for all
ALTER TABLE sectors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Sectors are publicly readable" ON sectors
  FOR SELECT USING (true);

ALTER TABLE focus_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Focus tags are publicly readable" ON focus_tags
  FOR SELECT USING (true);

-- Startups: investors see published only, founders see own
ALTER TABLE startups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Investors can view published startups" ON startups
  FOR SELECT USING (status = 'published');
CREATE POLICY "Founders can manage own startups" ON startups
  FOR ALL USING (auth.uid() = founder_id);

-- Match cache: investors see own matches only
ALTER TABLE investor_startup_matches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Investors can view own matches" ON investor_startup_matches
  FOR SELECT USING (auth.uid() = investor_id);
```

---

## 📊 Telemetry Events

### Key Events to Track
- `thesis_saved` - When investor saves their thesis
- `thesis_edit_started` - When investor begins editing thesis
- `match_viewed` - When investor views a startup match
- `match_clicked` - When investor clicks through to startup details
- `founder_match_modal_opened` - When founder opens match breakdown
- `recompute_requested` - When investor manually triggers recompute

### Error Logging
- API failures and validation errors
- Autosave failures
- Matching algorithm errors
- RLS policy violations

---

## 🧪 Testing Strategy

### Unit Tests Required
- Scoring algorithm functions
- Edge cases: missing data, boundary conditions
- API endpoint validation
- Zod schema validation

### Integration Tests
- End-to-end investor thesis flow
- Match computation accuracy
- RLS policy enforcement
- Cron job execution

### Performance Tests
- Matching API response time (<150ms target)
- Large dataset handling
- Concurrent user scenarios

---

## 🚀 Deployment & Monitoring

### Vercel Cron Configuration
```json
{
  "crons": [
    {
      "path": "/api/matching/refresh",
      "schedule": "0 2 * * *"
    }
  ]
}
```

### Success Metrics Monitoring
- Thesis completion rate
- Match accuracy feedback
- API response times
- Error rates by endpoint

---

## 🔮 Future Enhancements (Post-v1)

### Phase 2 Considerations
- Relationship mapping for "related sectors"
- Multi-currency support for check sizes
- Team collaboration on shared theses
- Advanced filtering and sorting options
- Founder outreach workflow templates
- Private data room access based on match thresholds

### Technical Debt
- Optimize matching algorithm for scale
- Implement more sophisticated caching
- Add real-time match updates
- Enhanced analytics and reporting

---

## ✅ Definition of Done

### Release Criteria
- [ ] Investor can complete thesis setup in single session
- [ ] Investor sees ranked, scored startup matches
- [ ] Founder can view aggregated match statistics
- [ ] All RLS policies enforced correctly
- [ ] Matching API performs within SLA (<150ms)
- [ ] Nightly refresh job runs successfully
- [ ] All unit and integration tests pass
- [ ] Manual QA script completed
- [ ] Performance benchmarks met
- [ ] Telemetry events tracking correctly

### Acceptance Criteria Validation
1. ✅ Investor completes thesis in one page with validation
2. ✅ Investor sees ≥10 matched startups with fit scores (given seed data)
3. ✅ Thesis edits update matches within 2s and persist
4. ✅ Founder sees total matched investor count + breakdown
5. ✅ Admin can add sectors/focus tags via DB without code changes

---

## 📝 Notes & Decisions

### Technical Decisions Made
- Using materialized cache for performance
- Country-level geography matching for MVP
- Postgres arrays for simple many-to-many cases
- Zod for consistent validation across client/server

### Open Questions
- [ ] Should we implement real-time updates for matches?
- [ ] How to handle startup data quality scoring?
- [ ] What's the ideal cache refresh frequency?

### Dependencies
- Supabase database access
- Vercel cron functionality
- Existing user authentication system
- Current startup data structure

---

*Last updated: September 8, 2025*  
*Next review: After Phase B completion*
