<script lang="ts">
  import { Form, Input, InputGroup, InputGroupText } from "sveltestrap";
  import ThinFormGroup from "$lib/components/ThinFormGroup.svelte";
</script>

<h1>Welcome to SvelteKit</h1>
<p>
  Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation
</p>

<Form>
  <InputGroup>
    <ThinFormGroup floating>
      <Input />
      <span slot="label">Labellererer</span>
    </ThinFormGroup>
    <InputGroupText>@</InputGroupText>
    <ThinFormGroup floating>
      <Input />
      <span slot="label">aijio waodaowij</span>
    </ThinFormGroup>
  </InputGroup>
</Form>
