import React, { useEffect, useRef, useState } from "react";
import { Link } from 'react-router-dom';

// --- Data for the Quiz ---
const QUESTIONS = [
  {
    q: "What is the primary purpose of NASA's Neutral Buoyancy Laboratory (NBL)?",
    opts: ["Deep-sea research", "Training astronauts for spacewalks", "Testing submarine hulls", "Olympic swim practice"],
    answer: 1,
    fun: "The NBL is essential for astronauts to practice EVA (Extravehicular Activity) tasks in a simulated weightless environment.",
  },
  {
    q: "The NBL pool contains full-scale mockups of which major structure?",
    opts: ["Hubble Space Telescope", "The Starship rocket", "The International Space Station", "A lunar base"],
    answer: 2,
    fun: "Yep, a huge portion of the ISS is submerged in the pool, allowing for realistic training scenarios.",
  },
  {
    q: "How does the NBL simulate the microgravity of space?",
    opts: ["Using anti-gravity generators", "By making astronauts neutrally buoyant", "By spinning them in a centrifuge", "It's a computer simulation"],
    answer: 1,
    fun: "Divers carefully add weights to the spacesuit until the astronaut neither sinks nor floats—achieving neutral buoyancy.",
  },
  {
    q: "In which city is the Neutral Buoyancy Laboratory located?",
    opts: ["Cape Canaveral, Florida", "Houston, Texas", "Huntsville, Alabama", "Washington, D.C."],
    answer: 1,
    fun: "It's located at the Sonny Carter Training Facility, near the Johnson Space Center in Houston.",
  },
  {
    q: "Approximately how deep is the main NBL pool?",
    opts: ["10 feet (3 m)", "20 feet (6 m)", "40 feet (12 m)", "100 feet (30 m)"],
    answer: 2,
    fun: "The 40-foot depth is necessary to accommodate the large space station modules and training maneuvers.",
  },
  {
    q: "What does 'EVA' stand for in the context of NBL training?",
    opts: ["Emergency Vehicle Access", "Extra Vehicular Activity", "Estimated Vehicle Arrival", "Engine Vibration Analysis"],
    answer: 1,
    fun: "Extravehicular Activity is the official term for any activity done by an astronaut outside a spacecraft—a spacewalk.",
  },
  {
    q: "Who assists the astronauts underwater during NBL training simulations?",
    opts: ["Robotic drones", "Other astronauts only", "Professional SCUBA divers", "Navy SEALs"],
    answer: 2,
    fun: "A team of highly trained SCUBA divers provides support, managing safety, equipment, and filming the training.",
  },
  {
    q: "Astronauts training in the NBL wear modified versions of which spacesuit?",
    opts: ["The classic Apollo A7L suit", "The orange 'Pumpkin' suit", "The EMU spacesuit", "A standard wetsuit"],
    answer: 2,
    fun: "They use training versions of the Extravehicular Mobility Unit (EMU), the same white suit used for ISS spacewalks.",
  },
  {
    q: "The NBL pool holds an incredible amount of water, roughly:",
    opts: ["50,000 gallons", "500,000 gallons", "1.2 million gallons", "6.2 million gallons"],
    answer: 3,
    fun: "At 6.2 million gallons (23.5 million liters), it's one of the largest indoor pools in the world.",
  },
  {
    q: "How long can a typical NBL training session last for an astronaut?",
    opts: ["30 minutes", "1-2 hours", "Up to 6-7 hours", "24 hours"],
    answer: 2,
    fun: "Simulations can last for many hours to mimic the duration and fatigue of a real spacewalk.",
  }
];


//================================================================
// --- 1. VERLET PHYSICS ENGINE LOGIC (Unchanged) ---
// ... This part is identical to the original ...
//================================================================

