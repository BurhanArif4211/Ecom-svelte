<!-- /components/ProductCard.svelte -->
<script>
// @ts-nocheck

    import { addToCart } from "../lib/stores";

    export let product;
</script>

<div class="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 h-full flex flex-col">
    {#if product.images[0]}
        <img 
            src={product.images[0].src} 
            alt={product.name}
            class="w-full h-60 object-cover"
        />
    {:else}
        <div class="bg-gray-200 border-2 border-dashed w-full h-60 flex items-center justify-center">
            <span class="text-gray-500">No image</span>
        </div>
    {/if}
    
    <div class="p-4 flex-grow flex flex-col">
        <h3 class="font-semibold text-lg mb-2">{product.name}</h3>
        <div class="mt-auto">
            <div class="flex justify-between items-center">
                <span class="text-xl font-bold text-gray-900">
                    ${product.price}
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
