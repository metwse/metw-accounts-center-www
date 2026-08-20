import useSessionNavigation from './hooks/session-navigation';

import Header from './components/header';
import PageContent from './pages/page-content';


export default function App() {
  useSessionNavigation();

  return (
    <>
      <Header />

      <PageContent />
    </>
  );
}
