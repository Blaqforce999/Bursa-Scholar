import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { Card } from '@/components/ui/Card';
import { ScholarshipForm } from '@/app/(admin)/admin/scholarships/_components/ScholarshipForm';

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditScholarshipPage({ params }: PageProps) {
  const { id } = await params;
  const scholarship = await db.scholarship.findUnique({ where: { id } });
  if (!scholarship) notFound();

  return (
    <div className="max-w-[640px]">
      <h1
        className="text-ink-indigo"
        style={{ font: 'var(--font-heading-h2)', letterSpacing: 'var(--font-heading-h2-letter-spacing)' }}
      >
        Edit scholarship
      </h1>
      <Card className="mt-24">
        <ScholarshipForm mode="edit" scholarship={scholarship} />
      </Card>
    </div>
  );
}
