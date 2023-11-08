<slot />

<footer class="debug-footer">
    <nav>
        <a href="/_debug">Go to debug page</a>
    </nav>
</footer>

<style>
    footer {
        margin-block-start: 2rem;
    }

    nav {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        z-index: 1000;

        margin: 0;
        padding-inline: 1rem;
        padding-block: 1rem;

        font-size: small;

        background-color: var(--nc-bg-3);
        opacity: 0.5;
    }
</style>
