"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { analytics, anchors, diagnostic, site, type DiagnosticQuestion } from "@/content";
import { fill, mutedClass } from "@/lib/copy";
import { useDialog } from "@/lib/dialog";
import { OPEN_EVENT } from "@/lib/diagnostic-modal";
import { scoreDiagnostic, type Answers } from "@/lib/diagnostic-score";
import { postForm } from "@/lib/forms";
import { track } from "@/lib/track";

/**
 * The diagnostic popup: the questions one at a time, then the verdict and
 * the three gaps on screen, then the email ask, then a done screen. Nothing
 * is asked for until the visitor has seen their result; the email buys the
 * fix for each gap and the recommended next step. Opened by openDiagnostic()
 * (the hero card, the mist section's button) and by any link to #diagnostic.
 *
 * Closing (×, backdrop, Escape) keeps the step, answers and email; reopening
 * after the done screen starts again at question 1. Focus is trapped in the
 * dialog and returns to whatever opened it; page scroll is locked.
 *
 * Single-choice questions advance on their own shortly after a tap; the
 * others use Next. The last question's button reads "See my verdict", which
 * scores the answers in the browser (src/lib/diagnostic-score.ts). The
 * verdict screen's email button posts everything at once.
 *
 * Field names are the long-run contract: q1…q10 (choice value = option id),
 * q5_contactsTotal / q5_contactsEmailable, email, and the computed score,
 * verdict and gaps. They must match public/__forms.html. Submission goes to
 * Netlify Forms: a urlencoded POST, including form-name, to that static file.
 */

type Step = number | "results" | "done"; // a number is the question index
type Status = "idle" | "submitting" | "error";

/* analytics.v0 = ["diagnostic_start", "diagnostic_step", "diagnostic_submit", "booking_click"] */
const [START_EVENT, STEP_EVENT, SUBMIT_EVENT, BOOKING_EVENT] = analytics.v0;

const AUTO_ADVANCE_MS = 250;
const EMAIL_PATTERN = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const DIAGNOSTIC_LINK = `a[href="#${anchors.diagnostic}"]`;

export function fieldNamesFor(question: DiagnosticQuestion): string[] {
  if (question.kind === "twoNumbers") {
    return (question.fields ?? []).map((field) => `q${question.id}_${field.id}`);
  }
  return [`q${question.id}`];
}

function questionAnswered(question: DiagnosticQuestion, answers: Answers): boolean {
  if (question.required === false) return true;
  return fieldNamesFor(question).every((name) => (answers[name] ?? "").trim() !== "");
}

