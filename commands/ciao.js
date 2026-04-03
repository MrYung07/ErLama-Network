const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ciao')
    .setDescription('Ti saluta'),

  async execute(interaction) {
    await interaction.reply(`Ciao ${interaction.user.username} 👋`);
  }
};