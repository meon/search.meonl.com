var cfg = new Object;

// store cookies for 30d
cfg.cookieSettings = {
	path: (window.location.protocol == 'file:' ? '/' : '/'+lang+'/'),
	hoursToLive: 30*24
};
cfg.sessionCookieSettings = {
	path: (window.location.protocol == 'file:' ? '/' : '/'+lang+'/'),
};
