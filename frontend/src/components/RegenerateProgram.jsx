import React from 'react';
import { motion as Motion } from 'framer-motion';
import { RefreshCw } from 'lucide-react';
import theme from '../theme';

const RegenerateProgram = ({ handleGenerateProgram }) => {
  return (
    <Motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="rounded-xl p-8 shadow-md flex flex-col items-center justify-center text-center"
      style={{ backgroundColor: theme.colors.background.card }}
    >
      <div className="mb-6">
        <h2 
          className="text-2xl font-bold mb-2"
          style={{ color: theme.colors.text.primary }}
        >
          Program Complete! 🎉
        </h2>
        <p 
          className="text-base"
          style={{ color: theme.colors.text.secondary }}
        >
          Create a new exercise plan based on your recent fitness growth.
        </p>
      </div>

      <button
        onClick={handleGenerateProgram}
        className="w-36 h-36 rounded-full text-white font-bold text-base shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl flex items-center justify-center flex-col gap-2"
        style={{
          background: theme.gradients.primary,
        }}
      >
        <RefreshCw size={32} />
        <span>CREATE<br/>PROGRAM</span>
      </button>

      <p 
        className="mt-6 text-sm"
        style={{ color: theme.colors.text.secondary }}
      >
        Your new program will be personalized based on your progress and goals
      </p>
    </Motion.div>
  );
};

export default RegenerateProgram;
