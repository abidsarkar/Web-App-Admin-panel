import z, { email } from "zod";
import argon2 from "argon2";
import httpStatus from "http-status";
import ApiError from "../../errors/ApiError";
import { EmployerInfo } from "../auth/auth.model";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../../utils/JwtToken";
import {
  createEmployerSchema,
  deleteEmployerInfoSchema,
  getEmployerInfoSchema,
} from "./managedEmployer.zodSchema";
import { sendCreateAccountEmail } from "./managedEmployer.utils";
import { hashPassword } from "../../utils/hashManager";

export const createEmployerService = async (
  data: z.infer<typeof createEmployerSchema>,
  admin_id: string,
  admin_role: string,
  admin_email: string
) => {
  // 🔒 Role-based access control
  if (admin_role !== "superAdmin") {
    throw new ApiError(
      httpStatus.UNAUTHORIZED,
      "You don't have access to create new employee"
    );
  }
  // 1️⃣ Find user by email
  const { email, password } = data;
  // 🔍 Check if employee already exists
  const existingUser = await EmployerInfo.findOne({ email }).select(
    "+password"
  );
  if (existingUser) {
    throw new ApiError(httpStatus.CONFLICT, "Employee already registered");
  }
  if (data.role === "superAdmin" && data.isActive == false) {
    throw new ApiError(
      httpStatus.UNAUTHORIZED,
      "You can not inactive a supper Admin"
    );
  }
  // 🔐 Hash password if provided
  let hashedPassword: string | undefined;
  if (password) {
    hashedPassword = await hashPassword(password);
  }

  // 2️⃣ Create new Employer (Zod already validated the fields)
  const newEmployer = new EmployerInfo({
    ...data,
    password: hashedPassword,
    createdBy: {
      id: admin_id,
      role: admin_role,
      email: admin_email,
    },
  });

  await newEmployer.save();
  // 3️⃣ Generate Access Token for admin (optional)
  const accessToken = generateAccessToken({
    id: admin_id,
    role: admin_role,
    email: admin_email,
  });

  // 4️⃣ Prepare response
  const employerData = {
    id: newEmployer._id,
    role: newEmployer.role,
    isActive: newEmployer.isActive,
    ...data,
    password: undefined,
  };
  // 📧 Send welcome email (with TEMP password, not hashed)
  if (password) {
    await sendCreateAccountEmail(newEmployer.email, newEmployer.name, password);
  } else {
    await sendCreateAccountEmail(
      newEmployer.email,
      newEmployer.name,
      "Your admin will set your password soon."
    );
  }
  return {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "New Employer Created Successfully",
    error: null,
    data: {
      accessToken,
      employer: employerData,
      user: {
        id: admin_id,
        role: admin_role,
        email: admin_email,
      },
    },
  };
};
export const getEmployeeInformationService = async (
  data: z.infer<typeof getEmployerInfoSchema>,
  admin_id: string,
  admin_role: string,
  admin_email: string
) => {
  // 1️⃣ Find user by email
  const { email, employer_id } = data;
  const user =
    (await EmployerInfo.findOne({ email }).select("+password")) ||
    (await EmployerInfo.findOne({ employer_id }).select("+password"));

  if (!user) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "User not found! Use a valid employee id or email."
    );
  }

  // 🧹 Remove sensitive fields

  // Convert to plain JS object
  const userObj = user.toObject();

  // Remove sensitive fields
  const {
    password,
    __v,
    isForgotPasswordVerified,
    otp,
    otpExpiresAt,
    changePasswordExpiresAt,
    ...safeUser
  } = userObj;

  // 🔑 Generate access token for this employee
  const accessToken = generateAccessToken({
    id: admin_id,
    role: admin_role,
    email: admin_email,
  });

  return {
    statusCode: httpStatus.OK,
    success: true,
    message: "Employee information retrieved successfully!",
    error: null,
    data: {
      accessToken,
      employee: safeUser,
      user: {
        id: admin_id,
        role: admin_role,
        email: admin_email,
      },
    },
  };
};

