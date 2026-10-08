"use client";

import {
  Fragment,
  useCallback,
  useEffect,
  useId,
  useReducer,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import Image from "next/image";
import Link from "next/link";
import { logo, site } from "@/content";
import { lineCheck } from "@/content-line-check";
import { fill } from "@/lib/copy";
import { postForm } from "@/lib/forms";
import { track } from "@/lib/track";
import { decodeRubric } from "@/lib/line-check/rubric-link";
import {
  MAX_BEST,
  MAX_PAINFUL,
  MIN_BEST,
  clearState,
  finishedCustomers,
  forApi,
  initialState,
  loadState,
  newId,
  reducer,
  saveState,
  synthesisKeyFor,
  type Action,
  type DraftCustomer,
  type State,
  type Step,
} from "@/lib/line-check/state";
import {
  profileOf,
  withField,
  type ApiError,
  type CustomerType,
  type ExtractResponse,
  type Field,
  type Rubric,
  type Synthesis,
  type SynthesizeResponse,
} from "@/lib/line-check/types";
import { LiveTranscript, MicHero, MicInline, useDictationInto } from "@/components/line-check/DictationField";
import { ProfileCards } from "@/components/line-check/ProfileCards";
import { Grid } from "@/components/line-check/Grid";
import { RubricCards, Scorer } from "@/components/line-check/RubricView";
import { CheckIcon, SpinnerIcon } from "@/components/line-check/icons";

/**
 * Line Check (behavior: "Line Check: prototype build brief"; visuals: the
 * Claude Design handoff "Line Check Storyboard", frames 0a to 6b).
 *
 *   0 Intro
 *   1 Best customers (2 to 3: nickname, tell, follow-ups, review, so far)
 *   2 Painful customers (optional, 0 to 2: intro with nickname, tell, review)
 *   3 Side-by-side check
 *   4 Finding the pattern, then the draft ICP (ungated)
 *   5 Email gate
 *   6 Rubric and live scorer (gated)
 *
 * Each screen is a column: top bar (Back, six progress segments, "n/6"),
 * content, then the main button pinned to the bottom. State is held
 * client-side (src/lib/line-check/state.ts) until the email gate, which posts
 * everything to Sophie through Netlify Forms. A URL with a rubric in its
 * hash (#r=...) opens straight to that rubric's scorer.
 */

const { events } = lineCheck;
const EMAIL_PATTERN = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const TOTAL = lineCheck.progress.stages.length;

type Dispatch = (action: Action) => void;

export function LineCheck() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [ready, setReady] = useState(false);
  const [sharedRubric, setSharedRubric] = useState<Rubric | null>(null);
  const step = state.history[state.history.length - 1];
  const stepKey = JSON.stringify(step);
  const firstStep = useRef(true);
  const stepRef = useRef(step);
  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  /* On load: a shared rubric link, or saved progress. */
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect -- reading browser-only state once, after hydration */
    const shared = decodeRubric(window.location.hash);
    if (shared) setSharedRubric(shared);
    else {
      const saved = loadState();
      if (saved) dispatch({ type: "hydrate", state: saved });
    }
    setReady(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  useEffect(() => {
    if (ready && !sharedRubric) saveState(state);
  }, [ready, sharedRubric, state]);

  /* Each new screen starts at the top with focus on its heading. */
  useEffect(() => {
    stepRef.current = step;
    if (!ready) return;
    if (firstStep.current) {
      firstStep.current = false;
      return;
    }
    window.scrollTo({ top: 0 });
    document.querySelector<HTMLElement>(".lc-screen h1")?.focus({ preventScroll: true });
    // stepKey stands in for step
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepKey, ready]);

  /* Where people leave: the stage they were on when the page went away. */
  useEffect(() => {
    if (sharedRubric) return;
    const onHide = () => {
      const s = stepRef.current;
      if (s.screen === "rubric") return;
      track(events.abandoned, { step: stageOf(s, stateRef.current) });
    };
    window.addEventListener("pagehide", onHide);
    return () => window.removeEventListener("pagehide", onHide);
  }, [sharedRubric]);

  const startOver = () => {
    if (!window.confirm(lineCheck.header.startOverConfirm)) return;
    clearState();
    dispatch({ type: "reset" });
  };

  const leaveShared = () => {
    window.history.replaceState(null, "", window.location.pathname);
    setSharedRubric(null);
    const saved = loadState();
    if (saved) dispatch({ type: "hydrate", state: saved });
  };

  let screen: ReactNode = null;
  let stage = 0;
  let showTopBar = false;
  if (ready && sharedRubric) {
    screen = <SharedRubricScreen rubric={sharedRubric} onMakeOwn={leaveShared} />;
  } else if (ready) {
    stage = stageOf(step, state);
    const drafting =
      step.screen === "draft" && state.synthesisKey !== synthesisKeyFor(finishedCustomers(state));
    showTopBar = stage > 0 && !drafting;
    screen = <Screen state={state} step={step} dispatch={dispatch} onStartOver={startOver} />;
  }

  return (
    <div className="lc-root" data-theme="groovy">
      <div className="lc">
        {showTopBar ? (
          <div className="lc-top lc-noprint">
            <button
              type="button"
              className="lc-iconbtn"
              aria-label={lineCheck.back}
              disabled={state.history.length < 2}
              onClick={() => dispatch({ type: "back" })}
            >
              <span aria-hidden="true">←</span>
            </button>
            <div
              className="lc-segments"
              role="img"
              aria-label={fill(lineCheck.progress.label, {
                current: stage,
                total: TOTAL,
                stage: lineCheck.progress.stages[stage - 1],
              })}
            >
              {lineCheck.progress.stages.map((label, i) => (
                <span key={label} className={i < stage ? "lc-seg lc-seg--on" : "lc-seg"} />
              ))}
            </div>
            <span className="lc-counter" aria-hidden="true">
              {fill(lineCheck.progress.counter, { current: stage, total: TOTAL })}
            </span>
          </div>
        ) : (
          ready &&
          (sharedRubric || step.screen === "intro") && (
            <header className="lc-logo">
              <Link href="/" aria-label={lineCheck.header.homeLabel}>
                <Image src={logo.header.src} width={logo.header.width} height={logo.header.height} alt={logo.alt} priority />
              </Link>
            </header>
          )
        )}

        <main id="main" className="lc-screen" key={sharedRubric ? "shared" : stepKey}>
          {screen}
        </main>
      </div>
    </div>
  );
}

/** Progress stage 1 to 6, or 0 for the intro (no top bar). */
function stageOf(step: Step, state: State): number {
  switch (step.screen) {
    case "intro":
      return 0;
    case "nickname":
    case "tell":
    case "followUp":
    case "review":
      return state.customers.find((c) => c.id === step.id)?.type === "painful" ? 2 : 1;
    case "bestList":
      return 1;
    case "painIntro":
      return 2;
    case "grid":
      return 3;
    case "draft":
      return 4;
    case "gate":
      return 5;
    case "rubric":
      return 6;
  }
}

function Screen({
  state,
  step,
  dispatch,
  onStartOver,
}: {
  state: State;
  step: Step;
  dispatch: Dispatch;
  onStartOver: () => void;
}) {
  const customer = "id" in step ? state.customers.find((c) => c.id === step.id) : undefined;
  const lost = <Lost dispatch={dispatch} />;

  switch (step.screen) {
    case "intro":
      return <IntroScreen dispatch={dispatch} />;
    case "nickname":
      return customer ? <NicknameScreen state={state} customer={customer} dispatch={dispatch} /> : lost;
    case "tell":
      return customer ? <TellScreen state={state} customer={customer} dispatch={dispatch} /> : lost;
    case "followUp":
      return customer ? <FollowUpScreen customer={customer} index={step.index} dispatch={dispatch} /> : lost;
    case "review":
      return customer ? <ReviewScreen state={state} customer={customer} dispatch={dispatch} /> : lost;
    case "bestList":
      return <BestListScreen state={state} dispatch={dispatch} />;
    case "painIntro":
      return <PainIntroScreen state={state} dispatch={dispatch} />;
    case "grid":
      return <GridScreen state={state} dispatch={dispatch} />;
    case "draft":
      return <DraftScreen state={state} dispatch={dispatch} />;
    case "gate":
      return <GateScreen state={state} dispatch={dispatch} />;
    case "rubric":
      return <RubricScreen state={state} onStartOver={onStartOver} />;
  }
}

/** A screen whose customer was removed: send them back to the start. */
function Lost({ dispatch }: { dispatch: Dispatch }) {
  useEffect(() => dispatch({ type: "reset" }), [dispatch]);
  return null;
}

/* Shared pieces ------------------------------------------------------------ */

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = (await res.json().catch(() => null)) as (T & Partial<ApiError>) | null;
  if (!res.ok || !data) throw new Error(data?.error ?? "");
  return data;
}

