import { Client, Collection, GatewayIntentBits } from "discord.js";
import { Manager, Player } from "erela.js";
import { readdirSync } from "fs";
import path from "path";
import consola, { Consola } from "consola";
import { table, getBorderCharacters } from "table";
import { Command } from "../interfaces/Command";
import { Event } from "../interfaces/Event";
import { getEnvironmentConfig } from "../utils/Environment";
import { Colors } from "../interfaces/Colors";

export class Bot extends Client {
    public categories = readdirSync(path.join(__dirname, "..", "commands"));

    public commands: Collection<string, Command> = new Collection();

    public events: Collection<string, Event> = new Collection();

    public players: Collection<string, Player> = new Collection();

    public config = getEnvironmentConfig();

    public erelaManager: Manager;

    public consola: Consola;

    public colors = Colors;

    constructor() {
        super({
            allowedMentions: { parse: ["roles", "users"] },
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildVoiceStates,
            ],
        });
    }

    async init() {
        await this.login(this.config.token);
        this.consola = consola.withScope(`@${this.user.tag}｜`);

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

        this.erelaManager.on("nodeConnect", (node) => {
            this.consola.success(`Node ${node.options.identifier} connected!`);
        });

        this.erelaManager.on("nodeError", (node, err) => {
            this.consola.error(
                `Node ${node.options.identifier} had an error: ${err}`
            );
        });

        // Command registry
        const cmdTable = [];
        const commandsPath = path.join(__dirname, "..", "commands");
        this.categories.forEach((dir) => {
            const commands = readdirSync(`${commandsPath}/${dir}`).filter(
                (file) => file.endsWith(".ts")
            );

            commands.forEach((file) => {
                try {
                    const {
                        command,
                    } = require(`${commandsPath}/${dir}/${file}`);
                    this.commands.set(command.name, command);
                    cmdTable.push([file, "Loaded"]);
                } catch (error) {
                    cmdTable.push([file, `${error.message}`]);
                }
            });
        });

        // Event registry
        const eventTable = [];
        const eventsPath = path.join(__dirname, "..", "events");
        readdirSync(eventsPath).forEach((file) => {
            try {
                const { event } = require(`${eventsPath}/${file}`);
                this.events.set(event.name, event);
                this.on(event.name, event.run.bind(null, this));

                eventTable.push([file, "Loaded"]);
            } catch (error) {
                eventTable.push([file, `${error.message}`]);
            }
        });
        this.consola.log(
            `${table(cmdTable, {
                border: getBorderCharacters("norc"),
                header: {
                    alignment: "center",
                    content: "Commands",
                },
            })}${table(eventTable, {
                border: getBorderCharacters("norc"),
                header: {
                    alignment: "center",
                    content: "Events",
                },
            })}`
        );
    }
}
