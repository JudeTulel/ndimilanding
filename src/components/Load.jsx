import { useEffect, useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";

gsap.registerPlugin(DrawSVGPlugin);

/* "ndimi" written as single hand-drawn strokes (viewBox 0 0 380 160).
   Order matters: n, d, i, m, i. The two dots are drawn separately so
   they can drop in and bounce onto the stems. */
const LETTERS = [
    "M22 62 V140 M22 92 C28 66 48 56 66 62 C82 68 84 84 84 100 V140",
    "M150 98 C150 72 126 58 108 70 C90 82 90 120 110 130 C128 138 150 124 150 100 M150 12 V140",
    "M185 62 V140",
    "M215 62 V140 M215 90 C220 64 246 56 258 68 C264 76 264 90 264 100 V140 M264 90 C270 64 296 56 308 68 C314 76 314 90 314 100 V140",
    "M345 62 V140",
];
const DOTS = [
    [185, 30],
    [345, 30],
];

/* Simplified outline of Africa (viewBox 0 0 222 226) + Madagascar */
const MAINLAND =
    "M36 7 L84 2 L99 17 L114 18 L120 15 L129 19 L150 20 L152 24 L159 42 L165 54 L170 60 L177 72 L184 77 L208 79 L201 96 L192 108 L180 117 L174 123 L171 132 L174 144 L176 159 L159 174 L159 186 L152 192 L152 200 L144 207 L135 215 L120 217 L110 217 L105 204 L98 183 L90 165 L95 150 L90 132 L81 117 L83 103 L72 101 L66 95 L48 99 L32 101 L21 94 L14 86 L5 77 L2 70 L5 57 L3 51 L15 32 L24 26 L26 18 L35 12 Z";
const MADAGASCAR =
    "M202 150 L205 161 L203 168 L197 188 L189 191 L185 180 L187 165 L192 161 L200 155 Z";

/* tone = "red" (offset shadow, behind) or "ink" (front) */
const WordLayer = ({ tone }) => (
    <g transform={tone === "red" ? "translate(5 5)" : undefined}>
        {LETTERS.map((d, i) => (
            <path key={i} d={d} className={`ltr ${tone}`} />
        ))}
        {DOTS.map(([cx, cy], i) => (
            <circle key={i} cx={cx} cy={cy} r="9" className={`dot ${tone}`} />
        ))}
    </g>
);

const MapLayer = ({ tone }) => (
    <g transform={tone === "red" ? "translate(5 5)" : undefined}>
        <path d={MAINLAND} className={`map ${tone}`} />
        <path d={MADAGASCAR} className={`map ${tone}`} />
    </g>
);

/**
 * <Load ready={bool} onComplete={fn} />
 * Plays the intro once, then wipes up when `ready` is true.
 * Unmount it in onComplete.
 */
const Load = ({ ready = true, onComplete }) => {
    const root = useRef(null);
    const bar = useRef(null);
    const state = useRef({ introDone: false, ready, exited: false });
    const exit = useRef(() => {});

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            gsap.set(".load-svg", { autoAlpha: 1 });
            gsap.set(".ltr, .map", { drawSVG: "0%" });
            gsap.set(".map", { fillOpacity: 0 });
            gsap.set(".dot", { y: -160, autoAlpha: 0 });
            gsap.set(".kenya", { scale: 0, transformOrigin: "50% 50%" });
            gsap.set(".kenya-ring", { opacity: 0, transformOrigin: "50% 50%" });

            const tl = gsap.timeline({
                defaults: { ease: "none" },
                onUpdate: () => {
                    if (bar.current) bar.current.style.width = `${tl.progress() * 100}%`;
                },
                onComplete: () => {
                    state.current.introDone = true;
                    exit.current();
                },
            });

            // 1. the continent is drawn, red shadow chasing the ink
            tl.to(".map.ink", { drawSVG: "100%", duration: 1.8, stagger: 0.4 }, 0)
                .to(".map.red", { drawSVG: "100%", duration: 1.8, stagger: 0.4 }, 0.08)
                .to(".map", { fillOpacity: 1, duration: 0.5 }, 1.9)

                // 2. ndimi is written, one stroke at a time
                .to(".ltr.ink", { drawSVG: "100%", duration: 0.55, stagger: 0.3 }, 0.6)
                .to(".ltr.red", { drawSVG: "100%", duration: 0.55, stagger: 0.3 }, 0.68)

                // 3. the two dots drop onto the i stems and bounce
                .addLabel("drop", ">-0.1")
                .to(
                    ".dot.red",
                    { y: 0, autoAlpha: 1, duration: 0.9, ease: "bounce.out", stagger: 0.18 },
                    "drop+=0.04"
                )
                .to(
                    ".dot.ink",
                    { y: 0, autoAlpha: 1, duration: 0.9, ease: "bounce.out", stagger: 0.18 },
                    "drop"
                )

                // 4. Kenya lights up and keeps pulsing
                .to(
                    ".kenya",
                    { scale: 1, duration: 0.5, ease: "back.out(3)" },
                    "drop+=0.5"
                )
                .add(() => {
                    gsap.fromTo(
                        ".kenya-ring",
                        { scale: 0.6, opacity: 0.9 },
                        { scale: 2.8, opacity: 0, duration: 1.2, repeat: -1, ease: "power2.out" }
                    );
                }, "drop+=0.6");

            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
                tl.progress(1);
            }

            exit.current = () => {
                const s = state.current;
                if (!s.introDone || !s.ready || s.exited) return;
                s.exited = true;
                gsap.to(root.current, {
                    yPercent: -100,
                    duration: 0.9,
                    delay: 0.4,
                    ease: "power4.inOut",
                    onComplete: () => onComplete?.(),
                });
            };
        }, root);

        return () => ctx.revert();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // lets the page hold the loader until real work (fonts, model, data) is done
    useEffect(() => {
        state.current.ready = ready;
        exit.current();
    }, [ready]);

    return (
        <div id="load" ref={root} role="status" aria-live="polite">
            <span className="sr-only">Loading Ndimi</span>

            <div className="load-stage">
                <svg
                    className="load-svg load-word"
                    viewBox="0 0 380 160"
                    aria-hidden="true"
                >
                    <WordLayer tone="red" />
                    <WordLayer tone="ink" />
                </svg>

                <svg
                    className="load-svg load-africa"
                    viewBox="0 0 222 226"
                    aria-hidden="true"
                >
                    <MapLayer tone="red" />
                    <MapLayer tone="ink" />
                    {/* Kenya */}
                    <circle className="kenya-ring" cx="165" cy="114" r="7" />
                    <circle className="kenya" cx="165" cy="114" r="5" />
                </svg>
            </div>

            <div className="load-progress" aria-hidden="true">
                <div className="load-progress-fill" ref={bar} />
            </div>
        </div>
    );
};

export default Load;