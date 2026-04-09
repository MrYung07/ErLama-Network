const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticket')
    .setDescription('Apri il pannello ticket'),

  async execute(interaction) {

    const embed = new EmbedBuilder()
      .setTitle('🎫 Sistema Ticket | 🇮🇹 ErLama Network 🇮🇹')
        .setDescription(`
        Ciao! Se hai bisogno di assistenza, seleziona la categoria più adatta qui sotto 👇
        🎧 **Supporto** → Per problemi, dubbi o segnalazioni
        🤝 **Partnership** → Per collaborazioni con altri server
        🛠️ **Candidatura Staff**
        `)
        .setColor('Blue')
        .setFooter({ text: `Bot Sviluppato da Yung Network | 🇮🇹 ErLama Network 🇮🇹`}); 

    const menu = new StringSelectMenuBuilder()
      .setCustomId('ticket_select')
      .setPlaceholder('🎟️ Sistema Ticket 🎟️')
      .addOptions([
        {
          label: '🎧 Supporto',
          description: 'Per problemi, dubbi o segnalazioni',
          value: 'support'
        },
        {
          label: '🤝 Partnership',
          description: 'Per collaborazioni con il server',
          value: 'Partnership'
        },
        {
          label: '🛠️ Candidatura Staff',
          description: 'diventa staff',
          value: 'staff'
        }
      ]);

    const row = new ActionRowBuilder().addComponents(menu);

    await interaction.reply({
      embeds: [embed],
      components: [row],
    });
  }
};