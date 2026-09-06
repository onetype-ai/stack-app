# catalog

## Description

What the depot stocks: the parts, what each costs, and taking one off the
shelves.

## Purpose

The parts are this plugin's and nobody else's. Another plugin that needs a
price asks for it rather than holding its own copy, so one number cannot go
stale in two places.

Withdrawing is a hook rather than a command anyone may run: whoever holds a
part has a say before it leaves, and says why.

## Usage

```ts
import { Catalog } from "@plugins/catalog";

const price = await Catalog.priceOf(ctx, id);
const part = await Catalog.partOf(ctx, id);
```

In a component, `Catalog.use()` answers the plugin's handle. `PartRow` is
exported so a part looks the same wherever it is shown.

## What it declares

- **Permissions**: `catalog.read` to see stock, `catalog.write` to withdraw.
- **Routes**: `/catalog` lists what is stocked, `/catalog/parts/$id` opens one.
- **Slot** `catalog.part.aside`: what another plugin shows beside a part.
- **Event** `catalog.part.withdrawn`, after the withdrawal is written.
- **Hook** `catalog.part.before-withdraw`: return a string to refuse it.

## Refuses

- Reaching a part through anything but the public entry.
- Withdrawing without running the hook first.
