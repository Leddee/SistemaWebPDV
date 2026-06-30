import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import OrderView from './views/OrderView';
import KitchenView from './views/KitchenView';
import DisplayView from './views/DisplayView';
import DashboardView from './views/DashboardView';
import ProductsView from './views/ProductsView';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <Navigation />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<OrderView />} />
            <Route path="/kitchen" element={<KitchenView />} />
            <Route path="/display" element={<DisplayView />} />
            <Route path="/dashboard" element={<DashboardView />} />
            <Route path="/products" element={<ProductsView />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
