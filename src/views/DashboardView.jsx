import React, { useState, useEffect } from 'react';
import { subscribeToCollection, deleteDocument } from '../config/firebase';
import { DollarSign, ShoppingBag, TrendingUp, Trash2 } from 'lucide-react';
import '../components/ui/ui.css';

export default function DashboardView() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const unsubscribe = subscribeToCollection('orders', (snapshot) => {
      const ords = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      // In a real app we'd query by status, but with mock it's easier to fetch all and filter locally
      setOrders(ords.filter(o => o.status === 'delivered'));
    });
    return () => unsubscribe();
  }, []);

  const totalRevenue = orders.reduce((acc, order) => acc + order.total, 0);
  const totalOrders = orders.length;
  const avgTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  const clearHistory = async () => {
    if (window.confirm("Tem certeza que deseja apagar todo o histórico de pedidos finalizados?")) {
      for (const order of orders) {
        await deleteDocument('orders', order.id);
      }
    }
  };

  const formatDate = (date) => {
    if (!date) return '';
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleString('pt-BR');
  };

  return (
    <div className="flex-col gap-6 w-full">
      <div className="flex justify-between items-center">
        <h1>Painel Financeiro</h1>
        <button className="btn btn-danger" onClick={clearHistory} disabled={orders.length === 0}>
          <Trash2 size={20} />
          Limpar Histórico
        </button>
      </div>
      
      {/* KPIs */}
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem'}}>
        
        <div className="card flex items-center gap-4">
          <div style={{backgroundColor: 'rgba(59, 130, 246, 0.2)', padding: '1rem', borderRadius: '50%', color: 'var(--accent-color)'}}>
            <DollarSign size={32} />
          </div>
          <div>
            <p style={{margin: 0}}>Faturamento Total</p>
            <h2 style={{margin: 0, fontSize: '2rem'}}>R$ {totalRevenue.toFixed(2)}</h2>
          </div>
        </div>

        <div className="card flex items-center gap-4">
          <div style={{backgroundColor: 'rgba(16, 185, 129, 0.2)', padding: '1rem', borderRadius: '50%', color: 'var(--status-ready)'}}>
            <ShoppingBag size={32} />
          </div>
          <div>
            <p style={{margin: 0}}>Pedidos Entregues</p>
            <h2 style={{margin: 0, fontSize: '2rem'}}>{totalOrders}</h2>
          </div>
        </div>

        <div className="card flex items-center gap-4">
          <div style={{backgroundColor: 'rgba(245, 158, 11, 0.2)', padding: '1rem', borderRadius: '50%', color: 'var(--status-preparing)'}}>
            <TrendingUp size={32} />
          </div>
          <div>
            <p style={{margin: 0}}>Ticket Médio</p>
            <h2 style={{margin: 0, fontSize: '2rem'}}>R$ {avgTicket.toFixed(2)}</h2>
          </div>
        </div>

      </div>

      {/* History List */}
      <div className="card mt-6">
        <h2 style={{borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1rem'}}>Histórico de Pedidos</h2>
        
        <div style={{overflowX: 'auto'}}>
          <table style={{width: '100%', borderCollapse: 'collapse', textAlign: 'left'}}>
            <thead>
              <tr style={{borderBottom: '1px solid var(--border-color)'}}>
                <th style={{padding: '1rem'}}>Data/Hora</th>
                <th style={{padding: '1rem'}}>Pedido</th>
                <th style={{padding: '1rem'}}>Cliente</th>
                <th style={{padding: '1rem'}}>Itens</th>
                <th style={{padding: '1rem'}}>Total</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{padding: '2rem', textAlign: 'center'}}>Nenhum pedido finalizado ainda.</td>
                </tr>
              ) : (
                orders.map(order => (
                  <tr key={order.id} style={{borderBottom: '1px solid var(--border-color)'}}>
                    <td style={{padding: '1rem'}}>{formatDate(order.createdAt)}</td>
                    <td style={{padding: '1rem', fontWeight: 'bold'}}>{order.orderNumber}</td>
                    <td style={{padding: '1rem'}}>{order.customerName}</td>
                    <td style={{padding: '1rem'}}>{order.items.map(i => `${i.quantity}x ${i.product.name}`).join(', ')}</td>
                    <td style={{padding: '1rem', fontWeight: 'bold', color: 'var(--accent-color)'}}>R$ {order.total.toFixed(2)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
