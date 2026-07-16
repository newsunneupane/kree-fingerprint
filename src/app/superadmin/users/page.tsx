'use client';
import { useEffect, useState } from 'react';

interface UserProfile {
    _id: string;
    name: string;
    email: string;
    deviceUserId: string;
    status: 'Active' | 'Inactive';
}

export default function ManageUsers() {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        deviceUserId: '',
        status: 'Active' as 'Active' | 'Inactive'
    });
    const [editingId, setEditingId] = useState<string | null>(null);
    const [message, setMessage] = useState({ text: '', type: '' });

    // Fetch users list
    async function fetchUsers() {
        const res = await fetch('/superadmin/api/users');
        if (res.ok) {
            const data = await res.json();
            setUsers(data);
        }
    }

    useEffect(() => {
        fetchUsers();
    }, []);

    // Handle Form Submission (Add or Update)
    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setMessage({ text: '', type: '' });

        const url = '/superadmin/api/users';
        const method = editingId ? 'PUT' : 'POST';
        const payload = editingId ? { id: editingId, ...formData } : formData;

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const result = await res.json();

            if (!res.ok) {
                throw new Error(result.error || 'Something went wrong');
            }

            setMessage({
                text: editingId ? 'Employee updated successfully!' : 'Employee registered successfully!',
                type: 'success'
            });

            // Reset Form and Mode
            setFormData({ name: '', email: '', deviceUserId: '', status: 'Active' });
            setEditingId(null);
            fetchUsers(); // Refresh the list
        } catch (err: any) {
            setMessage({ text: err.message, type: 'error' });
        }
    }

    // Load User into Edit Mode
    function startEdit(user: UserProfile) {
        setEditingId(user._id);
        setFormData({
            name: user.name,
            email: user.email,
            deviceUserId: user.deviceUserId,
            status: user.status
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Cancel Edit Mode
    function cancelEdit() {
        setEditingId(null);
        setFormData({ name: '', email: '', deviceUserId: '', status: 'Active' });
    }

    return (
        <div style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto' }}>
            
            {/* Header */}
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>Manage Employee Profiles</h1>
                <p style={{ color: '#666', margin: '4px 0 0 0', fontSize: '14px' }}>
                    Create, update, and link physical ZKTeco device credentials.
                </p>
            </div>

            {/* Form Section */}
            <div style={{ 
                backgroundColor: 'white', border: '1px solid #E5E7EB', borderRadius: '8px', 
                padding: '24px', marginBottom: '40px' 
            }}>
                <h2 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: '600' }}>
                    {editingId ? '✏️ Edit Profile' : '➕ Register New Employee'}
                </h2>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '6px', color: '#374151' }}>FULL NAME</label>
                            <input 
                                type="text" required placeholder="John Doe"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #D1D5DB', boxSizing: 'border-box' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '6px', color: '#374151' }}>EMAIL ADDRESS</label>
                            <input 
                                type="email" required placeholder="john@company.com"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #D1D5DB', boxSizing: 'border-box' }}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '6px', color: '#374151' }}>ZKTECO DEVICE USER ID</label>
                            <input 
                                type="text" required placeholder="Ex: 1, 2, 3"
                                value={formData.deviceUserId}
                                onChange={e => setFormData({ ...formData, deviceUserId: e.target.value })}
                                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #D1D5DB', boxSizing: 'border-box' }}
                            />
                        </div>
                        {editingId && (
                            <div>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '6px', color: '#374151' }}>EMPLOYEE STATUS</label>
                                <select 
                                    value={formData.status}
                                    onChange={e => setFormData({ ...formData, status: e.target.value as 'Active' | 'Inactive' })}
                                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #D1D5DB', boxSizing: 'border-box', backgroundColor: 'white' }}
                                >
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                </select>
                            </div>
                        )}
                    </div>

                    {message.text && (
                        <div style={{ 
                            padding: '12px', borderRadius: '6px', fontSize: '14px', fontWeight: '500',
                            backgroundColor: message.type === 'success' ? '#DEF7EC' : '#FDE8E8',
                            color: message.type === 'success' ? '#03543F' : '#9B1C1C'
                        }}>
                            {message.text}
                        </div>
                    )}

                    <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                        <button type="submit" style={{ 
                            padding: '12px 24px', backgroundColor: '#111827', color: 'white', 
                            border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' 
                        }}>
                            {editingId ? 'Save Changes' : 'Map Employee Profile'}
                        </button>
                        {editingId && (
                            <button type="button" onClick={cancelEdit} style={{ 
                                padding: '12px 24px', backgroundColor: '#F3F4F6', color: '#374151', 
                                border: '1px solid #D1D5DB', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' 
                            }}>
                                Cancel
                            </button>
                        )}
                    </div>
                </form>
            </div>

            {/* Users List Table */}
            <div style={{ backgroundColor: 'white', border: '1px solid #E5E7EB', borderRadius: '8px', overflow: 'hidden' }}>
                <div style={{ padding: '20px', borderBottom: '1px solid #E5E7EB' }}>
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>Directory Registry ({users.length})</h3>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                    <thead style={{ backgroundColor: '#F9FAFB' }}>
                        <tr style={{ borderBottom: '1px solid #E5E7EB', color: '#6B7280', fontSize: '12px', textTransform: 'uppercase' }}>
                            <th style={{ padding: '16px' }}>Name</th>
                            <th style={{ padding: '16px' }}>Email</th>
                            <th style={{ padding: '16px', textAlign: 'center' }}>Device ID</th>
                            <th style={{ padding: '16px' }}>Status</th>
                            <th style={{ padding: '16px', textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user._id} style={{ borderBottom: '1px solid #E5E7EB' }}>
                                <td style={{ padding: '16px', fontWeight: '600', color: '#111827' }}>{user.name}</td>
                                <td style={{ padding: '16px', color: '#4B5563' }}>{user.email}</td>
                                <td style={{ padding: '16px', textAlign: 'center', fontWeight: 'bold' }}>{user.deviceUserId}</td>
                                <td style={{ padding: '16px' }}>
                                    <span style={{
                                        padding: '4px 10px', borderRadius: '99px', fontSize: '12px', fontWeight: '600',
                                        backgroundColor: user.status === 'Active' ? '#DEF7EC' : '#FDE8E8',
                                        color: user.status === 'Active' ? '#03543F' : '#9B1C1C'
                                    }}>
                                        {user.status}
                                    </span>
                                </td>
                                <td style={{ padding: '16px', textAlign: 'right' }}>
                                    <button 
                                        onClick={() => startEdit(user)}
                                        style={{ 
                                            padding: '6px 12px', backgroundColor: 'transparent', border: '1px solid #D1D5DB', 
                                            borderRadius: '4px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', color: '#374151' 
                                        }}
                                    >
                                        Edit
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

        </div>
    );
}