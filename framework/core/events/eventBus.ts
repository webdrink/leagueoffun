/**
 * EventBus
 * Lightweight pub/sub system for framework + game modules.
 * Each publish is synchronous; subscribers should keep handlers fast.
 */
export type GameEvent =
  | { type: 'LIFECYCLE/INIT'; meta?: Record<string, unknown> }
  | { type: 'LIFECYCLE/READY' }
  | { type: 'PHASE/ENTER'; phaseId: string }
  | { type: 'PHASE/EXIT'; phaseId: string }
  | { type: 'ACTION/DISPATCH'; action: string; payload?: unknown }
  | { type: 'CONTENT/NEXT'; index: number }
  | { type: 'GAME/COMPLETE'; summary?: unknown }
  | { type: 'ERROR'; error: string; meta?: Record<string, unknown> };

export type EventBusSubscriber = (evt: GameEvent) => void;

export interface EventBus {
  publish: (evt: GameEvent) => void;
  subscribe: (fn: EventBusSubscriber) => () => void;
  clear: () => void;
  count: () => number;
}

export function createEventBus(): EventBus {
  const subs = new Set<EventBusSubscriber>();
  return {
    publish(evt) {
      subs.forEach(fn => {
        try {
          fn(evt);
        } catch (err) {
          // Last resort logging; framework consumers can subscribe to ERROR events
          // eslint-disable-next-line no-console
          console.error('[EventBus] subscriber error', err);
        }
      });
    },
    subscribe(fn) {
      subs.add(fn);
      return () => subs.delete(fn);
    },
    clear() { subs.clear(); },
    count() { return subs.size; }
  };
}
