"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  ShoppingBag,
  Settings,
  LogOut,
  X,
  Tags,
  FileText,
} from "lucide-react";
import { useState, useEffect } from "react";
import { authService } from "@/lib/auth-service";
import { useLogoutMutation } from "@/redux/features/auth/authApi";
import Cookies from "js-cookie";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [logout] = useLogoutMutation();

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user) {
      setUserRole(user.role);
    }
  }, []);

  const handleLogout = async () => {
    try {
      await logout({}).unwrap();
    } catch (error) {
      console.error("Logout API call failed", error);
    } finally {
      // Always clean up client side even if API fails
      Cookies.remove("accessToken");
      localStorage.removeItem("user");
      localStorage.removeItem("accessToken"); // Clean up old one just in case
      router.push("/login");
    }
  };

  const routes = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      href: "/dashboard",
      color: "text-sky-500",
    },
    {
      label: "Employees",
      icon: Users,
      href: "/dashboard/employees",
      color: "text-violet-500",
      roles: ["superAdmin"],
    },
    {
      label: "Products",
      icon: ShoppingBag,
      href: "/dashboard/products",
      color: "text-pink-700",
      roles: ["superAdmin", "subAdmin", "editor"],
    },
    {
      label: "Categories",
      icon: Tags,
      href: "/dashboard/categories",
      color: "text-orange-500",
      roles: ["superAdmin", "subAdmin"],
    },
    {
      label: "Site Content",
      icon: FileText,
      href: "/dashboard/site-content",
      color: "text-teal-500",
      roles: ["superAdmin", "subAdmin"],
    },
    {
      label: "Settings",
      icon: Settings,
      href: "/dashboard/settings",
      color: "text-gray-500",
    },
  ];

  const filteredRoutes = routes.filter((route) => {
    if (!route.roles) return true;
    return userRole && route.roles.includes(userRole);
  });

  return (
    <div
      className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 text-white transition-transform duration-300 ease-in-out transform",
        isOpen ? "translate-x-0" : "-translate-x-full",
        "md:relative md:translate-x-0"
      )}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="font-bold text-xl">A</span>
            </div>
            <span className="text-xl font-bold">AdminPanel</span>
          </Link>
          <button
            onClick={() => setIsOpen(false)}
            className="md:hidden p-1 hover:bg-gray-800 rounded-md"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4">
          <nav className="px-4 space-y-2">
            {filteredRoutes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                  pathname === route.href
                    ? "bg-gray-800 text-white"
                    : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                )}
              >
                <route.icon className={cn("w-5 h-5", route.color)} />
                {route.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="p-4 border-t border-gray-800">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg w-full transition-colors"
          >
            <LogOut className="w-5 h-5 text-red-500" />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
