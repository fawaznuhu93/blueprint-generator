import { GeneratorPage } from './pages/GeneratorPage';
import { initGA } from './utils/analytics';
import { useEffect } from 'react';

function App() {
  useEffect(() => {
    initGA();
  }, []);

  return <GeneratorPage />;
}

export default App;