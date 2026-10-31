import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";

gsap.registerPlugin(useGSAP, ScrollTrigger, ScrambleTextPlugin);

// Same values as --color-sulphur / --color-red (GSAP needs real colour values)
const SULPHUR = "#f5ecc2";
const SULPHUR_DIM = "rgba(245,236,194,0.3)";
const SULPHUR_CLEAR = "rgba(245,236,194,0)";
const RED = "#ff073a";
const RED_CLEAR = "rgba(255,7,58,0)";

const features = [
  {
    title: "Offline First",
    text: "No data, no signal, no problem, so Ndimi works wherever people actually are.",
    image: "./images/simu.png",
    alt: "Offline translation",
  },
  {
    title: "QVAC TranslatePsy-AfriSLM",
    text: "African languages, from one language straight to another.",
    image: "./images/wholeafrica.png",
    alt: "The TranslatePsy-AfriSLM model",
  },
  {
    title: "Low-End Friendly",
    text: "Built on a laptop with 8GB of RAM, so it runs on modest hardware and doesn't need a high-end machine.",
    image: "./images/laptop.png",
    alt: "Low-end device",
  },
];

// Grid placement per breakpoint. Everything is in cell units, 1-indexed:
// c = column, r = row, w = width in cells, h = height in cells.
// The trail is computed from these numbers, so move things here and it follows.
const LAYOUTS = {
  mobile: {
    cols: 6,
    rows: 19,
    items: [
      { pin: { c: 1, r: 3, w: 2, h: 2 }, note: { c: 3, r: 3, w: 4, h: 4 } },
      { pin: { c: 5, r: 9, w: 2, h: 2 }, note: { c: 1, r: 9, w: 4, h: 4 } },
      { pin: { c: 1, r: 15, w: 2, h: 2 }, note: { c: 3, r: 15, w: 4, h: 4 } },
    ],
  },
  desktop: {
    cols: 16,
    rows: 19,
    items: [
      { pin: { c: 2, r: 3, w: 3, h: 3 }, note: { c: 6, r: 3, w: 8, h: 4 } },
      { pin: { c: 13, r: 9, w: 3, h: 3 }, note: { c: 4, r: 9, w: 8, h: 4 } },
      { pin: { c: 2, r: 15, w: 3, h: 3 }, note: { c: 6, r: 15, w: 8, h: 4 } },
    ],
  },
};

const place = ({ c, r, w, h }) => ({
  gridColumn: `${c} / span ${w}`,
  gridRow: `${r} / span ${h}`,
});

// cell just above / just below the middle of a pin
const entryOf = (p) => ({ c: p.c + Math.floor(p.w / 2), r: p.r - 1 });
const exitOf = (p) => ({ c: p.c + Math.floor(p.w / 2), r: p.r + p.h });

// Cells that lead to `pin`: down from the previous pin, along a lane, then down
// into this pin. The first leg drops in from the top edge of the grid.
const trailTo = (prev, pin) => {
  const to = entryOf(pin);
  const cells = [];

  if (!prev) {
    for (let r = 1; r <= to.r; r++) cells.push({ c: to.c, r });
    return cells;
  }

  const from = exitOf(prev);
  const lane = to.r - 1;
  for (let r = from.r; r <= lane; r++) cells.push({ c: from.c, r });
  const step = Math.sign(to.c - from.c);
  for (let c = from.c + step; c !== to.c + step && step !== 0; c += step)
    cells.push({ c, r: lane });
  for (let r = lane + 1; r <= to.r; r++) cells.push({ c: to.c, r });
  return cells;
};

// Cells that connect the last pin down to the bottom row: straight down from
// just under the pin, stopping above the bottom row (the row itself floods red).
const dropFrom = (pin, rows) => {
  const from = exitOf(pin);
  const cells = [];
  for (let r = from.r; r <= rows - 1; r++) cells.push({ c: from.c, r });
  return cells;
};

const useIsDesktop = () => {
  const query = "(min-width: 64rem)";
  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== "undefined" && window.matchMedia(query).matches,
  );
  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = (e) => setIsDesktop(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return isDesktop;
};

