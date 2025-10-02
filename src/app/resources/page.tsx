'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Navigation } from '@/components/ui/navigation'
import { Download, FileText, Video, Calculator, Presentation, MessageSquare, ExternalLink, BookOpen, Lightbulb, Target } from 'lucide-react'

interface Resource {
  id: string
  title: string
  description: string
  category: 'template' | 'guide' | 'tool' | 'example'
  type: 'download' | 'article' | 'video' | 'external'
  url?: string
  downloadUrl?: string
  icon: React.ComponentType<{ className?: string }>
  featured?: boolean
  tags: string[]
}

const resources: Resource[] = [
  // Professional Pitch Deck Templates
  {
    id: 'ycombinator-seed-deck',
    title: 'Y Combinator Seed Round Pitch Deck Template',
    description: 'The definitive template from YC for seed stage fundraising. Includes all essential slides with proven structure used by successful YC companies.',
    category: 'template',
    type: 'download',
    downloadUrl: '/templates/YC_Pitch_Deck_Template_Pitchmoto.pptx',
    url: 'https://www.ycombinator.com/library/2u-how-to-build-your-seed-round-pitch-deck',
    icon: Presentation,
    featured: true,
    tags: ['Y Combinator', 'seed round', 'fundraising', 'startup', 'YC']
  },
  {
    id: 'carta-series-a-deck',
    title: 'Carta Series A Pitch Deck Template', 
    description: 'Advanced template for Series A fundraising with detailed product sections and growth metrics. Based on Carta\'s comprehensive fundraising guide.',
    category: 'template',
    type: 'download',
    downloadUrl: '/templates/Carta_Pitch_Deck_Template_Pitchmoto.pptx',
    url: 'https://carta.com/learn/startups/fundraising/pitch-deck/series-a-pitch-deck/#6-product',
    icon: Presentation,
    featured: true,
    tags: ['Carta', 'Series A', 'growth', 'metrics', 'fundraising']
  },
  {
    id: 'sequoia-business-plan',
    title: 'Sequoia Capital Business Plan Template',
    description: 'Comprehensive business plan template from Sequoia Capital covering strategy, market analysis, and long-term vision.',
    category: 'template',
    type: 'download', 
    downloadUrl: '/templates/Sequoia_Pitch_Deck_Template_Pitchmoto.pptx',
    url: 'https://www.sequoiacap.com/article/writing-a-business-plan/',
    icon: Presentation,
    featured: true,
    tags: ['Sequoia Capital', 'business plan', 'strategy', 'market analysis']
  },
  {
    id: 'mars-investor-deck',
    title: 'MaRS Discovery District Investor Pitch Template',
    description: 'Complete investor presentation template with detailed guidance for each section. Developed by MaRS for Canadian startups.',
    category: 'template',
    type: 'download',
    downloadUrl: '/templates/MaRS_DD_Pitch_Deck_Template_Pitchmoto.pptx', 
    url: 'https://learn.marsdd.com/article/how-to-create-a-pitch-deck-for-investors/',
    icon: Presentation,
    featured: false,
    tags: ['MaRS', 'investor pitch', 'Canada', 'guidance', 'comprehensive']
  },

  // Financial Models
  {
    id: 'financial-model-basic',
    title: 'Basic Financial Model Template',
    description: '3-year financial projection template with revenue, expenses, and cash flow forecasting.',
    category: 'template',
    type: 'download',
    downloadUrl: '/resources/templates/basic-financial-model.xlsx',
    icon: Calculator,
    featured: true,
    tags: ['financial model', 'projections', 'cash flow', 'revenue']
  },
  {
    id: 'financial-model-saas',
    title: 'SaaS Financial Model',
    description: 'Advanced SaaS metrics model including LTV, CAC, churn, and MRR projections.',
    category: 'template',
    type: 'download',
    downloadUrl: '/resources/templates/saas-financial-model.xlsx',
    icon: Calculator,
    tags: ['saas', 'ltv', 'cac', 'mrr', 'churn']
  },


  // Video Guides
  {
    id: 'video-pitch-guide',
    title: 'How to Create a Compelling Pitch Video',
    description: 'Step-by-step guide to creating professional pitch videos that capture investor attention.',
    category: 'guide',
    type: 'article',
    url: '/resources/guides/pitch-video-guide',
    icon: Video,
    featured: true,
    tags: ['video', 'pitch', 'recording', 'presentation']
  },
  {
    id: 'video-equipment-guide',
    title: 'Budget Video Equipment Setup',
    description: 'Recommended equipment and setup for creating professional videos on a startup budget.',
    category: 'guide',
    type: 'article',
    url: '/resources/guides/video-equipment',
    icon: Video,
    tags: ['equipment', 'budget', 'setup', 'diy']
  },

  // Writing Guides
  {
    id: 'pitch-writing-guide',
    title: 'Writing Effective Pitches',
    description: 'Complete guide to crafting compelling written pitches that tell your story effectively.',
    category: 'guide',
    type: 'article',
    url: '/resources/guides/pitch-writing',
    icon: BookOpen,
    featured: true,
    tags: ['writing', 'storytelling', 'pitch', 'communication']
  },
  {
    id: 'investor-communication',
    title: 'Communicating with Investors',
    description: 'Best practices for initial outreach, follow-ups, and ongoing investor relations.',
    category: 'guide',
    type: 'article',
    url: '/resources/guides/investor-communication',
    icon: MessageSquare,
    tags: ['investors', 'communication', 'outreach', 'relations']
  },

  // Strategy Guides
  {
    id: 'fundraising-strategy',
    title: 'Fundraising Strategy Guide',
    description: 'Comprehensive guide to planning and executing successful fundraising campaigns.',
    category: 'guide',
    type: 'article',
    url: '/resources/guides/fundraising-strategy',
    icon: Target,
    tags: ['fundraising', 'strategy', 'planning', 'campaign']
  },
  {
    id: 'market-validation',
    title: 'Market Validation Framework',
    description: 'Step-by-step approach to validating your market and proving product-market fit.',
    category: 'guide',
    type: 'article',
    url: '/resources/guides/market-validation',
    icon: Lightbulb,
    tags: ['validation', 'market research', 'product-market fit']
  },

  // External Tools
  {
    id: 'canva-templates',
    title: 'Canva Pitch Deck Templates',
    description: 'Professional pitch deck templates available on Canva for easy customization.',
    category: 'tool',
    type: 'external',
    url: 'https://www.canva.com/templates/presentations/startup-pitch-deck/',
    icon: ExternalLink,
    tags: ['canva', 'design', 'templates', 'external']
  },
  {
    id: 'loom-video-tool',
    title: 'Loom for Pitch Videos',
    description: 'Free screen recording tool perfect for creating pitch videos and demos.',
    category: 'tool',
    type: 'external',
    url: 'https://www.loom.com',
    icon: ExternalLink,
    tags: ['loom', 'video', 'recording', 'external']
  }
]

