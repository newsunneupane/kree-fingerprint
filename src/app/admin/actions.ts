"use server";

import { revalidatePath } from "next/cache";
import dbConnect from "@/lib/mongodb";
import Employee from "@/models/Employee";

export async function addEmployee(formData: FormData) {
  await dbConnect();

  const name = formData.get("name") as string;
  const deviceuserid = formData.get("deviceuserid") as string;
  const department = formData.get("department") as string;

  // Simple server-side validation
  if (!name || !deviceuserid) {
    throw new Error("Name and Device User ID are required.");
  }

  try {
    // Save to MongoDB
    await Employee.create({
      name,
      deviceuserid: deviceuserid.trim(),
      department: department || "General",
    });

    // Clear the cache for the admin dashboard so the new mapping shows up immediately
    revalidatePath("/admin");
  } catch (error: any) {
    if (error.code === 11000) {
      throw new Error("This Device User ID is already assigned to another employee.");
    }
    throw new Error("Failed to save employee to database.");
  }
}