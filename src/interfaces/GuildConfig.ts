export interface GuildConfig {
    guildId: string;
    textChannel: string;
    voiceChannel: string;
    maxWarns: number;
    warns: Map<string, number>;
}
