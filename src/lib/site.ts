import {
  getBlogPosts,
  getSitePages,
  isNotionConfigured,
  type BlogPost,
  type SitePage,
} from './notion';
import { mockBlogPosts, mockCategories } from './mock-data';

export const SITE_NAME = import.meta.env.SITE_NAME || '책먹는4차원화가';
export const SITE_DESCRIPTION =
  import.meta.env.SITE_DESCRIPTION || '책먹는4차원화가 홈페이지';

export interface NavItem {
  label: string;
  href: string;
}

export const fallbackNavItems: NavItem[] = [
  { label: '홈', href: '/' },
  { label: '소개', href: '/about' },
  { label: '수업프로그램', href: '/services' },
  { label: '블로그', href: '/blog' },
  { label: '책사화 출판사', href: '/publisher' },
  { label: '문의', href: '/contact' },
];

function pageHref(page: SitePage): string {
  switch (page.pageType) {
    case 'home':
      return '/';
    case 'blog':
      return '/blog';
    case 'about':
      return '/about';
    case 'services':
      return '/services';
    case 'publisher':
      return '/publisher';
    case 'contact':
      return '/contact';
    case 'privacy':
      return '/privacy';
    default:
      return page.slug ? `/${page.slug.replace(/^\//, '')}` : '/';
  }
}

export async function getNavItems(): Promise<NavItem[]> {
  const pages = await getSitePages();
  const visiblePages = pages.filter((page) => page.navVisible);

  if (visiblePages.length === 0) {
    return fallbackNavItems;
  }

  return visiblePages
    .sort((a, b) => a.navOrder - b.navOrder)
    .map((page) => ({
      label: page.navLabel || page.title,
      href: pageHref(page),
    }));
}

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
