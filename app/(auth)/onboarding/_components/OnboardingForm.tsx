'use client';

import { useState } from 'react';
import { completeOnboarding, skipOnboarding } from '@/app/(auth)/onboarding/actions';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { FormShell } from '@/components/shared/FormShell';
import { StickyActionBar } from '@/components/shared/StickyActionBar';
import {
  AFRICAN_COUNTRIES,
  STUDY_LEVEL_LABELS,
  FIELD_OF_STUDY_OPTIONS,
  TARGET_REGION_OPTIONS,
} from '@/lib/constants';

export function OnboardingForm() {
  const [nationality, setNationality] = useState('');
  const [studyLevel, setStudyLevel] = useState('');
  const [fieldOfStudySelect, setFieldOfStudySelect] = useState('');
  const [fieldOfStudyOther, setFieldOfStudyOther] = useState('');
  const [targetRegionSelect, setTargetRegionSelect] = useState('');
  const [targetRegionOther, setTargetRegionOther] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSkipping, setIsSkipping] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const fieldOfStudy = fieldOfStudySelect === 'Other' ? fieldOfStudyOther.trim() : fieldOfStudySelect;
    const targetRegion = targetRegionSelect === 'Other' ? targetRegionOther.trim() : targetRegionSelect;

    const result = await completeOnboarding({ nationality, studyLevel, fieldOfStudy, targetRegion });
    if (result && !result.ok) {
      setError(result.error.message);
      setIsSubmitting(false);
    }
  }

  async function handleSkip() {
    setIsSkipping(true);
    await skipOnboarding();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-16">
      <FormShell className="flex flex-col gap-16">
        <Select
          label="Nationality"
          name="nationality"
          value={nationality}
          onChange={(e) => setNationality(e.target.value)}
        >
          <option value="">Select your nationality</option>
          {AFRICAN_COUNTRIES.map((country) => (
            <option key={country} value={country}>
              {country}
            </option>
          ))}
        </Select>

        <Select
          label="Study level"
          name="studyLevel"
          value={studyLevel}
          onChange={(e) => setStudyLevel(e.target.value)}
        >
          <option value="">Select your study level</option>
          {Object.entries(STUDY_LEVEL_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>

        <Select
          label="Field of study"
          name="fieldOfStudy"
          value={fieldOfStudySelect}
          onChange={(e) => setFieldOfStudySelect(e.target.value)}
        >
          <option value="">Select your field of study</option>
          {FIELD_OF_STUDY_OPTIONS.map((field) => (
            <option key={field} value={field}>
              {field}
            </option>
          ))}
        </Select>

        {fieldOfStudySelect === 'Other' && (
          <Input
            label="Tell us your field of study"
            name="fieldOfStudyOther"
            enterKeyHint="next"
            value={fieldOfStudyOther}
            onChange={(e) => setFieldOfStudyOther(e.target.value)}
          />
        )}

        <Select
          label="Target region (optional)"
          name="targetRegion"
          value={targetRegionSelect}
          onChange={(e) => setTargetRegionSelect(e.target.value)}
        >
          <option value="">Any region</option>
          {TARGET_REGION_OPTIONS.map((region) => (
            <option key={region} value={region}>
              {region}
            </option>
          ))}
        </Select>

        {targetRegionSelect === 'Other' && (
          <Input
            label="Tell us your target region"
            name="targetRegionOther"
            enterKeyHint="done"
            value={targetRegionOther}
            onChange={(e) => setTargetRegionOther(e.target.value)}
          />
        )}
      </FormShell>

      {error && (
        <p role="alert" className="text-danger" style={{ font: 'var(--font-body-small)' }}>
          {error}
        </p>
      )}

      <StickyActionBar className="items-center sm:justify-center">
        <Button type="submit" size="lg" disabled={isSubmitting || isSkipping} aria-busy={isSubmitting}>
          {isSubmitting ? 'Saving…' : 'Save and continue'}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="lg"
          onClick={handleSkip}
          disabled={isSubmitting || isSkipping}
        >
          {isSkipping ? 'Please wait…' : 'Skip for now'}
        </Button>
      </StickyActionBar>
    </form>
  );
}
