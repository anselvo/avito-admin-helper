function startInfoDoc() {
    console.log('infoDoc script start');

    chrome.runtime.onMessage.addListener(function (request, sender, callback) {
        if (request.onUpdated == 'ticketUser')
            setTimeout(infoDocTicketUser, 100);

        if (request.onUpdated == 'ticketInfo')
            setTimeout(infoDocTicketInfo, 100);

        if (request.onUpdated == 'ticketQueue')
            setTimeout(infoDocTicketQueue, 100);
    });

    $(document).ready(function () {
        // загрузка
        $('body').append(''+
        '<div id="sh-loading-layer">'+
            '<div class="sh-cssload-container">'+
                '<div class="sh-cssload-whirlpool"></div>'+
            '</div>'+
        '</div>');

        var currentUrl = window.location.href;

        // User info
        var shortUserLinkReg = /https\:\/\/adm\.avito\.ru\/\d+u(?!\/)\b/i;
        if (~currentUrl.indexOf('https://adm.avito.ru/users/user/info/') 
                || shortUserLinkReg.test(currentUrl)
                || ~currentUrl.indexOf('https://adm.avito.ru/adm/users/user/info/')) {
            
            // сопоставления логинов с категорией
            adminTableCategory();
            
            // индикаторы
            showUserInfoIndicators(['inn', 'legalEntity', 'auto', 'shop', 
                'subscription', 'persManager', 'delivery', 'onlyBankTransfer']);

            addPremiumUsersIndicator();

            addExtensionIndicator();

            // переход в HD
            linkToHDOnUser();

            copyDataToClipboard(['e-mail', 'phones', 'companyE-mail', 'inn']);
            
            addFixedTools($('body'), ['scroll-top']);
        }

        // users/search
        if (currentUrl.indexOf('https://adm.avito.ru/users/search') + 1
            || currentUrl.indexOf('https://adm.avito.ru/adm/users/search') + 1) {
            addInfoDocQueueLink($('.header__title'));
        }
        // Account info
        if (currentUrl.indexOf('https://adm.avito.ru/adm/users/account/info/') + 1 
                || currentUrl.indexOf('https://adm.avito.ru/users/account/info/') + 1) {
            // добавление кнопок подсчета в Account info
            countMoneyAccount();

            // дополнения к операциям резервирования
            reservedOperation('/users/account/info');
            userViewOperations();
        }

        // walletlog
        if (currentUrl.indexOf('https://adm.avito.ru/adm/billing/walletlog') + 1 
                || currentUrl.indexOf('https://adm.avito.ru/billing/walletlog') + 1) {
            // дополнения к операциям резервирования
            reservedOperation('/billing/walletlog');

            countMoneyWalletlog();
        }

        // helpdesk
        if (~currentUrl.indexOf('https://adm.avito.ru/helpdesk')) {
            findAgentID(); // ID агента
            
            getAllUsers(); // инфа обо всех пользователях
        }

        // root
        let mainPageReg = /adm\.avito\.ru\/$/i;
        if (mainPageReg.test(currentUrl)) {
            $('section.content').prepend(`
                <div class="ah-infodoc-queue-link-holder"></div>
                <div class="ah-clearfix"></div>
            `);

            addInfoDocQueueLink($('.ah-infodoc-queue-link-holder'));
        }
    });
}

function infoDocTicketInfo() {
    // ассигни сразу на себя
//    changeAssigneeToMe(localStorage.agentID);

    // смена ассигни
    changeAssignee();

    // фиксированный контейнер (настройки, кнопка наверх)
    addFixedTools($('div.col-xs-3:eq(1)'), ['scroll-top']);
    
    // инфа об агента
    showAgentInfoTicket();

    copyTicketId(); // копирование айди тикета
}

function infoDocTicketUser() {
    // копирование мыла юзера в буфер
    addCopyUserMailInTicket();

    // простановка коммента на УЗ из HD
    addCommentOnUserFromTicket();
}

function infoDocTicketQueue() {
    var timer = setInterval(() => {
        var loadingVisible = $('.helpdesk-loading')
                .hasClass('helpdesk-loading_visible');
        if (!loadingVisible) {
            // открывать тикеты в новой вкладке
            openTicketInNewTab();
            
            showAgentInfoQueue();
            
            clearInterval(timer);
        }
    }, 50);
}