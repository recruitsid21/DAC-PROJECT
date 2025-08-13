import { useState } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";

export default function SearchFilters({ onSearch, categories }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortBy, setSortBy] = useState("date_asc");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch({
      search: searchTerm,
      category,
      dateFrom,
      dateTo,
      sortBy,
      minPrice: minPrice || undefined,
      maxPrice: maxPrice || undefined,
    });
  };

  const handleReset = () => {
    setSearchTerm("");
    setCategory("");
    setDateFrom("");
    setDateTo("");
    setSortBy("date_asc");
    setMinPrice("");
    setMaxPrice("");
    onSearch({
      search: "",
      category: "",
      dateFrom: "",
      dateTo: "",
      sortBy: "date_asc",
      minPrice: undefined,
      maxPrice: undefined,
    });
  };

  const inputStyle =
    "px-4 py-2 rounded-full border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition text-sm";

  return (
    <div className="sticky top-4 z-20 bg-white/80 backdrop-blur-lg border border-gray-100 rounded-2xl shadow-lg p-4">
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Main toolbar row */}
        <div className="flex flex-wrap gap-3 items-center">
          {/* Search */}
          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            <span className="text-gray-500">🔍</span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search events..."
              className={`${inputStyle} flex-1`}
            />
          </div>

          {/* Category */}
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={inputStyle}
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.category_id} value={cat.category_id}>
                {cat.name}
              </option>
            ))}
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className={inputStyle}
          >
            <option value="date_asc">Earliest</option>
            <option value="date_desc">Latest</option>
            <option value="price_asc">Price ↑</option>
            <option value="price_desc">Price ↓</option>
          </select>

          {/* Toggle Advanced */}
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-1 text-sm text-indigo-600 hover:underline"
          >
            {showAdvanced ? (
              <>
                <ChevronUpIcon className="w-4 h-4" /> Hide Filters
              </>
            ) : (
              <>
                <ChevronDownIcon className="w-4 h-4" /> Advanced
              </>
            )}
          </button>

          {/* Buttons */}
          <button
            type="submit"
            className="px-5 py-2 rounded-full text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 shadow-md transition"
          >
            Apply
          </button>
        </div>

        {/* Advanced section */}
        {showAdvanced && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-gray-100">
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className={inputStyle}
              placeholder="From date"
            />
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className={inputStyle}
              placeholder="To date"
            />
            <input
              type="number"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              min="0"
              placeholder="Min Price ₹"
              className={inputStyle}
            />
            <input
              type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              min="0"
              placeholder="Max Price ₹"
              className={inputStyle}
            />
            <div className="col-span-full flex justify-end gap-2 mt-2">
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2 text-sm rounded-full border border-gray-200 bg-white hover:bg-gray-100 transition"
              >
                Reset
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
