// src/lib/stores.js
import { writable, get } from 'svelte/store';

// Session store
export const session = writable({
    nonce: null,
    customer_id: null,
    isAuthenticated: false,
    isLoading: true
});

// Cart store
export const cart = writable({
    items: [],
    item_count: 0,
    total: 0,
    isLoading: false
});

// Initialize session
export const initSession = async () => {
    try {
        const response = await fetch('/wc-spa/v1/session', {
            method: 'POST',
            credentials: 'include'
        });
        
        if (!response.ok) throw new Error('Session initialization failed');
        
        const data = await response.json();
        session.set({
            nonce: data.nonce,
            customer_id: data.customer_id,
            isAuthenticated: data.is_authenticated,
            isLoading: false
        });
        
        return data.nonce;
    } catch (error) {
        console.error('Session error:', error);
        session.update(s => ({ ...s, isLoading: false }));
        return null;
    }
};

// Fetch cart contents
export const fetchCart = async () => {
    try {
        cart.update(c => ({ ...c, isLoading: true }));
        const response = await fetch('/wc-spa/v1/cart', {
            credentials: 'include'
        });
        
        if (!response.ok) throw new Error('Failed to fetch cart');
        
        const data = await response.json();
        cart.set({
            items: data.items,
            item_count: data.item_count,
            total: data.total,
            isLoading: false
        });
    } catch (error) {
        console.error('Cart fetch error:', error);
        cart.update(c => ({ ...c, isLoading: false }));
    }
};

// Add to cart
export const addToCart = async (product_id, quantity) => {
    try {
        const currentSession = get(session);
        let nonce = currentSession.nonce;
        
        // Initialize session if needed
        if (!nonce) {
            nonce = await initSession();
            if (!nonce) throw new Error('Failed to initialize session');
        }
        
        const response = await fetch('/wc-spa/v1/cart/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-WP-Nonce': nonce
            },
            body: JSON.stringify({ product_id, quantity }),
            credentials: 'include'
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to add to cart');
        }
        
        // Update cart from response
        const cartData = await response.json();
        cart.set({
            items: cartData.items,
            item_count: cartData.item_count,
            total: cartData.total,
            isLoading: false
        });
        
        return true;
    } catch (error) {
        console.error('Add to cart error:', error);
        throw error;
    }
};

// Update cart item
export const updateCartItem = async (key, quantity) => {
    try {
        const { nonce } = get(session);
        if (!nonce) throw new Error('Session not initialized');
        
        const response = await fetch('/wc-spa/v1/cart/update', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-WP-Nonce': nonce
            },
            body: JSON.stringify({ items: [{ key, quantity }] }),
            credentials: 'include'
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to update cart');
        }
        
        const cartData = await response.json();
        cart.set({
            items: cartData.items,
            item_count: cartData.item_count,
            total: cartData.total,
            isLoading: false
        });
    } catch (error) {
        console.error('Update cart error:', error);
        throw error;
    }
};

// Remove cart item
export const removeCartItem = async (key) => {
    try {
        const { nonce } = get(session);
        if (!nonce) throw new Error('Session not initialized');
        
        const response = await fetch('/wc-spa/v1/cart/remove', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-WP-Nonce': nonce
            },
            body: JSON.stringify({ cart_key: key }),
            credentials: 'include'
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to remove item');
        }
        
        const cartData = await response.json();
        cart.set({
            items: cartData.items,
            item_count: cartData.item_count,
            total: cartData.total,
            isLoading: false
        });
    } catch (error) {
        console.error('Remove cart item error:', error);
        throw error;
    }
};