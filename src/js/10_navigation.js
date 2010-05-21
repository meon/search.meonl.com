
var navi = new Object();

navi.stack = [];
navi.pointer = 0;
navi.navigating = 0;

$(document).ready(function() {
	$('#navBack').click(navi.clickBack);
	$('#navForward').click(navi.clickForward);
	
	var inputVal = input.val();
	if (inputVal != '') {
		navi.stack.push(inputVal);
		navi.pointer++;
	}
});

navi.newInput = function (input) {
	// change search input stack only if not navigating
	if (!navi.navigating) {
		navi.stack.splice(navi.pointer, navi.stack.length - navi.pointer, input);
		navi.pointer++;
	}
	navi.updateImages();
}

navi.updateImages = function () {
	// in case current keywords are the last ones
	if (navi.stack.length == navi.pointer) {
		$('#navForward').find('img').attr('src', '../img/nav-forward-grey.png');
	}
	else {
		$('#navForward').find('img').attr('src', '../img/nav-forward.png');
	}
	
	// in case navigation pointer is above 1 there are some searches in the history
	if (navi.pointer > 1) {
		$('#navBack').find('img').attr('src', '../img/nav-back.png');
	}
	else {
		$('#navBack').find('img').attr('src', '../img/nav-back-grey.png');
	}
}

navi.clickBack = function () {
	// no backwards history
	if (navi.pointer < 2) {
		return false;
	}

	gPageTracker.event('search', 'navigate', 'back');

	navi.pointer--;

	navi.navigating = 1;
	input.val(navi.stack[navi.pointer-1]);
	input.submit();
	navi.navigating = 0;

	return false;
}
navi.clickForward = function () {
	// no forward history
	if (navi.stack.length == navi.pointer) {
		return false;
	}

	gPageTracker.event('search', 'navigate', 'forward');

	navi.pointer++;

	navi.navigating = 1;
	input.val(navi.stack[navi.pointer-1]);
	input.submit();
	navi.navigating = 0;

	return false;
}

