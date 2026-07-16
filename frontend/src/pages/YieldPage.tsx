import { useEffect, useState, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Controller, useForm } from 'react-hook-form';
import PageHeader from '@/components/PageHeader';
import PageIntroBanner from '@/components/PageIntroBanner';
import ResultIntro from '@/components/ResultIntro';
import HarvestIllustration from '@/components/illustrations/HarvestIllustration';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CROPS, STATES, SEASONS } from '@/mocks/formOptions';
import { YIELD_MODEL_LABELS } from '@/mocks/yieldMock';
import { getYieldModels, predictYield } from '@/services/yield';
import { getErrorMessage } from '@/lib/apiError';
import { useCountUp } from '@/lib/useCountUp';
import type { YieldModel, YieldPredictRequest, YieldPredictionResponse } from '@/types/yield';

interface FormValues {
  model: string;
  crop: string;
  state: string;
  season: string;
  annual_rainfall: string;
  area: string;
  fertilizer: string;
  pesticide: string;
  year: string;
}

const CURRENT_YEAR = new Date().getFullYear();

function YieldPage() {
  const [models, setModels] = useState<YieldModel[]>([]);
  const [result, setResult] = useState<YieldPredictionResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    control,
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      model: '',
      crop: CROPS[0],
      state: STATES[0],
      season: SEASONS[0],
      annual_rainfall: '1180',
      area: '2.4',
      fertilizer: '142',
      pesticide: '0.38',
      year: String(CURRENT_YEAR),
    },
  });

  useEffect(() => {
    getYieldModels()
      .then((res) => {
        setModels(res.models);
        setValue('model', res.default_model);
      })
      .catch((err) => toast.error(getErrorMessage(err)));
  }, [setValue]);

  async function onSubmit(values: FormValues) {
    setLoading(true);
    const request: YieldPredictRequest = {
      crop: values.crop,
      state: values.state,
      season: values.season,
      annual_rainfall: Number(values.annual_rainfall),
      area: Number(values.area),
      fertilizer: Number(values.fertilizer),
      pesticide: Number(values.pesticide),
      year: Number(values.year),
      model: values.model,
    };
    try {
      const res = await predictYield(request);
      setResult(res);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="How much can I expect to harvest?" subtitle="Enter your crop and field details" />

      <PageIntroBanner illustration={<HarvestIllustration className="size-full" />}>
        Fill in your crop and field details below. It only takes a minute, and you'll
        get a clear number you can plan your season around.
      </PageIntroBanner>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        <Card>
          <CardContent className="flex flex-col gap-4">
            <Field label="Model">
              <Controller
                name="model"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange} disabled={models.length === 0}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Choose a model">
                        {(value: string | null) => (value ? YIELD_MODEL_LABELS[value] ?? value : 'Choose a model')}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {models.map((m) => (
                        <SelectItem key={m.key} value={m.key}>
                          {YIELD_MODEL_LABELS[m.key] ?? m.algorithm}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Field label="Crop">
                <Controller
                  name="crop"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CROPS.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </Field>
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
                        {STATES.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </Field>
              <Field label="Season">
                <Controller
                  name="season"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SEASONS.map((s) => (
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

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <Field label="Year">
                <Input type="number" {...register('year', { required: true })} />
              </Field>
              <Field label="Rainfall (mm)">
                <Input type="number" {...register('annual_rainfall', { required: true })} />
              </Field>
              <Field label="Area (ha)">
                <Input type="number" step="0.01" {...register('area', { required: true })} />
              </Field>
              <Field label="Fertiliser (kg/ha)">
                <Input type="number" step="0.01" {...register('fertilizer', { required: true })} />
              </Field>
            </div>
            <Field label="Pesticide (kg/ha)">
              <Input type="number" step="0.01" className="max-w-40" {...register('pesticide', { required: true })} />
            </Field>

            {Object.keys(errors).length > 0 && (
              <p className="text-sm text-destructive">Please fill in every field before predicting.</p>
            )}

            <Button type="submit" size="lg" disabled={loading}>
              {loading ? 'Working it out…' : 'Predict my harvest'}
            </Button>
          </CardContent>
        </Card>
      </form>

      {result && <YieldResultCard result={result} />}
    </div>
  );
}

function YieldResultCard({ result }: { result: YieldPredictionResponse }) {
  const animatedValue = useCountUp(result.predicted_yield);

  return (
    <motion.div
      className="mt-5"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <Card>
        <CardContent>
          <ResultIntro>Based on what you shared, here's our best estimate</ResultIntro>
          <p className="text-sm font-medium text-muted-foreground">Expected yield</p>
          <p className="font-serif text-4xl text-primary">{animatedValue.toFixed(2)}</p>
          <p className="mt-1 text-sm text-muted-foreground">{result.unit}</p>
        </CardContent>
      </Card>
    </motion.div>
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

export default YieldPage;
