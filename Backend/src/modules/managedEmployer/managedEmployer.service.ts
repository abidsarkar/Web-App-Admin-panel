import fs from "fs";
import z from "zod";
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
  fileSchema,
  getAllEmployerInfoSchema,
  getEmployerInfoSchema,
  updateEmployerSchema,
  uploadProfilePictureSchema,
} from "./managedEmployer.zodSchema";
import { sendCreateAccountEmail } from "./managedEmployer.utils";
import { hashPassword } from "../../utils/hashManager";
import path from "path";
import { error } from "console";

export const createEmployerService = async (
  data: z.infer<typeof createEmployerSchema>,
  profilePictureData: z.infer<typeof fileSchema> | null,
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

  // 1️⃣ Find user by email and check if employee already exists
  const { email, password, employer_id } = data;
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
  // Check if employer_id is being changed and if it already exists for another employee
  const existingEmployeeId = await EmployerInfo.findOne({
    employer_id,
  });

  if (existingEmployeeId) {
    throw new ApiError(
      httpStatus.CONFLICT,
      "Employee id is already exist for other employee use unique one"
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
    profilePicture: {
      filePathURL: `public/uploads/profile_pictures/${profilePictureData?.filename}`,
      fileOriginalName: profilePictureData?.originalname,
      fileServerName: profilePictureData?.filename,
    },
    createdBy: {
      id: admin_id,
      role: admin_role,
      email: admin_email,
    },
  });

  await newEmployer.save();

  // Remove sensitive fields
  const {
    password: savedPassword,
    __v,
    isForgotPasswordVerified,
    otp,
    otpExpiresAt,
    changePasswordExpiresAt,
    ...safeUser
  } = newEmployer.toObject();

  // 🔑 Generate Access Token for admin
  const accessToken = generateAccessToken({
    id: admin_id,
    role: admin_role,
    email: admin_email,
  });

  // 📧 Send welcome email (with TEMP password, not hashed)
  // if (password) {
  //   //!await sendCreateAccountEmail(newEmployer.email, newEmployer.name, password);
  // } else {
  // !  await sendCreateAccountEmail(
  //     newEmployer.email,
  //     newEmployer.name,
  //     "Your admin will set your password soon."
  //   );
  // }

  return {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "New Employer Created Successfully",
    error: null,
    data: {
      accessToken,
      employer: safeUser,
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

  // Remove sensitive fields
  const {
    password,
    __v,
    isForgotPasswordVerified,
    otp,
    otpExpiresAt,
    changePasswordExpiresAt,
    ...safeUser
  } = user.toObject();

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
//get all employee ony from super admin
export const getAllEmployeeInformationService = async (
  data: z.infer<typeof getAllEmployerInfoSchema>,
  admin_id: string,
  admin_role: string,
  admin_email: string
) => {
  if (admin_role !== "superAdmin") {
    throw new ApiError(
      httpStatus.UNAUTHORIZED,
      "You don't have access to view employee list"
    );
  }
  // 1️⃣ Find all employee who is not role:supperAdmin user by email with pagination
  const { page, limit, search, isActive, sort, order } = data;
  const query: any = {
    role: { $ne: "superAdmin" }, // exclude superAdmin
  };
  if (isActive !== undefined) query.isActive = isActive;
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { employer_id: { $regex: search, $options: "i" } },
    ];
  }
  const skip = (page - 1) * limit;
  const sortField = sort || "createdAt";
  const sortOrder = order === "asc" ? 1 : -1;

  const [employees, total] = await Promise.all([
    EmployerInfo.find(query)
      .select(
        "-password -otp -otpExpiresAt -changePasswordExpiresAt -__v -isForgotPasswordVerified"
      )
      .sort({ [sortField]: sortOrder }) // ✅ Sorting applied here
      .skip(skip)
      .limit(limit),
    EmployerInfo.countDocuments(query),
  ]);

  const accessToken = generateAccessToken({
    id: admin_id,
    role: admin_role,
    email: admin_email,
  });
  const totalPages = Math.ceil(total / limit);

  return {
    statusCode: httpStatus.OK,
    success: true,
    message: "Employee list retrieved successfully!",
    error: null,
    data: {
      accessToken,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
      employees,
      user: {
        id: admin_id,
        role: admin_role,
        email: admin_email,
      },
    },
  };
};
export const getAllSupAdminEmployeeInformationService = async (
  data: z.infer<typeof getAllEmployerInfoSchema>,
  admin_id: string,
  admin_role: string,
  admin_email: string
) => {
  if (admin_role !== "superAdmin") {
    throw new ApiError(
      httpStatus.UNAUTHORIZED,
      "You don't have access to view employee list"
    );
  }
  // 1️⃣ Find all employee who is not role:supperAdmin user by email with pagination
  const { page, limit, search, isActive, sort, order } = data;
  const query: any = {
    role: { $in: "superAdmin" }, // include only superAdmin
  };
  if (isActive !== undefined) query.isActive = isActive;
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { employer_id: { $regex: search, $options: "i" } },
    ];
  }
  const skip = (page - 1) * limit;
  const sortField = sort || "createdAt";
  const sortOrder = order === "asc" ? 1 : -1;

  const [employees, total] = await Promise.all([
    EmployerInfo.find(query)
      .select(
        "-password -otp -otpExpiresAt -changePasswordExpiresAt -__v -isForgotPasswordVerified"
      )
      .sort({ [sortField]: sortOrder }) // ✅ Sorting applied here
      .skip(skip)
      .limit(limit),
    EmployerInfo.countDocuments(query),
  ]);

  const accessToken = generateAccessToken({
    id: admin_id,
    role: admin_role,
    email: admin_email,
  });

  return {
    statusCode: httpStatus.OK,
    success: true,
    message: "Employee list retrieved successfully!",
    error: null,
    data: {
      accessToken,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      employees,
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
  data: z.infer<typeof updateEmployerSchema>,
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

  // 🧹 Extract fields from data
  const { email, employer_id, password, ...updateData } = data;

  // 1️⃣ Find user by email or employer_id
  const existingEmployee =
    (await EmployerInfo.findOne({ email }).select("+password")) ||
    (await EmployerInfo.findOne({ employer_id }).select("+password"));

  if (!existingEmployee) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "User not found! Use a valid employee id or email."
    );
  }

  // Check if employer_id is being changed and if it already exists for another employee
  if (employer_id && existingEmployee.employer_id !== employer_id) {
    const existingEmployeeId = await EmployerInfo.findOne({
      employer_id,
      _id: { $ne: existingEmployee._id },
    });
    if (existingEmployeeId) {
      throw new ApiError(
        httpStatus.CONFLICT,
        "Employee id is already exist for other employee use unique one"
      );
    }
  }

  // 🔐 Hash password if provided
  let hashedPassword: string | undefined;
  if (password) {
    hashedPassword = await hashPassword(password);
  }

  // 🚫 Prepare update payload
  const updatePayload: any = {
    ...updateData,
    // Only include employer_id if it's provided and different
    ...(employer_id && { employer_id }),
    // Only include hashed password if password was provided
    ...(password && { password: hashedPassword }),
    // Keep the original email - don't allow it to be changed
    email: existingEmployee.email,
    // Update the updatedBy field - fix the structure
    createdBy: {
      ...existingEmployee.createdBy, // preserve existing createdBy data
      updatedBy: admin_id,
      updatedAt: new Date(),
    },
  };
  // Update the existing employee
  const updatedEmployee = await EmployerInfo.findByIdAndUpdate(
    existingEmployee._id,
    updatePayload,
    {
      new: true, // return updated document
      runValidators: true, // run schema validations
    }
  ).select("+password"); // Select password to handle the destructuring later

  if (!updatedEmployee) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Failed to update employee information"
    );
  }
  // Convert to plain JS object
  // Remove sensitive fields
  const {
    password: userPassword,
    __v,
    isForgotPasswordVerified,
    otp,
    otpExpiresAt,
    changePasswordExpiresAt,
    ...safeUser
  } = updatedEmployee.toObject();
  // 🔑 Generate access token for admin (if needed)
  const accessToken = generateAccessToken({
    id: admin_id,
    role: admin_role,
    email: admin_email,
  });

  return {
    statusCode: httpStatus.OK,
    success: true,
    message: "Employee information updated successfully!",
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
//! for later change superAdmin role is with otp
//! for now superAdmin can not be inactive and can be change as subAdmin then change
export const updateEmployeeProfilePicService = async (
  data: z.infer<typeof getEmployerInfoSchema>,
  profilePictureData: z.infer<typeof fileSchema>,
  admin_id: string,
  admin_role: string,
  admin_email: string
) => {
  if (admin_role !== "superAdmin") {
    throw new ApiError(
      httpStatus.UNAUTHORIZED,
      "You don't have access to update an employee"
    );
  } //!though it is already forcefully stop in the route but i use
  if (!profilePictureData) throw new ApiError(400, "No file uploaded");
  // 🧹 Remove sensitive fields that shouldn't be updated
  const { email, employer_id } = data;
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
  //!logic for delete old image and upload the new one
  //delete
  // 🧹 Delete old profile picture if exists
  if (existingEmployee.profilePicture?.filePathURL) {
    const oldPath = path.join(
      process.cwd(),
      existingEmployee.profilePicture.filePathURL
    );
    if (
      oldPath ===
      "public/uploads/profile_pictures/defaultProfilePictureAADD.png"
    ) {
    } else if (fs.existsSync(oldPath)) {
      fs.unlinkSync(oldPath);
    }
  }

  //change the info first
  const updatePayload = {
    profilePicture: {
      filePathURL: `public/uploads/profile_pictures/${profilePictureData?.filename}`,
      fileOriginalName: profilePictureData?.originalname,
      fileServerName: profilePictureData?.filename,
    },
    createdBy: {
      updatedBy: admin_id,
      updatedAt: new Date(),
    },
  };
  // Update the profile picture employee
  const updatedEmployee = await EmployerInfo.findByIdAndUpdate(
    existingEmployee._id,
    updatePayload,
    {
      new: true,
      runValidators: true,
    }
  );
  if (!updatedEmployee) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Failed to update employee profile picture"
    );
  }
  // Convert to plain JS object
  // Remove sensitive fields
  const {
    password,
    __v,
    otp,
    otpExpiresAt,
    changePasswordExpiresAt,
    isForgotPasswordVerified,
    ...safeUser
  } = updatedEmployee.toObject();
  // 🔑 Generate access token for admin (if needed)
  const accessToken = generateAccessToken({
    id: admin_id,
    role: admin_role,
    email: admin_email,
  });

  return {
    statusCode: httpStatus.OK,
    success: true,
    message: "Employee profile picture updated successfully!",
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
  const { email, employer_id } = data;
  // 1️⃣ Find user by email
  const existingEmployee = await EmployerInfo.findOneAndDelete({
    email,
    employer_id,
  }).select("+password");

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
