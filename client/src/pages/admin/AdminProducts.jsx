import React, { useState, useEffect } from 'react';
import {
  Edit2,
  Save,
  X,
  Barcode,
  Upload,
  Trash2,
  Plus,
  Image as ImageIcon,
  Link2,
  Star,
  Check,
  Package
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { parseProductImages } from '../../utils/imageUtils';

export default function AdminProducts() {
  const { addToast } = useToast();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState(null);
  const [saving, setSaving] = useState(false);

  // URL inputs state for product edit modal
  const [showBarcodeUrlInput, setShowBarcodeUrlInput] = useState(false);
  const [barcodeUrlInput, setBarcodeUrlInput] = useState('');
  const [showProductUrlInput, setShowProductUrlInput] = useState(false);
  const [productImageUrlInput, setProductImageUrlInput] = useState('');

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

  const extractImagesList = (images) => {
    if (!images) return [];
    if (Array.isArray(images)) {
      return images.filter(img => typeof img === 'string' && img.trim().length > 0);
    }
    if (typeof images === 'string') {
      const trimmed = images.trim();
      if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
        try {
          const parsed = JSON.parse(trimmed);
          if (Array.isArray(parsed)) {
            return parsed.filter(img => typeof img === 'string' && img.trim().length > 0);
          }
        } catch {
          return [trimmed];
        }
      } else if (trimmed) {
        return [trimmed];
      }
    }
    return [];
  };

  const handleEditClick = (product) => {
    const rawImages = extractImagesList(product.images);
    const fallbackImage = product.pack_size?.includes('2') || product.pack_count === 2
      ? '/images/zeba-2pack.webp'
      : '/images/zeba-1pack.webp';

    setEditingProduct({
      ...product,
      barcode: product.barcode || '',
      barcode_image: product.barcode_image || '',
      images: rawImages.length > 0 ? rawImages : [fallbackImage],
      show_original_price: product.show_original_price !== false
    });
    setShowBarcodeUrlInput(false);
    setBarcodeUrlInput('');
    setShowProductUrlInput(false);
    setProductImageUrlInput('');
  };

  // Handle Barcode Image file upload
  const handleBarcodeImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      addToast('Please select a valid image file (PNG, JPG, WebP, SVG).', 'error');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      addToast('Barcode image should be smaller than 5MB.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setEditingProduct(prev => ({
        ...prev,
        barcode_image: event.target.result
      }));
      addToast('Barcode image loaded successfully.', 'success');
    };
    reader.onerror = () => {
      addToast('Failed to read image file.', 'error');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleRemoveBarcodeImage = () => {
    setEditingProduct(prev => ({ ...prev, barcode_image: '' }));
    addToast('Barcode image removed.', 'info');
  };

  const handleApplyBarcodeUrl = () => {
    const trimmed = barcodeUrlInput.trim();
    if (!trimmed) return;
    setEditingProduct(prev => ({ ...prev, barcode_image: trimmed }));
    setBarcodeUrlInput('');
    setShowBarcodeUrlInput(false);
    addToast('Barcode image URL applied.', 'success');
  };

  // Handle Product Images upload (supports multiple files at once)
  const handleProductImagesUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const validFiles = files.filter(f => f.type.startsWith('image/'));
    if (!validFiles.length) {
      addToast('Please select valid image files.', 'error');
      return;
    }

    const oversized = validFiles.find(f => f.size > 8 * 1024 * 1024);
    if (oversized) {
      addToast('Some images exceed 8MB. Please use smaller files.', 'error');
      return;
    }

    const readers = validFiles.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (ev) => resolve(ev.target.result);
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readers).then(dataUrls => {
      const successful = dataUrls.filter(Boolean);
      if (successful.length > 0) {
        setEditingProduct(prev => ({
          ...prev,
          images: [...(prev.images || []), ...successful]
        }));
        addToast(`Added ${successful.length} product image(s).`, 'success');
      }
    });
    e.target.value = '';
  };

  const handleRemoveProductImage = (indexToRemove) => {
    setEditingProduct(prev => {
      const updated = (prev.images || []).filter((_, idx) => idx !== indexToRemove);
      return {
        ...prev,
        images: updated
      };
    });
  };

  const handleSetPrimaryImage = (indexToPrimary) => {
    setEditingProduct(prev => {
      const current = [...(prev.images || [])];
      if (indexToPrimary < 0 || indexToPrimary >= current.length) return prev;
      const [chosen] = current.splice(indexToPrimary, 1);
      return {
        ...prev,
        images: [chosen, ...current]
      };
    });
    addToast('Set as primary cover image.', 'success');
  };

  const handleAddProductImageUrl = () => {
    const trimmed = productImageUrlInput.trim();
    if (!trimmed) return;
    setEditingProduct(prev => ({
      ...prev,
      images: [...(prev.images || []), trimmed]
    }));
    setProductImageUrlInput('');
    setShowProductUrlInput(false);
    addToast('Product image added.', 'success');
  };

  const handleSaveProduct = async () => {
    if (!editingProduct) return;
    setSaving(true);
    try {
      const isOriginalPriceEnabled = editingProduct.show_original_price !== false;
      const res = await api.patch(`/admin/products/${editingProduct.id}`, {
        name: editingProduct.name,
        price: parseFloat(editingProduct.price),
        original_price: editingProduct.original_price !== undefined && editingProduct.original_price !== ''
          ? parseFloat(editingProduct.original_price)
          : parseFloat(editingProduct.price),
        show_original_price: isOriginalPriceEnabled,
        stock_quantity: parseInt(editingProduct.stock_quantity, 10),
        barcode: editingProduct.barcode ? String(editingProduct.barcode).trim() : '',
        barcode_image: editingProduct.barcode_image ? String(editingProduct.barcode_image).trim() : null,
        images: Array.isArray(editingProduct.images) ? editingProduct.images : [],
        badge_text: editingProduct.badge_text,
        short_description: editingProduct.short_description,
        description: editingProduct.description,
        is_active: editingProduct.is_active
      });

      if (res.success) {
        addToast('Product successfully updated.', 'success');
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
          <h1 className="font-display font-black text-2xl sm:text-3xl text-brand-deepPurple">Product Catalog</h1>
          <p className="text-xs text-[#805A82] mt-0.5">Manage the ZEBA product packs, barcodes, and gallery images</p>
        </div>
        <span className="text-xs font-bold text-brand-brightPink bg-brand-softPink border border-brand-primaryPink/30 px-3.5 py-1.5 rounded-full">
          {products.length} Variant{products.length === 1 ? '' : 's'}
        </span>
      </div>

      {loading ? (
        <div className="py-20 text-center text-xs text-[#805A82]">Loading products...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {products.map((product) => {
            const isEditing = editingProduct?.id === product.id;
            const images = parseProductImages(product.images);

            return (
              <div
                key={product.id}
                className="bg-white rounded-3xl p-6 border border-brand-primaryPink/25 shadow-sm flex flex-col justify-between space-y-6"
              >
                <div>
                  {/* Top Bar */}
                  <div className="flex items-center justify-between pb-4 border-b border-brand-primaryPink/15">
                    <span className="text-xs font-bold text-brand-gold bg-[#FDF5D6] px-3 py-1 rounded-full border border-brand-gold/40">
                      {product.pack_size}
                    </span>
                    {!isEditing && (
                      <button
                        onClick={() => handleEditClick(product)}
                        className="inline-flex items-center space-x-1.5 text-xs font-bold text-brand-brightPink hover:text-white px-3 py-1.5 rounded-xl bg-brand-softPink hover:bg-brand-brightPink transition-colors border border-brand-primaryPink/20 btn-tactile cursor-pointer"
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
                        <label className="block text-brand-darkPurple font-bold mb-1">Product Title</label>
                        <input
                          type="text"
                          value={editingProduct.name}
                          onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                          className="w-full bg-[#FFF5FA] border border-brand-primaryPink/30 text-brand-darkPurple rounded-xl p-2.5 outline-none focus:border-brand-brightPink focus:bg-white"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-brand-darkPurple font-bold mb-1">Selling Price (₹)</label>
                          <input
                            type="number"
                            step="1"
                            value={editingProduct.price}
                            onChange={(e) => setEditingProduct({ ...editingProduct, price: e.target.value })}
                            className="w-full bg-[#FFF5FA] border border-brand-primaryPink/30 text-brand-darkPurple rounded-xl p-2.5 outline-none focus:border-brand-brightPink focus:bg-white"
                          />
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="block text-brand-darkPurple font-bold">Original Price (₹)</label>
                            <button
                              type="button"
                              role="switch"
                              aria-checked={editingProduct.show_original_price !== false}
                              onClick={() => setEditingProduct(prev => ({
                                ...prev,
                                show_original_price: prev.show_original_price === false ? true : false
                              }))}
                              className="inline-flex items-center gap-1.5 cursor-pointer focus:outline-none"
                            >
                              <span className={`text-[10px] font-bold ${
                                editingProduct.show_original_price !== false ? 'text-brand-brightPink' : 'text-slate-400'
                              }`}>
                                {editingProduct.show_original_price !== false ? 'Enabled' : 'Disabled'}
                              </span>
                              <span className={`w-7 h-4 flex items-center rounded-full p-0.5 transition-colors duration-200 ${
                                editingProduct.show_original_price !== false ? 'bg-brand-brightPink' : 'bg-slate-300'
                              }`}>
                                <span className={`bg-white w-3 h-3 rounded-full shadow transform transition-transform duration-200 ${
                                  editingProduct.show_original_price !== false ? 'translate-x-3' : 'translate-x-0'
                                }`} />
                              </span>
                            </button>
                          </div>
                          <input
                            type="number"
                            step="1"
                            disabled={editingProduct.show_original_price === false}
                            value={editingProduct.show_original_price === false ? '' : (editingProduct.original_price ?? '')}
                            onChange={(e) => setEditingProduct({ ...editingProduct, original_price: e.target.value })}
                            placeholder={editingProduct.show_original_price === false ? 'Disabled (Hidden on store)' : 'e.g. 399'}
                            className={`w-full border rounded-xl p-2.5 outline-none transition-all ${
                              editingProduct.show_original_price === false
                                ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed select-none placeholder:text-slate-400'
                                : 'bg-[#FFF5FA] border-brand-primaryPink/30 text-brand-darkPurple focus:border-brand-brightPink focus:bg-white'
                            }`}
                          />
                          <p className="text-[10px] text-[#805A82] mt-1">
                            {editingProduct.show_original_price !== false
                              ? 'Strikethrough MRP shown on store'
                              : 'Disabled: Only selling price will show'}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-brand-darkPurple font-bold mb-1">Stock Quantity</label>
                          <input
                            type="number"
                            value={editingProduct.stock_quantity}
                            onChange={(e) => setEditingProduct({ ...editingProduct, stock_quantity: e.target.value })}
                            className="w-full bg-[#FFF5FA] border border-brand-primaryPink/30 text-brand-darkPurple rounded-xl p-2.5 outline-none focus:border-brand-brightPink focus:bg-white"
                          />
                        </div>

                        <div>
                          <label className="block text-brand-darkPurple font-bold mb-1">Badge Text</label>
                          <input
                            type="text"
                            value={editingProduct.badge_text || ''}
                            onChange={(e) => setEditingProduct({ ...editingProduct, badge_text: e.target.value })}
                            placeholder="Best Value"
                            className="w-full bg-[#FFF5FA] border border-brand-primaryPink/30 text-brand-darkPurple rounded-xl p-2.5 outline-none focus:border-brand-brightPink focus:bg-white"
                          />
                        </div>
                      </div>

                      {/* Barcode Text Input */}
                      <div>
                        <label className="block text-brand-darkPurple font-bold mb-1 flex items-center justify-between">
                          <span className="flex items-center space-x-1.5">
                            <Barcode className="w-3.5 h-3.5 text-brand-brightPink" />
                            <span>Barcode / EAN / SKU</span>
                          </span>
                          <span className="text-[10px] text-[#805A82] font-normal">
                            Product barcode for courier & scanning
                          </span>
                        </label>
                        <input
                          type="text"
                          value={editingProduct.barcode || ''}
                          onChange={(e) => setEditingProduct({ ...editingProduct, barcode: e.target.value })}
                          placeholder="e.g. 8939138422458 or ZEBA-01PACK"
                          className="w-full bg-[#FFF5FA] border border-brand-primaryPink/30 text-brand-darkPurple rounded-xl p-2.5 outline-none focus:border-brand-brightPink focus:bg-white font-mono text-xs"
                        />
                      </div>

                      {/* BARCODE IMAGE / GRAPHIC SECTION */}
                      <div className="bg-[#FFF8FB] rounded-2xl p-3 border border-brand-primaryPink/25 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <label className="text-[11px] font-bold text-brand-darkPurple flex items-center space-x-1.5">
                            <Barcode className="w-3.5 h-3.5 text-brand-brightPink" />
                            <span>Barcode Image (Label Graphic)</span>
                          </label>
                          <span className="text-[10px] text-[#805A82]">
                            For courier shipping label & packaging
                          </span>
                        </div>

                        {editingProduct.barcode_image ? (
                          <div className="bg-white rounded-xl p-3 border border-brand-primaryPink/30 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
                            <div className="flex items-center space-x-3 w-full sm:w-auto">
                              <div className="w-28 h-14 bg-white border border-gray-200 rounded-lg p-1.5 flex items-center justify-center shrink-0 shadow-inner">
                                <img
                                  src={editingProduct.barcode_image}
                                  alt="Barcode Graphic"
                                  className="max-h-full max-w-full object-contain"
                                />
                              </div>
                              <div className="space-y-0.5 text-left">
                                <div className="text-[11px] font-bold text-brand-deepPurple flex items-center gap-1">
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>Barcode Image Active</span>
                                </div>
                                <p className="text-[10px] text-[#805A82] line-clamp-1 max-w-[200px]">
                                  {editingProduct.barcode_image.startsWith('data:') ? 'Custom uploaded graphic' : editingProduct.barcode_image}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
                              <label className="cursor-pointer inline-flex items-center space-x-1 text-[11px] font-bold text-brand-darkPurple bg-brand-softPink hover:bg-brand-primaryPink/20 px-2.5 py-1.5 rounded-lg border border-brand-primaryPink/30 transition-colors">
                                <Upload className="w-3 h-3 text-brand-brightPink" />
                                <span>Replace</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={handleBarcodeImageUpload}
                                  className="hidden"
                                />
                              </label>
                              <button
                                type="button"
                                onClick={handleRemoveBarcodeImage}
                                className="inline-flex items-center space-x-1 text-[11px] font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 px-2.5 py-1.5 rounded-lg border border-rose-200 transition-colors cursor-pointer"
                                title="Remove Barcode Image"
                              >
                                <Trash2 className="w-3 h-3" />
                                <span>Remove</span>
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <div className="border-2 border-dashed border-brand-primaryPink/30 rounded-xl p-3 bg-white/70 hover:bg-white transition-colors flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
                              <div className="flex items-center space-x-3">
                                <div className="w-9 h-9 rounded-xl bg-brand-softPink border border-brand-primaryPink/25 flex items-center justify-center text-brand-brightPink shrink-0">
                                  <Barcode className="w-4 h-4" />
                                </div>
                                <div>
                                  <p className="text-[11px] font-bold text-brand-darkPurple">Add Barcode Image</p>
                                  <p className="text-[10px] text-[#805A82]">Upload PNG, JPG, WebP, SVG barcode graphic</p>
                                </div>
                              </div>

                              <div className="flex items-center space-x-2 shrink-0">
                                <label className="cursor-pointer inline-flex items-center space-x-1.5 text-xs font-bold text-white bg-gradient-to-r from-brand-brightPink to-brand-deepPink hover:opacity-90 px-3 py-1.5 rounded-xl shadow-xs transition-all">
                                  <Upload className="w-3.5 h-3.5" />
                                  <span>Upload Barcode</span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleBarcodeImageUpload}
                                    className="hidden"
                                  />
                                </label>
                                <button
                                  type="button"
                                  onClick={() => setShowBarcodeUrlInput(prev => !prev)}
                                  className="inline-flex items-center space-x-1 text-xs font-bold text-brand-darkPurple bg-brand-softPink hover:bg-brand-primaryPink/20 px-2.5 py-1.5 rounded-xl border border-brand-primaryPink/30 transition-colors cursor-pointer"
                                >
                                  <Link2 className="w-3 h-3 text-brand-brightPink" />
                                  <span>URL</span>
                                </button>
                              </div>
                            </div>

                            {showBarcodeUrlInput && (
                              <div className="flex items-center space-x-2 pt-1 animate-fadeIn">
                                <input
                                  type="text"
                                  value={barcodeUrlInput}
                                  onChange={(e) => setBarcodeUrlInput(e.target.value)}
                                  placeholder="Paste image URL (e.g. /images/barcode-1pack.png or https://...)"
                                  className="flex-1 bg-white border border-brand-primaryPink/30 text-brand-darkPurple rounded-xl px-3 py-1.5 text-xs outline-none focus:border-brand-brightPink"
                                />
                                <button
                                  type="button"
                                  onClick={handleApplyBarcodeUrl}
                                  className="px-3 py-1.5 rounded-xl bg-brand-brightPink text-white font-bold text-xs hover:bg-brand-deepPink transition-colors cursor-pointer"
                                >
                                  Apply
                                </button>
                                <button
                                  type="button"
                                  onClick={() => { setShowBarcodeUrlInput(false); setBarcodeUrlInput(''); }}
                                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 cursor-pointer"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* PRODUCT IMAGES GALLERY MANAGEMENT SECTION */}
                      <div className="bg-[#FFF8FB] rounded-2xl p-3 border border-brand-primaryPink/25 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-1.5">
                            <ImageIcon className="w-3.5 h-3.5 text-brand-brightPink" />
                            <span className="text-[11px] font-bold text-brand-darkPurple">
                              Product Images ({editingProduct.images?.length || 0})
                            </span>
                          </div>
                          <span className="text-[10px] text-[#805A82]">
                            First image is storefront cover
                          </span>
                        </div>

                        {/* Image Thumbnails Grid */}
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                          {(editingProduct.images || []).map((imgUrl, idx) => (
                            <div
                              key={idx}
                              className="relative group rounded-xl overflow-hidden border border-brand-primaryPink/30 bg-white shadow-2xs aspect-square flex items-center justify-center p-1"
                            >
                              <img
                                src={imgUrl}
                                alt={`Product variant ${idx + 1}`}
                                onError={(e) => {
                                  e.currentTarget.onerror = null;
                                  e.currentTarget.src = '/images/zeba-1pack.webp';
                                }}
                                className="w-full h-full object-contain rounded-lg"
                              />

                              {/* Primary Cover Badge */}
                              {idx === 0 ? (
                                <span className="absolute top-1 left-1 bg-brand-brightPink text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow-xs flex items-center space-x-0.5">
                                  <Star className="w-2.5 h-2.5 fill-white" />
                                  <span>Cover</span>
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleSetPrimaryImage(idx)}
                                  className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 bg-brand-darkPurple/80 hover:bg-brand-brightPink text-white text-[9px] font-bold px-1.5 py-0.5 rounded transition-all shadow-xs flex items-center space-x-0.5 cursor-pointer"
                                  title="Set as storefront cover"
                                >
                                  <Star className="w-2.5 h-2.5" />
                                  <span>Set Cover</span>
                                </button>
                              )}

                              {/* Delete Image Button */}
                              <button
                                type="button"
                                onClick={() => handleRemoveProductImage(idx)}
                                className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 bg-white/95 hover:bg-rose-500 hover:text-white text-rose-600 p-1 rounded transition-all shadow-xs cursor-pointer"
                                title="Delete this image"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>

                              {/* Order Badge */}
                              <span className="absolute bottom-1 right-1 bg-black/50 text-white text-[8px] font-mono px-1 rounded">
                                #{idx + 1}
                              </span>
                            </div>
                          ))}

                          {/* Quick Upload Slot inside the grid */}
                          <label className="border-2 border-dashed border-brand-primaryPink/40 rounded-xl hover:border-brand-brightPink hover:bg-white transition-all flex flex-col items-center justify-center p-2 text-center cursor-pointer aspect-square bg-brand-softPink/40 group">
                            <div className="w-7 h-7 rounded-full bg-white shadow-2xs flex items-center justify-center text-brand-brightPink group-hover:scale-110 transition-transform">
                              <Plus className="w-4 h-4" />
                            </div>
                            <span className="text-[10px] font-bold text-brand-darkPurple mt-1">Upload</span>
                            <input
                              type="file"
                              multiple
                              accept="image/*"
                              onChange={handleProductImagesUpload}
                              className="hidden"
                            />
                          </label>
                        </div>

                        {/* Actions Bar for Product Images */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-brand-primaryPink/15">
                          <div className="flex items-center space-x-2">
                            <label className="cursor-pointer inline-flex items-center space-x-1.5 text-[11px] font-bold text-brand-darkPurple bg-brand-softPink hover:bg-brand-primaryPink/20 px-2.5 py-1.5 rounded-xl border border-brand-primaryPink/30 transition-colors">
                              <Upload className="w-3 h-3 text-brand-brightPink" />
                              <span>Upload Files</span>
                              <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleProductImagesUpload}
                                className="hidden"
                              />
                            </label>

                            <button
                              type="button"
                              onClick={() => setShowProductUrlInput(prev => !prev)}
                              className="inline-flex items-center space-x-1.5 text-[11px] font-bold text-brand-darkPurple bg-brand-softPink hover:bg-brand-primaryPink/20 px-2.5 py-1.5 rounded-xl border border-brand-primaryPink/30 transition-colors cursor-pointer"
                            >
                              <Link2 className="w-3 h-3 text-brand-brightPink" />
                              <span>Add URL</span>
                            </button>
                          </div>

                          <span className="text-[10px] text-[#805A82]">
                            Supports multiple image uploads
                          </span>
                        </div>

                        {/* Product Image URL Input Toggle */}
                        {showProductUrlInput && (
                          <div className="flex items-center space-x-2 pt-1 animate-fadeIn">
                            <input
                              type="text"
                              value={productImageUrlInput}
                              onChange={(e) => setProductImageUrlInput(e.target.value)}
                              placeholder="e.g. /images/zeba-1pack.webp or https://example.com/pad.jpg"
                              className="flex-1 bg-white border border-brand-primaryPink/30 text-brand-darkPurple rounded-xl px-3 py-1.5 text-xs outline-none focus:border-brand-brightPink"
                            />
                            <button
                              type="button"
                              onClick={handleAddProductImageUrl}
                              className="px-3 py-1.5 rounded-xl bg-brand-brightPink text-white font-bold text-xs hover:bg-brand-deepPink transition-colors cursor-pointer"
                            >
                              Add
                            </button>
                            <button
                              type="button"
                              onClick={() => { setShowProductUrlInput(false); setProductImageUrlInput(''); }}
                              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 cursor-pointer"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Short Description */}
                      <div>
                        <label className="block text-brand-darkPurple font-bold mb-1">Short Description</label>
                        <textarea
                          rows="2"
                          value={editingProduct.short_description}
                          onChange={(e) => setEditingProduct({ ...editingProduct, short_description: e.target.value })}
                          className="w-full bg-[#FFF5FA] border border-brand-primaryPink/30 text-brand-darkPurple rounded-xl p-2.5 outline-none focus:border-brand-brightPink focus:bg-white"
                        />
                      </div>

                      <div className="flex items-center space-x-2 pt-2">
                        <input
                          type="checkbox"
                          id={`active_${product.id}`}
                          checked={editingProduct.is_active}
                          onChange={(e) => setEditingProduct({ ...editingProduct, is_active: e.target.checked })}
                          className="rounded text-brand-brightPink cursor-pointer"
                        />
                        <label htmlFor={`active_${product.id}`} className="text-brand-darkPurple font-bold cursor-pointer">
                          Product is Active on Storefront
                        </label>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={handleSaveProduct}
                          disabled={saving}
                          className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-brand-brightPink to-brand-deepPink hover:from-brand-deepPink hover:to-brand-brightPink text-white font-bold flex items-center justify-center space-x-1.5 transition-colors disabled:opacity-50 btn-tactile shadow-md cursor-pointer"
                        >
                          <Save className="w-4 h-4" />
                          <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                        </button>

                        <button
                          onClick={() => setEditingProduct(null)}
                          className="py-2.5 px-4 rounded-xl bg-brand-softPink hover:bg-slate-200 text-[#805A82] font-bold flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="pt-4 space-y-4">
                      <div className="flex items-start space-x-4">
                        <div className="space-y-2 shrink-0">
                          <img
                            src={images[0] || '/images/zeba-1pack.webp'}
                            alt={product.name}
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = '/images/zeba-1pack.webp';
                            }}
                            className="w-24 h-24 object-contain rounded-2xl border border-brand-primaryPink/25 bg-[#FFF5FA] p-2"
                          />
                          {images.length > 1 && (
                            <div className="flex items-center space-x-1 justify-center">
                              {images.slice(1, 4).map((extraImg, i) => (
                                <img
                                  key={i}
                                  src={extraImg}
                                  alt="Extra view"
                                  className="w-6 h-6 object-cover rounded-md border border-brand-primaryPink/20"
                                />
                              ))}
                              {images.length > 4 && (
                                <span className="text-[9px] font-bold text-brand-brightPink bg-brand-softPink px-1 rounded">
                                  +{images.length - 4}
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="space-y-1.5 flex-1 min-w-0">
                          <h3 className="font-display font-bold text-lg text-brand-deepPurple truncate">{product.name}</h3>
                          <div className="flex items-baseline space-x-2">
                            <span className="text-2xl font-black text-brand-brightPink">
                              ₹{parseFloat(product.price).toFixed(0)}
                            </span>
                            {product.show_original_price !== false && parseFloat(product.original_price) > parseFloat(product.price) ? (
                              <span className="text-sm text-slate-400 line-through">
                                ₹{parseFloat(product.original_price).toFixed(0)}
                              </span>
                            ) : (
                              <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                                Strikethrough price disabled
                              </span>
                            )}
                          </div>

                          <div className="text-xs text-[#805A82] flex flex-wrap items-center gap-x-3 gap-y-1.5">
                            <div>Available Stock: <span className="font-bold text-brand-deepPurple">{product.stock_quantity} units</span></div>
                            {product.barcode && (
                              <div className="flex items-center space-x-1 font-mono text-[10px] text-brand-deepPurple font-bold bg-brand-softPink px-2 py-0.5 rounded-md border border-brand-primaryPink/25">
                                <Barcode className="w-3 h-3 text-brand-brightPink" />
                                <span>{product.barcode}</span>
                              </div>
                            )}
                            {product.barcode_image && (
                              <div className="flex items-center space-x-1.5 font-bold text-[10px] text-brand-deepPurple bg-white px-2 py-0.5 rounded-md border border-brand-primaryPink/30 shadow-2xs">
                                <img src={product.barcode_image} alt="Barcode Graphic" className="h-3.5 max-w-[40px] object-contain" />
                                <span className="text-[9px] text-emerald-700">Image Attached</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <p className="text-xs text-[#805A82] leading-relaxed">
                        {product.short_description}
                      </p>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-brand-primaryPink/15 text-[11px] text-[#805A82] flex items-center justify-between">
                  <span>Slug: /{product.slug}</span>
                  <span className="text-emerald-700 font-semibold">● Live on Storefront</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
