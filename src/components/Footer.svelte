<script>
    import { router } from "../router";

</script>
<footer class="bg-gray-900 text-white py-12">
    <div class="container mx-auto px-4">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
                <h3 class="text-2xl font-bold mb-4">Auto Gear Lift</h3>
                <p class=" text-gray-400">
                    Ride Elevated
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
                        <a href="/products" class="text-gray-400 hover:text-white"
                           onclick={() => router.navigate('/search')}>
                            Search
                        </a>
                    </li>
                </ul>
            </div>
            <div>
                <h4 class="font-bold mb-4">Customer Service</h4>
                <ul class="space-y-2">
                    <li><a href="mailto:contact@autogearlift.com" class="text-gray-400 hover:text-white">Contact Us</a></li>
                    <li><a href="/TOS" onclick={() => router.navigate('/TOS')} class="text-gray-400 hover:text-white">Terms Of Service</a></li>
                    <li><a href="/Return-Policy" onclick={() => router.navigate('/Return-Policy')} class="text-gray-400 hover:text-white">Return Policy</a></li>
                </ul>
            </div>
        </div>
        <div class="border-t border-gray-800 mt-8 pt-8 text-center text-gray-500">
            <p>&copy; {new Date().getFullYear()} Auto Gear Lift. All rights reserved.</p>
        </div>
    </div>
</footer>
