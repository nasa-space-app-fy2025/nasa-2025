// src/pages/Page.jsx
import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { Link } from "react-router-dom";
import Lenis from "lenis";

// local components used by your original Home
import HomepageText_1 from "../components/HomepageText_1";

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin, ScrambleTextPlugin);

const timelineData = [
  {
    year: "1980s–1990s",
    text: "NASA and partners began discussing the need for an Earth-observation window on the International Space Station.",
  },
  {
    year: "1998",
    text: "ESA (European Space Agency) started development of the Cupola as part of its ISS contributions.",
  },
  {
    year: "2003",
    text: "Final design approved. Built by Alenia Spazio (Italy) under ESA contract.",
  },
  {
    year: "2004",
    text: "NASA purchased the Cupola from ESA in exchange for shuttle launch services.",
  },
  {
    year: "2009",
    text: "Cupola completed and delivered to Kennedy Space Center.",
  },
  {
    year: "Feb 8, 2010",
    text: "Launched aboard Space Shuttle Endeavour (STS-130).",
  },
  {
    year: "Feb 15, 2010",
    text: "Installed on Tranquility (Node 3) and opened for the first time.",
  },
];

// SIMPLIFIED: All images are now in a single layer for horizontal scrolling.
// The 'x' values are spread out across a wider plane (up to 180%) to create a scrolling landscape.
const spaceImages = [
  {
    id: 1,
    src: "/ht/h1.jpg",
    x: 5,
    y: 20,
    size: 400,
    desc: "This artist's concept depicts the Space Station Freedom as it would look orbiting the Earth, illustrated by Space Flight Center artist, Tom Buzbee.",
  },
  {
    id: 2,
    src: "/ht/h2.png",
    x: 20,
    y: 20,
    size: 400,
    desc: "Official announcement of the Space Station Freedom program in a formal government setting in 1984 ",
  },
  {
    id: 3,
    src: "/ht/h3.jpg",
    x: 35,
    y: 20,
    size: 400,
    desc: "(7 October 2004) --- Paul Williamson, crew instructor, operates a simulated version of the International Space Station robotic arm, Canadarm2, in the Multi-use Remote Manipulator Development Facility at the Johnson Space Center. ",
  },
  {
    id: 4,
    src: "/ht/h4.jpg",
    x: 65,
    y: 20,
    size: 450,
    desc: "KENNEDY SPACE CENTER, FLA. - The Cupola, an element scheduled to be installed on the International Space Station in early 2009, sits uncrated inside the Space Station Processing Facility after its delivery from Turin, Italy. ",
  },
  {
    id: 5,
    src: "/ht/h5.jpg",
    x: 80,
    y: 20,
    size: 450,
    desc: "CAPE CANAVERAL, Fla. – In the Space Station Processing Facility, STS-130 Mission Specialist Kathryn Hire sits inside the Cupola, part of the payload on the mission to the International Space Station.",
  },
  {
    id: 6,
    src: "/ht/h6.jpg",
    x: 50,
    y: 20,
    size: 450,
    desc: "Node-3 welcoming ceremony at NASA's Kennedy Space Center, Florida",
  },
  {
    id: 7,
    src: "/ht/h7.jpg",
    x: 97,
    y: 20,
    size: 450,
    desc: "Guests look on from the terrace of Operations Support Building II as space shuttle Endeavour launches from pad 39A on the STS-130 mission early Monday, Feb. 8, 2010, at Kennedy Space Center in Cape Canaveral, Fla. ",
  },
  {
    id: 8,
    src: "/ht/h8.jpg",
    x: 113,
    y: 20,
    size: 450,
    desc: "STS130-S-037 (8 Feb. 2010) --- Against a black night sky, space shuttle Endeavour and its six-member STS-130 crew head toward Earth orbit and rendezvous with the International Space Station. Liftoff was at 4:14 a.m. (EST) on Feb. 8, 2010 from launch pad 39A at NASA's Kennedy Space Center. ",
  },
];

