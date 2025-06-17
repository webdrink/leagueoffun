import React from "react";

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

  React.useEffect(() => {
    let mounted = true;
    fetchData().then(result => {
      if (mounted) {
        setData(result);
        onData?.(result);
      }
    });
    return () => {
      mounted = false;
    };
  }, [fetchData]);

  if (data === null) return <div>Loading...</div>;
  return <>{children(data)}</>;
}
