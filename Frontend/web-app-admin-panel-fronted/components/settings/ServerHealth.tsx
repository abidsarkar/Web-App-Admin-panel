"use client";

import {
  useGetHealthQuery,
  useGetMongoHealthQuery,
  useGetRedisHealthQuery,
} from "@/redux/Features/health/healthApi";
import {
  RefreshCw,
  CheckCircle,
  XCircle,
  Database,
  Server,
} from "lucide-react";
import { Button } from "@/_components/ui/button";

export default function ServerHealth() {
  const {
    data: health,
    isLoading,
    refetch,
  } = useGetHealthQuery(undefined, {
    pollingInterval: 30000, // Auto-refresh every 30 seconds
  });
  const { data: mongoHealth, refetch: refetchMongo } = useGetMongoHealthQuery(
    undefined,
    {
      pollingInterval: 30000,
    }
  );
  const { data: redisHealth, refetch: refetchRedis } = useGetRedisHealthQuery(
    undefined,
    {
      pollingInterval: 30000,
    }
  );

  const handleRefreshAll = () => {
    refetch();
    refetchMongo();
    refetchRedis();
  };

  const getStatusColor = (status: string) => {
    return status === "connected" || status === "healthy"
      ? "text-green-600"
      : "text-red-600";
  };

  const getStatusIcon = (status: string) => {
    return status === "connected" || status === "healthy" ? (
      <CheckCircle className="w-5 h-5 text-green-600" />
    ) : (
      <XCircle className="w-5 h-5 text-red-600" />
    );
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center text-gray-500">
          Loading server health...
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Server Health</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefreshAll}
          className="flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      <div className="space-y-4">
        {/* Overall Health */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            <Server className="w-6 h-6 text-blue-600" />
            <div>
              <p className="font-medium">Overall Status</p>
              <p className="text-sm text-gray-500">
                Last checked:{" "}
                {health?.timestamp
                  ? new Date(health.timestamp).toLocaleString()
                  : "N/A"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getStatusIcon(health?.status || "unknown")}
            <span
              className={`font-semibold capitalize ${getStatusColor(health?.status || "unknown")}`}
            >
              {health?.status || "Unknown"}
            </span>
          </div>
        </div>

        {/* MongoDB Health */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            <Database className="w-6 h-6 text-green-600" />
            <div>
              <p className="font-medium">MongoDB</p>
              <p className="text-sm text-gray-500">
                Last checked:{" "}
                {mongoHealth?.timestamp
                  ? new Date(mongoHealth.timestamp).toLocaleString()
                  : "N/A"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getStatusIcon(mongoHealth?.status || health?.mongo || "unknown")}
            <span
              className={`font-semibold capitalize ${getStatusColor(mongoHealth?.status || health?.mongo || "unknown")}`}
            >
              {mongoHealth?.status || health?.mongo || "Unknown"}
            </span>
          </div>
        </div>

        {/* Redis Health */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            <Database className="w-6 h-6 text-red-600" />
            <div>
              <p className="font-medium">Redis</p>
              <p className="text-sm text-gray-500">
                Last checked:{" "}
                {redisHealth?.timestamp
                  ? new Date(redisHealth.timestamp).toLocaleString()
                  : "N/A"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getStatusIcon(redisHealth?.status || health?.redis || "unknown")}
            <span
              className={`font-semibold capitalize ${getStatusColor(redisHealth?.status || health?.redis || "unknown")}`}
            >
              {redisHealth?.status || health?.redis || "Unknown"}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> Health status auto-refreshes every 30 seconds
        </p>
      </div>
    </div>
  );
}
