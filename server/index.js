import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";


const app = express();
app.use(cors());
app.use(express.json());

const peopleByStage = {
  1: "zayaan",
  2: "reese",
  3: "neha"
};

let state = {
  stage: 1,
  yesClicks: 0,
  noClicksTotal: 0,
  noByPerson: { zayaan: 0, reese: 0, neha: 0 },
  startTime: null,
  lastCuteMessage: ""
};

const cuteMessages = [
  "Noted. Your hesitation has been recorded in the Love Database.",
  "The universe saw that. It blinked twice.",
  "Interesting choice. Unfortunately, destiny disagrees.",
  "Okay… but the vibes are still immaculate.",
  "That 'NO' had weak energy. Try again.",
  "The council of romance has rejected your request."
];

function randomCuteMessage() {
  return cuteMessages[Math.floor(Math.random() * cuteMessages.length)];
}

function getMostDramatic(noByPerson) {
  const entries = Object.entries(noByPerson);
  entries.sort((a, b) => b[1] - a[1]);
  const [topName, topCount] = entries[0];
  return { topName, topCount };
}

/**
 * GET current progress
 */
app.get("/api/progress", (req, res) => {
  res.json({
    stage: state.stage,
    yesClicks: state.yesClicks,
    noClicksTotal: state.noClicksTotal,
    noByPerson: state.noByPerson
  });
});

/**
 * POST approve (YES)
 * body: { stage }
 */
app.post("/api/approve", (req, res) => {
  const currentStage = Number(req.body?.stage ?? state.stage);

  // init timer on first real action
  if (!state.startTime) state.startTime = Date.now();

  state.yesClicks += 1;

  // move forward
  const nextStage = Math.min(currentStage + 1, 4);
  state.stage = nextStage;

  const cuteMessage = "YES accepted. Advancing the relationship timeline.";
  state.lastCuteMessage = cuteMessage;

  // if nextStage is 4 => done
  let timeTaken = 0;
  if (nextStage === 4 && state.startTime) {
    timeTaken = Math.floor((Date.now() - state.startTime) / 1000);
  }

  res.json({
    cuteMessage,
    nextStage,
    stage: state.stage,
    yesClicks: state.yesClicks,
    noClicksTotal: state.noClicksTotal,
    noByPerson: state.noByPerson,
    timeTaken
  });
});

/**
 * POST no-click
 * body: { stage }  (we infer person from stage)
 */
app.post("/api/no-click", (req, res) => {
  const stageNum = Number(req.body?.stage ?? state.stage);
  const who = peopleByStage[stageNum] || "neha";

  // init timer on first real action
  if (!state.startTime) state.startTime = Date.now();

  state.noClicksTotal += 1;
  state.noByPerson[who] = (state.noByPerson[who] ?? 0) + 1;

  const cuteMessage = randomCuteMessage();
  state.lastCuteMessage = cuteMessage;

  const most = getMostDramatic(state.noByPerson);

  res.json({
    cuteMessage,
    stage: state.stage,
    noClicksTotal: state.noClicksTotal,
    noByPerson: state.noByPerson,
    mostDramatic: most
  });
});

/**
 * Optional: reset everything (if you ever want to restart)
 */
app.post("/api/reset", (req, res) => {
  state = {
    stage: 1,
    yesClicks: 0,
    noClicksTotal: 0,
    noByPerson: { zayaan: 0, reese: 0, neha: 0 },
    startTime: null,
    lastCuteMessage: ""
  };

  res.json({ ok: true });
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve built frontend
app.use(express.static(path.join(__dirname, "../client/dist")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/dist/index.html"));
});

const PORT = process.env.PORT || 5050;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


