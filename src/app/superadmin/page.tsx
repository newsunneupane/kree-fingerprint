'use client';

import { useEffect, useState } from 'react';

interface RosterRow {
    id: string;
    name: string;
    deviceUserId: string;
    currentStatus: 'Check-In' | 'Check-Out' | 'Absent';
    firstInTime: string | null;
    lastScanTime: string | null;
    checkInsToday: number;
    checkOutsToday: number;
}

export default function SuperadminDashboard() {
    const [roster, setRoster] = useState<RosterRow[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch fresh data from the API
    async function loadAttendanceData() {
        try {
            // Added a timestamp query param to completely force-bypass browser-level fetch caching
            const response = await fetch(`/superadmin/api/attendance?t=${Date.now()}`, {
                cache: 'no-store'
            });
            if (!response.ok) throw new Error('Failed to communicate with live stream feed');
            const data = await response.json();
            setRoster(data);
            setError(null);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    // Polling effect: Pull fresh entries every 5 seconds automatically
    useEffect(() => {
        loadAttendanceData(); // Initial load
        
        const interval = setInterval(() => {
            loadAttendanceData();
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    // Helper to format clean timestamps
    const formatTime = (isoString: string | null) => {
        if (!isoString) return '--:--';
        return new Date(isoString).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        });
    };

    return (
        <div style={{ padding: '40px' }}>
            
            {/* Header Status Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>Live Operations Matrix</h1>
                    <p style={{ color: '#6B7280', margin: '4px 0 0 0', fontSize: '14px' }}>
                        Real-time synchronization loop with office biometrics.
                    </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#059669', fontWeight: '600', backgroundColor: '#D1FAE5', padding: '6px 12px', borderRadius: '99px' }}>
                    <span style={{ width: '8px', height: '8px', backgroundColor: '#10B981', borderRadius: '50%', display: 'inline-block' }}></span>
                    Live Polling Active (5s)
                </div>
            </div>

            {error && (
                <div style={{ padding: '16px', backgroundColor: '#FEE2E2', color: '#991B1B', borderRadius: '6px', marginBottom: '24px', fontSize: '14px' }}>
                    ⚠️ {error}
                </div>
            )}

            {/* Matrix Table */}
            <div style={{ backgroundColor: 'white', border: '1px solid #E5E7EB', borderRadius: '8px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                    <thead style={{ backgroundColor: '#F9FAFB' }}>
                        <tr style={{ borderBottom: '1px solid #E5E7EB', color: '#6B7280', fontSize: '12px', textTransform: 'uppercase' }}>
                            <th style={{ padding: '16px' }}>Employee</th>
                            <th style={{ padding: '16px', textAlign: 'center' }}>ID</th>
                            <th style={{ padding: '16px' }}>Current State</th>
                            <th style={{ padding: '16px' }}>First In</th>
                            <th style={{ padding: '16px' }}>Last Scan</th>
                            <th style={{ padding: '16px', textAlign: 'center' }}>Total Ins</th>
                            <th style={{ padding: '16px', textAlign: 'center' }}>Total Outs</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading && roster.length === 0 ? (
                            <tr>
                                <td colSpan={7} style={{ padding: '32px', textAlign: 'center', color: '#9CA3AF' }}>Loading live feeds...</td>
                            </tr>
                        ) : roster.length === 0 ? (
                            <tr>
                                <td colSpan={7} style={{ padding: '32px', textAlign: 'center', color: '#9CA3AF' }}>No active employees found in the directory.</td>
                            </tr>
                        ) : (
                            roster.map((row) => (
                                <tr key={row.id} style={{ borderBottom: '1px solid #E5E7EB', transition: 'background-color 0.2s' }}>
                                    <td style={{ padding: '16px', fontWeight: '600', color: '#111827' }}>{row.name}</td>
                                    <td style={{ padding: '16px', textAlign: 'center', fontWeight: '500', color: '#4B5563' }}>{row.deviceUserId}</td>
                                    <td style={{ padding: '16px' }}>
                                        <span style={{
                                            padding: '4px 10px', borderRadius: '99px', fontSize: '12px', fontWeight: '600',
                                            backgroundColor: row.currentStatus === 'Check-In' ? '#D1FAE5' : row.currentStatus === 'Check-Out' ? '#FEF3C7' : '#F3F4F6',
                                            color: row.currentStatus === 'Check-In' ? '#065F46' : row.currentStatus === 'Check-Out' ? '#92400E' : '#374151'
                                        }}>
                                            {row.currentStatus}
                                        </span>
                                    </td>
                                    <td style={{ padding: '16px', color: '#111827', fontFamily: 'monospace' }}>{formatTime(row.firstInTime)}</td>
                                    <td style={{ padding: '16px', color: '#111827', fontFamily: 'monospace' }}>{formatTime(row.lastScanTime)}</td>
                                    <td style={{ padding: '16px', textAlign: 'center', fontWeight: '600', color: '#059669' }}>{row.checkInsToday}</td>
                                    <td style={{ padding: '16px', textAlign: 'center', fontWeight: '600', color: '#D97706' }}>{row.checkOutsToday}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

        </div>
    );
}