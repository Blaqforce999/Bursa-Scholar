'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useState, useTransition } from 'react';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { FormShell } from '@/components/shared/FormShell';
import { cn } from '@/lib/cn';
import { STUDY_LEVEL_LABELS, FUNDING_LEVEL_LABELS, SORT_OPTIONS } from '@/lib/constants';
import { FilterIcon, ChevronDownIconCmp } from '@/components/shared/icons';

const FILTER_KEYS = ['funding', 'studyLevel', 'hostCountry', 'region', 'fieldOfStudy', 'deadlineWithinDays'];

type FilterBarProps = {
  // required props first
  hostCountries: string[];
  regions: string[];
  fieldsOfStudy: string[];
};

export function FilterBar({ hostCountries, regions, fieldsOfStudy }: FilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(searchParams.get('q') ?? '');
  const [, startTransition] = useTransition();
  // Filters collapse into a disclosure on mobile (recomposed, not shrunk)
  // — always expanded at sm+, where the grid comfortably fits.
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const activeFilterCount = FILTER_KEYS.filter((key) => searchParams.get(key)).length;

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete('page');
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }

  function handleSearchSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    updateParam('q', q);
  }

  return (
    <div className="flex flex-col gap-16">
      <form onSubmit={handleSearchSubmit} className="flex flex-col gap-8 sm:flex-row sm:items-end">
        <FormShell className="flex-1">
          <Input
            label="Search"
            name="q"
            placeholder="Scholarship or provider name"
            enterKeyHint="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </FormShell>
        <div className="sm:w-[200px]">
          <Select
            label="Sort"
            name="sort"
            value={searchParams.get('sort') ?? 'deadline-asc'}
            onChange={(e) => updateParam('sort', e.target.value)}
          >
            {Object.entries(SORT_OPTIONS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </div>
      </form>

      <button
        type="button"
        onClick={() => setIsFilterOpen((value) => !value)}
        aria-expanded={isFilterOpen}
        aria-controls="filter-grid"
        className="flex h-44 items-center justify-between gap-8 rounded-xl border border-border bg-surface-white px-16 text-ink-indigo sm:hidden"
        style={{ font: 'var(--font-button-label)' }}
      >
        <span className="flex items-center gap-8">
          <FilterIcon className="h-18 w-18" />
          Filters
          {activeFilterCount > 0 && (
            <span
              className="flex h-20 w-20 items-center justify-center rounded-full bg-ink-indigo text-inverse"
              style={{ font: 'var(--font-caption)' }}
            >
              {activeFilterCount}
            </span>
          )}
        </span>
        <ChevronDownIconCmp className={cn('h-16 w-16 transition-transform', isFilterOpen && 'rotate-180')} />
      </button>

      <FormShell
        id="filter-grid"
        className={cn('grid-cols-2 gap-12 sm:grid-cols-3 lg:grid-cols-6 sm:grid', isFilterOpen ? 'grid' : 'hidden')}
      >
        <Select
          label="Funding"
          name="funding"
          value={searchParams.get('funding') ?? ''}
          onChange={(e) => updateParam('funding', e.target.value)}
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
          onChange={(e) => updateParam('studyLevel', e.target.value)}
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
          onChange={(e) => updateParam('hostCountry', e.target.value)}
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
          onChange={(e) => updateParam('region', e.target.value)}
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
          onChange={(e) => updateParam('fieldOfStudy', e.target.value)}
        >
          <option value="">All fields</option>
          {fieldsOfStudy.map((field) => (
            <option key={field} value={field}>
              {field}
            </option>
          ))}
        </Select>

        <Select
          label="Deadline"
          name="deadlineWithinDays"
          value={searchParams.get('deadlineWithinDays') ?? ''}
          onChange={(e) => updateParam('deadlineWithinDays', e.target.value)}
        >
          <option value="">Any deadline</option>
          <option value="14">Closing within 2 weeks</option>
          <option value="30">Closing within a month</option>
          <option value="90">Closing within 3 months</option>
        </Select>
      </FormShell>
    </div>
  );
}
