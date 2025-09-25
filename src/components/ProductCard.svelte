<!-- /components/ProductCard.svelte -->
<script>
// @ts-nocheck

    import { addToCart } from "../lib/stores";
    import { router } from "../router";

    export let product;
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div onclick={router.navigate(`/product/${product.id}`)} class="bg-gray-900 rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 h-full flex flex-col">
    {#if product.images[0]}
        <img 
            src={product.images[0].src}
            alt={product.name}
            class="w-full h-60 object-cover"
        />
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
            
            <button onclick={addToCart(product.id)} class="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors">
                Add to Cart
            </button>
        </div>
    </div>
</div>
