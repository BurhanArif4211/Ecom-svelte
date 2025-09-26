<!-- /components/ProductCard.svelte -->
<script>
// @ts-nocheck
    import { addToCart } from "../lib/stores";
    import { router } from "../router";
    import { fly, scale } from 'svelte/transition';
    import { tick } from 'svelte';
    export let product;
    let adding = false;

    async function handleAddToCart(event) {
        event.stopPropagation();
        adding = true;
        addToCart(product.id);
        await tick();
        setTimeout(() => adding = false, 700);
    }

    function handleCardClick() {
        router.navigate(`/product/${product.id}`);
    }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
    on:click={handleCardClick}
    class="bg-gray-900 rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 h-full flex flex-col cursor-pointer"
>
    {#if product.images[0]}
        <img
            src={product.images[0].src}
            alt={product.name}
            class="w-full h-60 object-cover"/>
    {:else}
        <div class="bg-gray-800 border-2 border-dashed w-full h-60 flex items-center justify-center">
            <span class="text-gray-500">No image</span>
        </div>
    {/if}
    
    <div class="p-4 flex-grow flex flex-col">
        <h3 class="text-white font-semibold text-lg mb-2">{product.name.split(" ").slice(0,15).join(' ')}...</h3>
        <div class="mt-auto">
            <div class="flex justify-between items-center">
                <span class="text-xl font-bold text-gray-100">
                    {product.prices.currency_prefix} {product.prices.price}
                </span>
                {#if product.on_sale}
                    <span class="bg-red-100 text-red-800 text-sm px-2 py-1 rounded">
                        Sale
                    </span>
                {/if}
            </div>
            
            <button
                class="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors relative overflow-hidden"
                on:click|stopPropagation={handleAddToCart}
                disabled={adding}>
                <span class:opacity-0={adding}>Add to Cart</span>
                {#if adding}
                    <span
                        class="absolute inset-0 flex items-center justify-center"
                        in:scale={{ duration: 200 }}
                        out:fly={{ y: 20, duration: 300 }}>
                        <svg class="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                        </svg>
                    </span>
                {/if}
            </button>
        </div>
    </div>
</div>
