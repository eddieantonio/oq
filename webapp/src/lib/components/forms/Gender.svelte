<script lang="ts">
    import FormGroup from '$lib/components/forms/FormGroup.svelte';

    let gender: string;
    let preferToSelfDescribe: string = '';
    $: submittedGender = gender == 'prefer-to-self-describe' ? preferToSelfDescribe : gender;
</script>

<FormGroup>
    <label for="gender" class="label"><slot /></label>
    <div>
        <label class="choice"
            ><input
                type="radio"
                name="__gender"
                required
                bind:group={gender}
                value="Man"
                class="choice__control"
            /> Man
        </label>
        <label class="choice"
            ><input
                type="radio"
                name="__gender"
                bind:group={gender}
                value="Woman"
                class="choice__control"
            /> Woman
        </label>
        <label class="choice"
            ><input
                type="radio"
                name="__gender"
                bind:group={gender}
                value="Non-binary"
                class="choice__control"
            /> Non-binary
        </label>
        <label class="choice"
            ><input
                type="radio"
                name="__gender"
                bind:group={gender}
                value="prefer-not-to-disclose"
                class="choice__control"
            /> Prefer not to disclose
        </label>
        <label class="choice"
            ><input
                type="radio"
                name="__gender"
                bind:group={gender}
                value="prefer-to-self-describe"
                class="choice__control"
            />
            Prefer to self-describe{#if gender == 'prefer-to-self-describe'}: <input
                    type="text"
                    bind:value={preferToSelfDescribe}
                    required
                />{/if}
        </label>
        <input type="hidden" name="gender" value={submittedGender} />
    </div>
</FormGroup>
