// @ts-nocheck
// src/lib/stores.js
import { get, writable } from 'svelte/store';

// API constants
const STORE_API_BASE = `/wp/wp-json/wc/store`;
const PUBLIC_API_BASE = `/wp/wp-json/wc/store`;
// Session store
export let _nonce = writable("")

// Cart store
export const cart = writable({
    items: [],
    items_count: 0,
    items_weight: 0,
    needs_payment: false,
    needs_shipping: false,
    totals: {
        total_items: "0",
        total_items_tax: "0",
        total_fees: "0",
        total_fees_tax: "0",
        total_discount: "0",
        total_discount_tax: "0",
        total_shipping: "0",
        total_shipping_tax: "0",
        total_price: "0",
        total_tax: "0",
        tax_lines: [],
        currency_code: "USD",
        currency_symbol: "$",
        currency_minor_unit: 2,
        currency_decimal_separator: ".",
        currency_thousand_separator: ",",
        currency_prefix: "$",
        currency_suffix: ""
    },
    isLoading: false
});

// Fetch cart contents
export const fetchCart = async () => {
    try {
        cart.update(c => ({ ...c, isLoading: true }));
        const response = await fetch(`${STORE_API_BASE}/cart`, {
            
            credentials: 'include'
        });
        _nonce.set(response.headers.get("nonce"));
        if (!response.ok) throw new Error('Failed to fetch cart');
        
        const data = await response.json();
        cart.set({
            ...data,
            isLoading: false
        });
    } catch (error) {
        console.error('Cart fetch error:', error);
        cart.update(c => ({ ...c, isLoading: false }));
    }
};

// Add to cart
export const addToCart = async (product_id, quantity = 1) => {
    try {
        cart.update(c => ({ ...c, isLoading: true }));
        const response = await fetch(`${STORE_API_BASE}/cart/add-item`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Nonce': get(_nonce)
            },
            body: JSON.stringify({ id: product_id, quantity }),
            credentials: 'include'
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to add to cart');
        }
        
        const data = await response.json();
        cart.set({
            ...data,
            isLoading: false
        });
        
        return true;
    } catch (error) {
        console.error('Add to cart error:', error);
        cart.update(c => ({ ...c, isLoading: false }));
        throw error;
    }
};

// Update cart item
export const updateCartItem = async (key, quantity) => {
    try {
        cart.update(c => ({ ...c, isLoading: true }));
        const response = await fetch(`${STORE_API_BASE}/cart/update-item`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Nonce': get(_nonce)
            },
            body: JSON.stringify({ key, quantity }),
            credentials: 'include'
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to update cart');
        }
        
        const data = await response.json();
        cart.set({
            ...data,
            isLoading: false
        });
    } catch (error) {
        console.error('Update cart error:', error);
        cart.update(c => ({ ...c, isLoading: false }));
        throw error;
    }
};

// Remove cart item
export const removeCartItem = async (key) => {
    try {
        cart.update(c => ({ ...c, isLoading: true }));
        const response = await fetch(`${STORE_API_BASE}/cart/remove-item`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Nonce': get(_nonce)
            },
            body: JSON.stringify({ key }),
            credentials: 'include'
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to remove item');
        }
        
        const data = await response.json();
        cart.set({
            ...data,
            isLoading: false
        });
    } catch (error) {
        console.error('Remove cart item error:', error);
        cart.update(c => ({ ...c, isLoading: false }));
        throw error;
    }
};

// Fetch products with parameters
export const fetchProducts = async (params = {}) => {
    try {
        const url = new URL(`${PUBLIC_API_BASE}/products`);
        
        // Add parameters to URL
        Object.entries(params).forEach(([key, value]) => {
            // Handle array parameters (like categories)
            if (Array.isArray(value)) {
                value.forEach(v => url.searchParams.append(key, v));
            } else {
                url.searchParams.append(key, value);
            }
        });
        
        const response = await fetch(url, {
            credentials: 'include',
            'Nonce': get(_nonce)
        });
        
        if (!response.ok) throw new Error('Failed to fetch products');
        
        return await response.json();
    } catch (error) {
        console.error('Products fetch error:', error);
        throw error;
    }
};

