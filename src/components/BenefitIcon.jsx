// Shared benefit icons (no external icon library).
export default function BenefitIcon({ name, size = 22 }) {
  const common = {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none',
    stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round',
  }
  const paths = {
    dental: <path d="M12 5.4c1.6-1.4 3.2-1.6 4.6-1C18.1 5.2 19 6.8 19 9c0 2-.4 3.7-1 5.6-.3 1-.6 2.3-1 3-.5.9-1.4.8-1.9 0-.4-.7-.6-1.9-1-2.7-.2-.5-.6-.8-1.1-.8s-.9.3-1.1.8c-.4.8-.6 2-1 2.7-.5.8-1.4.9-1.9 0-.4-.7-.7-2-1-3C5.4 12.7 5 11 5 9c0-2.2.9-3.8 2.4-4.6 1.4-.6 3-.4 4.6 1Z" />,
    mind: <path d="M19 14c1.5-1.5 3-3.2 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.8 0-3 .5-4.5 2-1.5-1.5-2.7-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4 3 5.5l7 7Z" />,
    fitness: <path d="M22 12h-4l-3 9L9 3l-3 9H2" />,
    vision: <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></>,
    everyday: <><circle cx="12" cy="12" r="9" /><path d="M12 8v8M8 12h8" /></>,
    nutrition: <><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.5 19 2c1 2 2 4.2 2 8 0 5.5-4.5 10-10 10Z" /><path d="M2 21c0-3 1.9-5.4 5.1-6" /></>,
  }
  return <svg {...common}>{paths[name] || null}</svg>
}