function goReview(dispatch: Dispatch, id: string) {
  dispatch({ type: "markDone", id });
  dispatch({ type: "go", step: { screen: "review", id } });
}

function countDone(state: State, type: CustomerType, except?: string) {
  return state.customers.filter((c) => c.done && c.type === type && c.id !== except).length;
}

/** Screen headline in Alfa Slab: xl 34px (intro), lg 30px, md 28px, sm 26px. */
function Heading({ children, size = "lg" }: { children: ReactNode; size?: "xl" | "lg" | "md" | "sm" }) {
  return (
    <h1 className={`lc-display lc-display--${size}`} tabIndex={-1}>
      {children}
    </h1>
  );
}

function Kicker({ children, tone }: { children: ReactNode; tone?: "rust" }) {
  return <p className={tone ? `lc-kicker lc-kicker--${tone}` : "lc-kicker"}>{children}</p>;
}

/** The main button: full width, label left, arrow right. */
function Primary({
  children,
  onClick,
  type = "button",
  disabled,
  busy,
  tone,
}: {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
  busy?: boolean;
  tone?: "rust";
}) {
  return (
    <button
      type={type}
      className={tone ? `lc-btn lc-btn--block lc-btn--${tone}` : "lc-btn lc-btn--block"}
      onClick={onClick}
      disabled={disabled || busy}
    >
      <span className="lc-btn__label">
        {busy && <SpinnerIcon />}
        {children}
      </span>
      {!busy && <span aria-hidden="true">→</span>}
    </button>
  );
}

