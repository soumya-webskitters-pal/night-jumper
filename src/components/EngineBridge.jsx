import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { startJumper3D } from "../game/engine";

export default function EngineBridge() {
  const { gl, scene, camera } = useThree();
  const engineRef = useRef(null);

  useEffect(() => {
    engineRef.current = startJumper3D(THREE, GLTFLoader, DRACOLoader, {
      renderer: gl,
      scene,
      camera,
    });
  }, [gl, scene, camera]);

  useFrame(() => engineRef.current?.animate());
  return null;
}
