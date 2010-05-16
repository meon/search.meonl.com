
$(document).ready(function() {
	input.val(input.decodeQueryParam($.getURLParam("q")));
	
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
