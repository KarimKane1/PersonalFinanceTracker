import React, { useState } from 'react';
import { Profile } from '../types/profile';
import { getProfiles, createProfile, deleteProfile, setCurrentProfileId } from '../utils/profileStorage';

interface ProfileSelectionProps {
  onProfileSelect: (profileId: string) => void;
}

export function ProfileSelection({ onProfileSelect }: ProfileSelectionProps) {
  const [profiles, setProfiles] = React.useState<Profile[]>(getProfiles());
  const [isCreating, setIsCreating] = useState(false);
  const [newProfileName, setNewProfileName] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const handleCreateProfile = () => {
    if (newProfileName.trim()) {
      const newProfile = createProfile(newProfileName);
      setProfiles(getProfiles());
      setNewProfileName('');
      setIsCreating(false);
      // Auto-select the new profile
      setCurrentProfileId(newProfile.id);
      onProfileSelect(newProfile.id);
    }
  };

  const handleSelectProfile = (profileId: string) => {
    setCurrentProfileId(profileId);
    onProfileSelect(profileId);
  };

  const handleDeleteProfile = (profileId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this profile? All data will be lost.')) {
      deleteProfile(profileId);
      setProfiles(getProfiles());
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 flex items-center justify-center p-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-12">Who's Watching?</h1>
        
        <div className="flex flex-wrap justify-center gap-6 mb-8 max-w-4xl">
          {profiles.map((profile) => (
            <div
              key={profile.id}
              onClick={() => handleSelectProfile(profile.id)}
              className="group relative cursor-pointer transition-transform hover:scale-105"
            >
              <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center mb-3 shadow-lg hover:shadow-xl transition-shadow">
                <span className="text-4xl">👤</span>
              </div>
              {isEditing && (
                <button
                  onClick={(e) => handleDeleteProfile(profile.id, e)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                >
                  ×
                </button>
              )}
              <div className="text-white text-sm font-medium">{profile.name}</div>
            </div>
          ))}
          
          {!isCreating && (
            <div
              onClick={() => setIsCreating(true)}
              className="cursor-pointer transition-transform hover:scale-105"
            >
              <div className="w-32 h-32 border-2 border-white/50 border-dashed rounded-full flex items-center justify-center mb-3 hover:border-white transition-colors">
                <span className="text-4xl text-white">+</span>
              </div>
              <div className="text-white text-sm font-medium">Add Profile</div>
            </div>
          )}
          
          {isCreating && (
            <div className="w-32">
              <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center mb-3 shadow-lg">
                <input
                  type="text"
                  value={newProfileName}
                  onChange={(e) => setNewProfileName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleCreateProfile();
                    } else if (e.key === 'Escape') {
                      setIsCreating(false);
                      setNewProfileName('');
                    }
                  }}
                  placeholder="Name"
                  className="w-24 text-center text-gray-900 font-medium border-none outline-none bg-transparent"
                  autoFocus
                />
              </div>
              <div className="flex gap-2 justify-center">
                <button
                  onClick={handleCreateProfile}
                  className="px-3 py-1 bg-white text-blue-900 rounded text-sm font-medium hover:bg-gray-100 transition-colors"
                >
                  ✓
                </button>
                <button
                  onClick={() => {
                    setIsCreating(false);
                    setNewProfileName('');
                  }}
                  className="px-3 py-1 bg-white/20 text-white rounded text-sm font-medium hover:bg-white/30 transition-colors"
                >
                  ×
                </button>
              </div>
            </div>
          )}
        </div>
        
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="px-6 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors font-medium"
        >
          {isEditing ? 'Done' : 'Edit Profiles'}
        </button>
      </div>
    </div>
  );
}

