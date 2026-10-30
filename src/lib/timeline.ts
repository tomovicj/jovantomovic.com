import type { CollectionEntry } from 'astro:content';

export const CATEGORIES = [
  { id: 'edu', label: 'education', code: 'EDU', glyph: '◆' },
  { id: 'cert', label: 'certifications', code: 'CRT', glyph: '✓' },
  { id: 'internship', label: 'internships', code: 'INT', glyph: '▲' },
  { id: 'event', label: 'events', code: 'EVT', glyph: '●' },
  { id: 'volunteer', label: 'volunteering', code: 'VOL', glyph: '○' },
  { id: 'project', label: 'projects', code: 'PRJ', glyph: '■' },
  { id: 'win', label: 'achievements', code: 'WIN', glyph: '★' },
] as const;

export const CATEGORY_IDS = ['edu', 'cert', 'internship', 'event', 'volunteer', 'project', 'win'] as const;
export const STATUSES = ['planning', 'wip', 'done'] as const;

export type CategoryId = (typeof CATEGORY_IDS)[number];
export type TimelineEntry = CollectionEntry<'timeline'>;

export const categoryById = Object.fromEntries(CATEGORIES.map((c) => [c.id, c])) as Record<
  CategoryId,
  (typeof CATEGORIES)[number]
>;

/** Sort key: "2026-10" sorts as 2026-10-00, so a month comes before its own days when ascending. */
export const sortKey = (date: string) => (date + '-00-00').slice(0, 10);

export const whenLabel = (e: TimelineEntry) =>
  e.data.label ?? (e.data.end ? `${e.data.date} → ${e.data.end}` : e.data.date);

export const byNewest = (a: TimelineEntry, b: TimelineEntry) =>
  sortKey(b.data.date).localeCompare(sortKey(a.data.date)) || a.id.localeCompare(b.id);
