<script>
	import { api } from '$lib/api.js';

	let email = '';
	let loading = false;
	let sent = false;
	let errorMessage = '';

	async function handleSubmit() {
		errorMessage = '';
		loading = true;
		const res = await api.post('/auth/forgot-password', { email });
		loading = false;

		if (res.ok) {
			sent = true;
		} else {
			errorMessage = res.message || 'Une erreur est survenue.';
		}
	}
</script>

<div class="page">
	<div class="card">
		<a href="/login" class="back-link">← Connexion</a>

		<div class="logo">📚 💰 🚗</div>
		<h1>Mot de passe oublié</h1>

		{#if sent}
			<p class="success">
				Si un compte existe avec cet email, vous recevrez un lien de réinitialisation dans quelques instants.
			</p>
			<a href="/login" class="btn-primary" style="display:block; text-align:center; text-decoration:none; margin-top:1rem;">
				Retour à la connexion
			</a>
		{:else}
			<p class="subtitle">Saisissez votre email et nous vous enverrons un lien pour réinitialiser votre mot de passe.</p>

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

				{#if errorMessage}
					<p class="error">{errorMessage}</p>
				{/if}

				<button type="submit" class="btn-primary" disabled={loading}>
					{loading ? 'Envoi en cours…' : 'Envoyer le lien'}
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

	.back-link {
		display: inline-block;
		color: #888;
		text-decoration: none;
		font-size: 0.875rem;
		margin-bottom: 1.5rem;
		transition: color 0.2s;
	}

	.back-link:hover { color: #e87722; }

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

	input {
		width: 100%;
		padding: 0.7rem 1rem;
		border: 2px solid #e8e0d8;
		border-radius: 10px;
		font-size: 1rem;
		transition: border-color 0.2s;
		outline: none;
		background: #fdf6ee;
		box-sizing: border-box;
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
