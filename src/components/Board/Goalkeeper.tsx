interface Props {
  color?: string;
  number?: number;
}

export default function Goalkeeper({
  color = "#43A047",
}: Props) {
  return (
    <svg
      width="34"
      height="34"
      viewBox="0 0 34 34"
    >
      <circle
        cx="17"
        cy="17"
        r="15"
        fill={color}
        stroke="white"
        strokeWidth="2"
      />

      {/* Head */}
      <circle
        cx="17"
        cy="10"
        r="3.5"
        fill="white"
      />

      {/* Body */}
      <rect
        x="13"
        y="15"
        width="8"
        height="10"
        rx="2"
        fill="white"
      />

      {/* Arms */}
      <line
        x1="9"
        y1="18"
        x2="25"
        y2="18"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Legs */}
      <line
        x1="15"
        y1="25"
        x2="13"
        y2="30"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
      />

      <line
        x1="19"
        y1="25"
        x2="21"
        y2="30"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
    
  );
}