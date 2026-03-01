import React, { useState, useEffect } from "react";
import { Container, PaginationButton, PaginationRow } from './components'
import { usePayments } from "../hooks/usePayments";
import { PaymentsTable } from "./PaymentsTable";
import { I18N } from "../constants/i18n";
import { CURRENCIES } from "../constants/index";

export const PaymentsPage = () => {
  // 1. Initialize state from URL params
  const [searchInput, setSearchInput] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("search") || "";
  });

  const [activeSearchTerm, setActiveSearchTerm] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("search") || "";
  });

  const [currency, setCurrency] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("currency") || "";
  });

  const [currentPage, setCurrentPage] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const pageParam = params.get("page");
    const parsedPage = parseInt(pageParam || "1", 10);
    return isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage;
  });

  const pageSize = 5;

  const { data, isLoading, isError, error } = usePayments(currentPage, pageSize, activeSearchTerm, currency);

  // 2. Sync state changes up to the URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    if (activeSearchTerm) {
      params.set("search", activeSearchTerm);
    } else {
      params.delete("search");
    }

    if (currency) {
      params.set("currency", currency);
    } else {
      params.delete("currency");
    }

    if (currentPage > 1) {
      params.set("page", currentPage.toString());
    } else {
      // Keep URL clean if on page 1
      params.delete("page");
    }

    const newUrl = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ""}`;
    window.history.replaceState({}, "", newUrl);
  }, [activeSearchTerm, currency, currentPage]);

  const handleSearch = () => {
    setActiveSearchTerm(searchInput);
    setCurrentPage(1); // Reset to page 1 on new search
  };

  const handleClearFilters = () => {
    setSearchInput("");
    setActiveSearchTerm("");
    setCurrency("");
    setCurrentPage(1); // Reset to page 1 on clear
  };

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrency(e.target.value);
    setCurrentPage(1); // Reset to page 1 on filter change
  };

  const isFilterActive = activeSearchTerm !== "" || currency !== "";

  // Calculate if we have a next page based on total results
  const totalResults = data?.total || 0;
  const hasNextPage = currentPage * pageSize < totalResults;

  return (
    <Container>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
          {I18N.PAGE_TITLE}
        </h2>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex flex-1 gap-2">
          <input
            type="text"
            className="block w-full sm:max-w-xs rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 px-3"
            placeholder={I18N.SEARCH_PLACEHOLDER}
            aria-label={I18N.SEARCH_LABEL}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button
            type="button"
            className="rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            onClick={handleSearch}
          >
            {I18N.SEARCH_BUTTON}
          </button>
        </div>

        <div className="flex items-center gap-2 relative">
          <select
            className="appearance-none block w-full rounded-md border-0 py-[0.4rem] pl-3 pr-10 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6 bg-white h-[36px]"
            aria-label={I18N.CURRENCY_FILTER_LABEL}
            value={currency}
            onChange={handleCurrencyChange}
          >
            <option value="">{I18N.CURRENCIES_OPTION}</option>
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
            <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </div>
        </div>

        {isFilterActive && (
          <button
            type="button"
            className="rounded-md bg-red-100 px-3 py-2 text-sm font-semibold text-red-700 shadow-sm hover:bg-red-200 h-[38px]"
            onClick={handleClearFilters}
          >
            {I18N.CLEAR_FILTERS}
          </button>
        )}
      </div>

      {isError && (
        <div className="rounded-md bg-red-50 p-4 mb-6">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">{I18N.SOMETHING_WENT_WRONG}</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error?.message || I18N.INTERNAL_SERVER_ERROR}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-4">
        <PaymentsTable payments={data?.payments || []} isLoading={isLoading} />

        {!isLoading && !isError && (data?.payments?.length || 0) > 0 && (
          <PaginationRow>
            <PaginationButton
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              aria-label={I18N.PREVIOUS_BUTTON}
            >
              {I18N.PREVIOUS_BUTTON}
            </PaginationButton>

            <span className="text-sm text-gray-700">
              {I18N.PAGE_LABEL} {currentPage}
            </span>

            <PaginationButton
              onClick={() => setCurrentPage(p => p + 1)}
              disabled={!hasNextPage}
              aria-label={I18N.NEXT_BUTTON}
            >
              {I18N.NEXT_BUTTON}
            </PaginationButton>
          </PaginationRow>
        )}
      </div>
    </Container>
  );
};
