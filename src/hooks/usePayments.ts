import { useQuery } from "@tanstack/react-query";
import { PaymentSearchResponse } from "../types/payment";
import { API_URL } from "../constants";

export const usePayments = (page = 1, pageSize = 5) => {
    return useQuery<PaymentSearchResponse, Error>({
        queryKey: ["payments", page, pageSize],
        queryFn: async () => {
            const response = await fetch(`${API_URL}?page=${page}&pageSize=${pageSize}`);
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            return response.json();
        },
    });
};
