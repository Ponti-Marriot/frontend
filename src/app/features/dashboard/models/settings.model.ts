// Directly mapped from backend Location entity
export interface Location {
  id: string;
  countryCode: string;
  state: string;
  cityCode: string;
  cityName: string;
  timezone: string | null;
  subdivCode: string | null;
}

// Images associated to a hotel property (front-only helper or separate entity)
export interface HotelImage {
  id: string;
  hotelPropertyId: string;
  imageUrl: string;
  isPrimary: boolean;
}

// Directly mapped from backend HotelProperty entity
export interface HotelProperty {
  id: string;
  name: string | null; // name VARCHAR(255) NULL en la BD
  stars: number | null; // stars INT8 NULL
  propertyType: string; // NOT NULL en la BD
  locationId: string; // NOT NULL en la BD
  address: string | null; // VARCHAR(255) NULL
  imagesId?: string | null; // FK a images.id, puede ser NULL
}

// Optional: if you have a Settings table in backend
export interface Setting {
  id: string;
  key: string;
  value: string;
  description?: string;
}
