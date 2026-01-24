<!-- svelte-ignore a11y_no_static_element_interactions -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- src/components/CartModal.svelte -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<script>
	import { cart, updateCartItem, removeCartItem } from "../lib/stores";
	import { router } from "../router";

	export let onClose;
	let isLoading = false;
	let error = null;

	// Format price
	const formatPrice = (price) => {
		if (!$cart.totals || !price) return "0";
		return `${$cart.totals.currency_prefix}${parseFloat(price).toFixed(2)}`;
	};

	// Get selected shipping method
	const getSelectedShippingMethod = () => {
		if (!$cart.shipping_rates || $cart.shipping_rates.length === 0)
			return null;

		const firstPackage = $cart.shipping_rates[0];
		if (!firstPackage.shipping_rates) return null;

		const selectedRate = firstPackage.shipping_rates.find(
			(rate) => rate.selected,
		);
		return (
			selectedRate ||
			(firstPackage.shipping_rates.length > 0
				? firstPackage.shipping_rates[0]
				: null)
		);
	};

	// Handle quantity changes
	const handleQuantityChange = async (key, quantity) => {
		if (quantity < 1) return;
		try {
			isLoading = true;
			await updateCartItem(key, quantity);
		} catch (err) {
			error = err.message || "Failed to update cart";
		} finally {
			isLoading = false;
		}
	};

	// Handle item removal
	const handleRemoveItem = async (key) => {
		try {
			isLoading = true;
			await removeCartItem(key);
		} catch (err) {
			error = err.message || "Failed to remove item";
		} finally {
			isLoading = false;
		}
	};
</script>

<div
	class="fixed inset-0 backdrop-blur-2xl bg-opacity-50 z-50 flex justify-end"
	on:click|self={onClose}
>
	<div class="bg-black w-full max-w-md h-full overflow-auto">
		<div class="p-4 border-b flex justify-between items-center">
			<h2 class="text-white text-xl font-bold">Your Cart</h2>
			<!-- svelte-ignore a11y_consider_explicit_label -->
			<button
				on:click={onClose}
				class="text-gray-200 hover:text-gray-300"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-6 w-6"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M6 18L18 6M6 6l12 12"
					/>
				</svg>
			</button>
		</div>

		{#if $cart.isLoading || isLoading}
			<div class="flex justify-center items-center h-64">
				<div
					class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"
				></div>
			</div>
		{:else if $cart.items_count === 0}
			<div class="text-center py-16">
				<h3
					class="text-lg text-white font-semibold mb-4"
				>
					Your cart is empty
				</h3>
				<button
					on:click={onClose}
					class="text-blue-600 hover:underline"
					>Continue Shopping</button
				>
			</div>
		{:else}
			<div class="divide-y divide-gray-200">
				{#each $cart.items as item}
					<div class="p-4 flex items-center">
						<div
							class="flex-shrink-0 w-16 h-16 bg-gray-800 rounded overflow-hidden"
						>
							{#if item.images && item.images[0]}
								<img
									src={item
										.images[0]
										.src}
									alt={item.name}
									class="w-full h-full object-cover"
								/>
							{:else}
								<div
									class="w-full h-full flex items-center justify-center text-gray-400 text-xs"
								>
									No image
								</div>
							{/if}
						</div>

						<div class="ml-4 flex-grow">
							<h3
								class="text-white font-medium"
							>
								{item.name}
							</h3>
							<p
								class="text-gray-200"
							>
								{$cart.totals
									.currency_code}
								{parseFloat(
									item
										.prices
										.price,
								)}
							</p>

							<div
								class="mt-2 flex items-center"
							>
								<button
									on:click={() =>
										handleQuantityChange(
											item.key,
											item.quantity -
												1,
										)}
									class="w-6 h-6 flex items-center justify-center bg-gray-200 rounded-l"
									disabled={item.quantity <=
										1}
								>
									-
								</button>
								<span
									class="text-white w-8 text-center"
									>{item.quantity}</span
								>
								<button
									on:click={() =>
										handleQuantityChange(
											item.key,
											item.quantity +
												1,
										)}
									class="w-6 h-6 flex items-center justify-center bg-gray-200 rounded-r"
								>
									+
								</button>

								<button
									on:click={() =>
										handleRemoveItem(
											item.key,
										)}
									class="ml-4 text-red-600 hover:text-red-800 text-sm"
								>
									Remove
								</button>
							</div>
						</div>
					</div>
				{/each}
			</div>

			<div class="p-4 border-t">
				<!-- Shipping Information -->
				{#if $cart.needs_shipping && $cart.shipping_rates && $cart.shipping_rates.length > 0}
					<div>
						<h3
							class="font-semibold text-white"
						>
							Shipping Method
						</h3>
						{#each $cart.shipping_rates as pkge}
							<ul>
								{#each pkge.shipping_rates as rate}
									<li
										class:selected={rate.selected}
									>
										<span
											class="text-white"
										>
											{#if parseFloat(rate.price) === 0}
												Free
											{:else}
												<i>Applied at checkout</i>
											{/if}
										</span>
									</li>
								{/each}
							</ul>
						{/each}
					</div>
				{/if}
				<div class="flex justify-between mb-2">
					<span class="text-white font-semibold"
						>Subtotal</span
					>
					<span class="text-white"
						>{$cart.totals.currency_code}
						{parseFloat(
							$cart.totals
								.total_items,
						)}</span
					>
				</div>
				<button
					class="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
					on:click={() => {
						onClose();
						router.navigate("/checkout");
					}}
				>
					Checkout
				</button>
				<button
					on:click={onClose}
					class="w-full mt-2 text-center text-blue-600 hover:underline"
				>
					Continue Shopping
				</button>
			</div>
		{/if}
	</div>
</div>
