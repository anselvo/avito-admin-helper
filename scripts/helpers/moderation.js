var beforeID = 0;

function startModerator() {
	console.log('moderator script start');

	$(document).ready(function() {
		// Статистика модератора
		personalStatistics();

		// Настройки AH для модерации
        settings();

		// Особый интерфейс и поздравления с праздниками
		holidays();

        // добавление автоматическего текста в поле "Другие причины"
        autoOtherReasons();
		
		// отображение сколько обращений в очереди для тимлидов
        // отключено из-за изменения прежки
		//infoForModTeamLeads();
		
		if (localStorage.allButtons) {
			localStorage.removeItem('allButtons');
			console.log('allButtons key removed');
		}
		
		var currentUrl = location.href;

		if (!localStorage.checkboxInfo) localStorage.checkboxInfo = '';

		// PRE
		if (currentUrl.indexOf("https://adm.avito.ru/items/moder")+1 && currentUrl.indexOf("https://adm.avito.ru/items/moder_new") === -1) {
			premoderationsStart();
		}

		// New Pre
        if (currentUrl.indexOf("https://adm.avito.ru/items/moder_new")+1) {
            premoderationsStartNew();
        }
		
		// POST
		if (currentUrl.indexOf('https://adm.avito.ru/items/search') + 1 || currentUrl.indexOf('https://adm.avito.ru/adm/items/search') + 1) {
            // добавить кнопку показа инфы
            addInfoToItems();
            // показ информации об итеме
            showItemsInfoForItems();
            // показ описания
            showDescriptionForItems();

			// Block users on post
			postBlockUsers();
			// сравниние фото на объявлениях
            comparePhotoPost();

            // User and Abuses for post
            userInfoForPost();

            // ссылки на спам
            eyeLinks($('.item_title'));

            searchByImageLinks();

            // POST USER
			if (currentUrl.indexOf('user_id') + 1) {
                var queryStr = parseQueryURL(window.location.search);

				smartSNP(queryStr['user_id']);
			}

			// Обработка клика рядом с checkbox
            chooseItem();

			// линки для антифрода
            antifraudLinks('post');
		}

		// Item info
        var shortItemLinkReg = /https\:\/\/adm\.avito\.ru\/\d+(?!\/)\b/i;
		if (~currentUrl.indexOf('https://adm.avito.ru/items/item/info/')
			|| shortItemLinkReg.test(currentUrl)
            || ~currentUrl.indexOf('https://adm.avito.ru/adm/items/item/info/')) {

			// Кликабельные ссылки
			linksOnComments('td.is-break', currentUrl);
			
			// сопоставления логинов с категорией
			adminTableCategory();

			// Info user
            userInfoOnItem();

            // Call center
            callCenter();

            // Одобрить
            allowItem();

            // Сравнение объяв
            addCompareItemsItemInfo();
		}

        // User info
        var shortUserLinkReg = /https\:\/\/adm\.avito\.ru\/\d+u(?!\/)\b/i;
		if (~currentUrl.indexOf('https://adm.avito.ru/users/user/info/')
			|| shortUserLinkReg.test(currentUrl)
            || ~currentUrl.indexOf('https://adm.avito.ru/adm/users/user/info/')) {

			linksOnComments('td.is-break', currentUrl);
			// проверка учетных записей
			userChekDoubles();
			// сопоставления логинов с категорией
			adminTableCategory();
			// отображения IP стран
            showCountryIP();
            // линк на мессенджер
            messengerLinkOnUser();
		}
		
		// comparison
		if (currentUrl.indexOf('https://adm.avito.ru/items/comparison/')+1 && currentUrl.indexOf('archive') === -1) {
			comparisonInfoOld();
		}

        // comparison archive
        if (currentUrl.indexOf('https://adm.avito.ru/items/comparison/')+1 && currentUrl.indexOf('archive')+1) {
            addComparisonInfo();
        }

		// phoneSearch (неактульно из-за появления блокировки через плюсы)
		if (~currentUrl.indexOf("?phone=") || ~currentUrl.indexOf("?ip=")) {
            usersInfoForItems();
		}

		// P2P USER
        if (currentUrl.indexOf('https://adm.avito.ru/messenger/user/') + 1) {
            smartSNP(currentUrl.split('/')[5]);
        }

        // user search
        if (currentUrl.indexOf('https://adm.avito.ru/adm/users/search') + 1 || currentUrl.indexOf('https://adm.avito.ru/users/search') + 1) {
            // добавить кнопку показа инфы
            addInfoToItems();

            usersSearchBlockUser();
        }

        // /detectives/queue/search
        if (~currentUrl.indexOf('https://adm.avito.ru/detectives/queue/search')) {
			addHoldItems();
		}
	});
}