export interface Location {
  id: string;
  countryCode: string;
  state: string;
  cityCode: string;
  cityName: string;
  timezone: string | null;
  subdivCode: string | null;
}

export interface HotelImage {
  id: string;
  hotelPropertyId: string;
  imageUrl: string;
  isPrimary: boolean;
}

export interface HotelProperty {
  id: string;
  name: string | null;
  stars: number | null;
  propertyType: string;
  locationId: string;
  address: string | null;
  imagesId?: string | null;
}

export interface HotelPropertyRoom {
  id: string;
  hotel_property_id: string;
  room_id: string;
  bedrooms: number;
  bathrooms: number;
  price_per_night: number;
}

export interface Setting {
  id: string;
  key: string;
  value: string;
  description?: string;
}
