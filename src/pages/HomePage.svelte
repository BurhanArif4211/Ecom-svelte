<!-- src/pages/HomePage.svelte -->
<script>
    import { onMount } from "svelte";
    import Carousel from "../components/Carousel.svelte";
    import HeroCarousel from "../components/HeroCarousel.svelte";
    import SalesCarousel from "../components/SalesCrousel.svelte";
    import ProductCard from "../components/ProductCard.svelte";
    import { router } from "../router";
    
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
            const [
                featuredRes, 
                categoriesRes, 
                productsRes,
                heroRes,
                salesRes
            ] = await Promise.all([
                fetch('/wp/wp-json/wc/store/products?featured=true&per_page=8'),
                fetch('/wp/wp-json/wc/store/products/categories?per_page=12&hide_empty=true'),
                fetch('/wp/wp-json/wc/store/products?per_page=12&orderby=date&order=desc'),
                fetch('/wp/wp-json/acf/v1/options/carouselslides'),
                fetch('/wp/wp-json/acf/v1/options/salescarousel')
            ]);

            featuredProducts = await featuredRes.json();
            productCategories = await categoriesRes.json();
            products = await productsRes.json();
            
            // Handle hero carousel data
            const heroData = await heroRes.json();
            heroSlides = heroData.success ? heroData.data : [];
            console.log(heroSlides)
            
            // Handle sales carousel data
            const salesData = await salesRes.json();
            salesSlides = salesData.success ? salesData.data : [];

        } catch (err) {
            console.error('Error fetching data:', err);
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
    const navigateToProducts = (params = '') => {
        router.navigate(`/products${params}`);
    };
</script>

<svelte:head>
    <title>Auto Gear Lift - Premium Automotive Parts & Accessories</title>
    <meta name="description" content="Shop the best automotive parts, LED lights, and accessories in Pakistan. Free shipping available on orders above ₨2000." />
    <meta name="keywords" content="auto parts, car accessories, LED lights, Pakistan, automotive, car modifications" />
    <link rel="canonical" href="https://autogearlift.com" />
</svelte:head>

{#if isLoading}
    <div class="flex justify-center items-center h-screen bg-black">
        <div class="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
    </div>
{:else if error}
    <div class="text-red-500 text-center p-8 bg-black">Error: {error}</div>
{:else}
    <!-- Hero Carousel -->
    {#if heroSlides.length > 0}
        <section class="w-full mb-16">
            <HeroCarousel 
                slides={heroSlides} />
        </section>
    {/if}

    <!-- Categories Carousel -->
    <section class="container mx-auto px-4 mb-16">
        <div class="text-center mb-12">
            <h2 class="text-4xl font-bold text-white mb-4">Shop By Category</h2>
            <p class="text-gray-400 text-lg max-w-2xl mx-auto">
                Discover our wide range of automotive parts and accessories organized by category
            </p>
        </div>
        
        <div class="relative">
            <!-- svelte-ignore a11y_click_events_have_key_events -->
            <!-- svelte-ignore a11y_no_static_element_interactions -->
            <Carousel 
                items={productCategories} 
                itemsPerView={{ mobile: 2, tablet: 4, desktop: 6 }}
                let:item
                showControls
            >
                <!-- svelte-ignore a11y_click_events_have_key_events -->
                <div 
                    on:click={() => navigateToCategory(item.slug)}
                    class="block group text-center p-6 bg-gray-900 rounded-xl border border-gray-800 hover:border-blue-600 hover:bg-gray-800 transition-all duration-300 cursor-pointer mx-2"
                >
                    {#if item.image}
                        <img 
                            alt={item.name} 
                            src={item.image.src} 
                            class="w-20 h-20 object-cover rounded-lg mx-auto mb-4 group-hover:scale-110 transition-transform duration-300"
                        />
                    {:else}
                        <div class="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                            </svg>
                        </div>
                    {/if}
                    <h3 class="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors mb-2">
                        {item.name}
                    </h3>
                    <p class="text-gray-400 text-sm">({item.count} items)</p>
                </div>
            </Carousel>
        </div>
    </section>

    <!-- Sales Carousel -->
    {#if salesSlides.length > 0}
        <section class="container mx-auto px-4 mb-16">
            <SalesCarousel 
                slides={salesSlides}
            />
        </section>
    {/if}

    <!-- Featured Products -->
    <section class="container mx-auto px-4 mb-16">
        <div class="flex justify-between items-center mb-12">
            <div>
                <h2 class="text-4xl font-bold text-white mb-2">Featured Products</h2>
                <p class="text-gray-400">Handpicked selection of our best products</p>
            </div>
            <button 
                on:click={() => navigateToProducts('?featured=true')}
                class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-300"
            >
                View All Featured
            </button>
        </div>
        
        {#if featuredProducts.length > 0}
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
                {#each featuredProducts.slice(0, 4) as featuredProduct}
                    <ProductCard 
                        product={featuredProduct} 
                        on:click={() => router.navigate(`/product/${featuredProduct.id}`)}
                    />
                {/each}
            </div>
        {:else}
            <div class="text-center py-12 bg-gray-900 rounded-xl border border-gray-800">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <h3 class="text-xl font-semibold text-white mb-2">No Featured Products</h3>
                <p class="text-gray-400">Check back later for featured items</p>
            </div>
        {/if}
    </section>

    <!-- All Products -->
    <section class="container mx-auto px-4 mb-16">
        <div class="flex justify-between items-center mb-12">
            <div>
                <h2 class="text-4xl font-bold text-white mb-2">New Arrivals</h2>
                <p class="text-gray-400">Latest additions to our collection</p>
            </div>
            <button 
                on:click={() => navigateToProducts()}
                class="bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-300 border border-gray-700"
            >
                View All Products
            </button>
        </div>
        
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {#each products.slice(0, 8) as product}
                <ProductCard 
                    {product} 
                    on:click={() => router.navigate(`/product/${product.id}`)}
                />
            {/each}
        </div>
    </section>

    <!-- Trust Indicators -->
    <section class="bg-gray-900 border-t border-b border-gray-800 py-12 mb-16">
        <div class="container mx-auto px-4">
            <div class="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
                <div class="flex flex-col items-center">
                    <div class="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h3 class="text-white font-semibold mb-2">Quality Guaranteed</h3>
                    <p class="text-gray-400 text-sm">Premium quality products with warranty</p>
                </div>
                
                <div class="flex flex-col items-center">
                    <div class="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                    </div>
                    <h3 class="text-white font-semibold mb-2">Cash on Delivery</h3>
                    <p class="text-gray-400 text-sm">Pay when you receive your order</p>
                </div>
                
                <div class="flex flex-col items-center">
                    <div class="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                    </div>
                    <h3 class="text-white font-semibold mb-2">Free Shipping</h3>
                    <p class="text-gray-400 text-sm">Free delivery on orders above ₨2000</p>
                </div>
                
                <div class="flex flex-col items-center">
                    <div class="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h3 class="text-white font-semibold mb-2">Easy Returns</h3>
                    <p class="text-gray-400 text-sm">Contact us for any queries</p>
                </div>
            </div>
        </div>
    </section>
{/if}


<!-- <script>
    import { onMount } from "svelte";
    import Carousel from "../components/Carousel.svelte";
    import ProductCard from "../components/ProductCard.svelte";
    
    // State management
    let productCategories = [];
    let products = [];
    let featuredProducts = [];
    let isLoading = true;
    let error = null;

    // Fetch data from WordPress REST API
    const fetchData = async () => {
        try {
            // Fetch featured products (adjust per_page as needed)
            const featuredRes = await fetch('/wp/wp-json/wc/store/products?featured=true&per_page=5');
            featuredProducts = await featuredRes.json();
            
            // Fetch product categories
            const categoriesRes = await fetch('/wp/wp-json/wc/store/products/categories?per_page=10');
            productCategories = await categoriesRes.json();

            // Fetch recent products
            const productsRes = await fetch('/wp/wp-json/wc/store/products?per_page=8');
            products = await productsRes.json();

        } catch (err) {
            error = err.message;
        } finally {
            isLoading = false;
        }
    };

    onMount(fetchData);
</script>
    {#if isLoading}
        <div class="flex justify-center items-center h-screen">
            <div class="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
        </div>
    {:else if error}
        <div class="text-red-500 text-center p-8">Error: {error}</div>
    {:else}
        <section class="container mx-auto px-4 mb-16">
            <h2 class="text-3xl font-bold text-center mb-10">Shop Categories</h2>
            <div class="relative">
                <Carousel 
                    items={productCategories} 
                    itemsPerView={{ mobile: 2, tablet: 4, desktop: 6 }}
                    let:item
                    showControls
                >
                    <a 
                        href={`/products?category=${item.slug}`} 
                        class="block group text-center border-2 border-dashed border-white m-4 rounded-2xl"
                    >
                    {#if item.image}
                        <img alt={item.name} src={`${(item.image !=null) ? item?.image?.src:''}`} class="border-2 border-dashed rounded-xl w-16 h-16 mx-auto mb-3" />
                    {:else}
                        <div class="w-16 h-16 mb-3"></div>
                    {/if}
                        <h3 class="text-lg text-white font-semibold group-hover:text-blue-600 transition-colors">
                            {item.name}
                        </h3>
                        <p class="text-gray-500 text-sm">({item.count} items)</p>
                    </a>
                </Carousel>
            </div>
        </section>

        <section class="container mx-auto px-4 mb-16">
            <div class="flex justify-between items-center mb-10">
                <h2 class="text-3xl text-gray-300 font-bold">Featured Products</h2>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {#each featuredProducts as featuredProduct}
                    <ProductCard product={featuredProduct} />
                {/each}
            </div>
            <div class="mb-10"></div>
            <div class="flex justify-between items-center mb-10">
                <h2 class="text-3xl text-gray-300 font-bold">All Products</h2>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {#each products as product}
                    <ProductCard {product} />
                {/each}
            </div>
        </section>
    {/if} -->