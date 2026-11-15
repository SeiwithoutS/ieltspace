export function focusAttemptQuestion(number: number) {
  const target = document.querySelector<HTMLElement>(
    `.attempt-screen [data-attempt-question="${number}"]`,
  );
  target?.focus({ preventScroll: true });
  target?.scrollIntoView({ block: "nearest" });
}
