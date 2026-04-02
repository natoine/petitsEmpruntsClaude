<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { auth } from '$lib/auth.js';
	import { api } from '$lib/api.js';
	import PasswordInput from '$lib/PasswordInput.svelte';

	let session = null;

	// Pseudo
	let username = '';
	let usernameSuccess = '';
	let usernameError = '';
	let savingUsername = false;

	// Mot de passe
	let currentPassword = '';
	let newPassword = '';
	let confirmNewPassword = '';
	let passwordSuccess = '';
	let passwordError = '';
	let savingPassword = false;

	// Suppression
	let deletePassword = '';
	let deleteError = '';
	let deleteConfirmVisible = false;
	let deleting = false;

	onMount(async () => {
		const unsubscribe = auth.subscribe((s) => (session = s));
		if (!session) { goto('/login'); return unsubscribe; }

		const res = await api.get('/users/me');
		if (res.ok) username = res.data.username;

		return unsubscribe;
	});

	async function handleSaveUsername() {
		usernameSuccess = '';
		usernameError = '';
		savingUsername = true;
		const res = await api.patch('/users/me/username', { username });
		savingUsername = false;

		if (res.ok) {
			auth.updateUsername(res.data.username);
			usernameSuccess = 'Pseudo mis à jour.';
		} else {
			usernameError = res.message || 'Une erreur est survenue.';
		}
	}

	async function handleChangePassword() {
		passwordSuccess = '';
		passwordError = '';

		if (newPassword !== confirmNewPassword) {
			passwordError = 'Les nouveaux mots de passe ne correspondent pas.';
			return;
		}

		savingPassword = true;
		const res = await api.patch('/users/me/password', { currentPassword, newPassword });
		savingPassword = false;

		if (res.ok) {
			currentPassword = '';
			newPassword = '';
			confirmNewPassword = '';
			passwordSuccess = 'Mot de passe mis à jour.';
		} else {
			passwordError = res.message || 'Une erreur est survenue.';
		}
	}

	async function handleDeleteAccount() {
		deleteError = '';
		deleting = true;
		const res = await api.delete('/users/me', { password: deletePassword });
		deleting = false;

		if (res.ok) {
			auth.logout();
			goto('/');
		} else {
			deleteError = res.message || 'Une erreur est survenue.';
		}
	}
</script>

