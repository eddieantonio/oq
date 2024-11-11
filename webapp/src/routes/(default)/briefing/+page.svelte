<script lang="ts">
    import ActionBar from '$lib/components/forms/ActionBar.svelte';

    export let data: import('./$types').PageData;
    const { tasks } = data;

    const youtubeSource = 'https://www.youtube.com/embed/EwhtQx1ZkEg?si=JkIjjsEciY11SFU8';
</script>

<header>
    <h1>What you're going to do in this study</h1>
</header>

<article>
    <form method="POST">
        <p>Please watch this brief video to learn about what you will do in this study:</p>
        <div class="youtube">
            <iframe
                width="560"
                height="315"
                src={youtubeSource}
                title="YouTube video player"
                frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowfullscreen
            />
        </div>

        <p>
            You're going to see <strong>{tasks} programs and {tasks} error messages</strong>. In the
            end there will be a short suvery in which
            <strong>you will be asked to group the error messages in pairs</strong>. Keep this in
            mind as you progress.
        </p>

        <p>
            <strong>Please do not use AI like ChatGPT, GitHub Copilot</strong>, etc. to help you
            with this study.
        </p>

        <p>
            <strong>Please do not talk to your friends</strong> to help you with this study. You should solve each problem on your own.
        </p>

        <p>When you're ready, press continue to start the first exercise:</p>

        <ActionBar>
            <button type="submit">Continue</button>
        </ActionBar>
    </form>
</article>

<style>
    .youtube {
        text-align: center;
    }
</style>
