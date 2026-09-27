import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import Overview from './pages/Overview.jsx';
import CaptionsPage from './pages/CaptionsPage.jsx';
import ComingSoonPage from './pages/ComingSoonPage.jsx';

// Every tool's `path` in lib/tools.js is "/<id>", so one dynamic ":toolId"
// route covers all of them — ComingSoonPage looks itself up by that id.
// Captions is the only tool with a real page, so it's routed explicitly.
export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Overview />} />
        <Route path="captions" element={<CaptionsPage />} />
        <Route path=":toolId" element={<ComingSoonPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
