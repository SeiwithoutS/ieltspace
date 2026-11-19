let activeGuard: (() => boolean) | null = null;

export function registerNavigationGuard(guard: () => boolean): () => void {
  activeGuard = guard;
  return () => {
    if (activeGuard === guard) activeGuard = null;
  };
}

export function canNavigate(): boolean {
  return activeGuard?.() ?? true;
}
