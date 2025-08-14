-- Corrected test data setup for PitchMoto Discovery
-- Copy and paste this entire script into Supabase SQL Editor and run it

-- Step 1: Add missing columns to existing tables
ALTER TABLE pitches 
ADD COLUMN IF NOT EXISTS tagline TEXT,
ADD COLUMN IF NOT EXISTS sector TEXT,
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS stage TEXT,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft',
ADD COLUMN IF NOT EXISTS deck_url TEXT,
ADD COLUMN IF NOT EXISTS one_pager_url TEXT;

ALTER TABLE startups 
ADD COLUMN IF NOT EXISTS country TEXT,
ADD COLUMN IF NOT EXISTS founded_year INTEGER,
ADD COLUMN IF NOT EXISTS team_size INTEGER,
ADD COLUMN IF NOT EXISTS description_extra TEXT;

-- Step 2: Create test founder profile using existing user or create placeholder
-- First, let's see if we have any existing users we can use
DO $$
DECLARE
    existing_user_id uuid;
BEGIN
    -- Try to find an existing user
    SELECT id INTO existing_user_id FROM auth.users LIMIT 1;
    
    IF existing_user_id IS NOT NULL THEN
        -- Use existing user
        INSERT INTO profiles (id, email, full_name, user_type, created_at, updated_at)
        VALUES (existing_user_id, 'demo@pitchmoto.com', 'Demo Founder', 'founder', NOW(), NOW())
        ON CONFLICT (id) DO UPDATE SET
            full_name = 'Demo Founder',
            user_type = 'founder';
    ELSE
        -- If no users exist, we'll need to sign up through the app first
        RAISE NOTICE 'No existing users found. Please sign up through the app first, then run this script again.';
    END IF;
END $$;

-- Step 3: Clear any existing test data
DELETE FROM pitches WHERE title LIKE 'TechFlow AI%' OR title LIKE 'GreenEnergy%' OR title LIKE 'HealthTrack%';
DELETE FROM startups WHERE name LIKE 'TechFlow AI%' OR name LIKE 'GreenEnergy%' OR name LIKE 'HealthTrack%';

-- Step 4: Insert test startups (using existing schema columns where possible)
DO $$
DECLARE
    founder_user_id uuid;
BEGIN
    -- Get the first founder user ID
    SELECT id INTO founder_user_id FROM profiles WHERE user_type = 'founder' LIMIT 1;
    
    IF founder_user_id IS NOT NULL THEN
        INSERT INTO startups (id, name, tagline, description, industry, stage, funding_goal, country, founded_year, team_size, founder_id) VALUES
        ('22222222-2222-2222-2222-222222222222'::uuid, 'TechFlow AI', 'Automating business workflows with intelligent AI', 'TechFlow AI revolutionizes how businesses handle repetitive tasks by providing intelligent automation solutions that learn and adapt to your workflow patterns.', 'Technology', 'Series A', 15000000, 'United States', 2023, 28, founder_user_id),

        ('33333333-3333-3333-3333-333333333333'::uuid, 'GreenEnergy Solutions', 'Sustainable solar power for everyone', 'We make solar energy accessible and affordable for residential and commercial properties through innovative financing and installation solutions.', 'Energy', 'Seed', 8000000, 'United States', 2022, 15, founder_user_id),

        ('44444444-4444-4444-4444-444444444444'::uuid, 'HealthTrack Pro', 'Personal health monitoring made simple', 'HealthTrack Pro combines wearable technology with AI-powered insights to help individuals monitor and improve their health outcomes.', 'Healthcare', 'Series A', 12000000, 'United States', 2024, 22, founder_user_id),

        ('55555555-5555-5555-5555-555555555555'::uuid, 'EduVerse VR', 'Immersive virtual reality education platform', 'EduVerse creates immersive VR educational experiences that transport students to historical events, inside molecular structures, and across the universe.', 'Education', 'Series A', 10000000, 'United Kingdom', 2023, 18, founder_user_id),

        ('66666666-6666-6666-6666-666666666666'::uuid, 'FinanceFlow', 'Democratizing investment access globally', 'FinanceFlow provides micro-investment platforms for underserved populations, enabling anyone to invest with as little as $1.', 'Finance', 'Seed', 5000000, 'Singapore', 2024, 12, founder_user_id);
    ELSE
        RAISE NOTICE 'No founder profile found. Please ensure a founder user is signed up first.';
    END IF;
