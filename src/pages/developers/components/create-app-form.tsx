import { useRef, useState } from 'react';
import useCaptcha from '../../../hooks/captcha';
import useSession from '../../../hooks/session';
import useLoading from '../../../hooks/loading-overlay';

import type { BasicAppInfoResponse } from '../../../lib/metw-types';


export default function CreateAppForm(
  { pushApp }: { pushApp: (newApp: BasicAppInfoResponse) => void }
) {
  const session = useSession();
  const loading = useLoading();

  const [newApp, setNewApp] =
    useState<null | { clientSecret: string, name: string }>(null);

  const ref = useRef(null);

  const executeCaptcha = useCaptcha();

  const createApp = async () => {
    const form: HTMLFormElement = ref.current!;

    const captcha = await executeCaptcha();
    const name: string = form['data-name'].value!;

    const promise = (async () => await session.createApp({ name, captcha }))();
    const res = await loading(() => promise);

    if (!res.ok) {
      alert(res.error.message);
    } else {
      pushApp({ application_id: res.data.application_id, name });

      setNewApp({
        clientSecret: res.data.client_secret,
        name
      });
    }
  };

  return (
    <>
      <form
        onSubmit={(e) => { e.preventDefault(); createApp(); }}
        ref={ref}
        >
        <input name="data-name" placeholder="application name" />

        <input type="submit" value="create" />
      </form>

      { newApp ?
        <div>
          your new application {newApp.name} registered with client secret:
          <pre>
            {newApp.clientSecret}
          </pre>
          this value is shown only once -- save it!
        </div>
      : null}
    </>
  );
}
