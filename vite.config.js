import { defineConfig } from "vite";
import inject from "@rollup/plugin-inject";
import svgr from "vite-plugin-svgr";
import path from "path";

export default defineConfig(({ mode }) => {
    const isProduction = mode === "production";

    return {
        esbuild: {
            jsxFactory: "m",
            jsxFragment: "'['",
        },
        build: {
            outDir: "./wwwroot",
            assetsDir: "",
            cssCodeSplit: false,
            assetsInlineLimit: 0,
            minify: isProduction,
            rollupOptions: {
                input: {
                    app: "./src/js/app/entry.js",
                    style: "./src/sass/app.scss",
                },
                output: {
                    entryFileNames: `js/app${isProduction ? ".min" : ".bundle"}.js`,
                    chunkFileNames: `js/[name]${isProduction ? ".min" : ""}.js`,
                    assetFileNames: (assetInfo) => {
                        if (assetInfo.name.endsWith(".css")) {
                            return `css/app${isProduction ? ".min" : ".bundle"}.css`;
                        }
                        if (/\.(gif|jpe?g|png|svg)$/.test(assetInfo.name)) {
                            return "images/[name][extname]";
                        }
                        return "assets/[name][extname]";
                    },
                    manualChunks(id) {
                        if (id.includes("node_modules")) {
                            return "vendors.bundle";
                        }
                    },
                },
            },
        },
        resolve: {
            alias: {
                mithril: "mithril/mithril.js",
                "@asset": path.resolve(__dirname, "src/assets/"),
                "@base": path.resolve(__dirname, "src/js/app/"),
                "@style": path.resolve(__dirname, "src/sass/"),
                "@images": path.resolve(__dirname, "src/assets/images/"),
                "@icons": path.resolve(__dirname, "src/assets/icons/"),
            },
        },
        optimizeDeps: {
            include: ["mithril"],
        },
        plugins: [
            inject({
                m: "mithril",
            }),
            svgr(),
        ],
    };
});
