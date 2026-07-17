import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Check } from 'lucide-react';
import FarmerCartIllustration from '@/components/illustrations/FarmerCartIllustration';
import LeafIllustration from '@/components/illustrations/LeafIllustration';
import HarvestIllustration from '@/components/illustrations/HarvestIllustration';
import SoilIllustration from '@/components/illustrations/SoilIllustration';
import ModuleBanner from '@/components/ModuleBanner';
import OfferSection from '@/components/OfferSection';

const TRUST_POINTS = [
  'No sign-up needed — answers in seconds',
  'Soil advice available in English, Hindi, or Telugu',
  'Plain language, not lab reports',
  'Grounded in agricultural science, not guesswork',
];

function HomePage() {
  const location = useLocation();

  useEffect(() => {
    if (location.hash === '#contact-section') {
      document.getElementById('contact-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [location.hash]);

  return (
    <div className="flex flex-col gap-10 sm:gap-14">
      {/* Main banner */}
      <div className="grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
        <div>
          <h1 className="font-serif text-3xl leading-tight text-foreground sm:text-4xl lg:text-5xl">
            Straight answers for your crop, whenever you need them
          </h1>
          <p className="mt-4 max-w-lg text-base text-muted-foreground sm:text-lg">
            AgriIntel looks at a photo or a few details from your field and gives you a
            clear, plain-language read on what's going on and what to try next — built for
            farmers who just want a straight answer, not a lab report.
          </p>
          <ul className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:gap-x-6 sm:gap-y-2">
            {TRUST_POINTS.map((point) => (
              <li key={point} className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Check className="size-3" />
                </span>
                {point}
              </li>
            ))}
          </ul>
        </div>
        <div className="flex justify-center">
          <FarmerCartIllustration className="w-full max-w-md" />
        </div>
      </div>

      {/* Module banners */}
      <div className="flex flex-col gap-6">
        <div>
          <h2 className="font-heading text-xl text-foreground sm:text-2xl">
            Everything about your field, in one place
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Plant health, harvest planning, and soil health — no need for three different apps.
          </p>
        </div>
        <ModuleBanner
          to="/disease"
          eyebrow="Plant health"
          title="What's wrong with my plant?"
          description="Take or upload a photo of a leaf and we'll give you our best read on what's affecting it, along with simple steps to try — no need to know the disease name yourself."
          cta="Check my plant"
          illustration={<LeafIllustration className="size-24 sm:size-28" />}
        />
        <ModuleBanner
          to="/yield"
          eyebrow="Harvest planning"
          title="How much can I expect to harvest?"
          description="Enter your crop, field size, and a few growing conditions, and get a straight estimate of what you can expect to bring in this season."
          cta="Estimate my harvest"
          illustration={<HarvestIllustration className="size-24 sm:size-28" />}
          reverse
        />
        <ModuleBanner
          to="/soil"
          eyebrow="Soil health"
          title="Is my soil healthy?"
          description="Enter your soil test readings and we'll explain what your soil needs — in English, Hindi, or Telugu — so you have a clear idea of what to add."
          cta="Check my soil"
          illustration={<SoilIllustration className="size-24 sm:size-28" />}
        />
      </div>

      {/* Offer + contact */}
      <OfferSection />
    </div>
  );
}

export default HomePage;
