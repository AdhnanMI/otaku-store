import { useEffect, useState } from 'react';
import { LayoutDashboard, Package, ShoppingBag, LayoutGrid } from 'lucide-react';
import Layout from '../components/Layout';
import { apiFetch } from '../api/api';
import { useStore } from '../context/StoreContext';
import './AdminPage.css';

export default function AdminPage() {
    const { categories } = useStore();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [stats, setStats] = useState(null);
    const [statsLoading, setStatsLoading] = useState(true);
    const [statsError, setStatsError] = useState(null);
    const [orders, setOrders] = useState([]);
    const [ordersLoading, setOrdersLoading] = useState(false);
    const [ordersError, setOrdersError] = useState(null);
    const [selectedOrderId, setSelectedOrderId] = useState(null);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [orderDetailsLoading, setOrderDetailsLoading] = useState(false);
    const [orderDetailsError, setOrderDetailsError] = useState(null);
    const [editingShipping, setEditingShipping] = useState(false);
    const [products, setProducts] = useState([]);
    const [productsLoading, setProductsLoading] = useState(false);
    const [productsError, setProductsError] = useState(null);
    const [editingProduct, setEditingProduct] = useState(null);
    const [addingProduct, setAddingProduct] = useState(false);
    const [adminCategories, setAdminCategories] = useState([]);
    const [categoriesLoading, setCategoriesLoading] = useState(false);
    const [categoriesError, setCategoriesError] = useState(null);
    const [addingCategory, setAddingCategory] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [categoryForm, setCategoryForm] = useState({
        label: '',
        icon: '',
        hue: '',
        tagline: '',
        image: '',
    });
    const [newCategoryForm, setNewCategoryForm] = useState({
        id: '',
        label: '',
        icon: 'Package',
        hue: '',
        tagline: '',
        image: '',
    });
    const [productForm, setProductForm] = useState({
        name: '',
        category: '',
        price: '',
        stock: '',
    });
    const [newProductForm, setNewProductForm] = useState({
        id: '',
        name: '',
        category: '',
        sub: '',
        price: '',
        stock: '',
        rating: '5',
        reviews: '0',
        image: '',
        icon: 'Package',
        hue: '',
    });

    const updateCategory = async () => {
        if (!editingCategory) return;

        if (!categoryForm.label.trim()) {
            alert('Category label is required.');
            return;
        }

        try {
            const data = await apiFetch(
                `/categories/${editingCategory.id}`,
                {
                    method: 'PUT',
                    body: JSON.stringify({
                        label: categoryForm.label.trim(),
                        icon: categoryForm.icon.trim(),
                        hue: categoryForm.hue.trim(),
                        tagline: categoryForm.tagline.trim() || null,
                        image: categoryForm.image.trim() || null,
                    }),
                }
            );

            setAdminCategories((current) =>
                current.map((category) =>
                    category.id === data.category.id
                        ? data.category
                        : category
                )
            );

            setEditingCategory(null);
        } catch (error) {
            console.error('Failed to update category:', error);
            alert(error.message || 'Failed to update category.');
        }
    };
    const createCategory = async () => {
        if (
            !newCategoryForm.id.trim() ||
            !newCategoryForm.label.trim()
        ) {
            alert('Category ID and label are required.');
            return;
        }

        try {
            const data = await apiFetch('/categories', {
                method: 'POST',
                body: JSON.stringify({
                    id: newCategoryForm.id.trim(),
                    label: newCategoryForm.label.trim(),
                    icon: newCategoryForm.icon.trim(),
                    hue: newCategoryForm.hue.trim(),
                    tagline: newCategoryForm.tagline.trim() || null,
                    image: newCategoryForm.image.trim() || null,
                }),
            });

            setAdminCategories((current) => [
                ...current,
                data.category,
            ]);

            setAddingCategory(false);

            setNewCategoryForm({
                id: '',
                label: '',
                icon: 'Package',
                hue: '',
                tagline: '',
                image: '',
            });
        } catch (error) {
            console.error('Failed to create category:', error);
            alert(error.message || 'Failed to create category.');
        }
    };
    const loadProducts = async () => {
        setProductsLoading(true);
        setProductsError(null);

        try {
            const data = await apiFetch('/products');
            setProducts(data.products || []);
        } catch (error) {
            console.error('Failed to load products:', error);
            setProductsError(error);
        } finally {
            setProductsLoading(false);
        }
    };
    const loadCategories = async () => {
        setCategoriesLoading(true);
        setCategoriesError(null);

        try {
            const data = await apiFetch('/categories');
            setAdminCategories(data.categories || []);
        } catch (error) {
            console.error('Failed to load categories:', error);
            setCategoriesError(error);
        } finally {
            setCategoriesLoading(false);
        }
    };
    const updateProduct = async () => {
        if (!editingProduct) return;

        try {
            const data = await apiFetch(`/products/${editingProduct.id}`, {
                method: 'PUT',
                body: JSON.stringify({
                    name: productForm.name.trim(),
                    category: productForm.category,
                    price: Number(productForm.price),
                    stock: Number(productForm.stock),
                }),
            });

            setProducts((currentProducts) =>
                currentProducts.map((product) =>
                    product.id === data.product.id ? data.product : product
                )
            );

            setEditingProduct(null);
        } catch (error) {
            console.error('Failed to update product:', error);
            alert(error.message || 'Failed to update product.');
        }
    };
    const createProduct = async () => {
        if (
            !newProductForm.id.trim() ||
            !newProductForm.name.trim() ||
            !newProductForm.category ||
            !newProductForm.price ||
            !newProductForm.stock ||
            !newProductForm.image.trim()
        ) {
            alert('Please fill in all required product fields.');
            return;
        }

        try {
            const data = await apiFetch('/products', {
                method: 'POST',
                body: JSON.stringify({
                    id: newProductForm.id.trim(),
                    name: newProductForm.name.trim(),
                    category: newProductForm.category,
                    sub: newProductForm.sub.trim() || null,
                    price: Number(newProductForm.price),
                    stock: Number(newProductForm.stock),
                    rating: Number(newProductForm.rating),
                    reviews: Number(newProductForm.reviews),
                    image: newProductForm.image.trim(),
                    icon: newProductForm.icon.trim(),
                    hue: newProductForm.hue.trim(),
                }),
            });

            setProducts((current) => [...current, data.product]);

            setAddingProduct(false);

            setNewProductForm({
                id: '',
                name: '',
                category: '',
                sub: '',
                price: '',
                stock: '',
                rating: '5',
                reviews: '0',
                image: '',
                icon: 'Package',
                hue: '',
            });
        } catch (error) {
            console.error(error);
            alert(error.message || 'Failed to create product.');
        }
    };
    const [shippingForm, setShippingForm] = useState({
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        pincode: '',
    });
    const updateShipping = async () => {
        if (!selectedOrder) return;

        try {
            const data = await apiFetch(`/admin/orders/${selectedOrder.id}`, {
                method: 'PATCH',
                body: JSON.stringify(shippingForm),
            });

            setSelectedOrder(data.order);

            setOrders((currentOrders) =>
                currentOrders.map((order) =>
                    order.id === data.order.id ? data.order : order
                )
            );

            setEditingShipping(false);
        } catch (error) {
            console.error('Failed to update shipping details:', error);
            alert(error.message || 'Failed to update shipping details.');
        }
    };
    const loadOrderDetails = async (orderId) => {
        setOrderDetailsLoading(true);
        setOrderDetailsError(null);

        try {
            const data = await apiFetch(`/admin/orders/${orderId}`);
            setSelectedOrder(data.order);
        } catch (error) {
            console.error('Failed to load order details:', error);
            setOrderDetailsError(error);
        } finally {
            setOrderDetailsLoading(false);
        }
    };
    const updateOrderStatus = async (status) => {
        if (!selectedOrder) return;

        try {
            const data = await apiFetch(`/admin/orders/${selectedOrder.id}`, {
                method: 'PATCH',
                body: JSON.stringify({ status }),
            });

            setSelectedOrder(data.order);

            setOrders((currentOrders) =>
                currentOrders.map((order) =>
                    order.id === data.order.id ? data.order : order
                )
            );
        } catch (error) {
            console.error('Failed to update order status:', error);
            alert(error.message || 'Failed to update order status.');
        }
    };
    const loadStats = async () => {
        setStatsLoading(true);
        setStatsError(null);

        try {
            const data = await apiFetch('/admin/stats');
            setStats(data.stats);
        } catch (error) {
            console.error('Failed to load admin stats:', error);
            setStatsError(error);
        } finally {
            setStatsLoading(false);
        }
    };

    const loadOrders = async () => {
        setOrdersLoading(true);
        setOrdersError(null);

        try {
            const data = await apiFetch('/admin/orders');
            setOrders(data.orders || []);
        } catch (error) {
            console.error('Failed to load admin orders:', error);
            setOrdersError(error);
        } finally {
            setOrdersLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'dashboard') {
            loadStats();
        }
    }, [activeTab]);

    useEffect(() => {
        if (activeTab === 'orders') {
            loadOrders();
        }

        if (activeTab === 'products') {
            loadProducts();
        }
        if (activeTab === 'categories') {
            loadCategories();
        }

        if (activeTab !== 'orders') {
            setSelectedOrderId(null);
            setSelectedOrder(null);
            setOrderDetailsError(null);
            setEditingShipping(false);
        }
    }, [activeTab]);

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    const productPanelOpen = addingProduct || Boolean(editingProduct);
    const categoryPanelOpen = addingCategory || Boolean(editingCategory);

    return (
        <Layout>
            <div className="page-container admin-page">
                <div className="admin-header">
                    <div>
                        <p className="admin-eyebrow">Otaku Store</p>
                        <h1 className="admin-title">Admin Control</h1>
                        <p className="admin-subtitle">Manage your Otaku Store.</p>
                    </div>
                </div>

                <nav className="admin-tabs">
                    <button
                        type="button"
                        className={`admin-tab ${activeTab === 'dashboard' ? 'active' : ''}`}
                        onClick={() => setActiveTab('dashboard')}
                    >
                        <LayoutDashboard size={16} />
                        Dashboard
                    </button>

                    <button
                        type="button"
                        className={`admin-tab ${activeTab === 'orders' ? 'active' : ''}`}
                        onClick={() => setActiveTab('orders')}
                    >
                        <Package size={16} />
                        Orders
                    </button>

                    <button
                        type="button"
                        className={`admin-tab ${activeTab === 'products' ? 'active' : ''}`}
                        onClick={() => setActiveTab('products')}
                    >
                        <ShoppingBag size={16} />
                        Products
                    </button>

                    <button
                        type="button"
                        className={`admin-tab ${activeTab === 'categories' ? 'active' : ''}`}
                        onClick={() => setActiveTab('categories')}
                    >
                        <LayoutGrid size={16} />
                        Categories
                    </button>
                </nav>

                {/* ============================= DASHBOARD ============================= */}
                {activeTab === 'dashboard' && (
                    <section className="admin-content">
                        <div className="admin-section-head">
                            <h2 className="admin-section-title">Dashboard</h2>
                        </div>

                        {statsLoading ? (
                            <div className="admin-state">Loading dashboard...</div>
                        ) : statsError ? (
                            <div className="admin-state">
                                <p>Unable to load dashboard statistics.</p>
                                <button type="button" className="btn btn-outline" onClick={loadStats}>
                                    Try Again
                                </button>
                            </div>
                        ) : (
                            <div className="admin-stats">
                                <div className="admin-stat-card">
                                    <span>Total Orders</span>
                                    <strong>{stats.totalOrders}</strong>
                                </div>

                                <div className="admin-stat-card">
                                    <span>Total Sales</span>
                                    <strong>
                                        ₹{stats.totalSales.toLocaleString('en-IN')}
                                    </strong>
                                </div>

                                <div className="admin-stat-card">
                                    <span>Total Products</span>
                                    <strong>{stats.totalProducts}</strong>
                                </div>

                                <div className="admin-stat-card">
                                    <span>Low Stock</span>
                                    <strong>{stats.lowStockProducts}</strong>
                                </div>
                                <div className="admin-stat-card">
                                    <span>Cancelled Orders</span>
                                    <strong>{stats.cancelledOrders}</strong>
                                </div>
                                <div className="admin-stat-card">
                                    <span>Total Users</span>
                                    <strong>{stats.totalUsers}</strong>
                                </div>
                            </div>
                        )}
                    </section>
                )}

                {/* ============================== ORDERS =============================== */}
                {activeTab === 'orders' && (
                    <section className="admin-content">
                        <div className="admin-section-head">
                            <h2 className="admin-section-title">Orders</h2>
                        </div>

                        <div className={`admin-panel-grid ${selectedOrderId ? 'has-side' : ''}`}>
                            <div className="admin-panel-main">
                                {ordersLoading ? (
                                    <div className="admin-state">Loading orders...</div>
                                ) : ordersError ? (
                                    <div className="admin-state">
                                        <p>Unable to load orders.</p>
                                        <button type="button" className="btn btn-outline" onClick={loadOrders}>
                                            Try Again
                                        </button>
                                    </div>
                                ) : orders.length === 0 ? (
                                    <div className="admin-state">No orders have been placed yet.</div>
                                ) : (
                                    <div className="admin-orders">
                                        {orders.map((order) => (
                                            <button
                                                key={order.id}
                                                type="button"
                                                className={`admin-order-card ${selectedOrderId === order.id ? 'active' : ''}`}
                                                onClick={() => {
                                                    setSelectedOrderId(order.id);
                                                    loadOrderDetails(order.id);
                                                }}
                                            >
                                                <div className="admin-order-card-id">
                                                    <strong>{order.orderNumber}</strong>
                                                    <p>
                                                        {order.user?.name || order.fullName}
                                                    </p>
                                                </div>

                                                <div className="admin-order-card-total">
                                                    <span>
                                                        ₹{order.total.toLocaleString('en-IN')}
                                                    </span>
                                                </div>

                                                <div className="admin-order-card-proof">
                                                    {order.paymentProofUrl ? (
                                                        <a
                                                            href={order.paymentProofUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            💳 View Proof
                                                        </a>
                                                    ) : (
                                                        <span>⚠️ No Proof</span>
                                                    )}
                                                </div>
                                                <div className="admin-order-card-date">
                                                    <span>{formatDate(order.createdAt)}</span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {selectedOrderId && (
                                <div className="admin-panel-side">
                                    <div className="admin-card admin-order-details">
                                        {orderDetailsLoading ? (
                                            <div className="admin-state">Loading order details...</div>
                                        ) : orderDetailsError ? (
                                            <div className="admin-state">
                                                <p>Unable to load order details.</p>
                                                <button
                                                    type="button"
                                                    className="btn btn-outline"
                                                    onClick={() => loadOrderDetails(selectedOrderId)}
                                                >
                                                    Try Again
                                                </button>
                                            </div>
                                        ) : selectedOrder ? (
                                            <div>
                                                <div className="admin-order-details-head">
                                                    <button
                                                        type="button"
                                                        className="admin-back-btn"
                                                        onClick={() => {
                                                            setSelectedOrderId(null);
                                                            setSelectedOrder(null);
                                                            setOrderDetailsError(null);
                                                        }}
                                                    >
                                                        ← Back to Orders
                                                    </button>
                                                </div>

                                                <h3>Order {selectedOrder.orderNumber}</h3>

                                                <div className="admin-order-info">
                                                    <p>
                                                        <strong>Customer:</strong>{' '}
                                                        {selectedOrder.user?.name || selectedOrder.fullName}
                                                    </p>

                                                    <p>
                                                        <strong>Email:</strong> {selectedOrder.email || 'N/A'}
                                                    </p>

                                                    <p>
                                                        <strong>Phone:</strong> {selectedOrder.phone}
                                                    </p>

                                                    <p>
                                                        <strong>Payment Method:</strong>{' '}
                                                        {selectedOrder.paymentMethod || 'N/A'}
                                                    </p>
                                                </div>

                                                <div className="admin-status-row">
                                                    <strong>Status:</strong>

                                                    <select
                                                        className="admin-select"
                                                        value={selectedOrder.status}
                                                        onChange={(e) => updateOrderStatus(e.target.value)}
                                                    >
                                                        <option value="PLACED">Placed</option>
                                                        <option value="PAID">Paid</option>
                                                        <option value="SHIPPED">Shipped</option>
                                                        <option value="DELIVERED">Delivered</option>
                                                        <option value="CANCELLED">Cancelled</option>
                                                    </select>
                                                </div>

                                                {selectedOrder.paymentProofUrl && (
                                                    <div className="admin-payment-proof">
                                                        <h4>Payment Proof</h4>

                                                        <img
                                                            src={selectedOrder.paymentProofUrl}
                                                            alt="Payment proof"
                                                        />
                                                    </div>
                                                )}

                                                <p className="admin-order-total">
                                                    <strong>Total: ₹{selectedOrder.total.toLocaleString('en-IN')}</strong>
                                                </p>

                                                <div className="admin-shipping-block">
                                                    <h4>Shipping Address</h4>

                                                    {editingShipping ? (
                                                        <div className="admin-shipping-form">
                                                            <input
                                                                type="text"
                                                                className="admin-input"
                                                                placeholder="Address Line 1"
                                                                value={shippingForm.addressLine1}
                                                                onChange={(e) =>
                                                                    setShippingForm({
                                                                        ...shippingForm,
                                                                        addressLine1: e.target.value,
                                                                    })
                                                                }
                                                            />

                                                            <input
                                                                type="text"
                                                                className="admin-input"
                                                                placeholder="Address Line 2"
                                                                value={shippingForm.addressLine2}
                                                                onChange={(e) =>
                                                                    setShippingForm({
                                                                        ...shippingForm,
                                                                        addressLine2: e.target.value,
                                                                    })
                                                                }
                                                            />

                                                            <input
                                                                type="text"
                                                                className="admin-input"
                                                                placeholder="City"
                                                                value={shippingForm.city}
                                                                onChange={(e) =>
                                                                    setShippingForm({
                                                                        ...shippingForm,
                                                                        city: e.target.value,
                                                                    })
                                                                }
                                                            />

                                                            <input
                                                                type="text"
                                                                className="admin-input"
                                                                placeholder="State"
                                                                value={shippingForm.state}
                                                                onChange={(e) =>
                                                                    setShippingForm({
                                                                        ...shippingForm,
                                                                        state: e.target.value,
                                                                    })
                                                                }
                                                            />

                                                            <input
                                                                type="text"
                                                                className="admin-input"
                                                                placeholder="Pincode"
                                                                value={shippingForm.pincode}
                                                                onChange={(e) =>
                                                                    setShippingForm({
                                                                        ...shippingForm,
                                                                        pincode: e.target.value,
                                                                    })
                                                                }
                                                            />

                                                            <div className="admin-form-actions">
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-primary"
                                                                    onClick={updateShipping}
                                                                >
                                                                    Save Shipping
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-outline"
                                                                    onClick={() => setEditingShipping(false)}
                                                                >
                                                                    Cancel
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="admin-shipping-view">
                                                            <p>
                                                                {selectedOrder.addressLine1}
                                                                {selectedOrder.addressLine2 && (
                                                                    <>
                                                                        <br />
                                                                        {selectedOrder.addressLine2}
                                                                    </>
                                                                )}
                                                                <br />
                                                                {selectedOrder.city}, {selectedOrder.state} - {selectedOrder.pincode}
                                                            </p>

                                                            <button
                                                                type="button"
                                                                className="btn btn-outline"
                                                                onClick={() => {
                                                                    setShippingForm({
                                                                        addressLine1: selectedOrder.addressLine1 || '',
                                                                        addressLine2: selectedOrder.addressLine2 || '',
                                                                        city: selectedOrder.city || '',
                                                                        state: selectedOrder.state || '',
                                                                        pincode: selectedOrder.pincode || '',
                                                                    });

                                                                    setEditingShipping(true);
                                                                }}
                                                            >
                                                                Edit Shipping
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="admin-order-items">
                                                    <h4>Items</h4>

                                                    {selectedOrder.items.map((item) => (
                                                        <div key={item.id} className="admin-order-item">
                                                            <span>{item.name}</span>
                                                            <span>
                                                                {item.qty} × ₹{item.price.toLocaleString('en-IN')}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ) : null}
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>
                )}

                {/* ============================= PRODUCTS ============================== */}
                {activeTab === 'products' && (
                    <section className="admin-content">
                        <div className="admin-section-head">
                            <h2 className="admin-section-title">Products</h2>
                            <button
                                type="button"
                                className="btn btn-primary admin-add-trigger"
                                onClick={() => setAddingProduct(true)}
                            >
                                + Add Product
                            </button>
                        </div>

                        <div className={`admin-panel-grid ${productPanelOpen ? 'has-side' : ''}`}>
                            <div className="admin-panel-main">
                                {productsLoading ? (
                                    <div className="admin-state">Loading products...</div>
                                ) : productsError ? (
                                    <div className="admin-state">
                                        <p>Unable to load products.</p>
                                        <button
                                            type="button"
                                            className="btn btn-outline"
                                            onClick={loadProducts}
                                        >
                                            Try Again
                                        </button>
                                    </div>
                                ) : products.length === 0 ? (
                                    <div className="admin-state">No products found.</div>
                                ) : (
                                    <div className="admin-products">
                                        {products.map((product) => (
                                            <div
                                                key={product.id}
                                                className="admin-product-card"
                                            >
                                                <div>
                                                    <strong>{product.name}</strong>
                                                    <p>{product.category}</p>
                                                </div>

                                                <div className="admin-card-price">
                                                    ₹{product.price.toLocaleString('en-IN')}
                                                </div>

                                                <div className="admin-card-stock">
                                                    Stock: {product.stock}
                                                </div>

                                                <div className="admin-card-actions">
                                                    <button
                                                        type="button"
                                                        className="btn btn-outline"
                                                        onClick={() => {
                                                            setEditingProduct(product);

                                                            setProductForm({
                                                                name: product.name,
                                                                category: product.category,
                                                                price: product.price,
                                                                stock: product.stock,
                                                            });
                                                        }}
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="btn btn-outline-red"
                                                        onClick={async () => {
                                                            const confirmed = window.confirm(
                                                                `Are you sure you want to delete "${product.name}"?`
                                                            );

                                                            if (!confirmed) return;

                                                            try {
                                                                await apiFetch(`/products/${product.id}`, {
                                                                    method: 'DELETE',
                                                                });

                                                                setProducts((currentProducts) =>
                                                                    currentProducts.filter(
                                                                        (item) => item.id !== product.id
                                                                    )
                                                                );
                                                            } catch (error) {
                                                                console.error('Failed to delete product:', error);
                                                                alert(error.message || 'Failed to delete product.');
                                                            }
                                                        }}
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {productPanelOpen && (
                                <div className="admin-panel-side">
                                    {addingProduct && (
                                        <div className="admin-card admin-product-edit">
                                            <h3 className="admin-form-title">Add Product</h3>

                                            <div className="admin-form-grid">
                                                <input
                                                    type="text"
                                                    className="admin-input"
                                                    placeholder="Product ID"
                                                    value={newProductForm.id}
                                                    onChange={(e) =>
                                                        setNewProductForm({
                                                            ...newProductForm,
                                                            id: e.target.value,
                                                        })
                                                    }
                                                />

                                                <input
                                                    type="text"
                                                    className="admin-input"
                                                    placeholder="Product name"
                                                    value={newProductForm.name}
                                                    onChange={(e) =>
                                                        setNewProductForm({
                                                            ...newProductForm,
                                                            name: e.target.value,
                                                        })
                                                    }
                                                />

                                                <select
                                                    className="admin-select"
                                                    value={newProductForm.category}
                                                    onChange={(e) =>
                                                        setNewProductForm({
                                                            ...newProductForm,
                                                            category: e.target.value,
                                                        })
                                                    }
                                                >
                                                    <option value="">Select Category</option>

                                                    {categories.map((category) => (
                                                        <option key={category.id} value={category.id}>
                                                            {category.label}
                                                        </option>
                                                    ))}
                                                </select>

                                                <input
                                                    type="text"
                                                    className="admin-input"
                                                    placeholder="Sub category"
                                                    value={newProductForm.sub}
                                                    onChange={(e) =>
                                                        setNewProductForm({
                                                            ...newProductForm,
                                                            sub: e.target.value,
                                                        })
                                                    }
                                                />

                                                <input
                                                    type="number"
                                                    className="admin-input"
                                                    placeholder="Price"
                                                    value={newProductForm.price}
                                                    onChange={(e) =>
                                                        setNewProductForm({
                                                            ...newProductForm,
                                                            price: e.target.value,
                                                        })
                                                    }
                                                />

                                                <input
                                                    type="number"
                                                    className="admin-input"
                                                    placeholder="Stock"
                                                    value={newProductForm.stock}
                                                    onChange={(e) =>
                                                        setNewProductForm({
                                                            ...newProductForm,
                                                            stock: e.target.value,
                                                        })
                                                    }
                                                />

                                                <input
                                                    type="number"
                                                    className="admin-input"
                                                    placeholder="Rating"
                                                    min="0"
                                                    max="5"
                                                    step="0.1"
                                                    value={newProductForm.rating}
                                                    onChange={(e) =>
                                                        setNewProductForm({
                                                            ...newProductForm,
                                                            rating: e.target.value,
                                                        })
                                                    }
                                                />

                                                <input
                                                    type="number"
                                                    className="admin-input"
                                                    placeholder="Reviews"
                                                    min="0"
                                                    value={newProductForm.reviews}
                                                    onChange={(e) =>
                                                        setNewProductForm({
                                                            ...newProductForm,
                                                            reviews: e.target.value,
                                                        })
                                                    }
                                                />

                                                <input
                                                    type="text"
                                                    className="admin-input"
                                                    placeholder="Image URL"
                                                    value={newProductForm.image}
                                                    onChange={(e) =>
                                                        setNewProductForm({
                                                            ...newProductForm,
                                                            image: e.target.value,
                                                        })
                                                    }
                                                />

                                                <input
                                                    type="text"
                                                    className="admin-input"
                                                    placeholder="Icon"
                                                    value={newProductForm.icon}
                                                    onChange={(e) =>
                                                        setNewProductForm({
                                                            ...newProductForm,
                                                            icon: e.target.value,
                                                        })
                                                    }
                                                />

                                                <input
                                                    type="text"
                                                    className="admin-input"
                                                    placeholder="Hue"
                                                    value={newProductForm.hue}
                                                    onChange={(e) =>
                                                        setNewProductForm({
                                                            ...newProductForm,
                                                            hue: e.target.value,
                                                        })
                                                    }
                                                />

                                                <div className="admin-form-actions">
                                                    <button
                                                        type="button"
                                                        className="btn btn-primary"
                                                        onClick={createProduct}
                                                    >
                                                        Save Product
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="btn btn-outline"
                                                        onClick={() => setAddingProduct(false)}
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {editingProduct && (
                                        <div className="admin-card admin-product-edit">
                                            <h3 className="admin-form-title">Edit Product</h3>
                                            <p className="admin-form-meta">ID: {editingProduct.id}</p>

                                            <div className="admin-form-grid">
                                                <input
                                                    type="text"
                                                    className="admin-input"
                                                    placeholder="Product name"
                                                    value={productForm.name}
                                                    onChange={(e) =>
                                                        setProductForm({
                                                            ...productForm,
                                                            name: e.target.value,
                                                        })
                                                    }
                                                />
                                                <select
                                                    className="admin-select"
                                                    value={productForm.category}
                                                    onChange={(e) =>
                                                        setProductForm({
                                                            ...productForm,
                                                            category: e.target.value,
                                                        })
                                                    }
                                                >
                                                    <option value="">Select Category</option>

                                                    {categories.map((category) => (
                                                        <option key={category.id} value={category.id}>
                                                            {category.label}
                                                        </option>
                                                    ))}
                                                </select>
                                                <input
                                                    type="number"
                                                    className="admin-input"
                                                    placeholder="Price"
                                                    value={productForm.price}
                                                    onChange={(e) =>
                                                        setProductForm({
                                                            ...productForm,
                                                            price: e.target.value,
                                                        })
                                                    }
                                                />

                                                <input
                                                    type="number"
                                                    className="admin-input"
                                                    placeholder="Stock"
                                                    value={productForm.stock}
                                                    onChange={(e) =>
                                                        setProductForm({
                                                            ...productForm,
                                                            stock: e.target.value,
                                                        })
                                                    }
                                                />

                                                <div className="admin-form-actions">
                                                    <button
                                                        type="button"
                                                        className="btn btn-primary"
                                                        onClick={updateProduct}
                                                    >
                                                        Save
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="btn btn-outline"
                                                        onClick={() => setEditingProduct(null)}
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </section>
                )}

                {/* ============================ CATEGORIES ============================= */}
                {activeTab === 'categories' && (
                    <section className="admin-content">
                        <div className="admin-section-head">
                            <h2 className="admin-section-title">Categories</h2>
                            <button
                                type="button"
                                className="btn btn-primary admin-add-trigger"
                                onClick={() => setAddingCategory(true)}
                            >
                                + Add Category
                            </button>
                        </div>

                        <div className={`admin-panel-grid ${categoryPanelOpen ? 'has-side' : ''}`}>
                            <div className="admin-panel-main">
                                {categoriesLoading ? (
                                    <div className="admin-state">Loading categories...</div>
                                ) : categoriesError ? (
                                    <div className="admin-state">
                                        <p>Unable to load categories.</p>

                                        <button type="button" className="btn btn-outline" onClick={loadCategories}>
                                            Try Again
                                        </button>
                                    </div>
                                ) : adminCategories.length === 0 ? (
                                    <div className="admin-state">No categories found.</div>
                                ) : (
                                    <div className="admin-categories">
                                        {adminCategories.map((category) => (
                                            <div
                                                key={category.id}
                                                className="admin-category-card"
                                            >
                                                <div>
                                                    <strong>{category.label}</strong>
                                                    <p>ID: {category.id}</p>
                                                </div>

                                                <div>
                                                    <p>Icon: {category.icon}</p>
                                                    <p>Hue: {category.hue}</p>
                                                </div>

                                                <div className="admin-card-actions">
                                                    <button
                                                        type="button"
                                                        className="btn btn-outline"
                                                        onClick={() => {
                                                            setEditingCategory(category);

                                                            setCategoryForm({
                                                                label: category.label || '',
                                                                icon: category.icon || '',
                                                                hue: category.hue || '',
                                                                tagline: category.tagline || '',
                                                                image: category.image || '',
                                                            });
                                                        }}
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="btn btn-outline-red"
                                                        onClick={async () => {
                                                            const confirmed = window.confirm(
                                                                `Are you sure you want to delete "${category.label}"?`
                                                            );

                                                            if (!confirmed) return;

                                                            try {
                                                                await apiFetch(`/categories/${category.id}`, {
                                                                    method: 'DELETE',
                                                                });

                                                                setAdminCategories((current) =>
                                                                    current.filter((item) => item.id !== category.id)
                                                                );
                                                            } catch (error) {
                                                                console.error('Failed to delete category:', error);
                                                                alert(
                                                                    error.message || 'Failed to delete category.'
                                                                );
                                                            }
                                                        }}
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {categoryPanelOpen && (
                                <div className="admin-panel-side">
                                    {addingCategory && (
                                        <div className="admin-card admin-category-edit">
                                            <h3 className="admin-form-title">Add Category</h3>

                                            <div className="admin-form-grid">
                                                <input
                                                    type="text"
                                                    className="admin-input"
                                                    placeholder="Category ID"
                                                    value={newCategoryForm.id}
                                                    onChange={(e) =>
                                                        setNewCategoryForm({
                                                            ...newCategoryForm,
                                                            id: e.target.value,
                                                        })
                                                    }
                                                />

                                                <input
                                                    type="text"
                                                    className="admin-input"
                                                    placeholder="Category name"
                                                    value={newCategoryForm.label}
                                                    onChange={(e) =>
                                                        setNewCategoryForm({
                                                            ...newCategoryForm,
                                                            label: e.target.value,
                                                        })
                                                    }
                                                />

                                                <input
                                                    type="text"
                                                    className="admin-input"
                                                    placeholder="Icon"
                                                    value={newCategoryForm.icon}
                                                    onChange={(e) =>
                                                        setNewCategoryForm({
                                                            ...newCategoryForm,
                                                            icon: e.target.value,
                                                        })
                                                    }
                                                />

                                                <input
                                                    type="text"
                                                    className="admin-input"
                                                    placeholder="Hue"
                                                    value={newCategoryForm.hue}
                                                    onChange={(e) =>
                                                        setNewCategoryForm({
                                                            ...newCategoryForm,
                                                            hue: e.target.value,
                                                        })
                                                    }
                                                />

                                                <input
                                                    type="text"
                                                    className="admin-input"
                                                    placeholder="Tagline"
                                                    value={newCategoryForm.tagline}
                                                    onChange={(e) =>
                                                        setNewCategoryForm({
                                                            ...newCategoryForm,
                                                            tagline: e.target.value,
                                                        })
                                                    }
                                                />

                                                <input
                                                    type="text"
                                                    className="admin-input"
                                                    placeholder="Image URL"
                                                    value={newCategoryForm.image}
                                                    onChange={(e) =>
                                                        setNewCategoryForm({
                                                            ...newCategoryForm,
                                                            image: e.target.value,
                                                        })
                                                    }
                                                />

                                                <div className="admin-form-actions">
                                                    <button
                                                        type="button"
                                                        className="btn btn-primary"
                                                        onClick={createCategory}
                                                    >
                                                        Save Category
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className="btn btn-outline"
                                                        onClick={() => setAddingCategory(false)}
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {editingCategory && (
                                        <div className="admin-card admin-category-edit">
                                            <h3 className="admin-form-title">Edit Category</h3>
                                            <p className="admin-form-meta">
                                                Category ID: {editingCategory.id}
                                            </p>

                                            <div className="admin-form-grid">
                                                <input
                                                    type="text"
                                                    className="admin-input"
                                                    placeholder="Category name"
                                                    value={categoryForm.label}
                                                    onChange={(e) =>
                                                        setCategoryForm({
                                                            ...categoryForm,
                                                            label: e.target.value,
                                                        })
                                                    }
                                                />

                                                <input
                                                    type="text"
                                                    className="admin-input"
                                                    placeholder="Icon"
                                                    value={categoryForm.icon}
                                                    onChange={(e) =>
                                                        setCategoryForm({
                                                            ...categoryForm,
                                                            icon: e.target.value,
                                                        })
                                                    }
                                                />

                                                <input
                                                    type="text"
                                                    className="admin-input"
                                                    placeholder="Hue"
                                                    value={categoryForm.hue}
                                                    onChange={(e) =>
                                                        setCategoryForm({
                                                            ...categoryForm,
                                                            hue: e.target.value,
                                                        })
                                                    }
                                                />

                                                <input
                                                    type="text"
                                                    className="admin-input"
                                                    placeholder="Tagline"
                                                    value={categoryForm.tagline}
                                                    onChange={(e) =>
                                                        setCategoryForm({
                                                            ...categoryForm,
                                                            tagline: e.target.value,
                                                        })
                                                    }
                                                />

                                                <input
                                                    type="text"
                                                    className="admin-input"
                                                    placeholder="Image URL"
                                                    value={categoryForm.image}
                                                    onChange={(e) =>
                                                        setCategoryForm({
                                                            ...categoryForm,
                                                            image: e.target.value,
                                                        })
                                                    }
                                                />

                                                <div className="admin-form-actions">
                                                    <button
                                                        type="button"
                                                        className="btn btn-primary"
                                                        onClick={updateCategory}
                                                    >
                                                        Save
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className="btn btn-outline"
                                                        onClick={() => setEditingCategory(null)}
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </section>
                )}
            </div>
        </Layout>
    );
}