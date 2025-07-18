export interface ComponentPackageCreate {
  product_metadata_id: number;
  order: number;
  quantity?: number;
  title?: string;
  start_date?: string;
  end_date?: string;
  currency: string;
}

export interface PackageCreate {
  name: string;
  description: string;
  cover_image?: string;
  base_price?: number;
  taxes?: number;
  final_price: number;
  components: ComponentPackageCreate[];
  currency: string;
}

export interface ComponentPackageUpdate {
  order?: number;
  quantity?: number;
  title?: string;
  start_date?: string;
  end_date?: string;
  currency?: string;
}

export interface PackageUpdate {
  name?: string;
  description?: string;
  cover_image?: string;
  base_price?: number;
  taxes?: number;
  final_price?: number;
  is_active?: boolean;
  currency?: string;
}

export interface PackageResponse {
  id: number;
  name: string;
  description: string;
  cover_image?: string;
  images?: { id: number; image: string; description?: string; uploaded_at: string }[];
  base_price?: number;
  taxes?: number;
  final_price: number;
  rating_average: number;
  total_reviews: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  duration_days?: number;
  currency: string;
}

export interface ComponentPackageResponse {
  id: number;
  product_metadata_id: number;
  order: number;
  quantity?: number;
  title?: string;
  start_date?: string;
  end_date?: string;
  product_type: string;
  product_name: string;
  currency: string;
  available_id: number;
  availability_data?: { [key: string]: any };
}

export interface PackageDetailResponse extends PackageResponse {
  components: ComponentPackageResponse[];
}

export interface PackageSearchParams {
  name?: string;
  min_price?: number;
  max_price?: number;
  min_rating?: number;
  max_rating?: number;
  min_duration?: number;
  max_duration?: number;
  is_active?: boolean;
  product_type?: string;
}

export interface PackageListResponse {
  items: PackageResponse[];
  count: number;
}