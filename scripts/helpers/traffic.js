function startTraffic() {
	console.log('traffic script start');

	if (~currentUrl.indexOf('/shops/info/view/')) {
		shopsInfoElements();
	}

	var shortUserLinkReg = /https\:\/\/adm\.avito\.ru\/\d+u(?!\/)\b/i;
	if (~currentUrl.indexOf('/users/user/info/')
		|| shortUserLinkReg.test(currentUrl)
		|| ~currentUrl.indexOf('https://adm.avito.ru/adm/users/user/info/')) {
		usersInfoElements();
	}
}

