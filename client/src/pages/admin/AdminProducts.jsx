import React, { useState, useEffect } from 'react';
import { Package, Edit2, Save, X, Check, ShieldCheck, Sparkles, Layers } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function AdminProducts() {
  const { addToast } = useToast();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/products');
      if (res.success && res.products) {
        setProducts(res.products);
      }
    } catch (err) {
      console.error('Failed to load products', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleEditClick = (product) => {
    setEditingProduct({ ...product });
  };

  const handleSaveProduct = async () => {
    if (!editingProduct) return;
    setSaving(true);
    try {
      const res = await api.patch(`/admin/products/${editingProduct.id}`, {
        name: editingProduct.name,
        price: parseFloat(editingProduct.price),
        original_price: parseFloat(editingProduct.original_price),
        stock_quantity: parseInt(editingProduct.stock_quantity, 10),
        badge_text: editingProduct.badge_text,
        short_description: editingProduct.short_description,
        description: editingProduct.description,
        is_active: editingProduct.is_active
      });

      if (res.success) {
        addToast('Product successfully updated in PostgreSQL.', 'success');
        setProducts(prev => prev.map(p => p.id === editingProduct.id ? res.product : p));
        setEditingProduct(null);
      }
    } catch (err) {
      addToast(err.message || 'Failed to update product.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-black text-2xl text-white">Product Catalog</h1>
          <p className="text-xs text-slate-400 mt-0.5">Manage the two ZEBA product packs, adjust live pricing and stock inventory</p>
        </div>
        <span className="text-xs font-bold text-brand-pink bg-brand-pink/10 border border-brand-pink/30 px-3.5 py-1.5 rounded-full">
          2 Active Variants in PostgreSQL
        </span>
      </div>

      {loading ? (
        <div className="py-20 text-center text-xs text-slate-400">Loading products...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {products.map((product) => {
            const isEditing = editingProduct?.id === product.id;
            const images = Array.isArray(product.images)
              ? product.images
              : (typeof product.images === 'string' ? JSON.parse(product.images || '[]') : ['/images/zeba-1pack.jpg']);

            return (
              <div
                key={product.id}
                className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-xl flex flex-col justify-between space-y-6"
              >
                <div>
                  {/* Top Bar */}
                  <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                    <span className="text-xs font-bold text-brand-gold bg-brand-gold/10 px-3 py-1 rounded-full border border-brand-gold/30">
                      {product.pack_size}
                    </span>
                    {!isEditing && (
                      <button
                        onClick={() => handleEditClick(product)}
                        className="inline-flex items-center space-x-1.5 text-xs font-bold text-brand-pink hover:text-white px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-brand-pink transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Edit Product</span>
                      </button>
                    )}
                  </div>

                  {/* Product Details or Form */}
                  {isEditing ? (
                    <div className="space-y-4 pt-4 text-xs">
                      <div>
                        <label className="block text-slate-400 font-bold mb-1">Product Title</label>
                        <input
                          type="text"
                          value={editingProduct.name}
                          onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                          className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl p-2.5 outline-none focus:border-brand-pink"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-slate-400 font-bold mb-1">Selling Price (₹)</label>
                          <input
                            type="number"
                            step="1"
                            value={editingProduct.price}
                            onChange={(e) => setEditingProduct({ ...editingProduct, price: e.target.value })}
                            className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl p-2.5 outline-none focus:border-brand-pink"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-400 font-bold mb-1">Original Price (₹)</label>
                          <input
                            type="number"
                            step="1"
                            value={editingProduct.original_price}
                            onChange={(e) => setEditingProduct({ ...editingProduct, original_price: e.target.value })}
                            className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl p-2.5 outline-none focus:border-brand-pink"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-slate-400 font-bold mb-1">Stock Quantity</label>
                          <input
                            type="number"
                            value={editingProduct.stock_quantity}
                            onChange={(e) => setEditingProduct({ ...editingProduct, stock_quantity: e.target.value })}
                            className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl p-2.5 outline-none focus:border-brand-pink"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-400 font-bold mb-1">Badge Text</label>
                          <input
                            type="text"
                            value={editingProduct.badge_text || ''}
                            onChange={(e) => setEditingProduct({ ...editingProduct, badge_text: e.target.value })}
                            placeholder="Best Value"
                            className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl p-2.5 outline-none focus:border-brand-pink"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-slate-400 font-bold mb-1">Short Description</label>
                        <textarea
                          rows="2"
                          value={editingProduct.short_description}
                          onChange={(e) => setEditingProduct({ ...editingProduct, short_description: e.target.value })}
                          className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl p-2.5 outline-none focus:border-brand-pink"
                        />
                      </div>

                      <div className="flex items-center space-x-2 pt-2">
                        <input
                          type="checkbox"
                          id={`active_${product.id}`}
                          checked={editingProduct.is_active}
                          onChange={(e) => setEditingProduct({ ...editingProduct, is_active: e.target.checked })}
                          className="rounded text-brand-pink"
                        />
                        <label htmlFor={`active_${product.id}`} className="text-slate-300 font-bold">
                          Product is Active on Storefront
                        </label>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={handleSaveProduct}
                          disabled={saving}
                          className="flex-1 py-2.5 px-3 rounded-xl bg-brand-pink hover:bg-brand-deepPink text-white font-bold flex items-center justify-center space-x-1.5 transition-colors disabled:opacity-50"
                        >
                          <Save className="w-4 h-4" />
                          <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                        </button>

                        <button
                          onClick={() => setEditingProduct(null)}
                          className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold flex items-center justify-center transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="pt-4 space-y-4">
                      <div className="flex items-center space-x-4">
                        <img
                          src={images[0] || '/images/zeba-1pack.jpg'}
                          alt={product.name}
                          className="w-24 h-24 object-cover rounded-2xl border border-slate-800 bg-slate-950 p-2"
                        />
                        <div className="space-y-1">
                          <h3 className="font-display font-bold text-lg text-white">{product.name}</h3>
                          <div className="flex items-baseline space-x-2">
                            <span className="text-2xl font-black text-brand-pink">
                              ₹{parseFloat(product.price).toFixed(0)}
                            </span>
                            <span className="text-sm text-slate-500 line-through">
                              ₹{parseFloat(product.original_price).toFixed(0)}
                            </span>
                          </div>
                          <div className="text-xs text-slate-400">
                            Available Stock: <span className="font-bold text-white">{product.stock_quantity} units</span>
                          </div>
                        </div>
                      </div>

                      <p className="text-xs text-slate-400 leading-relaxed">
                        {product.short_description}
                      </p>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
                  <span>Slug: /{product.slug}</span>
                  <span className="text-emerald-400 font-semibold">● Synced with PostgreSQL</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
