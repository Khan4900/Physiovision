import { OrbitControls } from "@react-three/drei";
import MaleWorkoutModel from "../Model/MaleWorkoutModel.jsx";
import FemaleWorkoutModel from "../Model/FemaleWorkoutModel.jsx";
import MaleYogaModel from "../Model/MaleYogaModel.jsx";
import FemaleYogaModel from "../Model/FemaleYogaModel.jsx";

const XrHitModel = ({
  modelName,
  modelGender,
  zRotationMul,
  scaleMul,
  type = "workout",
}) => {
  const workoutComponents = {
    male: MaleWorkoutModel,
    female: FemaleWorkoutModel,
  };

  const yogaComponents = {
    male: MaleYogaModel,
    female: FemaleYogaModel,
  };

  // Determine if this is a yoga pose based on model name
  const isYogaPose = [
    "utkatasana",
    "bhujangasana",
    "adhomukhasvanasana",
    "sarvangasana",
    "trikonasana",
    "virabhadrasana3",
    "vrikshasana"
  ].includes(modelName);

  const components = isYogaPose ? yogaComponents : workoutComponents;
  const ModelComponent = components[modelGender];

  return (
    <>
      <OrbitControls 
        enableZoom={true} 
        enablePan={true} 
        enableRotate={true}
        minDistance={2}
        maxDistance={10}
      />
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <pointLight position={[-10, -10, -5]} intensity={0.5} />
      <spotLight position={[0, 10, 0]} intensity={0.3} />
      
      {isYogaPose ? (
        <ModelComponent
          modelName={modelName}
          scaleMul={scaleMul * 0.3}
        />
      ) : (
        <ModelComponent
          modelName={modelName}
          zRotationMul={zRotationMul}
          scaleMul={scaleMul}
        />
      )}
    </>
  );
};

export default XrHitModel;
