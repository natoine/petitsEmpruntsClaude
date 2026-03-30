<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { auth } from '$lib/auth.js';
	import { api } from '$lib/api.js';

	let session = null;
	let friendDisplayName = '';
	let events = [];
	let loading = true;

	const ACTION = {
		loaned:        { label: 'Vous avez prêté',   icon: '📤', color: 'orange' },
		borrowed:      { label: 'Vous avez emprunté', icon: '📥', color: 'blue'   },
		they_returned: { label: 'vous a rendu',        icon: '✅', color: 'green'  },
		i_returned:    { label: 'Vous avez rendu',     icon: '✅', color: 'green'  },
	};

	onMount(async () => {
		const unsubscribe = auth.subscribe((s) => (session = s));
		if (!session) { goto('/login'); return unsubscribe; }

		const params = $page.url.searchParams;
		const q = new URLSearchParams();
		if (params.get('friendUserId')) q.set('friendUserId', params.get('friendUserId'));
		else if (params.get('friendEmail')) q.set('friendEmail', params.get('friendEmail'));
		else if (params.get('friendName'))  q.set('friendName',  params.get('friendName'));

		const res = await api.get(`/friends/history?${q}`);
		if (res.ok) {
			friendDisplayName = res.data.friendDisplayName;
			events = res.data.events;
		}
		loading = false;

		return unsubscribe;
	});

	function formatDateTime(iso) {
		return new Date(iso).toLocaleString('fr-FR', {
			day: '2-digit', month: '2-digit', year: 'numeric',
			hour: '2-digit', minute: '2-digit',
		});
	}

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
				<a href="/app/friends" class="back-link">← Mes amis</a>
				{#if friendDisplayName}
					<span class="page-title">Historique avec {friendDisplayName}</span>
				{/if}
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
		{:else if events.length === 0}
			<div class="card">
				<p class="empty">Aucun historique avec cet ami.</p>
			</div>
		{:else}
			<div class="card">
				<table>
					<thead>
						<tr>
							<th>Date &amp; heure</th>
							<th>Action</th>
							<th>Quoi</th>
						</tr>
					</thead>
					<tbody>
						{#each events as ev}
							{@const a = ACTION[ev.type]}
							<tr>
								<td class="date">{formatDateTime(ev.date)}</td>
								<td class="action action-{a.color}">
									<span class="icon">{a.icon}</span>
									{#if ev.type === 'they_returned'}
										<span><strong>{friendDisplayName}</strong> {a.label}</span>
									{:else}
										<span>{a.label}</span>
									{/if}
								</td>
								<td class="what">{ev.what}</td>
							</tr>
						{/each}
					</tbody>
				</table>
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
		max-width: 800px;
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
		max-width: 800px;
		margin: 2.5rem auto;
		padding: 0 1.5rem;
	}

	.card {
		background: white;
		border-radius: 16px;
		padding: 1.75rem 2rem;
		box-shadow: 0 2px 12px rgba(0,0,0,0.06);
		overflow-x: auto;
	}

	.empty { color: #aaa; font-size: 0.95rem; }

	/* ── Table ── */
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

	tbody tr:hover { background: #fdf6ee; }

	tbody td {
		padding: 0.75rem;
		border-bottom: 1px solid #f5ece0;
		vertical-align: middle;
	}

	tbody tr:last-child td { border-bottom: none; }

	td.date {
		white-space: nowrap;
		color: #aaa;
		font-size: 0.85rem;
		width: 160px;
	}

	td.action {
		white-space: nowrap;
		font-weight: 600;
		display: flex;
		align-items: center;
		gap: 0.4rem;
	}

	td.action .icon { font-size: 1rem; }

	td.action-orange { color: #e87722; }
	td.action-blue   { color: #4a6a9a; }
	td.action-green  { color: #4a9a5a; }

	td.what { color: #333; }
</style>
