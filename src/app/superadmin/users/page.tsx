'use client';
import { useState } from 'react';

export default function AddUserView() {
    const [form, setForm] = useState({ name: '', email: '', deviceUserId: '' });
    const [status, setStatus] = useState('');

    const saveForm = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('Syncing...');
        const response = await fetch('/superadmin/api/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(form)
        });
        if (response.ok) {
            setStatus('User clean-mapped successfully.');
            setForm({ name: '', email: '', deviceUserId: '' });
        } else {
            setStatus('Failed to sync structure.');
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '60px auto', fontFamily: 'sans-serif' }}>
            <h2>Link Biometric ID</h2>
            <form onSubmit={saveForm} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <input placeholder="Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} style={{ padding: '10px' }} required />
                <input placeholder="Email" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} style={{ padding: '10px' }} required />
                <input placeholder="ZKTeco Device User ID" value={form.deviceUserId} onChange={e => setForm({...form, deviceUserId: e.target.value})} style={{ padding: '10px' }} required />
                <button type="submit" style={{ padding: '10px', background: '#000', color: '#fff', border: 'none', cursor: 'pointer' }}>Map Employee Profile</button>
            </form>
            {status && <p style={{ fontSize: '13px', marginTop: '12px', color: '#666' }}>{status}</p>}
        </div>
    );
}