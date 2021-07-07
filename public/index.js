const DISCORD_URL = "https://edge.rom.dog/discord/751469608615280670";

const elements = {
	discord: document.getElementById("discord"),
	aside: document.getElementsByTagName("aside")[0]
};

// Discord
fetch(DISCORD_URL, {
	cache: "only-if-cached",
	mode: "same-origin"
})
	.then((r) => {
		if (r.status != 504) {
			const date = res.headers.get("date"),
				dt = date ? new Date(date).getTime() : 0;
			if (dt > Date.now() - 21600) return r;
		}

		return fetch(DISCORD_URL, {
			cache: "force-cache"
		});
	})
	.then((r) => r.json())
	.then((json) => {
		elements.discord.href = json.instant_invite;
		elements.aside.toggleAttribute("load");
	})
	.catch(() => {
		elements.discord.style = "display: none";
		elements.aside.toggleAttribute("load");
	});