function Ghost({ children, onClick, disabled }: { children: ReactNode; onClick: () => void; disabled?: boolean }) {
  return (
    <button type="button" className="lc-btn lc-btn--ghost" onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}

/* 0a · Intro ---------------------------------------------------------------- */

function IntroScreen({ dispatch }: { dispatch: Dispatch }) {
  const { intro } = lineCheck;
  return (
    <>
      <div className="lc-content lc-content--intro">
        <Kicker>{intro.kicker}</Kicker>
        <Heading size="xl">{intro.headline}</Heading>
        <p className="lc-body">{intro.body}</p>
        <p className="lc-body">{intro.note}</p>
      </div>
      <div className="lc-foot">
        <Primary
          onClick={() => {
            track(events.start);
            dispatch({ type: "newCustomer", customerType: "best", id: newId() });
          }}
        >
          {intro.button}
        </Primary>
        <p className="lc-fine">{lineCheck.privacy}</p>
      </div>
    </>
  );
}

/* 1a · Nickname -------------------------------------------------------------- */

function NicknameScreen({ state, customer, dispatch }: { state: State; customer: DraftCustomer; dispatch: Dispatch }) {
  const { nickname: copy } = lineCheck;
  const uid = useId();
  const [value, setValue] = useState(customer.nickname);
  const [error, setError] = useState(false);
  const position = state.customers.filter((c) => c.type === customer.type).findIndex((c) => c.id === customer.id) + 1;

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const nickname = value.trim();
    if (!nickname) {
      setError(true);
      return;
    }
    dispatch({ type: "setNickname", id: customer.id, nickname });
    dispatch({ type: "go", step: { screen: "tell", id: customer.id } });
  };

  return (
    <form onSubmit={submit} noValidate className="lc-form">
      <div className="lc-content lc-content--roomy">
        <Kicker tone={customer.type === "painful" ? "rust" : undefined}>
          {fill(customer.type === "best" ? copy.bestKicker : copy.painfulKicker, { n: position })}
        </Kicker>
        <Heading>
          <label htmlFor={`${uid}-nick`}>{copy.label}</label>
        </Heading>
        <p className="lc-body">{copy.body}</p>
        <input
          id={`${uid}-nick`}
          className="lc-input"
          autoComplete="off"
          maxLength={120}
          placeholder={copy.placeholder}
          value={value}
          aria-invalid={error}
          aria-describedby={error ? `${uid}-err` : undefined}
          onChange={(e) => {
            setValue(e.target.value);
            setError(false);
          }}
        />
        {error && (
          <p id={`${uid}-err`} className="lc-error" role="alert">
            {copy.required}
          </p>
        )}
      </div>
      <div className="lc-foot">
        <Primary type="submit">{lineCheck.next}</Primary>
      </div>
    </form>
  );
}

/* 1b, 1c · Tell me about them (idle, listening) --------------------------------- */

