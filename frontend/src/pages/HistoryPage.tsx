import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight, Droplets, Leaf, Wheat } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getHistory } from '@/services/history';
import { summarizeHistoryItem } from '@/lib/historySummary';
import { toRelativeTime } from '@/lib/relativeTime';
import type { HistoryItem, HistoryModule } from '@/types/history';

const MODULE_ICON: Record<HistoryModule, typeof Leaf> = {
  disease: Leaf,
  yield: Wheat,
  advisor: Droplets,
};

const FILTERS: { value: HistoryModule | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'disease', label: 'Plant' },
  { value: 'yield', label: 'Harvest' },
  { value: 'advisor', label: 'Soil' },
];

function HistoryPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<HistoryItem[] | null>(null);
  const [filter, setFilter] = useState<HistoryModule | 'all'>('all');

  useEffect(() => {
    getHistory().then((res) => setItems(res.items));
  }, []);

  const visible = items?.filter((item) => filter === 'all' || item.module === filter) ?? [];

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="My past checks" subtitle="Everything you've checked, most recent first" />

      <Tabs value={filter} onValueChange={(v) => setFilter(v as HistoryModule | 'all')} className="mb-5">
        <TabsList>
          {FILTERS.map((f) => (
            <TabsTrigger key={f.value} value={f.value}>
              {f.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {items === null && (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      )}

      {items !== null && visible.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-8 text-center">
            <p className="text-sm text-muted-foreground">You haven't checked anything yet.</p>
            <Button onClick={() => navigate('/')}>Get started</Button>
          </CardContent>
        </Card>
      )}

      {items !== null && visible.length > 0 && (
        <div className="flex flex-col gap-3">
          {visible.map((item) => {
            const Icon = MODULE_ICON[item.module];
            return (
              <Link key={item.id} to={`/history/${item.id}`}>
                <Card className="transition-shadow hover:shadow-md hover:ring-1 hover:ring-primary/20">
                  <CardContent className="flex items-center gap-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="size-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">{summarizeHistoryItem(item)}</p>
                      <p className="text-xs text-muted-foreground">{toRelativeTime(item.timestamp)}</p>
                    </div>
                    <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default HistoryPage;