// Vector math helper
const Vec2 = function (x, y) {
  this.x = x || 0.0;
  this.y = y || 0.0;
};
Vec2.prototype = { set: function(x,y){this.x=x;this.y=y;return this},copy:function(v){this.x=v.x;this.y=v.y;return this},neg:function(){this.x=-this.x;this.y=-this.y;return this},sub:function(v0,v1){this.x=v0.x-v1.x;this.y=v0.y-v1.y;return this},scale:function(v,s){this.x=v.x*s;this.y=v.y*s;return this},dot:function(v){return this.x*v.x+this.y*v.y},squareDist:function(v){const a=this.x-v.x,b=this.y-v.y;return a*a+b*b},length:function(){return Math.sqrt(this.x*this.x+this.y*this.y)},perp:function(v){this.x=-v.y;this.y=v.x;return this},normal:function(v0,v1){const a=v0.y-v1.y,b=v1.x-v0.x,c=1/Math.sqrt(a*a+b*b);this.x=a*c;this.y=b*c;return this}};
// Constraint between two vertices
const Constraint=function(a,b,c,d){this.parent=a;this.v0=b;this.v1=c;this.p0=b.position;this.p1=c.position;this.dist=this.p0.squareDist(this.p1);this.edge=d};Constraint.prototype.solve=function(){const a=this.p1.x-this.p0.x,b=this.p1.y-this.p0.y,c=this.dist/(a*a+b*b+this.dist)-.5,d=a*c,e=b*c;this.p1.x+=d;this.p1.y+=e;this.p0.x-=d;this.p0.y-=e};
// Physics body
const Body=function(a,b){this.engine=a;this.vCount=0;this.eCount=0;this.vertices=[];this.positions=[];this.edges=[];this.center=new Vec2;this.halfEx=new Vec2;this.min=0;this.max=0;this.color=b.color||"#EDF236";this.mass=b.mass||1;const c=function(d,e,f){this.parent=d;this.engine=f;this.position=new Vec2(e.x,e.y);this.oldPosition=new Vec2(e.x,e.y)};c.prototype.integrate=function(){const d=this.position,e=this.oldPosition,f=d.x,g=d.y,{kViscosity:h,kGravity:i,kFrictionGround:j,canvas:k}=this.engine.settings;d.x+=h*d.x-h*e.x;d.y+=h*d.y-h*e.y+i;e.set(f,g);const l=Math.max(20,Math.abs(this.parent.halfEx.x||20)),m=Math.max(20,Math.abs(this.parent.halfEx.y||20));d.y<m?d.y=m:d.y>k.height-m&&(d.x-=(d.y-(k.height-m))*(d.x-e.x)*j,d.y=k.height-m);d.x<l?d.x=l:d.x>k.width-l&&(d.x=k.width-l)};for(const d in b.vertices){const e=new c(this,b.vertices[d],this.engine);b.vertices[d].ref=e;this.vertices.push(e);this.positions.push(e.position);this.engine.vertices.push(e);this.vCount++}for(let d=0;d<b.constraints.length;d++){const e=b.constraints[d],f=new Constraint(this,b.vertices[e[0]].ref,b.vertices[e[1]].ref,e[2]||!1);f.edge&&(this.edges.push(f),this.eCount++);this.engine.constraints.push(f)}};Body.prototype.boundingBox=function(){let a=99999,b=99999,c=-99999,d=-99999;for(let e=0;e<this.vCount;e++){const f=this.positions[e];f.x>c&&(c=f.x);f.y>d&&(d=f.y);f.x<a&&(a=f.x);f.y<b&&(b=f.y)}this.center.set((a+c)*.5,(b+d)*.5);this.halfEx.set((c-a)*.5,(d-b)*.5)};Body.prototype.projectAxis=function(a){let b=this.positions[0].dot(a);this.min=this.max=b;for(let c=1;c<this.vCount;c++)b=this.positions[c].dot(a),b>this.max?this.max=b:b<this.min&&(this.min=b)};Body.prototype.draw=function(){const{ctx:a,pointer:b,engine:c}=this.engine.settings;a.beginPath();let d=this.edges[0].p0;a.moveTo(d.x,d.y);for(let e=1;e<this.eCount;e++)d=this.edges[e].p0,a.lineTo(d.x,d.y);a.closePath();a.fillStyle=this.color;a.fill();if(b.isDown&&!c.dragVertex.current&&a.isPointInPath(b.x,b.y)){let d=99999;for(let e=0;e<this.vCount;e++){const f=this.positions[e].squareDist(b);f<d&&(c.dragVertex.current=this.vertices[e],d=f)}}};
// SAT collision
const collision={testAxis:new Vec2,axis:new Vec2,center:new Vec2,line:new Vec2,response:new Vec2,relVel:new Vec2,tangent:new Vec2,relTanVel:new Vec2,depth:0,edge:null,vertex:null,SAT:function(a,b){if(!(0>Math.abs(b.center.x-a.center.x)-(b.halfEx.x+a.halfEx.x)&&0>Math.abs(b.center.y-a.center.y)-(b.halfEx.y+a.halfEx.y)))return!1;let c=99999;const d=a.eCount,e=b.eCount;for(let f=0,g=d+e;f<g;f++){const h=f<d?a.edges[f]:b.edges[f-d];this.testAxis.normal(h.p0,h.p1);a.projectAxis(this.testAxis);b.projectAxis(this.testAxis);const i=a.min<b.min?b.min-a.max:a.min-b.max;if(i>0)return!1;else if(Math.abs(i)<c)c=Math.abs(i),this.axis.copy(this.testAxis),this.edge=h}this.depth=c;this.edge.parent!==b&&([a,b]=[b,a]);const f=this.center.sub(a.center,b.center).dot(this.axis);f<0&&this.axis.neg();let g=99999;for(let h=0;h<a.vCount;h++){const i=a.vertices[h];this.line.sub(i.position,b.center);const j=this.axis.dot(this.line);j<g&&(g=j,this.vertex=i)}return!0},resolve:function(a){const{kFriction:b}=a.settings,c=this.edge.p0,d=this.edge.p1,e=this.edge.v0.oldPosition,f=this.edge.v1.oldPosition,g=this.vertex.position,h=this.vertex.oldPosition,i=this.response;this.response.scale(this.axis,this.depth);const j=Math.abs(c.x-d.x)>Math.abs(c.y-d.y)?(g.x-i.x-c.x)/(d.x-c.x):(g.y-i.y-c.y)/(d.y-c.y),k=1/(j*j+(1-j)*(1-j)),l=this.vertex.parent.mass,m=this.edge.parent.mass,n=l+m,o=l/n,p=m/n;c.x-=i.x*(1-j)*k*p;c.y-=i.y*(1-j)*k*p;d.x-=i.x*j*k*p;d.y-=i.y*j*k*p;g.x+=i.x*o;g.y+=i.y*o;this.relVel.set(g.x-h.x-(c.x+d.x-e.x-f.x)*.5,g.y-h.y-(c.y+d.y-e.y-f.y)*.5);this.tangent.perp(this.axis);const q=this.relVel.dot(this.tangent),r=this.relTanVel.set(this.tangent.x*q,this.tangent.y*q);h.x+=r.x*b*p;h.y+=r.y*b*p;e.x-=r.x*(1-j)*b*k*o;e.y-=r.y*(1-j)*b*k*o;f.x-=r.x*j*b*k*o;f.y-=r.y*j*b*k*o}};


