// проверка наличия authority
function isAuthority(authority) {
    return !!userGlobalInfo.authorities[authority];
}

// обработка ролей
function handleRoles() {
    generalFunctions();
    const roleHandler = new RoleHandler();

    // обработка запросов
    chrome.runtime.onMessage.addListener(function (request) {
        if (request.onUpdated === 'ticketInfo')
            setTimeout(helpdeskTicketInfoEvent, 100);

        if (request.onUpdated === 'ticketUser')
            setTimeout(helpdeskUserInfoEvent, 200);

        if (request.onUpdated === 'ticketQueue')
            setTimeout(helpdeskQueueInfoEvent, 100);

        if (request.onUpdated === 'ticketEnter')
            setTimeout(skipersMonitoring, 100);

        if (request.onUpdated === 'ticketOnHold')
            helpdeskTicketHoldEvent();

        if (request.onUpdated === 'ticketComment')
            helpdeskTicketCommentEvent();

        if (request.onUpdated === 'ticketComments')
            setTimeout(helpdeskTicketCommentsInfoEvent, 200);
    });

    function helpdeskTicketInfoEvent() {
        // инпут для смены ассигни - всегда удаляем при обновлении тикета
        $('#sh-extra-assigneeId').remove();

        // добавление тегов
        if (isAuthority('ROLE_HELPDESK-DETAILS-TAGS')) {
            roleHandler.helpdeskAddTags();
        }
        // быстрые кнопки
        if (isAuthority('ROLE_HELPDESK-DETAILS-QUICK-BUTTONS')) {
            roleHandler.helpdeskQuickButtons();
        }

        // фиксированный контейнер (настройки, кнопка наверх)
        if (isAuthority('ROLE_HELPDESK-DETAILS-FIXED-TOOLS')) {
            roleHandler.helpdeskDetailsFixedTools();
        }

        // айпи в техинфе
        if (isAuthority('ROLE_HELPDESK-DETAILS-TECH-INFO-IP-LINK')) {
            roleHandler.helpdeskDetailsTechInfoIpLink();
        }

        // альтернативный поиск в переписке
        if (isAuthority('ROLE_HELPDESK-DETAILS-ALTERNATE-SEARCH')) {
            roleHandler.helpdeskDetailsAlternateSearch();
        }

        // смена ассигни
        if (isAuthority('ROLE_HELPDESK-DETAILS-CHANGE-ASSIGNEE')) {
            roleHandler.helpdeskDetailsChangeAssignee();
        }

        // очистка цитат
        if (isAuthority('ROLE_HELPDESK-DETAILS-BLOCKQUOTE-CLEAR')) {
            roleHandler.helpdeskDetailsBlockquoteClear();
        }

        // показывать скрывать цитаты
        if (isAuthority('ROLE_HELPDESK-DETAILS-BLOCKQUOTE-TOGGLE')) {
            roleHandler.helpdeskDetailsBlockquoteToggle();
        }

        // инфа об агента
        if (isAuthority('ROLE_HELPDESK-DETAILS-EMPLOYEE-LABEL')) {
            roleHandler.helpdeskDetailsEmployeeLabel();
        }

        // кнопка создания тикета
        if (isAuthority('ROLE_HELPDESK-DETAILS-CREATE-TICKET')) {
            roleHandler.helpdeskCreateTicketBtn();
        }

        // операции с тикетом (дежурный тим, классификация)
        if (isAuthority('ROLE_HELPDESK-DETAILS-CONTROL-TOOLS')) {
            roleHandler.helpdeskTicketControlTools();
        }

        // элементы в тайтле тикета
        if (isAuthority('ROLE_HELPDESK-DETAILS-TICKET-TITLE-TOOLS')) {
            roleHandler.helpdeskTicketTitleTools();
        }

        // парсинг IP в описании тикета
        if (isAuthority('ROLE_HELPDESK-DETAILS-IP-DESCRIPTION')) {
            roleHandler.helpdeskDetailsIpDescription();
        }

        // одобрение IP в техинфо
        if (isAuthority('ROLE_HELPDESK-DETAILS-TECH-INFO-SANCTION-IP')) {
            roleHandler.helpdeskDetailsTechInfoSanctionIp();
        }

        // поиск юзера по айди в соцсети
        if (isAuthority('ROLE_HELPDESK-DETAILS-SEARCH-BY-SOCIAL')) {
            roleHandler.helpdeskDetailsSearchBySocial();
        }

        // копирование ссылки на тикет
        if (isAuthority('ROLE_HELPDESK-DETAILS-COPY-TICKET-LINK')) {
            roleHandler.helpdeskDetailsCopyTicketLink();
        }

        // копировать имя реквестера
        if (isAuthority('ROLE_HELPDESK-DETAILS-COPY-REQUESTER-NAME')) {
            roleHandler.helpdeskDetailsCopyRequesterName();
        }

        // копирование айди тикета
        if (isAuthority('ROLE_HELPDESK-DETAILS-COPY-TICKET-ID')) {
            roleHandler.helpdeskDetailsCopyTicketId();
        }

        // поповер для айди айтема на левой панели
        if (isAuthority('ROLE_HELPDESK-DETAILS-LEFT-PANEL-ITEM-POPOVER')) {
            roleHandler.helpdeskLeftPanelItemPopover();
        }

        // поповер для айпи на левой панели
        if (isAuthority('ROLE_HELPDESK-DETAILS-LEFT-PANEL-IP-POPOVER')) {
            roleHandler.helpdeskLeftPanelIpPopover();
        }

        // поповер для номера телефона на левой панели
        if (isAuthority('ROLE_HELPDESK-DETAILS-LEFT-PANEL-PHONE-POPOVER')) {
            roleHandler.helpdeskLeftPanelPhonePopover();
        }

        // нотификация о жалобах от крайне негативных юзеров
        if (isAuthority('ROLE_HELPDESK-DETAILS-NEGATIVE-USERS-NOTIFICATION')) {
            roleHandler.helpdeskAddtNegativeUsersNotification();
        }
    }

    function helpdeskUserInfoEvent() {
        // Рядом с Blocked - причина блокировки в HD
        if (isAuthority('ROLE_HELPDESK-DETAILS-BLOCKED-USER-REASON')) {
            roleHandler.helpdeskDetailsBlockedUserReason();
        }

        // Гиперссылки в правом сайдбаре на комментах к УЗ
        if (isAuthority('ROLE_HELPDESK-DETAILS-LINKS-ON-COMMENTS')) {
            roleHandler.helpdeskDetailsLinksOnComments();
        }

        // простановка коммента на УЗ из HD
        if (isAuthority('ROLE_HELPDESK-DETAILS-COMMENT-ON-USER')) {
            roleHandler.helpdeskDetailsCommentUser();
        }

        // разблокировка юзера из HD + коммент
        if (isAuthority('ROLE_HELPDESK-DETAILS-UNBLOCK-USER')) {
            roleHandler.helpdeskDetailsUnblockUser();
        }

        // предполагаемая УЗ
        if (isAuthority('ROLE_HELPDESK-DETAILS-USER-INFO')) {
            roleHandler.helpdeskDetailsUserInfo();
        }

        // линк на мессенджер
        if (isAuthority('ROLE_HELPDESK-DETAILS-MESSENGER-LINK')) {
            roleHandler.helpdeskDetailsMessengerLink();
        }

        // копирование мыла юзера в буфер
        if (isAuthority('ROLE_HELPDESK-DETAILS-COPY-USER-MAIL')) {
            roleHandler.helpdeskDetailsCopyUserMail();
        }

        // копирование имени юзера
        if (isAuthority('ROLE_HELPDESK-DETAILS-COPY-USER-NAME')) {
            roleHandler.helpdeskDetailsCopyUserName();
        }
    }

    function helpdeskQueueInfoEvent() {
        const timer = setInterval(() => {
            const loadingVisible = $('.helpdesk-loading')
                .hasClass('helpdesk-loading_visible');
            if (!loadingVisible) {
                // открывать тикеты в новой вкладке
                if (isAuthority('ROLE_HELPDESK-QUEUE-OPEN-TICKET')) {
                    roleHandler.helpdeskQueueOpenTicket();
                }

                // метки о сотрудниках
                if (isAuthority('ROLE_HELPDESK-QUEUE-EMPLOYEE-LABELS')) {
                    roleHandler.helpdeskQueueEmployeeLabels();
                }

                clearInterval(timer);
            }
        }, 50);
    }

    function helpdeskTicketHoldEvent() {
        // Помощь ТЛ ---
        if (isAuthority('ROLE_HELPDESK-TL-HELP')) {
            roleHandler.helpdeskTlHelpHold();
        }
        // Помощь ТЛ +++
    }

    function helpdeskTicketCommentEvent() {
        // Помощь ТЛ ---
        if (isAuthority('ROLE_HELPDESK-TL-HELP')) {
            roleHandler.helpdeskTlHelpComment();
        }
        // Помощь ТЛ +++
    }

    function helpdeskTicketCommentsInfoEvent() {
        // парсинг айди айтемов в комменте
        if (isAuthority('ROLE_HELPDESK-DETAILS-PARSE-ITEMS-COMMENTS')) {
            roleHandler.helpdeskParseItemsComments();
        }

        // парсинг IP в комментах тикета
        if (isAuthority('ROLE_HELPDESK-DETAILS-IP-COMMENTS')) {
            roleHandler.helpdeskDetailsIpComments();
        }
    }

    if (isAuthority('ROLE_TASKLOG-LINK')) { // ссылка на тасклог
        roleHandler.taskLogLink();
    }
    if (isAuthority('ROLE_INTERNLOG-LINK')) { // ссылка на интернлог
        roleHandler.internLogLink();
    }
    if (isAuthority('ROLE_EMPLOYEE-LABELS')) { // сопоставления логинов с категорией
        roleHandler.employeeLabels();
    }
    if (isAuthority('ROLE_LINKS-ON-COMMENTS')) { // кликабельные ссылки
        roleHandler.linksOnComments();
    }
    if (isAuthority('ROLE_USER-CHECK-DOUBLES')) { // проверка учетных записей
        roleHandler.userCheckDoubles();
    }
    if (isAuthority('ROLE_USER-CHANGE-EMAIL')) { // изменение е-майла для взломов
        roleHandler.userChangeEmail();
    }
    if (isAuthority('ROLE_USER-INDICATORS')) { // индикаторы на юзере
        roleHandler.userIndicatorsSupport();
    }
    if (isAuthority('ROLE_USER-ALTERNATE_PHONE_SEARCH')) { // альтернативный поиск по телефону
        roleHandler.alternatePhoneSearch();
    }
    if (isAuthority('ROLE_USER-COPY-DATA')) { // копирование данных
        roleHandler.userCopyData();
    }
    if (isAuthority('ROLE_USER-UNVERIFY_PHONES')) { // отвязка номеров с комментами
        roleHandler.unverifyPhones();
    }
    if (isAuthority('ROLE_USER-PHONES-VERIFICATION_LINK')) { // линк на Phones verification
        roleHandler.phonesVerificationLink();
    }
    if (isAuthority('ROLE_USER-MESSENGER-LINK')) { // линк на Мессенджер
        roleHandler.userMessengerLink();
    }
    if (isAuthority('ROLE_USER-CREATE-TICKET')) { // создание тикета на юзере
        roleHandler.userCreateTicket();
    }
    if (isAuthority('ROLE_USER-HD-LINK')) { // переход в HD на юзере
        roleHandler.userHDLink();
    }
    if (isAuthority('ROLE_USER-COUNTRY-IP')) { // просмотр страны для IP на юзере
        roleHandler.userShowCountryIP();
    }
    if (isAuthority('ROLE_USER-SYSTEM-ACCESS-LINK')) { // ссылки на system/access рядом с IP
        roleHandler.userSystemAccessLink();
    }
    if (isAuthority('ROLE_USER-WL-LINK')) { // переход в ВЛ со страницы юзера (все статусы, последние пол года)
        roleHandler.userWlLink();
    }
    if (isAuthority('ROLE_USER-FEES-AVAILABLE-MODAL')) { // добавить функционал для модалок "История использования лимитов"
        roleHandler.userFeesAvailableModal();
    }
    if (isAuthority('ROLE_USER-SCROLL-TOP')) { // прокрутка страницы вверх
        roleHandler.userScrollTop();
    }
    if (isAuthority('ROLE_HIDE-BLOCK-USER-BTN')) { // убирает кнопку блока юзеров
        roleHandler.hideBlockUserBtn();
    }
    if (isAuthority('ROLE_ALLOW-LIST')) { // добавление элеммента в список для активации
        roleHandler.allowList();
    }
    if (isAuthority('ROLE_ALLOW-LIST-MSG')) { // добавления сообщения о проверке объявления в базе данных
        roleHandler.allowListMsg();
    }
    if (isAuthority('ROLE_ALLOW-ITEM')) { // одобрить объявление
        roleHandler.allowItem();
    }
    if (isAuthority('ROLE_ITEM-COPY-ITEM')) { // копирование айди и неймов айтемов
        roleHandler.itemCopyItem();
    }
    if (isAuthority('ROLE_ITEM-REFUND-INFO')) { // инфо о Refund
        roleHandler.itemRefundInfo();
    }
    if (isAuthority('ROLE_ITEM-CITY-TIME')) { // время в городе
        roleHandler.itemCityTime();
    }
    if (isAuthority('ROLE_ITEM-COMPARE-ITEMS')) { // сравнение объявлений
        roleHandler.itemCompareItems();
    }
    if (isAuthority('ROLE_ITEM-ACCOUNT-INFO-LINK')) { // ссылка на кошелек
        roleHandler.itemAccountInfoLink();
    }
    if (isAuthority('ROLE_ITEM-USER-INFO')) { // инфо о юзере на айтеме
        roleHandler.itemUserInfo();
    }
    if (isAuthority('ROLE_ITEM-REJECT-BY-CALL')) {
        roleHandler.itemRejectByCall();
    }
    if (isAuthority('ROLE_ITEMS-SEARCH-INFO-BTN')) { // добавить кнопку показа инфы
        roleHandler.itemsSearchInfoBtn();
    }
    if (isAuthority('ROLE_ITEMS-SEARCH-ITEM-INFO')) { // показ информации об итеме
        roleHandler.itemsSearchItemInfo();
    }
    if (isAuthority('ROLE_ITEMS-SEARCH-ITEM-DESCRIPTION')) { // показ описания
        roleHandler.itemsSearchItemDescription();
    }
    if (isAuthority('ROLE_ITEMS-SEARCH-USER-INFO')) { // User and Abuses for post
        roleHandler.itemsSearchUserInfo();
    }
    if (isAuthority('ROLE_USERS-SEARCH-INFO-BTN')) {  // добавить кнопку показа инфы
        roleHandler.usersSearchInfoBtn();
    }
    if (isAuthority('ROLE_USERS-SEARCH-BLOCK-USERS')) {  // блокировка пользователей users/search
        roleHandler.usersSearchBlockUser();
    }
    if (isAuthority('ROLE_ITEMS-SEARCH-USER-INFO-AUTOLOAD')) { // запросы на юзера автоматически
        roleHandler.itemsSearchUserInfoAuto();
    }
    if (isAuthority('ROLE_ITEMS-SEARCH-CHECKBOX-CLICK')) { // Обработка клика рядом с checkbox
        roleHandler.itemsSearchCheckboxClick();
    }
    if (isAuthority('ROLE_ITEMS-SEARCH-INFORM-SEARCH')) { // поиск информ
        roleHandler.itemsSearchInformSearch();
    }
    if (isAuthority('ROLE_ITEMS-SEARCH-BLOCK-USERS')) { // Block users on post
        roleHandler.itemsSearchBlockUsers();
    }
    if (isAuthority('ROLE_ITEMS-SEARCH-COMPARE-PHOTO')) { // сравниние фото на объявлениях
        roleHandler.itemsSearchComparePhoto();
    }
    if (isAuthority('ROLE_ITEMS-SEARCH-ANTIFRAUD-LINKS')) { // линки для антифрода
        roleHandler.itemsSearchAntifraudLinks();
    }
    if (isAuthority('ROLE_SEARCH-BY-IMAGE-LINKS')) { // поиск по изображениям
        roleHandler.searchByImageLinks();
    }
    if (isAuthority('ROLE_ITEMS-SEARCH-COPY-ITEM')) { // копирование айди и неймов айтемов
        roleHandler.itemsSearchCopyItem();
    }
    if (isAuthority('ROLE_ACCOUNT-INFO-COUNT-MONEY')) { // добавление кнопок подсчета в Account info
        roleHandler.accountInfoCountMoney();
    }
    if (isAuthority('ROLE_ACCOUNT-INFO-ITEM-INFO')) { // статус объявления и причина блокировки
        roleHandler.accountInfoItemInfo();
    }
    if (isAuthority('ROLE_ACCOUNT-INFO-COMPENSATION-BTNS')) { // кнопки для компенсации ДС
        roleHandler.accountInfoCompensationBtns();
    }
    if (isAuthority('ROLE_RESERVED-OPERATIONS')) { // дополнения к операциям резервирования
        roleHandler.reservedOperations();
    }
    if (isAuthority('ROLE_ACCOUNT-INFO-USER-VIEW-OPERATIONS')) { // показ операций, которые видет пользователь
        roleHandler.accountInfoUserViewOperations();
    }
    if (isAuthority('ROLE_ACCOUNT-INFO-WL-LINK')) {  // переход в ВЛ со страницы счета (все статусы, последние пол года)
        roleHandler.accountInfoWlLink();
    }
    if (isAuthority('ROLE_ACCOUNT-INFO-WL-LINK-CLOSING-AMOUNT')) {  // ссылка на WL - сумма закрывающих
        roleHandler.accountInfoWlLinkClosingAmount();
    }
    if (isAuthority('ROLE_ACCOUNT-INFO-PACKAGE-INFO')) {  // инфа о пакетах (счет)
        roleHandler.accountInfoPackageInfo();
    }
    if (isAuthority('ROLE_BILLING-WALLETLOG-ITEM-STATUS')) {  // статусы айтемов (wl)
        roleHandler.billingWalletlogItemStatus();
    }
    if (isAuthority('ROLE_BILLING-WALLETLOG-COUNT-MONEY')) {  // добавление кнопок подсчета в wl
        roleHandler.billingWalletlogCountMoney();
    }
    if (isAuthority('ROLE_BILLING-WALLETLOG-PACKAGE-INFO')) {  // инфа о пакетах (wl)
        roleHandler.billingWalletlogPackageInfo();
    }
    if (isAuthority('ROLE_BILLING-INVOICES-USER-ID')) {  // пока id пользователей на /billing/invoices
        roleHandler.billingInvoicesUserIds();
    }
    if (isAuthority('ROLE_USERS-SEARCH-FIND-VERIFIED-PHONE')) {  // где верифицирован номер
        roleHandler.usersSearchFindVerifiedPhone();
    }
    if (isAuthority('ROLE_USERS-SEARCH-COPY-PHONE')) {  // копирование телефона в буфер в формате, как на странице юзера
        roleHandler.usersSearchCopyPhone();
    }
    if (isAuthority('ROLE_USERS-SEARCH-INFODOC-QUEUE-LINK')) {  // ссылка на очередь infodoc
        roleHandler.usersSearchInfodocQueueLink();
    }
    if (isAuthority('ROLE_SYSTEM-ACCESS-SANCTION-IP')) {  // одобрение IP в аксессе
        roleHandler.systemAccessSanctionIp();
    }
    if (isAuthority('ROLE_ITEMS-COMPARISON-COPY-ITEM')) {  // комирование айтемов в comparison
        roleHandler.itemsComparisonCopyItem();
    }
    if (isAuthority('ROLE_ITEMS-COMPARISON-COMPARISON-ELEMENTS')) {  // фичи для старого комперисона
        roleHandler.itemsComparisonComparisonElementsOld();
    }
    if (isAuthority('ROLE_ITEMS-COMPARISON-ARCHIVE-COMPARISON-ELEMENTS')) {  // фичи для архивного комперисона
        roleHandler.itemsComparisonArchiveComparisonElements();
    }
    if (isAuthority('ROLE_SEARCH-BY-SOCIAL')) {  // поиск юзера по id соц сети на главной
        roleHandler.searchBySocial();
    }
    if (isAuthority('ROLE_MAIN-INFODOC-QUEUE-LINK')) {  // ссылка на очередь инфодок на главной
        roleHandler.mainInfodocQueueLink();
    }
    if (isAuthority('ROLE_SHOP-ELEMENTS')) {  // фичи на странице шопа
        roleHandler.shopInfoElements();
    }
    if (isAuthority('ROLE_SHOP-MODERATION')) {  // фичи на странице модерации шопа
        roleHandler.shopModeration();
    }
    if (isAuthority('ROLE_INTERN-BUTTONS')) {  // кнопки интернов
        roleHandler.internButtons();
    }
    if (isAuthority('ROLE_INTERN-PREMODERATION')) {  // интерны премодерация
        roleHandler.internPremoderation();
    }
    if (isAuthority('ROLE_INTERN-PREMODERATION-COMPARISON')) {  // интерны компэрисон
        roleHandler.internPremoderationComparison();
    }
    if (isAuthority('ROLE_INTERN-PREMODERATION-COMPARISON-NEW')) {  // интерны компэрисон (новый)
        roleHandler.internPremoderationComparisonNew();
    }
    if (isAuthority('ROLE_INTERN-TEST')) {  // тест интернов
        roleHandler.internTest();
    }
    if (isAuthority('ROLE_MODERATOR-PERSONAL-STATISTIC')) {  // Статистика модератора
        roleHandler.moderatorPersonalStatistic();
    }
    if (isAuthority('ROLE_MODERATOR-SETTINGS')) {  // Настройки AH для модерации
        roleHandler.moderatorSettings();
    }
    if (isAuthority('ROLE_FILL-OTHER-REASON-FIELD')) {  // добавление автоматическего текста в поле "Другие причины"
        roleHandler.fillOtherReasonField();
    }
    if (isAuthority('ROLE_ITEMS-MODER-TIMER')) {  // таймер в прешке
        roleHandler.itemsModerTimer();
    }
    if (isAuthority('ROLE_ITEMS-MODER-EACH-ITEM-ELEMENTS')) { // элементы для каждого айтема
        roleHandler.itemsModerEachItemElements();
    }
    if (isAuthority('ROLE_ITEMS-MODER-INFO-ABUSE-BLOCK')) { // Добавляет Info и Abuse и Block user
        roleHandler.itemsModerInfoAbuseBlock();
    }
    if (isAuthority('ROLE_ITEMS-MODER-COMPARE-PHOTO')) { // Сравнение фото
        roleHandler.itemsModerComparePhoto();
    }
    if (isAuthority('ROLE_ITEMS-MODER-CLOSE')) { // Закрывание прежки
        roleHandler.itemsModerClose();
    }
    if (isAuthority('ROLE_ITEMS-MODER-COLOR-BUTTONS')) { // Красит кнопки, если флагов больше двух
        roleHandler.itemsModerColorButtons();
    }
    if (isAuthority('ROLE_SPAM-LINKS')) { // spam links
        roleHandler.spamLinks();
    }
    if (isAuthority('ROLE_ITEMS-MODER-COMPARISON-ELEMENTS')) { // Добавление инфы в комперисон
        roleHandler.itemsModerComparisonElements();
    }
    if (isAuthority('ROLE_ITEMS-MODER-AB-TEST')) { // пометка объявлений, что они тестовые
        roleHandler.itemsModerAbTest();
    }
    if (isAuthority('ROLE_ITEMS-MODER-ANTIFRAUD-LINKS')) { // добавление ссылок для антифрода
        roleHandler.itemsModerAntifraudLinks();
    }
    if (isAuthority('ROLE_ITEMS-MODER-HIDE-SEARCH-TEST')) { // убрать "Искать тестовые" объявления из ПРЕ
        roleHandler.itemsModerHideSearchTest();
    }
    if (isAuthority('ROLE_SNP')) { // Отправка письма пользователю о взломе и смена пароля
        roleHandler.snp();
    }
    if (isAuthority('ROLE_DETECTIVES-QUEUE-SEARCH-HOLD-ITEMS')) { // удержание айтемов
        roleHandler.holdItems();
    }
    if (isAuthority('ROLE_HELPDESK-DETAILS-TAGS')) { // получаем инф-ию о тегах
        roleHandler.helpdeskGetTags();
    }
    if (isAuthority('ROLE_HELPDESK-DETAILS-CREATE-TICKET')) { // отрисовка окна создания тикета
        roleHandler.helpdeskCreateTicket();
    }
    if (isAuthority('ROLE_HELPDESK-DETAILS-NEGATIVE-USERS-NOTIFICATION')) { // инфа о негативных юзерах
        roleHandler.helpdeskGetNegativeUsers();
    }

    // общие функции
    function generalFunctions() {
        // FROM SUPPORT
        // записываем в глобальную JSON строку проблем HD
        getHelpdeskProblems();

        const $body = $('body');

        // закрытие попапа по клику на слой
        $body.append('<div id="layer-blackout-popup"></div>');
        $('#layer-blackout-popup').click(function (e) {
            const $popup = $('div.ah-default-popup');
            if (!$popup.is(e.target)
                && $popup.has(e.target).length === 0) {
                $('#layer-blackout-popup').removeClass('ah-layer-flex');
                $popup.hide();
                closeModal();
            }
        });

        // загрузка
        $body.append(`
            <div id="sh-loading-layer">
                <div class="sh-cssload-container">
                    <div class="sh-cssload-whirlpool"></div>
                </div>
            </div>
        `);

        $body.append('<div id="layer-blackout-modal"></div>');

        if (admUrlPatterns.users_user_info.test(currentUrl)) {
            // попап с затемнением
            $body.append('<div id="sh-popup-layer-blackout-btn"></div>');
        }

        if (admUrlPatterns.items_item_info.test(currentUrl)) {
            if (!localStorage.allowList) localStorage.allowList = '';
        }

        if (admUrlPatterns.helpdesk.test(currentUrl)) {
            // инжекст скрипта для получения состояния приложения
            injectScript(chrome.runtime.getURL('/inject/helpdesk.js'), document.body);

            document.addEventListener('receiveHelpdeskStore', e => {
                settingsGlobal.helpdeskStore = e.detail;
            });

            // observer
            const app = document.getElementById('app');
            const observer = new MutationObserver(function (mutations) {
                mutations.forEach(mutation => {
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === 1
                            && node.classList.contains('helpdesk-tab-pane')
                            && [].find.call(node.querySelectorAll('h4'),
                                item => ~item.className.indexOf('details-left-panel-title'))) {

                            helpdeskTicketInfoEvent();
                        }
                    });
                });
            });

            const config = {childList: true, subtree: true};
            observer.observe(app, config);

            // иконка во вкладке
            let iconLink = $('head').find('[rel="shortcut icon"]');
            $(iconLink).attr('href', 'https://43.img.avito.st/640x480/2839321043.jpg');

            // ID агента
            findAgentID();

            // инфа обо всех пользователях
            getAllUsers();
        }

        // FROM MODERATOR
        if (localStorage.allButtons) {
            localStorage.removeItem('allButtons');
            console.log('allButtons key removed');
        }

        if (!localStorage.checkboxInfo) localStorage.checkboxInfo = '';
    }
}

