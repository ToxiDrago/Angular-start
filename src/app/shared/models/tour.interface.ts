export interface Tour {
  id: string;
  name: string;
  description: string;
  tourOperator: string;
  price: string;
  img: string;
  type?: 'single' | 'multi';
  date?: string;
  firstName?: string;
  lastName?: string;
  cardNumber?: string;
  birthDate?: string;
  age?: number;
  citizenship?: string;
  avatar?: string;
  createdAt?: string;
}

export interface ToursResponse {
  tours: Tour[];
}

export interface TourFilter {
  searchTerm?: string;
  type?: string;
  operator?: string;
  priceRange?: {
    min: number;
    max: number;
  };
}

export interface TourSortOptions {
  field: 'name' | 'price' | 'operator' | 'date';
  direction: 'asc' | 'desc';
}