// Fetch product categories
export const fetchCategories = async (params = {}) => {
    try {
        const url = new URL(`${PUBLIC_API_BASE}/products/categories`);
        Object.entries(params).forEach(([key, value]) => {
            url.searchParams.append(key, value);
        });
        
        const response = await fetch(url, {
            credentials: 'include',
            'Nonce': get(_nonce)
        });
        
        if (!response.ok) throw new Error('Failed to fetch categories');
        
        return await response.json();
    } catch (error) {
        console.error('Categories fetch error:', error);
        throw error;
    }
};

// Fetch single product
export const fetchProduct = async (id) => {
    try {
        const response = await fetch(`${PUBLIC_API_BASE}/products/${id}`, {
            credentials: 'include',
            'Nonce': get(_nonce)
        });
        
        if (!response.ok) throw new Error('Failed to fetch product');
        
        return await response.json();
    } catch (error) {
        console.error('Product fetch error:', error);
        throw error;
    }
};


// Select shipping rate
export const selectShippingRate = async (rateId) => {
    try {
        const response = await fetch(`${STORE_API_BASE}/cart/select-shipping-rate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Nonce': get(_nonce)
            },
            body: JSON.stringify({ package_id: 0, rate_id: rateId }),
            credentials: 'include'
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to select shipping rate');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Shipping rate error:', error);
        throw error;
    }
};


// Update customer information - corrected to match API spec
export const updateCustomer = async (data) => {
    try {
        // Prepare payload according to API spec
        const payload = {};
        
        if (data.billing_address) {
            payload.billing_address = {
                first_name: data.billing_address.first_name || '',
                last_name: data.billing_address.last_name || '',
                company: data.billing_address.company || '',
                address_1: data.billing_address.address_1 || '',
                address_2: data.billing_address.address_2 || '',
                city: data.billing_address.city || '',
                state: data.billing_address.state || '',
                postcode: data.billing_address.postcode || '',
                country: data.billing_address.country || '',
                phone: data.billing_address.phone || '',
                email: data.billing_address.email || ''
            };
        }
        
        if (data.shipping_address) {
            payload.shipping_address = {
                first_name: data.shipping_address.first_name || '',
                last_name: data.shipping_address.last_name || '',
                company: data.shipping_address.company || '',
                address_1: data.shipping_address.address_1 || '',
                address_2: data.shipping_address.address_2 || '',
                city: data.shipping_address.city || '',
                state: data.shipping_address.state || '',
                postcode: data.shipping_address.postcode || '',
                country: data.shipping_address.country || '',
                phone: data.shipping_address.phone || ''
            };
        }

        const response = await fetch(`${STORE_API_BASE}/cart/update-customer`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Nonce': get(_nonce)
            },
            body: JSON.stringify(payload),
            credentials: 'include'
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to update customer');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Update customer error:', error);
        throw error;
    }
};

// Place order - corrected to match API spec
export const placeOrder = async (data) => {
    try {
        // Prepare payload according to API spec
        const payload = {
            payment_method: data.payment_method,
            customer_note: data.customer_note,
            billing_address: {
                first_name: data.billing_address.first_name || '',
                last_name: data.billing_address.last_name || '',
                company: data.billing_address.company || '',
                address_1: data.billing_address.address_1 || '',
                address_2: data.billing_address.address_2 || '',
                city: data.billing_address.city || '',
                state: data.billing_address.state || '',
                postcode: data.billing_address.postcode || '',
                country: data.billing_address.country || '',
                phone: data.billing_address.phone || '',
                email: data.billing_address.email || ''
            }
        };
        
        // Add shipping address if different from billing
        if (data.shipping_address) {
            payload.shipping_address = {
                first_name: data.shipping_address.first_name || '',
                last_name: data.shipping_address.last_name || '',
                company: data.shipping_address.company || '',
                address_1: data.shipping_address.address_1 || '',
                address_2: data.shipping_address.address_2 || '',
                city: data.shipping_address.city || '',
                state: data.shipping_address.state || '',
                postcode: data.shipping_address.postcode || '',
                country: data.shipping_address.country || '',
                phone: data.shipping_address.phone || ''
            };
        }

        const response = await fetch(`${STORE_API_BASE}/checkout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Nonce': get(_nonce)
            },
            body: JSON.stringify(payload),
            credentials: 'include'
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to place order');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Place order error:', error);
        throw error;
    }
};