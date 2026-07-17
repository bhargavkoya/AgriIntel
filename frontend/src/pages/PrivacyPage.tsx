import PageHeader from '@/components/PageHeader';
import { Card, CardContent } from '@/components/ui/card';

function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Privacy Policy" subtitle="Last updated 2026" />
      <Card>
        <CardContent className="flex flex-col gap-5 text-sm leading-relaxed text-muted-foreground">
          <p>
            AgriIntel is an early-stage product, currently in testing. This page explains, in
            plain language, what we collect and why. It will be reviewed by a lawyer and
            expanded before AgriIntel is available more widely — if anything here is unclear,
            just ask us (see the contact form on the home page).
          </p>

          <div>
            <p className="font-medium text-foreground">What we collect</p>
            <ul className="mt-1.5 list-disc space-y-1 pl-5">
              <li>Photos you upload for a plant health check</li>
              <li>Field details you enter for a harvest estimate (crop, state, season, area, and similar)</li>
              <li>Soil test readings you enter for a soil health check</li>
              <li>Your name, email, and message if you use the contact form</li>
            </ul>
          </div>

          <div>
            <p className="font-medium text-foreground">Why we collect it</p>
            <p className="mt-1.5">
              To generate the check, estimate, or advisory you asked for, and to keep a history
              of your past checks so you can look back on them. We also use this information,
              in aggregate, to understand how well our models are performing and where they
              need to improve — this is central to how we make AgriIntel more accurate over
              time.
            </p>
          </div>

          <div>
            <p className="font-medium text-foreground">Who sees it</p>
            <p className="mt-1.5">
              Your data is processed by our team. Soil health advisories are generated with the
              help of a third-party AI provider (Groq); the soil readings and results needed to
              generate your advisory are sent to them for that purpose only. We do not sell your
              data.
            </p>
          </div>

          <div>
            <p className="font-medium text-foreground">Your choices</p>
            <p className="mt-1.5">
              You can ask us to delete your data at any time — reach out through the contact
              form and we'll take care of it.
            </p>
          </div>

          <p className="text-xs">
            This policy will evolve as AgriIntel grows, including a full legal review before
            commercial launch. Questions? Use the contact form on the home page.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default PrivacyPage;
