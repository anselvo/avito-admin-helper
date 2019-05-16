const global = {
    connectInfo: null,
    authorities: null,
    userInfo: null,
    currentUrl: null,
    admUrlPatterns: {
        main: /\/$/,
        items_search: /\/(?:adm\/)?items\/search/,
        items_item_info: /https:\/\/[a-z\d.-]*\/\d+(?!\/)\b|(?:(?:adm\/)?items\/item\/info)/,
        items_comparison: /\/(?:adm\/)?items\/comparison(?!\/\d+\/archive)/,
        items_comparison_archive: /\/(?:adm\/)?items\/comparison\/\d+\/archive/,
        items_moder: /\/(?:adm\/)?items\/moder/,
        users_search: /\/(?:adm\/)?users\/search/,
        users_user_info: /https:\/\/[a-z\d.-]*\/(?:\d+u(?!\/)\b)|(?:(?:adm\/)?users\/user\/info)/,
        users_account_info: /\/(?:adm\/)?users\/account\/info/,
        billing_walletlog: /\/(?:adm\/)?billing\/walletlog/,
        billing_invoices: /\/(?:adm\/)?billing\/invoices/,
        shops_info_view: /\/(?:adm\/)?shops\/info\/view/,
        shops_moderation: /\/(?:adm\/)?shops\/moderation/,
        helpdesk: /\/helpdesk/,
        system_access: /\/(?:adm\/)?system\/access/,
        detectives_queue_search: /\/(?:adm\/)?detectives\/queue\/search/,
        detectives_queue_search_call: /\/(?:adm\/)?detectives\/queue\/search\/call/,
        messenger_user: /\/(?:adm\/)?messenger\/user/
    },
    // globals from support helper
    existGlobal: null,
    hdSettings: {}, // настройки (теги, проблемы в HD)
    allUsersInfo: { // инфомрация о всех юзерах
        isLoading: true,
        list: []
    },
    // globals from moderator helper
    beforeId: 0,
    comparePhotoLoadItemsCount: null,
    otherReasonsCategory: {
        name: "Неправильная категория",
        reason: [
            {name: "Личные вещи", reason: ['Одежда, обувь, аксессуары', 'Детская одежда и обувь', 'Товары для детей и игрушки', 'Красота и здоровье', 'Часы и украшения']},
            {name: "Транспорт", reason: ['Запчасти и аксессуары', 'Автомобили', 'Грузовики и спецтехника', 'Мотоциклы и мототехника', 'Водный транспорт']},
            {name: "Для дома и дачи", reason: ['Ремонт и строительство', 'Мебель и интерьер', 'Бытовая техника', 'Посуда и товары для кухни', 'Растения', 'Продукты питания']},
            {name: "Бытовая электроника", reason: ['Телефоны', 'Аудио и видео', 'Товары для компьютера', 'Фототехника', 'Оргтехника и расходники', 'Игры, приставки и программы', 'Ноутбуки', 'Планшеты и электронные книги', 'Настольные компьютеры']},
            {name: "Хобби и отдых", reason: ['Коллекционирование', 'Спорт и отдых', 'Книги и журналы', 'Велосипеды', 'Музыкальные инструменты', 'Охота и рыбалка', 'Билеты и путешествия']},
            {name: "Недвижимость", reason: ['Квартиры', 'Дома, дачи, коттеджи', 'Земельные участки', 'Коммерческая недвижимость', 'Гаражи и машиноместа', 'Комнаты', 'Недвижимость за рубежом']},
            {name: "Работа", reason: ['Резюме', 'Вакансии']},
            {name: "Услуги"},
            {name: "Животные", reason: ['Кошки', 'Собаки', 'Товары для животных', 'Другие животные', 'Аквариум', 'Птицы']},
            {name: "Для бизнеса", reason: ['Оборудование для бизнеса', 'Готовый бизнес']}
        ]
    },
    otherReasonsService: {
        name: "Вид услуги",
        reason: ['IT, интернет, телеком', 'Бытовые услуги', 'Деловые услуги', 'Искусство', 'Красота, здоровье', 'Курьерские поручения',
            'Мастер на час', 'Няни, сиделки', 'Оборудование, производство', 'Обучение, курсы', 'Охрана, безопасность', 'Питание, кейтеринг',
            'Праздники, мероприятия', 'Реклама, полиграфия', 'Ремонт и обслуживание техники', 'Ремонт, строительство', 'Сад, благоустройство',
            'Транспорт, перевозки', 'Уборка', 'Установка техники', 'Уход за животными', 'Фото- и видеосъёмка', 'Другое']
    },
    blockFakeComments: [
        { comment: 'Фотофейк', hasInput: true },
        { comment: 'Дизайнерские фото', hasInput: false },
        { comment: 'Фотошоп', hasInput: false },
        { comment: 'Изменил адрес', hasInput: false },
        { comment: 'Загрузил фото с чужим ID', shortName: 'Чужое фото с ID', hasInput: false },
    ],
    ledItem: [
        { flagName: "Вид объявления", button: { reason: 715, value: "ItemType", action: "reject" } },
        { flagName: "Нет фото с ID", button: { reason: 774, value: "NoPhotoID", action: "reject" } }
    ],
    onlinePhotoCheck: [
        { flagName: "Нет фото с ID" }
    ],
    proUserInCategory: [
        { id: 89, name: 'Собаки' },
        { id: 90, name: 'Кошки' }
    ],
    compareDropdownItemBlock: [
        { id: 384, text: "Неактуальное предложение" },
        { id: 20, text: "Повторная подача объявления" },
        { id: 25, text: "Неправильный город" }
    ],
    compareDropdownItemReject: [
        { id: 15, text: "Несоответствующее фото" },
        { id: 178, text: "Неправильная категория" }
    ],
    tlHelpPositionIds: [
        '882f3674-081a-4962-b34c-0b5bf67fc391', // Руководитель группы поддержки пользователей
        '4a8cbd05-7616-4121-80a3-bf4dadf8a9c6', // Супервайзер поддержки пользователей
        'cf9d62a5-b12e-4276-be43-3c8702b936ca', // Старший супервайзер поддержки пользователей
    ],
    helpdeskFeatures: {
        selfAssign: 'hd.selfAssign',
        clearAssign: 'hd.clearAssign',
        addTags: 'hd.addTags',
        quickButton: 'hd.quickButton',
        negativeUsersLink: 'hd.negativeUsersLink',
        parseItemIds: {
            get: 'hd.parseItemIds.get',
            checkUser: 'hd.parseItemIds.checkUser',
        },
        parseIps: {
            link: 'hd.parseIps.link',
            allow: 'hd.parseIps.allow',
            copy: 'hd.parseIps.copy',
            info: 'hd.parseIps.info',
        },
        createTicket: {
            helpdesk: 'hd.createTicket.helpdesk',
            user: 'hd.createTicket.user',
        },
        claimReevaluation: 'hd.claimReevaluation',
        help: 'hd.help',
        checkVas: 'hd.checkVas',
        comparison: {
            item: 'hd.comparison.item',
            user: 'hd.comparison.user',
        },
        unblockUser: 'hd.unblockUser',
        commentUser: 'hd.commentUser',
        rightPanel: {
            userLink: 'hd.rightPanel.userLink',
            messengerLink: 'hd.rightPanel.messengerLink',
            itemsLoginLink: 'hd.rightPanel.itemsLoginLink',
            itemsEmailLink: 'hd.rightPanel.itemsEmailLink',
            copyEmailFull: 'hd.rightPanel.copyEmailFull',
            copyEmailAnswer: 'hd.rightPanel.copyEmailAnswer',
            emailHistory: 'hd.rightPanel.emailHistory',
            unblockUser: 'hd.rightPanel.unblockUser',
            subscriptionCreate: 'hd.rightPanel.subscriptionCreate',
            checkVas: 'hd.rightPanel.checkVas',
            ipHistory: 'hd.rightPanel.ipHistory',
            changeType: 'hd.rightPanel.changeType',
            phoneLink: 'hd.rightPanel.phoneLink',
            phoneUnverify: 'hd.rightPanel.phoneUnverify',
            commentUser: 'hd.rightPanel.commentUser',
            comparison: {
                item: 'hd.rightPanel.comparison.item',
                user: 'hd.rightPanel.comparison.user',
            },
        },
    },
};

$(function () {
    global.currentUrl = location.href;

    chrome.storage.local.get(result => {
        global.connectInfo = result.connectInfo;
        global.authorities = result.authorities;
        global.userInfo = result.connectInfo.spring_user.principal;

        if (result.script && global.currentUrl.includes(global.connectInfo.adm_url)) {
            startNotification(result.notifications);

            holidays();

            handleRoles();
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
