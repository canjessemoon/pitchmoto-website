# Matching System API Documentation

## Overview
The Matching System API provides endpoints for managing investor theses, generating matches between startups and investors, and tracking interactions. This replaces the simple upvote system with sophisticated matching based on investor criteria.

## Authentication
All endpoints require authentication via Bearer token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Base URL
```
/api/matching
```

---

## Investor Thesis Management

### GET /api/matching/thesis
Get the investor's active investment thesis.

**Authorization**: Investor only

**Response**:
```json
{
  "thesis": {
    "id": "uuid",
    "investor_id": "uuid",
    "min_funding_ask": 100000,
    "max_funding_ask": 5000000,
    "preferred_industries": ["Technology", "Healthcare"],
    "preferred_stages": ["Seed", "Series A"],
    "preferred_locations": ["San Francisco", "New York"],
    "min_equity_percentage": 5.0,
    "max_equity_percentage": 20.0,
    "industry_weight": 0.25,
    "stage_weight": 0.20,
    "funding_weight": 0.15,
    "location_weight": 0.10,
    "traction_weight": 0.20,
    "team_weight": 0.10,
    "keywords": ["AI", "SaaS"],
    "exclude_keywords": ["crypto"],
    "is_active": true,
    "created_at": "2025-09-08T10:00:00Z",
    "updated_at": "2025-09-08T10:00:00Z"
  }
}
```

### POST /api/matching/thesis
Create a new investment thesis (deactivates existing thesis).

**Authorization**: Investor only

**Request Body**:
```json
{
  "min_funding_ask": 100000,
  "max_funding_ask": 5000000,
  "preferred_industries": ["Technology", "Healthcare"],
  "preferred_stages": ["Seed", "Series A"],
  "preferred_locations": ["San Francisco", "New York"],
  "min_equity_percentage": 5.0,
  "max_equity_percentage": 20.0,
  "industry_weight": 0.25,
  "stage_weight": 0.20,
  "funding_weight": 0.15,
  "location_weight": 0.10,
  "traction_weight": 0.20,
  "team_weight": 0.10,
  "keywords": ["AI", "SaaS"],
  "exclude_keywords": ["crypto"],
  "is_active": true
}
```

**Validation Rules**:
- All weights must be between 0 and 1
- Weights should sum to 1.0 for optimal results
- `min_funding_ask` ≤ `max_funding_ask`
- `min_equity_percentage` ≤ `max_equity_percentage`

**Response**: Same as GET, with status 201

### PUT /api/matching/thesis
Update existing active thesis.

**Authorization**: Investor only

**Request Body**: Partial thesis object (same fields as POST, all optional)

**Response**: Updated thesis object

### DELETE /api/matching/thesis
Deactivate the current thesis.

**Authorization**: Investor only

**Response**:
```json
{
  "message": "Thesis deactivated successfully"
}
```

---

## Match Management

### GET /api/matching/matches
Get matches for the authenticated user.

**Authorization**: 
- Investors: Get their matches
- Founders: Get matches for their startups

**Query Parameters**:
- `page` (default: 1): Page number
- `limit` (default: 20): Items per page
- `min_score` (default: 0): Minimum match score
- `status` (default: "all"): Filter by status (pending, viewed, interested, not_interested, contacted)

**Response**:
```json
{
  "matches": [
    {
      "id": "uuid",
      "startup_id": "uuid",
      "investor_id": "uuid",
      "thesis_id": "uuid",
      "overall_score": 85,
      "industry_score": 100,
      "stage_score": 90,
      "funding_score": 80,
      "location_score": 70,
      "traction_score": 85,
      "team_score": 90,
      "match_reason": "Perfect industry match: Technology, Perfect stage match: Seed",
      "confidence_level": "high",
      "status": "pending",
      "viewed_at": null,
      "created_at": "2025-09-08T10:00:00Z",
      "updated_at": "2025-09-08T10:00:00Z",
      "startups": {
        "id": "uuid",
        "name": "TechStartup Inc",
        "tagline": "Revolutionary AI platform",
        "description": "...",
        "industry": "Technology",
        "stage": "Seed",
        "funding_goal": 2000000,
        "current_funding": 500000,
        "logo_url": "https://...",
        "website_url": "https://...",
        "profiles": {
          "full_name": "John Doe",
          "company": "TechStartup Inc",
          "location": "San Francisco"
        }
      }
    }
  ],
  "total": 45,
  "page": 1,
  "limit": 20,
  "has_more": true
}
```

### POST /api/matching/matches/generate
Generate new matches for investor based on their active thesis.

**Authorization**: Investor only