function TellScreen({ state, customer, dispatch }: { state: State; customer: DraftCustomer; dispatch: Dispatch }) {
  const { tell } = lineCheck;
  const uid = useId();
  const [status, setStatus] = useState<"idle" | "reading" | "error">("idle");
  const [usedMic, setUsedMic] = useState(false);
  const textRef = useRef<HTMLTextAreaElement>(null);
  const isBest = customer.type === "best";
  const isFirst = state.customers[0]?.id === customer.id;

  const setTranscript = useCallback(
    (transcript: string) => dispatch({ type: "setTranscript", id: customer.id, transcript }),
    [dispatch, customer.id],
  );
  const into = useDictationInto(customer.transcript, setTranscript, () => setUsedMic(true));
  const listening = into.d.isListening;

  useEffect(() => {
    if (into.d.stopReason === "denied") textRef.current?.focus();
  }, [into.d.stopReason]);

  const hasText = customer.transcript.trim().length > 0;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!hasText || listening) return;
    track(usedMic ? events.dictationUsed : events.typed, { where: "customer" });
    setStatus("reading");
    try {
      const out = await post<ExtractResponse>("/api/line-check/extract", {
        nickname: customer.nickname,
        type: customer.type,
        transcript: customer.transcript.trim(),
      });
      dispatch({ type: "extracted", id: customer.id, profile: out.profile, followUps: out.followUps });
      if (!customer.done) track(events.customerAdded, { type: customer.type });
      if (out.followUps.length > 0) dispatch({ type: "go", step: { screen: "followUp", id: customer.id, index: 0 } });
      else goReview(dispatch, customer.id);
    } catch {
      setStatus("error");
    }
  };

  return (
    <form onSubmit={submit} noValidate className="lc-form">
      <div className="lc-content">
        <Heading size="md">{fill(isBest ? tell.bestPrompt : tell.painfulPrompt, { nickname: customer.nickname })}</Heading>
        {!listening && <p className="lc-helper">{isBest ? tell.bestHelper : tell.painfulHelper}</p>}
      </div>

      <MicHero into={into} showPrivacy={isFirst} />

      {listening ? (
        <LiveTranscript into={into} />
      ) : (
        <>
          {into.d.isSupported && (
            <div className="lc-divider" aria-hidden="true">
              <span>{tell.divider}</span>
            </div>
          )}
          <div className="lc-content lc-content--tight">
            <label htmlFor={`${uid}-tell`} className="lc-visually-hidden">
              {tell.textareaLabel}
            </label>
            <textarea
              id={`${uid}-tell`}
              ref={textRef}
              className="lc-input lc-textarea"
              rows={into.d.isSupported ? 4 : 10}
              placeholder={tell.textareaPlaceholder}
              value={customer.transcript}
              onChange={(e) => {
                setTranscript(e.target.value);
                if (status === "error") setStatus("idle");
              }}
            />
            {status === "error" && (
              <div className="lc-error-box" role="alert">
                <p>{tell.extractFailed}</p>
                <button type="button" className="lc-link" onClick={() => goReview(dispatch, customer.id)}>
                  {tell.fillByHand}
                </button>
              </div>
            )}
          </div>
        </>
      )}

      <div className={listening ? "lc-foot lc-foot--center" : "lc-foot"}>
        {listening ? (
          <button type="button" className="lc-btn lc-btn--dark" onClick={into.toggle}>
            {lineCheck.mic.stop}
          </button>
        ) : (
          <Primary type="submit" disabled={!hasText} busy={status === "reading"}>
            {status === "reading" ? tell.reading : status === "error" ? tell.retry : tell.submit}
          </Primary>
        )}
      </div>
    </form>
  );
}

/* 1e · Follow-up -------------------------------------------------------------- */

function FollowUpScreen({ customer, index, dispatch }: { customer: DraftCustomer; index: number; dispatch: Dispatch }) {
  const { followUp: copy } = lineCheck;
  const uid = useId();
  const [answer, setAnswer] = useState("");
  const [usedMic, setUsedMic] = useState(false);
  const [status, setStatus] = useState<"idle" | "merging" | "error">("idle");
  const textRef = useRef<HTMLTextAreaElement>(null);
  const followUp = customer.followUps[index];
  const total = customer.followUps.length;
  const into = useDictationInto(answer, setAnswer, () => setUsedMic(true));

  useEffect(() => {
    if (into.d.stopReason === "denied") textRef.current?.focus();
  }, [into.d.stopReason]);

  const advance = () => {
    if (index + 1 < total) dispatch({ type: "go", step: { screen: "followUp", id: customer.id, index: index + 1 } });
    else goReview(dispatch, customer.id);
  };

  useEffect(() => {
    if (!followUp) goReview(dispatch, customer.id);
  }, [followUp, dispatch, customer.id]);
  if (!followUp) return null;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const text = answer.trim();
    if (!text) return;
    if (into.d.isListening) into.d.stop();
    track(usedMic ? events.dictationUsed : events.typed, { where: "followup" });
    setStatus("merging");
    try {
      const out = await post<ExtractResponse>("/api/line-check/extract", {
        nickname: customer.nickname,
        type: customer.type,
        transcript: text,
        existing: profileOf(customer),
        question: followUp.question,
      });
      dispatch({ type: "merged", id: customer.id, profile: out.profile, answer: text });
      track(events.followUpAnswered);
      advance();
    } catch {
      setStatus("error");
    }
  };

  const skip = () => {
    if (into.d.isListening) into.d.stop();
    dispatch({
      type: "setProfile",
      id: customer.id,
      profile: withField(profileOf(customer), followUp.field, { value: null, unknown: true }),
    });
    track(events.followUpSkipped);
    advance();
  };

  return (
    <form onSubmit={submit} noValidate className="lc-form">
      <div className="lc-content lc-content--roomy">
        <Kicker tone={customer.type === "painful" ? "rust" : undefined}>
          {fill(copy.kicker, { current: index + 1, total })}
        </Kicker>
        <Heading size="md">{followUp.question}</Heading>
        <MicInline into={into} />
        <label htmlFor={`${uid}-fu`} className="lc-visually-hidden">
          {copy.answerLabel}
        </label>
        <textarea
          id={`${uid}-fu`}
          ref={textRef}
          className="lc-input lc-textarea"
          rows={4}
          value={answer}
          readOnly={into.d.isListening}
          onChange={(e) => {
            setAnswer(e.target.value);
            if (status === "error") setStatus("idle");
          }}
        />
        {status === "error" && (
          <p className="lc-error" role="alert">
            {copy.failed}
          </p>
        )}
      </div>
      <div className="lc-foot">
        <Primary type="submit" disabled={!answer.trim()} busy={status === "merging"}>
          {status === "merging" ? copy.merging : copy.answer}
        </Primary>
        <Ghost onClick={skip} disabled={status === "merging"}>
          {copy.skip}
        </Ghost>
      </div>
    </form>
  );
}

