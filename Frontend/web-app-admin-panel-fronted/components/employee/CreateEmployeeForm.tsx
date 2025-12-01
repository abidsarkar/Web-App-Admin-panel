"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCreateEmployeeMutation } from "@/redux/Features/employee/employeeApi";
import { Button } from "@/_components/ui/button";
import { Input } from "@/_components/ui/input";
import { Label } from "@/_components/ui/label";
import { Spinner } from "@/_components/ui/spinner";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function CreateEmployeeForm() {
  const router = useRouter();
  const [createEmployee, { isLoading }] = useCreateEmployeeMutation();
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    role: "undefined",
    position: "",
    address: "",
    employer_id: "",
    secondaryPhoneNumber: "",
  });
  const [file, setFile] = useState<File | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const isFormValid = () => {
    return (
      formData.name.trim() !== "" &&
      formData.email.trim() !== "" &&
      formData.password.trim() !== "" &&
      formData.phone.trim() !== "" &&
      formData.employer_id.trim() !== ""
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!isFormValid()) {
      setError("Please fill in all required fields.");
      return;
    }

    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        data.append(key, value);
      });
      if (file) {
        data.append("profilePicture", file);
      }

      await createEmployee(data).unwrap();
      router.push("/dashboard/employees");
    } catch (err: unknown) {
      const errorMessage =
        (err as { data?: { message?: string } })?.data?.message ||
        "Failed to create employee.";
      setError(errorMessage);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link
          href="/dashboard/employees"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 transition-colors mb-2"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Employees
        </Link>
        <h2 className="text-3xl font-bold tracking-tight">Add New Employee</h2>
        <p className="text-muted-foreground">
          Create a new account for a staff member.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 text-sm">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-white p-6 rounded-xl shadow-sm border border-gray-200"
      >
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">
              Full Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              name="name"
              placeholder="John Doe"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">
              Email Address <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="john@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">
              Password <span className="text-red-500">*</span>
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">
              Phone Number <span className="text-red-500">*</span>
            </Label>
            <Input
              id="phone"
              name="phone"
              placeholder="+1 234 567 890"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">
              Role<span className="text-red-500">*</span>
            </Label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="undefined">Undefined</option>
              <option value="superAdmin">Super Admin</option>
              <option value="subAdmin">Sub Admin</option>
              <option value="editor">Editor</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="position">
              Position<span className="text-red-500">*</span>
            </Label>
            <Input
              id="position"
              name="position"
              placeholder="e.g. Marketing Manager"
              value={formData.position}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="employer_id">
              Employer ID <span className="text-red-500">*</span>
            </Label>
            <Input
              id="employer_id"
              name="employer_id"
              placeholder="EMP-001"
              value={formData.employer_id}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="secondaryPhoneNumber">
              Secondary Phone <span className="text-red-500">*</span>
            </Label>
            <Input
              id="secondaryPhoneNumber"
              name="secondaryPhoneNumber"
              placeholder="+1 987 654 321"
              value={formData.secondaryPhoneNumber}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">
            Address <span className="text-red-500">*</span>
          </Label>
          <Input
            id="address"
            name="address"
            placeholder="123 Main St, City, Country"
            value={formData.address}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="profilePicture">
            Profile Picture <span className="text-red-500">*</span>
          </Label>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Input
                id="profilePicture"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="cursor-pointer"
                required
              />
            </div>
          </div>
        </div>

        <div className="pt-4 flex justify-end gap-4">
          <Link href="/dashboard/employees">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={isLoading || !isFormValid()}
            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Spinner className="w-4 h-4 mr-2" />
                Creating...
              </>
            ) : (
              "Create Employee"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
