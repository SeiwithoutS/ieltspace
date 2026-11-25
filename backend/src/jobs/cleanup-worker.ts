export function startCleanupWorker(run: () => Promise<{ failed: number }>, intervalMs: number, name: string) {
  let current: Promise<void> | undefined;
  function tick() {
    if (current) return;
    current = Promise.resolve().then(run).then(result => {
      if (result.failed) console.error(`${name} will retry files that could not be removed.`);
    }).catch(() => {
      console.error(`${name} could not finish. The worker will retry.`);
    }).finally(() => { current = undefined; });
  }
  tick();
  const timer = setInterval(tick, intervalMs).unref();
  return async () => {
    clearInterval(timer);
    await current;
  };
}
