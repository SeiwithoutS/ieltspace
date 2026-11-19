export const sampleHashReplaced = "ieltspace-sample-hash-replaced";

// The saved draft gets an ID without leaving or adding a history entry.
export function replaceSampleEditorHash(href: string): void {
  history.replaceState(history.state, "", href);
  window.dispatchEvent(new Event(sampleHashReplaced));
}
