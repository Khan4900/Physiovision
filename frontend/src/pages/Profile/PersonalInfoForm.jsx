import React, { useState } from 'react';
import { User, Mail, Phone, UserCircle, Calendar, Ruler, Weight, Target, Zap, CalendarDays } from 'lucide-react';
import { theme } from '../../theme';

const PersonalInfoForm = ({ user, onUpdate }) => {
  const [schedule, setSchedule] = useState(user.schedule || []);
  
  const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  const toggleSchedule = (day) => {
    setSchedule((prev) => 
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const inputStyle = {
    backgroundColor: theme.colors.background.main,
    border: `1px solid ${theme.colors.border.light}`,
    color: theme.colors.text.primary,
  };

  const focusStyle = {
    borderColor: theme.colors.border.focus,
  };

  return (
    <div
      className="rounded-xl p-6"
      style={{
        backgroundColor: theme.colors.background.card,
        border: `1px solid ${theme.colors.border.light}`,
      }}
    >
      <h3 className="text-lg font-semibold mb-6" style={{ color: theme.colors.text.primary }}>
        Personal Information
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Full Name */}
        <div className="space-y-2">
          <label className="text-sm mb-2 block" style={{ color: theme.colors.text.primary }}>
            Full Name
          </label>
          <div className="relative">
            <User
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5"
              style={{ color: theme.colors.text.secondary }}
            />
            <input
              type="text"
              defaultValue={user.fullName}
              placeholder="Enter your full name"
              className="w-full rounded-lg py-2 pl-10 pr-4"
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = focusStyle.borderColor)}
              onBlur={(e) => (e.target.style.borderColor = theme.colors.border.light)}
            />
          </div>
        </div>

        {/* Email */}
        <div className="space-y-2">
          <label className="text-sm mb-2 block" style={{ color: theme.colors.text.primary }}>
            Email
          </label>
          <div className="relative">
            <Mail
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5"
              style={{ color: theme.colors.text.secondary }}
            />
            <input
              type="email"
              defaultValue={user.email}
              placeholder="Enter your email"
              className="w-full rounded-lg py-2 pl-10 pr-4"
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = focusStyle.borderColor)}
              onBlur={(e) => (e.target.style.borderColor = theme.colors.border.light)}
            />
          </div>
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <label className="text-sm mb-2 block" style={{ color: theme.colors.text.primary }}>
            Phone
          </label>
          <div className="relative">
            <Phone
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5"
              style={{ color: theme.colors.text.secondary }}
            />
            <input
              type="tel"
              defaultValue={user.phone}
              placeholder="Enter your phone number"
              className="w-full rounded-lg py-2 pl-10 pr-4"
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = focusStyle.borderColor)}
              onBlur={(e) => (e.target.style.borderColor = theme.colors.border.light)}
            />
          </div>
        </div>

        {/* Gender */}
        <div className="space-y-2">
          <label className="text-sm mb-2 block" style={{ color: theme.colors.text.primary }}>
            Gender
          </label>
          <div className="relative">
            <UserCircle
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5"
              style={{ color: theme.colors.text.secondary }}
            />
            <select
              defaultValue={user.gender}
              className="w-full rounded-lg py-2 pl-10 pr-4 appearance-none cursor-pointer"
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = focusStyle.borderColor)}
              onBlur={(e) => (e.target.style.borderColor = theme.colors.border.light)}
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        {/* Date of Birth */}
        <div className="space-y-2">
          <label className="text-sm mb-2 block" style={{ color: theme.colors.text.primary }}>
            Date of Birth
          </label>
          <div className="relative">
            <Calendar
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5"
              style={{ color: theme.colors.text.secondary }}
            />
            <input
              type="date"
              defaultValue={user.dateOfBirth}
              className="w-full rounded-lg py-2 pl-10 pr-4"
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = focusStyle.borderColor)}
              onBlur={(e) => (e.target.style.borderColor = theme.colors.border.light)}
            />
          </div>
        </div>

        {/* Height */}
        <div className="space-y-2">
          <label className="text-sm mb-2 block" style={{ color: theme.colors.text.primary }}>
            Height (cm)
          </label>
          <div className="relative">
            <Ruler
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5"
              style={{ color: theme.colors.text.secondary }}
            />
            <input
              type="number"
              defaultValue={user.height}
              placeholder="Enter height in cm"
              className="w-full rounded-lg py-2 pl-10 pr-4"
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = focusStyle.borderColor)}
              onBlur={(e) => (e.target.style.borderColor = theme.colors.border.light)}
            />
          </div>
        </div>

        {/* Weight */}
        <div className="space-y-2">
          <label className="text-sm mb-2 block" style={{ color: theme.colors.text.primary }}>
            Weight (kg)
          </label>
          <div className="relative">
            <Weight
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5"
              style={{ color: theme.colors.text.secondary }}
            />
            <input
              type="number"
              defaultValue={user.weight}
              placeholder="Enter weight in kg"
              className="w-full rounded-lg py-2 pl-10 pr-4"
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = focusStyle.borderColor)}
              onBlur={(e) => (e.target.style.borderColor = theme.colors.border.light)}
            />
          </div>
        </div>

        {/* Primary Goal */}
        <div className="space-y-2">
          <label className="text-sm mb-2 block" style={{ color: theme.colors.text.primary }}>
            Primary Goal
          </label>
          <div className="relative">
            <Target
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5"
              style={{ color: theme.colors.text.secondary }}
            />
            <select
              defaultValue={user.primaryGoal || 1}
              className="w-full rounded-lg py-2 pl-10 pr-4 appearance-none cursor-pointer"
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = focusStyle.borderColor)}
              onBlur={(e) => (e.target.style.borderColor = theme.colors.border.light)}
            >
              <option value={1}>Lose Weight</option>
              <option value={2}>Build Muscle</option>
              <option value={3}>Improve Endurance</option>
            </select>
          </div>
        </div>

        {/* Exercise Intensity */}
        <div className="space-y-2">
          <label className="text-sm mb-2 block" style={{ color: theme.colors.text.primary }}>
            Exercise Intensity
          </label>
          <div className="relative">
            <Zap
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5"
              style={{ color: theme.colors.text.secondary }}
            />
            <select
              defaultValue={user.intensity || 1}
              className="w-full rounded-lg py-2 pl-10 pr-4 appearance-none cursor-pointer"
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = focusStyle.borderColor)}
              onBlur={(e) => (e.target.style.borderColor = theme.colors.border.light)}
            >
              <option value={1}>Light</option>
              <option value={2}>Moderate</option>
              <option value={3}>Challenging</option>
              <option value={4}>Intense</option>
            </select>
          </div>
        </div>

        {/* Exercise Schedule */}
        <div className="space-y-3 md:col-span-2">
          <label className="text-sm mb-2 block" style={{ color: theme.colors.text.primary }}>
            When can you exercise?
          </label>
          <div className="flex flex-wrap gap-4">
            {weekdays.map((day) => (
              <label key={day} className="flex flex-col items-center text-center cursor-pointer">
                <input
                  type="checkbox"
                  className="hidden"
                  checked={schedule.includes(day)}
                  onChange={() => toggleSchedule(day)}
                />
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold transition-all"
                  style={{
                    backgroundImage: schedule.includes(day) ? theme.gradients.primary : undefined,
                    backgroundColor: schedule.includes(day) ? theme.colors.primary.green : theme.colors.border.light,
                    color: schedule.includes(day) ? theme.colors.text.light : theme.colors.text.primary,
                  }}
                >
                  {day.substring(0, 3)}
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalInfoForm;
