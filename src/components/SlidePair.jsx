import React, { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(useGSAP, ScrollTrigger);

// direction: "ltr" = slides left -> right, "rtl" = slides right -> left
// The FIRST child is always the one on screen first.
const SlidePair = ({ children, direction = "ltr" }) => {
  const root = useRef(null);
  const ltr = direction === "ltr";
  const panels = React.Children.toArray(children);
  const n = panels.length;

  useGSAP(
    () => {
      const pin = root.current.querySelector(".slide-pin");
      const track = root.current.querySelector(".slide-track");
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // track is n * 100vw wide, so this shifts it by (n - 1) screens
        const shift = (-100 * (n - 1)) / n;

        gsap.fromTo(
          track,
          { xPercent: ltr ? shift : 0 },
          {
            xPercent: ltr ? 0 : shift,
            ease: "none",
            scrollTrigger: {
              trigger: pin,
              start: "top top",
              end: () => "+=" + (n - 1) * window.innerWidth,
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
          },
        );
      });

      // reduced motion: panels simply stack vertically (see CSS)
      return () => mm.revert();
    },
    { scope: root, dependencies: [direction, n], revertOnUpdate: true },
  );

  return (
    <div ref={root} className={`slide-pair ${ltr ? "slide-ltr" : "slide-rtl"}`}>
      <div className="slide-pin">
        <div className="slide-track" style={{ width: `${n * 100}vw` }}>
          {panels.map((child, i) => (
            <div key={i} className="slide-panel">
              {child}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SlidePair;
