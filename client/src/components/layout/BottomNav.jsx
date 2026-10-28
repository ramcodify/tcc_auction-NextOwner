import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Compass, Plus, Activity, User, LogIn } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

export const BottomNav = () => {
  const { user } = useAuth();

  const navItems = [
    { label: 'Home', path: '/', icon: Home, end: true },
    { label: 'Explore', path: '/explore', icon: Compass },
    {
      label: 'Sell',
      path: '/sell',
      icon: Plus,
      isAction: true
    },
    { label: 'Activity', path: '/activity', icon: Activity },
    {
      label: user ? 'Profile' : 'Log In',
      path: user ? '/profile' : '/login',
      icon: user ? User : LogIn
    }
  ];

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-paper/95 backdrop-blur border-t border-border pb-safe"
    >
      <div className="grid grid-cols-5 h-16 max-w-md mx-auto items-center px-2">
        {navItems.map((item) => {
          const Icon = item.icon;

          if (item.isAction) {
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className="flex flex-col items-center justify-center -mt-4 group"
              >
                <div className="w-11 h-11 rounded-full bg-forest text-paper flex items-center justify-center border-2 border-paper shadow-sm group-active:bg-forest-dark transition-colors">
                  <Icon className="w-5 h-5 stroke-[2.2]" />
                </div>
                <span className="text-[10px] font-medium text-forest mt-1">
                  {item.label}
                </span>
              </NavLink>
            );
          }

          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) => `
                flex flex-col items-center justify-center py-1 transition-colors
                ${isActive
                  ? 'text-forest font-semibold'
                  : 'text-olive hover:text-ink active:text-ink'}
              `}
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] leading-tight">
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
