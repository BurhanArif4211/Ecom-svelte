<!-- src/pages/ProductPage.svelte -->
<script>
    import { onMount } from 'svelte';
    import { addToCart } from '../lib/stores';
    import ImageCarousel from './../components/ImageCarousel.svelte';
    import YouTubeEmbed from './../components/YoutubeEmbed.svelte';
    
    export let data; // From router
    export let router;
    
    let product = data;
    let selectedQuantity = 1;
    let error = null;
    let activeTab = 'description';
    let selectedImageIndex = 0;
    
    // Extract YouTube URL from short_description
    const extractYouTubeUrl = () => {
        if (!product?.short_description) return null;
        
        // Extract URL from anchor tag
        const urlMatch = product.short_description.match(/<a[^>]*>([^<]+)<\/a>/);
        if (urlMatch && urlMatch[1]) {
            return urlMatch[1].trim();
        }
        return null;
    };
    
    const youtubeUrl = extractYouTubeUrl();
    
    // Handle add to cart
    const handleAddToCart = async () => {
        try {
            await addToCart(product.id, selectedQuantity);
        } catch (err) {
            error = err.message || "Failed to add item to cart";
        }
    };
    
    // Format price
    const formatPrice = (price) => {
        if (!price || !product.prices) return '';
        return `${product.prices.currency_prefix}${(parseFloat(price)).toFixed(2)}`;
    };
    
    // Navigate to category
    const navigateToCategory = (category) => {
        router.navigate(`/products?category=${category.slug}`);
    };
</script>

