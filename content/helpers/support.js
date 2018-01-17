// var existGlobal;
// var settingsGlobal = {}; // настройки (теги, проблемы в HD)
// var attendantTLGlobalInfo = {}; // дежурный тимлид
// var allUsersGlobalInfo = []; // инфомрация о всех юзерах

// // индикатор премиум юзеров
// var allowedPremiumUsersSubd = [
//     'SP', // "Поддержка профессиональных пользователей/инструментов";
//     'TL', // "Руководители"
//     'SD', // "Script Developer"
//     'ME', // Руководитель отдела
//     'IN', // Интерн
// ];
//
// // индиктор расширение
// let allowedExtensionIndSubd = [
//     'SP', // Поддержка профессиональных пользователей
//     'TL', // Руководитель группы службы поддержки
//     'SD', // Developer
//     'ME', // Руководитель отдела
// ];

function startSupport() {
    console.log('support script start');

    // // отлавливает изменения на странице
    // chrome.runtime.onMessage.addListener(function (request, sender, callback) {
    //     //console.log(request.onUpdated);
    //     if (request.onUpdated === 'ticketUser')
    //         setTimeout(addShElementsUser, 200);
    //
    //     if (request.onUpdated === 'ticketInfo') {
    //         setTimeout(addShElementsInfo, 100);
    //     }
    //
    //     if (request.onUpdated === 'ticketQueue')
    //         setTimeout(addShElementsQueue, 100);
    //
    //     if (request.onUpdated === 'ticketEnter') {
    //         setTimeout(skipersMonitoring, 100);
    //     }
    //
    //     if (request.onUpdated === 'ticketOnHold') {
    //         onHoldListener();
    //     }
    //     if (request.onUpdated === 'ticketComment') {
    //         commentListener();
    //     }
    //
    //     if (request.onUpdated === 'ticketComments') {
    //         setTimeout(ticketCommentsListener, 200);
    //     }
    // });

    // var adm_username = $('.dropdown:contains(Выход) a').text().split(' ');
    // localStorage.agentLogin = adm_username[1];
    //
    // // Особый интерфейс и поздравления с праздниками
    // holidays();

    // $('.dropdown-menu:contains(Выход) li').before(''+
    // '<li>'+
    //     '<a href="http://avitoadm.ru/journal/tasklog_show.html" target = "_blank">'+
    //     'Task Log</a>'+
    // '</li>'+
    // '<li class="divider" role="separator">'+
    // '</li>');

    // getHelpdeskProblems(); // записываем в глобальную JSON строку проблем HD

    // // закрытие попапа по клику на слой
    // $('body').append('<div id="layer-blackout-popup"></div>');
    // $('#layer-blackout-popup').click(function (e) {
    //     if (!$('div.ah-default-popup').is(e.target)
    //             && $('div.ah-default-popup').has(e.target).length === 0) {
    //         $('#layer-blackout-popup').removeClass('ah-layer-flex');
    //         $('div.ah-default-popup').hide();
    //         closeModal();
    //     }
    // });

    // // загрузка
    // $('body').append(''+
    // '<div id="sh-loading-layer">'+
    //     '<div class="sh-cssload-container">'+
    //         '<div class="sh-cssload-whirlpool"></div>'+
    //     '</div>'+
    // '</div>');
    //
    // $('body').append('<div id="layer-blackout-modal"></div>');

    // var currentUrl = window.location.href;
    // if (~currentUrl.indexOf('https://adm.avito.ru/helpdesk')) {
    //     injectScript(chrome.runtime.getURL('/inject/helpdesk.js'), document.body);
    //
    //     document.addEventListener('receiveHelpdeskStore', e => {
    //         settingsGlobal.helpdeskStore = e.detail;
    //     });
    //
    //     const app = document.getElementById('app');
    //     const observer = new MutationObserver(function (mutations) {
    //         mutations.forEach(mutation => {
    //             mutation.addedNodes.forEach(node => {
    //                 if (node.nodeType === 1
    //                     && node.classList.contains('helpdesk-tab-pane')
    //                     && [].find.call(node.querySelectorAll('h4'),
    //                             item => ~item.className.indexOf('details-left-panel-title'))) {
    //
    //                     addShElementsInfo();
    //                 }
    //             });
    //         });
    //     });
    //
    //     const config = {childList: true, subtree: true};
    //     observer.observe(app, config);
    //
    //     // иконка во вкладке
    //     let iconLink = $('head').find('[rel="shortcut icon"]');
    //     $(iconLink).attr('href', 'https://43.img.avito.st/640x480/2839321043.jpg');
    //
    //     findAgentID(); // ID агента
    //
    //     getTagsInfo(); // получаем инф-ию о тегах
    //
    //     getAllUsers(); // инфа обо всех пользователях
    //
    //     renderCreateNewTicketWindow('/helpdesk/details'); // отрисовка окна создания тикета
    //
    //     getNegativeUsers(); // инфа о негативных юзерах
    // }

    // User info
    var shortUserLinkReg = /https\:\/\/adm\.avito\.ru\/\d+u(?!\/)\b/i;
    if (~currentUrl.indexOf('https://adm.avito.ru/users/user/info/')
            || shortUserLinkReg.test(currentUrl)
            || ~currentUrl.indexOf('https://adm.avito.ru/adm/users/user/info/')) {
        // // попап с затемнением
        // $('body').append('<div id="sh-popup-layer-blackout-btn"></div>');
        // // сопоставления логинов с категорией
        // adminTableCategory();
        // // Кликабельные ссылки
        // linksOnComments('td.is-break', currentUrl);
        // // проверка учетных записей
        // userChekDoubles();
        // // изменение е-майла для взломов
        // userChangeEmail();

        // // индикаторы
        // let userIndicators = ['inn', 'pro', 'auto', 'shop', 'subscription', 'persManager'];
        // if (+userGlobalInfo.subdivision_id === 13 // 2nd line
        //     || +userGlobalInfo.subdivision_id === 30 // script developers
        //     ) {
        //     userIndicators.splice(2, 0, 'legalEntity');
        // }
        // if (~allowedPremiumUsersSubd.indexOf(userGlobalInfo.subdivision)) {
        //     userIndicators.push('REPremium');
        // }
        // if (~allowedExtensionIndSubd.indexOf(userGlobalInfo.subdivision)) {
        //     userIndicators.push('extension');
        // }
        // addIndicatorsUserInfo(userIndicators);

        // alternatePhoneSearch();

        // copyDataToClipboard(['url', 'e-mail', 'phones']);

        // addUnverifyPhonesButtons(); // отвязка номеров с комментами

        // // линк на Phones verification +++
        // var n = $('button[data-verify-text="Верифицировать"]').length;
        //
        // for (var i = 0; i < n; i++) {
        //     var phone_number = $('button[data-verify-text="Верифицировать"]').slice(i, i + 1).attr("data-phone");
        //
        //     $('button[data-verify-text="Верифицировать"]').slice(i, i + 1).after('\t<a href="https://adm.avito.ru/users/phones_verification?phone=' + phone_number + '" target="_blank" style="margin: 0 4px;">Log</a>');
        // }
        // // линк на Phones verification ---

        // // линк на Мессенджер
        // messengerLinkOnUser();

        // renderCreateNewTicketWindow('/users/user/info'); // отрисовка окна создания тикета
        //
        // addCreateTicketBtn('/users/user/info');

        // // переход в HD
        // linkToHDOnUser();

        // showCountryIP();

        // addIPSystemAccessLink(); // ссылки на system/access рядом с IP

        // addWlLinkOnUserInfo(); // переход в ВЛ со страницы юзера (все статусы, последние пол года)

        // feesAvailableModal(); // добавить функционал для модалок "История использования лимитов"
    }

    // Item info
    var shortItemLinkReg = /https\:\/\/adm\.avito\.ru\/\d+(?!\/)\b/i;
    if (~currentUrl.indexOf('https://adm.avito.ru/items/item/info/')
        || shortItemLinkReg.test(currentUrl)
        || ~currentUrl.indexOf('https://adm.avito.ru/adm/items/item/info/')) {
        // if (!localStorage.allowList) localStorage.allowList = '';

        // // Кликабельные ссылки
        // linksOnComments('td.is-break', currentUrl);

        // // сопоставления логинов с категорией
        // adminTableCategory();

        // // убирает кнопку блока юзеров из объявления
        // hideBlockUserButton();

        // // добавление элеммента в список для активации
        // if (userGlobalInfo.subdivision === 'S1' || userGlobalInfo.subdivision === 'SA' || userGlobalInfo.subdivision === 'SD' || userGlobalInfo.subdivision === 'TL' || userGlobalInfo.subdivision === 'SO' || userGlobalInfo.subdivision === 'IN')
        //     allowlist(currentUrl, userGlobalInfo.username);
        // if (userGlobalInfo.subdivision === 'S2' || userGlobalInfo.subdivision === 'SD' || userGlobalInfo.subdivision === 'TL' || userGlobalInfo.subdivision === 'SO')
        //     allowListMSG(currentUrl, userGlobalInfo.username);

        // // Одобрить объявление
        // if (userGlobalInfo.subdivision !== 'S2')
        //     allowItem();

        // copyItemOnItemInfo(); // копирование айди и неймов айтемов

        // addRefundInfo(); // инфо о Refund

        // timeInCity();

        // addCompareItemsItemInfo();

        // addAccountLinkItemInfo();
    }

    // Items search
    if (currentUrl.indexOf('https://adm.avito.ru/items/search') + 1
            || currentUrl.indexOf('https://adm.avito.ru/adm/items/search') + 1) {
        // // добавить кнопку показа инфы
        // addInfoToItems();
        // // показ информации об итеме
        // showItemsInfoForItems();
        // // показ описания
        // showDescriptionForItems();

        // // User and Abuses for post
        // userInfoForPost();

        // // убирает кнопку блока юзеров
        // hideBlockUserButton();

        // // Обработка клика рядом с checkbox
        // chooseItem();

        // searchByImageLinks();

        // copyItemsOnItemsSearch(); // копирование айди и неймов айтемов
    }

    // Account info
    if (currentUrl.indexOf('https://adm.avito.ru/adm/users/account/info/') + 1
            || currentUrl.indexOf('https://adm.avito.ru/users/account/info/') + 1) {
        // // добавление кнопок подсчета в Account info
        // countMoneyAccount();

        // // статус объявления и причина блокировки
        // statusItem();

        // addCompensationBtns();
        // // добавление кликабельных ссылок в Account info
        // var userID = currentUrl.split('/');
        // linksOnComments('td.is-break', userID[6]);

        // // дополнения к операциям резервирования
        // reservedOperation('/users/account/info');

        // // переход в ВЛ со страницы счета (все статусы, последние пол года)
        // addWlLinkAccountInfo(getWlLinkForUser,
        //     {linkTitle: 'Перейти в Wallet Log с фильтрами: текущий пользователь, все статусы, последние полгода'}
        // );
    }

    // walletlog
    if (currentUrl.indexOf('https://adm.avito.ru/adm/billing/walletlog') + 1
            || currentUrl.indexOf('https://adm.avito.ru/billing/walletlog') + 1) {
        // // дополнения к операциям резервирования
        // reservedOperation('/billing/walletlog');

        // addShowItemStatusBtn();

        // countMoneyWalletlog();
    }

    // users/search
    if (currentUrl.indexOf('https://adm.avito.ru/users/search') + 1
            || currentUrl.indexOf('https://adm.avito.ru/adm/users/search') + 1) {
        // // где верифицирован номер
        // findWherePhoneVerified();
        // // копирование телефона в буфер в формате, как на странице юзера
        // copyPhoneToClipboard();
    }

    // /system/access
    var anotherAccessLinksReg = /(\/add)|(\/edit)|(\/\d+$)/i;
    if (!anotherAccessLinksReg.test(currentUrl) &&
            (~currentUrl.indexOf('https://adm.avito.ru/system/access') ||
                    ~currentUrl.indexOf('https://adm.avito.ru/adm/system/access'))
            ) {

        // sanctionIPSystemAccess(); // одобрение IP в аксессе
    }

    // /items/comparison
    if (~currentUrl.indexOf('https://adm.avito.ru/items/comparison/')) {
        // copyItemIdsComparisonPage();

        // linksOnComments('.row-user-block:last table td', currentUrl);
    }

    // // главная
    // var mainPageReg = /adm\.avito\.ru\/$/i;
    // if (mainPageReg.test(currentUrl)) {
    //     var formBlock = $('form[action="/users/search"]');
    //
    //     $(formBlock).after(''+
    //     '<div class="form-group '+
    //         'search-user-by-social-wrapper" style="" id="search-user-by-social-form">'+
    //         '<input type="text" class="form-control" name="socialId" placeholder="ID '+
    //         'социальной сети">'+
    //         '<button class="btn btn-primary social-search-btn" type="button"'+
    //         'style="margin-top: 15px;" id="search-by-social-btn">'+
    //         '<i aria-hidden="true" class="glyphicon  glyphicon-search"></i>'+
    //         'Найти</button>'+
    //     '</div>');
    //
    //     var searchBtn = $('#search-by-social-btn');
    //     $(searchBtn).unbind('click').click(function () {
    //         searchBySocialBtnHandler($(this));
    //     });
    // }
}

