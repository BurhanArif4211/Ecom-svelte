<!-- src/pages/CheckoutPage.svelte -->
<script>
// @ts-nocheck

    import { onMount } from 'svelte';
    import { cart, fetchCart, updateCustomer, selectShippingRate, placeOrder } from '../lib/stores';
    import { router } from '../router';
    import { validateAddress, validateEmail } from '../lib/utils';
    // Form state
    let billing = {
        first_name: '',
        last_name: '',
        company: '',
        address_1: '',
        address_2: '',
        city: '',
        state: '',
        postcode: '',
        country: '',
        phone: '',
        email: ''
    };
    
    let shipping = {
        first_name: '',
        last_name: '',
        company: '',
        address_1: '',
        address_2: '',
        city: '',
        state: '',
        postcode: '',
        country: '',
        phone: ''
    };
    
    let useSameAddress = true;
    let selectedShipping = '';
    let selectedPayment = 'cod'; // Default to Cash on Delivery
    let orderNotes = '';
    let isLoading = true;
    let error = null;
    let orderPlaced = false;
    let orderData = null;
    let billingErrors = {};
    let shippingErrors = {};
    // Initialize checkout
    onMount(async () => {
        try {
            await fetchCart();
            isLoading = false;
            
        } catch (err) {
            error = err.message || "Failed to load checkout data";
            isLoading = false;
        }
    });
    
    // Toggle shipping address visibility
    const toggleSameAddress = () => {
        useSameAddress = !useSameAddress;
        if (useSameAddress) {
            shipping = {...billing};
        }
    };
    
    
// Update customer information with validation
const updateCustomerInfo = async () => {
        try {
            isLoading = true;
            
            // Validate billing address
            const billingValidation = validateAddress(billing);
            if (!billingValidation.isValid) {
                billingErrors = billingValidation.errors;
                throw new Error("Please fix billing address errors");
            }
            
            // Validate email separately
            if (!billing.email || !validateEmail(billing.email)) {
                billingErrors.email = "Valid email is required";
                throw new Error("Valid email is required");
            }
            
            // Validate shipping address if different
            if (!useSameAddress) {
                const shippingValidation = validateAddress(shipping);
                if (!shippingValidation.isValid) {
                    shippingErrors = shippingValidation.errors;
                    throw new Error("Please fix shipping address errors");
                }
            }
            // Prepare data according to API spec
            const customerData = {
                billing_address: billing
            };
            
            
            await updateCustomer(customerData);
            await fetchCart(); // Refresh cart with updated info
            error = null;
        } catch (err) {
            error = err.message || "Failed to update address";
        } finally {
            isLoading = false;
        }
    };

    // Place order - corrected to match API spec
    const placeOrderHandler = async () => {
        try {
            isLoading = true;
            // First validate and update customer info
            await updateCustomerInfo();
            
            // Additional validation for order placement
            if (!selectedShipping && $cart.needs_shipping) {
                throw new Error("Please select a shipping method");
            }
            
            if (!selectedPayment) {
                throw new Error("Please select a payment method");
            }
            // Prepare order data according to API spec
            let orderData = {
                payment_method: selectedPayment,
                customer_note: orderNotes,
                billing_address: billing
            };
            
            if (!useSameAddress) {
                orderData.shipping_address = shipping;
            }
            
            const data = await placeOrder(orderData);
            orderData = data;
            orderPlaced = true;
            error = null;
        } catch (err) {
            error = err.message || "Failed to place order";
            isLoading = false;
        }
    };
    
    // Select shipping method
    const selectShipping = async (rateId) => {
        try {
            isLoading = true;
            selectedShipping = rateId;
            await selectShippingRate(rateId);
            await fetchCart(); // Refresh cart with updated shipping
            error = null;
        } catch (err) {
            error = err.message || "Failed to select shipping method";
        } finally {
            isLoading = false;
        }
    };
    
    // Format price
    const formatPrice = (price) => {
        if (!$cart.totals) return '$0.00';
        return `${$cart.totals.currency_prefix}${(parseFloat(price) / 100).toFixed(2)}`;
    };
</script>

