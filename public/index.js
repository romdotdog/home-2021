const cachePromise = caches.open("cache");
const discord = document.getElementById("discord"),
	avatar = document.getElementById("avatar"),
	discordSection = document.getElementById("discordSection"),
	aside = document.getElementsByTagName("aside")[0],
	address = document.getElementsByTagName("address")[0],
	discriminator = document.getElementsByTagName("discriminator")[0];

discord.addEventListener("click", e => {
	e.preventDefault();
	window.location.href = `discord://${discord.href.replace("https://", "")}`;
	/*
	window.open(
		discord.href,
		`Invite to rom's server`,
		"menubar=no,width=524,height=777,location=no,resizable=no,scrollbars=yes,status=no"
	);
	*/
});

const discordUser = document.createElement("article");

{
	const avatarElement = document.createElement("img");
	avatarElement.width = "32";
	avatarElement.height = "32";
	discordUser.appendChild(avatarElement);
	discordUser.appendChild(document.createElement("name"));
	const statusElement = document.createElement("status");
	statusElement.innerText = "Playing ";
	statusElement.appendChild(document.createElement("strong"));
	discordUser.appendChild(statusElement);
}

const hour = 1000 * 60 * 60;
cachePromise.then(cache => {
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
			console.log(json);
			discord.href = json.instant_invite;

			const fragment = document.createDocumentFragment();
			json.members.forEach((member, i) => {
				const memberElement = discordUser.cloneNode(true);
				memberElement.style = `--i: ${i}`;
				const [avatarElement, nameElement, statusElement] =
					memberElement.childNodes;
				avatarElement.src = member.avatar_url + "?size=32";
				nameElement.innerText = member.username;

				if ("game" in member) {
					statusElement.lastChild.textContent = member.game.name;
				} else {
					memberElement.toggleAttribute("stub");
					statusElement.remove();
				}

				fragment.appendChild(memberElement);
			});

			discordSection.appendChild(fragment);
			if ("fonts" in document) {
				Promise.all([
					document.fonts.load("700 12px Lato"),
					document.fonts.load("700 16px Lato"),
					document.fonts.load("16px Lato")
				]).then(() => {
					aside.toggleAttribute("loaded");
				});
			} else {
				aside.toggleAttribute("loaded");
			}
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

			const user = json.payload.discord;
			avatar.src = `https://cdn.discordapp.com/avatars/705148136904982570/${user.avatar}.webp?size=256`;
			avatar.addEventListener("load", () => avatar.toggleAttribute("loaded"));
			discriminator.innerText = `#${user.discriminator}`;

			address.toggleAttribute("loaded");
		});
});
