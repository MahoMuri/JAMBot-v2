import { Client, Collection, Intents } from "discord.js";
import { Manager } from "erela.js";
import { readdirSync } from "fs";
import path from "path";
import { Command } from "../interfaces/Command";
import { Event } from "../interfaces/Event";
import { getEnvironmentConfig } from "../utils/Environment";

export class Bot extends Client {
    public categories = readdirSync(path.join(__dirname, "..", "commands"));

    public commands: Collection<string, Command> = new Collection();

    public events: Collection<string, Event> = new Collection();

    private config = getEnvironmentConfig();

    public erelaManager: Manager;

    constructor() {
        super({
            allowedMentions: { parse: ["roles", "users"] },
            intents: [
                Intents.FLAGS.GUILDS,
                Intents.FLAGS.GUILD_MESSAGES,
                Intents.FLAGS.GUILD_VOICE_STATES,
            ],
        });
    }

    async init() {
        this.login(this.config.token);

        this.erelaManager = new Manager({
            nodes: this.config.nodes,
            clientName: this.user.username,
            autoPlay: true,
            send: (guildId, payload) => {
                const guild = this.guilds.cache.get(guildId);
                if (guild) {
                    guild.shard.send(payload);
                }
            },
        });

        this.on("raw", (d) => this.erelaManager.updateVoiceState(d));
    }
}
