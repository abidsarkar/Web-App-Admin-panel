import Button from "@/components/ui/button/Button";
import { Eye, Trash2 } from "lucide-react";
import Image from "next/image";

interface Employee {
  _id: string;
  name: string;
  email: string;
  role: string;
  position?: string;
  isActive: boolean;
  phone?: string;
  profilePicture?: {
    filePathURL: string;
  };
  createdAt?: string;
}

interface EmployeeTableProps {
  employees: Employee[];
  isLoading: boolean;
  onView: (email: string) => void;
  onDelete: (id: string) => void;
  isSuperAdmin: boolean;
}

export default function EmployeeTable({
  employees,
  isLoading,
  onView,
  onDelete,
  isSuperAdmin,
}: EmployeeTableProps) {
  if (isLoading) {
    return (
      <div className="w-full bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-100 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!employees?.length) {
    return (
      <div className="w-full bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
        <p className="text-gray-500">No employees found.</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-500">
          <thead className="bg-gray-50 text-xs uppercase text-gray-700">
            <tr>
              <th scope="col" className="px-6 py-3">
                Image
              </th>
              <th scope="col" className="px-6 py-3">
                Name
              </th>
              <th scope="col" className="px-6 py-3">
                Email
              </th>
              <th scope="col" className="px-6 py-3">
                Role
              </th>
              <th scope="col" className="px-6 py-3">
                Status
              </th>
              <th scope="col" className="px-6 py-3">
                Joined
              </th>
              <th scope="col" className="px-6 py-3 text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {employees.map((employee) => (
              <tr key={employee._id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="relative h-10 w-10 overflow-hidden rounded-full border border-gray-200">
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
                      <div className="flex h-full w-full items-center justify-center bg-blue-50 text-xs font-bold text-blue-600">
                        {employee.name?.charAt(0)}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 font-medium text-gray-900">
                  {employee.name}
                </td>
                <td className="px-6 py-4">{employee.email}</td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                    {employee.role || "Employee"}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${
                      employee.isActive
                        ? "bg-green-50 text-green-700 ring-green-600/20"
                        : "bg-red-50 text-red-700 ring-red-600/20"
                    }`}
                  >
                    {employee.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {employee.createdAt
                    ? new Date(employee.createdAt).toLocaleDateString()
                    : "N/A"}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onView(employee.email)}
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-transparent hover:border-blue-200"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    {isSuperAdmin && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDelete(employee._id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 border-transparent hover:border-red-200"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
