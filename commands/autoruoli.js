const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, '../autoroleConfig.json');

// carica config sicuro
function loadConfig() {
  try {
    return JSON.parse(fs.readFileSync(configPath));
  } catch {
    return {};
  }
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('autoruoli')
    .setDescription('Mostra il menu autoruoli'),

  async execute(interaction) {

    const config = loadConfig();
    const serverConfig = config[interaction.guild.id];

    if (!serverConfig) {
      return interaction.reply({
        content: '❌ Nessun ruolo configurato. Usa /editautoruoli',
        flags: 64
      });
    }

    const rows = [];

    // funzione per creare menu
    function createMenu(categoryName, customId, rolesArray) {
      if (!rolesArray || rolesArray.length === 0) return null;

      const options = rolesArray.map(roleId => {
        const role = interaction.guild.roles.cache.get(roleId);
        if (!role) return null;

        return {
          label: role.name,
          value: role.id,
          description: `Seleziona ${role.name}`
        };
      }).filter(r => r !== null);

      if (options.length === 0) return null;

      return new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId(customId)
          .setPlaceholder(`Seleziona ${categoryName}`)
          .setMinValues(1)
          .setMaxValues(options.length)
          .addOptions(options)
      );
    }

    // crea menu per ogni categoria
    const eta = createMenu('Età', 'autorole_eta', serverConfig.eta);
    const piattaforma = createMenu('Piattaforma', 'autorole_piattaforma', serverConfig.piattaforma);
    const lingua = createMenu('Lingua', 'autorole_lingua', serverConfig.lingua);
    const giochi = createMenu('Giochi', 'autorole_giochi', serverConfig.giochi);

    if (eta) rows.push(eta);
    if (piattaforma) rows.push(piattaforma);
    if (lingua) rows.push(lingua);
    if (giochi) rows.push(giochi);

    if (rows.length === 0) {
      return interaction.reply({
        content: '❌ Nessun ruolo valido trovato.',
        flags: 64
      });
    }

    // EMBED
    const embed = new EmbedBuilder()
      .setTitle('🎭 Sistema Autoruoli')
      .setDescription(
        'Seleziona i ruoli che desideri 👇\n\n' +
        '📌 **Categorie disponibili:**\n' +
        '• Età\n' +
        '• Piattaforma\n' +
        '• Lingua\n' +
        '• Giochi'
      )
      .setColor('Blue')
      .setFooter({ text: 'Puoi selezionare e deselezionare i ruoli quando vuoi' });

    await interaction.reply({
      embeds: [embed],
      components: rows,
      ephemeral: false
    });
  }
};