//update employee information
export const updateEmployeeInformationService = async (
  data: z.infer<typeof createEmployerSchema>,
  admin_id: string,
  admin_role: string,
  admin_email: string
) => {
  if (admin_role !== "superAdmin") {
    throw new ApiError(
      httpStatus.UNAUTHORIZED,
      "You don't have access to update a employee"
    );
  }
  if (data.role === "superAdmin" && data.isActive == false) {
    throw new ApiError(
      httpStatus.UNAUTHORIZED,
      "You can not inactive a supper Admin"
    );
  }
  // 🧹 Remove sensitive fields that shouldn't be updated
  const { email, password, ...updateData } = data;
  const { employer_id } = data;

  // 1️⃣ Find user by email
  const existingEmployee =
    (await EmployerInfo.findOne({ email }).select("+password")) ||
    (await EmployerInfo.findOne({ employer_id }).select("+password"));

  if (!existingEmployee) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "User not found! Use a valid employee id or email."
    );
  }

  //console.log(updateData) //this return the user input data only
  // 🚫 Preserve the original email and update only allowed fields
  const updatePayload: any = {
    ...updateData,
    // Keep the original email - don't allow it to be changed
    email: existingEmployee.email,
    // Update the updatedBy field
    createdBy: {
      ...existingEmployee.createdBy, // preserve existing createdBy data
      updatedBy: admin_id,
      updatedAt: new Date(),
    },
  };
  ///console.log("update payload from db",updatePayload) //this is from database
  // Update the existing employee
  const updatedEmployee = await EmployerInfo.findByIdAndUpdate(
    existingEmployee._id,
    updatePayload,
    {
      new: true, // return updated document
      runValidators: true, // run schema validations
    }
  );

  if (!updatedEmployee) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Failed to update employee information"
    );
  }

  // 🔑 Generate access token for admin (if needed)
  const accessToken = generateAccessToken({
    id: admin_id,
    role: admin_role,
    email: admin_email,
  });

  // Prepare response - exclude password
  const updatedEmployerData = {
    id: updatedEmployee._id,
    email: updatedEmployee.email, // original preserved email
    role: updatedEmployee.role,
    isActive: updatedEmployee.isActive,
    createdBy: updatedEmployee.createdBy,
    ...updateData,
    password: undefined,
  };

  return {
    statusCode: httpStatus.OK,
    success: true,
    message: "Employee information updated successfully!",
    error: null,
    data: {
      accessToken,
      employee: updatedEmployerData,
      user: {
        id: admin_id,
        role: admin_role,
        email: admin_email,
      },
    },
  };
};
//! for later change superAdmin role is with otp
//! for now superAdmin can not be inactive and can be change as subAdmin then change
export const deleteEmployeeInformationService = async (
  data: z.infer<typeof deleteEmployerInfoSchema>,
  admin_id: string,
  admin_role: string,
  admin_email: string
) => {
  if (admin_role !== "superAdmin") {
    throw new ApiError(
      httpStatus.UNAUTHORIZED,
      "You don't have access to create new employee"
    );
  }
  if (data.email === admin_email) {
    throw new ApiError(
      httpStatus.NOT_ACCEPTABLE,
      "You can not delete your own account as to maintain the web admin At last one super admin is necessary. Ask other admin to delete your account"
    );
  }
  // 🧹 Remove sensitive fields that shouldn't be updated
  const { email,employer_id } = data;
  console.log(email,employer_id)
  // 1️⃣ Find user by email
  const existingEmployee =
    (await EmployerInfo.findOneAndDelete({ email ,employer_id}).select("+password"));

  if (!existingEmployee) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "User not found! Use a valid employee id or email."
    );
  }

  // 🔑 Generate access token for admin (if needed)
  const accessToken = generateAccessToken({
    id: admin_id,
    role: admin_role,
    email: admin_email,
  });

  return {
    statusCode: httpStatus.ACCEPTED,
    success: true,
    message: "Employee delete successfully!",
    error: null,
    data: {
      accessToken,
      user: {
        id: admin_id,
        role: admin_role,
        email: admin_email,
      },
    },
  };
};
