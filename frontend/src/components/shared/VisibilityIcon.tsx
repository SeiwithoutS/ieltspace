export function VisibilityIcon({ visible }: { visible: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {visible ? (
        <>
          <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z" />
          <circle cx="12" cy="12" r="3" />
        </>
      ) : <path d="M3 10c2.5 3.5 5.5 5 9 5s6.5-1.5 9-5M6 13.5l-2 3m8-1.5v3.5m6-5 2 3" />}
    </svg>
  );
}