const milestonesData = [
  {
    year: "2010",
    title: "First Light",
    description:
      "Shortly after installation, the STS-130 crew opened the Cupola's protective shutters for the first time, revealing breathtaking, high-definition views of Earth. This event marked the beginning of its role as the station's primary observation portal.",
    images: ["/ht/t1.jpg", "/ht/t2.jpg"],
  },
  {
    year: "2011",
    title: "A Room with a View",
    description:
      "Astronaut Cady Coleman famously played the flute from within the Cupola, creating a viral video that showcased the module not just as a worksite, but as a place for human expression and connection to Earth.",
    images: ["/ht/t3.jpg", "/ht/t4.jpg"],
  },
  {
    year: "2012",
    title: "Robotic Operations Hub",
    description:
      "The Cupola became the primary control center for the Canadarm2. Astronaut Don Pettit captured the first commercial cargo spacecraft, SpaceX's Dragon, using robotic controls from inside the Cupola, proving its critical operational capabilities.",
    images: ["/ht/t5.jpg", "/ht/t6.jpg", "/ht/t7.jpg", "/ht/t8.jpg"],
  },
  {
    year: "2015",
    title: "Year in Space",
    description:
      "During his historic year-long mission, astronaut Scott Kelly used the Cupola extensively to document Earth's changing surface, capturing thousands of stunning photographs that contributed to climate science and public engagement.",
    images: ["/ht/t9.jpg", "/ht/t10.jpg"],
  },
  {
    year: "Present Day",
    title: "The Window to the World",
    description:
      "Today, the Cupola remains one of the most beloved parts of the ISS for astronauts. It serves as a critical station for monitoring vehicle dockings, conducting Earth science, and as a source of psychological well-being, offering a constant, humbling reminder of our planet's beauty and fragility.",
    images: ["/ht/t15.jpg", "/ht/t14.jpg", "/ht/t12.jpg", "/ht/t13.jpg"],
  },
];