// управление ролями
function RoleHandler(){}

RoleHandler.prototype.taskLogLink = function() {
    // линк на тасклог
    $('.dropdown-menu:contains(Выход) li:last-child').before(`
        <li>
            <a target = "_blank" href="http://avitoadm.ru/journal/tasklog_show.html">Task Log</a>
        </li>
        <li class="divider" role="separator"></li>
    `);
};

RoleHandler.prototype.internLogLink = function() {
    $('.dropdown-menu:contains(Выход) li:last-child').before(`
        <li>
            <a href="http://avitoadm.ru/intern_helper/internlog/" target = "_blank">Intern log</a>
        </li>
        <li class="divider" role="separator"></li>
    `);
};
RoleHandler.prototype.employeeLabels = function() {
    if (admUrlPatterns.users_user_info.test(currentUrl)
        || admUrlPatterns.items_item_info.test(currentUrl)) {
        adminTableCategory();
    }
};

RoleHandler.prototype.linksOnComments = function() {
    if (admUrlPatterns.users_user_info.test(currentUrl)
        || admUrlPatterns.items_item_info.test(currentUrl)) {
        linksOnComments('td.is-break', currentUrl);
    }

    if (admUrlPatterns.users_account_info.test(currentUrl)) {
        const userID = currentUrl.split('/');
        linksOnComments('td.is-break', userID[6]);
    }

    if (admUrlPatterns.items_comparison.test(currentUrl)) {
        linksOnComments('.row-user-block:last table td', currentUrl);
    }
};

