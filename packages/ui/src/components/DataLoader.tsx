import React from "react";
import ErrorDisplay from './ErrorDisplay';

export type DataLoaderProps<T> = {
  fetchData: () => Promise<T>;
  onData?: (data: T) => void;
  children: (data: T) => React.ReactNode;
  loadingFallback?: React.ReactNode;
  renderError?: (error: Error) => React.ReactNode;
};

/**
 * Generic data loading component.
 *
 * The consumer provides a fetch function and a render prop to handle the result.
 */
export function DataLoader<T>({
  fetchData,
  onData,
  children,
  loadingFallback = <div>Loading...</div>,
  renderError
}: DataLoaderProps<T>) {
  const [data, setData] = React.useState<T | null>(null);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    let mounted = true;
    fetchData()
      .then(result => {
        if (mounted) {
          setData(result);
          onData?.(result);
        }
      })
      .catch(err => {
        if (mounted) {
          setError(err as Error);
        }
      });
    return () => {
      mounted = false;
    };
  }, [fetchData, onData]);

  if (error) return <>{renderError ? renderError(error) : <ErrorDisplay message={error.message} />}</>;
  if (data === null) return <>{loadingFallback}</>;
  return <>{children(data)}</>;
}
