<script>
  export let id = '';
  export let value = '';
  export let placeholder = '';
  export let required = false;
  export let minlength = undefined;
  export let autocomplete = 'current-password';

  let show = false;
</script>

<div class="pwd-wrapper">
  {#if show}
    <input
      {id}
      type="text"
      bind:value
      {placeholder}
      {required}
      {autocomplete}
      minlength={minlength ?? undefined}
    />
  {:else}
    <input
      {id}
      type="password"
      bind:value
      {placeholder}
      {required}
      {autocomplete}
      minlength={minlength ?? undefined}
    />
  {/if}
  <button type="button" class="toggle" on:click={() => (show = !show)} tabindex="-1" aria-label={show ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}>
    {#if show}
      <!-- eye-off -->
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
        <line x1="1" y1="1" x2="23" y2="23"/>
      </svg>
    {:else}
      <!-- eye -->
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
        <circle cx="12" cy="12" r="3"/>
      </svg>
    {/if}
  </button>
</div>

<style>
  .pwd-wrapper {
    position: relative;
    display: flex;
    align-items: center;
  }

  input {
    width: 100%;
    padding: 0.7rem 2.75rem 0.7rem 1rem;
    border: 2px solid #e8e0d8;
    border-radius: 10px;
    font-size: 1rem;
    outline: none;
    background: #fdf6ee;
    transition: border-color 0.2s;
    font-family: inherit;
    box-sizing: border-box;
  }

  input:focus {
    border-color: #e87722;
    background: white;
  }

  .toggle {
    position: absolute;
    right: 0.75rem;
    background: none;
    border: none;
    cursor: pointer;
    color: #aaa;
    padding: 0;
    display: flex;
    align-items: center;
    transition: color 0.2s;
  }

  .toggle:hover {
    color: #e87722;
  }
</style>