/* 1d, 2b · Here's what I heard -------------------------------------------------- */

function ReviewScreen({ state, customer, dispatch }: { state: State; customer: DraftCustomer; dispatch: Dispatch }) {
  const { review } = lineCheck;
  const isBest = customer.type === "best";
  const painfulCount = countDone(state, "painful", customer.id) + 1;

  const remove = () => {
    if (!window.confirm(fill(review.removeConfirm, { nickname: customer.nickname }))) return;
    dispatch({ type: "removeCustomer", id: customer.id });
  };

  return (
    <>
      <div className="lc-content">
        <Heading size="sm">{fill(review.headline, { nickname: customer.nickname })}</Heading>
        <p className="lc-body">{review.body}</p>
      </div>
      <ProfileCards
        profile={customer}
        tone={customer.type}
        onChange={(profile) => dispatch({ type: "setProfile", id: customer.id, profile: profileOf(profile) })}
      />
      <div className="lc-content lc-content--tight">
        <button type="button" className="lc-link lc-link--muted" onClick={remove}>
          {review.remove}
        </button>
      </div>
      <div className="lc-foot">
        <Primary onClick={() => dispatch({ type: "go", step: { screen: isBest ? "bestList" : "grid" } })}>
          {review.looksRight}
        </Primary>
        {!isBest && painfulCount < MAX_PAINFUL && (
          <Ghost onClick={() => dispatch({ type: "go", step: { screen: "painIntro" } })}>
            {review.addAnotherPainfulGhost}
          </Ghost>
        )}
      </div>
    </>
  );
}

/* 1f · Customers so far ------------------------------------------------------------ */

function BestListScreen({ state, dispatch }: { state: State; dispatch: Dispatch }) {
  const { bestList: copy } = lineCheck;
  const best = state.customers.filter((c) => c.done && c.type === "best");
  const n = Math.min(Math.max(best.length, 1), MAX_BEST);
  const addBest = () => dispatch({ type: "newCustomer", customerType: "best", id: newId() });

  return (
    <>
      <div className="lc-content lc-content--roomy">
        <Heading>{copy.headlines[n - 1]}</Heading>
        <p className="lc-body">{copy.bodies[n - 1]}</p>
      </div>
      <ul className="lc-rows">
        {best.map((c) => (
          <li key={c.id} className="lc-row">
            <span className="lc-checkdot">
              <CheckIcon />
            </span>
            <span className="lc-row__name">{c.nickname}</span>
            <button
              type="button"
              className="lc-row__edit"
              aria-label={fill(copy.editLabel, { nickname: c.nickname })}
              onClick={() => dispatch({ type: "go", step: { screen: "review", id: c.id } })}
            >
              {copy.edit}
            </button>
          </li>
        ))}
      </ul>
      <div className="lc-foot">
        {best.length < MIN_BEST ? (
          <Primary onClick={addBest}>{copy.addSecond}</Primary>
        ) : (
          <>
            {best.length < MAX_BEST && (
              <button type="button" className="lc-btn lc-btn--outline lc-btn--full" onClick={addBest}>
                {copy.addAnother}
              </button>
            )}
            <Primary onClick={() => dispatch({ type: "go", step: { screen: "painIntro" } })}>{copy.next}</Primary>
          </>
        )}
      </div>
    </>
  );
}

/* 2a · The one you wish you'd never signed ----------------------------------------- */

function PainIntroScreen({ state, dispatch }: { state: State; dispatch: Dispatch }) {
  const { painIntro: copy, nickname } = lineCheck;
  const uid = useId();
  const [value, setValue] = useState("");
  const [error, setError] = useState(false);
  const already = countDone(state, "painful");

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const name = value.trim();
    if (!name) {
      setError(true);
      return;
    }
    dispatch({ type: "newCustomer", customerType: "painful", id: newId(), nickname: name });
  };

  return (
    <form onSubmit={submit} noValidate className="lc-form">
      <div className="lc-content lc-content--roomy">
        <Kicker tone="rust">{already > 0 ? fill(nickname.painfulKicker, { n: already + 1 }) : copy.kicker}</Kicker>
        <Heading>{copy.headline}</Heading>
        <p className="lc-body">{copy.body}</p>
        <label htmlFor={`${uid}-nick`} className="lc-visually-hidden">
          {copy.nicknameLabel}
        </label>
        <input
          id={`${uid}-nick`}
          className="lc-input"
          autoComplete="off"
          maxLength={120}
          placeholder={copy.placeholder}
          value={value}
          aria-invalid={error}
          onChange={(e) => {
            setValue(e.target.value);
            setError(false);
          }}
        />
        {error && (
          <p className="lc-error" role="alert">
            {copy.needNickname}
          </p>
        )}
        <p className="lc-helper">{copy.helper}</p>
      </div>
      <div className="lc-foot">
        <Primary type="submit" tone="rust">
          {copy.add}
        </Primary>
        <Ghost onClick={() => dispatch({ type: "go", step: { screen: "grid" } })}>{copy.skip}</Ghost>
      </div>
    </form>
  );
}

