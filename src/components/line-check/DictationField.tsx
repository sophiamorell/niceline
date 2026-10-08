"use client";

import { useEffect, useRef, useState } from "react";
import { lineCheck } from "@/content-line-check";
import { useDictation, type Dictation } from "@/lib/line-check/useDictation";
import { MicIcon } from "@/components/line-check/icons";

/**
 * Talk or type (handoff 1b, 1c, 1e). The screen owns the text; these pieces
 * add the voice layer on top of it:
 *
 *   useDictationInto  starts and stops listening, writing what's heard into
 *                     the text after whatever was already there
 *   MicHero           the big rust mic; while listening, its rings, the
 *                     pulse and "LISTENING · 1:12"
 *   LiveTranscript    the words as they're heard, interim ones muted
 *   MicInline         the small mic beside "Talk, or type below."
 *
 * Without speech recognition (Firefox, some in-app browsers) none of the mic
 * pieces render and typing is the whole experience, with no error.
 */

export interface DictationInto {
  d: Dictation;
  toggle: () => void;
  base: string;
}

export function useDictationInto(value: string, onChange: (value: string) => void, onMicStart?: () => void): DictationInto {
  const d = useDictation();
  const [base, setBase] = useState("");
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (!d.isListening) return;
    const b = base.trim();
    const heard = d.transcript;
    onChangeRef.current(b && heard ? `${b} ${heard}` : b || heard);
  }, [d.transcript, d.isListening, base]);

  const toggle = () => {
    if (d.isListening) {
      d.stop();
      return;
    }
    setBase(value);
    onMicStart?.();
    d.start();
  };

  return { d, toggle, base };
}

function useElapsed(startedAt: number | null): string {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (startedAt === null) return;
    const t = window.setInterval(() => setNow(Date.now()), 500);
    return () => window.clearInterval(t);
  }, [startedAt]);
  const secs = startedAt === null ? 0 : Math.max(0, Math.floor((now - startedAt) / 1000));
  return `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, "0")}`;
}

function Notes({ d }: { d: Dictation }) {
  const { mic } = lineCheck;
  if (d.stopReason === "denied") return <p className="lc-note" role="status">{mic.denied}</p>;
  if (d.stopReason === "timeLimit") return <p className="lc-note" role="status">{mic.timeLimit}</p>;
  return null;
}

export function MicHero({ into, showPrivacy = false }: { into: DictationInto; showPrivacy?: boolean }) {
  const { mic } = lineCheck;
  const { d, toggle } = into;
  const elapsed = useElapsed(d.startedAt);
  if (!d.isSupported) return null;

  const button = (
    <button
      type="button"
      className="lc-mic__button"
      onClick={toggle}
      aria-pressed={d.isListening}
      aria-label={d.isListening ? mic.stop : mic.start}
    >
      <MicIcon size={44} />
    </button>
  );

  return (
    <div className={d.isListening ? "lc-mic lc-mic--on" : "lc-mic"}>
      {d.isListening ? (
        <>
          <div className="lc-mic__disc">
            <div className="lc-mic__ring">{button}</div>
          </div>
          <p className="lc-mic__status" aria-live="polite">
            <span className="lc-mic__dot" aria-hidden="true" />
            <span>
              {mic.listening} · <span aria-hidden="true">{elapsed}</span>
            </span>
          </p>
        </>
      ) : (
        <>
          {button}
          <p className="lc-mic__hint">{mic.hint}</p>
        </>
      )}
      <Notes d={d} />
      {showPrivacy && !d.isListening && <p className="lc-fine lc-mic__privacy">{lineCheck.privacy}</p>}
    </div>
  );
}

export function LiveTranscript({ into }: { into: DictationInto }) {
  const { d, base } = into;
  const settled = [base.trim(), d.finalText.trim()].filter(Boolean).join(" ");
  return (
    <div className="lc-live" aria-live="polite">
      {settled}
      {d.interim && <span className="lc-live__interim"> {d.interim}</span>}
    </div>
  );
}

export function MicInline({ into }: { into: DictationInto }) {
  const { mic } = lineCheck;
  const { d, toggle } = into;
  const elapsed = useElapsed(d.startedAt);
  if (!d.isSupported) return null;
  return (
    <div className="lc-mic-inline">
      <button
        type="button"
        className={d.isListening ? "lc-mic__button lc-mic__button--sm lc-mic__button--on" : "lc-mic__button lc-mic__button--sm"}
        onClick={toggle}
        aria-pressed={d.isListening}
        aria-label={d.isListening ? mic.stop : mic.start}
      >
        <MicIcon size={26} />
      </button>
      <div>
        {d.isListening ? (
          <p className="lc-mic__status" aria-live="polite">
            <span className="lc-mic__dot" aria-hidden="true" />
            <span>
              {mic.listening} · <span aria-hidden="true">{elapsed}</span> · {mic.stop}
            </span>
          </p>
        ) : (
          <p className="lc-mic-inline__hint">{mic.followUpHint}</p>
        )}
        <Notes d={d} />
      </div>
    </div>
  );
}
