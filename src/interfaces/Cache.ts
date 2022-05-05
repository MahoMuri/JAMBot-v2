import { Collection } from "discord.js";
import { HydratedDocument } from "mongoose";
import { GuildConfig } from "./GuildConfig";

export interface Cache {
    guildConfigs: Collection<string, HydratedDocument<GuildConfig>>;
}
