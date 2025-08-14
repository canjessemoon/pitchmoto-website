-- Comprehensive test data for PitchMoto Discovery functionality
-- Run this in Supabase SQL Editor after applying the migrations

-- First, apply the missing columns migration
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
ADD COLUMN IF NOT EXISTS description TEXT;

-- Create a dummy founder user ID (you'll need to replace this with a real user ID)
-- You can get this by creating a founder account through the signup flow
DO $$
DECLARE
    dummy_founder_id UUID := gen_random_uuid();
BEGIN
    -- Insert dummy founder profile if needed
    INSERT INTO profiles (id, full_name, role, created_at, updated_at) 
    VALUES (dummy_founder_id, 'Demo Founder', 'founder', NOW(), NOW())
    ON CONFLICT (id) DO NOTHING;

    -- Clear existing test data
    DELETE FROM pitches WHERE title LIKE '%[TEST]%';
    DELETE FROM startups WHERE name LIKE '%[TEST]%';

    -- Insert test startups
    INSERT INTO startups (id, name, tagline, description, sector, location, website_url, logo_url, country, founded_year, team_size, founder_id) VALUES
        (gen_random_uuid(), '[TEST] NeuralFlow AI', 'Revolutionizing healthcare with AI-powered diagnostics', 'NeuralFlow AI develops cutting-edge artificial intelligence solutions for medical imaging and diagnostic applications. Our platform can detect anomalies in medical scans with 99.2% accuracy, reducing diagnosis time from hours to minutes.', 'Healthcare', 'Boston, MA', 'https://neuralflow.ai', null, 'United States', 2023, 28, dummy_founder_id),
        
        (gen_random_uuid(), '[TEST] GreenTech Solutions', 'Carbon-negative manufacturing for a sustainable future', 'GreenTech Solutions is pioneering carbon-negative manufacturing processes that not only eliminate emissions but actively remove CO2 from the atmosphere. Our proprietary technology turns waste materials into high-quality products.', 'Technology', 'Portland, OR', 'https://greentech.solutions', null, 'United States', 2022, 45, dummy_founder_id),
        
        (gen_random_uuid(), '[TEST] FinanceFlow', 'Democratizing investment access for emerging markets', 'FinanceFlow provides micro-investment platforms for underserved populations in emerging markets. Our mobile-first approach enables people to invest with as little as $1 and access global financial markets.', 'Finance', 'Singapore', 'https://financeflow.com', null, 'Singapore', 2024, 15, dummy_founder_id),
        
        (gen_random_uuid(), '[TEST] EduVerse', 'Immersive VR education for the next generation', 'EduVerse creates immersive virtual reality educational experiences that transport students to historical events, inside molecular structures, and across the universe. Our platform increases learning retention by 300%.', 'Education', 'Austin, TX', 'https://eduverse.com', null, 'United States', 2023, 22, dummy_founder_id),
        
        (gen_random_uuid(), '[TEST] FoodTech Labs', 'Lab-grown superfoods with enhanced nutrition', 'FoodTech Labs uses cellular agriculture to create nutrient-dense superfoods with 10x the vitamins and minerals of traditional crops. Our products require 95% less water and land than conventional agriculture.', 'Food & Beverage', 'Amsterdam', 'https://foodtechlabs.com', null, 'Netherlands', 2022, 35, dummy_founder_id),
        
        (gen_random_uuid(), '[TEST] SpaceLogistics', 'Last-mile delivery solutions for space missions', 'SpaceLogistics develops autonomous delivery systems for space stations and lunar bases. Our robotic systems can navigate in zero gravity and extreme conditions to deliver critical supplies.', 'Transportation', 'Los Angeles, CA', 'https://spacelogistics.com', null, 'United States', 2024, 18, dummy_founder_id),
        
        (gen_random_uuid(), '[TEST] QuantumSecure', 'Quantum-resistant cybersecurity for enterprise', 'QuantumSecure provides next-generation cybersecurity solutions that are resistant to quantum computing attacks. Our platform protects enterprise data against both current and future threats.', 'Technology', 'London', 'https://quantumsecure.com', null, 'United Kingdom', 2023, 31, dummy_founder_id),
        
        (gen_random_uuid(), '[TEST] BioHeal Therapeutics', 'Personalized gene therapy for rare diseases', 'BioHeal Therapeutics develops personalized gene therapies for patients with rare genetic disorders. Our breakthrough approach has shown remarkable results in clinical trials with a 85% success rate.', 'Healthcare', 'Basel', 'https://bioheal.com', null, 'Switzerland', 2021, 67, dummy_founder_id);

    -- Insert test pitches for these startups
    INSERT INTO pitches (id, startup_id, title, tagline, content, sector, location, stage, funding_ask, upvote_count, status, deck_url, one_pager_url)
    SELECT 
        gen_random_uuid(),
        s.id,
        s.name || ': ' || 
        CASE s.name 
            WHEN '[TEST] NeuralFlow AI' THEN 'Transforming Medical Diagnostics with AI'
            WHEN '[TEST] GreenTech Solutions' THEN 'Carbon-Negative Manufacturing Revolution'
            WHEN '[TEST] FinanceFlow' THEN 'Investment Access for Everyone'
            WHEN '[TEST] EduVerse' THEN 'Virtual Reality Meets Education'
            WHEN '[TEST] FoodTech Labs' THEN 'The Future of Sustainable Nutrition'
            WHEN '[TEST] SpaceLogistics' THEN 'Pioneering Space Commerce Infrastructure'
            WHEN '[TEST] QuantumSecure' THEN 'Quantum-Safe Enterprise Security'
            WHEN '[TEST] BioHeal Therapeutics' THEN 'Personalized Medicine for Rare Diseases'
        END,
        s.tagline,
        CASE s.name 
            WHEN '[TEST] NeuralFlow AI' THEN 'Problem Statement:
Medical imaging analysis is time-consuming and prone to human error. Radiologists take hours to analyze scans, creating bottlenecks in patient care. With a growing shortage of radiologists worldwide, this problem is only getting worse.

Our Solution:
NeuralFlow AI has developed a revolutionary AI-powered platform that can analyze medical images with superhuman accuracy. Our deep learning models, trained on millions of medical scans, can detect abnormalities in seconds rather than hours.

Key Features:
• 99.2% accuracy in detecting anomalies
• 300x faster than traditional analysis
• Integration with existing hospital systems
• FDA-approved algorithms
• Real-time collaborative tools for medical teams

Market Opportunity:
The global medical imaging AI market is projected to reach $12.9 billion by 2027, growing at 35% CAGR. We''re addressing a $45 billion total addressable market.

Traction:
• Deployed in 15 major hospitals
• Processed over 500,000 medical scans
• 98% customer satisfaction rate
• $3.2M ARR with 65% month-over-month growth
• Strategic partnerships with GE Healthcare and Siemens

Clinical Impact:
• Reduced diagnosis time from 4 hours to 8 minutes
• Improved early detection rates by 40%
• Prevented 200+ misdiagnoses in pilot programs
• Saved hospitals $2.8M in operational costs

Use of Funds:
• 50% - R&D and algorithm improvement
• 25% - FDA approvals for new imaging types
• 15% - Sales and marketing expansion
• 10% - Team growth and operations

We''re seeking Series A funding to accelerate our mission of making accurate medical diagnosis accessible to everyone, everywhere.'

            WHEN '[TEST] GreenTech Solutions' THEN 'The Climate Crisis Challenge:
Manufacturing accounts for 23% of global CO2 emissions. Traditional manufacturing processes not only harm the environment but also waste valuable resources. The world needs a fundamental shift toward sustainable production.

Our Revolutionary Approach:
GreenTech Solutions has developed the world''s first carbon-negative manufacturing platform. Instead of emitting CO2, our processes actively capture and sequester carbon while producing high-quality goods.

Technology Innovation:
• Proprietary bio-catalytic processes that consume CO2
• Waste-to-product conversion with 95% efficiency
• Modular manufacturing systems that scale rapidly
• AI-optimized production for maximum carbon capture
• Closed-loop systems with zero waste output

Environmental Impact:
• Carbon-negative footprint: -2.5 tons CO2 per ton of product
• 90% reduction in water usage
• 85% reduction in energy consumption
• Zero toxic waste generation
• Biodegradable end products

Market Opportunity:
The sustainable manufacturing market is projected to reach $395 billion by 2030. Early adopters are gaining competitive advantages and regulatory compliance benefits.

Business Traction:
• $8.5M in revenue from pilot customers
• 25 manufacturing partners signed
• 3 patents granted, 12 pending
• $15M in pre-orders for 2025
• Strategic partnership with Unilever

Customer Success Stories:
• Helped Patagonia achieve 100% carbon-neutral production
• Enabled a 40% cost reduction for automotive parts manufacturer
• Produced 50,000 units of biodegradable packaging for major retailer

Funding Use:
• 40% - Scale manufacturing facilities
• 30% - R&D for new product categories
• 20% - Market expansion and partnerships
• 10% - Team growth and operations

Join us in revolutionizing manufacturing for a sustainable future.'

            WHEN '[TEST] FinanceFlow' THEN 'The Global Financial Inequality Problem:
2.7 billion people worldwide lack access to basic financial services. In emerging markets, traditional investment minimums of $1,000+ exclude the majority of the population from wealth-building opportunities.

Our Democratic Solution:
FinanceFlow breaks down barriers to investment by enabling micro-investments starting at just $1. Our platform democratizes access to global financial markets for underserved populations.

Platform Features:
• $1 minimum investment with zero fees
• AI-powered personalized investment recommendations
• Educational content in 15 local languages
• Mobile-first design for feature phone compatibility
• Automated savings and investment tools
• Social investing features and community support

Technology Infrastructure:
• Blockchain-based fractional ownership
• Advanced fraud detection and security
• Offline transaction capabilities
• Integration with mobile money systems
• Real-time market data and analytics

Market Impact:
• 2.3M active users across 12 countries
• $450M in assets under management
• Average portfolio return of 12.3% annually
• 78% of users investing for the first time
• $23 average monthly investment per user

Financial Inclusion Results:
• Enabled 850,000 people to start investing
• Created $125M in wealth for underserved populations
• 65% of users are women
• Average user increased savings by 340%
• 92% user retention rate after 12 months

Growth Metrics:
• 150% year-over-year user growth
• $85 customer acquisition cost
• $1,200 lifetime value per user
• Expanding to 8 new countries in 2025
• Partnership pipeline worth $50M+ in potential AUM

Use of Funds:
• 45% - Geographic expansion and licensing
• 25% - Product development and AI enhancement
• 20% - Marketing and user acquisition
• 10% - Compliance and regulatory

Together, we can democratize wealth creation globally.'

            WHEN '[TEST] EduVerse' THEN 'The Education Engagement Crisis:
Traditional education struggles with declining student engagement. Studies show 70% of students are disengaged in class, leading to poor learning outcomes and high dropout rates.

Our Immersive Solution:
EduVerse transforms education through immersive virtual reality experiences. Students don''t just read about history—they witness it. They don''t just study molecules—they manipulate them.

VR Learning Experiences:
• Walk through ancient Rome with Julius Caesar
• Explore the human circulatory system from inside blood vessels
• Conduct virtual chemistry experiments safely
• Visit the International Space Station
• Witness the signing of the Declaration of Independence
• Dive into the ocean to study marine ecosystems

Educational Impact:
• 300% increase in learning retention
• 85% improvement in test scores
• 95% student engagement rate
• 60% reduction in absenteeism
• 40% improvement in STEM interest among girls

Technology Platform:
• Works with affordable VR headsets ($199+)
• Cloud-based content delivery
• Real-time collaborative virtual classrooms
• Teacher dashboard with analytics
• Content creation tools for educators
• Accessibility features for students with disabilities

Market Adoption:
• Used in 450+ schools across 15 countries
• 125,000 students have experienced our platform
• Average of 4.8/5 rating from educators
• 18 curriculum partnerships with education boards
• Featured in TIME''s Best Inventions 2024

Content Library:
• 500+ immersive experiences across all subjects
• Aligned with Common Core and international standards
• Available in 12 languages
• New content added weekly
• Custom experiences for specialized curricula

Business Model:
• $15/student/month subscription
• $2,500 one-time setup fee per school
• Premium content packs: $500-$2,000
• Custom content development: $10,000-$50,000
• Teacher training programs: $1,000/teacher

Funding Allocation:
• 40% - Content creation and curriculum expansion
• 30% - Technology development and platform scaling
• 20% - Sales, marketing, and partnerships
• 10% - Operations and team growth

We''re not just changing how students learn—we''re preparing them for a future where immersive technology is everywhere.'

            WHEN '[TEST] FoodTech Labs' THEN 'The Global Food Security Challenge:
By 2050, we need to feed 10 billion people while using 75% less farmland and 90% less water. Climate change is making traditional agriculture increasingly unreliable and resource-intensive.

Our Cellular Agriculture Revolution:
FoodTech Labs uses cutting-edge cellular agriculture to grow nutrient-dense superfoods in controlled environments. Our products contain 10x the vitamins and minerals of conventional crops while using 95% less resources.

Scientific Breakthrough:
• Proprietary cell cultivation techniques
• Enhanced nutrient profiles through genetic optimization
• Scalable bioreactor systems
• Faster growth cycles (30 days vs. 120 days)
• Year-round production independent of weather
• Zero pesticides, herbicides, or soil contamination

Product Portfolio:
• SuperSpinach: 10x iron, 15x vitamin K
• PowerKale: 8x calcium, 12x vitamin C
• MegaBroccoli: 20x sulforaphane, 6x fiber
• UltraBlueberries: 25x antioxidants
• ProteaWheat: 40% protein content
• NutriRice: Enhanced with vitamin A and iron

Environmental Impact:
• 95% less water usage
• 99% less land usage
• Zero agricultural runoff
• 80% lower carbon footprint
• No deforestation required
• Eliminated pesticide use

Market Validation:
• Whole Foods partnership for 500 stores
• $12M in pre-orders from food manufacturers
• Michelin-starred restaurants using our products
• Consumer taste tests: 87% prefer our products
• Nutritionist endorsements from Mayo Clinic
• Featured in National Geographic and Scientific American

Production Scaling:
• 3 operational facilities producing 50 tons/month
• 5 new facilities planned for 2025-2026
• Automated production systems reduce costs by 60%
• Target: $2.99/lb retail price (competitive with organic)
• Production capacity: 10,000 tons by 2027

Regulatory Approval:
• FDA GRAS status obtained
• EU Novel Food approval in progress
• USDA Organic certification pathway established
• Kosher and Halal certifications received
• Non-GMO verification completed

Investment Opportunity:
• $85B addressable market in functional foods
• $15M ARR with 180% year-over-year growth
• 78% gross margins at scale
• 15 patents granted, 25 pending
• Expansion to Asia and Europe planned

Use of Funds:
• 50% - Manufacturing facility expansion
• 25% - R&D for new product varieties
• 15% - Marketing and retail partnerships
• 10% - Regulatory approvals and certifications

Join us in feeding the world sustainably.'

            WHEN '[TEST] SpaceLogistics' THEN 'The Final Frontier Commerce Challenge:
Space commerce is exploding, but logistics infrastructure hasn''t kept pace. Current cargo delivery to space stations costs $20,000/kg and takes months to plan. As space bases expand, efficient logistics become critical.

Our Autonomous Space Delivery Solution:
SpaceLogistics has developed the first fully autonomous cargo delivery system for space environments. Our robotic fleet navigates zero gravity and extreme conditions to deliver supplies efficiently and cost-effectively.

Technology Innovation:
• AI-powered navigation in zero gravity
• Radiation-hardened robotic systems
• Autonomous docking with any spacecraft
• Extreme temperature operation (-270°F to +250°F)
• Solar-powered with 2-year operational life
• Real-time communication with ground control

Delivery Capabilities:
• Cargo capacity: 500kg to 5,000kg per mission
• Delivery radius: 1,000km from space stations
• Mission planning: 48 hours vs. 6 months traditional
• Cost reduction: 85% vs. current methods
• 99.7% delivery success rate
• Emergency delivery capability in 6 hours

Current Contracts:
• NASA: $25M contract for ISS supply missions
• SpaceX: Partnership for Starship cargo distribution
• Blue Origin: Lunar base logistics agreement
• European Space Agency: Research collaboration
• Private space companies: $40M in committed contracts
• U.S. Space Force: Strategic logistics partnership

Mission Success Stories:
• Delivered 15 tons of supplies to ISS in 6 months
• First commercial cargo delivery to lunar orbit
• Emergency medical supply delivery in record time
• Zero mission failures in 47 autonomous deliveries
• Saved NASA $12M in logistics costs
• Enabled 3 space stations to extend mission duration

Market Opportunity:
The space logistics market is projected to reach $18.6 billion by 2030, growing at 45% CAGR. Early commercial space stations will need reliable logistics partners.

Competitive Advantages:
• 5-year head start on autonomous space navigation
• Proprietary AI algorithms for zero-gravity maneuvering
• Established relationships with all major space agencies
• Proven track record with government contracts
• Patent portfolio protecting core technologies

Future Expansion:
• Mars cargo delivery system in development
• Asteroid mining logistics partnerships
• Space debris cleanup services
• Commercial satellite servicing
• Space tourism luggage delivery

Financial Performance:
• $18M revenue in past 18 months
• 340% year-over-year growth
• $45M in signed contracts for next 24 months
• 85% gross margins
• Break-even achieved in Q3 2024

Funding Use:
• 45% - Fleet expansion and manufacturing
• 25% - Mars mission technology development
• 20% - Ground operations and mission control
• 10% - Team expansion and operations

We''re building the logistics infrastructure for humanity''s multi-planetary future.'

            WHEN '[TEST] QuantumSecure' THEN 'The Quantum Computing Threat:
Quantum computers will soon be able to break current encryption methods in minutes, rendering today''s cybersecurity obsolete. Organizations need quantum-resistant security solutions before this "cryptographic apocalypse" arrives.

Our Quantum-Safe Solution:
QuantumSecure provides enterprise-grade cybersecurity that''s resistant to both classical and quantum computing attacks. We''re preparing organizations for the post-quantum world today.

Quantum-Resistant Technology:
• Post-quantum cryptographic algorithms
• Lattice-based encryption methods
• Zero-knowledge proof systems
• Quantum key distribution (QKD)
• Hybrid classical-quantum security architecture
• Forward-secure communication protocols

Enterprise Security Suite:
• Quantum-safe email encryption
• Secure file storage and sharing
• Protected video conferencing
• Blockchain with quantum resistance
• Identity and access management
• Network security and monitoring

Threat Protection:
• Current cyberthreats: 99.9% protection rate
• Quantum computer attacks: Theoretical immunity
• Advanced persistent threats (APTs)
• Zero-day exploits and malware
• Insider threats and data exfiltration
• Supply chain security vulnerabilities

Industry Adoption:
• Financial services: 45 banks and credit unions
• Healthcare: 23 hospital systems
• Government: 8 federal agencies
• Defense contractors: 15 companies
• Critical infrastructure: Power grids, water systems
• Technology companies: Including 3 Fortune 100

Compliance and Certifications:
• NIST Post-Quantum Cryptography standards
• Common Criteria EAL4+ certification
• FIPS 140-2 Level 3 validation
• SOC 2 Type II compliance
• GDPR and CCPA privacy compliance
• ISO 27001 information security management

Quantum Computing Timeline:
• IBM: 1,000+ qubit systems by 2025
• Google: Fault-tolerant quantum computer by 2030
• Microsoft: Topological qubits breakthrough
• China: Massive quantum computing investments
• NSA: Post-quantum cryptography migration urgency

Business Metrics:
• $32M ARR with 195% year-over-year growth
• 450+ enterprise customers
• 99.98% uptime SLA
• $2.8M average customer lifetime value
• 15-month sales cycle average
• 94% customer retention rate

Competitive Landscape:
• First-mover advantage in quantum-safe enterprise security
• 3-year technology lead over traditional cybersecurity vendors
• Strategic partnerships with quantum computing companies
• Advisory board includes NSA cryptographers
• Patent portfolio with 28 granted patents

Market Opportunity:
The cybersecurity market is $345 billion and growing at 12% annually. Post-quantum security represents a $50+ billion opportunity as organizations migrate their security infrastructure.

Investment Highlights:
• Addressing an inevitable, urgent need
• Government contracts provide stable revenue base
• High switching costs create customer stickiness
• Global expansion opportunities
• Strategic acquisition potential

Use of Funds:
• 40% - R&D and quantum algorithm development
• 30% - Sales and marketing expansion
• 20% - International market entry
• 10% - Operations and team growth

Secure your organization''s future in the quantum age.'

            WHEN '[TEST] BioHeal Therapeutics' THEN 'The Rare Disease Crisis:
95% of rare diseases have no approved treatments. 300 million people worldwide suffer from conditions that have been deemed "too rare" for traditional drug development. These patients and families are left without hope.

Our Personalized Gene Therapy Breakthrough:
BioHeal Therapeutics has developed a revolutionary platform for creating personalized gene therapies for rare genetic disorders. Instead of one-size-fits-all treatments, we create custom therapies for individual patients.

Scientific Innovation:
• CRISPR 3.0 gene editing technology
• Personalized vector design for each patient
• AI-powered treatment optimization
• In-vivo gene delivery systems
• Real-time therapeutic monitoring
• Minimal side effect profile

Treatment Platform:
• Custom gene therapy design in 90 days
• Patient-specific viral vectors
• Targeted delivery to affected organs
• Single-dose curative treatments
• Long-term therapeutic monitoring
• Compassionate use program for urgent cases

Clinical Success Stories:
• Sarah, age 8: Cured of Leber congenital amaurosis, now has normal vision
• Michael, age 34: ALS progression stopped, regained motor function
• Emma, age 12: Duchenne muscular dystrophy, now walking independently
• David, age 28: Huntington''s disease, symptoms reversed
• Sofia, age 15: Spinal muscular atrophy, dramatic muscle strength improvement

Clinical Trial Results:
• 85% overall success rate across all trials
• 78 patients treated to date
• Zero serious adverse events
• Average improvement: 340% in quality of life scores
• 12 different rare diseases successfully treated
• FDA Breakthrough Therapy designations for 6 treatments

Regulatory Pathway:
• FDA orphan drug designations: 15 granted
• EMA prime designation: 8 approved
• Fast track designation: 12 treatments
• Compassionate use approvals: 45 patients
• Clinical trial sites: 25 locations worldwide
• Regulatory consultants: Former FDA officials

Patient Access Program:
• Sliding scale pricing based on family income
• Partnership with insurance companies for coverage
• Charitable access fund for uninsured patients
• International patient treatment program
• Telemedicine monitoring and support
• Patient advocacy group partnerships

Market Opportunity:
• 7,000+ known rare diseases
• $242 billion rare disease therapeutics market
• Average orphan drug price: $150,000-$500,000 annually
• Our one-time treatment cost: $200,000-$400,000
• Health economics: $2M+ savings per patient lifetime
• Government incentives: Tax credits, extended exclusivity

Technology Advantages:
• Proprietary AI platform for therapy design
• 150+ patents in personalized gene therapy
• Exclusive licensing agreements with 12 universities
• Strategic partnerships with Roche and Novartis
• Manufacturing capabilities for clinical and commercial scale

Financial Performance:
• $95M in grant funding from NIH and European agencies
• $45M in milestone payments from pharma partnerships
• $25M in patient treatment revenue
• 12 therapies in clinical trials
• $180M in potential near-term milestones

Pipeline Development:
• 45 rare diseases in preclinical development
• 12 therapies entering clinical trials in 2025
• Platform expansion to cancer and autoimmune diseases
• Manufacturing scale-up for commercial production
• Global expansion to treat patients worldwide

Investment Impact:
• Direct impact on thousands of patients'' lives
• Pioneering the future of personalized medicine
• Potential for 100x return on successful therapies
• Exit opportunities through IPO or strategic acquisition
• Social impact investing with financial returns

Use of Funds:
• 50% - Clinical trials and regulatory approvals
• 25% - Manufacturing scale-up and automation
• 15% - R&D and platform expansion
• 10% - Operations and patient access programs

Join us in bringing hope to the hopeless and cures to the incurable.'
        END,
        CASE s.name 
            WHEN '[TEST] NeuralFlow AI' THEN 'Healthcare'
            WHEN '[TEST] GreenTech Solutions' THEN 'Technology'
            WHEN '[TEST] FinanceFlow' THEN 'Finance'
            WHEN '[TEST] EduVerse' THEN 'Education'
            WHEN '[TEST] FoodTech Labs' THEN 'Food & Beverage'
            WHEN '[TEST] SpaceLogistics' THEN 'Transportation'
            WHEN '[TEST] QuantumSecure' THEN 'Technology'
            WHEN '[TEST] BioHeal Therapeutics' THEN 'Healthcare'
        END,
        CASE s.name 
            WHEN '[TEST] NeuralFlow AI' THEN 'Boston, MA'
            WHEN '[TEST] GreenTech Solutions' THEN 'Portland, OR'
            WHEN '[TEST] FinanceFlow' THEN 'Singapore'
            WHEN '[TEST] EduVerse' THEN 'Austin, TX'
            WHEN '[TEST] FoodTech Labs' THEN 'Amsterdam'
            WHEN '[TEST] SpaceLogistics' THEN 'Los Angeles, CA'
            WHEN '[TEST] QuantumSecure' THEN 'London'
            WHEN '[TEST] BioHeal Therapeutics' THEN 'Basel'
        END,
        CASE s.name 
            WHEN '[TEST] NeuralFlow AI' THEN 'Series A'
            WHEN '[TEST] GreenTech Solutions' THEN 'Series B'
            WHEN '[TEST] FinanceFlow' THEN 'Seed'
            WHEN '[TEST] EduVerse' THEN 'Series A'
            WHEN '[TEST] FoodTech Labs' THEN 'Series A'
            WHEN '[TEST] SpaceLogistics' THEN 'Seed'
            WHEN '[TEST] QuantumSecure' THEN 'Series A'
            WHEN '[TEST] BioHeal Therapeutics' THEN 'Series B'
        END,
        CASE s.name 
            WHEN '[TEST] NeuralFlow AI' THEN 15000000
            WHEN '[TEST] GreenTech Solutions' THEN 25000000
            WHEN '[TEST] FinanceFlow' THEN 3000000
            WHEN '[TEST] EduVerse' THEN 8000000
            WHEN '[TEST] FoodTech Labs' THEN 12000000
            WHEN '[TEST] SpaceLogistics' THEN 5000000
            WHEN '[TEST] QuantumSecure' THEN 18000000
            WHEN '[TEST] BioHeal Therapeutics' THEN 35000000
        END,
        CASE s.name 
            WHEN '[TEST] NeuralFlow AI' THEN 47
            WHEN '[TEST] GreenTech Solutions' THEN 23
            WHEN '[TEST] FinanceFlow' THEN 31
            WHEN '[TEST] EduVerse' THEN 19
            WHEN '[TEST] FoodTech Labs' THEN 38
            WHEN '[TEST] SpaceLogistics' THEN 42
            WHEN '[TEST] QuantumSecure' THEN 29
            WHEN '[TEST] BioHeal Therapeutics' THEN 56
        END,
        'published',
        'https://example.com/decks/' || LOWER(REPLACE(s.name, ' ', '-')) || '.pdf',
        'https://example.com/onepagers/' || LOWER(REPLACE(s.name, ' ', '-')) || '.pdf'
    FROM startups s
    WHERE s.name LIKE '[TEST]%';

END $$;
