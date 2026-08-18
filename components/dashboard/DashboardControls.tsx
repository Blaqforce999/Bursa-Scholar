'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/cn';
import { Select } from '@/components/ui/Select';
import {
  STUDY_LEVEL_LABELS,
  FUNDING_LEVEL_LABELS,
  SORT_OPTIONS,
  type SortOption,
} from '@/lib/constants';
import { SearchIcon, SortIcon, FilterIcon, CloseIcon } from '@/components/shared/icons';

const FILTER_KEYS = ['funding', 'studyLevel', 'hostCountry', 'region', 'fieldOfStudy'] as const;
const DEFAULT_SORT: SortOption = 'deadline-asc';

type DashboardControlsProps = {
  // required props first
  hostCountries: string[];
  regions: string[];
  fieldsOfStudy: string[];
};

/**
 * Search reuses the same `q` param the existing search/data-access
 * function already understands (lib/scholarships.ts). Sort and Filter
 * reuse the exact same params and options as the Find Scholarships page
 * (lib/scholarships.ts's sort + filter schema) — no new filtering logic,
 * just a second UI surface for it.
 */
export function DashboardControls({ hostCountries, regions, fieldsOfStudy }: DashboardControlsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(searchParams.get('q') ?? '');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  function pushParams(next: URLSearchParams) {
    next.delete('page');
    router.push(`${pathname}?${next.toString()}`);
  }

  function pushQuery(nextQ: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (nextQ) {
      params.set('q', nextQ);
    } else {
      params.delete('q');
    }
    pushParams(params);
  }

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    pushParams(params);
  }

  function handleSearchChange(value: string) {
    setQ(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    // Debounced so clearing the box (or pausing while typing) reverts the
    // view on its own, without waiting for an explicit Enter.
    debounceRef.current = setTimeout(() => pushQuery(value), 400);
  }

  function handleSearchSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    pushQuery(q);
  }

  function handleClearSearch() {
    setQ('');
    if (debounceRef.current) clearTimeout(debounceRef.current);
    pushQuery('');
  }

  const currentSort = (searchParams.get('sort') as SortOption | null) ?? DEFAULT_SORT;
  const activeFilterCount = FILTER_KEYS.filter((key) => searchParams.get(key)).length;

  function clearFilters() {
    const params = new URLSearchParams(searchParams.toString());
    FILTER_KEYS.forEach((key) => params.delete(key));
    pushParams(params);
  }

  return (
    <div className="flex items-center gap-8">
      <form onSubmit={handleSearchSubmit} className="relative flex-1">
        <SearchIcon className="pointer-events-none absolute left-14 top-1/2 h-18 w-18 -translate-y-1/2 text-ink-muted" />
        <input
          value={q}
          onChange={(event) => handleSearchChange(event.target.value)}
          placeholder="Search scholarships"
          aria-label="Search scholarships"
          className="h-44 w-full rounded-xl border border-border bg-surface-white pl-44 pr-16 text-ink-indigo focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-indigo"
          style={{ font: 'var(--font-body-regular)' }}
        />
        {q && (
          <button
            type="button"
            onClick={handleClearSearch}
            aria-label="Clear search"
            className="absolute right-8 top-1/2 flex h-28 w-28 -translate-y-1/2 items-center justify-center rounded-full text-ink-muted transition hover:bg-surface-warm-light hover:text-ink-indigo"
          >
            <CloseIcon className="h-16 w-16" />
          </button>
        )}
      </form>

      <div className="relative">
        <button
          type="button"
          onClick={() => {
            setIsSortOpen((value) => !value);
            setIsFilterOpen(false);
          }}
          aria-haspopup="menu"
          aria-expanded={isSortOpen}
          aria-label={`Sort${currentSort !== DEFAULT_SORT ? `: ${SORT_OPTIONS[currentSort]}` : ''}`}
          className={cn(
            'flex h-44 shrink-0 items-center gap-6 rounded-xl border px-16 transition',
            currentSort !== DEFAULT_SORT ? 'border-ink-indigo text-ink-indigo' : 'border-border text-ink-indigo hover:bg-surface-warm-light'
          )}
          style={{ font: 'var(--font-button-label)' }}
        >
          <SortIcon className="h-18 w-18" />
          <span className="hidden sm:inline">Sort</span>
        </button>

        {isSortOpen && (
          <>
            <div aria-hidden="true" className="fixed inset-0 z-40" onClick={() => setIsSortOpen(false)} />
            <div
              role="menu"
              aria-label="Sort by"
              className="absolute right-0 top-full z-50 mt-8 w-[220px] rounded-xl border border-border-faint bg-surface-white p-8 shadow-lg"
            >
              {Object.entries(SORT_OPTIONS).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  role="menuitemradio"
                  aria-checked={value === currentSort}
                  onClick={() => {
                    updateParam('sort', value);
                    setIsSortOpen(false);
                  }}
                  className={cn(
                    'block w-full rounded-lg px-12 py-8 text-left transition',
                    value === currentSort ? 'bg-ink-indigo/10 text-ink-indigo' : 'text-ink-indigo hover:bg-surface-warm-light'
                  )}
                  style={{ font: 'var(--font-body-small)' }}
                >
                  {label}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="relative">
        <button
          type="button"
          onClick={() => {
            setIsFilterOpen((value) => !value);
            setIsSortOpen(false);
          }}
          aria-haspopup="menu"
          aria-expanded={isFilterOpen}
          aria-label={`Filter${activeFilterCount > 0 ? ` (${activeFilterCount} active)` : ''}`}
          className={cn(
            'flex h-44 shrink-0 items-center gap-6 rounded-xl border px-16 transition',
            activeFilterCount > 0 ? 'border-ink-indigo text-ink-indigo' : 'border-border text-ink-indigo hover:bg-surface-warm-light'
          )}
          style={{ font: 'var(--font-button-label)' }}
        >
          <FilterIcon className="h-18 w-18" />
          <span className="hidden sm:inline">Filter</span>
          {activeFilterCount > 0 && (
            <span
              className="flex h-20 w-20 items-center justify-center rounded-full bg-ink-indigo text-inverse"
              style={{ font: 'var(--font-caption)' }}
            >
              {activeFilterCount}
            </span>
          )}
        </button>

        {isFilterOpen && (
          <>
            <div aria-hidden="true" className="fixed inset-0 z-40" onClick={() => setIsFilterOpen(false)} />
            <div
              role="menu"
              aria-label="Filter"
              className="absolute right-0 top-full z-50 mt-8 flex w-[calc(100vw-32px)] max-w-[360px] flex-col gap-12 rounded-xl border border-border-faint bg-surface-white p-16 shadow-lg"
            >
              <Select
                label="Funding"
                name="funding"
                value={searchParams.get('funding') ?? ''}
                onChange={(event) => updateParam('funding', event.target.value)}
              >
                <option value="">All funding</option>
                {Object.entries(FUNDING_LEVEL_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>

              <Select
                label="Study level"
                name="studyLevel"
                value={searchParams.get('studyLevel') ?? ''}
                onChange={(event) => updateParam('studyLevel', event.target.value)}
              >
                <option value="">All levels</option>
                {Object.entries(STUDY_LEVEL_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>

              <Select
                label="Host country"
                name="hostCountry"
                value={searchParams.get('hostCountry') ?? ''}
                onChange={(event) => updateParam('hostCountry', event.target.value)}
              >
                <option value="">All countries</option>
                {hostCountries.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </Select>

              <Select
                label="Region"
                name="region"
                value={searchParams.get('region') ?? ''}
                onChange={(event) => updateParam('region', event.target.value)}
              >
                <option value="">All regions</option>
                {regions.map((region) => (
                  <option key={region} value={region}>
                    {region}
                  </option>
                ))}
              </Select>

              <Select
                label="Field of study"
                name="fieldOfStudy"
                value={searchParams.get('fieldOfStudy') ?? ''}
                onChange={(event) => updateParam('fieldOfStudy', event.target.value)}
              >
                <option value="">All fields</option>
                {fieldsOfStudy.map((field) => (
                  <option key={field} value={field}>
                    {field}
                  </option>
                ))}
              </Select>

              {activeFilterCount > 0 && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-ink-muted underline transition hover:text-ink-indigo"
                  style={{ font: 'var(--font-caption)' }}
                >
                  Clear all
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
