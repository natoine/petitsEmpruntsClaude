<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { auth } from '$lib/auth.js';

	let session = null;

	onMount(() => {
		const unsubscribe = auth.subscribe((s) => (session = s));
		if (!session) goto('/login');
		return unsubscribe;
	});

	function handleLogout() {
		auth.logout();
		goto('/');
	}
</script>

{#if session}
	<div class="page">
		<header class="topbar">
			<div class="topbar-inner">
				<a href="/" class="logo">
					<span class="logo-icons">📚 💰 🚗</span>
					<span class="logo-text">PETITS EMPRUNTS<br />ENTRE AMIS</span>
				</a>
				<div class="user-area">
					<span class="user-email">{session.email}</span>
					<button class="btn-logout" on:click={handleLogout}>Se déconnecter</button>
				</div>
			</div>
		</header>

		<main class="main">
			<div class="welcome-card">
				<div class="avatar">👋</div>
				<h1>Bonjour&nbsp;!</h1>
				<p class="email-display">{session.email}</p>
				<p class="subtitle">Vous êtes bien connecté.</p>
			</div>

			<div class="coming-soon-card">
				<div class="cs-icon">🚧</div>
				<h2>La suite arrive bientôt</h2>
				<p>
					Ici, vous pourrez bientôt enregistrer vos prêts et emprunts,
					voir ce que vous devez à vos amis (et ce qu'ils vous doivent),
					et recevoir des rappels automatiques.
				</p>
				<ul class="feature-list">
					<li>📋 Mes prêts en cours</li>
					<li>🤝 Mes emprunts en cours</li>
					<li>🔔 Rappels automatiques</li>
					<li>👥 Mon cercle d'amis</li>
				</ul>
			</div>
		</main>
	</div>
{/if}

<style>
	.page {
		min-height: 100vh;
		background: #fdf6ee;
	}

	/* ── Topbar ── */
	.topbar {
		background: white;
		border-bottom: 1px solid #f0e0cc;
		position: sticky;
		top: 0;
		z-index: 100;
	}

	.topbar-inner {
		max-width: 900px;
		margin: 0 auto;
		padding: 0.75rem 2rem;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.logo {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		text-decoration: none;
	}

	.logo-icons { font-size: 1.4rem; letter-spacing: -2px; }

	.logo-text {
		font-size: 0.7rem;
		font-weight: 800;
		color: #c75c00;
		text-transform: uppercase;
		line-height: 1.2;
	}

	.user-area {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.user-email {
		font-size: 0.875rem;
		color: #666;
	}

	.btn-logout {
		padding: 0.4rem 1rem;
		border: 2px solid #e8e0d8;
		border-radius: 50px;
		background: transparent;
		color: #666;
		font-size: 0.875rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
	}

	.btn-logout:hover {
		border-color: #e87722;
		color: #e87722;
	}

	/* ── Main ── */
	.main {
		max-width: 600px;
		margin: 3rem auto;
		padding: 0 1.5rem;
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	/* ── Welcome card ── */
	.welcome-card {
		background: white;
		border-radius: 20px;
		padding: 2.5rem;
		text-align: center;
		box-shadow: 0 2px 16px rgba(0, 0, 0, 0.06);
	}

	.avatar {
		font-size: 3.5rem;
		margin-bottom: 0.75rem;
	}

	h1 {
		font-size: 2rem;
		font-weight: 800;
		color: #1a1a1a;
		margin-bottom: 0.5rem;
	}

	.email-display {
		font-size: 1rem;
		color: #e87722;
		font-weight: 600;
		margin-bottom: 0.25rem;
	}

	.subtitle {
		font-size: 0.9rem;
		color: #aaa;
	}

	/* ── Coming soon card ── */
	.coming-soon-card {
		background: white;
		border-radius: 20px;
		padding: 2rem 2.5rem;
		box-shadow: 0 2px 16px rgba(0, 0, 0, 0.06);
	}

	.cs-icon {
		font-size: 2rem;
		margin-bottom: 0.75rem;
	}

	h2 {
		font-size: 1.25rem;
		font-weight: 800;
		color: #1a1a1a;
		margin-bottom: 0.75rem;
	}

	.coming-soon-card p {
		font-size: 0.95rem;
		color: #666;
		line-height: 1.7;
		margin-bottom: 1.25rem;
	}

	.feature-list {
		list-style: none;
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
	}

	.feature-list li {
		font-size: 0.95rem;
		color: #888;
		padding: 0.5rem 0.75rem;
		background: #fdf6ee;
		border-radius: 8px;
	}
</style>
