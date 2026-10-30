"use client";
/* AM CLINIC TORCY VISAGE — Radiofréquence 69€ — PAS MARSEILLE 6 */

import { FormEvent, useEffect, useMemo, useState } from "react";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    _fbq?: unknown;
  }
}

const LEAD_WEBHOOK_URL = process.env.NEXT_PUBLIC_LEAD_WEBHOOK_URL;
const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;
const CENTER_NAME = "AM Clinic";
const CITY_NAME = "Torcy";

const zones = ["Visage", "Cou", "Décolleté", "Plusieurs zones"];

const technologies = [
  {
    title: "Radiofréquence",
    text: "Stimule le collagène pour un effet liftant visible dès la séance découverte.",
  },
  {
    title: "Diagnostic complet visage",
    text: "Analyse de votre peau pour cibler rides, relâchement, pores et manque d’éclat.",
  },
  {
    title: "Séance de 20 minutes",
    text: "Un protocole court, précis, pour tester la radiofréquence sans engagement long.",
  },
  {
    title: "Offre limitée",
    text: "Places limitées à Torcy. Diagnostic + séance découverte à 69€.",
  },
];

const faq = [
  {
    question: "La séance découverte à 69€ comprend quoi ?",
    answer:
      "Un diagnostic complet visage, puis 20 minutes de radiofréquence pour tester l’effet liftant sur votre peau.",
  },
  {
    question: "Combien de temps dure la séance ?",
    answer: "20 minutes de radiofréquence, après le diagnostic visage.",
  },
  {
    question: "Les résultats se voient-ils dès la 1re séance ?",
    answer:
      "Oui. La radiofréquence est conçue pour un effet liftant et plus de fermeté, visibles dès la séance découverte.",
  },
  {
    question: "Quelles zones peut-on traiter ?",
    answer: "Visage, cou et décolleté. Vous pouvez cocher une ou plusieurs zones.",
  },
  {
    question: "L’offre est-elle limitée ?",
    answer:
      "Oui. Places limitées. Radiofréquence séance découverte 69€ + diagnostic complet visage, le temps de l’opération.",
  },
];

const beforeAfter = [
  {
    area: "Rides",
    result: "Traits lissés, peau plus reposée",
    src: "/lift4-rides.png",
  },
  {
    area: "Texture",
    result: "Grain de peau plus lisse, plus d’éclat",
    src: "/lift4-texture.png",
  },
  {
    area: "Regard",
    result: "Contour de l’œil plus net",
    src: "/lift4-regard.png",
  },
  {
    area: "Ovale",
    result: "Ridules atténuées, peau plus ferme",
    src: "/lift4-ovale.png",
  },
];

function track(eventName: string, params?: Record<string, unknown>) {
  window.fbq?.("track", eventName, params);
}

function postJson(url: string, body: unknown) {
  void fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    keepalive: true,
  }).catch(() => {});
}

function getTrackingParams() {
  if (typeof window === "undefined") return {};
  const params = new URLSearchParams(window.location.search);
  return {
    utm_source: params.get("utm_source") ?? "",
    utm_medium: params.get("utm_medium") ?? "",
    utm_campaign: params.get("utm_campaign") ?? "",
    utm_content: params.get("utm_content") ?? "",
    utm_term: params.get("utm_term") ?? "",
    fbclid: params.get("fbclid") ?? "",
    meta_campaign_id: params.get("campaign_id") ?? "",
    meta_adset_id: params.get("adset_id") ?? "",
    meta_ad_id: params.get("ad_id") ?? "",
  };
}

