import React from "react";
import ErrorDisplay from './ErrorDisplay';
import { logger } from '../../lib/utils/logger';

export type DataLoaderProps<T> = {
  fetchData: () => Promise<T>;
  onData?: (data: T) => void;
  children: (data: T) => React.ReactNode;
};

/**
 * Generic data loading component.
 *
 * The consumer provides a fetch function and a render prop to handle the result.
 */
export function DataLoader<T>({ fetchData, onData, children }: DataLoaderProps<T>) {
  const [data, setData] = React.useState<T | null>(null);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    let mounted = true;
    fetchData()
      .then(result => {
        if (mounted) {
          logger.log('DATA', 'Loaded data');
          setData(result);
          onData?.(result);
        }
      })
      .catch(err => {
        logger.error('DATA', 'DataLoader error', err);
        if (mounted) {
          setError(err as Error);
        }
      });
    return () => {
      mounted = false;
    };
  }, [fetchData, onData]);

  if (error) return <ErrorDisplay message={error.message} />;
  if (data === null) return <div>Loading...</div>;
  return <>{children(data)}</>;
}
