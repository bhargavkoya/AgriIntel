import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ChevronRight, Droplets, Leaf, Wheat } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getHistory } from '@/services/history';
import { getErrorMessage } from '@/lib/apiError';
import { summarizeHistoryItem } from '@/lib/historySummary';
import { toRelativeTime } from '@/lib/relativeTime';
import type { HistoryItem, HistoryModule } from '@/types/history';

const PAGE_SIZE = 20;

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
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<HistoryModule | 'all'>('all');
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    setItems(null);
    setPage(1);
    getHistory(1, PAGE_SIZE, filter === 'all' ? undefined : filter)
      .then((res) => {
        setItems(res.items);
        setTotal(res.total);
      })
      .catch((err) => {
        toast.error(getErrorMessage(err));
        setItems([]);
      });
  }, [filter]);

  async function handleLoadMore() {
    const nextPage = page + 1;
    setLoadingMore(true);
    try {
      const res = await getHistory(nextPage, PAGE_SIZE, filter === 'all' ? undefined : filter);
      setItems((prev) => [...(prev ?? []), ...res.items]);
      setTotal(res.total);
      setPage(nextPage);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoadingMore(false);
    }
  }

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

      {items !== null && items.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-8 text-center">
            <p className="text-sm text-muted-foreground">You haven't checked anything yet.</p>
            <Button onClick={() => navigate('/')}>Get started</Button>
          </CardContent>
        </Card>
      )}

      {items !== null && items.length > 0 && (
        <div className="flex flex-col gap-3">
          {items.map((item) => {
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

          {items.length < total && (
            <Button variant="outline" onClick={handleLoadMore} disabled={loadingMore}>
              {loadingMore ? 'Loading…' : 'Load more'}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export default HistoryPage;
