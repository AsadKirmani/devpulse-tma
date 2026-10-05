import { betterAuth } from "better-auth";

export const auth = betterAuth({
    basePath: '/api/auth/',
    secret: process.env.BETTER_AUTH_SECRET,
    socialProviders: {
        github: {
            clientId: process.env.GITHUB_CLIENT_ID || "",
            clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
        },
    },
});
