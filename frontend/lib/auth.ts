import { betterAuth } from "better-auth";

export const auth = betterAuth({
    basePath: '/api/auth/',
    socialProviders: {
        github: {
            clientId: process.env.GITHUB_CLIENT_ID || "",
            clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
        },
    },
});
