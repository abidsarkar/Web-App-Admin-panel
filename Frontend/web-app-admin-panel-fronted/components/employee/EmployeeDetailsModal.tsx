"use client";

import { X, Edit } from "lucide-react";
import Image from "next/image";
import { useLazyGetEmployeeDetailsQuery } from "@/redux/Features/employee/employeeApi";
import { useEffect } from "react";
import { Spinner } from "@/_components/ui/spinner";

interface EmployeeDetailsModalProps {
  email: string | null;
  isOpen: boolean;
  onClose: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onEdit?: (employee: any) => void;
}

export default function EmployeeDetailsModal({
  email,
  isOpen,
  onClose,
  onEdit,
}: EmployeeDetailsModalProps) {
  const [getEmployeeDetails, { isLoading, data, error }] =
    useLazyGetEmployeeDetailsQuery();

  const employee = data?.data?.employer || null;

  useEffect(() => {
    if (isOpen && email) {
      getEmployeeDetails(email);
    }
  }, [isOpen, email, getEmployeeDetails]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl rounded-xl bg-white shadow-2xl max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors z-10"
        >
          <X className="h-6 w-6" />
        </button>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Spinner className="w-8 h-8 text-blue-600" />
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">
            Failed to load employee details.
          </div>
        ) : employee ? (
          <div className="p-8">
            <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6 mb-8">
              <div className="relative h-24 w-24 shrink-0 rounded-full overflow-hidden border-4 border-gray-100 shadow-sm">
                {employee.profilePicture?.filePathURL ? (
                  <Image
                    src={`http://localhost:5001/${employee.profilePicture.filePathURL.replace(
                      /^\.?\/?/,
                      ""
                    )}`}
                    alt={employee.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-blue-50 text-2xl font-bold text-blue-600">
                    {employee.name?.charAt(0)}
                  </div>
                )}
              </div>
              <div className="text-center sm:text-left">
                <h2 className="text-2xl font-bold text-gray-900">
                  {employee.name}
                </h2>
                <p className="text-gray-500">{employee.email}</p>
                <div className="mt-2 flex flex-wrap justify-center sm:justify-start gap-2">
                  <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                    {employee.role || "Employee"}
                  </span>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${
                      employee.isActive
                        ? "bg-green-50 text-green-700 ring-green-600/20"
                        : "bg-red-50 text-red-700 ring-red-600/20"
                    }`}
                  >
                    {employee.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-500">Employer ID</p>
                <p className="text-base font-medium text-gray-900">
                  {employee.employer_id || "N/A"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-500">Position</p>
                <p className="text-base font-medium text-gray-900">
                  {employee.position || "N/A"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-500">Phone</p>
                <p className="text-base font-medium text-gray-900">
                  {employee.phone || "N/A"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-500">
                  Secondary Phone
                </p>
                <p className="text-base font-medium text-gray-900">
                  {employee.secondaryPhoneNumber || "N/A"}
                </p>
              </div>
              <div className="space-y-1 sm:col-span-2">
                <p className="text-sm font-medium text-gray-500">Address</p>
                <p className="text-base font-medium text-gray-900">
                  {employee.address || "N/A"}
                </p>
              </div>
              <div className="space-y-1 sm:col-span-2">
                <p className="text-sm font-medium text-gray-500">Joined Date</p>
                <p className="text-base font-medium text-gray-900">
                  {employee.createdAt
                    ? new Date(employee.createdAt).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>
            </div>

            {onEdit && (
              <div className="mt-6 pt-6 border-t border-gray-200 flex justify-end">
                <button
                  onClick={() => {
                    onEdit(employee);
                    onClose();
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  Edit Employee
                </button>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
