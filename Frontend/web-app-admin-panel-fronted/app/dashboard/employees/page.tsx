"use client";

import { useState, useEffect } from "react";
import { Button } from "@/_components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import EmployeeList from "@/components/employee/EmployeeList";

export default function EmployeesPage() {
  const [role, setRole] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"normal" | "super">("normal");
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    // Get user role from localStorage
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setRole(user.role || "");
      } catch (e) {
        console.error("Failed to parse user from local storage", e);
      }
    }
  }, []);

  const isSuperAdmin = role === "superAdmin";

  if (!role) {
    return (
      <div className="p-8 flex justify-center">
        <div className="animate-pulse text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!isSuperAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
        <div className="bg-red-50 text-red-600 p-4 rounded-full mb-4">
          <svg
            className="w-8 h-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
        <p className="text-gray-500 max-w-md">
          You do not have permission to view this page. Only Super Admins can
          manage employees.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-bold tracking-tight">Employees</h2>
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              Total: {totalCount}
            </span>
          </div>
          <p className="text-muted-foreground">
            Manage your organization&apos;s staff members.
          </p>
        </div>
        <Link href="/dashboard/employees/create">
          <Button className="bg-blue-600 hover:bg-blue-500">
            <Plus className="w-4 h-4 mr-2" />
            Add Employee
          </Button>
        </Link>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab("normal")}
            className={`${
              activeTab === "normal"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Employees
          </button>
          <button
            onClick={() => setActiveTab("super")}
            className={`${
              activeTab === "super"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Super Admins
          </button>
        </nav>
      </div>

      <EmployeeList listType={activeTab} onTotalCountChange={setTotalCount} />
    </div>
  );
}
