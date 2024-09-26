require("dotenv").config();
const fs = require("node:fs");
const path = require("node:path");
const { IntentsBitField, Client, Collection, Events } = require("discord.js");

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
  ],
});

const foldersPath = path.join(__dirname, "commands");
const commandFolders = fs.readdirSync(foldersPath);

client.cooldowns = new Collection();
client.commands = new Collection();

const declare_slash_commands = () => {
  for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs
      .readdirSync(commandsPath)
      .filter((file) => file.endsWith(".js"));
    client.guilds.cache.forEach(async (guild) => {
      // clear slash commands
      await guild.commands.set([]);

      // register new slash commands
      for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        if ("data" in command && "execute" in command) {
          client.commands.set(command.data.name, command);
          if (command?.guild_id && guild.id !== command?.guild_id) {
            return;
          } else {
            try {
              await guild.commands.create(command.data);
            } catch (error) {
              console.error(error);
            }
          }
        } else {
          console.log(
            `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
          );
        }
      }
    });
  }
};

client.once(Events.ClientReady, async (e) => {
  console.log(`declare slash commands is running!`);
  await declare_slash_commands(); // register slash commands
  console.log(`${e.user.tag} is online!`);
});

client.on(Events.MessageCreate, (message) => {
  if (message.content === "ping") {
    message.reply("pong");
  }
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);

  if (!command) {
    console.error(`Command ${interaction.commandName} was not found!`);
    return;
  }

  const { cooldowns } = interaction.client;

  if (!cooldowns.has(command.data.name)) {
    cooldowns.set(command.data.name, new Collection());
  }

  const now = Date.now();
  const timestamps = cooldowns.get(command.data.name);
  const defaultCooldownDuration = 3;
  const cooldownAmount = (command.cooldown ?? defaultCooldownDuration) * 1000;

  if (timestamps.has(interaction.user.id)) {
    const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;

    if (now < expirationTime) {
      const expiredTimestamp = Math.round(expirationTime / 1000);
      return interaction.reply({
        content: `Please wait, you are on a cooldown for \`${command.data.name}\`. You can use it again <t:${expiredTimestamp}:R>.`,
        ephemeral: true,
      });
    }
  }

  timestamps.set(interaction.user.id, now);
  setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: "There was an error while executing this command!",
        ephemeral: true,
      });
    } else {
      await interaction.reply({
        content: "There was an error while executing this command!",
        ephemeral: true,
      });
    }
  }
});

client.login(process.env.TOKEN);
