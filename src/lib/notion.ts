import { Client } from '@notionhq/client';

const token = import.meta.env.NOTION_TOKEN;
const postsDbId = import.meta.env.NOTION_POSTS_DB_ID;
const pagesDbId = import.meta.env.NOTION_PAGES_DB_ID;
const noticesDbId = import.meta.env.NOTION_NOTICES_DB_ID;
const programsDbId = import.meta.env.NOTION_PROGRAMS_DB_ID;
const sketchesDbId = import.meta.env.NOTION_SKETCHES_DB_ID;

export const isNotionConfigured = Boolean(token && postsDbId && pagesDbId);

const notion = token ? new Client({ auth: token }) : null;

export interface SitePage {
  id: string;
  slug: string;
  title: string;
  pageType:
    | 'home'
    | 'about'
    | 'services'
    | 'blog'
    | 'publisher'
    | 'cases'
    | 'contact'
    | 'privacy'
    | 'legal';
  published: boolean;
  navVisible: boolean;
  navOrder: number;
  navLabel: string;
  excerpt: string;
  seoTitle: string;
  seoDescription: string;
  heroSliderImages: string[];
  heroSliderAutoplaySec: number;
  heroSliderEnabled: boolean;
  heroFeatureImage: string;
  heroFeatureCaption: string;
  heroFeatureBgMode: string;
  heroPrimaryLabel: string;
  heroPrimaryUrl: string;
  heroSecondaryImage: string;
  heroSecondaryText: string;
  heroSecondaryLabel: string;
  heroSecondaryUrl: string;
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

export interface NoticeItem {
  id: string;
  slug: string;
  title: string;
  published: boolean;
  publishedAt: string;
  showOnHome: boolean;
  important: boolean;
  category: string;
  location: string;
  summary: string;
  linkUrl: string;
  body: string;
  updatedAt: string;
}

export interface ProgramItem {
  id: string;
  title: string;
  slug: string;
  iconImage: string;
  summary: string;
  sortOrder: number;
  visibleOnHome: boolean;
  published: boolean;
  accentColor: string;
  updatedAt: string;
}

export interface SketchItem {
  id: string;
  title: string;
  image: string;
  summary: string;
  sortOrder: number;
  visibleOnHome: boolean;
  published: boolean;
  linkUrl: string;
  updatedAt: string;
}

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

function getFilesList(prop: any): string[] {
  const files = prop?.files ?? [];
  return files
    .map((f: any) => f?.external?.url || f?.file?.url || '')
    .filter(Boolean)
    .slice(0, 20);
}

function getFilesUrls(prop: any): string {
  return getFilesList(prop)[0] ?? '';
}

function getDate(prop: any): string {
  return prop?.date?.start ?? '';
}

function getNumber(prop: any, fallback = 0): number {
  return typeof prop?.number === 'number' ? prop.number : fallback;
}

function normalizeKey(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9가-힣]/g, '');
}

function findProperty(properties: Record<string, any>, aliases: string[]): any {
  const aliasSet = new Set(aliases.map(normalizeKey));
  for (const [key, value] of Object.entries(properties || {})) {
    if (aliasSet.has(normalizeKey(key))) return value;
  }
  return undefined;
}

function findTitleProperty(properties: Record<string, any>): any {
  for (const value of Object.values(properties || {})) {
    if ((value as any)?.type === 'title') return value;
  }
  return undefined;
}

function getRichTextOrTitleText(prop: any): string {
  if (!prop) return '';
  if (Array.isArray(prop.rich_text)) return getPlainText(prop.rich_text);
  if (Array.isArray(prop.title)) return getPlainText(prop.title);
  return '';
}

function getTextByAliases(properties: Record<string, any>, aliases: string[], fallback = ''): string {
  const prop = findProperty(properties, aliases);
  return prop ? getRichTextOrTitleText(prop) : fallback;
}

function getCheckboxByAliases(properties: Record<string, any>, aliases: string[], fallback = false): boolean {
  const prop = findProperty(properties, aliases);
  return prop ? getCheckbox(prop) : fallback;
}

function getSelectByAliases(properties: Record<string, any>, aliases: string[], fallback = ''): string {
  const prop = findProperty(properties, aliases);
  return prop ? getSelectValue(prop) : fallback;
}

function getUrlByAliases(properties: Record<string, any>, aliases: string[], fallback = ''): string {
  const prop = findProperty(properties, aliases);
  return prop ? getUrl(prop) : fallback;
}

