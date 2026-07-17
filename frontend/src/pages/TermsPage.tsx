import PageHeader from '@/components/PageHeader';
import { Card, CardContent } from '@/components/ui/card';

function TermsPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Terms of Use" subtitle="Last updated 2026" />
      <Card>
        <CardContent className="flex flex-col gap-5 text-sm leading-relaxed text-muted-foreground">
          <p>
            AgriIntel is an early-stage product, currently in testing. These terms will be
            reviewed by a lawyer and expanded before AgriIntel is available more widely — this
            is a plain-language first version, not a substitute for that review.
          </p>

          <div>
            <p className="font-medium text-foreground">What AgriIntel is</p>
            <p className="mt-1.5">
              AgriIntel gives you AI-generated readings on plant health, expected harvest, and
              soil health, based on photos and details you provide. These are our best-effort
              estimates, not a certified diagnosis or a guarantee — they're meant to help you
              make a more informed decision, alongside your own judgment and, where the stakes
              are high, expert advice from an agronomist or your local agricultural extension
              office.
            </p>
          </div>

          <div>
            <p className="font-medium text-foreground">Accuracy</p>
            <p className="mt-1.5">
              We work to make our models as accurate as we can, and we show a confidence level
              with plant health and soil health results so you know how sure we are. Even so, no
              AI model is right every time. We're not liable for crop, financial, or other loss
              that results from a decision made using AgriIntel.
            </p>
          </div>

          <div>
            <p className="font-medium text-foreground">Using AgriIntel fairly</p>
            <p className="mt-1.5">
              Please don't try to overload, scrape, or abuse the service. We may limit or
              suspend access for use that harms the service or other users.
            </p>
          </div>

          <div>
            <p className="font-medium text-foreground">Changes</p>
            <p className="mt-1.5">
              AgriIntel is currently free to use while we're testing and improving it. That may
              change as the product matures — we'll be upfront if and when it does, and these
              terms will be updated accordingly.
            </p>
          </div>

          <p className="text-xs">Questions? Use the contact form on the home page.</p>
        </CardContent>
      </Card>
    </div>
  );
}

export default TermsPage;
