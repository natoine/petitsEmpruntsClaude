<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { auth } from '$lib/auth.js';
	import { api } from '$lib/api.js';

	let session = null;
	let loans = [];
	let what = '';
	let to = '';
	let submitting = false;
	let errorMessage = '';
	let activeTab = 'active';

	$: activeLoans = loans.filter((l) => !l.returnedAt);
	$: doneLoans = loans.filter((l) => l.returnedAt);

	onMount(async () => {
		const unsubscribe = auth.subscribe((s) => (session = s));
		if (!session) { goto('/login'); return unsubscribe; }
		await loadLoans();
		return unsubscribe;
	});

	async function loadLoans() {
		const res = await api.get('/loans');
		if (res.ok) loans = res.data;
	}

	async function handleSubmit() {
		errorMessage = '';
		submitting = true;
		const res = await api.post('/loans', { what, to });
		submitting = false;

		if (res.ok) {
			loans = [res.data, ...loans];
			what = '';
			to = '';
		} else {
			errorMessage = res.message || 'Une erreur est survenue.';
		}
	}

	async function handleReturn(id) {
		const res = await api.patch(`/loans/${id}/return`, {});
		if (res.ok) {
			loans = loans.map((l) => (l._id === id ? res.data : l));
		}
	}

	function handleLogout() {
		auth.logout();
		goto('/');
	}

	function formatDate(iso) {
		return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
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
		<h1>Bonjour&nbsp;👋</h1>

		<!-- Formulaire -->
		<div class="card">
			<h2>Enregistrer un prêt</h2>
			<form class="loan-form" on:submit|preventDefault={handleSubmit}>
				<span class="form-label">J'ai prêté</span>
				<input
					type="text"
					bind:value={what}
					placeholder="quoi (ex : tome 3 de Thorgal)"
					required
					maxlength="200"
				/>
				<span class="form-label">à</span>
				<input
					type="text"
					bind:value={to}
					placeholder="qui (ex : Marie)"
					required
					maxlength="100"
				/>
				<button type="submit" class="btn-primary" disabled={submitting}>
					{submitting ? '…' : 'Enregistrer'}
				</button>
			</form>
			{#if errorMessage}
				<p class="error">{errorMessage}</p>
			{/if}
		</div>

		<!-- Onglets + tableaux -->
		<div class="card">
			<div class="tabs">
				<button
					class="tab"
					class:active={activeTab === 'active'}
					on:click={() => (activeTab = 'active')}
				>
					Prêts en cours <span class="badge">{activeLoans.length}</span>
				</button>
				<button
					class="tab"
					class:active={activeTab === 'done'}
					on:click={() => (activeTab = 'done')}
				>
					Prêts terminés <span class="badge">{doneLoans.length}</span>
				</button>
			</div>

			{#if activeTab === 'active'}
				{#if activeLoans.length === 0}
					<p class="empty">Aucun prêt en cours.</p>
				{:else}
					<div class="table-wrapper">
						<table>
							<thead>
								<tr>
									<th>Date</th>
									<th>Quoi</th>
									<th>À qui</th>
									<th></th>
								</tr>
							</thead>
							<tbody>
								{#each activeLoans as loan (loan._id)}
									<tr>
										<td class="date">{formatDate(loan.createdAt)}</td>
										<td class="what">{loan.what}</td>
										<td class="to">{loan.to}</td>
										<td class="action">
											<button class="btn-return" on:click={() => handleReturn(loan._id)}>
												Je l'ai récupéré
											</button>
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				{/if}

			{:else}
				{#if doneLoans.length === 0}
					<p class="empty">Aucun prêt terminé pour l'instant.</p>
				{:else}
					<div class="table-wrapper">
						<table>
							<thead>
								<tr>
									<th>Date de prêt</th>
									<th>Quoi</th>
									<th>À qui</th>
									<th>Date de rendu</th>
								</tr>
							</thead>
							<tbody>
								{#each doneLoans as loan (loan._id)}
									<tr>
										<td class="date">{formatDate(loan.createdAt)}</td>
										<td class="what">{loan.what}</td>
										<td class="to">{loan.to}</td>
										<td class="date">{formatDate(loan.returnedAt)}</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				{/if}
			{/if}
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
		max-width: 800px;
		margin: 2.5rem auto;
		padding: 0 1.5rem;
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	h1 {
		font-size: 1.75rem;
		font-weight: 800;
		color: #1a1a1a;
	}

	/* ── Card ── */
	.card {
		background: white;
		border-radius: 16px;
		padding: 1.75rem 2rem;
		box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
	}

	h2 {
		font-size: 1rem;
		font-weight: 700;
		color: #1a1a1a;
		margin-bottom: 1.25rem;
	}

	/* ── Loan form ── */
	.loan-form {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		flex-wrap: wrap;
	}

	.form-label {
		font-size: 0.95rem;
		color: #555;
		font-weight: 500;
		white-space: nowrap;
	}

	.loan-form input {
		flex: 1;
		min-width: 140px;
		padding: 0.6rem 0.9rem;
		border: 2px solid #e8e0d8;
		border-radius: 10px;
		font-size: 0.95rem;
		outline: none;
		background: #fdf6ee;
		transition: border-color 0.2s;
	}

	.loan-form input:focus {
		border-color: #e87722;
		background: white;
	}

	.btn-primary {
		padding: 0.6rem 1.4rem;
		background: #e87722;
		color: white;
		border: none;
		border-radius: 50px;
		font-size: 0.95rem;
		font-weight: 700;
		cursor: pointer;
		white-space: nowrap;
		transition: background 0.2s;
	}

	.btn-primary:hover:not(:disabled) { background: #cf6618; }

	.btn-primary:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.error {
		margin-top: 0.75rem;
		color: #c0392b;
		font-size: 0.9rem;
	}

	/* ── Tabs ── */
	.tabs {
		display: flex;
		gap: 0;
		border-bottom: 2px solid #f0e0cc;
		margin-bottom: 1.25rem;
	}

	.tab {
		padding: 0.6rem 1.25rem;
		background: none;
		border: none;
		border-bottom: 2px solid transparent;
		margin-bottom: -2px;
		font-size: 0.9rem;
		font-weight: 600;
		color: #aaa;
		cursor: pointer;
		display: flex;
		align-items: center;
		gap: 0.4rem;
		transition: color 0.15s;
	}

	.tab:hover { color: #e87722; }

	.tab.active {
		color: #e87722;
		border-bottom-color: #e87722;
	}

	.badge {
		background: #fdf6ee;
		color: #e87722;
		font-size: 0.75rem;
		font-weight: 700;
		padding: 0.1rem 0.45rem;
		border-radius: 20px;
		border: 1px solid #f0e0cc;
	}

	.tab.active .badge {
		background: #e87722;
		color: white;
		border-color: #e87722;
	}

	/* ── Table ── */
	.empty {
		color: #aaa;
		font-size: 0.95rem;
	}

	.table-wrapper {
		overflow-x: auto;
	}

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
	}

	thead th:last-child { text-align: right; }

	tbody tr:hover { background: #fdf6ee; }

	tbody td {
		padding: 0.75rem;
		border-bottom: 1px solid #f5ece0;
		color: #333;
		vertical-align: middle;
	}

	tbody tr:last-child td { border-bottom: none; }

	td.date {
		white-space: nowrap;
		color: #aaa;
		font-size: 0.85rem;
		width: 110px;
	}

	td.what { font-weight: 600; }

	td.to { color: #666; }

	td.action { text-align: right; }

	.btn-return {
		padding: 0.35rem 0.85rem;
		background: transparent;
		border: 1.5px solid #d0e8d0;
		border-radius: 50px;
		color: #4a9a5a;
		font-size: 0.8rem;
		font-weight: 600;
		cursor: pointer;
		white-space: nowrap;
		transition: all 0.2s;
	}

	.btn-return:hover {
		background: #4a9a5a;
		border-color: #4a9a5a;
		color: white;
	}
</style>
