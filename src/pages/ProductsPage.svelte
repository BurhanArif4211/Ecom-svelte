<!-- src/pages/ProductsPage.svelte -->
<script>
    import { onMount } from 'svelte';
    import ProductCard from '../components/ProductCard.svelte';
    import { fetchProducts, fetchCategories } from '../lib/stores';
    import { router } from '../router';
    
    // Props
    export let categoryId = null;
    export let categoryName = '';
    
    // State
    let products = [];
    let categories = [];
    let filteredProducts = [];
    let isLoading = true;
    let error = null;
    
    // Filters
    let searchQuery = '';
    let selectedCategories = [];
    let minPrice = '';
    let maxPrice = '';
    let sortBy = 'default';
    let inStockOnly = false;
    let onSaleOnly = false;
    
    // UI State
    let showFilters = false;
    
    // Initialize data
    onMount(async () => {
        try {
            // Fetch categories if not already available
            if (categories.length === 0) {
                categories = await fetchCategories();
            }
            
            // Fetch products based on category if provided
            const params = {};
            if (categoryId) {
                params.category = categoryId;
            }
            
            products = await fetchProducts(params);
            filteredProducts = [...products];
            
        } catch (err) {
            error = err.message || "Failed to load products";
        } finally {
            isLoading = false;
        }
    });
    
    // Apply filters
    const applyFilters = () => {
        let result = [...products];
        
        // Search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(product => 
                product.name.toLowerCase().includes(query) ||
                product.description.toLowerCase().includes(query) ||
                product.sku?.toLowerCase().includes(query)
            );
        }
        
        // Category filter
        if (selectedCategories.length > 0) {
            result = result.filter(product => 
                product.categories?.some(cat => selectedCategories.includes(cat.id))
            );
        }
        
        // Price filter
        if (minPrice) {
            const min = parseFloat(minPrice);
            result = result.filter(product => parseFloat(product.prices.price) >= min);
        }
        
        if (maxPrice) {
            const max = parseFloat(maxPrice);
            result = result.filter(product => parseFloat(product.prices.price) <= max);
        }
        
        // Stock filter
        if (inStockOnly) {
            result = result.filter(product => product.is_in_stock);
        }
        
        // Sale filter
        if (onSaleOnly) {
            result = result.filter(product => product.on_sale);
        }
        
        // Sorting
        switch (sortBy) {
            case 'price-low':
                result.sort((a, b) => parseFloat(a.prices.price) - parseFloat(b.prices.price));
                break;
            case 'price-high':
                result.sort((a, b) => parseFloat(b.prices.price) - parseFloat(a.prices.price));
                break;
            case 'name-asc':
                result.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'name-desc':
                result.sort((a, b) => b.name.localeCompare(a.name));
                break;
            case 'popularity':
                // Assuming we have a rating property
                result.sort((a, b) => (b.average_rating || 0) - (a.average_rating || 0));
                break;
            default:
                // Default sorting (newest first)
                result.sort((a, b) => new Date(b.date_created) - new Date(a.date_created));
        }
        
        filteredProducts = result;
    };
    
    // Handle search
    const handleSearch = () => {
        applyFilters();
    };
    
    // Reset filters
    const resetFilters = () => {
        searchQuery = '';
        selectedCategories = categoryId ? [parseInt(categoryId)] : [];
        minPrice = '';
        maxPrice = '';
        sortBy = 'default';
        inStockOnly = false;
        onSaleOnly = false;
        applyFilters();
    };
    
    // Toggle category selection
    const toggleCategory = (id) => {
        if (selectedCategories.includes(id)) {
            selectedCategories = selectedCategories.filter(catId => catId !== id);
        } else {
            selectedCategories = [...selectedCategories, id];
        }
        applyFilters();
    };
    
    // Format price
    const formatPrice = (price) => {
        if (!price) return '';
        return `${(parseFloat(price)).toFixed(2)}`;
    };
</script>

