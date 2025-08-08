import { useState, useEffect, useCallback } from "react";
import api from "../../services/api";
import {
  ChartBarIcon,
  CalendarIcon,
  UserGroupIcon,
  StarIcon,
} from "@heroicons/react/24/outline";

export default function Reports() {
  const [reports, setReports] = useState({
    revenueByMonth: [],
    bookingsByCategory: [],
    topEvents: [],
    topOrganizers: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1))
      .toISOString()
      .split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/admin/reports", {
        params: dateRange,
      });
      if (response.data && response.data.data) {
        setReports({
          revenueByMonth: response.data.data.revenueByMonth || [],
          bookingsByCategory: response.data.data.bookingsByCategory || [],
          topEvents: response.data.data.topEvents || [],
          topOrganizers: response.data.data.topOrganizers || [],
        });
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch reports");
      setReports({
        revenueByMonth: [],
        bookingsByCategory: [],
        topEvents: [],
        topOrganizers: [],
      });
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-2 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-8 flex items-center gap-3">
          <ChartBarIcon className="h-8 w-8 text-indigo-600" />
          Platform Reports
        </h1>

        {/* Date Range Card */}
        <div className="bg-white rounded-xl shadow p-6 mb-8 flex flex-col md:flex-row md:items-end gap-4">
          <div>
            <label
              htmlFor="startDate"
              className="block text-sm font-medium text-gray-700"
            >
              Start Date
            </label>
            <input
              type="date"
              id="startDate"
              value={dateRange.startDate}
              onChange={(e) =>
                setDateRange((prev) => ({
                  ...prev,
                  startDate: e.target.value,
                }))
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label
              htmlFor="endDate"
              className="block text-sm font-medium text-gray-700"
            >
              End Date
            </label>
            <input
              type="date"
              id="endDate"
              value={dateRange.endDate}
              onChange={(e) =>
                setDateRange((prev) => ({
                  ...prev,
                  endDate: e.target.value,
                }))
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          <button
            onClick={fetchReports}
            className="bg-indigo-600 text-white px-6 py-2 rounded-md font-semibold shadow hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 ml-0 md:ml-4"
          >
            Update Report
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 text-center font-semibold">
            {error}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Revenue by Month */}
            <ReportCard
              title="Revenue by Month"
              icon={<CalendarIcon className="h-6 w-6 text-indigo-500" />}
              tableHead={["Month", "Revenue", "Bookings"]}
              rows={reports.revenueByMonth.map((item) => [
                new Date(item.month + "-01").toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                }),
                `₹${Number(item.revenue).toLocaleString("en-IN", {
                  maximumFractionDigits: 2,
                })}`,
                item.bookings,
              ])}
              emptyMsg="No revenue data available for the selected period"
            />

            {/* Bookings by Category */}
            <ReportCard
              title="Bookings by Category"
              icon={<UserGroupIcon className="h-6 w-6 text-indigo-500" />}
              tableHead={["Category", "Events", "Bookings", "Revenue"]}
              rows={reports.bookingsByCategory.map((item) => [
                item.category || "Uncategorized",
                item.events,
                item.bookings,
                `₹${Number(item.revenue).toLocaleString("en-IN", {
                  maximumFractionDigits: 2,
                })}`,
              ])}
              emptyMsg="No category data available for the selected period"
            />

            {/* Top Events */}
            <ReportCard
              title="Top Performing Events"
              icon={<StarIcon className="h-6 w-6 text-yellow-500" />}
              tableHead={["Event", "Bookings", "Revenue"]}
              rows={reports.topEvents.map((event) => [
                event.title,
                event.bookings,
                `₹${Number(event.revenue).toLocaleString("en-IN", {
                  maximumFractionDigits: 2,
                })}`,
              ])}
              emptyMsg="No event data available for the selected period"
            />

            {/* Top Organizers */}
            <ReportCard
              title="Top Organizers"
              icon={<UserGroupIcon className="h-6 w-6 text-green-500" />}
              tableHead={["Organizer", "Events", "Total Bookings", "Revenue"]}
              rows={reports.topOrganizers.map((organizer) => [
                organizer.name,
                organizer.total_events,
                organizer.total_bookings,
                `₹${Number(organizer.total_revenue).toLocaleString("en-IN", {
                  maximumFractionDigits: 2,
                })}`,
              ])}
              emptyMsg="No organizer data available for the selected period"
            />
          </div>
        )}
      </div>
    </div>
  );
}

// Reusable card component for each report section
function ReportCard({ title, icon, tableHead, rows, emptyMsg }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col h-full">
      <div className="flex items-center gap-2 mb-4">
        {icon}
        <h2 className="text-xl font-bold text-gray-800">{title}</h2>
      </div>
      <div className="overflow-x-auto flex-1">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              {tableHead.map((head, idx) => (
                <th
                  key={head}
                  className={`px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider ${
                    idx === tableHead.length - 1 ? "text-right" : ""
                  }`}
                >
                  {head}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {rows.length > 0 ? (
              rows.map((row, i) => (
                <tr
                  key={i}
                  className={
                    i % 2 === 0
                      ? "bg-gray-50 hover:bg-indigo-50"
                      : "hover:bg-indigo-50"
                  }
                >
                  {row.map((cell, j) => (
                    <td
                      key={j}
                      className={`px-6 py-4 whitespace-nowrap text-sm ${
                        j === row.length - 1 ? "text-right" : "text-left"
                      } text-gray-900`}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={tableHead.length}
                  className="px-6 py-4 text-center text-sm text-gray-500"
                >
                  {emptyMsg}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
