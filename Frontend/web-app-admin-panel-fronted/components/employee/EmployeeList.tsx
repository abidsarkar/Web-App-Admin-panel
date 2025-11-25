"use client";

import { useState, useEffect } from "react";
import {
  useGetEmployeesQuery,
  useGetEmployeesSuperAdminQuery,
  useDeleteEmployeeMutation,
} from "@/redux/features/employee/employeeApi";
import { Button } from "@/_components/ui/button";
import { Trash2, Edit, Eye, Search } from "lucide-react";
import { Input } from "@/_components/ui/input";
import { Spinner } from "@/_components/ui/spinner";
import Image from "next/image";
import EmployeeDetailsModal from "@/app/dashboard/employees/employee-details-modal";

interface Employee {
  _id: string;
  name: string;
  email: string;
  role: string;
  position?: string;
  isActive: boolean;
  profilePicture?: {
    filePathURL: string;
  };
  phone?: string;
  secondaryPhoneNumber?: string;
  address?: string;
  employer_id?: string;
  createdAt?: string;
}

interface EmployeeListProps {
  listType: "normal" | "super";
  onTotalCountChange?: (count: number) => void;
}

export default function EmployeeList({
  listType,
  onTotalCountChange,
}: EmployeeListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  const queryParams = {
    page,
    limit,
    search: searchTerm,
    isActive: true,
    sort: "createdAt",
    order: "asc",
  };

  const isSuperList = listType === "super";

  const {
    data: normalData,
    isLoading: isNormalLoading,
    error: normalError,
  } = useGetEmployeesQuery(queryParams, { skip: isSuperList });

  const {
    data: superData,
    isLoading: isSuperLoading,
    error: superError,
  } = useGetEmployeesSuperAdminQuery(queryParams, { skip: !isSuperList });

  const [deleteEmployee] = useDeleteEmployeeMutation();

  const data = isSuperList ? superData : normalData;
  const isLoading = isSuperList ? isSuperLoading : isNormalLoading;
  const error = isSuperList ? superError : normalError;

  const employees: Employee[] = data?.data?.employer || [];
  const pagination = data?.data?.pagination;

  // Update total count in parent
  useEffect(() => {
    if (pagination?.total !== undefined && onTotalCountChange) {
      onTotalCountChange(pagination.total);
    }
  }, [pagination?.total, onTotalCountChange]);

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this employee?")) {
      try {
        await deleteEmployee(id).unwrap();
      } catch (error) {
        console.error("Failed to delete employee", error);
        alert("Failed to delete employee");
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 bg-white p-2 rounded-lg border border-gray-200 shadow-sm max-w-md">
        <Search className="w-5 h-5 text-gray-400" />
        <Input
          placeholder="Search employees..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 flex justify-center">
            <Spinner className="w-8 h-8 text-blue-600" />
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">
            Failed to load employees.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3">Image</th>
                  <th className="px-6 py-3">Name</th>
                  <th className="px-6 py-3">Email</th>
                  <th className="px-6 py-3">Role</th>
                  <th className="px-6 py-3">Position</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      No employees found.
                    </td>
                  </tr>
                ) : (
                  employees.map((employee) => (
                    <tr
                      key={employee._id}
                      className="bg-white border-b hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        {employee.profilePicture?.filePathURL ? (
                          <div className="relative w-10 h-10 rounded-full overflow-hidden">
                            <Image
                              src={`http://localhost:5001/${employee.profilePicture.filePathURL.replace(
                                /^\.?\/?/,
                                ""
                              )}`}
                              alt={employee.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                            {employee.name.charAt(0)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {employee.name}
                      </td>
                      <td className="px-6 py-4">{employee.email}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {employee.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">{employee.position || "-"}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            employee.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {employee.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:text-blue-600"
                          onClick={() => {
                            setSelectedEmployee(employee);
                            setIsModalOpen(true);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="w-4 h-4 text-gray-500" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:text-red-600"
                          onClick={() => handleDelete(employee._id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          <Button
            variant="outline"
            disabled={!pagination.hasPrevPage}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </Button>
          <span className="flex items-center px-4 text-sm text-gray-600">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            disabled={!pagination.hasNextPage}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}

      <EmployeeDetailsModal
        employee={selectedEmployee}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
