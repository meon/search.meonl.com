var columns = new Object();

columns.showHideTime = 700;
columns.maxUrlLength = 50;
columns.doSearch     = [];
columns.sequence = 1;

// do initialization of document is loaded
$(document).ready(function() {
	var searches = $.getURLParam("s") || $.cookie('searches') || 'gb';
	var clang    = $.getURLParam("l") || $.cookie('langs') || lang+lang;
	
	for (var i = 0; i < searches.length; i++) {
		columns.setupNewSearchColumn(i, searches.charAt(i), 0, clang.charAt(i*2)+clang.charAt(i*2+1));
	}
	
	// track down columns
	gPageTracker.onLoad = function () {
		gPageTracker.event('columns', 'status', columns.searchLetters());
		gPageTracker.event('columns', 'lang-status', columns.langLetters() || lang);
	};
	
	// set proper sizes when windows resizes
	$(window).bind('resize', function () { columns.adjustSizes(0); });
	
	if ($.browser.msie && $.browser.version <= "6.0") {
		alert('This page does not work with IE6 and lower.');
	}
});

columns.onLoad = function (iFrame) {
	var anch = iFrame.siblings('div.searchLink').find('a');
	anch.text(iFrame.attr('src'));
	anch.attr('href', iFrame.attr('src'));
}

// initilize phone column
columns.setupNewSearchColumn = function (colIndex, searchLetter, animate, clang) {
	clang = clang || lang;
	if (!searchEngines[clang]) {
		clang = lang;
	}
	if (!searchEngines[clang] || !searchEngines[clang][searchLetter]) {
		alert(clang+' not found');
		return;
	}
	if ($.browser.msie && $.browser.version <= "6.0") {
		return;
	}
	var searchInput = input.val();

	if ((lang != clang) && searchInput) {
		google.language.translate(decodeURIComponent(searchInput), lang, clang, function(result) {
			if (!result.error) {
				searchInput = encodeURIComponent(result.translation);
				columns._setupNewSearchColumn(searchInput, colIndex, searchLetter, animate, clang);
			}
			else {
				alert('error translating to '+clang);
			}
		});
	}
	else {
		columns._setupNewSearchColumn(searchInput, colIndex, searchLetter, animate, clang);
	}
	
}

columns._setupNewSearchColumn = function (searchInput, colIndex, searchLetter, animate, clang) {
	var iFrameURL  = (
		searchInput
		? searchEngines[clang][searchLetter].q+searchInput
		: searchEngines[clang][searchLetter].home
	);
	var iFrameURLText = ( iFrameURL.length < columns.maxUrlLength ? iFrameURL : iFrameURL.substr(0,columns.maxUrlLength)+'...' );
	var iFrameIcon = searchEngines[clang][searchLetter].icon;
	var iFrameDiv  = '<div class="iFrame">'
		+(
			searchLetter == 'g'
			? '<div class="googleSearch"></div>'
			: searchLetter == 't'
			? '<div class="googleTokensColumn"></div>'
			: '<iframe width="1" height="1" src="'+(searchInput ? iFrameURL : '')+'"></iframe>' )
		+'</div>'
	;
	
	var iFrameHTML =
		'<div class="searchLetter">'
			+searchLetter
		+'</div>'
		+'<div class="searchLang">'
			+clang
		+'</div>'
		+'<div class="buttons">'
			+'<a class="maximize" href="#" title="'+i18n('maximize - button title')+'"><img width="19" height="19" src="../img/button-maximize.png"/></a>'
			+'<a class="change" href="#" title="'+i18n('change - button title')+'"><img width="19" height="19" src="../img/button-change.png"/></a>'
			+'<a class="add" href="#" title="'+i18n('add - button title')+'"><img width="19" height="19" src="../img/button-add.png"/></a>'
			+'<a class="close" href="#" title="'+i18n('close - button title')+'"><img width="19" height="19" src="../img/button-close.png"/></a>'
		+'</div>'
		+'<div class="searchLink">'
			+'<img class="favicon" width="16" height="16" src="'+iFrameIcon+'" />'
			+'<a href="'+iFrameURL+'" target="_blank">'
			+iFrameURLText
			+'</a>'
			+(clang != lang ? ' <img src="'+searchEngines[clang].info.flag+'" alt="'+clang+'" title="'+clang+'"/>' : '')
		+'</div>'
		+iFrameDiv
		+'</iframe>'
	;

	var iFrameElement = $(document.createElement("div"));
	iFrameElement.addClass('column');
	iFrameElement.css('style', 'display: none; width: 1px; height: 1px;');
	iFrameElement.append(iFrameHTML);
	if (colIndex == 0) {
		$('#searchIframes').prepend(iFrameElement);
	}
	else {
		$('#searchIframes').find('div.column').eq(colIndex-1).after(iFrameElement);
	}
	
	if (searchLetter == 'g') {
		var searchDiv = iFrameElement.find('.iFrame');
		var searchElement = document.createElement("div");
		searchDiv.html(searchElement);

		columns.add_google_search_control(searchElement, searchInput, colIndex, clang, columns.updateGoogleLinks);
	}
	else if (searchLetter == 't') {
		var searchDiv = iFrameElement.find('.googleTokensColumn');
		var searchElement = document.createElement("div");
		$(searchElement).addClass('tokenSource');
		searchDiv.append(searchElement);
		var tokensElement = document.createElement("div");
		$(tokensElement).addClass('googleTokens');
		searchDiv.append(tokensElement);
		
		var tokens = { el: [], score: [] };
		columns.add_google_search_control(
			searchElement,
			searchInput,
			colIndex,
			clang,
			function () {
				columns.updateTokens(iFrameElement, $(searchElement), $(tokensElement), tokens)
			}
		);
		
		// for debug
		/*
		$(searchElement).find('.gsc-control').css('height', '100px');
		$(searchElement).find('.gsc-control').css('width', '100%');
		$('.tokenSource').css('overflow', 'auto');
		$('.tokenSource').css('display', 'block');
		*/
	}
	else {
        columns.doSearch.splice(colIndex,0,null);
	}

	if (animate) {
		animate = columns.showHideTime;
	}
	columns.adjustSizes(0, animate);
	columns.initButtons();
	columns.initIFrames();

}