function getDateByAliases(properties: Record<string, any>, aliases: string[], fallback = ''): string {
  const prop = findProperty(properties, aliases);
  return prop ? getDate(prop) : fallback;
}

function getNumberByAliases(properties: Record<string, any>, aliases: string[], fallback = 0): number {
  const prop = findProperty(properties, aliases);
  return prop ? getNumber(prop, fallback) : fallback;
}

function getFilesByAliases(properties: Record<string, any>, aliases: string[]): string[] {
  const prop = findProperty(properties, aliases);
  return prop ? getFilesList(prop) : [];
}

function getFileByAliases(properties: Record<string, any>, aliases: string[], fallback = ''): string {
  const prop = findProperty(properties, aliases);
  return prop ? getFilesUrls(prop) : fallback;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderInlineText(text: string): string {
  return escapeHtml(text).replace(/\n/g, '<br />');
}

function getImageBlockUrl(block: any): string {
  return block.image?.external?.url || block.image?.file?.url || '';
}

function blocksToMarkdown(blocks: any[]): string {
  const lines: string[] = [];
  for (const block of blocks) {
    const text = getPlainText(block[block.type]?.rich_text);
    switch (block.type) {
      case 'paragraph':
        lines.push(`<p>${renderInlineText(text)}</p>`);
        break;
      case 'heading_1':
        lines.push(`<h1>${renderInlineText(text)}</h1>`);
        break;
      case 'heading_2':
        lines.push(`<h2>${renderInlineText(text)}</h2>`);
        break;
      case 'heading_3':
        lines.push(`<h3>${renderInlineText(text)}</h3>`);
        break;
      case 'bulleted_list_item':
        lines.push(`<ul><li>${renderInlineText(text)}</li></ul>`);
        break;
      case 'numbered_list_item':
        lines.push(`<ol><li>${renderInlineText(text)}</li></ol>`);
        break;
      case 'quote':
        lines.push(`<blockquote>${renderInlineText(text)}</blockquote>`);
        break;
      case 'code':
        lines.push(
          `<pre><code>${escapeHtml(
            (block.code?.rich_text ?? []).map((t: any) => t.plain_text ?? '').join('')
          )}</code></pre>`
        );
        break;
      case 'callout':
        lines.push(
          `<aside class="callout">${renderInlineText(
            (block.callout?.rich_text ?? []).map((t: any) => t.plain_text ?? '').join('')
          )}</aside>`
        );
        break;
      case 'image': {
        const imageUrl = getImageBlockUrl(block);
        const caption = getPlainText(block.image?.caption);
        if (imageUrl) {
          lines.push(
            `<figure class="notion-figure notion-figure--image"><img src="${escapeHtml(
              imageUrl
            )}" alt="${escapeHtml(caption || '본문 이미지')}" loading="lazy" />${
              caption ? `<figcaption>${renderInlineText(caption)}</figcaption>` : ''
            }</figure>`
          );
        }
        break;
      }
      case 'divider':
        lines.push('<hr />');
        break;
      case 'bookmark': {
        const url = block.bookmark?.url ?? '';
        if (url) {
          lines.push(
            `<p><a href="${escapeHtml(url)}" target="_blank" rel="noreferrer">${escapeHtml(
              url
            )}</a></p>`
          );
        }
        break;
      }
      case 'embed': {
        const url = block.embed?.url ?? '';
        if (url) {
          lines.push(
            `<p><a href="${escapeHtml(url)}" target="_blank" rel="noreferrer">${escapeHtml(
              url
            )}</a></p>`
          );
        }
        break;
      }
      default:
        break;
    }
  }
  return lines.join('\n');
}

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

export async function getSitePages(): Promise<SitePage[]> {
  if (!token || !pagesDbId || !notion) {
    return [];
  }
  try {
    const res = await notion.databases.query({
      database_id: pagesDbId,
      filter: { property: 'published', checkbox: { equals: true } },
      sorts: [{ property: 'nav_order', direction: 'ascending' }],
      page_size: 100,
    });
    return res.results.map((row: any) => mapPageRow(row));
  } catch (e) {
    console.error('Failed to fetch site pages:', e);
    return [];
  }
}

export async function getSitePageByType(pageType: SitePage['pageType']): Promise<SitePage | null> {
  const pages = await getSitePages();
  return pages.find((p) => p.pageType === pageType) ?? null;
}

export async function getSitePageFull(pageType: SitePage['pageType']): Promise<{ meta: SitePage; body: string } | null> {
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
  if (!token || !postsDbId || !notion) {
    return [];
  }
  try {
    const res = await notion.databases.query({
      database_id: postsDbId,
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

export async function getBlogPostFullBySlug(slug: string): Promise<BlogPost | null> {
  const meta = await getBlogPostBySlug(slug);
  if (!meta) return null;

  let body = '';
  if (meta.id) {
    try {
      const blocks = await fetchAllChildBlocks(meta.id);
      body = blocksToMarkdown(blocks);
    } catch (e) {
      console.error('Failed to fetch blog post body:', e);
    }
  }

  return { ...meta, body };
}

export async function getBlogPostsByCategory(category: string): Promise<BlogPost[]> {
  const posts = await getBlogPosts();
  return posts.filter((p) => p.category.toLowerCase() === category.toLowerCase());
}

export async function getAllCategories(): Promise<string[]> {
  const posts = await getBlogPosts();
  return Array.from(new Set(posts.map((p) => p.category).filter(Boolean))).sort();
}

export async function getAllNotices(): Promise<NoticeItem[]> {
  if (!token || !noticesDbId || !notion) {
    return [];
  }
  try {
    const res = await notion.databases.query({
      database_id: noticesDbId,
      page_size: 100,
    });

    return res.results
      .map((row: any) => mapNoticeRow(row))
      .filter((notice) => notice.published)
      .sort((a, b) => {
        if (a.important !== b.important) return a.important ? -1 : 1;
        return String(b.publishedAt || '').localeCompare(String(a.publishedAt || ''));
      });
  } catch (e) {
    console.error('Failed to fetch notices:', e);
    return [];
  }
}

export async function getNoticeBySlug(slug: string): Promise<NoticeItem | null> {
  const notices = await getAllNotices();
  return notices.find((notice) => notice.slug === slug) ?? null;
}

export async function getNoticeFullBySlug(slug: string): Promise<NoticeItem | null> {
  const meta = await getNoticeBySlug(slug);
  if (!meta) return null;

  let body = '';
  if (meta.id) {
    try {
      const blocks = await fetchAllChildBlocks(meta.id);
      body = blocksToMarkdown(blocks);
    } catch (e) {
      console.error('Failed to fetch notice body:', e);
    }
  }

  return { ...meta, body };
}

export async function getHomeNotices(limit = 10): Promise<NoticeItem[]> {
  const notices = await getAllNotices();
  return notices.filter((notice) => notice.showOnHome).slice(0, limit);
}

export async function getAllPrograms(): Promise<ProgramItem[]> {
  if (!token || !programsDbId || !notion) {
    return [];
  }
  try {
    const res = await notion.databases.query({
      database_id: programsDbId,
      page_size: 100,
    });
    return res.results
      .map((row: any) => mapProgramRow(row))
      .filter((item) => item.published)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  } catch (e) {
    console.error('Failed to fetch programs:', e);
    return [];
  }
}

export async function getHomePrograms(limit = 5): Promise<ProgramItem[]> {
  const programs = await getAllPrograms();
  return programs.filter((item) => item.visibleOnHome).slice(0, limit);
}

export async function getAllSketches(): Promise<SketchItem[]> {
  if (!token || !sketchesDbId || !notion) {
    return [];
  }
  try {
    const res = await notion.databases.query({
      database_id: sketchesDbId,
      page_size: 100,
    });
    return res.results
      .map((row: any) => mapSketchRow(row))
      .filter((item) => item.published)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  } catch (e) {
    console.error('Failed to fetch sketches:', e);
    return [];
  }
}

export async function getHomeSketches(limit = 4): Promise<SketchItem[]> {
  const sketches = await getAllSketches();
  return sketches.filter((item) => item.visibleOnHome).slice(0, limit);
}

function mapPageRow(row: any): SitePage {
  const properties = row.properties || {};
  return {
    id: row.id,
    slug: getTextByAliases(properties, ['slug'], ''),
    title: getTextByAliases(properties, ['title'], ''),
    pageType: (getSelectByAliases(properties, ['page_type'], 'about') || 'about') as SitePage['pageType'],
    published: getCheckboxByAliases(properties, ['published'], false),
    navVisible: getCheckboxByAliases(properties, ['nav_visible'], false),
    navOrder: getNumberByAliases(properties, ['nav_order'], 0),
    navLabel: getTextByAliases(properties, ['nav_label'], ''),
    excerpt: getTextByAliases(properties, ['excerpt'], ''),
    seoTitle: getTextByAliases(properties, ['seo_title'], ''),
    seoDescription: getTextByAliases(properties, ['seo_description'], ''),
    heroSliderImages: getFilesByAliases(properties, ['hero_slider_images']).slice(0, 5),
    heroSliderAutoplaySec: getNumberByAliases(properties, ['hero_slider_autoplay_sec'], 4),
    heroSliderEnabled: getCheckboxByAliases(properties, ['hero_slider_enabled'], false),
    heroFeatureImage: getFileByAliases(properties, ['hero_feature_image'], ''),
    heroFeatureCaption: getTextByAliases(properties, ['hero_feature_caption'], ''),
    heroFeatureBgMode: getSelectByAliases(properties, ['hero_feature_bg_mode'], 'auto'),
    heroPrimaryLabel: getTextByAliases(properties, ['hero_primary_label'], ''),
    heroPrimaryUrl: getUrlByAliases(properties, ['hero_primary_url'], ''),
    heroSecondaryImage: getFileByAliases(properties, ['hero_secondary_image'], ''),
    heroSecondaryText: getTextByAliases(properties, ['hero_secondary_text'], ''),
    heroSecondaryLabel: getTextByAliases(properties, ['hero_secondary_label'], ''),
    heroSecondaryUrl: getUrlByAliases(properties, ['hero_secondary_url'], ''),
    body: '',
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

function mapNoticeRow(row: any): NoticeItem {
  const properties = row.properties || {};
  const titleProp = findTitleProperty(properties);

  return {
    id: row.id,
    slug: getTextByAliases(properties, ['slug'], ''),
    title:
      getRichTextOrTitleText(titleProp) ||
      getTextByAliases(properties, ['title', 'name', '공지제목'], ''),
    published: getCheckboxByAliases(properties, ['published', '공개', '게시', '노출'], false),
    publishedAt: getDateByAliases(
      properties,
      ['published_at', 'published at', 'publishedat', 'date', '날짜', '게시일', '발행일'],
      ''
    ),
    showOnHome: getCheckboxByAliases(
      properties,
      ['show_on_home', 'show on home', 'showonhome', '홈노출', '홈 노출'],
      false
    ),
    important: getCheckboxByAliases(properties, ['important', '중요'], false),
    category: getSelectByAliases(properties, ['category', '카테고리'], ''),
    location: getSelectByAliases(properties, ['location', '지점', '위치'], ''),
    summary: getTextByAliases(properties, ['summary', 'excerpt', '요약'], ''),
    linkUrl: getUrlByAliases(properties, ['link_url', 'link url', 'linkurl', 'url', '링크'], ''),
    body: '',
    updatedAt: row.last_edited_time ?? '',
  };
}

function mapProgramRow(row: any): ProgramItem {
  const properties = row.properties || {};
  const titleProp = findTitleProperty(properties);

  return {
    id: row.id,
    title: getRichTextOrTitleText(titleProp) || getTextByAliases(properties, ['title', 'name'], ''),
    slug: getTextByAliases(properties, ['slug'], ''),
    iconImage: getFileByAliases(properties, ['icon_image', 'icon'], ''),
    summary: getTextByAliases(properties, ['summary', 'excerpt'], ''),
    sortOrder: getNumberByAliases(properties, ['sort_order'], 0),
    visibleOnHome: getCheckboxByAliases(properties, ['visible_on_home'], false),
    published: getCheckboxByAliases(properties, ['published'], false),
    accentColor: getSelectByAliases(properties, ['accent_color'], 'neutral'),
    updatedAt: row.last_edited_time ?? '',
  };
}

function mapSketchRow(row: any): SketchItem {
  const properties = row.properties || {};
  const titleProp = findTitleProperty(properties);

  return {
    id: row.id,
    title: getRichTextOrTitleText(titleProp) || getTextByAliases(properties, ['title', 'name'], ''),
    image: getFileByAliases(properties, ['image'], ''),
    summary: getTextByAliases(properties, ['summary', 'excerpt'], ''),
    sortOrder: getNumberByAliases(properties, ['sort_order'], 0),
    visibleOnHome: getCheckboxByAliases(properties, ['visible_on_home'], false),
    published: getCheckboxByAliases(properties, ['published'], false),
    linkUrl: getUrlByAliases(properties, ['link_url', 'url', '링크'], ''),
    updatedAt: row.last_edited_time ?? '',
  };
}
