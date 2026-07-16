import { useState, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Controller, useForm } from 'react-hook-form';
import PageHeader from '@/components/PageHeader';
import PageIntroBanner from '@/components/PageIntroBanner';
import ConfidenceBadge from '@/components/ConfidenceBadge';
import ResultIntro from '@/components/ResultIntro';
import LanguagePicker from '@/components/LanguagePicker';
import SoilIllustration from '@/components/illustrations/SoilIllustration';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { NUTRIENT_STATUS_TONE } from '@/lib/nutrientStatus';
import { SOIL_STATES, SOIL_TYPES } from '@/mocks/formOptions';
import { NUTRIENT_CONFIG } from '@/mocks/soilMock';
import { getSoilAdvice } from '@/services/soil';
import { getErrorMessage } from '@/lib/apiError';
import type { AdvisoryLanguage, SoilAdvisoryRequest, SoilAdvisoryResponse } from '@/types/soil';

interface FormValues {
  state: string;
  soil_type: string;
  rainfall: string;
  temperature: string;
  ph: string;
  organic_carbon: string;
  nitrogen: string;
  phosphorus: string;
  potassium: string;
  sulphur: string;
  zinc: string;
  boron: string;
  iron: string;
  manganese: string;
  copper: string;
}

const NUTRIENT_DEFAULTS: Record<string, string> = {
  ph: '6.5',
  organic_carbon: '0.62',
  nitrogen: '185',
  phosphorus: '22',
  potassium: '210',
  sulphur: '8',
  zinc: '0.65',
  boron: '0.38',
  iron: '4.8',
  manganese: '2.1',
  copper: '0.9',
};

type Step = 'info' | 'nutrients';

function SoilPage() {
  const [step, setStep] = useState<Step>('info');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SoilAdvisoryResponse | null>(null);
  const [language, setLanguage] = useState<AdvisoryLanguage>('English');

  const { control, register, handleSubmit } = useForm<FormValues>({
    defaultValues: {
      state: SOIL_STATES[0],
      soil_type: SOIL_TYPES[0],
      rainfall: '800',
      temperature: '28',
      ...NUTRIENT_DEFAULTS,
    },
  });

  async function onSubmit(values: FormValues) {
    setLoading(true);
    const round2 = (value: string) => Math.round(Number(value) * 100) / 100;
    const request: SoilAdvisoryRequest = {
      state: values.state,
      soil_type: values.soil_type,
      ph: round2(values.ph),
      organic_carbon: round2(values.organic_carbon),
      nitrogen: round2(values.nitrogen),
      phosphorus: round2(values.phosphorus),
      potassium: round2(values.potassium),
      sulphur: round2(values.sulphur),
      zinc: round2(values.zinc),
      boron: round2(values.boron),
      iron: round2(values.iron),
      manganese: round2(values.manganese),
      copper: round2(values.copper),
      rainfall: Number(values.rainfall),
      temperature: Number(values.temperature),
      generate_llm: true,
    };
    try {
      const res = await getSoilAdvice(request);
      setResult(res);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Is my soil healthy?" subtitle="Enter your soil test readings" />

      <PageIntroBanner illustration={<SoilIllustration className="size-full" />}>
        Enter the readings from your soil test. We'll explain what each nutrient means
        for your field and what to add — in the language you're most comfortable with.
      </PageIntroBanner>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        {step === 'info' && (
          <Card>
            <CardContent className="flex flex-col gap-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="State">
                  <Controller
                    name="state"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {SOIL_STATES.map((s) => (
                            <SelectItem key={s} value={s}>
                              {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </Field>
                <Field label="Soil type">
                  <Controller
                    name="soil_type"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {SOIL_TYPES.map((s) => (
                            <SelectItem key={s} value={s}>
                              {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Rainfall (mm)">
                  <Input type="number" step="any" {...register('rainfall')} />
                </Field>
                <Field label="Temperature (°C)">
                  <Input type="number" step="any" {...register('temperature')} />
                </Field>
              </div>
              <Button type="button" size="lg" onClick={() => setStep('nutrients')}>
                Next: nutrient readings
              </Button>
            </CardContent>
          </Card>
        )}

        {step === 'nutrients' && (
          <Card>
            <CardContent className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {NUTRIENT_CONFIG.map((n) => (
                  <Field key={n.key} label={`${n.label}${n.unit ? ` (${n.unit})` : ''}`}>
                    <Input type="number" step="any" {...register(n.key as keyof FormValues, { required: true })} />
                  </Field>
                ))}
              </div>
              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={() => setStep('info')}>
                  Back
                </Button>
                <Button type="submit" size="lg" className="flex-1" disabled={loading}>
                  {loading ? 'Checking your soil…' : 'Check my soil'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </form>

      {result && (
        <div className="mt-5 flex flex-col gap-5">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: 'easeOut' }}>
            <Card>
              <CardContent className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <ResultIntro>We went through your readings carefully</ResultIntro>
                  <p className="text-sm font-medium text-muted-foreground">Overall soil health</p>
                  <p className="font-serif text-2xl text-foreground">{result.layer2.prediction}</p>
                </div>
                <ConfidenceBadge confidence={result.layer2.confidence} />
              </CardContent>
            </Card>
          </motion.div>

          <Card>
            <CardContent>
              <p className="mb-3 text-sm font-medium text-foreground">Nutrient by nutrient</p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {NUTRIENT_CONFIG.map((n, i) => {
                  const entry = result.layer1.nutrient_statuses[n.key];
                  if (!entry) return null;
                  return (
                    <motion.div
                      key={n.key}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: i * 0.05, ease: 'easeOut' }}
                      className="rounded-lg border border-border bg-muted/40 p-3"
                    >
                      <p className="text-xs text-muted-foreground">{n.label}</p>
                      <p className="mt-0.5 text-sm font-semibold text-foreground">
                        {entry.value}
                        {n.unit && <span className="ml-0.5 text-xs font-normal text-muted-foreground">{n.unit}</span>}
                      </p>
                      <Badge className={cn('mt-1.5 border-transparent font-medium', NUTRIENT_STATUS_TONE[entry.status])}>
                        {entry.status}
                      </Badge>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {result.layer3 && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2, ease: 'easeOut' }}>
              <Card>
                <CardContent className="flex flex-col gap-3">
                  <ResultIntro>Written with your field in mind</ResultIntro>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm font-medium text-foreground">What should I do?</p>
                    <LanguagePicker value={language} onChange={setLanguage} />
                  </div>
                  <p className="border-l-2 border-primary pl-3 text-sm leading-relaxed text-foreground">
                    {result.layer3.advisories[language]}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <Label className="mb-1.5 block text-sm font-medium text-foreground">{label}</Label>
      {children}
    </div>
  );
}

export default SoilPage;
