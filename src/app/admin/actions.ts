"use server";

import { revalidatePath } from "next/cache";
import dbConnect from "@/lib/mongodb";
import Employee from "@/models/Employee";
import User from "@/models/User";
import bcrypt from "bcryptjs";

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
    revalidatePath("/admin", "layout");
  } catch (error: any) {
    if (error.code === 11000) {
      throw new Error("This Device User ID is already assigned to another employee.");
    }
    throw new Error("Failed to save employee to database.");
  }
}

export async function updateEmployee(formData: FormData) {
  await dbConnect();

  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const deviceuserid = formData.get("deviceuserid") as string;
  const department = formData.get("department") as string;

  if (!id || !name || !deviceuserid) {
    throw new Error("ID, Name, and Device User ID are required.");
  }

  try {
    await Employee.findByIdAndUpdate(id, {
      name,
      deviceuserid: deviceuserid.trim(),
      department: department || "General",
    });
    revalidatePath("/admin/employees");
  } catch (error: any) {
    if (error.code === 11000) {
      throw new Error("This Device User ID is already assigned to another employee.");
    }
    throw new Error("Failed to update employee.");
  }
}

export async function createEmployeeUser(formData: FormData) {
  await dbConnect();

  const employeeId = formData.get("employeeId") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!employeeId || !email || !password) {
    throw new Error("Employee ID, email, and password are required.");
  }

  if (password.length < 4) {
    throw new Error("Password must be at least 4 characters.");
  }

  const employee = await Employee.findById(employeeId);
  if (!employee) {
    throw new Error("Employee not found.");
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error("A user with this email already exists.");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    await User.create({
      name: employee.name,
      email,
      password: hashedPassword,
      role: "employee",
      employeeId: employee._id,
    });
  } catch (error: any) {
    if (error.code === 11000) {
      throw new Error("A user with this email already exists.");
    }
    throw new Error("Failed to create user account.");
  }

  revalidatePath("/admin/employees");
}

export async function getEmployeeUsers(employeeIds: string[]) {
  await dbConnect();
  const users = await User.find({ employeeId: { $in: employeeIds } })
    .select("email employeeId")
    .lean();
  return users.map((u: any) => ({
    email: u.email,
    employeeId: u.employeeId.toString(),
  }));
}