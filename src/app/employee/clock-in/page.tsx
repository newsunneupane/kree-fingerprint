export default function ClockInPage() {
  return (
    <div className="max-w-lg mx-auto text-center">
      <h2 className="text-2xl font-bold text-gray-900">Clock In</h2>
      <p className="text-sm text-gray-500 mt-1">Use your fingerprint to clock in</p>

      <div className="mt-8 bg-white rounded-xl border border-gray-200 shadow-sm p-12">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-5xl">👆</span>
        </div>
        <p className="text-gray-600">Place your finger on the biometric scanner at the office to clock in.</p>
      </div>

      <p className="text-xs text-gray-400 mt-4">
        Clock in/out happens automatically via the ZKTeco biometric device. The backend syncs data every hour.
      </p>
    </div>
  )
}
