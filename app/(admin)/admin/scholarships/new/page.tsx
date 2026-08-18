import { Card } from '@/components/ui/Card';
import { ScholarshipForm } from '@/app/(admin)/admin/scholarships/_components/ScholarshipForm';

export default function NewScholarshipPage() {
  return (
    <div className="max-w-[640px]">
      <h1
        className="text-ink-indigo"
        style={{ font: 'var(--font-heading-h2)', letterSpacing: 'var(--font-heading-h2-letter-spacing)' }}
      >
        New scholarship
      </h1>
      <Card className="mt-24">
        <ScholarshipForm mode="create" />
      </Card>
    </div>
  );
}
