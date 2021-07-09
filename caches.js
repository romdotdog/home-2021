const caches = {
	open: name =>
		Promise.resolve({
			add: url => Promise.resolve()
		})
};
