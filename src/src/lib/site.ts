import {
  getBlogPosts,
  getSitePages,
  isNotionConfigured,
  type BlogPost,
} from './notion';
import { mockBlogPosts, mockCategories } from './mock-data';

export const SITE_NAME = import.meta.env.SITE_NAME || 'My Business Site';
export const SITE_DESCRIPTION = import.meta.env.SITE_DESCRIPTION ||
  'A clean business homepage powered by Notion + Astro + Cloudflare Pages';

// Header navigation - always shows these items (Notion can override order/labels if available).
export const navItems = [
  { label: '홈', href: '/' },
  { label: '소개', href: '/about' },
  { label: '서비스', href: '/services' },
  { label: '블로그', href: '/blog' },
  { label: '문의', href: '/contact' },
];

export async function getAllPosts(): Promise<BlogPost[]> {
  const posts = await getBlogPosts();
  if (isNotionConfigured && posts.length > 0) {
    return posts;
  }
  return mockBlogPosts;
}

export async function getAllPostsFromCache(): Promise<BlogPost[]> {
  return getAllPosts();
}

export async function getCategories(): Promise<string[]> {
  if (isNotionConfigured) {
    const posts = await getAllPosts();
    return Array.from(new Set(posts.map((p) => p.category))).sort();
  }
  return mockCategories;
}

export async function hasNotionContent(): Promise<boolean> {
  if (!isNotionConfigured) return false;
  const pages = await getSitePages();
  const posts = await getAllPosts();
  return pages.length > 0 || posts.length > 0;
}
