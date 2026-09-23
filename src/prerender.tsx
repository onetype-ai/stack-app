import { dehydrate } from "@tanstack/react-query";

import { prerenderApp } from "@onetype/stack-app-kit/server";

import { Mount, Queries, Tree } from "./kernel";

const client = Queries.create();

export default prerenderApp({
    start: () => Mount.open(client),
    tree: (app) => <Tree app={app} client={client} />,
    state: () => dehydrate(client),
});
