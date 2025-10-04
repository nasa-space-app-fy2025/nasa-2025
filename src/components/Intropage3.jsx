import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import MenuButton from "./MenuButton.jsx"; 
import SideMenu from "./SideMenu.jsx";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);


const nblTimelineData = [
  {
    year: "1980s",
    title: "The Predecessor",
    text: "Before the NBL, astronauts trained at the Weightless Environment Training Facility (WETF). A smaller, less advanced pool at Johnson Space Center, it laid the groundwork for large-scale underwater spacewalk simulations.",
    images: [
      "/gallery/nbl-1980.jpg",
      "/gallery/nbl-1980b.jpg",
      "/gallery/nbl-1980c.jpg",
    ],
  },
  {
    year: "1997",
    title: "NBL is Commissioned",
    text: "The Neutral Buocyancy Laboratory officially opened. Built to support the construction of the International Space Station, its massive size and full-scale mockups became a game-changer for spacewalk training.",
    images: [
      "/gallery/nbl-1997a.jpg",
      "/gallery/nbl-1997b.jpg",
      "/gallery/nbl-1997c.jpg",
      "/gallery/nbl-1997d.jpg",
    ],
  },
  {
    year: "Early 2000s",
    title: "ISS Assembly",
    text: "The NBL became the primary training ground for every spacewalk conducted during the critical assembly of the International Space Station, including the installation of solar arrays, truss segments, and laboratory modules.",
    images: [
      "/gallery/nbl-2000a.jpg",
      "/gallery/nbl-2000b.jpg",
      "/gallery/nbl-2000c.jpg",
      "/gallery/nbl-2000d.jpg",
    ],
  },
  {
    year: "2010s",
    title: "Maintenance & Upgrades",
    text: "With the ISS fully assembled, training shifted to maintenance, repair, and science-related tasks. Astronauts practiced intricate procedures, like replacing a pump module or upgrading a power system.",
    images: [
      "/gallery/nbl-2010a.jpg",
      "/gallery/nbl-2010b.jpg",
      "/gallery/nbl-2010c.jpg",
      "/gallery/nbl-2010d.jpg",
    ],
  },
  {
    year: "Present & Future",
    title: "Artemis & Beyond",
    text: "The NBL is being adapted for future missions. While still vital for ISS operations, it is now being used to develop and test procedures for lunar spacewalks as part of the Artemis program, simulating a new generation of exploration.",
    images: [
      "/gallery/nbl-2025a.jpg",
      "/gallery/nbl-2025b.jpg",
      "/gallery/nbl-2025c.jpg",
    ],
  },
];

const trainingData = [
  {
    id: 1,
    title: "EVA (Spacewalks)",
    content: [
      "Astronauts rehearse spacewalks (EVAs) underwater.",
      "Moving around ISS mock-ups.",
      "Using tethers to stay attached.",
      "Practicing tasks like Hubble servicing.",
    ],
  },
  {
    id: 2,
    title: "Repairs & Assembly",
    content: [
      "Training includes:",
      "Repairing solar panels or cooling systems.",
      "Installing new station modules.",
      "Practicing emergency fixes safely on Earth.",
    ],
  },
  {
    id: 3,
    title: "Tool Handling",
    content: [
      "Astronauts use custom space tools:",
      "Drills, wrenches, and connectors.",
      "Practice working with thick gloves.",
      "Precision work like connecting cables.",
    ],
  },
  {
    id: 4,
    title: "Safety Divers",
    content: [
      "Every astronaut is supported by scuba divers:",
      "Monitor safety at all times.",
      "Adjust positions if needed.",
      "Act as a lifeline during training.",
    ],
  },
  {
    id: 5,
    title: "Mission Control",
    content: [
      "A control room oversees training:",
      "Instructors guide astronauts.",
      "Procedures mirror real missions.",
      "Every move is tracked for accuracy.",
    ],
  },
  {
    id: 6,
    title: "Long Sessions",
    content: [
      "Training simulates real spacewalk duration:",
      "Sessions last 6–8 hours.",
      "Builds stamina and problem-solving under pressure.",
    ],
  },
];

