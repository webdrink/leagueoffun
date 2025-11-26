/**
 * React hook to bridge StaticListProvider with React components.
 * Ensures components re-render when provider state changes.
 */
import { useState, useEffect, useCallback } from 'react';
import { getProvider } from '../games/nameblame/NameBlameModule';
// (No router hook needed here; provider state listens directly to global event bus)

interface EnrichedQuestion {
  text: string;
  categoryId: string;
  categoryName: string;
  categoryEmoji: string;
  questionId: string;
  id: string;
}

interface ProviderState {
  currentQuestion: EnrichedQuestion | null;
  progress: { index: number; total: number };
  isLoading: boolean;
}

export const useProviderState = () => {
  const [state, setState] = useState<ProviderState>({
    currentQuestion: null,
    progress: { index: 0, total: 0 },
    isLoading: true
  });
  
  const [updateTrigger, setUpdateTrigger] = useState(0);
  
  const refreshState = useCallback(() => {
    const provider = getProvider();
    if (provider) {
      setState({
        currentQuestion: provider.current(),
        progress: provider.progress(),
        isLoading: false
      });
      
      // Update window globals for test compatibility
      if (typeof window !== 'undefined') {
        const current = provider.current();
        const windowObj = window as unknown as Record<string, unknown>;
        if (current) {
          // Set questions array for tests
          windowObj.gameQuestions = [current];
          
          // Set categories in the expected format for tests
          windowObj.gameCategories = [{
            id: current.categoryId,
            name: current.categoryName,
            emoji: current.categoryEmoji,
            questions: [current.text]
          }];
        } else {
          windowObj.gameQuestions = [];
          windowObj.gameCategories = [];
        }
      }
    } else {
      setState({
        currentQuestion: null,
        progress: { index: 0, total: 0 },
        isLoading: true
      });
    }
  }, []);
  
  // Update state when provider changes
  useEffect(() => {
    refreshState();
  }, [refreshState, updateTrigger]);
  
  // Listen to EventBus CONTENT/NEXT and ACTION/DISPATCH events to trigger re-renders
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const eventBus = (window as unknown as { frameworkEventBus?: { subscribe: (callback: (event: { type: string }) => void) => () => void } }).frameworkEventBus;
      if (eventBus) {
        const unsubscribe = eventBus.subscribe((event) => {
          if (event.type === 'CONTENT/NEXT') {
            // eslint-disable-next-line no-console
            console.log('[useProviderState] CONTENT/NEXT received, refreshing provider state');
            setUpdateTrigger(prev => prev + 1);
          } else if (event.type === 'ACTION/DISPATCH' && 'action' in event && event.action === 'ADVANCE') {
            // Fallback in case CONTENT/NEXT was missed
            // eslint-disable-next-line no-console
            console.log('[useProviderState] ACTION/DISPATCH ADVANCE received');
            // Small timeout to allow provider.next side-effect in phase controller
            setTimeout(() => setUpdateTrigger(prev => prev + 1), 10);
          }
        });
        
        return unsubscribe;
      }
    }
  }, []);
  
  // Force re-render function for manual updates
  const forceUpdate = useCallback(() => {
    setUpdateTrigger(prev => prev + 1);
  }, []);
  
  // Provider control functions that trigger updates
  const advance = useCallback(() => {
    const provider = getProvider();
    if (provider) {
      provider.next();
      forceUpdate();
    }
  }, [forceUpdate]);
  
  const goBack = useCallback(() => {
    const provider = getProvider();
    if (provider) {
      provider.previous();
      forceUpdate();
    }
  }, [forceUpdate]);
  
  const reset = useCallback(() => {
    console.log('🔄 useProviderState: Resetting provider to beginning');
    // Reset provider to beginning
    const provider = getProvider();
    if (provider) {
      const currentIndex = provider.progress().index;
      console.log(`🔄 Current provider index: ${currentIndex}, resetting to 0`);
      
      // Reset to first question
      while (provider.progress().index > 0) {
        provider.previous();
      }
      
      const newIndex = provider.progress().index;
      console.log(`🔄 Provider reset complete. New index: ${newIndex}`);
      forceUpdate();
    }
  }, [forceUpdate]);
  
  return {
    ...state,
    advance,
    goBack,
    reset,
    forceUpdate,
    refreshState
  };
};