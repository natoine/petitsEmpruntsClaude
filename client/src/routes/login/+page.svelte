<script>
	let email = '';
	let password = '';
</script>

<div class="page">
	<div class="card">
		<a href="/" class="back-link">← Accueil</a>

		<div class="logo">📚 💰 🚗</div>
		<h1>Se connecter</h1>
		<p class="subtitle">Content de vous revoir !</p>

		<form>
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
				<input
					id="password"
					type="password"
					bind:value={password}
					placeholder="Votre mot de passe"
					required
					autocomplete="current-password"
				/>
			</div>

			<button type="submit" class="btn-primary" disabled>
				Se connecter (bientôt disponible)
			</button>
		</form>

		<p class="register-link">Pas encore de compte ? <a href="/register">S'inscrire gratuitement</a></p>
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

	.btn-primary:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.register-link {
		text-align: center;
		margin-top: 1.5rem;
		font-size: 0.9rem;
		color: #666;
	}

	.register-link a {
		color: #e87722;
		font-weight: 600;
		text-decoration: none;
	}

	.register-link a:hover { text-decoration: underline; }
</style>
