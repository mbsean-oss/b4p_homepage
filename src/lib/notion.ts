import { Client } from '@notionhq/client';

const token = import.meta.env.NOTION_TOKEN;
const postsDbId = import.meta.env.NOTION_POSTS_DB_ID;
const pagesDbId = import.meta.env.NOTION_PAGES_DB_ID;

export const isNotionConfigured = Boolean(token && postsDbId && pagesDbId);

const notion = isNotionConfigured ? new Client({ auth: token }) : null;

// ----- Type definitions matching the Notion DB schemas we designed -----

export interface SitePage {
  id: string;
  slug: string;
  title: string;
  pageType:
    | 'home'
    | 'about'
    | 'services'
    | 'cases'
    | 'contact'
    | 'privacy'
    | 'legal';
  published: boolean;
  navVisible: boolean;
  navOrder: number;
  excerpt: string;
  seoTitle: string;
  seoDescription: string;
  body: string;
  updatedAt: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  tags: string[];
  published: boolean;
  publishedAt: string;
  coverImage: string;
  seoTitle: string;
  seoDescription: string;
  body: string;
  featured: boolean;
  sourceType: 'original' | 'migrated_from_naver' | 'summary_from_naver';
  legacyUrl: string;
  noindex: boolean;
  updatedAt: string;
}

// ----- Helpers -----

function getPlainText(richText: any[] | undefined): string {
  if (!Array.isArray(richText)) return '';
  return richText.map((t) => t.plain_text ?? '').join('');
}

function getSelectValue(prop: any): string {
  return prop?.select?.name ?? '';
}

function getMultiSelectValues(prop: any): string[] {
  return prop?.multi_select?.map((s: any) => s.name) ?? [];
}

function getCheckbox(prop: any): boolean {
  return Boolean(prop?.checkbox);
}

function getUrl(prop: any): string {
  return prop?.url ?? '';
}

function getFilesUrls(prop: any): string {
  const files = prop?.files ?? [];
  if (!files.length) return '';
  const f = files[0];
  if (f.external?.url) return f.external.url;
  if (f.file?.url) return f.file.url;
  return '';
}

function getDate(prop: any): string {
  return prop?.date?.start ?? '';
}

// Read blocks recursively and convert to markdown-ish HTML
function blocksToMarkdown(blocks: any[]): string {
  const lines: string[] = [];
  for (const block of blocks) {
    const text = getPlainText(block[block.type]?.rich_text);
    switch (block.type) {
      case 'paragraph':
        lines.push(`<p>${text}</p>`);
        break;
      case 'heading_1':
        lines.push(`<h2>${text}</h2>`);
        break;
      case 'heading_2':
        lines.push(`<h2>${text}</h2>`);
        break;
      case 'heading_3':
        lines.push(`<h3>${text}</h3>`);
        break;
      case 'bulleted_list_item':
        lines.push(`<ul><li>${text}</li></ul>`);
        break;
      case 'numbered_list_item':
        lines.push(`<ol><li>${text}</li></ol>`);
        break;
      case 'quote':
        lines.push(`<blockquote>${text}</blockquote>`);
        break;
      case 'code':
        lines.push(
          `<pre><code>${(block.code?.rich_text ?? [])
            .map((t: any) => t.plain_text ?? '')
            .join('')}</code></pre>`
        );
        break;
      case 'callout':
        lines.push(
          `<aside class="callout">${(block.callout?.rich_text ?? [])
            .map((t: any) => t.plain_text ?? '')
            .join('')}</aside>`
        );
        break;
      default:
        break;
    }
  }
  return lines.join('\n');
}

// ----- Fetchers -----

export async function getSitePages(): Promise<SitePage[]> {
  if (!isNotionConfigured || !notion) {
    return []; // mock mode: pages DB not used, fallback content shown
  }
  try {
    const res = await notion.databases.query({
      database_id: pagesDbId!,
      filter: { property: 'published', checkbox: { equals: true } },
      sorts: [{ property: 'nav_order', direction: 'ascending' }],
    });
    return res.results.map((row: any) => mapPageRow(row));
  } catch (e) {
    console.error('Failed to fetch site pages:', e);
    return [];
  }
}

export async function getSitePageByType(
  pageType: SitePage['pageType']
): Promise<SitePage | null> {
  const pages = await getSitePages();
  return pages.find((p) => p.pageType === pageType) ?? null;
}

