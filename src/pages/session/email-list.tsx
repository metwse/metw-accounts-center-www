import { useState } from 'react';

import type { Session } from '../../lib/metw';
import type { AccountRes } from '../../lib/metw-types';
import type { AwaitOverlay } from '../../types';

import TurnstileWidget from '../../components/turnstile';

import styles from './style.module.scss';


export default function EmailList(
  { session, awaitOverlay, account }:
    { session: Session, awaitOverlay: AwaitOverlay, account: AccountRes | null }
) {
  return (
    <section className={styles['email-list']}>
      <h3>Your Emails</h3>

      { account ? <ul>
        <li><span>primary email: {account.email}</span></li>
        {
          account.secondary_emails.map(
            (email, i) => {
              const [captchaActive, setCaptchaActive] = useState(false);
              const [removed, setRemoved] = useState(false);

              const setPrimary = async (captcha: string) => {
                setCaptchaActive(false);

                const res = await awaitOverlay(
                  () => session.setPrimaryEmail({ email, captcha })
                );

                if (!res.ok)
                  alert(res.error.message);
                else
                  alert('check out your primay email\'s mailbox');
              };

              const remove = async () => {
                await awaitOverlay(() => session.deleteEmail({ email }));

                setRemoved(true);
              };

              return (
                <li key={i} style={{ display: removed ? 'none' : '' }}>
                  <span>{email}</span>
                  <button onClick={() => setCaptchaActive(true)}>set primary</button>
                  <button onClick={remove}>remove</button>
                  {captchaActive ? <div className={styles['captcha']}>
                    <TurnstileWidget callback={captcha => setPrimary(captcha)} />
                  </div> : null}
                </li>
              )
            }
          )
        }
      </ul> : null }
    </section>
  );
}
