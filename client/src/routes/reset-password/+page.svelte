<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { api } from '$lib/api.js';
	import PasswordInput from '$lib/PasswordInput.svelte';

	let token = '';
	let password = '';
	let confirmPassword = '';
	let loading = false;
	let done = false;
	let errorMessage = '';

	onMount(() => {
		token = $page.url.searchParams.get('token') || '';
		if (!token) goto('/login');
	});

	async function handleSubmit() {
		errorMessage = '';

		if (password !== confirmPassword) {
			errorMessage = 'Les mots de passe ne correspondent pas.';
			return;
		}

		loading = true;
		const res = await api.post('/auth/reset-password', { token, password });
		loading = false;

		if (res.ok) {
			done = true;
		} else {
			errorMessage = res.message || 'Une erreur est survenue.';
		}
	}
</script>

<div class="page">
	<div class="card">
		<div class="logo">📚 💰 🚗</div>
		<h1>Nouveau mot de passe</h1>

		{#if done}
			<p class="success">Mot de passe réinitialisé ! Vous pouvez maintenant vous connecter.</p>
			<a href="/login" class="btn-primary" style="display:block; text-align:center; text-decoration:none; margin-top:1rem;">
				Se connecter
			</a>
		{:else}
			<p class="subtitle">Choisissez un nouveau mot de passe pour votre compte.</p>

			<form on:submit|preventDefault={handleSubmit}>
				<div class="field">
					<label for="password">Nouveau mot de passe</label>
					<PasswordInput
						id="password"
						bind:value={password}
						placeholder="8 caractères minimum"
						minlength="8"
						required
						autocomplete="new-password"
					/>
				</div>

				<div class="field">
					<label for="confirm">Confirmer le mot de passe</label>
					<PasswordInput
						id="confirm"
						bind:value={confirmPassword}
						placeholder="Répétez votre mot de passe"
						minlength="8"
						required
						autocomplete="new-password"
					/>
				</div>

				{#if errorMessage}
					<p class="error">{errorMessage}</p>
				{/if}

				<button type="submit" class="btn-primary" disabled={loading}>
					{loading ? 'Enregistrement…' : 'Enregistrer le mot de passe'}
				</button>
			</form>
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
	}

	.logo {
		font-size: 2rem;
		margin-bottom: 1rem;
		letter-spacing: -2px;
	}

	h1 {
		font-size: 1.6rem;
		font-weight: 800;
		color: #1a1a1a;
		margin-bottom: 0.25rem;
	}

	.subtitle {
		color: #888;
		font-size: 0.95rem;
		margin-bottom: 2rem;
	}

	.field { margin-bottom: 1.25rem; }

	label {
		display: block;
		font-size: 0.875rem;
		font-weight: 600;
		color: #444;
		margin-bottom: 0.4rem;
	}

	.error {
		background: #fff0ee;
		color: #c0392b;
		border: 1px solid #f5c6c0;
		border-radius: 8px;
		padding: 0.6rem 1rem;
		font-size: 0.9rem;
		margin-bottom: 1rem;
	}

	.success {
		background: #f0faf2;
		color: #2e7d45;
		border: 1px solid #b8e6c4;
		border-radius: 8px;
		padding: 0.75rem 1rem;
		font-size: 0.95rem;
		line-height: 1.5;
	}

	.btn-primary {
		width: 100%;
		padding: 0.875rem;
		background: #e87722;
		color: white;
		border: none;
		border-radius: 50px;
		font-size: 1rem;
		font-weight: 700;
		cursor: pointer;
		transition: background 0.2s;
		margin-top: 0.5rem;
	}

	.btn-primary:hover:not(:disabled) { background: #cf6618; }
	.btn-primary:disabled { opacity: 0.7; cursor: not-allowed; }
</style>
