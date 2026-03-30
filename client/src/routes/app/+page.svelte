<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { auth } from '$lib/auth.js';
	import { api } from '$lib/api.js';

	let session = null;
	let entries = [];

	// Formulaire
	let formTab = 'loan';   // 'loan' | 'borrow'
	let what = '';
	let counterpart = '';
	let submitting = false;
	let errorMessage = '';

	// Autocomplete
	let suggestions = [];
	let showSuggestions = false;
	let searchTimer = null;

	async function onCounterpartInput() {
		clearTimeout(searchTimer);
		const val = counterpart.trim();
		if (val.length < 2) { suggestions = []; showSuggestions = false; return; }
		searchTimer = setTimeout(async () => {
			const res = await api.get(`/users/search?q=${encodeURIComponent(val)}`);
			if (res.ok && res.data.length > 0) {
				suggestions = res.data;
				showSuggestions = true;
			} else {
				suggestions = [];
				showSuggestions = false;
			}
		}, 200);
	}

	function selectSuggestion(s) {
		counterpart = s.email; // on envoie l'email au serveur pour la résolution
		showSuggestions = false;
		suggestions = [];
	}

	function closeSuggestions() {
		// petit délai pour laisser le clic sur suggestion se déclencher
		setTimeout(() => { showSuggestions = false; }, 150);
	}

	// Tableau
	let tableTab = 'loans-active'; // 'loans-active' | 'loans-done' | 'borrows-active' | 'borrows-done'

	$: loansActive  = entries.filter((e) => e.kind === 'loan'   && !e.returnedAt);
	$: loansDone    = entries.filter((e) => e.kind === 'loan'   &&  e.returnedAt);
	$: borrowsActive = entries.filter((e) => e.kind === 'borrow' && !e.returnedAt);
	$: borrowsDone   = entries.filter((e) => e.kind === 'borrow' &&  e.returnedAt);

	onMount(async () => {
		const unsubscribe = auth.subscribe((s) => (session = s));
		if (!session) { goto('/login'); return unsubscribe; }
		await load();
		return unsubscribe;
	});

	async function load() {
		const res = await api.get('/loans');
		if (res.ok) entries = res.data;
	}

	async function handleSubmit() {
		errorMessage = '';
		submitting = true;
		const res = await api.post('/loans', { kind: formTab, what, counterpart });
		submitting = false;

		if (res.ok) {
			entries = [res.data, ...entries];
			what = '';
			counterpart = '';
		} else {
			errorMessage = res.message || 'Une erreur est survenue.';
		}
	}

	async function handleReturn(id) {
		const res = await api.patch(`/loans/${id}/return`, {});
		if (res.ok) entries = entries.map((e) => (e._id === id ? res.data : e));
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
				<a href="/app/profile" class="user-link">{session.username || session.email}</a>
				<button class="btn-logout" on:click={handleLogout}>Se déconnecter</button>
			</div>
		</div>
	</header>

	<main class="main">
		<h1>Bonjour&nbsp;👋</h1>

		<!-- ── Formulaire ── -->
		<div class="card">
			<div class="form-tabs">
				<button class="form-tab" class:active={formTab === 'loan'} on:click={() => { formTab = 'loan'; errorMessage = ''; }}>
					📤 Enregistrer un prêt
				</button>
				<button class="form-tab" class:active={formTab === 'borrow'} on:click={() => { formTab = 'borrow'; errorMessage = ''; }}>
					📥 Enregistrer un emprunt
				</button>
			</div>

			<form class="loan-form" on:submit|preventDefault={handleSubmit}>
				<span class="form-label">{formTab === 'loan' ? 'J\'ai prêté' : 'J\'emprunte'}</span>
				<input type="text" bind:value={what}
					placeholder={formTab === 'loan' ? 'quoi (ex : tome 3 de Thorgal)' : 'quoi (ex : perceuse)'}
					required maxlength="200" />
				<span class="form-label">à</span>
				<div class="autocomplete-wrap">
					<input
						type="text"
						bind:value={counterpart}
						on:input={onCounterpartInput}
						on:blur={closeSuggestions}
						placeholder="email, pseudo ou nom (ex : papa)"
						required
						maxlength="200"
						autocomplete="off"
					/>
					{#if showSuggestions}
						<ul class="suggestions">
							{#each suggestions as s}
								<li on:mousedown={() => selectSuggestion(s)}>
									{#if s.username}
										<span class="s-name">{s.username}</span>
										<span class="s-email">{s.email}</span>
									{:else}
										<span class="s-name">{s.email}</span>
									{/if}
								</li>
							{/each}
						</ul>
					{/if}
				</div>
				<button type="submit" class="btn-primary" disabled={submitting}>
					{submitting ? '…' : 'Enregistrer'}
				</button>
			</form>

			{#if errorMessage}
				<p class="error">{errorMessage}</p>
			{/if}
		</div>

		<!-- ── Tableaux ── -->
		<div class="card">
			<div class="tabs">
				<button class="tab" class:active={tableTab === 'loans-active'}   on:click={() => (tableTab = 'loans-active')}>
					Prêts en cours <span class="badge" class:badge-active={tableTab === 'loans-active'}>{loansActive.length}</span>
				</button>
				<button class="tab" class:active={tableTab === 'loans-done'}     on:click={() => (tableTab = 'loans-done')}>
					Prêts terminés <span class="badge" class:badge-active={tableTab === 'loans-done'}>{loansDone.length}</span>
				</button>
				<button class="tab" class:active={tableTab === 'borrows-active'} on:click={() => (tableTab = 'borrows-active')}>
					Emprunts en cours <span class="badge" class:badge-active={tableTab === 'borrows-active'}>{borrowsActive.length}</span>
				</button>
				<button class="tab" class:active={tableTab === 'borrows-done'}   on:click={() => (tableTab = 'borrows-done')}>
					Emprunts terminés <span class="badge" class:badge-active={tableTab === 'borrows-done'}>{borrowsDone.length}</span>
				</button>
			</div>

			{#if tableTab === 'loans-active'}
				{#if loansActive.length === 0}
					<p class="empty">Aucun prêt en cours.</p>
				{:else}
					<div class="table-wrapper">
						<table>
							<thead><tr><th>Date</th><th>Quoi</th><th>À qui</th><th></th></tr></thead>
							<tbody>
								{#each loansActive as e (e._id)}
									<tr>
										<td class="date">{formatDate(e.createdAt)}</td>
										<td class="what">{e.what}</td>
										<td class="who">{e.counterpart}</td>
										<td class="action">
											<button class="btn-action btn-recover" on:click={() => handleReturn(e._id)}>
												Je l'ai récupéré
											</button>
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				{/if}

			{:else if tableTab === 'loans-done'}
				{#if loansDone.length === 0}
					<p class="empty">Aucun prêt terminé.</p>
				{:else}
					<div class="table-wrapper">
						<table>
							<thead><tr><th>Date de prêt</th><th>Quoi</th><th>À qui</th><th>Date de rendu</th></tr></thead>
							<tbody>
								{#each loansDone as e (e._id)}
									<tr>
										<td class="date">{formatDate(e.createdAt)}</td>
										<td class="what">{e.what}</td>
										<td class="who">{e.counterpart}</td>
										<td class="date">{formatDate(e.returnedAt)}</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				{/if}

			{:else if tableTab === 'borrows-active'}
				{#if borrowsActive.length === 0}
					<p class="empty">Aucun emprunt en cours.</p>
				{:else}
					<div class="table-wrapper">
						<table>
							<thead><tr><th>Date</th><th>Quoi</th><th>À qui</th><th></th></tr></thead>
							<tbody>
								{#each borrowsActive as e (e._id)}
									<tr>
										<td class="date">{formatDate(e.createdAt)}</td>
										<td class="what">{e.what}</td>
										<td class="who">{e.counterpart}</td>
										<td class="action">
											<button class="btn-action btn-give-back" on:click={() => handleReturn(e._id)}>
												Je l'ai rendu
											</button>
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				{/if}

			{:else}
				{#if borrowsDone.length === 0}
					<p class="empty">Aucun emprunt terminé.</p>
				{:else}
					<div class="table-wrapper">
						<table>
							<thead><tr><th>Date d'emprunt</th><th>Quoi</th><th>À qui</th><th>Date de rendu</th></tr></thead>
							<tbody>
								{#each borrowsDone as e (e._id)}
									<tr>
										<td class="date">{formatDate(e.createdAt)}</td>
										<td class="what">{e.what}</td>
										<td class="who">{e.counterpart}</td>
										<td class="date">{formatDate(e.returnedAt)}</td>
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
		max-width: 860px;
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

	/* ── Form tabs ── */
	.form-tabs {
		display: flex;
		gap: 0.5rem;
		margin-bottom: 1.25rem;
	}

	.form-tab {
		padding: 0.5rem 1.1rem;
		border: 2px solid #e8e0d8;
		border-radius: 50px;
		background: transparent;
		color: #888;
		font-size: 0.875rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
	}

	.form-tab:hover { border-color: #e87722; color: #e87722; }

	.form-tab.active {
		background: #e87722;
		border-color: #e87722;
		color: white;
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

	.autocomplete-wrap {
		position: relative;
		flex: 1;
		min-width: 140px;
	}

	.autocomplete-wrap input {
		width: 100%;
	}

	.suggestions {
		position: absolute;
		top: calc(100% + 4px);
		left: 0;
		right: 0;
		background: white;
		border: 2px solid #e87722;
		border-radius: 10px;
		list-style: none;
		z-index: 50;
		overflow: hidden;
		box-shadow: 0 4px 16px rgba(0,0,0,0.1);
	}

	.suggestions li {
		padding: 0.6rem 0.9rem;
		cursor: pointer;
		display: flex;
		align-items: baseline;
		gap: 0.5rem;
		transition: background 0.1s;
	}

	.suggestions li:hover { background: #fdf6ee; }

	.s-name { font-weight: 600; color: #1a1a1a; font-size: 0.9rem; }
	.s-email { color: #aaa; font-size: 0.8rem; }

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

	.loan-form input:focus { border-color: #e87722; background: white; }

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
	.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

	.error {
		margin-top: 0.75rem;
		color: #c0392b;
		font-size: 0.9rem;
	}

	/* ── Table tabs ── */
	.tabs {
		display: flex;
		gap: 0;
		border-bottom: 2px solid #f0e0cc;
		margin-bottom: 1.25rem;
		flex-wrap: wrap;
	}

	.tab {
		padding: 0.6rem 1.1rem;
		background: none;
		border: none;
		border-bottom: 2px solid transparent;
		margin-bottom: -2px;
		font-size: 0.875rem;
		font-weight: 600;
		color: #aaa;
		cursor: pointer;
		display: flex;
		align-items: center;
		gap: 0.4rem;
		white-space: nowrap;
		transition: color 0.15s;
	}

	.tab:hover { color: #e87722; }
	.tab.active { color: #e87722; border-bottom-color: #e87722; }

	.badge {
		background: #fdf6ee;
		color: #aaa;
		font-size: 0.75rem;
		font-weight: 700;
		padding: 0.1rem 0.45rem;
		border-radius: 20px;
		border: 1px solid #e8e0d8;
	}

	.badge.badge-active {
		background: #e87722;
		color: white;
		border-color: #e87722;
	}

	/* ── Table ── */
	.empty { color: #aaa; font-size: 0.95rem; }

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

	td.date { white-space: nowrap; color: #aaa; font-size: 0.85rem; width: 110px; }
	td.what { font-weight: 600; }
	td.who  { color: #666; }
	td.action { text-align: right; }

	.btn-action {
		padding: 0.35rem 0.85rem;
		background: transparent;
		border-radius: 50px;
		font-size: 0.8rem;
		font-weight: 600;
		cursor: pointer;
		white-space: nowrap;
		transition: all 0.2s;
	}

	.btn-recover {
		border: 1.5px solid #d0e8d0;
		color: #4a9a5a;
	}

	.btn-recover:hover { background: #4a9a5a; border-color: #4a9a5a; color: white; }

	.btn-give-back {
		border: 1.5px solid #d0d8e8;
		color: #4a6a9a;
	}

	.btn-give-back:hover { background: #4a6a9a; border-color: #4a6a9a; color: white; }
</style>
