import { useState } from "react";
import { useCreateCategoryMutation } from "@/redux/Features/category/categoryApi";
import { Button } from "@/_components/ui/button";
import { Input } from "@/_components/ui/input";
import { Label } from "@/_components/ui/label";
import { Spinner } from "@/_components/ui/spinner";
import { X } from "lucide-react";

interface CreateCategoryFormProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export default function CreateCategoryForm({
  onClose,
  onSuccess,
}: CreateCategoryFormProps) {
  const [createCategory, { isLoading }] = useCreateCategoryMutation();
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    categoryName: "",
    categoryId: "",
    isDisplayed: true,
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

    if (!formData.categoryName || !formData.categoryId) {
      setError("Please fill in all required fields.");
      return;
    }

    try {
      await createCategory(formData).unwrap();
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: unknown) {
      const errorMessage =
        (err as { data?: { message?: string } })?.data?.message ||
        "Failed to create category.";
      setError(errorMessage);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold">Add New Category</h2>
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
              <Label htmlFor="categoryName">
                Category Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="categoryName"
                name="categoryName"
                placeholder="e.g. Electronics"
                value={formData.categoryName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="categoryId">
                Category ID <span className="text-red-500">*</span>
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
                    Creating...
                  </>
                ) : (
                  "Create Category"
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
