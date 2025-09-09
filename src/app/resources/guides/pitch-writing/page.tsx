import Link from 'next/link'
import { ArrowLeft, BookOpen, PenTool, Target, Users, TrendingUp } from 'lucide-react'

export default function PitchWritingGuide() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="text-xl font-bold">
                <span className="text-[#405B53]">Pitch</span>
                <span className="text-[#E64E1B]">Moto</span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/resources" className="text-gray-500 hover:text-gray-700 flex items-center space-x-2">
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Resources</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <PenTool className="h-8 w-8 text-[#405B53]" />
            <h1 className="text-3xl font-bold text-gray-900">
              Writing Effective Pitches
            </h1>
          </div>
          <p className="text-xl text-gray-600">
            Master the art of crafting compelling written pitches that tell your startup's story and capture investor interest.
          </p>
        </div>

        {/* Key Principles */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Core Principles of Effective Pitch Writing</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                <Target className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Clarity</h3>
              <p className="text-sm text-gray-600">Make your message crystal clear and easy to understand</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                <Users className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Connection</h3>
              <p className="text-sm text-gray-600">Build emotional connection through storytelling</p>
            </div>
            <div className="text-center">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Conviction</h3>
              <p className="text-sm text-gray-600">Demonstrate confidence and passion for your vision</p>
            </div>
          </div>
        </div>

        {/* Structure Framework */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">The Perfect Pitch Structure</h2>
          
          <div className="space-y-6">
            {/* Hook */}
            <div className="border-l-4 border-[#E64E1B] pl-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">1. The Hook (First 2-3 sentences)</h3>
              <p className="text-gray-600 mb-3">
                Start with a compelling statement that immediately grabs attention. This could be a surprising statistic, 
                a relatable problem, or a bold vision statement.
              </p>
              <div className="bg-orange-50 p-4 rounded-lg">
                <p className="text-sm text-orange-800">
                  <strong>Example:</strong> "Every year, 40% of small businesses fail because they can't manage their cash flow effectively. 
                  What if there was a way to predict and prevent these failures before they happen?"
                </p>
              </div>
            </div>

            {/* Problem */}
            <div className="border-l-4 border-red-500 pl-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">2. The Problem (1-2 paragraphs)</h3>
              <p className="text-gray-600 mb-3">
                Clearly articulate the pain point your startup addresses. Make it relatable and quantify the impact.
              </p>
              <div className="bg-red-50 p-4 rounded-lg">
                <h4 className="font-medium text-red-800 mb-2">Key Elements:</h4>
                <ul className="text-sm text-red-700 space-y-1">
                  <li>• Who experiences this problem?</li>
                  <li>• How painful is it? (quantify if possible)</li>
                  <li>• What are the current solutions and why do they fail?</li>
                  <li>• Why is this problem important to solve now?</li>
                </ul>
              </div>
            </div>

            {/* Solution */}
            <div className="border-l-4 border-green-500 pl-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">3. The Solution (2-3 paragraphs)</h3>
              <p className="text-gray-600 mb-3">
                Present your solution clearly and explain how it uniquely addresses the problem.
              </p>
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-medium text-green-800 mb-2">Structure:</h4>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• What is your solution? (one clear sentence)</li>
                  <li>• How does it work? (simple explanation)</li>
                  <li>• Why is it better than alternatives?</li>
                  <li>• What makes it unique or defensible?</li>
                </ul>
              </div>
            </div>

            {/* Market & Opportunity */}
            <div className="border-l-4 border-blue-500 pl-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">4. Market Opportunity (1-2 paragraphs)</h3>
              <p className="text-gray-600 mb-3">
                Demonstrate the size and potential of your market without overwhelming with numbers.
              </p>
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">Include:</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Target market size (focus on TAM you can actually capture)</li>
                  <li>• Market trends that support your timing</li>
                  <li>• Your go-to-market strategy</li>
                  <li>• Early validation or traction</li>
                </ul>
              </div>
            </div>

            {/* Team */}
            <div className="border-l-4 border-purple-500 pl-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">5. The Team (1 paragraph)</h3>
              <p className="text-gray-600 mb-3">
                Highlight why your team is uniquely positioned to execute this vision.
              </p>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm text-purple-800">
                  Focus on relevant experience, domain expertise, and complementary skills. 
                  Mention any notable achievements or previous exits.
                </p>
              </div>
            </div>

            {/* Call to Action */}
            <div className="border-l-4 border-[#405B53] pl-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">6. Call to Action (Final paragraph)</h3>
              <p className="text-gray-600 mb-3">
                End with a clear, specific ask and next steps.
              </p>
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-medium text-green-800 mb-2">Examples:</h4>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• "We're raising $X to achieve Y. I'd love to discuss how you can be part of this journey."</li>
                  <li>• "I'd welcome a 15-minute call to explore potential partnership opportunities."</li>
                  <li>• "We're looking for strategic investors who understand [industry]. Can we schedule a demo?"</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Writing Tips */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Writing Tips & Best Practices</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-green-600 mb-3">✓ Do This</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Use active voice and strong verbs</li>
                <li>• Include specific numbers and metrics</li>
                <li>• Tell a story, not just list features</li>
                <li>• Keep sentences short and punchy</li>
                <li>• Use analogies to explain complex concepts</li>
                <li>• Show passion and conviction</li>
                <li>• Customize for each recipient</li>
                <li>• Include social proof (customers, advisors)</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-red-600 mb-3">✗ Avoid This</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Industry jargon and technical terms</li>
                <li>• Vague statements without backing</li>
                <li>• Too much detail in the first pitch</li>
                <li>• Comparing to overly successful companies</li>
                <li>• Overwhelming with features</li>
                <li>• Being too humble about achievements</li>
                <li>• Generic, one-size-fits-all pitches</li>
                <li>• Forgetting to proofread</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Sample Templates */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Sample Pitch Templates</h2>
          
          <div className="space-y-6">
            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Email Pitch Template (150-200 words)</h3>
              <div className="bg-gray-50 p-4 rounded text-sm text-gray-700 leading-relaxed">
                <p className="mb-3">
                  <strong>Subject:</strong> [Compelling hook] - [Company Name] seeking [Investment/Partnership]
                </p>
                <p className="mb-3">
                  Hi [Name],<br/>
                  [Personal connection or relevant intro]
                </p>
                <p className="mb-3">
                  [Hook + Problem] [Your Solution in 1-2 sentences]
                </p>
                <p className="mb-3">
                  [Key traction metric or market validation]
                </p>
                <p className="mb-3">
                  [Brief team credentials + ask]
                </p>
                <p>
                  [Specific next step]<br/>
                  Best regards,<br/>
                  [Your name]
                </p>
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Platform Pitch Template (300-400 words)</h3>
              <div className="bg-gray-50 p-4 rounded text-sm text-gray-700">
                <p className="mb-2"><strong>The Problem:</strong> [2-3 sentences]</p>
                <p className="mb-2"><strong>Our Solution:</strong> [2-3 sentences]</p>
                <p className="mb-2"><strong>Market Opportunity:</strong> [2-3 sentences with key metrics]</p>
                <p className="mb-2"><strong>Traction:</strong> [Key achievements and metrics]</p>
                <p className="mb-2"><strong>Team:</strong> [Relevant experience and expertise]</p>
                <p><strong>Ask:</strong> [Specific funding amount and use of funds]</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 bg-[#405B53] rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            Ready to Write Your Compelling Pitch?
          </h2>
          <p className="text-green-100 mb-6">
            Use these frameworks to craft pitches that capture attention and drive action.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="bg-[#E64E1B] text-white px-8 py-3 rounded-lg hover:bg-orange-600 font-medium"
            >
              Create Your Pitch
            </Link>
            <Link
              href="/resources"
              className="bg-white text-[#405B53] px-8 py-3 rounded-lg hover:bg-gray-100 font-medium"
            >
              More Resources
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
