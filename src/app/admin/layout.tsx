import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50/50 pb-12">
      {/* --- Shared Top Navigation Header --- */}
      <header className="bg-white border-b border-gray-200 px-8 py-4 mb-8 shadow-sm">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Kree Biometrics</h1>
          </div>
          <nav className="flex space-x-6 text-sm font-medium text-gray-500">
            <Link href="/admin" className="hover:text-gray-900 transition-colors">
              Today's Activity
            </Link>
            <Link href="/admin/users" className="hover:text-gray-900 transition-colors">
              Users & Monthly Data
            </Link>
          </nav>
          <div className="text-right">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
              System Online
            </span>
          </div>
        </div>
      </header>
      
      {/* The individual pages inject into this main tag */}
      <main className="max-w-6xl mx-auto px-8 space-y-8">
        {children}
      </main>
    </div>
  );
}