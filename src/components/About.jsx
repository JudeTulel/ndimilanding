import React, { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import OptionWheel from "./OptionWheel";



const DARK = "#111314";
const SULPHUR = "#f5ecc2";

const points = [
  {
    label: "Offline",
    text: "Translate anywhere, with or without internet.",
  },
  {
    label: "Direct",
    text: "Language to language across 19 African languages, with no detour in between.",
  },
  {
    label: "Lightweight",
    text: "Runs on low-end devices, including an 8GB RAM laptop.",
  },
  {
    label: "Private",
    text: "Translation happens on your device, so your words stay with you.",
  },
  {
    label: "Local",
    text: "Starting with Kenya's languages, with room to grow across Africa.",
  },
];

const About = () => {
  const sectionRef = useRef(null);
  const [active, setActive] = useState(0);





  return (
    <section id="about" ref={sectionRef}>
      <div className="about-inner">
        <h3>About Ndimi</h3>

        <div className="about-body">
          <div className="about-wheel">
            <OptionWheel
              items={points.map((p) => p.label)}
              side="left"
              fontSize={3}
              inset={48}
              activeColor="#ff073a"
              onChange={(index) => setActive(index)}
              className="h-full w-full"
            />
          </div>

          <p className="about-text">{points[active].text}</p>
        </div>
      </div>
    </section>
  );
};

export default About;
