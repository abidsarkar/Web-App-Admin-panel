import Button from "@/components/ui/button/Button";
import { Trash2, Edit } from "lucide-react";

interface SubCategory {
  _id: string;
  subCategoryName: string;
  subCategoryId: string;
  categoryName: string;
  isDisplayed: boolean;
}

interface SubCategoryTableProps {
  subCategories: SubCategory[];
  isLoading: boolean;
  onEdit: (subCategory: SubCategory) => void;
  onDelete: (subCategoryId: string) => void;
}

export default function SubCategoryTable({
  subCategories,
  isLoading,
  onEdit,
  onDelete,
}: SubCategoryTableProps) {
  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">Loading...</div>;
  }

  if (!subCategories || subCategories.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500 bg-white rounded-lg border border-gray-200">
        No sub-categories found.
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 font-medium">Sub Category Name</th>
              <th className="px-6 py-3 font-medium">Sub Category ID</th>
              <th className="px-6 py-3 font-medium">Parent Category</th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {subCategories.map((subCategory) => (
              <tr
                key={subCategory._id}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-6 py-4 font-medium text-gray-900">
                  {subCategory.subCategoryName}
                </td>
                <td className="px-6 py-4 text-gray-500">
                  {subCategory.subCategoryId}
                </td>
                <td className="px-6 py-4 text-gray-500">
                  {subCategory.categoryName}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${
                      subCategory.isDisplayed
                        ? "bg-green-50 text-green-700 ring-green-600/20"
                        : "bg-red-50 text-red-700 ring-red-600/20"
                    }`}
                  >
                    {subCategory.isDisplayed ? "Displayed" : "Hidden"}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(subCategory)}
                      className="text-green-600 hover:text-green-700 hover:bg-green-50 border-transparent hover:border-green-200"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDelete(subCategory.subCategoryId)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 border-transparent hover:border-red-200"
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
