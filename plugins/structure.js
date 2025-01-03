import { bot } from '#lib';

bot(
	{
		pattern: 'structure',
		public: true,
		desc: 'Get the directory structure of the bot',
		type: 'info',
	},
	async message => {
		const structureText = `
Directory structure:
└── AstroX11-Xstro/
    ├── readme.md
    ├── Dockerfile
    ├── LICENSE
    ├── Procfile
    ├── SECURITY.md
    ├── app.json
    ├── config.js
    ├── heroku.yml
    ├── index.js
    ├── notes.txt
    ├── package.json
    ├── render.yaml
    ├── server.js
    ├── .yarnrc.yml
    ├── bot/
    │   ├── antidelete.js
    │   ├── antifake.js
    │   ├── antilink.js
    │   ├── antispam.js
    │   ├── antiviewonce.js
    │   ├── antiword.js
    │   ├── autokick.js
    │   ├── autoupdater.js
    │   ├── chatbot.js
    │   ├── index.js
    │   ├── metadatagc.js
    │   └── schedule.js
    ├── lib/
    │   ├── class.js
    │   ├── client.js
    │   ├── database.js
    │   ├── debug.js
    │   ├── events.js
    │   ├── files.js
    │   ├── index.js
    │   ├── logger.js
    │   ├── message.js
    │   ├── plugins.js
    │   └── session.js
    ├── media/
    ├── plugins/
    │   ├── add.js
    │   ├── ads.js
    │   ├── afk.js
    │   ├── ai.js
    │   ├── alive.js
    │   ├── antibot.js
    │   ├── antidelete.js
    │   ├── antilink.js
    │   ├── antispam.js
    │   ├── antiviewonce.js
    │   ├── antiword.js
    │   ├── areact.js
    │   ├── autokick.js
    │   ├── ban.js
    │   ├── bgm.js
    │   ├── config.js
    │   ├── contacts.js
    │   ├── converter.js
    │   ├── dev.js
    │   ├── download.js
    │   ├── filters.js
    │   ├── forex.js
    │   ├── fun.js
    │   ├── funn.js
    │   ├── getChats.js
    │   ├── group.js
    │   ├── help.js
    │   ├── meme.js
    │   ├── mention.js
    │   ├── menu.js
    │   ├── misc.js
    │   ├── news.js
    │   ├── notes.js
    │   ├── plugin.js
    │   ├── schedule.js
    │   ├── search.js
    │   ├── sudo.js
    │   ├── system.js
    │   ├── tools.js
    │   ├── translate.js
    │   ├── updater.js
    │   ├── vars.js
    │   ├── warn.js
    │   └── whatsapp.js
    │   └── structure.js
    ├── sql/
    │   ├── afk.js
    │   ├── akick.js
    │   ├── alive.js
    │   ├── antibot.js
    │   ├── antidelete.js
    │   ├── antilink.js
    │   ├── antispam.js
    │   ├── antivv.js
    │   ├── antiword.js
    │   ├── areact.js
    │   ├── ban.js
    │   ├── bgm.js
    │   ├── config.js
    │   ├── filters.js
    │   ├── index.js
    │   ├── mention.js
    │   ├── notes.js
    │   ├── plugins.js
    │   ├── scheduler.js
    │   ├── store.js
    │   ├── sudo.js
    │   └── warn.js
    ├── utils/
    │   ├── _xstro.js
    │   ├── client.js
    │   ├── ffmpeg.js
    │   ├── index.js
    │   ├── json.js
    │   ├── main.js
    │   ├── plugins.js
    │   ├── proxy.txt
    │   ├── scrape.js
    │   ├── updater.js
    │   └── variables.js
    └── .github/
        ├── contributing.md
        ├── dependabot.yml
        ├── js/
        │   ├── panel.js
        │   └── test.js
        └── workflows/
            ├── docker-image.yml
            ├── docker-publish.yml
            ├── greetings.yml
            ├── label.yml
            ├── node.js.yml
            └── stale.yml
		`.trim();

		return await message.send(`\`\`\`${structureText}\`\`\``);
	},
);
