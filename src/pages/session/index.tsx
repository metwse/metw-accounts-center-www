import { useEffect, useState } from 'react';

import type { Session } from '../../lib/metw';
import type { AccountRes } from '../../lib/metw-types';
import type { AwaitOverlay } from '../../types';


export default function SessionPage(
  { session, awaitOverlay }:
    { session: Session, awaitOverlay: AwaitOverlay }
) {
  const [me, setMe] = useState<null | AccountRes>(null);

  useEffect(() => {
    let ignore = false;

    async function fetchMe() {
      const res = await session.me();

      if (res.ok && !ignore)
        setMe(res.data);
    }

    fetchMe();

    () => ignore = true;
  }, [session]);

  return (
    <main>
      <h2>Hello, @{me?.username ?? '...'}!</h2>

      <section>
        <h3>Actions</h3>
        <div>
          <button onClick={
            () => { awaitOverlay(() => session.logout()); }
          }>logout</button>
        </div>
      </section>
    </main>
  );
}
