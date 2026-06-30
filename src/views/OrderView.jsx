import React, { useState, useEffect } from 'react';
import { subscribeToCollection, addDocument } from '../config/firebase';
import { ShoppingCart, Plus, Minus, X } from 'lucide-react';
import '../components/ui/ui.css';

export default function OrderView() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [observations, setObservations] = useState('');

  useEffect(() => {
    const unsubscribe = subscribeToCollection('products', (snapshot) => {
      const prods = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProducts(prods);
    });
    return () => unsubscribe();
  }, []);

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId, delta) => {
    setCart(prev => prev.map(item => {
      if (item.product.id === productId) {
        const newQ = item.quantity + delta;
        return newQ > 0 ? { ...item, quantity: newQ } : item;
      }
      return item;
    }));
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const calculateTotal = () => {
    return cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
  };

  const generateOrderNumber = () => {
    const num = Math.floor(Math.random() * 900) + 100;
    return `#${num}`;
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    
    const orderData = {
      orderNumber: generateOrderNumber(),
      customerName: customerName || 'Cliente sem nome',
      items: cart,
      total: calculateTotal(),
      status: 'pending', // pending, preparing, ready, delivered
      observations: observations
    };

    await addDocument('orders', orderData);
    
    // Reset cart
    setCart([]);
    setCustomerName('');
    setObservations('');
  };

  // Group products by category
  const categories = [...new Set(products.map(p => p.category))];

  return (
    <div className="flex-responsive gap-6 h-full">
      
      {/* Products Catalog */}
      <div style={{flex: 2, overflowY: 'auto', paddingRight: '1rem'}} className="flex-col gap-6">
        <h1>Frente de Caixa</h1>
        
        {categories.map(category => (
          <div key={category} className="flex-col gap-4">
            <h2 style={{borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem'}}>{category}</h2>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem'}}>
              
              {products.filter(p => p.category === category).map(prod => (
                <div 
                  key={prod.id} 
                  className="card" 
                  style={{cursor: 'pointer', transition: 'transform 0.1s', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%'}}
                  onClick={() => addToCart(prod)}
                >
                  <div>
                    <h3 style={{fontSize: '1.1rem'}}>{prod.name}</h3>
                    <p style={{marginTop: '0.5rem', fontWeight: 'bold', color: 'var(--text-primary)'}}>
                      R$ {Number(prod.price).toFixed(2)}
                    </p>
                  </div>
                  <button className="btn btn-secondary" style={{marginTop: '1rem', width: '100%'}}>Adicionar</button>
                </div>
              ))}
              
            </div>
          </div>
        ))}
        {products.length === 0 && <p>Nenhum produto cadastrado.</p>}
      </div>

      {/* Cart Sidebar */}
      <div style={{flex: 1, minWidth: '320px', backgroundColor: 'var(--surface-color)', padding: '1.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column'}}>
        <div className="flex items-center gap-2" style={{marginBottom: '1.5rem'}}>
          <ShoppingCart size={24} />
          <h2 style={{marginBottom: 0}}>Pedido Atual</h2>
        </div>

        <div className="flex-col gap-4" style={{flex: 1, overflowY: 'auto', marginBottom: '1rem'}}>
          {cart.length === 0 ? (
            <p style={{textAlign: 'center', marginTop: '2rem'}}>Carrinho vazio</p>
          ) : (
            cart.map(item => (
              <div key={item.product.id} className="flex justify-between items-center" style={{paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)'}}>
                <div>
                  <h4 style={{fontSize: '0.9rem', marginBottom: '0.25rem'}}>{item.product.name}</h4>
                  <p style={{fontSize: '0.8rem'}}>R$ {Number(item.product.price).toFixed(2)} un.</p>
                </div>
                
                <div className="flex items-center gap-2">
                  <button className="btn btn-secondary" style={{padding: '0.25rem'}} onClick={() => updateQuantity(item.product.id, -1)}>
                    <Minus size={16} />
                  </button>
                  <span style={{width: '20px', textAlign: 'center'}}>{item.quantity}</span>
                  <button className="btn btn-secondary" style={{padding: '0.25rem'}} onClick={() => updateQuantity(item.product.id, 1)}>
                    <Plus size={16} />
                  </button>
                  <button className="btn btn-danger" style={{padding: '0.25rem', marginLeft: '0.5rem'}} onClick={() => removeFromCart(item.product.id)}>
                    <X size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="flex-col gap-4" style={{borderTop: '2px solid var(--border-color)', paddingTop: '1.5rem'}}>
          <input 
            type="text" 
            className="input-field" 
            placeholder="Nome do Cliente (opcional)" 
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
          />
          <textarea 
            className="input-field" 
            placeholder="Observações (ex: sem cebola)" 
            rows="2"
            value={observations}
            onChange={(e) => setObservations(e.target.value)}
          ></textarea>
          
          <div className="flex justify-between items-center" style={{marginTop: '1rem', marginBottom: '1rem'}}>
            <span style={{fontSize: '1.2rem'}}>Total:</span>
            <span style={{fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--accent-color)'}}>
              R$ {calculateTotal().toFixed(2)}
            </span>
          </div>

          <button 
            className="btn btn-primary" 
            style={{width: '100%', padding: '1rem', fontSize: '1.1rem'}}
            onClick={handleCheckout}
            disabled={cart.length === 0}
          >
            Finalizar Pedido
          </button>
        </div>
      </div>

    </div>
  );
}
