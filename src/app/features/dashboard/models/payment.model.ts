export enum PaymentStatus {
  COMPLETED = 'completed',
  PENDING = 'pending',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  CANCELLED = 'cancelled',
}

export interface Payment {
  id: string;
  reservationId: string;
  amount: number;
  transactionId: string;
  paymentStatus: PaymentStatus | string;
  paymentUrl?: string;
  createdAt: string; // ISO string
  updatedAt?: string;
}

export interface PaymentFilters {
  status?: PaymentStatus | 'all';
  method?: string; // if you add a field for method in the future
  dateRange?: {
    start?: Date;
    end?: Date;
  };
  searchTerm?: string;
}

export interface PaymentStats {
  totalRevenue: number;
  completed: number;
  pending: number;
  failed: number;
}

export interface PaginationData {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}
