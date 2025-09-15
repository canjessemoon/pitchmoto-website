'use client'

import { useState } from 'react'

export default function QuickFixPage() {
  const [result, setResult] = useState<string>('')

  const handleManualFix = () => {
    setResult(`
Please run this SQL in your Supabase SQL Editor:

-- First, find your user ID
SELECT id, email FROM auth.users WHERE email LIKE '%jdmoon%';

-- Then create profile using that ID (replace the UUID with your actual user ID)
INSERT INTO public.user_profiles (user_id, email, full_name, user_type) 
VALUES (
  'YOUR_USER_ID_FROM_ABOVE', 
  'jdmoon+jian@gmail.com', 
  'Jian Yang', 
  'founder'
) 
ON CONFLICT (user_id) DO UPDATE SET
  full_name = 'Jian Yang',
  user_type = 'founder',
  updated_at = NOW();

After running this, refresh your dashboard and you should see the founder view.
    `)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-xl font-bold text-gray-900 mb-4">Quick Profile Fix</h1>
          
          <div className="space-y-4">
            <p className="text-gray-600">
              Since the API approach isn't working, let's fix your profile directly in the database.
            </p>
            
            <button
              onClick={handleManualFix}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Show Manual Fix Instructions
            </button>
            
            {result && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <pre className="text-xs text-gray-800 whitespace-pre-wrap">{result}</pre>
              </div>
            )}
            
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-semibold text-blue-800">After fixing your profile:</h3>
              <ol className="text-blue-700 text-sm mt-2 space-y-1">
                <li>1. Go back to the dashboard</li>
                <li>2. You should see "Founder" instead of "User"</li>
                <li>3. You should see the founder dashboard with startup creation steps</li>
                <li>4. You can access the investor matches at /investor-matches</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
