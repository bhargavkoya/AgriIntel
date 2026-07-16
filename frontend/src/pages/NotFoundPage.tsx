import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-center">
      <p className="font-serif text-2xl text-foreground">We couldn't find that page</p>
      <p className="text-sm text-muted-foreground">Let's get you back to something useful.</p>
      <Button onClick={() => navigate('/')}>Go home</Button>
    </div>
  );
}

export default NotFoundPage;