**Response**:
```json
{
  "message": "Generated 23 matches",
  "count": 23,
  "thesis_id": "uuid"
}
```

### GET /api/matching/matches/[id]
Get detailed information about a specific match.

**Authorization**: 
- Investors: Own matches only
- Founders: Matches for their startups only

**Response**:
```json
{
  "match": {
    // Full match object with startup and thesis details
  },
  "recent_interactions": [
    {
      "id": "uuid",
      "interaction_type": "view",
      "notes": null,
      "created_at": "2025-09-08T10:00:00Z"
    }
  ]
}
```

### PUT /api/matching/matches/[id]
Update match status.

**Authorization**: Investor (match owner) only

**Request Body**:
```json
{
  "status": "interested",
  "notes": "Impressive team and traction"
}
```

**Response**: Updated match object

---

## Interactions

### POST /api/matching/interactions
Record an interaction with a match.

**Authorization**: Investor only

**Request Body**:
```json
{
  "match_id": "uuid",
  "interaction_type": "like",
  "notes": "Great potential in this space"
}
```

**Interaction Types**:
- `view`: Mark as viewed
- `like`: Express interest
- `pass`: Not interested
- `save`: Save for later
- `contact`: Initiate contact
- `note`: Add a note

**Response**:
```json
{
  "interaction": {
    "id": "uuid",
    "match_id": "uuid",
    "investor_id": "uuid",
    "startup_id": "uuid",
    "interaction_type": "like",
    "notes": "Great potential in this space",
    "created_at": "2025-09-08T10:00:00Z"
  },
  "match_status": "interested"
}
```

### GET /api/matching/interactions
Get interactions for matches.

**Authorization**: 
- Investors: Own interactions
- Founders: Interactions on their startups

**Query Parameters**:
- `match_id`: Filter by specific match
- `startup_id`: Filter by specific startup
- `page` (default: 1): Page number
- `limit` (default: 50): Items per page

**Response**:
```json
{
  "interactions": [
    {
      "id": "uuid",
      "match_id": "uuid",
      "investor_id": "uuid",
      "startup_id": "uuid",
      "interaction_type": "view",
      "notes": null,
      "created_at": "2025-09-08T10:00:00Z",
      "startup_matches": {
        "id": "uuid",
        "startup_id": "uuid",
        "overall_score": 85,
        "status": "viewed"
      }
    }
  ],
  "total": 15,
  "page": 1,
  "limit": 50,
  "has_more": false
}
```

---

## Error Responses

All endpoints may return these error responses:

### 401 Unauthorized
```json
{
  "error": "Unauthorized"
}
```

### 403 Forbidden
```json
{
  "error": "Only investors can create interactions"
}
```

### 400 Bad Request
```json
{
  "error": "Invalid input",
  "details": [
    {
      "code": "invalid_type",
      "expected": "number",
      "received": "string",
      "path": ["min_funding_ask"],
      "message": "Expected number, received string"
    }
  ]
}
```

### 404 Not Found
```json
{
  "error": "Match not found or unauthorized"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

---

## Scoring Algorithm

The matching system uses a weighted scoring algorithm with the following criteria:

### Industry Score (Default weight: 0.25)
- 100: Exact match with preferred industries
- 80: No industry preference (neutral)
- 0: Not in preferred industries

### Stage Score (Default weight: 0.20)
- 100: Exact match with preferred stages
- 80: No stage preference (neutral)
- 60: Adjacent stage (±1 in sequence)
- 30: Two stages away
- 0: Further away

### Funding Score (Default weight: 0.15)
- 100: Within funding range
- 0-60: Scaled based on distance from range

### Location Score (Default weight: 0.10)
- 100: Location match
- 90: No location preference
- 40: No location match

### Traction Score (Default weight: 0.20)
- Based on funding progress, website, pitch deck
- Range: 40-100

### Team Score (Default weight: 0.10)
- Based on profile completeness
- Range: 50-100

### Overall Score
Weighted sum of all criteria scores, rounded to nearest integer.

### Confidence Levels
- High: ≥80
- Medium: 50-79
- Low: <50

---

## Rate Limits

- Thesis operations: 10 requests per minute
- Match generation: 1 request per 5 minutes
- Match retrieval: 100 requests per minute
- Interactions: 50 requests per minute

---

## Best Practices

1. **Thesis Setup**: Ensure weights sum to 1.0 for optimal matching
2. **Match Generation**: Run periodically, not on every request
3. **Pagination**: Use appropriate page sizes to avoid timeouts
4. **Error Handling**: Always check for error responses
5. **Caching**: Consider caching match results on the client side
