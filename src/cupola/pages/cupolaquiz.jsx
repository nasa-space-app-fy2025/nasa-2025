import React, { useEffect, useRef, useState } from "react";
import { Link } from 'react-router-dom';

// --- Data for the Quiz ---
const QUESTIONS = [
  {
    q: "How many windows does the ISS Cupola have?",
    opts: ["3", "5", "7", "9"],
    answer: 2,
    fun: "Yep — seven windows (one big central + 6 around).",
  },
  {
    q: "When was the Cupola first opened on the ISS?",
    opts: ["2001", "2010", "2015", "1998"],
    answer: 1,
    fun: "Installed in Feb 2010 during STS-130.",
  },
  {
    q: "The Cupola is primarily used for:",
    opts: ["Earth observation", "Cooking", "Sleeping", "Power generation"],
    answer: 0,
    fun: "It gives panoramic views for science, operations, and morale.",
  },
  {
    q: "Which agency built the Cupola?",
    opts: ["NASA", "ESA", "JAXA", "Roscosmos"],
    answer: 1,
    fun: "ESA (European Space Agency) developed it; NASA flew it up.",
  },
  {
    q: "Cupola's approximate diameter:",
    opts: ["2.9 m", "10 m", "0.8 m", "5.5 m"],
    answer: 0,
    fun: "About 2.955 m across — cozy window seat!",
  },
  {
    q: "Which robotic arm is often controlled from the Cupola?",
    opts: ["Canadarm2", "SSRMS", "R2-D2", "BigArm3000"],
    answer: 0,
    fun: "Canadarm2 aka SSRMS — astronauts use it for grappling spacecraft.",
  },
  {
    q: "Cupola helps with ___________________.",
    opts: ["vehicle docking", "baking cakes", "television", "satellite TV"],
    answer: 0,
    fun: "Dockings and robotic ops — critical work.",
  },
  {
    q: "The Cupola was delivered by:",
    opts: ["Space Shuttle", "Soyuz", "Dragon", "Falcon Heavy"],
    answer: 0,
    fun: "STS-130 (Space Shuttle Endeavour) in 2010.",
  },
  {
    q: "Which of these is a psychological benefit of Cupola?",
    opts: ["Stress relief", "Faster rockets", "Solar power", "WiFi"],
    answer: 0,
    fun: "Astronauts often use it to look at Earth — big morale boost.",
  },
  {
    q: "Cupola windows have protective _______.",
    opts: ["shutters", "screens", "curtains", "tint film"],
    answer: 0,
    fun: "They have shutters to protect during launch and debris events.",
  },
];

//================================================================
// --- 1. VERLET PHYSICS ENGINE LOGIC (Adapted for React) ---
// ... This part is unchanged ...
//================================================================

// Vector math helper
const Vec2 = function (x, y) {
  this.x = x || 0.0;
  this.y = y || 0.0;
};

Vec2.prototype = {
  set: function (x, y) {
    this.x = x;
    this.y = y;
    return this;
  },
  copy: function (v) {
    this.x = v.x;
    this.y = v.y;
    return this;
  },
  neg: function () {
    this.x = -this.x;
    this.y = -this.y;
    return this;
  },
  sub: function (v0, v1) {
    this.x = v0.x - v1.x;
    this.y = v0.y - v1.y;
    return this;
  },
  scale: function (v, s) {
    this.x = v.x * s;
    this.y = v.y * s;
    return this;
  },
  dot: function (v) {
    return this.x * v.x + this.y * v.y;
  },
  squareDist: function (v) {
    const dx = this.x - v.x;
    const dy = this.y - v.y;
    return dx * dx + dy * dy;
  },
  length: function () {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  },
  perp: function (v) {
    this.x = -v.y;
    this.y = v.x;
    return this;
  },
  normal: function (v0, v1) {
    const nx = v0.y - v1.y,
      ny = v1.x - v0.x;
    const len = 1.0 / Math.sqrt(nx * nx + ny * ny);
    this.x = nx * len;
    this.y = ny * len;
    return this;
  },
};

