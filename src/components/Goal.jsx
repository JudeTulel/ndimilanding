import React, { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(useGSAP, ScrollTrigger, DrawSVGPlugin, SplitText);

const WHITE = "#f5ecc2";
const BLACK = "#111314";
const RED = "#ff073a";
const PURPLE = "#9b5de5";

/* ---------- TEAM LINKS: swap in the real handles ---------- */
const YSTUDIOS_URL = "https://ystudios.co.ke";
const JUDE_TWITTER = "https://x.com/yegojude";
const RYAN_TWITTER = "https://x.com/drivinred";

const EYE =
  "M95.86 50S75.33 79.47 50 79.47 4.14 50 4.14 50 24.67 20.53 50 20.53 95.86 50 95.86 50Z";

/* ---------- ART (from the GSAP Grid pen), no background fills ---------- */

const EyeArt = () => (
  <svg viewBox="0 0 100 100" aria-hidden="true">
    <defs>
      <clipPath id="goal-eye-clip">
        <path d={EYE} />
      </clipPath>
    </defs>
    <g className="eye">
      <path d={EYE} fill={WHITE} />
      <g clipPath="url(#goal-eye-clip)">
        <circle className="eye-pupil" cx="50" cy="50" r="20.91" fill={BLACK} />
      </g>
    </g>
  </svg>
);

const SPOKES = 20;

const SpokesArt = () => (
  <svg viewBox="0 0 100 100" aria-hidden="true">
    {Array.from({ length: SPOKES }).map((_, i) => (
      <path
        key={i}
        className="spoke"
        d="M50 9.95v80.32"
        fill="none"
        stroke={BLACK}
        strokeWidth="1"
        strokeMiterlimit="10"
        strokeLinecap="round"
      />
    ))}
  </svg>
);

const HalfCirclesArt = () => (
  <svg viewBox="0 0 100 100" aria-hidden="true">
    <defs>
      <clipPath id="goal-half-clip">
        <path d="M0 0h100v100H0z" />
      </clipPath>
    </defs>
    <g clipPath="url(#goal-half-clip)">
      <path
        className="half-circle hc-1"
        fill={WHITE}
        d="M0 50C0 22.39 22.39 0 50 0v100C22.39 100 0 77.61 0 50Z"
      />
      <path
        className="half-circle hc-2"
        fill={RED}
        d="M50 50c0-27.61 22.39-50 50-50v100c-27.61 0-50-22.39-50-50Z"
      />
      <path
        className="half-circle hc-3"
        fill={WHITE}
        d="M100 50c0-27.61 22.39-50 50-50v100c-27.61 0-50-22.39-50-50Z"
      />
      <path
        className="half-circle hc-4"
        fill={RED}
        d="M150 50c0-27.61 22.39-50 50-50v100c-27.61 0-50-22.39-50-50Z"
      />
    </g>
  </svg>
);

/* ---------- TEAM COPY (rich, so SplitText keeps the nested tags/links) ---------- */

const TeamText = () => (
  <>
    A duo from{" "}
    <a
      className="team-link ystudios"
      href={YSTUDIOS_URL}
      target="_blank"
      rel="noopener noreferrer"
    >
      YStudios
    </a>
    .{" "}
    <a
      className="team-link person text-3xl text-red"
      data-role="Software Engineer x AI researcher"
      href={JUDE_TWITTER}
      target="_blank"
      rel="noopener noreferrer"
    >
      Jude
    </a>{" "}
    has mastered the <em className="blurry">dark arts</em> of artificial
    intelligence.{" "}
    <a
      className="team-link person text-red"
      data-role="Game developer x Frontend design"
      href={RYAN_TWITTER}
      target="_blank"
      rel="noopener noreferrer"
    >
      Ryan
    </a>{" "}
    does math in animations.
  </>
);

// Each panel sets its own look:
//   bg   panel background
//   ink  body text colour
//   tone colour of the big title written in the background
const roadmap = [
  {
    title: "Vision",
    Art: EyeArt,
    bg: RED,
    ink: BLACK,
    tone: "rgba(17,19,20,0.16)",
    body: "Ndimi connects Kenya's local languages directly to each other. Keeps every language at the centre rather than treating it as a detour through English.",
  },
  {
    title: "Mission",
    Art: HalfCirclesArt,
    bg: BLACK,
    ink: WHITE,
    tone: "rgba(245,236,194,0.1)",
    body: "A Kenya where every language is heard, understood and valued, and where no one has to switch languages to be part of the conversation",
  },
  {
    title: "Team",
    Art: SpokesArt,
    bg: WHITE,
    ink: BLACK,
    tone: "rgba(17,19,20,0.16)",
    body: <TeamText />,
    isTeam: true,
  },
];

const Goal = () => {
  const sectionRef = useRef(null);

  useGSAP(
    () => {
      const root = sectionRef.current;
      const pin = root.querySelector(".goal-pin");
      const track = root.querySelector(".goal-track");
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const n = roadmap.length;

        /* ---- horizontal slide, pinned, snapping panel by panel ---- */
        const slide = gsap.to(track, {
          x: () => -(track.scrollWidth - window.innerWidth),
          ease: "none",
          scrollTrigger: {
            trigger: pin,
            start: "top top",
            end: () => "+=" + (track.scrollWidth - window.innerWidth),
            pin: true,
            scrub: 1,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            snap: {
              snapTo: 1 / (n - 1),
              duration: { min: 0.2, max: 0.4 },
              delay: 0,
              ease: "power1.inOut",
            },
          },
        });

        /* ---- Vision: eye follows the cursor ---- */
        const eye = root.querySelector(".eye");
        const pupil = root.querySelector(".eye-pupil");
        const eyeSvg = eye.ownerSVGElement;

        const onMove = (e) => {
          const r = eyeSvg.getBoundingClientRect();
          const x = e.clientX - (r.left + r.width / 2);
          const y = e.clientY - (r.top + r.height / 2);
          const px = (x / (window.innerWidth / 2)) * 20;
          const py = (y / (window.innerHeight / 2)) * 20;

          gsap.to(pupil, {
            xPercent: px,
            yPercent: py,
            duration: 0.2,
            overwrite: "auto",
          });
          gsap.to(eye, {
            xPercent: px * 0.4,
            yPercent: py * 0.4,
            duration: 0.2,
            overwrite: "auto",
          });
        };
        window.addEventListener("mousemove", onMove);

        /* ---- Mission: sliding half circles ---- */
        const hcEase = "power2.inOut";
        const hcScaleOut = {
          scale: 0,
          transformOrigin: "0% 50%",
          ease: hcEase,
        };
        gsap
          .timeline({ repeat: -1 })
          .timeScale(0.5)
          .to(".hc-1", { ...hcScaleOut })
          .to(".hc-2", { x: -50, ease: hcEase }, "<")
          .to(".hc-3", { x: -50, transformOrigin: "0% 50%", ease: hcEase }, "<")
          .to(".hc-4", { x: -50, ease: hcEase }, "<")
          .to(".hc-2", { ...hcScaleOut })
          .to(".hc-3", { x: -100, ease: hcEase }, "<")
          .to(".hc-4", { x: -100, ease: hcEase }, "<");

        /* ---- Team: spinning spokes ---- */
        const spokes = gsap.utils.toArray(".spoke", root);
        spokes.forEach((line, i) => {
          gsap.set(line, {
            drawSVG: "100% 0%",
            rotate: (i * 180) / SPOKES,
            transformOrigin: "center",
          });
        });
        gsap.to(spokes, {
          rotate: "+=360",
          ease: "power3.inOut",
          repeat: -1,
          stagger: 0.1,
          duration: 4,
        });
        gsap.to(spokes, {
          drawSVG: "100% 50%",
          duration: 2,
          ease: "power3.inOut",
          repeat: -1,
          yoyo: true,
          stagger: 0.1,
        });

        /* ---- Team: SplitText reveal (nested tags + links preserved) ---- */
        const teamPanel = root.querySelector(".panel-team");
        const teamText = root.querySelector(".team-text");
        let split;

        if (teamPanel && teamText) {
          gsap.set(teamText, { perspective: 400 });

          split = SplitText.create(teamText, {
            type: "chars,words",
            charsClass: "char",
            wordsClass: "word",
            autoSplit: true, // re-splits on resize / font load
            onSplit: (self) =>
              gsap.from(self.chars, {
                duration: 0.9,
                autoAlpha: 0,
                scale: 3,
                rotationX: -180,
                transformOrigin: "100% 50%",
                ease: "back",
                stagger: 0.015,
                scrollTrigger: {
                  trigger: teamPanel,
                  containerAnimation: slide, // trigger inside the horizontal scroll
                  start: "left 65%",
                  toggleActions: "play none none none",
                },
              }),
          });
        }

        /* ---- Team: sine-wave hover on the people (Ryan would approve) ---- */
        const people = gsap.utils.toArray(".person", root);
        const cleanups = people.map((el) => {
          const wave = () => {
            const chars = el.querySelectorAll(".char");
            gsap.fromTo(
              chars,
              { y: 0 },
              {
                y: (i) => Math.sin(i * 0.9) * -10,
                duration: 0.25,
                ease: "sine.inOut",
                yoyo: true,
                repeat: 1,
                stagger: 0.04,
                overwrite: "auto",
              },
            );
          };
          el.addEventListener("mouseenter", wave);
          el.addEventListener("focus", wave);
          return () => {
            el.removeEventListener("mouseenter", wave);
            el.removeEventListener("focus", wave);
          };
        });

        return () => {
          window.removeEventListener("mousemove", onMove);
          cleanups.forEach((fn) => fn());
          split && split.revert();
        };
      });

      // Reduced motion: panels simply stack vertically (see CSS), nothing moves.
      return () => mm.revert();
    },
    { scope: sectionRef },
  );

  return (
    <section id="goal" ref={sectionRef}>
      <div className="goal-pin">
        <div className="goal-track">
          {roadmap.map(({ title, body, Art, bg, ink, tone, isTeam }) => (
            <article
              key={title}
              className={`panel${isTeam ? " panel-team" : ""}`}
              style={{
                "--panel-bg": bg,
                "--panel-ink": ink,
                "--panel-tone": tone,
              }}
            >
              {/* big horizontal title, written in the background */}
              <h2 className="panel-title">{title}</h2>

              <div className="thumb">
                <Art />
              </div>

              <p className={`text-3xl${isTeam ? " team-text" : ""}`}>{body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Goal;
