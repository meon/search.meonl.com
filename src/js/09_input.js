
var input = new Object;

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
			input.plainKeyword(keywordsArray[i])
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

input.composeKeyword = function (stress, keyword) {
	if (keyword.match(/ /)) {
		keyword = '"'+keyword+'"';
	}
	return stress+keyword;
}

// translate array of keywords with stress one by one
// can not be done in parallel as google.language.translate callback var is probably stored in global variable :-(
input.translateArray = function (toTranslate, translated, lang, clang, callback) {
	if (toTranslate.length == 0) {
		callback(translated.join(' '));
	}
	else {
		var stress  = toTranslate[0][0];
		var keyword = toTranslate[0][1];
		toTranslate.shift();
		
		google.language.translate(keyword, lang, clang, function(result) {
			if (!result.error) {
				translated.push(input.composeKeyword(stress, result.translation));
				input.translateArray(toTranslate, translated, lang, clang, callback);
			}
			else {
				alert('error translating to '+clang);
			}
		});
	}
}

input.translate = function (query, lang, clang, callback) {
	// if there is any stress, translate one by one
	if (query.match(/["\+\-\~]/)) {
		var keywords = input.keywords(query);
		input.translateArray(
			input.plainKeywords(keywords),
			[],
			lang,
			clang,
			callback
		);
	}
	else {
		google.language.translate(query, lang, clang, function(result) {
			if (!result.error) {
				callback(result.translation);
			}
			else {
				alert('error translating to '+clang);
			}
		});
	}
}

1;
