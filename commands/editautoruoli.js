const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
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

// salva config
function saveConfig(data) {
  fs.writeFileSync(configPath, JSON.stringify(data, null, 2));
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('editautoruoli')
    .setDescription('Gestisci i ruoli autoruoli')
    .addStringOption(option =>
      option.setName('azione')
        .setDescription('Aggiungi o rimuovi')
        .setRequired(true)
        .addChoices(
          { name: 'Aggiungi', value: 'add' },
          { name: 'Rimuovi', value: 'remove' }
        ))
    .addStringOption(option =>
      option.setName('categoria')
        .setDescription('Categoria')
        .setRequired(true)
        .addChoices(
          { name: 'Età', value: 'eta' },
          { name: 'Piattaforma', value: 'piattaforma' },
          { name: 'Lingua', value: 'lingua' },
          { name: 'Giochi', value: 'giochi' }
        ))
    .addRoleOption(option =>
      option.setName('ruolo')
        .setDescription('Ruolo da aggiungere o rimuovere')
        .setRequired(true)),

  async execute(interaction) {

    // SOLO ADMIN
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return interaction.reply({ content: '❌ Solo admin!', flags: 64 });
    }

    const action = interaction.options.getString('azione');
    const category = interaction.options.getString('categoria');
    const role = interaction.options.getRole('ruolo');

    const config = loadConfig();

    // crea struttura server
    if (!config[interaction.guild.id]) {
      config[interaction.guild.id] = {
        eta: [],
        piattaforma: [],
        lingua: [],
        giochi: []
      };
    }

    const roles = config[interaction.guild.id][category];

    if (action === 'add') {
      if (roles.includes(role.id)) {
        return interaction.reply({ content: `❌ ${role.name} già presente.`, flags: 64 });
      }

      roles.push(role.id);
      saveConfig(config);

      return interaction.reply({
        content: `✅ Ruolo ${role.name} aggiunto in ${category}`,
        flags: 64
      });
    }

    if (action === 'remove') {
      if (!roles.includes(role.id)) {
        return interaction.reply({ content: `❌ ${role.name} non presente.`, flags: 64 });
      }

      config[interaction.guild.id][category] =
        roles.filter(r => r !== role.id);

      saveConfig(config);

      return interaction.reply({
        content: `✅ Ruolo ${role.name} rimosso da ${category}`,
        flags: 64
      });
    }
  }
};