{#if session}
<div class="page">
	<header class="topbar">
		<div class="topbar-inner">
			<a href="/app" class="back-link">← Retour</a>
			<span class="page-title">Mon profil</span>
			<div></div>
		</div>
	</header>

	<main class="main">

		<!-- ── Pseudo ── -->
		<div class="card">
			<h2>Mon pseudo</h2>
			<p class="hint">Affiché dans l'application. Par défaut, c'est votre adresse email.</p>
			<form on:submit|preventDefault={handleSaveUsername}>
				<div class="field-row">
					<input
						type="text"
						bind:value={username}
						placeholder={session.email}
						maxlength="50"
						required
					/>
					<button type="submit" class="btn-primary" disabled={savingUsername}>
						{savingUsername ? '…' : 'Enregistrer'}
					</button>
				</div>
				{#if usernameSuccess}<p class="success">{usernameSuccess}</p>{/if}
				{#if usernameError}<p class="error">{usernameError}</p>{/if}
			</form>
		</div>

		<!-- ── Mot de passe ── -->
		<div class="card">
			<h2>Changer de mot de passe</h2>
			<form on:submit|preventDefault={handleChangePassword}>
				<div class="field">
					<label for="current-pwd">Mot de passe actuel</label>
					<PasswordInput id="current-pwd" bind:value={currentPassword} required autocomplete="current-password" />
				</div>
				<div class="field">
					<label for="new-pwd">Nouveau mot de passe</label>
					<PasswordInput id="new-pwd" bind:value={newPassword} required minlength="8" placeholder="8 caractères minimum" autocomplete="new-password" />
				</div>
				<div class="field">
					<label for="confirm-pwd">Confirmer le nouveau mot de passe</label>
					<PasswordInput id="confirm-pwd" bind:value={confirmNewPassword} required minlength="8" autocomplete="new-password" />
				</div>
				{#if passwordSuccess}<p class="success">{passwordSuccess}</p>{/if}
				{#if passwordError}<p class="error">{passwordError}</p>{/if}
				<button type="submit" class="btn-primary" disabled={savingPassword}>
					{savingPassword ? '…' : 'Changer le mot de passe'}
				</button>
			</form>
		</div>

		<!-- ── Suppression ── -->
		<div class="card card-danger">
			<h2>Supprimer mon compte</h2>
			<p class="hint">Cette action est irréversible. Tous vos prêts et emprunts seront définitivement supprimés.</p>

			{#if !deleteConfirmVisible}
				<button class="btn-danger-outline" on:click={() => (deleteConfirmVisible = true)}>
					Supprimer mon compte
				</button>
			{:else}
				<form on:submit|preventDefault={handleDeleteAccount}>
					<div class="field">
						<label for="delete-pwd">Confirmez avec votre mot de passe</label>
						<PasswordInput id="delete-pwd" bind:value={deletePassword} required autocomplete="current-password" />
					</div>
					{#if deleteError}<p class="error">{deleteError}</p>{/if}
					<div class="danger-actions">
						<button type="button" class="btn-ghost" on:click={() => { deleteConfirmVisible = false; deletePassword = ''; deleteError = ''; }}>
							Annuler
						</button>
						<button type="submit" class="btn-danger" disabled={deleting}>
							{deleting ? '…' : 'Oui, supprimer définitivement'}
						</button>
					</div>
				</form>
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
		max-width: 640px;
		margin: 0 auto;
		padding: 0.75rem 2rem;
		display: grid;
		grid-template-columns: 1fr auto 1fr;
		align-items: center;
	}

	.back-link {
		font-size: 0.875rem;
		color: #888;
		text-decoration: none;
		font-weight: 600;
		transition: color 0.2s;
	}

	.back-link:hover { color: #e87722; }

	.page-title {
		font-size: 0.95rem;
		font-weight: 700;
		color: #1a1a1a;
	}

	/* ── Main ── */
	.main {
		max-width: 560px;
		margin: 2.5rem auto;
		padding: 0 1.5rem;
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	/* ── Card ── */
	.card {
		background: white;
		border-radius: 16px;
		padding: 1.75rem 2rem;
		box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
	}

	.card-danger {
		border: 1.5px solid #fad4d0;
	}

	h2 {
		font-size: 1rem;
		font-weight: 700;
		color: #1a1a1a;
		margin-bottom: 0.4rem;
	}

	.hint {
		font-size: 0.875rem;
		color: #aaa;
		margin-bottom: 1.1rem;
	}

	/* ── Fields ── */
	.field { margin-bottom: 1rem; }

	label {
		display: block;
		font-size: 0.8rem;
		font-weight: 600;
		color: #666;
		margin-bottom: 0.35rem;
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}

	input[type="text"] {
		width: 100%;
		padding: 0.65rem 0.9rem;
		border: 2px solid #e8e0d8;
		border-radius: 10px;
		font-size: 0.95rem;
		outline: none;
		background: #fdf6ee;
		transition: border-color 0.2s;
	}

	input:focus { border-color: #e87722; background: white; }

	.field-row {
		display: flex;
		gap: 0.6rem;
	}

	.field-row input { flex: 1; }

	/* ── Feedback ── */
	.success {
		color: #4a9a5a;
		font-size: 0.875rem;
		margin-top: 0.5rem;
	}

	.error {
		color: #c0392b;
		font-size: 0.875rem;
		margin-top: 0.5rem;
		margin-bottom: 0.5rem;
	}

	/* ── Buttons ── */
	.btn-primary {
		padding: 0.65rem 1.4rem;
		background: #e87722;
		color: white;
		border: none;
		border-radius: 50px;
		font-size: 0.9rem;
		font-weight: 700;
		cursor: pointer;
		white-space: nowrap;
		transition: background 0.2s;
		margin-top: 0.25rem;
	}

	.btn-primary:hover:not(:disabled) { background: #cf6618; }
	.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

	.btn-danger-outline {
		padding: 0.6rem 1.25rem;
		background: transparent;
		border: 2px solid #e87060;
		border-radius: 50px;
		color: #e87060;
		font-size: 0.9rem;
		font-weight: 700;
		cursor: pointer;
		transition: all 0.2s;
	}

	.btn-danger-outline:hover { background: #e87060; color: white; }

	.danger-actions {
		display: flex;
		gap: 0.75rem;
		align-items: center;
		margin-top: 0.5rem;
	}

	.btn-ghost {
		padding: 0.6rem 1.1rem;
		background: transparent;
		border: 2px solid #e8e0d8;
		border-radius: 50px;
		color: #888;
		font-size: 0.9rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
	}

	.btn-ghost:hover { border-color: #aaa; color: #555; }

	.btn-danger {
		padding: 0.6rem 1.25rem;
		background: #e87060;
		border: none;
		border-radius: 50px;
		color: white;
		font-size: 0.9rem;
		font-weight: 700;
		cursor: pointer;
		transition: background 0.2s;
	}

	.btn-danger:hover:not(:disabled) { background: #c95242; }
	.btn-danger:disabled { opacity: 0.6; cursor: not-allowed; }
</style>
