import Link from 'next/link'
import { ArrowLeft, Users, Heart, TrendingUp, MessageCircle, CheckCircle } from 'lucide-react'

export default function InvestorCommunicationGuide() {
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
            <MessageCircle className="h-8 w-8 text-[#405B53]" />
            <h1 className="text-3xl font-bold text-gray-900">
              Communicating with Investors
            </h1>
          </div>
          <p className="text-xl text-gray-600">
            Best practices for initial outreach, follow-ups, and building lasting investor relationships.
          </p>
        </div>

        {/* Communication Principles */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Core Communication Principles</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                <Heart className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Authenticity</h3>
              <p className="text-sm text-gray-600">Be genuine and honest in all communications</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Value-First</h3>
              <p className="text-sm text-gray-600">Always lead with value and mutual benefit</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                <Users className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Relationship-Focus</h3>
              <p className="text-sm text-gray-600">Think long-term relationships, not just transactions</p>
            </div>
          </div>
        </div>

        {/* Initial Outreach */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Initial Outreach Strategy</h2>
          
          <div className="space-y-6">
            <div className="border-l-4 border-[#405B53] pl-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Research Before Reaching Out</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">Investor Background</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Investment thesis and focus areas</li>
                    <li>• Portfolio companies and stage preferences</li>
                    <li>• Recent investments and exits</li>
                    <li>• Personal interests and background</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">Find Connection Points</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Mutual connections or introductions</li>
                    <li>• Shared interests or experiences</li>
                    <li>• Similar portfolio companies</li>
                    <li>• Industry events or conferences</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="border-l-4 border-blue-500 pl-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Crafting Your Initial Message</h3>
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <h4 className="font-medium text-blue-800 mb-2">Email Subject Line Examples:</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• "Fintech startup disrupting SMB lending - seeking Series A"</li>
                  <li>• "Referred by [Mutual Connection] - AI healthcare startup"</li>
                  <li>• "Following up from [Event] - SaaS platform for [industry]"</li>
                </ul>
              </div>
              
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">Opening Paragraph Structure:</h4>
                  <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                    <li>Personal connection or reference</li>
                    <li>Brief company description (1 sentence)</li>
                    <li>Specific reason for reaching out</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Follow-up Strategy */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Follow-up Best Practices</h2>
          
          <div className="space-y-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-800 mb-2">The 3-Touch Rule</h3>
              <p className="text-sm text-yellow-700">
                Follow up maximum 3 times over 2-3 weeks. If no response after that, move on gracefully.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-2">First Follow-up (1 week)</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Reference original message</li>
                  <li>• Share a new piece of value (news, update)</li>
                  <li>• Keep it brief</li>
                  <li>• Restate your ask</li>
                </ul>
              </div>
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-2">Second Follow-up (2 weeks)</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Share significant company update</li>
                  <li>• Include social proof or validation</li>
                  <li>• Acknowledge they're busy</li>
                  <li>• Offer alternative (shorter call, info packet)</li>
                </ul>
              </div>
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-2">Final Follow-up (3 weeks)</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Brief and respectful</li>
                  <li>• Leave door open for future</li>
                  <li>• Thank them for their time</li>
                  <li>• No pressure or urgency</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Meeting Preparation */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Preparing for Investor Meetings</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Before the Meeting</h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-gray-800">Research the Investor</h4>
                    <p className="text-sm text-gray-600">Review their portfolio, recent investments, and interests</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-gray-800">Prepare Your Materials</h4>
                    <p className="text-sm text-gray-600">Have your pitch deck, demo, and financials ready</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-gray-800">Anticipate Questions</h4>
                    <p className="text-sm text-gray-600">Prepare for common investor questions and objections</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">During the Meeting</h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-gray-800">Listen Actively</h4>
                    <p className="text-sm text-gray-600">Ask questions and show genuine interest in their feedback</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-gray-800">Be Honest</h4>
                    <p className="text-sm text-gray-600">Admit what you don't know and address concerns directly</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-gray-800">Define Next Steps</h4>
                    <p className="text-sm text-gray-600">End with clear next steps and timeline</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Long-term Relationship Building */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Building Long-term Relationships</h2>
          
          <div className="space-y-4">
            <div className="border-l-4 border-green-500 pl-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Regular Updates</h3>
              <p className="text-gray-600 mb-3">
                Keep interested investors in the loop with monthly or quarterly updates, even if they didn't invest.
              </p>
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-medium text-green-800 mb-2">Update Template Structure:</h4>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Key metrics and progress</li>
                  <li>• Major milestones achieved</li>
                  <li>• Challenges and how you're addressing them</li>
                  <li>• Team updates and hires</li>
                  <li>• Specific asks for help or introductions</li>
                </ul>
              </div>
            </div>

            <div className="border-l-4 border-blue-500 pl-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Value-Add Approach</h3>
              <p className="text-gray-600 mb-3">
                Look for ways to provide value to investors, not just receive it.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">Ways to Provide Value:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Share industry insights</li>
                    <li>• Make introductions to other founders</li>
                    <li>• Invite to exclusive events</li>
                    <li>• Provide market research or data</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">Staying Top of Mind:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Congratulate on portfolio company wins</li>
                    <li>• Share relevant news articles</li>
                    <li>• Attend their events or portfolio company events</li>
                    <li>• Engage meaningfully on social media</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Common Mistakes to Avoid */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Common Mistakes to Avoid</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-red-600 mb-3">❌ Don't Do This</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Send mass, generic emails</li>
                <li>• Be overly persistent or pushy</li>
                <li>• Exaggerate metrics or potential</li>
                <li>• Bad-mouth competitors or other investors</li>
                <li>• Skip the research and personalization</li>
                <li>• Focus only on what you need</li>
                <li>• Disappear after getting funding</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-green-600 mb-3">✅ Do This Instead</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Personalize every communication</li>
                <li>• Respect their time and decisions</li>
                <li>• Be transparent about challenges</li>
                <li>• Show respect for the ecosystem</li>
                <li>• Research their investment thesis</li>
                <li>• Highlight mutual benefits</li>
                <li>• Maintain relationships long-term</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Email Templates */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Email Templates</h2>
          
          <div className="space-y-6">
            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Initial Outreach Template</h3>
              <div className="bg-gray-50 p-4 rounded text-sm text-gray-700 leading-relaxed font-mono">
                <p className="mb-3">
                  <strong>Subject:</strong> Introduction to [Company Name] - [Industry] startup seeking Series A
                </p>
                <p className="mb-3">
                  Hi [Name],
                </p>
                <p className="mb-3">
                  [Mutual connection] suggested I reach out, as you've shown great interest in [specific area/industry] startups.
                </p>
                <p className="mb-3">
                  I'm [Your name], founder of [Company], a [1-sentence description of what you do and the problem you solve].
                </p>
                <p className="mb-3">
                  [Brief traction/validation point that's impressive and relevant to their investment thesis]
                </p>
                <p className="mb-3">
                  I'd love to get 15 minutes of your time to share more about our vision and see if there might be a fit for [Fund Name].
                </p>
                <p>
                  Best regards,<br/>
                  [Your name]
                </p>
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Follow-up Template</h3>
              <div className="bg-gray-50 p-4 rounded text-sm text-gray-700 leading-relaxed font-mono">
                <p className="mb-3">
                  <strong>Subject:</strong> Following up: [Company Name] update
                </p>
                <p className="mb-3">
                  Hi [Name],
                </p>
                <p className="mb-3">
                  I wanted to follow up on my email from last week about [Company Name].
                </p>
                <p className="mb-3">
                  Since then, we've [specific meaningful update/milestone]. [Brief explanation of why this matters and its impact]
                </p>
                <p className="mb-3">
                  I understand you receive many pitches, but I believe our [specific alignment with their investment thesis] makes this particularly relevant for [Fund Name].
                </p>
                <p className="mb-3">
                  Would you be open to a brief call this week?
                </p>
                <p>
                  Best,<br/>
                  [Your name]
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 bg-[#405B53] rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            Ready to Build Investor Relationships?
          </h2>
          <p className="text-green-100 mb-6">
            Use these strategies to build meaningful connections with investors on PitchMoto.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="bg-[#E64E1B] text-white px-8 py-3 rounded-lg hover:bg-orange-600 font-medium"
            >
              Start Building Relationships
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
