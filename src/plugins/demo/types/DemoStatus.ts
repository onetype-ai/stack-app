import { z } from "zod";

export const DemoStatus = {
    schema: z.enum(["draft", "active", "archived"]),
};

export type DemoStatus = z.infer<typeof DemoStatus.schema>;
