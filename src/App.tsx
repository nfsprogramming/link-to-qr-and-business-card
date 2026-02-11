
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { Dashboard } from './pages/Dashboard';
import { CardEditor } from './pages/CardEditor';
import { PublicCard } from './pages/PublicCard';
import { Analytics } from './pages/Analytics';
import { QuickQR } from './pages/QuickQR';
import { Scan } from './pages/Scan';
import { AppLayout } from './layouts/AppLayout';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Card Route - No Layout (Full Screen) */}
        <Route path="/card/:id" element={<PublicCard />} />

        {/* App Routes with Layout */}
        <Route element={<AppLayout><Outlet /></AppLayout>}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/editor" element={<CardEditor />} />
          <Route path="/editor/:id" element={<CardEditor />} />
          <Route path="/analytics/:id" element={<Analytics />} />
          <Route path="/quick-qr" element={<QuickQR />} />
          <Route path="/scan" element={<Scan />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
