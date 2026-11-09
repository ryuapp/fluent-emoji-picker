"use client";

import {
  useCallback,
  useEffect,
  useEffectEvent,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import Play from "lucide-react/icons/play";
import RotateCcw from "lucide-react/icons/rotate-ccw";
import Timer from "lucide-react/icons/timer";
import Trophy from "lucide-react/icons/trophy";
import { EmojiImage } from "#components/emoji-image.tsx";
import { getEmojiList, getEmojiUrl } from "#lib/emoji.ts";
import { cn } from "#lib/utils.ts";

const pairs = [
  [1, 4], // Grinning / beaming with smiling eyes.
  [9, 10], // Slightly smiling / upside-down face.
  [15, 16], // Smiling with hearts / heart-eyes.
  [25, 26], // Tongue / winking with tongue.
  [115, 116], // Grinning cats with different eyes.
  [140, 141], // Red / orange heart.
  [2, 3], // Grinning faces with different eyes.
  [5, 6], // Squinting / sweat.
  [7, 8], // Laughing faces.
  [13, 14], // Smiling / halo.
  [19, 21], // Kissing faces.
  [21, 22], // Kissing with different eyes.
  [25, 28], // Tongue / squinting with tongue.
  [31, 32], // Hand over mouth with different eyes.
  [39, 40], // Neutral / expressionless.
  [44, 45], // Smirking / unamused.
  [52, 54], // Sleepy / sleeping.
  [64, 65], // Knocked-out / spiral eyes.
  [70, 71], // Sunglasses / glasses.
  [73, 75], // Confused / worried.
  [76, 77], // Frowning faces.
  [78, 79], // Open mouth / hushed.
  [82, 83], // Pleading / holding back tears.
  [89, 90], // Crying faces.
  [96, 97], // Weary / tired.
  [100, 101], // Pouting / angry.
  [103, 104], // Smiling / angry with horns.
  [119, 123], // Smirking / pouting cats.
  [124, 125], // See-no-evil / hear-no-evil.
  [125, 126], // Hear-no-evil / speak-no-evil.
  [537, 538], // Bear / polar bear.
  [551, 552], // Baby chicks facing different directions.
  [636, 637], // Red / green apple.
  [932, 936], // First / last quarter moon.
  [940, 941], // Quarter moon faces.
];
const emojis = new Map(getEmojiList().map((emoji) => [emoji.id, emoji]));
const bestKey = "emoji-odd-one-out-best";
const bestEvent = "emoji-best-change";
const initialRound = { pair: 0, odd: 5, flipped: false };

function getBest() {
  try {
    const saved = Number(localStorage.getItem(bestKey));
    return Number.isSafeInteger(saved) && saved > 0 ? saved : 0;
  } catch {
    return 0;
  }
}

function subscribeBest(onChange: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key === bestKey || event.key === null) {
      onChange();
    }
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(bestEvent, onChange);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(bestEvent, onChange);
  };
}

function getServerBest() {
  return 0;
}

function nextRound() {
  const values = crypto.getRandomValues(new Uint32Array(3));
  return {
    pair: values[0] % pairs.length,
    odd: values[1] % 16,
    flipped: values[2] % 2 === 1,
  };
}

