<div class="form-group">
    <slot />
</div>

<style>
    .form-group {
        display: flex;
        flex-direction: column;
        margin-block-end: 1.5rem;
    }

    .form-group :global(.label) {
        flex: 2;
        margin-block-end: 0.5rem;
        font-weight: bold;
    }

    .form-group :global(.required) {
        color: var(--nc-red, #ff0000);
    }

    .form-group :global(.input) {
        flex: 1;
        display: block;
        width: 100%;
        line-height: 1.5;
    }

    .form-group :global(.choice) {
        box-sizing: border-box;
        display: block;
        padding-inline-start: 1rem;
        width: 100%;
        line-height: 1.5;
        cursor: pointer;
    }

    .form-group :global(.choice):hover {
        background-color: var(--nc-bg-2);
    }

    .form-group :global(.choice__control) {
        margin-inline-end: 0.5em;
    }
</style>
