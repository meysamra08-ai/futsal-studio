interface Props {
  color: string;
  number?: number;
}

export default function Player({
  color,
  number,
}: Props) {
  return (
    <div
      style={{
        width: 42,
        height: 42,
        borderRadius: "50%",
        outline: "2px solid red",
        background: color,

        border: "3px solid white",

        display: "flex",
        justifyContent: "center",
        alignItems: "center",

        fontWeight: "bold",
        color: "white",

        fontSize: 16,

        boxShadow:
          "0 2px 8px rgba(0,0,0,.35)",
      }}
    >
      {number}
    </div>
  );
}
