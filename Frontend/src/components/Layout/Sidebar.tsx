import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  CreditCard,
  History,
  User,
  X,
  Building2
} from 'lucide-react';

/**
 * Props interface for Sidebar component
 */
interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Sidebar Component
 * 
 * Navigation sidebar with responsive design and mobile overlay:
 * - Primary navigation menu with active state indicators
 * - Mobile-first responsive design with backdrop overlay
 * - Brand logo and application identity
 * - Active route highlighting with visual feedback
 * - Smooth animations and transitions
 * - Footer with application version and copyright
 * - Auto-close functionality on navigation
 */
const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();

  /**
   * Navigation menu configuration
   * Defines all primary navigation routes with their icons and labels
   */
  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Accounts', href: '/accounts', icon: CreditCard },
    { name: 'Transactions', href: '/transactions', icon: History },
    { name: 'Profile', href: '/profile', icon: User },
  ];

  return (
    <>
      {/* Mobile backdrop overlay - only visible when sidebar is open on mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
          aria-label="Close sidebar"
        />
      )}

      {/* Main sidebar container */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        
        {/* Sidebar header with logo and close button */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            {/* Application logo */}
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            {/* Application name */}
            <span className="text-xl font-bold text-gray-900">MyBank</span>
          </div>
         
          {/* Close button - only visible on mobile */}
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Navigation menu */}
        <nav className="mt-6 px-4" role="navigation" aria-label="Main navigation">
          <ul className="space-y-2">
            {navigation.map((item) => {
              // Determine if current route is active
              const isActive = location.pathname === item.href;
              
              return (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    onClick={onClose} // Auto-close sidebar on navigation (mobile)
                    className={`
                      flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200
                      ${isActive
                        ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700' // Active state styling
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900' // Default and hover states
                      }
                    `}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    {/* Navigation icon with conditional coloring */}
                    <item.icon className={`w-5 h-5 mr-3 ${isActive ? 'text-blue-700' : 'text-gray-400'}`} />
                    {/* Navigation label */}
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer with version and copyright information */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-gray-50">
          <div className="text-xs text-gray-500 text-center">
            <p>&copy; 2025 MyBank</p>
            <p>Version 1.0.0</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;