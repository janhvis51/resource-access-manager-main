
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { Home, LogOut, Database, Search, User, Settings, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const employeeLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: <Home className="mr-2 h-4 w-4" /> },
  { to: '/request-access', label: 'Request Access', icon: <Database className="mr-2 h-4 w-4" /> },
];

const managerLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: <Home className="mr-2 h-4 w-4" /> },
  { to: '/pending-requests', label: 'Access Requests', icon: <Users className="mr-2 h-4 w-4" /> },
];

const adminLinks = [
  { to: '/admin', label: 'Dashboard', icon: <Home className="mr-2 h-4 w-4" /> },
  { to: '/create-software', label: 'Add Software', icon: <Database className="mr-2 h-4 w-4" /> },
  { to: '/users', label: 'User Management', icon: <Users className="mr-2 h-4 w-4" /> },
];

const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  
  if (!user) return null;

  let links: typeof employeeLinks;
  
  // Determine links based on user role
  if (user.role === 'Admin') {
    links = adminLinks;
  } else if (user.role === 'Manager') {
    links = managerLinks;
  } else {
    links = employeeLinks;
  }

  return (
    <div 
      className={cn(
        "bg-sidebar text-sidebar-foreground h-full min-h-screen transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
        {!collapsed && (
          <div className="font-bold text-xl tracking-tight">Access Manager</div>
        )}
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-md hover:bg-sidebar-accent"
        >
          {collapsed ? (
            <Search size={16} />
          ) : (
            <Search size={16} />
          )}
        </button>
      </div>
      
      <div className="py-4">
        <div className="px-4 mb-6">
          {!collapsed ? (
            <div className="flex items-center space-x-3">
              <div className="bg-primary/20 text-primary-foreground h-10 w-10 rounded-full flex items-center justify-center text-lg font-semibold uppercase">
                {user.username.charAt(0)}
              </div>
              <div>
                <div className="font-medium">{user.username}</div>
                <div className="text-sm text-slate-300">{user.role}</div>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="bg-primary/20 text-primary-foreground h-10 w-10 rounded-full flex items-center justify-center text-lg font-semibold uppercase">
                {user.username.charAt(0)}
              </div>
            </div>
          )}
        </div>
        
        <ul className="space-y-2">
          {links.map((link) => {
            const isActive = location.pathname === link.to;
            return (
              <li key={link.to}>
                <Link
                  to={link.to}
                  className={cn(
                    "flex items-center px-4 py-3 hover:bg-sidebar-accent rounded-md transition-colors",
                    isActive && "bg-primary text-primary-foreground hover:bg-primary/90",
                    collapsed && "justify-center"
                  )}
                >
                  {link.icon}
                  {!collapsed && <span>{link.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
      
      <div className="absolute bottom-4 left-0 w-full px-4">
        {!collapsed ? (
          <Button 
            variant="outline" 
            onClick={logout} 
            className="w-full bg-sidebar-accent text-sidebar-accent-foreground border-sidebar-border hover:bg-sidebar-accent/80"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        ) : (
          <Button
            variant="outline"
            onClick={logout}
            className="w-10 h-10 p-0 flex items-center justify-center bg-sidebar-accent text-sidebar-accent-foreground border-sidebar-border hover:bg-sidebar-accent/80 mx-auto"
          >
            <LogOut size={16} />
          </Button>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
