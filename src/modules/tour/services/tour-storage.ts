export function buildTourStorageKey(input: {
  scope: string;
  version: string;
  userId: string;
}): string {
  return `wegox:tour:${input.scope}:${input.version}:${input.userId}`;
}

export function isTourCompleted(key: string): boolean {
  if (typeof window === "undefined") return false;

  try {
    return window.localStorage.getItem(key) === "completed";
  } catch {
    return false;
  }
}

export function markTourCompleted(key: string): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(key, "completed");
  } catch {
    // Ignore storage errors to avoid blocking the UI.
  }
}