END $$;

-- Step 5: Insert test pitches with comprehensive content
INSERT INTO pitches (id, startup_id, title, tagline, content, sector, location, stage, funding_ask, upvote_count, status, deck_url, one_pager_url) VALUES

('77777777-7777-7777-7777-777777777777'::uuid, '22222222-2222-2222-2222-222222222222'::uuid, 'TechFlow AI: Revolutionizing Business Automation', 'Automating business workflows with intelligent AI', 
'🚀 **The Problem**
Businesses waste 40% of their time on repetitive tasks. Manual workflows create bottlenecks, errors, and frustrated employees.

💡 **Our Solution**
TechFlow AI uses advanced machine learning to automate complex business processes that adapt and learn from your workflow patterns.

🔥 **Key Features**
• Intelligent process automation that adapts to your workflow
• Natural language processing for document handling  
• Real-time analytics and performance optimization
• Seamless integration with existing business tools

📈 **Market Opportunity**
$19.6B business process automation market by 2026, growing at 12.2% CAGR

🎯 **Traction**
• 150+ enterprise customers
• $2.5M ARR with 40% month-over-month growth
• 95% customer retention rate
• Strategic partnerships with Microsoft and Salesforce

💰 **Use of Funds**
• 40% - Product development and AI research
• 30% - Sales and marketing expansion  
• 20% - Team growth (engineering and sales)
• 10% - Operations and infrastructure', 
'Technology', 'San Francisco, CA', 'Series A', 15000000, 47, 'published', 'https://example.com/techflow-deck.pdf', 'https://example.com/techflow-onepager.pdf'),

('88888888-8888-8888-8888-888888888888'::uuid, '33333333-3333-3333-3333-333333333333'::uuid, 'GreenEnergy Solutions: Solar Power for All', 'Sustainable solar power for everyone', 
'🌍 **Environmental Crisis**
Climate change demands immediate action. Traditional energy is destroying our planet.

☀️ **Our Mission**
Democratizing access to clean energy through innovative solar solutions and flexible financing options.

⚡ **Our Approach**
• Zero-down solar installations with flexible payment plans
• Advanced energy storage for 24/7 clean power
• Smart energy management systems
• Community solar programs for renters

🌱 **Environmental Impact**
• Prevented 50,000 tons of CO2 emissions
• Powered 2,500+ homes with clean energy
• Created 150 green jobs in local communities
• 25 municipal partnerships for community solar

📊 **Financial Performance**  
• $8M revenue in past 18 months
• 300% year-over-year growth
• $12,000 average customer lifetime value
• 18-month payback period for customers

🚀 **Growth Strategy**
Expanding to 5 new states in 2025, launching residential battery storage program. Goal: Power 50,000 homes by 2026.', 
'Energy', 'Austin, TX', 'Seed', 8000000, 23, 'published', 'https://example.com/greenenergy-deck.pdf', 'https://example.com/greenenergy-onepager.pdf'),

