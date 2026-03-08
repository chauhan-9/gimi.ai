// @ts-nocheck
import { Suspense, useRef, useState } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import * as THREE from "three";
import { Download, X } from "lucide-react";
import { toast } from "sonner";

function ImagePlane({ imageUrl }: { imageUrl: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const texture = useLoader(THREE.TextureLoader, imageUrl);

  // Auto-rotate gently
  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.15;
    }
  });

  const aspect = texture.image ? texture.image.width / texture.image.height : 1;
  const width = 4;
  const height = width / aspect;

  return (
    <mesh ref={meshRef} castShadow>
      <boxGeometry args={[width, height, 0.15]} />
      <meshStandardMaterial map={texture} attach="material-4" />
      <meshStandardMaterial map={texture} attach="material-5" />
      <meshStandardMaterial color="#1a1a2e" metalness={0.8} roughness={0.2} attach="material-0" />
      <meshStandardMaterial color="#1a1a2e" metalness={0.8} roughness={0.2} attach="material-1" />
      <meshStandardMaterial color="#1a1a2e" metalness={0.8} roughness={0.2} attach="material-2" />
      <meshStandardMaterial color="#1a1a2e" metalness={0.8} roughness={0.2} attach="material-3" />
    </mesh>
  );
}

function ImageSphere({ imageUrl }: { imageUrl: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const texture = useLoader(THREE.TextureLoader, imageUrl);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.2;
    }
  });

  return (
    <mesh ref={meshRef} castShadow>
      <sphereGeometry args={[2, 64, 64]} />
      <meshStandardMaterial map={texture} metalness={0.1} roughness={0.4} />
    </mesh>
  );
}

function ImageCube({ imageUrl }: { imageUrl: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const texture = useLoader(THREE.TextureLoader, imageUrl);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.3;
      meshRef.current.rotation.x += delta * 0.1;
    }
  });

  return (
    <mesh ref={meshRef} castShadow>
      <boxGeometry args={[3, 3, 3]} />
      <meshStandardMaterial map={texture} metalness={0.2} roughness={0.3} />
    </mesh>
  );
}

type Shape3D = "card" | "sphere" | "cube";

interface Image3DViewerProps {
  src: string;
  onClose: () => void;
}

export function Image3DViewer({ src, onClose }: Image3DViewerProps) {
  const [shape, setShape] = useState<Shape3D>("card");

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = src;
    link.download = `hexa-3d-image-${Date.now()}.png`;
    link.click();
    toast.success("Download started!");
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-background animate-in fade-in-0 duration-200">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-card border-b border-border">
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold font-display gradient-text">3D Viewer</span>
          <div className="flex items-center bg-muted rounded-lg p-0.5">
            {(["card", "sphere", "cube"] as Shape3D[]).map((s) => (
              <button
                key={s}
                onClick={() => setShape(s)}
                className={`px-3 py-1 text-xs rounded-md font-medium transition-all capitalize ${
                  shape === s ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={handleDownload} className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
            <Download size={18} />
          </button>
          <button onClick={onClose} className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
            <X size={18} />
          </button>
        </div>
      </div>

      {/* 3D Canvas */}
      <div className="flex-1 relative">
        <Canvas
          camera={{ position: [0, 0, 6], fov: 50 }}
          shadows
          className="bg-background"
        >
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
          <pointLight position={[-5, -5, 5]} intensity={0.5} color="#a855f7" />
          <pointLight position={[5, -5, -5]} intensity={0.3} color="#6366f1" />

          <Suspense fallback={null}>
            {shape === "card" && <ImagePlane imageUrl={src} />}
            {shape === "sphere" && <ImageSphere imageUrl={src} />}
            {shape === "cube" && <ImageCube imageUrl={src} />}
            <Environment preset="city" />
          </Suspense>

          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            autoRotate={false}
            minDistance={2}
            maxDistance={15}
          />
        </Canvas>

        {/* Help text */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-card/80 backdrop-blur-sm border border-border rounded-lg px-3 py-1.5 text-[10px] text-muted-foreground">
          🖱️ Drag to rotate • Scroll to zoom • Right-click to pan
        </div>
      </div>
    </div>
  );
}
