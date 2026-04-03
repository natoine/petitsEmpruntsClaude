<script>
	const features = [
		{
			icon: '🤝',
			title: 'Simplicité Totale',
			description: 'Organisez vos prêts et emprunts en un clin d\'œil'
		},
		{
			icon: '📅',
			title: 'Souvenirs Garantis',
			description: 'N\'oubliez jamais ce que vous devez rendre à vos proches'
		},
		{
			icon: '🛡️',
			title: 'Communauté de Confiance',
			description: 'Prêtez en toute sécurité à votre entourage proche'
		}
	];

	const items = [
		{ icon: '📚', label: 'un livre' },
		{ icon: '🌿', label: 'une tondeuse' },
		{ icon: '🚗', label: 'une voiture' },
		{ icon: '💶', label: '20€' },
		{ icon: '🥡', label: 'un Tupperware' }
	];
</script>

<!-- Navigation -->
<header class="navbar">
	<div class="navbar-inner">
		<a href="/" class="logo">
			<span class="logo-icons">📚 💰 🚗 🧰</span>
			<span class="logo-text">PETITS EMPRUNTS<br />ENTRE AMIS</span>
		</a>
		<nav class="nav-links">
			<a href="#how">Comment ça marche ?</a>
			<a href="#avantages">Avantages</a>
		</nav>
		<div class="nav-actions">
			<a href="/login" class="btn btn-outline">Se connecter</a>
			<a href="/register" class="btn btn-primary">S'inscrire gratuitement</a>
		</div>
	</div>
</header>

<!-- Hero -->
<section class="hero">
	<div class="hero-content">
		<h1>
			<span class="h1-accent">Parce que fabriquer moins commence par partager plus.</span><br />
			Ce que tu possèdes peut servir à quelqu'un.<br />
			Ce dont tu as besoin existe peut-être déjà.
		</h1>
		<p>
			Petits Emprunts Entre Amis te permet de mutualiser ce que tu possèdes avec tes proches.
			L'application simple pour prêter et emprunter tout ce que vous voulez
			(BD, outils, voiture, argent…) à vos amis, sans oubli.
		</p>
		<div class="hero-actions">
			<a href="/register" class="btn btn-primary btn-large">C'est gratuit, je m'inscris !</a>
			<a href="#how" class="btn btn-ghost btn-large">Découvrir le concept</a>
		</div>
	</div>
	<div class="hero-image">
		<div class="hero-illustration">
			<span>👨‍👩‍👧‍👦</span>
			<span>🎸</span>
			<span>📖</span>
			<span>🔨</span>
		</div>
	</div>
</section>

