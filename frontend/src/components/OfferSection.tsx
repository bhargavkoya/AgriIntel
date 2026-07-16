import { Camera, Languages, Mail, ShieldCheck, Wheat } from 'lucide-react';

const OFFERINGS = [
  {
    icon: Camera,
    title: 'Photo-based plant checks',
    description: 'Snap a photo and get an answer in seconds — no lab visit needed.',
  },
  {
    icon: Wheat,
    title: 'Harvest estimates',
    description: 'Plan ahead with a straight number for what your field might yield.',
  },
  {
    icon: Languages,
    title: 'Advice in your language',
    description: "Soil guidance in English, Hindi, or Telugu — whichever you're comfortable with.",
  },
  {
    icon: ShieldCheck,
    title: 'Simple and free to use',
    description: 'No sign-up, no jargon — just answers you can act on.',
  },
];

function OfferSection() {
  return (
    <div id="contact-section" className="scroll-mt-20 rounded-2xl border border-border bg-card p-6 sm:p-10">
      <h2 className="font-heading text-2xl text-foreground">What we offer</h2>
      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {OFFERINGS.map((item) => (
          <div key={item.title} className="flex gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <item.icon className="size-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-foreground">{item.title}</p>
              <p className="mt-0.5 text-sm text-muted-foreground">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-8 flex flex-col gap-2 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-foreground">Questions or feedback?</p>
          <p className="text-sm text-muted-foreground">We'd love to hear from you.</p>
        </div>
        <a
          href="mailto:hello@agriintel.app"
          className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
        >
          <Mail className="size-4" />
          hello@agriintel.app
        </a>
      </div>
    </div>
  );
}

export default OfferSection;
