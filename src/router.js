// src/router.js
import { writable } from 'svelte/store';

// Route configuration for e-commerce store
export const routes = {
  // Static routes
  '/home': {
    component: () => import('./pages/HomePage.svelte'),
    name: 'Home'
  },
  
  '/cart': {
    component: () => import('./pages/CartPage.svelte'),
    name: 'Cart'
  },
  
  '/checkout': {
    component: () => import('./pages/CheckoutPage.svelte'),
    name: 'Checkout'
  },
  '/products': {
    component: () => import('./pages/ProductsPage.svelte'),
    name: 'Products',
    data: async (params) => {
        try {
            const queryParams = new URLSearchParams(window.location.search);
            
            // Extract all possible filter parameters
            const search = queryParams.get('search') || '';
            const category = queryParams.get('category') || '';
            const min_price = queryParams.get('min_price') || '';
            const max_price = queryParams.get('max_price') || '';
            const on_sale = queryParams.get('on_sale') || '';
            const in_stock = queryParams.get('in_stock') || '';
            const orderby = queryParams.get('orderby') || 'date';
            const order = queryParams.get('order') || 'desc';
            const page = parseInt(queryParams.get('page')) || 1;
            const per_page = 12; // Fixed per page for consistency
            
            // Build API URL with all parameters
            let url = `/wp/wp-json/wc/store/products?per_page=${per_page}&page=${page}`;
            
            // Add filters
            if (search) url += `&search=${encodeURIComponent(search)}`;
            if (category) url += `&category=${encodeURIComponent(category)}`;
            if (min_price) url += `&min_price=${parseInt(min_price) * 100}`; // Convert to cents
            if (max_price) url += `&max_price=${parseInt(max_price) * 100}`; // Convert to cents
            if (on_sale === 'true') url += '&on_sale=true';
            if (in_stock === 'true') url += '&stock_status=instock';
            
            // Add sorting
            url += `&orderby=${orderby}&order=${order}`;
            
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            // Extract pagination info from headers
            const totalItems = parseInt(response.headers.get('x-wp-total')) || 0;
            const totalPages = parseInt(response.headers.get('x-wp-totalpages')) || 1;
            
            const products = await response.json();
            
            // Fetch categories for filter sidebar
            const categoriesResponse = await fetch('/wp/wp-json/wc/store/products/categories?per_page=100&hide_empty=true');
            const categories = categoriesResponse.ok ? await categoriesResponse.json() : [];
            
            return {
                products,
                categories,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalItems,
                    perPage: per_page
                },
                filters: {
                    search,
                    category,
                    min_price,
                    max_price,
                    on_sale: on_sale === 'true',
                    in_stock: in_stock === 'true',
                    orderby,
                    order
                }
            };
        } catch (error) {
            console.error('Error fetching products:', error);
            throw error;
        }
    }
  },
  // Product detail routes
  '/product/:id': {
    component: () => import('./pages/ProductPage.svelte'),
    name: 'Product',
    data: async (params) => {
      try {
        const response = await fetch(`/wp/wp-json/wc/store/products/${params.id}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('PRODUCT_NOT_FOUND');
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const product = await response.json();
        return product;
      } catch (error) {
        if (error.message === 'PRODUCT_NOT_FOUND') {
          throw new Error('PRODUCT_NOT_FOUND');
        }
        console.error('Error fetching product:', error);
        throw error;
      }
    }
  },
    '/TOS': {
    component: () => import('./pages/TOS.svelte'),
    name: ''
  },
    '/Return-Policy': {
    component: () => import('./pages/RefundPolicy.svelte'),
    name: ''
  },
  // Fallback route
  '/404': {
    component: () => import('./pages/NotFound.svelte'),
    name: 'NotFound'
  },
};

// Path parser with support for dynamic parameters
function parsePath(pathname) {
  // Normalize path - remove trailing slash and handle root
  let path = pathname.replace(/\/$/, '') || '/';
  if (path === '/') path = '/home';
  
  // Remove query parameters for route matching
  const pathWithoutQuery = path.split('?')[0];
  
  // Check if path matches any defined route
  const routeKeys = Object.keys(routes);
  
  for (const routeKey of routeKeys) {
    // Check for exact matches (static routes)
    if (routeKey === pathWithoutQuery) {
      return { 
        route: routes[routeKey], 
        params: {} 
      };
    }
    
    // Check for dynamic routes with parameters
    if (routeKey.includes(':')) {
      const routeParts = routeKey.split('/');
      const pathParts = pathWithoutQuery.split('/');
      
      if (routeParts.length !== pathParts.length) continue;
      
      const params = {};
      let isMatch = true;
      
      for (let i = 0; i < routeParts.length; i++) {
        if (routeParts[i].startsWith(':')) {
          // This is a parameter - extract the value
          const paramName = routeParts[i].substring(1);
          params[paramName] = decodeURIComponent(pathParts[i]);
        } else if (routeParts[i] !== pathParts[i]) {
          isMatch = false;
          break;
        }
      }
      
      if (isMatch) {
        return { 
          route: routes[routeKey], 
          params 
        };
      }
    }
  }
  
  // No match found - return 404
  return { 
    route: routes['/404'], 
    params: {} 
  };
}

// Router store
function createRouter() {
  const { subscribe, set, update } = writable({
    currentRoute: null,
    component: null,
    params: {},
    routeData: null,
    loading: true,
    error: null
  });
  
  async function navigate(to, replace = false) {
    // Update store to loading state
    update(store => ({ ...store, loading: true, error: null }));
    
    const path = to.startsWith('/') ? to : `/${to}`;
    
    // Parse the path
    const { route, params } = parsePath(path);
    // Scroll to top on navigation
    try {
      // Load the component
      const componentModule = await route.component();
      const component = componentModule.default;
      
      // Fetch route data if data function exists
      let routeData = null;
      if (route.data) {
        routeData = await route.data(params);
      }
      
      // Update history
      if (replace) {
        history.replaceState({}, '', path);
      } else {
        history.pushState({}, '', path);
      }
      
      // Update store
      set({
        currentRoute: route,
        component,
        params,
        routeData,
        loading: false,
        error: null
      });
      
    window.scrollTo(0, 0);
      
    } catch (error) {
      console.error('Failed to load route:', error);
      
      let errorMessage = 'Page not found';
      let fallbackParams = {};
      
      // Handle specific errors
      if (error.message === 'PRODUCT_NOT_FOUND') {
        errorMessage = 'The requested product was not found.';
        fallbackParams = { message: errorMessage };
      } else if (error.message === 'CATEGORY_NOT_FOUND') {
        errorMessage = 'The requested category was not found.';
        fallbackParams = { message: errorMessage };
      } else {
        errorMessage = 'An error occurred while loading the page.';
        fallbackParams = { message: errorMessage };
      }
      
      // Fallback to 404 page
      const fallbackRoute = routes['/404'];
      const componentModule = await fallbackRoute.component();
      const component = componentModule.default;
      
      set({
        currentRoute: fallbackRoute,
        component,
        params: fallbackParams,
        routeData: null,
        loading: false,
        error: errorMessage
      });
    }
  }
  
  // Initialize router
  async function init() {
    await navigate(window.location.pathname + window.location.search, true);
    
    // Handle browser back/forward
    window.addEventListener('popstate', async () => {
      await navigate(window.location.pathname + window.location.search, true);
    });
  }
  
  // Helper function for search navigation
  function searchProducts(query) {
    navigate(`/search?q=${encodeURIComponent(query)}`);
  }
  
  // Helper function for category navigation
  function navigateToCategory(slug) {
    navigate(`/products?category=${slug}`);
  }
  
  // Helper function for product navigation
  function navigateToProduct(idOrSlug) {
    navigate(`/product/${idOrSlug}`);
  }
  
  return {
    subscribe,
    navigate,
    init,
    searchProducts,
    navigateToCategory,
    navigateToProduct
  };
}

export const router = createRouter();
