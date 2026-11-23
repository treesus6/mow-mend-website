export function ContractorToolBag({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 170"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Contractor tool bag representing handyman repair services"
      className={className}
    >
      {/* Ground shadow */}
      <ellipse cx="100" cy="154" rx="76" ry="8" fill="#141715" fillOpacity="0.16" />

      {/* Adjustable Wrench sticking out left */}
      <g transform="rotate(-14 58 64)">
        <rect x="48" y="34" width="14" height="58" rx="3" fill="#9CA3AF" stroke="#141715" strokeWidth="3" />
        <path
          d="M42 36C40 24 48 16 55 16C62 16 70 24 68 36L60 36L60 28L50 28L50 36Z"
          fill="#D1D5DB"
          stroke="#141715"
          strokeWidth="3"
          strokeLinejoin="round"
        />
      </g>

      {/* Level / Ruler sticking out center */}
      <g transform="rotate(6 105 55)">
        <rect x="92" y="18" width="22" height="72" rx="2.5" fill="#E86F14" stroke="#141715" strokeWidth="3" />
        <rect x="97" y="30" width="12" height="9" rx="1.5" fill="#D1FAE5" stroke="#141715" strokeWidth="2" />
        <line x1="103" y1="30" x2="103" y2="39" stroke="#141715" strokeWidth="1.5" />
        <line x1="95" y1="49" x2="101" y2="49" stroke="#141715" strokeWidth="2" />
        <line x1="95" y1="57" x2="103" y2="57" stroke="#141715" strokeWidth="2" />
        <line x1="95" y1="65" x2="101" y2="65" stroke="#141715" strokeWidth="2" />
      </g>

      {/* Screwdriver sticking out right */}
      <g transform="rotate(18 142 66)">
        <rect x="137" y="42" width="8" height="46" fill="#CBD5E1" stroke="#141715" strokeWidth="2.5" />
        <rect x="132" y="14" width="18" height="30" rx="5" fill="#1F2937" stroke="#141715" strokeWidth="3" />
        <rect x="132" y="24" width="18" height="7" fill="#E86F14" />
      </g>

      {/* Back rim of canvas bag */}
      <path
        d="M34 74C34 68 39 64 45 64H155C161 64 166 68 166 74V84H34V74Z"
        fill="#272B28"
        stroke="#141715"
        strokeWidth="3.5"
      />

      {/* Carry handle arch */}
      <path
        d="M72 64V52C72 45 78 40 85 40H115C122 40 128 45 128 52V64"
        stroke="#141715"
        strokeWidth="9"
        strokeLinecap="round"
      />
      <path
        d="M72 64V52C72 45 78 40 85 40H115C122 40 128 45 128 52V64"
        stroke="#E86F14"
        strokeWidth="4"
        strokeLinecap="round"
      />

      {/* Main rugged tool bag body */}
      <path
        d="M28 76H172L166 144C165.5 149 161 153 156 153H44C39 153 34.5 149 34 144L28 76Z"
        fill="#373D39"
        stroke="#141715"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />

      {/* Heavy bottom boot */}
      <path
        d="M33 134H167L166 144C165.5 149 161 153 156 153H44C39 153 34.5 149 34 144L33 134Z"
        fill="#1E221F"
        stroke="#141715"
        strokeWidth="3"
      />

      {/* Front twin workwear orange pockets */}
      <rect x="44" y="92" width="48" height="36" rx="4" fill="#E86F14" stroke="#141715" strokeWidth="3" />
      <rect x="108" y="92" width="48" height="36" rx="4" fill="#E86F14" stroke="#141715" strokeWidth="3" />

      {/* Pocket flaps & rivets */}
      <path d="M44 102H92" stroke="#141715" strokeWidth="2.5" />
      <path d="M108 102H156" stroke="#141715" strokeWidth="2.5" />
      <circle cx="68" cy="112" r="3" fill="#141715" />
      <circle cx="132" cy="112" r="3" fill="#141715" />

      {/* Side tape measure clip detail */}
      <rect x="164" y="96" width="12" height="22" rx="4" fill="#F59E0B" stroke="#141715" strokeWidth="2.5" />
    </svg>
  );
}
