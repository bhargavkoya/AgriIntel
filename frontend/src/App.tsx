import { Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import HomePage from './pages/HomePage';
import DiseasePage from './pages/DiseasePage';
import YieldPage from './pages/YieldPage';
import SoilPage from './pages/SoilPage';
import HistoryPage from './pages/HistoryPage';
import HistoryDetailPage from './pages/HistoryDetailPage';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="disease" element={<DiseasePage />} />
        <Route path="yield" element={<YieldPage />} />
        <Route path="soil" element={<SoilPage />} />
        <Route path="history" element={<HistoryPage />} />
        <Route path="history/:id" element={<HistoryDetailPage />} />
        <Route path="privacy" element={<PrivacyPage />} />
        <Route path="terms" element={<TermsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default App;
