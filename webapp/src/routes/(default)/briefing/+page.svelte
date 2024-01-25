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
            You will do <strong>{tasks} exercises</strong>, after which there will be a short
            survey.
        </p>

        <p>
            <strong>Please do not use AI like ChatGPT, GitHub Copilot</strong>, etc. to help you
            with this study.
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
