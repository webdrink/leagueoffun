/**
 * useFrameworkEventBus Hook
 * Provides access to the framework EventBus for legacy components during migration.
 * Will be removed once App.tsx is fully migrated to modular flow.
 */
import { useEffect, useState } from 'react';
import type { EventBus } from '../framework/core/events/eventBus';

export function useFrameworkEventBus(): EventBus | null {
  const [eventBus, setEventBus] = useState<EventBus | null>(null);

  useEffect(() => {
    // Check for globally exposed EventBus
    const checkForEventBus = () => {
      const globalEventBus = (window as unknown as { frameworkEventBus?: EventBus }).frameworkEventBus;
      if (globalEventBus && !eventBus) {
        setEventBus(globalEventBus);
      }
    };

    checkForEventBus();
    
    // Check periodically in case EventBus is initialized after this hook
    const interval = setInterval(checkForEventBus, 100);
    
    // Clean up after 5 seconds to avoid infinite polling
    const timeout = setTimeout(() => clearInterval(interval), 5000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [eventBus]);

  return eventBus;
}