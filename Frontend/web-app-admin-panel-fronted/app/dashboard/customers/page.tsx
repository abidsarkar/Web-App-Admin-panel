"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/_components/ui/button";
import Pagination from "@/components/ui/Pagination";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";

import {
  useGetAllCustomersQuery,
  useDeactivateCustomerMutation,
  useDeleteCustomerMutation,
  useLazyExportCustomersQuery,
} from "@/redux/Features/customer/customerApi";

import CustomerTable from "@/components/customer/CustomerTable";
import CustomerFilters from "@/components/customer/CustomerFilters";
import CustomerDetailsModal from "@/components/customer/CustomerDetailsModal";

export default function CustomersPage() {
  // Filter States
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [isActive, setIsActive] = useState<boolean | string>("");
  const [sort, setSort] = useState("createdAt");
  const [order, setOrder] = useState("desc");

  // Modal States
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Queries & Mutations
  const { data, isLoading } = useGetAllCustomersQuery({
    page,
    limit,
    search,
    isActive,
    isDeleted: false, // Default to showing non-deleted
    sort,
    order,
  });

  const [deactivateCustomer] = useDeactivateCustomerMutation();
  const [deleteCustomer] = useDeleteCustomerMutation();
  const [exportCustomers] = useLazyExportCustomersQuery();

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleView = (customer: any) => {
    setSelectedCustomer(customer);
    setIsDetailsOpen(true);
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: `Do you want to ${
          currentStatus ? "deactivate" : "activate"
        } this customer?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: currentStatus ? "#d33" : "#10b981",
        cancelButtonColor: "#3085d6",
        confirmButtonText: `Yes, ${currentStatus ? "deactivate" : "activate"}!`,
      });

      if (result.isConfirmed) {
        await deactivateCustomer({
          _id: id,
          isActive: !currentStatus,
        }).unwrap();
        toast.success(
          `Customer ${currentStatus ? "deactivated" : "activated"} successfully`
        );
      }
    } catch (error) {
      console.error("Status toggle error:", error);
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this! The customer will be marked as deleted.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, delete it!",
      });

      if (result.isConfirmed) {
        await deleteCustomer({ _id: id }).unwrap();
        toast.success("Customer deleted successfully");
        // Reset to page 1 if current page becomes empty is handled partly by backend or user navigation
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete customer");
    }
  };

  const handleExport = async () => {
    try {
      const blob = await exportCustomers({}).unwrap();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `customers_export_${new Date().toISOString().split("T")[0]}.xlsx`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("Export downloaded successfully");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export customers");
    }
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Customers
          </h2>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-gray-500 dark:text-gray-400">
              Manage your customer base and view details.
            </p>
            {data?.data?.pagination?.total !== undefined && (
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300">
                {data.data.pagination.total} Total
              </span>
            )}
          </div>
        </div>
        <Button
          onClick={handleExport}
          variant="outline"
          className="bg-green-600 hover:bg-green-700 text-white hover:text-white border-transparent"
        >
          <Download className="w-4 h-4 mr-2" />
          Export Customers
        </Button>
      </div>

      <CustomerFilters
        search={search}
        setSearch={setSearch}
        limit={limit}
        setLimit={setLimit}
        isActive={isActive}
        setIsActive={setIsActive}
        sort={sort}
        setSort={setSort}
        order={order}
        setOrder={setOrder}
        onSearch={() => setPage(1)} // Reset page on new search
      />

      <CustomerTable
        customers={data?.data?.customer || []}
        isLoading={isLoading}
        onView={handleView}
        onDelete={handleDelete}
        onToggleStatus={handleToggleStatus}
      />

      {data?.data?.pagination && (
        <Pagination
          currentPage={data.data.pagination.page}
          totalPages={data.data.pagination.totalPages}
          onPageChange={handlePageChange}
          hasNextPage={
            data.data.pagination.page < data.data.pagination.totalPages
          }
          hasPrevPage={data.data.pagination.page > 1}
        />
      )}

      {selectedCustomer && (
        <CustomerDetailsModal
          isOpen={isDetailsOpen}
          onClose={() => setIsDetailsOpen(false)}
          customer={selectedCustomer}
        />
      )}
    </div>
  );
}
