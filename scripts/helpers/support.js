var existGlobal;
var settingsGlobal = {}; // настройки (теги, проблемы в HD)
var attendantTLGlobalInfo = {}; // дежурный тимлид
var allUsersGlobalInfo = []; // инфомрация о всех юзерах

// индикатор премиум юзеров
var allowedPremiumUsersSubd = [
    31, // "Поддержка профессиональных пользователей";"Владимир Туравинин"
    49, // "Поддержка профессиональных инструментов";"Сергей Кацимон"
    48, // "Руководитель группы поддержки профессиональных пользователей";"Роман Вислобоков"
    43, // "Руководитель отдела";"Ираида Мамедова"
    30, // "Script Developer";"Илья Гук"
    44, // "Интерн служба поддержки";"Виталий Орловский"
];

// индиктор расширение
let allowedExtensionIndSubd = [
    31, // Поддержка профессиональных пользователей
    41, // Руководитель группы службы поддержки
    48, // Руководитель группы поддержки профессиональных пользователей
    49, // Поддержка профессиональных инструментов
    30, // Developer
    43, // Руководитель отдела
];
let extensionIndGroupOne = [12591163, 8900484, 6379167, 75150371, 768066, 109733374, 103714434, 106576859, 115518792, 101412132, 7931919, 2491274, 82255439, 7883111, 1656352, 119441424, 12369650, 7869069, 4464879, 117994560, 115711392, 31863661, 114368688, 114619984, 23810607, 108209879, 70556421, 110062708, 74799352, 26553070, 118936169, 118347898, 113206499, 32109864, 28885804, 26902429, 7597432, 38595336, 7821674, 1373738, 113143824, 6550680, 11329461, 77220776, 4668826, 101930828, 578758, 97034106, 22101399, 13031821, 94286614, 109714743, 86800209, 111402310, 109327692, 118872960, 9243546, 13628215, 90932799, 18960097, 12723353, 1235620, 66381073, 101599967, 92353789, 12762914, 70932004, 29835771, 6600824, 93401974, 98365535, 107449496, 82567278, 7930380, 102442225, 5721718, 29764875, 81485669, 794595, 79617369, 93338086, 77167531, 69461576, 117488627, 35965692, 71775235, 78687984, 112048945, 107456880, 21484922, 104007393, 20578860, 6717821, 4439730, 75669474, 12536287, 118389305, 6003949, 117182444, 66535246, 86900824, 13638500, 119258701, 77661524, 69288777, 103782641, 102933248, 119213500, 77871433, 20937771, 3274130, 29750792, 88080796, 37952281, 68243185, 85432359, 69154012, 6608929, 104265812, 116786032, 419524, 100222655, 97189923, 111344085, 110745812, 95801865, 66189076, 48508207, 102433626, 3822756, 90484100, 83371496, 6254985, 114103046, 1563923, 62120722, 82319892, 89274625, 75177009, 37591371, 115094642, 88707037, 90047359, 18477258, 90491961, 89700013, 104333616, 2428664, 70556994, 40969188, 2196305, 533083, 110747557, 107161501, 84297503, 38819672, 68483184, 118953108, 18467529, 101683110, 84600238, 11065375, 93539029, 44053893, 116205744, 118170913, 118989658, 4195219, 29674952, 82317968, 49710414, 83201573, 1830169, 86538468, 119152850, 111279105, 20281510, 461521, 112504366, 119541916, 72257193, 38849009, 12793325, 14145077, 35506132, 935424, 83208445, 19934198, 3863069, 44461217, 115784022, 73320619, 1709964, 38411102, 113518963, 36250990, 24864890, 11412267, 25606068, 76114896, 118574478, 114984799, 78860995, 102846229, 31661141, 80722375, 41441147, 109318589, 82392827, 117770393, 18136384, 78346399, 93106019, 114835844, 98855313, 110230426, 44564512, 74126624, 73088444, 2001065, 396196, 12435340, 3166122, 73816148, 119278164, 34149215, 1126824, 476098, 3818448, 3610603, 19926505, 21990344, 32949485, 109517042, 86760924, 19439518, 117612987, 84055035, 43312991, 5127366, 20953068, 83431796, 1248275, 23848973, 14107713, 2686175, 101274995, 117266598, 75398954, 19346212, 4318907, 108843784, 96417095, 6111659, 4289533, 74897635, 77076340, 105909232, 73636384, 20708373, 4727085, 12680967, 114318092, 4861082, 107635178, 112178406, 84685770, 72188211, 3581580, 17685940, 113592769, 6179657, 91795207, 68992152, 212948, 3388357, 8815489, 23327552, 9161765, 6354205, 78521544, 112975953, 23610342, 17511589, 7261079, 91876400, 23273671, 2125096, 19178432, 1531628, 70328614, 34439021, 20151662, 10236090, 98975536, 30396356, 111308926, 92795149, 111308872, 36768040, 111308782, 50849736, 89763847, 94030570, 48699404, 79446670, 95460296, 76672596, 48449148, 39183553, 33042629, 93119536, 6208967, 7943794, 53845736, 116378981, 80325921, 73385528, 107408488, 119282378, 102869622, 102999857, 113083126, 45347622, 8022920, 3659871, 27257503, 106905752, 111389263, 209248, 100708099, 74796944, 111247295, 12983787, 18255228, 108255188, 1109236, 97395501, 87959179, 621063, 7903210, 43566631, 108646491, 29836772, 117063681, 101117123, 1448556, 90941667, 19509193, 7389606, 21749527, 103006554, 89997272, 3387221, 112916811, 109074515, 8263910, 95291405, 3018026, 54743397, 112019754, 5016764, 65912318, 116858662, 113273103, 77795199, 37140031, 45407063, 87578528, 93171889, 98297443, 82297998, 97334680, 86491273, 94235521, 38595698, 24413243, 114406532, 71014073, 107884549, 105305379, 9210587, 6360739, 96656030, 5167483, 92599916, 69061157, 79973931, 60881515, 248193, 9061715, 22580038, 70457488, 44413891, 9761341, 66952294, 44434248, 1212554, 13203430, 68232945, 69892659, 31680907, 112824393, 82652204, 109715994, 81616836, 25739925, 115292824, 33478854, 104903252, 35703383, 113992881, 11114856, 9593470, 2594914, 3503482, 75680172, 31696887, 111163997, 71736426, 28122632, 19139601, 84441487, 109242480, 103376982, 70207015, 4512726, 104862913, 21433523, 96526367, 104473897, 38928055, 103278043, 114085415, 112837724, 91399452, 16031689, 29703503, 95864003, 47197302, 104461694, 104337372, 88962142, 104844548, 104451785, 35441698, 12998202, 78924487, 43864874, 77542798, 78926036, 23896504, 92829815, 24970561, 102999398, 7952601, 71437673, 76575317, 21919066, 103360091, 34732496, 105776994, 23866845];
let extensionIndGroupTwo = [2113572, 111622423, 234647, 15663, 105035257, 1037422, 33182220, 77026159, 72183252, 108627512, 97822332, 115405921, 73375071, 6072221, 10274858, 72787656, 12127632, 46859665, 105924457, 93913718, 34694100, 31073921, 46278328, 2567155, 118954909, 118486197, 118261824, 75201731, 79795337, 116467060, 109329869, 71657850, 3041603, 73644879, 39185951, 18996870, 71446255, 2308634, 88373499, 3072784, 35895911, 82348221, 109730985, 53038855, 11426718, 28706228, 1273000, 5841855, 46715259, 2696444, 100070944, 116606743, 85753320, 1590305, 106839199, 118725286, 2559317, 2149054, 74771800, 24218414, 106366897, 2054164, 2094034, 9358060, 65490934, 41081366, 112322689, 100538634, 21403911, 89196184, 109034, 13937192, 14208710, 97774717, 71104270, 46320712, 116879056, 3138857, 4636817, 111035165, 98800627, 81572789, 114534686, 25482790, 115785023, 12016288, 31735409, 83383233, 19588848, 26254850, 109334709, 20736902, 1139933, 91941566, 35371562, 85401177, 52440208, 19117022, 5188, 106776555, 54084887, 68759830, 70470331, 86970527, 86078558, 2867158, 28934738, 12371405, 34076908, 76276526, 111160979, 86693836, 101079404, 6463585, 2335617, 113514595, 118506398, 115699928, 82350946, 74636354, 106597120, 20380385, 33905537, 68351827, 20528151, 89571974, 21530772, 88254342, 1185837, 22476244, 110846, 27384008, 21579660, 2260967, 10441928, 76248291, 118585464, 70652824, 108139378, 76939440, 72983584, 36195512, 99214710, 89712828, 78043311, 1285099, 33599112, 116902662, 26787992, 26320139, 112754501, 106636185, 83123752, 112314212, 116694505, 69349374, 96575051, 113602373, 94377337, 5026693, 68728423, 21401738, 53287185, 115368110, 7346518, 117477550, 75154313, 111070745, 113735110, 88480500, 71754105, 122122, 28042757, 10132008, 20511543, 84660907, 72305862, 69940536, 114988449, 76736838, 72419971, 46327505, 2875495, 22519430, 26002388, 111519207, 29092359, 5419361, 3098767, 69688185, 899469, 96833030, 7048783, 16719316, 39774831, 46185703, 113267286, 60162448, 29158781, 93914314, 7449504, 103694588, 107227418, 105278630, 28599456, 13381775, 17624710, 99575056, 116828319, 101764962, 94538386, 70092739, 35124758, 5637520, 12923275, 22005421, 27038762, 115507483, 94102509, 113183663, 21114262, 34928112, 113730871, 30077391, 9249902, 33266918, 23167773, 76041750, 29644624, 113401810, 35515085, 29677001, 75920675, 83255141, 118654909, 35859383, 7471862, 96524610, 66420613, 113616218, 22013604, 75948317, 78110523, 14303372, 114848018, 34810264, 79171490, 1284159, 78303689, 6751315, 12131432, 21135286, 109125315, 115251491, 2248596, 87348718, 84060779, 11683607, 81796935, 76038760, 26641005, 27802621, 115458483, 82149089, 78959996, 37577828, 73691858, 109132304, 22318036, 111308417, 31922635, 115374198, 7865051, 102778649, 78955465, 67989106, 8116915, 10463501, 44078740, 617462, 61787025, 86078870, 77003647, 86446236, 37298546, 68617065, 94975965, 74379352, 1757051, 34115788, 20763699, 111602799, 26178292, 80842325, 86803730, 2581876, 53070387, 14354859, 111308696, 13917467, 76816849, 70012115, 68348315, 111532081, 105989302, 90854870, 12340891, 102808099, 83921741, 92913715, 13999734, 35508007, 88731265, 51126330, 8572642, 116289086, 114526628, 116171880, 4582945, 1359555, 107375055, 76561267, 15189872, 2289174, 12435516, 106924206, 93392618, 100714178, 103150315, 109612615, 19531044, 112734730, 20024873, 25286800, 9969510, 4528949, 102330058, 63826547, 89671565, 6868874, 22411429, 110703725, 73732995, 4356459, 34141693, 110151663, 8011904, 8142730, 77554872, 1523043, 116818588, 28935423, 5035240, 2044774, 28200890, 115765710, 6457586, 56202529, 12023573, 84612930, 968500, 110054986, 118056890, 5012554, 2385427, 26878848, 108209070, 21096694, 7474039, 29782627, 106362641, 9638403, 95045698, 11822931, 109798911, 25861044, 2035353, 71211324, 76509824, 6947880, 75953439, 41580860, 51122822, 45223478, 98793263, 854288, 9032887, 22860730, 4859925, 1518579, 80544721, 46225686, 33516229, 8151044, 87254145, 3414238, 12109466, 7876093, 359118, 80358875, 8565834, 22157752, 74069796, 29332045, 28151483, 556023, 3032144, 73345372, 40596720, 61745601, 6090688, 81772558, 69232524, 60526819, 24997588, 4428929, 74561257, 1314639, 37009026, 114876511, 95176450, 100318401, 87494741, 73264760, 82749242, 7961089, 42879542, 93599899, 9509009, 103268174, 20852252, 44666533, 110156454, 105081529, 108255379, 8700011, 5517852, 40670990, 7420660, 85956541, 106488413, 30218343, 2014667, 75718924, 90641508, 78302252, 20338792, 28888142, 86945022, 27355184, 23558959, 9982886, 39387136, 8467872, 71013783, 1574063, 19363327, 5605991, 6420177, 9141007, 103349359, 8820966, 75350931, 75585206];

