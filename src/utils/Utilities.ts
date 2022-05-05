import {
    ButtonInteraction,
    Interaction,
    Message,
    MessageActionRow,
    MessageButton,
    User,
} from "discord.js";
import { ButtonNames, SliderOptions } from "../interfaces/SliderInterface";

export interface toMillisecondsOptions {
    days?: number;
    hours?: number;
    minutes?: number;
    seconds?: number;
    milliseconds?: number;
    nanoseconds?: number;
}

export class Utilities {
    static formatDate(date: Date) {
        return new Intl.DateTimeFormat("en-US").format(date);
    }

    static createButtons(state?: boolean) {
        return new MessageActionRow().addComponents(
            new MessageButton()
                .setCustomId("confirm")
                .setLabel("Yes")
                .setDisabled(state || false)
                .setStyle("SUCCESS"),
            new MessageButton()
                .setCustomId("deny")
                .setLabel("No")
                .setDisabled(state || false)
                .setStyle("DANGER")
        );
    }

    static async promptMessage(message: Message, author: User, time: number) {
        // We put in the time as seconds, with this it's being transferred to MS
        time *= 1000;
        // Only allow reactions from the author,
        // and the emoji must be in the array we provided.
        const filter = (interaction: Interaction) =>
            interaction.user.id === author.id;

        // And of course, await the reactions
        const buttons = message
            .awaitMessageComponent({
                filter,
                componentType: "BUTTON",
                time,
            })
            .then((collected) => {
                message.edit({ components: [this.createButtons(true)] });
                return collected;
            })
            .catch(async () => {
                await message.delete();
                message.channel.send(
                    "**❌ Session Expired, please try again.**"
                );
            });

        return buttons;
    }

    static toMilliseconds(options: toMillisecondsOptions) {
        const converters = {
            days: (value: number) => value * 864e5,
            hours: (value: number) => value * 36e5,
            minutes: (value: number) => value * 6e4,
            seconds: (value: number) => value * 1e3,
            milliseconds: (value: number) => value,
            microseconds: (value: number) => value / 1e3,
            nanoseconds: (value: number) => value / 1e6,
        };

        let totalMilliseconds = 0;

        Object.entries(options).forEach((item) => {
            const converter = converters[item[0]];

            totalMilliseconds += converter(item[1]);
        });

        // for (const [key, value] of Object.entries(options)) {
        //     const converter = converters[key];

        //     if (!converter) {
        //         throw new Error(`Unsupported time key: ${key}`);
        //     }

        //     totalMilliseconds += converter(value);
        // }

        return totalMilliseconds;
    }

    /**
     * Create a slider.
     *
     *  @param {SliderOptions} options Options for the slider
     *
     * Forked from https://github.com/azawat7/discord-epagination
     *
     * This is a cloned of discord-epagination but supports command interactions
     */
    static async createSlider(options: SliderOptions): Promise<void> {
        if (typeof options !== "object" || !options)
            throw new TypeError(
                "discord-epagination: options must be a object"
            );

        const { interaction, embeds, buttons, time, otherButtons } = options;

        let currentPage = 1;

        /// //////////////////////
        /// //////////////////////

        const getButtonData = (name: ButtonNames) => {
            return buttons?.find((btn) => btn.name === name);
        };

        const createButtons = (state?: boolean) => {
            const names: ButtonNames[] = ["back", "forward"];
            if (otherButtons.firstButton.enabled) {
                if (otherButtons.firstButton.position >= 0) {
                    names.splice(otherButtons.firstButton.position, 0, "first");
                } else {
                    names.push("first");
                }
            }
            if (otherButtons.lastButton.enabled) {
                if (otherButtons.lastButton.position >= 0) {
                    names.splice(otherButtons.lastButton.position, 0, "last");
                } else {
                    names.push("last");
                }
            }
            if (otherButtons.deleteButton.enabled) {
                if (otherButtons.deleteButton.position >= 0) {
                    names.splice(
                        otherButtons.deleteButton.position,
                        0,
                        "delete"
                    );
                } else {
                    names.push("delete");
                }
            }

            return names.reduce((row: MessageButton[], name: ButtonNames) => {
                row.push(
                    new MessageButton()
                        .setEmoji(getButtonData(name).emoji)
                        .setCustomId(`paginator-${name}`)
                        .setDisabled(state)
                        .setStyle(getButtonData(name).style || "SECONDARY")
                );
                return row;
            }, []);
        };

        const msgButtons = (state?: boolean) => [
            new MessageActionRow().addComponents(createButtons(state || false)),
        ];

        interaction.editReply({
            embeds: [embeds[currentPage - 1]],
            components: msgButtons(),
        });

        const sliderMessage = <Message>await interaction.fetchReply();

        /// //////////////////////
        /// //////////////////////

        const filter = (intractn: ButtonInteraction) => {
            return intractn.user.id === interaction.user.id;
        };

        const collectorOptions = () => {
            const optns = {
                filter,
                time: null,
            };
            if (time) optns.time = time;
            return optns;
        };

        const collector = sliderMessage.createMessageComponentCollector(
            collectorOptions()
        );

        /// //////////////////////

        async function editEmbed(
            interactn: ButtonInteraction,
            index: number,
            state?: boolean
        ) {
            interactn
                .update({
                    embeds: [embeds[index]],
                    components: msgButtons(state || false),
                })
                .catch((err) => {
                    console.error(err);
                });
        }

        collector.on("collect", async (intractn: ButtonInteraction) => {
            const tag = intractn.customId.split("-");
            const id = tag[1] as ButtonNames;

            if (id === "back") {
                if (currentPage === 1) {
                    currentPage = embeds.length;
                    editEmbed(intractn, currentPage - 1);
                    return;
                }
                currentPage -= 1;
            }
            if (id === "forward") {
                if (currentPage === embeds.length) {
                    currentPage = 1;
                    editEmbed(intractn, currentPage - 1);
                    return;
                }
                currentPage += 1;
            }
            if (id === "first") {
                currentPage = 1;
            }
            if (id === "last") {
                currentPage = embeds.length;
            }
            if (id === "delete") {
                sliderMessage.delete();
                return;
            }

            editEmbed(intractn, currentPage - 1);
        });

        collector.on("end", () => {
            sliderMessage
                .edit({
                    components: msgButtons(true),
                })
                .catch((err) => {
                    console.error(err);
                });
        });
    }
}
