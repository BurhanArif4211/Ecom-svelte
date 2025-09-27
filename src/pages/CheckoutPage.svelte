<!-- src/pages/CheckoutPage.svelte -->
<script>
// @ts-nocheck

    import { onMount } from 'svelte';
    import { cart, fetchCart, updateCustomer, selectShippingRate, placeOrder } from '../lib/stores';
    import { router } from './../router';
    import { get } from 'svelte/store';
    
    // Form state - simplified for Pakistan COD
    let billing = {
        first_name: '',
        last_name: '',
        address_1: '',
        address_2: '',
        city: '',
        state: '',
        postcode: '',
        phone: '',
        email: ''
    };
    
    let shipping = {
        first_name: '',
        last_name: '',
        address_1: '',
        address_2: '',
        city: '',
        state: '',
        postcode: '',
        phone: ''
    };
    
    let useSameAddress = true;
    let selectedShipping = '';
    let orderNotes = '';
    let isLoading = true;
    let error = null;
    let orderPlaced = false;
    let orderData = null;
    
    // Pakistan-specific defaults
    const pakistanDefaults = {
        country: 'PK',
        state: '',
        city: '',
        postcode: ''
    };
    
    // Initialize checkout
    onMount(async () => {
        try {
            await fetchCart();
            isLoading = false;
            
            // If customer info exists, pre-fill form
            if ($cart.billing_address) {
                billing = { ...$cart.billing_address };
            } else {
                // Set Pakistan as default country
                billing.country = 'PK';
            }
            
            if ($cart.shipping_address) {
                shipping = { ...$cart.shipping_address };
            } else {
                shipping.country = 'PK';
            }
        } catch (err) {
            error = err.message || "Failed to load checkout data";
            isLoading = false;
        }
    });
    
    // Toggle shipping address visibility
    const toggleSameAddress = () => {
        useSameAddress = !useSameAddress;
        if (useSameAddress) {
            shipping = { ...billing };
        }
    };
    
    // Update customer information
    const updateCustomerInfo = async () => {
        try {
            isLoading = true;
            
            // Validate required fields
            if (!billing.first_name || !billing.last_name || !billing.address_1 || 
                !billing.city || !billing.phone || !billing.email) {
                throw new Error('Please fill in all required fields');
            }
            
            // Set Pakistan as country for both addresses
            const billingAddress = { ...billing, country: 'PK' };
            const shippingAddress = useSameAddress ? billingAddress : { ...shipping, country: 'PK' };
            
            await updateCustomer({
                billing_address: billingAddress,
                shipping_address: shippingAddress
            });
            await fetchCart(); // Refresh cart with updated info
            error = null;
        } catch (err) {
            error = err.message || "Failed to update address";
        } finally {
            isLoading = false;
        }
    };
    
    // Select shipping method
    const selectShipping = async (rateId) => {
        try {
            isLoading = true;
            selectedShipping = rateId;
            console.log(get(cart))
            await selectShippingRate(rateId);
            await fetchCart(); // Refresh cart with updated shipping
            
            error = null;
        } catch (err) {
            error = err.message || "Failed to select shipping method";
        } finally {
            isLoading = false;
        }
    };
    
    // Place order
    const placeOrderHandler = async () => {
        try {
            isLoading = true;
            
            // Final validation before placing order
            if (!billing.first_name || !billing.last_name || !billing.address_1 || 
                !billing.city || !billing.phone || !billing.email) {
                throw new Error('Please fill in all required fields');
            }
            
            if ($cart.needs_shipping && !selectedShipping) {
                throw new Error('Please select a shipping method');
            }
            
            const data = await placeOrder({
                payment_method: 'cod', // Always COD for Pakistan
                customer_note: orderNotes,
                billing_address: { ...billing, country: 'PK' },
                shipping_address: useSameAddress ? { ...billing, country: 'PK' } : { ...shipping, country: 'PK' }
            });
            
            orderData = data;
            orderPlaced = true;
            error = null;
        } catch (err) {
            error = err.message || "Failed to place order";
            isLoading = false;
        }
    };
    
    // Format price correctly (no division by 100)
    const formatPrice = (price) => {
        if (!$cart.totals || !price) return '₨0';
        return `${$cart.totals.currency_prefix}${parseFloat(price).toFixed(2)}`;
    };
    
    // Auto-fill helper for common Pakistan cities
    const pakistanCities = [
        'Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad', 
        'Multan', 'Peshawar', 'Quetta', 'Sialkot', 'Gujranwala'
    ];
