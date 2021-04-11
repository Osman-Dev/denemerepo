import * as slash from "https://raw.githubusercontent.com/DjDeveloperr/harmony/refactor/deploy.ts";

// Pick up TOKEN and PUBLIC_KEY from ENV.
slash.init({ env: true });

const ACTIVITIES: {
  [name: string]: {
    id: string;
    name: string;
  };
} = {
  poker: {
    id: "755827207812677713",
    name: "Poker Night",
  },
  betrayal: {
    id: "773336526917861400",
    name: "Betrayal.io",
  },
  youtube: {
    id: "755600276941176913",
    name: "YouTube Together",
  },
  fishing: {
    id: "814288819477020702",
    name: "Fishington.io",
  },
};

// Create Slash Commands if not present
slash.commands.all().then((e) => {
  if (e.size !== 2) {
    slash.commands.bulkEdit([
      {
        name: "davet",
        description: "Botu sunucuya ekle.",
      },
      {
        name: "parti",
        description: "Partiyi başlatır.",
        options: [
          {
            name: "kanal",
            type: slash.SlashCommandOptionType.CHANNEL,
            description: "Partiyi başlatacağın kanal.",
            required: true,
          },
          {
            name: "tür",
            type: slash.SlashCommandOptionType.STRING,
            description: "Ne partisi başlatacağın.",
            required: true,
            choices: Object.entries(ACTIVITIES).map((e) => ({
              name: e[1].name,
              value: e[0],
            })),
          },
        ],
      },
    ]);
  }
});

slash.handle("activity", (d) => {
  if (!d.guild) return;
  const channel = d.option<slash.InteractionChannel>("channel");
  const activity = ACTIVITIES[d.option<string>("activity")];
  if (!channel || !activity) {
    return d.reply("Yanlış kullanım.", { ephemeral: true });
  }
  if (channel.type !== slash.ChannelTypes.GUILD_VOICE) {
    return d.reply("Lütfen bir ses kanalı belirtin.", {
      ephemeral: true,
    });
  }

  slash.client.rest.api.channels[channel.id].invites
    .post({
      max_age: 604800,
      max_uses: 0,
      target_application_id: activity.id,
      target_type: 2,
      temporary: false,
    })
    .then((inv) => {
      d.reply(
        `[${activity.name} partisini ${channel.name} kanalında başlatmak için tıkla.](<https://discord.gg/${inv.code}>)`
      );
    })
    .catch((e) => {
      console.log("Failed", e);
      d.reply("Komut kullanımı başarısız.", { ephemeral: true });
    });
});

slash.handle("invite", (d) => {
  d.reply(
    `• [Botu davet et.](<https://discord.com/api/oauth2/authorize?client_id=799338366642552872&permissions=1&scope=applications.commands%20bot>)\n` +
            `• [Sunucumuza katıl.](<https://discord.gg/zVAFeDZdKz>)`,
    { ephemeral: true }
  );
});

slash.handle("*", (d) => d.reply("Unhandled Command", { ephemeral: true }));
slash.client.on("interactionError", console.log);
