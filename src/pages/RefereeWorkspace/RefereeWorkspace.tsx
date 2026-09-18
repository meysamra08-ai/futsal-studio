import { useEffect, useMemo, useRef, useState } from "react";
import "./RefereeWorkspace.css";

type RefereeWorkspaceProps = {
  onHome: () => void;
};

type Team = "HOME" | "GUEST";
type EventType = "GOAL" | "YELLOW CARD" | "RED CARD" | "FOUL" | "TIMEOUT";

type MatchEvent = {
  id: number;
  type: EventType;
  team: Team;
  teamName: string;
  time: string;
  period: 1 | 2;
  playerNumber?: number;
};

type Player = {
  id: number;
  name: string;
  number: string;
};

const DEFAULT_HALF_MINUTES = 20;

function toPersianDigits(value: string | number) {
  return String(value).replace(/\d/g, (digit) => "۰۱۲۳۴۵۶۷۸۹"[Number(digit)]);
}

function formatClock(seconds: number) {
  const safe = Math.max(0, seconds);
  return `${String(Math.floor(safe / 60)).padStart(2, "0")}:${String(
    safe % 60
  ).padStart(2, "0")}`;
}

function formatPreciseClock(milliseconds: number) {
  const safe = Math.max(0, Math.min(60_000, milliseconds));
  const totalSeconds = Math.floor(safe / 1000);
  const hundredths = Math.floor((safe % 1000) / 10);
  return `${String(Math.floor(totalSeconds / 60)).padStart(2, "0")}:${String(
    totalSeconds % 60
  ).padStart(2, "0")}.${String(hundredths).padStart(2, "0")}`;
}

