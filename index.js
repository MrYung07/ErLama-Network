const { Client, GatewayIntentBits, Collection, PermissionsBitField, ChannelType, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, StringSelectMenuBuilder } = require('discord.js');
const fs = require('fs');
// CREAZIONE CLIENT
const client = new Client({   intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessages,GatewayIntentBits.MessageContent] });
client.commands = new Collection();

// CARICAMENTO COMANDI
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.data.name, command);
}

// TICKET PER SERVER
const ticketsPerGuild = new Map(); // key = guildId, value = Map(userId -> channelId)

// CONFIG SERVER: metti qui per ogni server ID i ruoli e categorie
const guildConfig = {
  "1451613622160855184": { CATEGORY_ID: "1451673471858901174", STAFF_ROLE_ID: "1480500805617451090" }
};

client.once('clientReady', () => {
  console.log(`✅ Bot online come ${client.user.tag}`);

  client.user.setPresence({
    activities: [{
      name: '/help | ErLama 🎫🤖',
      type: 3 // 0 = Giocando, 1 = Streaming, 2 = Ascoltando, 3 = Guardando
    }],
    status: 'online'
  });
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isStringSelectMenu()) return;

  const member = interaction.member;
  const selectedRoles = interaction.values;

  let added = [];
  let removed = [];

  for (const roleId of selectedRoles) {
    const role = interaction.guild.roles.cache.get(roleId);
    if (!role) continue;

    if (member.roles.cache.has(roleId)) {
      await member.roles.remove(roleId);
      removed.push(role.name);
    } else {
      await member.roles.add(roleId);
      added.push(role.name);
    }
  }

  let replyMessage = '';
  if (added.length) replyMessage += `✅ Ruoli aggiunti: ${added.join(', ')}\n`;
  if (removed.length) replyMessage += `⚠ Ruoli rimossi: ${removed.join(', ')}`;

  await interaction.reply({ content: replyMessage || 'Nessuna modifica ai ruoli.', flags: 64 });
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isStringSelectMenu()) return;

  if (!interaction.customId.startsWith('autorole_')) return;

  const member = interaction.member;
  const selectedRoles = interaction.values;

  let added = [];
  let removed = [];

  for (const roleId of selectedRoles) {
    const role = interaction.guild.roles.cache.get(roleId);
    if (!role) continue;

    if (member.roles.cache.has(roleId)) {
      await member.roles.remove(roleId);
      removed.push(role.name);
    } else {
      await member.roles.add(roleId);
      added.push(role.name);
    }
  }

  let msg = '';
  if (added.length) msg += `✅ Aggiunti: ${added.join(', ')}\n`;
  if (removed.length) msg += `⚠ Rimossi: ${removed.join(', ')}`;

  await interaction.reply({
    content: msg || 'Nessuna modifica.',
    flags: 64
  });
});


// EVENTO INTERACTION
client.on('interactionCreate', async interaction => {

  // SLASH COMMAND
  if (interaction.isChatInputCommand()) {
    const command = client.commands.get(interaction.commandName);
    if (!command) return;
    try { await command.execute(interaction); } 
    catch (err) { console.error(err); await interaction.reply({ content: 'Errore!', ephemeral: true }); }
  }

let activeTickets = ticketsPerGuild.get(interaction.guild.id);
if (!activeTickets) {
  activeTickets = new Map();
  ticketsPerGuild.set(interaction.guild.id, activeTickets);
}
  // MENU SELECT TICKET
  if (interaction.isStringSelectMenu() && interaction.customId === 'ticket_select') {

    const config = guildConfig[interaction.guild.id];
    if (!config) return interaction.reply({ content: "Server non configurato.", ephemeral: true });

    let tickets = ticketsPerGuild.get(interaction.guild.id);
    if (!tickets) { tickets = new Map(); ticketsPerGuild.set(interaction.guild.id, tickets); }

    if (tickets.has(interaction.user.id)) {
      return interaction.reply({ content: "Hai già un ticket aperto!", ephemeral: true });
    }

    const tipo = interaction.values[0];
    let nomeTipo = tipo === "support" ? "supporto" : tipo;
    let descrizione = tipo === "support" ? "🛠️ Supporto: descrivi il problema." :
                      tipo === "Partnership" ? "🤝 Partnership : Nel mentre che aspetti un staff dici quanti membri ha il tuo server." :
                      "🛠️ Candidatura Staff: indica qui le tue qualita";

    const channel = await interaction.guild.channels.create({
      name: `${nomeTipo}-${interaction.user.username}`,
      type: ChannelType.GuildText,
      parent: config.CATEGORY_ID,
      permissionOverwrites: [
        { id: interaction.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
        { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
        { id: config.STAFF_ROLE_ID, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] }
      ]
    });

    tickets.set(interaction.user.id, channel.id);

    const closeBtn = new ButtonBuilder().setCustomId('close_ticket').setLabel('Chiudi Ticket').setStyle(ButtonStyle.Danger);
    const row = new ActionRowBuilder().addComponents(closeBtn);

    const embed = new EmbedBuilder().setTitle(`🎫 Ticket ${nomeTipo}`).setDescription(descrizione).setColor('Green');

    await channel.send({ content: `${interaction.user}`, embeds: [embed], components: [row] });
    await interaction.reply({ content: `✅ Ticket creato: ${channel}`, ephemeral: true });
  }

  // BOTTONI CHIUSURA
  if (interaction.isButton() && interaction.customId === 'close_ticket') {
    const tickets = ticketsPerGuild.get(interaction.guild.id);
    if (!tickets) return;

    const userId = [...tickets.entries()].find(([_, id]) => id === interaction.channel.id)?.[0];
    if (userId) tickets.delete(userId);

    await interaction.reply({ content: '🔒 Chiusura ticket in 3 secondi...', ephemeral: true });
    setTimeout(() => interaction.channel.delete(), 3000);
  }
});


// LOGIN
require('dotenv').config();
client.login(process.env.TOKEN);
