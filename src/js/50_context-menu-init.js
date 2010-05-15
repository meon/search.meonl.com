$(document).ready(function() {
	$('#swLang').contextMenu({menuClass: 'contextMenu'});
	$('.contextMenu').find('a').click(function () {
		url = columns.getMeonlLink($(this).attr('href'));
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