export function DiagnosticModal() {
  const { questions, modal, netlifyFormName } = diagnostic;
  const total = questions.length;
  const uid = useId();

  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>(0);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState(false);
  const [answers, setAnswers] = useState<Answers>({});
  const [status, setStatus] = useState<Status>("idle");

  const dialogRef = useRef<HTMLDivElement>(null);
  const focusTargetRef = useRef<HTMLElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const stepRef = useRef<Step>(step);
  const advanceTimer = useRef<number | null>(null);
  const startedRef = useRef(false); // diagnostic_start fires once, on the first answer

  useEffect(() => {
    stepRef.current = step;
  }, [step]);

  const show = useCallback((opener: Element | null) => {
    openerRef.current = opener instanceof HTMLElement ? opener : null;
    if (stepRef.current === "done") {
      setStep(0);
      setAnswers({});
      setStatus("idle");
      startedRef.current = false;
    }
    setOpen(true);
  }, []);

  const close = useCallback(() => {
    if (advanceTimer.current !== null) {
      window.clearTimeout(advanceTimer.current);
      advanceTimer.current = null;
    }
    setOpen(false);
  }, []);

  /* Openers: the custom event, and any link to #diagnostic. */
  useEffect(() => {
    const onOpen = () => show(document.activeElement);
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = event.target instanceof Element ? event.target.closest(DIAGNOSTIC_LINK) : null;
      if (!link) return;
      event.preventDefault();
      show(link);
    };
    window.addEventListener(OPEN_EVENT, onOpen);
    document.addEventListener("click", onClick);
    return () => {
      window.removeEventListener(OPEN_EVENT, onOpen);
      document.removeEventListener("click", onClick);
    };
  }, [show]);

  /* While open: lock page scroll, Escape closes, Tab stays inside. */
  useDialog(open, close, dialogRef, openerRef);

  /* Move focus to each new screen's first thing to act on. */
  useEffect(() => {
    if (!open) return;
    focusTargetRef.current?.focus();
  }, [open, step]);

  const setAnswer = (name: string, value: string) => {
    if (!startedRef.current) {
      startedRef.current = true;
      track(START_EVENT);
    }
    setAnswers((prev) => ({ ...prev, [name]: value }));
  };

  const goTo = (index: number) => {
    if (advanceTimer.current !== null) {
      window.clearTimeout(advanceTimer.current);
      advanceTimer.current = null;
    }
    setStatus("idle");
    setStep(index);
  };

  const send = async () => {
    setStatus("submitting");
    try {
      const result = scoreDiagnostic(answers);
      const fields: Record<string, string> = {
        "form-name": netlifyFormName,
        email: email.trim(),
        score: `${result.score} of ${result.maxScore}`,
        verdict: result.verdict.label,
        gaps: result.gaps.map((q) => q.gap ?? `Q${q.id}`).join("; "),
      };
      for (const name of questions.flatMap(fieldNamesFor)) fields[name] = answers[name] ?? "";
      await postForm(fields);
      track(SUBMIT_EVENT, { verdict: result.verdict.id, score: result.score });
      setStatus("idle");
      setStep("done");
    } catch {
      setStatus("error");
    }
  };

  const onEmailSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!EMAIL_PATTERN.test(email.trim())) {
      setEmailError(true);
      return;
    }
    if (status !== "submitting") void send();
  };

  const forward = (index: number) => {
    track(STEP_EVENT, { step: index + 1 });
    if (index === total - 1) {
      goTo(index); // clears any pending auto-advance
      setStep("results");
      return;
    }
    goTo(index + 1);
  };

  const choose = (index: number, name: string, value: string) => {
    setAnswer(name, value);
    if (index === total - 1) return;
    if (advanceTimer.current !== null) window.clearTimeout(advanceTimer.current);
    advanceTimer.current = window.setTimeout(() => {
      advanceTimer.current = null;
      forward(index);
    }, AUTO_ADVANCE_MS);
  };

  if (!open) return null;

  const headingId = `${uid}-heading`;
  let screen: ReactNode;

  if (step === "results") {
    const { results } = modal;
    const result = scoreDiagnostic(answers);
    const emailId = `${uid}-email`;
    const errorId = `${uid}-email-error`;
    const emailHeadingId = `${uid}-email-heading`;
    const [failedBefore, failedAfter] = modal.sendFailed.split("{email}");
    screen = (
      <div>
        <p className="kicker">{results.kicker}</p>
        <h2
          id={headingId}
          className="modal__heading modal__heading--wrap"
          tabIndex={-1}
          ref={(el) => {
            focusTargetRef.current = el;
          }}
        >
          {result.verdict.label}
        </h2>
        <p className="modal__body">{result.verdict.note}</p>
        <p className="label modal__gaps-label">{results.gapsLabel}</p>
        {result.gaps.length > 0 ? (
          <ol className="modal__gaps">
            {result.gaps.map((question) => (
              <li key={question.id}>
                <span className="modal__gap">{question.gap}</span>
                <span className="modal__gap-from">{question.prompt}</span>
              </li>
            ))}
          </ol>
        ) : (
          <p className="modal__body modal__no-gaps">{results.noGaps}</p>
        )}

        <form onSubmit={onEmailSubmit} noValidate className="modal__ask" aria-labelledby={emailHeadingId}>
          <h3 id={emailHeadingId} className="modal__ask-heading">
            {result.gaps.length > 0 ? results.emailHeading : results.emailHeadingNoGaps}
          </h3>
          <p className="modal__body">{result.gaps.length > 0 ? results.emailBody : results.emailBodyNoGaps}</p>
          <label htmlFor={emailId} className="field">
            <span className="field__label">{results.label}</span>
            <input
              id={emailId}
              className="input modal__input"
              type="email"
              name="email"
              autoComplete="email"
              placeholder={results.placeholder}
              value={email}
              aria-invalid={emailError}
              aria-describedby={emailError ? errorId : undefined}
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailError(false);
              }}
            />
          </label>
          {emailError && (
            <p id={errorId} className="modal__error" role="alert">
              {results.invalid}
            </p>
          )}
          {status === "error" && (
            <p className="modal__error" role="alert">
              {failedBefore}
              {site.email !== null && <a href={`mailto:${site.email}`}>{site.email}</a>}
              {failedAfter}
            </p>
          )}
          <button type="submit" className="modal__submit" disabled={status === "submitting"}>
            <span>{status === "submitting" ? results.sendingLabel : results.submitLabel}</span>
            <span aria-hidden="true">→</span>
          </button>
        </form>

        <div className="modal__actions modal__actions--results">
          <button type="button" className="modal__back" onClick={() => goTo(total - 1)}>
            <span aria-hidden="true">← </span>
            {results.backLabel}
          </button>
        </div>
      </div>
    );
  } else if (step === "done") {
    screen = (
      <div>
        <p className="kicker">{modal.done.kicker}</p>
        <h2
          id={headingId}
          className="modal__heading modal__heading--wrap"
          tabIndex={-1}
          ref={(el) => {
            focusTargetRef.current = el;
          }}
        >
          {modal.done.heading}
        </h2>
        <p className="modal__body">
          {modal.done.bodyBefore}
          <b>{email.trim()}</b>
          {modal.done.bodyAfter}
        </p>
        <div className="modal__done-actions">
          <button type="button" className="button button--dark" onClick={close}>
            {modal.done.closeLabel}
          </button>
          {site.bookingUrl !== null && (
            <a href={site.bookingUrl} className="button button--outline" onClick={() => track(BOOKING_EVENT)}>
              {modal.done.bookingLabel}
            </a>
          )}
        </div>
      </div>
    );
  } else {
    const index = step;
    const question = questions[index];
    const isLast = index === total - 1;
    const canAdvance = questionAnswered(question, answers);

    screen = (
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (canAdvance) forward(index);
        }}
      >
        <p
          id={headingId}
          className="label modal__progress-label"
          tabIndex={-1}
          aria-live="polite"
          ref={(el) => {
            if (question.kind === "single") focusTargetRef.current = el;
          }}
        >
          {fill(modal.progressLabel, { current: index + 1, total })}
        </p>
        <div className="modal__progress" aria-hidden="true">
          <span style={{ width: `${((index + 1) / total) * 100}%` }} />
        </div>

        {question.kind === "single" ? (
          <ChoiceStep
            uid={uid}
            question={question}
            value={answers[`q${question.id}`]}
            onChoose={(value) => choose(index, `q${question.id}`, value)}
          />
        ) : (
          <QuestionField
            key={question.id}
            uid={uid}
            question={question}
            answers={answers}
            set={setAnswer}
            focusRef={(el) => {
              focusTargetRef.current = el;
            }}
          />
        )}

        <div className="modal__actions">
          <button
            type="button"
            className="modal__back"
            style={index === 0 ? { visibility: "hidden" } : undefined}
            onClick={() => goTo(index - 1)}
          >
            <span aria-hidden="true">← </span>
            {modal.backLabel}
          </button>
          <button type="submit" className="button button--yellow button--small" disabled={!canAdvance}>
            {isLast ? modal.finishLabel : modal.nextLabel}
          </button>
        </div>
      </form>
    );
  }

  return (
    <div
      className="modal"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) close();
      }}
    >
      <div ref={dialogRef} className="modal__dialog modal__dialog--diag" role="dialog" aria-modal="true" aria-labelledby={headingId}>
        <button type="button" className="modal__close" aria-label={modal.closeLabel} onClick={close}>
          <span aria-hidden="true">×</span>
        </button>
        {screen}
      </div>
    </div>
  );
}

