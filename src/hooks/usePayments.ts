import { useQuery } from "@tanstack/react-query";
import { PaymentSearchResponse } from "../types/payment";
import { API_URL } from "../constants";

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
                throw new Error("Network response was not ok");
            }
            return response.json();
        },
    });
};
