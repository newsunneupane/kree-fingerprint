import mongoose from 'mongoose'

const LeaveRequestSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  reason: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  type: { type: String, enum: ['sick', 'casual', 'annual', 'other'], default: 'other' },
}, { timestamps: true })

export default mongoose.models.LeaveRequest || mongoose.model('LeaveRequest', LeaveRequestSchema)
