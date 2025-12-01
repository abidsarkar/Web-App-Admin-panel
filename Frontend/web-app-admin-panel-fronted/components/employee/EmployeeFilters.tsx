import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import { Search } from "lucide-react";

interface EmployeeFiltersProps {
  search: string;
  setSearch: (value: string) => void;
  limit: number;
  setLimit: (value: number) => void;
  isActive: string | boolean;
  setIsActive: (value: string | boolean) => void;
  sort: string;
  setSort: (value: string) => void;
  order: string;
  setOrder: (value: string) => void;
  onSearch: () => void;
}

export default function EmployeeFilters({
  search,
  setSearch,
  limit,
  setLimit,
  isActive,
  setIsActive,
  sort,
  setSort,
  order,
  setOrder,
  onSearch,
}: EmployeeFiltersProps) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 items-end">
        {/* Search */}
        <div className="lg:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Search
          </label>
          <div className="flex gap-2">
            <Input
              placeholder="Search by name, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Button
              onClick={onSearch}
              className="bg-blue-600 hover:bg-blue-500"
            >
              <Search className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Limit */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Limit
          </label>
          <select
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            value={String(isActive)}
            onChange={(e) => {
              const val = e.target.value;
              if (val === "true") setIsActive(true);
              else if (val === "false") setIsActive(false);
              else setIsActive("");
            }}
            className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
          >
            <option value="">All</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
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
            className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
          >
            <option value="createdAt">Created Date</option>
            <option value="name">Name</option>
            <option value="email">Email</option>
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
            className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
          >
            <option value="desc">Newest First</option>
            <option value="asc">Oldest First</option>
          </select>
        </div>
      </div>
    </div>
  );
}
