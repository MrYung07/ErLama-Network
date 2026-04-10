const { 
  SlashCommandBuilder, 
  ModalBuilder, 
  TextInputBuilder, 
  TextInputStyle, 
  ActionRowBuilder, 
  EmbedBuilder 
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('partner')
    .setDescription('Crea un partner con GUI'),

  async execute(interaction) {

    const modal = new ModalBuilder()
      .setCustomId('partner_modal')
      .setTitle('🤝 Crea Partner');

    const nome = new TextInputBuilder()
      .setCustomId('nome')
      .setLabel('Nome server')
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const menzione = new TextInputBuilder()
      .setCustomId('menzione')
      .setLabel('Menzione (Con chi hai fatto partner)')
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const bio = new TextInputBuilder()
      .setCustomId('bio')
      .setLabel('Descrizione server')
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true);

    const invito = new TextInputBuilder()
      .setCustomId('invito')
      .setLabel('Link invito Discord')
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    modal.addComponents(
      new ActionRowBuilder().addComponents(nome),
      new ActionRowBuilder().addComponents(menzione),
      new ActionRowBuilder().addComponents(bio),
      new ActionRowBuilder().addComponents(invito)
    );

    await interaction.showModal(modal);
  }
};