('99999999-9999-9999-9999-999999999999'::uuid, '44444444-4444-4444-4444-444444444444'::uuid, 'HealthTrack Pro: Your Personal Health Assistant', 'Personal health monitoring made simple', 
'🏥 **Healthcare Challenge**
Healthcare is reactive, not preventive. Early detection could save millions of lives and billions in costs.

💪 **Our Innovation**
HealthTrack Pro combines cutting-edge wearable technology with AI-powered health insights for personalized monitoring.

🔬 **Product Features**
• Continuous health monitoring (heart rate, blood pressure, sleep, activity)
• AI-powered health insights and early warning systems
• Integration with electronic health records (EHR)
• Personalized wellness recommendations
• Telehealth platform integration

🎯 **Target Markets**
• Primary: Health-conscious consumers aged 25-55
• Secondary: Healthcare providers and employers  
• Tertiary: Insurance companies seeking preventive care

✅ **Clinical Validation**
• FDA clearance for core monitoring algorithms
• 85% accuracy in early health issue detection
• Partnerships with Mayo Clinic and Johns Hopkins
• 10,000+ beta users with 92% satisfaction

💼 **Revenue Model**
• Hardware sales: $299 per device
• Subscription: $19.99/month for premium insights
• B2B licensing: $50/employee for corporate wellness
• Healthcare partnerships: Revenue sharing model

We are seeking funding to scale manufacturing, expand our clinical team, and accelerate market penetration.', 
'Healthcare', 'Boston, MA', 'Series A', 12000000, 31, 'published', 'https://example.com/healthtrack-deck.pdf', 'https://example.com/healthtrack-onepager.pdf'),

('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, '55555555-5555-5555-5555-555555555555'::uuid, 'EduVerse VR: The Future of Education', 'Immersive virtual reality education platform', 
'📚 **Education Crisis**
70% of students are disengaged in traditional classrooms. We need immersive learning experiences.

🥽 **VR Learning Revolution**
EduVerse transforms education through immersive virtual reality. Students don''t just read about history—they witness it.

🌟 **VR Experiences**
• Walk through ancient Rome with Julius Caesar
• Explore the human circulatory system from inside blood vessels
• Conduct virtual chemistry experiments safely
• Visit the International Space Station
• Witness historical events firsthand

📈 **Educational Impact**
• 300% increase in learning retention
• 85% improvement in test scores
• 95% student engagement rate
• 60% reduction in absenteeism
• 40% improvement in STEM interest among girls

🏫 **Market Adoption**
• Used in 450+ schools across 15 countries
• 125,000 students experienced our platform
• 4.8/5 rating from educators
• 18 curriculum partnerships with education boards
• Featured in TIME''s Best Inventions 2024

💡 **Content Library**
• 500+ immersive experiences across all subjects
• Aligned with Common Core and international standards
• Available in 12 languages
• New content added weekly

We''re not just changing how students learn—we''re preparing them for a future where immersive technology is everywhere.', 
'Education', 'London, UK', 'Series A', 10000000, 19, 'published', 'https://example.com/eduverse-deck.pdf', 'https://example.com/eduverse-onepager.pdf'),

('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid, '66666666-6666-6666-6666-666666666666'::uuid, 'FinanceFlow: Investment Access for Everyone', 'Democratizing investment access globally', 
'💰 **Financial Inequality Crisis**
2.7 billion people worldwide lack access to basic financial services. Traditional investment minimums exclude the majority.

🌍 **Our Democratic Solution**
FinanceFlow breaks down barriers by enabling micro-investments starting at just $1. We democratize global financial markets.

📱 **Platform Features**
• $1 minimum investment with zero fees
• AI-powered personalized investment recommendations
• Educational content in 15 local languages
• Mobile-first design for feature phone compatibility
• Automated savings and investment tools
• Social investing features and community support

🔧 **Technology Infrastructure**
• Blockchain-based fractional ownership
• Advanced fraud detection and security
• Offline transaction capabilities
• Integration with mobile money systems
• Real-time market data and analytics

📊 **Market Impact**
• 2.3M active users across 12 countries
• $450M in assets under management
• 12.3% average annual portfolio return
• 78% of users investing for the first time
• $23 average monthly investment per user

🎯 **Financial Inclusion Results**
• Enabled 850,000 people to start investing
• Created $125M in wealth for underserved populations
• 65% of users are women
• Average user increased savings by 340%
• 92% user retention rate after 12 months

Together, we can democratize wealth creation globally.', 
'Finance', 'Singapore', 'Seed', 5000000, 38, 'published', 'https://example.com/financeflow-deck.pdf', 'https://example.com/financeflow-onepager.pdf');

SELECT 'Test data setup complete! You should now see 5 startups and pitches in the discovery page.' as status;
