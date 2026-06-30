import React, { useState, useEffect } from 'react';
import { subscribeToCollection, updateDocument } from '../config/firebase';

export default function DisplayView() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    // We only need preparing and ready orders here
    const unsubscribe = subscribeToCollection('orders', (snapshot) => {
      const ords = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setOrders(ords);
    });
    return () => unsubscribe();
  }, []);

  const preparingOrders = orders.filter(o => o.status === 'preparing');
  const readyOrders = orders.filter(o => o.status === 'ready');

  // Allow finishing order from display (for demo purposes) or click to remove
  const markAsDelivered = async (id) => {
    await updateDocument('orders', id, { status: 'delivered' });
  };

  return (
    <div style={{
      backgroundColor: '#000000', 
      minHeight: '100vh', 
      color: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: "'Inter', 'Roboto', sans-serif"
    }}>
      
      {/* Header */}
      <div style={{
        display: 'flex', 
        justifyContent: 'center', 
        padding: '1.5rem', 
        borderBottom: '2px solid #333',
        backgroundColor: '#111'
      }}>
        <h1 style={{fontSize: '2.5rem', margin: 0, letterSpacing: '2px'}}>CHAMADA DE PEDIDOS</h1>
      </div>

      {/* Columns */}
      <div style={{display: 'flex', flex: 1}}>
        
        {/* Preparing */}
        <div style={{flex: 1, borderRight: '2px solid #333', display: 'flex', flexDirection: 'column'}}>
          <div style={{backgroundColor: '#1f2937', padding: '1.5rem', textAlign: 'center'}}>
            <h2 style={{fontSize: '2.5rem', margin: 0, color: '#facc15'}}>PREPARANDO</h2>
          </div>
          <div style={{padding: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '2rem', alignContent: 'start'}}>
            {preparingOrders.map(order => (
              <div key={order.id} style={{textAlign: 'center', animation: 'pulse 2s infinite'}}>
                <span style={{fontSize: '4rem', fontWeight: 'bold', color: '#facc15'}}>{order.orderNumber}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Ready */}
        <div style={{flex: 1, display: 'flex', flexDirection: 'column'}}>
          <div style={{backgroundColor: '#14532d', padding: '1.5rem', textAlign: 'center'}}>
            <h2 style={{fontSize: '2.5rem', margin: 0, color: '#4ade80'}}>PRONTO / RETIRAR</h2>
          </div>
          <div style={{padding: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '2rem', alignContent: 'start'}}>
            {readyOrders.map(order => (
              <div 
                key={order.id} 
                style={{
                  textAlign: 'center', 
                  backgroundColor: '#166534', 
                  padding: '1rem', 
                  borderRadius: '16px',
                  border: '4px solid #4ade80',
                  cursor: 'pointer'
                }}
                onClick={() => markAsDelivered(order.id)}
                title="Clique para marcar como entregue"
              >
                <span style={{fontSize: '5rem', fontWeight: 'bold', color: '#ffffff'}}>{order.orderNumber}</span>
                <div style={{fontSize: '1.5rem', color: '#bbf7d0', marginTop: '0.5rem'}}>{order.customerName}</div>
              </div>
            ))}
          </div>
        </div>

      </div>

      <style>{`
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.6; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
