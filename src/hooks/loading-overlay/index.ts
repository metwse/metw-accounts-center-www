import { createContext, useContext } from 'react';


export const LoadingContext =
  createContext<null | (<T>(asyncTask: () => Promise<T>) => Promise<T>)>(null);

export default function useLoading() {
  const loading = useContext(LoadingContext);

  if (!loading)
    throw new Error('Must use within LoadingContext');

  return loading;
}
