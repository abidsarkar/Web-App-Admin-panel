"use client";

import { useState } from "react";
import {
  useGetCategoriesQuery,
  useDeleteCategoryMutation,
  useGetSubCategoriesQuery,
  useDeleteSubCategoryMutation,
  useLazyExportCategoriesQuery,
} from "@/redux/Features/category/categoryApi";
import Button from "@/components/ui/button/Button";
import { Plus, Download } from "lucide-react";
import CategoryTable from "@/components/category/CategoryTable";
import CategoryFilters from "@/components/category/CategoryFilters";
import CreateCategoryForm from "@/components/category/CreateCategoryForm";
import EditCategoryForm from "@/components/category/EditCategoryForm";
import CategoryDetailsModal from "@/components/category/CategoryDetailsModal";
import SubCategoryTable from "@/components/category/SubCategoryTable";
import SubCategoryFilters from "@/components/category/SubCategoryFilters";
import CreateSubCategoryForm from "@/components/category/CreateSubCategoryForm";
import EditSubCategoryForm from "@/components/category/EditSubCategoryForm";
import { toast } from "react-hot-toast";

export default function CategoriesPage() {
  const [activeTab, setActiveTab] = useState<"categories" | "subcategories">(
    "categories"
  );

  // Category Filter State
  const [categoryId, setCategoryId] = useState("");
  const [subCategory, setSubCategory] = useState<string | boolean>("none");
  const [isDisplayed, setIsDisplayed] = useState<string | boolean>("none");

  // Sub-Category Filter State
  const [subCategoryId, setSubCategoryId] = useState("");
  const [category, setCategory] = useState<string | boolean>("none");
  const [subIsDisplayed, setSubIsDisplayed] = useState<string | boolean>(
    "none"
  );

  // Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedSubCategory, setSelectedSubCategory] = useState<any>(null);

  // Fetch Category Data
  const categoryQueryParams = {
    categoryId,
    subCategory,
    isDisplayed,
  };

  const {
    data: categoryData,
    isLoading: isCategoryLoading,
    refetch: refetchCategories,
  } = useGetCategoriesQuery(categoryQueryParams);

  const [deleteCategory] = useDeleteCategoryMutation();

  // Fetch Sub-Category Data
  const subCategoryQueryParams = {
    subCategoryId,
    category,
    isDisplayed: subIsDisplayed,
  };

  const {
    data: subCategoryData,
    isLoading: isSubCategoryLoading,
    refetch: refetchSubCategories,
  } = useGetSubCategoriesQuery(subCategoryQueryParams);

  const [deleteSubCategory] = useDeleteSubCategoryMutation();
  const [triggerExport] = useLazyExportCategoriesQuery();

  // Handle Search
  const handleCategorySearch = () => {
    refetchCategories();
  };

  const handleSubCategorySearch = () => {
    refetchSubCategories();
  };

  // Handle View (Category only)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleCategoryView = (category: any) => {
    setSelectedCategory(category);
    setIsViewModalOpen(true);
  };

  // Handle Edit
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleCategoryEdit = (category: any) => {
    setSelectedCategory(category);
    setIsEditModalOpen(true);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSubCategoryEdit = (subCategory: any) => {
    setSelectedSubCategory(subCategory);
    setIsEditModalOpen(true);
  };

  // Handle Delete
  const handleCategoryDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        await deleteCategory(id).unwrap();
        toast.success("Category deleted successfully");
        refetchCategories();
      } catch (err) {
        toast.error("Failed to delete category");
        console.error(err);
      }
    }
  };

  const handleSubCategoryDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this sub-category?")) {
      try {
        await deleteSubCategory(id).unwrap();
        toast.success("Sub-category deleted successfully");
        refetchSubCategories();
      } catch (err) {
        toast.error("Failed to delete sub-category");
        console.error(err);
      }
    }
  };

  // Handle Export
  const handleExport = async () => {
    try {
      const blob = await triggerExport(undefined).unwrap();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "categories.xlsx";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Categories exported successfully");
    } catch (err) {
      console.error("Export failed:", err);
      toast.error("Failed to export categories");
    }
  };

  const categories = categoryData || [];
  const subCategories = subCategoryData || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Categories</h2>
          <p className="text-muted-foreground">
            Manage product categories and sub-categories.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleExport}
            className="bg-green-600 hover:bg-green-500"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-500"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add {activeTab === "categories" ? "Category" : "Sub-Category"}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("categories")}
            className={`${
              activeTab === "categories"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Categories
          </button>
          <button
            onClick={() => setActiveTab("subcategories")}
            className={`${
              activeTab === "subcategories"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Sub-Categories
          </button>
        </nav>
      </div>

      {/* Categories Tab */}
      {activeTab === "categories" && (
        <>
          <CategoryFilters
            categoryId={categoryId}
            setCategoryId={setCategoryId}
            subCategory={subCategory}
            setSubCategory={setSubCategory}
            isDisplayed={isDisplayed}
            setIsDisplayed={setIsDisplayed}
            onSearch={handleCategorySearch}
          />
          <CategoryTable
            categories={categories}
            isLoading={isCategoryLoading}
            onView={handleCategoryView}
            onEdit={handleCategoryEdit}
            onDelete={handleCategoryDelete}
          />
        </>
      )}

      {/* Sub-Categories Tab */}
      {activeTab === "subcategories" && (
        <>
          <SubCategoryFilters
            subCategoryId={subCategoryId}
            setSubCategoryId={setSubCategoryId}
            category={category}
            setCategory={setCategory}
            isDisplayed={subIsDisplayed}
            setIsDisplayed={setSubIsDisplayed}
            onSearch={handleSubCategorySearch}
          />
          <SubCategoryTable
            subCategories={subCategories}
            isLoading={isSubCategoryLoading}
            onEdit={handleSubCategoryEdit}
            onDelete={handleSubCategoryDelete}
          />
        </>
      )}

      {/* Create Modal */}
      {isCreateModalOpen && activeTab === "categories" && (
        <CreateCategoryForm
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={() => {
            refetchCategories();
          }}
        />
      )}

      {isCreateModalOpen && activeTab === "subcategories" && (
        <CreateSubCategoryForm
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={() => {
            refetchSubCategories();
          }}
        />
      )}

      {/* Edit Modal */}
      {isEditModalOpen && selectedCategory && activeTab === "categories" && (
        <EditCategoryForm
          category={selectedCategory}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedCategory(null);
          }}
          onSuccess={() => {
            refetchCategories();
          }}
        />
      )}

      {isEditModalOpen &&
        selectedSubCategory &&
        activeTab === "subcategories" && (
          <EditSubCategoryForm
            subCategory={selectedSubCategory}
            onClose={() => {
              setIsEditModalOpen(false);
              setSelectedSubCategory(null);
            }}
            onSuccess={() => {
              refetchSubCategories();
            }}
          />
        )}

      {/* View Modal (Category only) */}
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
