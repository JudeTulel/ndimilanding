import React, { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MorphSVGPlugin } from "gsap/MorphSVGPlugin";
import { navLinks, socials } from "../../constants";

gsap.registerPlugin(useGSAP, ScrollTrigger, MorphSVGPlugin);

// Dark shape whose top edge is the wave. Same point structure in both
// states so MorphSVG can tween between them cleanly.
// DOWN: the middle dips (the sulphur bulges into the footer)
// REST: flat, the elastic overshoot makes it spring above this line
const DOWN = "M0 100C0 100 464 196 1139 196S2278 100 2278 100V200H0V100Z";
const REST = "M0 100C0 100 464 100 1139 100S2278 100 2278 100V200H0V100Z";

const Footer = () => {
  const root = useRef(null);
  const wave = useRef(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.set(wave.current, { morphSVG: DOWN });

        const bounce = (self) => {
          // faster scroll = harder, wobblier bounce
          const v = gsap.utils.clamp(
            0,
            0.5,
            Math.abs(self.getVelocity()) / 10000,
          );

          gsap.fromTo(
            wave.current,
            { morphSVG: DOWN },
            {
              morphSVG: REST,
              duration: 2,
              ease: `elastic.out(${1 + v}, ${0.5 - v * 0.4})`,
              overwrite: true,
            },
          );
        };

        ScrollTrigger.create({
          trigger: root.current,
          start: "top bottom",
          onEnter: bounce,
          onEnterBack: bounce,
          // scrolled fully back up: re-arm the dip for the next entry
          onLeaveBack: () => gsap.set(wave.current, { morphSVG: DOWN }),
        });
      });

      // reduced motion: just the flat edge, no bounce
      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(wave.current, { morphSVG: REST });
      });

      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <footer id="footer" ref={root}>
      {/* the bouncy edge, sits on top of the footer */}
      <svg
        className="footer-wave"
        viewBox="0 0 2278 200"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path ref={wave} d={REST} />
      </svg>

      <div className="footer-inner">
        {/* link columns */}
        <div className="footer-cols">
          <div>
            <h4>Explore</h4>
            <ul>
              {navLinks.map((link) => (
                <li key={link.id}>
                  <a href={`#${link.id}`}>{link.title}</a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4>Contact</h4>
            <ul>
              <li className="flex flex-col gap-3">
                <a href="mailto:jude@ystudios.co.ke">jude@ystudios.co.ke</a>
                <a href="mailto:ryan@ystudios.co.ke">ryan@ystudios.co.ke</a>
              </li>
            </ul>
          </div>

          <div>
            <h4>Made by</h4>
            <ul>
              <li>
                <a
                  href="https://ystudios.co.ke/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Ystudios
                </a>
              </li>
            </ul>
          </div>
          <div className="footer-socials">
            {socials.map((social) => (
              <a
                key={social.name}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.name}
              >
                <img src={social.icon} alt="" className="size-12" />
              </a>
            ))}
          </div>
          <p className="footer-copy">
            &copy; {new Date().getFullYear()} Ystudios. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
