<script>
    import { onMount } from "svelte";
    import Carousel from "../components/Carousel.svelte";
    import ProductCard from "../components/ProductCard.svelte";
    

    // State management
    let featuredProducts = [];
    let productCategories = [];
    let products = [];
    let isLoading = true;
    let error = null;

    // Fetch data from WordPress REST API
    const fetchData = async () => {
        try {
            // Fetch featured products (adjust per_page as needed)
            const featuredRes = await fetch('/wp/wp-json/wc/v3/products?featured=true&per_page=5');
            featuredProducts = await featuredRes.json();
            
            // Fetch product categories
            const categoriesRes = await fetch('/wp/wp-json/wc/v3/products/categories?per_page=10');
            productCategories = await categoriesRes.json();

            // Fetch recent products
            const productsRes = await fetch('/wp/wp-json/wc/v3/products?per_page=8');
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
        <!-- Featured Products Carousel -->
        <section class="mb-16">
            <Carousel items={featuredProducts} let:item>
                <div class="relative h-[500px] md:h-[600px]">
                    <img 
                        src={item.images[0]?.src || 'https://via.placeholder.com/1200x600'} 
                        alt={item.name}
                        class="w-full h-full object-cover"
                    />
                    <div class="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent flex items-center">
                        <div class="container mx-auto px-4 text-white max-w-2xl">
                            <h2 class="text-3xl md:text-5xl font-bold mb-4">{item.name}</h2>
                            <p class="text-xl mb-6 line-clamp-2">{item.short_description.replace(/<[^>]*>/g, '')}</p>
                            <a 
                                href={`/products/${item.id}`} 
                                class="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300"
                            >
                                Shop Now
                            </a>
                        </div>
                    </div>
                </div>
            </Carousel>
        </section>

        <!-- Categories Carousel -->
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
                        href={`/category/${item.id}`} 
                        class="block group text-center p-4"
                    >
                        <div class="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 mx-auto mb-3" />
                        <h3 class="text-lg font-semibold group-hover:text-blue-600 transition-colors">
                            {item.name}
                        </h3>
                        <p class="text-gray-500 text-sm">({item.count} items)</p>
                    </a>
                </Carousel>
            </div>
        </section>

        <!-- Product Grid -->
        <section class="container mx-auto px-4 mb-16">
            <div class="flex justify-between items-center mb-10">
                <h2 class="text-3xl font-bold">Featured Products</h2>
                <a href="/products" class="text-blue-600 hover:underline">View All Products</a>
            </div>
            
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {#each products as product}
                    <ProductCard {product} />
                {/each}
            </div>
        </section>

        <!-- Promotional Banner -->
        <section class="bg-blue-800 text-white py-16 mb-16">
            <div class="container mx-auto px-4 text-center">
                <h2 class="text-4xl font-bold mb-4">Summer Sale</h2>
                <p class="text-xl mb-8 max-w-2xl mx-auto">
                    Up to 50% off on seasonal items. Limited time offer!
                </p>
                <button class="bg-white text-blue-800 font-bold py-3 px-8 rounded-lg hover:bg-gray-100 transition duration-300">
                    Shop the Sale
                </button>
            </div>
        </section>
    {/if}