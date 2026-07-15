import { Turnstile, useTurnstile } from 'react-turnstile';


export default function TurnstileWidget(
  { callback }: { callback: (token: string) => void }
) {
  const turnstile = useTurnstile();

  return (
    <Turnstile
      sitekey={import.meta.env.VITE_CLOUDFLARE_TURNSTILE_SITE_KEY}
      size="compact"
      onVerify={token => {
        callback(token);
        turnstile.reset();
      }}
    />
  );
}
