import React from 'react';

interface SectionCardProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  color?: 'blue' | 'green' | 'purple' | 'pink' | 'yellow';
}

/**
 * SectionCard - A reusable card component for grouping related content
 * 
 * Provides consistent styling and layout for each section of the inputs page.
 */
export function SectionCard({ title, description, icon, children, color = 'blue' }: SectionCardProps) {
  const colorClasses = {
    blue: 'border-blue-200 bg-gradient-to-br from-blue-50 to-white',
    green: 'border-green-200 bg-gradient-to-br from-green-50 to-white',
    purple: 'border-purple-200 bg-gradient-to-br from-purple-50 to-white',
    pink: 'border-pink-200 bg-gradient-to-br from-pink-50 to-white',
    yellow: 'border-yellow-200 bg-gradient-to-br from-yellow-50 to-white',
  };

  return (
    <div className={`bg-white rounded-2xl border-2 ${colorClasses[color]} p-6 shadow-sm hover:shadow-md transition-shadow`}>
      <div className="flex items-center gap-3 mb-4">
        {icon && (
          <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center">
            {icon}
          </div>
        )}
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
      </div>
      {children}
    </div>
  );
}

