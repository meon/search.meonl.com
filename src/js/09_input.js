
var input = new Object;

input.keywordsArray = [];

input.keywords = function (keywords) {
	if (keywords != null) {
		input.keywordsArray = keywords;
	}
	return input.keywordsArray;
}

input.decodeQueryParam = function (param) {
	// nothing to do for empty query parameter
	if (!param) {
		return '';
	}

	param =
		decodeURIComponent(
			param.replace( /\+/g, '%20' )    // plus means space
		)
		.replace(/  +/g, ' ')                // replace multi spaces just by one
	;
	return param;
}

input.keywords = function (query) {
	var bare_keywords = 
		query
		.replace(/  +/g, ' ')                // replace multi spaces just by one
		.split(' ')
	;
	
	var keywords = [];
	var in_quotes = '';
	for (keyword_index in bare_keywords) {
		keyword = bare_keywords[keyword_index];
		if (!in_quotes && keyword.match(/^[\+\-~]?"/)) {
			in_quotes = keyword;
			continue;
		}
		if (in_quotes != '') {
			in_quotes = in_quotes+' '+keyword;
			if (keyword.match(/"$/)) {			
				keywords.push(in_quotes);
				in_quotes = '';
			}
			continue;
		}
		keywords.push(keyword);
	}
	// in case of no trailing quote
	if (in_quotes != '') {
		keywords.push(keyword);
	}
	
	return keywords;
}

input.plainKeyword = function (keyword) {
	var stress = keyword.match(/^[\+\-\~]/);
	if (stress) {
		stress = stress.shift();
	}
	else {
		stress = '';
	}
	
	return [
		stress,
		keyword
			.replace(/^[\+\-\~]/, '')
			.replace(/^"/, '')
			.replace(/"$/, '')
	];
}

input.plainKeywords = function (keywordsArray) {
	var plainKeywords = [];
	for (i in keywordsArray) {
		
		plainKeywords.push(
			input.plainKeyword(keywordsArray[i])[1]
		)
	}
	return plainKeywords;
}

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
		$('#searchInput').val(val);
	}
	
	val = $('#searchInput').val();
	val = val.replace(/\s+$/,"").replace(/^\s+/,"")
	return val;
}

input.uriParam = function () {
	return encodeURIComponent(input.val());
}

input.spaceSubmitClick = function () {
	gPageTracker.event('search', 'space', ($(this).attr('checked') ? 'yes' : 'no'));
	$.cookie('spaceSubmits', ($(this).attr('checked') ? 1 : 0), cfg.cookieSettings);
}

1;
