let userGlobalInfo;
let currentUrl;
let springUrl;
let admUrl;

// global from support helper
let existGlobal;
let settingsGlobal = {}; // настройки (теги, проблемы в HD)
let attendantTLGlobalInfo = {}; // дежурный тимлид
let allUsersGlobalInfo = []; // инфомрация о всех юзерах

// global from moderator helper
let beforeID = 0;
let comparePhotoLoadItemsCount;

const admUrlPatterns = {
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
};

$(function () {
    currentUrl = location.href;

    chrome.storage.local.get(result => {
        if (result.connectInfo) {
            springUrl = result.connectInfo.springUrl;
            admUrl = result.connectInfo.admUrl;
        }
        if (result.connectInfo.user) userGlobalInfo = result.connectInfo.user.principal;

        startNotification(result.notifications);

        holidays();

        // for testing
        console.log(userGlobalInfo);
        userGlobalInfo.authorities = {
            'ROLE_TASKLOG-LINK': true,
            'ROLE_INTERNLOG-LINK': true,
            'ROLE_EMPLOYEE-LABELS': true,
            'ROLE_LINKS-ON-COMMENTS': true,
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
            'ROLE_USER-PHONES-VERIFICATION_LINK': true,
            'ROLE_USER-MESSENGER-LINK': true,
            'ROLE_USER-CREATE-TICKET': true,
            'ROLE_USER-HD-LINK': true,
            'ROLE_USER-COUNTRY-IP': true,
            'ROLE_USER-SYSTEM-ACCESS-LINK': true,
            'ROLE_USER-WL-LINK': true,
            'ROLE_USER-FEES-AVAILABLE-MODAL': true,
            'ROLE_USER-SCROLL-TOP': true,
            'ROLE_HIDE-BLOCK-USER-BTN': true,
            'ROLE_ALLOW-LIST': true,
            'ROLE_ALLOW-LIST-MSG': true,
            'ROLE_ALLOW-ITEM': true,
            'ROLE_ITEM-COPY-ITEM': true,
            'ROLE_ITEM-REFUND-INFO': true,
            'ROLE_ITEM-CITY-TIME': true,
            'ROLE_ITEM-COMPARE-ITEMS': true,
            'ROLE_ITEM-ACCOUNT-INFO-LINK': true,
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
            'ROLE_SEARCH-BY-IMAGE-LINKS': true,
            'ROLE_ITEMS-SEARCH-COPY-ITEM': true,
            'ROLE_ACCOUNT-INFO-COUNT-MONEY': true,
            'ROLE_ACCOUNT-INFO-ITEM-INFO': true,
            'ROLE_ACCOUNT-INFO-COMPENSATION-BTNS': true,
            'ROLE_ACCOUNT-INFO-USER-VIEW-OPERATIONS': true,
            'ROLE_RESERVED-OPERATIONS': true,
            "ROLE_ACCOUNT-INFO-WL-LINK": true,
            "ROLE_ACCOUNT-INFO-WL-LINK-CLOSING-AMOUNT": true,
            "ROLE_ACCOUNT-INFO-PACKAGE-INFO": true,
            'ROLE_BILLING-WALLETLOG-ITEM-STATUS': true,
            'ROLE_BILLING-WALLETLOG-COUNT-MONEY': true,
            'ROLE_BILLING-WALLETLOG-PACKAGE-INFO': true,
            'ROLE_BILLING-INVOICES-USER-ID': true,
            'ROLE_USERS-SEARCH-FIND-VERIFIED-PHONE': true,
            'ROLE_USERS-SEARCH-COPY-PHONE': true,
            'ROLE_USERS-SEARCH-INFODOC-QUEUE-LINK': true,
            'ROLE_USERS-SEARCH-INFO-BTN': true,
            'ROLE_USERS-SEARCH-BLOCK-USERS': true,
            'ROLE_SYSTEM-ACCESS-SANCTION-IP': true,
            'ROLE_SYSTEM-ACCESS-SANCTION-IP-BY-CALL': true,
            'ROLE_ITEMS-COMPARISON-COPY-ITEM': true,
            'ROLE_ITEMS-COMPARISON-COMPARISON-ELEMENTS': true,
            'ROLE_ITEMS-COMPARISON-ARCHIVE-COMPARISON-ELEMENTS': true,
            'ROLE_SEARCH-BY-SOCIAL': true,
            'ROLE_HELPDESK-DETAILS-TAGS': true,
            'ROLE_HELPDESK-DETAILS-QUICK-BUTTONS': true,
            "ROLE_HELPDESK-DETAILS-FIXED-TOOLS": true,
            "ROLE_HELPDESK-DETAILS-FIXED-TOOLS--SETTINGS": true,
            'ROLE_HELPDESK-DETAILS-TECH-INFO-IP-LINK': true,
            'ROLE_HELPDESK-DETAILS-ALTERNATE-SEARCH': true,
            'ROLE_HELPDESK-DETAILS-CHANGE-ASSIGNEE': true,
            'ROLE_HELPDESK-DETAILS-CHANGE-ASSIGNEE-ANY-STATUS': true,
            'ROLE_HELPDESK-DETAILS-BLOCKQUOTE-CLEAR': true,
            'ROLE_HELPDESK-DETAILS-BLOCKQUOTE-TOGGLE': true,
            'ROLE_HELPDESK-DETAILS-EMPLOYEE-LABEL': true,
            'ROLE_HELPDESK-DETAILS-CREATE-TICKET': true,
            'ROLE_HELPDESK-DETAILS-CREATE-TICKET-VOICE-SUPPORT': true,
            'ROLE_HELPDESK-DETAILS-CREATE-TICKET-C2C': true,
            'ROLE_HELPDESK-DETAILS-CONTROL-TOOLS': true,
            'ROLE_HELPDESK-DETAILS-TICKET-TITLE-TOOLS': true,
            'ROLE_HELPDESK-DETAILS-IP-DESCRIPTION': true,
            'ROLE_HELPDESK-DETAILS-TECH-INFO-SANCTION-IP': true,
            'ROLE_HELPDESK-DETAILS-SEARCH-BY-SOCIAL': true,
            'ROLE_HELPDESK-DETAILS-COPY-TICKET-LINK': true,
            'ROLE_HELPDESK-DETAILS-COPY-REQUESTER-NAME': true,
            'ROLE_HELPDESK-DETAILS-COPY-TICKET-ID': true,
            'ROLE_HELPDESK-DETAILS-LEFT-PANEL-ITEM-POPOVER': true,
            'ROLE_HELPDESK-DETAILS-LEFT-PANEL-IP-POPOVER': true,
            'ROLE_HELPDESK-DETAILS-LEFT-PANEL-PHONE-POPOVER': true,
            'ROLE_HELPDESK-DETAILS-NEGATIVE-USERS-NOTIFICATION': true,
            'ROLE_HELPDESK-DETAILS-BLOCKED-USER-REASON': true,
            'ROLE_HELPDESK-DETAILS-LINKS-ON-COMMENTS': true,
            'ROLE_HELPDESK-DETAILS-COMMENT-ON-USER': true,
            'ROLE_HELPDESK-DETAILS-COMMENT-ON-USER--TICKET-LINK': true,
            'ROLE_HELPDESK-DETAILS-UNBLOCK-USER': true,
            'ROLE_HELPDESK-DETAILS-USER-INFO': true,
            'ROLE_HELPDESK-DETAILS-MESSENGER-LINK': true,
            'ROLE_HELPDESK-DETAILS-COPY-USER-MAIL': true,
            'ROLE_HELPDESK-DETAILS-COPY-USER-NAME': true,
            'ROLE_HELPDESK-DETAILS-CLAIM-REEVALUATION': true,
            'ROLE_HELPDESK-QUEUE-OPEN-TICKET': true,
            'ROLE_HELPDESK-QUEUE-EMPLOYEE-LABELS': true,
            'ROLE_HELPDESK-TL-HELP': true,
            'ROLE_HELPDESK-DETAILS-PARSE-ITEMS-COMMENTS': true,
            'ROLE_HELPDESK-DETAILS-IP-COMMENTS': true,
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
            'ROLE_ITEMS-MODER-TIMER': true,
            'ROLE_ITEMS-MODER-EACH-ITEM-ELEMENTS': true,
            'ROLE_ITEMS-MODER-INFO-ABUSE-BLOCK': true,
            'ROLE_ITEMS-MODER-COMPARE-PHOTO': true,
            'ROLE_ITEMS-MODER-CLOSE': true,
            'ROLE_ITEMS-MODER-COLOR-BUTTONS': true,
            'ROLE_SPAM-LINKS': true,
            'ROLE_ITEMS-MODER-COMPARISON-ELEMENTS': true,
            'ROLE_ITEMS-MODER-AB-TEST': true,
            'ROLE_ITEMS-MODER-ANTIFRAUD-LINKS': true,
            'ROLE_ITEMS-MODER-HIDE-SEARCH-TEST': true,
            'ROLE_SNP': true,
            'ROLE_DETECTIVES-QUEUE-SEARCH-HOLD-ITEMS': true
        };

        // console.log(Object.keys(userGlobalInfo.authorities).length);

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
