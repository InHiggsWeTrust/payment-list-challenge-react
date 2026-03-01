import { useQuery } from "@tanstack/react-query";
import { PaymentSearchResponse } from "../types/payment";
import { API_URL } from "../constants";
import { I18N } from "../constants/i18n";

export const usePayments = (page = 1, pageSize = 5, searchTerm = "") => {
    return useQuery<PaymentSearchResponse, Error>({
        queryKey: ["payments", page, pageSize, searchTerm],
        queryFn: async () => {
            let url = `${API_URL}?page=${page}&pageSize=${pageSize}`;
            if (searchTerm) {
                url += `&search=${encodeURIComponent(searchTerm)}`;
            }
            const response = await fetch(url);
            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error(I18N.PAYMENT_NOT_FOUND);
                }
                throw new Error(I18N.INTERNAL_SERVER_ERROR);
            }
            return response.json();
        },
    });
};
