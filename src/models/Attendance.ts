import mongoose from 'mongoose';

const AttendanceSchema = new mongoose.Schema({
    deviceUserId: { type: String, required: true },
    timestamp: { type: Date, required: true },
    type: { type: String, enum: ['Check-In', 'Check-Out'], required: true }
});

export default mongoose.models.Attendance || mongoose.model('Attendance', AttendanceSchema);