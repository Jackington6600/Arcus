<script lang="ts">
  import { Input, InputGroup, InputGroupText } from "sveltestrap";
  import { chain as lodashChain } from "lodash";

  import ThinFormGroup from "$lib/components/ThinFormGroup.svelte";
  import {
    calculateArmorClass,
    calculateAttributeModifier,
    calculateMaxHp,
    calculateMovementSpeed,
    calculatePassivePerception,
    calculateTotalResistancePoints,
    formatMovementSpeedAsFeet,
  } from "$lib/logic";
  import Attribute from "$lib/attribute";
  import ResistancePoint from "$lib/resistance-point";
  import ArmorType from "$lib/armor-type";

  import connor1 from "$lib/img/connor1.png";
  import connor2 from "$lib/img/connor2.png";
  import connor3 from "$lib/img/connor3.png";
  import connor4 from "$lib/img/connor4.png";
  import connor5 from "$lib/img/connor5.png";
  import connor6 from "$lib/img/connor6.png";
  import connor7 from "$lib/img/connor7.png";
  const CONNOR_IMAGES = [
    connor1,
    connor2,
    connor3,
    connor4,
    connor5,
    connor6,
    connor7,
  ];

  import characterSheetDesignImage from "$lib/img/characterSheetDesign.png";

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
  $: totalResistancePoints = lodashChain(ResistancePoint.values)
    .mapKeys()
    .mapValues((rp) => calculateTotalResistancePoints(rp, attributes))
    .value();
  export let currentResistancePoints = createRecord<
    ResistancePoint,
    number | null
  >(ResistancePoint.values, 0);

  export let currentHp: number | null = null;
  export let maxHp: number | null;
  $: maxHp = calculateMaxHp(level, attributes.con, attributeModifiers.con);

  export let tempHp: number | null = null;

  export let passivePerception;
  $: passivePerception = calculatePassivePerception(attributes.per);

  export let armorType = ArmorType.None;
  export let armorClass: number | null;
  $: armorClass = calculateArmorClass(armorType, attributeModifiers.dex);
  export let movementSpeed: number;
  $: movementSpeed = calculateMovementSpeed(armorType);

  export let attackList = [
    {
      key: "1",
      name: "Arcane Blip",
      notes: "1AP, within 100ft",
      attackBonus: "Auto Hit",
      damage: "Light(3) = 3",
    },
    {
      key: "2",
      name: "Arcane Bolt",
      notes: "2AP, within 100ft",
      attackBonus: "INT (+6)",
      damage: "Medium(6) + INT(3) = 9",
    },
  ];
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
    {#each ResistancePoint.values as rp (rp)}
      <div
        class="resistance-points resistance-points-{rp} g-col-12 g-col-sm-4 g-col-md-4"
      >
        <InputGroup>
          <ThinFormGroup
            class="overflow-label"
            label={ResistancePoint.getShortDisplayName(rp)}
          >
            <Input
              type="number"
              min={0}
              max={totalResistancePoints[rp] ?? undefined}
              bind:value={currentResistancePoints[rp]}
            />
          </ThinFormGroup>
          <InputGroupText>/</InputGroupText>
          <ThinFormGroup class="resistance-points-total">
            <Input
              type="number"
              disabled
              readonly
              value={totalResistancePoints[rp]}
            />
          </ThinFormGroup>
        </InputGroup>
      </div>
    {/each}
    <div class="g-col-6 g-col-sm-4">
      <InputGroup>
        <ThinFormGroup label="HP" class="overflow-label">
          <Input
            type="number"
            min={0}
            max={maxHp ?? undefined}
            bind:value={currentHp}
          />
        </ThinFormGroup>
        <InputGroupText>/</InputGroupText>
        <ThinFormGroup class="max-hp">
          <Input type="number" readonly disabled value={maxHp} />
        </ThinFormGroup>
      </InputGroup>
    </div>
    <div class="g-col-6 g-col-sm-4">
      <ThinFormGroup label="Temp HP">
        <Input type="number" min={0} bind:value={tempHp} />
      </ThinFormGroup>
    </div>
    <div class="g-col-6 g-col-sm-4">
      <ThinFormGroup label="Passive Perception">
        <Input type="number" readonly disabled value={passivePerception} />
      </ThinFormGroup>
    </div>
    <div class="g-col-6 g-col-sm-4">
      <ThinFormGroup label="Armor Type">
        <Input type="select" bind:value={armorType}>
          {#each ArmorType.values as armorTypeOption}
            <option value={armorTypeOption}
              >{ArmorType.getDisplayName(armorTypeOption)}</option
            >
          {/each}
        </Input>
      </ThinFormGroup>
    </div>
    <div class="g-col-6 g-col-sm-4">
      <InputGroup>
        <ThinFormGroup label="Armor Class" class="overflow-label">
          <Input type="number" readonly disabled value={armorClass} />
        </ThinFormGroup>
        <InputGroupText>AC</InputGroupText>
      </InputGroup>
    </div>
    <div class="g-col-6 g-col-sm-4">
      <InputGroup>
        <ThinFormGroup label="Movement Speed" class="overflow-label">
          <Input
            type="number"
            readonly
            disabled
            value={formatMovementSpeedAsFeet(movementSpeed)}
          />
        </ThinFormGroup>
        <InputGroupText>ft</InputGroupText>
      </InputGroup>
    </div>
    <div class="g-col-12">
      <table class="table table-striped table-hover">
        <thead>
          <tr>
            <th scope="col">Attack Name</th>
            <th scope="col">Notes</th>
            <th scope="col">Attack Bonus</th>
            <th scope="col">Damage</th>
          </tr>
        </thead>
        <tbody class="table-group-divider">
          {#each attackList as attack (attack.key)}
            <tr>
              <td>{attack.name}</td>
              <td>{attack.notes}</td>
              <td>{attack.attackBonus.toString()}</td>
              <td>{attack.damage.toString()}</td>
            </tr>
          {/each}
        </tbody>
        <!-- <tfoot>
          <tr>
            <td>
              <Input type='text' placeholder='Attack Name' />
            </td>
            <td>
              <Input type='text' placeholder='Notes' />
            </td>
            <td>
              <Input type='text' placeholder='Attack Bonus' />
            </td>
            <td>
              <Input type='text' placeholder='Damage' />
            </td>
          </tr>
        </tfoot> -->
      </table>
    </div>
    <div class="g-col-12">
      <img src={characterSheetDesignImage} alt="" />
    </div>
    <div class="g-col-12">
      {#each CONNOR_IMAGES as img (img)}
        <img src={img} alt="" />
      {/each}
    </div>
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
  .max-hp {
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
