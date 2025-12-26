import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { FeaturedToys } from '@/components/FeaturedToys';
import { Categories } from '@/components/Categories';
import { HowItWorks } from '@/components/HowItWorks';
import { Testimonials } from '@/components/Testimonials';
import { Footer } from '@/components/Footer';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Hero />
        <Categories />
        <FeaturedToys />
        <HowItWorks />
        <Testimonials />
      </main>
      <Footer />
    </div>
  );
}
