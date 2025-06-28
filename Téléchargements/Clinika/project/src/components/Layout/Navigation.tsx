import React from 'react';
import { Users, Calendar, FileText, BarChart3, Stethoscope, UserPlus, Home } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange }) => {
  const { user } = useAuthStore();

  const getNavItems = () => {
    const baseItems = [
      { id: 'patients', label: 'Patients', icon: Users },
      { id: 'calendar', label: 'Planning', icon: Calendar },
    ];

    // Ajouter le dashboard pour les médecins
    if (user?.role === 'medecin') {
      baseItems.unshift({ id: 'dashboard', label: 'Dashboard', icon: Home });
    }

    if (user?.role === 'medecin' || user?.role === 'admin') {
      baseItems.push(
        { id: 'consultations', label: 'Consultations', icon: Stethoscope },
        { id: 'analytics', label: 'Statistiques', icon: BarChart3 }
      );
    }

    if (user?.role === 'infirmier' || user?.role === 'admin') {
      baseItems.push({ id: 'constantes', label: 'Constantes', icon: FileText });
    }

    if (user?.role === 'admin') {
      baseItems.push({ id: 'users', label: 'Utilisateurs', icon: UserPlus });
    }

    return baseItems;
  };

  const navItems = getNavItems();

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-8 overflow-x-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                  isActive
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};