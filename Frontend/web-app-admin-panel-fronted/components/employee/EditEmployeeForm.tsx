"use client";

import { useState } from "react";
import { useUpdateEmployeeMutation } from "@/redux/Features/employee/employeeApi";
import { Button } from "@/_components/ui/button";
import { Input } from "@/_components/ui/input";
import { Label } from "@/_components/ui/label";
import { Spinner } from "@/_components/ui/spinner";
import { X, Lock, Unlock } from "lucide-react";

interface Employee {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  position?: string;
  address?: string;
  employer_id: string;
  secondaryPhoneNumber?: string;
  isActive: boolean;
}

interface EditEmployeeFormProps {
  employee: Employee;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function EditEmployeeForm({
  employee,
  onClose,
  onSuccess,
}: EditEmployeeFormProps) {
  const [updateEmployee, { isLoading }] = useUpdateEmployeeMutation();
  const [error, setError] = useState("");

  // Track which fields are unlocked for editing
  const [unlockedFields, setUnlockedFields] = useState<Set<string>>(new Set());

  // Track changed values
  const [formData, setFormData] = useState({
    _id: employee._id,
    name: employee.name,
    email: employee.email,
    phone: employee.phone,
    role: employee.role,
    position: employee.position || "",
    address: employee.address || "",
    employer_id: employee.employer_id,
    secondaryPhoneNumber: employee.secondaryPhoneNumber || "",
    isActive: employee.isActive,
    password: "",
  });

  const toggleFieldLock = (fieldName: string) => {
    const newUnlocked = new Set(unlockedFields);
    if (newUnlocked.has(fieldName)) {
      newUnlocked.delete(fieldName);
      // Reset to original value when locking
      setFormData({
        ...formData,
        [fieldName]: employee[fieldName as keyof Employee] || "",
      });
    } else {
      newUnlocked.add(fieldName);
    }
    setUnlockedFields(newUnlocked);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      // Only send changed fields
      const updateData: any = { _id: employee._id };

      // Add only unlocked fields that have changed
      unlockedFields.forEach((fieldName) => {
        const currentValue = formData[fieldName as keyof typeof formData];
        const originalValue = employee[fieldName as keyof Employee];

        // Only include if value has actually changed
        if (currentValue !== originalValue) {
          updateData[fieldName] = currentValue;
        }
      });

      // Special handling for password - only send if it's not empty
      if (unlockedFields.has("password") && formData.password.trim() !== "") {
        updateData.password = formData.password;
      }

      // If no fields were changed, show message
      if (Object.keys(updateData).length === 1) {
        setError("No changes detected. Unlock and modify fields to update.");
        return;
      }

      await updateEmployee(updateData).unwrap();
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: unknown) {
      const errorMessage =
        (err as { data?: { message?: string } })?.data?.message ||
        "Failed to update employee.";
      setError(errorMessage);
    }
  };

