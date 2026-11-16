// Shared benefit icons (no external icon library).
export default function BenefitIcon({ name, size = 22 }) {
  const common = {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none',
    stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round',
  }
  // Each icon is chosen to say what the money buys, not just the category:
  // a first-aid kit for everyday supplies, a head for mental wellbeing, a
  // dumbbell for fitness, a stretch for physical therapy, a car for rides,
  // a drop with a sparkle for skin care, an apple for nutrition.
  const paths = {
    dental: <path d="M12 5.4c1.6-1.4 3.2-1.6 4.6-1C18.1 5.2 19 6.8 19 9c0 2-.4 3.7-1 5.6-.3 1-.6 2.3-1 3-.5.9-1.4.8-1.9 0-.4-.7-.6-1.9-1-2.7-.2-.5-.6-.8-1.1-.8s-.9.3-1.1.8c-.4.8-.6 2-1 2.7-.5.8-1.4.9-1.9 0-.4-.7-.7-2-1-3C5.4 12.7 5 11 5 9c0-2.2.9-3.8 2.4-4.6 1.4-.6 3-.4 4.6 1Z" />,
    mind: <><path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z" /><path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z" /><path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4" /></>,
    fitness: <path d="M6.5 6.5v11M17.5 6.5v11M3 9.5v5M21 9.5v5M6.5 12h11" />,
    vision: <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></>,
    everyday: <><rect x="2" y="6" width="20" height="14" rx="2" /><path d="M16 6V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" /><path d="M12 10.5v5M9.5 13h5" /></>,
    nutrition: <><path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 2-1-.56-2.78-2-5-2a4.9 4.9 0 0 0-5 4.78C2 14 5 22 8 22c1.25 0 2.5-1.06 4-1.06Z" /><path d="M10 2c1 .5 2 2 2 5" /></>,
    transport: <><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" /><circle cx="7" cy="17" r="2" /><path d="M9 17h6" /><circle cx="17" cy="17" r="2" /></>,
    derm: <><path d="M10 5s5 5.4 5 9.5a5 5 0 0 1-10 0C5 10.400 10 5 10 5Z" /><path d="M18.500 3v4M16.500 5h4" /></>,
    pt: <><circle cx="12" cy="4" r="2" /><path d="M5.500 5.500 12 9l6.500-3.500" /><path d="M12 9v5" /><path d="M12 14l-4.500 7" /><path d="M12 14l4.500 2.500V21" /></>,
  }
  return <svg {...common}>{paths[name] || null}</svg>
}
