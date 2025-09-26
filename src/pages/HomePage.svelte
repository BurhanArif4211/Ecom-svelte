<script>
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
                        class="block group text-center border-2 border-dashed border-white m-4 rounded-2xl"
                    >
                    {#if item.image}
                        <img src={`${(item.image !=null) ? item?.image?.src:''}`} class="border-2 border-dashed rounded-xl w-16 h-16 mx-auto mb-3" />
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

        <!-- Product Grid -->
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

    {/if}