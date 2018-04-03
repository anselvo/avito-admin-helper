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
        detectives_queue_search_call: /https:\/\/adm\.avito\.ru\/(?:adm\/)?detectives\/queue\/search\/call/,
        messenger_user: /https:\/\/adm\.avito\.ru\/(?:adm\/)?messenger\/user/
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
    ledItem: [
        { flagName: "Вид объявления", button: { reason: 715, value: "ItemType", action: "reject" } },
        { flagName: "Нет фото с ID", button: { reason: 774, value: "NoPhotoID", action: "reject" } }
    ],
    compareDropdownItemBlock: [
        { id: 384, text: "Неактуальное предложение" },
        { id: 20, text: "Повторная подача объявления" }
    ],
    compareDropdownItemReject: [
        { id: 15, text: "Несоответствующее фото" },
        { id: 178, text: "Неправильная категория" }
    ]
};

$(function () {
    global.currentUrl = location.href;

    chrome.storage.local.get(result => {
            global.connectInfo = result.connectInfo;
            global.authorities = result.authorities;
            global.userInfo = result.connectInfo.spring_user.principal;


        if (result.script) {
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
