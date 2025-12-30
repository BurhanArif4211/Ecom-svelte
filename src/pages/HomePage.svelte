<!-- src/pages/HomePage.svelte -->
<script>
// @ts-nocheck

    import { onMount } from "svelte";
    import Carousel from "../components/Carousel.svelte";
    import HeroCarousel from "../components/HeroCarousel.svelte";
    import SalesCarousel from "../components/SalesCrousel.svelte";
    import ProductCard from "../components/ProductCard.svelte";
    import { router } from "../router";
    import CategoryCarousel from "../components/CategoryCarousel.svelte";

    // State management
    let productCategories = [];
    let products = [];
    let featuredProducts = [];
    let heroSlides = [];
    let salesSlides = [];
    let isLoading = true;
    let error = null;

    // Fetch data from WordPress REST API
    const fetchData = async () => {
        try {
            // Fetch all data in parallel
            const [featuredRes, categoriesRes, productsRes, heroRes, salesRes] =
                await Promise.all([
                    fetch(
                        "/wp/wp-json/wc/store/products?featured=true&per_page=8",
                    ),
                    fetch(
                        "/wp/wp-json/wc/store/products/categories?per_page=12&hide_empty=true",
                    ),
                    fetch(
                        "/wp/wp-json/wc/store/products?per_page=12&orderby=date&order=desc",
                    ),
                    fetch("/wp/wp-json/acf/v1/options/carouselslides"),
                    fetch("/wp/wp-json/acf/v1/options/salescarousel"),
                ]);

            featuredProducts = await featuredRes.json();
            productCategories = await categoriesRes.json();
            products = await productsRes.json();

            // Handle hero carousel data
            const heroData = await heroRes.json();
            heroSlides = heroData.success ? heroData.data : [];
            // console.log(heroSlides)

            // Handle sales carousel data
            const salesData = await salesRes.json();
            salesSlides = salesData.success ? salesData.data : [];
        } catch (err) {
            console.error("Error fetching data:", err);
            error = err.message;
        } finally {
            isLoading = false;
        }
    };

    onMount(fetchData);

    // Navigate to category
    const navigateToCategory = (categorySlug) => {
        router.navigate(`/products?category=${categorySlug}`);
    };

    // Navigate to products
    const navigateToProducts = (params = "") => {
        router.navigate(`/products${params}`);
        window.location = `/products${params}`
    };
</script>

<svelte:head>
    <title>Auto Gear Lift - Premium Automotive Parts & Accessories</title>
    <meta
        name="description"
        content="Shop the best automotive parts, LED lights, and accessories in Pakistan. Free shipping available on orders above ₨2000."
    />
    <meta
        name="keywords"
        content="auto parts, car accessories, LED lights, Pakistan, automotive, car modifications"
    />
    <link rel="canonical" href="https://autogearlift.com" />
</svelte:head>

{#if isLoading}
    <div class="flex justify-center items-center h-screen bg-black">
        <!-- <div class="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div> -->
        <div class="animate-spin">
            <img
                src="/wheel.png"
                class="w-30 object-fill"
                alt="loading spinning wheel"
            />
        </div>
    </div>
{:else if error}
    <div class="text-red-500 text-center p-8 bg-black">Error: {error}</div>
<!-- svelte-ignore a11y_no_static_element_interactions -->
{:else}
    <!-- Welcome -->
    <div class="lg:hidden font-black text-white py-6 text-3xl text-center">
        Welcome To<br /> Auto Gear Lift
    </div>
    <!-- Hero Carousel -->
    {#if heroSlides.length > 0}
        <section class="w-full mb-10">
            <HeroCarousel slides={heroSlides} />
        </section>
    {/if}

    <!-- Sales Carousel -->
    {#if salesSlides.length > 0}
        <section class="container mx-auto mb-10">
            <SalesCarousel slides={salesSlides} />
        </section>
    {/if}

    <!-- Featured Products -->
    <section class="container mx-auto px-4 mb-10">
        <div class="text-2xl text-center font-bold text-white mb-4">
            Featured Products
        </div>
        {#if featuredProducts.length > 0}
            <div
                class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 mb-8"
            >
                {#each featuredProducts.slice(0, 4) as featuredProduct}
                    <ProductCard
                        product={featuredProduct}
                        on:click={() =>
                            router.navigate(`/product/${featuredProduct.id}`)}
                    />
                {/each}
            </div>
        {:else}
            <div
                class="text-center py-12 bg-gray-900 rounded-xl border border-gray-800"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-16 w-16 mx-auto text-gray-600 mb-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                    />
                </svg>
                <h3 class="text-xl font-semibold text-white mb-2">
                    No Currently Featured Products
                </h3>
            </div>
        {/if}
    </section>

    <!-- Categories Carousel -->
    <section class="container mx-auto px-4 mb-10">
        <CategoryCarousel {productCategories} />
    </section>

    <!-- All Products -->
    <section class="container mx-auto px-4 mb-16">
        <div
            class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2"
        >
            {#each products.slice(0, 8) as product}
                <ProductCard
                    {product}
                    on:click={() => router.navigate(`/product/${product.id}`)}
                />
            {/each}
        </div>
    </section>
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div
            on:click={() => navigateToProducts()}
            class="border-blue-600 border-2 bg-transparent hover:bg-blue-600 text-white text-center m-1 px-2 py-3 rounded-lg mb-10"
        >
            View All Products
        </div>
    <!-- Trust Indicators -->
    <section class="bg-gray-900 border-t border-b border-gray-800 py-12 mb-10">
        <div class="container mx-auto px-4">
            <div class="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
                <div class="flex flex-col items-center">
                    <div
                        class="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mb-4"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            class="h-6 w-6 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M5 13l4 4L19 7"
                            />
                        </svg>
                    </div>
                    <h3 class="text-white font-semibold mb-2">
                        Quality Guaranteed
                    </h3>
                    <p class="text-gray-400 text-sm">
                        Premium quality products with warranty
                    </p>
                </div>

                <div class="flex flex-col items-center">
                    <div
                        class="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mb-4"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            class="h-6 w-6 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                            />
                        </svg>
                    </div>
                    <h3 class="text-white font-semibold mb-2">
                        Cash on Delivery
                    </h3>
                    <p class="text-gray-400 text-sm">
                        Pay when you receive your order
                    </p>
                </div>

                <div class="flex flex-col items-center">
                    <div
                        class="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mb-4"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            class="h-6 w-6 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                            />
                        </svg>
                    </div>
                    <h3 class="text-white font-semibold mb-2">Free Shipping</h3>
                    <p class="text-gray-400 text-sm">
                        Free delivery on orders above ₨2000
                    </p>
                </div>

                <div class="flex flex-col items-center">
                    <div
                        class="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center mb-4"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            class="h-6 w-6 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                    </div>
                    <h3 class="text-white font-semibold mb-2">Easy Returns</h3>
                    <p class="text-gray-400 text-sm">
                        Contact us for any queries
                    </p>
                </div>
            </div>
        </div>
    </section>
{/if}
