import SessionRouter from './pages/session-router';

import Header from './components/header';
import PageContent from './pages/page-content';


export default function App() {
  return (
    <>
      <SessionRouter />

      <Header />

      <PageContent />
    </>
  );
}
