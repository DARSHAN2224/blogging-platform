// Database entity types
export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  createdAt: Date;
}

export interface Post {
  id: number;
  title: string;
  slug: string;
  content: string;
  author?: string | null;
  coverImageUrl?: string | null;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Extended types with relations
export interface PostWithCategories extends Post {
  categories?: Category[];
}

export interface PostListItem {
  id: number;
  title: string;
  slug: string;
  content: string;
  author?: string | null;
  coverImageUrl?: string | null;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
  categories?: Category[];
}

export interface RecentPost {
  id: number;
  title: string;
  slug: string;
  createdAt: Date;
  coverImageUrl?: string | null;
  author?: string | null;
}

// Generic pagination wrapper
export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}
