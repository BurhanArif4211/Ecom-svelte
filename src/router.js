// src/router/router.js
import { writable } from 'svelte/store';

function parsePath(pathname) {
    // trim trailing slash
    let path = pathname.replace(/\/$/, '') || '/';
    (path === '/') ? path = '/home' : path = path; // normalize /home from /
    
    // Match product pages
    const productMatch = path.match(/^\/product\/(\d+)$/);
    if (productMatch) {
        return { page: 'productPage', params: { id: productMatch[1] } };
    }
    
    // Match cart page
    if (path === '/cart') {
        return { page: 'cartPage', params: {} };
    }
    
    switch (path.toLowerCase()) {
        case '/home':
            return { page: 'home', params: {} };
        case '/cart':
            return { page: 'cartPage', params: {} };
        case '/checkout':
            return { page: 'checkoutPage', params: {} };
        default:
            return { page: 'notfound', params: {} };
    }
}

function createRouter() {
    const { subscribe, set } = writable(parsePath(window.location.pathname));
    
    // respond to back/forward buttons
    window.addEventListener('popstate', () => {
        set(parsePath(window.location.pathname));
    });
    
    return {
        subscribe,
        navigate(to) {
            const path = to.startsWith('/') ? to : `/${to}`;
            history.pushState({}, '', path);
            set(parsePath(path));
        }
    };
}

export const router = createRouter();