//================================================================
// --- 2. THE REACT COMPONENT ---
//================================================================

export default function NBLQuiz() {
  // --- React State ---
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [buoyant, setBuoyant] = useState(true);
  const [score, setScore] = useState(0);
  const [quizComplete, setQuizComplete] = useState(false);

  // --- Canvas and Physics Refs ---
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const engineRef = useRef(null);

  // --- Main useEffect for setting up the physics simulation ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let w = (canvas.width = canvas.clientWidth);
    let h = (canvas.height = canvas.clientHeight);

    // --- Engine Instance ---
    const engine = {
      // --- Engine State ---
      bodies: [],
      vertices: [],
      constraints: [],
      dragVertex: { current: null },
      gravityTween: { active: false, start: 0, end: 0, startTime: 0, duration: 0 },
      
      // --- Engine Settings (mutable) ---
      settings: {
        kGravity: buoyant ? 0.0 : 0.1,
        kNumIterations: 5,
        kFriction: 0.2,
        kFrictionGround: 0.1,
        kViscosity: 0.99, // a little 'water drag'
        kForceDrag: 5,
        mouseInfluenceRadius: 80,
        mouseInfluenceStrength: 0.6,
        canvas: { width: w, height: h },
        ctx: ctx,
        pointer: { x: 0, y: 0, isDown: false },
        engine: null,
      },
      
      // --- Engine Methods ---
      init: function () {
        this.bodies = [];
        this.vertices = [];
        this.constraints = [];
        
        // A single, blocky "module" to represent training equipment
        this.createRectangle(w / 2 - 50, h / 3, 100, 60, 20, "#EAEAEA");

        // Create random "bubbles" - INCREASED COUNT
        for (let k = 0; k < 25; k++) {
            const rx = 50 + Math.random() * (w - 100);
            const ry = 50 + Math.random() * (h - 100);
            this.createCircle(rx, ry, 10 + Math.random() * 20, 12, 5 + Math.random() * 10, ["#E0FBFC", "#98F5E1", "#38A3A5", "#B9FBC0"][k%4]);
        }

        // Create random smaller "debris" - INCREASED COUNT
        for (let i = 0; i < 30; i++) {
            const rx = 50 + Math.random() * (w - 100);
            const ry = 50 + Math.random() * (h - 100);
            const rw = 15 + Math.random() * 20;
            const rh = 15 + Math.random() * 20;
            this.createRectangle(rx, ry, rw, rh, 5 + Math.random() * 5, "#AAAAAA");
        }

        // Add even more boxy "equipment" pieces - NEWLY ADDED
        for (let i = 0; i < 15; i++) {
            const rx = 50 + Math.random() * (w - 100);
            const ry = 50 + Math.random() * (h - 100);
            const size = 25 + Math.random() * 25;
            this.createRectangle(rx, ry, size, size, 10 + Math.random() * 10, "#888888");
        }
      },
      
      createRectangle: function(x, y, w, h, m, c) {
        const b = new Body(this, {
          mass: m, color: c,
          vertices: { n0: { x: x, y: y }, n1: { x: x + w, y: y }, n2: { x: x + w, y: y + h }, n3: { x: x, y: y + h } },
          constraints: [ ["n0", "n1", true], ["n1", "n2", true], ["n2", "n3", true], ["n3", "n0", true], ["n0", "n2"], ["n3", "n1"] ]
        });
        this.bodies.push(b); return b;
      },
      
      createCircle: function(cx, cy, r, sides, m, c) {
        sides = sides || 10;
        const verts = {};
        for (let i = 0; i < sides; i++) {
          const a = (i / sides) * Math.PI * 2;
          verts["n" + i] = { x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r };
        }
        const constraints = [];
        for (let i = 0; i < sides; i++) {
          constraints.push(["n" + i, "n" + ((i + 1) % sides), true]);
        }
        const b = new Body(this, { mass: m, color: c, vertices: verts, constraints: constraints });
        this.bodies.push(b); return b;
      },

      setGravity: function(target, durationMs) {
          const tween = this.gravityTween;
          tween.active = false;
          if (!durationMs || durationMs <= 0) {
            this.settings.kGravity = target;
            return;
          }
          tween.active = true;
          tween.start = this.settings.kGravity;
          tween.end = target;
          tween.startTime = performance.now();
          tween.duration = durationMs;
      },
      
      stepGravityTween: function(now) {
          const tween = this.gravityTween;
          if (!tween.active) return;
          const t = (now - tween.startTime) / tween.duration;
          if (t >= 1) {
            this.settings.kGravity = tween.end;
            tween.active = false;
            return;
          }
          const eased = 1 - (1 - t) * (1 - t);
          this.settings.kGravity = tween.start + (tween.end - tween.start) * eased;
      }
    };
    
    engine.settings.engine = engine;
    engineRef.current = engine;
    engine.init();

    // --- Main Animation Loop ---
    const step = (now) => {
      engine.stepGravityTween(now);

      // Mouse interaction feels like creating currents
      if (buoyant && !engine.settings.pointer.isDown) {
        const { pointer, mouseInfluenceRadius, mouseInfluenceStrength } = engine.settings;
        const radiusSq = mouseInfluenceRadius * mouseInfluenceRadius;

        for (const vertex of engine.vertices) {
          const dx = vertex.position.x - pointer.x;
          const dy = vertex.position.y - pointer.y;
          const distSq = dx * dx + dy * dy;

          if (distSq < radiusSq) {
            const dist = Math.sqrt(distSq);
            const force = (1 - dist / mouseInfluenceRadius) * mouseInfluenceStrength;
            vertex.position.x += (dx / dist) * force;
            vertex.position.y += (dy / dist) * force;
          }
        }
      }

      for (let i = 0; i < engine.vertices.length; i++) engine.vertices[i].integrate();
      
      for (let n = 0; n < engine.settings.kNumIterations; n++) {
        for (let i = 0; i < engine.constraints.length; i++) engine.constraints[i].solve();
        for (let i = 0; i < engine.bodies.length; i++) engine.bodies[i].boundingBox();
        for (let i = 0; i < engine.bodies.length - 1; i++) {
          const b0 = engine.bodies[i];
          for (let j = i + 1; j < engine.bodies.length; j++) {
            const b1 = engine.bodies[j];
            if (collision.SAT(b0, b1)) collision.resolve(engine);
          }
        }
      }

      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < engine.bodies.length; i++) engine.bodies[i].draw();

      const dragV = engine.dragVertex.current;
      if (dragV) {
        ctx.beginPath();
        ctx.moveTo(dragV.position.x, dragV.position.y);
        ctx.lineTo(engine.settings.pointer.x, engine.settings.pointer.y);
        ctx.strokeStyle = "#98F5E1"; ctx.stroke(); // Seafoam green drag line
        const s = dragV.parent.mass * engine.settings.kForceDrag;
        dragV.position.x += (engine.settings.pointer.x - dragV.position.x) / s;
        dragV.position.y += (engine.settings.pointer.y - dragV.position.y) / s;
      }

      animRef.current = requestAnimationFrame(step);
    };

    animRef.current = requestAnimationFrame(step);

    // --- Event Listeners ---
    const handleResize = () => {
        w = engine.settings.canvas.width = canvas.width = canvas.clientWidth;
        h = engine.settings.canvas.height = canvas.height = canvas.clientHeight;
    };
    const handleMouseMove = (e) => {
        const rect = canvas.getBoundingClientRect();
        engine.settings.pointer.x = e.clientX - rect.left;
        engine.settings.pointer.y = e.clientY - rect.top;
    };
    const handleMouseDown = (e) => { engine.settings.pointer.isDown = true; handleMouseMove(e); };
    const handleMouseUp = () => { engine.settings.pointer.isDown = false; engine.dragVertex.current = null; };

    window.addEventListener("resize", handleResize);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mouseup", handleMouseUp);
    canvas.addEventListener("mouseout", handleMouseUp);
    
    // --- Cleanup ---
    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", handleResize);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("mouseup", handleMouseUp);
      canvas.removeEventListener("mouseout", handleMouseUp);
    };
  }, []); // Empty dependency array ensures this runs only once on mount

  // This effect listens for changes to `buoyant` and updates the physics engine
  useEffect(() => {
    if (engineRef.current) {
      if (buoyant) {
        engineRef.current.setGravity(0.0, 250);
      } else {
        engineRef.current.setGravity(0.1, 600);
      }
    }
  }, [buoyant]);

  // --- Quiz Logic Handlers ---
  const onSelect = (i) => {
    if (showAnswer) return;
    setSelected(i);
    setShowAnswer(true);
    if (i === current.answer) {
      setScore((s) => s + 1);
    }
  };

  const next = () => {
    setSelected(null);
    setShowAnswer(false);
    if (index === QUESTIONS.length - 1) {
        setQuizComplete(true);
    } else {
        setIndex((s) => s + 1);
    }
  };

  const restart = () => {
    setIndex(0);
    setSelected(null);
    setShowAnswer(false);
    setScore(0);
    setQuizComplete(false);
    if (engineRef.current) engineRef.current.init();
  };
  
  const current = QUESTIONS[index];

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#02091a]">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-0 block"></canvas>
      
      <button
        onClick={() => setBuoyant((b) => !b)}
        className="fixed top-4 right-4 z-30 px-4 py-2 rounded-full text-xs md:text-sm font-semibold border border-cyan-300/25 bg-blue-900/20 text-cyan-200 backdrop-blur-sm hover:scale-105 transition-transform"
        aria-pressed={buoyant}
        title="Toggle buoyancy"
      >
        {buoyant ? "Mode: Buoyant" : "Mode: Gravity"}
      </button>

      {/* Quiz card container */}
      <div className="relative z-20 flex items-center justify-center w-full h-full px-4 py-10 pointer-events-none">
        {quizComplete ? (
          // --- SCORE CARD ---
          <div className="max-w-xl w-full bg-slate-800/60 border border-cyan-400/20 rounded-2xl p-6 md:p-10 shadow-2xl backdrop-blur-sm pointer-events-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-cyan-300">Training Complete!</h2>
            <p className="mt-4 text-4xl md:text-5xl font-semibold text-white">
              {score} <span className="text-xl text-gray-400">/ {QUESTIONS.length}</span>
            </p>
            <p className="mt-2 text-gray-300">
              {score / QUESTIONS.length > 0.7 ? "Fantastic! You're ready for your spacewalk training!" : "Nice try! Keep studying those mission logs."}
            </p>
            <button
              onClick={restart}
              className="mt-8 px-6 py-3 rounded-md bg-cyan-600 text-white font-medium hover:bg-cyan-700 transition-colors"
            >
              Run Simulation Again
            </button>
          </div>
        ) : (
          // --- QUESTION CARD ---
          <div className="max-w-xl w-full bg-slate-800/60 border border-cyan-400/20 rounded-2xl p-6 md:p-10 shadow-2xl backdrop-blur-sm pointer-events-auto">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs text-cyan-300 font-medium">Question {index + 1} / {QUESTIONS.length}</div>
                <h3 className="mt-2 text-xl md:text-2xl font-semibold text-white">{current.q}</h3>
              </div>
              <div className="text-right text-xs text-gray-300">
                <div className="uppercase tracking-wide">Neutral Buoyancy Lab</div>
              </div>
            </div>
            <div className="mt-6 grid gap-3">
              {current.opts.map((opt, i) => {
                const correct = i === current.answer;
                const isSelected = i === selected;
                const showCorrect = showAnswer && correct;
                const showWrong = showAnswer && isSelected && !correct;
                let base = "rounded-lg p-3 md:p-4 text-sm md:text-base border transition-colors text-white";
                if (!showAnswer) base += " bg-cyan-400/5 border-cyan-400/10 hover:bg-cyan-400/20 cursor-pointer";
                if (showCorrect) base += " bg-teal-500/90 border-teal-400";
                else if (showWrong) base += " bg-orange-600/90 border-orange-500";
                return (
                  <div key={i} role="button" onClick={() => onSelect(i)} className={base}>
                    {opt}
                  </div>
                );
              })}
            </div>
            <div className="mt-6 flex items-center justify-between min-h-[40px]">
              <div className="text-sm text-gray-300 flex-1 pr-4">
                {showAnswer ? (
                  <div><strong>{current.opts[current.answer]} {" — "}</strong> <span>{current.fun}</span></div>
                ) : (
                  <div className="italic text-xs text-gray-400">Select an option to reveal the answer.</div>
                )}
              </div>
              <div>
                {showAnswer && (
                  index < QUESTIONS.length - 1 ? (
                    <button onClick={next} className="ml-3 px-4 py-2 rounded-md bg-cyan-600 text-white font-medium hover:bg-cyan-700">Next</button>
                  ) : (
                    <button onClick={() => setQuizComplete(true)} className="ml-3 px-4 py-2 rounded-md bg-teal-500 text-white font-medium hover:bg-teal-600">See Score</button>
                  )
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <Link
  to="/nbl"
  aria-label="Return to introduction page"
  className="absolute top-4 left-4 z-50 flex h-10 w-10 items-center justify-center rounded-full border border-cyan-300/25 bg-blue-900/20 text-cyan-200 backdrop-blur-sm transition-all hover:scale-105 hover:bg-blue-800/40"
>
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
  </svg>
</Link>
    </div>
  );
}