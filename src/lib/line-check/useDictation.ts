"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

/**
 * Line Check: the voice layer (build brief, section 6). One swappable
 * module: today the browser's Web Speech API, later perhaps recorded audio
 * sent to a transcription API, behind the same return shape.
 *
 * Continuous mode with interim results, en-US. Recognition sometimes ends
 * on silence; it restarts while the user hasn't pressed Stop. It stops on
 * its own after three minutes.
 *
 * `transcript` is the text heard since the last start(); the caller owns
 * the editable text and appends it.
 */

const MAX_MS = 3 * 60 * 1000;

type StopReason = "user" | "denied" | "timeLimit" | "error" | null;

interface RecognitionResult {
  isFinal: boolean;
  0: { transcript: string };
}
interface RecognitionEvent {
  resultIndex: number;
  results: ArrayLike<RecognitionResult>;
}
interface Recognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: RecognitionEvent) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}
type RecognitionCtor = new () => Recognition;

function getCtor(): RecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

const noopSubscribe = () => () => {};

export interface Dictation {
  start: () => void;
  stop: () => void;
  transcript: string;
  isListening: boolean;
  isSupported: boolean;
  stopReason: StopReason;
}

export function useDictation(): Dictation {
  const isSupported = useSyncExternalStore(noopSubscribe, () => getCtor() !== null, () => false);
  const [isListening, setListening] = useState(false);
  const [finalText, setFinalText] = useState("");
  const [interim, setInterim] = useState("");
  const [stopReason, setStopReason] = useState<StopReason>(null);

  const recRef = useRef<Recognition | null>(null);
  const wantRef = useRef(false); // true while the user hasn't pressed Stop
  const timerRef = useRef<number | null>(null);

  const finish = useCallback((reason: StopReason) => {
    wantRef.current = false;
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    timerRef.current = null;
    setStopReason(reason);
    try {
      recRef.current?.stop();
    } catch {
      /* already stopped */
    }
  }, []);

  const start = useCallback(() => {
    const Ctor = getCtor();
    if (!Ctor || wantRef.current) return;

    const rec = new Ctor();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "en-US";

    // Results restart from zero on each session; keep earlier sessions' text.
    let committed = "";
    let session = "";
    rec.onresult = (event) => {
      let finals = "";
      let pending = "";
      for (let i = 0; i < event.results.length; i++) {
        const r = event.results[i];
        if (r.isFinal) finals += r[0].transcript;
        else pending += r[0].transcript;
      }
      session = finals;
      setFinalText(join(committed, finals));
      setInterim(pending);
    };
    rec.onerror = (event) => {
      if (event.error === "not-allowed" || event.error === "service-not-allowed") finish("denied");
      else if (event.error === "audio-capture") finish("error");
      // "no-speech" and "network" fall through to onend, which restarts.
    };
    rec.onend = () => {
      committed = join(committed, session);
      session = "";
      setInterim("");
      if (wantRef.current) {
        try {
          rec.start();
          return;
        } catch {
          /* fall through to stopped */
        }
      }
      wantRef.current = false;
      setListening(false);
    };

    recRef.current = rec;
    wantRef.current = true;
    setFinalText("");
    setInterim("");
    setStopReason(null);
    try {
      rec.start();
      setListening(true);
      timerRef.current = window.setTimeout(() => finish("timeLimit"), MAX_MS);
    } catch {
      wantRef.current = false;
      setListening(false);
    }
  }, [finish]);

  const stop = useCallback(() => finish("user"), [finish]);

  useEffect(
    () => () => {
      wantRef.current = false;
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
      try {
        recRef.current?.abort();
      } catch {
        /* nothing to abort */
      }
    },
    [],
  );

  return { start, stop, transcript: join(finalText, interim), isListening, isSupported, stopReason };
}

function join(a: string, b: string): string {
  const left = a.trim();
  const right = b.trim();
  if (!left) return right;
  if (!right) return left;
  return `${left} ${right}`;
}
