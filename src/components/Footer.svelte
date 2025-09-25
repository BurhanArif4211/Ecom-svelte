<script>
    import { router } from "../router";

</script>
<footer class="bg-gray-900 text-white py-12">
    <div class="container mx-auto px-4">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
                <h3 class="text-xl font-bold mb-4">ShopSvelte</h3>
                <p class="text-gray-400">
                    Premium ecommerce experience powered by Svelte and WooCommerce.
                </p>
            </div>
            <div>
                <h4 class="font-bold mb-4">Shop</h4>
                <ul class="space-y-2">
                    <li>
                        <a href="/products" class="text-gray-400 hover:text-white"
                           onclick={() => router.navigate('/products')}>
                            All Products
                        </a>
                    </li>
                    <li>
                        <a href="/search" class="text-gray-400 hover:text-white"
                           onclick={() => router.navigate('/search')}>
                            Search
                        </a>
                    </li>
                </ul>
            </div>
            <div>
                <h4 class="font-bold mb-4">Customer Service</h4>
                <ul class="space-y-2">
                    <li><a href="#" class="text-gray-400 hover:text-white">Contact Us</a></li>
                    <li><a href="#" class="text-gray-400 hover:text-white">Shipping Policy</a></li>
                    <li><a href="#" class="text-gray-400 hover:text-white">Returns & Exchanges</a></li>
                </ul>
            </div>
            <div>
                <h4 class="font-bold mb-4">Stay Connected</h4>
                <p class="text-gray-400 mb-4">Subscribe to our newsletter for updates.</p>
                <div class="flex">
                    <input 
                        type="email" 
                        placeholder="Your email" 
                        class="bg-gray-800 text-white px-4 py-2 rounded-l-lg focus:outline-none w-full"
                    />
                    <button class="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-r-lg">
                        Subscribe
                    </button>
                </div>
            </div>
        </div>
        <div class="border-t border-gray-800 mt-8 pt-8 text-center text-gray-500">
            <p>&copy; {new Date().getFullYear()} ShopSvelte. All rights reserved.</p>
        </div>
    </div>
</footer>