export default function Page() {
  const sectionsRef = useRef([]);
  const titleRef = useRef(null);
  const descRefs = useRef([]);
  const notesRef = useRef([]);
  const cardValueRefs = useRef([]); // <<< MODIFICATION: New ref for card values
  const contentWrapperRef = useRef(null);

  // Refs for the History Section
  const historyContainerRef = useRef(null);
  const historyTextWrapperRef = useRef(null);
  const allImagesRef = useRef([]);
  const imagesContainerRef = useRef(null); // Ref for the single container of all images
  const milestonesSectionRef = useRef(null); // Ref for the new vertical section
  const [selectedImage, setSelectedImage] = useState(null);

  // ===== NEW: Lenis Smooth Scrolling Effect =====
  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.02, // Controls the "smoothness" - higher values are less smooth
      smoothWheel: true,
    });

    // Connect Lenis to GSAP's ticker
    const raf = (time) => {
      lenis.raf(time * 1000);
      ScrollTrigger.update(); // Update ScrollTrigger on each frame
    };

    gsap.ticker.add(raf);

    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
    };
  }, []);

  useEffect(() => {
    const nudgeTween = gsap.to(window, {
      scrollTo: { y: 20, autoKill: false }, // Scroll down 100px
      duration: 2,
      ease: "power1.out",
      delay: 15, // Wait 3 seconds after page load
      yoyo: false, // Animate back to the start
      repeat: 0, // Do the down-and-up motion once
    });

    return () => {
      nudgeTween.kill(); // Cleanup the animation
    };
  }, []);

  // ScrambleText animations effect
  useEffect(() => {
    // This effect remains the same
    const contentSection = sectionsRef.current[1];
    if (!contentSection) return;

    // Data for animations
    const cardData = [
      { title: "Mass", value: "1,805 kg" },
      { title: "Main Window Diameter", value: "~0.8m" },
      { title: "Crew", value: "Up to 2 astronauts" },
      { title: "Distance from Earth", value: "~408 km" },
    ];
    const descTexts = [
      "The Cupola is an observatory module on the International Space Station.",
      "It was designed for Earth observation and robotic operations.",
      "Its unique dome structure provides panoramic visibility.",
      "Astronauts can monitor docking spacecraft, conduct experiments,",
      "and capture stunning imagery of our planet.",
    ];
    const noteTexts = [
      "Installed on Tranquility (Node 3)",
      "7 windows with protective shutters",
      "Provides panoramic Earth observation",
      "Integrated with Canadarm2 robotic controls",
      "Dimensions: 2.955 m diameter, 1.5 m height",
      "Mass: 1,805 kg (1.8 metric tons)",
    ];

    const tl = gsap.timeline({ paused: true });

    tl.to(titleRef.current, {
      duration: 2.2,
      scrambleText: {
        text: "The CUPOLA MODULE",
        chars: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
        speed: 0.8,
        revealDelay: 0.5,
      },
      ease: "power2.out",
    });

    // <<< MODIFICATION: Added scramble effect for the info cards
    tl.to(
      cardValueRefs.current,
      {
        duration: 3,
        scrambleText: (i) => ({
          text: cardData[i].value,
          chars: "0123456789-.,~kgm",
          speed: 0.4,
        }),
        opacity: 1,
        ease: "power2.out",
        stagger: 0.2,
      },
      "-=2" // Position animation relative to the previous one
    );

    tl.to(
      descRefs.current,
      {
        duration: 3,
        scrambleText: (i) => ({
          text: descTexts[i],
          chars: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
          speed: 0.28,
          revealDelay: 0.18,
        }),
        opacity: 1,
        ease: "power2.out",
        stagger: 0.35,
      },
      0
    );
    tl.to(
      notesRef.current,
      {
        duration: 3,
        scrambleText: (i) => ({
          text: noteTexts[i],
          chars: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
          speed: 0.28,
          revealDelay: 0.12,
        }),
        opacity: 1,
        ease: "power1.out",
        stagger: 0.25,
      },
      0
    );
    const ct = ScrollTrigger.create({
      trigger: contentSection,
      start: "top 60%",
      onEnter: () => tl.play(),
      onEnterBack: () => tl.restart(),
    });
    return () => {
      tl.kill();
      ct && ct.kill();
    };
  }, []);

  // Page 2 to Page 3 transition effect
  useEffect(() => {
    // This effect remains the same
    const contentSection = sectionsRef.current[1];
    const historySection = sectionsRef.current[2];
    if (!contentSection || !historySection) return;
    gsap.set(historySection, { opacity: 0 });
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: contentSection,
        start: "top top",
        end: "+=100%",
        scrub: true,
        pin: true,
      },
    });
    tl.to(contentSection, { scale: 1.2, opacity: 0, ease: "power3.inOut" }, 0);
    tl.to(historySection, { opacity: 1, ease: "power2.out" }, 0);
    return () => {
      tl.scrollTrigger && tl.scrollTrigger.kill();
      tl.kill();
    };
  }, []);

  // ===== History section parallax and timeline scroll effect =====
  useEffect(() => {
    const historySection = historyContainerRef.current;
    const textWrapper = historyTextWrapperRef.current;
    const imageContainer = imagesContainerRef.current;
    const individualImages = allImagesRef.current.filter(Boolean);

    if (
      !historySection ||
      !textWrapper ||
      !imageContainer ||
      individualImages.length === 0
    )
      return;

    let ctx = gsap.context(() => {
      const timelineScrollWidth = textWrapper.offsetWidth - window.innerWidth;

      const masterTl = gsap.timeline({
        scrollTrigger: {
          trigger: historySection,
          start: "top top",
          end: () => `+=${timelineScrollWidth}`,
          scrub: 1,
          pin: true,
          snap: {
            snapTo: 1 / (timelineData.length - 1),
            duration: 1,
            ease: "power1.inOut",
          },
          invalidateOnRefresh: true,
        },
      });

      // 1. Animate the text timeline horizontally
      masterTl.to(textWrapper, {
        x: -timelineScrollWidth,
        ease: "none",
      });

      // 2. Animate the single image container for a parallax effect
      // It scrolls a shorter distance than the text, creating the parallax motion.
      masterTl.to(
        imageContainer,
        {
          x: -(imageContainer.offsetWidth - window.innerWidth) * 1.5,
          ease: "none",
        },
        0
      );

      // 3. Add a continuous, gentle floating animation to individual images
      individualImages.forEach((img) => {
        gsap.to(img, {
          y: "random(-5, 5)",
          x: "random(-5, 5)",
          duration: "random(6, 12)",
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
        });
      });
    }, historySection);

    return () => ctx.revert();
  }, []);

  // ===== NEW EFFECT for Vertical Parallax Images in Section 4 =====
  useEffect(() => {
    const milestonesSection = milestonesSectionRef.current;
    if (!milestonesSection) return;

    // Use a context for easier cleanup
    let ctx = gsap.context(() => {
      // Select all image containers within the new section
      const imageContainers = gsap.utils.toArray(".milestone-img-container");

      imageContainers.forEach((container) => {
        const img = container.querySelector("img");

        gsap
          .timeline({
            scrollTrigger: {
              trigger: container,
              scrub: true,
              pin: false,
            },
          })
          .fromTo(
            img,
            {
              yPercent: -10, // Start image slightly higher
              ease: "none",
            },
            {
              yPercent: 10, // End image slightly lower
              ease: "none",
            }
          );
      });
    }, milestonesSection);

    return () => ctx.revert(); // Cleanup GSAP animations
  }, []);

  return (
    <div id="page-root" className="min-h-screen bg-black">
      {/* ===== SECTION 1: HOME ===== */}
      <section
        ref={(el) => (sectionsRef.current[0] = el)}
        className="h-screen w-screen relative overflow-hidden"
      >
        {/* Video directly in section */}
        <video
          className="h-full w-full object-cover absolute top-0 left-0"
          autoPlay
          loop
          muted
          src="/bgvid2.mp4"
        ></video>

        {/* Text / overlay content */}
        <div className="h-screen w-screen relative flex flex-col">
          <HomepageText_1 />
        </div>
      </section>

      {/* ===== SECTION 2: CONTENT ===== */}
      <section
        ref={(el) => {
          sectionsRef.current[1] = el;
          contentWrapperRef.current = el;
        }}
        className="relative h-screen w-screen"
      >
        <div className="relative h-screen w-screen bg-[url('/img2.jpg')] bg-cover bg-center flex items-center justify-between px-12">
          <div className="absolute left-4 top-1/2  grid grid-cols-2 gap-4">
            {[
              { title: "Mass", value: "1,805 kg" },
              { title: "Main Window Diameter", value: "~0.8m" },
              { title: "Crew", value: "Up to 2 astronauts" },
              { title: "Distance from Earth", value: "~408 km" },
            ].map((card, i) => (
              <div
                key={i}
                className="bg-transparent border border-blue-400 rounded-lg p-3 w-30  shadow-lg flex flex-col items-center text-white"
              >
                <h3 className="text-xs uppercase text-blue-400 mb-1">
                  {card.title}
                </h3>
                {/* <<< MODIFICATION: Added ref and opacity-0 for animation */}
                <p
                  ref={(el) => (cardValueRefs.current[i] = el)}
                  className="text-sm font-bold text-center opacity-0"
                >
                  {card.value}
                </p>
              </div>
            ))}
          </div>

          <div className="w-full flex justify-center relative">
            <h1
              ref={titleRef}
              className="text-6xl text-center text-white font-bold tracking-wide border-b border-blue-400 pb-2 transform -translate-y-60"
            >
              The CUPOLA MODULE
            </h1>
          </div>
          <div className="absolute right-3 top-[40%] -translate-y-1/2 w-1/4 text-blue-200 font-mono">
            <div className="flex-1 space-y-2 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
              {[
                "The Cupola is an observatory module on the International Space Station.",
                "It was designed for Earth observation and robotic operations.",
                "Its unique dome structure provides panoramic visibility.",
                "Astronauts can monitor docking spacecraft, conduct experiments,",
                "and capture stunning imagery of our planet.",
              ].map((line, i) => (
                <p
                  key={i}
                  ref={(el) => (descRefs.current[i] = el)}
                  className="text-sm uppercase leading-relaxed opacity-0"
                >
                  {line}
                </p>
              ))}
              <div className="text-sm uppercase space-y-2 opacity-100 mt-4">
                {[
                  "Installed on Tranquility (Node 3)",
                  "7 windows with protective shutters",
                  "Provides panoramic Earth observation",
                  "Integrated with Canadarm2 robotic controls",
                  "Dimensions: 2.955 m diameter, 1.5 m height",
                  "Mass: 1,805 kg (1.8 metric tons)",
                ].map((line, i) => (
                  <p
                    key={i}
                    ref={(el) => (notesRef.current[i] = el)}
                    className="opacity-0"
                  >
                    {line}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== SECTION 3: HISTORY  ===== */}
      <section ref={(el) => (sectionsRef.current[2] = el)} className="relative">
        <div
          ref={historyContainerRef}
          className="history-container relative h-screen w-screen overflow-hidden bg-black text-white"
        >
          {/* --- NEW: Single Image Layer Container --- */}
          <div className="absolute top-0 left-0 w-full h-1/2 overflow-hidden z-10 pointer-events-none">
            <div
              ref={imagesContainerRef}
              className="relative h-full"
              style={{ width: "250%" }}
            >
              {spaceImages.map((image) => (
                <div
                  key={image.id}
                  ref={(el) => (allImagesRef.current[image.id] = el)}
                  className="absolute pointer-events-auto cursor-pointer"
                  style={{
                    left: `${image.x}%`,
                    top: `${image.y}%`,
                    width: `${image.size}px`,
                  }}
                  onClick={() => setSelectedImage(image)}
                >
                  <img
                    src={image.src}
                    alt=""
                    className="w-full h-auto object-cover rounded-lg border border-gray-700 opacity-90 hover:opacity-100 transition"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* --- Timeline Text Container --- */}
          <div className="absolute bottom-0 left-0 w-full h-1/2 z-20">
            <div
              ref={historyTextWrapperRef}
              className="flex h-full"
              style={{ width: `${timelineData.length * 100}vw` }}
            >
              {timelineData.map((item, i) => (
                <div
                  key={i}
                  className="history-section flex-shrink-0 h-full w-screen flex flex-col items-center justify-center relative px-8"
                >
                  <h1 className="text-6xl md:text-8xl font-bold text-blue-400 drop-shadow-lg">
                    {item.year}
                  </h1>
                  <p className="mt-6 text-lg md:text-2xl max-w-2xl text-center opacity-80">
                    {item.text}
                  </p>
                  <span className="absolute text-[15rem] font-bold text-gray-700 opacity-10 pointer-events-none select-none">
                    {item.year}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* --- Popup / Lightbox Overlay --- */}
        {selectedImage && (
          <div
            className="fixed inset-0 z-[100] bg-black bg-opacity-80 flex items-center justify-center p-6"
            onClick={() => setSelectedImage(null)}
          >
            <div
              className="relative max-w-3xl w-full"
              onClick={(e) => e.stopPropagation()} // prevent closing on inner click
            >
              <img
                src={selectedImage.src}
                alt=""
                className="w-full h-auto rounded-lg shadow-2xl"
              />
              {/* optional desc if you want */}
              <p className="mt-4 text-center text-gray-300">
                {selectedImage.desc || "Beautiful Earth from space"}
              </p>
              <button
                className="absolute top-2 right-2 text-white bg-black/50 rounded-full px-3 py-1"
                onClick={() => setSelectedImage(null)}
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </section>

      {/*section 4: vertical timeline */}
      {/* ===== NEW SECTION 4: VERTICAL MILESTONES ===== */}
      <section
        ref={(el) => {
          sectionsRef.current[3] = el;
          milestonesSectionRef.current = el;
        }}
        className="relative bg-black py-20 px-8 md:px-16"
      >
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-16">
          {/* Left Column: Text */}
          <div className="lg:col-span-1 space-y-24 mt-8">
            {milestonesData.map((milestone, index) => (
              <div key={index} className="milestone-text">
                <h2 className="text-5xl font-bold text-blue-400 mb-2">
                  {milestone.year}
                </h2>
                <h3 className="text-2xl font-semibold text-white mb-4">
                  {milestone.title}
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  {milestone.description}
                </p>
              </div>
            ))}
          </div>

          {/* Right Columns: Images */}
          <div className="lg:col-span-2 grid grid-cols-2 gap-8">
            <div className="space-y-8">
              {milestonesData
                .flatMap((m) => m.images)
                .map((src, index) =>
                  index % 2 === 0 ? (
                    <div
                      key={index}
                      className="milestone-img-container overflow-hidden rounded-lg shadow-lg"
                    >
                      <img
                        src={src}
                        alt=""
                        className="w-full h-auto object-cover"
                      />
                    </div>
                  ) : null
                )}
            </div>
            <div className="space-y-8 mt-16">
              {milestonesData
                .flatMap((m) => m.images)
                .map((src, index) =>
                  index % 2 !== 0 ? (
                    <div
                      key={index}
                      className="milestone-img-container overflow-hidden rounded-lg shadow-lg"
                    >
                      <img
                        src={src}
                        alt=""
                        className="w-full h-auto object-cover"
                      />
                    </div>
                  ) : null
                )}
            </div>
          </div>
        </div>
      </section>

      {/* --- Floating Button to Simulation --- */}
      <Link
        to="/simulation"
        className="fixed bottom-8 right-8 z-50 px-6 py-3 text-white font-bold text-sm uppercase rounded-full shadow-2xl transition-all duration-300"
        style={{
          background: "linear-gradient(135deg, #1e3a8a, #7e22ce, #ec4899)",
          boxShadow:
            "0 0 15px rgba(139, 92, 246, 0.8), 0 0 30px rgba(139, 92, 246, 0.5)",
          animation:
            "floatPulse 2.5s ease-in-out infinite, pulseGlow 3s ease-in-out infinite",
        }}
      >
        Experience the Cupola
        <style>
          {`
      @keyframes floatPulse {
        0%, 100% { transform: translateY(0) scale(1); }
        50% { transform: translateY(-6px) scale(1.05); }
      }
      @keyframes pulseGlow {
        0%, 100% { box-shadow: 0 0 15px rgba(139, 92, 246, 0.8), 0 0 30px rgba(139, 92, 246, 0.5); }
        50% { box-shadow: 0 0 25px rgba(139, 92, 246, 1), 0 0 50px rgba(139, 92, 246, 0.7); }
      }
    `}
        </style>
      </Link>

      <Link
        to="/cupola-quiz"
        className="fixed bottom-8 left-8 z-50 px-6 py-3 text-white font-bold text-sm uppercase rounded-full shadow-2xl transition-all duration-300"
        style={{
          background: "linear-gradient(135deg, #1e3a8a, #7e22ce, #ec4899)",
          boxShadow:
            "0 0 15px rgba(139, 92, 246, 0.8), 0 0 30px rgba(139, 92, 246, 0.5)",
          animation:
            "floatPulse 2.5s ease-in-out infinite, pulseGlow 3s ease-in-out infinite",
        }}
      >
        Take Quiz
        <style>
          {`
      @keyframes floatPulse {
        0%, 100% { transform: translateY(0) scale(1); }
        50% { transform: translateY(-6px) scale(1.05); }
      }
      @keyframes pulseGlow {
        0%, 100% { box-shadow: 0 0 15px rgba(139, 92, 246, 0.8), 0 0 30px rgba(139, 92, 246, 0.5); }
        50% { box-shadow: 0 0 25px rgba(139, 92, 246, 1), 0 0 50px rgba(139, 92, 246, 0.7); }
      }
    `}
        </style>
      </Link>
      <a
        href="/earth/index.html"
        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 px-6 py-3 text-white font-bold text-sm uppercase rounded-full shadow-2xl transition-all duration-300"
        style={{
          background: "linear-gradient(135deg, #1e3a8a, #7e22ce, #ec4899)",
          boxShadow:
            "0 0 15px rgba(139, 92, 246, 0.8), 0 0 30px rgba(139, 92, 246, 0.5)",
          animation:
            "floatPulse 2.5s ease-in-out infinite, pulseGlow 3s ease-in-out infinite",
        }}
      >
        views from cupola
        <style>
          {`
      @keyframes floatPulse {
        0%, 100% { transform: translateY(0) scale(1); }
        50% { transform: translateY(-6px) scale(1.05); }
      }
      @keyframes pulseGlow {
        0%, 100% { box-shadow: 0 0 15px rgba(139, 92, 246, 0.8), 0 0 30px rgba(139, 92, 246, 0.5); }
        50% { box-shadow: 0 0 25px rgba(139, 92, 246, 1), 0 0 50px rgba(139, 92, 246, 0.7); }
      }
    `}
        </style>
      </a>
    </div>
  );
}
