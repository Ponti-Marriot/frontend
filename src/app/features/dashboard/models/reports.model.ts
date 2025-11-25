// Mapea la vista reports_dashboard del backend:
// id, hotel_id, created_at, total_reservations, total_revenue, avg_price_per_night
export interface Report {
  id: string;
  hotelId: string | null;
  createdAt: string; // yyyy-MM-dd (viene de LocalDate / DATE)
  totalReservations: number;
  totalRevenue: number;
  avgPricePerNight: number;
}

// Punto para las series de ingresos (gráfica)
export interface RevenuePoint {
  date: string; // yyyy-MM-dd
  totalRevenue: number;
}

// Snapshot de ocupación global (dona)
export interface OccupancySnapshot {
  occupiedPercentage: number;
  availablePercentage: number;
}
