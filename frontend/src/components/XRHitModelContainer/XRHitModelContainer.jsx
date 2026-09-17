import React, { useRef } from "react";
import { Canvas } from "@react-three/fiber";
import XrHitModel from "../XRHitModel/XRHitModel.jsx";
import * as styles from "./XRHitModelContainer.module.css";

const XrHitModelContainer = ({
  modelName,
  modelGender = "male",
  zRotationMul = 0.33,
  scaleMul = 0.3,
  type = "workout",
}) => {
  const canvasRef = useRef(null);

  return (
    <div className={styles.XRContainer} ref={canvasRef}>
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
        <XrHitModel
          modelName={modelName}
          modelGender={modelGender}
          zRotationMul={zRotationMul}
          scaleMul={scaleMul}
          type={type}
        />
      </Canvas>
    </div>
  );
};

export default XrHitModelContainer;
