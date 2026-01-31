import { ReactNode } from 'react';

interface SectionCardProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  children: ReactNode;
  color?: 'blue' | 'green' | 'purple' | 'pink' | 'yellow' | 'red';
}

/**
 * SectionCard - A reusable card component for grouping related content
 * 
 * Provides consistent styling and layout for each section of the inputs page.
 */
export function SectionCard({ title, icon, children, color = 'blue' }: SectionCardProps) {
  const colorClasses = {
    blue: 'border-blue-200 bg-gradient-to-br from-blue-50 to-white',
    green: 'border-green-200 bg-gradient-to-br from-green-50 to-white',
    purple: 'border-purple-200 bg-gradient-to-br from-purple-50 to-white',
    pink: 'border-pink-200 bg-gradient-to-br from-pink-50 to-white',
    yellow: 'border-yellow-200 bg-gradient-to-br from-yellow-50 to-white',
    red: 'border-red-200 bg-gradient-to-br from-red-50 to-white',
  };

  return (
    <div className={`bg-white rounded-xl sm:rounded-2xl border-2 ${colorClasses[color]} p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow`}>
      <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
        {icon && (
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-white shadow-sm flex items-center justify-center flex-shrink-0">
            {icon}
          </div>
        )}
        <h2 className="text-lg sm:text-xl font-bold text-gray-900">{title}</h2>
      </div>
      {children}
    </div>
  );
}

