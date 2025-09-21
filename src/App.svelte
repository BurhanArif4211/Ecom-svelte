<!-- src/App.svelte -->
<script>

    import { onMount } from "svelte";
    import { router } from "./router.js";
    import HomePage from "./pages/HomePage.svelte";
    import ProductPage from "./pages/ProductPage.svelte";
    import CartPage from "./pages/CartPage.svelte";
    import CheckoutPage from "./pages/CheckoutPage.svelte";
    import NotFound from "./pages/NotFound.svelte";
    import CartModal from "./components/CartModal.svelte";
    import { cart, fetchCart } from "./lib/stores.js";

    // subscribe to { page, params }
    let page, params;
    let showCartModal = false;
    
    router.subscribe((r) => {
        page = r.page;
        params = r.params;
    });
    
    // Initialize session on app load
    onMount(async () => {
        await fetchCart();
    });
</script>

<main class="min-h-screen flex flex-col">
    <!-- Header -->
    <header class="sticky top-0 z-50 bg-white shadow-md">
        <div class="container mx-auto px-4 py-4 flex justify-between items-center">
            <div>
                <!-- svelte-ignore a11y_click_events_have_key_events -->
                <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
                <h1 class="text-2xl font-bold text-blue-600 cursor-pointer" on:click={() => router.navigate('/')}>ShopSvelte</h1>
            </div>
            <nav class="hidden md:block">
                <ul class="flex space-x-6">
                    <li><a href="/" class="font-medium hover:text-blue-600">Home</a></li>
                    <li><a href="/products" class="font-medium hover:text-blue-600">Products</a></li>
                    <li><a href="/categories" class="font-medium hover:text-blue-600">Categories</a></li>
                </ul>
            </nav>
            <div class="flex items-center space-x-4">
                <button class="relative p-2" on:click={() => showCartModal = true}>
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

    <!-- Main Content -->
    <div class="flex-grow">
        {#if page === "home"}
            <HomePage />
        {:else if page === "productPage"}
            <ProductPage productId={params.id} />
        {:else if page === "cartPage"}
            <CartPage />
        {:else if page === "checkoutPage"}
            <CheckoutPage />
        {:else}
            <NotFound />
        {/if}
    </div>

    <!-- Footer -->
    <footer class="bg-gray-900 text-white py-8">
        <!-- Footer content same as before -->
    </footer>

    <!-- Cart Modal -->
    {#if showCartModal}
        <CartModal onClose={() => showCartModal = false} />
    {/if}
</main>