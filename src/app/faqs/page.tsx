import { Navigation } from '@/components/ui/navigation'
import Link from 'next/link'
import { ContactSupportButton } from '@/components/ui/contact-support-button'

export default function FAQsPage() {
  const faqs = [
    {
      question: "Is PitchMoto free for founders?",
      answer: "Yes! PitchMoto is completely free for founders. You can create your startup profile, upload pitches, and connect with investors at no cost."
    },
    {
      question: "How do investor subscriptions work?",
      answer: "Investors can browse pitches and save favorites to their watchlist for free. Premium features like direct messaging and advanced filtering require a paid subscription."
    },
    {
      question: "What makes a good pitch on PitchMoto?",
      answer: "Great pitches include a clear problem statement, compelling solution, market opportunity, business model, and team credentials. A well-designed pitch deck and demo video help too!"
    },
    {
      question: "How do I get featured on the trending page?",
      answer: "Pitches are featured based on investor engagement, watchlist saves, and overall quality. Focus on creating compelling content that resonates with your target investors."
    },
    {
      question: "Can I update my pitch after posting?",
      answer: "Yes! You can update your startup profile, pitch deck, and other materials at any time to keep your information current."
    },
    {
      question: "How do I protect my intellectual property?",
      answer: "Only share information you're comfortable making public. Consider filing provisional patents or NDAs before sharing detailed technical information."
    },
    {
      question: "What types of investors use PitchMoto?",
      answer: "Our platform attracts angel investors, VCs, family offices, and strategic investors across various industries and investment stages."
    },
    {
      question: "How quickly can I expect responses?",
      answer: "Response times vary, but most founders hear from interested investors within 1-2 weeks of posting a compelling pitch."
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-[#405B53] mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-gray-600">
            Everything you need to know about PitchMoto
          </p>
        </div>

        <div className="space-y-8">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-[#405B53] mb-3">
                {faq.question}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>

        <div className="text-center mt-12 p-8 bg-gray-50 rounded-lg">
          <h2 className="text-2xl font-bold text-[#405B53] mb-4">
            Still have questions?
          </h2>
          <p className="text-gray-600 mb-6">
            We're here to help! Reach out to our team for personalized support.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <ContactSupportButton />
            <Link
              href="/signup"
              className="bg-[#E64E1B] text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
