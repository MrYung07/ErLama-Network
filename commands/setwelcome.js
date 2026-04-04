const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setwelcome')
    .setDescription('Imposta il canale di benvenuto')
    .addChannelOption(option =>
      option.setName('canale')
        .setDescription('Canale di benvenuto')
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const channel = interaction.options.getChannel('canale');

    const config = JSON.parse(fs.readFileSync('./welcomeConfig.json'));

    config[interaction.guild.id] = {
      channelId: channel.id
    };

    fs.writeFileSync('./welcomeConfig.json', JSON.stringify(config, null, 2));

    await interaction.reply({
      content: `✅ Canale di benvenuto impostato su ${channel}`,
      ephemeral: true
    });
  }
};