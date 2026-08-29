import { useRef } from 'react';
import useSession from '../../../hooks/session';
import useLoading from '../../../hooks/loading-overlay';
import usePage from '../../../hooks/page';

import { PageId } from '../..';


export default function RenameAppForm() {
  const session = useSession();
  const loading = useLoading();
  const { page } = usePage();

  const ref = useRef(null);

  const renamApp = async () => {
    if (page.id !== PageId.DevelopersApps || !page.appId)
      return;

    const form: HTMLFormElement = ref.current!;

    const newName: string = form['data-name'].value!;

    const promise = (async () =>
      await session.renameApp(page.appId!, newName)
    )();
    const res = await loading(() => promise);

    if (!res.ok)
      alert(res.error.message);
    else
      alert('success');
  };

  return (
    <>
      <form
        onSubmit={(e) => { e.preventDefault(); renamApp(); }}
        ref={ref}
        >
        <input name="data-name" placeholder="new name" />

        <input type="submit" value="rename" />
      </form>
    </>
  );
}
