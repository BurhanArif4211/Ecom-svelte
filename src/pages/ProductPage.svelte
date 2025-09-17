<!-- src/pages/ProductPage.svelte -->
<script>
    import { onMount } from 'svelte';
    import { fetchProduct, addToCart } from '../lib/stores';
    import { router } from '../router';
    
    export let productId;
    
    let product = null;
    let isLoading = true;
    let error = null;
    let selectedQuantity = 1;
    
    // Fetch product data
    onMount(async () => {
        try {
            product = await fetchProduct(productId);
        } catch (err) {
            error = err.message || "Failed to load product";
            console.error('Product load error:', err);
        } finally {
            isLoading = false;
        }
    });
    
    // Handle add to cart
    const handleAddToCart = async () => {
        try {
            await addToCart(product.id, selectedQuantity);
        } catch (err) {
            error = err.message || "Failed to add item to cart";
        }
    };
</script>

<div class="container mx-auto px-4 py-8">
    {#if isLoading}
        <div class="flex justify-center items-center h-64">
            <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
    {:else if error}
        <div class="text-red-500 text-center p-8">Error: {error}</div>
    {:else if product}
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <!-- Product Images -->
            <div>
                <div class="bg-gray-100 rounded-lg overflow-hidden">
                    {#if product.images && product.images[0]}
                        <img 
                            src={product.images[0].src} 
                            alt={product.name}
                            class="w-full h-auto object-contain"
                        />
                    {:else}
                        <div class="w-full h-96 flex items-center justify-center text-gray-500">
                            No image available
                        </div>
                    {/if}
                </div>
            </div>
            
            <!-- Product Details -->
            <div>
                <h1 class="text-3xl font-bold mb-4">{product.name}</h1>
                
                <div class="mb-6">
                    <span class="text-2xl font-bold text-gray-900">
                        ${parseFloat(product.prices.price) / 100}
                    </span>
                    {#if product.on_sale}
                        <span class="ml-2 bg-red-100 text-red-800 text-sm px-2 py-1 rounded">
                            Sale
                        </span>
                    {/if}
                </div>
                
                <div class="mb-6">
                    <div class="flex items-center mb-4">
                        <label for="quantity" class="mr-4 font-medium">Quantity:</label>
                        <input 
                            type="number" 
                            id="quantity" 
                            min="1" 
                            bind:value={selectedQuantity}
                            class="w-20 px-3 py-2 border border-gray-300 rounded"
                        />
                    </div>
                    
                    <button 
                        on:click={handleAddToCart}
                        class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300"
                    >
                        Add to Cart
                    </button>
                </div>
                
                <div class="prose max-w-none" innerHTML={product.description} />
            </div>
        </div>
    {:else}
        <div class="text-center py-16">
            <h2 class="text-2xl font-semibold mb-4">Product not found</h2>
            <button 
                on:click={() => router.navigate('/')}
                class="inline-block bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700"
            >
                Continue Shopping
            </button>
        </div>
    {/if}
</div>