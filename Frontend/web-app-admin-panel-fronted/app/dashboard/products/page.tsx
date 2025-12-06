"use client";

import { useState } from "react";
import {
  useGetAllProductsQuery,
  useDeleteProductMutation,
  useLazyExportProductsQuery,
} from "@/redux/Features/product/productApi";
import Button from "@/components/ui/button/Button";
import { Plus, Download } from "lucide-react";
import ProductTable from "@/components/product/ProductTable";
import ProductFilters from "@/components/product/ProductFilters";
import CreateProductForm from "@/components/product/CreateProductForm";
import EditProductForm from "@/components/product/EditProductForm";
import ProductDetailsModal from "@/components/product/ProductDetailsModal";
import { toast } from "react-hot-toast";

export default function ProductsPage() {
  // Filter State
  const [search, setSearch] = useState("");
  const [isSaleable, setIsSaleable] = useState<string | boolean>("none");
  const [isDisplayable, setIsDisplayable] = useState<string | boolean>("none");
  const [categoryId, setCategoryId] = useState("");
  const [subCategoryId, setSubCategoryId] = useState("");
  const [sort, setSort] = useState("productPrice");
  const [order, setOrder] = useState("desc");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  // Fetch Data
  const queryParams = {
    page,
    limit,
    sort,
    order,
    search,
    isSaleable,
    isDisplayable,
    categoryId,
    subCategoryId,
  };

  const { data, isLoading, refetch } = useGetAllProductsQuery(queryParams);

  const [deleteProduct] = useDeleteProductMutation();
  const [triggerExport] = useLazyExportProductsQuery();

  // Handle Search
  const handleSearch = () => {
    refetch();
  };

  // Handle View
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleView = (product: any) => {
    setSelectedProduct(product);
    setIsViewModalOpen(true);
  };

  // Handle Edit
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleEdit = (product: any) => {
    setSelectedProduct(product);
    setIsEditModalOpen(true);
  };

  // Handle Delete
  const handleDelete = async (_id: string) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteProduct(_id).unwrap();
        toast.success("Product deleted successfully");
        refetch();
      } catch (err) {
        toast.error("Failed to delete product");
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
      a.download = "products.xlsx";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Products exported successfully");
    } catch (err) {
      console.error("Export failed:", err);
      toast.error("Failed to export products");
    }
  };

  const products = data?.product || [];
  const pagination = data?.pagination || { page: 1, totalPages: 1 };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Products</h2>
          <p className="text-muted-foreground">
            Manage your product inventory.
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
            Add Product
          </Button>
        </div>
      </div>

      {/* Filters */}
      <ProductFilters
        search={search}
        setSearch={setSearch}
        isSaleable={isSaleable}
        setIsSaleable={setIsSaleable}
        isDisplayable={isDisplayable}
        setIsDisplayable={setIsDisplayable}
        categoryId={categoryId}
        setCategoryId={setCategoryId}
        subCategoryId={subCategoryId}
        setSubCategoryId={setSubCategoryId}
        sort={sort}
        setSort={setSort}
        order={order}
        setOrder={setOrder}
        page={page}
        setPage={setPage}
        limit={limit}
        setLimit={setLimit}
        totalPages={pagination.totalPages}
        onSearch={handleSearch}
      />

      {/* Table */}
      <ProductTable
        products={products}
        isLoading={isLoading}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Create Modal */}
      {isCreateModalOpen && (
        <CreateProductForm
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={() => {
            refetch();
          }}
        />
      )}

      {/* Edit Modal */}
      {isEditModalOpen && selectedProduct && (
        <EditProductForm
          product={selectedProduct}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedProduct(null);
          }}
          onSuccess={() => {
            refetch();
          }}
        />
      )}

      {/* View Modal */}
      {isViewModalOpen && selectedProduct && (
        <ProductDetailsModal
          productId={selectedProduct._id}
          onClose={() => {
            setIsViewModalOpen(false);
            setSelectedProduct(null);
          }}
        />
      )}
    </div>
  );
}
