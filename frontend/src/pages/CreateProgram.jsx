import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { theme } from '../theme';
import ProgressBar from '../components/ProgressBar';
import CustomButton from '../components/CustomButton';
import { UseAuth } from '../context/AuthContext';

// Dummy data replacing remote calls
const primaryGoalsOptions = [
  { id: 1, name: 'Lose Weight', description: 'Structured fat-loss focused workouts and recovery.' },
  { id: 2, name: 'Build Muscle', description: 'Progressive resistance sessions to increase lean mass.' },
  { id: 3, name: 'Improve Endurance', description: 'Cardio centric plan to enhance stamina & VO2.' },
];

const intensityOptions = [
  { id: 1, name: 'Light' },
  { id: 2, name: 'Moderate' },
  { id: 3, name: 'Challenging' },
  { id: 4, name: 'Intense' },
];

const pastExerciseFrequencyOptions = [
  'Less than once a month',
  'Less than once a week',
  'At least once a week',
  'At least 3 times a week',
  'Almost every day',
];

const weekdays = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

const CreateProgram = () => {
  const navigate = useNavigate();
  const { user } = UseAuth();
  const [step, setStep] = useState(1);
  const [gender, setGender] = useState('other');
  const [selectedGoal, setSelectedGoal] = useState(1);
  const [pastExerciseFrequency, setPastExerciseFrequency] = useState(1);
  const [intensity, setIntensity] = useState(1);
  const [schedule, setSchedule] = useState(['Monday']);
  const [birthday, setBirthday] = useState('');
  const [weight, setWeight] = useState('');
  const [weightUnit, setWeightUnit] = useState('lbs');

  const totalSteps = 6;
  const progress = (step / totalSteps) * 100;

  const toggleSchedule = (day) => {
    setSchedule(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]);
  };

  const nextStep = () => step < totalSteps && setStep(step + 1);
  const previousStep = () => step > 1 && setStep(step - 1);

  const submitForm = () => {
    const formResponse = {
      gender,
      goal_id: selectedGoal,
      past_exercise_frequency: pastExerciseFrequency,
      intensity_id: intensity,
      schedule,
      birthday,
      weight,
      weight_unit: weightUnit,
    };
    if (user) navigate('/', { state: formResponse });
    else navigate('/signup', { state: { userResponses: formResponse } });
  };

  const labelStyle = { color: theme.colors.text.primary };
  const mutedStyle = { color: theme.colors.text.secondary };
  const cardBg = { backgroundColor: theme.colors.background.card };
  const accentBg = theme.gradients.primary;

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-8 bg-cover bg-top"
      style={{
        backgroundImage: "linear-gradient(90deg, #d6e8ff 0%, #ffffff 50%, #ffd6e8 100%)",
        backgroundColor: theme.colors.background.main,
      }}
    >
      {/* Logo */}
      <div className="mb-6">
        <img 
          src="/src/assets/Physiovision.png" 
          alt="Physiovision Logo" 
          className="w-24 h-24 object-contain"
        />
      </div>
      
      <div className="w-full max-w-2xl relative">
        {/* Close / back to landing */}
        <button
          aria-label="Close"
          onClick={() => navigate('/landing')}
          className="absolute -top-12 right-0 p-2 rounded-full text-sm"
          style={{ color: theme.colors.primary.blue }}
        >
          ✕
        </button>
      </div>
      <div className="w-full max-w-2xl rounded-2xl shadow-lg backdrop-blur-md border" style={{
        borderColor: theme.colors.border.light,
        backgroundColor: 'rgba(255,255,255,.85)'
      }}>
        <div className="p-6 space-y-6">
          <ProgressBar progress={progress} />

          {/* STEP CONTENT */}
          <form
            onSubmit={(e) => { e.preventDefault(); submitForm(); }}
            className="space-y-10"
          >
            {/* Step 1 Gender */}
            {step === 1 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold" style={labelStyle}>What sex were you assigned at birth?</h2>
                <div className="flex flex-col gap-2">
                  {['F','M','other'].map(val => (
                    <label key={val} className="flex items-center gap-3 cursor-pointer px-4 py-3 rounded-lg border transition"
                      style={{
                        borderColor: gender === val ? theme.colors.primary.blue : theme.colors.border.light,
                        backgroundColor: gender === val ? theme.colors.background.softBlue : theme.colors.background.card
                      }}
                    >
                      <input
                        type="radio"
                        className="hidden"
                        checked={gender === val}
                        onChange={() => setGender(val)}
                      />
                      <span className="font-medium" style={labelStyle}>
                        {val === 'F' ? 'Female' : val === 'M' ? 'Male' : 'Prefer not to say'}
                      </span>
                    </label>
                  ))}
                </div>
                <p className="text-sm" style={mutedStyle}>Sex can affect hormonal balance, muscle composition, and fat distribution influencing training response.</p>
              </div>
            )}

            {/* Step 2 Primary Goal */}
            {step === 2 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold" style={labelStyle}>What is your primary goal?</h2>
                <div className="space-y-3">
                  {primaryGoalsOptions.map(g => (
                    <div key={g.id} className="rounded-lg border group cursor-pointer" style={{
                        borderColor: selectedGoal === g.id ? theme.colors.primary.blue : theme.colors.border.light,
                        backgroundColor: selectedGoal === g.id ? theme.colors.background.softBlue : theme.colors.background.card
                      }}>
                      <label className="flex items-center justify-between px-4 py-3">
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            className="hidden"
                            checked={selectedGoal === g.id}
                            onChange={() => setSelectedGoal(g.id)}
                          />
                          <span className="font-medium" style={labelStyle}>{g.name}</span>
                        </div>
                        <span className="text-xs px-3 py-1 rounded-full" style={{ backgroundColor: theme.colors.background.softBlue, color: theme.colors.primary.blue }}>Info</span>
                      </label>
                      <div className="px-4 pb-3 text-sm" style={mutedStyle}>{g.description}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3 Past Exercise Frequency */}
            {step === 3 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold" style={labelStyle}>How often did you exercise in the past?</h2>
                <div className="flex flex-wrap justify-center gap-4">
                  {pastExerciseFrequencyOptions.map((f, idx) => (
                    <label key={f} className="flex flex-col items-center text-center cursor-pointer">
                      <input
                        type="radio"
                        className="hidden"
                        checked={pastExerciseFrequency === idx + 1}
                        onChange={() => setPastExerciseFrequency(idx + 1)}
                      />
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold transition"
                        style={{
                          backgroundImage: pastExerciseFrequency === idx + 1 ? accentBg : undefined,
                          backgroundColor: pastExerciseFrequency === idx + 1 ? theme.colors.primary.blue : theme.colors.border.light,
                        }}
                      >{idx + 1}</div>
                      <span className="mt-2 text-xs" style={mutedStyle}>{f}</span>
                    </label>
                  ))}
                </div>
                <p className="text-sm" style={mutedStyle}>Past experience sets the foundation for starting intensity and progression.</p>
              </div>
            )}

            {/* Step 4 Intensity */}
            {step === 4 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold" style={labelStyle}>How intensely do you want to exercise?</h2>
                <div className="flex flex-wrap justify-center gap-4">
                  {intensityOptions.map((i, idx) => (
                    <label key={i.id} className="flex flex-col items-center text-center cursor-pointer">
                      <input
                        type="radio"
                        className="hidden"
                        checked={intensity === i.id}
                        onChange={() => setIntensity(i.id)}
                      />
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold transition"
                        style={{
                          backgroundImage: intensity === i.id ? accentBg : undefined,
                          backgroundColor: intensity === i.id ? theme.colors.primary.pink : theme.colors.border.light,
                        }}
                      >{idx + 1}</div>
                      <span className="mt-2 text-xs" style={mutedStyle}>{i.name}</span>
                    </label>
                  ))}
                </div>
                <p className="text-sm" style={mutedStyle}>Determines workout difficulty and recovery balance. You can adjust in future programs.</p>
              </div>
            )}

            {/* Step 5 Schedule */}
            {step === 5 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold" style={labelStyle}>When can you exercise?</h2>
                <div className="flex flex-wrap justify-center gap-4">
                  {weekdays.map(d => (
                    <label key={d} className="flex flex-col items-center text-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="hidden"
                        checked={schedule.includes(d)}
                        onChange={() => toggleSchedule(d)}
                      />
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-semibold transition"
                        style={{
                          backgroundImage: schedule.includes(d) ? accentBg : undefined,
                          backgroundColor: schedule.includes(d) ? theme.colors.primary.green : theme.colors.border.light,
                          color: schedule.includes(d) ? theme.colors.text.light : theme.colors.text.primary,
                        }}
                      >{d.substring(0,3)}</div>
                    </label>
                  ))}
                </div>
                <p className="text-sm" style={mutedStyle}>We will suggest an optimal schedule, but you can stay flexible.</p>
              </div>
            )}

            {/* Step 6 Personal Info */}
            {step === 6 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold" style={labelStyle}>Almost done! Enter date of birth and weight.</h2>
                <div className="grid gap-4" style={cardBg}>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium" style={labelStyle}>Date of Birth</label>
                    <input
                      type="date"
                      value={birthday}
                      onChange={(e) => setBirthday(e.target.value)}
                      className="px-3 py-2 rounded-lg border text-sm"
                      style={{
                        borderColor: theme.colors.border.light,
                        backgroundColor: theme.colors.background.card,
                        color: theme.colors.text.primary,
                      }}
                      required
                    />
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-1 flex flex-col gap-2">
                      <label className="text-sm font-medium" style={labelStyle}>Weight</label>
                      <input
                        type="number"
                        min={0}
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        className="px-3 py-2 rounded-lg border text-sm"
                        style={{
                          borderColor: theme.colors.border.light,
                          backgroundColor: theme.colors.background.card,
                          color: theme.colors.text.primary,
                        }}
                        required
                      />
                    </div>
                    <div className="w-28 flex flex-col gap-2">
                      <label className="text-sm font-medium" style={labelStyle}>Unit</label>
                      <select
                        value={weightUnit}
                        onChange={(e) => setWeightUnit(e.target.value)}
                        className="px-3 py-2 rounded-lg border text-sm"
                        style={{
                          borderColor: theme.colors.border.light,
                          backgroundColor: theme.colors.background.card,
                          color: theme.colors.text.primary,
                        }}
                      >
                        <option value="lbs">Lbs</option>
                        <option value="kg">Kg</option>
                      </select>
                    </div>
                  </div>
                </div>
                <p className="text-sm" style={mutedStyle}>These help tailor caloric needs and safe starting intensity.</p>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-center gap-4 pt-4">
              <div className="w-40">
                <CustomButton
                  text="Back"
                  onClick={previousStep}
                  disabled={step === 1}
                  variant="outline"
                  fullWidth={true}
                  type="button"
                />
              </div>
              {step === totalSteps ? (
                <div className="w-40">
                  <CustomButton
                    text="Complete"
                    type="submit"
                    variant="primary"
                    fullWidth={true}
                  />
                </div>
              ) : (
                <div className="w-40">
                  <CustomButton
                    text="Next"
                    onClick={nextStep}
                    variant="primary"
                    fullWidth={true}
                    type="button"
                  />
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
      <div className="mt-10 text-center text-xs" style={mutedStyle}>
        <p>Progress is saved in memory only. Finish to continue to sign up.</p>
      </div>
    </div>
  );
};

export default CreateProgram;