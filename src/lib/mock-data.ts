import type { BlogPost } from './notion';

// Mock blog posts for testing the site without Notion.
// Replace these with real Notion data once the integration is configured.

export const mockBlogPosts: BlogPost[] = [
  {
    id: 'mock-1',
    slug: 'notion-cms-homepage-guide',
    title: '노션으로 홈페이지를 운영하는 5단계 가이드',
    excerpt:
      '데이터베이스 구조부터 디자인 원칙까지, 노션을 CMS처럼 쓰면서 사이트는 노션처럼 안 보이게 만드는 법을 정리했습니다.',
    category: 'Notion',
    tags: ['Notion', 'CMS', 'Cloudflare'],
    published: true,
    publishedAt: '2026-07-20',
    coverImage: 'https://images.unsplash.com/photo-1488998427799-e3362cec87c3?w=1200',
    seoTitle: '노션으로 홈페이지를 운영하는 5단계 가이드',
    seoDescription:
      'Notion DB를 CMS로 두고 Astro + Cloudflare Pages로 홈페이지를 만드는 전체 프로세스를 단계별로 정리했습니다.',
    body: '',
    featured: true,
    sourceType: 'original',
    legacyUrl: '',
    noindex: false,
    updatedAt: '2026-07-20',
  },
  {
    id: 'mock-2',
    slug: 'cloudflare-pages-seo',
    title: 'Cloudflare Pages에서 정적 사이트의 SEO를 강화하는 방법',
    excerpt:
      'Google이 정적/사전 렌더링 사이트를 권장하는 이유와, Cloudflare Pages로 SEO 친화적인 환경을 만드는 운영 노하우.',
    category: 'SEO',
    tags: ['SEO', 'Cloudflare', 'Astro'],
    published: true,
    publishedAt: '2026-07-15',
    coverImage: 'https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=1200',
    seoTitle: 'Cloudflare Pages 정적 사이트 SEO 가이드',
    seoDescription:
      '정적 사이트와 SEO의 관계, Cloudflare Pages 설정으로 SEO 점수를 올리는 실전 방법을 정리했습니다.',
    body: '',
    featured: true,
    sourceType: 'original',
    legacyUrl: '',
    noindex: false,
    updatedAt: '2026-07-15',
  },
  {
    id: 'mock-3',
    slug: 'direct-construction-vs-no-code',
    title: '비즈니스 홈페이지를 직접 제작할까, 노코드 도구를 쓸까',
    excerpt:
      '비용, 디자인 자유도, SEO, 유지보수까지 비교해 보고, 어떤 경우에 어떤 선택이 더 적합한지 정리했습니다.',
    category: '운영팁',
    tags: ['비즈니스', '운영', '노코드'],
    published: true,
    publishedAt: '2026-07-08',
    coverImage: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=1200',
    seoTitle: '직접 제작 vs 노코드 - 비즈니스 홈페이지 선택 가이드',
    seoDescription:
      '비즈니스 홈페이지를 만들 때 직접 제작과 노코드 빌더를 비교한 의사결정 가이드.',
    body: '',
    featured: false,
    sourceType: 'original',
    legacyUrl: '',
    noindex: false,
    updatedAt: '2026-07-08',
  },
  {
    id: 'mock-4',
    slug: 'naver-blog-to-own-domain',
    title: '네이버 블로그에서 자체 도메인 홈페이지로 글 이전하기',
    excerpt:
      '중복 콘텐츠 문제 없이 네이버 블로그의 글을 자기 도메인 사이트로 가져오는 방법과 운영 전략.',
    category: '콘텐츠',
    tags: ['네이버 블로그', '마이그레이션', 'SEO'],
    published: true,
    publishedAt: '2026-06-29',
    coverImage: 'https://images.unsplash.com/photo-1499750310107-075fef647b48?w=1200',
    seoTitle: '네이버 블로그에서 자체 도메인 홈페이지로 이전하는 방법',
    seoDescription:
      '네이버 블로그 글을 새 사이트로 옮기면서 중복 콘텐츠 문제를 피하는 실전 전략.',
    body: '',
    featured: false,
    sourceType: 'original',
    legacyUrl: '',
    noindex: false,
    updatedAt: '2026-06-29',
  },
  {
    id: 'mock-5',
    slug: 'astro-vs-nextjs-static-blog',
    title: '블로그용 정적 사이트: Astro vs Next.js 비교',
    excerpt:
      '읽기 전용 비즈니스 사이트에서 Astro와 Next.js의 차이를 비교하고 어떤 경우에 무엇이 더 적합한지 정리합니다.',
    category: 'Notion',
    tags: ['Astro', 'Next.js', '비교'],
    published: true,
    publishedAt: '2026-06-20',
    coverImage: 'https://images.unsplash.com/photo-1517077304055-6e89abbd09e0?w=1200',
    seoTitle: 'Astro vs Next.js 정적 블로그 비교',
    seoDescription:
      'Astro와 Next.js의 정적 블로그 친화도를 비교하고 비즈니스 사이트에 적합한 선택을 안내합니다.',
    body: '',
    featured: false,
    sourceType: 'original',
    legacyUrl: '',
    noindex: false,
    updatedAt: '2026-06-20',
  },
];

export const mockCategories = Array.from(
  new Set(mockBlogPosts.map((p) => p.category))
).sort();