// Constraint between two vertices
const Constraint = function (parent, v0, v1, edge) {
  this.parent = parent;
  this.v0 = v0;
  this.v1 = v1;
  this.p0 = v0.position;
  this.p1 = v1.position;
  this.dist = this.p0.squareDist(this.p1);
  this.edge = edge;
};

Constraint.prototype.solve = function () {
  const dx = this.p1.x - this.p0.x;
  const dy = this.p1.y - this.p0.y;
  const delta = this.dist / (dx * dx + dy * dy + this.dist) - 0.5;
  const ddx = dx * delta;
  const ddy = dy * delta;
  this.p1.x += ddx;
  this.p1.y += ddy;
  this.p0.x -= ddx;
  this.p0.y -= ddy;
};

// Physics body (a collection of vertices and constraints)
const Body = function (engine, bodyData) {
  this.engine = engine;
  this.vCount = 0;
  this.eCount = 0;
  this.vertices = [];
  this.positions = [];
  this.edges = [];
  this.center = new Vec2();
  this.halfEx = new Vec2();
  this.min = 0;
  this.max = 0;
  this.color = bodyData.color || "#EDF236";
  this.mass = bodyData.mass || 1.0;

  const Vertex = function (parent, vertex, engine) {
    this.parent = parent;
    this.engine = engine;
    this.position = new Vec2(vertex.x, vertex.y);
    this.oldPosition = new Vec2(vertex.x, vertex.y);
  };

  Vertex.prototype.integrate = function () {
    const p = this.position,
      o = this.oldPosition;
    const x = p.x,
      y = p.y;
    const { kViscosity, kGravity, kFrictionGround, canvas } =
      this.engine.settings;

    p.x += kViscosity * p.x - kViscosity * o.x;
    p.y += kViscosity * p.y - kViscosity * o.y + kGravity;
    o.set(x, y);

    const paddingX = Math.max(20, Math.abs(this.parent.halfEx.x || 20));
    const paddingY = Math.max(20, Math.abs(this.parent.halfEx.y || 20));

    if (p.y < paddingY) p.y = paddingY;
    else if (p.y > canvas.height - paddingY) {
      p.x -= (p.y - (canvas.height - paddingY)) * (p.x - o.x) * kFrictionGround;
      p.y = canvas.height - paddingY;
    }
    if (p.x < paddingX) p.x = paddingX;
    else if (p.x > canvas.width - paddingX) p.x = canvas.width - paddingX;
  };

  for (const n in bodyData.vertices) {
    const vertex = new Vertex(this, bodyData.vertices[n], this.engine);
    bodyData.vertices[n].ref = vertex;
    this.vertices.push(vertex);
    this.positions.push(vertex.position);
    this.engine.vertices.push(vertex);
    this.vCount++;
  }

  for (let i = 0; i < bodyData.constraints.length; i++) {
    const bci = bodyData.constraints[i];
    const constraint = new Constraint(
      this,
      bodyData.vertices[bci[0]].ref,
      bodyData.vertices[bci[1]].ref,
      bci[2] || false
    );
    if (constraint.edge) {
      this.edges.push(constraint);
      this.eCount++;
    }
    this.engine.constraints.push(constraint);
  }
};

Body.prototype.boundingBox = function () {
  let minX = 99999.0,
    minY = 99999.0,
    maxX = -99999.0,
    maxY = -99999.0;
  for (let i = 0; i < this.vCount; i++) {
    const p = this.positions[i];
    if (p.x > maxX) maxX = p.x;
    if (p.y > maxY) maxY = p.y;
    if (p.x < minX) minX = p.x;
    if (p.y < minY) minY = p.y;
  }
  this.center.set((minX + maxX) * 0.5, (minY + maxY) * 0.5);
  this.halfEx.set((maxX - minX) * 0.5, (maxY - minY) * 0.5);
};

