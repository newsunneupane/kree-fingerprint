import mongoose from 'mongoose'

const HolidaySchema = new mongoose.Schema({
  name: { type: String, required: true },
  date: { type: Date, required: true },
}, { timestamps: true })

export default mongoose.models.Holiday || mongoose.model('Holiday', HolidaySchema)