RoleHandler.prototype.userCheckDoubles = function() {
    if (admUrlPatterns.users_user_info.test(currentUrl)) {
        userChekDoubles();
    }
};

RoleHandler.prototype.userChangeEmail = function() {
    if (admUrlPatterns.users_user_info.test(currentUrl)) {
        userChangeEmail();
    }
};

RoleHandler.prototype.userIndicatorsSupport = function() {
    if (admUrlPatterns.users_user_info.test(currentUrl)) {
        const userIndicators = ['inn', 'auto', 'shop', 'subscription', 'persManager'];
        if (isAuthority('ROLE_USER-INDICATORS--PRO')) {
            userIndicators.splice(1, 0, 'pro');
        }
        if (isAuthority('ROLE_USER-INDICATORS--LEGAL_ENTITY')) {
            userIndicators.splice(2, 0, 'legalEntity');
        }
        if (isAuthority('ROLE_USER-INDICATORS--ONLY-BANK-TRANSFER')) {
            userIndicators.push('onlyBankTransfer');
        }
        if (isAuthority('ROLE_USER-INDICATORS--REPREMIUM')) {
            userIndicators.push('REPremium');
        }
        if (isAuthority('ROLE_USER-INDICATORS--EXTENSION')) {
            userIndicators.push('extension');
        }
        addIndicatorsUserInfo(userIndicators);
    }
};

