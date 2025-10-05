import React, { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register the ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

const HomepageText_1 = () => {
  const containerRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  
  // The quote text is now in a variable for easier manipulation
  const quote = "Experience life above the clouds";

  useLayoutEffect(() => {
    const titleLetters = titleRef.current.querySelectorAll("span > span");
    // We now target the individual words inside the subtitle container
    const quoteWords = subtitleRef.current.querySelectorAll("span");

    // --- 1. ENTRY ANIMATION ---
    // Set initial states to prevent flash of unstyled content
    gsap.set(titleLetters, { y: "100%" });
    gsap.set(quoteWords, { opacity: 0, y: 20 }); // Set initial state for each word

    const tl = gsap.timeline({
      delay: 1.5, // start a bit after page load
    });

    tl.to(titleLetters, {
      y: "0%",
      duration: 1.2, // Shortened duration slightly for a snappier feel
      ease: "power4.out",
      stagger: 0.05,
    }).to(
      quoteWords,
      {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: "power2.out",
        // The magic for the "quote feel": stagger reveals each word
        stagger: 0.1,
      },
      "-=0.8" // Overlap with the end of the title animation
    );

    // --- 2. SCROLL-TRIGGERED EXIT ANIMATION ---
    // Animate the main title as before
    gsap.to(titleRef.current, {
      y: "-200%",
      opacity: 0,
      scale: 0.8,
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top top",
        end: "bottom top",
        scrub: 1,
      },
    });

    // Animate the quote with a different, more "poetic" effect
    gsap.to(subtitleRef.current, {
      opacity: 0,
      // Add a blur filter for a dreamy fade-out
      filter: "blur(10px)",
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top top",
        end: "bottom top",
        scrub: 1,
      },
    });
  }, []);

  return (
    <div
      ref={containerRef}
      className="flex flex-col items-center justify-center h-screen text-center text-white"
    >
      <h1
        ref={titleRef}
        style={{ fontSize: "6vw", letterSpacing: "1vw", lineHeight: "1" }}
        className=" flex justify-center font-bold uppercase whitespace-nowrap"
      >
        {"ORBITING THE EARTH".split("").map((char, i) => (
          <span key={i} className="inline-block overflow-hidden">
            <span className="inline-block">
              {char === " " ? "\u00A0" : char}
            </span>
          </span>
        ))}
      </h1>
      <div
        ref={subtitleRef}
        className="font-[telma-med] text-[3vw] md:text-[2vw] mt-6 opacity-70"
      >
        {/* We split the quote by spaces and wrap each word in a span */}
        {`"${quote}"`.split(" ").map((word, i) => (
          <span key={i} className="inline-block overflow-hidden pb-2">
            <span className="inline-block pr-3">
              {word}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
};

export default HomepageText_1;