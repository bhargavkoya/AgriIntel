import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { confidenceToPhrase, type ConfidenceTone } from '@/lib/confidence';

const TONE_CLASSES: Record<ConfidenceTone, string> = {
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  muted: 'bg-muted text-muted-foreground',
};

function ConfidenceBadge({
  confidence,
  lowConfidenceWarning,
}: {
  confidence: number;
  lowConfidenceWarning?: boolean;
}) {
  const { label, tone } = confidenceToPhrase(confidence, lowConfidenceWarning);
  return <Badge className={cn('border-transparent font-medium', TONE_CLASSES[tone])}>{label}</Badge>;
}

export default ConfidenceBadge;
