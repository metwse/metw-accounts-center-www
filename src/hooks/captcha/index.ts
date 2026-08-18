import { createContext, useContext } from 'react';


export const CaptchaContext = createContext<null | (() => Promise<string>)>(null);

export default function useCaptcha() {
  const captcha = useContext(CaptchaContext);

  if (captcha === null)
    throw new Error('Must use within CaptchaContext');

  return captcha;
}