export function EmojiGame() {
  const [phase, setPhase] = useState<"ready" | "playing" | "finished">("ready");
  const [round, setRound] = useState(initialRound);
  const [score, setScore] = useState(0);
  const savedBest = useSyncExternalStore(subscribeBest, getBest, getServerBest);
  const [sessionBest, setSessionBest] = useState(0);
  const best = Math.max(savedBest, sessionBest);
  const [seconds, setSeconds] = useState(30);
  const [wrong, setWrong] = useState<number | null>(null);
  const [revealedImages] = useState(() => new Set<string>());
  const deadline = useRef(0);
  const tiles = useRef<HTMLDivElement>(null);
  const focusReplay = useCallback(
    (button: HTMLButtonElement | null) => {
      if (phase === "finished") {
        button?.focus({ preventScroll: true });
      }
    },
    [phase],
  );

  function finish() {
    setSeconds(0);
    setPhase("finished");
    if (score > best) {
      setSessionBest(score);
      try {
        localStorage.setItem(bestKey, String(score));
        window.dispatchEvent(new Event(bestEvent));
      } catch {
        /* Keep the session best when storage is unavailable. */
      }
    }
  }

  const tick = useEffectEvent(() => {
    const remaining = Math.max(
      0,
      Math.ceil((deadline.current - performance.now()) / 1000),
    );
    if (remaining === 0) {
      finish();
    } else {
      setSeconds(remaining);
    }
  });

  useEffect(() => {
    if (phase !== "playing") {
      return;
    }
    const timer = setInterval(tick, 100);
    tiles.current
      ?.querySelector<HTMLButtonElement>("button")
      ?.focus({ preventScroll: true });
    return () => clearInterval(timer);
  }, [phase]);

  useEffect(() => {
    if (wrong === null) {
      return;
    }
    const timer = setTimeout(() => setWrong(null), 250);
    return () => clearTimeout(timer);
  }, [wrong]);

  function start() {
    deadline.current = performance.now() + 30_000;
    setRound(nextRound());
    setScore(0);
    setSeconds(30);
    setWrong(null);
    setPhase("playing");
  }

  function pick(index: number) {
    if (phase !== "playing") {
      return;
    }
    if (performance.now() >= deadline.current) {
      finish();
      return;
    }
    if (index === round.odd) {
      setScore((value) => value + 1);
      setRound(nextRound());
      setWrong(null);
    } else {
      deadline.current -= 2000;
      setSeconds(
        Math.max(0, Math.ceil((deadline.current - performance.now()) / 1000)),
      );
      setWrong(index);
    }
  }

  return (
    <div className="mx-auto w-full max-w-[440px] rounded-3xl border bg-background p-5 shadow-2xl shadow-black/5 sm:p-7">
      <div className="mb-5 flex items-center justify-between gap-3">
        <p className="text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase"></p>
      </div>
      <h2 className="text-2xl font-bold tracking-tight">Odd One Emoji Out</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Spot and tap the one different emoji among 16. Find as many as you can
        in 30 seconds. Each correct pick earns 1 point; each miss costs 2
        seconds.
      </p>
      <div className="my-5 grid grid-cols-3 divide-x rounded-2xl border bg-accent/30 py-3">
        <div className="text-center">
          <p className="mb-1 flex items-center justify-center gap-1 text-[10px] tracking-wider text-muted-foreground uppercase">
            <Timer className="size-3" aria-hidden="true" /> Time
          </p>
          <p
            className={cn(
              "text-xl font-semibold tabular-nums",
              seconds <= 5 && "text-orange-600",
            )}
            aria-label={`${seconds} seconds left`}
          >
            {seconds}
            <span className="ml-0.5 text-xs text-muted-foreground">s</span>
          </p>
        </div>
        <div className="text-center">
          <p className="mb-1 text-[10px] tracking-wider text-muted-foreground uppercase">
            Score
          </p>
          <p className="text-xl font-semibold tabular-nums">{score}</p>
        </div>
        <div className="text-center">
          <p className="mb-1 flex items-center justify-center gap-1 text-[10px] tracking-wider text-muted-foreground uppercase">
            <Trophy className="size-3" aria-hidden="true" /> Best
          </p>
          <p className="text-xl font-semibold tabular-nums">{best}</p>
        </div>
      </div>
      <div className="relative overflow-hidden rounded-2xl">
        <div
          ref={tiles}
          role="group"
          aria-label="Find the different emoji"
          className="grid grid-cols-4 gap-2 p-1"
        >
          {Array.from({ length: 16 }, (_, index) => {
            const pair = pairs[round.pair];
            const emoji = emojis.get(
              pair[Number((index === round.odd) !== round.flipped)],
            );
            if (!emoji) {
              throw new Error("Game emoji is missing from the catalog");
            }
            return (
              <button
                key={index}
                type="button"
                disabled={phase !== "playing"}
                aria-label={`Tile ${index + 1}: ${emoji.name}`}
                onClick={() => pick(index)}
                className={cn(
                  "relative flex aspect-square min-w-0 items-center justify-center rounded-xl border bg-accent/25 transition-colors hover:bg-accent focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none active:scale-95",
                  wrong === index && "border-orange-500 bg-orange-500/15",
                )}
              >
                <EmojiImage
                  key={emoji.id}
                  revealedImages={revealedImages}
                  id={emoji.id}
                  name={emoji.name}
                  path={getEmojiUrl(emoji)}
                  copied={false}
                />
              </button>
            );
          })}
        </div>
        {phase !== "playing" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl bg-background/85 px-4 text-center backdrop-blur-sm">
            <p className="text-2xl font-bold tracking-tight">
              {phase === "ready" ? "Sharp eyes?" : "Time’s up!"}
            </p>
            <p className="mt-2 mb-5 text-sm text-muted-foreground">
              {phase === "ready"
                ? "16 emojis. One imposter. 30 seconds."
                : `${score} found. ${score >= 15 ? "Eagle eyes." : score >= 5 ? "Nicely spotted." : "Another round?"}`}
            </p>
            <button
              ref={focusReplay}
              type="button"
              onClick={start}
              className="inline-flex items-center gap-2 rounded-full bg-amber-400 px-6 py-3 text-sm font-bold text-amber-950 shadow-lg shadow-amber-500/15 transition-colors hover:bg-amber-300 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
            >
              {phase === "ready" ? (
                <Play className="size-4" aria-hidden="true" />
              ) : (
                <RotateCcw className="size-4" aria-hidden="true" />
              )}
              {phase === "ready" ? "Let’s play" : "Play again"}
            </button>
          </div>
        )}
      </div>
      <div
        className="mt-4 min-h-5 text-center text-xs text-muted-foreground"
        role="status"
        aria-live="polite"
      >
        {phase === "finished"
          ? `Final score: ${score}. Best: ${best}.`
          : wrong !== null
            ? "Not that one! −2 seconds."
            : phase === "playing"
              ? `${score} found. Find the different emoji.`
              : "A correct pick earns a point. A miss costs 2 seconds."}
      </div>
    </div>
  );
}
