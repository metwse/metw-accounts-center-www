import { useState } from 'react';
import useSession from '../../hooks/session';
import useLoading from '../../hooks/loading-overlay';
import useCaptcha from '../../hooks/captcha';

import type { AccountRes } from '../../lib/metw-types';


export default function EmailList(
  { account }: { account: AccountRes | null }
) {
  const session = useSession();
  const loading = useLoading();

  const executeCaptcha = useCaptcha();

  const [removed, setRemoved] = useState<number[]>([]);


  return (
    <>
      { account ? <ul>
        <li><span>primary email: {account.email}</span></li>
        {
          account.secondary_emails.map(
            (email, i) => {
              const setPrimary = async () => {
                const captcha = await executeCaptcha();

                const res = await loading(
                  () => session.setPrimaryEmail({ email, captcha })
                );

                if (!res.ok)
                  alert(res.error.message);
                else
                  alert('check out your primay email\'s mailbox');
              };

              const remove = async () => {
                const res = await loading(
                  () => session.deleteEmail({ email })
                );

                if (res.ok)
                  setRemoved(prev => [...prev, i]);
              };

              return (
                <li key={i} style={{ display: removed.includes(i) ? 'none' : '' }}>
                  <span>{email}</span>
                  <button onClick={() => setPrimary()}>set primary</button>
                  <button onClick={remove}>remove</button>
                </li>
              );
            }
          )
        }
      </ul> : null }
    </>
  );
}
