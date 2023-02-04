<script lang="ts">
  import { Input, InputGroup } from "sveltestrap";
  import { chain as lodashChain } from "lodash";

  import ThinFormGroup from "$lib/components/ThinFormGroup.svelte";
  import { calculateAttributeModifier, calculateTotalResistancePoints } from "$lib/logic";
  import Attribute from "$lib/attribute";
  import ResistancePoint from "$lib/resistance-point";

  function formatAttributeModifier(
    attributeModifier: number | null
  ): string | null {
    if (attributeModifier === null) return null;
    return attributeModifier >= 0
      ? `+${attributeModifier}`
      : attributeModifier.toString();
  }

  export let name = "";
  export let playerName = "";
  export let level: number | null = null;
  export let description = "";

  function createRecord<TKey extends string, TValue>(
    keys: readonly TKey[],
    value: TValue
  ): Record<TKey, TValue> {
    return lodashChain(keys)
      .mapKeys()
      .mapValues((_) => value)
      .value() as any;
  }

  export let attributes = createRecord<Attribute, number | null>(
    Attribute.values,
    10
  );
  export let attributeModifiers: Record<Attribute, number | null>;
  $: attributeModifiers = lodashChain(Attribute.values)
    .mapKeys()
    .mapValues((a) => calculateAttributeModifier(attributes[a]))
    .value();

  export let totalResistancePoints: Record<ResistancePoint, number | null>;
  $: totalResistancePoints = lodashChain(ResistancePoint.values).mapKeys().mapValues(rp => calculateTotalResistancePoints(rp, attributes)).value();
</script>

<div class="container">
  <h1>{name ? name : "Character Sheet"}</h1>
  <hr />
  <div class="grid">
    <div class="g-col-12 g-col-sm-5 g-col-md-7 g-col-xl-8">
      <ThinFormGroup label="Character Name">
        <Input type="text" bind:value={name} />
      </ThinFormGroup>
    </div>
    <div class="g-col-8 g-col-sm-4 g-col-md-3">
      <ThinFormGroup label="Player Name">
        <Input type="text" bind:value={playerName} />
      </ThinFormGroup>
    </div>
    <div class="g-col-4 g-col-sm-3 g-col-md-2 g-col-xl-1">
      <ThinFormGroup label="Level">
        <Input type="number" bind:value={level} min={1} max={20} />
      </ThinFormGroup>
    </div>
    <div class="g-col-12">
      <ThinFormGroup label="Description">
        <Input type="textarea" rows={3} bind:value={description} />
      </ThinFormGroup>
    </div>
    {#each Attribute.values as attribute (attribute)}
      <div
        class="attribute attribute-{attribute} attribute-resistance-{Attribute.getResistancePoint(
          attribute
        )} g-col-6 g-col-xs-4 g-col-sm-4 g-col-md-2"
      >
        <InputGroup>
          <ThinFormGroup
            class="overflow-label"
            label={Attribute.getShortDisplayName(attribute)}
          >
            <Input
              type="number"
              min={0}
              max={20}
              bind:value={attributes[attribute]}
            />
          </ThinFormGroup>
          <ThinFormGroup>
            <Input
              type="text"
              class="attribute-modifier"
              disabled
              readonly
              value={formatAttributeModifier(attributeModifiers[attribute])}
            />
          </ThinFormGroup>
        </InputGroup>
      </div>
    {/each}
  </div>
</div>

<style lang="scss">
  @import "$node_modules/bootstrap/scss/functions";
  @import "$node_modules/bootstrap/scss/variables";
  @import "$node_modules/bootstrap/scss/variables-dark";
  @import "$node_modules/bootstrap/scss/mixins/breakpoints";

  :global(:root),
  :global([data-bs-theme="light"]) {
    .attribute-resistance-fort,
    .resistance-points-fort {
      --bs-border-color: rgb(255, 190, 190);
    }

    .attribute-resistance-refl,
    .resistance-points-refl {
      --bs-border-color: rgb(160, 255, 160);
    }

    .attribute-resistance-will,
    .resistance-points-will {
      --bs-border-color: rgb(173, 173, 255);
    }
  }

  :global([data-bs-theme="dark"]) {
    .attribute-resistance-fort,
    .resistance-points-fort {
      --bs-border-color: rgb(121, 0, 0);
    }

    .attribute-resistance-refl,
    .resistance-points-refl {
      --bs-border-color: rgb(1, 108, 1);
    }

    .attribute-resistance-will,
    .resistance-points-will {
      --bs-border-color: rgb(0, 0, 168);
    }
  }

  .attribute-modifier {
    flex-grow: 0.5;
    max-width: 3rem;
  }

  .resistance-points-total,
  #max-hp {
    flex-grow: 0.5;
    max-width: 4rem;
  }

  /* Cool, but breaks tab order (and no pure CSS fix it seems!) https://adrianroselli.com/2015/10/html-source-order-vs-css-display-order.html
    @include media-breakpoint-between(xs, sm) {
      .grid>div.attribute-resistance-fort {
        order: 1;
      }

      .grid>div.resistance-points-fort {
        order: 2;
      }

      .grid>div.attribute-resistance-refl {
        order: 3;
      }

      .grid>div.resistance-points-refl {
        order: 4;
      }

      .grid>div.attribute-resistance-will {
        order: 5;
      }

      .grid>div.resistance-points-will {
        order: 6;
      }

      .grid>div.resistance-points~div:not(.resistance-points) {
        order: 7;
      }
    }
    */

  @include media-breakpoint-between(sm, md) {
    .grid > div.attribute-str {
      order: 1;
    }

    .grid > div.attribute-dex {
      order: 2;
    }

    .grid > div.attribute-int {
      order: 3;
    }

    .grid > div.attribute-con {
      order: 4;
    }

    .grid > div.attribute-per {
      order: 5;
    }

    .grid > div.attribute-spi {
      order: 6;
    }

    .grid > div.resistance-points {
      order: 7;
    }

    .grid > div.resistance-points ~ div:not(.resistance-points) {
      order: 8;
    }
  }

  // @include media-breakpoint-up(md) {
  //   .resistance-points-total {
  //     flex-grow: .2;
  //   }
  // }

  // @include media-breakpoint-up(lg) {
  //   .resistance-points-total {
  //     flex-grow: .1;
  //   }
  // }
</style>
