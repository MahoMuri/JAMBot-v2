import { readFileSync } from "fs";
import { resolve } from "path";
import { Config } from "../interfaces/Config";

export function getEnvironmentConfig() {
    const { NODE_ENV: mode } = process.env;

    const configFile = resolve(__dirname, "..", "..", "config", `${mode}.json`);

    let cfg: Config;

    try {
        cfg = JSON.parse(
            readFileSync(configFile, { encoding: "utf-8" })
        ) as Config;

        cfg.token = process.env[cfg.token];
        cfg.mongodbURI = process.env[cfg.mongodbURI];
        cfg.nodes[0].host = process.env[cfg.nodes[0].host];
        cfg.nodes[0].port = parseInt(process.env[cfg.nodes[0].port], 10);
        cfg.nodes[0].password = process.env[cfg.nodes[0].password];
        cfg.mode = mode;
    } catch (error) {
        console.error(error);
        cfg = {} as Config;
    }

    return cfg;
}
