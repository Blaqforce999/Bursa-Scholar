import { Spinner } from '@/components/shared/Spinner';

export default function Loading() {
  return (
    <div className="mx-auto max-w-[1200px] px-16 py-32 sm:px-24">
      <Spinner />
    </div>
  );
}
