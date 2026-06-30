import React, { useState, useEffect } from 'react';
import { subscribeToCollection, updateDocument } from '../config/firebase';
import { Play, CheckCircle } from 'lucide-react';
import '../components/ui/ui.css';

export default function KitchenView() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    // Sort by createdAt ascending (oldest first)
    // For mock, it might just be the array order, but let's assume our subscribe returns them in order.
    const unsubscribe = subscribeToCollection('orders', (snapshot) => {
      const ords = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setOrders(ords);
    });
    return () => unsubscribe();
  }, []);

  const changeStatus = async (id, newStatus) => {
    await updateDocument('orders', id, { status: newStatus });
  };

  const getElapsedTime = (createdAt) => {
    if (!createdAt) return '0m';
    const now = new Date();
    const created = createdAt.toDate ? createdAt.toDate() : new Date(createdAt);
    const diff = Math.floor((now - created) / 60000); // in minutes
    return `${diff}m`;
  };

  const renderOrderCard = (order, nextStatus, nextLabel, icon) => (
    <div key={order.id} className="card" style={{borderLeft: '4px solid var(--accent-color)'}}>
      <div className="flex justify-between items-center" style={{borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '0.75rem'}}>
        <div className="flex items-center gap-4">
          <h2 style={{margin: 0, color: 'var(--accent-color)'}}>{order.orderNumber}</h2>
          <span style={{fontSize: '0.9rem', color: 'var(--text-secondary)'}}>{order.customerName}</span>
        </div>
        <div style={{fontWeight: 'bold', color: '#f87171'}}>
          ⏳ {getElapsedTime(order.createdAt)}
        </div>
      </div>
      
      <div className="flex-col gap-2" style={{marginBottom: '1rem'}}>
        {order.items.map((item, idx) => (
          <div key={idx} style={{fontSize: '1.1rem'}}>
            <span style={{fontWeight: 'bold', marginRight: '0.5rem'}}>{item.quantity}x</span>
            {item.product.name}
          </div>
        ))}
      </div>

      {order.observations && (
        <div style={{backgroundColor: '#3f3f46', padding: '0.75rem', borderRadius: '4px', marginBottom: '1rem', color: '#fde047'}}>
          <strong>Obs:</strong> {order.observations}
        </div>
      )}

      <button 
        className="btn btn-primary w-full" 
        onClick={() => changeStatus(order.id, nextStatus)}
      >
        {icon}
        {nextLabel}
      </button>
    </div>
  );

  const pendingOrders = orders.filter(o => o.status === 'pending');
  const preparingOrders = orders.filter(o => o.status === 'preparing');

  // Simple auto-refresh for elapsed time every minute
  const [, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setTick(t => t + 1), 60000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex-col gap-6 w-full h-full">
      <h1>Cozinha - Controle de Preparação</h1>
      
      <div className="flex gap-6 h-full">
        
        {/* Recebidos Column */}
        <div className="flex-col" style={{flex: 1, backgroundColor: 'var(--surface-color)', padding: '1.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border-color)'}}>
          <h2 style={{borderBottom: '2px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1.5rem'}}>
            Recebidos ({pendingOrders.length})
          </h2>
          <div className="flex-col gap-4" style={{overflowY: 'auto', flex: 1}}>
            {pendingOrders.length === 0 && <p style={{textAlign: 'center', marginTop: '2rem'}}>Nenhum pedido novo.</p>}
            {pendingOrders.map(order => renderOrderCard(order, 'preparing', 'Iniciar Preparo', <Play size={20} />))}
          </div>
        </div>

        {/* Em Preparo Column */}
        <div className="flex-col" style={{flex: 1, backgroundColor: 'var(--surface-color)', padding: '1.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border-color)'}}>
          <h2 style={{borderBottom: '2px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1.5rem'}}>
            Em Preparo ({preparingOrders.length})
          </h2>
          <div className="flex-col gap-4" style={{overflowY: 'auto', flex: 1}}>
            {preparingOrders.length === 0 && <p style={{textAlign: 'center', marginTop: '2rem'}}>Nenhum pedido em preparo.</p>}
            {preparingOrders.map(order => renderOrderCard(order, 'ready', 'Marcar como Pronto', <CheckCircle size={20} />))}
          </div>
        </div>

      </div>
    </div>
  );
}
