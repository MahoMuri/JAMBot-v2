import { GuildMember, SlashCommandBuilder } from "discord.js";
import { Command } from "../../interfaces/Command";

export const command: Command = {
    name: "play",
    data: new SlashCommandBuilder()
        .setName("play")
        .setDescription("Plays a song/playlist.")
        .addStringOption((option) =>
            option
                .setName("song")
                .setDescription("The song you want to play.")
                .setRequired(true)
        ),
    description: "Plays a song/playlist",
    category: "music",
    adminOnly: false,
    usage: "/play <song>",
    run: async (bot, interaction) => {
        const member = <GuildMember>interaction.member;
        const player = bot.erelaManager.create({
            guild: interaction.guildId,
            voiceChannel: member.voice.channelId,
            textChannel: interaction.channelId,
        });

        const res = await player.search(
            interaction.options.getString("song"),
            interaction.user
        );

        // Connect to the voice channel.
        player.connect();

        // Adds the first track to the queue.
        player.queue.add(res.tracks[0]);
        interaction.editReply(`Enqueuing track ${res.tracks[0].title}.`);

        // Plays the player (plays the first track in the queue).
        // The if statement is needed else it will play the current track again
        if (!player.playing && !player.paused && !player.queue.size) {
            player.play();
        }

        // For playlists you'll have to use slightly different if statement
        if (
            !player.playing &&
            !player.paused &&
            player.queue.totalSize === res.tracks.length
        ) {
            player.play();
        }
    },
};
