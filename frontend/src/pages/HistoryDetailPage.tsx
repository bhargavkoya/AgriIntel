import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import PageHeader from '@/components/PageHeader';
import ConfidenceBadge from '@/components/ConfidenceBadge';
import ResultIntro from '@/components/ResultIntro';
import LanguagePicker from '@/components/LanguagePicker';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { toRelativeTime } from '@/lib/relativeTime';
import { NUTRIENT_STATUS_TONE } from '@/lib/nutrientStatus';
import { getHistoryItem } from '@/services/history';
import { getErrorMessage } from '@/lib/apiError';
import { DISEASE_MODEL_LABELS, DISEASE_TREATMENT } from '@/mocks/diseaseMock';
import { YIELD_MODEL_LABELS } from '@/mocks/yieldMock';
import { NUTRIENT_CONFIG } from '@/mocks/soilMock';
import type { HistoryItem } from '@/types/history';
import type { DiseasePredictionResponse } from '@/types/disease';
import type { YieldPredictRequest, YieldPredictionResponse } from '@/types/yield';
import type { AdvisoryLanguage, SoilAdvisoryResponse } from '@/types/soil';

function titleForModule(moduleName: HistoryItem['module']): string {
  if (moduleName === 'disease') return "What's wrong with my plant?";
  if (moduleName === 'yield') return 'How much can I expect to harvest?';
  return 'Is my soil healthy?';
}

function HistoryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [item, setItem] = useState<HistoryItem | null | undefined>(undefined);
  const [language, setLanguage] = useState<AdvisoryLanguage>('English');

  useEffect(() => {
    if (!id) return;
    setItem(undefined);
    getHistoryItem(Number(id))
      .then(setItem)
      .catch((err) => {
        toast.error(getErrorMessage(err));
        setItem(null);
      });
  }, [id]);

  if (item === undefined) {
    return (
      <div className="mx-auto max-w-3xl">
        <PageHeader title="Past check" backTo="/history" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (item === null) {
    return (
      <div className="mx-auto max-w-3xl">
        <PageHeader title="We couldn't find that check" backTo="/history" />
        <p className="text-sm text-muted-foreground">It may have been removed. Head back and pick another one.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title={titleForModule(item.module)} subtitle={`Checked ${toRelativeTime(item.timestamp)}`} backTo="/history" />
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: 'easeOut' }}>
        {item.module === 'disease' && <DiseaseDetail item={item} />}
        {item.module === 'yield' && <YieldDetail item={item} />}
        {item.module === 'advisor' && <SoilDetail item={item} language={language} onLanguageChange={setLanguage} />}
      </motion.div>
    </div>
  );
}

function DiseaseDetail({ item }: { item: HistoryItem }) {
  const response = item.response_json as unknown as DiseasePredictionResponse;
  const treatment = DISEASE_TREATMENT[response.prediction.class_name];
  const isHealthy = response.prediction.class_name === 'Healthy';

  return (
    <Card>
      <CardContent className="flex flex-col gap-4">
        <ResultIntro>What we found in your photo</ResultIntro>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="font-heading text-xl text-foreground">
            {isHealthy ? 'Good news — your plant looked healthy' : `Looked like: ${response.prediction.class_name}`}
          </p>
          <ConfidenceBadge confidence={response.prediction.confidence} lowConfidenceWarning={response.prediction.low_confidence_warning} />
        </div>
        {!isHealthy && treatment && (
          <div className="rounded-lg bg-muted p-4">
            <p className="text-sm font-medium text-foreground">What we suggested</p>
            <p className="mt-1 text-sm text-muted-foreground">{treatment.advice}</p>
          </div>
        )}
        <p className="text-xs text-muted-foreground">
          Checked with {DISEASE_MODEL_LABELS[response.model_used] ?? response.model_used}
        </p>
      </CardContent>
    </Card>
  );
}

function YieldDetail({ item }: { item: HistoryItem }) {
  const response = item.response_json as unknown as YieldPredictionResponse;
  const request = item.request_json as unknown as YieldPredictRequest;

  return (
    <div className="flex flex-col gap-5">
      <Card>
        <CardContent>
          <ResultIntro>What we estimated for your field</ResultIntro>
          <p className="text-sm font-medium text-muted-foreground">Expected yield</p>
          <p className="font-serif text-4xl text-primary">{response.predicted_yield}</p>
          <p className="mt-1 text-sm text-muted-foreground">{response.unit}</p>
          <p className="mt-3 text-xs text-muted-foreground">
            Checked with {YIELD_MODEL_LABELS[response.model_used] ?? response.model_used}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardContent>
          <p className="mb-3 text-sm font-medium text-foreground">What you told us</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <DetailStat label="Crop" value={request.crop} />
            <DetailStat label="State" value={request.state} />
            <DetailStat label="Season" value={request.season} />
            <DetailStat label="Year" value={String(request.year)} />
            <DetailStat label="Rainfall" value={`${request.annual_rainfall} mm`} />
            <DetailStat label="Area" value={`${request.area} ha`} />
            <DetailStat label="Fertiliser" value={`${request.fertilizer} kg/ha`} />
            <DetailStat label="Pesticide" value={`${request.pesticide} kg/ha`} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function SoilDetail({
  item,
  language,
  onLanguageChange,
}: {
  item: HistoryItem;
  language: AdvisoryLanguage;
  onLanguageChange: (lang: AdvisoryLanguage) => void;
}) {
  const response = item.response_json as unknown as SoilAdvisoryResponse;

  return (
    <div className="flex flex-col gap-5">
      <Card>
        <CardContent className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <ResultIntro>What we found in your readings</ResultIntro>
            <p className="text-sm font-medium text-muted-foreground">Overall soil health</p>
            <p className="font-serif text-2xl text-foreground">{response.layer2.prediction}</p>
          </div>
          <ConfidenceBadge confidence={response.layer2.confidence} />
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <p className="mb-3 text-sm font-medium text-foreground">Nutrient by nutrient</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {NUTRIENT_CONFIG.map((n) => {
              const entry = response.layer1.nutrient_statuses[n.key];
              if (!entry) return null;
              return (
                <div key={n.key} className="rounded-lg border border-border bg-muted/40 p-3">
                  <p className="text-xs text-muted-foreground">{n.label}</p>
                  <p className="mt-0.5 text-sm font-semibold text-foreground">
                    {entry.value}
                    {n.unit && <span className="ml-0.5 text-xs font-normal text-muted-foreground">{n.unit}</span>}
                  </p>
                  <Badge className={cn('mt-1.5 border-transparent font-medium', NUTRIENT_STATUS_TONE[entry.status])}>
                    {entry.status}
                  </Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {response.layer3 && (
        <Card>
          <CardContent className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-medium text-foreground">What we suggested</p>
              <LanguagePicker value={language} onChange={onLanguageChange} />
            </div>
            <p className="border-l-2 border-primary pl-3 text-sm leading-relaxed text-foreground">
              {response.layer3.advisories[language]}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function DetailStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-muted/40 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}

export default HistoryDetailPage;
