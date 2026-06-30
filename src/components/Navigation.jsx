import React from 'react';
import { NavLink } from 'react-router-dom';
import { ShoppingBag, ChefHat, Monitor, LayoutDashboard, Settings, Coffee } from 'lucide-react';
import './Navigation.css';

const navItems = [
  { path: '/', label: 'Frente de Caixa', icon: <ShoppingBag size={24} /> },
  { path: '/kitchen', label: 'Cozinha', icon: <ChefHat size={24} /> },
  { path: '/display', label: 'Letreiro', icon: <Monitor size={24} /> },
  { path: '/dashboard', label: 'Financeiro', icon: <LayoutDashboard size={24} /> },
  { path: '/products', label: 'Cardápio', icon: <Coffee size={24} /> },
];

export default function Navigation() {
  return (
    <nav className="sidebar">
      <div className="sidebar-header">
        <h2 className="logo-title">Crepe JCI</h2>
      </div>
      <ul className="nav-links">
        {navItems.map((item) => (
          <li key={item.path}>
            <NavLink 
              to={item.path} 
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            >
              <span className="icon">{item.icon}</span>
              <span className="label">{item.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
      <div className="sidebar-footer">
        <button className="settings-btn">
          <Settings size={20} />
          <span>Ajustes</span>
        </button>
      </div>
    </nav>
  );
}
