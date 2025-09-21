<!-- src/pages/CartPage.svelte -->
<script>
// @ts-nocheck

    import { cart, updateCartItem, removeCartItem } from '../lib/stores';
    import { onMount } from 'svelte';
    import { router } from '../router';
    
    let isLoading = false;
    let error = null;
    
    // Handle quantity changes
    const handleQuantityChange = async (key, quantity) => {
        if (quantity < 1) return;
        try {
            isLoading = true;
            await updateCartItem(key, quantity);
        } catch (err) {
            error = err.message || "Failed to update cart";
        } finally {
            isLoading = false;
        }
    };
    
    // Handle item removal
    const handleRemoveItem = async (key) => {
        try {
            isLoading = true;
            await removeCartItem(key);
        } catch (err) {
            error = err.message || "Failed to remove item";
        } finally {
            isLoading = false;
        }
    };
</script>

<div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-8">Your Shopping Cart</h1>
    
    {#if $cart.isLoading || isLoading}
        <div class="flex justify-center items-center h-64">
            <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
    {:else if $cart.items_count === 0}
        <div class="text-center py-16">
            <h2 class="text-2xl font-semibold mb-4">Your cart is empty</h2>
            <button 
                on:click={() => router.navigate('/')}
                class="inline-block bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700"
            >
                Continue Shopping
            </button>
        </div>
    {:else}
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div class="lg:col-span-2">
                <div class="bg-white rounded-lg shadow-md overflow-hidden">
                    <div class="divide-y divide-gray-200">
                        {#each $cart.items as item}
                            <div class="p-6 flex flex-col sm:flex-row items-center">
                                <div class="flex-shrink-0 w-24 h-24 bg-gray-200 rounded-lg overflow-hidden">
                                    {#if item.image}
                                        <img src={item.image.src} alt={item.name} class="w-full h-full object-cover" />
                                    {:else}
                                        <div class="w-full h-full flex items-center justify-center text-gray-500">
                                            No image
                                        </div>
                                    {/if}
                                </div>
                                
                                <div class="mt-4 sm:mt-0 sm:ml-6 flex-grow">
                                    <h3 class="text-lg font-medium">{item.name}</h3>
                                    <p class="mt-1 text-gray-600">${item.price}</p>
                                </div>
                                
                                <div class="mt-4 sm:mt-0 flex items-center">
                                    <button 
                                        on:click={() => handleQuantityChange(item.key, item.quantity - 1)}
                                        class="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-l-md"
                                        disabled={item.quantity <= 1}
                                    >
                                        -
                                    </button>
                                    <input 
                                        type="number" 
                                        min="1" 
                                        value={item.quantity}
                                        on:change={(e) => handleQuantityChange(item.key, parseInt(e.target.value) || 1)}
                                        class="w-12 h-8 text-center border-t border-b border-gray-200"
                                    />
                                    <button 
                                        on:click={() => handleQuantityChange(item.key, item.quantity + 1)}
                                        class="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-r-md"
                                    >
                                        +
                                    </button>
                                    
                                    <button 
                                        on:click={() => handleRemoveItem(item.key)}
                                        class="ml-4 text-red-600 hover:text-red-800"
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        {/each}
                    </div>
                </div>
            </div>
            
            <div>
                <div class="bg-white rounded-lg shadow-md p-6">
                    <h2 class="text-xl font-semibold mb-4">Order Summary</h2>
                    <div class="space-y-4">
                        <div class="flex justify-between">
                            <span>Subtotal</span>
                            <span>${$cart.total}</span>
                        </div>
                        <div class="flex justify-between">
                            <span>Shipping</span>
                            <span>Calculated at checkout</span>
                        </div>
                        <div class="flex justify-between border-t border-gray-200 pt-4">
                            <span class="font-medium">Total</span>
                            <span class="font-bold">${$cart.total}</span>
                        </div>
                    </div>
                    
                    <button 
                        class="mt-6 w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700"
                        on:click={() => router.navigate('/checkout')}
                    >
                        Proceed to Checkout
                    </button>
                    
                    <div class="mt-4 text-center">
                        <button on:click={() => router.navigate('/')} class="text-blue-600 hover:underline">
                            Continue Shopping
                        </button>
                    </div>
                </div>
            </div>
        </div>
    {/if}
</div>