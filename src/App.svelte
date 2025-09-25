<!-- src/App.svelte -->
<script>
    import { onMount } from "svelte";
    import { router } from "./router";
    import { cart, fetchCart } from "./lib/stores";
    import Header from "./components/Header.svelte";
    import Footer from "./components/Footer.svelte";
    
    let currentComponent = null;
    let routeParams = {};
    let routeData = null;
    let loading = true;
    let error = null;
    
    onMount(() => {
        // Initialize router
        router.init();
        fetchCart();
        // Subscribe to router changes
        const unsubscribe = router.subscribe((value) => {
            currentComponent = value.component;
            routeParams = value.params;
            routeData = value.routeData;
            loading = value.loading;
            error = value.error;
        });

        return unsubscribe;
    });
</script>

<svelte:head>
    <title>AutoGearLift</title>
    <meta name="description" content="Shop our amazing collection of products with fast delivery and great prices" />
</svelte:head>

<div class="min-h-screen flex flex-col">
    <!-- Header -->
   <Header/>

    <!-- Main Content -->
    <main class="flex-grow">
        {#if loading}
            <div class="flex justify-center items-center h-64">
                <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        {:else if error}
            <div class="container mx-auto px-4 py-8">
                <div class="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                    <h2 class="text-xl font-bold text-red-800 mb-2">Error</h2>
                    <p class="text-red-600">{error}</p>
                    <button 
                        onclick={() => router.navigate('/home')}
                        class="mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg"
                    >
                        Go Home
                    </button>
                </div>
            </div>
        {:else if currentComponent}
            <svelte:component
                this={currentComponent}
                params={routeParams}
                data={routeData}
                router={router}
            />
        {/if}
    </main>

    <!-- Footer -->
    <Footer/>
</div>

<!-- <script>

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
    <header class="sticky top-0 z-50 bg-white shadow-md">
        <div class="container mx-auto px-4 py-4 flex justify-between items-center">
            <div>
                <h1 class="text-2xl font-bold text-blue-600 cursor-pointer" onclick={() => router.navigate('/')}>ShopSvelte</h1>
            </div>
            <nav class="hidden md:block">
                <ul class="flex space-x-6">
                    <li><a href="/" class="font-medium hover:text-blue-600">Home</a></li>
                    <li><a href="/products" class="font-medium hover:text-blue-600">Products</a></li>
                    <li><a href="/categories" class="font-medium hover:text-blue-600">Categories</a></li>
                </ul>
            </nav>
            <div class="flex items-center space-x-4">
                <button class="relative p-2" onclick={() => showCartModal = true}>
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

    {#if showCartModal}
        <CartModal onClose={() => showCartModal = false} />
    {/if}
</main> -->