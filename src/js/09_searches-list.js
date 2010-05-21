var searches = new Object();

searches.headerList = 'gybwacA';
searches.fullList   = 'gybwacArsCmGdvhBMulUWSRNfqkDLFztieoO';

$(document).ready(function(){
	var headerListDiv = $('#searchEngines');
	headerListDiv.append(searches.genHTML(searches.headerList));
	headerListDiv.find('a').bind('click', searches.clickHeader);
});

searches.genHTML = function (list, extended, currentLetter) {
	var html = '';
	
	// sort list by name
	var searchList = [];
	for (var i = 0; i < list.length; i++) {
		searchList[i] = list.charAt(i);
	}
	searchList.sort(
		function (a,b) {
			if (searchEngines[lang][a].name < searchEngines[lang][b].name) { return -1 }
			else if (searchEngines[lang][a].name > searchEngines[lang][b].name) { return 1 }
			else { return 0 }
		}
	);
	
	for (var i in searchList) {
		var letter = searchList[i];
		var search = searchEngines[lang][letter];
		
		if (extended) {
			html = html+'<div class="oneSearchEngineLink'+(letter == currentLetter ? ' currentSelection' : '')+'">';
			html = html+'<a href="'+letter+'"><img src="'+search.icon+'" width="16px" height="16px"/></a> ';
			html = html+'<a href="'+letter+'">'+search.name+'</a>';
			html = html+'<br/>';
			html = html+'</div>';
		}
		else {
			html = html+'<a href="'+letter+'" title="'+search.name+'"><img src="'+search.icon+'" width="16px" height="16px"/></a>';
		}
	}
	return html;
}

searches.genLangsHTML = function (clang) {
	var html = '';
	var list = searchEnginesLangs;
	
	// sort list by name
	var langList = [];
	for (var i = 0; i*2 < list.length; i++) {
		langList[i] = list.charAt(i*2)+list.charAt(i*2+1);
	}
	langList.sort(
		function (a,b) {
			if (searchEngines.langs[a] < searchEngines.langs[b]) { return -1 }
			else if (searchEngines.langs[a] > searchEngines.langs[b]) { return 1 }
			else { return 0 }
		}
	);
	
	for (var i in langList) {
		var letter = langList[i];
		var langIcon = searchEngines[letter].info.flag;
		var langName = searchEngines.langs[letter];
		
		html = html+'<div class="oneSearchEngineLink'+(letter == clang ? ' currentSelection' : '')+'">';
		html = html+'<a href="'+letter+'"><img src="'+langIcon+'" width="22px" height="12px"/></a> ';
		html = html+'<a href="'+letter+'">'+langName+'</a>';
		html = html+'<br/>';
		html = html+'</div>';
	}
	return html;
}

searches.clickHeader = function () {
	var letter = $(this).attr('href');
	columns.setupNewSearchColumn($('#searchIframes').find('div.column').size(), letter, 1);

	gPageTracker.event('columns', 'addFromHeader', letter);
	gPageTracker.event('columns', 'status', columns.searchLetters());
	return false;
}

searches.clickColumn = function () {
	var letter = $(this).attr('href');
	var column = $(this).parent().parent().parent('.column');
	var clang  = column.find('.searchLang').text();
	var columnIndex = column.prevAll().size();
	
	column.remove();
	columns.doSearch.splice(columnIndex,1);
	columns.setupNewSearchColumn(columnIndex, letter, 1, clang);

	gPageTracker.event('columns', 'addFromColumn', letter);
	gPageTracker.event('columns', 'status', columns.searchLetters());
	return false;
}

searches.clickLang = function () {
	var clang  = $(this).attr('href');
	var column = $(this).parent().parent().parent('.column');
	column.find('.searchLang').text(clang);
	column.find('.searchLangsList').find('.currentSelection').removeClass('currentSelection');
	$(this).parent().addClass('currentSelection');
	return false;
}
