"use client";

import { useCallback, useEffect, useId, useReducer, useRef, useState, type FormEvent, type ReactNode } from "react";
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
import { DictationField } from "@/components/line-check/DictationField";
import { ProfileCards } from "@/components/line-check/ProfileCards";
import { Grid } from "@/components/line-check/Grid";
import { RubricView } from "@/components/line-check/RubricView";
import { ArrowLeftIcon, ArrowRightIcon, PlusIcon, RotateIcon, SpinnerIcon } from "@/components/line-check/icons";

/**
 * Line Check (build brief: "Line Check: prototype build brief", v1).
 *
 *   0 Intro
 *   1 Best customers (2 to 3, each: nickname, tell, follow-ups, review)
 *   2 Painful customers (optional, 0 to 2, same pattern)
 *   3 Side-by-side check
 *   4 Draft ICP (ungated)
 *   5 Email gate
 *   6 Rubric and live scorer (gated)
 *
 * One question per screen, Back on every screen after the intro. State is
 * held client-side (src/lib/line-check/state.ts) until the email gate, which
 * posts everything to Sophie through Netlify Forms. A URL with a rubric in
 * its hash (#r=...) opens straight to that rubric's scorer.
 */

const { events } = lineCheck;
const EMAIL_PATTERN = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

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

  let screen: ReactNode;
  if (!ready) screen = null;
  else if (sharedRubric) screen = <SharedRubricScreen rubric={sharedRubric} onMakeOwn={leaveShared} />;
  else screen = <Screen state={state} step={step} dispatch={dispatch} />;

  const stage = ready && !sharedRubric ? stageOf(step, state) : 0;
  const total = lineCheck.progress.stages.length;

  return (
    <div className="lc">
      <header className="lc-header">
        <Link href="/" className="lc-header__logo" aria-label={lineCheck.header.homeLabel}>
          <Image src={logo.header.src} width={logo.header.width} height={logo.header.height} alt={logo.alt} priority />
        </Link>
        {ready && !sharedRubric && step.screen !== "intro" && (
          <button type="button" className="lc-link lc-noprint" onClick={startOver}>
            <RotateIcon />
            {lineCheck.header.startOver}
          </button>
        )}
      </header>

      {stage > 0 && (
        <div className="lc-progress lc-noprint">
          <p className="lc-progress__label">
            {fill(lineCheck.progress.label, { current: stage, total })}
            <span aria-hidden="true"> · </span>
            {lineCheck.progress.stages[stage - 1]}
          </p>
          <div className="lc-progress__bar" aria-hidden="true">
            {lineCheck.progress.stages.map((label, i) => (
              <span key={label} className={i < stage ? "lc-progress__seg lc-progress__seg--on" : "lc-progress__seg"} />
            ))}
          </div>
          {state.history.length > 1 && (
            <button type="button" className="lc-back" onClick={() => dispatch({ type: "back" })}>
              <ArrowLeftIcon />
              {lineCheck.back}
            </button>
          )}
        </div>
      )}

      <main id="main" className="lc-main">
        <div className="lc-screen" key={sharedRubric ? "shared" : stepKey}>
          {screen}
        </div>
      </main>
    </div>
  );
}