Body.prototype.projectAxis = function (axis) {
  let d = this.positions[0].dot(axis);
  this.min = this.max = d;
  for (let i = 1; i < this.vCount; i++) {
    d = this.positions[i].dot(axis);
    if (d > this.max) this.max = d;
    if (d < this.min) this.min = d;
  }
};

Body.prototype.draw = function () {
  const { ctx, pointer, engine } = this.engine.settings;
  ctx.beginPath();
  let p = this.edges[0].p0;
  ctx.moveTo(p.x, p.y);
  for (let i = 1; i < this.eCount; i++) {
    p = this.edges[i].p0;
    ctx.lineTo(p.x, p.y);
  }
  ctx.closePath();
  ctx.fillStyle = this.color;
  ctx.fill();

  if (pointer.isDown && !engine.dragVertex.current) {
    if (ctx.isPointInPath(pointer.x, pointer.y)) {
      let minDistance = 99999;
      for (let i = 0; i < this.vCount; i++) {
        const dist = this.positions[i].squareDist(pointer);
        if (dist < minDistance) {
          engine.dragVertex.current = this.vertices[i];
          minDistance = dist;
        }
      }
    }
  }
};

// SAT collision detection and resolution
const collision = {
  testAxis: new Vec2(),
  axis: new Vec2(),
  center: new Vec2(),
  line: new Vec2(),
  response: new Vec2(),
  relVel: new Vec2(),
  tangent: new Vec2(),
  relTanVel: new Vec2(),
  depth: 0,
  edge: null,
  vertex: null,
  SAT: function (B0, B1) {
    if (
      !(
        0 > Math.abs(B1.center.x - B0.center.x) - (B1.halfEx.x + B0.halfEx.x) &&
        0 > Math.abs(B1.center.y - B0.center.y) - (B1.halfEx.y + B0.halfEx.y)
      )
    )
      return false;

    let minDistance = 99999;
    const n0 = B0.eCount,
      n1 = B1.eCount;
    for (let i = 0, n = n0 + n1; i < n; i++) {
      const edge = i < n0 ? B0.edges[i] : B1.edges[i - n0];
      this.testAxis.normal(edge.p0, edge.p1);
      B0.projectAxis(this.testAxis);
      B1.projectAxis(this.testAxis);
      const dist = B0.min < B1.min ? B1.min - B0.max : B0.min - B1.max;
      if (dist > 0) return false;
      else if (Math.abs(dist) < minDistance) {
        minDistance = Math.abs(dist);
        this.axis.copy(this.testAxis);
        this.edge = edge;
      }
    }
    this.depth = minDistance;
    if (this.edge.parent !== B1) {
      let t = B1;
      B1 = B0;
      B0 = t;
    }
    const n = this.center.sub(B0.center, B1.center).dot(this.axis);
    if (n < 0) this.axis.neg();
    let smallestDist = 99999;
    for (let i = 0; i < B0.vCount; i++) {
      const v = B0.vertices[i];
      this.line.sub(v.position, B1.center);
      const dist = this.axis.dot(this.line);
      if (dist < smallestDist) {
        smallestDist = dist;
        this.vertex = v;
      }
    }
    return true;
  },
  resolve: function (engine) {
    const { kFriction } = engine.settings;
    const p0 = this.edge.p0,
      p1 = this.edge.p1,
      o0 = this.edge.v0.oldPosition,
      o1 = this.edge.v1.oldPosition,
      vp = this.vertex.position,
      vo = this.vertex.oldPosition,
      rs = this.response;
    this.response.scale(this.axis, this.depth);
    const t =
      Math.abs(p0.x - p1.x) > Math.abs(p0.y - p1.y)
        ? (vp.x - rs.x - p0.x) / (p1.x - p0.x)
        : (vp.y - rs.y - p0.y) / (p1.y - p0.y);
    const lambda = 1 / (t * t + (1 - t) * (1 - t));
    const m0 = this.vertex.parent.mass,
      m1 = this.edge.parent.mass,
      tm = m0 + m1,
      m0_tm = m0 / tm,
      m1_tm = m1 / tm;
    p0.x -= rs.x * (1 - t) * lambda * m0_tm;
    p0.y -= rs.y * (1 - t) * lambda * m0_tm;
    p1.x -= rs.x * t * lambda * m0_tm;
    p1.y -= rs.y * t * lambda * m0_tm;
    vp.x += rs.x * m1_tm;
    vp.y += rs.y * m1_tm;
    this.relVel.set(
      vp.x - vo.x - (p0.x + p1.x - o0.x - o1.x) * 0.5,
      vp.y - vo.y - (p0.y + p1.y - o0.y - o1.y) * 0.5
    );
    this.tangent.perp(this.axis);
    const relTv = this.relVel.dot(this.tangent);
    const rt = this.relTanVel.set(
      this.tangent.x * relTv,
      this.tangent.y * relTv
    );
    vo.x += rt.x * kFriction * m1_tm;
    vo.y += rt.y * kFriction * m1_tm;
    o0.x -= rt.x * (1 - t) * kFriction * lambda * m0_tm;
    o0.y -= rt.y * (1 - t) * kFriction * lambda * m0_tm;
    o1.x -= rt.x * t * kFriction * lambda * m0_tm;
    o1.y -= rt.y * t * kFriction * lambda * m0_tm;
  },
};