// function addShElementsInfo() {
//     // инпут для смены ассигни - всегда удаляем при обновлении тикета
//     $('#sh-extra-assigneeId').remove();
//
//     // добавление тегов
//     addTags();
//     // быстрые кнопки
//     addQuickButtons();
//
//     // фиксированный контейнер (настройки, кнопка наверх)
//     addFixedTools($('div.col-xs-3:eq(1)'), ['hd-settings', 'scroll-top']);
//
//     //---------- создание гиперссылок ----------//
//     // айпи в техинфе
//     createHyperLinksIpInTechInfo();
//     //++++++++++ создание гиперссылок ++++++++++//
//
//     // альтернативный поиск в переписке
//     setAlternateSearchInTicketCorresp();
//
//     // смена ассигни
//     changeAssignee();
//
//     // очистка цитат
//     blockquoteClear();
//
//     // показывать скрывать цитаты
//     blockquoteHide();
//
//     // инфа об агента
//     showAgentInfoTicket();
//
//     // кнопка создания тикета
//     addCreateTicketBtn('/helpdesk/details');
//
//     addTicketControlTools(); // операции с тикетом (дежурный тим, классификация)
//
//     // элементы в тайтле тикета
//     addElementsTicketTitle();
//
//
//     var desciption = $('.helpdesk-details-panel .helpdesk-html-view.helpdesk-ticket-paragraph:not(.hidden), .helpdesk-details-panel .helpdesk-html-view:not(.hidden):last');
//     var className = 'sh-matched-ip-description';
//     parseIPInDetailsPanel(desciption, className); // парсинг IP в описании тикета
//
//     sanctionIPTechInfo(); // одобрение IP в техинфо
//
//     addSearchUserBySocialBlock(); // поиск юзера по айди в соцсети
//
//     copyCurrentTicketLink(); // копирование ссылки на тикет
//
//     copyRequesterName(); // копировать имя реквестера
//
//     copyTicketId(); // копирование айди тикета
//
//     addItemIdPopoverOnLeftPanel(); // поповер для айди айтема на левой панели
//
//     addIpPopoverOnLeftPanel(); // поповер для айпи на левой панели
//
//     addPhoneNumberPopoverOnLeftPanel(); // поповер для номера телефона на левой панели
//
//     addNegativeUsersAbusesNotification(); // нотификация о жалобах от крайне негативных юзеров
// }

