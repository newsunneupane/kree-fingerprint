'use client'; // Required to read the current URL path

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function SuperadminLayout({ children }: { children: React.ReactNode }) {
    // Get the current route (e.g., '/superadmin' or '/superadmin/users')
    const pathname = usePathname();

    return (
        <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'sans-serif' }}>
            
            {/* Sidebar Navigation */}
            <div style={{ width: '260px', backgroundColor: '#111827', color: 'white', padding: '24px' }}>
                <h2 style={{ margin: '0 0 32px 0', fontSize: '20px', fontWeight: 'bold', letterSpacing: '1px' }}>
                    KREE ADMIN
                </h2>
                <nav style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <Link href="/superadmin" style={{ 
                        padding: '10px 16px', 
                        borderRadius: '6px', 
                        textDecoration: 'none', 
                        fontSize: '14px', 
                        fontWeight: '500',
                        // Dynamically apply styles if the path is exactly '/superadmin'
                        backgroundColor: pathname === '/superadmin' ? '#1F2937' : 'transparent',
                        color: pathname === '/superadmin' ? 'white' : '#9CA3AF'
                    }}>
                        📊 Live Dashboard
                    </Link>
                    
                    <Link href="/superadmin/users" style={{ 
                        padding: '10px 16px', 
                        borderRadius: '6px', 
                        textDecoration: 'none', 
                        fontSize: '14px', 
                        fontWeight: '500',
                        // Dynamically apply styles if the path is exactly '/superadmin/users'
                        backgroundColor: pathname === '/superadmin/users' ? '#1F2937' : 'transparent',
                        color: pathname === '/superadmin/users' ? 'white' : '#9CA3AF'
                    }}>
                        👥 Manage Users
                    </Link>
                </nav>
            </div>

            {/* Main Content Area */}
            <div style={{ flex: 1, backgroundColor: '#F9FAFB', overflowY: 'auto' }}>
                {children}
            </div>

        </div>
    );
}