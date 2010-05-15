var meonl = new Object;

meonl.inArray = function(array, value) {
	for (index in array) {
		if (array[index] == value) {
			return index;
		}
	}
	return null;
}

meonl.encodeHtml = function (text) {
	return text
		.replace(/&/g, '&amp;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
	;
}
