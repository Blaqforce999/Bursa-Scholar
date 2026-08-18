'use client';

import { useState } from 'react';
import type { Scholarship } from '@prisma/client';
import { createScholarship, updateScholarship } from '@/app/(admin)/admin/scholarships/actions';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { FormShell } from '@/components/shared/FormShell';
import { StickyActionBar } from '@/components/shared/StickyActionBar';
import { FUNDING_LEVEL_LABELS } from '@/lib/constants';

type ScholarshipFormProps = {
  // required props first
  mode: 'create' | 'edit';
  // optional props after
  scholarship?: Scholarship;
};

function toDateInputValue(date: Date | null) {
  if (!date) return '';
  return date.toISOString().slice(0, 10);
}

export function ScholarshipForm({ mode, scholarship }: ScholarshipFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const raw = Object.fromEntries(formData.entries());

    const result =
      mode === 'create' ? await createScholarship(raw) : await updateScholarship(scholarship!.id, raw);

    if (result && !result.ok) {
      setError(result.error.message);
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-16">
      <FormShell className="flex flex-col gap-16">
        <Input label="Title" name="title" required enterKeyHint="next" defaultValue={scholarship?.title} />
        <Input label="Provider" name="provider" required enterKeyHint="next" defaultValue={scholarship?.provider} />
        <Input
          label="Official URL"
          name="officialUrl"
          type="url"
          required
          enterKeyHint="next"
          hint="Must be an absolute https:// URL."
          defaultValue={scholarship?.officialUrl}
        />
        <Input
          label="Application URL (optional)"
          name="applicationUrl"
          type="url"
          enterKeyHint="next"
          hint="Leave blank to send students to the official URL to apply."
          defaultValue={scholarship?.applicationUrl ?? ''}
        />

        <div className="grid grid-cols-2 gap-16">
          <Select label="Funding level" name="fundingLevel" required defaultValue={scholarship?.fundingLevel}>
            <option value="">Select…</option>
            {Object.entries(FUNDING_LEVEL_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
          <Select label="Status" name="status" required defaultValue={scholarship?.status ?? 'DRAFT'}>
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
            <option value="CLOSED">Closed</option>
            <option value="ARCHIVED">Archived</option>
          </Select>
        </div>

        <Input
          label="Study levels"
          name="studyLevels"
          required
          enterKeyHint="next"
          hint="Comma-separated: UNDERGRADUATE, MASTERS, PHD, RESEARCH."
          defaultValue={scholarship?.studyLevels.join(', ')}
        />
        <Input
          label="Fields of study"
          name="fieldsOfStudy"
          required
          enterKeyHint="next"
          hint="Comma-separated. Use “Any field” if open to all."
          defaultValue={scholarship?.fieldsOfStudy.join(', ')}
        />

        <div className="grid grid-cols-2 gap-16">
          <Input label="Host country" name="hostCountry" required defaultValue={scholarship?.hostCountry} />
          <Input label="Region" name="region" required defaultValue={scholarship?.region} />
        </div>

        <label className="flex items-center gap-8 text-ink-indigo" style={{ font: 'var(--font-body-regular)' }}>
          <input type="checkbox" name="openToAllAfrican" defaultChecked={scholarship?.openToAllAfrican} />
          Open to all African nationalities
        </label>

        <Input
          label="Eligible nationalities (if not open to all)"
          name="eligibleNationalities"
          enterKeyHint="next"
          hint="Comma-separated country names."
          defaultValue={scholarship?.eligibleNationalities.join(', ')}
        />

        <Input
          label="Source"
          name="source"
          required
          enterKeyHint="next"
          hint="Where this listing was curated from."
          defaultValue={scholarship?.source}
        />
        <Input
          label="Deadline"
          name="deadlineAt"
          type="date"
          defaultValue={toDateInputValue(scholarship?.deadlineAt ?? null)}
        />

        <Textarea
          label="Benefits"
          name="benefits"
          required
          defaultValue={scholarship?.benefits}
        />

        <Textarea
          label="Eligibility (student-facing description)"
          name="eligibility"
          required
          defaultValue={scholarship?.eligibility}
        />

        <Textarea
          label="Requirements"
          name="requirements"
          required
          defaultValue={scholarship?.requirements}
        />
      </FormShell>

      {error && (
        <p role="alert" className="text-danger" style={{ font: 'var(--font-body-small)' }}>
          {error}
        </p>
      )}

      <StickyActionBar>
        <Button type="submit" size="lg" className="sm:self-start" disabled={isSubmitting} aria-busy={isSubmitting}>
          {isSubmitting ? 'Saving…' : mode === 'create' ? 'Create scholarship' : 'Save changes'}
        </Button>
      </StickyActionBar>
    </form>
  );
}
