<script>
	import { page } from '$app/stores';
	const email = $page.url.searchParams.get('email') || 'votre adresse email';
</script>

<div class="page">
	<div class="card">
		<div class="icon">📬</div>
		<h1>Vérifiez votre boîte mail</h1>
		<p class="main-text">
			On a envoyé un lien de confirmation à <strong>{email}</strong>.
		</p>
		<p class="hint">
			Cliquez sur le lien dans l'email pour activer votre compte.<br />
			Le lien expire dans <strong>24 heures</strong>.
		</p>

		<div class="divider"></div>

		<p class="spam-note">Vous ne trouvez pas l'email ? Pensez à vérifier vos spams.</p>

		<a href="/" class="btn-ghost">Retour à l'accueil</a>
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
	}

	h1 {
		font-size: 1.5rem;
		font-weight: 800;
		color: #1a1a1a;
		margin-bottom: 1rem;
	}

	.main-text {
		font-size: 1rem;
		color: #444;
		margin-bottom: 0.75rem;
		line-height: 1.6;
	}

	.hint {
		font-size: 0.95rem;
		color: #666;
		line-height: 1.7;
		margin-bottom: 1.5rem;
	}

	.divider {
		border-top: 1px solid #f0e0cc;
		margin: 1.5rem 0;
	}

	.spam-note {
		font-size: 0.875rem;
		color: #999;
		margin-bottom: 1.5rem;
	}

	.btn-ghost {
		display: inline-block;
		padding: 0.6rem 1.5rem;
		border: 2px solid #e8e0d8;
		border-radius: 50px;
		color: #666;
		text-decoration: none;
		font-weight: 600;
		font-size: 0.9rem;
		transition: all 0.2s;
	}

	.btn-ghost:hover {
		border-color: #e87722;
		color: #e87722;
	}
</style>
