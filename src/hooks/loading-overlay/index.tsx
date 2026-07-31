import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';

import styles from './style.module.scss';


const LoadingContext =
  createContext<null | (<T>(asyncTask: () => Promise<T>) => Promise<T>)>(null);

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [count, setCount] = useState(0);

  const increment = useCallback(() => {
    setCount((prev) => prev + 1);
  }, []);

  const decrement = useCallback(() => {
    setCount((prev) => Math.max(0, prev - 1));
  }, []);

  const awaitAsync = useCallback(
    async <T,>(asyncTask: () => Promise<T>): Promise<T> => {
      increment();

      try {
        return await asyncTask();
      } finally {
        decrement();
      }
    }, [increment, decrement]
  );

  return (
    <LoadingContext value={awaitAsync}>
      {count > 0 ?
          <div className={styles['loading-overlay']}>
            <div></div>
          </div>
          : null
      }
      {children}
    </LoadingContext>
  )
}

export default function useLoading() {
  let loading = useContext(LoadingContext);

  if (!loading)
    throw 'Must use within LoadingContext';

  return loading;
}
