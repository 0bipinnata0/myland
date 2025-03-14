import { readFile } from "fs/promises";
import { Plugin } from "vite";
import path from 'path';

export function pluginIndexHtml(): Plugin {
    return {
        name: "island:index-html",
        apply: "serve",
        configureServer(server) {
            return () => {
                server.middlewares.use(async (req, res, next) => {
                    let html = await readFile(path.join(__dirname, '../template.html'), "utf-8");
                    try {
                        res.statusCode = 200;
                        res.setHeader("Content-Type", "text/html");
                        res.end(html);
                    } catch (e) {
                        return next(e);
                    }
                });
            };
        },
    };
}
