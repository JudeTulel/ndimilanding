import React, { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { SplitText, Observer, ScrollTrigger } from "gsap/all";
import { SLIDES } from "./HeroSlides";
import ShimmerBtn from "./ShimmerBtn";

gsap.registerPlugin(useGSAP, SplitText, Observer, ScrollTrigger);


const Hero = () => {
  const root = useRef(null);
  const [active, setActive] = useState(0);

  const goAbout = () =>
    document.getElementById("about")?.scrollIntoView({ behavior: "smooth" });
  const goForm = () =>
    document.getElementById("beta")?.scrollIntoView({ behavior: "smooth" });

  useGSAP(
    () => {
      const slides = gsap.utils.toArray(".slide");
      const outers = gsap.utils.toArray(".outer");
      const inners = gsap.utils.toArray(".inner");
      const bgs = gsap.utils.toArray(".bg");
      const last = slides.length - 1;

      const titleSplits = gsap.utils.toArray(".slide-title").map(
        (el) =>
          new SplitText(el, {
            type: "chars,words,lines",
            linesClass: "clip-text",
          }),
      );
      const subtitleSplits = gsap.utils
        .toArray(".slide-subtitle")
        .map((el) => new SplitText(el, { type: "lines" }));

      gsap.set(slides, { autoAlpha: 0 });
      gsap.set(outers, { yPercent: 100 });
      gsap.set(inners, { yPercent: -100 });

      let currentIndex = -1;
      let animating = false;

      const gotoSection = (index, direction) => {
        animating = true;
        setActive(index); // lets heavy visuals pause when their slide isn't showing
        const dFactor = direction === -1 ? -1 : 1;

        const tl = gsap.timeline({
          defaults: { duration: 1.25, ease: "power1.inOut" },
          onComplete: () => (animating = false),
        });

        if (currentIndex >= 0) {
          gsap.set(slides[currentIndex], { zIndex: 0 });
          tl.to(bgs[currentIndex], { yPercent: -15 * dFactor }).set(
            slides[currentIndex],
            { autoAlpha: 0 },
          );
        }

        gsap.set(slides[index], { autoAlpha: 1, zIndex: 1 });

        tl.fromTo(
          [outers[index], inners[index]],
          { yPercent: (i) => (i ? -100 * dFactor : 100 * dFactor) },
          { yPercent: 0 },
          0,
        )
          .fromTo(bgs[index], { yPercent: 15 * dFactor }, { yPercent: 0 }, 0)
          .fromTo(
            titleSplits[index].chars,
            { autoAlpha: 0, yPercent: 150 * dFactor },
            {
              autoAlpha: 1,
              yPercent: 0,
              duration: 1,
              ease: "power2",
              stagger: { each: 0.02, from: "random" },
            },
            0.2,
          )
          .fromTo(
            subtitleSplits[index].lines,
            { autoAlpha: 0, yPercent: 100 },
            {
              autoAlpha: 1,
              yPercent: 0,
              duration: 1,
              ease: "expo.out",
              stagger: 0.06,
            },
            0.6,
          );

        // Download / About buttons fade up on the first slide
        if (index === 0) {
          tl.fromTo(
            ".hero-cta",
            { autoAlpha: 0, y: 24 },
            { autoAlpha: 1, y: 0, duration: 0.8, ease: "power2.out" },
            1,
          );
        }

        currentIndex = index;
      };

      const observer = Observer.create({
        type: "wheel,touch,pointer",
        ignore: ".hero-cta", // keep button clicks away from the slider
        wheelSpeed: -1,
        tolerance: 10,
        preventDefault: true,
        onDown: () => {
          if (!animating && currentIndex > 0) gotoSection(currentIndex - 1, -1);
        },
        onUp: () => {
          if (animating) return;
          if (currentIndex < last) gotoSection(currentIndex + 1, 1);
          else observer.disable(); // last slide: hand scrolling back to the page
        },
      });

      ScrollTrigger.create({
        trigger: root.current,
        start: "top top",
        end: "+=1",
        onEnterBack: () => observer.enable(),
      });

      gsap
        .timeline({
          scrollTrigger: {
            trigger: "#hero",
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        })
        .to(".hero-sun", { y: -100, rotation: 360, ease: "none" }, 0);

      gotoSection(0, 1);
    },
    { scope: root },
  );

  return (
    <section id="hero" ref={root}>
      {SLIDES.map(({ title, subtitle, cta, renderVisual }, i) => {
        const Heading = i === 0 ? "h1" : "h2";
        return (
          <article className="slide" key={title}>
            <div className="outer">
              <div className="inner">
                <div className="bg">
                  <div className="slide-text">
                    <Heading className="slide-title font-bungee text-red">
                      {title}
                    </Heading>
                    <p className="slide-subtitle">{subtitle}</p>

                    {cta && (
                      <div className="hero-cta">
                        <ShimmerBtn href="#beta">Join Waitlist</ShimmerBtn>
                      </div>
                    )}{cta && (
                      <div className="hero-cta">
                        <ShimmerBtn href="https://github.com/JudeTulel/ndimi/releases/download/v0.0.1/app-release.apk">Download APK</ShimmerBtn>
                      </div>
                    )}{cta && (
                      <div className="hero-cta">
                        <ShimmerBtn href="https://github.com/JudeTulel/ndimi-desktop/releases/download/v0.0.1/Ndimi.Desktop-0.1.0.Setup.exe">Download PC Companion</ShimmerBtn>
                      </div>
                    )}
                  </div>

                  <div className="slide-visual">
                    {renderVisual({ active: active === i })}
                  </div>
                </div>
              </div>
            </div>
          </article>
        );
      })}
    </section>
  );
};

export default Hero;
