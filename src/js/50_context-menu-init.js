$(document).ready(function() {
	$('#swLang').contextMenu({menuClass: 'contextMenu'});
	$('.contextMenu').find('a').click(function () {
		var newLang = $(this).attr('href');
		gPageTracker.event('columns', 'switch language', newLang);
		url = columns.getMeonlLink(newLang);
		if (window.location.href != columns.getMeonlLink()) {
			columns.setMeonlLink();
			$.cookie('redirect', url, cfg.sessionCookieSettings);
			window.location.href = $('#currentMeonlLink').attr('href');
		}
		else {
			window.location.href = url;
		}
		return false;
	});
	$('.contextMenu').find('a[href="'+lang+'"]').parent().remove();
});
