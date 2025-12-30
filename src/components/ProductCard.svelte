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
            class="w-full aspect-square object-fit"/>
    {:else}
        <div class="bg-gray-800 border-2 border-dashed w-full h-60 flex items-center justify-center">
            <span class="text-gray-500">No image</span>
        </div>
    {/if}
    <div class="sm:p-4 p-1 flex-grow flex flex-col">
        <h3 class="text-white sm:font-semibold sm:text-lg  font-bold text-[10px] mb-0">{product.name.split(" ").slice(0,15).join(' ')}...</h3>
        {#if product.on_sale}
        <span class="bg-red-100 text-red-800 text-[10px] text-right px-2 w-fit rounded ">
            Sale
        </span>
    {/if}
        <div class="mt-auto">
            <div class="flex justify-between items-center">
                <span class=" font-bold text-gray-100">
                    {product.prices.currency_prefix} {product.prices.price}
                </span>
                {#if product.prices.regular_price !== product.prices.price}
                <span>
                    <div style=" text-decoration-line: line-through;" class=" font-black text-sm text-gray-400">{product.prices.currency_prefix} {product.prices.regular_price}</div>
                </span>
                {/if}

            </div>
            
            <button
                class="text-[12px] w-full border-blue-600 border-2 bg-transparent hover:bg-blue-600 text-white py-1 px-4 rounded-lg transition-colors relative overflow-hidden"
                on:click|stopPropagation={handleAddToCart}
                disabled={adding}>
                <span class:opacity-0={adding}>Add to Cart</span>
                {#if adding}
                    <span
                        class="absolute inset-0 flex items-center justify-center"
                        in:scale={{ duration: 200 }}
                        out:fly={{ y: 20, duration: 300 }}>
                        <img src="/wheel.png" alt="" class="w-6 h-6">
                    </span>
                {/if}
            </button>
        </div>
    </div>
</div>
