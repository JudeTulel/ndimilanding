"use client";

import React, { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

const COUNT = 14; // keep even so the loop is seamless
const WHEELS = Array.from({ length: COUNT }, (_, i) => i);

const Wheels = () => {
  const scope = useRef(null);
  const strip = useRef(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      // roll up by exactly two wheels (one full pattern), then repeat
      gsap.to(strip.current, {
        yPercent: -(2 / COUNT) * 100,
        duration: 3,
        ease: "none",
        repeat: -1,
      });

      gsap.to(".wheel-disc", {
        rotate: 360,
        transformOrigin: "50% 50%",
        duration: 3,
        ease: "none",
        repeat: -1,
      });
    },
    { scope },
  );

  return (
    <aside
      ref={scope}
      aria-hidden="true"
      className="relative hidden w-[28vw] max-w-md shrink-0 overflow-hidden bg-sulphur lg:block"
    >
      <div ref={strip} className="absolute inset-x-0 top-0">
        {WHEELS.map((i) => (
          <svg
            key={i}
            viewBox="0 0 100 100"
            className="block aspect-square w-full"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g className="wheel-disc">
              <circle cx="50" cy="50" r="50" fill="#111314" />
              <path
                fill="#111314"
                d={
                  i % 2 === 0
                    ? "M100 50c0 27.61-22.39 50-50 50V0c27.61 0 50 22.39 50 50Z"
                    : "M0 50c0-27.61 22.39-50 50-50v100C22.39 100 0 77.61 0 50Z"
                }
              />
            </g>
          </svg>
        ))}
      </div>
    </aside>
  );
};

export default Wheels;
