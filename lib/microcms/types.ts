// microCMS API types based on the API definition

export interface MicroCMSImage {
  url: string;
  height?: number;
  width?: number;
}

export interface Category {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  revisedAt: string;
}

export interface Blog {
  id: string;
  title: string;
  content: string;
  eyecatch?: MicroCMSImage;
  categories?: Category[];
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  revisedAt: string;
}

export interface MicroCMSListResponse<T> {
  contents: T[];
  totalCount: number;
  offset: number;
  limit: number;
}

export interface MicroCMSQueries {
  limit?: number;
  offset?: number;
  orders?: string;
  q?: string;
  fields?: string;
  ids?: string;
  filters?: string;
  depth?: number;
}
