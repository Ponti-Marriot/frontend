// Directly mapped from backend Location entity
export interface Location {
  id: string;
  countryCode: string;
  state: string;
  cityCode: string;
  cityName: string;
  timezone: string;
  subdivCode: string;
}

// Images associated to a hotel property
export interface HotelImage {
  id: string;
  hotelPropertyId: string;
  imageUrl: string;
  isPrimary: boolean;
}

// Directly mapped from backend HotelProperty entity
export interface HotelProperty {
  id: string;
  name: string;
  description?: string;
  squareMeters?: number;
  stars: number;
  propertyType: string;
  locationId: string;
  address: string;
  availabilityDatesId?: string;
  createdAt?: string;
  updatedAt?: string;
  photosUrls?: string[];
}

// Optional: if you have a Settings table in backend
export interface Setting {
  id: string;
  key: string;
  value: string;
  description?: string;
}