function startSupport() {
    console.log('support script start');

    // отлавливает изменения на странице
    chrome.runtime.onMessage.addListener(function (request, sender, callback) {
        //console.log(request.onUpdated);
        if (request.onUpdated === 'ticketUser')
            setTimeout(addShElementsUser, 100);

        if (request.onUpdated === 'ticketInfo')
            setTimeout(addShElementsInfo, 100);

        if (request.onUpdated === 'ticketQueue')
            setTimeout(addShElementsQueue, 100);

        if (request.onUpdated === 'ticketEnter') {
            setTimeout(skipersMonitoring, 100);
        }

        if (request.onUpdated === 'ticketOnHold') {
            onHoldListener();
        }
        if (request.onUpdated === 'ticketComment') {
            сommentListener();
        }

        if (request.onUpdated === 'ticketTake') {
            takeListener();
        }

        if (request.onUpdated === 'ticketComments') {
            setTimeout(ticketCommentsListener, 100);
        }
    });

    // запуск скриптов при загрузке DOM
    $(document).ready(function () {
        var adm_username = $('.dropdown:contains(Выход) a').text().split(' ');
        localStorage.agentLogin = adm_username[1];
        
//        console.log(userGlobalInfo);
        // Особый интерфейс и поздравления с праздниками
        holidays();

        $('.dropdown-menu:contains(Выход) li').before(''+
        '<li>'+
            '<a href="http://avitoadm.ru/journal/tasklog_show.html" target = "_blank">'+
            'Task Log</a>'+
        '</li>'+
        '<li class="divider" role="separator">'+
        '</li>');

        getHelpdeskProblems(); // записываем в глобальную JSON строку проблем HD

        // закрытие попапа по клику на слой
        $('body').append('<div id="layer-blackout-popup"></div>');
        $('#layer-blackout-popup').click(function (e) {
            if (!$('div.ah-default-popup').is(e.target)
                    && $('div.ah-default-popup').has(e.target).length === 0) {
                $('#layer-blackout-popup').removeClass('ah-layer-flex');
                $('div.ah-default-popup').hide();
                closeModal();
            }
        });

        // загрузка
        $('body').append(''+
        '<div id="sh-loading-layer">'+
            '<div class="sh-cssload-container">'+
                '<div class="sh-cssload-whirlpool"></div>'+
            '</div>'+
        '</div>');

        $('body').append('<div id="layer-blackout-modal"></div>');

        var currentUrl = window.location.href;
        if (~currentUrl.indexOf('https://adm.avito.ru/helpdesk')) {
            // иконка во вкладке
            let iconLink = $('head').find('[rel="shortcut icon"]');
            $(iconLink).attr('href', 'https://43.img.avito.st/640x480/2839321043.jpg');

            findAgentID(); // ID агента

            getTagsInfo(); // получаем инф-ию о тегах

            getAllUsers(); // инфа обо всех пользователях

            renderCreateNewTicketWindow('/helpdesk/details'); // отрисовка окна создания тикета
        }

        // User info
        var shortUserLinkReg = /https\:\/\/adm\.avito\.ru\/\d+u(?!\/)\b/i;
        if (~currentUrl.indexOf('https://adm.avito.ru/users/user/info/') 
                || shortUserLinkReg.test(currentUrl)
                || ~currentUrl.indexOf('https://adm.avito.ru/adm/users/user/info/')) {

            // попап с затемнением
            $('body').append('<div id="sh-popup-layer-blackout-btn"></div>');

            // сопоставления логинов с категорией
            adminTableCategory();
            // Кликабельные ссылки
            linksOnComments('td.is-break', currentUrl);
            // проверка учетных записей
            userChekDoubles();
            // изменение е-майла для взломов
            userChangeEmail();

            // индикаторы
            showUserInfoIndicators(['inn', 'pro', 'auto', 'shop', 
                'subscription', 'persManager']);

            addPremiumUsersIndicator();

            if (~allowedExtensionIndSubd.indexOf(+userGlobalInfo.subdivision_id)) {
                addExtensionIndicator();
            }

            alternatePhoneSearch();

            copyDataToClipboard(['url', 'e-mail', 'phones']);

            addUnverifyPhonesButtons(); // отвязка номеров с комментами

            // линк на Phones verification +++
            var n = $('button[data-verify-text="Верифицировать"]').length;

            for (var i = 0; i < n; i++) {
                var phone_number = $('button[data-verify-text="Верифицировать"]').slice(i, i + 1).attr("data-phone");

                $('button[data-verify-text="Верифицировать"]').slice(i, i + 1).after('\t<a href="https://adm.avito.ru/users/phones_verification?phone=' + phone_number + '" target="_blank" style="margin: 0 4px;">Log</a>');
            }
            // линк на Phones verification ---

            // линк на Мессенджер
            messengerLinkOnUser();

            renderCreateNewTicketWindow('/users/user/info'); // отрисовка окна создания тикета

            addCreateTicketBtn('/users/user/info');

            // переход в HD
            linkToHDOnUser();

            showCountryIP();

            // logUnferifiedPhone(); // логирование отвязанных номеров

            addIPSystemAccessLink(); // ссылки на system/access рядом с IP
        }

        // Item info
        var shortItemLinkReg = /https\:\/\/adm\.avito\.ru\/\d+(?!\/)\b/i;
        if (~currentUrl.indexOf('https://adm.avito.ru/items/item/info/')
            || shortItemLinkReg.test(currentUrl)
            || ~currentUrl.indexOf('https://adm.avito.ru/adm/items/item/info/')) {
            if (!localStorage.allowList) localStorage.allowList = '';

            // Кликабельные ссылки
            linksOnComments('td.is-break', currentUrl);

            // сопоставления логинов с категорией
            adminTableCategory();

            // убирает кнопку блока юзеров из объявления
            hideBlockUserButton();

            // добавление элеммента в список для активации
            if (userGlobalInfo.subdivision === 'S1' || userGlobalInfo.subdivision === 'SA' || userGlobalInfo.subdivision === 'SD' || userGlobalInfo.subdivision === 'TL' || userGlobalInfo.subdivision === 'SO' || userGlobalInfo.subdivision === 'IN')
                allowlist(currentUrl, userGlobalInfo.username);
            if (userGlobalInfo.subdivision === 'S2' || userGlobalInfo.subdivision === 'SD' || userGlobalInfo.subdivision === 'TL' || userGlobalInfo.subdivision === 'SO')
                allowListMSG(currentUrl, userGlobalInfo.username);

            // Одобрить объявление
            if (userGlobalInfo.subdivision === 'S1'
                || userGlobalInfo.subdivision === 'TL'
                || userGlobalInfo.subdivision === 'SD'
                || userGlobalInfo.subdivision === 'SA')
                allowItem();
        }

        // Items search
        if (currentUrl.indexOf('https://adm.avito.ru/items/search') + 1 
                || currentUrl.indexOf('https://adm.avito.ru/adm/items/search') + 1) {
            // ip для каждого объявления
            postIP();
            
            // User and Abuses for post
            userInfoForPost();

            // убирает кнопку блока юзеров
            hideBlockUserButton();

            // Обработка клика рядом с checkbox
            chooseItem();
        }

        // Account info
        if (currentUrl.indexOf('https://adm.avito.ru/adm/users/account/info/') + 1 
                || currentUrl.indexOf('https://adm.avito.ru/users/account/info/') + 1) {
            // добавление кнопок подсчета в Account info
            countMoneyAccount();

            // статус объявления и причина блокировки
            statusItem();

            addCompensationBtns();
            // добавление кликабельных ссылок в Account info
            var userID = currentUrl.split('/');
            linksOnComments('td.is-break', userID[6]);

            // дополнения к операциям резервирования
            reservedOperation('/users/account/info');
        }

        // walletlog
        if (currentUrl.indexOf('https://adm.avito.ru/adm/billing/walletlog') + 1 
                || currentUrl.indexOf('https://adm.avito.ru/billing/walletlog') + 1) {
            // дополнения к операциям резервирования
            reservedOperation('/billing/walletlog');

            addShowItemStatusBtn();

            countMoneyWalletlog();
        }

        // users/search
        if (currentUrl.indexOf('https://adm.avito.ru/users/search') + 1 
                || currentUrl.indexOf('https://adm.avito.ru/adm/users/search') + 1) {
            // где верифицирован номер 
            findWherePhoneVerified();
            // копирование телефона в буфер в формате, как на странице юзера
            copyPhoneToClipboard();
        }

        // /system/access
        var anotherAccessLinksReg = /(\/add)|(\/edit)|(\/\d+$)/i;
        if (!anotherAccessLinksReg.test(currentUrl) &&
                (~currentUrl.indexOf('https://adm.avito.ru/system/access') ||
                        ~currentUrl.indexOf('https://adm.avito.ru/adm/system/access'))
                ) {

            sanctionIPSystemAccess(); // одобрение IP в аксессе
        }

        // /items/comparison
        if (~currentUrl.indexOf('https://adm.avito.ru/items/comparison/')) {
            copyItemIdsComparisonPage();

            linksOnComments('.row-user-block:last table td', currentUrl);
        }

        // главная
        var mainPageReg = /adm\.avito\.ru\/$/i;
        if (mainPageReg.test(currentUrl)) {
            var formBlock = $('form[action="/users/search"]');

            $(formBlock).after(''+
            '<div class="form-group '+
                'search-user-by-social-wrapper" style="" id="search-user-by-social-form">'+
                '<input type="text" class="form-control" name="socialId" placeholder="ID '+
                'социальной сети">'+
                '<button class="btn btn-primary social-search-btn" type="button"'+
                'style="margin-top: 15px;" id="search-by-social-btn">'+
                '<i aria-hidden="true" class="glyphicon  glyphicon-search"></i>'+
                'Найти</button>'+
            '</div>');

            var searchBtn = $('#search-by-social-btn');
            $(searchBtn).unbind('click').click(function () {
                searchBySocialBtnHandler($(this));
            });
        }
    });
}

