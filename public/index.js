const elements = {
	discord: document.getElementById("discord"),
	aside: document.getElementsByTagName("aside")[0]
};

caches.open("cache").then((cache) => {
	const cachedFetch = (url, expire) =>
		cache.match(url).then(async (r) => {
			if (r) {
				const date = r.headers.get("date"),
					dt = date ? new Date(date).getTime() : 0;

				if (dt > Date.now() - expire) return r;
			}

			cache.add(url);
			return cache.match(url);
		});

	// Discord
	cachedFetch("https://edge.rom.dog/discord/751469608615280670", 21600000)
		.then((r) => r.json())
		.then((json) => {
			elements.discord.href = json.instant_invite;
			elements.aside.toggleAttribute("loaded");
		})
		.catch((e) => {
			console.error(e);
			elements.discord.style = "display: none";
			elements.aside.toggleAttribute("loaded");
		});
});
// dsc.bio
//cachedFetch("");
