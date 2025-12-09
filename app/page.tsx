import { Navbar } from '@/components/landing/navbar';
import { Hero } from '@/components/landing/hero';
import { SocialProof } from '@/components/landing/social-proof';
import { PainSection } from '@/components/landing/pain-section';
import { FeaturesGrid } from '@/components/landing/features-grid';
import { HowItWorks } from '@/components/landing/how-it-works';
import { Pricing } from '@/components/landing/pricing';
import { Footer } from '@/components/landing/footer';
import { getLandingStats } from '@/server/queries/get-landing-stats';

export default async function LandingPage() {
  const stats = await getLandingStats();

  return (
    <main className="min-h-screen bg-slate-50 selection:bg-indigo-100 selection:text-indigo-900">
      <Navbar />
      <Hero />
      <SocialProof stats={stats} />
      <PainSection />
      <FeaturesGrid />
      <HowItWorks />
      <Pricing />
      <Footer />
    </main>
  );
}
