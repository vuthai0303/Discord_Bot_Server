require("dotenv").config();
const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("hey")
    .setDescription("Replies with hey!"),
  guild_id: process.env.SERVER_ID,
  async execute(interaction) {
    await interaction.reply("Hey!");
  },
};