const categories = [
  { id: 'all', name: 'All Resources', icon: BookOpen },
  { id: 'template', name: 'Templates', icon: FileText },
  { id: 'guide', name: 'Guides', icon: BookOpen },
  { id: 'tool', name: 'Tools', icon: Calculator },
  { id: 'example', name: 'Examples', icon: Presentation }
]

export default function ResourcesPage() {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  const filteredResources = resources.filter(resource => {
    const matchesCategory = selectedCategory === 'all' || resource.category === selectedCategory
    const matchesSearch = !searchTerm || 
      resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    
    return matchesCategory && matchesSearch
  })

  const featuredResources = resources.filter(resource => resource.featured)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Startup Resources
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Everything you need to create compelling pitches, connect with investors, and grow your startup. 
            Free templates, guides, and tools to help you succeed.
          </p>
        </div>

        {/* Featured Resources */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredResources.map((resource) => (
              <ResourceCard key={resource.id} resource={resource} featured />
            ))}
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search resources..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent`}
              />
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
                    selectedCategory === category.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <category.icon className="h-4 w-4" />
                  <span>{category.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Resources Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map((resource) => (
            <ResourceCard key={resource.id} resource={resource} />
          ))}
        </div>

        {/* No Results */}
        {filteredResources.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No resources found</h3>
            <p className="text-gray-500 mb-4">
              Try adjusting your search or filter criteria
            </p>
            <button
              onClick={() => {
                setSearchTerm('')
                setSelectedCategory('all')
              }}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-500"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Bottom CTA */}
        <div className="mt-16 bg-blue-600 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            Ready to Start Your Pitch?
          </h2>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Use these resources to create compelling pitches and connect with investors on PitchMoto.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg hover:bg-gray-100 font-medium"
            >
              Create Your Pitch
            </Link>
            <Link
              href="/how-it-works"
              className="bg-blue-700 text-white px-8 py-3 rounded-lg hover:bg-blue-800 font-medium"
            >
              Learn How It Works
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}

interface ResourceCardProps {
  resource: Resource
  featured?: boolean
}

function ResourceCard({ resource, featured = false }: ResourceCardProps) {
  const IconComponent = resource.icon

  const handleDownload = () => {
    if (resource.downloadUrl) {
      const link = document.createElement('a')
      link.href = resource.downloadUrl
      link.download = resource.title
      link.click()
    }
  }

  const handleViewGuide = () => {
    if (resource.url) {
      window.open(resource.url, '_blank')
    }
  }

  const handleClick = () => {
    // For templates with both download and guide, prioritize download
    if (resource.type === 'download' && resource.downloadUrl) {
      handleDownload()
    } else if (resource.url) {
      if (resource.type === 'external') {
        window.open(resource.url, '_blank')
      } else {
        window.location.href = resource.url
      }
    }
  }

  return (
    <div className={`bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6 cursor-pointer ${
      featured ? 'ring-2 ring-blue-600 ring-opacity-50' : ''
    }`} onClick={handleClick}>
      {featured && (
        <div className="mb-3">
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            Featured
          </span>
        </div>
      )}
      
      <div className="flex items-start space-x-4">
        <div className={`flex-shrink-0 p-3 rounded-lg ${
          resource.category === 'template' ? 'bg-blue-100 text-blue-600' :
          resource.category === 'guide' ? 'bg-green-100 text-green-600' :
          resource.category === 'tool' ? 'bg-purple-100 text-purple-600' :
          'bg-gray-100 text-gray-600'
        }`}>
          <IconComponent className="h-6 w-6" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {resource.title}
          </h3>
          <p className="text-gray-600 text-sm mb-3">
            {resource.description}
          </p>
          
          <div className="flex flex-wrap gap-1 mb-3">
            {resource.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="inline-block px-2 py-1 rounded text-xs bg-gray-100 text-gray-600"
              >
                {tag}
              </span>
            ))}
          </div>
          
          {/* Action buttons for templates with both download and reference */}
          {resource.type === 'download' && resource.downloadUrl && resource.url ? (
            <div className="flex gap-2 mt-2">
              <button
                onClick={(e) => { e.stopPropagation(); handleDownload(); }}
                className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-1"
              >
                <Download className="h-4 w-4" />
                Download
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleViewGuide(); }}
                className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-1"
              >
                <ExternalLink className="h-4 w-4" />
                View Guide
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <span className={`text-sm font-medium ${
                resource.type === 'download' ? 'text-blue-600' :
                resource.type === 'external' ? 'text-purple-600' :
                'text-green-600'
              }`}>
                {resource.type === 'download' ? 'Download' :
                 resource.type === 'external' ? 'External Tool' :
                 'Read Guide'}
              </span>
              
              <div className="text-gray-400">
                {resource.type === 'download' && <Download className="h-4 w-4" />}
                {resource.type === 'external' && <ExternalLink className="h-4 w-4" />}
                {(resource.type === 'article' || resource.type === 'video') && <BookOpen className="h-4 w-4" />}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
