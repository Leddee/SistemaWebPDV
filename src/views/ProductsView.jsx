import React, { useState, useEffect } from 'react';
import { subscribeToCollection, addDocument, deleteDocument } from '../config/firebase';
import { Plus, Trash2 } from 'lucide-react';
import '../components/ui/ui.css';

export default function ProductsView() {
  const [products, setProducts] = useState([]);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');

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

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!name || !category || !price) return;

    await addDocument('products', {
      name,
      category,
      price: parseFloat(price)
    });

    setName('');
    setCategory('');
    setPrice('');
  };

  return (
    <div className="flex-col gap-6 w-full">
      <h1>Gerenciamento de Produtos</h1>
      
      <div className="card">
        <form className="flex gap-4 items-center flex-wrap" onSubmit={handleAddProduct}>
          <input 
            type="text" 
            className="input-field" 
            style={{flex: 2, minWidth: '200px'}} 
            placeholder="Nome do Produto" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
          />
          <input 
            type="text" 
            className="input-field" 
            style={{flex: 1, minWidth: '150px'}} 
            placeholder="Categoria" 
            value={category} 
            onChange={(e) => setCategory(e.target.value)} 
          />
          <input 
            type="number" 
            step="0.01" 
            className="input-field" 
            style={{flex: 1, minWidth: '100px'}} 
            placeholder="Preço (R$)" 
            value={price} 
            onChange={(e) => setPrice(e.target.value)} 
          />
          <button type="submit" className="btn btn-primary" style={{minWidth: '120px'}}>
            <Plus size={20} />
            Adicionar
          </button>
        </form>
      </div>

      <div className="flex-col gap-4">
        {products.map(prod => (
          <div key={prod.id} className="card flex items-center justify-between">
            <div>
              <h3 style={{marginBottom: 0}}>{prod.name}</h3>
              <p style={{fontSize: '0.875rem', marginTop: '0.25rem'}}>{prod.category}</p>
            </div>
            <div className="flex items-center gap-4">
              <span style={{fontSize: '1.25rem', fontWeight: 'bold'}}>
                R$ {Number(prod.price).toFixed(2)}
              </span>
              <button 
                className="btn btn-danger" 
                style={{padding: '0.5rem'}}
                onClick={() => deleteDocument('products', prod.id)}
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
