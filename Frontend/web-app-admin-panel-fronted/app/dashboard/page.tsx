"use client";

import { useEffect, useState } from "react";
import { authService } from "@/lib/auth-service";
import { Users, ShoppingBag, DollarSign, Activity } from "lucide-react";

export default function DashboardPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Welcome back, {user?.name || "Admin"}!
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium text-gray-500">
              Total Revenue
            </h3>
            <DollarSign className="h-4 w-4 text-gray-500" />
          </div>
          <div className="text-2xl font-bold">$45,231.89</div>
          <p className="text-xs text-green-500 font-medium">
            +20.1% from last month
          </p>
        </div>

        <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium text-gray-500">
              Active Employees
            </h3>
            <Users className="h-4 w-4 text-gray-500" />
          </div>
          <div className="text-2xl font-bold">+2350</div>
          <p className="text-xs text-green-500 font-medium">
            +180.1% from last month
          </p>
        </div>

        <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium text-gray-500">
              Products
            </h3>
            <ShoppingBag className="h-4 w-4 text-gray-500" />
          </div>
          <div className="text-2xl font-bold">+12,234</div>
          <p className="text-xs text-green-500 font-medium">
            +19% from last month
          </p>
        </div>

        <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium text-gray-500">
              Active Now
            </h3>
            <Activity className="h-4 w-4 text-gray-500" />
          </div>
          <div className="text-2xl font-bold">+573</div>
          <p className="text-xs text-green-500 font-medium">
            +201 since last hour
          </p>
        </div>
      </div>

      {/* Placeholder for recent activity or charts */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-semibold mb-4">Overview</h3>
          <div className="h-[200px] flex items-center justify-center bg-gray-50 rounded-lg border border-dashed border-gray-200 text-gray-400">
            Chart Placeholder
          </div>
        </div>
        <div className="col-span-3 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-semibold mb-4">Recent Sales</h3>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center">
                <div className="w-9 h-9 rounded-full bg-gray-100 mr-3"></div>
                <div className="ml-2 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    Olivia Martin
                  </p>
                  <p className="text-xs text-muted-foreground">
                    olivia.martin@email.com
                  </p>
                </div>
                <div className="ml-auto font-medium">+$1,999.00</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