RoleHandler.prototype.alternatePhoneSearch = function() {
    if (admUrlPatterns.users_user_info.test(currentUrl)) {
        alternatePhoneSearch();
    }
};

RoleHandler.prototype.userCopyData = function() {
    if (admUrlPatterns.users_user_info.test(currentUrl)) {
        const arr = ['e-mail', 'phones'];
        if (isAuthority('ROLE_USER-COPY-DATA--URL')) {
            arr.push('url');
        }
        if (isAuthority('ROLE_USER-COPY-DATA--COMPANY-EMAIL')) {
            arr.push('companyE-mail');
        }
        if (isAuthority('ROLE_USER-COPY-DATA--INN')) {
            arr.push('inn');
        }
        copyDataToClipboard(arr);
    }
};

RoleHandler.prototype.unverifyPhones = function() {
    if (admUrlPatterns.users_user_info.test(currentUrl)) {
        addUnverifyPhonesButtons();
    }
};

RoleHandler.prototype.phonesVerificationLink = function() {
    if (admUrlPatterns.users_user_info.test(currentUrl)) {
        $('button[data-verify-text="Верифицировать"]').each((idx, item) => {
            const $item = $(item);
            const phone_number = $item.attr("data-phone");
            $item.after('\t<a href="https://adm.avito.ru/users/phones_verification?phone=' + phone_number + '" target="_blank" style="margin: 0 4px;">Log</a>');
        });
    }
};

