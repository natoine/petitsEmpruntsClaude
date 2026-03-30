<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { auth } from '$lib/auth.js';
	import { api } from '$lib/api.js';

	let session = null;
	let friends = [];
	let loading = true;

	onMount(async () => {
		const unsubscribe = auth.subscribe((s) => (session = s));
		if (!session) { goto('/login'); return unsubscribe; }

		const res = await api.get('/friends');
		if (res.ok) friends = res.data;
		loading = false;

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
			<div class="topbar-left">
				<a href="/app" class="back-link">← Mes prêts</a>
				<span class="page-title">Mes amis</span>
			</div>
			<div class="user-area">
				<a href="/app/profile" class="user-link">{session.username || session.email}</a>
				<button class="btn-logout" on:click={handleLogout}>Se déconnecter</button>
			</div>
		</div>
	</header>

	<main class="main">
		{#if loading}
			<p class="empty">Chargement…</p>
		{:else if friends.length === 0}
			<div class="card">
				<p class="empty">Aucun ami pour l'instant. Enregistrez un prêt ou un emprunt pour voir apparaître vos contacts ici.</p>
			</div>
		{:else}
			<div class="card">
				<div class="table-wrapper">
					<table>
						<thead>
							<tr>
								<th>Nom / Pseudo</th>
								<th>Email</th>
								<th class="num" title="Prêts en cours">📤 en cours</th>
								<th class="num" title="Emprunts en cours">📥 en cours</th>
								<th class="num" title="Prêts terminés">📤 terminés</th>
								<th class="num" title="Emprunts terminés">📥 terminés</th>
							</tr>
						</thead>
						<tbody>
							{#each friends as f}
								<tr>
									<td class="name">{f.name}</td>
									<td class="email">{f.email ?? '—'}</td>
									<td class="num">{#if f.loansActive > 0}<span class="pill pill-active">{f.loansActive}</span>{:else}<span class="zero">0</span>{/if}</td>
									<td class="num">{#if f.borrowsActive > 0}<span class="pill pill-active">{f.borrowsActive}</span>{:else}<span class="zero">0</span>{/if}</td>
									<td class="num">{#if f.loansDone > 0}<span class="pill pill-done">{f.loansDone}</span>{:else}<span class="zero">0</span>{/if}</td>
									<td class="num">{#if f.borrowsDone > 0}<span class="pill pill-done">{f.borrowsDone}</span>{:else}<span class="zero">0</span>{/if}</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</div>
		{/if}
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
		max-width: 960px;
		margin: 0 auto;
		padding: 0.75rem 2rem;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.topbar-left {
		display: flex;
		align-items: center;
		gap: 1.25rem;
	}

	.back-link {
		font-size: 0.875rem;
		color: #aaa;
		text-decoration: none;
		font-weight: 600;
		transition: color 0.2s;
	}

	.back-link:hover { color: #e87722; }

	.page-title {
		font-size: 1rem;
		font-weight: 800;
		color: #1a1a1a;
	}

	.user-area {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.user-link {
		font-size: 0.875rem;
		color: #666;
		text-decoration: none;
		font-weight: 600;
		transition: color 0.2s;
	}

	.user-link:hover { color: #e87722; }

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

	.btn-logout:hover { border-color: #e87722; color: #e87722; }

	/* ── Main ── */
	.main {
		max-width: 960px;
		margin: 2.5rem auto;
		padding: 0 1.5rem;
	}

	.card {
		background: white;
		border-radius: 16px;
		padding: 1.75rem 2rem;
		box-shadow: 0 2px 12px rgba(0,0,0,0.06);
	}

	.empty {
		color: #aaa;
		font-size: 0.95rem;
	}

	/* ── Table ── */
	.table-wrapper { overflow-x: auto; }

	table {
		width: 100%;
		border-collapse: collapse;
		font-size: 0.9rem;
	}

	thead th {
		text-align: left;
		font-size: 0.75rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: #aaa;
		padding: 0 0.75rem 0.6rem;
		border-bottom: 2px solid #f0e0cc;
		white-space: nowrap;
	}

	thead th.num { text-align: center; }

	tbody tr:hover { background: #fdf6ee; }

	tbody td {
		padding: 0.75rem;
		border-bottom: 1px solid #f5ece0;
		vertical-align: middle;
	}

	tbody tr:last-child td { border-bottom: none; }

	td.name  { font-weight: 600; color: #1a1a1a; }
	td.email { color: #aaa; font-size: 0.85rem; }
	td.num   { text-align: center; }

	.pill {
		display: inline-block;
		min-width: 1.6rem;
		padding: 0.15rem 0.5rem;
		border-radius: 20px;
		font-size: 0.8rem;
		font-weight: 700;
		text-align: center;
	}

	.pill-active {
		background: #fff0e0;
		color: #e87722;
	}

	.pill-done {
		background: #f0f0f0;
		color: #999;
	}

	.zero {
		color: #ddd;
		font-size: 0.85rem;
	}
</style>