<div class="min-h-screen bg-gray-50 py-8">
    <div class="container mx-auto px-4">
        <!-- Page Header -->
        <div class="mb-8">
            <h1 class="text-3xl font-bold text-gray-900">
                {#if categoryName}
                    {categoryName}
                {:else}
                    All Products
                {/if}
            </h1>
            <p class="text-gray-600 mt-2">
                {#if categoryName}
                    Browse our collection of {categoryName.toLowerCase()} products
                {:else}
                    Explore our complete product catalog
                {/if}
            </p>
        </div>
        
        <!-- Search and Filter Controls -->
        <div class="flex flex-col md:flex-row gap-4 mb-8">
            <!-- Search Box -->
            <div class="flex-grow">
                <div class="relative">
                    <input
                        type="text"
                        bind:value={searchQuery}
                        placeholder="Search products..."
                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 pr-12"
                        on:input={handleSearch}
                    />
                    <button 
                        on:click={handleSearch}
                        class="absolute right-3 top-3 text-gray-500 hover:text-blue-600"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </button>
                </div>
            </div>
            
            <!-- Filter Toggle Button (Mobile) -->
            <button 
                on:click={() => showFilters = !showFilters}
                class="md:hidden flex items-center justify-center gap-2 bg-white border border-gray-300 rounded-lg px-4 py-3 hover:bg-gray-50"
            >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filters
            </button>
            
            <!-- Sort Dropdown -->
            <div class="w-full md:w-auto">
                <select 
                    bind:value={sortBy}
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    on:change={applyFilters}
                >
                    <option value="default">Sort by: Default</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="name-asc">Name: A to Z</option>
                    <option value="name-desc">Name: Z to A</option>
                    <option value="popularity">Popularity</option>
                </select>
            </div>
        </div>
        
        <div class="flex flex-col md:flex-row gap-8">
            <!-- Filters Sidebar -->
            <div class={`md:w-64 ${showFilters ? 'block' : 'hidden md:block'}`}>
                <div class="bg-white rounded-xl shadow-md p-6 sticky top-8">
                    <div class="flex justify-between items-center mb-6">
                        <h2 class="text-xl font-bold">Filters</h2>
                        <button 
                            on:click={resetFilters}
                            class="text-blue-600 hover:text-blue-800 text-sm"
                        >
                            Reset
                        </button>
                    </div>
                    
                    <!-- Categories -->
                    <div class="mb-6">
                        <h3 class="font-bold mb-3">Categories</h3>
                        <div class="space-y-2 max-h-60 overflow-y-auto">
                            {#each categories as category}
                                <div class="flex items-center">
                                    <input 
                                        type="checkbox" 
                                        id={`category-${category.id}`}
                                        checked={selectedCategories.includes(category.id)}
                                        on:change={() => toggleCategory(category.id)}
                                        class="h-4 w-4 text-blue-600 rounded"
                                    />
                                    <label 
                                        for={`category-${category.id}`} 
                                        class="ml-2 text-gray-700"
                                    >
                                        {category.name} ({category.count})
                                    </label>
                                </div>
                            {/each}
                        </div>
                    </div>
                    
                    <!-- Price Range -->
                    <div class="mb-6">
                        <h3 class="font-bold mb-3">Price Range</h3>
                        <div class="grid grid-cols-2 gap-3">
                            <div>
                                <label class="block text-sm text-gray-500 mb-1">Min Price</label>
                                <input 
                                    type="number" 
                                    bind:value={minPrice}
                                    placeholder="Min"
                                    class="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    on:input={applyFilters}
                                />
                            </div>
                            <div>
                                <label class="block text-sm text-gray-500 mb-1">Max Price</label>
                                <input 
                                    type="number" 
                                    bind:value={maxPrice}
                                    placeholder="Max"
                                    class="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    on:input={applyFilters}
                                />
                            </div>
                        </div>
                    </div>
                    
                    <!-- Stock Status -->
                    <div class="mb-6">
                        <h3 class="font-bold mb-3">Stock Status</h3>
                        <div class="space-y-2">
                            <div class="flex items-center">
                                <input 
                                    type="checkbox" 
                                    id="in-stock"
                                    bind:checked={inStockOnly}
                                    on:change={applyFilters}
                                    class="h-4 w-4 text-blue-600 rounded"
                                />
                                <label for="in-stock" class="ml-2 text-gray-700">In Stock Only</label>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Sale Items -->
                    <div class="mb-6">
                        <h3 class="font-bold mb-3">Special Offers</h3>
                        <div class="space-y-2">
                            <div class="flex items-center">
                                <input 
                                    type="checkbox" 
                                    id="on-sale"
                                    bind:checked={onSaleOnly}
                                    on:change={applyFilters}
                                    class="h-4 w-4 text-blue-600 rounded"
                                />
                                <label for="on-sale" class="ml-2 text-gray-700">On Sale Items</label>
                            </div>
                        </div>
                    </div>
                    
                    <button 
                        on:click={applyFilters}
                        class="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg"
                    >
                        Apply Filters
                    </button>
                </div>
            </div>
            
            <!-- Products Grid -->
            <div class="flex-grow">
                {#if isLoading}
                    <div class="flex justify-center items-center h-64">
                        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                {:else if error}
                    <div class="text-red-500 text-center p-8">Error: {error}</div>
                {:else if filteredProducts.length === 0}
                    <div class="bg-white rounded-xl shadow-md p-8 text-center">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h3 class="text-xl font-semibold mt-4">No products found</h3>
                        <p class="text-gray-600 mt-2">
                            Try adjusting your filters or search query
                        </p>
                        <button 
                            on:click={resetFilters}
                            class="mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg"
                        >
                            Reset Filters
                        </button>
                    </div>
                {:else}
                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {#each filteredProducts as product}
                            <ProductCard {product} />
                        {/each}
                    </div>
                    
                    <!-- Pagination -->
                    <div class="mt-8 flex justify-center">
                        <nav class="flex items-center gap-2">
                            <button class="px-3 py-2 rounded-md bg-white border border-gray-300 hover:bg-gray-50">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            
                            <button class="px-4 py-2 rounded-md bg-blue-600 text-white font-medium">1</button>
                            <button class="px-4 py-2 rounded-md bg-white border border-gray-300 hover:bg-gray-50">2</button>
                            <button class="px-4 py-2 rounded-md bg-white border border-gray-300 hover:bg-gray-50">3</button>
                            
                            <button class="px-3 py-2 rounded-md bg-white border border-gray-300 hover:bg-gray-50">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </nav>
                    </div>
                {/if}
            </div>
        </div>
    </div>
</div>

<style>
    /* Custom scrollbar for categories */
    .overflow-y-auto::-webkit-scrollbar {
        width: 6px;
    }
    
    .overflow-y-auto::-webkit-scrollbar-track {
        background: #f1f1f1;
        border-radius: 10px;
    }
    
    .overflow-y-auto::-webkit-scrollbar-thumb {
        background: #c5c5c5;
        border-radius: 10px;
    }
    
    .overflow-y-auto::-webkit-scrollbar-thumb:hover {
        background: #a8a8a8;
    }
</style>
