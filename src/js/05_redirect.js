$(document).ready(function() {
	var redirect = $.cookie('redirect');
	if (redirect) {
		$.cookie('redirect', null, cfg.sessionCookieSettings);
		$('body').css('display', 'none');
		
		// show the body afte 10s this can happend if the redirect was to and binary file (.pdf, etc.) and the browser window was not destroied
		setTimeout("$('body').css('display', 'block')", 10000);
		
		window.location.href = redirect;
	}
});
