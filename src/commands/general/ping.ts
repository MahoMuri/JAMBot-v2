import {
    ColorResolvable,
    CommandInteraction,
    EmbedBuilder,
    Message,
    SlashCommandBuilder,
} from "discord.js";
import { Command } from "../../interfaces/Command";

export const command: Command = {
    name: "ping",
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Send a pong!"),
    category: "general",
    description: "The ping command",
    adminOnly: false,
    usage: "/ping",
    run: async (bot, interaction: CommandInteraction) => {
        const msg = <Message>await interaction.editReply({
            content: `🏓 Pinging....`,
        });

        const wsping = bot.ws.ping;
        const apiping = msg.createdTimestamp - interaction.createdTimestamp;
        let wsemoji: string;
        let apiemoji: string;
        let color: ColorResolvable;

        if (apiping > 500) {
            apiemoji = "<:bad_connection:873027421211865108>";
            color = bot.colors.UPSDELL_RED;
        } else if (apiping >= 100) {
            apiemoji = "<:okay_connection:873027421316726845>";
            color = bot.colors.DEEP_SAFFRON;
        } else {
            apiemoji = "<:good_connection:873027421245411430>";
            color = bot.colors.GREEN_MUNSEL;
        }

        if (wsping > 500) {
            wsemoji = "<:bad_connection:873027421211865108>";
        } else if (wsping >= 100) {
            wsemoji = "<:okay_connection:873027421316726845>";
        } else {
            wsemoji = "<:good_connection:873027421245411430>";
        }

        const pingEmbed = new EmbedBuilder()
            .setColor(color)
            .addFields(
                {
                    name: "API Ping:",
                    value: `${apiemoji} ${apiping}ms`,
                },
                {
                    name: "Websocket Ping:",
                    value: `${wsemoji} ${wsping}ms`,
                }
            )
            .setFooter({
                text: `${bot.user.username} | MahoMuri `,
                iconURL: bot.user.displayAvatarURL(),
            })
            .setTimestamp();

        interaction.editReply({ embeds: [pingEmbed], content: "🏓 Pong" });
    },
};
