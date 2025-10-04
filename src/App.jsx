import React, { useLayoutEffect } from 'react';

import { Routes, Route } from 'react-router-dom';
import IntroPage3 from './components/Intropage3';
import Quiz from './components/Quiz.jsx';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from '@studio-freight/lenis';

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
      <Route path="/" element={<IntroPage3 />} />

      <Route path="/quiz" element={<Quiz />} />
    </Routes>
  );
}

export default App;