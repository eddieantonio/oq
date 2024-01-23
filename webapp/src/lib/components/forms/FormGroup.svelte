<div class="form-group">
    <slot />
</div>

<style>
    .form-group {
        outline: 1px solid magenta;
        display: flex;
        flex-direction: column;
        margin-block-end: 1rem;
    }

    .form-group :global(.label) {
        outline: 1px solid lime;
        flex: 2;
        margin-block-end: 0.5rem;
    }

    .form-group :global(.input) {
        outline: 1px solid cyan;
        flex: 1;
        display: block;
        width: 100%;
        line-height: 1.5;
    }
</style>
