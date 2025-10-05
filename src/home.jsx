import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { TextPlugin } from "gsap/TextPlugin";
import { useNavigate } from "react-router-dom";

gsap.registerPlugin(TextPlugin);

const ExploreSelect = ({ cupolaImage, nblImage, ambienceSrc }) => {
  const navigate = useNavigate();
  const [activeTransition, setActiveTransition] = useState(null);

  const containerRef = useRef(null);
  const textContainerRef = useRef(null); // Ref for the main text block
  const heyRef = useRef(null);
  const whatRef = useRef(null);
  const heyCursorRef = useRef(null);
  const whatCursorRef = useRef(null);
  const optionsRef = useRef(null);
  const ambienceRef = useRef(null);
  const cupolaCardRef = useRef(null);
  const nblCardRef = useRef(null);

  useEffect(() => {
    document.body.style.overflow = 'hidden';

    if (ambienceSrc) {
      const audio = new Audio(ambienceSrc);
      audio.loop = true;
      audio.volume = 0.2;
      audio.play().catch(() => {});
      ambienceRef.current = audio;
    }

    const tl = gsap.timeline();
    
    tl
      .set(heyCursorRef.current, { autoAlpha: 1 })
      .to(heyRef.current, {
        duration: 1.5,
        text: "Hey there...",
        ease: "none",
      })
      .set(heyCursorRef.current, { autoAlpha: 0 })
      .set(whatCursorRef.current, { autoAlpha: 1 })
      .to(whatRef.current, {
        duration: 2.5,
        text: "What do you want to explore today?",
        ease: "none",
      }, "+=0.5")
      
      // FIX: Animate the entire text container up without fading.
      .to(textContainerRef.current, {
        y: -120, // Increased the distance slightly
        duration: 1.5,
        ease: "power2.inOut",
      }, "+=1")

      .to(optionsRef.current, { 
        opacity: 1, 
        y: 0, 
        duration: 1.2, 
        ease: "power3.out" 
      }, "-=1.0");

    gsap.to([cupolaCardRef.current, nblCardRef.current], {
      y: -20, rotation: 1, duration: 3, repeat: -1, yoyo: true, ease: "sine.inOut"
    });

    return () => {
      ambienceRef.current?.pause();
      document.body.style.overflow = '';
    };
  }, [ambienceSrc]);

  // The rest of the component logic remains the same...
  useEffect(() => {
    if (!activeTransition) return;

    if (activeTransition === 'cupola') {
        const transitionDuration = 2.8;
        const tl = gsap.timeline({ onComplete: () => navigate('/cupola') });
        tl.to(containerRef.current, { keyframes: { x: [-4, 4, -3, 3, -5, 5, 0], y: [4, -4, 3, -3, 5, -5, 0], }, duration: transitionDuration * 0.8, ease: 'none', }, 0);
        tl.fromTo(".rocket-smoke", { opacity: 0, scale: 0.1 }, { opacity: 1, scale: 1, duration: transitionDuration, ease: "power1.out", }, 0);
        tl.to(".rocket-flame-intense", { scaleY: 1.5, duration: transitionDuration * 0.5, ease: "power1.out" }, 0);
        tl.to(".rocket", { y: -window.innerHeight, duration: transitionDuration, ease: 'power3.in', }, 0);
        tl.to(".rocket-smoke", { opacity: 0, duration: transitionDuration * 0.3, }, transitionDuration * 0.7);
    }

    if (activeTransition === 'nbl') {
        const tl = gsap.timeline({ onComplete: () => navigate('/nbl') });
        tl.to(".water-blob", { top: "-40%", rotation: 360, duration: 3, stagger: 0.2, ease: "power2.inOut", });
        gsap.fromTo(".bubble", { y: window.innerHeight, opacity: 1 }, { y: -200, duration: 'random(3, 5)', stagger: 0.15, ease: 'none' });
    }

  }, [activeTransition, navigate]);

  const handleSelect = (choice) => {
    ambienceRef.current?.pause();
    gsap.to([optionsRef.current, textContainerRef.current], {
      duration: 0.5, opacity: 0, ease: 'power2.in'
    });
    setActiveTransition(choice);
  };

  return (
    <div ref={containerRef} className="w-full h-screen bg-black text-white flex flex-col items-center justify-center overflow-hidden relative">
      
      {/* --- Transitions --- */}
      {activeTransition === 'cupola' && ( <div className="transition-overlay"><div className="rocket-smoke"></div><div className="rocket"><div className="rocket-body"></div><div className="rocket-flame-intense"></div><div className="rocket-flame"></div></div></div> )}
      {activeTransition === 'nbl' && ( <div className="water-container">{[...Array(30)].map((_, i) => ( <div key={i} className="bubble" style={{ left: `${Math.random() * 100}%` }} /> ))}<div className="water-blob blob1"></div><div className="water-blob blob2"></div></div> )}

      {/* FIX: Wrapped text in a single flex-col container for proper stacking. */}
      <div ref={textContainerRef} className="select-none relative z-20 h-32 flex flex-col items-center justify-center">
        <div className="inline-flex items-baseline">
            <h1 ref={heyRef} className="text-5xl font-light"></h1>
            <span ref={heyCursorRef} className="cursor text-5xl font-light ml-2 opacity-0">|</span>
        </div>
        <div className="inline-flex items-baseline mt-2">
            <p ref={whatRef} className="text-2xl opacity-80"></p>
            <span ref={whatCursorRef} className="cursor text-2xl  ml-2 opacity-0">|</span>
        </div>
      </div>

      {/* --- Options/cards --- */}
      <div ref={optionsRef} className="absolute bottom-[15%] flex gap-16 opacity-0 translate-y-10 z-10">
        <div onClick={() => handleSelect("cupola")} ref={cupolaCardRef} className="cursor-pointer group relative w-48 h-48 rounded-2xl overflow-hidden flex items-center justify-center bg-gray-800 hover:scale-105 hover:rotate-1 transition-transform duration-500">
          {cupolaImage && <img src={cupolaImage} alt="Cupola" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-500" />}
          <span className="z-10 text-2xl tracking-wider">Cupola</span>
        </div>
        <div onClick={() => handleSelect("nbl")} ref={nblCardRef} className="cursor-pointer group relative w-48 h-48 rounded-2xl overflow-hidden flex items-center justify-center bg-gray-800 hover:scale-105 hover:rotate-1 transition-transform duration-500">
          {nblImage && <img src={nblImage} alt="NBL" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-500" />}
          <span className="z-10 text-2xl tracking-wider">NBL</span>
        </div>
      </div>

      <style>{`
        body { overflow: hidden; }

        .cursor {
            animation: blink 1s steps(1) infinite;
        }
        @keyframes blink {
            50% { opacity: 0; }
        }

        /* --- Rocket Styles --- */
        .transition-overlay { position: fixed; inset: 0; z-index: 999;}
        .rocket { position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%); width: 30px; height: 100px; filter: drop-shadow(0 0 15px rgba(255, 180, 50, 0.8)); z-index: 2; }
        .rocket-body { width: 100%; height: 80%; background: linear-gradient(180deg, #e0e0e0, #a0a0a0); border-radius: 50% 50% 0 0; }
        .rocket-flame-intense { position: absolute; bottom: -10px; left: 50%; transform: translateX(-50%); width: 15px; height: 30px; background: radial-gradient(circle, #fff 0%, #ffeb3b 50%, #ff9800 100%); border-radius: 50% 50% 20% 20%; filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.8)); z-index: 3; }
        .rocket-flame { position: absolute; bottom: -60px; left: 50%; width: 20px; height: 80px; background: linear-gradient(to top, #ff4800, #ffb347, transparent); border-radius: 50% 50% 20% 20%; animation: flame-flicker 0.1s infinite alternate; z-index: 1; }
        @keyframes flame-flicker { 0% { transform: translateX(-50%) scale(1, 1); } 100% { transform: translateX(-50%) scale(1.1, 0.9); } }
        .rocket-smoke { position: absolute; bottom: 0; left: 50%; transform: translateX(-50%); width: 200px; height: 200px; background: radial-gradient(ellipse at center, rgba(180,180,180,0.8) 0%, rgba(100,100,100,0.6) 50%, rgba(50,50,50,0) 70%); border-radius: 50%; filter: blur(15px); opacity: 0; z-index: 0; transform-origin: 50% 100%; }

        /* --- Water Styles --- */
        .water-container { position: fixed; inset: 0; z-index: 999; overflow: hidden; background-color: #0c243c; }
        .water-blob { position: absolute; width: 200vw; height: 200vw; left: 50%; transform: translateX(-50%); border-radius: 45%; top: 100%; }
        .blob1 { background: #00acee; z-index: 2; }
        .blob2 { background: #086e9e; border-radius: 42%; z-index: 1; }
        .bubble { position: absolute; z-index: 3; width: 10px; height: 10px; background-color: rgba(255, 255, 255, 0.3); border-radius: 50%; border: 1px solid rgba(255, 255, 255, 0.4); }
      `}</style>
    </div>
  );
};

export default ExploreSelect;