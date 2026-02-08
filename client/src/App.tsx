import { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import "./App.css";

type Stage = 1 | 2 | 3 | 4;

type NoByPerson = {
  zayaan: number;
  reese: number;
  neha: number;
};

export default function App() {
  const unlockedOnLoad = localStorage.getItem("valentineUnlocked") === "true";

  const [stage, setStage] = useState<Stage>(1);
  const [message, setMessage] = useState("");
  const [showFinal, setShowFinal] = useState(false);

  const [yesScale, setYesScale] = useState(1);
  const [warningMessage, setWarningMessage] = useState("");
  

  const [noByPerson, setNoByPerson] = useState<NoByPerson>({
    zayaan: 0,
    reese: 0,
    neha: 0
  });

  const [mostDramatic, setMostDramatic] = useState<{ topName: string; topCount: number } | null>(null);
 


  /* ================= DATE STATES ================= */

  const [showDateDetails, setShowDateDetails] = useState(unlockedOnLoad);
  const [dateUnlocked, setDateUnlocked] = useState(false);
  const [countdown, setCountdown] = useState("");

  const [sealBroken, setSealBroken] = useState(unlockedOnLoad);
   const [openingSeal, setOpeningSeal] = useState(false);
  const [envelopeOpened, setEnvelopeOpened] = useState(unlockedOnLoad);

  const targetDate = new Date("2026-02-14T14:00:00-07:00");
  

  /* ================= FETCH STAGE ================= */

  useEffect(() => {
    fetch("/api/progress")
      .then((res) => res.json())
      .then((data) => {
        const safeStage = Math.min(Math.max(data.stage ?? 1, 1), 4) as Stage;
        setStage(safeStage);
        if (safeStage === 4) {
          setShowFinal(true);
        }
        if (data.noByPerson) setNoByPerson(data.noByPerson);
      })

      .catch(() => setStage(1));
  }, []);

  /* ================= PERSISTENT FINAL STATE ================= */


  /* 🔥 ADD THIS RIGHT HERE */
  useEffect(() => {
    if (stage === 4) {
      setShowFinal(true);
    }
  }, [stage]);

  /* ================= COUNTDOWN LOGIC ================= */

  useEffect(() => {
    if (!showDateDetails) return;

    const interval = setInterval(() => {
      const now = new Date();
      const diff = targetDate.getTime() - now.getTime();

      if (diff <= 0) {
        setCountdown("IT’S DATE TIME 💖");
        setDateUnlocked(true);
        setSealBroken(true);
        setEnvelopeOpened(true);
        launchConfetti();
        clearInterval(interval);
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / 1000 / 60) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setCountdown(`${days}d ${hours}h ${minutes}m ${seconds}s`);
    }, 1000);

    return () => clearInterval(interval);
  }, [showDateDetails]);

  /* ================= STAGE PROGRESSION ================= */

  const nextStage = async () => {
    try {
      const res = await fetch("/api/approve", {

        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage })
      });

      const data = await res.json();
      setMessage(data.cuteMessage + " 💗✨");

      setStage(data.nextStage);

      if (data.nextStage === 4) {
        setShowFinal(true);
        localStorage.setItem("valentineUnlocked", "true");
        launchConfetti();
      } else {
        setYesScale(1);
        setWarningMessage("");
      }

    } catch (err) {
      console.error("Failed to approve:", err);
      setMessage("Something went wrong. Please try again. 💔");
    }
  };

  const dodge = (e: React.MouseEvent<HTMLButtonElement>) => {
    const btn = e.currentTarget;
    const intensity = stage * 120;

    btn.style.position = "absolute";
    btn.style.left = Math.random() * intensity + "px";
    btn.style.top = Math.random() * 100 + "px";
    btn.style.transform = `rotate(${Math.random() * 30 - 15}deg)`;
  };

  const handleNoClick = async () => {
    const newScale = yesScale + 0.8;
    setYesScale(newScale);

    if (newScale < 1.5) setWarningMessage("Are you sureeee?? 🤨");
    else if (newScale < 2) setWarningMessage("100%?? 😭");
    else if (newScale < 3) setWarningMessage("You fr mean it??");
    else if (newScale < 4) setWarningMessage("No Churches Chicken for you 😤");
    else setWarningMessage("Bro just click YES at this point 💀");

    try {
      const res = await fetch("/api/no-click", {

        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage })
      });

      const data = await res.json();

      if (data?.cuteMessage) setMessage(data.cuteMessage + " 💞");
      if (data?.noByPerson) setNoByPerson(data.noByPerson);
      if (data?.mostDramatic) setMostDramatic(data.mostDramatic);
    } catch {
      setMessage("NO received. Destiny is buffering… 💗");
    }
  };

  const launchConfetti = () => {
    confetti({
      particleCount: 300,
      spread: 160,
      origin: { y: 0.6 }
    });
  };

  const contentMap = {
    1: { title: "Zayaan 👑", img: "/zayaan.jpg" },
    2: { title: "Reese 🐾", img: "/reese.jpg" },
    3: { title: "NEHA QAMAR 💗", img: "/neha.jpg" }
  };
  
  const content = contentMap[stage as 1 | 2 | 3] ?? null;




  const totalNo = noByPerson.zayaan + noByPerson.reese + noByPerson.neha;

  const dramaticLabel =
    mostDramatic?.topName === "zayaan"
      ? "Zayaan is the CEO of Resistance 👑"
      : mostDramatic?.topName === "reese"
      ? "Reese said “no” but with puppy eyes 🐾"
      : mostDramatic?.topName === "neha"
      ? "Neha tried… but destiny won 💗"
      : "Destiny has spoken.";

  return (
    <div className="app">
      <div className="card">

        <h1>
          {stage === 1 && "Zayaan 👑… do you want Churches Texas Chicken? 🍗"}
          {stage === 2 && "Reese 🐾… do you like the chicken treat shi? 🍗"}
          {stage === 3 && "Final question for the baddie herself… 😏"}
        </h1>

        {!showFinal ? (
          <>
            {content && (
              <img src={content.img} className="avatar" alt="avatar" />
            )}


            <h2>
              {stage === 1 && "Be honest now."}
              {stage === 2 && "No lying."}
              {stage === 3 && "Will you be my Valentine’s bae??? 💗"}
            </h2>

            <div className="buttons">
              <button
                className="yes"
                onClick={nextStage}
                style={{
                  transform: `scale(${yesScale})`,
                  transition: "0.4s ease",
                  position: "relative",
                  zIndex: 10,
                  borderRadius: yesScale > 3 ? "50%" : "12px",
                  padding: yesScale > 3 ? "120px" : "12px 24px"
                }}
              >
                YES 💖
              </button>

              <button
                className="no"
                onClick={handleNoClick}
                onMouseEnter={dodge}
                style={{
                  position: "relative",
                  zIndex: 1,
                  transition: "0.3s ease",
                  opacity: yesScale > 3 ? 0.2 : 1,
                  pointerEvents: yesScale > 4 ? "none" : "auto"
                }}
              >
                NO 😭
              </button>
            </div>

            {warningMessage && <p className="warning">{warningMessage}</p>}
            {message && <p className="backendMsg">{message}</p>}
          </>
        ) : (
          <div className="final">
            <h2>IT’S OFFICIAL 😭💗</h2>
            <img src="/siddhartha-kiss.jpg" className="kiss" alt="final" />

            <div className="scoreboard">
              <h3>Resistance Report 📊💘</h3>

              <p className="scoreLine">Zayaan said NO: <b>{noByPerson.zayaan}</b> times 👑</p>
              <p className="scoreLine">Reese said NO: <b>{noByPerson.reese}</b> times 🐾</p>
              <p className="scoreLine">Neha said NO: <b>{noByPerson.neha}</b> times 💗</p>

              <p className="scoreTotal">Total “NO” attempts: <b>{totalNo}</b></p>

              {mostDramatic && (
                <p className="mostDramatic">
                  Most Dramatic: <b>{mostDramatic.topName.toUpperCase()}</b>
                  <br />
                  {dramaticLabel}
                </p>
              )}

              <p className="finalBlessing">Verdict: Love wins. Always. 💞</p>

          


              {!showDateDetails && (
                <button
                  className="yes"
                  style={{ marginTop: "20px" }}
                  onClick={() => setShowDateDetails(true)}
                >
                  DETAILS ABOUT DATE 💌
                </button>
              )}

              {showDateDetails && (
                <div className="loveLetter">
                  <h3>💌 A Sealed Letter 💌</h3>

                  {!sealBroken && (
                    <div
                      className={`waxSeal ${openingSeal ? "opening" : ""}`}
                      onClick={() => {
                        setOpeningSeal(true);

                        setTimeout(() => {
                          setSealBroken(true);
                        }, 900); // matches animation length
                      }}
                    >
                      💗 BREAK THE SEAL 💗
                    </div>

                  )}

                  {sealBroken && (
                    <div className="envelope">
                      {!envelopeOpened && (
                        <button
                          className="yes"
                          style={{ marginTop: "15px" }}
                          onClick={() => setEnvelopeOpened(true)}
                        >
                          Open Letter 💌
                        </button>
                      )}

                      {envelopeOpened && (
                        <>
                          <p className="dateTextPink"><b>February 14, 2026</b></p>
                          <p className="dateTextPink"><b>2:00 PM</b></p>

                          {!dateUnlocked && (
                            <>
                              <p className="countdownLabel">Countdown:</p>
                              <p className="heartbeat">{countdown}</p>

                              <div className="floatingMessages">
                                {Array.from({ length: 8 }).map((_, i) => (
                                  <span key={i} className="floatText">
                                    come back at 2:00 PM for a surprise 🤭
                                  </span>
                                  ))}
                              </div>
                            </>
                          )}
                          <button
                style={{ marginTop: "20px", background: "#ff6fa5" }}
                onClick={async () => {
                  await fetch("/api/reset", { method: "POST" });
                  localStorage.removeItem("valentineUnlocked");
                  window.location.reload();
                }}
                >
                  Rewind the romance? 😼
                </button>

                          {dateUnlocked && (
                            <div style={{ marginTop: "20px" }}>
                              <a
                                href="https://www.google.com/maps/search/?api=1&query=Cactus+Club+Cafe+Downtown+Calgary"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="yes"
                                style={{
                                  display: "inline-block",
                                  padding: "10px 18px",
                                  textDecoration: "none"
                                }}
                              >
                                LOCATION AVAILABLE 📍
                              </a>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

