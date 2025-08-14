-- Test data for upvoting and discovery functionality
-- Run this in your Supabase SQL editor to create sample data

-- First, let's create some test users (if they don't exist)
-- You'll need to sign up through the app first, then we can update their profiles

-- Sample startups (replace with actual founder user IDs after signup)
INSERT INTO startups (id, name, tagline, description, sector, location, website_url, logo_url, country, founded_year, team_size, founder_id) VALUES
  ('123e4567-e89b-12d3-a456-426614174000', 'TechFlow AI', 'Automating business workflows with intelligent AI', 'TechFlow AI revolutionizes how businesses handle repetitive tasks by providing intelligent automation solutions that learn and adapt to your workflow patterns.', 'Technology', 'San Francisco, CA', 'https://techflow.ai', null, 'United States', 2023, 15, 'your-founder-user-id'),
  ('123e4567-e89b-12d3-a456-426614174001', 'GreenEnergy Solutions', 'Sustainable solar power for everyone', 'We make solar energy accessible and affordable for residential and commercial properties through innovative financing and installation solutions.', 'Energy', 'Austin, TX', 'https://greenenergy.com', null, 'United States', 2022, 8, 'your-founder-user-id'),
  ('123e4567-e89b-12d3-a456-426614174002', 'HealthTrack Pro', 'Personal health monitoring made simple', 'HealthTrack Pro combines wearable technology with AI-powered insights to help individuals monitor and improve their health outcomes.', 'Healthcare', 'Boston, MA', 'https://healthtrack.pro', null, 'United States', 2024, 12, 'your-founder-user-id');

-- Sample pitches for these startups
INSERT INTO pitches (id, startup_id, title, tagline, content, sector, location, stage, funding_ask, upvote_count, status) VALUES
  ('223e4567-e89b-12d3-a456-426614174000', '123e4567-e89b-12d3-a456-426614174000', 'TechFlow AI: Revolutionizing Business Automation', 'Automating business workflows with intelligent AI', 
   'TechFlow AI is transforming how businesses operate by automating complex workflows that traditionally require human intervention. Our platform uses advanced machine learning algorithms to understand, learn, and optimize business processes in real-time.

Key Features:
• Intelligent process automation that adapts to your workflow
• Natural language processing for document handling
• Real-time analytics and performance optimization
• Seamless integration with existing business tools

Market Opportunity:
The global business process automation market is projected to reach $19.6 billion by 2026, growing at a CAGR of 12.2%. We''re positioned to capture a significant share of this rapidly expanding market.

Traction:
• 150+ enterprise customers
• $2.5M ARR with 40% month-over-month growth
• 95% customer retention rate
• Strategic partnerships with Microsoft and Salesforce

Use of Funds:
• 40% - Product development and AI research
• 30% - Sales and marketing expansion
• 20% - Team growth (engineering and sales)
• 10% - Operations and infrastructure', 
   'Technology', 'San Francisco, CA', 'Series A', 5000000, 23, 'published'),
   
  ('223e4567-e89b-12d3-a456-426614174001', '123e4567-e89b-12d3-a456-426614174001', 'GreenEnergy Solutions: Solar Power for All', 'Sustainable solar power for everyone', 
   'GreenEnergy Solutions is democratizing access to clean energy through innovative solar solutions and flexible financing options. We''re making it easier and more affordable for everyone to transition to renewable energy.

Our Approach:
• Zero-down solar installations with flexible payment plans
• Advanced energy storage solutions for 24/7 clean power
• Smart energy management systems that optimize consumption
• Community solar programs for renters and small businesses

Environmental Impact:
• Prevented 50,000 tons of CO2 emissions
• Powered 2,500+ homes with clean energy
• Created 150 green jobs in local communities
• Partnered with 25 municipalities for community solar programs

Financial Performance:
• $8M in revenue over the past 18 months
• 300% year-over-year growth
• $12,000 average customer lifetime value
• 18-month payback period for customers

Growth Strategy:
We''re expanding to 5 new states in 2025 and launching our residential battery storage program. Our goal is to power 50,000 homes by 2026.',
   'Energy', 'Austin, TX', 'Seed', 2000000, 18, 'published'),
   
  ('223e4567-e89b-12d3-a456-426614174002', '123e4567-e89b-12d3-a456-426614174002', 'HealthTrack Pro: Your Personal Health Assistant', 'Personal health monitoring made simple', 
   'HealthTrack Pro combines cutting-edge wearable technology with AI-powered health insights to provide personalized health monitoring and recommendations for individuals and healthcare providers.

Product Features:
• Continuous health monitoring (heart rate, blood pressure, sleep, activity)
• AI-powered health insights and early warning systems
• Integration with electronic health records (EHR)
• Personalized wellness recommendations
• Telehealth platform integration

Target Market:
• Primary: Health-conscious consumers aged 25-55
• Secondary: Healthcare providers and employers
• Tertiary: Insurance companies seeking preventive care solutions

Clinical Validation:
• FDA clearance for our core monitoring algorithms
• Clinical trials showing 85% accuracy in early health issue detection
• Partnerships with Mayo Clinic and Johns Hopkins for research
• 10,000+ beta users with 92% satisfaction rate

Revenue Model:
• Hardware sales: $299 per device
• Subscription: $19.99/month for premium insights
• B2B licensing: $50/employee for corporate wellness programs
• Healthcare partnerships: Revenue sharing model

We''re seeking funding to scale manufacturing, expand our clinical team, and accelerate market penetration.',
   'Healthcare', 'Boston, MA', 'Series A', 8000000, 31, 'published');

-- Note: After creating users through signup, you'll need to:
-- 1. Update the founder_id fields in the startups table with actual user IDs
-- 2. Update user profiles to set correct roles (founder/investor)
-- 3. Test the upvoting and commenting functionality

-- Example query to update a user's role to investor:
-- UPDATE profiles SET role = 'investor', subscription_tier = 'paid' WHERE id = 'your-user-id';

-- Example query to update a user's role to founder:
-- UPDATE profiles SET role = 'founder' WHERE id = 'your-user-id';
