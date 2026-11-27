"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { flushSync } from "react-dom";
import { mark } from "@/brand/logo";
import { Flip } from "gsap/Flip";
import { ease, gsap } from "@/motion/gsap";

gsap.registerPlugin(Flip);
import { useMotion } from "@/motion/useMotion";
import { CONTACT_METHODS, LIMITS, validateInquiry, type InquiryErrors, type InquiryField, type InquiryValues } from "@/lib/inquiry/fields";
import "./inquiry.css";

type Settings = { heading: string; intro: string; successMessage: string; errorMessage: string; interestOptions: string[] };
type State = "idle" | "sending" | "sent" | "failed";

const LABELS: Record<InquiryField, string> = {
  name: "Your name", email: "Email address", phone: "Phone number", interest: "Topic",
  contactMethod: "Preferred contact", message: "Message", consent: "Privacy confirmation",
};
const FAILURES: Record<number, string> = {
  429: "We have received several messages from this connection. Please wait a few minutes and try again.",
  503: "Our inquiry form is not available right now.",
};

function read(form: HTMLFormElement): InquiryValues & { website: string } {
  const d = new FormData(form);
  const s = (k: string) => String(d.get(k) ?? "").trim();
  return { name: s("name"), email: s("email"), phone: s("phone"), interest: s("interest"), contactMethod: s("contactMethod"), message: s("message"), consent: d.get("consent") === "yes", website: s("website") };
}

/**
 * The single shared inquiry form. Validates in the browser with the same rules as the
 * server, then posts to /api/inquiry. In demonstration mode the server validates and
 * discards the data; the success message says so. The invitation button unfolds into
 * the panel (GSAP Flip) and folds back.
 */
