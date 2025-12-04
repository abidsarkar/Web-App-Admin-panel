import { X } from "lucide-react";
import { Button } from "@/_components/ui/button";

interface CategoryDetailsModalProps {
  category: any;
  onClose: () => void;
}

export default function CategoryDetailsModal({
  category,
  onClose,
}: CategoryDetailsModalProps) {
  if (!category) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold">Category Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">
                Category Name
              </label>
              <p className="text-gray-900 font-medium mt-1">
                {category.categoryName}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">
                Category ID
              </label>
              <p className="text-gray-900 font-medium mt-1">
                {category.categoryId}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">
                Display Status
              </label>
              <p className="mt-1">
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${
                    category.isDisplayed
                      ? "bg-green-50 text-green-700 ring-green-600/20"
                      : "bg-red-50 text-red-700 ring-red-600/20"
                  }`}
                >
                  {category.isDisplayed ? "Displayed" : "Hidden"}
                </span>
              </p>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Metadata
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wider">
                  Created By
                </label>
                <div className="mt-1 text-sm text-gray-700">
                  <p>Email: {category.createdBy?.email || "N/A"}</p>
                  <p>Role: {category.createdBy?.role || "N/A"}</p>
                </div>
              </div>
              {category.updatedBy && (
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wider">
                    Updated By
                  </label>
                  <div className="mt-1 text-sm text-gray-700">
                    <p>Email: {category.updatedBy.email}</p>
                    <p>Role: {category.updatedBy.role}</p>
                    <p>
                      At:{" "}
                      {new Date(category.updatedBy.updatedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wider">
                    Created At
                  </label>
                  <p className="mt-1 text-sm text-gray-700">
                    {new Date(category.createdAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wider">
                    Last Updated
                  </label>
                  <p className="mt-1 text-sm text-gray-700">
                    {new Date(category.updatedAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl flex justify-end">
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
