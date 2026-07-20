'use server'

import { revalidatePath } from 'next/cache'
import dbConnect from '@/lib/mongodb'
import LeaveRequest from '@/models/LeaveRequest'
import { getCurrentEmployee } from '@/lib/dal'

export async function createLeaveRequest(formData: FormData) {
  const employee = await getCurrentEmployee()
  if (!employee) throw new Error('Unauthorized')

  const type = formData.get('type') as string
  const startDate = formData.get('startDate') as string
  const endDate = formData.get('endDate') as string
  const reason = formData.get('reason') as string

  if (!type || !startDate || !endDate || !reason) {
    throw new Error('All fields are required.')
  }

  if (new Date(startDate) > new Date(endDate)) {
    throw new Error('End date must be after start date.')
  }

  await dbConnect()
  await LeaveRequest.create({
    employeeId: employee._id,
    startDate: new Date(startDate),
    endDate: new Date(endDate),
    reason,
    type,
    status: 'pending',
  })

  revalidatePath('/admin/leaves')
  revalidatePath('/employee/leave')
}