import { SPORTS } from "../../modules/sports/sports";
import { useApp } from "../../core/contexts/AppContext";

export default function SportSelector() {
  const { currentSport, setCurrentSport } = useApp();

  return (
    <div>
      <h1>Choose Your Sport</h1>

      <div>
        {SPORTS.map((sport) => (
          <button
            key={sport.id}
            type="button"
            onClick={() => setCurrentSport(sport.id)}
          >
            <span>{sport.icon}</span>
            <span>{sport.name}</span>
          </button>
        ))}
      </div>

      {currentSport && (
        <p>
          Selected sport: <strong>{currentSport}</strong>
        </p>
      )}
    </div>
  );
}