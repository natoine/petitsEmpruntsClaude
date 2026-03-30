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

		<!-- Tableau des prêts -->
		<div class="card">
			<h2>Mes prêts en cours <span class="count">{loans.length}</span></h2>
			{#if loans.length === 0}
				<p class="empty">Aucun prêt enregistré pour l'instant.</p>
			{:else}
				<div class="table-wrapper">
					<table>
						<thead>
							<tr>
								<th>Date</th>
								<th>Quoi</th>
								<th>À qui</th>
							</tr>
						</thead>
						<tbody>
							{#each loans as loan (loan._id)}
								<tr>
									<td class="date">{formatDate(loan.createdAt)}</td>
									<td class="what">{loan.what}</td>
									<td class="to">{loan.to}</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
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
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.count {
		background: #fdf6ee;
		color: #e87722;
		font-size: 0.8rem;
		font-weight: 700;
		padding: 0.1rem 0.5rem;
		border-radius: 20px;
		border: 1px solid #f0e0cc;
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

	tbody tr:hover {
		background: #fdf6ee;
	}

	tbody td {
		padding: 0.75rem;
		border-bottom: 1px solid #f5ece0;
		color: #333;
		vertical-align: middle;
	}

	tbody tr:last-child td {
		border-bottom: none;
	}

	td.date {
		white-space: nowrap;
		color: #aaa;
		font-size: 0.85rem;
		width: 110px;
	}

	td.what { font-weight: 600; }

	td.to { color: #666; }
</style>
