const { REST, Routes } = require('discord.js');
const fs = require('fs');

const commands = [];
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  if (command.data) commands.push(command.data.toJSON());
}

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
  try {
    console.log(`🚀 Registrazione ${commands.length} comandi globali...`);

    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID), // ATTENZIONE: client id del tuo bot
      { body: commands }
    );

    console.log('✅ Comandi globali registrati con successo!');
  } catch (error) {
    console.error(error);
  }
})();