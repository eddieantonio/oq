<div>
    <slot />
</div>

<style>
    /**
     * An action bar is a container at the bottom of a form that
     * contains a buttons that can submit a form.
     *
     * We put the main action at the far side of the bar.
     */
    div {
        display: flex;
        justify-content: flex-end;

        margin-block-start: 1rem;
        gap: 1rem;
    }
</style>
