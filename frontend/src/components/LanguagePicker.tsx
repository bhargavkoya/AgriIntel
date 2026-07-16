import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { AdvisoryLanguage } from '@/types/soil';

const LANGUAGES: { code: AdvisoryLanguage; label: string }[] = [
  { code: 'English', label: 'English' },
  { code: 'Hindi', label: 'हिंदी' },
  { code: 'Telugu', label: 'తెలుగు' },
];

function LanguagePicker({
  value,
  onChange,
}: {
  value: AdvisoryLanguage;
  onChange: (lang: AdvisoryLanguage) => void;
}) {
  return (
    <Tabs value={value} onValueChange={(v) => onChange(v as AdvisoryLanguage)}>
      <TabsList>
        {LANGUAGES.map((lang) => (
          <TabsTrigger key={lang.code} value={lang.code}>
            {lang.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}

export default LanguagePicker;
