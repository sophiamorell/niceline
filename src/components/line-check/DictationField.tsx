"use client";

import { useEffect, useRef } from "react";
import { lineCheck } from "@/content-line-check";
import { useDictation } from "@/lib/line-check/useDictation";
import { MicIcon, StopIcon } from "@/components/line-check/icons";

/**
 * Talk or type: the big mic button, with the text area below it as an equal
 * alternative. While listening, the words appear in the text area as they're
 * heard (read-only); after Stop it's ordinary editable text.
 *
 * Without speech recognition (Firefox, some in-app browsers) the mic is
 * simply not there. If the microphone is refused, one line says to type
 * instead and the text area takes focus.
 */
export function DictationField({
  id,
  value,
  onChange,
  onMicStart,
  showPrivacy = false,
  rows = 6,
  label = lineCheck.tell.textareaLabel,
  placeholder = lineCheck.tell.textareaPlaceholder,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  onMicStart?: () => void;
  showPrivacy?: boolean;
  rows?: number;
  label?: string;
  placeholder?: string;
}) {
  const { mic } = lineCheck;
  const dictation = useDictation();
  const baseRef = useRef("");
  const textRef = useRef<HTMLTextAreaElement>(null);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // Live words go straight into the text, after whatever was there before.
  useEffect(() => {
    if (!dictation.isListening) return;
    const base = baseRef.current.trim();
    const heard = dictation.transcript;
    onChangeRef.current(base && heard ? `${base} ${heard}` : base || heard);
  }, [dictation.transcript, dictation.isListening]);

  useEffect(() => {
    if (dictation.stopReason === "denied") textRef.current?.focus();
  }, [dictation.stopReason]);

  const toggle = () => {
    if (dictation.isListening) {
      dictation.stop();
      return;
    }
    baseRef.current = value;
    onMicStart?.();
    dictation.start();
  };

  return (
    <div className="lc-dictate">
      {dictation.isSupported && (
        <div className="lc-mic">
          <button
            type="button"
            className={dictation.isListening ? "lc-mic__button lc-mic__button--on" : "lc-mic__button"}
            onClick={toggle}
            aria-pressed={dictation.isListening}
            aria-label={dictation.isListening ? mic.stop : mic.start}
          >
            {dictation.isListening ? <StopIcon size={30} /> : <MicIcon size={34} />}
          </button>
          <p className="lc-mic__label" aria-live="polite">
            {dictation.isListening ? (
              <>
                <span className="lc-mic__dot" aria-hidden="true" />
                {mic.listening} <span className="lc-mic__stop-word">{mic.stop}</span>
              </>
            ) : (
              mic.hint
            )}
          </p>
          {dictation.stopReason === "denied" && (
            <p className="lc-note" role="status">
              {mic.denied}
            </p>
          )}
          {dictation.stopReason === "timeLimit" && (
            <p className="lc-note" role="status">
              {mic.timeLimit}
            </p>
          )}
          {showPrivacy && <p className="lc-fine lc-mic__privacy">{lineCheck.privacy}</p>}
        </div>
      )}

      <label htmlFor={id} className="field lc-dictate__field">
        <span className="field__label">{label}</span>
        <textarea
          id={id}
          ref={textRef}
          className={dictation.isListening ? "input lc-textarea lc-textarea--live" : "input lc-textarea"}
          rows={rows}
          value={value}
          readOnly={dictation.isListening}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      </label>
    </div>
  );
}
