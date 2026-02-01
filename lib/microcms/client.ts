import { Blog, Category, MicroCMSListResponse, MicroCMSQueries } from './types';

const API_KEY = process.env.MICROCMS_API_KEY;
const SERVICE_DOMAIN = process.env.MICROCMS_SERVICE_DOMAIN;

if (!API_KEY) {
  throw new Error('MICROCMS_API_KEY is not defined');
}

if (!SERVICE_DOMAIN) {
  throw new Error('MICROCMS_SERVICE_DOMAIN is not defined');
}

const BASE_URL = `https://${SERVICE_DOMAIN}.microcms.io/api/v1`;

interface FetchOptions extends RequestInit {
  headers?: Record<string, string>;
}

async function fetchMicroCMS<T>(
  endpoint: string,
  queries?: MicroCMSQueries,
  options?: FetchOptions,
): Promise<T> {
  const queryString = queries
    ? '?' +
      Object.entries(queries)
        .filter(([_, value]) => value !== undefined)
        .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
        .join('&')
    : '';

  const url = `${BASE_URL}${endpoint}${queryString}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'X-MICROCMS-API-KEY': API_KEY!,
      ...options?.headers,
    },
    // Next.js caching strategy
    next: {
      revalidate: 60, // Revalidate every 60 seconds
    },
  });

  if (!response.ok) {
    throw new Error(
      `microCMS API error: ${response.status} ${response.statusText}`,
    );
  }

  return response.json();
}

// Blog API functions
export async function getBlogs(
  queries?: MicroCMSQueries,
): Promise<MicroCMSListResponse<Blog>> {
  return fetchMicroCMS<MicroCMSListResponse<Blog>>('/blogs', queries);
}

export async function getBlogById(
  id: string,
  queries?: MicroCMSQueries,
): Promise<Blog> {
  return fetchMicroCMS<Blog>(`/blogs/${id}`, queries);
}

// Category API functions
export async function getCategories(
  queries?: MicroCMSQueries,
): Promise<MicroCMSListResponse<Category>> {
  return fetchMicroCMS<MicroCMSListResponse<Category>>('/categories', queries);
}

export async function getCategoryById(
  id: string,
  queries?: MicroCMSQueries,
): Promise<Category> {
  return fetchMicroCMS<Category>(`/categories/${id}`, queries);
}

// Helper function to get recent blogs for homepage
export async function getRecentBlogs(limit: number = 3): Promise<Blog[]> {
  const response = await getBlogs({
    limit,
    orders: '-publishedAt',
  });
  return response.contents;
}

// Helper function to get blog by slug (if using slug field)
// Note: The API definition doesn't include a slug field, so we'll use ID
// If you add a slug field to microCMS, you can use filters instead
export async function getBlogBySlug(slug: string): Promise<Blog | null> {
  try {
    // Assuming slug is the same as ID for now
    // If you have a separate slug field, use filters like this:
    // const response = await getBlogs({ filters: `slug[equals]${slug}`, limit: 1 });
    // return response.contents[0] || null;
    return await getBlogById(slug);
  } catch (error) {
    console.error('Error fetching blog by slug:', error);
    return null;
  }
}

// Helper function to get blogs by category
export async function getBlogsByCategory(
  categoryId: string,
  queries?: MicroCMSQueries,
): Promise<MicroCMSListResponse<Blog>> {
  return getBlogs({
    ...queries,
    filters: `categories[contains]${categoryId}`,
  });
}