// Fetch all child blocks of a given page/block (paginated). Returns plain array of blocks.
async function fetchAllChildBlocks(blockId: string): Promise<any[]> {
  if (!notion) return [];
  const all: any[] = [];
  let cursor: string | undefined = undefined;
  for (let i = 0; i < 8; i++) {
    const res = await notion.blocks.children.list({
      block_id: blockId,
      page_size: 100,
      start_cursor: cursor,
    });
    all.push(...res.results);
    if (!res.has_more || !res.next_cursor) break;
    cursor = res.next_cursor;
  }
  return all;
}

// Fetch a SitePage together with its rendered body HTML.
// body is empty string when Notion isn't configured, the page doesn't exist,
// or the page has no child blocks. Page templates should treat empty body as "use fallback".
export async function getSitePageFull(
  pageType: SitePage['pageType']
): Promise<{ meta: SitePage; body: string } | null> {
  const meta = await getSitePageByType(pageType);
  if (!meta) return null;
  let body = '';
  if (meta.id) {
    try {
      const blocks = await fetchAllChildBlocks(meta.id);
      body = blocksToMarkdown(blocks);
    } catch (e) {
      console.error('Failed to fetch page body:', e);
    }
  }
  return { meta, body };
}

export async function getBlogPosts(): Promise<BlogPost[]> {
  if (!isNotionConfigured || !notion) {
    return []; // fallback to mock data in caller
  }
  try {
    const res = await notion.databases.query({
      database_id: postsDbId!,
      filter: { property: 'published', checkbox: { equals: true } },
      sorts: [{ property: 'published_at', direction: 'descending' }],
      page_size: 100,
    });
    return res.results.map((row: any) => mapPostRow(row));
  } catch (e) {
    console.error('Failed to fetch blog posts:', e);
    return [];
  }
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const posts = await getBlogPosts();
  return posts.find((p) => p.slug === slug) ?? null;
}

export async function getBlogPostsByCategory(
  category: string
): Promise<BlogPost[]> {
  const posts = await getBlogPosts();
  return posts.filter((p) => p.category.toLowerCase() === category.toLowerCase());
}

export async function getAllCategories(): Promise<string[]> {
  const posts = await getBlogPosts();
  return Array.from(new Set(posts.map((p) => p.category))).sort();
}

// ----- Mapping -----

function mapPageRow(row: any): SitePage {
  return {
    id: row.id,
    slug: getPlainText(row.properties['slug']?.rich_text),
    title: getPlainText(row.properties['title']?.title),
    pageType: (getSelectValue(row.properties['page_type']) || 'about') as
      | 'about'
      | 'services'
      | 'cases'
      | 'contact'
      | 'privacy'
      | 'legal'
      | 'home',
    published: getCheckbox(row.properties['published']),
    navVisible: getCheckbox(row.properties['nav_visible']),
    navOrder: row.properties['nav_order']?.number ?? 0,
    excerpt: getPlainText(row.properties['excerpt']?.rich_text),
    seoTitle: getPlainText(row.properties['seo_title']?.rich_text),
    seoDescription: getPlainText(row.properties['seo_description']?.rich_text),
    body: '', // body loaded separately per page if needed
    updatedAt: row.last_edited_time ?? '',
  };
}

function mapPostRow(row: any): BlogPost {
  return {
    id: row.id,
    slug: getPlainText(row.properties['slug']?.rich_text),
    title: getPlainText(row.properties['title']?.title),
    excerpt: getPlainText(row.properties['excerpt']?.rich_text),
    category: getSelectValue(row.properties['category']),
    tags: getMultiSelectValues(row.properties['tags']),
    published: getCheckbox(row.properties['published']),
    publishedAt: getDate(row.properties['published_at']),
    coverImage: getFilesUrls(row.properties['cover_image']),
    seoTitle: getPlainText(row.properties['seo_title']?.rich_text),
    seoDescription: getPlainText(row.properties['seo_description']?.rich_text),
    body: '',
    featured: getCheckbox(row.properties['featured']),
    sourceType:
      (getSelectValue(row.properties['source_type']) || 'original') as
        | 'original'
        | 'migrated_from_naver'
        | 'summary_from_naver',
    legacyUrl: getUrl(row.properties['legacy_url']),
    noindex: getCheckbox(row.properties['noindex']),
    updatedAt: row.last_edited_time ?? '',
  };
}
