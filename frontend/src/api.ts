import { build_client, http } from "@qubit-rs/client";
import type { QubitServer } from "./api_types";

const transport = http("http://localhost:3000/api");
export const api = build_client<QubitServer>(transport);
