export default function CenterCircle() {
  return (
    <>
      <line
        x1="500"
        y1="50"
        x2="500"
        y2="630"
        stroke="white"
        strokeWidth="5"
      />

      <circle
        cx="500"
        cy="340"
        r="60"
        fill="none"
        stroke="white"
        strokeWidth="5"
      />

      <circle cx="500" cy="340" r="4" fill="white" />
    </>
  );
}