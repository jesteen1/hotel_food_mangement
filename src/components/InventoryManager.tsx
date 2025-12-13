
'use client';

import { useState } from 'react';
import { updateProductStock, createProduct, deleteProduct, updateProduct, uploadImage } from '@/app/actions';
import { Plus, Trash2, Save, Edit2, X, Upload, Link as LinkIcon } from 'lucide-react';

interface Product {
    _id: string;
    name: string;
    category: string;
    price: number;
    stock: number;
}

export default function InventoryManager({ products: initialProducts }: { products: Product[] }) {
    const [products, setProducts] = useState<Product[]>(initialProducts);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<Partial<Product>>({});
    const [isAdding, setIsAdding] = useState(false);
    const [newProduct, setNewProduct] = useState({ name: '', price: 0, category: '', stock: 0, description: '', image: '' });

    // Image Upload State
    const [uploadMode, setUploadMode] = useState<'url' | 'file'>('url');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const handleStockUpdate = async (id: string, newStock: number) => {
        await updateProductStock(id, newStock);
    };

    const [productToDelete, setProductToDelete] = useState<string | null>(null);

    const handleDeleteClick = (id: string) => {
        setProductToDelete(id);
    };

    const confirmDelete = async () => {
        if (!productToDelete) return;
        const id = productToDelete;
        setProductToDelete(null); // Close modal immediately

        // Optimistic update
        setProducts(prev => prev.filter(p => p._id !== id));

        console.log("Deleting product:", id);
        try {
            await deleteProduct(id);
            console.log("Deleted successfully");
        } catch (error) {
            console.error("Delete failed:", error);
            alert("Failed to delete product");
            window.location.reload();
        }
    };

    const handleAddProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsUploading(true);

        try {
            let imageUrl = newProduct.image;
            if (uploadMode === 'file' && selectedFile) {
                const formData = new FormData();
                formData.append('file', selectedFile);
                imageUrl = await uploadImage(formData);
            }

            const productData = {
                ...newProduct,
                image: imageUrl,
                stock: Number(newProduct.stock),
                price: Number(newProduct.price)
            };

            const created = await createProduct(productData);
            setProducts([created, ...products]);
            setIsAdding(false);
            setNewProduct({ name: '', price: 0, category: '', stock: 0, description: '', image: '' });
            setSelectedFile(null);
        } catch (error) {
            console.error("Failed to create product:", error);
            alert("Failed to create product");
        } finally {
            setIsUploading(false);
        }
    };

    const startEdit = (product: Product) => {
        setEditingId(product._id);
        setEditForm(product);
    };

    const saveEdit = async () => {
        if (!editingId) return;

        // Optimistic update
        setProducts(prev => prev.map(p => p._id === editingId ? { ...p, ...editForm } as Product : p));

        const id = editingId;
        setEditingId(null);

        try {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { _id, ...updateData } = editForm;
            await updateProduct(id, updateData);
        } catch (error) {
            console.error("Update failed:", error);
            // Revert or alert
        }
    };

    return (
        <div>
            {/* Delete Confirmation Modal */}
            {productToDelete && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full animate-in zoom-in-95 duration-200">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Product?</h3>
                        <p className="text-gray-500 mb-6">Are you sure you want to delete this product? This action cannot be undone.</p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setProductToDelete(null)}
                                className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-lg"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="px-4 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Products</h2>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg font-bold hover:bg-gray-800 transition-colors"
                >
                    <Plus size={18} /> Add Product
                </button>
            </div>

            {/* Rest of JSX... */}
            {isAdding && (
                // ... (new product form)
                <div className="mb-8 bg-white border border-gray-200 rounded-xl p-6 animate-in slide-in-from-top-5">
                    <h3 className="text-lg font-bold mb-4">New Product</h3>
                    <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1"><label className="text-sm font-medium text-gray-700">Product Name</label><input placeholder="e.g. Chicken Burger" className="border p-2 rounded w-full" value={newProduct.name} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} required /></div>
                        <div className="space-y-1"><label className="text-sm font-medium text-gray-700">Category</label><input placeholder="e.g. Main, Sides, Drinks" className="border p-2 rounded w-full" value={newProduct.category} onChange={e => setNewProduct({ ...newProduct, category: e.target.value })} required /></div>
                        <div className="space-y-1"><label className="text-sm font-medium text-gray-700">Price (₹)</label><input type="number" placeholder="0" className="border p-2 rounded w-full" value={newProduct.price} onChange={e => setNewProduct({ ...newProduct, price: Number(e.target.value) })} required /></div>
                        <div className="space-y-1"><label className="text-sm font-medium text-gray-700">Stock Quantity</label><input type="number" placeholder="0" className="border p-2 rounded w-full" value={newProduct.stock} onChange={e => setNewProduct({ ...newProduct, stock: Number(e.target.value) })} required /></div>

                        <div className="md:col-span-2 space-y-2"><label className="text-sm font-medium text-gray-700">Product Image</label>
                            <div className="flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => setUploadMode('url')}
                                    className={`flex items-center gap-2 text-sm font-medium pb-1 border-b-2 ${uploadMode === 'url' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500'}`}
                                >
                                    <LinkIcon size={14} /> Image URL
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setUploadMode('file')}
                                    className={`flex items-center gap-2 text-sm font-medium pb-1 border-b-2 ${uploadMode === 'file' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500'}`}
                                >
                                    <Upload size={14} /> Upload Image
                                </button>
                            </div>

                            {uploadMode === 'url' ? (
                                <input placeholder="Image URL" className="border p-2 rounded w-full" value={newProduct.image} onChange={e => setNewProduct({ ...newProduct, image: e.target.value })} />
                            ) : (
                                <input type="file" accept="image/*" className="border p-2 rounded w-full file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100" onChange={e => setSelectedFile(e.target.files?.[0] || null)} />
                            )}
                        </div>

                        <div className="md:col-span-2 space-y-1"><label className="text-sm font-medium text-gray-700">Description</label><textarea placeholder="Describe the tasty product..." className="border p-2 rounded w-full h-24" value={newProduct.description} onChange={e => setNewProduct({ ...newProduct, description: e.target.value })} /></div>

                        <div className="md:col-span-2 flex justify-end gap-2">
                            <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 text-gray-500 hover:text-gray-700">Cancel</button>
                            <button disabled={isUploading} type="submit" className="px-6 py-2 bg-orange-600 text-white rounded font-bold hover:bg-orange-700 disabled:opacity-50">
                                {isUploading ? 'Saving...' : 'Create'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Price</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Stock</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {products.map((product) => (
                                <tr key={product._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900">
                                        {editingId === product._id ? (
                                            <input className="border rounded px-2 py-1 w-full" value={editForm.name || ''} onChange={e => setEditForm({ ...editForm, name: e.target.value })} />
                                        ) : product.name}
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">
                                        {editingId === product._id ? (
                                            <input className="border rounded px-2 py-1 w-full" value={editForm.category || ''} onChange={e => setEditForm({ ...editForm, category: e.target.value })} />
                                        ) : product.category}
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">
                                        {editingId === product._id ? (
                                            <input type="number" className="border rounded px-2 py-1 w-24" value={editForm.price ?? ''} onChange={e => setEditForm({ ...editForm, price: Number(e.target.value) })} />
                                        ) : `₹${product.price}`}
                                    </td>
                                    <td className="px-6 py-4">
                                        {editingId === product._id ? (
                                            <input type="number" className="border rounded px-2 py-1 w-24" value={editForm.stock ?? ''} onChange={e => setEditForm({ ...editForm, stock: Number(e.target.value) })} />
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <span className={`font-bold ${product.stock < 10 ? 'text-red-500' : 'text-green-600'}`}>{product.stock}</span>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {editingId === product._id ? (
                                                <>
                                                    <button onClick={saveEdit} className="p-2 text-green-600 hover:bg-green-50 rounded"><Save size={18} /></button>
                                                    <button onClick={() => setEditingId(null)} className="p-2 text-gray-400 hover:bg-gray-100 rounded"><X size={18} /></button>
                                                </>
                                            ) : (
                                                <>
                                                    <button onClick={() => startEdit(product)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"><Edit2 size={18} /></button>
                                                    <button onClick={() => handleDeleteClick(product._id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"><Trash2 size={18} /></button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
