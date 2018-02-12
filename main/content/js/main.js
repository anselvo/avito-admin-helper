const global = {
    connectInfo: null,
    authorities: null,
    userInfo: null,
    currentUrl: null,
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
    comparePhotoLoadItemsCount: null,
    consultation: [
        {id: 1575, name: "Услуги"},
        {id: 1616, name: "Бытовая электроника | Хобби и отдых"},
        {id: 1617, name: "Транспорт"},
        {id: 1618, name: "Для дома и дачи | Для бизнеса"},
        {id: 1620, name: "Личные вещи | Животные"},
        {id: 1621, name: "Работа"},
        {id: 1622, name: "Недвижимость"}
    ]
};

$(function () {
    global.currentUrl = location.href;

    chrome.storage.local.get(result => {
        try {
            global.connectInfo = result.connectInfo;
            global.authorities = result.authorities;
            global.userInfo = result.connectInfo.spring_user.principal;


            if (result.script) {
                startNotification(result.notifications);

                holidays();

                handleRoles();
            }
        } catch (e) {
            console.log(e);
        }
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
