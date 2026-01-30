import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🦷 Dental Voice Agent
          </h1>
          <p className="text-xl text-gray-600">
            AI-powered voice assistant for Smile Dental Clinic
          </p>
        </div>

        {/* Main Action - View Transcripts */}
        <Link href="/calls" className="block mb-8">
          <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow border-2 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">📞 View Call Transcripts</h2>
                <p className="text-gray-600">
                  See live conversations between callers and Sarah (AI)
                </p>
              </div>
              <div className="text-4xl">→</div>
            </div>
          </div>
        </Link>

        {/* Status */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">System Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                <span className="font-medium">Voice Agent</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">Ready to receive calls</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                <span className="font-medium">Twilio</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">Connected</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
                <span className="font-medium">OpenAI</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">GPT-4o Active</p>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Link href="/appointments" className="block">
            <div className="bg-white rounded-xl shadow p-4 hover:shadow-lg transition-shadow">
              <h3 className="font-semibold">📅 Appointments</h3>
              <p className="text-sm text-gray-600">View booked appointments</p>
            </div>
          </Link>
          <div className="bg-white rounded-xl shadow p-4">
            <h3 className="font-semibold">🔗 Twilio Console</h3>
            <p className="text-sm text-gray-600">
              <a href="https://console.twilio.com" target="_blank" className="text-blue-600 hover:underline">
                Open Twilio Dashboard →
              </a>
            </p>
          </div>
        </div>

        {/* Webhook Config */}
        <div className="bg-gray-800 text-white rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-3">⚙️ Twilio Webhook URL</h2>
          <div className="bg-gray-700 p-3 rounded font-mono text-sm break-all">
            https://your-domain.vercel.app/api/twilio/voice
          </div>
          <p className="text-gray-400 text-sm mt-2">
            Set this as your Twilio phone number's Voice webhook (POST)
          </p>
        </div>
      </div>
    </main>
  );
}
