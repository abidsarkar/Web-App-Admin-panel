import { useState } from "react";
import { useUpdateSubCategoryMutation } from "@/redux/Features/category/categoryApi";
import { Button } from "@/_components/ui/button";
import { Input } from "@/_components/ui/input";
import { Label } from "@/_components/ui/label";
import { Spinner } from "@/_components/ui/spinner";
import { X } from "lucide-react";

interface SubCategory {
  _id: string;
  subCategoryName: string;
  subCategoryId: string;
  categoryId: string;
  isDisplayed: boolean;
}

interface EditSubCategoryFormProps {
  subCategory: SubCategory;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function EditSubCategoryForm({
  subCategory,
  onClose,
  onSuccess,
}: EditSubCategoryFormProps) {
  const [updateSubCategory, { isLoading }] = useUpdateSubCategoryMutation();
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    subCategoryName: subCategory.subCategoryName,
    subCategoryId: subCategory.subCategoryId,
    categoryId: subCategory.categoryId,
    isDisplayed: subCategory.isDisplayed,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "isDisplayed" ? value === "true" : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (
      !formData.subCategoryName ||
      !formData.subCategoryId ||
      !formData.categoryId
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    try {
      const updateData = {
        _id: subCategory._id,
        newSubCategoryName: formData.subCategoryName,
        newSubCategoryId: formData.subCategoryId,
        newCategoryId: formData.categoryId,
        isDisplayed: formData.isDisplayed,
      };

      await updateSubCategory(updateData).unwrap();
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: unknown) {
      const errorMessage =
        (err as { data?: { message?: string } })?.data?.message ||
        "Failed to update sub-category.";
      setError(errorMessage);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold">Edit Sub-Category</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="subCategoryName">
                Sub-Category Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="subCategoryName"
                name="subCategoryName"
                placeholder="e.g. Smartphones"
                value={formData.subCategoryName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subCategoryId">
                Sub-Category ID <span className="text-red-500">*</span>
              </Label>
              <Input
                id="subCategoryId"
                name="subCategoryId"
                placeholder="e.g. su001"
                value={formData.subCategoryId}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="categoryId">
                Parent Category ID <span className="text-red-500">*</span>
              </Label>
              <Input
                id="categoryId"
                name="categoryId"
                placeholder="e.g. c001"
                value={formData.categoryId}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="isDisplayed">Display Status</Label>
              <select
                id="isDisplayed"
                name="isDisplayed"
                value={String(formData.isDisplayed)}
                onChange={handleChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="true">Displayed</option>
                <option value="false">Hidden</option>
              </select>
            </div>

            <div className="flex justify-end gap-4 pt-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Spinner className="w-4 h-4 mr-2" />
                    Updating...
                  </>
                ) : (
                  "Update Sub-Category"
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
