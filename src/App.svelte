<!-- src/App.svelte -->
<script>
    import { onMount } from "svelte";
    import { router } from "./router";
    import { cart, fetchCart } from "./lib/stores";
    import Header from "./components/Header.svelte";
    import Footer from "./components/Footer.svelte";
    import SocialMediaButtons from "./components/SocialMediaButtons.svelte";
    
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
                <!-- <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div> -->
                <div class="animate-spin"><img src="/wheel.png" class="w-30 object-fill" alt="loading spinning wheel"></div>
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
    <SocialMediaButtons />
    <!-- Footer -->
    <Footer/>
</div>
