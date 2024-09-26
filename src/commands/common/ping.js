const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Replies with Pong!"),
  guild_id: null,
  async execute(interaction) {
    await interaction.reply("Pong!");
  },
};