export default function Home() {
  const [selectedZones, setSelectedZones] = useState<string[]>([]);
  const [step, setStep] = useState<"intro" | "form" | "thanks">("intro");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [messageOptIn, setMessageOptIn] = useState("oui");
  const trackingParams = useMemo(getTrackingParams, []);

  useEffect(() => {
    if (!META_PIXEL_ID || typeof window === "undefined" || window.fbq) return;

    const fbq = function (...args: unknown[]) {
      (
        fbq as unknown as {
          callMethod?: (...items: unknown[]) => void;
          queue: unknown[];
        }
      ).callMethod
        ? (
            fbq as unknown as { callMethod: (...items: unknown[]) => void }
          ).callMethod(...args)
        : (fbq as unknown as { queue: unknown[] }).queue.push(args);
    } as Window["fbq"] & { queue: unknown[]; loaded: boolean; version: string };

    fbq.queue = [];
    fbq.loaded = true;
    fbq.version = "2.0";
    window.fbq = fbq;
    window._fbq = fbq;

    const script = document.createElement("script");
    script.async = true;
    script.src = "https://connect.facebook.net/en_US/fbevents.js";
    document.head.appendChild(script);
    window.fbq("init", META_PIXEL_ID);
    track("PageView");
    track("ViewContent", {
      center: CITY_NAME,
      content_name: "Tunnel radiofréquence AM Clinic",
    });
  }, []);

  function toggleZone(zone: string) {
    setSelectedZones((current) =>
      current.includes(zone)
        ? current.filter((item) => item !== zone)
        : [...current, zone],
    );
  }

  function openForm() {
    if (selectedZones.length === 0) return;
    track("CustomizeProduct", { center: CITY_NAME, zones: selectedZones });
    setStep("form");
  }

  async function submitLead(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const payload = {
      full_name: String(data.get("full_name") ?? ""),
      phone: String(data.get("phone") ?? ""),
      email: String(data.get("email") ?? ""),
      message_opt_in: messageOptIn,
      zones: selectedZones,
      center: CITY_NAME,
      center_display_name: `${CENTER_NAME} ${CITY_NAME}`,
      offer: "Radiofréquence séance découverte 69€ (20 min) + diagnostic complet visage",
      page: `Radiofréquence ${CENTER_NAME} ${CITY_NAME}`,
      source: "am-clinic-torcy",
      submitted_at: new Date().toISOString(),
      page_url: typeof window !== "undefined" ? window.location.href : "",
      ...trackingParams,
    };

    setIsSubmitting(true);
    try {
      const nameParts = payload.full_name.trim().split(/\s+/).filter(Boolean);
      const prenom = nameParts[0] ?? "";
      const nom = nameParts.slice(1).join(" ");
      if (LEAD_WEBHOOK_URL) {
        postJson(LEAD_WEBHOOK_URL, payload);
      }
      postJson(
        "https://www.bookeai.fr/api/leads?center=am-clinic-torcy&source=landing",
        {
          first_name: prenom,
          last_name: nom,
          email: payload.email,
          phone: payload.phone,
          offre: "Visage 69",
          axe: "Visage",
          commentaire: `Visage 69 — radiofréquence 20 min + diagnostic visage — zones : ${selectedZones.join(", ") || "non précisé"} | Contact message : ${messageOptIn}`,
        },
      );
      track("Lead", {
        content_name: "Radiofréquence séance découverte 69€",
        center: CITY_NAME,
        zones: selectedZones.join(", "),
      });
      setStep("thanks");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="site-shell">
      <header className="site-header" aria-label="AM Clinic">
        <img
          alt="AM Esthetic Clinic"
          className="brand-logo"
          src="/am-clinic-logo.png"
        />
      </header>

      <section className="hero-section" aria-labelledby="page-title">
        <div className="hero-copy">
          <p className="eyebrow">Offre à durée limitée · Torcy</p>
          <h1 id="page-title">Radiofréquence séance découverte 69€</h1>
          <p className="hero-subtitle">
            20 min de séance + diagnostic complet visage
          </p>
        </div>

        <div
          className="before-after-carousel"
          aria-label="Avant après radiofréquence"
        >
          <div className="before-after-track">
            {[...beforeAfter, ...beforeAfter].map((item, index) => (
              <article
                className="before-after-card"
                key={`${item.area}-${index}`}
              >
                <div className="photo-pair">
                  <img
                    alt={`Avant après radiofréquence - ${item.area}`}
                    decoding="async"
                    fetchPriority={index === 0 ? "high" : "auto"}
                    height={465}
                    loading={index === 0 ? "eager" : "lazy"}
                    src={item.src}
                    width={720}
                  />
                  <span className="before-badge">Avant</span>
                  <span className="after-badge">Après</span>
                </div>
                <strong>{item.area}</strong>
                <p>{item.result}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {step === "intro" && (
        <section className="quiz-panel" aria-labelledby="zone-question">
          <div>
            <p className="offer-ready">
              Votre séance découverte à 69€ est presque prête
            </p>
            <p className="step-label">
              2 étapes pour réserver · places limitées
            </p>
            <h2 id="zone-question">Quelle(s) zone(s) souhaitez-vous traiter ?</h2>
            <p className="helper-text">
              Visage, cou ou décolleté. Cochez une ou plusieurs zones.
            </p>
          </div>

          <div className="zone-grid">
            {zones.map((zone) => {
              const isSelected = selectedZones.includes(zone);
              return (
                <button
                  aria-pressed={isSelected}
                  className={`zone-option ${isSelected ? "selected" : ""}`}
                  key={zone}
                  onClick={() => toggleZone(zone)}
                  type="button"
                >
                  <span className="checkmark" aria-hidden="true">
                    {isSelected ? "✓" : ""}
                  </span>
                  {zone}
                </button>
              );
            })}
          </div>

          <button
            className="primary-action"
            disabled={selectedZones.length === 0}
            onClick={openForm}
            type="button"
          >
            Profitez de l&apos;offre
          </button>
          <p className="offer-limit">Quantité limitée à ce tarif</p>
        </section>
      )}

      {step === "form" && (
        <section className="form-panel" aria-labelledby="form-title">
          <button
            className="back-button"
            onClick={() => setStep("intro")}
            type="button"
          >
            Retour
          </button>
          <p className="offer-ready">Dernière étape pour la séance à 69€</p>
          <p className="step-label">On vous rappelle pour réserver</p>
          <h2 id="form-title">
            Vos coordonnées pour la radiofréquence découverte + diagnostic
            visage.
          </h2>

          <form className="lead-form" onSubmit={submitLead}>
            <label>
              Prénom et nom
              <input name="full_name" placeholder="Votre nom complet" required />
            </label>
            <label>
              Téléphone
              <input
                inputMode="tel"
                name="phone"
                placeholder="06 00 00 00 00"
                required
                type="tel"
              />
            </label>
            <label>
              Email (optionnel)
              <input
                inputMode="email"
                name="email"
                placeholder="vous@email.com"
                type="email"
              />
            </label>

            <fieldset className="message-consent">
              <legend>
                Pouvons-nous vous contacter par message pour valider votre
                offre ?
              </legend>
              <label>
                <input
                  checked={messageOptIn === "oui"}
                  name="message_opt_in"
                  onChange={() => setMessageOptIn("oui")}
                  type="radio"
                  value="oui"
                />
                Oui
              </label>
              <label>
                <input
                  checked={messageOptIn === "non"}
                  name="message_opt_in"
                  onChange={() => setMessageOptIn("non")}
                  type="radio"
                  value="non"
                />
                Non
              </label>
            </fieldset>

            <button
              className="primary-action"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? "Envoi en cours..." : "Profitez de l'offre"}
            </button>
            <p className="offer-limit">Quantité limitée à ce tarif</p>
          </form>
        </section>
      )}

      {step === "thanks" && (
        <section className="thanks-panel" aria-labelledby="thanks-title">
          <p className="step-label">Demande reçue</p>
          <h2 id="thanks-title">Merci, votre demande est bien prise en compte.</h2>
          <p>
            L&apos;équipe AM Clinic à Torcy vous rappelle rapidement pour
            confirmer votre séance découverte radiofréquence de 20 min +
            diagnostic complet visage à 69€.
          </p>
        </section>
      )}

      <section className="proof-section" aria-labelledby="offer-title">
        <h2 id="offer-title">Radiofréquence + diagnostic visage</h2>
        <p className="idiag-text">
          Séance découverte de 20 minutes, associée à un diagnostic complet
          du visage, pour un protocole adapté à votre peau.
        </p>
        <ul className="idiag-points">
          <li>Rides, ridules, relâchement cutané</li>
          <li>Pores dilatés, manque de fermeté</li>
          <li>Peau fatiguée, manque d&apos;éclat</li>
        </ul>
        <div className="tech-grid">
          {technologies.map((item) => (
            <article className="tech-card" key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="faq-section" aria-labelledby="faq-title">
        <h2 id="faq-title">Questions fréquentes</h2>
        <div className="faq-list">
          {faq.map((item) => (
            <details key={item.question}>
              <summary>{item.question}</summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
      </section>
    </main>
  );
}
