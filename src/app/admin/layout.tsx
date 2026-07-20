'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { logout } from '@/actions/auth'

const sidebarSections = [
  {
    title: 'Main',
    items: [
      { href: '/admin', label: 'Dashboard', icon: '📊' },
    ],
  },
  {
    title: 'Employees',
    items: [
      { href: '/admin/employees', label: 'All Employees', icon: '👥' },
    ],
  },
  {
    title: 'Attendance',
    items: [
      { href: '/admin/attendance', label: 'Live', icon: '🟢' },
      { href: '/admin/attendance/employee', label: 'By Employee', icon: '👤' },
      { href: '/admin/attendance/daily', label: 'Daily', icon: '📅' },
      { href: '/admin/attendance/weekly', label: 'Weekly', icon: '📆' },
      { href: '/admin/attendance/monthly', label: 'Monthly', icon: '📊' },
      { href: '/admin/attendance/history', label: 'History', icon: '📜' },
    ],
  },
  {
    title: 'Reports',
    items: [
      { href: '/admin/reports/late-arrivals', label: 'Late Arrivals', icon: '⏰' },
      { href: '/admin/reports/early-leaving', label: 'Early Leaving', icon: '🚪' },
      { href: '/admin/reports/overtime', label: 'Overtime', icon: '💪' },
      { href: '/admin/reports/monthly-summary', label: 'Monthly Summary', icon: '📋' },
      { href: '/admin/reports/export', label: 'Excel Export', icon: '📥' },
    ],
  },
  {
    title: 'Leave',
    items: [
      { href: '/admin/leaves', label: 'Manage Leaves', icon: '🏖' },
    ],
  },
  {
    title: 'Holidays',
    items: [
      { href: '/admin/holidays', label: 'Manage Holidays', icon: '🎉' },
    ],
  },
  {
    title: 'Settings',
    items: [
      { href: '/admin/settings', label: 'Settings', icon: '⚙️' },
    ],
  },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [pendingCount, setPendingCount] = useState(0)

  useEffect(() => {
    fetch('/api/leaves/pending-count')
      .then(res => res.json())
      .then(data => setPendingCount(data.count))
      .catch(() => {})
  }, [])

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin'
    return pathname.startsWith(href)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className={`fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 lg:translate-x-0 lg:static lg:inset-auto overflow-y-auto ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-16 flex items-center px-6 border-b border-gray-200 sticky top-0 bg-white">
          <h1 className="text-lg font-bold text-gray-900">Admin Panel</h1>
        </div>
        <nav className="mt-2 px-3 pb-20 space-y-4">
          {sidebarSections.map((section) => (
            <div key={section.title}>
              <p className="px-3 text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
                {section.title}
              </p>
              {section.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive(item.href) ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <span>{item.icon}</span>
                  <span className="flex-1">{item.label}</span>
                  {item.label === 'Manage Leaves' && pendingCount > 0 && (
                    <span className="bg-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      {pendingCount}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          ))}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white">
          <form action={logout}>
            <button type="submit" className="w-full text-left px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer">
              Logout
            </button>
          </form>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center px-6 lg:px-8 sticky top-0 z-20">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden mr-4 text-gray-500 hover:text-gray-900 cursor-pointer">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
              Admin
            </span>
          </div>
        </header>
        {sidebarOpen && (
          <div className="fixed inset-0 z-20 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}
        <main className="flex-1 p-6 lg:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
