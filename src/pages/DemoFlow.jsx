import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const DEMO_SCREENS = [
  {
    id: 'home',
    title: 'Sales Website',
    component: 'DemoHome',
  },
  {
    id: 'registration',
    title: 'Registration',
    component: 'DemoRegistration',
  },
  {
    id: 'onboarding',
    title: '7-Step Onboarding',
    component: 'DemoOnboarding',
  },
  {
    id: 'dashboard',
    title: 'Buyer/Seller Dashboard',
    component: 'DemoDashboard',
  },
  {
    id: 'ai-recommendations',
    title: 'AI Recommendations',
    component: 'DemoAIRecommendations',
  },
  {
    id: 'move-summary',
    title: 'Move Summary',
    component: 'DemoMoveSummary',
  },
];

// ─── Demo Screens ────────────────────────────────────────────────────────

function DemoHome() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-slate-900 mb-2">EZ Move AI</h1>
        <p className="text-slate-600">Your personal moving assistant</p>
      </div>
      <div className="space-y-3">
        <h2 className="font-bold text-slate-900">Demo Features:</h2>
        <ul className="space-y-2 text-sm text-slate-700">
          <li>✓ Zero-login registration</li>
          <li>✓ 7-step interactive onboarding</li>
          <li>✓ Complete buyer/seller dashboard</li>
          <li>✓ AI-powered recommendations</li>
          <li>✓ Move timeline & summary</li>
        </ul>
      </div>
      <p className="text-xs text-slate-500 mt-4">
        Use the Next button to step through the complete user journey.
      </p>
    </div>
  );
}

function DemoRegistration() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-slate-900">Create Your Account</h2>
      <p className="text-slate-600 text-sm">Pre-filled demo data. In production, users enter their details.</p>
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
          <input type="text" defaultValue="Sarah Johnson" className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50" disabled />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
          <input type="email" defaultValue="sarah.j@example.com" className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50" disabled />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">New Address</label>
          <input type="text" defaultValue="47 Maple Dr, Newton, MA" className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50" disabled />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Move Date</label>
          <input type="date" defaultValue="2026-06-27" className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50" disabled />
        </div>
      </div>
      <p className="text-xs text-slate-500">All fields are pre-populated for demo purposes.</p>
    </div>
  );
}

function DemoOnboarding() {
  const [step, setStep] = useState(1);
  const steps = [
    { num: 1, title: 'Room Inventory', desc: 'What are you keeping vs. donating?' },
    { num: 2, title: 'Size Estimate', desc: 'We calculate truck size needed' },
    { num: 3, title: 'Cost Estimate', desc: 'Moving cost projection' },
    { num: 4, title: 'Find Movers', desc: 'AI matches local providers' },
    { num: 5, title: 'Schedule Walkthrough', desc: 'Set appointment date' },
    { num: 6, title: 'Add Lawyer Info', desc: 'Closing day details' },
    { num: 7, title: 'Review & Confirm', desc: 'Summary of your move plan' },
  ];
  
  const currentStep = steps[step - 1];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">7-Step Onboarding Wizard</h2>
        <p className="text-slate-600 text-sm mt-1">Step {step} of 7</p>
      </div>
      
      {/* Progress bar */}
      <div className="w-full bg-slate-200 rounded-full h-2">
        <div className="bg-blue-600 h-2 rounded-full transition-all" style={{ width: `${(step / 7) * 100}%` }}></div>
      </div>

      {/* Current step */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-bold text-blue-900 mb-1">{currentStep.title}</h3>
        <p className="text-sm text-blue-700">{currentStep.desc}</p>
      </div>

      {/* Step navigation */}
      <div className="flex flex-wrap gap-2">
        {steps.map((s) => (
          <button
            key={s.num}
            onClick={() => setStep(s.num)}
            className={`w-8 h-8 rounded-full font-bold text-xs transition-all ${
              step === s.num
                ? 'bg-blue-600 text-white'
                : step > s.num
                ? 'bg-green-600 text-white'
                : 'bg-slate-200 text-slate-600'
            }`}
          >
            {step > s.num ? '✓' : s.num}
          </button>
        ))}
      </div>

      <p className="text-xs text-slate-500">Click the step numbers or use Next/Back to navigate through onboarding.</p>
    </div>
  );
}

function DemoDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Buyer/Seller Move Dashboard</h2>
        <p className="text-slate-600 text-sm">83 days until closing</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg p-4">
          <p className="text-xs opacity-75">Days Left</p>
          <p className="text-3xl font-black">83</p>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg p-4">
          <p className="text-xs opacity-75">Tasks Done</p>
          <p className="text-3xl font-black">12</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg p-4">
          <p className="text-xs opacity-75">Movers Found</p>
          <p className="text-3xl font-black">3</p>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-lg p-4">
          <p className="text-xs opacity-75">Est. Cost</p>
          <p className="text-2xl font-black">$4,200</p>
        </div>
      </div>

      <div>
        <h3 className="font-bold text-slate-900 mb-2">This Week's Tasks</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2 p-3 bg-slate-100 rounded-lg">
            <input type="checkbox" checked readOnly className="rounded" />
            <span className="text-sm text-slate-700">Call movers for estimates</span>
          </div>
          <div className="flex items-center gap-2 p-3 bg-slate-100 rounded-lg">
            <input type="checkbox" readOnly className="rounded" />
            <span className="text-sm text-slate-700">Schedule home walkthrough</span>
          </div>
          <div className="flex items-center gap-2 p-3 bg-slate-100 rounded-lg">
            <input type="checkbox" readOnly className="rounded" />
            <span className="text-sm text-slate-700">Update address with utilities</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function DemoAIRecommendations() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-slate-900">AI Recommendations</h2>
      <p className="text-slate-600 text-sm">Personalized insights for your move</p>

      <div className="space-y-3">
        <div className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition">
          <h3 className="font-bold text-slate-900 mb-1">🏘️ Neighborhood Research</h3>
          <p className="text-sm text-slate-600">Schools, parks, restaurants in Newton</p>
        </div>
        <div className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition">
          <h3 className="font-bold text-slate-900 mb-1">🍽️ Food & Dining Guide</h3>
          <p className="text-sm text-slate-600">Top-rated restaurants near your new home</p>
        </div>
        <div className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition">
          <h3 className="font-bold text-slate-900 mb-1">💰 Moving Cost Breakdown</h3>
          <p className="text-sm text-slate-600">Movers, supplies, utilities setup</p>
        </div>
        <div className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition">
          <h3 className="font-bold text-slate-900 mb-1">📋 Custom Timeline</h3>
          <p className="text-sm text-slate-600">Week-by-week move checklist</p>
        </div>
      </div>
    </div>
  );
}

function DemoMoveSummary() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Your Move Summary</h2>
        <p className="text-slate-600 text-sm">Everything at a glance</p>
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="font-semibold text-slate-900 mb-2">Moving Details</h3>
          <div className="space-y-2 text-sm">
            <p><span className="text-slate-600">From:</span> <span className="font-semibold">12 Elm St, Boston, MA</span></p>
            <p><span className="text-slate-600">To:</span> <span className="font-semibold">47 Maple Dr, Newton, MA</span></p>
            <p><span className="text-slate-600">Distance:</span> <span className="font-semibold">~11 miles</span></p>
            <p><span className="text-slate-600">Closing Date:</span> <span className="font-semibold">June 27, 2026</span></p>
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-slate-900 mb-2">Inventory Overview</h3>
          <div className="space-y-2 text-sm">
            <p><span className="text-slate-600">Items Keeping:</span> <span className="font-semibold">147</span></p>
            <p><span className="text-slate-600">Items Donating:</span> <span className="font-semibold">32</span></p>
            <p><span className="text-slate-600">Estimated Weight:</span> <span className="font-semibold">18,500 lbs</span></p>
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-slate-900 mb-2">Cost Estimate</h3>
          <div className="bg-gradient-to-r from-green-100 to-emerald-100 border border-green-300 rounded-lg p-3">
            <p className="text-xs text-green-700 mb-1">Estimated Moving Cost</p>
            <p className="text-3xl font-black text-green-900">$4,200</p>
            <p className="text-xs text-green-700 mt-1">Based on 11 miles, 3 movers, 1 day</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Demo Flow Component ────────────────────────────────────────────

export default function DemoFlow() {
  const [screenIdx, setScreenIdx] = useState(0);
  const current = DEMO_SCREENS[screenIdx];
  
  const screenComponents = {
    'DemoHome': DemoHome,
    'DemoRegistration': DemoRegistration,
    'DemoOnboarding': DemoOnboarding,
    'DemoDashboard': DemoDashboard,
    'DemoAIRecommendations': DemoAIRecommendations,
    'DemoMoveSummary': DemoMoveSummary,
  };

  const CurrentScreen = screenComponents[current.component];

  return (
    <div className="min-h-screen bg-slate-100 py-8">
      {/* Header */}
      <div className="max-w-2xl mx-auto px-4 mb-8">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-black text-slate-900">Demo Mode</h1>
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
              {screenIdx + 1} / {DEMO_SCREENS.length}
            </span>
          </div>
          <p className="text-slate-600 text-sm">
            {current.title} — No login required. Use Next/Back to navigate.
          </p>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1 bg-slate-200 rounded-full overflow-hidden mb-6">
          <div 
            className="h-full bg-blue-600 transition-all"
            style={{ width: `${((screenIdx + 1) / DEMO_SCREENS.length) * 100}%` }}
          ></div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
          <CurrentScreen />
        </div>

        {/* Navigation */}
        <div className="flex gap-3">
          <button
            onClick={() => setScreenIdx(i => Math.max(0, i - 1))}
            disabled={screenIdx === 0}
            className="flex items-center gap-2 px-5 py-3 rounded-lg bg-white border border-slate-200 text-slate-900 font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition"
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
          <button
            onClick={() => setScreenIdx(i => Math.min(DEMO_SCREENS.length - 1, i + 1))}
            disabled={screenIdx === DEMO_SCREENS.length - 1}
            className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-blue-600 text-white font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-blue-700 transition"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Step dots */}
        <div className="flex justify-center gap-2 mt-6">
          {DEMO_SCREENS.map((_, i) => (
            <button
              key={i}
              onClick={() => setScreenIdx(i)}
              className={`h-2 rounded-full transition-all ${
                i === screenIdx ? 'bg-blue-600 w-6' : 'bg-slate-300 w-2 hover:bg-slate-400'
              }`}
              title={DEMO_SCREENS[i].title}
            />
          ))}
        </div>
      </div>
    </div>
  );
}