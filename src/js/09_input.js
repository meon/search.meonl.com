
var input = new Object;

$(document).ready(function() {
	input.val($.getURLParam("q"))
	
	$('#searchInputBox form').bind("submit", input.submit);
	$('#searchInput').focus();
	$('#searchInput').keyup(function(event){ 
		if ($('#spaceSubmit').attr('checked') && (event.keyCode == 32)) { 
			input.submit();
		} 
	});
	if ($.cookie('spaceSubmits') == 1) {
		$('#spaceSubmit').attr('checked', true);
	}
	$('#spaceSubmit').bind('click', input.spaceSubmitClick);
	input.spaceSubmitClick(); // save/refresh current status in cookie
});

input.submit = function () {
	var val = input.val();
	gPageTracker.event('search', 'submit', 1);
	columns.update(val);
	columns.setMeonlLink();
	navi.newInput(input.val());
	$('#searchInput').focus();
	return false;
}

input.val = function (val) {
	if (val != null) {
		val = val.replace( /\+/g, '%20' );
		val = decodeURIComponent(val);
		$('#searchInput').val(val);
	}
	
	val = $('#searchInput').val();
	val = val.replace(/\s+$/,"").replace(/^\s+/,"")
	return encodeURIComponent(val);
}

input.spaceSubmitClick = function () {
	gPageTracker.event('search', 'space', ($(this).attr('checked') ? 'yes' : 'no'));
	$.cookie('spaceSubmits', ($(this).attr('checked') ? 1 : 0), cfg.cookieSettings);
}
