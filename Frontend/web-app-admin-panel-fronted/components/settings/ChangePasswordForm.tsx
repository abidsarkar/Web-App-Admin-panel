"use client";

import { useState, useEffect } from "react";
import { useChangePasswordFromProfileMutation } from "@/redux/Features/Auth/authApi";
import { Button } from "@/_components/ui/button";
import { Input } from "@/_components/ui/input";
import { Label } from "@/_components/ui/label";
import { Spinner } from "@/_components/ui/spinner";
import { toast } from "react-hot-toast";
import { authService } from "@/lib/auth-service";
import {
  changePasswordSchema,
  type ChangePasswordFormData,
} from "@/lib/validations/password";

export default function ChangePasswordForm() {
  const [changePassword, { isLoading }] =
    useChangePasswordFromProfileMutation();
  const [userId, setUserId] = useState<string>("");
  const [formData, setFormData] = useState<ChangePasswordFormData>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof ChangePasswordFormData, string>>
  >({});

  // Get current user ID
  useEffect(() => {
    try {
      const user = authService.getCurrentUser();
      const id = user?.id || user?._id;
      if (id) {
        setUserId(id);
      } else {
        console.error("User ID not found in session");
        toast.error("Session expired. Please login again.");
      }
    } catch (error) {
      console.error("Error retrieving user session:", error);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field when user starts typing
    if (errors[name as keyof ChangePasswordFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!userId) {
      toast.error("User session not found. Please login again.");
      return;
    }

    // Validate form data with Zod schema
    try {
      changePasswordSchema.parse(formData);
    } catch (validationError: any) {
      const validationErrors: Partial<
        Record<keyof ChangePasswordFormData, string>
      > = {};

      if (validationError.errors) {
        validationError.errors.forEach((err: any) => {
          const field = err.path[0] as keyof ChangePasswordFormData;
          validationErrors[field] = err.message;
        });
      }

      setErrors(validationErrors);
      return;
    }

    // Check if new password matches confirmation
    if (formData.newPassword !== formData.confirmPassword) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: "Passwords do not match",
      }));
      return;
    }

    try {
      // Call the mutation
      await changePassword({
        _id: userId,
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword,
      }).unwrap();

      toast.success("Password changed successfully!");

      // Reset form
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setErrors({});
    } catch (error: any) {
      console.error("Change password error:", error);

      // Handle API validation errors
      if (error?.data?.errors) {
        const apiErrors: Partial<Record<keyof ChangePasswordFormData, string>> =
          {};
        Object.entries(error.data.errors).forEach(([field, message]) => {
          if (field in formData) {
            apiErrors[field as keyof ChangePasswordFormData] =
              message as string;
          }
        });
        setErrors(apiErrors);
      }

      const errorMessage = error?.data?.message || "Failed to change password";
      toast.error(errorMessage);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold mb-4">Change Password</h3>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <div>
          <Label htmlFor="currentPassword">
            Current Password <span className="text-red-500">*</span>
          </Label>
          <Input
            id="currentPassword"
            name="currentPassword"
            type="password"
            value={formData.currentPassword}
            onChange={handleChange}
            className={errors.currentPassword ? "border-red-500" : ""}
            placeholder="Enter current password"
            disabled={isLoading}
          />
          {errors.currentPassword && (
            <p className="text-red-500 text-sm mt-1">
              {errors.currentPassword}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="newPassword">
            New Password <span className="text-red-500">*</span>
          </Label>
          <Input
            id="newPassword"
            name="newPassword"
            type="password"
            value={formData.newPassword}
            onChange={handleChange}
            className={errors.newPassword ? "border-red-500" : ""}
            placeholder="Enter new password"
            disabled={isLoading}
          />
          {errors.newPassword && (
            <p className="text-red-500 text-sm mt-1">{errors.newPassword}</p>
          )}
          <p className="text-gray-500 text-xs mt-1">
            Must be 6-30 characters with letters and numbers
          </p>
        </div>

        <div>
          <Label htmlFor="confirmPassword">
            Confirm New Password <span className="text-red-500">*</span>
          </Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            className={errors.confirmPassword ? "border-red-500" : ""}
            placeholder="Confirm new password"
            disabled={isLoading}
          />
          {errors.confirmPassword && (
            <p className="text-red-500 text-sm mt-1">
              {errors.confirmPassword}
            </p>
          )}
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto"
        >
          {isLoading ? (
            <>
              <Spinner className="w-4 h-4 mr-2" />
              Changing Password...
            </>
          ) : (
            "Change Password"
          )}
        </Button>
      </form>
    </div>
  );
}
