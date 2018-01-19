const global = {
    userInfo: null,
    currentUrl: null,
    springUrl: null,
    admUrl: null,
    admUrlPatterns: {
        main: /https:\/\/adm\.avito\.ru\/$/,
        items_search: /https:\/\/adm\.avito\.ru\/(?:adm\/)?items\/search/,
        items_item_info: /https:\/\/adm\.avito\.ru\/\d+(?!\/)\b|(?:(?:adm\/)?items\/item\/info)/,
        items_comparison: /https:\/\/adm\.avito\.ru\/(?:adm\/)?items\/comparison(?!\/\d+\/archive)/,
        items_comparison_archive: /https:\/\/adm\.avito\.ru\/(?:adm\/)?items\/comparison\/\d+\/archive/,
        items_moder: /https:\/\/adm\.avito\.ru\/(?:adm\/)?items\/moder/,
        users_search: /https:\/\/adm\.avito\.ru\/(?:adm\/)?users\/search/,
        users_user_info: /https:\/\/adm\.avito\.ru\/(?:\d+u(?!\/)\b)|(?:(?:adm\/)?users\/user\/info)/,
        users_account_info: /https:\/\/adm\.avito\.ru\/(?:adm\/)?users\/account\/info/,
        billing_walletlog: /https:\/\/adm\.avito\.ru\/(?:adm\/)?billing\/walletlog/,
        billing_invoices: /https:\/\/adm\.avito\.ru\/(?:adm\/)?billing\/invoices/,
        shops_info_view: /https:\/\/adm\.avito\.ru\/(?:adm\/)?shops\/info\/view/,
        shops_moderation: /https:\/\/adm\.avito\.ru\/(?:adm\/)?shops\/moderation/,
        helpdesk: /https:\/\/adm\.avito\.ru\/helpdesk/,
        system_access: /https:\/\/adm\.avito\.ru\/(?:adm\/)?system\/access/,
        detectives_queue_search: /https:\/\/adm\.avito\.ru\/(?:adm\/)?detectives\/queue\/search/,
        messenger_user: /https:\/\/adm\.avito\.ru\/(?:adm\/)?messenger\/user/
    },
    // globals from support helper
    existGlobal: null,
    hdSettings: {}, // настройки (теги, проблемы в HD)
    attendantTlInfo: {}, // дежурный тимлид
    allUsersInfo: [], // инфомрация о всех юзерах
    // globals from moderator helper
    beforeId: 0,
    comparePhotoLoadItemsCount: null
};