<div class="min-h-screen bg-black py-8">
    <div class="container mx-auto px-4">
        <!-- Breadcrumb -->
        <nav class="mb-6 text-sm overflow-scroll sm:overflow-hidden">
            <ol class="flex items-center space-x-2 text-gray-200">
                <li>
                    <a href="/home" class="hover:text-blue-600" 
                       onclick={() => router.navigate('/home')}>
                        Home
                    </a>
                </li>
                <li class="flex items-center">
                    <span class="mx-2">/</span>
                    <a href="/products" class="hover:text-blue-600"
                       onclick={() => router.navigate('/products')}>
                        Products
                    </a>
                </li>
                {#if product.categories && product.categories.length > 0}
                    <li class="flex items-center">
                        <span class="mx-2">/</span>
                        <a href="" class="hover:text-blue-600"
                           onclick={() => navigateToCategory(product.categories[0])}>
                            {product.categories[0].name}
                        </a>
                    </li>
                {/if}
                <li class="flex items-center ">
                    <span class="mx-2">/</span>
                    <span class=" text-nowrap">{product.name.split(" ").slice("0","15").join(" ")}</span>
                </li>
            </ol>
        </nav>
        
        {#if product}
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                <!-- Left Column - Images and Video -->
                <div class="space-y-6">
                    <!-- Image Carousel -->
                    <div class="bg-gray-900 rounded-xl shadow-md overflow-hidden">
                        <ImageCarousel 
                            images={product.images} 
                            bind:selectedIndex={selectedImageIndex}
                        />
                    </div>
                    
                    <!-- YouTube Video -->
                    {#if youtubeUrl}
                        <div class="bg-gray-900 rounded-xl shadow-md p-2 pt-3">
                            <h3 class="text-white text-lg font-semibold mb-4">Product Video</h3>
                            <YouTubeEmbed url={youtubeUrl} />
                        </div>
                    {/if}
                </div>
                
                <!-- Right Column - Product Details -->
                <div class="space-y-6">
                    <!-- Product Header -->
                    <div class="bg-gray-900 rounded-xl shadow-md p-2">
                        <h1 class="text-lg font-bold text-gray-200 mb-4">
                            {product.name}
                        </h1>
                        
                        <div class="flex items-left flex-col justify-between mb-4">
                            <div class="flex items-center space-x-4">
                                <span class="text-4xl font-bold text-white text-shadow-amber-500">
                                    {formatPrice(product.prices.price)}
                                </span>
                                
                            </div>
                            {#if product.on_sale && product.prices.regular_price !== product.prices.price}
                                    <span class="text-lg text-gray-300 line-through">
                                        {formatPrice(product.prices.regular_price)}
                                    </span>
                                    <span class="bg-red-100 text-red-800 text-sm px-2 py-1 rounded">
                                        Save {formatPrice(parseFloat(product.prices.regular_price) - parseFloat(product.prices.price))}
                                    </span>
                                {/if}
                            <!-- Stock Status -->
                            <!-- <div class={`px-3 py-1 rounded-full text-sm font-medium ${
                                product.is_in_stock 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-red-100 text-red-800'
                            }`}>
                                {product.is_in_stock ? 'In Stock' : 'Out of Stock'}
                            </div> -->
                        </div>
                        
                        <!-- SKU and Categories -->
                        <div class="flex flex-wrap gap-4 mb-6 text-sm text-gray-300">
                            {#if product.sku}
                                <div>
                                    <span class="font-medium">SKU:</span> {product.sku}
                                </div>
                            {/if}
                            {#if product.categories && product.categories.length > 0}
                                <div class="flex items-center space-x-2">
                                    <span class="font-medium">Categories:</span>
                                    <div class="flex flex-wrap gap-1">
                                        {#each product.categories as category}
                                            <button 
                                                onclick={() => navigateToCategory(category)}
                                                class="text-blue-200 hover:text-blue-500 hover:underline border-2 border-blue-200 rounded-2xl px-3"
                                            >
                                                {category.name}
                                            </button>
                                            
                                        {/each}
                                    </div>
                                </div>
                            {/if}
                        </div>
                        
                        <!-- Add to Cart Section -->
                        <div class="border-t text-gray-300 border-gray-200 pt-6">
                            <div class="flex items-center space-x-4 mb-6">
                                <label for="quantity" class="font-medium ">Quantity:</label>
                                <div class="flex items-center border border-gray-300 rounded-lg">
                                    <!-- svelte-ignore a11y_consider_explicit_label -->
                                    <button 
                                        onclick={() => selectedQuantity > 1 && selectedQuantity--}
                                        class="w-10 h-10 flex items-center justify-center text-white hover:text-gray-800 disabled:opacity-50"
                                        disabled={selectedQuantity <= 1}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
                                        </svg>
                                    </button>
                                    <input 
                                        type="tel" 
                                        id="quantity"
                                        min="1"
                                        max="5"
                                        bind:value={selectedQuantity}
                                        class="w-16 h-10 text-center border-x border-gray-300 focus:outline-none"
                                    />
                                    <!-- svelte-ignore a11y_consider_explicit_label -->
                                    <button 
                                        onclick={() => selectedQuantity++}
                                        class="w-10 h-10 flex items-center justify-center text-white hover:text-gray-800"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                            
                            <button 
                                onclick={handleAddToCart}
                                disabled={!product.is_in_stock}
                                class="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-lg transition duration-300 flex items-center justify-center"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                {product.is_in_stock ? 'Add to Cart' : 'Out of Stock'}
                            </button>
                            
                            {#if error}
                                <div class="mt-4 text-red-600 text-sm">{error}</div>
                            {/if}
                        </div>
                    </div>
                    
                    <!-- Product Tabs -->
                    <div class="bg-gray-900 rounded-xl shadow-md">
                        <!-- Tab Headers -->
                        <div class="border-b border-gray-200">
                            <nav class="flex space-x-8 px-6">
                                <button 
                                    class={`py-4 px-1 border-b-2 font-medium text-sm ${
                                        activeTab === 'description' 
                                            ? 'border-white text-white' 
                                            : 'border-transparent text-gray-500 hover:text-blue-700 hover:border-gray-300'
                                    }`}
                                    onclick={() => activeTab = 'description'}
                                >
                                    Description
                                </button>
                                {#if product.tags && product.tags.length > 0}
                                    <button 
                                        class={`py-4 px-1 border-b-2 font-medium text-sm ${
                                            activeTab === 'tags' 
                                                ? 'border-white text-white' 
                                                : 'border-transparent text-gray-500 hover:text-blue-700 hover:border-gray-300'
                                        }`}
                                        onclick={() => activeTab = 'tags'}
                                    >
                                        Tags
                                    </button>
                                {/if}
                                {#if product.attributes && product.attributes.length > 0}
                                    <button 
                                        class={`py-4 px-1 border-b-2 font-medium text-sm ${
                                            activeTab === 'specifications' 
                                                ? 'border-white text-white' 
                                                : 'border-transparent text-gray-500 hover:text-blue-700 hover:border-gray-300'
                                        }`}
                                        onclick={() => activeTab = 'specifications'}
                                    >
                                        Specifications
                                    </button>
                                {/if}
                            </nav>
                        </div>
                        
                        <!-- Tab Content -->
                        <div class="p-2">
                            {#if activeTab === 'description'}
                                <div class="prose text-white max-w-none">
                                    {@html product.description}
                                </div>
                            {:else if activeTab === 'tags' && product.tags}
                                <div class="flex flex-wrap gap-2">
                                    {#each product.tags as tag}
                                        <span class="bg-gray-700 text-gray-200 px-3 py-1 rounded-full text-sm">
                                            {tag.name}
                                        </span>
                                    {/each}
                                </div>
                            {:else if activeTab === 'specifications' && product.attributes}
                                <div class="space-y-4">
                                    {#each product.attributes as attribute}
                                        <div class="border-b border-gray-200 pb-4 last:border-b-0">
                                            <h4 class="font-semibold text-gray-100 mb-2">{attribute.name}</h4>
                                            <div class="text-gray-600">
                                                {#if attribute.options}
                                                    {attribute.options.join(', ')}
                                                {:else}
                                                    N/A
                                                {/if}
                                            </div>
                                        </div>
                                    {/each}
                                </div>
                            {/if}
                        </div>
                    </div>
                </div>
            </div>
        {:else}
            <div class="bg-gray-900 text-center py-16">
                <h2 class="text-2xl font-semibold mb-4">Product not found</h2>
                <button 
                    onclick={() => router.navigate('/products')}
                    class="inline-block bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700"
                >
                    Continue Shopping
                </button>
            </div>
        {/if}
    </div>
</div>

<style>
    .prose {
        font-size: 0.8rem;
        line-height: 1.6;
    }
    
    .prose p {
        margin-bottom: 1rem;
    }
    
    .prose ul, .prose ol {
        margin-bottom: 1rem;
        padding-left: 1.5rem;
    }
    
    .prose li {
        margin-bottom: 0.5rem;
    }
    
    .prose strong {
        font-weight: 600;
    }
    
    .prose em {
        font-style: italic;
    }
</style>
