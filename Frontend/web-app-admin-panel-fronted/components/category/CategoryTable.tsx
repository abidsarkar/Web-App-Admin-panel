import Button from "@/components/ui/button/Button";
import { Trash2, Edit, Eye } from "lucide-react";

interface Category {
  _id: string;
  categoryName: string;
  categoryId: string;
  isDisplayed: boolean;
}

interface CategoryTableProps {
  categories: Category[];
  isLoading: boolean;
  onView: (category: Category) => void;
  onEdit: (category: Category) => void;
  onDelete: (categoryId: string) => void;
}

export default function CategoryTable({
  categories,
  isLoading,
  onView,
  onEdit,
  onDelete,
}: CategoryTableProps) {
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

  if (!categories?.length) {
    return (
      <div className="w-full bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
        <p className="text-gray-500">No categories found.</p>
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
                Category Name
              </th>
              <th scope="col" className="px-6 py-3">
                Category ID
              </th>
              <th scope="col" className="px-6 py-3">
                Display Status
              </th>
              <th scope="col" className="px-6 py-3 text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {categories.map((category) => (
              <tr key={category._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900">
                  {category.categoryName}
                </td>
                <td className="px-6 py-4">{category.categoryId}</td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${
                      category.isDisplayed
                        ? "bg-green-50 text-green-700 ring-green-600/20"
                        : "bg-red-50 text-red-700 ring-red-600/20"
                    }`}
                  >
                    {category.isDisplayed ? "Displayed" : "Hidden"}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onView(category)}
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-transparent hover:border-blue-200"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(category)}
                      className="text-green-600 hover:text-green-700 hover:bg-green-50 border-transparent hover:border-green-200"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDelete(category.categoryId)}
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
