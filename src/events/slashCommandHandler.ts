import { Interaction } from "discord.js";
import { Event } from "../interfaces/Event";

export const event: Event = {
    name: "interactionCreate",
    run: async (bot, interaction: Interaction) => {
        if (!interaction.isCommand()) {
            return;
        }

        await interaction.deferReply();

        const command = bot.commands.get(interaction.commandName);

        if (command) {
            command.run(bot, interaction);
        }
    },
};