RoleHandler.prototype.userMessengerLink = function() {
    if (admUrlPatterns.users_user_info.test(currentUrl)) {
        messengerLinkOnUser();
    }
};

RoleHandler.prototype.userCreateTicket = function() {
    if (admUrlPatterns.users_user_info.test(currentUrl)) {
        renderCreateNewTicketWindow('/users/user/info');
        addCreateTicketBtn('/users/user/info');
    }
};

RoleHandler.prototype.userHDLink = function() {
    if (admUrlPatterns.users_user_info.test(currentUrl)) {
        linkToHDOnUser();
    }
};

RoleHandler.prototype.userShowCountryIP = function() {
    if (admUrlPatterns.users_user_info.test(currentUrl)) {
        showCountryIP();
    }
};

RoleHandler.prototype.userSystemAccessLink = function() {
    if (admUrlPatterns.users_user_info.test(currentUrl)) {
        addIPSystemAccessLink();
    }
};

RoleHandler.prototype.userWlLink = function() {
    if (admUrlPatterns.users_user_info.test(currentUrl)) {
        addWlLinkOnUserInfo();
    }
};

RoleHandler.prototype.userFeesAvailableModal = function() {
    if (admUrlPatterns.users_user_info.test(currentUrl)) {
        feesAvailableModal();
    }
};

RoleHandler.prototype.userScrollTop = function() {
    if (admUrlPatterns.users_user_info.test(currentUrl)) {
        addFixedTools($('body'), ['scroll-top']);
    }
};

RoleHandler.prototype.hideBlockUserBtn = function() {
    if (admUrlPatterns.items_item_info.test(currentUrl)
        || admUrlPatterns.items_search.test(currentUrl)) {
        hideBlockUserButton();
    }
};

RoleHandler.prototype.allowList = function() {
    if (admUrlPatterns.items_item_info.test(currentUrl)) {
        allowlist(currentUrl, userGlobalInfo.username);
    }
};

