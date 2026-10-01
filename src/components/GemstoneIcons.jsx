export function DiamondCutIcon({ shape, size = 48, className = "" }) {
  const commonProps = {
    width: size,
    height: size,
    viewBox: "0 0 100 100",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.8",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    className: `gemstone-svg ${className}`,
  };

  switch (shape.toLowerCase()) {
    case "redondo": // Round Brilliant Cut
      return (
        <svg {...commonProps}>
          {/* Outer circle */}
          <circle cx="50" cy="50" r="42" strokeWidth="2" />
          {/* Table / inner octagonal facet */}
          <polygon points="50,22 69,31 69,69 50,78 31,69 31,31" strokeWidth="1.4" />
          {/* Star facets and star lines */}
          <line x1="50" y1="8" x2="50" y2="22" />
          <line x1="92" y1="50" x2="69" y2="50" />
          <line x1="50" y1="92" x2="50" y2="78" />
          <line x1="8" y1="50" x2="31" y2="50" />
          <line x1="20" y1="20" x2="31" y2="31" />
          <line x1="80" y1="20" x2="69" y2="31" />
          <line x1="80" y1="80" x2="69" y2="69" />
          <line x1="20" y1="80" x2="31" y2="69" />
          {/* Inner facet radial lines */}
          <circle cx="50" cy="50" r="14" strokeWidth="1.2" strokeDasharray="3 2" />
          <line x1="50" y1="36" x2="50" y2="64" strokeWidth="1" />
          <line x1="36" y1="50" x2="64" y2="50" strokeWidth="1" />
        </svg>
      );

    case "oval": // Oval Cut
      return (
        <svg {...commonProps}>
          <ellipse cx="50" cy="50" rx="34" ry="44" strokeWidth="2" />
          <polygon points="50,20 68,34 68,66 50,80 32,66 32,34" strokeWidth="1.3" />
          <ellipse cx="50" cy="50" rx="18" ry="24" strokeWidth="1.1" strokeDasharray="2 2" />
          <line x1="50" y1="6" x2="50" y2="20" />
          <line x1="50" y1="80" x2="50" y2="94" />
          <line x1="16" y1="50" x2="32" y2="50" />
          <line x1="68" y1="50" x2="84" y2="50" />
          <line x1="25" y1="20" x2="32" y2="34" />
          <line x1="75" y1="20" x2="68" y2="34" />
          <line x1="75" y1="80" x2="68" y2="66" />
          <line x1="25" y1="80" x2="32" y2="66" />
        </svg>
      );

    case "esmeralda": // Emerald Cut
      return (
        <svg {...commonProps}>
          {/* Octagonal outer step cut */}
          <polygon points="26,10 74,10 90,26 90,74 74,90 26,90 10,74 10,26" strokeWidth="2" />
          {/* Middle step */}
          <polygon points="32,20 68,20 80,32 80,68 68,80 32,80 20,68 20,32" strokeWidth="1.3" />
          {/* Table / Inner rect */}
          <polygon points="38,28 62,28 72,38 72,62 62,72 38,72 28,62 28,38" strokeWidth="1.1" />
          {/* Corner facet lines */}
          <line x1="10" y1="26" x2="28" y2="38" />
          <line x1="90" y1="26" x2="72" y2="38" />
          <line x1="90" y1="74" x2="72" y2="62" />
          <line x1="10" y1="74" x2="28" y2="62" />
        </svg>
      );

    case "marquesa": // Marquise Cut
      return (
        <svg {...commonProps}>
          {/* Pointed oval outer contour */}
          <path d="M 50,6 C 85,30 85,70 50,94 C 15,70 15,30 50,6 Z" strokeWidth="2" />
          <path d="M 50,22 C 70,36 70,64 50,78 C 30,64 30,36 50,22 Z" strokeWidth="1.3" />
          <line x1="50" y1="6" x2="50" y2="94" strokeWidth="1.2" />
          <line x1="20" y1="50" x2="80" y2="50" strokeWidth="1.2" />
          <line x1="32" y1="36" x2="68" y2="64" strokeWidth="0.9" />
          <line x1="68" y1="36" x2="32" y2="64" strokeWidth="0.9" />
        </svg>
      );

    case "pera": // Pear Cut
      return (
        <svg {...commonProps}>
          {/* Teardrop pear shape */}
          <path d="M 50,8 C 78,40 82,74 50,92 C 18,74 22,40 50,8 Z" strokeWidth="2" />
          <path d="M 50,24 C 68,44 70,70 50,82 C 30,70 32,44 50,24 Z" strokeWidth="1.3" />
          <line x1="50" y1="8" x2="50" y2="92" strokeWidth="1.2" />
          <line x1="24" y1="62" x2="76" y2="62" strokeWidth="1.1" />
          <line x1="33" y1="46" x2="67" y2="76" strokeWidth="0.9" />
          <line x1="67" y1="46" x2="33" y2="76" strokeWidth="0.9" />
        </svg>
      );

    case "corazón":
    case "corazon": // Heart Cut
      return (
        <svg {...commonProps}>
          <path
            d="M 50,30 C 50,26 44,14 30,14 C 16,14 10,26 10,40 C 10,62 38,78 50,90 C 62,78 90,62 90,40 C 90,26 84,14 70,14 C 56,14 50,26 50,30 Z"
            strokeWidth="2"
          />
          <path
            d="M 50,38 C 50,34 46,24 34,24 C 24,24 18,32 18,42 C 18,58 38,72 50,80 C 62,72 82,58 82,42 C 82,32 76,24 66,24 C 54,24 50,34 50,38 Z"
            strokeWidth="1.2"
          />
          <line x1="50" y1="30" x2="50" y2="90" strokeWidth="1.2" />
          <line x1="24" y1="45" x2="76" y2="45" strokeWidth="1.1" />
        </svg>
      );

    case "cojín":
    case "cojin": // Cushion Cut
      return (
        <svg {...commonProps}>
          {/* Rounded square / cushion perimeter */}
          <rect x="14" y="14" width="72" height="72" rx="20" strokeWidth="2" />
          <rect x="26" y="26" width="48" height="48" rx="12" strokeWidth="1.3" />
          <circle cx="50" cy="50" r="14" strokeWidth="1" strokeDasharray="3 2" />
          <line x1="14" y1="14" x2="26" y2="26" strokeWidth="1.3" />
          <line x1="86" y1="14" x2="74" y2="26" strokeWidth="1.3" />
          <line x1="86" y1="86" x2="74" y2="74" strokeWidth="1.3" />
          <line x1="14" y1="86" x2="26" y2="74" strokeWidth="1.3" />
          <line x1="50" y1="14" x2="50" y2="26" />
          <line x1="50" y1="74" x2="50" y2="86" />
          <line x1="14" y1="50" x2="26" y2="50" />
          <line x1="74" y1="50" x2="86" y2="50" />
        </svg>
      );

    case "princesa": // Princess Cut (Square Brilliant)
      return (
        <svg {...commonProps}>
          {/* Crisp square */}
          <rect x="12" y="12" width="76" height="76" strokeWidth="2" />
          {/* Inner table diamond */}
          <polygon points="50,22 78,50 50,78 22,50" strokeWidth="1.3" />
          {/* Inverted inner square */}
          <rect x="34" y="34" width="32" height="32" strokeWidth="1" strokeDasharray="2 2" />
          {/* Corner diagonal facet lines */}
          <line x1="12" y1="12" x2="88" y2="88" strokeWidth="1.2" />
          <line x1="88" y1="12" x2="12" y2="88" strokeWidth="1.2" />
          <line x1="50" y1="12" x2="50" y2="22" strokeWidth="1.2" />
          <line x1="50" y1="78" x2="50" y2="88" strokeWidth="1.2" />
          <line x1="12" y1="50" x2="22" y2="50" strokeWidth="1.2" />
          <line x1="78" y1="50" x2="88" y2="50" strokeWidth="1.2" />
        </svg>
      );

    case "radiante": // Radiant Cut (Cut-Corner Rectangular Brilliant)
      return (
        <svg {...commonProps}>
          <polygon points="26,10 74,10 90,26 90,74 74,90 26,90 10,74 10,26" strokeWidth="2" />
          <polygon points="34,22 66,22 76,32 76,68 66,78 34,78 24,68 24,32" strokeWidth="1.3" />
          <line x1="10" y1="26" x2="90" y2="74" strokeWidth="0.9" />
          <line x1="90" y1="26" x2="10" y2="74" strokeWidth="0.9" />
          <line x1="50" y1="10" x2="50" y2="90" strokeWidth="1.1" />
          <line x1="10" y1="50" x2="90" y2="50" strokeWidth="1.1" />
        </svg>
      );

    default:
      return (
        <svg {...commonProps}>
          <polygon points="50,15 85,40 50,85 15,40" strokeWidth="2" />
          <line x1="15" y1="40" x2="85" y2="40" strokeWidth="1.2" />
        </svg>
      );
  }
}