columns.updateTokens = function(iFrameElement, searchElement, tokensElement, tokens) {
	var current  = parseInt(searchElement.find('.gsc-cursor-current-page').text());
	var nextPage = searchElement.find('.gsc-cursor-current-page + .gsc-cursor-page:first');
	
	if (current == 1) {
		tokens.el = [];
		tokens.score = [];
		iFrameElement
			.find('img.favicon')
			.attr('src', '../img/spinner.gif')
		;
		tokensElement.html('');
	}
	
	var toSkip = [];
	var toSkipInitial =
		$('#searchInput').val()
		.replace(/\s+$/,"")
		.replace(/^\s+/,"")
		.replace(/ +/g, ' ')
		.replace(/ -/g, ' ')
		.replace(/^-/g, '')
		.replace(/ \+/g, ' ')
		.replace(/^\+/g, '')
		.replace(/"/g, '')
		.toLowerCase()
		.split(' ')
	;
	for (skipIndex in toSkipInitial) {
		skip = toSkipInitial[skipIndex];
		toSkip.push(skip);
		
		// skip also singulars/plurals
		if (lang == 'en') {
			if (skip.match(/s$/)) {
				toSkip.push(skip.replace(/s$/, ''));
			}
			else {
				toSkip.push(skip+'s');
			}
		}
	}
	
	var maxPages = 5;
	columns.addTokens(searchElement, tokens, toSkip, 'a.gs-title', 1);
	columns.addTokens(
		searchElement,
		tokens,
		toSkip,
		'.gs-snippet',
		(maxPages - parseInt(nextPage.text())/maxPages)*0.5+0.5
	);

	if ((nextPage.size() > 0) && (parseInt(nextPage.text()) < maxPages)) {
		nextPage.click();
	}
	else {
		var tokensHTML = 
			'<div class="plusMinus">'
				+'<div class="oneSearchEngineLink" title="'+i18n('must be present - button title')+'"><a href="+">+</a></div>'
				+'<div class="oneSearchEngineLink" title="'+i18n('can not be present - button title')+'"><a href="-">-</a></div>'
				+'<div class="oneSearchEngineLink" title="'+i18n('no preference - button title')+'"><a href="t">.</a></div>'
				+'<div class="oneSearchEngineLink" title="'+i18n('remove - button title')+'"><a href="x">x</a></div>'
				+'<div class="oneSearchEngineLink" title="'+i18n('quote words - button title')+'"><a href="q">"? ?"</a></div>'
				+'<div class="oneSearchEngineLink" title="'+i18n('remove quotes - button title')+'"><a href="xq">x"</a></div>'
			+'</div>'
			+'<div class="tokenKeywords">'
				+columns.tokenKeywordsHtml()
			+'</div>'
			+'<div class="googleTokensList"><ul>'
		;
		
		// get biggest hit
		var maxValue = 0.5; 
		var tokensList = [];
		for (tokenIndex in tokens.el) {
			if (tokens.score[tokenIndex] > maxValue) {
				maxValue = tokens.score[tokenIndex];
			}
			// skip sites that were found just once
			if (tokens.el[tokenIndex].match(/^site:/) && (tokens.score[tokenIndex] < 2)) {
				continue;
			}
			if (tokens.score[tokenIndex] < 0.75) {
				continue;
			}
			tokensList.push(tokens.el[tokenIndex]);
		}
		tokensList.sort();
		
		for (tokenIndex in tokensList) {
			var token = tokensList[tokenIndex];
			var sizeEm = Number((tokens.score[meonl.inArray(tokens.el, token)]/maxValue)*0.4+0.5).toFixed(2);
			
			/* was really really slow...
			tokensElement
				.add('span')
				.addClass('unVisible')
				.css('font-size', sizeEm+'em')
				.add('a')
				.attr('href', '#'+token)
				.text(token)
			;
			*/

			tokensHTML += '<li class="unVisible" style="font-size: '+sizeEm+'em"><a href="#'+encodeURIComponent(token)+'">'+meonl.encodeHtml(token)+'</a></li> ';
		}
		tokensHTML += '</ul></div>';
		
		// var tokensElement = $(tokensHTML);
		// tokensElement.find('a').click(function () { alert($(this).attr(href)); return false; })
		tokensElement.html(tokensHTML);
		tokensElement.find('ul li a').unbind('click').click(columns.tokenClick);
		tokensElement.find('.plusMinus div').unbind('click').click(columns.tokenPlusMinus);
		tokensElement.find('.tokenKeywords div').unbind('click').click(columns.tokenKeywordsClick);
		tokensElement.find('li.unVisible').removeClass('unVisible');

		iFrameElement
			.find('img.favicon')
			.attr('src', searchEngines.en['t'].icon)
		;
	}
}

columns.tokenKeywordsHtml = function () {
	var bare_keywords = $('#searchInput').val().replace(/ +/g, ' ').split(/ /);
	var keywords = [];
	var in_quotes = '';
	for (keyword_index in bare_keywords) {
		keyword = bare_keywords[keyword_index];
		if (!in_quotes && keyword.match(/^[\+\-]?"/)) {
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

	return columns.tokenKeywordsHtmlDivs(keywords);
}

columns.tokenKeywordsHtmlDivs = function (keywords) {
	var html = '';
	for (keyword_index in keywords) {
		keyword = keywords[keyword_index];
		html = html+'<div>'+keyword+'<span class="order0"/></div>';
	}
	return html;
}

columns.tokenKeywordsClick = function () {
	var has = $(this).hasClass('currentSelection');
	var text = $(this).text();
	var op = $(this).parent().parent().find('.currentSelection a').attr('href') || '';
	
	if (has) {
		$(this).find('span').attr('class', 'order0');
		$(this).removeClass('currentSelection');
	}
	else {
		$(this).find('span').attr('class', 'order'+(columns.sequence++));
		$(this).addClass('currentSelection');
		if (op) {
			columns.tokenKeywordsDo(op, $(this).parent());
		}
	}
	
	return false;
}

columns.tokenKeywordsDo = function (op, tokenKeywordsDiv) {
	var keywords = [];
	tokenKeywordsDiv.find('.currentSelection').each(function () {
		keywords.push($(this));
	});
	if (keywords.length == 0) { return; };

	if ((op == '+') || (op == '-') || (op == 't')) {
		if (op == 't') {
			op = '';
		}
		for (keyword_index in keywords) {
			var keyword = keywords[keyword_index];
			keyword.text(op+keyword.text().replace(/^[\+\-]/, ''));
		}
	}
	else if (op == 'x') {
		for (keyword_index in keywords) {
			var keyword = keywords[keyword_index];
			keyword.remove();
		}
	}
	else if (op == 'q') {
		if (keywords.length < 2) {
			return;
		}
		keywords.sort(function (a,b) {
			return a.find('span').attr('class').localeCompare(b.find('span').attr('class'));
		});
		for (keyword_index in keywords) {
			var keyword = keywords[keyword_index];
			if (keyword_index == 0) {
				keyword.text(keyword.text().replace(/^[\+\-]?"?/, '').replace(/"$/, ''));
				continue;
			}
			keywords[0].text(keywords[0].text()+' '+keyword.text().replace(/^[\+\-]?"?/, '').replace(/"$/, ''));
			keyword.remove();
		}
		keywords[0].text('"'+keywords[0].text()+'"');
		keywords[0].append('<span class="order0"/>');
	}
	else if (op == 'xq') {
		for (keyword_index in keywords) {
			var keyword = keywords[keyword_index];
			var keywordText = keyword.text().replace(/^[\+\-]?"/, '').replace(/"$/, '');
			keyword.replaceWith(
				columns.tokenKeywordsHtmlDivs(
					keywordText.split(/ /)
				)
			);
		}
	}
	else {
		alert(op);
	}
	
	var allKeywords = [];
	tokenKeywordsDiv.find('div').each(function () {
		var keyword = $(this).text();
		allKeywords.push(keyword);
	});
	$('#searchInput').val(allKeywords.join(' '));
	input.submit();
}

columns.tokenPlusMinus = function () {
	var has = $(this).hasClass('currentSelection');
	
	$(this).parent().find('.currentSelection').removeClass('currentSelection');
	if (!has) {
		$(this).addClass('currentSelection');
		
		var op = $(this).find('a').attr('href');
		columns.tokenKeywordsDo(op, $(this).parent().parent().find('.tokenKeywords'));
	}
	return false;
}

columns.tokenClick = function () {
	var tokenString = decodeURIComponent(
		$(this).attr('href').replace(/^#/, '')
	);
	var op = $(this).parent().parent().parent().parent().parent().find('.currentSelection a').attr('href') || '';
	// only + and - make sense in this context
	if (op == 'x') {
		op = '-';
	}
	if ((op != '+') && (op != '-')) {
		op = '';
	}
	$('#searchInput').val($('#searchInput').val()+' '+op+tokenString);
	input.submit();
	return false;
}

columns.addTokens = function(searchElement, tokens, toSkip, className, addValue) {
	var texts = '';
	var sitePattern = new RegExp("^https?://.+?/");
	var httpPattern = new RegExp("^https?:");
	var slashPattern = new RegExp("/", 'g');
	searchElement.find(className).each(function () {
		texts += $(this).text()+' ';
		var href = $(this).attr('href');
		var site = sitePattern.exec(href);
		if (site) {
			site += '';
			texts += 'site:'+site.replace(httpPattern, '').replace(slashPattern, '')+' ';
		}
	});
	texts = texts.replace(/,/g, ' ').replace(new RegExp(' +', 'g'), ' ');
	var newTokens = texts.split(' ');
	for (tokenIndex in newTokens) {
		var token = newTokens[tokenIndex]
			.replace(/\.$/, '')
			.replace(/\,$/, '')
			.replace(/'$/, '')
			.replace(/"$/, '')
			.replace(/“$/, '')
			.replace(/″$/, '')
			.replace(/^'/, '')
			.replace(/^"/, '')
			.replace(/^“/, '')
			.replace(/^″/, '')
			.replace(/\?$/, '')
			.replace(/\!$/, '')
			.replace(/:$/, '')
			.replace(/^\(/, '')
			.replace(/\)$/, '')
			.replace(/^\.+$/, '')
			.replace(/^-+$/, '')
			.toLowerCase()
		;
		if (token == '') {
			continue;
		}
		if (meonl.inArray(toSkip, token) != null) {
			continue;
		}
		if (token.match(/^\d\d:\d\d:\d\d$/)) {
			continue;
		}
		if (token.match(/^\d\d\d\d\d+$/)) {
			continue;
		}
		if (token.length < 4) {
			continue;
		}

		var globalTokenIndex = meonl.inArray(tokens.el, token);
		if (globalTokenIndex === null) {
			tokens.el.push(token);
			tokens.score.push(addValue);
		}
		else {
			tokens.score[globalTokenIndex] += addValue;
		}
	}
}

columns.add_google_search_control = function(searchElement, searchInput, colIndex, clang, searchCompleteCallback) {
	// http://code.google.com/apis/ajaxsearch/documentation/
	
	// Create a search control
	var searchControl = new google.search.SearchControl();

	searchControl.setResultSetSize(google.search.Search.LARGE_RESULTSET);
	searchControl.setLinkTarget(google.search.Search.LINK_TARGET_TOP);
	searchControl.setNoResultsString(google.search.SearchControl.NO_RESULTS_DEFAULT_STRING);
	searchControl.setSearchCompleteCallback(columns, searchCompleteCallback);
	
	// Add in a full set of searchers
	var options = new google.search.SearcherOptions();
	options.setExpandMode(google.search.SearchControl.EXPAND_MODE_OPEN);
	
	var webSearch = new google.search.WebSearch();
	var extendedArgs = google.search.Search.RESTRICT_EXTENDED_ARGS;
	webSearch.setRestriction(extendedArgs, {lr:'lang_'+clang});
	searchControl.addSearcher(webSearch, options);
	
	// Tell the searcher to draw itself and tell it where to attach
	var drawOptions = new google.search.DrawOptions();
	// drawOptions.setSearchFormRoot(document.createElement("div"));
	drawOptions.setDrawMode(google.search.SearchControl.DRAW_MODE_LINEAR);

	searchControl.draw(searchElement, drawOptions);

	// Execute an inital search
	searchControl.execute(decodeURIComponent(searchInput));
	
	columns.doSearch.splice(colIndex,0,searchControl);
}

// workaround to make the navigation back work properly
columns.updateGoogleLinks = function() {
	var googleLinks = $('.gsc-result').find('a.gs-title');
	googleLinks.unbind('click');
	googleLinks.bind('click', function () {
		if (window.location.href != $('#currentMeonlLink').attr('href')) {
			$.cookie('redirect', $(this).attr('href'), cfg.sessionCookieSettings);
			window.location.href = $('#currentMeonlLink').attr('href');
		}
		else {
			window.location.href = $(this).attr('href');
		}
		return false;
	});
}

columns.initIFrames = function () {
	var iFrame = $('iframe');
	iFrame.unbind('load');
	iFrame.bind('load', function(){$('#searchInput').focus();});
}

columns.initButtons = function () {
	// reset
	$('.buttons a.maximize').unbind('click');
	$('.buttons a.change').unbind('click');
	$('.buttons a.add').unbind('click');
	$('.buttons a.close').unbind('click');

	// init
	$('.buttons a.maximize').bind('click', columns.maximizeClick);
	$('.buttons a.change').bind('click', columns.changeClick);
	$('.buttons a.add').bind('click', columns.addClick);
	$('.buttons a.close').bind('click', columns.closeClick);

	// show maximize button only when there is more than one column	
	if ($('.column').size() > 1) {
		$('.buttons a.maximize').css('visibility', 'visible');
	}
	else {
		$('.buttons a.maximize').css('visibility', 'hidden');
	}
}

columns.maximizeClick = function (e) {
	var column = $(this).parent().parent('.column');
	var index = column.prevAll().size();
	
	var toClose = [];
	$('.column').each(function(i) {
		if (i != index) {
			toClose.push($(this));
		}
	});
	for (i in toClose) {
		toClose[i].find('.buttons a.close').click();
	}
	
	return false;
}

columns.changeClick = function (e) {
	var column = $(this).parent().parent('.column');
	var clang  = column.find('.searchLang').text();
	var letter = column.find('.searchLetter').text();
	
	gPageTracker.event('columns', 'change');

	columns._searchEngineList(
		function (divHTML) { column.replaceWith(divHTML) },
		clang,
		letter
	);

	return false;
}

columns.addClick = function (e) {
	var column = $(this).parent().parent('.column');
	
	gPageTracker.event('columns', 'add');

	columns.doSearch.splice(column.prevAll().size()+1,0,null);
	
	columns._searchEngineList(function (divHTML) {
		column.after(divHTML)
	});
	
	return false;
}

columns._searchEngineList = function (callback, clang, letter) {
	clang = clang || lang;
	var searchesHTML = searches.genHTML(searches.fullList, 1, letter)
	var langsHTML    = searches.genLangsHTML(clang)
	var divHTML =
		'<div class="column" style="display: none; width: 1px; height: 1px;">'
			+'<div class="searchLetter">'+letter+'</div>'
			+'<div class="searchLang">'+clang+'</div>'
			+'<div class="buttons"><a class="close" href="#"><img class="close" title="'+i18n('close - button title')+'" width="19" height="19" src="../img/button-close.png"/></a></div>'
			+'<div class="searchLink">'+i18n('Choose a search engine')+'</div>'
			+'<div class="searchEnginesList">'+searchesHTML+'</div>'
			+'<hr/>'
			+'<div class="searchLink">'+i18n('Choose a language')+'</div>'
			+'<div class="searchLangsList">'+langsHTML+'</div>'
		+'</div>'
	;

	callback(divHTML);
	columns.adjustSizes(0, columns.showHideTime);
	columns.initButtons();
	$('.column .searchEnginesList a').unbind('click');
	$('.column .searchEnginesList a').bind('click', searches.clickColumn);
	$('.column .searchLangsList a').unbind('click');
	$('.column .searchLangsList a').bind('click', searches.clickLang);
}

columns.closeClick = function (e) {
	var column = $(this).parent().parent('.column');
	
	// remove column update function (if any)
	columns.doSearch.splice(column.prevAll().size(),1);
	
	gPageTracker.event('columns', 'close', column.find('.searchLetter').text()+'_'+column.find('.searchLang').text());
	
	column.fadeTo(columns.showHideTime/2, 0.01, function () {
		/*
		column.children().remove();
		column.animate({ width: 0}, columns.showHideTime, function () {
			column.remove();
		});
		*/

		column.remove();
		columns.adjustSizes(0, columns.showHideTime);
		columns.initButtons();
	});
	
	gPageTracker.event('columns', 'status', columns.searchLetters());
	gPageTracker.event('columns', 'lang-status', columns.langLetters() || lang);
	
	return false;
}

columns.adjustSizes = function (countAdjust, showHideTime) {
	showHideTime = 0;
	var columnDivs = $('#searchIframes').find('div.column');
	var columnCount = columnDivs.size() + countAdjust;
	var ws = windowSize();
	var heightFull = ws.height - 0 - 22;
	var height = heightFull - 0 - 20;
	var widthFull = ws.width - 0; // 20px reserve for vertical scroll bar
	var width  = parseInt(widthFull / columnCount);
	if (width < 600) {
		width = 600;
		widthFull = width * columnCount + 20;
		height = height - 20; // horizontal scroll bar
	}
	if (width > 1000) {
		width = 1000;
		widthFull = 1000;
	}
	
	$('#searchIframes').css('width', widthFull);
	// $('#searchIframes').css('height', heightFull);
	$('#searchIframes').css('margin', '0 auto 0px auto');
	
	columnDivs.each(function (){
		var div    = $(this);
		var iFrame = $(this).find('iframe');
		if (iFrame.size()) {
			iFrame.attr('height', height - 14 - 20);
			if (showHideTime) {
				iFrame.animate({ width: width - 20}, showHideTime, function () {});
				div.animate({ width: width - 14}, showHideTime, function () {});
			}
			else {
				iFrame.attr('width', width - 6);
				div.css('width', width - 0);
			}
			div.css('height', height);
		}
		else {
			// forget about .gsc-control if it's googleTokens
			if ($(this).find('.googleTokens').size() > 0) {
				iFrame = $(this).find('.googleTokens');
			}
			else {
				iFrame =  $(this).find('.gsc-control');
			}
			iFrame.css('height', height - 14 - 20)
			if (showHideTime) {
				iFrame.animate({ width: width - 20}, showHideTime, function () {});
				div.animate({ width: width - 14}, showHideTime, function () {});
			}
			else {
				iFrame.css('width', width - 6);
				div.css('width', width - 0);
			}
		}
		div.css('height', height);
		div.css('display', 'block');
		
		// hide google input box if the language is the same
		if (div.find('.searchLang').text() == lang) {
			div.find('.gsc-search-box').css('display', 'none');
		}
		else {
			div.find('.gsc-search-box').css('display', 'inline');
		}		
	});
	
	columns.saveStatus();
	columns.setMeonlLink();
	
	// if there is just one column hide borders
	if (columnCount == 1) {
		// hide google input box if the language is the same
		$('.gsc-control').css('border-color', 'white');
	}
	else {
		$('.gsc-control').css('border-color', '');
	}
}

columns.setMeonlLink = function () {
	$('#currentMeonlLink').attr('href', columns.getMeonlLink);
}

columns.getMeonlLink = function (forceLang) {
	var locationHref = window.location.href.toString();
	if (forceLang) {
		locationHref = locationHref.replace('/'+lang+'/', '/'+forceLang+'/');
	}
	var searchQuery  = window.location.search.toString();
	var currentLink = locationHref.substr(0, locationHref.length - searchQuery.length);
	var letters     = columns.searchLetters();
	var langs       = columns.langLetters();
	var val         = input.val();
	
	if (letters && val) {
		currentLink = currentLink+'?s='+letters+'&q='+val;
	}
	else if (letters) {
		currentLink = currentLink+'?s='+letters;
	}
	else if (val) {
		currentLink = currentLink+'?q='+val;
	}
	
	if ((letters || val) && langs) {
		currentLink = currentLink+'&l='+langs;
	}
	
	return currentLink;
}

// store collapse/expand status in a cookie
columns.saveStatus = function () {
	$.cookie('searches', columns.searchLetters(), cfg.cookieSettings);
	$.cookie('langs', columns.langLetters(), cfg.cookieSettings);
}

columns.searchLetters = function () {
	var searches = '';
	$('#searchIframes div .searchLetter').each(function(){
		searches = searches+$(this).text();
	});
	return searches;
}
columns.langLetters = function () {
	var langs = '';
	var defaultLangs = '';
	$('#searchIframes div .searchLang').each(function(){
		langs = langs+$(this).text();
	});
	$('#searchIframes div .searchLang').each(function(){
		defaultLangs = defaultLangs+lang;
	});
	if (langs == defaultLangs) {
		return;
	}
	
	return langs;
}

columns.update = function (searchInput) {
	var columnDivs = $('#searchIframes').find('div.column');
	
	columnDivs.each(function (index){
		var iFrame = $(this).find('iframe');
		var searchAnchor = $(this).find('.searchLink a');
		var letter = $(this).find('.searchLetter').text();
		var clang = $(this).find('.searchLang').text();
		
		var search = searchEngines[clang][letter];

		if ((lang != clang) && searchInput) {
			google.language.translate(decodeURIComponent(searchInput), lang, clang, function(result) {
				if (!result.error) {
					searchInput = encodeURIComponent(result.translation);
					columns._update(search, searchInput, searchAnchor, iFrame, index);
				}
				else {
					alert('error translating to '+clang);
				}
			});
		}
		else {
			columns._update(search, searchInput, searchAnchor, iFrame, index);
		}
	});
	
	columns.initIFrames();
}

columns._update = function (search, searchInput, searchAnchor, iFrame, index) {
	var searchLink = search.q+searchInput;
	var searchLinkText = ( searchLink.length < columns.maxUrlLength ? searchLink : searchLink.substr(0,columns.maxUrlLength)+'...' );
	
	if (iFrame.size() == 0) {
		var searchControl = columns.doSearch[index];
		searchControl.execute(decodeURIComponent(searchInput));
	}
	else {
		iFrame.attr('src', searchLink);
	}

	searchAnchor.attr('href', searchLink);
	searchAnchor.text(searchLinkText);
}

function windowSize() {
  var myWidth = 0, myHeight = 0;
  if( typeof( window.innerWidth ) == 'number' ) {
    //Non-IE
    myWidth = window.innerWidth;
    myHeight = window.innerHeight;
  } else if( document.documentElement && ( document.documentElement.clientWidth || document.documentElement.clientHeight ) ) {
    //IE 6+ in 'standards compliant mode'
    myWidth = document.documentElement.clientWidth;
    myHeight = document.documentElement.clientHeight;
  } else if( document.body && ( document.body.clientWidth || document.body.clientHeight ) ) {
    //IE 4 compatible
    myWidth = document.body.clientWidth;
    myHeight = document.body.clientHeight;
  }
  return { width: myWidth, height: myHeight };
}