</script>

<div class="min-h-screen bg-black text-white py-8">
    <div class="container mx-auto px-4">
        {#if orderPlaced}
            <!-- Order Confirmation -->
            <div class="max-w-3xl mx-auto bg-gray-900 rounded-xl shadow-lg overflow-hidden border border-gray-800">
                <div class="p-8 text-center">
                    <div class="w-20 h-20 bg-green-900 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    
                    <h1 class="text-3xl font-bold text-white mb-4">Order Confirmed!</h1>
                    <p class="text-gray-300 mb-6">Thank you for your purchase. Your order has been placed successfully.</p>
                    
                    <div class="bg-gray-800 rounded-lg p-6 mb-8 text-left border border-gray-700">
                        <h2 class="text-xl font-semibold mb-4 text-white">Order Details</h2>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <p class="text-gray-400">Order Number</p>
                                <p class="font-medium text-white">{orderData?.order_number || 'N/A'}</p>
                            </div>
                            <div>
                                <p class="text-gray-400">Date</p>
                                <p class="font-medium text-white">{new Date().toLocaleDateString()}</p>
                            </div>
                            <div>
                                <p class="text-gray-400">Total</p>
                                <p class="font-medium text-green-400">{formatPrice($cart.totals?.total_price)}</p>
                            </div>
                            <div>
                                <p class="text-gray-400">Payment Method</p>
                                <p class="font-medium text-white">Cash on Delivery</p>
                            </div>
                        </div>
                        
                        <div class="mt-6">
                            <h3 class="font-medium mb-2 text-white">Shipping Address</h3>
                            <p class="text-gray-300">
                                {billing.first_name} {billing.last_name}<br>
                                {billing.address_1}<br>
                                {#if billing.address_2}{billing.address_2}<br>{/if}
                                {billing.city}, {billing.state} {billing.postcode}<br>
                                Pakistan
                            </p>
                        </div>
                    </div>
                    
                    <div class="flex flex-col sm:flex-row justify-center gap-4">
                        <button 
                            on:click={() => router.navigate('/')}
                            class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300"
                        >
                            Continue Shopping
                        </button>
                        <button 
                            on:click={() => router.navigate('/products')}
                            class="bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition duration-300"
                        >
                            Browse More Products
                        </button>
                    </div>
                </div>
            </div>
        {:else}
            <!-- Checkout Form -->
            <div class="max-w-6xl mx-auto">
                <h1 class="text-3xl font-bold text-white mb-8">Checkout</h1>
                
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <!-- Left Column - Forms -->
                    <div class="lg:col-span-2 space-y-8">
                        <!-- Billing Address -->
                        <div class="bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-800">
                            <h2 class="text-xl font-bold mb-6 text-white">Billing & Shipping Details</h2>
                            
                            {#if error}
                                <div class="bg-red-900 text-red-200 p-4 rounded-lg mb-6 border border-red-800">
                                    {error}
                                </div>
                            {/if}
                            
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <!-- Required Fields -->
                                <div>
                                    <label class="block text-gray-300 mb-2">First Name *</label>
                                    <input 
                                        type="text" 
                                        bind:value={billing.first_name}
                                        class="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-white"
                                        required
                                        autocomplete="given-name"
                                    />
                                </div>
                                <div>
                                    <label class="block text-gray-300 mb-2">Last Name *</label>
                                    <input 
                                        type="text" 
                                        bind:value={billing.last_name}
                                        class="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-white"
                                        required
                                        autocomplete="family-name"
                                    />
                                </div>
                                
                                <div class="md:col-span-2">
                                    <label class="block text-gray-300 mb-2">Street Address *</label>
                                    <input 
                                        type="text" 
                                        bind:value={billing.address_1}
                                        placeholder="House number and street name"
                                        class="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-white mb-3"
                                        required
                                        autocomplete="address-line1"
                                    />
                                    <input 
                                        type="text" 
                                        bind:value={billing.address_2}
                                        placeholder="Apartment, suite, unit, etc. (optional)"
                                        class="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-white"
                                        autocomplete="address-line2"
                                    />
                                </div>
                                
                                <div>
                                    <label class="block text-gray-300 mb-2">City *</label>
                                    <input 
                                        type="text" 
                                        bind:value={billing.city}
                                        list="pakistan-cities"
                                        class="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-white"
                                        required
                                        autocomplete="address-level2"
                                    />
                                    <datalist id="pakistan-cities">
                                        {#each pakistanCities as city}
                                            <option value={city} />
                                        {/each}
                                    </datalist>
                                </div>
                                
                                <div>
                                    <label class="block text-gray-300 mb-2">State/Province</label>
                                    <input 
                                        type="text" 
                                        bind:value={billing.state}
                                        class="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-white"
                                        autocomplete="address-level1"
                                    />
                                </div>
                                
                                <div>
                                    <label class="block text-gray-300 mb-2">Postal Code</label>
                                    <input 
                                        type="text" 
                                        bind:value={billing.postcode}
                                        class="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-white"
                                        autocomplete="postal-code"
                                    />
                                </div>
                                
                                <div>
                                    <label class="block text-gray-300 mb-2">Phone Number *</label>
                                    <input 
                                        type="tel" 
                                        bind:value={billing.phone}
                                        class="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-white"
                                        required
                                        autocomplete="tel"
                                    />
                                </div>
                                
                                <div>
                                    <label class="block text-gray-300 mb-2">Email Address *</label>
                                    <input 
                                        type="email" 
                                        bind:value={billing.email}
                                        class="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-white"
                                        required
                                        autocomplete="email"
                                    />
                                </div>
                                
                                <!-- Hidden country field -->
                                <input type="hidden" bind:value={billing.country} />
                            </div>
                            
                            <div class="mt-6">
                                <div class="flex items-center">
                                    <input 
                                        type="checkbox" 
                                        id="same-address" 
                                        bind:checked={useSameAddress}
                                        on:change={toggleSameAddress}
                                        class="h-4 w-4 text-blue-600 border-gray-600 bg-gray-800 rounded focus:ring-blue-500"
                                    />
                                    <label for="same-address" class="ml-2 text-gray-300">Ship to same address</label>
                                </div>
                            </div>
                            
                            <button 
                                on:click={updateCustomerInfo}
                                disabled={isLoading}
                                class="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300 disabled:opacity-50"
                            >
                                {isLoading ? 'Updating...' : 'Update Address'}
                            </button>
                        </div>
                        
                        <!-- Shipping Methods -->
                        {#if $cart.needs_shipping}
                            <div class="bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-800">
                                <h2 class="text-xl font-bold mb-6 text-white">Shipping Methods</h2>
                                
                                {#if $cart.shipping_rates.length > 0}
                                    <div class="space-y-4">
                                        {$cart.shipping_rates[0].shipping_rates[0].name}
                                            <div class="flex items-center border border-gray-700 rounded-lg p-4 hover:border-blue-500 transition-colors">
                                                <input 
                                                    type="radio" 
                                                    id={`shipping-${$cart.shipping_rates[0].shipping_rates[0].rate_id}`} 
                                                    name="shipping-method" 
                                                    checked={selectedShipping === $cart.shipping_rates[0].shipping_rates[0].rate_id}
                                                    on:change={() => selectShipping($cart.shipping_rates[0].shipping_rates[0].rate_id)}
                                                    class="h-5 w-5 text-blue-600 bg-gray-800 border-gray-600"
                                                />
                                                <label for={`shipping-${$cart.shipping_rates[0].shipping_rates[0].rate_id}`} class="ml-3 flex-grow">
                                                    <div class="flex justify-between">
                                                        <span class="font-medium text-white">{$cart.shipping_rates[0].shipping_rates[0].name}</span>
                                                        <span class="font-bold text-green-400">{formatPrice($cart.shipping_rates[0].shipping_rates[0].price)}</span>
                                                    </div>
                                                    <p class="text-gray-400 text-sm mt-1">{$cart.shipping_rates[0].shipping_rates[0].description}</p>
                                                </label>
                                            </div>
                                        
                                    </div>
                                {:else}
                                    <div class="text-gray-400 italic">
                                        Shipping options will appear after you enter your address
                                    </div>
                                {/if}
                            </div>
                        {/if}
                        
                        <!-- Order Notes -->
                        <div class="bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-800">
                            <h2 class="text-xl font-bold mb-6 text-white">Additional Information</h2>
                            <!-- svelte-ignore a11y_label_has_associated_control -->
                            <label class="block text-gray-300 mb-2">Order Notes (optional)</label>
                            <textarea 
                                bind:value={orderNotes}
                                rows="4"
                                placeholder="Notes about your order, e.g. special notes for delivery"
                                class="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-white"
                            ></textarea>
                        </div>
                    </div>
                    
                    <!-- Right Column - Order Summary -->
                    <div>
                        <div class="bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-800 sticky top-8">
                            <h2 class="text-xl font-bold mb-6 text-white">Your Order</h2>
                            
                            <div class="border-b border-gray-700 pb-4 mb-4">
                                <div class="flex justify-between items-center mb-2">
                                    <h3 class="font-medium text-gray-300">Product</h3>
                                    <h3 class="font-medium text-gray-300">Subtotal</h3>
                                </div>
                                
                                {#each $cart.items as item}
                                    <div class="flex justify-between py-2">
                                        <div>
                                            <span class="font-medium text-white">{item.name}</span>
                                            <span class="block text-gray-400 text-sm">× {item.quantity}</span>
                                        </div>
                                        <div class="text-white">{formatPrice(item.prices.price)}</div>
                                    </div>
                                {/each}
                            </div>
                            
                            <div class="space-y-3 mb-6">
                                <div class="flex justify-between">
                                    <span class="text-gray-300">Subtotal</span>
                                    <span class="text-white">{formatPrice($cart.totals?.total_items)}</span>
                                </div>
                                
                                {#if parseFloat($cart.totals?.total_discount) > 0}
                                    <div class="flex justify-between text-green-400">
                                        <span>Discount</span>
                                        <span>-{formatPrice($cart.totals.total_discount)}</span>
                                    </div>
                                {/if}
                                
                                {#if $cart.needs_shipping}
                                    <div class="flex justify-between">
                                        <span class="text-gray-300">Shipping</span>
                                        <span class="text-white">
                                            {#if selectedShipping}
                                                {formatPrice($cart.totals?.total_shipping)}
                                            {:else}
                                                To be calculated
                                            {/if}
                                        </span>
                                    </div>
                                {/if}
                                
                                {#if parseFloat($cart.totals?.total_tax) > 0}
                                    <div class="flex justify-between">
                                        <span class="text-gray-300">Tax</span>
                                        <span class="text-white">{formatPrice($cart.totals.total_tax)}</span>
                                    </div>
                                {/if}
                                
                                <div class="flex justify-between border-t border-gray-700 pt-3 font-bold text-lg">
                                    <span class="text-white">Total</span>
                                    <span class="text-green-400">{formatPrice($cart.totals?.total_price)}</span>
                                </div>
                            </div>
                            
                            <!-- Payment Method Info -->
                            <div class="bg-blue-900 bg-opacity-20 border border-blue-800 rounded-lg p-4 mb-6">
                                <div class="flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                    <span class="text-blue-300 font-medium">Cash on Delivery</span>
                                </div>
                                <p class="text-blue-200 text-sm mt-1">Pay with cash when your order is delivered</p>
                            </div>
                            
                            <button 
                                on:click={placeOrderHandler}
                                disabled={isLoading || ($cart.needs_shipping && !selectedShipping)}
                                class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300 disabled:opacity-50 flex items-center justify-center"
                            >
                                {#if isLoading}
                                    <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Processing...
                                {:else}
                                    Place Order
                                {/if}
                            </button>
                            
                            <div class="mt-4 text-center text-sm text-gray-400">
                                Your personal data will be used to process your order and for other purposes described in our privacy policy.
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        {/if}
    </div>
</div>