<script>
	import { goto } from '$app/navigation';
	import { api } from '$lib/api.js';
	import PasswordInput from '$lib/PasswordInput.svelte';

	let email = '';
	let password = '';
	let confirmPassword = '';
	let errorMessage = '';
	let loading = false;

	async function handleSubmit() {
		errorMessage = '';

		if (password !== confirmPassword) {
			errorMessage = 'Les mots de passe ne correspondent pas.';
			return;
		}

		loading = true;
		const res = await api.post('/auth/register', { email, password });
		loading = false;

		if (res.ok) {
			goto(`/register/check-email?email=${encodeURIComponent(email)}`);
		} else {
			errorMessage = res.message || 'Une erreur est survenue.';
		}
	}
</script>

<div class="page">
	<div class="card">
		<a href="/" class="back-link">← Accueil</a>

		<div class="logo">📚 💰 🚗</div>
		<h1>Créer mon compte</h1>
		<p class="subtitle">C'est gratuit et ça prend 30 secondes.</p>

		<form on:submit|preventDefault={handleSubmit}>
			<div class="field">
				<label for="email">Adresse email</label>
				<input
					id="email"
					type="email"
					bind:value={email}
					placeholder="toi@exemple.fr"
					required
					autocomplete="email"
				/>
			</div>

			<div class="field">
				<label for="password">Mot de passe</label>
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
				{loading ? 'Création en cours…' : 'Créer mon compte'}
			</button>
		</form>

		<p class="login-link">Déjà un compte ? <a href="/login">Se connecter</a></p>
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

	.back-link {
		display: inline-block;
		color: #888;
		text-decoration: none;
		font-size: 0.875rem;
		margin-bottom: 1.5rem;
		transition: color 0.2s;
	}

	.back-link:hover {
		color: #e87722;
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

	.field {
		margin-bottom: 1.25rem;
	}

	label {
		display: block;
		font-size: 0.875rem;
		font-weight: 600;
		color: #444;
		margin-bottom: 0.4rem;
	}

	input {
		width: 100%;
		padding: 0.7rem 1rem;
		border: 2px solid #e8e0d8;
		border-radius: 10px;
		font-size: 1rem;
		transition: border-color 0.2s;
		outline: none;
		background: #fdf6ee;
	}

	input:focus {
		border-color: #e87722;
		background: white;
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

	.btn-primary:hover:not(:disabled) {
		background: #cf6618;
	}

	.btn-primary:disabled {
		opacity: 0.7;
		cursor: not-allowed;
	}

	.login-link {
		text-align: center;
		margin-top: 1.5rem;
		font-size: 0.9rem;
		color: #666;
	}

	.login-link a {
		color: #e87722;
		font-weight: 600;
		text-decoration: none;
	}

	.login-link a:hover {
		text-decoration: underline;
	}
</style>
