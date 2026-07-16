import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Camera, RotateCcw, Upload } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import PageIntroBanner from '@/components/PageIntroBanner';
import ConfidenceBadge from '@/components/ConfidenceBadge';
import ResultIntro from '@/components/ResultIntro';
import LeafIllustration from '@/components/illustrations/LeafIllustration';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { getDiseaseModels, predictDisease } from '@/services/disease';
import { getErrorMessage } from '@/lib/apiError';
import { DISEASE_MODEL_LABELS, DISEASE_TREATMENT } from '@/mocks/diseaseMock';
import type { DiseaseModel, DiseasePredictionResponse } from '@/types/disease';

type Status = 'idle' | 'ready' | 'loading' | 'done';

function DiseasePage() {
  const [models, setModels] = useState<DiseaseModel[]>([]);
  const [selectedModel, setSelectedModel] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [file, setFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [result, setResult] = useState<DiseasePredictionResponse | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getDiseaseModels()
      .then((res) => {
        setModels(res.models);
        setSelectedModel(res.active_model);
      })
      .catch((err) => toast.error(getErrorMessage(err)));
  }, []);

  function handleFile(selected: File) {
    setFile(selected);
    setImageUrl(URL.createObjectURL(selected));
    setStatus('ready');
    setResult(null);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped && dropped.type.startsWith('image/')) handleFile(dropped);
  }

  async function handleCheck() {
    if (!file) return;
    setStatus('loading');
    try {
      const res = await predictDisease(file, selectedModel);
      setResult(res);
      setStatus('done');
    } catch (err) {
      toast.error(getErrorMessage(err));
      setStatus('ready');
    }
  }

  function handleReset() {
    setFile(null);
    setImageUrl(null);
    setResult(null);
    setStatus('idle');
  }

  const treatment = result ? DISEASE_TREATMENT[result.prediction.class_name] : null;
  const isHealthy = result?.prediction.class_name === 'Healthy';

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="What's wrong with my plant?" subtitle="Take or upload a photo of a leaf" />

      <PageIntroBanner illustration={<LeafIllustration className="size-full" />}>
        Take a clear photo in daylight, close up on the affected leaf. We'll look at it
        and explain what's going on in plain language — no guesswork needed.
      </PageIntroBanner>

      <div className="flex flex-col gap-5">
        <div className="max-w-56">
          <label className="mb-1.5 block text-sm font-medium text-foreground">Model</label>
          <Select
            value={selectedModel}
            onValueChange={(value) => value && setSelectedModel(value)}
            disabled={models.length === 0}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Choose a model">
                {(value: string | null) => (value ? DISEASE_MODEL_LABELS[value] ?? value : 'Choose a model')}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {models.map((m) => (
                <SelectItem key={m.name} value={m.name}>
                  {DISEASE_MODEL_LABELS[m.name] ?? m.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Card>
          <CardContent>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => {
                const selected = e.target.files?.[0];
                if (selected) handleFile(selected);
              }}
            />
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
              className={cn(
                'flex min-h-56 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border text-center transition-colors',
                dragOver && 'border-primary bg-primary/5'
              )}
            >
              {imageUrl ? (
                <img src={imageUrl} alt="Uploaded leaf" className="max-h-56 rounded-md object-contain" />
              ) : (
                <>
                  <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Camera className="size-6" />
                  </span>
                  <p className="text-sm font-medium text-foreground">Tap to take or upload a photo</p>
                  <p className="text-xs text-muted-foreground">JPG or PNG</p>
                </>
              )}
            </div>

            {status === 'ready' && (
              <Button className="mt-4 w-full" size="lg" onClick={handleCheck}>
                <Upload className="size-4" />
                Check my plant
              </Button>
            )}
            {status === 'loading' && (
              <Button className="mt-4 w-full" size="lg" disabled>
                Looking closely at your photo…
              </Button>
            )}
          </CardContent>
        </Card>

        {status === 'loading' && (
          <Card>
            <CardContent className="flex flex-col gap-3">
              <p className="text-sm text-muted-foreground">Taking a close look, one moment…</p>
              <Skeleton className="h-6 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-16 w-full" />
            </CardContent>
          </Card>
        )}

        {status === 'done' && result && treatment && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: 'easeOut' }}>
            <Card>
              <CardContent className="flex flex-col gap-4">
                <ResultIntro>We looked closely at your photo</ResultIntro>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-heading text-xl text-foreground">
                    {isHealthy ? 'Good news — your plant looks healthy' : `Looks like: ${result.prediction.class_name}`}
                  </p>
                  <ConfidenceBadge
                    confidence={result.prediction.confidence}
                    lowConfidenceWarning={result.prediction.low_confidence_warning}
                  />
                </div>
                {!isHealthy && (
                  <div className="rounded-lg bg-muted p-4">
                    <p className="text-sm font-medium text-foreground">Here's what we'd suggest</p>
                    <p className="mt-1 text-sm text-muted-foreground">{treatment.advice}</p>
                  </div>
                )}
                <Button variant="outline" onClick={handleReset}>
                  <RotateCcw className="size-4" />
                  Check another plant
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default DiseasePage;
