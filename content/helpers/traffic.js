function startTraffic() {
	console.log('traffic script start');

    if (~currentUrl.indexOf('/shops/info/view/')) {
        shopsInfoElements();
    }

    const shortUserLinkReg = /https\:\/\/adm\.avito\.ru\/\d+u(?!\/)\b/i;
    if (~currentUrl.indexOf('/users/user/info/')
        || shortUserLinkReg.test(currentUrl)
        || ~currentUrl.indexOf('https://adm.avito.ru/adm/users/user/info/')) {
        usersInfoElements();
    }

    if (~currentUrl.indexOf('/shops/moderation/')) {
        const shopModeration = new ShopModeration();
        if (shopModeration.mainBlock.querySelector('[data-section]')) {
            shopModeration.addMailForm();
            shopModeration.addCoordinationControls();
            shopModeration.addBrief();
            // shopModeration.addPageNavigation();
        }
    }
}

