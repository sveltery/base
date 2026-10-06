<!-- Adapted Base UI docs/src/components/ReferenceTable/ReferenceAccordion.tsx at47b40521; MIT2019 Material-UI SAS. Input is actual local extracted declarations, not React type metadata. -->
<script lang="ts">
  import { observeScrollableInner } from './observeScrollableInner.js';
  import ReferenceItem from './ReferenceItem.svelte';
  import CodeBlock from './CodeBlock.svelte';
  let {
    name,
    props,
  }: {
    name: string;
    props: { name: string; type: string; optional?: boolean }[];
  } = $props();
  const captionId = $props.id();
</script>

<section
  aria-describedby={captionId}
  data-hide-default
  class="AccordionRoot ReferenceAccordionRoot"
  style={'--rows:' + props.length}
>
  <span id={captionId} class="bui-sr-only" aria-hidden="true">{name} props table</span>
  <div class="AccordionHeaderRow ReferenceHeaderRow" aria-hidden="true">
    <div class="AccordionHeaderCell">
      <span class="AccordionHeaderCellInner">Prop</span>
    </div>
    <div class="AccordionHeaderCell ReferenceHeaderTypeCell">
      <span class="AccordionHeaderCellInner">Type</span>
    </div>
    <div class="AccordionHeaderCell ReferenceHeaderIconCell"></div>
  </div>
  {#each props as prop (prop.name)}
    <ReferenceItem
      id={name.replace('.', '') + '-' + prop.name}
      label={'Prop: ' + prop.name + (prop.optional ? '' : ', required') + ', type: ' + prop.type}
    >
      {#snippet trigger()}
        <span
          {@attach observeScrollableInner}
          class="AccordionScrollable ReferenceNameCell"
          style="--scrollable-gradient-color:var(--color-content)"
          ><span class="AccordionScrollableInner"
            ><code class="Code TableCode"
              >{prop.name}{#if !prop.optional}<sup class="ReferenceRequired">*</sup>{/if}</code
            ></span
          ></span
        >
        <span
          {@attach observeScrollableInner}
          class="AccordionScrollable ReferenceTypeCell"
          style="--scrollable-gradient-color:var(--color-content)"
          ><span class="AccordionScrollableInner"
            ><code class="Code TableCode">{prop.type}</code></span
          ></span
        >
        <span class="ReferenceIconWrap"
          ><svg
            class="AccordionIcon ReferenceIcon"
            width="10"
            height="10"
            viewBox="0 0 10 10"
            fill="none"
            aria-hidden="true"><path d="M1 3.5L5 7.5L9 3.5" stroke="currentColor" /></svg
          ></span
        >
      {/snippet}
      <dl class="DescriptionList ReferenceContent">
        <div class="DescriptionListItem">
          <dt class="DescriptionTerm">
            <div class="DescriptionListInner">Name</div>
          </dt>
          <dd class="DescriptionListDetails">
            <div class="DescriptionListInner"><code>{prop.name}</code></div>
          </dd>
        </div>
        <div class="DescriptionListItem">
          <dt class="DescriptionTerm separator">
            <div class="DescriptionListInner">Type</div>
          </dt>
          <dd class="DescriptionListDetails">
            <div class="DescriptionListInner">
              <CodeBlock code={prop.type} language="typescript" title={prop.name + ' type'} />
            </div>
          </dd>
        </div>
      </dl>
    </ReferenceItem>
  {/each}
</section>
