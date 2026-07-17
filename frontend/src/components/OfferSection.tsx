import { useState } from 'react';
import { toast } from 'sonner';
import { Controller, useForm } from 'react-hook-form';
import { Camera, Languages, ShieldCheck, Wheat } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { submitContactMessage } from '@/services/contact';
import { getErrorMessage } from '@/lib/apiError';
import type { ContactRole } from '@/types/contact';

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
    title: 'No sign-up, no jargon',
    description: 'Just answers you can act on, in plain language.',
  },
];

const ROLE_OPTIONS: { value: ContactRole; label: string }[] = [
  { value: 'farmer', label: "I'm a farmer" },
  { value: 'partner', label: 'Partnership (FPO, cooperative, dealer, etc.)' },
  { value: 'investor_press', label: 'Investor or press' },
  { value: 'feedback', label: 'Feedback on a result' },
  { value: 'other', label: 'Something else' },
];

interface FormValues {
  name: string;
  email: string;
  role: ContactRole;
  message: string;
}

function OfferSection() {
  const [submitted, setSubmitted] = useState(false);
  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: { name: '', email: '', role: 'farmer', message: '' },
  });

  async function onSubmit(values: FormValues) {
    try {
      await submitContactMessage(values);
      setSubmitted(true);
      reset();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

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

      <div className="mt-8 border-t border-border pt-6">
        <p className="text-sm font-semibold text-foreground">Questions or feedback?</p>
        <p className="text-sm text-muted-foreground">
          Whether you're a farmer, a potential partner, or just curious — we'd love to hear from you.
        </p>

        {submitted ? (
          <div className="mt-4 rounded-lg bg-primary/10 p-4 text-sm text-foreground">
            Thanks — we've got your message and will get back to you soon.
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="mt-4 flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="contact-name" className="mb-1.5 block text-sm font-medium text-foreground">
                  Name
                </Label>
                <Input id="contact-name" {...register('name', { required: true })} />
              </div>
              <div>
                <Label htmlFor="contact-email" className="mb-1.5 block text-sm font-medium text-foreground">
                  Email
                </Label>
                <Input id="contact-email" type="email" {...register('email', { required: true })} />
              </div>
            </div>
            <div>
              <Label htmlFor="contact-role" className="mb-1.5 block text-sm font-medium text-foreground">
                I am...
              </Label>
              <Controller
                name="role"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={(v) => v && field.onChange(v)}>
                    <SelectTrigger className="w-full sm:max-w-xs">
                      <SelectValue>
                        {(value: string | null) => ROLE_OPTIONS.find((o) => o.value === value)?.label ?? 'Select one'}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {ROLE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div>
              <Label htmlFor="contact-message" className="mb-1.5 block text-sm font-medium text-foreground">
                Message
              </Label>
              <Textarea id="contact-message" rows={3} {...register('message', { required: true })} />
            </div>
            {Object.keys(errors).length > 0 && (
              <p className="text-sm text-destructive">Please fill in every field before sending.</p>
            )}
            <Button type="submit" disabled={isSubmitting} className="self-start">
              {isSubmitting ? 'Sending…' : 'Send message'}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}

export default OfferSection;
