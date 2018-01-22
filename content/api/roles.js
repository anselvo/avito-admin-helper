// проверка наличия authority
function isAuthority(authority) {
    return !!global.userInfo.authorities[authority];
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

    // TICKET INFO
    function helpdeskTicketInfoEvent() {
        // инпут для смены ассигни - всегда удаляем при обновлении тикета
        $('#sh-extra-assigneeId').remove();

        // добавление тегов
        if (isAuthority('ROLE_HELPDESK_TAGS')) {
            roleHandler.helpdeskAddTags();
        }
        // быстрые кнопки
        if (isAuthority('ROLE_HELPDESK_QUICK_BUTTONS')) {
            roleHandler.helpdeskQuickButtons();
        }

        // фиксированный контейнер (настройки, кнопка наверх)
        if (isAuthority('ROLE_HELPDESK_FIXED_TOOLS')) {
            roleHandler.helpdeskFixedTools();
        }

        // айпи в техинфе
        if (isAuthority('ROLE_HELPDESK_TECH_INFO_IP_LINK')) {
            roleHandler.helpdeskTechInfoIpLink();
        }

        // альтернативный поиск в переписке
        if (isAuthority('ROLE_HELPDESK_ALTERNATE_SEARCH')) {
            roleHandler.helpdeskAlternateSearch();
        }

        // смена ассигни
        if (isAuthority('ROLE_HELPDESK_CHANGE_ASSIGNEE')) {
            roleHandler.helpdeskChangeAssignee();
        }

        // очистка цитат
        if (isAuthority('ROLE_HELPDESK_BLOCKQUOTE_CLEAR')) {
            roleHandler.helpdeskBlockquoteClear();
        }

        // показывать скрывать цитаты
        if (isAuthority('ROLE_HELPDESK_BLOCKQUOTE_TOGGLE')) {
            roleHandler.helpdeskBlockquoteToggle();
        }

        // инфа об агента
        if (isAuthority('ROLE_HELPDESK_EMPLOYEE_LABEL')) {
            roleHandler.helpdeskEmployeeLabel();
        }

        // кнопка создания тикета
        if (isAuthority('ROLE_HELPDESK_CREATE_TICKET')) {
            roleHandler.helpdeskCreateTicketBtn();
        }

        // операции с тикетом (дежурный тим, классификация)
        if (isAuthority('ROLE_HELPDESK_CONTROL_TOOLS')) {
            roleHandler.helpdeskControlTools();
        }

        // элементы в тайтле тикета
        if (isAuthority('ROLE_HELPDESK_TICKET_TITLE_TOOLS')) {
            roleHandler.helpdeskTicketTitleTools();
        }

        // парсинг IP в описании тикета
        if (isAuthority('ROLE_HELPDESK_DESCRIPTION_IP')) {
            roleHandler.helpdeskDescriptionIp();
        }

        // одобрение IP в техинфо
        if (isAuthority('ROLE_HELPDESK_TECH_INFO_SANCTION_IP')) {
            roleHandler.helpdeskTechInfoSanctionIp();
        }

        // поиск юзера по айди в соцсети
        if (isAuthority('ROLE_HELPDESK_SEARCH_BY_SOCIAL')) {
            roleHandler.helpdeskSearchBySocial();
        }

        // копирование ссылки на тикет
        if (isAuthority('ROLE_HELPDESK_COPY_TICKET_LINK')) {
            roleHandler.helpdeskCopyTicketLink();
        }

        // копировать имя реквестера
        if (isAuthority('ROLE_HELPDESK_COPY_REQUESTER_NAME')) {
            roleHandler.helpdeskCopyRequesterName();
        }

        // копирование айди тикета
        if (isAuthority('ROLE_HELPDESK_COPY_TICKET_ID')) {
            roleHandler.helpdeskCopyTicketId();
        }

        // поповер для айди айтема на левой панели
        if (isAuthority('ROLE_HELPDESK_LEFT_PANEL_ITEM_POPOVER')) {
            roleHandler.helpdeskLeftPanelItemPopover();
        }

        // поповер для айпи на левой панели
        if (isAuthority('ROLE_HELPDESK_LEFT_PANEL_IP_POPOVER')) {
            roleHandler.helpdeskLeftPanelIpPopover();
        }

        // поповер для номера телефона на левой панели
        if (isAuthority('ROLE_HELPDESK_LEFT_PANEL_PHONE_POPOVER')) {
            roleHandler.helpdeskLeftPanelPhonePopover();
        }

        // нотификация о жалобах от крайне негативных юзеров
        if (isAuthority('ROLE_HELPDESK_NEGATIVE_USERS')) {
            roleHandler.helpdeskNegativeUsersNotification();
        }
    }

    // TICKET USER
    function helpdeskUserInfoEvent() {
        // Рядом с Blocked - причина блокировки в HD
        if (isAuthority('ROLE_HELPDESK_BLOCKED_REASON')) {
            roleHandler.helpdeskBlockedReason();
        }

        // Гиперссылки в правом сайдбаре на комментах к УЗ
        if (isAuthority('ROLE_HELPDESK_LINKS_ON_COMMENTS')) {
            roleHandler.helpdeskLinksOnComments();
        }

        // простановка коммента на УЗ из HD
        if (isAuthority('ROLE_HELPDESK_COMMENT_USER')) {
            roleHandler.helpdeskCommentUser();
        }

        // разблокировка юзера из HD + коммент
        if (isAuthority('ROLE_HELPDESK_UNBLOCK_USER')) {
            roleHandler.helpdeskUnblockUser();
        }

        // предполагаемая УЗ
        if (isAuthority('ROLE_HELPDESK_USER_INFO')) {
            roleHandler.helpdeskUserInfo();
        }

        // линк на мессенджер
        if (isAuthority('ROLE_HELPDESK_MESSENGER_LINK')) {
            roleHandler.helpdeskMessengerLink();
        }

        // копирование мыла юзера в буфер
        if (isAuthority('ROLE_HELPDESK_COPY_USER_MAIL')) {
            roleHandler.helpdeskDetailsCopyUserMail();
        }

        // копирование имени юзера
        if (isAuthority('ROLE_HELPDESK_COPY_USER_NAME')) {
            roleHandler.helpdeskCopyUserName();
        }
    }

    // QUEUE INFO
    function helpdeskQueueInfoEvent() {
        const timer = setInterval(() => {
            const loadingVisible = $('.helpdesk-loading')
                .hasClass('helpdesk-loading_visible');
            if (!loadingVisible) {
                // открывать тикеты в новой вкладке
                if (isAuthority('ROLE_HELPDESK_QUEUE_OPEN_TICKET')) {
                    roleHandler.helpdeskQueueOpenTicket();
                }

                // метки о сотрудниках
                if (isAuthority('ROLE_HELPDESK_QUEUE_EMPLOYEE_LABELS')) {
                    roleHandler.helpdeskQueueEmployeeLabels();
                }

                clearInterval(timer);
            }
        }, 50);
    }

    // TICKET HOLD
    function helpdeskTicketHoldEvent() {
        // Помощь ТЛ ---
        if (isAuthority('ROLE_HELPDESK_TL_HELP')) {
            roleHandler.helpdeskTlHelpHold();
        }
        // Помощь ТЛ +++
    }

    // TICKET COMMENT
    function helpdeskTicketCommentEvent() {
        // Помощь ТЛ ---
        if (isAuthority('ROLE_HELPDESK_TL_HELP')) {
            roleHandler.helpdeskTlHelpComment();
        }
        // Помощь ТЛ +++
    }

    // TICKET COMMENTS INFO
    function helpdeskTicketCommentsInfoEvent() {
        // парсинг айди айтемов в комменте
        if (isAuthority('ROLE_HELPDESK_COMMENTS_ITEM')) {
            roleHandler.helpdeskCommentsItems();
        }

        // парсинг IP в комментах тикета
        if (isAuthority('ROLE_HELPDESK_COMMENTS_IP')) {
            roleHandler.helpdeskCommentsIp();
        }
    }

    // ITEM
    if (isAuthority('ROLE_ITEM_COPY_ITEM')) { // копирование айди и неймов айтемов
        roleHandler.itemCopyItem();
    }
    if (isAuthority('ROLE_ITEM_REFUND_INFO')) { // инфо о Refund
        roleHandler.itemRefundInfo();
    }
    if (isAuthority('ROLE_ITEM_CITY_TIME')) { // время в городе
        roleHandler.itemCityTime();
    }
    if (isAuthority('ROLE_ITEM_COMPARE_ITEMS')) { // сравнение объявлений
        roleHandler.itemCompareItems();
    }
    if (isAuthority('ROLE_ITEM_ACCOUNT_LINK')) { // ссылка на кошелек
        roleHandler.itemAccountInfoLink();
    }
    if (isAuthority('ROLE_ITEM_USER_INFO')) { // инфо о юзере на айтеме
        roleHandler.itemUserInfo();
    }
    if (isAuthority('ROLE_ITEM_REJECT_BY_CALL')) {
        roleHandler.itemRejectByCall();
    }
    if (isAuthority('ROLE_ITEMS_SEARCH_INFO_BTN')) { // добавить кнопку показа инфы
        roleHandler.itemsSearchInfoBtn();
    }
    if (isAuthority('ROLE_ITEMS_SEARCH_ITEM_INFO')) { // показ информации об итеме
        roleHandler.itemsSearchItemInfo();
    }
    if (isAuthority('ROLE_ITEMS_SEARCH_ITEM_DESCRIPTION')) { // показ описания
        roleHandler.itemsSearchItemDescription();
    }
    if (isAuthority('ROLE_ITEMS_SEARCH_USER_INFO')) { // User and Abuses for post
        roleHandler.itemsSearchUserInfo();
    }
    if (isAuthority('ROLE_ITEMS_SEARCH_USER_INFO_AUTOLOAD')) { // запросы на юзера автоматически
        roleHandler.itemsSearchUserInfoAuto();
    }
    if (isAuthority('ROLE_ITEMS_SEARCH_CHECKBOX_CLICK')) { // Обработка клика рядом с checkbox
        roleHandler.itemsSearchCheckboxClick();
    }
    if (isAuthority('ROLE_ITEMS_SEARCH_INFORM_SEARCH')) { // поиск информ
        roleHandler.itemsSearchInformSearch();
    }
    if (isAuthority('ROLE_ITEMS_SEARCH_BLOCK_USERS')) { // Block users on post
        roleHandler.itemsSearchBlockUsers();
    }
    if (isAuthority('ROLE_ITEMS_SEARCH_COMPARE_PHOTO')) { // сравниние фото на объявлениях
        roleHandler.itemsSearchComparePhoto();
    }
    if (isAuthority('ROLE_ITEMS_SEARCH_ANTIFRAUD_LINKS')) { // линки для антифрода
        roleHandler.itemsSearchAntifraudLinks();
    }
    if (isAuthority('ROLE_ITEMS_SEARCH_COPY_ITEM')) { // копирование айди и неймов айтемов
        roleHandler.itemsSearchCopyItem();
    }
    if (isAuthority('ROLE_ITEMS_COMPARISON_COPY_ITEM')) {  // комирование айтемов в comparison
        roleHandler.itemsComparisonCopyItem();
    }
    if (isAuthority('ROLE_ITEMS_COMPARISON_COMPARISON_ELEMENTS')) {  // фичи для старого комперисона
        roleHandler.itemsComparisonComparisonElementsOld();
    }
    if (isAuthority('ROLE_ITEMS_COMPARISON_ARCHIVE_COMPARISON_ELEMENTS')) {  // фичи для архивного комперисона
        roleHandler.itemsComparisonArchiveComparisonElements();
    }
    if (isAuthority('ROLE_ITEMS_MODER_TIMER')) {  // таймер в прешке
        roleHandler.itemsModerTimer();
    }
    if (isAuthority('ROLE_ITEMS_MODER_EACH_ITEM_ELEMENTS')) { // элементы для каждого айтема
        roleHandler.itemsModerEachItemElements();
    }
    if (isAuthority('ROLE_ITEMS_MODER_INFO_ABUSE_BLOCK')) { // Добавляет Info и Abuse и Block user
        roleHandler.itemsModerInfoAbuseBlock();
    }
    if (isAuthority('ROLE_ITEMS_MODER_COMPARE_PHOTO')) { // Сравнение фото
        roleHandler.itemsModerComparePhoto();
    }
    if (isAuthority('ROLE_ITEMS_MODER_CLOSE')) { // Закрывание прежки
        roleHandler.itemsModerClose();
    }
    if (isAuthority('ROLE_ITEMS_MODER_COLOR_BUTTONS')) { // Красит кнопки, если флагов больше двух
        roleHandler.itemsModerColorButtons();
    }
    if (isAuthority('ROLE_ITEMS_MODER_COMPARISON_ELEMENTS')) { // Добавление инфы в комперисон
        roleHandler.itemsModerComparisonElements();
    }
    if (isAuthority('ROLE_ITEMS_MODER_AB_TEST')) { // пометка объявлений, что они тестовые
        roleHandler.itemsModerAbTest();
    }
    if (isAuthority('ROLE_ITEMS_MODER_ANTIFRAUD_LINKS')) { // добавление ссылок для антифрода
        roleHandler.itemsModerAntifraudLinks();
    }
    if (isAuthority('ROLE_ITEMS_MODER_HIDE_SEARCH_TEST')) { // убрать "Искать тестовые" объявления из ПРЕ
        roleHandler.itemsModerHideSearchTest();
    }

    // USER
    if (isAuthority('ROLE_USER_CHECK_DOUBLES')) { // проверка учетных записей
        roleHandler.userCheckDoubles();
    }
    if (isAuthority('ROLE_USER_CHANGE_EMAIL')) { // изменение е-майла для взломов
        roleHandler.userChangeEmail();
    }
    if (isAuthority('ROLE_USER_INDICATORS')) { // индикаторы на юзере
        roleHandler.userIndicators();
    }
    if (isAuthority('ROLE_USER_ALTERNATE_PHONE_SEARCH')) { // альтернативный поиск по телефону
        roleHandler.userAlternatePhoneSearch();
    }
    if (isAuthority('ROLE_USER_COPY_DATA')) { // копирование данных
        roleHandler.userCopyData();
    }
    if (isAuthority('ROLE_USER_UNVERIFY_PHONES')) { // отвязка номеров с комментами
        roleHandler.userUnverifyPhones();
    }
    if (isAuthority('ROLE_USER_PHONES_VERIFICATION_LINK')) { // линк на Phones verification
        roleHandler.userPhonesVerificationLink();
    }
    if (isAuthority('ROLE_USER_MESSENGER_LINK')) { // линк на Мессенджер
        roleHandler.userMessengerLink();
    }
    if (isAuthority('ROLE_USER_CREATE_TICKET')) { // создание тикета на юзере
        roleHandler.userCreateTicket();
    }
    if (isAuthority('ROLE_USER_HD_LINK')) { // переход в HD на юзере
        roleHandler.userHDLink();
    }
    if (isAuthority('ROLE_USER_COUNTRY_IP')) { // просмотр страны для IP на юзере
        roleHandler.userShowCountryIP();
    }
    if (isAuthority('ROLE_USER_SYSTEM_ACCESS_LINK')) { // ссылки на system/access рядом с IP
        roleHandler.userSystemAccessLink();
    }
    if (isAuthority('ROLE_USER_WL_LINK')) { // переход в ВЛ со страницы юзера (все статусы, последние пол года)
        roleHandler.userWlLink();
    }
    if (isAuthority('ROLE_USER_FEES_AVAILABLE_MODAL')) { // добавить функционал для модалок "История использования лимитов"
        roleHandler.userFeesAvailableModal();
    }
    if (isAuthority('ROLE_USER_SCROLL_TOP')) { // прокрутка страницы вверх
        roleHandler.userScrollTop();
    }
    if (isAuthority('ROLE_USERS_SEARCH_INFO_BTN')) {  // добавить кнопку показа инфы
        roleHandler.usersSearchInfoBtn();
    }
    if (isAuthority('ROLE_USERS_SEARCH_BLOCK_USERS')) {  // блокировка пользователей users/search
        roleHandler.usersSearchBlockUser();
    }
    if (isAuthority('ROLE_USERS_SEARCH_FIND_VERIFIED_PHONE')) {  // где верифицирован номер
        roleHandler.usersSearchFindVerifiedPhone();
    }
    if (isAuthority('ROLE_USERS_SEARCH_COPY_PHONE')) {  // копирование телефона в буфер в формате, как на странице юзера
        roleHandler.usersSearchCopyPhone();
    }
    if (isAuthority('ROLE_USERS_SEARCH_INFODOC_QUEUE_LINK')) {  // ссылка на очередь infodoc
        roleHandler.usersSearchInfodocQueueLink();
    }

    // ACCOUNT
    if (isAuthority('ROLE_ACCOUNT_COUNT_MONEY')) { // добавление кнопок подсчета в Account info
        roleHandler.accountCountMoney();
    }
    if (isAuthority('ROLE_ACCOUNT_ITEM_INFO')) { // статус объявления и причина блокировки
        roleHandler.accountItemInfo();
    }
    if (isAuthority('ROLE_ACCOUNT_COMPENSATION_BTNS')) { // кнопки для компенсации ДС
        roleHandler.accountCompensationBtns();
    }
    if (isAuthority('ROLE_ACCOUNT_USER_VIEW_OPERATIONS')) { // показ операций, которые видет пользователь
        roleHandler.accountUserViewOperations();
    }
    if (isAuthority('ROLE_ACCOUNT_WL_LINK')) {  // переход в ВЛ со страницы счета (все статусы, последние пол года)
        roleHandler.accountWlLink();
    }
    if (isAuthority('ROLE_ACCOUNT_WL_LINK_CLOSING_AMOUNT')) {  // ссылка на WL - сумма закрывающих
        roleHandler.accountWlLinkClosingAmount();
    }
    if (isAuthority('ROLE_ACCOUNT_PACKAGE_INFO')) {  // инфа о пакетах (счет)
        roleHandler.accountPackageInfo();
    }

    // BILLING
    if (isAuthority('ROLE_BILLING_WALLETLOG_ITEM_STATUS')) {  // статусы айтемов (wl)
        roleHandler.billingWalletlogItemStatus();
    }
    if (isAuthority('ROLE_BILLING_WALLETLOG_COUNT_MONEY')) {  // добавление кнопок подсчета в wl
        roleHandler.billingWalletlogCountMoney();
    }
    if (isAuthority('ROLE_BILLING_WALLETLOG_PACKAGE_INFO')) {  // инфа о пакетах (wl)
        roleHandler.billingWalletlogPackageInfo();
    }
    if (isAuthority('ROLE_BILLING_INVOICES_USER_ID')) {  // пока id пользователей на /billing/invoices
        roleHandler.billingInvoicesUserIds();
    }

    // HELPDESK
    if (isAuthority('ROLE_HELPDESK_TAGS')) { // получаем инф-ию о тегах
        roleHandler.helpdeskGetTags();
    }
    if (isAuthority('ROLE_HELPDESK_CREATE_TICKET')) { // отрисовка окна создания тикета
        roleHandler.helpdeskCreateTicket();
    }
    if (isAuthority('ROLE_HELPDESK_NEGATIVE_USERS')) { // инфа о негативных юзерах
        roleHandler.helpdeskGetNegativeUsers();
    }

    // SHOP
    if (isAuthority('ROLE_SHOP_ELEMENTS')) {  // фичи на странице шопа
        roleHandler.shopElements();
    }
    if (isAuthority('ROLE_SHOP_MODERATION')) {  // фичи на странице модерации шопа
        roleHandler.shopModeration();
    }

    // SYSTEM
    if (isAuthority('ROLE_SYSTEM_ACCESS_SANCTION_IP')) {  // одобрение IP в аксессе
        roleHandler.systemAccessSanctionIp();
    }

    // DETECTIVES
    if (isAuthority('ROLE_DETECTIVES_HOLD_ITEMS')) { // удержание айтемов
        roleHandler.detectivesHoldItems();
    }

    // OTHER
    if (isAuthority('ROLE_SEARCH_BY_SOCIAL')) {  // поиск юзера по id соц сети на главной
        roleHandler.searchBySocial();
    }
    if (isAuthority('ROLE_MAIN_INFODOC_QUEUE_LINK')) {  // ссылка на очередь инфодок на главной
        roleHandler.mainInfodocQueueLink();
    }
    if (isAuthority('ROLE_INTERN_BUTTONS')) {  // кнопки интернов
        roleHandler.internButtons();
    }
    if (isAuthority('ROLE_INTERN_PREMODERATION')) {  // интерны премодерация
        roleHandler.internPremoderation();
    }
    if (isAuthority('ROLE_INTERN_PREMODERATION_COMPARISON')) {  // интерны компэрисон
        roleHandler.internPremoderationComparison();
    }
    if (isAuthority('ROLE_INTERN_PREMODERATION_COMPARISON_NEW')) {  // интерны компэрисон (новый)
        roleHandler.internPremoderationComparisonNew();
    }
    if (isAuthority('ROLE_INTERN_TEST')) {  // тест интернов
        roleHandler.internTest();
    }
    if (isAuthority('ROLE_MODERATOR_PERSONAL_STATISTIC')) {  // Статистика модератора
        roleHandler.moderatorPersonalStatistic();
    }
    if (isAuthority('ROLE_MODERATOR_SETTINGS')) {  // Настройки AH для модерации
        roleHandler.moderatorSettings();
    }
    if (isAuthority('ROLE_FILL_OTHER_REASON_FIELD')) {  // добавление автоматическего текста в поле "Другие причины"
        roleHandler.fillOtherReasonField();
    }
    if (isAuthority('ROLE_TASKLOG_LINK')) { // ссылка на тасклог
        roleHandler.taskLogLink();
    }
    if (isAuthority('ROLE_INTERNLOG_LINK')) { // ссылка на интернлог
        roleHandler.internLogLink();
    }
    if (isAuthority('ROLE_EMPLOYEE_LABELS')) { // сопоставления логинов с категорией
        roleHandler.employeeLabels();
    }
    if (isAuthority('ROLE_LINKS_ON_COMMENTS')) { // кликабельные ссылки
        roleHandler.linksOnComments();
    }
    if (isAuthority('ROLE_HIDE_BLOCK_USER_BTN')) { // убирает кнопку блока юзеров
        roleHandler.hideBlockUserBtn();
    }
    if (isAuthority('ROLE_ALLOW_LIST')) { // добавление элеммента в список для активации
        roleHandler.allowList();
    }
    if (isAuthority('ROLE_ALLOW_LIST_MSG')) { // добавления сообщения о проверке объявления в базе данных
        roleHandler.allowListMsg();
    }
    if (isAuthority('ROLE_ALLOW_ITEM')) { // одобрить объявление
        roleHandler.allowItem();
    }
    if (isAuthority('ROLE_SEARCH_BY_IMAGE_LINKS')) { // поиск по изображениям
        roleHandler.searchByImageLinks();
    }
    if (isAuthority('ROLE_RESERVED_OPERATIONS')) { // дополнения к операциям резервирования
        roleHandler.reservedOperations();
    }
    if (isAuthority('ROLE_SPAM_LINKS')) { // spam links
        roleHandler.spamLinks();
    }
    if (isAuthority('ROLE_SNP')) { // Отправка письма пользователю о взломе и смена пароля
        roleHandler.snp();
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

        if (global.admUrlPatterns.items_item_info.test(global.currentUrl)) {
            if (!localStorage.allowList) localStorage.allowList = '';
        }

        if (global.admUrlPatterns.helpdesk.test(global.currentUrl)) {
            // инжекст скрипта для получения состояния приложения
            injectScript(chrome.runtime.getURL('/inject/helpdesk.js'), document.body);

            document.addEventListener('receiveHelpdeskStore', e => {
                global.hdSettings.helpdeskStore = e.detail;
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
        if (!localStorage.checkboxInfo) localStorage.checkboxInfo = '';
    }
}

// управление ролями
function RoleHandler(){}

RoleHandler.prototype.helpdeskAddTags = function() {
    addTags();
};

RoleHandler.prototype.helpdeskGetTags = function() {
    if (global.admUrlPatterns.helpdesk.test(global.currentUrl)) {
        getTagsInfo();
    }
};

RoleHandler.prototype.helpdeskCreateTicket = function() {
    if (global.admUrlPatterns.helpdesk.test(global.currentUrl)) {
        renderCreateNewTicketWindow('/helpdesk/details');
    }
};

RoleHandler.prototype.helpdeskCreateTicketBtn = function() {
    addCreateTicketBtn('/helpdesk/details');
};

RoleHandler.prototype.helpdeskGetNegativeUsers = function() {
    if (global.admUrlPatterns.helpdesk.test(global.currentUrl)) {
        getNegativeUsers();
    }
};

RoleHandler.prototype.helpdeskNegativeUsersNotification = function() {
    if (global.admUrlPatterns.helpdesk.test(global.currentUrl)) {
        addNegativeUsersAbusesNotification();
    }
};

RoleHandler.prototype.helpdeskQuickButtons = function() {
    addQuickButtons();
};

RoleHandler.prototype.helpdeskFixedTools = function() {
    const arr = ['scroll-top'];
    if (isAuthority('ROLE_HELPDESK_FIXED_TOOLS_SETTINGS')) {
        arr.push('hd-settings');
    }
    addFixedTools($('div.col-xs-3:eq(1)'), arr);
};

RoleHandler.prototype.helpdeskTechInfoIpLink = function() {
    createHyperLinksIpInTechInfo();
};

RoleHandler.prototype.helpdeskAlternateSearch = function() {
    setAlternateSearchInTicketCorresp();
};

RoleHandler.prototype.helpdeskChangeAssignee = function() {
    changeAssignee();
};

RoleHandler.prototype.helpdeskBlockquoteClear = function() {
    blockquoteClear();
};

RoleHandler.prototype.helpdeskBlockquoteToggle = function() {
    blockquoteHide();
};

RoleHandler.prototype.helpdeskEmployeeLabel = function() {
    showAgentInfoTicket();
};

RoleHandler.prototype.helpdeskControlTools = function() {
    addTicketControlTools();
};

RoleHandler.prototype.helpdeskTicketTitleTools = function() {
    addElementsTicketTitle();
};

RoleHandler.prototype.helpdeskDescriptionIp = function() {
    const description = $('.helpdesk-details-panel .helpdesk-html-view.helpdesk-ticket-paragraph:not(.hidden), .helpdesk-details-panel .helpdesk-html-view:not(.hidden):last');
    const className = 'sh-matched-ip-description';
    parseIPInDetailsPanel(description, className);
};

RoleHandler.prototype.helpdeskTechInfoSanctionIp = function() {
    sanctionIPTechInfo();
};

RoleHandler.prototype.helpdeskSearchBySocial = function() {
    addSearchUserBySocialBlock();
};

RoleHandler.prototype.helpdeskCopyTicketLink = function() {
    copyCurrentTicketLink();
};

RoleHandler.prototype.helpdeskCopyRequesterName = function() {
    copyRequesterName();
};

RoleHandler.prototype.helpdeskCopyTicketId = function() {
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

RoleHandler.prototype.helpdeskBlockedReason = function() {
    showReasonBlockedUser();
};

RoleHandler.prototype.helpdeskLinksOnComments = function() {
    const userId = $('a[href *= "/users/search?user_id="]').text();
    linksOnComments('.helpdesk-additional-info-comment-text', userId);
};

RoleHandler.prototype.helpdeskCommentUser = function() {
    addCommentOnUserFromTicket();
};

RoleHandler.prototype.helpdeskUnblockUser = function() {
    unblockUserHD();
};

RoleHandler.prototype.helpdeskUserInfo = function() {
    infoAboutUser();
};

RoleHandler.prototype.helpdeskMessengerLink = function() {
    addMessengerLinkInTicket();
};

RoleHandler.prototype.helpdeskDetailsCopyUserMail = function() {
    addCopyUserMailInTicket();
};

RoleHandler.prototype.helpdeskCopyUserName = function() {
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

RoleHandler.prototype.helpdeskCommentsItems = function() {
    parseItemIdsInTicket();
};

RoleHandler.prototype.helpdeskCommentsIp = function() {
    const comments = $('.helpdesk-details-panel .helpdesk-html-view:not(.hidden, :last)');
    const className = 'sh-matched-ip-comment';
    parseIPInDetailsPanel(comments, className);
};

RoleHandler.prototype.itemCopyItem = function() {
    if (global.admUrlPatterns.items_item_info.test(global.currentUrl)) {
        copyItemOnItemInfo();
    }
};

RoleHandler.prototype.itemRefundInfo = function() {
    if (global.admUrlPatterns.items_item_info.test(global.currentUrl)) {
        addRefundInfo();
    }
};

RoleHandler.prototype.itemCityTime = function() {
    if (global.admUrlPatterns.items_item_info.test(global.currentUrl)) {
        timeInCity();
    }
};

RoleHandler.prototype.itemCompareItems = function() {
    if (global.admUrlPatterns.items_item_info.test(global.currentUrl)) {
        addCompareItemsItemInfo();
    }
};

RoleHandler.prototype.itemAccountInfoLink = function() {
    if (global.admUrlPatterns.items_item_info.test(global.currentUrl)) {
        addAccountLinkItemInfo();
    }
};

RoleHandler.prototype.itemUserInfo = function() {
    if (global.admUrlPatterns.items_item_info.test(global.currentUrl)) {
        userInfoOnItem();
    }
};

RoleHandler.prototype.itemRejectByCall = function() {
    if (global.admUrlPatterns.items_item_info.test(global.currentUrl)) {
        rejectByCall();
    }
};

RoleHandler.prototype.itemsSearchInfoBtn = function() {
    if (global.admUrlPatterns.items_search.test(global.currentUrl)) {
        addInfoToItems();
    }
};

RoleHandler.prototype.itemsSearchItemInfo = function() {
    if (global.admUrlPatterns.items_search.test(global.currentUrl)) {
        showItemsInfoForItems();
    }
};

RoleHandler.prototype.itemsSearchItemDescription = function() {
    if (global.admUrlPatterns.items_search.test(global.currentUrl)) {
        showDescriptionForItems();
    }
};

RoleHandler.prototype.itemsSearchUserInfo = function() {
    if (global.admUrlPatterns.items_search.test(global.currentUrl)) {
        userInfoForPost();
    }
};

RoleHandler.prototype.itemsSearchUserInfoAuto = function() {
    if (~global.currentUrl.indexOf("?phone=")
        || ~global.currentUrl.indexOf("?ip=")) {
        usersInfoForItems();
    }
};

RoleHandler.prototype.itemsSearchCheckboxClick = function() {
    if (global.admUrlPatterns.items_search.test(global.currentUrl)) {
        chooseItem();
    }
};

RoleHandler.prototype.itemsSearchInformSearch = function() {
    if (global.admUrlPatterns.items_search.test(global.currentUrl)) {
        searchInform();
    }
};

RoleHandler.prototype.itemsSearchBlockUsers = function() {
    if (global.admUrlPatterns.items_search.test(global.currentUrl)) {
        postBlockUsers();
    }
};

RoleHandler.prototype.itemsSearchComparePhoto = function() {
    if (global.admUrlPatterns.items_search.test(global.currentUrl)) {
        comparePhotoPost();
    }
};

RoleHandler.prototype.itemsSearchAntifraudLinks = function() {
    if (global.admUrlPatterns.items_search.test(global.currentUrl)) {
        antifraudLinks('post');
    }
};

RoleHandler.prototype.itemsSearchCopyItem = function() {
    if (global.admUrlPatterns.items_search.test(global.currentUrl)) {
        copyItemsOnItemsSearch();
    }
};

RoleHandler.prototype.itemsModerComparisonElements = function() {
    if (global.admUrlPatterns.items_moder.test(global.currentUrl)) {
        comparisonInfo();
    }
};

RoleHandler.prototype.itemsModerAbTest = function() {
    if (global.admUrlPatterns.items_moder.test(global.currentUrl)) {
        abTest();
    }
};

RoleHandler.prototype.itemsModerAntifraudLinks = function() {
    if (global.admUrlPatterns.items_moder.test(global.currentUrl)) {
        antifraudLinks('pre');
    }
};

RoleHandler.prototype.itemsModerHideSearchTest = function() {
    if (global.admUrlPatterns.items_moder.test(global.currentUrl)) {
        hideTestItemsSearch();
    }
};

RoleHandler.prototype.itemsModerTimer = function() {
    if (global.admUrlPatterns.items_moder.test(global.currentUrl)) {
        preTimer();
    }
};

RoleHandler.prototype.itemsModerEachItemElements = function() {
    if (global.admUrlPatterns.items_moder.test(global.currentUrl)) {
        addElementsForEachItemNew();
    }
};

RoleHandler.prototype.itemsModerInfoAbuseBlock = function() {
    if (global.admUrlPatterns.items_moder.test(global.currentUrl)) {
        addSomeElementsNew();
    }
};

RoleHandler.prototype.itemsModerComparePhoto = function() {
    if (global.admUrlPatterns.items_moder.test(global.currentUrl)) {
        comparePhotoPreNew();
    }
};

RoleHandler.prototype.itemsModerClose = function() {
    if (global.admUrlPatterns.items_moder.test(global.currentUrl)) {
        closePre();
    }
};

RoleHandler.prototype.itemsModerColorButtons = function() {
    if (global.admUrlPatterns.items_moder.test(global.currentUrl)) {
        colorButtons();
    }
};

RoleHandler.prototype.itemsComparisonCopyItem = function() {
    if (global.admUrlPatterns.items_comparison.test(global.currentUrl)) {
        copyItemIdsComparisonPage();
    }
};

RoleHandler.prototype.itemsComparisonComparisonElementsOld = function() {
    if (global.admUrlPatterns.items_comparison.test(global.currentUrl)) {
        comparisonInfoOld();
    }
};

RoleHandler.prototype.itemsComparisonArchiveComparisonElements = function() {
    if (global.admUrlPatterns.items_comparison_archive.test(global.currentUrl)) {
        addComparisonInfo();
    }
};

RoleHandler.prototype.userIndicators = function() {
    if (global.admUrlPatterns.users_user_info.test(global.currentUrl)) {
        const userIndicators = ['inn', 'auto', 'shop', 'subscription', 'persManager'];
        if (isAuthority('ROLE_USER_INDICATORS_PRO')) {
            userIndicators.splice(1, 0, 'pro');
        }
        if (isAuthority('ROLE_USER_INDICATORS_LEGAL_ENTITY')) {
            userIndicators.splice(2, 0, 'legalEntity');
        }
        if (isAuthority('ROLE_USER_INDICATORS_ONLY_BANK_TRANSFER')) {
            userIndicators.push('onlyBankTransfer');
        }
        if (isAuthority('ROLE_USER_INDICATORS_REPREMIUM')) {
            userIndicators.push('REPremium');
        }
        if (isAuthority('ROLE_USER_INDICATORS_EXTENSION')) {
            userIndicators.push('extension');
        }
        addIndicatorsUserInfo(userIndicators);
    }
};

RoleHandler.prototype.userAlternatePhoneSearch = function() {
    if (global.admUrlPatterns.users_user_info.test(global.currentUrl)) {
        alternatePhoneSearch();
    }
};

RoleHandler.prototype.userCopyData = function() {
    if (global.admUrlPatterns.users_user_info.test(global.currentUrl)) {
        const arr = ['e-mail', 'phones'];
        if (isAuthority('ROLE_USER_COPY_DATA_URL')) {
            arr.push('url');
        }
        if (isAuthority('ROLE_USER_COPY_DATA_COMPANY_EMAIL')) {
            arr.push('companyE-mail');
        }
        if (isAuthority('ROLE_USER_COPY_DATA_INN')) {
            arr.push('inn');
        }
        copyDataToClipboard(arr);
    }
};

RoleHandler.prototype.userUnverifyPhones = function() {
    if (global.admUrlPatterns.users_user_info.test(global.currentUrl)) {
        addUnverifyPhonesButtons();
    }
};

RoleHandler.prototype.userPhonesVerificationLink = function() {
    if (global.admUrlPatterns.users_user_info.test(global.currentUrl)) {
        $('button[data-verify-text="Верифицировать"]').each((idx, item) => {
            const $item = $(item);
            const phone_number = $item.attr("data-phone");
            $item.after('\t<a href="https://adm.avito.ru/users/phones_verification?phone=' + phone_number + '" target="_blank" style="margin: 0 4px;">Log</a>');
        });
    }
};

RoleHandler.prototype.userMessengerLink = function() {
    if (global.admUrlPatterns.users_user_info.test(global.currentUrl)) {
        messengerLinkOnUser();
    }
};

RoleHandler.prototype.userCreateTicket = function() {
    if (global.admUrlPatterns.users_user_info.test(global.currentUrl)) {
        renderCreateNewTicketWindow('/users/user/info');
        addCreateTicketBtn('/users/user/info');
    }
};

RoleHandler.prototype.userCheckDoubles = function() {
    if (global.admUrlPatterns.users_user_info.test(global.currentUrl)) {
        userChekDoubles();
    }
};

RoleHandler.prototype.userChangeEmail = function() {
    if (global.admUrlPatterns.users_user_info.test(global.currentUrl)) {
        userChangeEmail();
    }
};

RoleHandler.prototype.userHDLink = function() {
    if (global.admUrlPatterns.users_user_info.test(global.currentUrl)) {
        linkToHDOnUser();
    }
};

RoleHandler.prototype.userShowCountryIP = function() {
    if (global.admUrlPatterns.users_user_info.test(global.currentUrl)) {
        showCountryIP();
    }
};

RoleHandler.prototype.userSystemAccessLink = function() {
    if (global.admUrlPatterns.users_user_info.test(global.currentUrl)) {
        addIPSystemAccessLink();
    }
};

RoleHandler.prototype.userWlLink = function() {
    if (global.admUrlPatterns.users_user_info.test(global.currentUrl)) {
        addWlLinkOnUserInfo();
    }
};

RoleHandler.prototype.userFeesAvailableModal = function() {
    if (global.admUrlPatterns.users_user_info.test(global.currentUrl)) {
        feesAvailableModal();
    }
};

RoleHandler.prototype.userScrollTop = function() {
    if (global.admUrlPatterns.users_user_info.test(global.currentUrl)) {
        addFixedTools($('body'), ['scroll-top']);
    }
};

RoleHandler.prototype.usersSearchBlockUser = function() {
    if (global.admUrlPatterns.users_search.test(global.currentUrl)) {
        usersSearchBlockUser();
    }
};

RoleHandler.prototype.usersSearchFindVerifiedPhone = function() {
    if (global.admUrlPatterns.users_search.test(global.currentUrl)) {
        findWherePhoneVerified();
    }
};

RoleHandler.prototype.usersSearchCopyPhone = function() {
    if (global.admUrlPatterns.users_search.test(global.currentUrl)) {
        copyPhoneToClipboard();
    }
};

RoleHandler.prototype.usersSearchInfodocQueueLink = function() {
    if (global.admUrlPatterns.users_search.test(global.currentUrl)) {
        addInfoDocQueueLink($('.header__title'));
    }
};

RoleHandler.prototype.usersSearchInfoBtn = function() {
    if (global.admUrlPatterns.users_search.test(global.currentUrl)) {
        addInfoToItems();
    }
};

RoleHandler.prototype.accountCountMoney = function() {
    if (global.admUrlPatterns.users_account_info.test(global.currentUrl)) {
        countMoneyAccount();
    }
};

RoleHandler.prototype.accountItemInfo = function() {
    if (global.admUrlPatterns.users_account_info.test(global.currentUrl)) {
        statusItem();
    }
};

RoleHandler.prototype.accountCompensationBtns = function() {
    if (global.admUrlPatterns.users_account_info.test(global.currentUrl)) {
        addCompensationBtns();
    }
};

RoleHandler.prototype.accountUserViewOperations = function() {
    if (global.admUrlPatterns.users_account_info.test(global.currentUrl)) {
        userViewOperations();
    }
};

RoleHandler.prototype.accountWlLink = function() {
    if (global.admUrlPatterns.users_account_info.test(global.currentUrl)) {
        addWlLinkAccountInfo(getWlLinkForUser,
            {linkTitle: 'Перейти в Wallet Log с фильтрами: текущий пользователь, все статусы, последние полгода'}
        );
    }
};

RoleHandler.prototype.accountWlLinkClosingAmount = function() {
    if (global.admUrlPatterns.users_account_info.test(global.currentUrl)) {
        addWlLinkAccountInfo(getWlLinkForDocuments, {
            linkName: 'Сумма закрывающих'
        });
    }
};

RoleHandler.prototype.accountPackageInfo = function() {
    if (global.admUrlPatterns.users_account_info.test(global.currentUrl)) {
        addPackageInfoAccountInfo();
    }
};

RoleHandler.prototype.billingWalletlogItemStatus = function() {
    if (global.admUrlPatterns.billing_walletlog.test(global.currentUrl)) {
        addShowItemStatusBtn();
    }
};

RoleHandler.prototype.billingWalletlogCountMoney = function() {
    if (global.admUrlPatterns.billing_walletlog.test(global.currentUrl)) {
        countMoneyWalletlog();
    }
};

RoleHandler.prototype.billingWalletlogPackageInfo = function() {
    if (global.admUrlPatterns.billing_walletlog.test(global.currentUrl)) {
        addPackageInfoWalletlog();
    }
};

RoleHandler.prototype.billingInvoicesUserIds = function() {
    if (global.admUrlPatterns.billing_invoices.test(global.currentUrl)) {
        showUsersIdsBillingInvoices();
    }
};

RoleHandler.prototype.systemAccessSanctionIp = function() {
    if (global.admUrlPatterns.system_access.test(global.currentUrl)) {
        sanctionIPSystemAccess();
    }
};

RoleHandler.prototype.shopElements = function() {
    if (global.admUrlPatterns.shops_info_view.test(global.currentUrl)) {
        shopsInfoElements();
    }
};

RoleHandler.prototype.shopModeration = function() {
    if (global.admUrlPatterns.shops_moderation.test(global.currentUrl)) {
        const shopModeration = new ShopModeration();
        if (shopModeration.mainBlock.querySelector('[data-section]')) {
            shopModeration.addMailForm();
            shopModeration.addCoordinationControls();
            shopModeration.addBrief();
            // shopModeration.addPageNavigation();
        }
    }
};

RoleHandler.prototype.detectivesHoldItems = function() {
    if (global.admUrlPatterns.detectives_queue_search.test(global.currentUrl)) {
        addHoldItems();
    }
};

RoleHandler.prototype.mainInfodocQueueLink = function() {
    if (global.admUrlPatterns.main.test(global.currentUrl)) {
        $('section.content').prepend(`
            <div class="ah-infodoc-queue-link-holder"></div>
            <div class="ah-clearfix"></div>
        `);

        addInfoDocQueueLink($('.ah-infodoc-queue-link-holder'));
    }
};

RoleHandler.prototype.searchBySocial = function() {
    if (global.admUrlPatterns.main.test(global.currentUrl)) {
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

RoleHandler.prototype.internButtons = function() {
    if (global.admUrlPatterns.items_search.test(global.currentUrl)
        || global.admUrlPatterns.items_comparison.test(global.currentUrl)
        || global.admUrlPatterns.items_comparison_archive.test(global.currentUrl)) {
        addButtonsIntern();
    }
};

RoleHandler.prototype.internPremoderation = function() {
    if (global.admUrlPatterns.items_search.test(global.currentUrl)) {
        premoderationInternNew(global.userInfo.username, 'post');
    }
    if (global.admUrlPatterns.items_moder.test(global.currentUrl)) {
        premoderationInternNew(global.userInfo.username, 'pre');
    }
};

RoleHandler.prototype.internPremoderationComparison = function() {
    if (global.admUrlPatterns.items_comparison.test(global.currentUrl)
        || global.admUrlPatterns.items_comparison_archive.test(global.currentUrl)) {
        premoderationInternComparison(global.userInfo.username, global.currentUrl);
    }
};

RoleHandler.prototype.internPremoderationComparisonNew = function() {
    if (global.admUrlPatterns.items_moder.test(global.currentUrl)) {
        premoderationInternComparisonNew();
    }
};

RoleHandler.prototype.internTest = function() {
    if (~global.currentUrl.indexOf("http://avitoadm.ru/intern_helper/")) {
        eg();
    }
};

RoleHandler.prototype.moderatorPersonalStatistic = function() {
    if (!global.admUrlPatterns.helpdesk.test(global.currentUrl)) {
        personalStatistics();
    }
};

RoleHandler.prototype.moderatorSettings = function() {
    settings();
};

RoleHandler.prototype.fillOtherReasonField = function() {
    autoOtherReasons();
};

RoleHandler.prototype.spamLinks = function() {
    if (global.admUrlPatterns.items_moder.test(global.currentUrl)) {
        eyeLinks($('.item-info-name'));
    }
    if (global.admUrlPatterns.items_search.test(global.currentUrl)) {
        eyeLinks($('.item_title'));
    }
};

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
    if (global.admUrlPatterns.users_user_info.test(global.currentUrl)
        || global.admUrlPatterns.items_item_info.test(global.currentUrl)) {
        adminTableCategory();
    }
};

RoleHandler.prototype.linksOnComments = function() {
    if (global.admUrlPatterns.users_user_info.test(global.currentUrl)
        || global.admUrlPatterns.items_item_info.test(global.currentUrl)) {
        linksOnComments('td.is-break', global.currentUrl);
    }

    if (global.admUrlPatterns.users_account_info.test(global.currentUrl)) {
        const userID = global.currentUrl.split('/');
        linksOnComments('td.is-break', userID[6]);
    }

    if (global.admUrlPatterns.items_comparison.test(global.currentUrl)) {
        linksOnComments('.row-user-block:last table td', global.currentUrl);
    }
};

RoleHandler.prototype.snp = function() {
    if (global.admUrlPatterns.items_search.test(global.currentUrl)
        && ~global.currentUrl.indexOf('user_id')) {

        const queryStr = parseQueryURL(window.location.search);
        smartSNP(queryStr['user_id']);
    }

    if (global.admUrlPatterns.messenger_user.test(global.currentUrl)) {
        smartSNP(global.currentUrl.split('/')[5]);
    }
};

RoleHandler.prototype.hideBlockUserBtn = function() {
    if (global.admUrlPatterns.items_item_info.test(global.currentUrl)
        || global.admUrlPatterns.items_search.test(global.currentUrl)) {
        hideBlockUserButton();
    }
};

RoleHandler.prototype.allowList = function() {
    if (global.admUrlPatterns.items_item_info.test(global.currentUrl)) {
        allowlist(global.currentUrl, global.userInfo.username);
    }
};

RoleHandler.prototype.allowListMsg = function() {
    if (global.admUrlPatterns.items_item_info.test(global.currentUrl)) {
        allowListMSG(global.currentUrl, global.userInfo.username);
    }
};

RoleHandler.prototype.allowItem = function() {
    if (global.admUrlPatterns.items_item_info.test(global.currentUrl)) {
        allowItem();
    }
};

RoleHandler.prototype.searchByImageLinks = function() {
    if (global.admUrlPatterns.items_search.test(global.currentUrl)
        || global.admUrlPatterns.items_moder.test(global.currentUrl)) {
        searchByImageLinks();
    }
};

RoleHandler.prototype.reservedOperations = function() {
    if (global.admUrlPatterns.users_account_info.test(global.currentUrl)) {
        reservedOperation('/users/account/info');
    }
    if (global.admUrlPatterns.billing_walletlog.test(global.currentUrl)) {
        reservedOperation('/billing/walletlog');
    }
};