$(function () {
    global.currentUrl = location.href;

    chrome.storage.local.get(result => {
        if (result.connectInfo) {
            global.springUrl = result.connectInfo.springUrl;
            global.admUrl = result.connectInfo.admUrl;
        }
        if (result.connectInfo.user) global.userInfo = result.connectInfo.user.principal;

        startNotification(result.notifications);

        holidays();

        // for testing
        console.log(global.userInfo);
        global.userInfo.authorities = {
            'ROLE_USER-CHECK-DOUBLES': true,
            'ROLE_USER-CHANGE-EMAIL': true,
            'ROLE_USER-INDICATORS': true,
            'ROLE_USER-INDICATORS--LEGAL_ENTITY': true,
            'ROLE_USER-INDICATORS--REPREMIUM': true,
            'ROLE_USER-INDICATORS--EXTENSION': true,
            'ROLE_USER-INDICATORS--ONLY-BANK-TRANSFER': true,
            'ROLE_USER-INDICATORS--PRO': true,
            'ROLE_USER-ALTERNATE_PHONE_SEARCH': true,
            'ROLE_USER-COPY-DATA': true,
            'ROLE_USER-COPY-DATA--URL': true,
            'ROLE_USER-COPY-DATA--COMPANY-EMAIL': true,
            "ROLE_USER-COPY-DATA--INN": true,
            'ROLE_USER-UNVERIFY_PHONES': true,
            "ROLE_USER-PHONES-VERIFICATION-LINK": true,
            'ROLE_USER-MESSENGER-LINK': true,
            'ROLE_USER-CREATE-TICKET': true,
            'ROLE_USER-HD-LINK': true,
            'ROLE_USER-COUNTRY-IP': true,
            'ROLE_USER-SYSTEM-ACCESS-LINK': true,
            'ROLE_USER-WL-LINK': true,
            'ROLE_USER-FEES-AVAILABLE-MODAL': true,
            'ROLE_USER-SCROLL-TOP': true,
            'ROLE_USERS-SEARCH-FIND-VERIFIED-PHONE': true,
            'ROLE_USERS-SEARCH-COPY-PHONE': true,
            'ROLE_USERS-SEARCH-INFODOC-QUEUE-LINK': true,
            'ROLE_USERS-SEARCH-INFO-BTN': true,
            'ROLE_USERS-SEARCH-BLOCK-USERS': true,
            'ROLE_ITEM-COPY-ITEM': true,
            'ROLE_ITEM-REFUND-INFO': true,
            'ROLE_ITEM-CITY-TIME': true,
            'ROLE_ITEM-COMPARE-ITEMS': true,
            "ROLE_ITEM-ACCOUNT-LINK": true,
            'ROLE_ITEM-USER-INFO': true,
            'ROLE_ITEM-REJECT-BY-CALL': true,
            'ROLE_ITEMS-SEARCH-INFO-BTN': true,
            'ROLE_ITEMS-SEARCH-ITEM-INFO': true,
            'ROLE_ITEMS-SEARCH-ITEM-INFO-AUTOLOAD': true,
            'ROLE_ITEMS-SEARCH-ITEM-DESCRIPTION': true,
            "ROLE_ITEMS-SEARCH-USER-INFO": true,
            "ROLE_ITEMS-SEARCH-USER-INFO--WL": true,
            "ROLE_ITEMS-SEARCH-USER-INFO--INFO": true,
            "ROLE_ITEMS-SEARCH-USER-INFO--ABUSES": true,
            'ROLE_ITEMS-SEARCH-USER-INFO-AUTOLOAD': true,
            'ROLE_ITEMS-SEARCH-CHECKBOX-CLICK': true,
            'ROLE_ITEMS-SEARCH-INFORM-SEARCH': true,
            'ROLE_ITEMS-SEARCH-BLOCK-USERS': true,
            'ROLE_ITEMS-SEARCH-COMPARE-PHOTO': true,
            'ROLE_ITEMS-SEARCH-ANTIFRAUD-LINKS': true,
            'ROLE_ITEMS-SEARCH-COPY-ITEM': true,
            'ROLE_ITEMS-COMPARISON-COPY-ITEM': true,
            'ROLE_ITEMS-COMPARISON-COMPARISON-ELEMENTS': true,
            'ROLE_ITEMS-COMPARISON-ARCHIVE-COMPARISON-ELEMENTS': true,
            'ROLE_ITEMS-MODER-TIMER': true,
            'ROLE_ITEMS-MODER-EACH-ITEM-ELEMENTS': true,
            'ROLE_ITEMS-MODER-INFO-ABUSE-BLOCK': true,
            'ROLE_ITEMS-MODER-COMPARE-PHOTO': true,
            'ROLE_ITEMS-MODER-CLOSE': true,
            'ROLE_ITEMS-MODER-COLOR-BUTTONS': true,
            'ROLE_ITEMS-MODER-COMPARISON-ELEMENTS': true,
            'ROLE_ITEMS-MODER-AB-TEST': true,
            'ROLE_ITEMS-MODER-ANTIFRAUD-LINKS': true,
            'ROLE_ITEMS-MODER-HIDE-SEARCH-TEST': true,
            "ROLE_HELPDESK-TAGS": true,
            "ROLE_HELPDESK-QUICK-BUTTONS": true,
            "ROLE_HELPDESK-FIXED-TOOLS": true,
            "ROLE_HELPDESK-FIXED-TOOLS--SETTINGS": true,
            "ROLE_HELPDESK-TECH-INFO-IP-LINK": true,
            "ROLE_HELPDESK-ALTERNATE-SEARCH": true,
            "ROLE_HELPDESK-CHANGE-ASSIGNEE": true,
            "ROLE_HELPDESK-CHANGE-ASSIGNEE-ANY-STATUS": true,
            "ROLE_HELPDESK-BLOCKQUOTE-CLEAR": true,
            "ROLE_HELPDESK-BLOCKQUOTE-TOGGLE": true,
            "ROLE_HELPDESK-EMPLOYEE-LABEL": true,
            "ROLE_HELPDESK-CREATE-TICKET": true,
            "ROLE_HELPDESK-CREATE-TICKET-VOICE-SUPPORT": true,
            "ROLE_HELPDESK-CREATE-TICKET-C2C": true,
            "ROLE_HELPDESK-CONTROL-TOOLS": true,
            "ROLE_HELPDESK-TICKET-TITLE-TOOLS": true,
            "ROLE_HELPDESK-DESCRIPTION-IP": true,
            "ROLE_HELPDESK-TECH-INFO-SANCTION-IP": true,
            "ROLE_HELPDESK-SEARCH-BY-SOCIAL": true,
            "ROLE_HELPDESK-COPY-TICKET-LINK": true,
            "ROLE_HELPDESK-COPY-REQUESTER-NAME": true,
            "ROLE_HELPDESK-COPY-TICKET-ID": true,
            "ROLE_HELPDESK-LEFT-PANEL-ITEM-POPOVER": true,
            "ROLE_HELPDESK-LEFT-PANEL-IP-POPOVER": true,
            "ROLE_HELPDESK-LEFT-PANEL-PHONE-POPOVER": true,
            "ROLE_HELPDESK-NEGATIVE-USERS": true,
            "ROLE_HELPDESK-BLOCKED-REASON": true,
            "ROLE_HELPDESK-LINKS-ON-COMMENTS": true,
            "ROLE_HELPDESK-COMMENT-USER": true,
            "ROLE_HELPDESK-COMMENT-USER--TICKET-LINK": true,
            "ROLE_HELPDESK-UNBLOCK-USER": true,
            "ROLE_HELPDESK-USER-INFO": true,
            "ROLE_HELPDESK-MESSENGER-LINK": true,
            "ROLE_HELPDESK-COPY-USER-MAIL": true,
            "ROLE_HELPDESK-COPY-USER-NAME": true,
            "ROLE_HELPDESK-CLAIM-REEVALUATION": true,
            'ROLE_HELPDESK-TL-HELP': true,
            "ROLE_HELPDESK-COMMENTS-ITEM": true,
            "ROLE_HELPDESK-COMMENTS-IP": true,
            'ROLE_HELPDESK-QUEUE-OPEN-TICKET': true,
            'ROLE_HELPDESK-QUEUE-EMPLOYEE-LABELS': true,
            "ROLE_ACCOUNT-COUNT-MONEY": true,
            "ROLE_ACCOUNT-ITEM-INFO": true,
            "ROLE_ACCOUNT-COMPENSATION-BTNS": true,
            "ROLE_ACCOUNT-USER-VIEW-OPERATIONS": true,
            "ROLE_ACCOUNT-WL-LINK": true,
            "ROLE_ACCOUNT-WL-LINK-CLOSING-AMOUNT": true,
            "ROLE_ACCOUNT-PACKAGE-INFO": true,
            'ROLE_BILLING-WALLETLOG-ITEM-STATUS': true,
            'ROLE_BILLING-WALLETLOG-COUNT-MONEY': true,
            'ROLE_BILLING-WALLETLOG-PACKAGE-INFO': true,
            'ROLE_BILLING-INVOICES-USER-ID': true,
            'ROLE_SYSTEM-ACCESS-SANCTION-IP': true,
            'ROLE_SYSTEM-ACCESS-SANCTION-IP-BY-CALL': true,
            "ROLE_DETECTIVES-HOLD-ITEMS": true,
            'ROLE_MAIN-INFODOC-QUEUE-LINK': true,
            'ROLE_SHOP-ELEMENTS': true,
            'ROLE_SHOP-MODERATION': true,
            'ROLE_INTERN-BUTTONS': true,
            'ROLE_INTERN-PREMODERATION': true,
            'ROLE_INTERN-PREMODERATION-COMPARISON': true,
            'ROLE_INTERN-PREMODERATION-COMPARISON-NEW': true,
            'ROLE_INTERN-TEST': true,
            'ROLE_MODERATOR-PERSONAL-STATISTIC': true,
            'ROLE_MODERATOR-SETTINGS': true,
            'ROLE_FILL-OTHER-REASON-FIELD': true,
            'ROLE_SNP': true,
            'ROLE_HIDE-BLOCK-USER-BTN': true,
            'ROLE_ALLOW-LIST': true,
            'ROLE_ALLOW-LIST-MSG': true,
            'ROLE_ALLOW-ITEM': true,
            'ROLE_SEARCH-BY-IMAGE-LINKS': true,
            'ROLE_RESERVED-OPERATIONS': true,
            'ROLE_SPAM-LINKS': true,
            'ROLE_TASKLOG-LINK': true,
            'ROLE_INTERNLOG-LINK': true,
            'ROLE_EMPLOYEE-LABELS': true,
            'ROLE_LINKS-ON-COMMENTS': true,
            'ROLE_SEARCH-BY-SOCIAL': true,
        };

        // console.log(Object.keys(global.userInfo.authorities).length);

        handleRoles();
    });

    // уничтожать поповер по клику не на нем
    $(document).mouseup(e => {
        let destroyOutclickingPopovers = $('.ah-popover-destroy-outclicking');
        if (!destroyOutclickingPopovers.is(e.target)
            && destroyOutclickingPopovers.has(e.target).length === 0) {
            $(destroyOutclickingPopovers).popover('destroy');
        }
    });
});