RoleHandler.prototype.allowListMsg = function() {
    if (admUrlPatterns.items_item_info.test(currentUrl)) {
        allowListMSG(currentUrl, userGlobalInfo.username);
    }
};

RoleHandler.prototype.allowItem = function() {
    if (admUrlPatterns.items_item_info.test(currentUrl)) {
        allowItem();
    }
};

RoleHandler.prototype.itemCopyItem = function() {
    if (admUrlPatterns.items_item_info.test(currentUrl)) {
        copyItemOnItemInfo();
    }
};

RoleHandler.prototype.itemRefundInfo = function() {
    if (admUrlPatterns.items_item_info.test(currentUrl)) {
        addRefundInfo();
    }
};

RoleHandler.prototype.itemCityTime = function() {
    if (admUrlPatterns.items_item_info.test(currentUrl)) {
        timeInCity();
    }
};

RoleHandler.prototype.itemCompareItems = function() {
    if (admUrlPatterns.items_item_info.test(currentUrl)) {
        addCompareItemsItemInfo();
    }
};

RoleHandler.prototype.itemAccountInfoLink = function() {
    if (admUrlPatterns.items_item_info.test(currentUrl)) {
        addAccountLinkItemInfo();
    }
};

RoleHandler.prototype.itemUserInfo = function() {
    if (admUrlPatterns.items_item_info.test(currentUrl)) {
        userInfoOnItem();
    }
};

RoleHandler.prototype.itemRejectByCall = function() {
    if (admUrlPatterns.items_item_info.test(currentUrl)) {
        rejectByCall();
    }
};

RoleHandler.prototype.itemsSearchInfoBtn = function() {
    if (admUrlPatterns.items_search.test(currentUrl)) {
        addInfoToItems();
    }
};

RoleHandler.prototype.itemsSearchItemInfo = function() {
    if (admUrlPatterns.items_search.test(currentUrl)) {
        showItemsInfoForItems();
    }
};

RoleHandler.prototype.itemsSearchItemDescription = function() {
    if (admUrlPatterns.items_search.test(currentUrl)) {
        showDescriptionForItems();
    }
};

RoleHandler.prototype.itemsSearchUserInfo = function() {
    if (admUrlPatterns.items_search.test(currentUrl)) {
        userInfoForPost();
    }
};

RoleHandler.prototype.usersSearchBlockUser = function() {
    if (admUrlPatterns.users_search.test(currentUrl)) {
        usersSearchBlockUser();
    }
};

RoleHandler.prototype.itemsSearchUserInfoAuto = function() {
    if (~currentUrl.indexOf("?phone=")
        || ~currentUrl.indexOf("?ip=")) {
        usersInfoForItems();
    }
};

RoleHandler.prototype.itemsSearchCheckboxClick = function() {
    if (admUrlPatterns.items_search.test(currentUrl)) {
        chooseItem();
    }
};

RoleHandler.prototype.itemsSearchInformSearch = function() {
    if (admUrlPatterns.items_search.test(currentUrl)) {
        searchInform();
    }
};

RoleHandler.prototype.itemsSearchBlockUsers = function() {
    if (admUrlPatterns.items_search.test(currentUrl)) {
        postBlockUsers();
    }
};

RoleHandler.prototype.itemsSearchComparePhoto = function() {
    if (admUrlPatterns.items_search.test(currentUrl)) {
        comparePhotoPost();
    }
};

RoleHandler.prototype.itemsSearchAntifraudLinks = function() {
    if (admUrlPatterns.items_search.test(currentUrl)) {
        antifraudLinks('post');
    }
};

RoleHandler.prototype.searchByImageLinks = function() {
    if (admUrlPatterns.items_search.test(currentUrl)
        || admUrlPatterns.items_moder.test(currentUrl)) {
        searchByImageLinks();
    }
};

RoleHandler.prototype.itemsSearchCopyItem = function() {
    if (admUrlPatterns.items_search.test(currentUrl)) {
        copyItemsOnItemsSearch();
    }
};

RoleHandler.prototype.accountInfoCountMoney = function() {
    if (admUrlPatterns.users_account_info.test(currentUrl)) {
        countMoneyAccount();
    }
};

RoleHandler.prototype.accountInfoItemInfo = function() {
    if (admUrlPatterns.users_account_info.test(currentUrl)) {
        statusItem();
    }
};

RoleHandler.prototype.accountInfoCompensationBtns = function() {
    if (admUrlPatterns.users_account_info.test(currentUrl)) {
        addCompensationBtns();
    }
};

RoleHandler.prototype.reservedOperations = function() {
    if (admUrlPatterns.users_account_info.test(currentUrl)) {
        reservedOperation('/users/account/info');
    }
    if (admUrlPatterns.billing_walletlog.test(currentUrl)) {
        reservedOperation('/billing/walletlog');
    }
};

RoleHandler.prototype.accountInfoUserViewOperations = function() {
    if (admUrlPatterns.users_account_info.test(currentUrl)) {
        userViewOperations();
    }
};

RoleHandler.prototype.accountInfoWlLink = function() {
    if (admUrlPatterns.users_account_info.test(currentUrl)) {
        addWlLinkAccountInfo(getWlLinkForUser,
            {linkTitle: 'Перейти в Wallet Log с фильтрами: текущий пользователь, все статусы, последние полгода'}
        );
    }
};

RoleHandler.prototype.accountInfoWlLinkClosingAmount = function() {
    if (admUrlPatterns.users_account_info.test(currentUrl)) {
        addWlLinkAccountInfo(getWlLinkForDocuments, {
            linkName: 'Сумма закрывающих'
        });
    }
};

RoleHandler.prototype.accountInfoPackageInfo = function() {
    if (admUrlPatterns.users_account_info.test(currentUrl)) {
        addPackageInfoAccountInfo();
    }
};

RoleHandler.prototype.billingWalletlogItemStatus = function() {
    if (admUrlPatterns.billing_walletlog.test(currentUrl)) {
        addShowItemStatusBtn();
    }
};

RoleHandler.prototype.billingWalletlogCountMoney = function() {
    if (admUrlPatterns.billing_walletlog.test(currentUrl)) {
        countMoneyWalletlog();
    }
};

RoleHandler.prototype.billingWalletlogPackageInfo = function() {
    if (admUrlPatterns.billing_walletlog.test(currentUrl)) {
        addPackageInfoWalletlog();
    }
};

RoleHandler.prototype.billingInvoicesUserIds = function() {
    if (admUrlPatterns.billing_invoices.test(currentUrl)) {
        showUsersIdsBillingInvoices();
    }
};

RoleHandler.prototype.usersSearchFindVerifiedPhone = function() {
    if (admUrlPatterns.users_search.test(currentUrl)) {
        findWherePhoneVerified();
    }
};

