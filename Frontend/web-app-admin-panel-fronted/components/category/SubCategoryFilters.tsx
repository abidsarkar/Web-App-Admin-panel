import { useState, useEffect } from "react";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import { Search } from "lucide-react";

interface SubCategoryFiltersProps {
  subCategoryId: string;
  setSubCategoryId: (value: string) => void;
  category: string | boolean;
  setCategory: (value: string | boolean) => void;
  isDisplayed: string | boolean;
  setIsDisplayed: (value: string | boolean) => void;
  onSearch: () => void;
}

export default function SubCategoryFilters({
  subCategoryId,
  setSubCategoryId,
  category,
  setCategory,
  isDisplayed,
  setIsDisplayed,
  onSearch,
}: SubCategoryFiltersProps) {
  const [localSubCategoryId, setLocalSubCategoryId] = useState(subCategoryId);

  // Debounce subCategoryId search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSubCategoryId(localSubCategoryId);
    }, 500);

    return () => clearTimeout(timer);
  }, [localSubCategoryId, setSubCategoryId]);

  // Sync local state if parent changes
  useEffect(() => {
    if (subCategoryId !== localSubCategoryId) {
      setLocalSubCategoryId(subCategoryId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subCategoryId]);

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        {/* Sub Category ID Search */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Sub Category ID
          </label>
          <div className="flex gap-2">
            <Input
              placeholder="Search by Sub Category ID..."
              value={localSubCategoryId}
              onChange={(e) => setLocalSubCategoryId(e.target.value)}
            />
            <Button
              onClick={() => {
                setSubCategoryId(localSubCategoryId);
                onSearch();
              }}
              className="bg-blue-600 hover:bg-blue-500"
            >
              <Search className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Category Filter (Boolean) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Has Parent Category
          </label>
          <select
            value={String(category)}
            onChange={(e) => {
              const val = e.target.value;
              if (val === "true") setCategory(true);
              else if (val === "false") setCategory(false);
              else setCategory("none");
            }}
            className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
          >
            <option value="none">None</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </div>

        {/* Display Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Display Status
          </label>
          <select
            value={String(isDisplayed)}
            onChange={(e) => {
              const val = e.target.value;
              if (val === "true") setIsDisplayed(true);
              else if (val === "false") setIsDisplayed(false);
              else setIsDisplayed("none");
            }}
            className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
          >
            <option value="none">None</option>
            <option value="true">Displayed</option>
            <option value="false">Hidden</option>
          </select>
        </div>
      </div>
    </div>
  );
}
