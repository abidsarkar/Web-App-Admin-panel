"use client";

import { X } from "lucide-react";
import { Button } from "@/_components/ui/button";
import { baseUrl_public_image } from "@/utils/baseUrl";
import ProfileImage from "@/components/ui/ProfileImage";
import { format } from "date-fns";

interface CustomerDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  customer: any;
}

export default function CustomerDetailsModal({
  isOpen,
  onClose,
  customer,
}: CustomerDetailsModalProps) {
  if (!isOpen || !customer) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Customer Details
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Header with Profile Image & Basic Info */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-gray-100 dark:border-gray-700">
                <ProfileImage
                  src={
                    customer.profilePicture?.filePathURL
                      ? `${baseUrl_public_image}/${customer.profilePicture.filePathURL}`
                      : "/demoImage/profile-picture-placeholder.png"
                  }
                  alt={`${customer.firstName} ${customer.lastName}`}
                  className="w-full h-full object-cover"
                />
              </div>
              <span
                className={`absolute bottom-1 right-1 px-2.5 py-0.5 text-xs font-semibold rounded-full border-2 border-white dark:border-gray-800 ${
                  customer.isActive
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                }`}
              >
                {customer.isActive ? "Active" : "Inactive"}
              </span>
            </div>

            <div className="text-center sm:text-left flex-1">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {customer.firstName} {customer.lastName}
              </h2>
              <div className="space-y-1 text-gray-500 dark:text-gray-400 text-sm">
                <p>ID: {customer._id}</p>
                <p>Role: {customer.role}</p>
                <p>
                  Joined:{" "}
                  {customer.createdAt
                    ? format(new Date(customer.createdAt), "PPP")
                    : "N/A"}
                </p>
                <p>
                  Last Login:{" "}
                  {customer.lastLogin
                    ? format(new Date(customer.lastLogin), "PPP p")
                    : "Never"}
                </p>
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {/* Contact Information */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Contact Information
              </h4>
              <div className="space-y-3">
                <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
                  <span className="text-xs text-gray-500 block">Email</span>
                  <span className="text-gray-900 dark:text-white font-medium">
                    {customer.email}
                  </span>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
                  <span className="text-xs text-gray-500 block">Phone</span>
                  <span className="text-gray-900 dark:text-white font-medium">
                    {customer.phone || "N/A"}
                  </span>
                </div>
                {customer.secondaryPhoneNumber && (
                  <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
                    <span className="text-xs text-gray-500 block">
                      Secondary Phone
                    </span>
                    <span className="text-gray-900 dark:text-white font-medium">
                      {customer.secondaryPhoneNumber}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Address */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Address
              </h4>
              <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg space-y-2 text-sm text-gray-700 dark:text-gray-300">
                {customer.address ? (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Street:</span>
                      <span className="font-medium">
                        {customer.address.village_road_house_flat}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Upazila:</span>
                      <span className="font-medium">
                        {customer.address.upazila}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">District:</span>
                      <span className="font-medium">
                        {customer.address.district}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Division:</span>
                      <span className="font-medium">
                        {customer.address.division}
                      </span>
                    </div>
                  </>
                ) : (
                  <span className="text-gray-400 italic">
                    No address provided
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-100 dark:border-gray-700 flex justify-end">
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
