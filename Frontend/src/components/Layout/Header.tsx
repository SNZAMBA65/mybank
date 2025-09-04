import React, { useState } from 'react';
import { Menu, Search, User, LogOut, Settings } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { User as UserType } from '../../store/authStore';

/**
 * Props interface for Header component
 */
interface HeaderProps {
  user: UserType | null;
  onMenuClick: () => void;
  onLogout: () => void;
  onSearch?: (searchTerm: string) => void;
}

/**
 * Header Component
 * 
 * Application header with navigation and user management features:
 * - Mobile menu toggle for responsive navigation
 * - Functional global search that navigates to transactions page
 * - User profile display with dropdown menu
 * - Settings navigation to profile page
 * - Logout functionality with confirmation
 * - Responsive design that adapts to different screen sizes
 */
const Header: React.FC<HeaderProps> = ({ user, onMenuClick, onLogout, onSearch }) => {
  // State management
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Navigation hooks
  const navigate = useNavigate();
  const location = useLocation();

  /**
   * Handle search functionality
   * Navigates to transactions page and applies search filter
   */
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (searchTerm.trim()) {
      if (location.pathname !== '/transactions') {
        navigate(`/transactions?search=${encodeURIComponent(searchTerm.trim())}`);
      } else if (onSearch) {
        onSearch(searchTerm.trim());
      }
    }
  };

  /**
   * Handle search input changes
   */
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  /**
   * Handle search input key press
   * Triggers search on Enter key
   */
  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (searchTerm.trim()) {
        if (location.pathname !== '/transactions') {
          navigate(`/transactions?search=${encodeURIComponent(searchTerm.trim())}`);
        } else if (onSearch) {
          onSearch(searchTerm.trim());
        }
      }
    }
  };

  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
  };

  const handleLogout = () => {
    setShowUserMenu(false);
    onLogout();
  };

  const handleSettingsClick = () => {
    setShowUserMenu(false);
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left section: Menu button and search */}
        <div className="flex items-center space-x-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            title="Toggle menu"
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
         
          <form onSubmit={handleSearch} className="hidden sm:flex items-center bg-gray-50 rounded-lg px-4 py-2 w-80">
            <Search className="w-4 h-4 text-gray-400 mr-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              onKeyDown={handleSearchKeyPress}
              placeholder="Search for a transaction..."
              className="bg-transparent border-none outline-none text-sm flex-1 text-gray-700 placeholder-gray-400"
            />
            <button type="submit" className="sr-only">
              Search
            </button>
          </form>
        </div>

        {/* Right section: User menu */}
        <div className="relative">
          <button
            onClick={toggleUserMenu}
            className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            title="User menu"
          >
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-gray-900">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
              <div className="py-2">
                <Link
                  to="/profile"
                  onClick={handleSettingsClick}
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <Settings className="w-4 h-4 mr-3" />
                  Settings
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <LogOut className="w-4 h-4 mr-3" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
