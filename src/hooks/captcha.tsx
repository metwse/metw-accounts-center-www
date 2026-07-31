import { createContext, useContext, useRef, useState, type ReactNode } from 'react';

import { Turnstile, useTurnstile } from 'react-turnstile';


const CaptchaContext = createContext<null | (() => Promise<string>)>(null);

export function CaptchaProvider(
  { children }: { children: ReactNode | ReactNode[] }
) {
  const [captchaActive, setCaptchaActive] = useState(false);
  const resolveRef = useRef<((token: string) => void) | null>(null);
  const turnstile = useTurnstile();

  const executeCaptcha = () => {
    return new Promise(
      (res: (res: string) => void) => {
        resolveRef.current = res;
        setCaptchaActive(true)
      }
    );
  };

  const onVerify = (token: string) => {
    if (resolveRef.current) {
      resolveRef.current(token);
      resolveRef.current = null;

      turnstile.reset();
    }

    setCaptchaActive(false);
  };

  return (
    <CaptchaContext value={executeCaptcha}>
      { captchaActive ?
        <div style={{
          display: 'flex',
          position: 'absolute', inset: 0,
          justifyContent: 'center', alignItems: 'center'
          }}>
          <Turnstile
            sitekey={import.meta.env.VITE_CLOUDFLARE_TURNSTILE_SITE_KEY}
            size="compact"
            onVerify={onVerify}
            />
        </div> : null }

      { children }
    </CaptchaContext>
  );
}

export default function useCaptcha() {
  const captcha = useContext(CaptchaContext);

  if (captcha === null)
    throw 'Must use within CaptchaContext';

  return captcha;
}
