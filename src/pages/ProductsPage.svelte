<!-- src/pages/ProductsPage.svelte -->
<script>
    import { onMount } from 'svelte';
    import ProductCard from '../components/ProductCard.svelte';
    import Pagination from '../components/Pagination.svelte';
    
    export let data; // From router
    export let router;
    
    let {
        products = [],
        categories = [],
        pagination = {},
        filters = {},
        currentCategory = null
    } = data || {};
    
    let showFilters = false;
    let localFilters = { ...filters };
    
    // Initialize local filters from router data
    onMount(() => {
        localFilters = { ...filters };
    });
    
    // Update URL with new filters
    const updateURL = (newFilters = {}) => {
        const queryParams = new URLSearchParams();
        
        // Add all active filters
        Object.entries(newFilters).forEach(([key, value]) => {
            if (value && value !== '') {
                if (key === 'on_sale' || key === 'in_stock') {
                    queryParams.set(key, value.toString());
                } else {
                    queryParams.set(key, value);
                }
            }
        });
        
        // Reset to page 1 when filters change
        queryParams.set('page', '1');
        
        const queryString = queryParams.toString();
        const basePath = currentCategory ? `/category/${currentCategory.slug}` : '/products';
        const newURL = queryString ? `${basePath}?${queryString}` : basePath;
        
        router.navigate(newURL);
    };
    
    // Handle filter changes
    const handleFilterChange = (key, value) => {
        localFilters[key] = value;
    };
    
    const applyFilters = () => {
        updateURL(localFilters);
    };
    
    const resetFilters = () => {
        localFilters = {
            search: '',
            category: '',
            min_price: '',
            max_price: '',
            on_sale: false,
            in_stock: false,
            orderby: 'date',
            order: 'desc'
        };
        updateURL(localFilters);
    };
    
    // Handle search
    const handleSearch = (event) => {
        if (event.key === 'Enter' || event.type === 'click') {
            updateURL({ ...localFilters, search: localFilters.search });
        }
    };
    
    // Handle pagination
    const handlePageChange = (page) => {
        const queryParams = new URLSearchParams(window.location.search);
        queryParams.set('page', page.toString());
        
        const basePath = currentCategory ? `/category/${currentCategory.slug}` : '/products';
        const newURL = `${basePath}?${queryParams.toString()}`;
        
        router.navigate(newURL);
    };
    
    // Format price for display
    const formatPrice = (price) => {
        if (!price) return '';
        return (parseFloat(price) / 100).toFixed(2);
    };
</script>

