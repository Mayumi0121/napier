<div class="login-page">
    <div class="login-box">
        <div class="login-logo">
            <a href="/"><b>Napier</b></a>
        </div>
        <div class="card">
            <div class="card-body login-card-body">
                <p class="login-box-msg">Sign in to start your session</p>
                <div class="input-group mb-3">
                    <input type="text" bind:value={user_name} class="form-control" placeholder="User name">
                </div>
                <div class="input-group mb-3">
                    <input type="password" bind:value={password} class="form-control" placeholder="Password">
                </div>
                <div class="row">
                    <div class="col-8">
                    </div>
                    <div class="col-4 d-grid">
                        <button type="button" class="btn btn-primary"
                            on:click={Login}>
                            Sign In
                        </button>
                    </div>
                </div>
                <p class="mb-0">
                    <a on:click|preventDefault={() => { current = 'signup' }} href="#" class="text-center">Register a new membership</a>
                </p>
            </div>
        </div>
    </div>
    {#if alert}
    <div class="alert alert-danger fade show" style="width:600px;" role="alert">
        <button type="button" class="btn-close" aria-label="Close"
            on:click="{() => {alert = undefined}}"></button>
        <strong>{alert}</strong>
    </div>
{/if}
</div>
<script>
import {onMount, beforeUpdate, afterUpdate, createEventDispatcher} from 'svelte';
export let user;
export let current;

let user_name;
let password;
let alert;

const Login = () => {
    try {
        api.login(user_name, password).then(() => {
            user = user_name;
            current = 'home';
        }).catch((msg) => {
            alert = msg;
        });
    } catch(e) {
        console.log('login fail', e);
    }
}

</script>