import mongoose from "mongoose";

const AttendanceLogSchema = new mongoose.Schema(
  {
    deviceuserid: { type: String, required: true },
    timestamp: { type: Date, required: true },
    sn: { type: String, required: true }, // Device serial number
    raw_data: { type: String }, // Good for debugging ADMS payload issues
  },
  { timestamps: true }
);

export default mongoose.models.AttendanceLog || mongoose.model("AttendanceLog", AttendanceLogSchema);