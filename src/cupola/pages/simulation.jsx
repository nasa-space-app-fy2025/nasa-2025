// src/pages/Simulation.jsx
import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { Link } from "react-router-dom";

// --- NEW: A simple loading screen component ---
function LoadingScreen({ progress }) {
  return (
    <div className="absolute inset-0 z-20 bg-black flex flex-col items-center justify-center">
      <div className="text-cyan-300 font-mono text-lg">
        Loading Simulation...
      </div>
      <div className="w-1/4 mt-4 bg-gray-700 rounded-full h-2.5">
        <div
          className="bg-cyan-400 h-2.5 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <div className="text-cyan-300 font-mono mt-2">
        {Math.round(progress)}%
      </div>
      <div className="text-cyan-300 font-mono mt-4 text-sm">
        Use arrow keys to look around
      </div>
    </div>
  );
}

const formatMET = (seconds) => {
  const days = Math.floor(seconds / (3600 * 24));
  seconds %= 3600 * 24;
  const hours = Math.floor(seconds / 3600);
  seconds %= 3600;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  const pad = (num) => num.toString().padStart(2, "0");
  return `${pad(days)}:${pad(hours)}:${pad(minutes)}:${pad(remainingSeconds)}`;
};

export default function Simulation() {
  const containerRef = useRef(null);

  // --- NEW: State for loading status ---
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);

  const [isHudVisible, setIsHudVisible] = useState(true);
  const [issData, setIssData] = useState({
    latitude: "Loading...",
    longitude: "Loading...",
    altitude: "---",
    velocity: "---",
    visibility: "---",
    utcTime: new Date().toUTCString().slice(17, 25),
    missionElapsedTime: 0,
  });

  useEffect(() => {
    if (!isHudVisible) return;
    const fetchIssData = () => {
      fetch("https://api.wheretheiss.at/v1/satellites/25544")
        .then((response) => response.json())
        .then((data) =>
          setIssData((p) => ({
            ...p,
            latitude: data.latitude,
            longitude: data.longitude,
            altitude: data.altitude,
            velocity: data.velocity,
            visibility: data.visibility,
          }))
        )
        .catch((err) => console.error("Failed to fetch ISS data:", err));
    };
    const timerInterval = setInterval(
      () =>
        setIssData((p) => ({
          ...p,
          utcTime: new Date().toUTCString().slice(17, 25),
          missionElapsedTime: p.missionElapsedTime + 1,
        })),
      1000
    );
    fetchIssData();
    const fetchInterval = setInterval(fetchIssData, 5000);
    return () => {
      clearInterval(timerInterval);
      clearInterval(fetchInterval);
    };
  }, [isHudVisible]);

  useEffect(() => {
    // --- NEW: Loading Manager ---
    const loadingManager = new THREE.LoadingManager();

    loadingManager.onProgress = (url, itemsLoaded, itemsTotal) => {
      // We'll say the model is 80% of the total load, video is 20%
      const modelProgress = (itemsLoaded / itemsTotal) * 80;
      setLoadingProgress(modelProgress);
    };

    loadingManager.onLoad = () => {
      // This is called when the model is loaded. Now we wait for the video.
      // We will set the final loaded state inside the video's event listener.
    };

    const container = containerRef.current;
    if (!container) return;
    const w = window.innerWidth;
    const h = window.innerHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(90, w / h, 0.1, 1000);
    camera.position.set(0, 1.2, 7);
    camera.rotation.order = "YXZ";

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(w, h);
    container.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    scene.add(new THREE.HemisphereLight(0xadd8e6, 0x000000, 0.5));
    const dir = new THREE.DirectionalLight(0xffffff, 0.5);
    dir.position.set(5, 5, 5);
    scene.add(dir);

    // --- UPDATED: Pass the loadingManager to the loader ---
    const gltfLoader = new GLTFLoader(loadingManager);
    gltfLoader.load(
      "/cupola-edited.glb",
      (gltf) => {
        gltf.scene.rotation.y = Math.PI;
        scene.add(gltf.scene);
      },
      undefined,
      (err) => console.error(err)
    );

    const video = document.createElement("video");
    video.src = "/isslive.mp4";
    video.loop = true;
    video.muted = true;
    video.playsInline = true;

    // --- NEW: Event listener to know when video is ready ---
    video.oncanplaythrough = () => {
      setLoadingProgress(100); // Video is ready, set progress to 100%
      setTimeout(() => {
        setIsLoaded(true); // Set loaded state to true after a short delay for transition
      }, 500); // 0.5s delay
      video.play().catch((err) => console.warn("Video play failed:", err));
    };

    const videoTexture = new THREE.VideoTexture(video);
    videoTexture.minFilter = THREE.LinearFilter;
    videoTexture.magFilter = THREE.LinearFilter;
    videoTexture.colorSpace = THREE.SRGBColorSpace;

    const radius = 10,
      height = 15,
      thetaLength = Math.PI;
    const geometry = new THREE.CylinderGeometry(
      radius,
      radius,
      height,
      64,
      1,
      true,
      Math.PI / 2 - thetaLength / 2,
      thetaLength
    );
    const material = new THREE.MeshBasicMaterial({
      map: videoTexture,
      side: THREE.BackSide,
    });
    const curvedScreen = new THREE.Mesh(geometry, material);
    curvedScreen.position.set(0, 0, 8);
    curvedScreen.rotation.y = Math.PI / 2;
    scene.add(curvedScreen);

    let yaw = 0,
      pitch = 0;
    const step = 0.05,
      maxPitch = Math.PI / 3,
      maxYaw = Math.PI / 3;
    const updateCameraRotation = () =>
      camera.rotation.set(pitch, yaw, 0, "YXZ");
    const onKeyDown = (e) => {
      if (e.key === "ArrowUp" || e.key === "w")
        pitch = Math.min(maxPitch, pitch + step);
      if (e.key === "ArrowDown" || e.key === "s")
        pitch = Math.max(-maxPitch, pitch - step);
      if (e.key === "ArrowLeft" || e.key === "a")
        yaw = Math.min(maxYaw, yaw + step);
      if (e.key === "ArrowRight" || e.key === "d")
        yaw = Math.max(-maxYaw, yaw - step);
      updateCameraRotation();
    };
    window.addEventListener("keydown", onKeyDown);

    const setupButtonControls = () => {
      const upBtn = document.getElementById("up-btn");
      const downBtn = document.getElementById("down-btn");
      const leftBtn = document.getElementById("left-btn");
      const rightBtn = document.getElementById("right-btn");
      const handleUp = () => {
        pitch = Math.min(maxPitch, pitch + step);
        updateCameraRotation();
      };
      const handleDown = () => {
        pitch = Math.max(-maxPitch, pitch - step);
        updateCameraRotation();
      };
      const handleLeft = () => {
        yaw = Math.min(maxYaw, yaw + step);
        updateCameraRotation();
      };
      const handleRight = () => {
        yaw = Math.max(-maxYaw, yaw - step);
        updateCameraRotation();
      };
      if (upBtn) upBtn.addEventListener("click", handleUp);
      if (downBtn) downBtn.addEventListener("click", handleDown);
      if (leftBtn) leftBtn.addEventListener("click", handleLeft);
      if (rightBtn) rightBtn.addEventListener("click", handleRight);
      return () => {
        if (upBtn) upBtn.removeEventListener("click", handleUp);
        if (downBtn) downBtn.removeEventListener("click", handleDown);
        if (leftBtn) leftBtn.removeEventListener("click", handleLeft);
        if (rightBtn) rightBtn.removeEventListener("click", handleRight);
      };
    };
    const cleanupButtonControls = setupButtonControls();

    const onResize = () => {
      const newW = window.innerWidth;
      const newH = window.innerHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };
    window.addEventListener("resize", onResize);

    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("resize", onResize);
      cleanupButtonControls();
      if (video) {
        video.pause();
        video.removeAttribute("src");
        video.load();
      }
      if (container) {
        container.innerHTML = "";
      }
    };
  }, []);

  return (
    <div className="relative w-full h-screen bg-black">
      {/* --- NEW: Conditional rendering for the loading screen --- */}
      {!isLoaded && <LoadingScreen progress={loadingProgress} />}

      {/* --- UPDATED: Canvas and UI fade in when loaded --- */}
      <div
        ref={containerRef}
        className="w-full h-full relative transition-opacity duration-1000"
        style={{ opacity: isLoaded ? 1 : 0 }}
      />
      <div
        className="absolute inset-0 z-10 pointer-events-none text-cyan-300 font-mono transition-opacity duration-1000"
        style={{ opacity: isLoaded ? 1 : 0 }}
      >
        <div className="absolute top-4 right-4 pointer-events-auto">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Link
                to="/cupola"
                className="group px-4 py-2 rounded-lg bg-white/10 shadow-lg backdrop-blur-sm hover:bg-white/20 transition-colors flex items-center justify-center relative"
              >
                <img
                  src="/off.svg"
                  alt="icon"
                  className="h-5 w-5 object-contain"
                />
                <span className="absolute bottom-full mb-0.1 hidden group-hover:block bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                  Exit Simulation
                </span>
              </Link>
            </div>

            <button
              onClick={() => setIsHudVisible(!isHudVisible)}
              className="px-4 py-2 rounded-lg bg-white/10 shadow-lg backdrop-blur-sm hover:bg-white/20 transition-colors"
            >
              HUD: {isHudVisible ? "ON" : "OFF"}
            </button>
          </div>
        </div>

        {isHudVisible && (
          <div className="absolute top-4 left-4 p-4 rounded-lg bg-black/20 backdrop-blur-sm pointer-events-auto text-sm">
            <h2 className="text-base font-bold border-b border-cyan-300/50 pb-1 mb-2">
              ISS LIVE TELEMETRY
            </h2>
            <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
              <span className="font-semibold">UTC:</span>{" "}
              <span>{issData.utcTime}</span>
              <span className="font-semibold">MET:</span>{" "}
              <span>{formatMET(issData.missionElapsedTime)}</span>
              <span className="font-semibold col-span-2 border-t border-cyan-300/20 pt-1 mt-1">
                POSITION
              </span>
              <span className="font-semibold pl-2">LAT:</span>{" "}
              <span>
                {typeof issData.latitude === "number"
                  ? `${issData.latitude.toFixed(4)}°`
                  : issData.latitude}
              </span>
              <span className="font-semibold pl-2">LON:</span>{" "}
              <span>
                {typeof issData.longitude === "number"
                  ? `${issData.longitude.toFixed(4)}°`
                  : issData.longitude}
              </span>
              <span className="font-semibold col-span-2 border-t border-cyan-300/20 pt-1 mt-1">
                ORBIT
              </span>
              <span className="font-semibold pl-2">ALT:</span>{" "}
              <span>
                {typeof issData.altitude === "number"
                  ? `${issData.altitude.toFixed(2)} km`
                  : issData.altitude}
              </span>
              <span className="font-semibold pl-2">VEL:</span>{" "}
              <span>
                {typeof issData.velocity === "number"
                  ? `${issData.velocity.toFixed(2)} km/h`
                  : issData.velocity}
              </span>
              <span className="font-semibold pl-2">VIS:</span>{" "}
              <span className="capitalize">{issData.visibility}</span>
            </div>
          </div>
        )}

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-auto">
          <div className="grid grid-cols-3 grid-rows-2 gap-2 w-40">
            <button
              id="up-btn"
              className="col-start-2 w-12 h-12 mx-auto flex items-center justify-center rounded-lg bg-white/10 text-white shadow-lg backdrop-blur-sm hover:bg-white/20 transition-colors"
            >
              ▲
            </button>
            <button
              id="left-btn"
              className="row-start-2 w-12 h-12 flex items-center justify-center rounded-lg bg-white/10 text-white shadow-lg backdrop-blur-sm hover:bg-white/20 transition-colors"
            >
              ◀
            </button>
            <button
              id="down-btn"
              className="row-start-2 col-start-2 w-12 h-12 flex items-center justify-center rounded-lg bg-white/10 text-white shadow-lg backdrop-blur-sm hover:bg-white/20 transition-colors"
            >
              ▼
            </button>
            <button
              id="right-btn"
              className="row-start-2 col-start-3 w-12 h-12 flex items-center justify-center rounded-lg bg-white/10 text-white shadow-lg backdrop-blur-sm hover:bg-white/20 transition-colors"
            >
              ▶
            </button>
          </div>
        </div>

        <div className="absolute bottom-1 right-4 pointer-events-auto">
          <p className="text-xs text-cyan-300/60">
            Note: This is a recorded simulation for demonstration purposes and
            does not represent a live feed.
          </p>
        </div>
      </div>
    </div>
  );
}