RoleHandler.prototype.usersSearchCopyPhone = function() {
    if (admUrlPatterns.users_search.test(currentUrl)) {
        copyPhoneToClipboard();
    }
};

RoleHandler.prototype.usersSearchInfodocQueueLink = function() {
    if (admUrlPatterns.users_search.test(currentUrl)) {
        addInfoDocQueueLink($('.header__title'));
    }
};

RoleHandler.prototype.usersSearchInfoBtn = function() {
    if (admUrlPatterns.users_search.test(currentUrl)) {
        addInfoToItems();
    }
};

RoleHandler.prototype.systemAccessSanctionIp = function() {
    if (admUrlPatterns.system_access.test(currentUrl)) {
        sanctionIPSystemAccess();
    }
};

RoleHandler.prototype.itemsComparisonCopyItem = function() {
    if (admUrlPatterns.items_comparison.test(currentUrl)) {
        copyItemIdsComparisonPage();
    }
};

RoleHandler.prototype.itemsComparisonComparisonElementsOld = function() {
    if (admUrlPatterns.items_comparison.test(currentUrl)) {
        comparisonInfoOld();
    }
};

RoleHandler.prototype.itemsComparisonArchiveComparisonElements = function() {
    if (admUrlPatterns.items_comparison_archive.test(currentUrl)) {
        addComparisonInfo();
    }
};

RoleHandler.prototype.searchBySocial = function() {
    if (admUrlPatterns.main.test(currentUrl)) {
        const $formBlock = $('form[action="/users/search"]');

        $formBlock.after(''+
            '<div class="form-group '+
            'search-user-by-social-wrapper" style="" id="search-user-by-social-form">'+
            '<input type="text" class="form-control" name="socialId" placeholder="ID '+
            'социальной сети">'+
            '<button class="btn btn-primary social-search-btn" type="button"'+
            'style="margin-top: 15px;" id="search-by-social-btn">'+
            '<i aria-hidden="true" class="glyphicon  glyphicon-search"></i> '+
            'Найти</button>'+
            '</div>');

        const $searchBtn = $('#search-by-social-btn');
        $searchBtn.unbind('click').click(function () {
            searchBySocialBtnHandler($(this));
        });
    }
};

RoleHandler.prototype.mainInfodocQueueLink = function() {
    if (admUrlPatterns.main.test(currentUrl)) {
        $('section.content').prepend(`
            <div class="ah-infodoc-queue-link-holder"></div>
            <div class="ah-clearfix"></div>
        `);

        addInfoDocQueueLink($('.ah-infodoc-queue-link-holder'));
    }
};

RoleHandler.prototype.shopInfoElements = function() {
    if (admUrlPatterns.shops_info_view.test(currentUrl)) {
        shopsInfoElements();
    }
};

RoleHandler.prototype.shopModeration = function() {
    if (admUrlPatterns.shops_moderation.test(currentUrl)) {
        const shopModeration = new ShopModeration();
        if (shopModeration.mainBlock.querySelector('[data-section]')) {
            shopModeration.addMailForm();
            shopModeration.addCoordinationControls();
            shopModeration.addBrief();
            // shopModeration.addPageNavigation();
        }
    }
};

RoleHandler.prototype.internButtons = function() {
    if (admUrlPatterns.items_search.test(currentUrl)
        || admUrlPatterns.items_comparison.test(currentUrl)
        || admUrlPatterns.items_comparison_archive.test(currentUrl)) {
        addButtonsIntern();
    }
};

RoleHandler.prototype.internPremoderation = function() {
    if (admUrlPatterns.items_search.test(currentUrl)) {
        premoderationInternNew(userGlobalInfo.username, 'post');
    }
    if (admUrlPatterns.items_moder.test(currentUrl)) {
        premoderationInternNew(userGlobalInfo.username, 'pre');
    }
};

RoleHandler.prototype.internPremoderationComparison = function() {
    if (admUrlPatterns.items_comparison.test(currentUrl)
        || admUrlPatterns.items_comparison_archive.test(currentUrl)) {
        premoderationInternComparison(userGlobalInfo.username, currentUrl);
    }
};

RoleHandler.prototype.internPremoderationComparisonNew = function() {
    if (admUrlPatterns.items_moder.test(currentUrl)) {
        premoderationInternComparisonNew();
    }
};

RoleHandler.prototype.internTest = function() {
    if (~currentUrl.indexOf("http://avitoadm.ru/intern_helper/")) {
        eg();
    }
};

RoleHandler.prototype.moderatorPersonalStatistic = function() {
    if (!admUrlPatterns.helpdesk.test(currentUrl)) {
        personalStatistics();
    }
};

RoleHandler.prototype.moderatorSettings = function() {
    settings();
};

RoleHandler.prototype.fillOtherReasonField = function() {
    autoOtherReasons();
};

RoleHandler.prototype.itemsModerTimer = function() {
    if (admUrlPatterns.items_moder.test(currentUrl)) {
        preTimer();
    }
};

RoleHandler.prototype.itemsModerEachItemElements = function() {
    if (admUrlPatterns.items_moder.test(currentUrl)) {
        addElementsForEachItemNew();
    }
};

RoleHandler.prototype.itemsModerInfoAbuseBlock = function() {
    if (admUrlPatterns.items_moder.test(currentUrl)) {
        addSomeElementsNew();
    }
};

RoleHandler.prototype.itemsModerComparePhoto = function() {
    if (admUrlPatterns.items_moder.test(currentUrl)) {
        comparePhotoPreNew();
    }
};

RoleHandler.prototype.itemsModerClose = function() {
    if (admUrlPatterns.items_moder.test(currentUrl)) {
        closePre();
    }
};

RoleHandler.prototype.itemsModerColorButtons = function() {
    if (admUrlPatterns.items_moder.test(currentUrl)) {
        colorButtons();
    }
};

RoleHandler.prototype.spamLinks = function() {
    if (admUrlPatterns.items_moder.test(currentUrl)) {
        eyeLinks($('.item-info-name'));
    }
    if (admUrlPatterns.items_search.test(currentUrl)) {
        eyeLinks($('.item_title'));
    }
};

RoleHandler.prototype.itemsModerComparisonElements = function() {
    if (admUrlPatterns.items_moder.test(currentUrl)) {
        comparisonInfo();
    }
};

RoleHandler.prototype.itemsModerAbTest = function() {
    if (admUrlPatterns.items_moder.test(currentUrl)) {
        abTest();
    }
};

RoleHandler.prototype.itemsModerAntifraudLinks = function() {
    if (admUrlPatterns.items_moder.test(currentUrl)) {
        antifraudLinks('pre');
    }
};

RoleHandler.prototype.itemsModerHideSearchTest = function() {
    if (admUrlPatterns.items_moder.test(currentUrl)) {
        hideTestItemsSearch();
    }
};

