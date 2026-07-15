export type AwaitOverlay = <T>(asyncTask: () => Promise<T>) => Promise<T>;
