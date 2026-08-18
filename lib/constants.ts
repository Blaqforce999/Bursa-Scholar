export const AFRICAN_COUNTRIES = [
  'Nigeria',
  'Kenya',
  'Ghana',
  'Egypt',
  'South Africa',
  'Rwanda',
  'Ethiopia',
  'Uganda',
  'Tanzania',
  'Morocco',
  'Senegal',
  'Cameroon',
  'Zimbabwe',
  'Zambia',
  'Botswana',
  'Namibia',
  'Cote d’Ivoire',
  'Algeria',
  'Tunisia',
  'Other African country',
] as const;

export const STUDY_LEVEL_LABELS = {
  UNDERGRADUATE: 'Undergraduate',
  MASTERS: "Master's",
  PHD: 'PhD',
  RESEARCH: 'Research',
} as const;

export const FUNDING_LEVEL_LABELS = {
  FULL: 'Full funding',
  PARTIAL: 'Partial funding',
  TUITION_ONLY: 'Tuition only',
  STIPEND: 'Stipend',
} as const;

// Lives here (not lib/scholarships.ts) because it's imported by a client
// component (FilterBar) — lib/scholarships.ts pulls in the Prisma client
// and env validation at module scope, which must never reach the browser.
export const SORT_OPTIONS = {
  'deadline-asc': 'Deadline: soonest',
  'deadline-desc': 'Deadline: latest',
  recent: 'Recently added',
  az: 'A–Z',
} as const;

export type SortOption = keyof typeof SORT_OPTIONS;

/** The single definition of "closing soon" across the app — matches the
 *  window already used in components/scholarship/DeadlineBadge.tsx. */
export const CLOSING_SOON_WINDOW_DAYS = 14;

export const FIELD_OF_STUDY_OPTIONS = [
  'Computer Science',
  'Engineering',
  'Medicine',
  'Public Health',
  'Business',
  'Economics',
  'Law',
  'Education',
  'Social Sciences',
  'Natural Sciences',
  'Mathematics',
  'Agriculture',
  'Environmental Studies',
  'Arts and Humanities',
  'Communications',
  'Architecture',
  'Other',
] as const;

export const TARGET_REGION_OPTIONS = [
  'Africa',
  'Europe',
  'North America',
  'South America',
  'Asia',
  'Middle East',
  'Oceania',
  'Other',
] as const;