function formatJalaliDate(date: Date) {
  return new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .format(date)
    .replace(/\u200e/g, "")
    .replace(/\//g, "/");
}

function eventLabel(type: EventType) {
  switch (type) {
    case "GOAL":
      return "گل";
    case "YELLOW CARD":
      return "کارت زرد";
    case "RED CARD":
      return "کارت قرمز";
    case "FOUL":
      return "خطا";
    case "TIMEOUT":
      return "تایم‌اوت";
  }
}

function eventIcon(type: EventType) {
  switch (type) {
    case "GOAL":
      return "⚽";
    case "YELLOW CARD":
      return "■";
    case "RED CARD":
      return "■";
    case "FOUL":
      return "⚠";
    case "TIMEOUT":
      return "◷";
  }
}


function reportTimeoutTimes(events: MatchEvent[], team: Team, period: 1 | 2) {
  return events
    .filter((event) => event.type === "TIMEOUT" && event.team === team && event.period === period)
    .map((event) => event.time)
    .join("، ");
}

function reportFoulTimes(events: MatchEvent[], team: Team, period: 1 | 2) {
  return events
    .filter((event) => event.type === "FOUL" && event.team === team && event.period === period)
    .map((event) => event.time);
}

function reportPeriodGoals(events: MatchEvent[], team: Team, period: 1 | 2) {
  return events.filter(
    (event) => event.type === "GOAL" && event.team === team && event.period === period
  ).length;
}

export default function RefereeWorkspace({ onHome }: RefereeWorkspaceProps) {
  const scoreboardFrameRef = useRef<HTMLDivElement | null>(null);
  const scoreboardInnerRef = useRef<HTMLDivElement | null>(null);
  const matchSettingsFrameRef = useRef<HTMLElement | null>(null);
  const matchSettingsInnerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const updateScaledFrame = (
      frame: HTMLElement | null,
      inner: HTMLElement | null,
      baseWidth: number,
      variableName: string
    ) => {
      if (!frame || !inner) return;

      const frameWidth = frame.clientWidth;
      const frameHeight = frame.clientHeight;
      const naturalWidth = Math.max(baseWidth, inner.scrollWidth);
      const naturalHeight = Math.max(1, inner.scrollHeight);

      if (!frameWidth || !frameHeight || !naturalWidth || !naturalHeight) return;

      const scaleX = frameWidth / naturalWidth;
      const scaleY = frameHeight / naturalHeight;
      const scale = Math.min(scaleX, scaleY);

      frame.style.setProperty(variableName, String(Math.max(0.25, Math.min(2, scale))));
    };

    const updateAll = () => {
      updateScaledFrame(
        scoreboardFrameRef.current,
        scoreboardInnerRef.current,
        920,
        "--scoreboard-content-scale"
      );
      updateScaledFrame(
        matchSettingsFrameRef.current,
        matchSettingsInnerRef.current,
        870,
        "--match-settings-content-scale"
      );
    };

    const observer = new ResizeObserver(updateAll);
    if (scoreboardFrameRef.current) observer.observe(scoreboardFrameRef.current);
    if (matchSettingsFrameRef.current) observer.observe(matchSettingsFrameRef.current);
    if (scoreboardInnerRef.current) observer.observe(scoreboardInnerRef.current);
    if (matchSettingsInnerRef.current) observer.observe(matchSettingsInnerRef.current);

    updateAll();
    window.addEventListener("resize", updateAll);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateAll);
    };
  }, []);
  const [halfMinutes, setHalfMinutes] = useState(DEFAULT_HALF_MINUTES);
  const [time, setTime] = useState(DEFAULT_HALF_MINUTES * 60);
  const [running, setRunning] = useState(false);
  const [preciseTimeMs, setPreciseTimeMs] = useState(DEFAULT_HALF_MINUTES * 60 * 1000);
  const preciseTimerAnchorRef = useRef<number | null>(null);
  const [period, setPeriod] = useState<1 | 2>(1);

  const [homeName, setHomeName] = useState("HOME");
  const [guestName, setGuestName] = useState("GUEST");

  const [homeScore, setHomeScore] = useState(0);
  const [guestScore, setGuestScore] = useState(0);
  const [homeFouls, setHomeFouls] = useState(0);
  const [guestFouls, setGuestFouls] = useState(0);

  const [homeYellow, setHomeYellow] = useState(0);
  const [guestYellow, setGuestYellow] = useState(0);
  const [homeRed, setHomeRed] = useState(0);
  const [guestRed, setGuestRed] = useState(0);

  // شماره بازیکن برای ثبت کارت‌ها
  const [homeYellowPlayer, setHomeYellowPlayer] = useState("");
  const [guestYellowPlayer, setGuestYellowPlayer] = useState("");
  const [homeRedPlayer, setHomeRedPlayer] = useState("");
  const [guestRedPlayer, setGuestRedPlayer] = useState("");
  const [homeGoalPlayer, setHomeGoalPlayer] = useState("");
  const [guestGoalPlayer, setGuestGoalPlayer] = useState("");

  const [homeTimeoutUsed, setHomeTimeoutUsed] = useState(false);
  const [guestTimeoutUsed, setGuestTimeoutUsed] = useState(false);
  const [timeoutDuration, setTimeoutDuration] = useState(60);
  const [timeoutTeam, setTimeoutTeam] = useState<Team | null>(null);
  const [timeoutTime, setTimeoutTime] = useState(0);
  const [showRestWarning, setShowRestWarning] = useState(false);
  const [showFiveFoulWarning, setShowFiveFoulWarning] = useState<Team | null>(null);

  const [matchName, setMatchName] = useState("فینال لیگ برتر فوتسال");
  const [matchDate, setMatchDate] = useState(() => formatJalaliDate(new Date()));
  const [matchTime, setMatchTime] = useState(() => new Date().toTimeString().slice(0, 5));
  const [ageCategory, setAgeCategory] = useState("بزرگسالان");
  const [venue, setVenue] = useState("");
  const [city, setCity] = useState("");
  const [matchDay, setMatchDay] = useState(() => new Intl.DateTimeFormat("fa-IR", { weekday: "long" }).format(new Date()));
  const [homeJerseyColor, setHomeJerseyColor] = useState("");
  const [guestJerseyColor, setGuestJerseyColor] = useState("");
  const [leftOrganizerLogo, setLeftOrganizerLogo] = useState<string | null>(null);
  const [rightOrganizerLogo, setRightOrganizerLogo] = useState<string | null>(null);
  const [events, setEvents] = useState<MatchEvent[]>([]);
  const [nextEventId, setNextEventId] = useState(1);
  const [activeSection, setActiveSection] = useState<"scoreboard" | "players">("scoreboard");

  const [homeCaptain, setHomeCaptain] = useState("");
  const [guestCaptain, setGuestCaptain] = useState("");
  const [homeCoach, setHomeCoach] = useState("");
  const [guestCoach, setGuestCoach] = useState("");
  const [penaltyResultScore, setPenaltyResultScore] = useState("");
  const [refereeOne, setRefereeOne] = useState("");
  const [refereeTwo, setRefereeTwo] = useState("");
  const [refereeThree, setRefereeThree] = useState("");
  const [timekeeper, setTimekeeper] = useState("");

  const [homePlayers, setHomePlayers] = useState<Player[]>(
    Array.from({ length: 12 }, (_, index) => ({
      id: index + 1,
      name: "",
      number: String(index + 1),
    }))
  );
  const [guestPlayers, setGuestPlayers] = useState<Player[]>(
    Array.from({ length: 12 }, (_, index) => ({
      id: index + 1,
      name: "",
      number: String(index + 1),
    }))
  );


  // مدیریت مرکزی صداهای اسکوربرد
  const soundRefs = useRef<Record<string, HTMLAudioElement | null>>({});
  const finalWhistlePlayedRef = useRef(false);
  const timerEndedNaturallyRef = useRef(false);
  const timeoutActiveRef = useRef(false);
  const skipFinalWhistleRef = useRef(false);

  const soundFiles = {
    oneMinute: "/sounds/one-min-sound.mp3", // صدای تایم یک دقیقه آخر
    timeoutStart: "/sounds/time-sound.mp3", // صدای شروع تایم اوت
    timeoutEnd: "/sounds/e-time-sound.mp3", // صدای پایان تایم اوت
    fullTime: "/sounds/full-time.mp3", // صدای پایان بازی
    click: "/sounds/click.mp3", // صدای هر کلیک داخل نرم افزار
  };

  function playScoreboardSound(name: keyof typeof soundFiles) {
    let audio = soundRefs.current[name];

    if (!audio) {
      audio = new Audio(soundFiles[name]);
      audio.preload = "auto";
      soundRefs.current[name] = audio;
    }

    audio.currentTime = 0;
    audio.volume = 1;
    void audio.play().catch(() => {
      // اگر مرورگر پخش خودکار را مسدود کند، خطایی در اسکوربرد نمایش داده نمی‌شود.
    });
  }

  function playClickSound() {
    let audio = soundRefs.current.click;

    if (!audio) {
      audio = new Audio(soundFiles.click);
      audio.preload = "auto";
      soundRefs.current.click = audio;
    }

    audio.currentTime = 0;
    audio.volume = 1;
    void audio.play().catch(() => {
      // صدا در تعامل مستقیم کاربر پخش می‌شود.
    });
  }

  useEffect(() => {
    if (!running || time <= 0) return;

    const intervalId = window.setInterval(() => {
      setTime((current) => {
        if (current <= 1) {
          timerEndedNaturallyRef.current = true;
          setRunning(false);
          return 0;
        }
        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [running, time]);

  useEffect(() => {
    if (!running || time <= 0 || time > 60) {
      preciseTimerAnchorRef.current = null;
      if (time <= 0 || time > 60) {
        setPreciseTimeMs(time * 1000);
      }
      return;
    }

    const startRemainingMs = preciseTimeMs;
    const startTimestamp = performance.now();
    preciseTimerAnchorRef.current = startTimestamp;

    const intervalId = window.setInterval(() => {
      const elapsed = performance.now() - startTimestamp;
      setPreciseTimeMs(Math.max(0, startRemainingMs - elapsed));
    }, 10);

    return () => {
      window.clearInterval(intervalId);
      preciseTimerAnchorRef.current = null;
    };
  }, [running, time]);

  useEffect(() => {
    if (timeoutTeam === null || timeoutTime <= 0) return;

    const intervalId = window.setInterval(() => {
      setTimeoutTime((current) => {
        if (current <= 1) {
          setTimeoutTeam(null);
          setRunning(false);
          return 0;
        }
        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [timeoutTeam, timeoutTime]);


  useEffect(() => {
    // پیش‌بارگذاری صداها تا هنگام استفاده تأخیر کمتری داشته باشند.
    Object.entries(soundFiles).forEach(([name, src]) => {
      const audio = new Audio(src);
      audio.preload = "auto";
      soundRefs.current[name] = audio;
    });

    return () => {
      Object.values(soundRefs.current).forEach((audio) => {
        if (audio) {
          audio.pause();
          audio.currentTime = 0;
        }
      });
    };
  }, []);

  useEffect(() => {
    if (running && time > 0 && time <= 60) {
      // صدای یک دقیقه آخر: دقیقاً یک بار در هر ثانیه.
      playScoreboardSound("oneMinute");
    }
  }, [running, time]);

  useEffect(() => {
    if (running) {
      finalWhistlePlayedRef.current = false;
      timerEndedNaturallyRef.current = false;
    }

    if (
      time === 0 &&
      !running &&
      timerEndedNaturallyRef.current &&
      !skipFinalWhistleRef.current &&
      !finalWhistlePlayedRef.current
    ) {
      finalWhistlePlayedRef.current = true;
      playScoreboardSound("fullTime");
    }

    if (time !== 0) {
      skipFinalWhistleRef.current = false;
    }
  }, [time, running]);

  useEffect(() => {
    if (timeoutTeam !== null && timeoutTime > 0 && !timeoutActiveRef.current) {
      timeoutActiveRef.current = true;
      playScoreboardSound("timeoutStart");
    }
    if (timeoutTeam === null && timeoutActiveRef.current) {
      timeoutActiveRef.current = false;
      playScoreboardSound("timeoutEnd");
    }
  }, [timeoutTeam, timeoutTime]);

  function toggleTimer() {
    if (time === 0 || timeoutTeam !== null) return;

    setRunning((value) => {
      const next = !value;

      if (next) {
        // شروع مجدد از همان صدم‌ثانیه‌ای که متوقف شده بود.
        if (time > 0 && time <= 60) {
          setPreciseTimeMs((current) => Math.max(0, current));
        }
        timerEndedNaturallyRef.current = false;
        finalWhistlePlayedRef.current = false;
      }

      return next;
    });
  }


  function switchPeriod() {
    setRunning(false);
    setPeriod((value) => (value === 1 ? 2 : 1));
    setTime(halfMinutes * 60);
    setHomeFouls(0);
    setGuestFouls(0);
    setHomeTimeoutUsed(false);
    setGuestTimeoutUsed(false);
    setTimeoutTeam(null);
    setTimeoutTime(0);
  }

  function changeHalfMinutes(value: number) {
    const next = Math.max(1, Math.min(60, value));
    setHalfMinutes(next);
    setRunning(false);
    setTime(next * 60);
    playScoreboardSound("click");
  }

  function startTimeout(team: Team) {
    const alreadyUsed = team === "HOME" ? homeTimeoutUsed : guestTimeoutUsed;
    if (alreadyUsed || timeoutTeam !== null) return;

    if (team === "HOME") setHomeTimeoutUsed(true);
    else setGuestTimeoutUsed(true);

    setRunning(false);
    setTimeoutTeam(team);
    setTimeoutTime(timeoutDuration);

    const teamName =
      team === "HOME" ? homeName.trim() || "HOME" : guestName.trim() || "GUEST";

    setEvents((current) => [
      {
        id: nextEventId,
        type: "TIMEOUT",
        team,
        teamName,
        time: formatClock(time),
        period,
      },
      ...current,
    ]);
    setNextEventId((value) => value + 1);
  }

  function hasUnassignedGoal(team: Team) {
    return events.some(
      (event) =>
        event.type === "GOAL" &&
        event.team === team &&
        event.playerNumber === undefined
    );
  }

  function playerNumberExists(team: Team, number: number) {
    const players = team === "HOME" ? homePlayers : guestPlayers;
    return players.some((player) => player.number === String(number));
  }

  function registerGoalByPlayer(team: Team, playerNumberValue: string) {
    const number = Number(playerNumberValue);
    if (!playerNumberValue.trim() || !Number.isInteger(number) || number < 1 || number > 99) return;
    if (!hasUnassignedGoal(team)) return;
    if (!playerNumberExists(team, number)) return;

    setEvents((current) => {
      const eventIndex = current.findIndex(
        (event) =>
          event.type === "GOAL" &&
          event.team === team &&
          event.playerNumber === undefined
      );

      if (eventIndex === -1) return current;

      return current.map((event, index) =>
        index === eventIndex ? { ...event, playerNumber: number } : event
      );
    });

    if (team === "HOME") setHomeGoalPlayer("");
    else setGuestGoalPlayer("");
  }

  function addEvent(type: EventType, team: Team, playerNumber?: number) {
    const teamName =
      team === "HOME"
        ? homeName.trim() || "HOME"
        : guestName.trim() || "GUEST";

    setEvents((current) => [
      {
        id: nextEventId,
        type,
        team,
        teamName,
        time: formatClock(time),
        period,
        playerNumber,
      },
      ...current,
    ]);
    setNextEventId((value) => value + 1);

    if (type === "GOAL") {
      playScoreboardSound("click");
      if (team === "HOME") setHomeScore((value) => value + 1);
      else setGuestScore((value) => value + 1);
    }

    if (type === "FOUL") {
      playScoreboardSound("click");

      const currentFouls = team === "HOME" ? homeFouls : guestFouls;

      if (currentFouls < 5 && currentFouls + 1 >= 5) {
        setShowFiveFoulWarning(team);
      }

      if (team === "HOME") setHomeFouls((value) => Math.min(5, value + 1));
      else setGuestFouls((value) => Math.min(5, value + 1));
    }

    if (type === "YELLOW CARD") {
      if (team === "HOME") setHomeYellow((value) => value + 1);
      else setGuestYellow((value) => value + 1);
    }

    if (type === "RED CARD") {
      if (team === "HOME") setHomeRed((value) => value + 1);
      else setGuestRed((value) => value + 1);
    }

    if (type === "TIMEOUT") {
      setRunning(false);
    }
  }

  function changeScore(team: Team, amount: number) {
    if (team === "HOME") {
      setHomeScore((value) => {
        const next = Math.max(0, value + amount);
        if (next !== value) playScoreboardSound("click");
        return next;
      });
    } else {
      setGuestScore((value) => {
        const next = Math.max(0, value + amount);
        if (next !== value) playScoreboardSound("click");
        return next;
      });
    }
  }

  function updatePlayer(team: Team, playerId: number, field: "name" | "number", value: string) {
    const setter = team === "HOME" ? setHomePlayers : setGuestPlayers;
    setter((current) =>
      current.map((player) =>
        player.id === playerId ? { ...player, [field]: value } : player
      )
    );
  }


  function eventMinuteLabel(event: MatchEvent) {
    const [minutes, seconds] = event.time.split(":").map(Number);
    const remaining = minutes * 60 + seconds;
    const elapsedInHalf = Math.max(0, halfMinutes * 60 - remaining);
    const totalElapsed = (event.period === 2 ? halfMinutes * 60 : 0) + elapsedInHalf;
    return toPersianDigits(Math.max(1, Math.floor(totalElapsed / 60) + 1));
  }

  function playerGoalCount(team: Team, playerNumber: string) {
    if (!playerNumber.trim()) return 0;
    return events.filter(
      (event) =>
        event.type === "GOAL" &&
        event.team === team &&
        event.playerNumber === Number(playerNumber)
    ).length;
  }

  function playerGoalTimes(team: Team, playerNumber: string) {
    if (!playerNumber.trim()) return [];
    return events
      .filter(
        (event) =>
          event.type === "GOAL" &&
          event.team === team &&
          event.playerNumber === Number(playerNumber)
      )
      .map((event) => `${event.time} (${event.period})`);
  }

  function playerCardMinutes(team: Team, playerNumber: string, type: "YELLOW CARD" | "RED CARD") {
    if (!playerNumber.trim()) return [];
    return events
      .filter(
        (event) =>
          event.team === team &&
          event.type === type &&
          event.playerNumber === Number(playerNumber)
      )
      .map((event) => `${eventMinuteLabel(event)} (${event.period === 1 ? "نیمه اول" : "نیمه دوم"})`);
  }

  function handleOrganizerLogo(
    file: File | undefined,
    setter: (value: string | null) => void
  ) {
    if (!file || !file.type.startsWith("image/")) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") setter(reader.result);
    };
    reader.readAsDataURL(file);
  }

  function printMatchReport() {
    window.print();
  }

  function clearEvents() {
    setEvents([]);
    setNextEventId(1);
    setHomeYellow(0);
    setGuestYellow(0);
    setHomeRed(0);
    setGuestRed(0);
  }

  function resetScoreboard() {
    setRunning(false);
    setTime(0);
    setPreciseTimeMs(0);
    setPeriod(1);

    setHomeScore(0);
    setGuestScore(0);
    setHomeFouls(0);
    setGuestFouls(0);
    setHomeYellow(0);
    setGuestYellow(0);
    setHomeRed(0);
    setGuestRed(0);

    setHomeTimeoutUsed(false);
    setGuestTimeoutUsed(false);
    setTimeoutTeam(null);
    setTimeoutTime(0);

    setHomeYellowPlayer("");
    setGuestYellowPlayer("");
    setHomeRedPlayer("");
    setGuestRedPlayer("");
    setHomeGoalPlayer("");
    setGuestGoalPlayer("");

    setEvents([]);
    setNextEventId(1);
    setShowFiveFoulWarning(null);

    preciseTimerAnchorRef.current = null;
    timeoutActiveRef.current = false;
    timerEndedNaturallyRef.current = false;
    finalWhistlePlayedRef.current = false;
    skipFinalWhistleRef.current = true;
  }

  const goalEvents = useMemo(
    () => events.filter((event) => event.type === "GOAL").length,
    [events]
  );
  const yellowEvents = useMemo(
    () => events.filter((event) => event.type === "YELLOW CARD").length,
    [events]
  );
  const redEvents = useMemo(
    () => events.filter((event) => event.type === "RED CARD").length,
    [events]
  );


  return (
    <main
      className="referee-app"
    >
      {showFiveFoulWarning && (
        <div className="five-foul-warning-overlay" role="alertdialog" aria-modal="true">
          <div className="five-foul-warning" dir="rtl">
            <div className="five-foul-warning__icon">⚠</div>
            <div className="five-foul-warning__title">هشدار خطا</div>
            <div className="five-foul-warning__team">
              {showFiveFoulWarning === "HOME"
                ? homeName || "HOME"
                : guestName || "GUEST"}
            </div>
            <div className="five-foul-warning__message">
              خطاهای این تیم به ۵ رسید
            </div>
            <button
              type="button"
              className="five-foul-warning__close"
              onClick={() => setShowFiveFoulWarning(null)}
            >
              تأیید
            </button>
          </div>
        </div>
      )}

      <header className="referee-header">
        <div className="referee-brand">
          <div className="referee-brand__mark">TP</div>
          <div>
            <strong>Futsal Studio</strong>
            <span>REFEREE PLATFORM</span>
          </div>
        </div>

        <div className="referee-header__title">
          <h1>SCOREBOARD</h1>
          <span className="software-name">Futsal Studio</span>
        </div>

        <div className="referee-header__actions">
          <button type="button" className="referee-header__back" onClick={onHome}>
            بازگشت <span>→</span>
          </button>

        </div>
      </header>

      <div className={`referee-layout ${activeSection === "players" ? "referee-layout--players" : ""}`}>
        <aside className="referee-sidebar">
          <div className="sidebar__section-title">داوری مسابقه</div>

          <button
            type="button"
            className={`sidebar-item ${activeSection === "scoreboard" ? "sidebar-item--active" : ""}`}
            onClick={() => setActiveSection("scoreboard")}
          >
            <span>⌁</span>
            <strong>اسکوربرد</strong>
          </button>

          <button
            type="button"
            className={`sidebar-item ${activeSection === "players" ? "sidebar-item--active" : ""}`}
            onClick={() => setActiveSection("players")}
          >
            <span>♙</span>
            <strong>بازیکنان</strong>
          </button>

          <button type="button" className="sidebar-item">
            <span>▣</span>
            <strong>رویدادها</strong>
          </button>

          <button type="button" className="sidebar-item">
            <span>⚙</span>
            <strong>تنظیمات</strong>
          </button>
        </aside>

        <section className={`referee-main ${activeSection === "players" ? "referee-main--players" : ""}`}>
          {activeSection === "players" ? (
            <section className="players-panel" aria-label="گزارش بازیکنان">
              <div className="print-report-header" aria-label="سربرگ گزارش چاپی">
                <div className="print-report-logo print-report-logo--left">
                  {leftOrganizerLogo ? (
                    <img src={leftOrganizerLogo} alt="لوگوی برگزارکننده چپ" />
                  ) : (
                    <span>لوگو</span>
                  )}
                  <label className="print-report-logo__picker">
                    انتخاب لوگو
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(event) => handleOrganizerLogo(event.target.files?.[0], setLeftOrganizerLogo)}
                    />
                  </label>
                </div>
                <div className="print-report-title">
                  <h1>گزارش داوری</h1>
                  <h2>فهرست بازیکنان و کارت‌ها</h2>
                </div>
                <div className="print-report-logo print-report-logo--right">
                  {rightOrganizerLogo ? (
                    <img src={rightOrganizerLogo} alt="لوگوی برگزارکننده راست" />
                  ) : (
                    <span>لوگو</span>
                  )}
                  <label className="print-report-logo__picker">
                    انتخاب لوگو
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(event) => handleOrganizerLogo(event.target.files?.[0], setRightOrganizerLogo)}
                    />
                  </label>
                </div>
              </div>

              <div className="players-panel__head">
                <div>
                  <span>گزارش داوری</span>
                  <h2>فهرست بازیکنان و کارت‌ها</h2>
                </div>
                <button type="button" className="players-panel__print" onClick={printMatchReport}>
                  چاپ گزارش
                </button>
              </div>

              <div className="players-report-meta players-report-meta--single-row">
                <div className="players-report-match-name players-report-linked-field"><span>مسابقه</span><strong>{matchName || "—"}</strong></div>
                <div className="players-report-linked-field"><span>رده سنی</span><strong>{ageCategory || "—"}</strong></div>
                <div className="players-report-linked-field"><span>سالن</span><strong>{venue || "—"}</strong></div>
                <div className="players-report-linked-field"><span>شهر</span><strong>{city || "—"}</strong></div>
                <div className="players-report-linked-field"><span>روز</span><strong>{matchDay || "—"}</strong></div>
                <div className="players-report-linked-field"><span>تاریخ</span><strong>{matchDate || "—"}</strong></div>
                <div className="players-report-linked-field"><span>ساعت مسابقه</span><strong>{matchTime || "—"}</strong></div>
                <div className="players-report-linked-field"><span>نتیجه</span><strong>{homeName || "HOME"} {toPersianDigits(homeScore)} - {toPersianDigits(guestScore)} {guestName || "GUEST"}</strong></div>

              </div>

              <div className="players-teams">
                {([
                  ["HOME", homePlayers, homeName || "HOME"],
                  ["GUEST", guestPlayers, guestName || "GUEST"],
                ] as const).map(([team, players, teamLabel]) => (
                  <section className="players-team-table" key={team}>
                    <div className="players-team-table__title"><strong>{teamLabel}</strong><span>رنگ پیراهن: {team === "HOME" ? homeJerseyColor || "—" : guestJerseyColor || "—"}</span></div>
                    <div className="players-table-wrap">
                      <table className="players-table">
                        <colgroup className="players-table__print-cols">
                          <col className="players-table__col players-table__col--row" />
                          <col className="players-table__col players-table__col--name" />
                          <col className="players-table__col players-table__col--number" />
                          <col className="players-table__col players-table__col--goals" />
                          <col className="players-table__col players-table__col--goal-time" />
                          <col className="players-table__col players-table__col--yellow" />
                          <col className="players-table__col players-table__col--red" />
                        </colgroup>
                        <thead>
                          <tr>
                            <th>ردیف</th>
                            <th>نام و نام خانوادگی</th>
                            <th>شماره</th>
                            <th>گل زده</th>
                            <th>زمان گل زده</th>
                            <th>اخطار (دقیقه)</th>
                            <th>اخراج (دقیقه)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {players.map((player, index) => {
                            const yellowMinutes = playerCardMinutes(team, player.number, "YELLOW CARD");
                            const redMinutes = playerCardMinutes(team, player.number, "RED CARD");
                            const goalTimes = playerGoalTimes(team, player.number);
                            return (
                              <tr key={player.id}>
                                <td>{toPersianDigits(index + 1)}</td>
                                <td>
                                  <input
                                    className="players-table__name"
                                    value={player.name}
                                    onChange={(event) => updatePlayer(team, player.id, "name", event.target.value)}
                                    placeholder="نام و نام خانوادگی"
                                    aria-label={`نام بازیکن ${teamLabel} ردیف ${index + 1}`}
                                  />
                                </td>
                                <td>
                                  <input
                                    className="players-table__number"
                                    value={player.number}
                                    onChange={(event) => updatePlayer(team, player.id, "number", event.target.value.replace(/\D/g, "").slice(0, 2))}
                                    inputMode="numeric"
                                    aria-label={`شماره بازیکن ${teamLabel} ردیف ${index + 1}`}
                                  />
                                </td>
                                <td>
                                  <span
                                    className="players-table__goals players-table__goals--readonly"
                                    aria-label={`گل زده بازیکن ${teamLabel} ردیف ${index + 1}`}
                                  >
                                    {toPersianDigits(playerGoalCount(team, player.number))}
                                  </span>
                                </td>
                                <td className="players-table__goal-times">
                                  {goalTimes.length
                                    ? goalTimes.map((value) => toPersianDigits(value)).join("، ")
                                    : "—"}
                                </td>
                                <td>{yellowMinutes.length ? yellowMinutes.join("، ") : "—"}</td>
                                <td>{redMinutes.length ? redMinutes.join("، ") : "—"}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </section>
                ))}
              </div>

              <div className="players-report-note">
                اطلاعات کارت‌ها بر اساس شماره بازیکن و زمان ثبت رویداد در گزارش ذخیره می‌شود.
              </div>

              <section className="referee-report-continuation" aria-label="فرم تکمیلی گزارش داوری">
                <div className="report-line-grid">
                  <label>
                    <span>سرپرست {homeName || "HOME"}</span>
                    <input value={homeCaptain} onChange={(e) => setHomeCaptain(e.target.value)} />
                  </label>
                  <label>
                    <span>مربی {homeName || "HOME"}</span>
                    <input value={homeCoach} onChange={(e) => setHomeCoach(e.target.value)} />
                  </label>
                  <label>
                    <span>سرپرست {guestName || "GUEST"}</span>
                    <input value={guestCaptain} onChange={(e) => setGuestCaptain(e.target.value)} />
                  </label>
                  <label>
                    <span>مربی {guestName || "GUEST"}</span>
                    <input value={guestCoach} onChange={(e) => setGuestCoach(e.target.value)} />
                  </label>
                </div>

                <div className="report-four-box-grid">
                  {([
                    ["HOME", homeName || "HOME"],
                    ["GUEST", guestName || "GUEST"],
                  ] as const).map(([team, teamLabel]) => {
                    const firstTimeout = reportTimeoutTimes(events, team, 1);
                    const secondTimeout = reportTimeoutTimes(events, team, 2);

                    return (
                      <section className="report-box" key={`timeout-${team}`}>
                        <h3>تایم اوت — {teamLabel}</h3>
                        <div className="report-timeout-row">
                          <label>
                            نیمه اول
                            <input value={firstTimeout || "—"} readOnly />
                          </label>
                          <label>
                            نیمه دوم
                            <input value={secondTimeout || "—"} readOnly />
                          </label>
                        </div>
                      </section>
                    );
                  })}

                  {([
                    ["HOME", homeName || "HOME"],
                    ["GUEST", guestName || "GUEST"],
                  ] as const).map(([team, teamLabel]) => {
                    const firstFouls = reportFoulTimes(events, team, 1);
                    const secondFouls = reportFoulTimes(events, team, 2);

                    return (
                      <section className="report-box" key={`fouls-${team}`}>
                        <h3>خطا — {teamLabel}</h3>
                        <div className="fouls-grid">
                          <span>نیمه اول</span>
                          {[0, 1, 2, 3, 4].map((index) => (
                            <input
                              key={`${team}-f1-${index}`}
                              value={firstFouls[index] || ""}
                              readOnly
                              aria-label={`زمان خطای ${teamLabel} نیمه اول ${index + 1}`}
                            />
                          ))}
                          <span>نیمه دوم</span>
                          {[0, 1, 2, 3, 4].map((index) => (
                            <input
                              key={`${team}-f2-${index}`}
                              value={secondFouls[index] || ""}
                              readOnly
                              aria-label={`زمان خطای ${teamLabel} نیمه دوم ${index + 1}`}
                            />
                          ))}
                        </div>
                      </section>
                    );
                  })}
                </div>                <div className="report-results-grid">
                  <label>
                    <span>نتیجه نیمه اول {homeName || "HOME"}</span>
                    <input value={toPersianDigits(reportPeriodGoals(events, "HOME", 1))} readOnly />
                  </label>
                  <label>
                    <span>نتیجه نیمه اول {guestName || "GUEST"}</span>
                    <input value={toPersianDigits(reportPeriodGoals(events, "GUEST", 1))} readOnly />
                  </label>
                  <label>
                    <span>نتیجه نیمه دوم {homeName || "HOME"}</span>
                    <input value={toPersianDigits(reportPeriodGoals(events, "HOME", 2))} readOnly />
                  </label>
                  <label>
                    <span>نتیجه نیمه دوم {guestName || "GUEST"}</span>
                    <input value={toPersianDigits(reportPeriodGoals(events, "GUEST", 2))} readOnly />
                  </label>
                  <label>
                    <span>نتیجه نهایی</span>
                    <input value={`${toPersianDigits(homeScore)} - ${toPersianDigits(guestScore)}`} readOnly />
                  </label>
                  <label>
                    <span>نتیجه ضربات پنالتی</span>
                    <input value={penaltyResultScore} onChange={(e) => setPenaltyResultScore(e.target.value)} />
                  </label>
                  <label>
                    <span>به نفع تیم</span>
                    <input
                      value={
                        homeScore > guestScore
                          ? homeName || "HOME"
                          : guestScore > homeScore
                            ? guestName || "GUEST"
                            : "مساوی"
                      }
                      readOnly
                    />
                  </label>
                </div>                <div className="report-signatures">
                  <div>
                    <strong>داور</strong>
                    <span className="report-signatures__name">{refereeOne || "—"}</span>
                    <span>امضاء</span>
                  </div>
                  <div>
                    <strong>داور دوم</strong>
                    <span className="report-signatures__name">{refereeTwo || "—"}</span>
                    <span>امضاء</span>
                  </div>
                  <div>
                    <strong>داور سوم</strong>
                    <span className="report-signatures__name">{refereeThree || "—"}</span>
                    <span>امضاء</span>
                  </div>
                  <div>
                    <strong>وقت نگهدار</strong>
                    <span className="report-signatures__name">{timekeeper || "—"}</span>
                    <span>امضاء</span>
                  </div>
                </div>
              </section>
            </section>
          ) : (
            <>
          <div className="scoreboard-card" ref={scoreboardFrameRef}>
            <div className="scoreboard-card__scale" ref={scoreboardInnerRef}>
            <div className="scoreboard-top">
              <div className="team-column team-column--home">
                <input
                  value={homeName}
                  onChange={(event) => {
                    setHomeName(event.target.value);
                    setHomeFouls(0);
                  }}
                  className="team-name-input"
                  style={{ fontFamily: '"Arial Narrow", "Roboto Condensed", "Segoe UI", sans-serif', fontWeight: 900 }}
                  maxLength={18}
                  spellCheck={false}
                  aria-label="نام تیم میزبان"
                />
                <span className="team-caption">HOME</span>
              </div>

              <div className="clock-column">
                <div className="clock-display-wrap">
                  <div className="clock-adjust-group clock-adjust-group--minutes">
                    <button
                      type="button"
                      className="clock-adjust"
                      onClick={() => {
                        setTime((value) => {
                          const next = Math.min(halfMinutes * 60, value + 60);
                          setPreciseTimeMs(next * 1000);
                          return next;
                        });
                        playScoreboardSound("click");
playScoreboardSound("click");
                      }}
                      disabled={running || timeoutTeam !== null}
                      aria-label="اضافه کردن یک دقیقه"
                    >
                      +
                    </button>
                    <button
                      type="button"
                      className="clock-adjust"
                      onClick={() => {
                        setTime((value) => {
                          const next = Math.max(0, value - 60);
                          setPreciseTimeMs(next * 1000);
                          return next;
                        });
                        playScoreboardSound("click");
playScoreboardSound("click");
                      }}
                      disabled={running || timeoutTeam !== null}
                      aria-label="کم کردن یک دقیقه"
                    >
                      −
                    </button>
                  </div>

                  <button
                    type="button"
                    className={`digital-clock ${
                      running ? "digital-clock--running" : ""
                    }`}
                    onClick={toggleTimer}
                    aria-label={running ? "توقف زمان" : "شروع زمان"}
                  >
                    {time > 0 && time <= 60 ? (() => {
                      const precise = formatPreciseClock(preciseTimeMs);
                      const [main, hundredths] = precise.split(".");
                      return (
                        <>
                          <span className="digital-clock__main">{main}</span>
                          <span className="digital-clock__hundredths">.{hundredths}</span>
                        </>
                      );
                    })() : formatClock(time)}
                  </button>

                  <div className="clock-adjust-group clock-adjust-group--seconds">
                    <button
                      type="button"
                      className="clock-adjust"
                      onClick={() => {
                        setTime((value) => {
                          const next = Math.min(halfMinutes * 60, value + 1);
                          setPreciseTimeMs(next * 1000);
                          return next;
                        });
                        playScoreboardSound("click");
playScoreboardSound("click");
                      }}
                      disabled={running || timeoutTeam !== null}
                      aria-label="اضافه کردن یک ثانیه"
                    >
                      +
                    </button>
                    <button
                      type="button"
                      className="clock-adjust"
                      onClick={() => {
                        setTime((value) => {
                          const next = Math.max(0, value - 1);
                          setPreciseTimeMs(next * 1000);
                          return next;
                        });
                        playScoreboardSound("click");
playScoreboardSound("click");
                      }}
                      disabled={running || timeoutTeam !== null}
                      aria-label="کم کردن یک ثانیه"
                    >
                      −
                    </button>
                  </div>
                </div>

                <span className="clock-status">
                  {running ? "RUNNING" : time === 0 ? "TIME UP" : "READY"}
                </span>
              </div>

              <div className="team-column team-column--guest">
                <input
                  value={guestName}
                  onChange={(event) => {
                    setGuestName(event.target.value);
                    setGuestFouls(0);
                  }}
                  className="team-name-input"
                  style={{ fontFamily: '"Arial Narrow", "Roboto Condensed", "Segoe UI", sans-serif', fontWeight: 900 }}
                  maxLength={18}
                  spellCheck={false}
                  aria-label="نام تیم مهمان"
                />
                <span className="team-caption">GUEST</span>
              </div>
            </div>

            <div className="scoreboard-meta">
              <div className="foul-control">
                <button type="button" onClick={() => addEvent("FOUL", "HOME")}>
                  +
                </button>
                <span>{homeFouls}</span>
                <small>FOUL</small>
              </div>

              <button type="button" className="period-control" onClick={switchPeriod}>
                <small>PERIOD</small>
                <strong>{period === 1 ? "1st" : "2nd"}</strong>
              </button>

              <div className="foul-control">
                <small>FOUL</small>
                <span>{guestFouls}</span>
                <button type="button" onClick={() => addEvent("FOUL", "GUEST")}>
                  +
                </button>
              </div>
            </div>

            <div className="score-row">
              <div className="score-team">
                <div className="score-adjust">
                  <button type="button" onClick={() => addEvent("GOAL", "HOME")}>
                    +
                  </button>
                  <button type="button" onClick={() => changeScore("HOME", -1)}>
                    −
                  </button>
                </div>
                <div className="score-number">{homeScore}</div>
              </div>

              <div className="timeout-display-wrap">
                <div className={`timeout-indicator ${
                  timeoutTeam ? "timeout-indicator--active" : ""
                }`}>
                  {timeoutTeam ? (
                    <>
                      <span>TIMEOUT</span>
                      <strong>{formatClock(timeoutTime)}</strong>
                      <small>{timeoutTeam === "HOME" ? homeName || "HOME" : guestName || "GUEST"}</small>
                    </>
                  ) : (
                    <>
                      <span>TO</span>
                      <strong>00:00</strong>
                      <small>READY</small>
                    </>
                  )}
                </div>

                <select
                  className="timeout-duration-select"
                  value={timeoutDuration}
                  onChange={(event) => setTimeoutDuration(Number(event.target.value))}
                  disabled={timeoutTeam !== null}
                  aria-label="مدت تایم‌اوت"
                >
                  <option value={30}>00:30</option>
                  <option value={45}>00:45</option>
                  <option value={60}>01:00</option>
                  <option value={90}>01:30</option>
                  <option value={120}>02:00</option>
                </select>
              </div>

              <div className="score-team score-team--guest">
                <div className="score-number">{guestScore}</div>
                <div className="score-adjust">
                  <button type="button" onClick={() => addEvent("GOAL", "GUEST")}>
                    +
                  </button>
                  <button type="button" onClick={() => changeScore("GUEST", -1)}>
                    −
                  </button>
                </div>
              </div>
            </div>

            <div className="scoreboard-actions">
              <button
                type="button"
                className="scoreboard-action scoreboard-action--timeout-home"
                onClick={() => startTimeout("HOME")}
                disabled={homeTimeoutUsed || timeoutTeam !== null}
              >
                {homeTimeoutUsed ? "Timeout H ✓" : "Timeout H"}
              </button>

              <div className="scoreboard-center-actions">
                <button
                  type="button"
                  className="scoreboard-action scoreboard-action--primary"
                  onClick={toggleTimer}
                  disabled={time === 0 || timeoutTeam !== null}
                >
                  {running ? "Pause" : "Start"}
                </button>

              <button
                type="button"
                className="scoreboard-action scoreboard-action--sound"
                onClick={() => playScoreboardSound("fullTime")}
                aria-label="پخش صدای پایان تایم"
              >
                پایان تایم
              </button>

              <button
                type="button"
                className="scoreboard-action scoreboard-action--sound scoreboard-action--timeout-sound"
                onClick={() => playScoreboardSound("timeoutStart")}
                aria-label="پخش صدای تایم اوت"
              >
                صدای تایم اوت
              </button>

              <button
                type="button"
                className="scoreboard-action scoreboard-action--rest"
                onClick={() => setShowRestWarning(true)}
              >
                Rest
              </button>

            

              </div>

              <button
                type="button"
                className="scoreboard-action scoreboard-action--timeout-guest"
                onClick={() => startTimeout("GUEST")}
                disabled={guestTimeoutUsed || timeoutTeam !== null}
              >
                {guestTimeoutUsed ? "Timeout G ✓" : "Timeout G"}
              </button>
</div>
            </div>
          </div>

          <section className="match-settings" ref={matchSettingsFrameRef}>
            <div className="match-settings__scale" ref={matchSettingsInnerRef}>
            <div className="match-settings__row match-settings__row--top">
                          <label className="settings-field settings-field--match-name">
                <span>نام مسابقه</span>
                <input
                  value={matchName}
                  onChange={(event) => setMatchName(event.target.value)}
                  className="settings-input--persian"
                  aria-label="نام مسابقه"
                />
              </label>
                          <label className="settings-field settings-field--match-date">
                <span>تاریخ مسابقه</span>
                <input
                  type="text"
                  value={matchDate}
                  onChange={(event) => setMatchDate(event.target.value)}
                  className="settings-input--persian"
                  inputMode="numeric"
                  dir="rtl"
                  placeholder="۱۴۰۵/۰۶/۱۳"
                  aria-label="تاریخ شمسی مسابقه"
                />
              </label>
                          <label className="settings-field settings-field--match-time">
                <span>ساعت شروع</span>
                <input
                  type="time"
                  value={matchTime}
                  onChange={(event) => setMatchTime(event.target.value)}
                  className="settings-input--persian"
                  dir="rtl"
                  aria-label="ساعت شروع"
                />
              </label>
                          <label className="settings-field">
                <span>رده سنی</span>
                <input
                  value={ageCategory}
                  onChange={(event) => setAgeCategory(event.target.value)}
                  className="settings-input--persian"
                  aria-label="رده سنی"
                />
              </label>
            </div>
            <div className="match-settings__row match-settings__row--compact">
                          <label className="settings-field">
                <span>سالن</span>
                <input
                  value={venue}
                  onChange={(event) => setVenue(event.target.value)}
                  className="settings-input--persian"
                  placeholder="نام سالن"
                  aria-label="سالن"
                />
              </label>
                          <label className="settings-field">
                <span>شهر</span>
                <input
                  value={city}
                  onChange={(event) => setCity(event.target.value)}
                  className="settings-input--persian"
                  placeholder="نام شهر"
                  aria-label="شهر"
                />
              </label>
                          <label className="settings-field">
                <span>روز</span>
                <input
                  value={matchDay}
                  onChange={(event) => setMatchDay(event.target.value)}
                  className="settings-input--persian"
                  aria-label="روز مسابقه"
                />
              </label>
                          <label className="settings-field">
                <span>رنگ پیراهن HOME</span>
                <input
                  value={homeJerseyColor}
                  onChange={(event) => setHomeJerseyColor(event.target.value)}
                  className="settings-input--persian"
                  placeholder="مثلاً قرمز"
                  aria-label="رنگ پیراهن HOME"
                />
              </label>
                          <label className="settings-field">
                <span>رنگ پیراهن GUEST</span>
                <input
                  value={guestJerseyColor}
                  onChange={(event) => setGuestJerseyColor(event.target.value)}
                  className="settings-input--persian"
                  placeholder="مثلاً سفید"
                  aria-label="رنگ پیراهن GUEST"
                />
              </label>
                          <label className="settings-field">
                <span>مدت هر نیمه</span>
                <select
                  value={halfMinutes}
                  onChange={(event) => changeHalfMinutes(Number(event.target.value))}
                >
                  <option value={10}>10 دقیقه</option>
                  <option value={15}>15 دقیقه</option>
                  <option value={20}>20 دقیقه</option>
                  <option value={25}>25 دقیقه</option>
                  <option value={30}>30 دقیقه</option>
                </select>
              </label>
            </div>
            <div className="match-settings__row match-settings__row--officials">
              <label className="settings-field settings-field--referee">
                <span>داور</span>
                <input
                  value={refereeOne}
                  onChange={(event) => setRefereeOne(event.target.value)}
                  className="settings-input--persian"
                  placeholder="نام داور"
                  aria-label="نام داور"
                />
              </label>
              <label className="settings-field settings-field--referee">
                <span>داور دوم</span>
                <input
                  value={refereeTwo}
                  onChange={(event) => setRefereeTwo(event.target.value)}
                  className="settings-input--persian"
                  placeholder="نام داور دوم"
                  aria-label="نام داور دوم"
                />
              </label>
              <label className="settings-field settings-field--referee">
                <span>داور سوم</span>
                <input
                  value={refereeThree}
                  onChange={(event) => setRefereeThree(event.target.value)}
                  className="settings-input--persian"
                  placeholder="نام داور سوم"
                  aria-label="نام داور سوم"
                />
              </label>
              <label className="settings-field settings-field--referee">
                <span>وقت نگهدار</span>
                <input
                  value={timekeeper}
                  onChange={(event) => setTimekeeper(event.target.value)}
                  className="settings-input--persian"
                  placeholder="نام وقت نگهدار"
                  aria-label="نام وقت نگهدار"
                />
              </label>
            </div>
          </div>
          </section>
            </>
          )}
        </section>

        <aside className="events-panel">
          <div className="events-panel__head">
            <div>
              <span>اطلاعات مسابقه</span>
              <h2>رویدادهای بازی به صورت لحظه‌ای</h2>
            </div>
            <div className="events-panel__icon">▤</div>
          </div>

          <section className="event-summary">
            <header>خلاصه آماری</header>
            <div className="summary-grid">
              <div>
                <span>گل‌ها</span>
                <strong className="summary-green">{goalEvents}</strong>
              </div>
              <div>
                <span>کارت زرد</span>
                <strong className="summary-yellow">{yellowEvents}</strong>
              </div>
              <div>
                <span>کارت قرمز</span>
                <strong className="summary-red">{redEvents}</strong>
              </div>
            </div>
          </section>

          <section className="event-actions-panel">
            <div className="event-actions-panel__head">
              <strong>ثبت رویداد</strong>
              <button type="button" onClick={clearEvents} disabled={events.length === 0}>
                پاک کردن
              </button>
            </div>

            <div className="card-registration-grid">
              <div className="card-registration card-registration--yellow">
                <div className="card-registration__title">🟨 کارت زرد</div>

                <div className="card-registration__team">
                  <strong>{homeName || "HOME"}</strong>
                  <div className="card-registration__controls">
                    <input
                      type="number"
                      min="1"
                      max="99"
                      inputMode="numeric"
                      value={homeYellowPlayer}
                      onChange={(event) => setHomeYellowPlayer(event.target.value)}
                      placeholder="شماره"
                      aria-label="شماره بازیکن کارت زرد HOME"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!homeYellowPlayer.trim()) return;
                        addEvent("YELLOW CARD", "HOME", Number(homeYellowPlayer));
                        setHomeYellowPlayer("");
                      }}
                    >
                      ثبت کارت
                    </button>
                  </div>
                </div>

                <div className="card-registration__team">
                  <strong>{guestName || "GUEST"}</strong>
                  <div className="card-registration__controls">
                    <input
                      type="number"
                      min="1"
                      max="99"
                      inputMode="numeric"
                      value={guestYellowPlayer}
                      onChange={(event) => setGuestYellowPlayer(event.target.value)}
                      placeholder="شماره"
                      aria-label="شماره بازیکن کارت زرد GUEST"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!guestYellowPlayer.trim()) return;
                        addEvent("YELLOW CARD", "GUEST", Number(guestYellowPlayer));
                        setGuestYellowPlayer("");
                      }}
                    >
                      ثبت کارت
                    </button>
                  </div>
                </div>
              </div>

              <div className="card-registration card-registration--red">
                <div className="card-registration__title">🟥 کارت قرمز</div>

                <div className="card-registration__team">
                  <strong>{homeName || "HOME"}</strong>
                  <div className="card-registration__controls">
                    <input
                      type="number"
                      min="1"
                      max="99"
                      inputMode="numeric"
                      value={homeRedPlayer}
                      onChange={(event) => setHomeRedPlayer(event.target.value)}
                      placeholder="شماره"
                      aria-label="شماره بازیکن کارت قرمز HOME"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!homeRedPlayer.trim()) return;
                        addEvent("RED CARD", "HOME", Number(homeRedPlayer));
                        setHomeRedPlayer("");
                      }}
                    >
                      ثبت کارت
                    </button>
                  </div>
                </div>

                <div className="card-registration__team">
                  <strong>{guestName || "GUEST"}</strong>
                  <div className="card-registration__controls">
                    <input
                      type="number"
                      min="1"
                      max="99"
                      inputMode="numeric"
                      value={guestRedPlayer}
                      onChange={(event) => setGuestRedPlayer(event.target.value)}
                      placeholder="شماره"
                      aria-label="شماره بازیکن کارت قرمز GUEST"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!guestRedPlayer.trim()) return;
                        addEvent("RED CARD", "GUEST", Number(guestRedPlayer));
                        setGuestRedPlayer("");
                      }}
                    >
                      ثبت کارت
                    </button>
                  </div>
                </div>
              </div>

              <div className="goal-registration card-registration card-registration--goal">
                <div className="card-registration__title">⚽ گل‌زنندگان</div>

                <div className="card-registration__team">
                  <strong>{homeName || "HOME"}</strong>
                  <div className="card-registration__controls">
                    <input
                      type="number"
                      min="1"
                      max="99"
                      inputMode="numeric"
                      value={homeGoalPlayer}
                      onChange={(event) => setHomeGoalPlayer(event.target.value)}
                      placeholder="شماره"
                      aria-label="شماره گلزن HOME"
                    />
                    <button
                      type="button"
                      disabled={
                        !hasUnassignedGoal("HOME") ||
                        !playerNumberExists("HOME", Number(homeGoalPlayer))
                      }
                      onClick={() => registerGoalByPlayer("HOME", homeGoalPlayer)}
                    >
                      ثبت گل
                    </button>
                  </div>
                </div>

                <div className="card-registration__team">
                  <strong>{guestName || "GUEST"}</strong>
                  <div className="card-registration__controls">
                    <input
                      type="number"
                      min="1"
                      max="99"
                      inputMode="numeric"
                      value={guestGoalPlayer}
                      onChange={(event) => setGuestGoalPlayer(event.target.value)}
                      placeholder="شماره"
                      aria-label="شماره گلزن GUEST"
                    />
                    <button
                      type="button"
                      disabled={
                        !hasUnassignedGoal("GUEST") ||
                        !playerNumberExists("GUEST", Number(guestGoalPlayer))
                      }
                      onClick={() => registerGoalByPlayer("GUEST", guestGoalPlayer)}
                    >
                      ثبت گل
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </aside>
      </div>

      {showRestWarning && (
        <div className="rest-warning-backdrop" role="presentation">
          <div className="rest-warning" role="alertdialog" aria-modal="true" aria-labelledby="rest-warning-title">
            <div className="rest-warning__icon">!</div>
            <span className="rest-warning__eyebrow">MATCH CONTROL</span>
            <h2 id="rest-warning-title">فعال‌سازی استراحت</h2>
            <p>
              زمان اصلی بازی متوقف می‌شود و نمایشگر روی <strong>00:00</strong> قرار می‌گیرد.
            </p>
            <div className="rest-warning__actions">
              <button type="button" className="rest-warning__cancel" onClick={() => setShowRestWarning(false)}>
                انصراف
              </button>
              <button
                type="button"
                className="rest-warning__confirm"
                onClick={() => {
                  resetScoreboard();
                  setShowRestWarning(false);
                }}
              >
                تأیید
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
