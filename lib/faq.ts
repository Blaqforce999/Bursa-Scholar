import type { FAQItem } from '@/components/shared/FAQAccordion';

export const DASHBOARD_FAQ_ITEMS: FAQItem[] = [
  {
    question: 'How does Bursa work?',
    answer:
      'Bursa is a free discovery layer for scholarships open to African students. It searches, matches, and organizes real, curated opportunities. Applications always happen on the provider’s own site.',
  },
  {
    question: 'How does matching work?',
    answer:
      'Bursa compares your nationality, study level, and field of study against each scholarship’s real eligibility rules. It’s rule-based and explainable, never a black-box AI guess.',
  },
  {
    question: 'What do Eligible, Partial match, and Not eligible mean?',
    answer:
      'Eligible means every checkable requirement matches your profile. Partial match means nothing disqualifies you, but part of your profile (like field of study) isn’t set yet, so it can’t be fully confirmed. Not eligible means at least one requirement, like nationality or study level, doesn’t match.',
  },
  {
    question: 'What does saving a scholarship do?',
    answer: 'Saving keeps a scholarship under Saved in your account so you can find it again later. It’s private to your account only.',
  },
  {
    question: 'How does Compare work?',
    answer:
      'Add up to 4 scholarships to compare funding, eligibility, deadlines, and requirements side by side. Compare is temporary to your browser, and clears whenever you sign in or out.',
  },
  {
    question: 'How does search work?',
    answer:
      'Search matches titles, providers, host countries, and regions, and understands common variations (like “US” for “United States”). It favors precision over volume, expect fewer, more relevant results.',
  },
  {
    question: 'How do I apply?',
    answer:
      'Bursa never accepts applications directly. Selecting “Apply on official site” takes you to the provider’s own page to complete and submit your application there.',
  },
  {
    question: 'Does Bursa guarantee I’ll get a scholarship?',
    answer:
      'No. Eligibility labels reflect how well you match a scholarship’s stated requirements. They’re not a guarantee of acceptance, funding, or any outcome.',
  },
  {
    question: 'Where does the scholarship data come from?',
    answer:
      'Every listing links to a real, verified official source. Bursa doesn’t invent deadlines, links, or requirements. Broken links get flagged and fixed, not silently swapped.',
  },
  {
    question: 'Is my account and profile data private?',
    answer:
      'Your saved scholarships, compare list, and profile are tied to your account only. No other user can see them. Bursa is free and never sells your data.',
  },
];

export const LANDING_FAQ_ITEMS: FAQItem[] = [
  {
    question: 'What is Bursa?',
    answer:
      'A free platform that helps African students discover, compare, and track real scholarships. It isn’t a job board or a paid consultancy.',
  },
  {
    question: 'Does Bursa charge anything?',
    answer: 'No. Bursa is free to search, save, and compare, and never asks for payment or processes application fees.',
  },
  {
    question: 'Does Bursa submit my application for me?',
    answer:
      'No. Bursa is a discovery layer only. Every “Apply” link takes you to the scholarship provider’s own official page, where you apply directly.',
  },
  {
    question: 'How are scholarships matched to me?',
    answer:
      'Once you add your nationality, study level, and field of study, Bursa checks them against each scholarship’s real requirements. It’s rule-based, not AI guesswork, and never a guarantee of acceptance.',
  },
  {
    question: 'Is the scholarship information trustworthy?',
    answer: 'Every listing links to a real, verified official source, and broken links get flagged and fixed rather than silently removed.',
  },
  {
    question: 'What happens to my data if I sign up?',
    answer: 'Your profile and saved scholarships are private to your account. Bursa never sells your data.',
  },
];
