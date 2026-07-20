'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateEmployee, createEmployeeUser } from '../actions'

export function EmployeeRow({ emp, loginEmail, onDelete, onRegisterFingerprint }: {
  emp: any
  loginEmail: string | null
  onDelete: (formData: FormData) => void
  onRegisterFingerprint: (formData: FormData) => void
}) {
  const [editing, setEditing] = useState(false)
  const [creatingLogin, setCreatingLogin] = useState(false)
  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [loginError, setLoginError] = useState('')
  const [loginSuccess, setLoginSuccess] = useState(false)
  const router = useRouter()

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    try {
      await updateEmployee(formData)
      setEditing(false)
      router.refresh()
    } catch (err: any) {
      alert(err.message)
    }
  }

  const handleCreateLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError('')
    setLoginSuccess(false)
    const formData = new FormData()
    formData.set('employeeId', emp._id.toString())
    formData.set('email', loginForm.email)
    formData.set('password', loginForm.password)
    try {
      await createEmployeeUser(formData)
      setLoginSuccess(true)
      setCreatingLogin(false)
      setLoginForm({ email: '', password: '' })
      router.refresh()
    } catch (err: any) {
      setLoginError(err.message)
    }
  }

  if (editing) {
    return (
      <tr className="bg-blue-50/50">
        <td colSpan={6} className="px-6 py-4">
          <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
            <input type="hidden" name="id" value={emp._id.toString()} />
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase">Name</label>
              <input name="name" defaultValue={emp.name} required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase">Device ID</label>
              <input name="deviceuserid" defaultValue={emp.deviceuserid} required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase">Department</label>
              <input name="department" defaultValue={emp.department || ''} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 outline-none" />
            </div>
            <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-4 rounded-lg text-sm transition-all cursor-pointer">Save</button>
            <button type="button" onClick={() => setEditing(false)} className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-lg text-sm transition-all cursor-pointer">Cancel</button>
          </form>
        </td>
      </tr>
    )
  }

  if (creatingLogin) {
    return (
      <tr className="bg-purple-50/50">
        <td colSpan={6} className="px-6 py-4">
          <form onSubmit={handleCreateLogin} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase">Email</label>
              <input
                type="email"
                required
                value={loginForm.email}
                onChange={e => setLoginForm(f => ({ ...f, email: e.target.value }))}
                placeholder="employee@company.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase">Password</label>
              <input
                type="password"
                required
                minLength={4}
                value={loginForm.password}
                onChange={e => setLoginForm(f => ({ ...f, password: e.target.value }))}
                placeholder="Min 4 chars"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 outline-none"
              />
            </div>
            {loginError && <div className="text-xs text-red-600 col-span-2">{loginError}</div>}
            <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg text-sm transition-all cursor-pointer">Create Login</button>
            <button type="button" onClick={() => setCreatingLogin(false)} className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-lg text-sm transition-all cursor-pointer">Cancel</button>
          </form>
        </td>
      </tr>
    )
  }

  return (
    <tr className="hover:bg-gray-50/80 transition-colors">
      <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-900">{emp.name}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{emp.department || 'General'}</td>
      <td className="px-6 py-4 whitespace-nowrap font-mono text-xs text-gray-500">{emp.deviceuserid}</td>
      <td className="px-6 py-4 whitespace-nowrap">
        {emp.fingerprintRegistered ? (
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">Registered</span>
        ) : (
          <form action={onRegisterFingerprint}>
            <input type="hidden" name="deviceuserid" value={emp.deviceuserid} />
            <button type="submit" className="text-xs text-gray-900 border border-gray-300 px-2.5 py-1 rounded-md hover:bg-gray-50 cursor-pointer">Register</button>
          </form>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {loginEmail ? (
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">{loginEmail}</span>
        ) : (
          <button onClick={() => setCreatingLogin(true)} className="text-xs text-purple-600 border border-purple-200 px-2.5 py-1 rounded-md hover:bg-purple-50 cursor-pointer">
            Create Login
          </button>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right">
        <div className="flex justify-end gap-2">
          <button onClick={() => setEditing(true)} className="text-xs text-blue-600 border border-blue-200 px-2.5 py-1 rounded-md hover:bg-blue-50 cursor-pointer">Edit</button>
          <form action={onDelete} className="inline">
            <input type="hidden" name="id" value={emp._id.toString()} />
            <button type="submit" className="text-xs text-red-600 border border-red-200 px-2.5 py-1 rounded-md hover:bg-red-50 cursor-pointer">Delete</button>
          </form>
        </div>
      </td>
    </tr>
  )
}
