/** Opening the "Let's talk" contact popup from anywhere on the page. */

export const CONTACT_OPEN_EVENT = "contact:open";

/** What a button can hand the popup when it opens it. */
export type ContactPrefill = { message?: string };

export function openContact(): void {
  window.dispatchEvent(new Event(CONTACT_OPEN_EVENT));
}

/** Open the popup with the message box already filled in (the Durango package buttons). */
export function openContactWith(prefill: ContactPrefill): void {
  window.dispatchEvent(new CustomEvent<ContactPrefill>(CONTACT_OPEN_EVENT, { detail: prefill }));
}
