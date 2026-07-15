'use client';
import { useEffect, useState } from 'react';

interface EmployeeStatus {
    id: string;
    name: string;
    deviceUserId: string;
    lastScanTime: string | null;
    currentStatus: 'Check-In' | 'Check-Out' | 'Absent';
}

export default function RosterMonitor() {
    const [data, setData] = useState<EmployeeStatus[]>([]);
    
    useEffect(() => {
        async function loadFeed() {
            const res = await fetch('/superadmin/api/attendance');
            if (res.ok) setData(await res.json());
        }
        loadFeed();
        const hook = setInterval(loadFeed, 10000);
        return () => clearInterval(hook);
    }, []);

    return (
        <div style={{ padding: '40px', fontFamily: 'sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>Live Attendance Feed</h1>
                    <p style={{ color: '#666', margin: '4px 0 0 0', fontSize: '14px' }}>Real-time updates synced with hardware logs.</p>
                </div>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                <thead>
                    <tr style={{ borderBottom: '2px solid #eee', color: '#666' }}>
                        <th style={{ padding: '12px' }}>Employee</th>
                        <th style={{ padding: '12px' }}>Hardware ID</th>
                        <th style={{ padding: '12px' }}>Current State</th>
                        <th style={{ padding: '12px' }}>Last Transaction</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map(emp => (
                        <tr key={emp.id} style={{ borderBottom: '1px solid #eee' }}>
                            <td style={{ padding: '12px', fontWeight: 'bold' }}>{emp.name}</td>
                            <td style={{ padding: '12px', fontFamily: 'monospace' }}>{emp.deviceUserId}</td>
                            <td style={{ padding: '12px' }}>
                                <span style={{
                                    padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold',
                                    backgroundColor: emp.currentStatus === 'Check-In' ? '#e6f4ea' : emp.currentStatus === 'Check-Out' ? '#fce8e6' : '#f1f3f4',
                                    color: emp.currentStatus === 'Check-In' ? '#137333' : emp.currentStatus === 'Check-Out' ? '#c5221f' : '#3c4043'
                                }}>{emp.currentStatus}</span>
                            </td>
                            <td style={{ padding: '12px', color: '#666' }}>
                                {emp.lastScanTime ? new Date(emp.lastScanTime).toLocaleTimeString() : '--:--'}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}