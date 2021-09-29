"use strict";


(() => {
	const bytes = ["KB", "MB", "GB"];
	const formatKB = a => {
		const b = Math.log10(a) | 0;
		const unit = bytes[b / 3 | 0];
		return ~~(a / 10 ** b * 100) / 100 + " " + unit;
	}

	const cachePromise = caches.open("cache");
	const discord = document.getElementById("discord"),
		avatar = document.getElementById("avatar"),
		discordSection = document.getElementById("discordSection"),
		githubSection = document.getElementById("githubSection"),
		header = document.getElementsByTagName("header")[0],
		nav = document.getElementsByTagName("nav")[0],
		aside = document.getElementsByTagName("aside")[0],
		discriminator = document.getElementsByTagName("discriminator")[0],
		[download, law, star] = document.querySelectorAll("storage svg");

	const quidem = t => {
		const p = new Promise(r => setTimeout(r, t));
		return f =>
			(...args) =>
				p.then(f.bind(0, args));
	};

	const loadPromise = e =>
		e.complete
			? Promise.resolve()
			: new Promise(r => { 
				console.log(e);
				e.onload = r; 

				// school, let's try to proxy the images
				let n = true;
				e.onerror = () => {
					if (n) {
						e.src = "//external-content.duckduckgo.com/iu/?u=" + e.src;
						n = false;
					}
				}
			});
	
	Promise.all([...document.querySelectorAll("nav svg")].map(loadPromise)).then(
			() => nav.toggleAttribute("loaded")
	);

	const asideQuidem = quidem(50);
	const avatarQuidem = quidem(1000);
	const headerQuidem = quidem(1200);

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

	const githubRepo = document.createElement("article");

	{
		githubRepo.appendChild(document.createElement("a"));
		githubRepo.appendChild(document.createElement("desc"));

		const footer = document.createElement("footer");
		footer.appendChild(download.cloneNode(true));
		footer.appendChild(document.createElement("size"));
		footer.appendChild(law.cloneNode(true));
		footer.appendChild(document.createElement("license"));
		footer.appendChild(star.cloneNode(true));
		footer.appendChild(document.createElement("stars"));

		githubRepo.appendChild(footer);
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
		cachedFetch("https://edge.r-om.workers.dev/discord/751469608615280670", hour * 6)
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
					const imagePromise = loadPromise(avatarElement);

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
		cachedFetch("https://edge.r-om.workers.dev/dsc.bio/rom", hour)
			.then(r => r.json())
			.then(json => {
				console.log(json);

				const user = json["payload"]["discord"];
				avatar.src = `https://cdn.discordapp.com/avatars/705148136904982570/${user["avatar"]}.webp?size=256`;
				loadPromise(avatar).then(avatarQuidem(() => avatar.toggleAttribute("loaded")));

				discriminator.innerText = `#${user["discriminator"]}`;
			})
			.then(headerQuidem(() => header.toggleAttribute("loaded")));

		// GitHub repositories
		cachedFetch("https://api.github.com/users/romdotdog/repos?sort=pushed", hour)
			.then(r => r.json())
			.then(json => {
				const fragment = document.createDocumentFragment();

				json.forEach((t, i) => {
					const repoElement = githubRepo.cloneNode(true);
					repoElement.style.setProperty("--i", i);
					const [title, description, footer] =
						repoElement.childNodes;
					
					const [, size, licenseIcon, license, starIcon, stars] = footer.childNodes;

					title.innerText = t["name"];
					title.href = t["html_url"];
					description.innerText = t["description"];
					size.innerText = formatKB(t["size"]);
					
					if (t["license"]) {
						license.innerText = t["license"]["name"];
					} else {
						licenseIcon.remove();
						license.remove();
					}

					if (t["stargazers_count"]) {
						stars.innerText = t["stargazers_count"];
					} else {
						starIcon.remove();
					}

					fragment.appendChild(repoElement);
				});

				githubSection.appendChild(fragment);
			})
	});
})();

