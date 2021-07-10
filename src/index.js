(() => {
	const cachePromise = caches.open("cache");
	const discord = document.getElementById("discord"),
		avatar = document.getElementById("avatar"),
		discordSection = document.getElementById("discordSection"),
		aside = document.getElementsByTagName("aside")[0],
		address = document.getElementsByTagName("address")[0],
		discriminator = document.getElementsByTagName("discriminator")[0];

	const quidem = t => {
		const p = new Promise(r => setTimeout(r, t));
		return f =>
			(...args) =>
				p.then(() => f(...args));
	};

	const asideQuidem = quidem(50);
	const avatarQuidem = quidem(1000);
	const addressQuidem = quidem(1200);

	discord.addEventListener("click", e => {
		e.preventDefault();
		window.location.href = discord.href.replace("https://", "discord://");
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
		avatarElement.alt = "Avatar";
		discordUser.appendChild(avatarElement);
		discordUser.appendChild(document.createElement("name"));
		discordUser.appendChild(document.createElement("status"));
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
				discord.href = json["instant_invite"];

				const fragment = document.createDocumentFragment();
				const imageLoadPromises = json["members"].map((member, i) => {
					const memberElement = discordUser.cloneNode(true);
					memberElement.style.setProperty("--i", i);
					const [avatarElement, nameElement, statusElement] =
						memberElement.childNodes;

					avatarElement.src = member["avatar_url"] + "?size=32";
					const imagePromise = new Promise(r =>
						avatarElement.addEventListener("load", r)
					);
					nameElement.innerText = member["username"];

					if ("game" in member) {
						statusElement.innerText = `Playing ${member["game"]["name"]}`;
					} else {
						memberElement.toggleAttribute("stub");
						statusElement.remove();
					}

					fragment.appendChild(memberElement);
					return imagePromise;
				});

				discordSection.appendChild(fragment);

				Promise.all(
					"fonts" in document
						? [
								document.fonts.load("700 12px Lato"),
								document.fonts.load("700 16px Lato"),
								document.fonts.load("16px Lato"),
								...imageLoadPromises
						  ]
						: imageLoadPromises
				).then(asideQuidem(() => aside.toggleAttribute("loaded")));
			})
			.catch(e => {
				console.error(e);
				discord.style.display = "none";
				aside.toggleAttribute("loaded");
			});

		// Discord profile info
		cachedFetch("https://edge.rom.dog/dsc.bio/rom", hour)
			.then(r => r.json())
			.then(json => {
				console.log(json);

				const user = json["payload"]["discord"];
				avatar.src = `https://cdn.discordapp.com/avatars/705148136904982570/${user["avatar"]}.webp?size=256`;
				avatar.addEventListener(
					"load",
					avatarQuidem(() => avatar.toggleAttribute("loaded"))
				);

				discriminator.innerText = `#${user["discriminator"]}`;
			})
			.then(addressQuidem(() => address.toggleAttribute("loaded")));
	});
})();
