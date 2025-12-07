"use client";

import { Eye, Trash2, Power } from "lucide-react";
import { Button } from "@/_components/ui/button";
import { baseUrl_public_image } from "@/utils/baseUrl";
import ProfileImage from "@/components/ui/ProfileImage";
import { format } from "date-fns";

interface Customer {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: string;
  isActive: boolean;
  isDeleted: boolean;
  createdAt?: string;
  profilePicture?: {
    filePathURL: string;
  };
}

interface CustomerTableProps {
  customers: Customer[];
  isLoading: boolean;
  onView: (customer: Customer) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string, currentStatus: boolean) => void;
}

export default function CustomerTable({
  customers,
  isLoading,
  onView,
  onDelete,
  onToggleStatus,
}: CustomerTableProps) {
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

  if (!customers?.length) {
    return (
      <div className="w-full bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
        <p className="text-gray-500">No customers found.</p>
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
                Contact
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
            {customers.map((customer) => (
              <tr key={customer._id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="relative h-10 w-10 overflow-hidden rounded-full border border-gray-200">
                    <ProfileImage
                      src={
                        customer.profilePicture?.filePathURL
                          ? `${baseUrl_public_image}/${customer.profilePicture.filePathURL}`
                          : "/demoImage/profile-picture-placeholder.png"
                      }
                      alt={`${customer.firstName} ${customer.lastName}`}
                      className="h-full w-full object-cover"
                    />
                  </div>
                </td>
                <td className="px-6 py-4 font-medium text-gray-900">
                  {customer.firstName} {customer.lastName}
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span>{customer.email}</span>
                    <span className="text-xs text-gray-400">
                      {customer.phone || "-"}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${
                      customer.isActive
                        ? "bg-green-50 text-green-700 ring-green-600/20"
                        : "bg-red-50 text-red-700 ring-red-600/20"
                    }`}
                  >
                    {customer.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {customer.createdAt
                    ? format(new Date(customer.createdAt), "MMM d, yyyy")
                    : "N/A"}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onView(customer)}
                      className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-transparent hover:border-blue-200"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        onToggleStatus(customer._id, customer.isActive)
                      }
                      className={`h-8 w-8 p-0 border-transparent ${
                        customer.isActive
                          ? "text-orange-600 hover:text-orange-700 hover:bg-orange-50 hover:border-orange-200"
                          : "text-green-600 hover:text-green-700 hover:bg-green-50 hover:border-green-200"
                      }`}
                      title={customer.isActive ? "Deactivate" : "Activate"}
                    >
                      <Power className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDelete(customer._id)}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 border-transparent hover:border-red-200"
                      title="Delete Customer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
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
