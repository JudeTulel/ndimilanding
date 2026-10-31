import React from "react";
import Strands from "./Strands";

// Each slide controls its own text and its own visual.
// renderVisual receives { active } so heavy visuals can pause when off-screen.
// cta: true shows the Download / About buttons on that slide.
export const SLIDES = [
  {
    title: "NDIMI",
    subtitle: "Every Kenyan language, understood.",
    cta: true,
    renderVisual: ({ active }) => (
      <Strands
        colors={[
          "#d95b56",
          "#ba5046",
          "#ffa24c",
          "#ffe0b3",
          "#93f1ff",
          "#3569fa",
          "#193d9b",
        ]}
        count={3}
        speed={1}
        amplitude={1}
        waviness={1}
        energy={0.65}
        thickness={1}
        spread={1}
        glow={1}
        taper={1}
        intensity={1}
        saturation={1}
        hueShift={0}
        scale={1}
        glass
        glassSize={1}
        refraction={1}
        rim={1}
        dispersion={1}
        listening={false}
        interactive
        clickPulse
        intro
      />
    ),
  },
  {
    title: "23+    NATIONS",
    subtitle:
      "Built for the tongues of Kenya, with the rest of Africa to follow.",
    renderVisual: () => (
      <img
        src="/images/paperplane.png" // <- set this to your real image
        alt="Your Language"
        className="hero-sun size-24"
      />
    ),
  },
  {
    title: "NATIVE DEVICES",
    subtitle: "Runs on low-end devices, no connection needed.",
    renderVisual: () => (
      <img src="/images/twiga.png" alt="Works Offline" className="hero-sun" />
    ),
  },
];