<div class="min-h-screen bg-gray-50 py-8">
    <div class="container mx-auto px-4">
        <!-- Page Header -->
        <div class="mb-8">
            <h1 class="text-3xl font-bold text-gray-900">
                {#if currentCategory}
                    {currentCategory.name}
                {:else}
                    {localFilters.search ? `Search Results for "${localFilters.search}"` : 'All Products'}
                {/if}
            </h1>
            <p class="text-gray-600 mt-2">
                {#if currentCategory}
                    {pagination.totalItems} products found in {currentCategory.name}
                {:else if localFilters.search}
                    {pagination.totalItems} products found for "{localFilters.search}"
                {:else}
                    {pagination.totalItems} products available
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
                        bind:value={localFilters.search}
                        placeholder="Search products..."
                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 pr-12"
                        on:keypress={(e) => e.key === 'Enter' && handleSearch(e)}
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
            <div class="w-full md:w-48">
                <select 
                    bind:value={localFilters.orderby}
                    on:change={applyFilters}
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                >
                    <option value="date">Sort by: Newest</option>
                    <option value="price">Sort by: Price</option>
                    <option value="popularity">Sort by: Popularity</option>
                    <option value="rating">Sort by: Rating</option>
                    <option value="title">Sort by: Name</option>
                </select>
            </div>
            
            <!-- Order Toggle -->
            <button 
                on:click={() => {
                    localFilters.order = localFilters.order === 'asc' ? 'desc' : 'asc';
                    applyFilters();
                }}
                class="w-full md:w-auto bg-white border border-gray-300 rounded-lg px-4 py-3 hover:bg-gray-50 flex items-center justify-center"
            >
                <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    class="h-5 w-5 transform transition-transform" 
                    class:rotate-180={localFilters.order === 'asc'}
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
                </svg>
                <span class="ml-2">{localFilters.order === 'asc' ? 'Ascending' : 'Descending'}</span>
            </button>
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
                            Reset All
                        </button>
                    </div>
                    
                    <!-- Categories -->
                    <div class="mb-6">
                        <h3 class="font-bold mb-3">Categories</h3>
                        <div class="space-y-2 max-h-60 overflow-y-auto">
                            {#each categories as cat}
                                <div class="flex items-center">
                                    <input 
                                        type="radio" 
                                        id={`category-${cat.id}`}
                                        name="category"
                                        checked={localFilters.category === cat.id.toString()}
                                        on:change={() => handleFilterChange('category', cat.id.toString())}
                                        class="h-4 w-4 text-blue-600 rounded"
                                    />
                                    <label 
                                        for={`category-${cat.id}`} 
                                        class="ml-2 text-gray-700 flex justify-between w-full"
                                    >
                                        <span>{cat.name}</span>
                                        <span class="text-gray-400 text-sm">({cat.count || 0})</span>
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
                                    bind:value={localFilters.min_price}
                                    placeholder="0"
                                    class="w-full px-3 py-2 border border-gray-300 rounded-md"
                                />
                            </div>
                            <div>
                                <label class="block text-sm text-gray-500 mb-1">Max Price</label>
                                <input 
                                    type="number" 
                                    bind:value={localFilters.max_price}
                                    placeholder="1000"
                                    class="w-full px-3 py-2 border border-gray-300 rounded-md"
                                />
                            </div>
                        </div>
                    </div>
                    
                    <!-- Stock Status -->
                    <div class="mb-6">
                        <h3 class="font-bold mb-3">Availability</h3>
                        <div class="space-y-2">
                            <div class="flex items-center">
                                <input 
                                    type="checkbox" 
                                    id="in-stock"
                                    bind:checked={localFilters.in_stock}
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
                                    bind:checked={localFilters.on_sale}
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
                {#if products.length === 0}
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
                    <!-- Active Filters -->
                    <div class="flex flex-wrap gap-2 mb-6">
                        {#if localFilters.search}
                            <span class="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center">
                                Search: "{localFilters.search}"
                                <button 
                                    on:click={() => {
                                        localFilters.search = '';
                                        applyFilters();
                                    }}
                                    class="ml-2 hover:text-blue-600"
                                >
                                    ×
                                </button>
                            </span>
                        {/if}
                        
                        {#if localFilters.category}
                            {#if categories.find(c => c.id.toString() === localFilters.category)}
                                <span class="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm flex items-center">
                                    Category: {categories.find(c => c.id.toString() === localFilters.category).name}
                                    <button 
                                        on:click={() => {
                                            localFilters.category = '';
                                            applyFilters();
                                        }}
                                        class="ml-2 hover:text-green-600"
                                    >
                                        ×
                                    </button>
                                </span>
                            {/if}
                        {/if}
                        
                        {#if localFilters.min_price || localFilters.max_price}
                            <span class="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm flex items-center">
                                Price: ${localFilters.min_price || '0'} - ${localFilters.max_price || '∞'}
                                <button 
                                    on:click={() => {
                                        localFilters.min_price = '';
                                        localFilters.max_price = '';
                                        applyFilters();
                                    }}
                                    class="ml-2 hover:text-purple-600"
                                >
                                    ×
                                </button>
                            </span>
                        {/if}
                        
                        {#if localFilters.on_sale}
                            <span class="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm flex items-center">
                                On Sale
                                <button 
                                    on:click={() => {
                                        localFilters.on_sale = false;
                                        applyFilters();
                                    }}
                                    class="ml-2 hover:text-red-600"
                                >
                                    ×
                                </button>
                            </span>
                        {/if}
                        
                        {#if localFilters.in_stock}
                            <span class="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm flex items-center">
                                In Stock
                                <button 
                                    on:click={() => {
                                        localFilters.in_stock = false;
                                        applyFilters();
                                    }}
                                    class="ml-2 hover:text-green-600"
                                >
                                    ×
                                </button>
                            </span>
                        {/if}
                    </div>
                    
                    <!-- Products Grid -->
                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {#each products as product}
                            <ProductCard 
                                {product} 
                                on:click={() => router.navigate(`/product/${product.id}`)}
                            />
                        {/each}
                    </div>
                    
                    <!-- Pagination -->
                    {#if pagination.totalPages > 1}
                        <div class="mt-8">
                            <Pagination 
                                currentPage={pagination.currentPage}
                                totalPages={pagination.totalPages}
                                onPageChange={handlePageChange}
                            />
                        </div>
                    {/if}
                {/if}
            </div>
        </div>
    </div>
</div>