//================================================================
// --- 2. THE REACT COMPONENT ---
//================================================================

export default function CupolaQuiz() {
  // --- React State ---
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [weightless, setWeightless] = useState(true);
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
      gravityTween: {
        active: false,
        start: 0,
        end: 0,
        startTime: 0,
        duration: 0,
      },

      // --- Engine Settings (mutable) ---
      settings: {
        kGravity: weightless ? 0.0 : 0.12,
        kNumIterations: 5,
        kFriction: 0.2,
        kFrictionGround: 0.1,
        kViscosity: 1.0,
        kForceDrag: 5,
        mouseInfluenceRadius: 70,
        mouseInfluenceStrength: 0.8,
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

        const s = w / 35; // scale
        const yOffset = h / 2 - 4.5 * s;
        const codepen = [
          "      ** ***** ** ** **** ****** ",
          "      ** ** ** ** ** ** ** ",
          "      ** ** ** ** ** *** ** ",
          "   ** ** ** ** ** ** ** ** ",
          "    **** ***** ***** **** ** ",
        ];
        codepen.forEach((line, i) => {
          for (let j = 0; j < line.length; j++) {
            if (line.charAt(j) !== " ")
              this.createRectangle(
                s * 0.5 + s * j,
                yOffset + s * i,
                s * 0.8,
                s * 0.8,
                1,
                "#77E0FF"
              );
          }
        });

        for (let k = 0; k < 6; k++) {
          const rx = 50 + Math.random() * (w - 100);
          const ry = 50 + Math.random() * (h / 2);
          this.createCircle(
            rx,
            ry,
            18 + Math.random() * 18,
            12,
            5 + Math.random() * 10,
            ["#9BF47A", "#FFD36E", "#F78CFF", "#9AA6FF"][k % 4]
          );
        }
      },

      createRectangle: function (x, y, w, h, m, c) {
        const b = new Body(this, {
          mass: m,
          color: c,
          vertices: {
            n0: { x: x, y: y },
            n1: { x: x + w, y: y },
            n2: { x: x + w, y: y + h },
            n3: { x: x, y: y + h },
          },
          constraints: [
            ["n0", "n1", true],
            ["n1", "n2", true],
            ["n2", "n3", true],
            ["n3", "n0", true],
            ["n0", "n2"],
            ["n3", "n1"],
          ],
        });
        this.bodies.push(b);
        return b;
      },

      createCircle: function (cx, cy, r, sides, m, c) {
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
        const b = new Body(this, {
          mass: m,
          color: c,
          vertices: verts,
          constraints: constraints,
        });
        this.bodies.push(b);
        return b;
      },

      setGravity: function (target, durationMs) {
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

      stepGravityTween: function (now) {
        const tween = this.gravityTween;
        if (!tween.active) return;
        const t = (now - tween.startTime) / tween.duration;
        if (t >= 1) {
          this.settings.kGravity = tween.end;
          tween.active = false;
          return;
        }
        const eased = 1 - (1 - t) * (1 - t);
        this.settings.kGravity =
          tween.start + (tween.end - tween.start) * eased;
      },
    };

    engine.settings.engine = engine;
    engineRef.current = engine;
    engine.init();

    // --- Main Animation Loop ---
    const step = (now) => {
      engine.stepGravityTween(now);

      if (weightless && !engine.settings.pointer.isDown) {
        const { pointer, mouseInfluenceRadius, mouseInfluenceStrength } =
          engine.settings;
        const radiusSq = mouseInfluenceRadius * mouseInfluenceRadius;

        for (const vertex of engine.vertices) {
          const dx = vertex.position.x - pointer.x;
          const dy = vertex.position.y - pointer.y;
          const distSq = dx * dx + dy * dy;

          if (distSq < radiusSq) {
            const dist = Math.sqrt(distSq);
            const force =
              (1 - dist / mouseInfluenceRadius) * mouseInfluenceStrength;
            vertex.position.x += (dx / dist) * force;
            vertex.position.y += (dy / dist) * force;
          }
        }
      }

      for (let i = 0; i < engine.vertices.length; i++)
        engine.vertices[i].integrate();

      for (let n = 0; n < engine.settings.kNumIterations; n++) {
        for (let i = 0; i < engine.constraints.length; i++)
          engine.constraints[i].solve();
        for (let i = 0; i < engine.bodies.length; i++)
          engine.bodies[i].boundingBox();
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
        ctx.strokeStyle = "#0f0";
        ctx.stroke();
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
    const handleMouseDown = (e) => {
      engine.settings.pointer.isDown = true;
      handleMouseMove(e);
    };
    const handleMouseUp = () => {
      engine.settings.pointer.isDown = false;
      engine.dragVertex.current = null;
    };

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
  }, []);

  // This effect listens for changes to `weightless` and updates the physics engine
  useEffect(() => {
    if (engineRef.current) {
      if (weightless) {
        engineRef.current.setGravity(0.0, 150);
      } else {
        engineRef.current.setGravity(0.12, 600);
      }
    }
  }, [weightless]);

  // --- Quiz Logic Handlers ---
  const onSelect = (i) => {
    if (showAnswer) return; // prevent re-click
    setSelected(i);
    setShowAnswer(true);
    if (i === current.answer) {
      setScore((s) => s + 1);
    }
  };

  const next = () => {
    setSelected(null);
    setShowAnswer(false);
    setIndex((s) => Math.min(s + 1, QUESTIONS.length - 1));
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
    <div className="relative w-full min-h-screen overflow-hidden bg-[#030303]">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full z-0 block"
      ></canvas>

      <button
        onClick={() => setWeightless((w) => !w)}
        className="fixed top-4 right-4 z-30 px-4 py-2 rounded-full text-xs md:text-sm font-semibold border border-white/25 bg-white/10 backdrop-blur-sm hover:scale-105 transition-transform"
        aria-pressed={weightless}
        title="Toggle weightlessness"
      >
        {weightless ? "Mode: Weightless" : "Mode: Gravity"}
      </button>

      {/* Quiz card container */}
      <div className="relative z-20 flex items-center justify-center w-full h-full px-4 py-10 pointer-events-none">
        {quizComplete ? (
          // --- SCORE CARD ---
          <div className="max-w-xl w-full bg-black/60 border border-white/6 rounded-2xl p-6 md:p-10 shadow-2xl backdrop-blur-sm pointer-events-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-blue-300">
              Quiz Complete!
            </h2>
            <p className="mt-4 text-4xl md:text-5xl font-semibold">
              {score}{" "}
              <span className="text-xl text-gray-400">
                / {QUESTIONS.length}
              </span>
            </p>
            <p className="mt-2 text-gray-300">
              {score / QUESTIONS.length > 0.7
                ? "Excellent work, astronaut!"
                : "Nice try! Keep reaching for the stars."}
            </p>
            <button
              onClick={restart}
              className="mt-8 px-6 py-3 rounded-md bg-blue-500 text-white font-medium hover:bg-blue-600 transition-colors"
            >
              Restart Quiz
            </button>
          </div>
        ) : (
          // --- QUESTION CARD ---
          <div className="max-w-xl w-full bg-black/60 border border-white/6 rounded-2xl p-6 md:p-10 shadow-2xl backdrop-blur-sm pointer-events-auto">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs text-blue-300 font-medium">
                  Question {index + 1} / {QUESTIONS.length}
                </div>
                <h3 className="mt-2 text-xl md:text-2xl font-semibold">
                  {current.q}
                </h3>
              </div>
              <div className="text-right text-xs text-gray-300">
                <div className="uppercase tracking-wide">Cupola Quiz</div>
              </div>
            </div>
            <div className="mt-6 grid gap-3">
              {current.opts.map((opt, i) => {
                const correct = i === current.answer;
                const isSelected = i === selected;
                const showCorrect = showAnswer && correct;
                const showWrong = showAnswer && isSelected && !correct;
                let base =
                  "rounded-lg p-3 md:p-4 text-sm md:text-base border transition-colors";
                if (!showAnswer)
                  base +=
                    " bg-white/4 border-white/8 hover:bg-white/6 cursor-pointer";
                if (showCorrect)
                  base += " bg-green-600/90 border-green-500 text-white";
                else if (showWrong)
                  base += " bg-red-600/90 border-red-500 text-white";
                return (
                  <div
                    key={i}
                    role="button"
                    onClick={() => onSelect(i)}
                    className={base}
                  >
                    {opt}
                  </div>
                );
              })}
            </div>
            <div className="mt-6 flex items-center justify-between min-h-[40px]">
              <div className="text-sm text-gray-300">
                {showAnswer ? (
                  <div>
                    <strong>
                      {current.opts[current.answer]} {" — "}
                    </strong>{" "}
                    <span>{current.fun}</span>
                  </div>
                ) : (
                  <div className="italic text-xs text-gray-400">
                    Click an option to reveal the answer.
                  </div>
                )}
              </div>
              <div>
                {showAnswer &&
                  (index < QUESTIONS.length - 1 ? (
                    <button
                      onClick={next}
                      className="ml-3 px-4 py-2 rounded-md bg-blue-500 text-white font-medium hover:bg-blue-600"
                    >
                      Next
                    </button>
                  ) : (
                    <button
                      onClick={() => setQuizComplete(true)}
                      className="ml-3 px-4 py-2 rounded-md bg-green-500 text-white font-medium hover:bg-green-600"
                    >
                      See Score
                    </button>
                  ))}
              </div>
            </div>
          </div>
        )}
      </div>
      <Link
        to="/cupola"
        aria-label="Return to introduction page"
        className="absolute top-4 left-4 z-50 flex h-10 w-10 items-center justify-center rounded-full border border-cyan-300/25 bg-blue-900/20 text-cyan-200 backdrop-blur-sm transition-all hover:scale-105 hover:bg-blue-800/40"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 19l-7-7 7-7"
          />
            
        </svg>
      </Link>
    </div>
  );
}
