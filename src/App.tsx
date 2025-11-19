import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { DataProvider } from './contexts/DataContext';
import { Home } from './pages/Home';
import { FullRules } from './pages/FullRules';
import { Wiki } from './pages/Wiki';
import { CharacterSheets } from './pages/CharacterSheets';
import { TheWorld } from './pages/TheWorld';
import { GMResources } from './pages/GMResources';
import { Blog } from './pages/Blog';
import { NotFound } from './pages/NotFound';
import './styles/index.css';

function App() {
  return (
    <ThemeProvider>
      <DataProvider>
        <BrowserRouter basename="/Arcus">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/full-rules" element={<FullRules />} />
            <Route path="/wiki" element={<Wiki />} />
            <Route path="/character-sheets" element={<CharacterSheets />} />
            <Route path="/the-world" element={<TheWorld />} />
            <Route path="/gm-resources" element={<GMResources />} />
            <Route path="/blog" element={<Blog />} />
            {/* Catch-all route for unmatched paths */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </DataProvider>
    </ThemeProvider>
  );
}

export default App;

