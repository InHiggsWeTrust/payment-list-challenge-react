import React from "react";
import { Payment } from "../types/payment";
import { I18N } from "../constants/i18n";

interface PaymentsTableProps {
    payments: Payment[];
    isLoading: boolean;
}

const PaymentRowSkeleton = () => (
    <tr>
        <td className="whitespace-nowrap py-4 pl-4 pr-3 sm:pl-6">
            <div className="animate-pulse bg-gray-200 h-4 rounded w-24"></div>
        </td>
        <td className="whitespace-nowrap px-3 py-4">
            <div className="animate-pulse bg-gray-200 h-4 rounded w-32"></div>
        </td>
        <td className="whitespace-nowrap px-3 py-4">
            <div className="animate-pulse bg-gray-200 h-4 rounded w-20"></div>
        </td>
        <td className="whitespace-nowrap px-3 py-4">
            <div className="animate-pulse bg-gray-200 h-4 rounded w-36"></div>
        </td>
        <td className="whitespace-nowrap px-3 py-4">
            <div className="animate-pulse bg-gray-200 h-4 rounded w-16"></div>
        </td>
        <td className="whitespace-nowrap px-3 py-4">
            <div className="animate-pulse bg-gray-200 h-4 rounded-full w-20"></div>
        </td>
    </tr>
);

export const PaymentsTable: React.FC<PaymentsTableProps> = ({ payments, isLoading }) => {
    if (!isLoading && (!payments || payments.length === 0)) {
        return (
            <div className="text-center p-8 text-gray-500 bg-gray-50 rounded-lg">
                {I18N.NO_PAYMENTS_FOUND}
            </div>
        );
    }

    return (
        <div className="overflow-x-auto shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                    <tr>
                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">{I18N.TABLE_HEADER_PAYMENT_ID}</th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">{I18N.TABLE_HEADER_DATE}</th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">{I18N.TABLE_HEADER_AMOUNT}</th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">{I18N.TABLE_HEADER_CUSTOMER}</th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">{I18N.TABLE_HEADER_CURRENCY}</th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">{I18N.TABLE_HEADER_STATUS}</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                    {isLoading ? (
                        [...Array(5)].map((_, i) => <PaymentRowSkeleton key={`skeleton-${i}`} />)
                    ) : (
                        payments.map((payment) => (
                            <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">{payment.id}</td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                    {new Intl.DateTimeFormat(undefined, {
                                        year: "numeric",
                                        month: "short",
                                        day: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    }).format(new Date(payment.date))}
                                </td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                    {new Intl.NumberFormat(undefined, {
                                        style: "currency",
                                        currency: payment.currency || "USD",
                                    }).format(payment.amount)}
                                </td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{payment.customerName || I18N.EMPTY_CUSTOMER}</td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{payment.currency || I18N.EMPTY_CURRENCY}</td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm">
                                    <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ml-0 ${payment.status === 'completed' ? 'bg-green-100 text-green-800' :
                                        payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                            payment.status === 'refunded' ? 'bg-blue-100 text-blue-800' :
                                                'bg-red-100 text-red-800'
                                        }`}>
                                        {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                                    </span>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};
