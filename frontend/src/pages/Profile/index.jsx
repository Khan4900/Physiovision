import React from 'react';
import ProfileHeader from './ProfileHeader';
import PersonalInfoForm from './PersonalInfoForm';
import SecurityForm from './SecurityForm';
import { motion as Motion } from 'framer-motion';
import { theme } from '../../theme';

const Profile = () => {
  // Mock user data - replace with actual data from your backend
  const user = {
    name: 'Mukaram Awan',
    email: 'mukaramawan.official@gmail.com',
    avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg',
    fullName: 'Muhammad Mukaram Awan',
    phone: '+92 311 979084',
    gender: 'male',
    dateOfBirth: '2002-08-12',
    height: 175,
    weight: 70,
    primaryGoal: 2, // 1: Lose Weight, 2: Build Muscle, 3: Improve Endurance
    intensity: 3, // 1: Light, 2: Moderate, 3: Challenging, 4: Intense
    schedule: ['Monday', 'Wednesday', 'Friday'], // Days when user can exercise
  };

  const handleUpdate = (data) => {
    console.log('Update data:', data);
    // Implement your update logic here
  };

  const handleSave = () => {
    console.log('Saving changes...');
    // Implement save logic here
  };

  const handleCancel = () => {
    console.log('Canceling changes...');
    // Implement cancel logic here
  };

  return (
    <div
        className="space-y-7"
    >
      <ProfileHeader user={user} />
      <PersonalInfoForm user={user} onUpdate={handleUpdate} />
      <SecurityForm onUpdate={handleUpdate} />

      <div className="flex justify-end gap-4 mt-6">
        <Motion.button
          onClick={handleCancel}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="px-6 py-3 rounded-lg font-medium transition-colors"
          style={{
            backgroundColor: theme.colors.background.card,
            color: theme.colors.text.secondary,
            border: `1px solid ${theme.colors.border.light}`,
          }}
        >
          Cancel
        </Motion.button>
        <Motion.button
          onClick={handleSave}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="px-6 py-3 rounded-lg font-medium transition-colors"
          style={{
            background: theme.gradients.primary,
            color: theme.colors.text.light,
          }}
        >
          Save Changes
        </Motion.button>
      </div>

    </div>
  );
};

export default Profile;
