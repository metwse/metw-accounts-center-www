import { Turnstile, useTurnstile } from 'react-turnstile';
import { Session } from './lib/metw';

/** @param {Session} session */
export default function App({ session }) {
  const turnstile = useTurnstile();

  return (
    <div>
      <Turnstile
        sitekey={import.meta.env.VITE_CLOUDFLARE_TURNSTILE_SITE_KEY}
        onVerify={(token) => {
          console.log(token);
        }}
        />

      test
    </div>
  );
}
