'use client'

import { useState } from 'react'

export default function ExportPage() {
  const [exporting, setExporting] = useState(false)
  const [exportType, setExportType] = useState('monthly')

  const handleExport = async () => {
    setExporting(true)
    await new Promise(r => setTimeout(r, 2000))
    setExporting(false)
    alert('Excel export simulated. In production, this would download an Excel file from the backend.')
  }

  return (
    <div className="max-w-lg mx-auto">
      <h2 className="text-2xl font-bold text-gray-900">Excel Export</h2>
      <p className="text-sm text-gray-500 mt-1">Export attendance data to Excel</p>

      <div className="mt-6 bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Export Type</label>
          <div className="space-y-2">
            {['daily', 'weekly', 'monthly'].map((type) => (
              <label key={type} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input type="radio" name="exportType" value={type} checked={exportType === type} onChange={() => setExportType(type)} className="accent-gray-900" />
                <span className="text-sm font-medium text-gray-700 capitalize">{type} Report</span>
              </label>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
            <input type="date" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
            <input type="date" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none" />
          </div>
        </div>

        <button
          onClick={handleExport}
          disabled={exporting}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 px-4 rounded-lg transition-all disabled:opacity-50 cursor-pointer"
        >
          {exporting ? 'Generating...' : 'Download Excel Report'}
        </button>
      </div>
    </div>
  )
}