/**
 * A single-choice question. Options are a radio group with roving focus:
 * arrow keys move between options without selecting, Space or Enter (or a
 * tap) selects, and selecting advances.
 */
function ChoiceStep({
  uid,
  question,
  value,
  onChoose,
}: {
  uid: string;
  question: DiagnosticQuestion;
  value: string | undefined;
  onChoose: (value: string) => void;
}) {
  const options = question.options ?? [];
  const groupRef = useRef<HTMLDivElement>(null);
  const labelId = `${uid}-q${question.id}-label`;
  const focusIndex = Math.max(
    0,
    options.findIndex((option) => option.id === value),
  );

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let target: number | null = null;
    if (event.key === "ArrowDown" || event.key === "ArrowRight") target = (index + 1) % options.length;
    if (event.key === "ArrowUp" || event.key === "ArrowLeft") target = (index - 1 + options.length) % options.length;
    if (event.key === "Home") target = 0;
    if (event.key === "End") target = options.length - 1;
    if (target === null) return;
    event.preventDefault();
    const buttons = groupRef.current?.querySelectorAll<HTMLButtonElement>("[role=radio]");
    buttons?.[target]?.focus();
  };

  return (
    <div className="question">
      <p id={labelId} className={["question__label", mutedClass(question.prompt)].filter(Boolean).join(" ")}>
        {question.prompt}
      </p>
      <div ref={groupRef} role="radiogroup" aria-labelledby={labelId} className="choice">
        {options.map((option, index) => {
          const checked = option.id === value;
          return (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={checked}
              tabIndex={index === focusIndex ? 0 : -1}
              className="choice__option"
              onClick={() => onChoose(option.id)}
              onKeyDown={(event) => onKeyDown(event, index)}
            >
              <span className="choice__radio" aria-hidden="true" />
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** A question with native controls: two numbers, or free text. */
function QuestionField({
  uid,
  question,
  answers,
  set,
  focusRef,
}: {
  uid: string;
  question: DiagnosticQuestion;
  answers: Answers;
  set: (name: string, value: string) => void;
  focusRef: (el: HTMLElement | null) => void;
}) {
  const promptClass = mutedClass(question.prompt);
  const required = question.required !== false;

  if (question.kind === "twoNumbers") {
    return (
      <fieldset className="question">
        <legend className={promptClass}>{question.prompt}</legend>
        <div className="numbers">
          {(question.fields ?? []).map((field, index) => {
            const name = `q${question.id}_${field.id}`;
            const id = `${uid}-${name}`;
            return (
              <label key={field.id} htmlFor={id} className="field">
                <span className="field__label">{field.label}</span>
                <input
                  id={id}
                  ref={index === 0 ? focusRef : undefined}
                  className="input"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  step={1}
                  name={name}
                  required={required}
                  placeholder={field.placeholder}
                  value={answers[name] ?? ""}
                  onChange={(e) => set(name, e.target.value)}
                />
              </label>
            );
          })}
        </div>
      </fieldset>
    );
  }

  const name = `q${question.id}`;
  const id = `${uid}-${name}`;
  return (
    <div className="question">
      <label htmlFor={id} className={["question__label", promptClass].filter(Boolean).join(" ")}>
        {question.prompt}
      </label>
      <textarea
        id={id}
        ref={focusRef}
        className="input"
        name={name}
        required={required}
        rows={3}
        value={answers[name] ?? ""}
        onChange={(e) => set(name, e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            e.currentTarget.form?.requestSubmit();
          }
        }}
      />
    </div>
  );
}
