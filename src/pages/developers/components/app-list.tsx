import usePage from '../../../hooks/page';

import { PageId } from '../..';

import type { BasicAppInfoResponse } from '../../../lib/metw-types';

import styles from '../style.module.scss';
import { AppLink } from '../../../components/app-link';


export default function AppList(
  { apps }: { apps: BasicAppInfoResponse[] | null }
) {
  const { navigate } = usePage();

  return (
    <div className={styles['list']}>
      { apps ? (apps.length === 0 ? 'you do not have any registered applications' :
        <ul>
        { apps.map(
            (app, i) => {
              return (
                <li key={i}>
                  <span>{app.name}</span>
                  <i>(application ID: {app.application_id})</i>
                  <AppLink
                    onClick={() => navigate({ id: PageId.DevelopersApps, appId: app.application_id })}
                    href={`/developers/apps?application_id=${app.application_id}`}
                    >details</AppLink>
                </li>
              );
            }
          ) }
        </ul>) : '...' }
    </div>
  );
}
