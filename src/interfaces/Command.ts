import {
    ChatInputCommandInteraction,
    SlashCommandBuilder,
    SlashCommandSubcommandsOnlyBuilder,
} from "discord.js";
import { Bot } from "../client";

interface Run {
    (bot: Bot, interaction: ChatInputCommandInteraction);
}

export interface Command {
    name: string;
    data:
        | SlashCommandBuilder
        | SlashCommandSubcommandsOnlyBuilder
        | Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">;
    description: string;
    category: string;
    adminOnly: boolean;
    usage: string;
    run: Run;
}
