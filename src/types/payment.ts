export interface Payment {
    id: string;
    customerName: string;
    customerAddress?: string;
    amount: number;
    currency: string;
    status: string; // e.g., "completed", "pending", "failed", "refunded"
    date: string;
    description?: string;
}

export interface PaymentSearchResponse {
    payments: Payment[];
    total: number;
    page: number;
    pageSize: number;
}