function addShElementsInfo() {
    // инпут для смены ассигни - всегда удаляем при обновлении тикета
    $('#sh-extra-assigneeId').remove();

    // добавление тегов
    addTags();
    // быстрые кнопки
    addQuickButtons();

    // фиксированный контейнер (настройки, кнопка наверх)
    addFixedTools($('div.col-xs-3:eq(1)'), ['hd-settings', 'scroll-top']);

    //---------- создание гиперссылок ----------//
    // айпи в техинфе
    createHyperLinksIpInTechInfo();
    //++++++++++ создание гиперссылок ++++++++++//

    // альтернативный поиск в переписке
    setAlternateSearchInTicketCorresp();

    // смена ассигни
    changeAssignee();

    // очистка цитат
    blockquoteClear();

    // показывать скрывать цитаты
    blockquoteHide();

    // инфа об агента
    showAgentInfoTicket();

    // кнопка создания тикета
    addCreateTicketBtn('/helpdesk/details');

    // предлагаем простановку инфо тегов после сабмита тикета
    suggestInfoTagsAfterTicketSubmit();

    addTicketControlTools(); // операции с тикетом (дежурный тим, классификация)

    // элементы в тайтле тикета
    addElementsTicketTitle();


    var desciption = $('.helpdesk-details-panel .helpdesk-html-view.helpdesk-ticket-paragraph:not(.hidden), .helpdesk-details-panel .helpdesk-html-view:not(.hidden):last');
    var className = 'sh-matched-ip-description';
    parseIPInDetailsPanel(desciption, className); // парсинг IP в описании тикета

    sanctionIPTechInfo(); // одобрение IP в техинфо
    
    addSearchUserBySocialBlock(); // поиск юзера по айди в соцсети

    copyCurrentTicketLink(); // копирование ссылки на тикет
}

