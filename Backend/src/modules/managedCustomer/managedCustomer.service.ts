import fs from "fs";
import z, { size } from "zod";
import {
  generateAccessToken,
  generateForgotPasswordToken,
  generateRefreshToken,
  verifyToken,
} from "../../utils/JwtToken";

// src/services/auth.service.ts
import { customerInfoModel } from "../customerAuth/customerAuth.model";
import jwt, { JwtPayload } from "jsonwebtoken";
import argon2 from "argon2";
import ApiError from "../../errors/ApiError";
import httpStatus from "http-status";
import { JWT_SECRET_KEY } from "../../config/envConfig";
import {
  fileSchema,
  getAllCustomerInfoSchema,
  getProfileForAdminSchema,
  getProfileSchema,
  updateCustomerProfileSchema,
} from "./managedCustomer.zodSchema";
import path from "path";

export const getProfileService = async (
  data: z.infer<typeof getProfileSchema>,
  user_id: string,
  user_role: string,
  user_email: string
) => {
  const { _id } = data;
  //check if the user is same as logged in user
  if (_id !== user_id) {
    throw new ApiError(
      httpStatus.UNAUTHORIZED,
      "You are not authorized"
    );
  }
  // 1 Find user by email
  const user = await customerInfoModel.findById(_id);
  if (!user || user.isDeleted) {
    throw new ApiError(httpStatus.NOT_FOUND, "invalid email or password");
  }

  // 2 Check if active
  if (!user.isActive) {
    throw new ApiError(httpStatus.FORBIDDEN, "User account is deactivated");
  }

  const {
    password: _,
    __v,
    otp,
    otpExpiresAt,
    changePasswordExpiresAt,
    isForgotPasswordVerified,
    isDeleted,
    ...safeUser
  } = user.toObject();
  return {
    statusCode: httpStatus.OK,
    success: true,
    message: "Profile fetched successfully",
    error: null,
    data: {
      user: safeUser,
    },
  };
};
//for admin
export const getProfileForAdminService = async (
  data: z.infer<typeof getProfileForAdminSchema>,
  admin_id: string,
  admin_role: string,
  admin_email: string
) => {
  const { _id, email } = data;

  // Validate that at least one identifier is provided
  if (!_id && !email) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Please provide either user ID or email"
    );
  }

  let user;
  let searchCriteria = "";

  // Build query based on provided parameters
  if (_id && email) {
    // Both ID and email provided
    user = await customerInfoModel.findOne({ _id, email });
    searchCriteria = `ID: ${_id} and Email: ${email}`;
  } else if (_id) {
    // Only ID provided
    user = await customerInfoModel.findById(_id);
    searchCriteria = `ID: ${_id}`;
  } else if (email) {
    // Only email provided
    user = await customerInfoModel.findOne({ email });
    searchCriteria = `Email: ${email}`;
  }

  if (!user) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      `User not found with ${searchCriteria}`
    );
  }

  const {
    password: _,
    __v,
    otp,
    otpExpiresAt,
    changePasswordExpiresAt,
    ...safeUser
  } = user.toObject();

  // Prepare user name for message
  let userName = "";
  if (user.firstName && user.lastName) {
    userName = `${user.firstName} ${user.lastName}`;
  } else if (user.firstName) {
    userName = user.firstName;
  } else if (user.lastName) {
    userName = user.lastName;
  } else {
    userName = user.email; // Fallback to email if no name
  }

  return {
    statusCode: httpStatus.OK,
    success: true,
    message: `Profile fetched successfully for ${userName} (${searchCriteria})`,
    error: null,
    data: {
      customer: safeUser,
      user: {
        id: admin_id,
        role: admin_role,
        email: admin_email,
      },
    },
  };
};
//get all customer info with filter and pagination
export const getAllCustomerInformationService = async (
  data: z.infer<typeof getAllCustomerInfoSchema>,
  admin_id: string,
  admin_role: string,
  admin_email: string
) => {
  // 1️⃣ Find all employee who is not role:supperAdmin user by email with pagination
  const { page, limit, search, isActive,isDeleted, sort, order } = data;
  const query: any ={};
  if (isActive !== undefined) query.isActive = isActive;
  if (isDeleted !== undefined) query.isDeleted = isDeleted;
  if (search) {
    query.$or = [
      { firstName: { $regex: search, $options: "i" } },
      { lastName: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }
  const skip = (page - 1) * limit;
  const sortField = sort || "createdAt";
  const sortOrder = order === "asc" ? 1 : -1;

  const [customer, total] = await Promise.all([
    customerInfoModel.find(query)
      .select(
        "-password -otp -otpExpiresAt -changePasswordExpiresAt -__v -isForgotPasswordVerified"
      )
      .sort({ [sortField]: sortOrder }) // ✅ Sorting applied here
      .skip(skip)
      .limit(limit),
    customerInfoModel.countDocuments(query),
  ]);

  const accessToken = generateAccessToken({
    id: admin_id,
    role: admin_role,
    email: admin_email,
  });

  return {
    statusCode: httpStatus.OK,
    success: true,
    message: "Customer list retrieved successfully!",
    error: null,
    data: {
      accessToken,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      customer,
      user: {
        id: admin_id,
        role: admin_role,
        email: admin_email,
      },
    },
  };
};
export const updateCustomerProfileService = async (
  data: z.infer<typeof updateCustomerProfileSchema>,
  customer_id: string
) => {
  const { firstName, lastName, phone, secondaryPhoneNumber, address } = data;

  // Check if customer exists and is active
  const existingCustomer = await customerInfoModel.findById(customer_id);
  if (!existingCustomer || existingCustomer.isDeleted) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  if (!existingCustomer.isActive) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "This account is deactivated, please contact help center"
    );
  }

  // Build update object
  const updateData: any = {};

  if (firstName !== undefined) updateData.firstName = firstName;
  if (lastName !== undefined) updateData.lastName = lastName;
  if (phone !== undefined) updateData.phone = phone;
  if (secondaryPhoneNumber !== undefined)
    updateData.secondaryPhoneNumber = secondaryPhoneNumber;

  // Handle address updates
  if (address) {
    updateData.address = { ...(existingCustomer.address?.toObject() || {}) };

    if (address.division !== undefined)
      updateData.address.division = address.division;
    if (address.district !== undefined)
      updateData.address.district = address.district;
    if (address.upazila !== undefined)
      updateData.address.upazila = address.upazila;
    if (address.village_road_house_flat !== undefined) {
      updateData.address.village_road_house_flat =
        address.village_road_house_flat;
    }
  }

  // Update customer using findByIdAndUpdate
  const updatedCustomer = await customerInfoModel.findByIdAndUpdate(
    customer_id,
    { $set: updateData },
    {
      new: true, // Return updated document
      runValidators: true, // Run schema validators
      select: "-password -__v -otp -otpExpiresAt -changePasswordExpiresAt",
    }
  );

  if (!updatedCustomer) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Failed to update profile"
    );
  }

  // Generate new access token
  const accessToken = generateAccessToken({
    id: updatedCustomer._id.toString(),
    role: updatedCustomer.role,
    email: updatedCustomer.email,
  });
  const {
    password: _,
    __v,
    otp,
    otpExpiresAt,
    changePasswordExpiresAt,
    isForgotPasswordVerified,
    isDeleted,
    
    ...safeUser
  } = updatedCustomer.toObject();
  return {
    statusCode: httpStatus.OK,
    success: true,
    message:
      `Profile updated successfully for ${updatedCustomer.firstName} ${updatedCustomer.lastName || ""}`.trim(),
    error: null,
    data: {
      accessToken,
      user: safeUser
    },
  };
};
export const updateCustomerProfilePicService = async (
  profilePictureData: z.infer<typeof fileSchema>,
  customer_id: string
) => {
  if (!profilePictureData) throw new ApiError(400, "No file uploaded");
  //check if customer exists
  const existingCustomer = await customerInfoModel.findById(customer_id);

  if (!existingCustomer || existingCustomer.isDeleted) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found!");
  }
  //!logic for delete old image and upload the new one
  //delete
  // 🧹 Delete old profile picture if exists
  if (existingCustomer.profilePicture?.filePathURL) {
    const oldPath = path.join(
      process.cwd(),
      existingCustomer.profilePicture.filePathURL
    );
    if (oldPath === "public/demoImage/profile-picture-placeholder.png") {
    } else if (fs.existsSync(oldPath)) {
      fs.unlinkSync(oldPath);
    }
  }

  //change the info first
  const updatePayload = {
    profilePicture: {
      filePathURL: `public/uploads/customer_profile_picture/${profilePictureData?.filename}`,
      fileOriginalName: profilePictureData?.originalname,
      fileServerName: profilePictureData?.filename,
      size: profilePictureData?.size,
      mimetype: profilePictureData?.mimetype,
    },
  };
  // Update the profile picture employee
  const updatedCustomer = await customerInfoModel.findByIdAndUpdate(
    existingCustomer._id,
    updatePayload,
    {
      new: true,
      runValidators: true,
    }
  );
  if (!updatedCustomer) {
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
    isDeleted,
    ...safeUser
  } = updatedCustomer.toObject();
  // 🔑 Generate access token for admin (if needed)
  const accessToken = generateAccessToken({
    id: updatedCustomer._id.toString(),
    role: updatedCustomer.role,
    email: updatedCustomer.email,
  });

  return {
    statusCode: httpStatus.OK,
    success: true,
    message: "Customer profile picture updated successfully!",
    error: null,
    data: {
      accessToken,
      customer: safeUser,
    },
  };
};
export const deleteCustomerProfileService = async (
  data: z.infer<typeof getProfileSchema>,
  customer_id: string
) => {
  const { _id } = data;
  if (_id !== customer_id) {
    throw new ApiError(
      httpStatus.UNAUTHORIZED,
      "You are not authorized to delete this account"
    );
  }
  // Check if customer exists and is active
  const existingCustomer = await customerInfoModel.findById(customer_id);
  if (!existingCustomer || existingCustomer.isDeleted) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  if (!existingCustomer.isActive) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "This account is deactivated, please contact help center"
    );
  }

  const deleteAccount = await customerInfoModel.findByIdAndUpdate(customer_id, {
    isDeleted: true,
    deletedAt: new Date(),
  });

  if (!deleteAccount) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Failed to delete profile"
    );
  }

  return {
    statusCode: httpStatus.OK,
    success: true,
    message: "Profile delete successfully ",
    error: null,
    data: {
      customer: null,
    },
  };
};