// function addShElementsUser() {
//     // console.log('addShElementsUser func');
//     // Рядом с Blocked - причина блокировки в HD
//     showReasonBlockedUser();
//
//     // меняем уже присутствующие ссылки
//     changeAllHDLinks();
//
//     // Гиперссылки в правом сайдбаре на комментах к УЗ
//     var userId = $('a[href *= "/users/search?user_id="]').text();
//     linksOnComments('.helpdesk-additional-info-comment-text', userId);
//
//     // простановка коммента на УЗ из HD
//     addCommentOnUserFromTicket();
//
//     // разблокировка юзера из HD + коммент
//     unblockUserHD();
//
//     // предполагаемая УЗ
//     infoAboutUser();
//
//     addMessengerLinkInTicket(); // линк на мессенджер
//
//     addCopyUserMailInTicket(); // копирование мыла юзера в буфер
//
//     copyUserNameOnTicket(); // копирование имени юзера
// }

// function addShElementsQueue() {
//     var timer = setInterval(() => {
//         var loadingVisible = $('.helpdesk-loading')
//                 .hasClass('helpdesk-loading_visible');
//         if (!loadingVisible) {
//             // открывать тикеты в новой вкладке
//             openTicketInNewTab();
//
//             showAgentInfoQueue();
//
//             clearInterval(timer);
//         }
//     }, 50);
// }

