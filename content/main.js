let userGlobalInfo;
let scriptGlobal;
let currentUrl;
let springUrl;
let admUrl;
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
    shops_moderation: /https:\/\/adm\.avito\.ru\/(?:adm\/)?shops\/moderation/
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

        scriptGlobal = result.script;

        startNotification(result.notifications);

        holidays();

        if (result.script === 'infoDoc') {
            startInfoDoc();
        }

        if (result.script === 'intern') {
            startIntern();
            startModerator();
        }

        if (result.script === 'moderator') {
            startModerator();
        }

        if (result.script === 'smm') {
            startSmm();
        }

        if (result.script === 'support') {
            startSupport();
        }

        if (result.script === 'traffic') {
            startTraffic();
        }
    });

    $(document).mouseup(e => {
        let destroyOutclickingPopovers = $('.ah-popover-destroy-outclicking');
        if (!destroyOutclickingPopovers.is(e.target)
            && destroyOutclickingPopovers.has(e.target).length === 0) {
            $(destroyOutclickingPopovers).popover('destroy');
        }
    });
});