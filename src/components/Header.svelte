<script>
    import { cart } from "../lib/stores";
    import { router } from "../router";

    import CartModal from "./CartModal.svelte";
    let showCartModal;

</script>
<header class="sticky top-0 z-50 bg-gray-900 shadow-md">
    <div class="container mx-auto px-4 py-4 flex justify-between items-center">
        <div>
            <img src="/logo_w.png" class="w-18 h-18 cursor-pointer" 
                onclick={() => router.navigate('/home')}/>
        </div>
        <nav class="hidden md:block">
            <ul class="flex space-x-6">
                <li>
                    <a href="/home" class="font-medium text-white hover:text-blue-600" 
                       onclick={() => router.navigate('/home')}>
                        Home
                    </a>
                </li>
                <li>
                    <a href="/products" class="font-medium text-white hover:text-blue-600"
                       onclick={() => router.navigate('/products')}>
                        Products
                    </a>
                </li>
                <li>
                    <a href="/cart" class="font-medium text-white hover:text-blue-600"
                            onclick={() => router.navigate('/cart')}>
                        Cart
                    </a>
                </li>
            </ul>
        </nav>
        <div class="flex items-center space-x-4">
            <!-- Search Button -->
            <button class="p-2" onclick={() => router.navigate('/products')}>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            </button>
            
            <!-- Cart Button -->
            <button class="relative p-2" onclick={() => showCartModal = true}>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {#if $cart?.items_count > 0}
                <span class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {$cart.items_count}
                </span>
                {/if}
            </button>
        </div>
    </div>
</header>
{#if showCartModal}
<CartModal onClose={() => showCartModal = false} />
{/if}