// онхолд
// function onHoldListener() {
//     // дежурный тимлид ---
//     var btn = $('#sh-attendant-tl-btn');
//     if ($(btn).hasClass('sh-active-btn')) {
//         $('#sh-loading-layer').show();
//
//         setTimeout(function () {
//             checkAdmUserIdAttendantTL();
//         }, 100);
//     }
//     // дежурный тимлид +++
// }
//
// // коммент
// function commentListener() {
//     // дежурный тимлид ---
//     var btn = $('#sh-attendant-tl-btn');
//
//     // проверка на статус тикета - только для онхолдов
//     var statusText = getTicketStatusText();
//     if (statusText === 'на удержании') {
//         if ($(btn).hasClass('sh-active-btn')) {
//             $('#sh-loading-layer').show();
//
//             setTimeout(function () {
//                 checkAdmUserIdAttendantTL();
//             }, 100);
//         }
//     }
//     // дежурный тимлид +++
// }
//
// function ticketCommentsListener() {
//     // парсинг айди айтемов в комменте
//     parseItemIdsInTicket();
//
//     var comments = $('.helpdesk-details-panel .helpdesk-html-view:not(.hidden, :last)');
//     var className = 'sh-matched-ip-comment';
//     parseIPInDetailsPanel(comments, className); // парсинг IP в комментах тикета
// }