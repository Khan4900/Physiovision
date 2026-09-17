import React from "react";
import { Link } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import { Check } from "lucide-react";
import CustomButton from "../components/CustomButton";
import theme from "../theme";

const Onboarding = () => {
  const features = [
    {
      text: "Real-time Exercise posture corrections while exercising",
    },
    {
      text: "Personalized workout plan based on your goal and fitness level",
    },
    {
      text: "Exercise AR Demo to gain better exercise knowledge",
    },
  ];

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 md:p-8"
      style={{ backgroundImage: "linear-gradient(90deg, #d6e8ff 0%, #ffffff 50%, #ffd6e8 100%)" }}
    >
        <Motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-lg"
        >
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <img
              src="/src/assets/Physiovision.png"
              alt="Physiovision Logo"
              className="h-16 w-auto"
            />
          </div>

          {/* Welcome message */}
          <h1
            className="text-3xl md:text-4xl font-bold text-center mb-4"
            style={{ color: theme.colors.text.primary }}
          >
            Welcome to Physiovision
          </h1>

          {/* Description */}
          <p
            className="text-base md:text-lg text-center mb-8 px-4 md:px-0"
            style={{ color: theme.colors.text.secondary }}
          >
            Get healthier and energetic everyday with easy exercises tailored
            for home workout enthusiasts and fitness beginners.
          </p>

          {/* Feature list */}
          <div className="space-y-4 mb-8">
            {features.map((feature, index) => (
              <Motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                className="flex items-start gap-4"
              >
                <div
                  className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ backgroundImage: theme.gradients.primary }}
                >
                  <Check size={24} className="text-white" />
                </div>
                <p
                  className="text-base md:text-lg flex-1 pt-2"
                  style={{ color: theme.colors.text.primary }}
                >
                  {feature.text}
                </p>
              </Motion.div>
            ))}
          </div>

          {/* Button linking to CreateProgram */}
          <div className="mb-6">
            <Link to="/createprogram" className="block">
              <CustomButton
                text="Create your Profile"
                variant="primary"
                fullWidth={true}
                type="button"
              />
            </Link>
          </div>

          {/* Sign In link */}
          <p
            className="text-center text-sm md:text-base"
            style={{ color: theme.colors.text.secondary }}
          >
            Already have an account?{" "}
            <Link
              to="/signin"
              className="font-bold transition-opacity hover:opacity-75"
              style={{ color: theme.colors.primary.blue }}
            >
              Log In
            </Link>
          </p>
        </Motion.div>
    </div>
  );
};

export default Onboarding;