/* 3a · Side by side ------------------------------------------------------------- */

function GridScreen({ state, dispatch }: { state: State; dispatch: Dispatch }) {
  const { grid } = lineCheck;
  const customers = finishedCustomers(state);
  return (
    <>
      <div className="lc-content">
        <Heading>{grid.headline}</Heading>
      </div>
      <Grid customers={customers} onChange={(id, profile) => dispatch({ type: "setProfile", id, profile: profileOf(profile) })} />
      <div className="lc-content lc-content--tight">
        <p className="lc-fine">{grid.hint}</p>
      </div>
      <div className="lc-foot">
        <Primary onClick={() => dispatch({ type: "go", step: { screen: "draft" } })}>{grid.button}</Primary>
      </div>
    </>
  );
}

/* 4a, 4b · Finding the pattern, then the draft ICP (ungated) --------------------------- */

function DraftScreen({ state, dispatch }: { state: State; dispatch: Dispatch }) {
  const { draft } = lineCheck;
  const customers = finishedCustomers(state);
  const key = synthesisKeyFor(customers);
  const current = state.synthesisKey === key ? state.synthesis : null;
  const [failed, setFailed] = useState(false);
  const shownFor = useRef<string | null>(null);
  const painful = customers.filter((c) => c.type === "painful");

  const load = useCallback(async () => {
    setFailed(false);
    try {
      const out = await post<SynthesizeResponse>("/api/line-check/synthesize", { customers: forApi(customers) });
      dispatch({ type: "synthesized", synthesis: out.synthesis, key });
    } catch {
      setFailed(true);
    }
    // customers is derived from state each render; key captures its content
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, dispatch]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch on arrival when the data changed
    if (!current) void load();
  }, [current, load]);

  useEffect(() => {
    if (current && shownFor.current !== key) {
      shownFor.current = key;
      track(events.synthesisShown, { customers: customers.length });
    }
  }, [current, key, customers.length]);

  if (!current) {
    return (
      <Finding
        count={customers.length}
        painfulName={painful[0]?.nickname}
        failed={failed}
        onRetry={() => void load()}
        onBack={() => dispatch({ type: "back" })}
      />
    );
  }

  return (
    <>
      <div className="lc-content">
        <Kicker>{draft.kicker}</Kicker>
        <SynthesisBody synthesis={current} customerCount={customers.length} hasPainful={painful.length > 0} dispatch={dispatch} />
      </div>
      <div className="lc-foot lc-noprint">
        <section className="lc-teaser">
          <h2 className="lc-display lc-display--card">{draft.teaserHeadline}</h2>
          <p className="lc-body">{draft.teaserBody}</p>
          <Primary onClick={() => dispatch({ type: "go", step: { screen: state.submitted ? "rubric" : "gate" } })}>
            {draft.teaserButton}
          </Primary>
        </section>
      </div>
    </>
  );
}

/**
 * Finding the pattern (handoff 4a). The synthesis is one call, so the stages
 * tick over on a timer while it runs; the last one only completes when the
 * answer arrives (and this screen gives way to the profile).
 */
