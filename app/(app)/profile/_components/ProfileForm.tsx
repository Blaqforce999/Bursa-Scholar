'use client';

import { useState } from 'react';
import { updateProfile } from '@/app/(app)/profile/actions';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { FormShell } from '@/components/shared/FormShell';
import { StickyActionBar } from '@/components/shared/StickyActionBar';
import { AFRICAN_COUNTRIES, STUDY_LEVEL_LABELS } from '@/lib/constants';

type ProfileFormProps = {
  // required props first
  initial: {
    nationality: string | null;
    studyLevel: string | null;
    fieldOfStudy: string | null;
    targetRegion: string | null;
  };
};

export function ProfileForm({ initial }: ProfileFormProps) {
  const [nationality, setNationality] = useState(initial.nationality ?? '');
  const [studyLevel, setStudyLevel] = useState(initial.studyLevel ?? '');
  const [fieldOfStudy, setFieldOfStudy] = useState(initial.fieldOfStudy ?? '');
  const [targetRegion, setTargetRegion] = useState(initial.targetRegion ?? '');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(false);
    setIsSubmitting(true);

    const result = await updateProfile({ nationality, studyLevel, fieldOfStudy, targetRegion });
    if (result.ok) {
      setSuccess(true);
    } else {
      setError(result.error.message);
    }
    setIsSubmitting(false);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-16">
      <FormShell className="flex flex-col gap-16">
        <Select label="Nationality" name="nationality" value={nationality} onChange={(e) => setNationality(e.target.value)}>
          <option value="">Not set</option>
          {AFRICAN_COUNTRIES.map((country) => (
            <option key={country} value={country}>
              {country}
            </option>
          ))}
        </Select>

        <Select label="Study level" name="studyLevel" value={studyLevel} onChange={(e) => setStudyLevel(e.target.value)}>
          <option value="">Not set</option>
          {Object.entries(STUDY_LEVEL_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>

        <Input
          label="Field of study"
          name="fieldOfStudy"
          enterKeyHint="next"
          value={fieldOfStudy}
          onChange={(e) => setFieldOfStudy(e.target.value)}
        />

        <Input
          label="Target region (optional)"
          name="targetRegion"
          enterKeyHint="done"
          value={targetRegion}
          onChange={(e) => setTargetRegion(e.target.value)}
        />
      </FormShell>

      {error && (
        <p role="alert" className="text-danger" style={{ font: 'var(--font-body-small)' }}>
          {error}
        </p>
      )}
      {success && (
        <p role="status" className="text-eligible" style={{ font: 'var(--font-body-small)' }}>
          Profile saved.
        </p>
      )}

      <StickyActionBar>
        <Button type="submit" size="lg" className="sm:self-start" disabled={isSubmitting} aria-busy={isSubmitting}>
          {isSubmitting ? 'Saving…' : success ? 'Saved ✓' : 'Save changes'}
        </Button>
      </StickyActionBar>
    </form>
  );
}
