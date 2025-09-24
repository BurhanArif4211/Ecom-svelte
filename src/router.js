// src/router.js
import { writable } from 'svelte/store';

// Route configuration for e-commerce store
export const routes = {
  // Static routes
  '/home': {
    component: () => import('./pages/HomePage.svelte'),
    name: 'Home'
  },
  '/products': {
    component: () => import('./pages/ProductsPage.svelte'),
    name: 'Products',
    data: async (params) => {
      try {
        // Fetch all products with optional query parameters
        const queryParams = new URLSearchParams(window.location.search);
        const search = queryParams.get('search') || '';
        const category = queryParams.get('category') || '';
        
        let url = `/wp-json/wc/store/products?per_page=12`;
        
        if (search) url += `&search=${encodeURIComponent(search)}`;
        if (category) url += `&category=${encodeURIComponent(category)}`;
        
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const products = await response.json();
        return { products, search, category };
      } catch (error) {
        console.error('Error fetching products:', error);
        throw error;
      }
    }
  },
  
  '/cart': {
    component: () => import('./pages/CartPage.svelte'),
    name: 'Cart'
  },
  
  '/checkout': {
    component: () => import('./pages/CheckoutPage.svelte'),
    name: 'Checkout'
  },
  
  // Product detail routes
  '/product/:id': {
    component: () => import('./pages/ProductPage.svelte'),
    name: 'Product',
    data: async (params) => {
      try {
        const response = await fetch(`/wp-json/wc/store/products/${params.id}`);
        
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
  
  // Category routes
  '/category/:slug': {
    component: () => import('./pages/ProductsPage.svelte'),
    name: 'Category',
    data: async (params) => {
      try {
        // First, get category ID from slug
        const categoriesResponse = await fetch(
          `/wp-json/wc/store/products/categories?slug=${params.slug}`
        );
        
        if (!categoriesResponse.ok) {
          throw new Error(`HTTP error! status: ${categoriesResponse.status}`);
        }
        
        const categories = await categoriesResponse.json();
        
        if (categories.length === 0) {
          throw new Error('CATEGORY_NOT_FOUND');
        }
        
        const category = categories[0];
        
        // Then fetch products in this category
        const productsResponse = await fetch(
          `/wp-json/wc/store/products?category=${category.id}&per_page=12`
        );
        
        if (!productsResponse.ok) {
          throw new Error(`HTTP error! status: ${productsResponse.status}`);
        }
        
        const products = await productsResponse.json();
        
        return {
          products,
          category: category,
          isCategoryView: true
        };
      } catch (error) {
        if (error.message === 'CATEGORY_NOT_FOUND') {
          throw new Error('CATEGORY_NOT_FOUND');
        }
        console.error('Error fetching category products:', error);
        throw error;
      }
    }
  },
  
  // Search results route
  '/search': {
    component: () => import('./pages/ProductsPage.svelte'),
    name: 'Search',
    data: async (params) => {
      try {
        const queryParams = new URLSearchParams(window.location.search);
        const query = queryParams.get('q') || '';
        
        if (!query) {
          return { products: [], searchQuery: '', isSearchView: true };
        }
        
        const response = await fetch(
          `/wp-json/wc/store/products?search=${encodeURIComponent(query)}&per_page=12`
        );
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const products = await response.json();
        return { products, searchQuery: query, isSearchView: true };
      } catch (error) {
        console.error('Error fetching search results:', error);
        throw error;
      }
    }
  },
  
  // Fallback route
  '/404': {
    component: () => import('./pages/NotFound.svelte'),
    name: 'NotFound'
  }
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
      
      // Scroll to top on navigation
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
    navigate(`/category/${slug}`);
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

// // src/router/router.js
// import { writable } from 'svelte/store';

// function parsePath(pathname) {
//     // trim trailing slash
//     let path = pathname.replace(/\/$/, '') || '/';
//     (path === '/') ? path = '/home' : path = path; // normalize /home from /
    
//     // Match product pages
//     const productMatch = path.match(/^\/product\/(\d+)$/);
//     if (productMatch) {
//         return { page: 'productPage', params: { id: productMatch[1] } };
//     }
    
//     // Match cart page
//     if (path === '/cart') {
//         return { page: 'cartPage', params: {} };
//     }
    
//     switch (path.toLowerCase()) {
//         case '/home':
//             return { page: 'home', params: {} };
//         case '/cart':
//             return { page: 'cartPage', params: {} };
//         case '/checkout':
//             return { page: 'checkoutPage', params: {} };
//         default:
//             return { page: 'notfound', params: {} };
//     }
// }

// function createRouter() {
//     const { subscribe, set } = writable(parsePath(window.location.pathname));
    
//     // respond to back/forward buttons
//     window.addEventListener('popstate', () => {
//         set(parsePath(window.location.pathname));
//     });
    
//     return {
//         subscribe,
//         navigate(to) {
//             const path = to.startsWith('/') ? to : `/${to}`;
//             history.pushState({}, '', path);
//             set(parsePath(path));
//         }
//     };
// }

// export const router = createRouter();