import { Hero } from '@/app/(marketing)/_components/Hero';
import { ValueProps } from '@/app/(marketing)/_components/ValueProps';
import { HowItWorks } from '@/app/(marketing)/_components/HowItWorks';
import { ProductShowcase } from '@/app/(marketing)/_components/ProductShowcase';
import { FeaturedScholarships } from '@/app/(marketing)/_components/FeaturedScholarships';
import { TrustSection } from '@/app/(marketing)/_components/TrustSection';
import { WhoItsFor } from '@/app/(marketing)/_components/WhoItsFor';
import { FAQSection } from '@/app/(marketing)/_components/FAQSection';
import { CtaBand } from '@/app/(marketing)/_components/CtaBand';

export default function HomePage() {
  return (
    <>
      <Hero />
      <ValueProps />
      <HowItWorks />
      <ProductShowcase />
      <FeaturedScholarships />
      <TrustSection />
      <WhoItsFor />
      <FAQSection />
      <CtaBand />
    </>
  );
}