RoleHandler.prototype.snp = function() {
    if (admUrlPatterns.items_search.test(currentUrl)
        && ~currentUrl.indexOf('user_id')) {

        const queryStr = parseQueryURL(window.location.search);
        smartSNP(queryStr['user_id']);
    }

    if (admUrlPatterns.messenger_user.test(currentUrl)) {
        smartSNP(currentUrl.split('/')[5]);
    }
};

RoleHandler.prototype.holdItems = function() {
    if (admUrlPatterns.detectives_queue_search.test(currentUrl)) {
        addHoldItems();
    }
};

RoleHandler.prototype.helpdeskGetTags = function() {
    if (admUrlPatterns.helpdesk.test(currentUrl)) {
        getTagsInfo();
    }
};

RoleHandler.prototype.helpdeskAddTags = function() {
    addTags();
};

RoleHandler.prototype.helpdeskCreateTicket = function() {
    if (admUrlPatterns.helpdesk.test(currentUrl)) {
        renderCreateNewTicketWindow('/helpdesk/details');
    }
};

RoleHandler.prototype.helpdeskCreateTicketBtn = function() {
    addCreateTicketBtn('/helpdesk/details');
};

RoleHandler.prototype.helpdeskGetNegativeUsers = function() {
    if (admUrlPatterns.helpdesk.test(currentUrl)) {
        getNegativeUsers();
    }
};

RoleHandler.prototype.helpdeskAddtNegativeUsersNotification = function() {
    if (admUrlPatterns.helpdesk.test(currentUrl)) {
        addNegativeUsersAbusesNotification();
    }
};

RoleHandler.prototype.helpdeskQuickButtons = function() {
    addQuickButtons();
};

RoleHandler.prototype.helpdeskDetailsFixedTools = function() {
    const arr = ['scroll-top'];
    if (isAuthority('ROLE_HELPDESK-DETAILS-FIXED-TOOLS--SETTINGS')) {
        arr.push('hd-settings');
    }
    addFixedTools($('div.col-xs-3:eq(1)'), arr);
};

RoleHandler.prototype.helpdeskDetailsTechInfoIpLink = function() {
    createHyperLinksIpInTechInfo();
};

RoleHandler.prototype.helpdeskDetailsAlternateSearch = function() {
    setAlternateSearchInTicketCorresp();
};

RoleHandler.prototype.helpdeskDetailsChangeAssignee = function() {
    changeAssignee();
};

RoleHandler.prototype.helpdeskDetailsBlockquoteClear = function() {
    blockquoteClear();
};

RoleHandler.prototype.helpdeskDetailsBlockquoteToggle = function() {
    blockquoteHide();
};

RoleHandler.prototype.helpdeskDetailsEmployeeLabel = function() {
    showAgentInfoTicket();
};

RoleHandler.prototype.helpdeskTicketControlTools = function() {
    addTicketControlTools();
};

RoleHandler.prototype.helpdeskTicketTitleTools = function() {
    addElementsTicketTitle();
};

RoleHandler.prototype.helpdeskDetailsIpDescription = function() {
    const description = $('.helpdesk-details-panel .helpdesk-html-view.helpdesk-ticket-paragraph:not(.hidden), .helpdesk-details-panel .helpdesk-html-view:not(.hidden):last');
    const className = 'sh-matched-ip-description';
    parseIPInDetailsPanel(description, className);
};

RoleHandler.prototype.helpdeskDetailsTechInfoSanctionIp = function() {
    sanctionIPTechInfo();
};

RoleHandler.prototype.helpdeskDetailsSearchBySocial = function() {
    addSearchUserBySocialBlock();
};

RoleHandler.prototype.helpdeskDetailsCopyTicketLink = function() {
    copyCurrentTicketLink();
};

RoleHandler.prototype.helpdeskDetailsCopyRequesterName = function() {
    copyRequesterName();
};

RoleHandler.prototype.helpdeskDetailsCopyTicketId = function() {
    copyTicketId();
};

RoleHandler.prototype.helpdeskLeftPanelItemPopover = function() {
    addItemIdPopoverOnLeftPanel();
};

RoleHandler.prototype.helpdeskLeftPanelIpPopover = function() {
    addIpPopoverOnLeftPanel();
};

RoleHandler.prototype.helpdeskLeftPanelPhonePopover = function() {
    addPhoneNumberPopoverOnLeftPanel();
};

RoleHandler.prototype.helpdeskDetailsBlockedUserReason = function() {
    showReasonBlockedUser();
};

RoleHandler.prototype.helpdeskDetailsLinksOnComments = function() {
    const userId = $('a[href *= "/users/search?user_id="]').text();
    linksOnComments('.helpdesk-additional-info-comment-text', userId);
};

RoleHandler.prototype.helpdeskDetailsCommentUser = function() {
    addCommentOnUserFromTicket();
};

RoleHandler.prototype.helpdeskDetailsUnblockUser = function() {
    unblockUserHD();
};

RoleHandler.prototype.helpdeskDetailsUserInfo = function() {
    infoAboutUser();
};

RoleHandler.prototype.helpdeskDetailsMessengerLink = function() {
    addMessengerLinkInTicket();
};

RoleHandler.prototype.helpdeskDetailsCopyUserMail = function() {
    addCopyUserMailInTicket();
};

RoleHandler.prototype.helpdeskDetailsCopyUserName = function() {
    copyUserNameOnTicket();
};

RoleHandler.prototype.helpdeskQueueOpenTicket = function() {
    openTicketInNewTab();
};

RoleHandler.prototype.helpdeskQueueEmployeeLabels = function() {
    showAgentInfoQueue();
};

RoleHandler.prototype.helpdeskTlHelpHold = function() {
    const $btn = $('#sh-attendant-tl-btn');
    if ($btn.hasClass('sh-active-btn')) {
        $('#sh-loading-layer').show();

        setTimeout(function () {
            checkAdmUserIdAttendantTL();
        }, 100);
    }
};

RoleHandler.prototype.helpdeskTlHelpComment = function() {
    const $btn = $('#sh-attendant-tl-btn');
    // проверка на статус тикета - только для онхолдов
    const statusText = getTicketStatusText();
    if (statusText === 'на удержании') {
        if ($btn.hasClass('sh-active-btn')) {
            $('#sh-loading-layer').show();

            setTimeout(function () {
                checkAdmUserIdAttendantTL();
            }, 100);
        }
    }
};

RoleHandler.prototype.helpdeskParseItemsComments = function() {
    parseItemIdsInTicket();
};

RoleHandler.prototype.helpdeskDetailsIpComments = function() {
    const comments = $('.helpdesk-details-panel .helpdesk-html-view:not(.hidden, :last)');
    const className = 'sh-matched-ip-comment';
    parseIPInDetailsPanel(comments, className);
};