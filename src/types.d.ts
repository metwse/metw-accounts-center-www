import type { Session } from './lib/metw';


declare global {
  interface Window {
    session: Session
  }
}
