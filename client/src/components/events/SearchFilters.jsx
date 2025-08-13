import { useState, useEffect, useRef } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";

export default function SearchFilters({ onSearch, categories, values }) {
  // Local state for all filters
  const [searchTerm, setSearchTerm] = useState(values.search || "");
  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);
  const [category, setCategory] = useState(values.category || "");
  const [dateFrom, setDateFrom] = useState(values.dateFrom || "");
  const [dateTo, setDateTo] = useState(values.dateTo || "");
  const [sortBy, setSortBy] = useState(values.sortBy || "date_asc");
  const [minPrice, setMinPrice] = useState(values.minPrice || "");
  const [maxPrice, setMaxPrice] = useState(values.maxPrice || "");
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Ref for the dropdown panel to close on outside click
  const dropdownRef = useRef();

  // Sync local state when parent values change (e.g., Clear Filters)
  useEffect(() => {
    setSearchTerm(values.search || "");
    setCategory(values.category || "");
    setDateFrom(values.dateFrom || "");
    setDateTo(values.dateTo || "");
    setSortBy(values.sortBy || "date_asc");
    setMinPrice(values.minPrice || "");
    setMaxPrice(values.maxPrice || "");
  }, [values]);

  // Debounce only the search term (400ms delay)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Call parent onSearch when any filter changes
  useEffect(() => {
    onSearch({
      search: debouncedSearch,
      category,
      dateFrom,
      dateTo,
      sortBy,
      minPrice: minPrice || undefined,
      maxPrice: maxPrice || undefined,
    });
  }, [
    debouncedSearch,
    category,
    dateFrom,
    dateTo,
    sortBy,
    minPrice,
    maxPrice,
    onSearch,
  ]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowAdvanced(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Reset all filters locally and trigger parent onSearch
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
      <div className="flex flex-wrap gap-3 items-center">
        {/* Search Box */}
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

        {/* Category Filter */}
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

        {/* Sort Options */}
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

        {/* Advanced Dropdown Toggle */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setShowAdvanced((prev) => !prev)}
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

          {/* Dropdown Panel */}
          {showAdvanced && (
            <div className="absolute right-0 mt-2 w-72 bg-white border border-gray-200 shadow-lg rounded-xl p-4 z-50">
              <div className="grid grid-cols-1 gap-3">
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className={inputStyle}
                  placeholder="From Date"
                />
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className={inputStyle}
                  placeholder="To Date"
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

                {/* Reset Button */}
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-2 text-sm rounded-full border border-gray-200 bg-white hover:bg-gray-100 transition mt-2 w-full"
                >
                  Reset
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
