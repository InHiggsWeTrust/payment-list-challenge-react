import React from "react";
import { Container } from './components'
import { usePayments } from "../hooks/usePayments";
import { PaymentsTable } from "./PaymentsTable";
import { I18N } from "../constants/i18n";

export const PaymentsPage = () => {
  const { data, isLoading, isError, error } = usePayments(1, 5);

  return (
    <Container>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
          {I18N.PAGE_TITLE}
        </h2>
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
