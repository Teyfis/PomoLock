declare module "next-pwa" {
    import type { NextConfig } from "next";

    interface PWAConfig {
        dest?: string;
        register?: boolean;
        skipWaiting?: boolean;
        disable?: boolean;
        scope?: string;
        sw?: string;
        runtimeCaching?: unknown[];
        buildExcludes?: (string | RegExp)[];
        publicExcludes?: string[];
        fallbacks?: {
            document?: string;
            image?: string;
            audio?: string;
            video?: string;
            font?: string;
        };
    }

    export default function withPWAInit(config?: PWAConfig): (nextConfig: NextConfig) => NextConfig;
}