const Tech = () => {
  const sectionRef = useRef(null);
  const isDesktop = useIsDesktop();
  const { cols, rows, items } = isDesktop ? LAYOUTS.desktop : LAYOUTS.mobile;

  useGSAP(
    () => {
      const root = sectionRef.current;
      const cells = gsap.utils.toArray(".tech-cell", root);
      const pins = gsap.utils.toArray(".tech-pin", root);
      const notes = gsap.utils.toArray(".tech-note", root);

      const at = ({ c, r }) => cells[(r - 1) * cols + (c - 1)];
      const legs = items.map((item, i) =>
        trailTo(i ? items[i - 1].pin : null, item.pin).map(at),
      );

      // finale pieces
      const lastPin = items[items.length - 1].pin;
      const fullTrail = [...new Set(legs.flat())]; // every trail cell, in path order
      const dropCells = dropFrom(lastPin, rows).map(at).filter(Boolean); // last image -> bottom row
      const bottomRow = cells.slice((rows - 1) * cols); // last grid row
      const rippleFrom = exitOf(lastPin).c - 1; // column the drop lands in

      const mm = gsap.matchMedia();

      // Reduced motion: final state, no animation.
      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set([...fullTrail, ...dropCells, ...bottomRow], {
          backgroundColor: RED,
        });
      });

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const titles = notes.map((n) => n.querySelector(".tech-title"));
        const texts = notes.map((n) => n.querySelector(".tech-text"));

        // start empty so the scramble decodes the copy in
        titles.forEach((t) => (t.textContent = ""));
        texts.forEach((t) => (t.textContent = ""));

        const STEP = 0.1; // time per trail cell

        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: root.querySelector(".tech-list"),
            start: "top 60%",
            end: "bottom 80%",
            scrub: 1,
          },
        });

        legs.forEach((leg, i) => {
          const img = pins[i].querySelector(".tech-img");
          const start = `leg${i}`;
          const stop = `stop${i}`;
          const travel = leg.length * STEP;

          tl.addLabel(start)
            // each cell on the way flashes...
            .fromTo(
              leg,
              { backgroundColor: SULPHUR_CLEAR },
              { backgroundColor: SULPHUR, duration: 0.12, stagger: STEP },
              start,
            )
            // ...then settles to a dim glow, so the whole path stays visible
            .fromTo(
              leg,
              { backgroundColor: SULPHUR },
              {
                backgroundColor: SULPHUR_DIM,
                duration: 0.4,
                stagger: STEP,
                immediateRender: false,
              },
              `${start}+=0.12`,
            )
            // anticipation: the image cell lights up as the trail approaches
            .fromTo(
              pins[i],
              { borderColor: SULPHUR_DIM },
              { borderColor: SULPHUR, duration: travel },
              start,
            )
            // the trail reaches the image: the stop
            .addLabel(stop, `${start}+=${travel}`)
            .fromTo(
              pins[i],
              { borderColor: SULPHUR },
              {
                borderColor: RED,
                duration: 0.2,
                yoyo: true,
                repeat: 1,
                immediateRender: false,
              },
              `${stop}+=0.05`,
            )
            .fromTo(
              img,
              { clipPath: "inset(0 0 100% 0)" },
              {
                clipPath: "inset(0 0 0% 0)",
                duration: 0.6,
                ease: "power2.out",
              },
              stop,
            )
            // the text cell fills with sulphur (it's clear until now, so the
            // trail is visible under it)
            .fromTo(
              notes[i],
              { borderColor: SULPHUR_DIM, backgroundColor: SULPHUR_CLEAR },
              { borderColor: SULPHUR, backgroundColor: SULPHUR, duration: 0.4 },
              stop,
            )
            // title decodes first...
            .to(
              titles[i],
              {
                duration: 0.7,
                scrambleText: {
                  text: features[i].title,
                  chars: "upperCase",
                  speed: 0.6,
                  tweenLength: false,
                },
              },
              `${stop}+=0.1`,
            )
            // ...then the feature text
            .to(
              texts[i],
              {
                duration: 1.2,
                scrambleText: {
                  text: features[i].text,
                  chars: "lowerCase",
                  speed: 0.6,
                  revealDelay: 0.3,
                  tweenLength: false,
                },
              },
              `${stop}+=0.4`,
            )
            // short pause before the next leg
            .to({}, { duration: 0.4 });
        });

        /* ---------- finale ----------
           1. the whole trail runs red, following the path
           2. red drops from the last image down to the bottom row
           3. the bottom row floods red, rippling out from where the drop lands */
        tl.addLabel("finale")
          .fromTo(
            fullTrail,
            { backgroundColor: SULPHUR_DIM },
            {
              backgroundColor: RED,
              duration: 0.3,
              stagger: STEP / 2,
              immediateRender: false,
            },
            "finale",
          )
          .fromTo(
            dropCells,
            { backgroundColor: RED_CLEAR },
            {
              backgroundColor: RED,
              duration: 0.3,
              stagger: STEP,
              immediateRender: false,
            },
            ">-0.1",
          )
          .fromTo(
            bottomRow,
            { backgroundColor: RED_CLEAR },
            {
              backgroundColor: RED,
              duration: 0.3,
              stagger: { each: 0.04, from: rippleFrom },
              immediateRender: false,
            },
            ">-0.1",
          );

        // on revert, put the real copy back
        return () => {
          titles.forEach((t, i) => (t.textContent = features[i].title));
          texts.forEach((t, i) => (t.textContent = features[i].text));
        };
      });

      return () => mm.revert();
    },
    { scope: sectionRef, dependencies: [isDesktop], revertOnUpdate: true },
  );

  return (
    <section id="tech" ref={sectionRef}>
      <div className="tech-list" style={{ "--cols": cols, "--rows": rows }}>
        {/* the background grid: every cell is a real element so it can light up */}
        <div className="tech-cells" aria-hidden="true">
          {Array.from({ length: cols * rows }, (_, i) => (
            <span key={i} className="tech-cell" />
          ))}
        </div>

        <h3 className="tech-heading">Our Technology</h3>

        {items.map(({ pin, note }, i) => {
          const { title, text, image, alt } = features[i];
          return (
            <React.Fragment key={title}>
              <figure className="tech-pin" style={place(pin)}>
                <img className="tech-img" src={image} alt={alt} />
              </figure>

              <article className="tech-note" style={place(note)}>
                <h4>
                  <span className="tech-tag">0{i + 1}</span>
                  <span className="tech-title" aria-hidden="true">
                    {title}
                  </span>
                </h4>
                <p className="tech-text" aria-hidden="true">
                  {text}
                </p>
                <span className="sr-only">{text}</span>
              </article>
            </React.Fragment>
          );
        })}
      </div>
    </section>
  );
};

export default Tech;