<div class="min-h-screen bg-gray-50 py-8">
    <div class="container mx-auto px-4">
        {#if orderPlaced}
            <!-- Order Confirmation -->
            <div class="max-w-3xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
                <div class="p-8 text-center">
                    <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    
                    <h1 class="text-3xl font-bold text-gray-900 mb-4">Order Confirmed!</h1>
                    <p class="text-gray-600 mb-6">Thank you for your purchase. Your order has been placed successfully.</p>
                    
                    <div class="bg-gray-50 rounded-lg p-6 mb-8 text-left">
                        <h2 class="text-xl font-semibold mb-4">Order Details</h2>
                        <div class="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <p class="text-gray-500">Order Number</p>
                                <p class="font-medium">{orderData?.order_number || 'N/A'}</p>
                            </div>
                            <div>
                                <p class="text-gray-500">Date</p>
                                <p class="font-medium">{new Date().toLocaleDateString()}</p>
                            </div>
                            <div>
                                <p class="text-gray-500">Total</p>
                                <p class="font-medium">{formatPrice($cart.totals?.total_price)}</p>
                            </div>
                            <div>
                                <p class="text-gray-500">Payment Method</p>
                                <p class="font-medium">{selectedPayment === 'cod' ? 'Cash on Delivery' : 'Credit Card'}</p>
                            </div>
                        </div>
                        
                        <div class="mt-6">
                            <h3 class="font-medium mb-2">Shipping Address</h3>
                            <p class="text-gray-600">
                                {billing.first_name} {billing.last_name}<br>
                                {billing.address_1}<br>
                                {#if billing.address_2}{billing.address_2}<br>{/if}
                                {billing.city}, {billing.state} {billing.postcode}<br>
                                {billing.country}
                            </p>
                        </div>
                    </div>
                    
                    <div class="flex justify-center gap-4">
                        <button 
                            on:click={() => router.navigate('/')}
                            class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300"
                        >
                            Continue Shopping
                        </button>
                        <button 
                            on:click={() => router.navigate('/orders')}
                            class="bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 font-bold py-3 px-6 rounded-lg transition duration-300"
                        >
                            View Orders
                        </button>
                    </div>
                </div>
            </div>
        {:else}
            <!-- Checkout Form -->
            <div class="max-w-6xl mx-auto">
                <h1 class="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>
                
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <!-- Left Column - Forms -->
                    <div class="lg:col-span-2 space-y-8">
                        <!-- Billing Address -->
                        <div class="bg-white rounded-xl shadow-md p-6">
                            <h2 class="text-xl font-bold mb-6">Billing Details</h2>
                            
                            {#if error}
                                <div class="bg-red-50 text-red-700 p-4 rounded-lg mb-6">
                                    {error}
                                </div>
                            {/if}
                            
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label class="block text-gray-700 mb-2">First Name *</label>
                                    <input 
                                        type="text" 
                                        bind:value={billing.first_name}
                                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label class="block text-gray-700 mb-2">Last Name *</label>
                                    <input 
                                        type="text" 
                                        bind:value={billing.last_name}
                                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                </div>
                                <div class="md:col-span-2">
                                    <label class="block text-gray-700 mb-2">Company Name</label>
                                    <input 
                                        type="text" 
                                        bind:value={billing.company}
                                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div class="md:col-span-2">
                                    <label class="block text-gray-700 mb-2">Street Address *</label>
                                    <input 
                                        type="text" 
                                        bind:value={billing.address_1}
                                        placeholder="House number and street name"
                                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 mb-3"
                                        required
                                    />
                                    <input 
                                        type="text" 
                                        bind:value={billing.address_2}
                                        placeholder="Apartment, suite, unit, etc. (optional)"
                                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label class="block text-gray-700 mb-2">Town / City *</label>
                                    <input 
                                        type="text" 
                                        bind:value={billing.city}
                                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label class="block text-gray-700 mb-2">State / County *</label>
                                    <input 
                                        type="text" 
                                        bind:value={billing.state}
                                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label class="block text-gray-700 mb-2">Postcode / ZIP *</label>
                                    <input 
                                        type="text" 
                                        bind:value={billing.postcode}
                                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label class="block text-gray-700 mb-2">Country *</label>
                                    <select 
                                        bind:value={billing.country}
                                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    >
                                        <option value="">Select Country</option>
                                        <option value="US">United States</option>
                                        <option value="UK">United Kingdom</option>
                                        <option value="CA">Canada</option>
                                        <option value="AU">Australia</option>
                                        <option value="DE">Germany</option>
                                        <option value="FR">France</option>
                                    </select>
                                </div>
                                <div>
                                    <label class="block text-gray-700 mb-2">Phone *</label>
                                    <input 
                                        type="tel" 
                                        bind:value={billing.phone}
                                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label class="block text-gray-700 mb-2">Email Address *</label>
                                    <input 
                                        type="email" 
                                        bind:value={billing.email}
                                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                </div>
                            </div>
                            
                            <div class="mt-6">
                                <div class="flex items-center">
                                    <input 
                                        type="checkbox" 
                                        id="same-address" 
                                        bind:checked={useSameAddress}
                                        on:change={toggleSameAddress}
                                        class="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <label for="same-address" class="ml-2 text-gray-700">Ship to same address</label>
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
                        
                        <!-- Shipping Address (Conditional) -->
                        {#if !useSameAddress}
                            <div class="bg-white rounded-xl shadow-md p-6">
                                <h2 class="text-xl font-bold mb-6">Shipping Details</h2>
                                
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label class="block text-gray-700 mb-2">First Name *</label>
                                        <input 
                                            type="text" 
                                            bind:value={shipping.first_name}
                                            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label class="block text-gray-700 mb-2">Last Name *</label>
                                        <input 
                                            type="text" 
                                            bind:value={shipping.last_name}
                                            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                            required
                                        />
                                    </div>
                                    <div class="md:col-span-2">
                                        <label class="block text-gray-700 mb-2">Company Name</label>
                                        <input 
                                            type="text" 
                                            bind:value={shipping.company}
                                            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                    <div class="md:col-span-2">
                                        <label class="block text-gray-700 mb-2">Street Address *</label>
                                        <input 
                                            type="text" 
                                            bind:value={shipping.address_1}
                                            placeholder="House number and street name"
                                            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 mb-3"
                                            required
                                        />
                                        <input 
                                            type="text" 
                                            bind:value={shipping.address_2}
                                            placeholder="Apartment, suite, unit, etc. (optional)"
                                            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label class="block text-gray-700 mb-2">Town / City *</label>
                                        <input 
                                            type="text" 
                                            bind:value={shipping.city}
                                            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label class="block text-gray-700 mb-2">State / County *</label>
                                        <input 
                                            type="text" 
                                            bind:value={shipping.state}
                                            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label class="block text-gray-700 mb-2">Postcode / ZIP *</label>
                                        <input 
                                            type="text" 
                                            bind:value={shipping.postcode}
                                            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label class="block text-gray-700 mb-2">Country *</label>
                                        <select 
                                            bind:value={shipping.country}
                                            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                            required
                                        >
                                            <option value="">Select Country</option>
                                            <option value="US">United States</option>
                                            <option value="UK">United Kingdom</option>
                                            <option value="CA">Canada</option>
                                            <option value="AU">Australia</option>
                                            <option value="DE">Germany</option>
                                            <option value="FR">France</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label class="block text-gray-700 mb-2">Phone *</label>
                                        <input 
                                            type="tel" 
                                            bind:value={shipping.phone}
                                            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                            required
                                        />
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
                        {/if}
                        
                        <!-- Shipping Methods -->
                        <div class="bg-white rounded-xl shadow-md p-6">
                            <h2 class="text-xl font-bold mb-6">Shipping Methods</h2>
                            
                            {#if $cart.shipping_rates && $cart.shipping_rates.length > 0}
                                <div class="space-y-4">
                                    {#each $cart.shipping_rates as rate}
                                        <div class="flex items-center border border-gray-200 rounded-lg p-4 hover:border-blue-500">
                                            <input 
                                                type="radio" 
                                                id={`shipping-${rate.rate_id}`} 
                                                name="shipping-method" 
                                                checked={selectedShipping === rate.rate_id}
                                                on:change={() => selectShipping(rate.rate_id)}
                                                class="h-5 w-5 text-blue-600"
                                            />
                                            <label for={`shipping-${rate.rate_id}`} class="ml-3 flex-grow">
                                                <div class="flex justify-between">
                                                    <span class="font-medium">{rate.name}</span>
                                                    <span class="font-bold">{formatPrice(rate.price)}</span>
                                                </div>
                                                <p class="text-gray-500 text-sm mt-1">{rate.description}</p>
                                            </label>
                                        </div>
                                    {/each}
                                </div>
                            {:else}
                                <div class="text-gray-500 italic">
                                    {#if $cart.needs_shipping}
                                        Shipping options will appear after you enter your address
                                    {:else}
                                        No shipping required for this order
                                    {/if}
                                </div>
                            {/if}
                        </div>
                        
                        <!-- Payment Method -->
                        <div class="bg-white rounded-xl shadow-md p-6">
                            <h2 class="text-xl font-bold mb-6">Payment Method</h2>
                            
                            <div class="space-y-4">
                                <div class="flex items-center border border-gray-200 rounded-lg p-4 hover:border-blue-500">
                                    <input 
                                        type="radio" 
                                        id="payment-cod" 
                                        name="payment-method" 
                                        checked={selectedPayment === 'cod'}
                                        on:change={() => selectedPayment = 'cod'}
                                        class="h-5 w-5 text-blue-600"
                                    />
                                    <label for="payment-cod" class="ml-3 flex-grow">
                                        <div class="flex justify-between">
                                            <span class="font-medium">Cash on Delivery</span>
                                        </div>
                                        <p class="text-gray-500 text-sm mt-1">Pay with cash upon delivery</p>
                                    </label>
                                </div>
                                
                                <div class="flex items-center border border-gray-200 rounded-lg p-4 hover:border-blue-500">
                                    <input 
                                        type="radio" 
                                        id="payment-cc" 
                                        name="payment-method" 
                                        checked={selectedPayment === 'credit-card'}
                                        on:change={() => selectedPayment = 'credit-card'}
                                        class="h-5 w-5 text-blue-600"
                                    />
                                    <label for="payment-cc" class="ml-3 flex-grow">
                                        <div class="flex justify-between">
                                            <span class="font-medium">Credit Card</span>
                                        </div>
                                        <p class="text-gray-500 text-sm mt-1">Pay securely with your credit card</p>
                                    </label>
                                </div>
                                
                                {#if selectedPayment === 'credit-card'}
                                    <div class="mt-4 p-4 bg-gray-50 rounded-lg">
                                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label class="block text-gray-700 mb-2">Card Number</label>
                                                <input 
                                                    type="text" 
                                                    placeholder="1234 5678 9012 3456"
                                                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                                />
                                            </div>
                                            <div>
                                                <label class="block text-gray-700 mb-2">Cardholder Name</label>
                                                <input 
                                                    type="text" 
                                                    placeholder="John Doe"
                                                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                                />
                                            </div>
                                            <div>
                                                <label class="block text-gray-700 mb-2">Expiration Date</label>
                                                <input 
                                                    type="text" 
                                                    placeholder="MM/YY"
                                                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                                />
                                            </div>
                                            <div>
                                                <label class="block text-gray-700 mb-2">CVV</label>
                                                <input 
                                                    type="text" 
                                                    placeholder="123"
                                                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                {/if}
                            </div>
                        </div>
                        
                        <!-- Order Notes -->
                        <div class="bg-white rounded-xl shadow-md p-6">
                            <h2 class="text-xl font-bold mb-6">Additional Information</h2>
                            <label class="block text-gray-700 mb-2">Order Notes (optional)</label>
                            <textarea 
                                bind:value={orderNotes}
                                rows="4"
                                placeholder="Notes about your order, e.g. special notes for delivery"
                                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                            ></textarea>
                        </div>
                    </div>
                    
                    <!-- Right Column - Order Summary -->
                    <div>
                        <div class="bg-white rounded-xl shadow-md p-6 sticky top-8">
                            <h2 class="text-xl font-bold mb-6">Your Order</h2>
                            
                            <div class="border-b border-gray-200 pb-4 mb-4">
                                <div class="flex justify-between items-center mb-2">
                                    <h3 class="font-medium">Product</h3>
                                    <h3 class="font-medium">Subtotal</h3>
                                </div>
                                
                                {#each $cart.items as item}
                                    <div class="flex justify-between py-2">
                                        <div>
                                            <span class="font-medium">{item.name}</span>
                                            <span class="block text-gray-500 text-sm">× {item.quantity}</span>
                                        </div>
                                        <div>{formatPrice(item.prices.price)}</div>
                                    </div>
                                {/each}
                            </div>
                            
                            <div class="space-y-3 mb-6">
                                <div class="flex justify-between">
                                    <span>Subtotal</span>
                                    <span>{formatPrice($cart.totals?.total_items)}</span>
                                </div>
                                
                                {#if $cart.totals?.total_discount > 0}
                                    <div class="flex justify-between text-green-600">
                                        <span>Discount</span>
                                        <span>-{formatPrice($cart.totals.total_discount)}</span>
                                    </div>
                                {/if}
                                
                                <div class="flex justify-between">
                                    <span>Shipping</span>
                                    <span>
                                        {#if selectedShipping}
                                            {formatPrice($cart.totals?.total_shipping)}
                                        {:else}
                                            Calculated at next step
                                        {/if}
                                    </span>
                                </div>
                                
                                {#if $cart.totals?.total_tax > 0}
                                    <div class="flex justify-between">
                                        <span>Tax</span>
                                        <span>{formatPrice($cart.totals.total_tax)}</span>
                                    </div>
                                {/if}
                                
                                <div class="flex justify-between border-t border-gray-200 pt-3 font-bold text-lg">
                                    <span>Total</span>
                                    <span>{formatPrice($cart.totals?.total_price)}</span>
                                </div>
                            </div>
                            
                            <button 
                                on:click={placeOrderHandler}
                                disabled={isLoading || !selectedShipping}
                                class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300 disabled:opacity-50"
                            >
                                {isLoading ? 'Processing...' : 'Place Order'}
                            </button>
                            
                            <div class="mt-4 text-center text-sm text-gray-500">
                                Your personal data will be used to process your order, support your experience throughout this website, and for other purposes described in our privacy policy.
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        {/if}
    </div>
</div>