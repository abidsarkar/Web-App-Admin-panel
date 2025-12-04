"use client";

import { useState } from "react";
import {
  useGetCategoriesQuery,
  useDeleteCategoryMutation,
} from "@/redux/Features/category/categoryApi";
import Button from "@/components/ui/button/Button";
import { Plus } from "lucide-react";
import CategoryTable from "@/components/category/CategoryTable";
import CategoryFilters from "@/components/category/CategoryFilters";
import CreateCategoryForm from "@/components/category/CreateCategoryForm";
import EditCategoryForm from "@/components/category/EditCategoryForm";
import CategoryDetailsModal from "@/components/category/CategoryDetailsModal";
import { toast } from "react-hot-toast";

export default function CategoriesPage() {
  // Filter State
  const [categoryId, setCategoryId] = useState("");
  const [subCategory, setSubCategory] = useState<string | boolean>("none");
  const [isDisplayed, setIsDisplayed] = useState<string | boolean>("none");

  // Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedCategory, setSelectedCategory] = useState<any>(null);

  // Fetch Data
  const queryParams = {
    categoryId,
    subCategory,
    isDisplayed,
  };

  const {
    data: categoryData,
    isLoading,
    refetch,
  } = useGetCategoriesQuery(queryParams);

  const [deleteCategory] = useDeleteCategoryMutation();

  // Handle Search
  const handleSearch = () => {
    refetch();
  };

  // Handle View
  const handleView = (category: any) => {
    setSelectedCategory(category);
    setIsViewModalOpen(true);
  };

  // Handle Edit
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleEdit = (category: any) => {
    setSelectedCategory(category);
    setIsEditModalOpen(true);
  };

  // Handle Delete
  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        await deleteCategory(id).unwrap();
        toast.success("Category deleted successfully");
        refetch();
      } catch (err) {
        toast.error("Failed to delete category");
        console.error(err);
      }
    }
  };

  const categories = categoryData || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Categories</h2>
          <p className="text-muted-foreground">
            Manage product categories and sub-categories.
          </p>
        </div>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-500"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Category
        </Button>
      </div>

      {/* Filters */}
      <CategoryFilters
        categoryId={categoryId}
        setCategoryId={setCategoryId}
        subCategory={subCategory}
        setSubCategory={setSubCategory}
        isDisplayed={isDisplayed}
        setIsDisplayed={setIsDisplayed}
        onSearch={handleSearch}
      />

      {/* Table */}
      <CategoryTable
        categories={categories}
        isLoading={isLoading}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Create Modal */}
      {isCreateModalOpen && (
        <CreateCategoryForm
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={() => {
            refetch();
          }}
        />
      )}

      {/* Edit Modal */}
      {isEditModalOpen && selectedCategory && (
        <EditCategoryForm
          category={selectedCategory}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedCategory(null);
          }}
          onSuccess={() => {
            refetch();
          }}
        />
      )}

      {/* View Modal */}
      {isViewModalOpen && selectedCategory && (
        <CategoryDetailsModal
          category={selectedCategory}
          onClose={() => {
            setIsViewModalOpen(false);
            setSelectedCategory(null);
          }}
        />
      )}
    </div>
  );
}
