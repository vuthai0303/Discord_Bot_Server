require("dotenv").config();
const { REST, Routes, ApplicationCommandOptionType } = require("discord.js");

const commands = [
  {
    name: "sum",
    description: "sum between two numbers",
    options: [
      {
        name: "first_number",
        description: "first number",
        type: ApplicationCommandOptionType.Number,
        required: true,
      },
      {
        name: "second_number",
        description: "second number",
        type: ApplicationCommandOptionType.Number,
        required: true,
      },
    ],
  },
  {
    name: "ping",
    description: "ping",
  },
  {
    name: "hey",
    description: "hey",
  },
];

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

(async () => {
  try {
    console.log("Started refreshing application (/) commands.");

    const response = await rest.put(
      Routes.applicationCommands(process.env.USER_ID),
      {
        body: {},
      }
    );

    console.log(response);

    console.log("Successfully reloaded application (/) commands.");
  } catch (error) {
    console.error(error);
  }
})();
