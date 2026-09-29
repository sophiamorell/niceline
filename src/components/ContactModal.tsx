"use client";

import { useCallback, useEffect, useId, useRef, useState, type FormEvent } from "react";
import { contact, site } from "@/content";
import { CONTACT_OPEN_EVENT } from "@/lib/contact-modal";
import { useDialog } from "@/lib/dialog";
import { postForm } from "@/lib/forms";

/**
 * The "Let's talk" popup, opened by openContact() (the bundle row's
 * button). Name, work email, company and a free-text note, posted to the
 * Netlify "contact" form. Required and email checks run on submit and show
 * inline under each field; an error clears as soon as that field changes.
 * On success the dialog shows the sent state; reopening after that starts a
 * fresh form. Closes on ×, a click on the backdrop, or Escape.
 */

type Status = "idle" | "sending" | "sent" | "error";
type Values = Record<string, string>;

const EMAIL_PATTERN = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

function validate(values: Values): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const field of contact.fields) {
    const value = (values[field.id] ?? "").trim();
    if (field.required && value === "") errors[field.id] = contact.errors.required;
    else if (field.type === "email" && value !== "" && !EMAIL_PATTERN.test(value)) errors[field.id] = contact.errors.email;
  }
  return errors;
}

export function ContactModal() {
  const uid = useId();
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [values, setValues] = useState<Values>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const dialogRef = useRef<HTMLDivElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const firstFieldRef = useRef<HTMLInputElement>(null);
  const sentHeadingRef = useRef<HTMLHeadingElement>(null);
  const statusRef = useRef<Status>(status);

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    const onOpen = () => {
      openerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      if (statusRef.current === "sent") {
        setValues({});
        setErrors({});
        setStatus("idle");
      }
      setOpen(true);
    };
    window.addEventListener(CONTACT_OPEN_EVENT, onOpen);
    return () => window.removeEventListener(CONTACT_OPEN_EVENT, onOpen);
  }, []);

  useDialog(open, close, dialogRef, openerRef);

  useEffect(() => {
    if (!open) return;
    if (status === "sent") sentHeadingRef.current?.focus();
    else if (status === "idle") firstFieldRef.current?.focus();
    // Only on open and on reaching the sent state; typing must not move focus.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, status === "sent"]);

  const set = (id: string, value: string) => {
    setValues((prev) => ({ ...prev, [id]: value }));
    if (errors[id]) setErrors((prev) => ({ ...prev, [id]: "" }));
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const found = validate(values);
    if (Object.keys(found).length > 0) {
      setErrors(found);
      const firstBad = contact.fields.find((field) => found[field.id]);
      if (firstBad) document.getElementById(`${uid}-${firstBad.id}`)?.focus();
      return;
    }
    setStatus("sending");
    try {
      const fields: Record<string, string> = { "form-name": contact.netlifyFormName };
      for (const field of contact.fields) fields[field.id] = (values[field.id] ?? "").trim();
      await postForm(fields);
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  };

  if (!open) return null;

  const headingId = `${uid}-heading`;
  const [failedBefore, failedAfter] = contact.sendFailed.split("{email}");

  return (
    <div
      className="modal modal--contact"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) close();
      }}
    >
      <div ref={dialogRef} className="cdialog" role="dialog" aria-modal="true" aria-labelledby={headingId}>
        <button type="button" className="cdialog__close" aria-label={contact.closeLabel} onClick={close}>
          <span aria-hidden="true">×</span>
        </button>

        {status === "sent" ? (
          <div>
            <p className="kicker cdialog__kicker">{contact.sent.kicker}</p>
            <h3 id={headingId} className="cdialog__heading" tabIndex={-1} ref={sentHeadingRef}>
              {contact.sent.heading}
            </h3>
            <p className="cdialog__sub">{contact.sent.sub}</p>
            <p className="cdialog__sub cdialog__signoff">{contact.sent.signOff}</p>
            <button type="button" className="button button--outline button--small" onClick={close}>
              {contact.sent.closeLabel}
            </button>
          </div>
        ) : (
          <form onSubmit={onSubmit} noValidate>
            <p className="kicker cdialog__kicker">{contact.kicker}</p>
            <h3 id={headingId} className="cdialog__heading">
              {contact.heading}
            </h3>
            <div className="cdialog__fields">
              {contact.fields.map((field, index) => {
                const id = `${uid}-${field.id}`;
                const errorId = `${id}-error`;
                const error = errors[field.id];
                const common = {
                  id,
                  name: field.id,
                  required: field.required,
                  value: values[field.id] ?? "",
                  "aria-invalid": Boolean(error) || undefined,
                  "aria-describedby": error ? errorId : undefined,
                };
                return (
                  <label key={field.id} htmlFor={id} className="field">
                    <span className="field__label">{field.label}</span>
                    {field.type === "textarea" ? (
                      <textarea {...common} className="input" rows={4} onChange={(e) => set(field.id, e.target.value)} />
                    ) : (
                      <input
                        {...common}
                        ref={index === 0 ? firstFieldRef : undefined}
                        className="input"
                        type={field.type}
                        autoComplete={field.id === "company" ? "organization" : field.id}
                        onChange={(e) => set(field.id, e.target.value)}
                      />
                    )}
                    {error && (
                      <span id={errorId} className="cdialog__error">
                        {error}
                      </span>
                    )}
                  </label>
                );
              })}
            </div>
            {status === "error" && (
              <p className="cdialog__failed" role="alert">
                {failedBefore}
                {site.email !== null && <a href={`mailto:${site.email}`}>{site.email}</a>}
                {failedAfter}
              </p>
            )}
            <button type="submit" className="cdialog__submit" disabled={status === "sending"}>
              <span>{status === "sending" ? contact.sendingLabel : contact.submitLabel}</span>
              <span aria-hidden="true">→</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
