import Link from 'next/link'
import { ArrowLeft, Video, Camera, Mic, Monitor, Lightbulb, CheckCircle } from 'lucide-react'

export default function PitchVideoGuide() {
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
            <Video className="h-8 w-8 text-[#405B53]" />
            <h1 className="text-3xl font-bold text-gray-900">
              How to Create a Compelling Pitch Video
            </h1>
          </div>
          <p className="text-xl text-gray-600">
            Learn how to create professional pitch videos that capture investor attention and effectively communicate your startup's value proposition.
          </p>
        </div>

        {/* Table of Contents */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Table of Contents</h2>
          <nav className="space-y-2">
            <a href="#planning" className="block text-[#405B53] hover:text-green-700">1. Planning Your Video</a>
            <a href="#equipment" className="block text-[#405B53] hover:text-green-700">2. Equipment and Setup</a>
            <a href="#script" className="block text-[#405B53] hover:text-green-700">3. Writing Your Script</a>
            <a href="#recording" className="block text-[#405B53] hover:text-green-700">4. Recording Best Practices</a>
            <a href="#editing" className="block text-[#405B53] hover:text-green-700">5. Editing and Post-Production</a>
            <a href="#optimization" className="block text-[#405B53] hover:text-green-700">6. Optimization for Different Platforms</a>
          </nav>
        </div>

        {/* Content Sections */}
        <div className="space-y-8">
          {/* Planning Section */}
          <section id="planning" className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <Lightbulb className="h-6 w-6 text-yellow-500 mr-3" />
              Planning Your Video
            </h2>
            
            <div className="prose prose-lg max-w-none">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Define Your Objective</h3>
              <p className="text-gray-600 mb-4">
                Before you start recording, be clear about what you want to achieve with your pitch video:
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-6">
                <li>Generate investor interest and secure meetings</li>
                <li>Explain your product or service clearly</li>
                <li>Demonstrate market opportunity and traction</li>
                <li>Showcase your team's expertise and passion</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-800 mb-3">Video Length Guidelines</h3>
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
                <p className="text-blue-800">
                  <strong>Optimal Length:</strong> 2-3 minutes for initial pitch videos. Investors have limited time, 
                  so make every second count.
                </p>
              </div>

              <h3 className="text-lg font-semibold text-gray-800 mb-3">Key Elements to Include</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium text-gray-800 mb-2">Must-Have Elements (30-45 seconds each)</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Problem statement</li>
                    <li>• Solution overview</li>
                    <li>• Market opportunity</li>
                    <li>• Business model</li>
                    <li>• Team introduction</li>
                    <li>• Call to action</li>
                  </ul>
                </div>
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium text-gray-800 mb-2">Nice-to-Have Elements</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Product demo</li>
                    <li>• Customer testimonials</li>
                    <li>• Traction metrics</li>
                    <li>• Competition comparison</li>
                    <li>• Financial projections</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Equipment Section */}
          <section id="equipment" className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <Camera className="h-6 w-6 text-[#405B53] mr-3" />
              Equipment and Setup
            </h2>
            
            <div className="prose prose-lg max-w-none">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Budget-Friendly Setup (Under $100)</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="border rounded-lg p-4">
                  <Camera className="h-6 w-6 text-blue-500 mb-2" />
                  <h4 className="font-medium text-gray-800 mb-2">Camera</h4>
                  <p className="text-sm text-gray-600 mb-2">Smartphone with 1080p recording capability</p>
                  <p className="text-xs text-gray-500">Cost: Free (using existing phone)</p>
                </div>
                <div className="border rounded-lg p-4">
                  <Mic className="h-6 w-6 text-green-500 mb-2" />
                  <h4 className="font-medium text-gray-800 mb-2">Audio</h4>
                  <p className="text-sm text-gray-600 mb-2">Lavalier microphone or smartphone earbuds</p>
                  <p className="text-xs text-gray-500">Cost: $15-30</p>
                </div>
                <div className="border rounded-lg p-4">
                  <Monitor className="h-6 w-6 text-purple-500 mb-2" />
                  <h4 className="font-medium text-gray-800 mb-2">Lighting</h4>
                  <p className="text-sm text-gray-600 mb-2">Natural window light or desk lamp</p>
                  <p className="text-xs text-gray-500">Cost: Free - $20</p>
                </div>
              </div>

              <h3 className="text-lg font-semibold text-gray-800 mb-3">Professional Setup ($200-500)</h3>
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <ul className="space-y-2 text-gray-600">
                  <li>• <strong>Camera:</strong> DSLR or mirrorless camera with video capability</li>
                  <li>• <strong>Audio:</strong> Wireless lavalier mic system or shotgun microphone</li>
                  <li>• <strong>Lighting:</strong> 3-point lighting kit with softboxes</li>
                  <li>• <strong>Tripod:</strong> Sturdy tripod for stable shots</li>
                  <li>• <strong>Backdrop:</strong> Professional backdrop or clean wall</li>
                </ul>
              </div>

              <h3 className="text-lg font-semibold text-gray-800 mb-3">Setup Tips</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-gray-800">Lighting Position</h4>
                      <p className="text-sm text-gray-600">Face the light source, avoid backlighting</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-gray-800">Camera Height</h4>
                      <p className="text-sm text-gray-600">Position camera at eye level for professional look</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-gray-800">Background</h4>
                      <p className="text-sm text-gray-600">Use clean, uncluttered background</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-gray-800">Audio Test</h4>
                      <p className="text-sm text-gray-600">Always test audio levels before recording</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Script Section */}
          <section id="script" className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Writing Your Script</h2>
            
            <div className="bg-[#405B53] text-white rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold mb-3">Sample 2-Minute Script Structure</h3>
              <div className="space-y-3 text-sm">
                <div><strong>0-15 seconds:</strong> Hook + Problem statement</div>
                <div><strong>15-45 seconds:</strong> Solution + Product demo</div>
                <div><strong>45-75 seconds:</strong> Market opportunity + Business model</div>
                <div><strong>75-105 seconds:</strong> Team + Traction</div>
                <div><strong>105-120 seconds:</strong> Call to action</div>
              </div>
            </div>

            <h3 className="text-lg font-semibold text-gray-800 mb-3">Script Writing Tips</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-800 mb-2">Do's</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>✓ Start with a compelling hook</li>
                  <li>✓ Use conversational language</li>
                  <li>✓ Include specific numbers and metrics</li>
                  <li>✓ Tell a story, not just facts</li>
                  <li>✓ Practice until it sounds natural</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-800 mb-2">Don'ts</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>✗ Use jargon or technical terms</li>
                  <li>✗ Read directly from a script</li>
                  <li>✗ Include too much detail</li>
                  <li>✗ Forget to mention the problem</li>
                  <li>✗ End without a clear call to action</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Continue with more sections... */}
          
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 bg-[#405B53] rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            Ready to Create Your Pitch Video?
          </h2>
          <p className="text-green-100 mb-6">
            Use these tips to create compelling videos that get investor attention.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="bg-[#E64E1B] text-white px-8 py-3 rounded-lg hover:bg-orange-600 font-medium"
            >
              Upload Your Pitch
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
