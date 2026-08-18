import type { Scholarship } from '@prisma/client';
import { searchScholarships } from '@/lib/scholarships';
import { getEligibility, type EligibilityProfile } from '@/lib/eligibility';
import {
  FUNDING_LEVEL_LABELS,
  STUDY_LEVEL_LABELS,
  CLOSING_SOON_WINDOW_DAYS,
  AFRICAN_COUNTRIES,
  FIELD_OF_STUDY_OPTIONS,
} from '@/lib/constants';
import type { AssistantAnswer, AssistantResultRow } from '@/lib/types';

type Intent = 'eligible' | 'closing-soon' | 'country' | 'field' | 'general';

const GREETING_PATTERN = /^\s*(hi|hello|hey|yo|sup|good\s?(morning|afternoon|evening))\b/i;
const HOW_ARE_YOU_PATTERN = /how('s| is| are)?\s*(it going|you doing|things)|how are you/i;
const THANKS_PATTERN = /^\s*(thanks|thank you|thx|cheers|appreciate it)\b/i;
const HELP_META_PATTERN = /what can you (do|help)|what is this\b|help me get started|i don'?t know where to start|not sure what i'?m looking for/i;
const NAME_PATTERN = /what('s| is) your name|who are you\b|what should i call you/i;
const DATE_PATTERN = /what('s| is) (today|the date)|today'?s date|what day is it/i;
const JOKE_PATTERN = /tell me a joke|make me laugh|know (any )?jokes|got a joke|say something funny/i;
const CAREER_ADVICE_PATTERN =
  /career advice|which career|what career|career path|job advice|career options|what should i (study|do)\b/i;

const JOKES = [
  'Why did the scholar bring a ladder to the library? To reach the higher education section.',
  "Why don't scholarships ever get lost? They always find their way to a deadline.",
  'What did the graduate say to the calendar? You\'ve got my whole future circled.',
  "Why did the student submit their application early? Didn't want procrastination on the transcript.",
];

// Discovery only kicks in on a clear signal — a bare "Hi" or an ambiguous
// remark should never trigger a scholarship dump. Funding/study-level
// label matches, and mentions of a country or field of study (checked in
// interpretQuery), also count as discovery.
// No trailing \b: several of these are word stems ("eligib" inside
// "eligible", "clos" inside "closing") where a boundary would never
// follow the fragment itself, only the full word.
const DISCOVERY_SIGNAL_PATTERN =
  /\b(find|search|show me|scholarship|eligib|qualify|match|clos|deadline|fund|master'?s|undergrad|phd|bachelor|research grant|grant|countr|region|africa|compare)/i;

function detectCountryMention(text: string): string | undefined {
  return AFRICAN_COUNTRIES.find((country) => country !== 'Other African country' && text.includes(country.toLowerCase()));
}

function detectFieldMention(text: string): string | undefined {
  return FIELD_OF_STUDY_OPTIONS.find((field) => field !== 'Other' && text.includes(field.toLowerCase()));
}

/**
 * LLM SEAM: this is where a real language model would replace deterministic
 * keyword matching with actual language understanding — classifying intent
 * and extracting filters from free text. Everything downstream (search,
 * eligibility, response shaping) stays the same either way.
 */
function classifyIntent(message: string): 'conversational' | 'discovery' {
  const text = message.toLowerCase();
  const hasFundingOrLevelMatch =
    Object.values(FUNDING_LEVEL_LABELS).some((label) => text.includes(label.toLowerCase())) ||
    Object.entries(STUDY_LEVEL_LABELS).some(([value, label]) => text.includes(label.toLowerCase()) || text.includes(value.toLowerCase()));

  if (
    DISCOVERY_SIGNAL_PATTERN.test(text) ||
    hasFundingOrLevelMatch ||
    detectCountryMention(text) ||
    detectFieldMention(text)
  ) {
    return 'discovery';
  }
  return 'conversational';
}

/**
 * Friendly small talk — this is the part that should feel like a friend,
 * not a script. Only tells a joke or riffs on career advice when actually
 * asked; every other reply stays warm but steers gently back toward
 * finding a real scholarship, never forcing a joke into a serious moment.
 */
function buildConversationalReply(message: string): string {
  const text = message.trim();

  if (THANKS_PATTERN.test(text)) {
    return "You're welcome! Ask any time you want to explore more scholarships.";
  }
  if (JOKE_PATTERN.test(text)) {
    const joke = JOKES[Math.floor(Math.random() * JOKES.length)];
    return `${joke} Okay, back to business, want help finding a scholarship?`;
  }
  if (DATE_PATTERN.test(text)) {
    const today = new Intl.DateTimeFormat('en', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).format(
      new Date()
    );
    return `Today is ${today}. Good a day as any to line up a scholarship, want me to check what's closing soon?`;
  }
  if (NAME_PATTERN.test(text)) {
    return "I'm Bursa, your scholarship-hunting sidekick. I don't do small talk for its own sake, but I'm always up for it. What are you studying?";
  }
  if (CAREER_ADVICE_PATTERN.test(text)) {
    return "Happy to think that through with you. What subjects or fields interest you? Tell me and I'll also check what real scholarships exist in that space, so it's not just advice, it's a next step.";
  }
  if (HOW_ARE_YOU_PATTERN.test(text)) {
    return "I'm doing well, thanks for asking! What are you hoping to find a scholarship for?";
  }
  if (HELP_META_PATTERN.test(text)) {
    return "I can find scholarships you're eligible for, surface ones closing soon, help you compare options, or just chat if you're figuring things out. What's on your mind?";
  }
  if (GREETING_PATTERN.test(text)) {
    return "Hi! Tell me a field of study, a country, or ask what you're eligible for, and I'll pull real matches from Bursa. Or just say what's up.";
  }
  return "I'm not sure I caught that, but I'm listening. Tell me about your studies or where you're based, and I'll see what real scholarships fit.";
}

/**
 * Maps free-text phrasing to Bursa's existing deterministic search
 * filters (lib/scholarships.ts). Plain keyword matching today; see the
 * LLM SEAM above for where real language understanding would slot in.
 */
export function interpretQuery(message: string): { filters: Record<string, string | undefined>; intent: Intent } {
  const text = message.toLowerCase();
  const filters: Record<string, string | undefined> = {};
  let intent: Intent = 'general';

  if (/eligib|qualify|match/.test(text)) intent = 'eligible';
  if (/clos|soon|deadline|urgent/.test(text)) {
    intent = intent === 'eligible' ? intent : 'closing-soon';
    filters.deadlineWithinDays = /month/.test(text) ? '30' : String(CLOSING_SOON_WINDOW_DAYS);
  }

  for (const [value, label] of Object.entries(FUNDING_LEVEL_LABELS)) {
    if (text.includes(label.toLowerCase())) filters.funding = value;
  }
  for (const [value, label] of Object.entries(STUDY_LEVEL_LABELS)) {
    if (text.includes(label.toLowerCase()) || text.includes(value.toLowerCase())) filters.studyLevel = value;
  }

  // Someone volunteering "I'm in Nigeria" or "I want to study medicine" is
  // sharing their educational background, not making small talk — treat
  // it as a real discovery signal rather than deflecting.
  const mentionedCountry = detectCountryMention(text);
  if (mentionedCountry) {
    filters.nationality = mentionedCountry;
    if (intent === 'general') intent = 'country';
  }

  const mentionedField = detectFieldMention(text);
  if (mentionedField) {
    filters.fieldOfStudy = mentionedField;
    if (intent === 'general') intent = 'field';
  }

  return { filters, intent };
}

function formatDeadlineLabel(scholarship: Pick<Scholarship, 'deadlineAt' | 'status'>): string {
  if (scholarship.status === 'CLOSED' || scholarship.status === 'ARCHIVED') return 'Closed';
  if (!scholarship.deadlineAt) return 'Deadline TBC';

  const daysLeft = Math.ceil((scholarship.deadlineAt.getTime() - Date.now()) / (24 * 60 * 60 * 1000));
  if (daysLeft >= 0 && daysLeft <= CLOSING_SOON_WINDOW_DAYS) return `${daysLeft} day${daysLeft === 1 ? '' : 's'} left`;
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(scholarship.deadlineAt);
}

function toResultRow(scholarship: Scholarship): AssistantResultRow {
  return {
    id: scholarship.id,
    slug: scholarship.slug,
    title: scholarship.title,
    provider: scholarship.provider,
    meta: `${FUNDING_LEVEL_LABELS[scholarship.fundingLevel]} · ${scholarship.studyLevels
      .map((level) => STUDY_LEVEL_LABELS[level])
      .join('/')} · ${formatDeadlineLabel(scholarship)}`,
  };
}

type SummaryContext = { country?: string; field?: string };

function buildSummary(intent: Intent, count: number, hasProfile: boolean, context: SummaryContext): string {
  if (intent === 'eligible') {
    if (!hasProfile) return "Add your profile and I can tell you exactly what you're eligible for.";
    if (count === 0) return 'Nothing matches your profile exactly right now. Try browsing Discover instead.';
    return `You're eligible for **${count} scholarship${count === 1 ? '' : 's'}** right now.`;
  }
  if (intent === 'closing-soon') {
    if (count === 0) return 'Nothing is closing soon right now.';
    return `**${count} scholarship${count === 1 ? '' : 's'}** closing soon.`;
  }
  if (intent === 'country') {
    if (count === 0) return `I don't see anything open to **${context.country}** right now. Tell me your field of study and I'll widen the search.`;
    return `**${count} scholarship${count === 1 ? '' : 's'}** open to students from **${context.country}**. What's your field of study? I can narrow this down further.`;
  }
  if (intent === 'field') {
    if (count === 0) return `Nothing in **${context.field}** right now. Tell me where you're based and I'll widen the search.`;
    return `**${count} scholarship${count === 1 ? '' : 's'}** in **${context.field}**. Want me to narrow it by country or funding type?`;
  }
  if (count === 0) return "I couldn't find a real Bursa match for that. Try Discover to browse everything.";
  return count > 3 ? `Here's what I found, showing the closest **3**.` : "Here's what I found.";
}

/**
 * The assistant's one job: turn a question into a deterministic query
 * against real, curated Bursa scholarships and shape a simple answer.
 * Never fabricates a scholarship, provider, deadline, or link — every
 * row comes straight from the database via the existing search/filter
 * and eligibility logic.
 */
export async function answerAssistantQuery(message: string, profile: EligibilityProfile): Promise<AssistantAnswer> {
  if (classifyIntent(message) === 'conversational') {
    return { summary: buildConversationalReply(message), results: [], verified: false };
  }

  const { filters, intent } = interpretQuery(message);
  const { scholarships } = await searchScholarships(filters);
  let pool = scholarships.filter((scholarship) => scholarship.status === 'PUBLISHED');

  const hasProfile = Boolean(profile.nationality || profile.studyLevel || profile.fieldOfStudy);
  if (intent === 'eligible') {
    // Without a profile there's no honest answer to "what am I eligible
    // for" — don't attach unrelated scholarships to a message that says
    // to add a profile first.
    pool = hasProfile ? pool.filter((scholarship) => getEligibility(profile, scholarship)?.state === 'ELIGIBLE') : [];
  }

  const results = pool.slice(0, 3).map(toResultRow);
  return {
    summary: buildSummary(intent, pool.length, hasProfile, { country: filters.nationality, field: filters.fieldOfStudy }),
    results,
    verified: results.length > 0,
  };
}
