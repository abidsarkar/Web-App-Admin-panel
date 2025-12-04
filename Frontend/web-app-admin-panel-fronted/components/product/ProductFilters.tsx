import { useState, useEffect } from "react";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";

interface ProductFiltersProps {
  search: string;
  setSearch: (value: string) => void;
  isSaleable: string | boolean;
  setIsSaleable: (value: string | boolean) => void;
  isDisplayable: string | boolean;
  setIsDisplayable: (value: string | boolean) => void;
  categoryId: string;
  setCategoryId: (value: string) => void;
  subCategoryId: string;
  setSubCategoryId: (value: string) => void;
  sort: string;
  setSort: (value: string) => void;
  order: string;
  setOrder: (value: string) => void;
  page: number;
  setPage: (value: number) => void;
  limit: number;
  setLimit: (value: number) => void;
  totalPages: number;
  onSearch: () => void;
}

export default function ProductFilters({
  search,
  setSearch,
  isSaleable,
  setIsSaleable,
  isDisplayable,
  setIsDisplayable,
  categoryId,
  setCategoryId,
  subCategoryId,
  setSubCategoryId,
  sort,
  setSort,
  order,
  setOrder,
  page,
  setPage,
  limit,
  setLimit,
  totalPages,
  onSearch,
}: ProductFiltersProps) {
  const [localSearch, setLocalSearch] = useState(search);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(localSearch);
    }, 500);
    return () => clearTimeout(timer);
  }, [localSearch, setSearch]);

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <div className="flex gap-2">
              <Input
                placeholder="Search products..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
              />
              <Button
                onClick={onSearch}
                className="bg-blue-600 hover:bg-blue-500"
              >
                <Search className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Category ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category ID
            </label>
            <Input
              placeholder="e.g. c001"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            />
          </div>

          {/* Sub-Category ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sub-Category ID
            </label>
            <Input
              placeholder="e.g. su001"
              value={subCategoryId}
              onChange={(e) => setSubCategoryId(e.target.value)}
            />
          </div>

          {/* Saleable */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Saleable
            </label>
            <select
              value={String(isSaleable)}
              onChange={(e) => {
                const val = e.target.value;
                if (val === "true") setIsSaleable(true);
                else if (val === "false") setIsSaleable(false);
                else setIsSaleable("none");
              }}
              className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 font-medium outline-none transition focus:border-primary active:border-primary"
            >
              <option value="none">All</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>

          {/* Displayable */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Displayable
            </label>
            <select
              value={String(isDisplayable)}
              onChange={(e) => {
                const val = e.target.value;
                if (val === "true") setIsDisplayable(true);
                else if (val === "false") setIsDisplayable(false);
                else setIsDisplayable("none");
              }}
              className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 font-medium outline-none transition focus:border-primary active:border-primary"
            >
              <option value="none">All</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>

          {/* Sort */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sort By
            </label>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 font-medium outline-none transition focus:border-primary active:border-primary"
            >
              <option value="productPrice">Price</option>
              <option value="productName">Name</option>
              <option value="productStock">Stock</option>
              <option value="createdAt">Created Date</option>
            </select>
          </div>

          {/* Order */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Order
            </label>
            <select
              value={order}
              onChange={(e) => setOrder(e.target.value)}
              className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 font-medium outline-none transition focus:border-primary active:border-primary"
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>
        </div>
      </div>

      {/* Pagination */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">
            Items per page:
          </label>
          <select
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            className="rounded-lg border-[1.5px] border-stroke bg-transparent px-3 py-2 font-medium outline-none transition focus:border-primary"
          >
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm text-gray-700">
            Page {page} of {totalPages || 1}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(page + 1)}
            disabled={page >= totalPages}
            className="disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
