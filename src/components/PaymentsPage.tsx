import React, { useState } from "react";
import { Container } from './components'
import { usePayments } from "../hooks/usePayments";
import { PaymentsTable } from "./PaymentsTable";
import { I18N } from "../constants/i18n";
import { CURRENCIES } from "../constants/index";

export const PaymentsPage = () => {
  const [searchInput, setSearchInput] = useState("");
  const [activeSearchTerm, setActiveSearchTerm] = useState("");
  const [currency, setCurrency] = useState("");

  const { data, isLoading, isError, error } = usePayments(1, 5, activeSearchTerm, currency);

  const handleSearch = () => {
    setActiveSearchTerm(searchInput);
  };

  const handleClearFilters = () => {
    setSearchInput("");
    setActiveSearchTerm("");
    setCurrency("");
  };

  const isFilterActive = activeSearchTerm !== "" || currency !== "";

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
            onChange={(e) => setCurrency(e.target.value)}
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
            className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
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

      <PaymentsTable payments={data?.payments || []} isLoading={isLoading} />
    </Container>
  );
};