function addShElementsUser() {
    // console.log('addShElementsUser func');
    // Рядом с Blocked - причина блокировки в HD
    showReasonBlockedUser();

    // меняем уже присутствующие ссылки
    changeAllHDLinks();

    // Гиперссылки в правом сайдбаре на комментах к УЗ
    var userId = $('a[href *= "/users/search?user_id="]').text();
    linksOnComments('.helpdesk-additional-info-comment-text', userId);

    // простановка коммента на УЗ из HD
    addCommentOnUserFromTicket();

    // разблокировка юзера из HD + коммент
    unblockUserHD();

    // предполагаемая УЗ
    infoAboutUser();

    addMessengerLinkInTicket(); // линк на мессенджер

    addCopyUserMailInTicket(); // копирование мыла юзера в буфер
}

function addShElementsQueue() {
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

// онхолд
function onHoldListener() {
    // дежурный тимлид ---
    var btn = $('#sh-attendant-tl-btn');
    if ($(btn).hasClass('sh-active-btn')) {
        $('#sh-loading-layer').show();

        setTimeout(function () {
            checkAdmUserIdAttendantTL();
        }, 100);
    }
    // дежурный тимлид +++
}

// коммент
function сommentListener() {
    // дежурный тимлид ---
    var btn = $('#sh-attendant-tl-btn');

    // проверка на статус тикета - только для онхолдов
    var statusText = getTicketStatusText();
    if (statusText === 'на удержании') {
        if ($(btn).hasClass('sh-active-btn')) {
            $('#sh-loading-layer').show();

            setTimeout(function () {
                checkAdmUserIdAttendantTL();
            }, 100);
        }
    }
    // дежурный тимлид +++
}

function takeListener() {
    // окно характиристики юзера
    var ticketStatus = getTicketStatusText();
    if (ticketStatus === 'новое')
        showUserCharacteristicsPopup();

}

function ticketCommentsListener() {
    // парсинг айди айтемов в комменте
    parseItemIdsInTicket();

    var comments = $('.helpdesk-details-panel .helpdesk-html-view:not(.hidden, :last)');
    var className = 'sh-matched-ip-comment';
    parseIPInDetailsPanel(comments, className); // парсинг IP в комментах тикета
}