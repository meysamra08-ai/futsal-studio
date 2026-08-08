export default function PenaltyAreas() {
  return (
    <>
      {/* Left */}
      <path
        d="
          M50 150
          L120 150
          A170 170 0 0 1 120 530
          L50 530
        "
        fill="none"
        stroke="white"
        strokeWidth="5"
      />

      {/* Right */}
      <path
        d="
          M950 150
          L880 150
          A170 170 0 0 0 880 530
          L950 530
        "
        fill="none"
        stroke="white"
        strokeWidth="5"
      />

      {/* Penalty Marks */}
      <circle cx="170" cy="340" r="4" fill="white" />
      <circle cx="830" cy="340" r="4" fill="white" />
    </>
  );
}