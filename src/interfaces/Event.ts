import { ClientEvents } from "discord.js";
import { Bot } from "../client";

interface Run {
    (bot: Bot, ...args: any[]);
}

export interface Event {
    name: keyof ClientEvents;
    run: Run;
}
