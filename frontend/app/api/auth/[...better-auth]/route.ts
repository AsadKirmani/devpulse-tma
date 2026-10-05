import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

// Better Auth uses a unified route handler handler format
export const { GET, POST } = toNextJsHandler(auth);
