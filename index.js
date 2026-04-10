const { Client, GatewayIntentBits, Collection, PermissionsBitField, ChannelType, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const fs = require('fs');
require('dotenv').config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(f => f.endsWith('.js'));
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  if (command.data) client.commands.set(command.data.name, command);
}

// Ticket system
const ticketsPerGuild = new Map(); // guildId -> Map(userId -> channelId)
const guildConfig = {
  "1451613622160855184": { CATEGORY_ID: "1451673471858901174", STAFF_ROLE_ID: "1480500805617451090" }
};

// Ready
client.once('clientReady', () => {
  console.log(`✅ Bot online come ${client.user.tag}`);
  client.user.setPresence({
    activities: [{ name: '/help | ErLama 🎫🤖', type: 3 }],
    status: 'online'
  });
});

// Interaction handler unico
client.on('interactionCreate', async interaction => {

  // SLASH COMMAND
  if (interaction.isChatInputCommand()) {
    const command = client.commands.get(interaction.commandName);
    if (!command) return;
    try { await command.execute(interaction); } 
    catch (err) { console.error(err); await interaction.reply({ content: 'Errore!', ephemeral: true }); }
  }

// 📩 MODAL PARTNER
if (interaction.isModalSubmit() && interaction.customId === 'partner_modal') {

  const nome = interaction.fields.getTextInputValue('nome');
  const menzione = interaction.fields.getTextInputValue('menzione');
  const bio = interaction.fields.getTextInputValue('bio');
  const invito = interaction.fields.getTextInputValue('invito');

  const embed = new EmbedBuilder()
    .setTitle(`🤝 Partner con ${nome}`)
    .setDescription(
      `📝 **Descrizione:**\n${bio}\n\n` +
      `🔗 **Invito:** ${invito}\n\n` +
      `📢 **Partner Richiesta da:** ${menzione}\n\n` +
      `🤝 **Fatta da:** ${interaction.user}`
    )
    .setColor('Blue')
    .setTimestamp();

  await interaction.reply({
    content: '✅ Partner creato!',
    ephemeral: true
  });

  await interaction.channel.send({ embeds: [embed] });
}
  // SELECT MENU - Autorole
  if (interaction.isStringSelectMenu() && interaction.customId.startsWith('autorole_')) {
    const member = interaction.member;
    const added = [], removed = [];
    for (const roleId of interaction.values) {
      const role = interaction.guild.roles.cache.get(roleId);
      if (!role) continue;
      if (member.roles.cache.has(roleId)) { await member.roles.remove(roleId); removed.push(role.name); }
      else { await member.roles.add(roleId); added.push(role.name); }
    }
    let msg = '';
    if (added.length) msg += `✅ Aggiunti: ${added.join(', ')}\n`;
    if (removed.length) msg += `⚠ Rimossi: ${removed.join(', ')}`;
    await interaction.reply({ content: msg || 'Nessuna modifica.', ephemeral: true });
  }

  // SELECT MENU - Ticket
  if (interaction.isStringSelectMenu() && interaction.customId === 'ticket_select') {
    const config = guildConfig[interaction.guild.id];
    if (!config) return interaction.reply({ content: "Server non configurato.", ephemeral: true });
    let tickets = ticketsPerGuild.get(interaction.guild.id);
    if (!tickets) { tickets = new Map(); ticketsPerGuild.set(interaction.guild.id, tickets); }

    if (tickets.has(interaction.user.id))
      return interaction.reply({ content: "Hai già un ticket aperto!", ephemeral: true });

    const tipo = interaction.values[0];
    const nomeTipo = tipo === "support" ? "supporto" : tipo;
    const descrizione = tipo === "support" ? "🛠️ Supporto: descrivi il problema." :
      tipo === "Partnership" ? "🤝 Partnership: indica quanti membri ha il tuo server." :
      "🛠️ Candidatura Staff: indica le tue qualità";

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

  // BUTTON - Close Ticket
  if (interaction.isButton() && interaction.customId === 'close_ticket') {
    const tickets = ticketsPerGuild.get(interaction.guild.id);
    if (!tickets) return;
    const userId = [...tickets.entries()].find(([_, id]) => id === interaction.channel.id)?.[0];
    if (userId) tickets.delete(userId);
    await interaction.reply({ content: '🔒 Chiusura ticket in 3 secondi...', ephemeral: true });
    setTimeout(() => interaction.channel.delete(), 3000);
  }
});

// Welcome DM con URL valido
client.on('guildMemberAdd', async member => {
  const config = JSON.parse(fs.readFileSync('./welcomeConfig.json'));
  const guildConfig = config[member.guild.id];
  if (!guildConfig) return;

  const channel = member.guild.channels.cache.get(guildConfig.channelId);
  if (!channel) return;

  const background = "https://image2url.com/r2/default/images/1775389122263-7baed56e-97e8-4aa2-9b3b-3bc34e0a7436.blob"; // URL valido
  const avatar = member.user.displayAvatarURL({ extension: 'png', size: 512 });
  const image = `https://api.popcat.xyz/welcomecard?background=${encodeURIComponent(background)}&avatar=${encodeURIComponent(avatar)}&text1=${encodeURIComponent(member.user.username)}&text2=${encodeURIComponent("Benvenuto!")}&text3=${encodeURIComponent(`Membri: ${member.guild.memberCount}`)}`;

  const embed = new EmbedBuilder()
    .setTitle('👋 Benvenuto/a in 🇮🇹 ErLama Network 🇮🇹')
    .setDescription(`Ciao ${member}, benvenuto! nel server ti ricordo di <#1476972204934692965>`)
    .setImage(image)
    .setColor('Blue');

  await channel.send({ embeds: [embed] });
  try { await member.send({ embeds: [embed] }); } catch(err){ console.log(`Non posso inviare DM a ${member.user.tag}`);}
});

client.login(process.env.TOKEN);