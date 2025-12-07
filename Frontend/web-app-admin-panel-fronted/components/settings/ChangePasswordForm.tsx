"use client";

import { useState, useEffect } from "react";
import { useChangePasswordFromProfileMutation } from "@/redux/Features/Auth/authApi";
import Button from "@/components/ui/button/Button";
import { Input } from "@/_components/ui/input";
import { Label } from "@/_components/ui/label";
import { toast } from "react-hot-toast";
import { authService } from "@/lib/auth-service";

export default function ChangePasswordForm() {
  console.log("ChangePasswordForm rendered");

  const [changePassword, { isLoading }] =
    useChangePasswordFromProfileMutation();
  const [userId, setUserId] = useState<string>("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<{
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});

  // Get current user ID
  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user && user.id) {
      setUserId(user.id);
      console.log("User ID:", user.id);
    } else {
      console.error("No user ID found!");
      toast.error("User session not found. Please login again.");
    }
  }, []);

  const validateForm = () => {
    const newErrors: typeof errors = {};

    // Validate current password
    if (!currentPassword) {
      newErrors.currentPassword = "Current password is required";
    }

    // Validate new password
    if (!newPassword) {
      newErrors.newPassword = "New password is required";
    } else if (newPassword.length < 6) {
      newErrors.newPassword = "Password must be at least 6 characters long";
    } else if (newPassword.length > 30) {
      newErrors.newPassword = "Password must be at most 30 characters long";
    } else if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/.test(newPassword)) {
      newErrors.newPassword = "Password must contain both letters and numbers";
    }

    // Validate confirm password
    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    // Check if new password is different from current
    if (currentPassword && newPassword && currentPassword === newPassword) {
      newErrors.newPassword =
        "New password must be different from current password";
    }

    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted!");
    console.log("Current password:", currentPassword);
    console.log("New password:", newPassword);
    console.log("Confirm password:", confirmPassword);
    console.log("User ID:", userId);

    setErrors({});

    // Check if user ID is available
    if (!userId) {
      toast.error("User session not found. Please login again.");
      return;
    }

    // Validate
    const validationErrors = validateForm();
    console.log("Validation errors:", validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error("Please fix the validation errors");
      return;
    }

    try {
      console.log("Calling API with data:", {
        _id: userId,
        currentPassword: "***",
        newPassword: "***",
        confirmPassword: "***",
      });

      await changePassword({
        _id: userId,
        currentPassword,
        newPassword,
        confirmPassword,
      }).unwrap();

      console.log("Success!");
      toast.success("Password changed successfully!");

      // Reset form
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: unknown) {
      console.error("API error:", error);
      const apiError = error as { data?: { message?: string } };
      const errorMessage =
        apiError?.data?.message || "Failed to change password";
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
            value={currentPassword}
            onChange={(e) => {
              console.log("Current password changed:", e.target.value);
              setCurrentPassword(e.target.value);
              if (errors.currentPassword) {
                setErrors((prev) => ({ ...prev, currentPassword: undefined }));
              }
            }}
            className={errors.currentPassword ? "border-red-500" : ""}
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
            value={newPassword}
            onChange={(e) => {
              console.log("New password changed:", e.target.value);
              setNewPassword(e.target.value);
              if (errors.newPassword) {
                setErrors((prev) => ({ ...prev, newPassword: undefined }));
              }
            }}
            className={errors.newPassword ? "border-red-500" : ""}
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
            value={confirmPassword}
            onChange={(e) => {
              console.log("Confirm password changed:", e.target.value);
              setConfirmPassword(e.target.value);
              if (errors.confirmPassword) {
                setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
              }
            }}
            className={errors.confirmPassword ? "border-red-500" : ""}
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
          variant="default"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
        >
          {isLoading ? "Changing Password..." : "Change Password"}
        </Button>
      </form>
    </div>
  );
}
