<script>
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { api } from '$lib/api.js';

	let status = 'loading'; // 'loading' | 'success' | 'error'
	let message = '';

	onMount(async () => {
		const token = $page.url.searchParams.get('token');

		if (!token) {
			status = 'error';
			message = 'Lien invalide.';
			return;
		}

		const res = await api.get(`/auth/verify-email?token=${token}`);

		if (res.ok) {
			status = 'success';
		} else {
			status = 'error';
			message = res.message || 'Lien invalide ou expiré.';
		}
	});
</script>

<div class="page">
	<div class="card">
		{#if status === 'loading'}
			<div class="icon spinning">⏳</div>
			<h1>Vérification en cours…</h1>

		{:else if status === 'success'}
			<div class="icon">✅</div>
			<h1>Email confirmé !</h1>
			<p class="text">Votre compte est activé. Vous pouvez maintenant vous connecter.</p>
			<a href="/login" class="btn-primary">Se connecter</a>

		{:else}
			<div class="icon">❌</div>
			<h1>Lien invalide</h1>
			<p class="text">{message}</p>
			<p class="hint">Le lien a peut-être expiré (validité 24h). Vous pouvez vous réinscrire pour en recevoir un nouveau.</p>
			<a href="/register" class="btn-primary">Réessayer</a>
		{/if}
	</div>
</div>

<style>
	.page {
		min-height: 100vh;
		background: #fdf6ee;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 2rem;
	}

	.card {
		background: white;
		border-radius: 20px;
		padding: 2.5rem;
		width: 100%;
		max-width: 420px;
		box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
		text-align: center;
	}

	.icon {
		font-size: 4rem;
		margin-bottom: 1rem;
		display: block;
	}

	.spinning {
		animation: pulse 1.5s ease-in-out infinite;
	}

	@keyframes pulse {
		0%, 100% { opacity: 1; }
		50% { opacity: 0.4; }
	}

	h1 {
		font-size: 1.5rem;
		font-weight: 800;
		color: #1a1a1a;
		margin-bottom: 1rem;
	}

	.text {
		font-size: 1rem;
		color: #555;
		margin-bottom: 1.5rem;
		line-height: 1.6;
	}

	.hint {
		font-size: 0.875rem;
		color: #999;
		margin-bottom: 1.5rem;
		line-height: 1.6;
	}

	.btn-primary {
		display: inline-block;
		padding: 0.75rem 2rem;
		background: #e87722;
		color: white;
		border-radius: 50px;
		text-decoration: none;
		font-weight: 700;
		font-size: 1rem;
		transition: background 0.2s;
	}

	.btn-primary:hover {
		background: #cf6618;
	}
</style>
