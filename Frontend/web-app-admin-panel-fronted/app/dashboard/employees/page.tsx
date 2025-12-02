"use client";

import { useState, useEffect } from "react";
import Button from "@/components/ui/button/Button";
import { Plus, Download } from "lucide-react";
import Link from "next/link";
import {
  useGetEmployeesQuery,
  useGetEmployeesSuperAdminQuery,
  useDeleteEmployeeMutation,
  useLazyExportEmployeesQuery,
} from "@/redux/Features/employee/employeeApi";
import EmployeeTable from "@/components/employee/EmployeeTable";
import EmployeeFilters from "@/components/employee/EmployeeFilters";
import Pagination from "@/components/ui/Pagination";
import EmployeeDetailsModal from "@/components/employee/EmployeeDetailsModal";
import EditEmployeeForm from "@/components/employee/EditEmployeeForm";
import AccessDenied from "@/components/common/AccessDenied";
import { toast } from "react-hot-toast";

export default function EmployeesPage() {
  const [role, setRole] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"normal" | "super">("normal");

  // Filter State
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [isActive, setIsActive] = useState<boolean | string>(true);
  const [sort, setSort] = useState("createdAt");
  const [order, setOrder] = useState("desc");

  // Modal State
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Fetch Data
  const queryParams = {
    page,
    limit,
    search,
    isActive,
    sort,
    order,
  };

  const {
    data: normalData,
    isLoading: isNormalLoading,
    refetch: refetchNormal,
  } = useGetEmployeesQuery(queryParams, {
    skip: activeTab !== "normal",
  });

  const {
    data: superData,
    isLoading: isSuperLoading,
    refetch: refetchSuper,
  } = useGetEmployeesSuperAdminQuery(queryParams, {
    skip: activeTab !== "super",
  });

  const [deleteEmployee] = useDeleteEmployeeMutation();
  const [triggerExport] = useLazyExportEmployeesQuery();

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setRole(user.role || "");
      } catch (e) {
        console.error("Failed to parse user", e);
      }
    }
  }, []);

  const isSuperAdmin = role === "superAdmin";

  // Handle Tab Change
  const handleTabChange = (tab: "normal" | "super") => {
    setActiveTab(tab);
    setPage(1); // Reset page on tab change
    setSearch(""); // Optional: reset filters
  };

  // Handle Search
  const handleSearch = () => {
    setPage(1);
    if (activeTab === "normal") refetchNormal();
    else refetchSuper();
  };

  // Handle View
  const handleView = (email: string) => {
    setSelectedEmail(email);
    setIsModalOpen(true);
  };

  // Handle Edit
  const handleEdit = (employee: any) => {
    setSelectedEmployee(employee);
    setIsEditModalOpen(true);
  };

  // Handle Delete
  // Handle Delete
  const handleDelete = async (data: { email: string; employer_id: string }) => {
    if (window.confirm("Are you sure you want to delete this employee?")) {
      try {
        await deleteEmployee(data).unwrap();
        toast.success("Employee deleted successfully");
      } catch (err) {
        toast.error("Failed to delete employee");
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
      a.download = "employees.xlsx"; // Or .csv depending on backend
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Employees exported successfully");
    } catch (err) {
      console.error("Export failed:", err);
      toast.error("Failed to export employees");
    }
  };

  // Normalize Data
  const currentData = activeTab === "normal" ? normalData : superData;
  const employees = currentData?.data?.employer || [];
  const pagination = currentData?.data?.pagination || {
    page: 1,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  };

  if (!role) return <div className="p-8 text-center">Loading...</div>;

  if (!isSuperAdmin) {
    return <AccessDenied />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Employees</h2>
          <p className="text-muted-foreground">
            Manage your organization&apos;s staff members.
          </p>
        </div>
        <Link href="/dashboard/employees/create">
          <Button className="bg-blue-600 hover:bg-blue-500">
            <Plus className="w-4 h-4 mr-2" />
            Add Employee
          </Button>
        </Link>
        <Button
          onClick={handleExport}
          className="bg-green-600 hover:bg-green-500"
        >
          <Download className="w-4 h-4 mr-2" />
          Export Employees
        </Button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => handleTabChange("normal")}
            className={`${
              activeTab === "normal"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Employees
          </button>
          <button
            onClick={() => handleTabChange("super")}
            className={`${
              activeTab === "super"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Super Admins
          </button>
        </nav>
      </div>

      {/* Filters */}
      <EmployeeFilters
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
        onSearch={handleSearch}
      />

      {/* Table */}
      <EmployeeTable
        employees={employees}
        isLoading={activeTab === "normal" ? isNormalLoading : isSuperLoading}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isSuperAdmin={isSuperAdmin}
      />

      {/* Pagination */}
      <Pagination
        currentPage={page}
        totalPages={pagination.totalPages}
        onPageChange={setPage}
        hasNextPage={pagination.hasNextPage}
        hasPrevPage={pagination.hasPrevPage}
      />

      {/* Details Modal */}
      <EmployeeDetailsModal
        email={selectedEmail}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onEdit={handleEdit}
      />

      {/* Edit Modal */}
      {isEditModalOpen && selectedEmployee && (
        <EditEmployeeForm
          employee={selectedEmployee}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedEmployee(null);
          }}
          onSuccess={() => {
            if (activeTab === "normal") refetchNormal();
            else refetchSuper();
          }}
        />
      )}
    </div>
  );
}
