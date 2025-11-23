export const isDebugMode = (): boolean => {
  if (typeof window !== 'undefined') {
    return new URLSearchParams(window.location.search).get('debug') === 'true';
  }
  return false;
};

export const logger = {
  log(tag: string, ...args: unknown[]) {
    if (isDebugMode()) {
      console.log(`[${tag}]`, ...args);
    }
  },
  warn(tag: string, ...args: unknown[]) {
    if (isDebugMode()) {
      console.warn(`[${tag}]`, ...args);
    }
  },
  error(tag: string, ...args: unknown[]) {
    if (isDebugMode()) {
      console.error(`[${tag}]`, ...args);
    }
  }
};

