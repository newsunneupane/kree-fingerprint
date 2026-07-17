import mongoose from "mongoose";

const EmployeeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    deviceuserid: { type: String, required: true, unique: true }, // The "2" from the machine
    department: { type: String, default: "General" },
  },
  { timestamps: true }
);

export default mongoose.models.Employee || mongoose.model("Employee", EmployeeSchema);