const IntroPage = () => {
  const [showContent, setShowContent] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [modalState, setModalState] = useState({
    isOpen: false,
    images: [],
    currentIndex: 0,
  });

  const leftColumnRef = useRef(null);
  const rightColumnRef = useRef(null);
  const horizontalScrollRef = useRef(null);
  const timelineWrapperRef = useRef(null);
  const poolDetailsRef = useRef(null);
  const trainingSectionRef = useRef(null);

  // Initial fade-in animation
  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 500);
    return () => clearTimeout(timer);
  }, []);

  // GSAP animations for various sections
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Intro section animation
      gsap.fromTo(
        leftColumnRef.current,
        { opacity: 0, x: -100 },
        {
          opacity: 1,
          x: 0,
          duration: 1.5,
          ease: "power3.out",
          scrollTrigger: {
            trigger: "#nbl-intro-section",
            start: "top 80%",
            toggleActions: "play none none none",
          },
        }
      );
      gsap.fromTo(
        rightColumnRef.current,
        { opacity: 0, x: 100 },
        {
          opacity: 1,
          x: 0,
          duration: 1.5,
          ease: "power3.out",
          scrollTrigger: {
            trigger: "#nbl-intro-section",
            start: "top 80%",
            toggleActions: "play none none none",
          },
        },
        "<"
      );

      // Horizontal timeline animation
      const horizontalTimeline = horizontalScrollRef.current;
      const timelineWrapper = timelineWrapperRef.current;
      const slides = gsap.utils.toArray(".timeline-slide");
      if (horizontalTimeline && timelineWrapper && slides.length > 1) {
        const scrollDistance =
          horizontalTimeline.offsetWidth - window.innerWidth;
        if (scrollDistance > 0) {
          const scrollTween = gsap.to(horizontalTimeline, {
            x: -scrollDistance,
            ease: "none",
            scrollTrigger: {
              trigger: timelineWrapper,
              pin: true,
              scrub: 1,
              start: "top top",
              end: () => `+=${scrollDistance}`,
              invalidateOnRefresh: true,
              snap: {
                snapTo: 1 / (slides.length - 1),
                duration: 0.8,
                ease: "power2.inOut",
              },
            },
          });
          slides.forEach((slide, index) => {
            ScrollTrigger.create({
              trigger: slide,
              containerAnimation: scrollTween,
              start: "left center",
              end: "right center",
              onToggle: (self) => self.isActive && setActiveSlide(index),
            });
          });
        }
      }

      // GSAP Animation for Pool Details Section
      const infoCards = gsap.utils.toArray(".pool-info-card");
      if (infoCards.length > 0) {
        gsap.fromTo(
          infoCards,
          { opacity: 0, y: 50 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power3.out",
            stagger: 0.2,
            scrollTrigger: {
              trigger: poolDetailsRef.current,
              start: "top 70%",
              toggleActions: "play none none none",
            },
          }
        );
      }

      // GSAP Animation for Training Section
      const mm = gsap.matchMedia();
      mm.add("(min-width: 1024px)", () => {
        const container = trainingSectionRef.current.querySelector(
          ".animation-container"
        );
        const heroText = trainingSectionRef.current.querySelector(
          ".training-hero-text"
        );
        const cards = gsap.utils.toArray(".training-card");
        const totalCards = cards.length;

        const horizontalGap = 10;
        const sidePadding = 100;
        const totalGapWidth = (totalCards - 1) * horizontalGap;
        const availableWidth = window.innerWidth - totalGapWidth - sidePadding;
        const cardWidth = availableWidth / totalCards;
        const cardHeight = cardWidth * 1.4;

        gsap.set(cards, {
          width: cardWidth,
          height: cardHeight,
        });

        // Initial positions for the 3D animation
        gsap.set(cards, {
          opacity: 0,
          scale: 0.8,
          transformStyle: "preserve-3d",
        });
        gsap.set(cards[0], {
          transform: "translate3d(-150%, -100%, -800px) rotateY(45deg)",
        });
        gsap.set(cards[1], {
          transform: "translate3d(150%, -100%, -800px) rotateY(-45deg)",
        });
        gsap.set(cards[2], { transform: "translate3d(0, 180%, -900px)" });
        gsap.set(cards[3], {
          transform: "translate3d(120%, 100%, -800px) rotateY(-30deg)",
        });
        gsap.set(cards[4], {
          transform: "translate3d(-120%, 100%, -800px) rotateY(30deg)",
        });
        gsap.set(cards[5], {
          transform: "translate3d(0, 0, -1200px) scale(1.2)",
        });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: trainingSectionRef.current,
            start: "top top",
            end: "bottom bottom",
            scrub: 6,
            pin: container,
            anticipatePin: 1,
          },
        });

        tl.to(
          heroText,
          {
            scale: 0.5,
            opacity: 0,
            z: -2000,
          },
          0
        );

        tl.to(
          cards,
          {
            opacity: 1,
            scale: 1,
            x: (index) => {
              const centerOffset = (totalCards - 1) / 2;
              return (index - centerOffset) * (cardWidth + horizontalGap);
            },
            y: 0,
            z: 0,
            rotationY: 0,
            ease: "power2.inOut",
            stagger: {
              each: 0.05,
              from: "center",
            },
          },
          0.1
        );
      });
    });
    return () => ctx.revert();
  }, []);

  // Component functions
  const handleExploreClick = () => {
    document
      .getElementById("nbl-intro-section")
      .scrollIntoView({ behavior: "smooth" });
  };
  const openModal = (images, index) => {
    setModalState({ isOpen: true, images, currentIndex: index });
  };
  const closeModal = () => {
    setModalState((prevState) => ({ ...prevState, isOpen: false }));
  };
  const showNextImage = (e) => {
    e.stopPropagation();
    setModalState((prevState) => ({
      ...prevState,
      currentIndex: (prevState.currentIndex + 1) % prevState.images.length,
    }));
  };
  const showPrevImage = (e) => {
    e.stopPropagation();
    setModalState((prevState) => ({
      ...prevState,
      currentIndex:
        (prevState.currentIndex - 1 + prevState.images.length) %
        prevState.images.length,
    }));
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen font-sans overflow-x-hidden">
      {!isMenuOpen && <MenuButton onClick={() => setIsMenuOpen(true)} />}

      <SideMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      {/* ... (Hero, Divider, "What is NBL?" sections ) ... */}

      <div
  
  className="relative flex flex-col items-center justify-center h-screen overflow-hidden"
>
  
  <video
    autoPlay
    loop
    muted
    
    className="absolute inset-0 w-full h-full object-cover"
  >
    <source src="/nbl-pool.mp4" type="video/mp4" />
    Your browser does not support the video tag.
  </video>

  <div className="absolute inset-0 bg-black opacity-70"></div>

  <div
    className={`relative z-10 flex flex-col items-center p-8 transition-opacity duration-1000 ${
      showContent ? "opacity-100" : "opacity-0"
    }`}
  >
    <h1 className="text-4xl md:text-7xl font-bold tracking-tight text-center relative z-20">
      <span
        className="text-transparent bg-clip-text"
        style={{
          backgroundImage:
            "linear-gradient(120deg, #FFFFFF, #E0F2FE, #BFDBFE)",
        }}
      >
        NEUTRAL BUOYANCY LABORATORY
      </span>
    </h1>
    <p className="text-lg md:text-2xl mt-4 text-center text-gray-200 max-w-2xl italic font-light">
      Training in a Fluid Universe
    </p>
    <button
      onClick={handleExploreClick}
      className="mt-12 px-8 py-3 bg-transparent border-2 border-blue-300 text-blue-300 text-lg rounded-full font-medium transition-colors duration-300 hover:bg-blue-300 hover:text-gray-900 relative overflow-hidden group"
    >
      <span className="relative z-10">EXPLORE THE NBL</span>
      <span className="absolute inset-0 w-full h-full rounded-full transition-all duration-500 transform scale-0 group-hover:scale-150 bg-blue-300 opacity-0 group-hover:opacity-20"></span>
    </button>
  </div>
</div>

      

      <div id="nbl-intro-section" className="py-10 px-8 lg:px-24">
        <div className="flex flex-col lg:flex-row items-center lg:space-x-12">
          <div
            ref={leftColumnRef}
            className="w-full lg:w-1/2 relative rounded-xl shadow-xl border border-blue-700 overflow-hidden opacity-0"
          >
            <div className="relative w-full aspect-video">
              <img
                src="/nbl_image.jpg"
                alt="Astronaut training in the Neutral Buoyancy Laboratory"
                className="absolute inset-0 w-full h-full object-cover rounded-xl"
              />
            </div>
          </div>
          <div
            ref={rightColumnRef}
            className="w-full lg:w-1/2 mt-12 lg:mt-0 lg:pl-10 p-6 rounded-xl shadow-2xl backdrop-filter backdrop-blur-lg bg-white bg-opacity-5 border border-blue-600 opacity-0"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-blue-300">
              Microgravity's Earthly Counterpart
            </h2>
            <p className="text-md md:text-lg leading-relaxed text-gray-200 mb-6">
              NASA built the{" "}
              <span className="font-bold text-blue-300">
                Neutral Buoyancy Laboratory (NBL)
              </span>{" "}
              to address a fundamental challenge of human spaceflight: training
              for <span className="font-bold text-blue-300">spacewalks</span>.
              This massive pool, containing full-size{" "}
              <span className="font-bold text-blue-300">mockups</span> of the{" "}
              <span className="font-bold text-blue-300">
                International Space Station
              </span>{" "}
              and other spacecraft, serves as a crucial training ground. By
              submerging astronauts and equipment, the NBL simulates the{" "}
              <span className="font-bold text-blue-300">weightlessness</span> of{" "}
              <span className="font-bold text-blue-300">microgravity</span>,
              allowing crews to practice complex tasks and procedures safely and
              efficiently before they perform them in the unforgiving vacuum of
              space. The NBL's primary role is to ensure{" "}
              <span className="font-bold text-blue-300">
                astronaut readiness
              </span>
              ,{" "}
              <span className="font-bold text-blue-300">
                mastery of mission protocols
              </span>
              , and the successful{" "}
              <span className="font-bold text-blue-300">assembly</span>,{" "}
              <span className="font-bold text-blue-300">maintenance</span>, and{" "}
              <span className="font-bold text-blue-300">repair</span> of
              spacecraft in orbit.
            </p>
            <div className="text-lg font-light italic text-blue-400 mb-2">
              System Metrics
            </div>
            <ul className="list-none text-md text-gray-300 space-y-2">
              <li>
                <span className="text-blue-400 mr-2">&#x25cf;</span> Pool Size:
                202 ft x 102 ft
              </li>
              <li>
                <span className="text-blue-400 mr-2">&#x25cf;</span> Depth: 40
                ft
              </li>
              <li>
                <span className="text-blue-400 mr-2">&#x25cf;</span> Volume:
                6.2M Gallons
              </li>
            </ul>
          </div>
        </div>
      </div>

      

      <section
  id="nbl-history-section"
  ref={timelineWrapperRef}
  className="relative h-screen bg-cover bg-center bg-fixed"
  style={{
    backgroundImage:
      'linear-gradient(rgba(17, 24, 39, 0.5), rgba(17, 24, 39, 0.5)), url("/nbl-bg.jpg")', // Opacity reduced from 0.95 to 0.5
  }}
>
        <div
          ref={horizontalScrollRef}
          className="flex h-full"
          style={{ width: `${nblTimelineData.length * 100}vw` }}
        >
          {nblTimelineData.map((item, index) => (
            <div
              key={index}
              className="timeline-slide w-screen h-full flex flex-col justify-center items-center gap-20 p-8 relative"
            >
              <div className="text-center max-w-5xl mx-auto">
                <p className="text-8xl font-bold text-blue-200 mb-6">
                  {item.year}
                </p>
                <p className="text-lg text-gray-200 leading-relaxed">
                  <strong className="text-2xl text-white font-bold">
                    {item.title}:
                  </strong>{" "}
                  {item.text}
                </p>
              </div>
              <div className="flex justify-center items-center gap-8 px-4">
                {item.images.map((imgSrc, imgIndex) => (
                  <div
                    key={imgIndex}
                    onClick={() => openModal(item.images, imgIndex)}
                    className="relative group w-72 h-48 rounded-lg shadow-lg cursor-pointer overflow-hidden animate-float"
                    style={{ animationDelay: `${imgIndex * 400}ms` }}
                  >
                    <img
                      src={imgSrc}
                      alt={`${item.title} gallery image ${imgIndex + 1}`}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <svg
                        className="w-12 h-12 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-10 flex gap-4">
          {nblTimelineData.map((_, index) => (
            <div
              key={index}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                activeSlide === index ? "bg-blue-400 scale-125" : "bg-gray-600"
              }`}
            />
          ))}
        </div>
      </section>

      <section
        id="nbl-pool-details-section"
        ref={poolDetailsRef}
        className="relative py-20 px-8 lg:px-24 bg-gray-900 overflow-hidden"
      >
        <div
          className="absolute top-0 left-0 w-full h-full opacity-10"
          style={{
            backgroundImage: "url(/nbl-water-bg.jpg)",
            backgroundSize: "cover",
            backgroundAttachment: "fixed",
          }}
        ></div>
        <div className="relative max-w-7xl mx-auto z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-blue-300 mb-4">
              Inside the Depths
            </h2>
            <p className="text-lg text-gray-300 max-w-3xl mx-auto">
              The Neutral Buoyancy Laboratory pool is more than just water; it's
              a meticulously controlled environment designed to be a
              high-fidelity simulator for the vacuum of space.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
            <div className="pool-info-card p-6 rounded-xl shadow-2xl backdrop-filter backdrop-blur-lg bg-white bg-opacity-5 border border-blue-600 transition-all duration-300 hover:border-blue-400 hover:scale-105">
              <p className="text-blue-400 text-sm font-semibold uppercase">
                Length
              </p>
              <p className="text-3xl font-bold text-white">62 meters</p>
              <p className="text-lg text-gray-400">(202 ft)</p>
            </div>
            <div className="pool-info-card p-6 rounded-xl shadow-2xl backdrop-filter backdrop-blur-lg bg-white bg-opacity-5 border border-blue-600 transition-all duration-300 hover:border-blue-400 hover:scale-105">
              <p className="text-blue-400 text-sm font-semibold uppercase">
                Width
              </p>
              <p className="text-3xl font-bold text-white">31 meters</p>
              <p className="text-lg text-gray-400">(102 ft)</p>
            </div>
            <div className="pool-info-card p-6 rounded-xl shadow-2xl backdrop-filter backdrop-blur-lg bg-white bg-opacity-5 border border-blue-600 transition-all duration-300 hover:border-blue-400 hover:scale-105">
              <p className="text-blue-400 text-sm font-semibold uppercase">
                Depth
              </p>
              <p className="text-3xl font-bold text-white">12 meters</p>
              <p className="text-lg text-gray-400">(40 ft)</p>
            </div>
            <div className="pool-info-card p-6 rounded-xl shadow-2xl backdrop-filter backdrop-blur-lg bg-white bg-opacity-5 border border-blue-600 transition-all duration-300 hover:border-blue-400 hover:scale-105">
              <p className="text-blue-400 text-sm font-semibold uppercase">
                Volume
              </p>
              <p className="text-3xl font-bold text-white">23.5M Liters</p>
              <p className="text-lg text-gray-400">(6.2M gal)</p>
            </div>
          </div>

          <div className="text-center mb-10">
            <h3 className="text-3xl font-bold text-blue-300">
              What's Submerged?
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="pool-info-card p-6 flex items-start gap-4 rounded-xl backdrop-filter backdrop-blur-lg bg-white bg-opacity-5 border border-blue-700">
              <svg
                className="w-12 h-12 text-blue-400 flex-shrink-0 mt-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9V3m0 18a9 9 0 00-9-9m9 9h9"
                />
              </svg>
              <div>
                <h4 className="text-xl font-bold text-white">ISS Mock-ups</h4>
                <p className="text-gray-300 mt-1">
                  Full-scale, high-fidelity models of International Space
                  Station modules, trusses, and airlocks.
                </p>
              </div>
            </div>
            <div className="pool-info-card p-6 flex items-start gap-4 rounded-xl backdrop-filter backdrop-blur-lg bg-white bg-opacity-5 border border-blue-700">
              <svg
                className="w-12 h-12 text-blue-400 flex-shrink-0 mt-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z"
                />
              </svg>
              <div>
                <h4 className="text-xl font-bold text-white">
                  Astronauts in Training
                </h4>
                <p className="text-gray-300 mt-1">
                  Crews wearing pressurized training suits that weigh hundreds
                  of pounds on land but are neutrally buoyant in water.
                </p>
              </div>
            </div>
            <div className="pool-info-card p-6 flex items-start gap-4 rounded-xl backdrop-filter backdrop-blur-lg bg-white bg-opacity-5 border border-blue-700">
              <svg
                className="w-12 h-12 text-blue-400 flex-shrink-0 mt-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6V4m0 16v-2m8-8h2M4 12H2m15.364 6.364l-1.414-1.414M6.05 6.05L4.636 4.636m12.728 0l-1.414 1.414M6.05 17.95l1.414-1.414"
                />
              </svg>
              <div>
                <h4 className="text-xl font-bold text-white">
                  Safety & Utility Divers
                </h4>
                <p className="text-gray-300 mt-1">
                  Teams of SCUBA divers who act as guardians, camera operators,
                  and assistants during training runs.
                </p>
              </div>
            </div>
            <div className="pool-info-card p-6 flex items-start gap-4 rounded-xl backdrop-filter backdrop-blur-lg bg-white bg-opacity-5 border border-blue-700">
              <svg
                className="w-12 h-12 text-blue-400 flex-shrink-0 mt-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <div>
                <h4 className="text-xl font-bold text-white">
                  Space Tools & Hardware
                </h4>
                <p className="text-gray-300 mt-1">
                  Specialized instruments, power tools, and repair kits, all
                  designed to be neutrally buoyant for realistic handling.
                </p>
              </div>
            </div>
            <div className="pool-info-card p-6 flex items-start gap-4 rounded-xl backdrop-filter backdrop-blur-lg bg-white bg-opacity-5 border border-blue-700">
              <svg
                className="w-12 h-12 text-blue-400 flex-shrink-0 mt-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              <div>
                <h4 className="text-xl font-bold text-white">
                  Control & Comm Systems
                </h4>
                <p className="text-gray-300 mt-1">
                  A network of cameras and communication links that connect the
                  astronauts to a topside mission control room.
                </p>
              </div>
            </div>
            <div className="pool-info-card p-6 flex items-start gap-4 rounded-xl backdrop-filter backdrop-blur-lg bg-white bg-opacity-5 border border-blue-700">
              <svg
                className="w-12 h-12 text-blue-400 flex-shrink-0 mt-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
                />
              </svg>
              <div>
                <h4 className="text-xl font-bold text-white">Robotic Arms</h4>
                <p className="text-gray-300 mt-1">
                  Mockups of robotic systems like the Canadarm2, allowing
                  astronauts to practice coordinated tasks with robotics
                  operators.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="nbl-training-section"
        className="relative bg-gray-900" 
      >
        <div ref={trainingSectionRef} className="h-[180vh]">
          <div
            className="animation-container sticky top-0 h-screen w-full overflow-hidden"
            style={{ perspective: "1000px" }}
          >
            {/* Background Video & Overlay */}
            <video
              autoPlay
              loop
              muted
              playsInline
              className="absolute top-0 left-0 w-full h-full object-cover z-0"
            >
              <source src="/newvid.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            <div className="absolute top-0 left-0 w-full h-full bg-black/60 z-10"></div>

            {/* 1. The Sticky Heading */}
            <div className="absolute top-0 left-0 right-0 pt-20 text-center z-20">
              <h2 className="text-4xl md:text-5xl font-bold text-blue-300">
                Astronaut Training at the NBL
              </h2>
            </div>

            {/* 2. The Animation Wrapper (Ensure it's above the overlay) */}
            <div className="relative w-full h-full flex justify-center items-center z-20">
              <div
                className="training-hero-text absolute text-center max-w-3xl px-4 z-10"
                style={{ transformStyle: "preserve-3d" }}
              >
                <p className="text-lg text-gray-300 max-w-3xl mx-auto mb-6">
                  Astronauts practice spacewalks and repairs in NASA’s giant
                  underwater pool, simulating microgravity for real missions.
                </p>
              </div>

              {trainingData.map((card) => (
                <div
                  key={card.id}
                  className="training-card absolute p-6 flex flex-col gap-4 rounded-xl shadow-2xl backdrop-filter backdrop-blur-lg bg-white/5 border border-blue-500/50"
                >
                  <h3 className="text-xl font-bold text-blue-300">
                    {card.title}
                  </h3>
                  <ul className="list-none space-y-2">
                    {card.content.map((item, itemIndex) => (
                      <li
                        key={itemIndex}
                        className="text-sm text-gray-300 pl-4 relative before:content-['›'] before:absolute before:left-0 before:text-blue-400 before:font-bold"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Link
        to="/quiz"
        className="fixed bottom-8 right-8 z-40 group"
        aria-label="Initiate Simulation"
      >
        <button className="relative w-16 h-16 rounded-full flex items-center justify-center bg-cyan-600 text-white border-2 border-cyan-500/50 shadow-lg transition-all duration-300 ease-in-out group-hover:w-32 animate-pulseGlow">
          {/* Arrow Icon: Visible by default, fades out on hover */}
          <div className="absolute transition-opacity duration-300 group-hover:opacity-0 group-hover:rotate-45">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </div>

          {/* QUIZ Text: Hidden by default, fades in on hover */}
          <div className="absolute transition-opacity duration-300 opacity-0 group-hover:opacity-100">
            <span className="text-lg font-bold tracking-wider uppercase">
              Quiz
            </span>
          </div>
        </button>
      </Link>

      {modalState.isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50 cursor-pointer"
          onClick={closeModal}
        >
          <button
            onClick={showPrevImage}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-50 p-2 bg-white/20 rounded-full hover:bg-white/40 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <img
            src={modalState.images[modalState.currentIndex]}
            alt="Enlarged view"
            className="max-w-[85vw] max-h-[85vh] object-contain rounded-lg shadow-2xl"
          />

          <button
            onClick={showNextImage}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-50 p-2 bg-white/20 rounded-full hover:bg-white/40 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>

          <button
            onClick={closeModal}
            className="absolute top-5 right-5 text-white text-4xl font-bold z-50"
          >
            &times;
          </button>
        </div>
      )}
    </div>
  );
};

export default IntroPage;
