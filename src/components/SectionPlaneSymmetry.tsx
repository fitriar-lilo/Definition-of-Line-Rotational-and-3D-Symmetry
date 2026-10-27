import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { 
  CheckCircle, ArrowRight, ArrowLeft, Lightbulb, Check, X, Download, Save, 
  Box, Eye, Rotate3d, Layers, Split 
} from 'lucide-react';
import { MathView } from './MathView';
import { AudioButton } from './AudioButton';
import { SOLIDS_3D_DATA, SECTION3_WORKED_EXAMPLES, SECTION3_PRACTICE, Solid3DInfo } from '../data/symmetryData';
import { playCorrectSound, playWrongSound } from '../utils/audio';
import { createSection3Pdf } from '../utils/pdf';
import { PdfModal } from './PdfModal';

interface Section3Props {
  studentName: string;
  onComplete: () => void;
  onSaveProgress: () => void;
  onTriggerCelebration: (msg?: string) => void;
}

type PlaneType = 'horizontal' | 'vertical-fb' | 'vertical-lr' | 'diagonal' | 'slanted';

export const SectionPlaneSymmetry: React.FC<Section3Props> = ({
  studentName,
  onComplete,
  onSaveProgress,
  onTriggerCelebration,
}) => {
  const [selectedSolidId, setSelectedSolidId] = useState<string>('cube');
  const [selectedPlane, setSelectedPlane] = useState<PlaneType>('horizontal');
  const [separation, setSeparation] = useState(0); // 0 to 1 slider
  const [useFallback2D, setUseFallback2D] = useState(false);

  // --- Worked Examples State ---
  const [activeExampleIndex, setActiveExampleIndex] = useState(0);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const [answersState, setAnswersState] = useState<
    Record<string, { selected?: number; numInput?: string; isCorrect?: boolean; showHint?: boolean; attempts: number }>
  >({});

  const [pdfModal, setPdfModal] = useState<{
    isOpen: boolean;
    url: string | null;
    filename: string;
    title: string;
  }>({
    isOpen: false,
    url: null,
    filename: '',
    title: '',
  });

  const handleDownloadSectionPdf = () => {
    const res = createSection3Pdf(studentName);
    setPdfModal({
      isOpen: true,
      url: res.url,
      filename: res.filename,
      title: 'Section 3: Plane Symmetry (3D) Study Guide',
    });
  };

  const mountRef = useRef<HTMLDivElement>(null);

  // Find active solid data
  const currentSolid = SOLIDS_3D_DATA.find((s) => s.id === selectedSolidId) || SOLIDS_3D_DATA[0];

  // Determine if chosen plane is a plane of symmetry for this solid
  const isPlaneSymmetric = (() => {
    if (selectedPlane === 'slanted') return false; // intentionally wrong plane

    if (selectedSolidId === 'cube') {
      return true; // horizontal, vertical-fb, vertical-lr, diagonal are all symmetric for cube
    }
    if (selectedSolidId === 'cuboid') {
      // For cuboid with distinct dimensions, diagonal is NOT a plane of symmetry!
      if (selectedPlane === 'diagonal') return false;
      return true;
    }
    if (selectedSolidId === 'square-pyramid') {
      // Horizontal plane through pyramid does NOT give mirror halves (top is triangle, bottom is frustum)
      if (selectedPlane === 'horizontal') return false;
      return true;
    }
    if (selectedSolidId === 'triangular-prism') {
      if (selectedPlane === 'diagonal') return false;
      return true;
    }
    if (selectedSolidId === 'cylinder') {
      if (selectedPlane === 'diagonal') return false;
      return true;
    }
    return true;
  })();

  // --- Three.js 3D Scene Initialization ---
  useEffect(() => {
    if (useFallback2D || !mountRef.current) return;

    const container = mountRef.current;
    const width = container.clientWidth || 400;
    const height = 300;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      setUseFallback2D(true);
      return;
    }

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(3.5, 2.5, 4.5);
    camera.lookAt(0, 0, 0);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight1.position.set(5, 8, 5);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xa78bfa, 0.6);
    dirLight2.position.set(-5, -3, -5);
    scene.add(dirLight2);

    // Root model group that student can rotate
    const modelGroup = new THREE.Group();
    scene.add(modelGroup);

    // Solid Geometries
    const solidMaterial = new THREE.MeshStandardMaterial({
      color: 0x9333ea,
      roughness: 0.3,
      metalness: 0.1,
      polygonOffset: true,
      polygonOffsetFactor: 1,
      polygonOffsetUnits: 1,
    });

    const edgeMaterial = new THREE.LineBasicMaterial({ color: 0x3b0764, linewidth: 2 });

    const createSolid = () => {
      let geom: THREE.BufferGeometry;
      switch (selectedSolidId) {
        case 'cuboid':
          geom = new THREE.BoxGeometry(2.6, 1.3, 1.8);
          break;
        case 'square-pyramid':
          geom = new THREE.ConeGeometry(1.6, 2.2, 4);
          geom.rotateY(Math.PI / 4);
          break;
        case 'triangular-prism':
          geom = new THREE.CylinderGeometry(1.3, 1.3, 2.2, 3);
          geom.rotateZ(Math.PI / 2);
          break;
        case 'cylinder':
          geom = new THREE.CylinderGeometry(1.1, 1.1, 2.2, 32);
          break;
        case 'sphere':
          geom = new THREE.SphereGeometry(1.3, 32, 24);
          break;
        case 'cube':
        default:
          geom = new THREE.BoxGeometry(1.9, 1.9, 1.9);
          break;
      }

      const mesh = new THREE.Mesh(geom, solidMaterial);
      const wireframeGeom = new THREE.WireframeGeometry(geom);
      const wireframe = new THREE.LineSegments(wireframeGeom, edgeMaterial);
      mesh.add(wireframe);

      // Handle separation animation: split into two halves visually if separation > 0
      if (separation > 0) {
        mesh.position.y += separation * 0.4;
      }

      return mesh;
    };

    const solidMesh = createSolid();
    modelGroup.add(solidMesh);

    // Cutting Plane Visual
    const planeGeom = new THREE.PlaneGeometry(3.6, 3.6);
    const planeMat = new THREE.MeshStandardMaterial({
      color: isPlaneSymmetric ? 0x22c55e : 0xef4444,
      transparent: true,
      opacity: 0.6,
      side: THREE.DoubleSide,
      roughness: 0.2,
      metalness: 0.1,
    });
    const planeMesh = new THREE.Mesh(planeGeom, planeMat);

    // Plane orientation
    switch (selectedPlane) {
      case 'horizontal':
        planeMesh.rotation.x = Math.PI / 2;
        break;
      case 'vertical-fb':
        planeMesh.rotation.y = 0;
        break;
      case 'vertical-lr':
        planeMesh.rotation.y = Math.PI / 2;
        break;
      case 'diagonal':
        planeMesh.rotation.y = Math.PI / 4;
        break;
      case 'slanted':
        planeMesh.rotation.x = Math.PI / 5;
        planeMesh.rotation.y = Math.PI / 6;
        break;
    }

    // Border around cutting plane
    const planeEdges = new THREE.LineSegments(
      new THREE.EdgesGeometry(planeGeom),
      new THREE.LineBasicMaterial({ color: isPlaneSymmetric ? 0x15803d : 0xb91c1c, linewidth: 2 })
    );
    planeMesh.add(planeEdges);
    modelGroup.add(planeMesh);

    // Mouse / Touch Drag to Rotate model
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;

    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      isDragging = true;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      prevMouseX = clientX;
      prevMouseY = clientY;
    };

    const onPointerMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging) return;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      const deltaX = clientX - prevMouseX;
      const deltaY = clientY - prevMouseY;

      modelGroup.rotation.y += deltaX * 0.01;
      modelGroup.rotation.x += deltaY * 0.01;

      prevMouseX = clientX;
      prevMouseY = clientY;
    };

    const onPointerUp = () => {
      isDragging = false;
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', onPointerDown);
    dom.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);
    dom.addEventListener('touchstart', onPointerDown, { passive: true });
    dom.addEventListener('touchmove', onPointerMove, { passive: true });
    window.addEventListener('touchend', onPointerUp);

    // Animation Render Loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      if (!isDragging) {
        modelGroup.rotation.y += 0.003; // Gentle idle spin
      }
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      dom.removeEventListener('mousedown', onPointerDown);
      dom.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('mouseup', onPointerUp);
      dom.removeEventListener('touchstart', onPointerDown);
      dom.removeEventListener('touchmove', onPointerMove);
      window.removeEventListener('touchend', onPointerUp);
      renderer.dispose();
      container.innerHTML = '';
    };
  }, [selectedSolidId, selectedPlane, separation, isPlaneSymmetric, useFallback2D]);

  // Practice Choice Submit
  const handleOptionSelect = (qId: string, optionIndex: number, correctIndex: number) => {
    const prev = answersState[qId] || { attempts: 0 };
    if (prev.isCorrect) return;

    const isCorrect = optionIndex === correctIndex;
    const nextAttempts = prev.attempts + 1;

    setAnswersState((s) => ({
      ...s,
      [qId]: { ...prev, selected: optionIndex, isCorrect, attempts: nextAttempts },
    }));

    if (isCorrect) {
      playCorrectSound();
      onTriggerCelebration(`Excellent 3D insight, ${studentName}! 🚀`);
    } else {
      playWrongSound();
    }
  };

  // Practice Number Submit
  const handleNumberSubmit = (qId: string, correctNum: number) => {
    const prev = answersState[qId] || { attempts: 0 };
    if (prev.isCorrect) return;

    const entered = parseFloat(prev.numInput || '');
    const isCorrect = entered === correctNum;
    const nextAttempts = prev.attempts + 1;

    setAnswersState((s) => ({
      ...s,
      [qId]: { ...prev, isCorrect, attempts: nextAttempts },
    }));

    if (isCorrect) {
      playCorrectSound();
      onTriggerCelebration(`Correct number of planes, ${studentName}! 🎉`);
    } else {
      playWrongSound();
    }
  };

  const correctPracticeCount = SECTION3_PRACTICE.filter((q) => answersState[q.id]?.isCorrect).length;

  return (
    <div id="section-3-content" className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Hero Header Card */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-700 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
              <span>Section 3 of 4</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Plane Symmetry (3D)
            </h2>
            <p className="text-purple-100 text-sm sm:text-base mt-1 max-w-xl">
              Discover how an imaginary flat mirror (a <strong>plane of symmetry</strong>) slices a 3D solid into two matching mirror halves!
            </p>
          </div>
          <div className="flex items-center gap-2">
            <AudioButton
              textToRead="Section 3: Plane Symmetry in 3D Solids. A plane of symmetry is an imaginary flat mirror that cuts a three-dimensional solid into two halves that are exact mirror reflections of each other."
              label="Listen to Section"
            />
          </div>
        </div>
      </div>

      {/* a) LEARNING GOALS */}
      <div className="bg-white rounded-3xl p-6 border border-purple-100 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-purple-100 text-purple-800 flex items-center justify-center text-sm font-bold">a</span>
            <span>My Learning Goals</span>
          </h3>
          <AudioButton
            textToRead="By the end of this section, I can define a plane of symmetry for a 3D solid, count the number of planes of symmetry in cubes, cuboids, pyramids, and cylinders, and understand why a cube has 9 planes but a cuboid has only 3."
            size="sm"
          />
        </div>
        <div className="grid sm:grid-cols-3 gap-3">
          <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-purple-50/60 border border-purple-100">
            <CheckCircle className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
            <p className="text-xs sm:text-sm font-semibold text-slate-700">
              I can explain what a <strong>plane of symmetry</strong> is in 3D.
            </p>
          </div>
          <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-purple-50/60 border border-purple-100">
            <CheckCircle className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
            <p className="text-xs sm:text-sm font-semibold text-slate-700">
              I can state that a <strong>cube has 9 planes</strong> and a <strong>cuboid has 3 planes</strong>.
            </p>
          </div>
          <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-purple-50/60 border border-purple-100">
            <CheckCircle className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
            <p className="text-xs sm:text-sm font-semibold text-slate-700">
              I can visualize planes in pyramids, prisms, and cylinders.
            </p>
          </div>
        </div>
      </div>

      {/* b) DEFINITIONS IN SIMPLE WORDS + REAL-LIFE EXAMPLES */}
      <div className="bg-white rounded-3xl p-6 border border-purple-100 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-purple-100 text-purple-800 flex items-center justify-center text-sm font-bold">b</span>
            <span>Definition in Simple Words</span>
          </h3>
          <AudioButton
            textToRead="A plane of symmetry is an imaginary flat sheet of glass or mirror that slices through a 3D solid. It divides the solid into two halves that are exact mirror reflections of each other."
            size="sm"
          />
        </div>

        <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200">
          <p className="text-base text-slate-800 leading-relaxed">
            In 2D we had a <em>line</em> of symmetry. In 3D space, we have a <strong className="text-purple-800">plane of symmetry</strong>!
            It is an imaginary flat mirror or cutting blade that cuts a 3D solid into <strong>two identical halves</strong> that reflect each other across the cut.
          </p>
        </div>

        <div>
          <h4 className="text-sm font-bold text-slate-600 uppercase tracking-wider mb-2.5">
            Real-Life Examples of 3D Plane Symmetry:
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-center">
              <span className="text-2xl block mb-1">📦</span>
              <p className="text-xs font-bold text-slate-800">Cardboard Box</p>
              <p className="text-[11px] text-slate-500">Cuboid has 3 planes</p>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-center">
              <span className="text-2xl block mb-1">🎲</span>
              <p className="text-xs font-bold text-slate-800">Playing Die (Cube)</p>
              <p className="text-[11px] text-slate-500">Cube has 9 planes</p>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-center">
              <span className="text-2xl block mb-1">🥤</span>
              <p className="text-xs font-bold text-slate-800">Soda Can (Cylinder)</p>
              <p className="text-[11px] text-slate-500">Infinite vertical planes</p>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-center">
              <span className="text-2xl block mb-1">⚽</span>
              <p className="text-xs font-bold text-slate-800">Football (Sphere)</p>
              <p className="text-[11px] text-slate-500">Infinite planes through center</p>
            </div>
          </div>
        </div>
      </div>

      {/* c) INTERACTIVE 3D SOLID SLICER ANIMATION */}
      <div className="bg-white rounded-3xl p-6 border border-purple-100 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-purple-100 text-purple-800 flex items-center justify-center text-sm font-bold">c</span>
            <span>Interactive 3D Solid Plane Cutter</span>
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setUseFallback2D(!useFallback2D)}
              className="text-xs font-bold text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-200 hover:bg-purple-100 transition cursor-pointer"
            >
              {useFallback2D ? 'Switch to 3D View' : 'Switch to 2D Diagram'}
            </button>
            <AudioButton
              textToRead="Rotate the 3D solid with your finger or mouse. Choose different cutting planes and see if both halves match."
              size="sm"
            />
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-600">
          Rotate the solid by dragging with your mouse or finger! Select a 3D solid and test different cutting planes.
        </p>

        {/* Solid selectors */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <span className="text-xs font-bold text-slate-500">Solid:</span>
          {SOLIDS_3D_DATA.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedSolidId(s.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition ${
                selectedSolidId === s.id
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {s.name} ({s.planes === 999 ? 'Infinite' : s.planes} planes)
            </button>
          ))}
        </div>

        {/* Plane orientation buttons */}
        <div className="flex flex-wrap items-center gap-2 p-3 bg-purple-50/60 rounded-2xl border border-purple-100">
          <span className="text-xs font-bold text-slate-600">Test Cutting Plane:</span>
          <button
            onClick={() => setSelectedPlane('horizontal')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
              selectedPlane === 'horizontal' ? 'bg-purple-600 text-white shadow-xs' : 'bg-white text-slate-700 border border-slate-200'
            }`}
          >
            Horizontal Mid-plane
          </button>
          <button
            onClick={() => setSelectedPlane('vertical-fb')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
              selectedPlane === 'vertical-fb' ? 'bg-purple-600 text-white shadow-xs' : 'bg-white text-slate-700 border border-slate-200'
            }`}
          >
            Vertical (Front-to-Back)
          </button>
          <button
            onClick={() => setSelectedPlane('vertical-lr')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
              selectedPlane === 'vertical-lr' ? 'bg-purple-600 text-white shadow-xs' : 'bg-white text-slate-700 border border-slate-200'
            }`}
          >
            Vertical (Left-to-Right)
          </button>
          <button
            onClick={() => setSelectedPlane('diagonal')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
              selectedPlane === 'diagonal' ? 'bg-purple-600 text-white shadow-xs' : 'bg-white text-slate-700 border border-slate-200'
            }`}
          >
            Diagonal Corner-to-Corner
          </button>
          <button
            onClick={() => setSelectedPlane('slanted')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
              selectedPlane === 'slanted' ? 'bg-rose-600 text-white shadow-xs' : 'bg-white text-rose-700 border border-rose-200'
            }`}
          >
            Random Slanted Plane
          </button>
        </div>

        {/* 3D Canvas or 2D Fallback */}
        <div className="relative bg-gradient-to-b from-slate-900 to-slate-800 rounded-3xl overflow-hidden p-4 shadow-inner min-h-[340px] flex flex-col items-center justify-center">
          <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-xs text-slate-200 backdrop-blur-xs flex items-center gap-1.5">
              <Rotate3d className="w-3.5 h-3.5 text-purple-400" />
              <span>Drag to rotate 3D view</span>
            </span>
          </div>

          <div className="absolute top-4 right-4 z-10">
            {isPlaneSymmetric ? (
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-500 text-white text-xs font-extrabold shadow-md">
                <Check className="w-4 h-4" />
                <span>PLANE OF SYMMETRY!</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-rose-500 text-white text-xs font-extrabold shadow-md">
                <X className="w-4 h-4" />
                <span>NOT A PLANE OF SYMMETRY</span>
              </span>
            )}
          </div>

          {useFallback2D ? (
            /* Fallback 2D Illustrated Diagram */
            <div className="p-8 text-center text-white">
              <svg viewBox="0 0 200 160" className="w-56 h-44 mx-auto mb-3">
                <polygon points="50,45 110,25 160,45 100,65" fill="#a855f7" stroke="#ffffff" strokeWidth="2" />
                <polygon points="50,45 100,65 100,125 50,105" fill="#9333ea" stroke="#ffffff" strokeWidth="2" />
                <polygon points="100,65 160,45 160,105 100,125" fill="#7e22ce" stroke="#ffffff" strokeWidth="2" />
                <polygon
                  points="20,85 140,45 180,85 60,125"
                  fill={isPlaneSymmetric ? '#22c55e' : '#ef4444'}
                  fillOpacity="0.45"
                  stroke={isPlaneSymmetric ? '#22c55e' : '#ef4444'}
                  strokeWidth="2"
                  strokeDasharray="4"
                />
              </svg>
              <p className="text-sm font-bold text-slate-200">{currentSolid.name}</p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                {currentSolid.description}
              </p>
            </div>
          ) : (
            <div ref={mountRef} className="w-full h-[320px] flex items-center justify-center cursor-grab active:cursor-grabbing" />
          )}

          {/* Feedback description banner */}
          <div className="absolute bottom-4 left-4 right-4 z-10 text-center">
            <div className="inline-block px-4 py-2 rounded-2xl bg-slate-900/90 border border-slate-700/80 backdrop-blur-md text-xs sm:text-sm text-slate-200 font-medium max-w-lg">
              {isPlaneSymmetric ? (
                <span className="text-emerald-300 font-bold">
                  ✔ Both halves are identical in size and shape. Each half is a mirror reflection of the other across this flat plane.
                </span>
              ) : (
                <span className="text-rose-300 font-bold">
                  ✘ The halves do NOT match. Slicing along this plane creates unequal pieces with different shapes.
                </span>
              )}
            </div>
          </div>
        </div>

        {/* SUMMARY OF 3D SOLIDS PLANES TABLE */}
        <div className="mt-8 pt-6 border-t border-slate-100 space-y-3">
          <h4 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
            <Layers className="w-5 h-5 text-purple-600" />
            <span>IGCSE 0580 Reference Table: Planes of Symmetry in Common Solids</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {SOLIDS_3D_DATA.map((solid) => (
              <div
                key={solid.id}
                className={`p-4 rounded-2xl border transition ${
                  selectedSolidId === solid.id
                    ? 'bg-purple-50/70 border-purple-400 ring-2 ring-purple-200'
                    : 'bg-white border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <h5 className="font-extrabold text-slate-900 text-sm">{solid.name}</h5>
                  <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 font-extrabold text-xs">
                    {solid.planes === 999 ? 'Infinite' : `${solid.planes} planes`}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mb-2">{solid.description}</p>
                <ul className="text-[11px] text-slate-500 space-y-1 list-disc list-inside">
                  {solid.planesBreakdown.slice(0, 2).map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* d) WORKED EXAMPLES */}
      <div className="bg-white rounded-3xl p-6 border border-purple-100 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-purple-100 text-purple-800 flex items-center justify-center text-sm font-bold">d</span>
            <span>Step-by-Step Worked Examples</span>
          </h3>
          <AudioButton
            textToRead={`Worked Example: ${SECTION3_WORKED_EXAMPLES[activeExampleIndex].title}. Problem: ${SECTION3_WORKED_EXAMPLES[activeExampleIndex].problem}. Step: ${SECTION3_WORKED_EXAMPLES[activeExampleIndex].steps[currentStepIndex].title}. ${SECTION3_WORKED_EXAMPLES[activeExampleIndex].steps[currentStepIndex].explanation}`}
            size="sm"
          />
        </div>

        {/* Tab selection */}
        <div className="flex flex-wrap gap-2">
          {SECTION3_WORKED_EXAMPLES.map((ex, idx) => (
            <button
              key={ex.id}
              onClick={() => {
                setActiveExampleIndex(idx);
                setCurrentStepIndex(0);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeExampleIndex === idx
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Example {idx + 1}
            </button>
          ))}
        </div>

        {/* Active Example Card */}
        {(() => {
          const ex = SECTION3_WORKED_EXAMPLES[activeExampleIndex];
          const step = ex.steps[currentStepIndex];

          return (
            <div className="p-5 rounded-2xl bg-purple-50/50 border border-purple-200/80 space-y-4">
              <div>
                <h4 className="text-base font-extrabold text-purple-950">{ex.title}</h4>
                <p className="text-sm text-slate-700 mt-1 font-medium bg-white p-3 rounded-xl border border-purple-100">
                  <strong>Question:</strong> {ex.problem}
                </p>
              </div>

              {/* Progress bar of steps */}
              <div className="flex items-center gap-1.5">
                {ex.steps.map((_, i) => (
                  <div
                    key={i}
                    className={`h-2 flex-1 rounded-full transition-all ${
                      i <= currentStepIndex ? 'bg-purple-500' : 'bg-slate-200'
                    }`}
                  />
                ))}
              </div>

              {/* Step Content */}
              <div className="p-4 rounded-xl bg-white border border-purple-100 shadow-2xs space-y-2">
                <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">
                  Step {currentStepIndex + 1} of {ex.steps.length}: {step.title}
                </span>
                <p className="text-sm text-slate-700 leading-relaxed font-medium">
                  {step.explanation}
                </p>
                {step.mathFormula && (
                  <div className="p-2 bg-slate-50 rounded-lg text-center">
                    <MathView math={step.mathFormula} block />
                  </div>
                )}
              </div>

              {/* Step Navigation Buttons */}
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => setCurrentStepIndex((prev) => Math.max(0, prev - 1))}
                  disabled={currentStepIndex === 0}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white transition cursor-pointer flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Previous step</span>
                </button>

                <button
                  onClick={() =>
                    setCurrentStepIndex((prev) => Math.min(ex.steps.length - 1, prev + 1))
                  }
                  disabled={currentStepIndex === ex.steps.length - 1}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs sm:text-sm shadow-xs disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer flex items-center gap-1"
                >
                  <span>Next step</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })()}
      </div>

      {/* e) PRACTICE EXERCISES (5 QUESTIONS) */}
      <div className="bg-white rounded-3xl p-6 border border-purple-100 shadow-xs space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-purple-100 text-purple-800 flex items-center justify-center text-sm font-bold">e</span>
              <span>Practice Exercises (5 Questions)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Instant feedback • Hints available • Try until you get it right!
            </p>
          </div>
          <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-800 font-bold text-xs">
            {correctPracticeCount} / {SECTION3_PRACTICE.length} Correct
          </span>
        </div>

        <div className="space-y-6">
          {SECTION3_PRACTICE.map((q, idx) => {
            const state = answersState[q.id] || { attempts: 0 };

            return (
              <div
                key={q.id}
                className={`p-5 rounded-2xl border transition-all ${
                  state.isCorrect
                    ? 'bg-emerald-50/50 border-emerald-300'
                    : state.attempts > 0
                    ? 'bg-rose-50/30 border-rose-200'
                    : 'bg-slate-50/60 border-slate-200'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h4 className="text-sm font-bold text-slate-800">
                    Question {idx + 1}: {q.question}
                  </h4>
                  <AudioButton textToRead={q.speechText} size="sm" />
                </div>

                {/* Multiple choice options */}
                {q.type === 'choice' && q.options && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
                    {q.options.map((opt, oIdx) => {
                      const isChosen = state.selected === oIdx;
                      const isOptionCorrect = oIdx === q.correctOptionIndex;

                      return (
                        <button
                          key={oIdx}
                          onClick={() => handleOptionSelect(q.id, oIdx, q.correctOptionIndex!)}
                          disabled={state.isCorrect}
                          className={`p-3 rounded-xl text-left text-xs sm:text-sm font-semibold transition cursor-pointer border ${
                            state.isCorrect && isOptionCorrect
                              ? 'bg-emerald-500 text-white border-emerald-600 font-bold'
                              : isChosen && !state.isCorrect
                              ? 'bg-rose-100 text-rose-800 border-rose-300'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-purple-50 hover:border-purple-300'
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Number input type */}
                {q.type === 'number' && (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleNumberSubmit(q.id, q.correctNumber!);
                    }}
                    className="flex items-center gap-2 mt-3"
                  >
                    <input
                      type="number"
                      step="any"
                      placeholder="Type number..."
                      value={state.numInput || ''}
                      onChange={(e) =>
                        setAnswersState((s) => ({
                          ...s,
                          [q.id]: { ...(s[q.id] || { attempts: 0 }), numInput: e.target.value },
                        }))
                      }
                      disabled={state.isCorrect}
                      className="px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-sm font-bold w-36 focus:outline-hidden focus:border-purple-500"
                    />
                    <button
                      type="submit"
                      disabled={state.isCorrect || !state.numInput}
                      className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs sm:text-sm disabled:opacity-40 transition cursor-pointer"
                    >
                      Check Answer
                    </button>
                  </form>
                )}

                {/* Feedback & Hint */}
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200/60">
                  <div>
                    {state.isCorrect && (
                      <p className="text-xs sm:text-sm font-bold text-emerald-700 flex items-center gap-1.5">
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span>{q.explanation}</span>
                      </p>
                    )}
                    {!state.isCorrect && state.attempts > 0 && (
                      <p className="text-xs sm:text-sm font-bold text-rose-600">
                        Not quite right yet. Try again!
                      </p>
                    )}
                  </div>

                  {!state.isCorrect && (
                    <button
                      onClick={() =>
                        setAnswersState((s) => ({
                          ...s,
                          [q.id]: { ...(s[q.id] || { attempts: 0 }), showHint: !s[q.id]?.showHint },
                        }))
                      }
                      className="text-xs font-bold text-amber-700 hover:text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 transition cursor-pointer flex items-center gap-1"
                    >
                      <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
                      <span>{state.showHint ? 'Hide Hint' : 'Show Hint'}</span>
                    </button>
                  )}
                </div>

                {state.showHint && !state.isCorrect && (
                  <div className="mt-2 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 font-medium">
                    💡 <strong>Hint:</strong> {q.hint}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* f) SHORT SUMMARY BOX ("Remember this!") */}
      <div className="bg-purple-50 rounded-3xl p-6 border-2 border-purple-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-extrabold text-purple-950 flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-purple-200 text-purple-800 flex items-center justify-center text-sm font-bold">f</span>
            <span>Remember this! (3D Planes of Symmetry)</span>
          </h3>
          <AudioButton
            textToRead="Remember this! A solid cube has 9 planes of symmetry. A cuboid with three different dimensions has only 3 planes of symmetry. A square-based pyramid has 4 planes of symmetry."
            size="sm"
          />
        </div>

        <ul className="space-y-2 text-xs sm:text-sm text-purple-900 font-semibold list-disc list-inside">
          <li>
            <strong>Cube vs Cuboid:</strong> A cube has <strong>9 planes</strong> (3 parallel to faces + 6 diagonal planes). A cuboid where length, width, and height are different has <strong>only 3 planes</strong> (diagonal slices do NOT work!).
          </li>
          <li>
            <strong>Square-based Pyramid:</strong> Has <strong>4 planes of symmetry</strong> (2 through opposite edge midpoints and 2 through opposite diagonal corners).
          </li>
          <li>
            <strong>Cylinder:</strong> Has an <strong>infinite number</strong> of vertical planes through its axis + 1 horizontal plane through its middle.
          </li>
        </ul>
      </div>

      {/* g) ACTION BUTTONS: SAVE & PDF DOWNLOAD & NEXT SECTION */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              onSaveProgress();
              onTriggerCelebration(`Progress saved for ${studentName}! 💾`);
            }}
            className="px-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs sm:text-sm shadow-xs flex items-center gap-2 transition cursor-pointer"
          >
            <Save className="w-4 h-4 text-purple-600" />
            <span>Save Progress</span>
          </button>

          <button
            onClick={handleDownloadSectionPdf}
            className="px-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs sm:text-sm shadow-xs flex items-center gap-2 transition cursor-pointer"
          >
            <Download className="w-4 h-4 text-purple-600" />
            <span>Download Section as PDF</span>
          </button>
        </div>

        <button
          onClick={onComplete}
          className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 text-white font-extrabold text-sm shadow-md transition flex items-center gap-2 cursor-pointer"
        >
          <span>Continue to Section 4: Final Assessment</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <PdfModal
        isOpen={pdfModal.isOpen}
        onClose={() => setPdfModal((prev) => ({ ...prev, isOpen: false }))}
        pdfUrl={pdfModal.url}
        filename={pdfModal.filename}
        title={pdfModal.title}
        studentName={studentName}
      />
    </div>
  );
};
