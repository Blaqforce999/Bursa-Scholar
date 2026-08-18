import Image from 'next/image';
import Link from 'next/link';

export function Logo() {
  return (
    <Link href="/" aria-label="Bursa home" className="inline-flex items-center">
      <Image src="/logo/mobile.svg" alt="" width={107} height={32} priority className="sm:hidden" />
      <Image
        src="/logo/desktop.svg"
        alt=""
        width={160}
        height={48}
        priority
        className="hidden sm:block"
      />
    </Link>
  );
}
