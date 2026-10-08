"use client";

import {
  emptyProfile,
  type Customer,
  type CustomerProfile,
  type CustomerType,
  type FollowUp,
  type Synthesis,
} from "@/lib/line-check/types";

/**
 * Line Check: all client state in one reducer (build brief, section 8).
 * Nothing leaves the browser until the email gate, except the text sent to
 * the two AI routes. Progress is kept in sessionStorage so a refresh doesn't
 * lose ten minutes of dictation; every read and write is wrapped, so the
 * tool still works when storage isn't available.
 */

export const MAX_BEST = 3;
export const MIN_BEST = 2;
export const MAX_PAINFUL = 2;

export type Step =
  | { screen: "intro" }
  | { screen: "nickname"; id: string }
  | { screen: "tell"; id: string }
  | { screen: "followUp"; id: string; index: number }
  | { screen: "review"; id: string }
  | { screen: "painIntro" }
  | { screen: "grid" }
  | { screen: "draft" }
  | { screen: "gate" }
  | { screen: "rubric" };

export interface DraftCustomer extends Customer {
  done: boolean; // reached the review screen at least once
  followUps: FollowUp[];
}

export interface Contact {
  firstName: string;
  company: string;
  email: string;
  optIn: boolean;
}

export interface State {
  history: Step[]; // the current screen is the last one; Back pops
  customers: DraftCustomer[];
  synthesis: Synthesis | null;
  synthesisKey: string | null; // which customer data the synthesis was built from
  contact: Contact;
  submitted: boolean;
}

export const initialState: State = {
  history: [{ screen: "intro" }],
  customers: [],
  synthesis: null,
  synthesisKey: null,
  contact: { firstName: "", company: "", email: "", optIn: false },
  submitted: false,
};

export type Action =
  | { type: "hydrate"; state: State }
  | { type: "reset" }
  | { type: "go"; step: Step }
  | { type: "back" }
  | { type: "newCustomer"; customerType: CustomerType; id: string }
  | { type: "setNickname"; id: string; nickname: string }
  | { type: "setTranscript"; id: string; transcript: string }
  | { type: "extracted"; id: string; profile: CustomerProfile; followUps: FollowUp[] }
  | { type: "merged"; id: string; profile: CustomerProfile; answer: string }
  | { type: "setProfile"; id: string; profile: CustomerProfile }
  | { type: "markDone"; id: string }
  | { type: "removeCustomer"; id: string }
  | { type: "synthesized"; synthesis: Synthesis; key: string }
  | { type: "setContact"; contact: Contact }
  | { type: "submitted" };

const referencesId = (step: Step, id: string) => "id" in step && step.id === id;

export function reducer(state: State, action: Action): State {
  const update = (id: string, fn: (c: DraftCustomer) => DraftCustomer) => ({
    ...state,
    customers: state.customers.map((c) => (c.id === id ? fn(c) : c)),
  });

  switch (action.type) {
    case "hydrate":
      return action.state;
    case "reset":
      return initialState;
    case "go":
      return { ...state, history: [...state.history, action.step] };
    case "back":
      return state.history.length > 1 ? { ...state, history: state.history.slice(0, -1) } : state;
    case "newCustomer": {
      const customer: DraftCustomer = {
        id: action.id,
        type: action.customerType,
        nickname: "",
        transcript: "",
        ...emptyProfile(),
        done: false,
        followUps: [],
      };
      // Drop any earlier customer that was started but never finished and
      // isn't reachable with Back.
      const reachable = (c: DraftCustomer) => c.done || state.history.some((s) => referencesId(s, c.id));
      return {
        ...state,
        customers: [...state.customers.filter(reachable), customer],
        history: [...state.history, { screen: "nickname", id: action.id }],
      };
    }
    case "setNickname":
      return update(action.id, (c) => ({ ...c, nickname: action.nickname }));
    case "setTranscript":
      return update(action.id, (c) => ({ ...c, transcript: action.transcript }));
    case "extracted":
      return update(action.id, (c) => ({ ...c, ...action.profile, followUps: action.followUps }));
    case "merged":
      return update(action.id, (c) => ({
        ...c,
        ...action.profile,
        transcript: action.answer ? `${c.transcript.trim()}\n\n${action.answer.trim()}` : c.transcript,
      }));
    case "setProfile":
      return update(action.id, (c) => ({ ...c, ...action.profile }));
    case "markDone":
      return update(action.id, (c) => ({ ...c, done: true }));
    case "removeCustomer": {
      const history = state.history.filter((s) => !referencesId(s, action.id));
      return {
        ...state,
        customers: state.customers.filter((c) => c.id !== action.id),
        history: history.length > 0 ? history : [{ screen: "intro" }],
      };
    }
    case "synthesized":
      return { ...state, synthesis: action.synthesis, synthesisKey: action.key };
    case "setContact":
      return { ...state, contact: action.contact };
    case "submitted":
      return { ...state, submitted: true };
  }
}

/** The customers that count: finished ones, best first. */
export function finishedCustomers(state: State): DraftCustomer[] {
  const done = state.customers.filter((c) => c.done);
  return [...done.filter((c) => c.type === "best"), ...done.filter((c) => c.type === "painful")];
}

/** Customers as sent to the API: no client-only fields. */
export function forApi(customers: DraftCustomer[]): Customer[] {
  return customers.map((c) => ({
    id: c.id,
    type: c.type,
    nickname: c.nickname,
    transcript: c.transcript,
    company: c.company,
    situation: c.situation,
    buyer: c.buyer,
    before: c.before,
    economics: c.economics,
  }));
}

/** Changes whenever anything the synthesis reads changes. */
export function synthesisKeyFor(customers: DraftCustomer[]): string {
  return JSON.stringify(
    forApi(customers).map(({ type, nickname, company, situation, buyer, before, economics }) => ({
      type,
      nickname,
      company,
      situation,
      buyer,
      before,
      economics,
    })),
  );
}

/* Persistence ------------------------------------------------------------- */

const STORAGE_KEY = "line-check:v1";

export function loadState(): State | null {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as State;
    if (!Array.isArray(parsed.history) || parsed.history.length === 0 || !Array.isArray(parsed.customers)) {
      return null;
    }
    return { ...initialState, ...parsed };
  } catch {
    return null;
  }
}

export function saveState(state: State): void {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* storage unavailable or full: the tool keeps working without it */
  }
}

export function clearState(): void {
  try {
    window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* nothing to clear */
  }
}

export function newId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `c${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
  }
}
