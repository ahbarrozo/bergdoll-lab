<script>
    import { toaster } from 'src/stores/toaster.store';
</script>

{#if $toaster.display}
    <div class="toast toast-top toast-end z-50">
        <div class={`alert alert-${$toaster.type}`}>
            <span>{$toaster.message}</span>
        </div>
    </div>
{/if}

<style>
.alert-success {
    background: var(--color-success); 
}

.alert-error {
    background: var(--color-error);
}
</style>
