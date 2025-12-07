"use client";

import { useState } from "react";
import ChangePasswordForm from "@/components/settings/ChangePasswordForm";
import ServerHealth from "@/components/settings/ServerHealth";
import { Lock, Activity } from "lucide-react";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"password" | "health">("password");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">
          Manage your account settings and monitor server health.
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("password")}
            className={`${
              activeTab === "password"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
          >
            <Lock className="w-4 h-4" />
            Change Password
          </button>
          <button
            onClick={() => setActiveTab("health")}
            className={`${
              activeTab === "health"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
          >
            <Activity className="w-4 h-4" />
            Server Health
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === "password" && <ChangePasswordForm />}
        {activeTab === "health" && <ServerHealth />}
      </div>
    </div>
  );
}
