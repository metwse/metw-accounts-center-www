import { createContext, useContext } from 'react';

import { Session } from '../lib/metw';


export const SessionContext = createContext<null | Session>(null);

export default function useSession() {
  const session = useContext(SessionContext);

  if (!session)
    throw 'Must use within SessionContext'

  return session;
}
