"use client";

import React, { useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import FlagModule from "react-world-flags";

import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";

import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import ShimmerBtn from "./ShimmerBtn";
import Wheels from "./Wheels";

// Apps Script -> Deploy -> Manage deployments -> Web app URL (must end in /exec)
const SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbzZ8hrRaY3zqR0ytIi0jMEb_W6AhuhtGGV6UYlFJ_aPU7fDSDvMGtoHeeKj8kfwGo_8/exec";

gsap.registerPlugin(useGSAP, ScrambleTextPlugin);

const Flag = FlagModule?.default ?? FlagModule;

const RED = "#ff073a";

const HEAD =
  "font-quick text-2xl font-light tracking-tight text-dark md:text-3xl";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const STEPS = ["Where", "Email", "Developer", "Review"];
const TOTAL = STEPS.length;

// ISO 3166-1 alpha-2 country codes
const CODES = `
AF AX AL DZ AS AD AO AI AQ AG AR AM AW AU AT AZ BS BH BD BB BY BE BZ
BJ BM BT BO BQ BA BW BV BR IO BN BG BF BI CV KH CM CA KY CF TD CL CN
CX CC CO KM CG CD CK CR CI HR CU CW CY CZ DK DJ DM DO EC EG SV GQ ER
EE SZ ET FK FO FJ FI FR GF PF TF GA GM GE DE GH GI GR GL GD GP GU GT
GG GN GW GY HT HM VA HN HK HU IS IN ID IR IQ IE IM IL IT JM JP JE JO
KZ KE KI KP KR KW KG LA LV LB LS LR LY LI LT LU MO MG MW MY MV ML MT
MH MQ MR MU YT MX FM MD MC MN ME MS MA MZ MM NA NR NP NL NC NZ NI NE
NG NU NF MK MP NO OM PK PW PS PA PG PY PE PH PN PL PT PR QA RE RO RU
RW BL SH KN LC MF PM VC WS SM ST SA SN RS SC SL SG SX SK SI SB SO ZA
GS SS ES LK SD SR SJ SE CH SY TW TJ TZ TH TL TG TK TO TT TN TR TM TC
TV UG UA AE GB US UM UY UZ VU VE VN VG VI WF EH YE ZM ZW
`
  .trim()
  .split(/\s+/);

const regionNames = new Intl.DisplayNames(["en"], { type: "region" });

const COUNTRIES = CODES.map((code) => ({
  code,
  name: regionNames.of(code) || code,
})).sort((a, b) => a.name.localeCompare(b.name));

function Progress({ current }) {
  const pct = (current / TOTAL) * 100;

  return (
    <div
      className="beta-progress"
      role="progressbar"
      aria-label="Signup progress"
      aria-valuemin={1}
      aria-valuemax={TOTAL}
      aria-valuenow={current}
      aria-valuetext={`Step ${current} of ${TOTAL}: ${STEPS[current - 1]}`}
    >
      <div className="beta-progress-head">
        <span className="beta-progress-count">
          {String(current).padStart(2, "0")}
          <span>/{String(TOTAL).padStart(2, "0")}</span>
        </span>
        <span>{STEPS[current - 1]}</span>
      </div>

      <div className="beta-progress-track">
        <div className="beta-progress-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function BetaForm() {
  const root = useRef(null);
  const titleRef = useRef(null);
  const dir = useRef(1); // slide direction: 1 forward, -1 back

  const [step, setStep] = useState("ask");
  const [current, setCurrent] = useState(1); // stepper position (1-4)

  const [country, setCountry] = useState(null);
  const [query, setQuery] = useState("");
  const [email, setEmail] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);
  const [developer, setDeveloper] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const emailValid = EMAIL_RE.test(email.trim());

  // can the person move on from the step they're on?
  const canContinue =
    (current === 1 && !!country) ||
    (current === 2 && emailValid) ||
    (current === 3 && !!developer) ||
    current === 4;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return COUNTRIES;
    return COUNTRIES.filter(
      (c) => c.name.toLowerCase().includes(q) || c.code.toLowerCase() === q,
    );
  }, [query]);

  useGSAP(
    () => {
      if (step === "form") {
        gsap.from(".beta-stepper-wrap", {
          y: 30,
          opacity: 0,
          duration: 0.7,
          ease: "power3.out",
        });
      }

      if (step === "thanks" || step === "sent") {
        const title = titleRef.current;
        if (!title) return;

        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
          title.textContent =
            step === "sent" ? "You're on the list!" : "Thank you";
          title.style.color = RED;
          return;
        }

        gsap.to(title, {
          duration: 1.2,
          color: RED,
          scrambleText: {
            text: step === "sent" ? "You're on the list!" : "Thank you",
            chars: "upperCase",
            speed: 0.5,
          },
        });
      }
    },
    { scope: root, dependencies: [step] },
  );

  // slide the pane in whenever the step changes
  useGSAP(
    () => {
      if (step !== "form") return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return;
      }

      gsap.from(".beta-pane", {
        x: dir.current * 32,
        opacity: 0,
        duration: 0.4,
        ease: "power3.out",
      });
    },
    { scope: root, dependencies: [current] },
  );

  const go = (n) => {
    dir.current = n > current ? 1 : -1;
    setSubmitError("");
    setCurrent(n);
  };

  const submit = async () => {
    if (isSubmitting) return;
    setSubmitError("");

    if (!country || !emailValid || !developer) {
      setSubmitError("Something is missing. Go back and check your answers.");
      return;
    }

    if (
      !SCRIPT_URL.startsWith("https://script.google.com/macros/s/") ||
      !SCRIPT_URL.endsWith("/exec")
    ) {
      setSubmitError(
        "The beta form hasn't been configured yet. Please set the deployed Apps Script web-app URL.",
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = new URLSearchParams({
        country: country.name,
        countryCode: country.code,
        email: email.trim(),
        developer: String(developer === "yes"),
      });

      // no-cors: request is sent, but the response can't be inspected
      await fetch(SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        body: payload,
      });

      setStep("sent");
    } catch (error) {
      console.error("Beta signup error:", error);
      setSubmitError(
        "We couldn't send your signup. Check your connection and try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const next = () => {
    if (!canContinue || isSubmitting) return;
    if (current === TOTAL) submit();
    else go(current + 1);
  };

  return (
    <section
      id="beta"
      ref={root}
      className="flex min-h-screen w-full bg-sulphur text-dark"
    >
      <div className="flex min-w-0 flex-1 flex-col gap-10 px-5 py-16 md:px-12 lg:px-16">
        <div>
          <h1
            ref={titleRef}
            aria-live="polite"
            className="mt-4 font-quick text-[clamp(2.5rem,7vw,6rem)] font-light leading-none tracking-tight text-dark"
          >
            Help us test Ndimi?
          </h1>
        </div>

        {/* Initial question */}
        {step === "ask" && (
          <div className="flex flex-wrap gap-4">
            <ShimmerBtn
              type="button"
              onClick={() => setStep("form")}
              className="h-12 rounded-none px-10 font-quick text-sm font-medium"
            >
              Yes
            </ShimmerBtn>
            <button
              type="button"
              onClick={() => setStep("thanks")}
              className="beta-btn"
            >
              No
            </button>
          </div>
        )}

        {/* Stepped signup */}
        {step === "form" && (
          <div className="beta-stepper-wrap w-full max-w-xl">
            <Progress current={current} />

            <form
              noValidate
              onSubmit={(e) => {
                e.preventDefault();
                next();
              }}
            >
              {/* 1. Country */}
              {current === 1 && (
                <div key="where" className="beta-pane beta-step">
                  <FieldLabel htmlFor="beta-country" className={HEAD}>
                    Where are you?
                  </FieldLabel>

                  <Field>
                    <div className="flag-picker">
                      <Input
                        id="beta-country"
                        type="search"
                        placeholder="Search your country"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") e.preventDefault();
                        }}
                        autoComplete="off"
                        className="flag-search"
                      />

                      <div
                        className="flag-grid"
                        role="group"
                        aria-label="Countries"
                      >
                        {filtered.map((c) => (
                          <button
                            key={c.code}
                            type="button"
                            title={c.name}
                            aria-label={c.name}
                            aria-pressed={country?.code === c.code}
                            onClick={() => setCountry(c)}
                            className="flag-btn"
                          >
                            <Flag code={c.code} className="flag-img" />
                            <span className="flag-name">{c.name}</span>
                          </button>
                        ))}

                        {filtered.length === 0 && (
                          <p className="flag-empty">No country found</p>
                        )}
                      </div>
                    </div>

                    <FieldDescription className="flag-chosen">
                      {country ? (
                        <>
                          <Flag
                            code={country.code}
                            className="flag-chosen-img"
                          />
                          {country.name}
                        </>
                      ) : (
                        "Pick your flag"
                      )}
                    </FieldDescription>
                  </Field>
                </div>
              )}

              {/* 2. Email */}
              {current === 2 && (
                <div key="email" className="beta-pane beta-step">
                  <FieldLabel htmlFor="beta-email" className={HEAD}>
                    Your email
                  </FieldLabel>

                  <Field data-invalid={emailTouched && !emailValid}>
                    <Input
                      id="beta-email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setSubmitError("");
                      }}
                      onBlur={() => setEmailTouched(true)}
                      aria-invalid={emailTouched && !emailValid}
                      autoComplete="email"
                      autoFocus
                      className="h-14 rounded-none border-2 border-dark bg-transparent px-4 font-quick text-lg text-dark shadow-none transition-shadow placeholder:text-dark/40 focus-visible:border-dark focus-visible:shadow-[4px_4px_0_var(--color-dark)] focus-visible:ring-0 aria-invalid:border-red aria-invalid:focus-visible:shadow-[4px_4px_0_var(--color-red)]"
                    />
                    {emailTouched && !emailValid && (
                      <FieldError className="text-red">
                        Enter a valid email.
                      </FieldError>
                    )}
                  </Field>
                </div>
              )}

              {/* 3. Developer */}
              {current === 3 && (
                <div key="developer" className="beta-pane beta-step">
                  <p id="dev-q" className={HEAD}>
                    Are you a developer?
                  </p>

                  <RadioGroup
                    aria-labelledby="dev-q"
                    value={developer}
                    onValueChange={(value) => {
                      setDeveloper(value);
                      setSubmitError("");
                    }}
                    className="flex gap-4"
                  >
                    {["yes", "no"].map((v) => {
                      const checked = developer === v;

                      return (
                        <label
                          key={v}
                          htmlFor={`dev-${v}`}
                          className={`relative flex min-w-32 cursor-pointer select-none items-center gap-3 border-2 border-dark px-6 py-4 font-mono text-sm font-bold uppercase tracking-widest transition-[background-color,color,box-shadow,transform] ${
                            checked
                              ? "bg-dark text-sulphur shadow-[4px_4px_0_var(--color-red)]"
                              : "bg-transparent text-dark hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_var(--color-dark)]"
                          }`}
                        >
                          <RadioGroupItem
                            value={v}
                            id={`dev-${v}`}
                            className="peer sr-only"
                          />
                          <span
                            aria-hidden
                            className={`size-3 border-2 border-current peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4 peer-focus-visible:outline-red ${
                              checked ? "bg-current" : "bg-transparent"
                            }`}
                          />
                          {v}
                        </label>
                      );
                    })}
                  </RadioGroup>
                </div>
              )}

              {/* 4. Review */}
              {current === 4 && (
                <div key="review" className="beta-pane beta-step">
                  <p className={HEAD}>Looks right?</p>

                  <dl className="beta-summary">
                    <div>
                      <dt>Country</dt>
                      <dd className="flex items-center gap-2">
                        {country && (
                          <Flag
                            code={country.code}
                            className="flag-chosen-img"
                          />
                        )}
                        {country?.name}
                      </dd>
                    </div>
                    <div>
                      <dt>Email</dt>
                      <dd>{email.trim()}</dd>
                    </div>
                    <div>
                      <dt>Developer</dt>
                      <dd>{developer === "yes" ? "Yes" : "No"}</dd>
                    </div>
                  </dl>

                  {submitError && (
                    <p role="alert" className="font-quick font-medium text-red">
                      {submitError}
                    </p>
                  )}
                </div>
              )}

              <div className="beta-footer">
                {current > 1 && (
                  <button
                    type="button"
                    className="beta-btn"
                    onClick={() => go(current - 1)}
                    disabled={isSubmitting}
                  >
                    Back
                  </button>
                )}

                <button
                  type="submit"
                  className="beta-btn beta-btn--solid ml-auto"
                  disabled={!canContinue || isSubmitting}
                >
                  {current === TOTAL
                    ? isSubmitting
                      ? "Sending..."
                      : "Join"
                    : "Continue"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* User declined */}
        {step === "thanks" && (
          <p className="font-quick text-xl text-dark">
            Thanks for stopping by. Maybe next time!
          </p>
        )}

        {/* Submission sent */}
        {step === "sent" && (
          <div className="max-w-xl">
            <p className="font-quick text-xl text-dark">
              Thanks for helping us test Ndimi!
            </p>
            <p className="mt-3 font-quick text-dark/70">
              Your signup request has been sent. We appreciate your interest in
              the beta.
            </p>
          </div>
        )}
      </div>

      <Wheels />
    </section>
  );
}
