import mongoose from "mongoose";

const AttendanceLogSchema = new mongoose.Schema(
  {
    deviceuserid: { type: String, required: true },
    timestamp: { type: Date, required: true },
    sn: { type: String, required: true },
    type: { type: String, enum: ['in', 'out'], required: true, default: 'in' },
  },
  { timestamps: true }
);

export default mongoose.models.AttendanceLog || mongoose.model("AttendanceLog", AttendanceLogSchema);