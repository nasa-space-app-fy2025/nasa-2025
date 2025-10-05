import React, { useLayoutEffect } from 'react';
import { Routes, Route } from 'react-router-dom';

import IntroPage3 from './components/Intropage3';
import Quiz from './components/Quiz.jsx';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from '@studio-freight/lenis';

import Page from './cupola/pages/Page.jsx'; // Import your main page
import Simulation from './cupola/pages/simulation.jsx'; // Import your simulation page
import CupolaQuiz from './cupola/pages/cupolaquiz.jsx';
import ExploreSelect from './home.jsx';

function App() {
  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const lenis = new Lenis();
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);
    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <Routes>
      <Route path="/" element={<ExploreSelect />} />
      <Route path="/nbl" element={<IntroPage3 />} />
      <Route path="/nbl-quiz" element={<Quiz />} />

      <Route path="/cupola" element={<Page />} />
      <Route path="/simulation" element={<Simulation />} />
      <Route path="/cupola-quiz" element={<CupolaQuiz />} />
    </Routes>
  );
}

export default App;