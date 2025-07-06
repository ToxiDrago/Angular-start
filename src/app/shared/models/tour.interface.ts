export interface Tour {
  id: number;
  name: string;
  description: string;
  tourOperator: string;
  price: number;
  type?: "beach" | "mountain" | "city" | "adventure";
  date: string;
  location?: string;
  duration: number | string;
  img?: string;
  locationId?: string;
  firstName?: string;
  lastName?: string;
  cardNumber?: string;
  birthDate?: string;
  age?: number;
  citizenship?: string;
  avatar?: string;
  createdAt?: string;
  imageUrl?: string;
  rating?: number;
}

export interface ToursResponse {
  tours: Tour[];
}

export interface TourFilter {
  searchTerm?: string;
  type?: string;
  operator?: string;
  locationId?: string;
  priceRange?: {
    min: number;
    max: number;
  };
}

export interface TourSortOptions {
  field: 'name' | 'price' | 'operator' | 'date' | 'location';
  direction: 'asc' | 'desc';
}

export interface Location {
  id: string;
  name: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  description?: string;
  country?: string;
  city?: string;
}

export interface NearestToursRequest {
  locationId: string;
  radius?: number;
  limit?: number;
}

export interface TourStats {
  totalTours: number;
  averagePrice: number;
  popularDestinations: Location[];
  topOperators: string[];
}

export interface SearchResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}