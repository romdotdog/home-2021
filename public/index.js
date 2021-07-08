let discord, avatar, aside, address, discriminator;

const hour = 1000 * 60 * 60;
caches.open("cache").then(cache => {
	const cachedFetch = (url, expire) =>
		cache.match(url).then(r => {
			if (r) {
				const date = r.headers.get("date"),
					dt = date ? new Date(date).getTime() : 0;

				if (dt > Date.now() - expire) return r;
			}

			return cache.add(url).then(() => cache.match(url));
		});

	// Discord
	cachedFetch("https://edge.rom.dog/discord/751469608615280670", hour * 6)
		.then(r => r.json())
		.then(json => {
			discord.href = json.instant_invite;
			aside.toggleAttribute("loaded");
		})
		.catch(e => {
			console.error(e);
			discord.style = "display: none";
			aside.toggleAttribute("loaded");
		});

	// Discord profile info
	cachedFetch("https://edge.rom.dog/dsc.bio/rom", hour)
		.then(r => r.json())
		.then(json => {
			console.log(json);

			const discordUser = json.payload.discord;
			avatar.src = `https://cdn.discordapp.com/avatars/705148136904982570/${discordUser.avatar}.webp?size=256`;
			avatar.addEventListener("load", () => avatar.toggleAttribute("loaded"));
			discriminator.innerText = `#${discordUser.discriminator}`;

			address.toggleAttribute("loaded");
		});
});

discord = document.getElementById("discord");
avatar = document.getElementById("avatar");
aside = document.getElementsByTagName("aside")[0];
address = document.getElementsByTagName("address")[0];
discriminator = document.getElementsByTagName("discriminator")[0];

discord.addEventListener("click", e => {
	e.preventDefault();
	window.open(
		discord.href,
		`Invite to ${name}`,
		"menubar=no,width=524,height=777,location=no,resizable=no,scrollbars=yes,status=no"
	);
});
