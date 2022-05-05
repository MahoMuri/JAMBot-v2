import { NodeOptions } from "erela.js";

export interface Config {
    token: string;
    mode: string;
    mongodbURI: string;
    prefix: string;
    nodes: NodeOptions[];
}