function Finding({
  count,
  painfulName,
  failed,
  onRetry,
  onBack,
}: {
  count: number;
  painfulName?: string;
  failed: boolean;
  onRetry: () => void;
  onBack: () => void;
}) {
  const { draft } = lineCheck;
  const [done, setDone] = useState(0);
  const stages = painfulName ? draft.stages : draft.stagesNoPainful;

  useEffect(() => {
    if (failed) return;
    const a = window.setTimeout(() => setDone(1), 2200);
    const b = window.setTimeout(() => setDone(2), 5200);
    return () => {
      window.clearTimeout(a);
      window.clearTimeout(b);
    };
  }, [failed]);

  return (
    <div className="lc-finding" role="status">
      <Kicker>{fill(draft.loadingKicker, { n: count })}</Kicker>
      {failed ? (
        <>
          <Heading size="md">{draft.failed}</Heading>
          <Primary onClick={onRetry}>{draft.retry}</Primary>
          <Ghost onClick={onBack}>{lineCheck.back}</Ghost>
        </>
      ) : (
        <>
          <Heading size="md">
            {painfulName ? fill(draft.loadingAgainst, { nickname: painfulName }) : draft.loadingBest}
          </Heading>
          <div className="lc-progressbar" aria-hidden="true">
            <span style={{ width: `${[24, 48, 72][done]}%` }} />
          </div>
          <ul className="lc-stages">
            {stages.map((label, i) => (
              <li key={label} className={i < done ? "lc-stage lc-stage--done" : "lc-stage"}>
                <span className="lc-stage__dot">{i < done && <CheckIcon size={12} />}</span>
                {label}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

/** The profile paragraph with its key phrases on the highlighter. */
function Highlighted({ text, phrases = [] }: { text: string; phrases?: string[] }) {
  const usable = phrases.filter((p) => p && text.includes(p));
  if (usable.length === 0) return <>{text}</>;
  const pattern = new RegExp(`(${usable.map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`);
  return (
    <>
      {text.split(pattern).map((part, i) =>
        usable.includes(part) ? (
          <mark key={i} className="lc-mark">
            {part}
          </mark>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  );
}

function SynthesisBody({
  synthesis,
  customerCount,
  hasPainful,
  dispatch,
  asHeading = true,
}: {
  synthesis: Synthesis;
  customerCount: number;
  hasPainful: boolean;
  dispatch?: Dispatch;
  asHeading?: boolean;
}) {
  const { draft } = lineCheck;
  const profile = <Highlighted text={synthesis.profile} phrases={synthesis.highlights} />;
  return (
    <div className="lc-synthesis">
      {asHeading ? (
        <h1 className="lc-profile" tabIndex={-1}>
          {profile}
        </h1>
      ) : (
        <p className="lc-profile">{profile}</p>
      )}

      <section className="lc-panel lc-panel--best">
        <h2 className="lc-panel__label">{draft.sharedHeading}</h2>
        <ul className="lc-bullets lc-bullets--pine">
          {synthesis.shared.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      </section>
      <section className="lc-panel lc-panel--painful">
        <h2 className="lc-panel__label">{draft.avoidHeading}</h2>
        {hasPainful && synthesis.avoid.length > 0 ? (
          <ul className="lc-bullets">
            {synthesis.avoid.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        ) : dispatch ? (
          <button type="button" className="lc-link" onClick={() => dispatch({ type: "go", step: { screen: "painIntro" } })}>
            {draft.avoidEmpty}
          </button>
        ) : null}
      </section>

      <p className="lc-confidence">{fill(draft.confidence, { n: customerCount })}</p>
      <p className="lc-explainer">
        <strong>{draft.explainerHeading}</strong> {draft.explainer}
      </p>
    </div>
  );
}

/* 5a · Email gate ------------------------------------------------------------------ */

function GateScreen({ state, dispatch }: { state: State; dispatch: Dispatch }) {
  const { gate } = lineCheck;
  const uid = useId();
  const [contact, setContact] = useState(state.contact);
  const [error, setError] = useState<"required" | "email" | "failed" | null>(null);
  const [sending, setSending] = useState(false);
  const synthesis = state.synthesis;

  const set = (patch: Partial<typeof contact>) => {
    const next = { ...contact, ...patch };
    setContact(next);
    dispatch({ type: "setContact", contact: next });
    setError(null);
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (state.submitted) {
      dispatch({ type: "go", step: { screen: "rubric" } });
      return;
    }
    if (!contact.firstName.trim() || !contact.company.trim() || !contact.email.trim()) {
      setError("required");
      return;
    }
    if (!EMAIL_PATTERN.test(contact.email.trim())) {
      setError("email");
      return;
    }
    if (!synthesis) return;
    setSending(true);
    try {
      await sendToSophie(state, contact, synthesis);
      track(events.gateSubmitted, { optIn: contact.optIn ? "yes" : "no" });
      dispatch({ type: "submitted" });
      dispatch({ type: "go", step: { screen: "rubric" } });
    } catch {
      setError("failed");
      setSending(false);
    }
  };

  const [failedBefore, failedAfter] = gate.failed.split("{email}");
  const field = (name: "firstName" | "company" | "email", label: string, type: string, autoComplete: string) => (
    <label htmlFor={`${uid}-${name}`} className="lc-field">
      <span className="lc-field__label">{label}</span>
      <input
        id={`${uid}-${name}`}
        className="lc-input"
        type={type}
        autoComplete={autoComplete}
        value={contact[name]}
        aria-invalid={(error === "required" && !contact[name].trim()) || (error === "email" && name === "email")}
        onChange={(e) => set({ [name]: e.target.value })}
      />
    </label>
  );

  return (
    <form onSubmit={submit} noValidate className="lc-form">
      <div className="lc-content lc-content--roomy">
        <Heading>{gate.headline}</Heading>
        {field("firstName", gate.firstName, "text", "given-name")}
        {field("company", gate.company, "text", "organization")}
        {field("email", gate.email, "email", "email")}
        <label className="lc-check">
          <input type="checkbox" checked={contact.optIn} onChange={(e) => set({ optIn: e.target.checked })} />
          <span className="lc-check__box" aria-hidden="true">
            <CheckIcon size={14} />
          </span>
          <span>{gate.optIn}</span>
        </label>
        {error && (
          <p className="lc-error" role="alert">
            {error === "required" && gate.required}
            {error === "email" && gate.invalidEmail}
            {error === "failed" && (
              <>
                {failedBefore}
                {site.email !== null && <a href={`mailto:${site.email}`}>{site.email}</a>}
                {failedAfter}
              </>
            )}
          </p>
        )}
      </div>
      <div className="lc-foot">
        <p className="lc-fine">{gate.small}</p>
        <Primary type="submit" busy={sending}>
          {sending ? gate.sending : gate.button}
        </Primary>
      </div>
    </form>
  );
}

/**
 * The gated submission: contact details, every customer and the synthesis,
 * as readable text (for the notification email) plus the raw JSON.
 * Field names must match the "line-check" form in public/__forms.html.
 */
async function sendToSophie(state: State, contact: State["contact"], synthesis: Synthesis): Promise<void> {
  const customers = forApi(finishedCustomers(state));
  const describe = customers
    .map((c) => {
      const lines = Object.entries(profileOf(c)).flatMap(([, fields]) =>
        Object.entries(fields as Record<string, Field>).map(
          ([k, f]) =>
            `  ${lineCheck.fields[k as keyof typeof lineCheck.fields]}: ${f.value ?? (f.unknown ? "unknown" : "-")}`,
        ),
      );
      return [`${c.type.toUpperCase()}: ${c.nickname}`, ...lines, `  Transcript: ${c.transcript}`].join("\n");
    })
    .join("\n\n");
  const rubric = synthesis.rubric.criteria
    .map((c) => `${c.name} (${c.weight}): ${c.levels.map((l) => `${l.label} = ${l.points}`).join("; ")}`)
    .join("\n");
  const fields = {
    "form-name": lineCheck.netlifyFormName,
    firstName: contact.firstName.trim(),
    company: contact.company.trim(),
    email: contact.email.trim(),
    optIn: contact.optIn ? "yes" : "no",
    profile: [
      synthesis.profile,
      "",
      "Shared:",
      ...synthesis.shared.map((s) => `- ${s}`),
      "",
      "Avoid:",
      ...synthesis.avoid.map((s) => `- ${s}`),
      "",
      `Confidence: ${synthesis.confidence}`,
    ].join("\n"),
    rubric,
    customers: describe,
    data: JSON.stringify({ customers, synthesis }),
  };

  // Netlify Forms only exists on a Netlify deploy; locally, log instead.
  if (process.env.NODE_ENV !== "production") {
    console.log("[line-check] gate submission (not sent in development)", fields);
    return;
  }
  await postForm(fields);
}

/* 6a, 6b · Rubric, live scorer and close -------------------------------------------- */

function RubricScreen({ state, onStartOver }: { state: State; onStartOver: () => void }) {
  const { rubric: copy, closing } = lineCheck;
  const synthesis = state.synthesis;
  const customers = finishedCustomers(state);
  if (!synthesis) return null;
  const name = state.contact.firstName.trim();
  return (
    <div className="lc-content lc-content--stack">
      <Kicker>{copy.kicker}</Kicker>
      <Heading size="md">{name ? fill(copy.headline, { name }) : copy.headlineNoName}</Heading>
      <RubricCards rubric={synthesis.rubric} />

      <section className="lc-printonly">
        <h2 className="lc-display lc-display--card">{copy.profileHeading}</h2>
        <SynthesisBody
          synthesis={synthesis}
          customerCount={customers.length}
          hasPainful={customers.some((c) => c.type === "painful")}
          asHeading={false}
        />
      </section>

      <Scorer rubric={synthesis.rubric} />
      <Closing />
      <button type="button" className="lc-link lc-link--muted lc-center lc-noprint" onClick={onStartOver}>
        {closing.startOver}
      </button>
    </div>
  );
}

function SharedRubricScreen({ rubric, onMakeOwn }: { rubric: Rubric; onMakeOwn: () => void }) {
  const { rubric: copy } = lineCheck;
  return (
    <div className="lc-content lc-content--stack">
      <Kicker>{copy.kicker}</Kicker>
      <Heading size="md">{copy.headlineNoName}</Heading>
      <p className="lc-body">{copy.sharedBody}</p>
      <RubricCards rubric={rubric} actions={false} />
      <Scorer rubric={rubric} />
      <button type="button" className="lc-btn lc-btn--outline lc-btn--full lc-noprint" onClick={onMakeOwn}>
        {copy.makeYourOwn}
      </button>
      <Closing />
    </div>
  );
}

function Closing() {
  const { closing } = lineCheck;
  return (
    <section className="lc-closing lc-noprint">
      <h2 className="lc-display lc-display--card">{closing.headline}</h2>
      <p>{closing.body}</p>
      {lineCheck.bookingUrl !== null && (
        <a
          href={lineCheck.bookingUrl}
          className="lc-btn lc-btn--block"
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => track(events.bookingClicked)}
        >
          <span>{closing.button}</span>
          <span aria-hidden="true">→</span>
        </a>
      )}
      <p className="lc-signoff">{closing.signOff}</p>
    </section>
  );
}