  const FieldWithLock = ({
    name,
    label,
    type = "text",
    placeholder,
    required = false,
  }: {
    name: keyof typeof formData;
    label: string;
    type?: string;
    placeholder?: string;
    required?: boolean;
  }) => {
    const isUnlocked = unlockedFields.has(name);
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor={name}>
            {label} {required && <span className="text-red-500">*</span>}
          </Label>
          <button
            type="button"
            onClick={() => toggleFieldLock(name)}
            className={`p-1 rounded transition-colors ${
              isUnlocked
                ? "text-green-600 hover:bg-green-50"
                : "text-gray-400 hover:bg-gray-100"
            }`}
            title={isUnlocked ? "Lock field" : "Unlock to edit"}
          >
            {isUnlocked ? (
              <Unlock className="w-4 h-4" />
            ) : (
              <Lock className="w-4 h-4" />
            )}
          </button>
        </div>
        <Input
          id={name}
          name={name}
          type={type}
          placeholder={placeholder}
          value={formData[name] as string}
          onChange={handleChange}
          disabled={!isUnlocked}
          className={!isUnlocked ? "bg-gray-50 cursor-not-allowed" : ""}
        />
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Edit Employee</h2>
            <p className="text-sm text-gray-500 mt-1">
              Click the lock icon to unlock fields you want to edit
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <FieldWithLock
                name="name"
                label="Full Name"
                placeholder="John Doe"
                required
              />

              <FieldWithLock
                name="email"
                label="Email Address"
                type="email"
                placeholder="john@example.com"
                required
              />

              <FieldWithLock
                name="password"
                label="Password"
                type="password"
                placeholder="Leave blank to keep current"
              />

              <FieldWithLock
                name="phone"
                label="Phone Number"
                placeholder="+1 234 567 890"
                required
              />

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="role">
                    Role <span className="text-red-500">*</span>
                  </Label>
                  <button
                    type="button"
                    onClick={() => toggleFieldLock("role")}
                    className={`p-1 rounded transition-colors ${
                      unlockedFields.has("role")
                        ? "text-green-600 hover:bg-green-50"
                        : "text-gray-400 hover:bg-gray-100"
                    }`}
                    title={
                      unlockedFields.has("role")
                        ? "Lock field"
                        : "Unlock to edit"
                    }
                  >
                    {unlockedFields.has("role") ? (
                      <Unlock className="w-4 h-4" />
                    ) : (
                      <Lock className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  disabled={!unlockedFields.has("role")}
                  className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                    !unlockedFields.has("role")
                      ? "bg-gray-50 cursor-not-allowed"
                      : ""
                  }`}
                >
                  <option value="undefined">Undefined</option>
                  <option value="superAdmin">Super Admin</option>
                  <option value="subAdmin">Sub Admin</option>
                  <option value="editor">Editor</option>
                </select>
              </div>

              <FieldWithLock
                name="position"
                label="Position"
                placeholder="e.g. Marketing Manager"
              />

              <FieldWithLock
                name="employer_id"
                label="Employer ID"
                placeholder="EMP-001"
                required
              />

              <FieldWithLock
                name="secondaryPhoneNumber"
                label="Secondary Phone"
                placeholder="+1 987 654 321"
              />
            </div>

            <FieldWithLock
              name="address"
              label="Address"
              placeholder="123 Main St, City, Country"
            />

            {/* Active Status Toggle */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="isActive">Account Status</Label>
                <button
                  type="button"
                  onClick={() => toggleFieldLock("isActive")}
                  className={`p-1 rounded transition-colors ${
                    unlockedFields.has("isActive")
                      ? "text-green-600 hover:bg-green-50"
                      : "text-gray-400 hover:bg-gray-100"
                  }`}
                  title={
                    unlockedFields.has("isActive")
                      ? "Lock field"
                      : "Unlock to edit"
                  }
                >
                  {unlockedFields.has("isActive") ? (
                    <Unlock className="w-4 h-4" />
                  ) : (
                    <Lock className="w-4 h-4" />
                  )}
                </button>
              </div>
              <select
                id="isActive"
                name="isActive"
                value={formData.isActive.toString()}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    isActive: e.target.value === "true",
                  })
                }
                disabled={!unlockedFields.has("isActive")}
                className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                  !unlockedFields.has("isActive")
                    ? "bg-gray-50 cursor-not-allowed"
                    : ""
                }`}
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
              <p className="text-xs text-gray-500">
                Current status:{" "}
                <span
                  className={
                    formData.isActive ? "text-green-600" : "text-red-600"
                  }
                >
                  {formData.isActive ? "Active" : "Inactive"}
                </span>
              </p>
            </div>

            <div className="pt-4 flex justify-end gap-4 border-t border-gray-200">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading || unlockedFields.size === 0}
                className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Spinner className="w-4 h-4 mr-2" />
                    Updating...
                  </>
                ) : (
                  `Update ${unlockedFields.size} Field${
                    unlockedFields.size !== 1 ? "s" : ""
                  }`
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