export function Inquiry({ settings, openOnHash, defaultOpen = false, phone }: { settings: Settings; openOnHash?: string; defaultOpen?: boolean; phone?: string | null }) {
  const { reduced } = useMotion();
  const [open, setOpen] = useState(defaultOpen);
  const [state, setState] = useState<State>("idle");
  const [errors, setErrors] = useState<InquiryErrors>({});
  const [failure, setFailure] = useState("");
  const [mode, setMode] = useState<"demo" | "live">("demo");
  const failed = useRef<HTMLDivElement>(null);
  // One ID per inquiry: a retry after a lost response is recognized, not delivered twice.
  const submissionId = useRef<string>("");
  const shell = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const summary = useRef<HTMLDivElement>(null);
  const done = useRef<HTMLHeadingElement>(null);
  const form = useRef<HTMLFormElement>(null);

  // Flip the shared shell between its button and panel states.
  const morph = (next: boolean) => {
    const flipState = Flip.getState(shell.current!);
    flushSync(() => setOpen(next));
    Flip.from(flipState, {
      duration: reduced ? 0 : 0.7,
      ease: ease.open,
      onComplete: () => (next ? form.current?.querySelector<HTMLElement>("input")?.focus() : trigger.current?.focus()),
    });
    if (next && !reduced) gsap.from(shell.current!.querySelectorAll(".iq-field"), { opacity: 0, y: 12, duration: 0.5, stagger: 0.05, delay: 0.35, ease: ease.settle });
  };

  const close = () => {
    setState("idle");
    setFailure("");
    setErrors({});
    morph(false);
    // Clear #inquire so the same link can reopen the panel.
    if (openOnHash && location.hash === `#${openOnHash}`) history.replaceState(history.state, "", location.pathname + location.search);
  };

  const showSent = () => {
    flushSync(() => setState("sent"));
    done.current?.focus();
    if (!reduced) {
      gsap.fromTo(shell.current!.querySelector(".iq-door"), { rotate: -32, transformOrigin: "19px 44px" }, { rotate: 0, duration: 1.1, ease: ease.open });
      gsap.from(shell.current!.querySelectorAll(".iq-sent > :not(svg)"), { opacity: 0, y: 14, duration: 0.6, stagger: 0.08, delay: 0.3, ease: ease.settle });
    }
  };

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (state === "sending") return;
    const values = read(e.currentTarget);
    const errs = validateInquiry(values, settings.interestOptions);
    setErrors(errs);
    setFailure("");
    if (Object.keys(errs).length) {
      requestAnimationFrame(() => summary.current?.focus());
      return;
    }
    submissionId.current ||= crypto.randomUUID();
    setState("sending");
    try {
      const response = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, submissionId: submissionId.current }),
        signal: AbortSignal.timeout(20_000),
      });
      const body = (await response.json().catch(() => ({}))) as { ok?: boolean; mode?: "demo" | "live"; fields?: InquiryErrors };
      if (response.ok && body.ok) {
        submissionId.current = "";
        setMode(body.mode === "live" ? "live" : "demo");
        showSent();
        return;
      }
      if (response.status === 400 && body.fields && Object.keys(body.fields).length) {
        setState("idle");
        setErrors(body.fields);
        requestAnimationFrame(() => summary.current?.focus());
        return;
      }
      throw new Error(String(response.status));
    } catch (err) {
      flushSync(() => {
        setState("failed");
        setFailure(FAILURES[Number((err as Error).message)] ?? settings.errorMessage);
      });
      failed.current?.focus();
    }
  };

  // Escape closes the panel wherever focus is (it may still be in transit after opening).
  const closeRef = useRef(close);
  useEffect(() => {
    closeRef.current = close;
  });
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeRef.current();
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, [open]);

  // Links to #inquire (header, hero, menu) open the panel, so no inquiry action is dead.
  const morphRef = useRef(morph);
  useEffect(() => {
    morphRef.current = morph;
  });
  useEffect(() => {
    if (!openOnHash) return;
    const onHash = () => {
      if (location.hash !== `#${openOnHash}`) return;
      if (shell.current?.classList.contains("iq-panel")) shell.current.querySelector<HTMLElement>("input")?.focus({ preventScroll: true });
      else morphRef.current(true);
    };
    onHash();
    addEventListener("hashchange", onHash);
    return () => removeEventListener("hashchange", onHash);
  }, [openOnHash]);

  const err = (k: InquiryField, hint?: string) => {
    const ids = [hint, errors[k] && `${k}-error`].filter(Boolean).join(" ");
    return { "aria-invalid": errors[k] ? true : undefined, "aria-describedby": ids || undefined };
  };
  const count = Object.keys(errors).length;
  const sending = state === "sending";

  return (
    <div
      ref={shell}
      data-flip-id="inquiry"
      className={open ? "iq-panel" : "iq-closed"}
    >
      {!open ? (
        <button ref={trigger} type="button" className="btn btn-primary iq-trigger" aria-expanded="false" onClick={() => morph(true)}>
          Arrange a visit
        </button>
      ) : state === "sent" ? (
        <div className="iq-sent" role="status">
          <svg viewBox="0 0 48 48" width="72" height="72" aria-hidden="true">
            <path d={mark.body} fill="#18243D" fillRule="evenodd" />
            <path className="iq-door" d="M19 44V27a5 5 0 0 1 10 0v17Z" fill="#4564B4" />
          </svg>
          <h2 ref={done} tabIndex={-1} className="mt-6 text-h2 font-semibold outline-none">{mode === "live" ? "Thank you." : "Your inquiry is ready."}</h2>
          {mode === "live" ? (
            <p className="mt-4 max-w-[52ch] text-lead">{settings.successMessage.replace(/^Thank you\. /, "")}</p>
          ) : (
            <p className="mt-4 max-w-[52ch] text-lead">This is a demonstration website, so nothing was sent or stored. On the live website, this is where the team would confirm your message.</p>
          )}
          <button type="button" className="btn btn-secondary mt-8" onClick={close}>Close</button>
        </div>
      ) : (
        <form ref={form} noValidate onSubmit={submit} aria-labelledby="iq-title" aria-busy={sending}>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <h2 id="iq-title" className="text-h2 font-semibold">{settings.heading}</h2>
            <button type="button" className="btn btn-secondary shrink-0" onClick={close}>Close</button>
          </div>
          <p className="mt-4 max-w-[60ch]">{settings.intro}</p>
          <p className="mt-3 text-small">Fields marked <span aria-hidden="true">*</span><span className="sr-only">with an asterisk</span> are required.</p>

          {count > 0 && (
            <div ref={summary} tabIndex={-1} className="iq-summary mt-6" role="alert">
              <p className="font-semibold">Please check {count === 1 ? "one field" : `${count} fields`}:</p>
              <ul className="mt-2 list-disc pl-5">
                {Object.entries(errors).map(([k, v]) => <li key={k}><a href={`#iq-${k}`}>{LABELS[k as InquiryField]}: {v}</a></li>)}
              </ul>
            </div>
          )}

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <div className="iq-field">
              <label htmlFor="iq-name">Your name <span aria-hidden="true">*</span></label>
              <input id="iq-name" name="name" autoComplete="name" required maxLength={LIMITS.name} {...err("name")} />
              {errors.name && <p id="name-error" className="iq-error">{errors.name}</p>}
            </div>
            <div className="iq-field">
              <label htmlFor="iq-email">Email address <span aria-hidden="true">*</span></label>
              <input id="iq-email" name="email" type="email" autoComplete="email" required maxLength={LIMITS.email} {...err("email")} />
              {errors.email && <p id="email-error" className="iq-error">{errors.email}</p>}
            </div>
            <div className="iq-field">
              <label htmlFor="iq-phone">Phone number <span className="font-normal">(optional)</span></label>
              <input id="iq-phone" name="phone" type="tel" autoComplete="tel" maxLength={LIMITS.phone} {...err("phone")} />
              {errors.phone && <p id="phone-error" className="iq-error">{errors.phone}</p>}
            </div>
            <div className="iq-field">
              <label htmlFor="iq-interest">What would you like to talk about? <span className="font-normal">(optional)</span></label>
              <select id="iq-interest" name="interest" defaultValue="" {...err("interest")}>
                <option value="">No preference</option>
                {settings.interestOptions.map((o) => <option key={o}>{o}</option>)}
              </select>
              {errors.interest && <p id="interest-error" className="iq-error">{errors.interest}</p>}
            </div>
            <fieldset className="iq-field iq-choice md:col-span-2" id="iq-contactMethod" {...err("contactMethod")}>
              <legend>How should we reach you? <span className="font-normal">(optional)</span></legend>
              <div className="iq-options">
                {CONTACT_METHODS.map((m) => (
                  <label key={m}><input type="radio" name="contactMethod" value={m} /> {m}</label>
                ))}
              </div>
            </fieldset>
            <div className="iq-field md:col-span-2">
              <label htmlFor="iq-message">Anything else? <span className="font-normal">(optional)</span></label>
              <textarea id="iq-message" name="message" rows={4} maxLength={LIMITS.message} {...err("message", "iq-message-hint")} />
              <p id="iq-message-hint" className="mt-2 text-small">Please do not include medical details, diagnoses, medications, insurance or financial information. We will talk through personal needs together.</p>
              {errors.message && <p id="message-error" className="iq-error">{errors.message}</p>}
            </div>
            <div className="iq-field iq-consent md:col-span-2">
              <label htmlFor="iq-consent">
                <input id="iq-consent" name="consent" type="checkbox" value="yes" required {...err("consent")} />
                <span>I have read the <a href="/privacy" className="text-link">privacy notice</a> and understand this form is for a first conversation only. <span aria-hidden="true">*</span></span>
              </label>
              {errors.consent && <p id="consent-error" className="iq-error">{errors.consent}</p>}
            </div>
            {/* Honeypot for automated senders: hidden from people and assistive technology. */}
            <div className="iq-trap" aria-hidden="true">
              <label htmlFor="iq-website">Leave this empty</label>
              <input id="iq-website" name="website" tabIndex={-1} autoComplete="off" />
            </div>
          </div>

          {state === "failed" && (
            <div ref={failed} tabIndex={-1} className="iq-summary mt-8" role="alert">
              <p className="font-semibold">Your inquiry was not sent.</p>
              <p className="mt-2">{failure} Your answers are still here, so you can try again{phone ? <>, or call us at <a href={`tel:+1${phone.replace(/\D/g, "")}`} className="text-link">{phone}</a></> : null}.</p>
            </div>
          )}

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <button type="submit" className="btn btn-primary" aria-disabled={sending} aria-describedby="iq-demo">
              {sending ? "Sending…" : state === "failed" ? "Try again" : "Send inquiry"}
            </button>
            <p id="iq-demo" className="text-small" aria-live="polite">{sending ? "Sending your inquiry…" : "Demonstration: nothing is emailed or stored."}</p>
          </div>
        </form>
      )}
    </div>
  );
}
