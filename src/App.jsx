import React, { useEffect, useState } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import Load from "./components/Load";
import Hero from "./components/Hero";
import Tech from "./components/Tech";
import Goal from "./components/Goal";
import About from "./components/About";
import Header from "./components/Header";
import Footer from "./components/Footer";
import BetaForm from "./components/BetaForm";
import { Analytics } from "@vercel/analytics/react";

const App = () => {
    const [ready, setReady] = useState(false); // real assets finished loading
    const [done, setDone] = useState(false); // loader has wiped away

    // hold the loader until fonts and the page's assets are ready
    useEffect(() => {
        const fonts = document.fonts.ready;
        const loaded =
            document.readyState === "complete"
                ? Promise.resolve()
                : new Promise((res) =>
                    window.addEventListener("load", res, { once: true })
                );

        Promise.all([fonts, loaded]).then(() => setReady(true));
    }, []);

    // lock scrolling while loading, then re-measure the pinned sections
    useEffect(() => {
        document.body.style.overflow = done ? "" : "hidden";
        if (done) ScrollTrigger.refresh();
        return () => {
            document.body.style.overflow = "";
        };
    }, [done]);

    return (
        <>
            {!done && <Load ready={ready} onComplete={() => setDone(true)} />}

            <main>
                <Analytics />
                <Header />
                <Hero />
                <Tech />
                <Goal />
                <About />
                <BetaForm />
                <Footer />
            </main>
        </>
    );
};

export default App;