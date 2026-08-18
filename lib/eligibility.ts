import type { Scholarship, StudyLevel } from '@prisma/client';

export type EligibilityProfile = {
  nationality: string | null;
  studyLevel: StudyLevel | null;
  fieldOfStudy: string | null;
};

export type EligibilityResult = {
  state: 'ELIGIBLE' | 'PARTIAL' | 'NOT_ELIGIBLE';
  reasons: {
    nationality: boolean;
    studyLevel: boolean | null;
    fieldOfStudy: boolean | null;
  };
};

type Check = 'match' | 'no-match' | 'unknown';

function checkNationality(
  profile: EligibilityProfile,
  scholarship: Pick<Scholarship, 'openToAllAfrican' | 'eligibleNationalities'>
): Check {
  if (scholarship.openToAllAfrican) return 'match';
  if (profile.nationality === null) return 'unknown';
  return scholarship.eligibleNationalities.includes(profile.nationality) ? 'match' : 'no-match';
}

function checkStudyLevel(profile: EligibilityProfile, scholarship: Pick<Scholarship, 'studyLevels'>): Check {
  if (profile.studyLevel === null) return 'unknown';
  return scholarship.studyLevels.includes(profile.studyLevel) ? 'match' : 'no-match';
}

function checkFieldOfStudy(profile: EligibilityProfile, scholarship: Pick<Scholarship, 'fieldsOfStudy'>): Check {
  if (profile.fieldOfStudy === null) return 'unknown';
  const field = profile.fieldOfStudy.toLowerCase();
  const isMatch = scholarship.fieldsOfStudy.some((f) => f.toLowerCase() === 'any field' || f.toLowerCase() === field);
  return isMatch ? 'match' : 'no-match';
}

/**
 * Deterministic, rule-based matching only — no ML, no scoring model.
 * Returns null when there is no profile to match against (no eligibility
 * state should be shown in that case).
 *
 * Nationality, study level, and field of study are each a real,
 * disqualifying requirement when the scholarship's own data says so — a
 * single confirmed mismatch on any of them means NOT_ELIGIBLE, regardless
 * of what else lines up. ELIGIBLE requires every checkable criterion to
 * actually match. PARTIAL is what's left: nothing has failed outright,
 * but the profile is too incomplete to confirm eligibility with
 * confidence (e.g. field of study hasn't been set yet).
 */
export function getEligibility(
  profile: EligibilityProfile,
  scholarship: Pick<Scholarship, 'openToAllAfrican' | 'eligibleNationalities' | 'studyLevels' | 'fieldsOfStudy'>
): EligibilityResult | null {
  const hasProfile = Boolean(profile.nationality || profile.studyLevel || profile.fieldOfStudy);
  if (!hasProfile) return null;

  const nationality = checkNationality(profile, scholarship);
  const studyLevel = checkStudyLevel(profile, scholarship);
  const fieldOfStudy = checkFieldOfStudy(profile, scholarship);
  const checks = [nationality, studyLevel, fieldOfStudy];

  const state: EligibilityResult['state'] = checks.includes('no-match')
    ? 'NOT_ELIGIBLE'
    : checks.every((check) => check === 'match')
      ? 'ELIGIBLE'
      : 'PARTIAL';

  return {
    state,
    reasons: {
      nationality: nationality === 'match',
      studyLevel: studyLevel === 'unknown' ? null : studyLevel === 'match',
      fieldOfStudy: fieldOfStudy === 'unknown' ? null : fieldOfStudy === 'match',
    },
  };
}