<!-- Features -->
<section class="features" id="avantages">
	{#each features as feature}
		<div class="feature-card">
			<div class="feature-icon">{feature.icon}</div>
			<h3>{feature.title}</h3>
			<p>{feature.description}</p>
		</div>
	{/each}
</section>

<!-- Items showcase -->
<section class="items-showcase">
	<p class="items-label">Prêtez ou empruntez n'importe quoi :</p>
	<div class="items-list">
		{#each items as item}
			<div class="item-card">
				<span class="item-icon">{item.icon}</span>
				<span class="item-name">{item.label}</span>
			</div>
		{/each}
	</div>
</section>

<!-- How it works -->
<section class="how-it-works" id="how">
	<h2>Comment ça marche ?</h2>
	<div class="steps">
		<div class="step">
			<div class="step-number">1</div>
			<h3>Créez votre compte</h3>
			<p>Inscrivez-vous gratuitement en quelques secondes.</p>
		</div>
		<div class="step-arrow">→</div>
		<div class="step">
			<div class="step-number">2</div>
			<h3>Ajoutez un prêt</h3>
			<p>Enregistrez ce que vous prêtez ou empruntez, et à qui.</p>
		</div>
		<div class="step-arrow">→</div>
		<div class="step">
			<div class="step-number">3</div>
			<h3>Restez serein</h3>
			<p>Recevez des rappels automatiques, ne perdez plus rien.</p>
		</div>
	</div>
</section>

<!-- CTA final -->
<section class="cta-section">
	<h2>Prêt à simplifier vos échanges ?</h2>
	<p>Rejoignez des milliers d'amis qui partagent en toute confiance.</p>
	<a href="/register" class="btn btn-primary btn-large">C'est gratuit, je m'inscris !</a>
</section>

<footer class="footer">
	<p>© 2026 Petits Emprunts Entre Amis — <a href="/mentions">Mentions légales</a></p>
</footer>

<style>
	/* ── Navbar ── */
	.navbar {
		background: #fdf6ee;
		border-bottom: 1px solid #f0e0cc;
		position: sticky;
		top: 0;
		z-index: 100;
	}

	.navbar-inner {
		max-width: 1200px;
		margin: 0 auto;
		padding: 0.75rem 2rem;
		display: flex;
		align-items: center;
		gap: 2rem;
	}

	.logo {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		text-decoration: none;
		flex-shrink: 0;
	}

	.logo-icons {
		font-size: 1.4rem;
		letter-spacing: -2px;
	}

	.logo-text {
		font-size: 0.75rem;
		font-weight: 800;
		color: #c75c00;
		text-transform: uppercase;
		line-height: 1.2;
		letter-spacing: 0.03em;
	}

	.nav-links {
		display: flex;
		gap: 2rem;
		flex: 1;
		justify-content: center;
	}

	.nav-links a {
		text-decoration: none;
		color: #444;
		font-size: 0.95rem;
		font-weight: 500;
		transition: color 0.2s;
	}

	.nav-links a:hover {
		color: #e87722;
	}

	.nav-actions {
		display: flex;
		gap: 0.75rem;
		align-items: center;
		flex-shrink: 0;
	}

	/* ── Buttons ── */
	.btn {
		display: inline-block;
		padding: 0.5rem 1.25rem;
		border-radius: 50px;
		font-weight: 600;
		font-size: 0.9rem;
		text-decoration: none;
		cursor: pointer;
		transition: all 0.2s;
	}

	.btn-outline {
		border: 2px solid #2d2d2d;
		color: #2d2d2d;
		background: transparent;
	}

	.btn-outline:hover {
		background: #2d2d2d;
		color: white;
	}

	.btn-primary {
		background: #e87722;
		color: white;
		border: 2px solid #e87722;
	}

	.btn-primary:hover {
		background: #cf6618;
		border-color: #cf6618;
	}

	.btn-ghost {
		color: #444;
		border: 2px solid transparent;
		background: transparent;
	}

	.btn-ghost:hover {
		color: #e87722;
	}

	.btn-large {
		padding: 0.75rem 1.75rem;
		font-size: 1rem;
	}

	/* ── Hero ── */
	.hero {
		max-width: 1200px;
		margin: 0 auto;
		padding: 5rem 2rem 4rem;
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 4rem;
		align-items: center;
	}

	.hero-content h1 {
		font-size: 2.5rem;
		font-weight: 800;
		line-height: 1.2;
		color: #1a1a1a;
		margin-bottom: 1.25rem;
	}

	.h1-accent {
		font-size: 1.1rem;
		font-weight: 600;
		color: #e87722;
		font-style: italic;
	}

	.hero-content p {
		font-size: 1.1rem;
		color: #555;
		line-height: 1.7;
		margin-bottom: 2rem;
	}

	.hero-actions {
		display: flex;
		gap: 1rem;
		flex-wrap: wrap;
		align-items: center;
	}

	.hero-image {
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.hero-illustration {
		background: linear-gradient(135deg, #ffe8d0 0%, #ffd4a8 100%);
		border-radius: 24px;
		width: 100%;
		aspect-ratio: 4/3;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 1rem;
		font-size: 4rem;
		box-shadow: 0 8px 32px rgba(0,0,0,0.08);
	}

	/* ── Features ── */
	.features {
		background: white;
		padding: 4rem 2rem;
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 2rem;
		max-width: 1200px;
		margin: 0 auto 0;
	}

	.feature-card {
		text-align: center;
		padding: 2rem 1.5rem;
	}

	.feature-icon {
		font-size: 3rem;
		margin-bottom: 1rem;
	}

	.feature-card h3 {
		font-size: 1.1rem;
		font-weight: 700;
		margin-bottom: 0.5rem;
		color: #1a1a1a;
	}

	.feature-card p {
		font-size: 0.95rem;
		color: #666;
		line-height: 1.6;
	}

	/* ── Items showcase ── */
	.items-showcase {
		background: #fdf6ee;
		padding: 3rem 2rem;
		text-align: center;
	}

	.items-label {
		font-size: 1rem;
		color: #666;
		margin-bottom: 1.5rem;
		font-weight: 500;
	}

	.items-list {
		display: flex;
		justify-content: center;
		gap: 2.5rem;
		flex-wrap: wrap;
		max-width: 900px;
		margin: 0 auto;
	}

	.item-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
	}

	.item-icon {
		font-size: 3rem;
		display: block;
		background: white;
		border-radius: 16px;
		padding: 1rem;
		box-shadow: 0 2px 12px rgba(0,0,0,0.07);
		width: 80px;
		height: 80px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.item-name {
		font-size: 0.9rem;
		color: #555;
		font-weight: 500;
	}

	/* ── How it works ── */
	.how-it-works {
		background: white;
		padding: 5rem 2rem;
		text-align: center;
	}

	.how-it-works h2 {
		font-size: 2rem;
		font-weight: 800;
		margin-bottom: 3rem;
		color: #1a1a1a;
	}

	.steps {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 1rem;
		flex-wrap: wrap;
		max-width: 900px;
		margin: 0 auto;
	}

	.step {
		background: #fdf6ee;
		border-radius: 16px;
		padding: 2rem 1.5rem;
		width: 220px;
		text-align: center;
	}

	.step-number {
		width: 48px;
		height: 48px;
		background: #e87722;
		color: white;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1.4rem;
		font-weight: 800;
		margin: 0 auto 1rem;
	}

	.step h3 {
		font-size: 1rem;
		font-weight: 700;
		margin-bottom: 0.5rem;
		color: #1a1a1a;
	}

	.step p {
		font-size: 0.9rem;
		color: #666;
		line-height: 1.5;
	}

	.step-arrow {
		font-size: 2rem;
		color: #e87722;
		font-weight: 700;
	}

	/* ── CTA section ── */
	.cta-section {
		background: linear-gradient(135deg, #e87722 0%, #cf6618 100%);
		padding: 5rem 2rem;
		text-align: center;
		color: white;
	}

	.cta-section h2 {
		font-size: 2rem;
		font-weight: 800;
		margin-bottom: 0.75rem;
	}

	.cta-section p {
		font-size: 1.1rem;
		opacity: 0.9;
		margin-bottom: 2rem;
	}

	.cta-section .btn-primary {
		background: white;
		color: #e87722;
		border-color: white;
		font-size: 1.1rem;
		padding: 0.875rem 2rem;
	}

	.cta-section .btn-primary:hover {
		background: #fff8f0;
		border-color: #fff8f0;
	}

	/* ── Footer ── */
	.footer {
		background: #2d2d2d;
		color: #aaa;
		text-align: center;
		padding: 1.5rem 2rem;
		font-size: 0.875rem;
	}

	.footer a {
		color: #e87722;
		text-decoration: none;
	}

	/* ── Responsive ── */
	@media (max-width: 768px) {
		.hero {
			grid-template-columns: 1fr;
			padding: 3rem 1.5rem;
			gap: 2rem;
		}

		.hero-content h1 {
			font-size: 1.75rem;
		}

		.features {
			grid-template-columns: 1fr;
			padding: 2rem 1.5rem;
		}

		.nav-links {
			display: none;
		}

		.steps {
			flex-direction: column;
			align-items: center;
		}

		.step-arrow {
			transform: rotate(90deg);
		}
	}
</style>
