export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-slate-900 text-white px-5 py-12">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-900/40">
            <span className="text-white font-black text-sm">EZ</span>
          </div>
          <span className="text-white font-bold text-lg tracking-tight">EZ Move <span className="text-orange-400">AI</span></span>
        </div>

        <h1 className="text-3xl font-black text-white mb-2">Privacy & SMS Policy</h1>
        <p className="text-slate-400 text-sm mb-10">Last updated: April 2026</p>

        <div className="space-y-8 text-slate-300 text-sm leading-relaxed">

          <section>
            <p>
              EZ Move AI respects your privacy and is committed to protecting your personal information.
            </p>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-3">Information We Collect</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>Name, email, and phone number when you submit a form or create an account.</li>
              <li>Usage data to improve your service experience.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-3">How We Use Your Information</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>To deliver service updates, reminders, and account notifications.</li>
              <li>To provide customer support and improve platform performance.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-3">SMS Communications</h2>
            <p>
              By providing your phone number, you consent to receive automated text messages related to your account and service activity. Message frequency varies. Message and data rates may apply.
            </p>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-3">Opt-Out Instructions</h2>
            <p>
              Reply <strong className="text-white">STOP</strong> to opt out at any time. Reply <strong className="text-white">HELP</strong> for assistance.
            </p>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-3">Data Sharing</h2>
            <p>
              We do not sell your personal information. Data is only shared with trusted service providers (such as Twilio) for message delivery and platform functionality.
            </p>
          </section>

        </div>

        <div className="mt-12 pt-6 border-t border-white/10">
          <a href="/" className="text-orange-400 text-sm font-semibold hover:text-orange-300 transition-colors">← Back to Home</a>
        </div>
      </div>
    </div>
  );
}