/** Progress stage 1 to 6, or 0 for the intro (no progress bar). */
function stageOf(step: Step, state: State): number {
  switch (step.screen) {
    case "intro":
      return 0;
    case "nickname":
    case "tell":
    case "followUp":
    case "review":
      return state.customers.find((c) => c.id === step.id)?.type === "painful" ? 2 : 1;
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

function Screen({ state, step, dispatch }: { state: State; step: Step; dispatch: Dispatch }) {
  const customer = "id" in step ? state.customers.find((c) => c.id === step.id) : undefined;

  switch (step.screen) {
    case "intro":
      return <IntroScreen dispatch={dispatch} />;
    case "nickname":
      return customer ? <NicknameScreen state={state} customer={customer} dispatch={dispatch} /> : <Lost dispatch={dispatch} />;
    case "tell":
      return customer ? <TellScreen state={state} customer={customer} dispatch={dispatch} /> : <Lost dispatch={dispatch} />;
    case "followUp":
      return customer ? (
        <FollowUpScreen customer={customer} index={step.index} dispatch={dispatch} />
      ) : (
        <Lost dispatch={dispatch} />
      );
    case "review":
      return customer ? <ReviewScreen state={state} customer={customer} dispatch={dispatch} /> : <Lost dispatch={dispatch} />;
    case "painIntro":
      return <PainIntroScreen dispatch={dispatch} />;
    case "grid":
      return <GridScreen state={state} dispatch={dispatch} />;
    case "draft":
      return <DraftScreen state={state} dispatch={dispatch} />;
    case "gate":
      return <GateScreen state={state} dispatch={dispatch} />;
    case "rubric":
      return <RubricScreen state={state} />;
  }
}

/** A screen whose customer was removed: send them back to the start. */
function Lost({ dispatch }: { dispatch: Dispatch }) {
  useEffect(() => dispatch({ type: "reset" }), [dispatch]);
  return null;
}

/* Helpers ------------------------------------------------------------------ */

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

function startCustomer(dispatch: Dispatch, customerType: CustomerType) {
  dispatch({ type: "newCustomer", customerType, id: newId() });
}

function goReview(dispatch: Dispatch, id: string) {
  dispatch({ type: "markDone", id });
  dispatch({ type: "go", step: { screen: "review", id } });
}

function countDone(state: State, type: CustomerType, except?: string) {
  return state.customers.filter((c) => c.done && c.type === type && c.id !== except).length;
}

function Heading({ children }: { children: ReactNode }) {
  return (
    <h1 className="lc-h1" tabIndex={-1}>
      {children}
    </h1>
  );
}

/* 0 · Intro ---------------------------------------------------------------- */

function IntroScreen({ dispatch }: { dispatch: Dispatch }) {
  const { intro } = lineCheck;
  return (
    <div className="lc-intro">
      <p className="kicker">{intro.kicker}</p>
      <Heading>{intro.headline}</Heading>
      <p className="lc-lead">{intro.body}</p>
      <p className="lc-body">{intro.note}</p>
      <div className="lc-actions">
        <button
          type="button"
          className="button button--yellow lc-icon-button"
          onClick={() => {
            track(events.start);
            startCustomer(dispatch, "best");
          }}
        >
          {intro.button}
          <ArrowRightIcon />
        </button>
      </div>
      <p className="lc-fine lc-intro__privacy">{lineCheck.privacy}</p>
    </div>
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
    <form onSubmit={submit} noValidate>
      <p className="kicker">
        {fill(customer.type === "best" ? copy.bestKicker : copy.painfulKicker, { n: position })}
      </p>
      <Heading>
        <label htmlFor={`${uid}-nick`}>{copy.label}</label>
      </Heading>
      <input
        id={`${uid}-nick`}
        className="input lc-input-lg"
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
      <div className="lc-actions">
        <button type="submit" className="button button--yellow lc-icon-button">
          {lineCheck.next}
          <ArrowRightIcon />
        </button>
      </div>
    </form>
  );
}

/* 1b · Tell me about them ------------------------------------------------------ */

function TellScreen({ state, customer, dispatch }: { state: State; customer: DraftCustomer; dispatch: Dispatch }) {
  const { tell } = lineCheck;
  const uid = useId();
  const [status, setStatus] = useState<"idle" | "reading" | "error" | "short">("idle");
  const [usedMic, setUsedMic] = useState(false);
  const isBest = customer.type === "best";
  const isFirst = state.customers[0]?.id === customer.id;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const transcript = customer.transcript.trim();
    if (transcript.length < 15) {
      setStatus("short");
      return;
    }
    track(usedMic ? events.dictationUsed : events.typed, { where: "customer" });
    setStatus("reading");
    try {
      const out = await post<ExtractResponse>("/api/line-check/extract", {
        nickname: customer.nickname,
        type: customer.type,
        transcript,
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
    <form onSubmit={submit} noValidate>
      <Heading>{fill(isBest ? tell.bestPrompt : tell.painfulPrompt, { nickname: customer.nickname })}</Heading>
      <p className="lc-helper">{isBest ? tell.bestHelper : tell.painfulHelper}</p>

      <DictationField
        id={`${uid}-tell`}
        value={customer.transcript}
        onChange={(transcript) => {
          dispatch({ type: "setTranscript", id: customer.id, transcript });
          if (status === "short" || status === "error") setStatus("idle");
        }}
        onMicStart={() => setUsedMic(true)}
        showPrivacy={isFirst}
      />

      {status === "short" && (
        <p className="lc-error" role="alert">
          {tell.tooShort}
        </p>
      )}
      {status === "error" && (
        <div className="lc-error-box" role="alert">
          <p>{tell.extractFailed}</p>
          <button type="button" className="lc-link" onClick={() => goReview(dispatch, customer.id)}>
            {tell.fillByHand}
          </button>
        </div>
      )}

      <div className="lc-actions">
        <button type="submit" className="button button--yellow lc-icon-button" disabled={status === "reading"}>
          {status === "reading" ? (
            <>
              <SpinnerIcon />
              {tell.reading}
            </>
          ) : (
            <>
              {status === "error" ? tell.retry : tell.submit}
              <ArrowRightIcon />
            </>
          )}
        </button>
      </div>
    </form>
  );
}

/* 1d · Follow-up -------------------------------------------------------------- */

function FollowUpScreen({ customer, index, dispatch }: { customer: DraftCustomer; index: number; dispatch: Dispatch }) {
  const { followUp: copy } = lineCheck;
  const uid = useId();
  const [answer, setAnswer] = useState("");
  const [usedMic, setUsedMic] = useState(false);
  const [status, setStatus] = useState<"idle" | "merging" | "error">("idle");
  const followUp = customer.followUps[index];
  const total = customer.followUps.length;

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
    dispatch({
      type: "setProfile",
      id: customer.id,
      profile: withField(profileOf(customer), followUp.field, { value: null, unknown: true }),
    });
    track(events.followUpSkipped);
    advance();
  };

  return (
    <form onSubmit={submit} noValidate>
      <p className="kicker">
        {fill(copy.kicker, { nickname: customer.nickname })}
        <span className="lc-kicker-count"> · {fill(copy.counter, { current: index + 1, total })}</span>
      </p>
      <Heading>{followUp.question}</Heading>
      <DictationField
        id={`${uid}-fu`}
        value={answer}
        rows={3}
        onChange={(v) => {
          setAnswer(v);
          if (status === "error") setStatus("idle");
        }}
        onMicStart={() => setUsedMic(true)}
      />
      {status === "error" && (
        <p className="lc-error" role="alert">
          {copy.failed}
        </p>
      )}
      <div className="lc-actions">
        <button
          type="submit"
          className="button button--yellow lc-icon-button"
          disabled={!answer.trim() || status === "merging"}
        >
          {status === "merging" ? (
            <>
              <SpinnerIcon />
              {copy.merging}
            </>
          ) : (
            copy.answer
          )}
        </button>
        <button type="button" className="button button--outline" onClick={skip} disabled={status === "merging"}>
          {copy.skip}
        </button>
      </div>
    </form>
  );
}

/* 1c · Here's what I heard ------------------------------------------------------ */

function ReviewScreen({ state, customer, dispatch }: { state: State; customer: DraftCustomer; dispatch: Dispatch }) {
  const { review } = lineCheck;
  const isBest = customer.type === "best";
  const count = countDone(state, customer.type, customer.id) + 1;

  const remove = () => {
    if (!window.confirm(fill(review.removeConfirm, { nickname: customer.nickname }))) return;
    dispatch({ type: "removeCustomer", id: customer.id });
  };

  let actions: ReactNode;
  if (isBest && count < MIN_BEST) {
    actions = (
      <>
        <button type="button" className="button button--yellow lc-icon-button" onClick={() => startCustomer(dispatch, "best")}>
          <PlusIcon />
          {review.addSecondBest}
        </button>
        <p className="lc-fine lc-actions__note">{review.needTwo}</p>
      </>
    );
  } else if (isBest) {
    actions = (
      <>
        <button
          type="button"
          className="button button--yellow lc-icon-button"
          onClick={() => dispatch({ type: "go", step: { screen: "painIntro" } })}
        >
          {review.nextToPainful}
          <ArrowRightIcon />
        </button>
        {count < MAX_BEST && (
          <button type="button" className="button button--outline lc-icon-button" onClick={() => startCustomer(dispatch, "best")}>
            <PlusIcon />
            {review.addAnotherBest}
          </button>
        )}
      </>
    );
  } else {
    actions = (
      <>
        <button
          type="button"
          className="button button--yellow lc-icon-button"
          onClick={() => dispatch({ type: "go", step: { screen: "grid" } })}
        >
          {review.nextToCheck}
          <ArrowRightIcon />
        </button>
        {count < MAX_PAINFUL && (
          <button
            type="button"
            className="button button--outline lc-icon-button"
            onClick={() => startCustomer(dispatch, "painful")}
          >
            <PlusIcon />
            {review.addAnotherPainful}
          </button>
        )}
      </>
    );
  }

  return (
    <div>
      <Heading>{fill(review.headline, { nickname: customer.nickname })}</Heading>
      <p className="lc-helper">{review.body}</p>
      <ProfileCards
        profile={customer}
        tone={customer.type}
        onChange={(profile) => dispatch({ type: "setProfile", id: customer.id, profile: profileOf(profile) })}
      />
      <div className="lc-actions">{actions}</div>
      <button type="button" className="lc-link lc-remove" onClick={remove}>
        {review.remove}
      </button>
    </div>
  );
}

/* 2 · Painful customers ---------------------------------------------------------- */

function PainIntroScreen({ dispatch }: { dispatch: Dispatch }) {
  const { painIntro } = lineCheck;
  return (
    <div>
      <Heading>{painIntro.headline}</Heading>
      <p className="lc-lead">{painIntro.body}</p>
      <div className="lc-actions">
        <button
          type="button"
          className="button button--yellow lc-icon-button"
          onClick={() => startCustomer(dispatch, "painful")}
        >
          <PlusIcon />
          {painIntro.add}
        </button>
        <button
          type="button"
          className="button button--outline"
          onClick={() => dispatch({ type: "go", step: { screen: "grid" } })}
        >
          {painIntro.skip}
        </button>
      </div>
    </div>
  );
}

/* 3 · Side by side ------------------------------------------------------------- */

function GridScreen({ state, dispatch }: { state: State; dispatch: Dispatch }) {
  const { grid } = lineCheck;
  const customers = finishedCustomers(state);
  return (
    <div>
      <Heading>{grid.headline}</Heading>
      <p className="lc-helper">{grid.body}</p>
      <Grid
        customers={customers}
        onChange={(id, profile) => dispatch({ type: "setProfile", id, profile: profileOf(profile) })}
      />
      <div className="lc-actions">
        <button
          type="button"
          className="button button--yellow lc-icon-button"
          onClick={() => dispatch({ type: "go", step: { screen: "draft" } })}
        >
          {grid.button}
          <ArrowRightIcon />
        </button>
      </div>
    </div>
  );
}

/* 4 · Draft ICP (ungated) ---------------------------------------------------------- */

function DraftScreen({ state, dispatch }: { state: State; dispatch: Dispatch }) {
  const { draft } = lineCheck;
  const customers = finishedCustomers(state);
  const key = synthesisKeyFor(customers);
  const current = state.synthesisKey === key ? state.synthesis : null;
  const [status, setStatus] = useState<"idle" | "loading" | "error">(current ? "idle" : "loading");
  const shownFor = useRef<string | null>(null);
  const hasPainful = customers.some((c) => c.type === "painful");

  const load = useCallback(async () => {
    setStatus("loading");
    try {
      const out = await post<SynthesizeResponse>("/api/line-check/synthesize", { customers: forApi(customers) });
      dispatch({ type: "synthesized", synthesis: out.synthesis, key });
      setStatus("idle");
    } catch {
      setStatus("error");
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
      <div>
        <p className="kicker">{draft.kicker}</p>
        {status === "error" ? (
          <>
            <Heading>{draft.failed}</Heading>
            <div className="lc-actions">
              <button type="button" className="button button--yellow lc-icon-button" onClick={() => void load()}>
                <RotateIcon />
                {draft.retry}
              </button>
            </div>
          </>
        ) : (
          <div className="lc-loading" role="status">
            <SpinnerIcon />
            <Heading>{draft.loading}</Heading>
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <p className="kicker">{draft.kicker}</p>
      <SynthesisBody synthesis={current} customerCount={customers.length} hasPainful={hasPainful} dispatch={dispatch} />

      <section className="lc-teaser lc-noprint">
        <h2 className="lc-h2">{draft.teaserHeadline}</h2>
        <p className="lc-body">{draft.teaserBody}</p>
        <div className="lc-actions">
          <button
            type="button"
            className="button button--yellow lc-icon-button"
            onClick={() => dispatch({ type: "go", step: { screen: state.submitted ? "rubric" : "gate" } })}
          >
            {draft.teaserButton}
            <ArrowRightIcon />
          </button>
        </div>
      </section>
    </div>
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
  return (
    <div className="lc-synthesis">
      {asHeading ? <Heading>{synthesis.profile}</Heading> : <p className="lc-profile">{synthesis.profile}</p>}

      <div className="lc-synthesis__cols">
        <section className="lc-list lc-list--best">
          <h2 className="lc-h3">{draft.sharedHeading}</h2>
          <ul>
            {synthesis.shared.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </section>
        <section className="lc-list lc-list--painful">
          <h2 className="lc-h3">{draft.avoidHeading}</h2>
          {hasPainful && synthesis.avoid.length > 0 ? (
            <ul>
              {synthesis.avoid.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          ) : dispatch ? (
            <button
              type="button"
              className="lc-link"
              onClick={() => dispatch({ type: "go", step: { screen: "painIntro" } })}
            >
              {draft.avoidEmpty}
            </button>
          ) : null}
        </section>
      </div>

      <p className="lc-confidence">{fill(draft.confidence, { n: customerCount })}</p>
      <aside className="lc-explainer">
        <h2 className="lc-explainer__title">{draft.explainerHeading}</h2>
        <p>{draft.explainer}</p>
      </aside>
    </div>
  );
}

/* 5 · Email gate ------------------------------------------------------------------ */

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
    <label htmlFor={`${uid}-${name}`} className="field">
      <span className="field__label">{label}</span>
      <input
        id={`${uid}-${name}`}
        className="input"
        type={type}
        autoComplete={autoComplete}
        value={contact[name]}
        aria-invalid={(error === "required" && !contact[name].trim()) || (error === "email" && name === "email")}
        onChange={(e) => set({ [name]: e.target.value })}
      />
    </label>
  );

  return (
    <form onSubmit={submit} noValidate className="lc-gate">
      <Heading>{gate.headline}</Heading>
      <div className="lc-gate__fields">
        {field("firstName", gate.firstName, "text", "given-name")}
        {field("company", gate.company, "text", "organization")}
        {field("email", gate.email, "email", "email")}
      </div>
      <label className="lc-check">
        <input type="checkbox" checked={contact.optIn} onChange={(e) => set({ optIn: e.target.checked })} />
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
      <p className="lc-fine">{gate.small}</p>
      <div className="lc-actions">
        <button type="submit" className="button button--yellow lc-icon-button" disabled={sending}>
          {sending ? (
            <>
              <SpinnerIcon />
              {gate.sending}
            </>
          ) : (
            <>
              {gate.button}
              <ArrowRightIcon />
            </>
          )}
        </button>
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

/* 6 · Rubric and live scorer (gated) ---------------------------------------------- */

function RubricScreen({ state }: { state: State }) {
  const { rubric: copy } = lineCheck;
  const synthesis = state.synthesis;
  const customers = finishedCustomers(state);
  if (!synthesis) return null;
  return (
    <div>
      <p className="kicker">{copy.kicker}</p>
      <Heading>{copy.headline}</Heading>
      <p className="lc-helper">{copy.body}</p>
      <RubricView rubric={synthesis.rubric} />

      <section className="lc-printonly">
        <h2 className="lc-h2">{copy.profileHeading}</h2>
        <SynthesisBody
          synthesis={synthesis}
          customerCount={customers.length}
          hasPainful={customers.some((c) => c.type === "painful")}
          asHeading={false}
        />
      </section>

      <Closing />
    </div>
  );
}

function SharedRubricScreen({ rubric, onMakeOwn }: { rubric: Rubric; onMakeOwn: () => void }) {
  const { rubric: copy } = lineCheck;
  return (
    <div>
      <p className="kicker">{copy.kicker}</p>
      <Heading>{copy.headline}</Heading>
      <p className="lc-helper">{copy.sharedBody}</p>
      <RubricView rubric={rubric} shared />
      <div className="lc-actions lc-noprint">
        <button type="button" className="button button--outline lc-icon-button" onClick={onMakeOwn}>
          {copy.makeYourOwn}
          <ArrowRightIcon />
        </button>
      </div>
      <Closing />
    </div>
  );
}

function Closing() {
  const { closing } = lineCheck;
  return (
    <section className="lc-closing lc-noprint">
      <h2 className="lc-h2">{closing.headline}</h2>
      <p className="lc-body">{closing.body}</p>
      {lineCheck.bookingUrl !== null && (
        <div className="lc-actions">
          <a
            href={lineCheck.bookingUrl}
            className="button button--yellow"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => track(events.bookingClicked)}
          >
            {closing.button}
          </a>
        </div>
      )}
      <p className="lc-signoff">
        {closing.signOff}
        <br />
        {closing.name}
      </p>
    </section>
  );
}
