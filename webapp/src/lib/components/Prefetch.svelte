<script>
    // This is pretty hacky.
    //
    // The monaco bundle is WAY too big and often fails to load for participants
    // with spotty internet connections.  Luckily, the bundle hardly changes, so
    // we can hardcode a hash and prefetch it before the experiment starts.
    //
    // That's what this is supposed to accomplish:
</script>

<link rel="prefetch" href="/_app/immutable/chunks/monaco.203db826.js" />
<link rel="prefetch" href="/_app/immutable/workers/editor.worker-94ffd778.js" />
<link rel="prefetch" href="/_app/immutable/chunks/python.502be7b9.js" />
