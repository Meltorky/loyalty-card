const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
};

// One gem per visit
export function Gem({ size = "58%" }) {
  return (
    <svg {...base} width={size} height={size} strokeWidth={1.7}>
      <path d="M6 3h12l4 6-10 12L2 9l4-6Z" />
      <path d="M2 9h20M9 3 7.5 9 12 21l4.5-12L15 3" />
    </svg>
  );
}

export function Gift({ size = "58%" }) {
  return (
    <svg {...base} width={size} height={size}>
      <rect x="3" y="8" width="18" height="4" rx="1" />
      <path d="M5 12v8h14v-8M12 8v12" />
      <path d="M12 8C12 8 10.5 3.5 8 4.5S8 8 12 8Zm0 0s1.5-4.5 4-3.5S16 8 12 8Z" />
    </svg>
  );
}

export function Check({ size = "60%" }) {
  return (
    <svg {...base} width={size} height={size} strokeWidth={2.4}>
      <path d="m5 12.5 4.5 4.5L19 7.5" />
    </svg>
  );
}

export function CameraIcon({ size = 28 }) {
  return (
    <svg {...base} width={size} height={size}>
      <path d="M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z" />
      <circle cx="12" cy="13" r="3.6" />
    </svg>
  );
}