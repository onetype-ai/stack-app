# cart

## Description

A pick list: the parts somebody means to pull, at the catalog's prices, and
handing that list to a bay.

## Purpose

The list is held in memory rather than on the server, because it is one
person's working note until it is handed over. Handing over is the only thing
that leaves this plugin.

Prices are never copied. Every line asks the catalog, so a price cannot go
stale here while it changes there.

A part that leaves the shelves while a list holds it is struck rather than
dropped: whoever was going to pull it should see that it is gone.

## Usage

```ts
import { Cart } from "@plugins/cart";

await Cart.handOver(ctx, "A12");
```

In a component, `Cart.use()` answers the plugin's handle, and
`services.picking` holds the list, what it costs, and what to watch.

## What it declares

- **Permission**: `cart.use` to put parts on a list and hand it over.
- **Routes**: `/cart` shows the list, `/cart/handover` hands it to a bay.
- **Contributes** to `catalog.part.aside`: the button that adds a part.
- **Listens** to `catalog.part.withdrawn`, to strike a line.
- **Command** `cart.hand-over`, taking the bay to hand it to.

## Refuses

- Pricing a line from anywhere but the catalog.
- A bay that is not the shape `Bay` names.
