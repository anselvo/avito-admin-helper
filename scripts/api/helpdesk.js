// айди текущего тикета по текущему урлу
function getCurrentTicketId(currentUrl) {
    var tmp = currentUrl.split('/details/')[1];
    var ticketId = tmp.split('?')[0];
    return ticketId;
}

function getCurrentTicketLink() {
    return window.location.href.split('?')[0];
}

// обновление фронта в HD (имитация кликов)
function helpDeskClickImitation() {
    var currentYOffset = window.pageYOffset;

    let allPanelHeaders = [].filter.call(document.querySelectorAll('h4'), item => ~item.className.indexOf(`details-left-panel-title`));
    let classifHeader = [].find.call(allPanelHeaders, singleItem => singleItem.firstChild.data === 'Классификация');
    let allLabels = $(classifHeader).next().find('tr td:first-child');
    let tagLabel = [].find.call(allLabels, singleItem => singleItem.firstChild.data === 'Теги');
    let tagParent = tagLabel.parentNode;
    tagParent.querySelector('.pseudo-link').click();

    var newInput;
    setTimeout(() => {
        var existingTags = tagParent.querySelectorAll('[name*=tag]');
        newInput = document.createElement('input');
        newInput.name = `tags[${existingTags.length}]`;
        newInput.type = 'text';
        existingTags[0].parentNode.appendChild(newInput);
        document.querySelector('.helpdesk-click-fog').click();
        window.scrollTo(0, currentYOffset);
        $('#sh-loading-layer').hide();
    }, 10);
}

// получение статуса тикета
function getTicketStatusText() {
    var ticketHeader = $('.hd-ticket-header-metadata:eq(0)');
    var statusBlock = $(ticketHeader).find('.label:eq(0)');
    if ($(statusBlock).hasClass('dropdown')) {
        var statusText = $(statusBlock).find('div:eq(0)').text().toLowerCase();
    } else {
        var statusText = $(statusBlock).text().toLowerCase();
    }
    statusText = statusText.replace(/(^\ |\ $)/g, '');

    return statusText;
}

function addExtraAssigneeId(agentId) {
    var allPanelHeaders = [].filter.call(document.querySelectorAll('h4'), item => ~item.className.indexOf(`details-left-panel-title`));
    var classifBlock = [].find.call(allPanelHeaders, singleItem => singleItem.innerText === 'Классификация');
    var classifFrom = classifBlock.nextSibling;

    var additionalInput = document.createElement('input');
    additionalInput.name = 'assigneeId';
    additionalInput.type = 'hidden';
    additionalInput.value = agentId;
    additionalInput.id = 'sh-extra-assigneeId';

    classifFrom.appendChild(additionalInput);
}

//---------- Записываем в глобальную JSON строку всех проблем HD ----------//
function getHelpdeskProblems() {
    settingsGlobal.helpdeskProblemsJSON = '[{"id":2,"parentId":1,"name":"Регистрация учетной записи","additions":null,"info":null},{"id":3,"parentId":1,"name":"Настройки Личного кабинета","additions":null,"info":null},{"id":4,"parentId":1,"name":"Восстановление пароля","additions":null,"info":null},{"id":5,"parentId":1,"name":"Удаление учетной записи","additions":null,"info":null},{"id":6,"parentId":1,"name":"Другие вопросы и консультации","additions":null,"info":null},{"id":8,"parentId":7,"name":"Подача нового объявления","additions":null,"info":null},{"id":9,"parentId":7,"name":"Редактирование объявления","additions":null,"info":null},{"id":10,"parentId":7,"name":"Активация объявления","additions":null,"info":null},{"id":11,"parentId":7,"name":"Снятие объявления с публикации","additions":null,"info":null},{"id":12,"parentId":7,"name":"Другие вопросы и консультации","additions":null,"info":null},{"id":14,"parentId":13,"name":"Заблокированное объявление","additions":null,"info":[{"id":1,"name":"Номер объявления","systemName":"itemId"}]},{"id":15,"parentId":13,"name":"Заблокированная учетная запись","additions":null,"info":null},{"id":16,"parentId":13,"name":"Отклоненное объявление","additions":null,"info":null},{"id":18,"parentId":17,"name":"Прием СМС или звонка","additions":null,"info":null},{"id":19,"parentId":17,"name":"Отвязка номера от учетной записи","additions":null,"info":null},{"id":20,"parentId":17,"name":"Технические проблемы","additions":null,"info":null},{"id":21,"parentId":17,"name":"Другие вопросы","additions":null,"info":null},{"id":23,"parentId":22,"name":"Не вижу свое оплаченное объявление","additions":[{"name":"Тематика","items":[{"id":2,"name":"Премиум размещение"},{"id":3,"name":"VIP-объявление"},{"id":4,"name":"Поднять объявление в поиске"},{"id":5,"name":"Выделить объявление"},{"id":6,"name":"Пакет «Турбо продажа»"},{"id":7,"name":"Пакет «Быстрая продажа»"},{"id":8,"name":"Плата за размещение"}]},{"name":"Способ оплаты","items":[{"id":10,"name":"SMS"},{"id":11,"name":"Пластиковая карта"},{"id":12,"name":"QIWI Кошелек"},{"id":13,"name":"QIWI Терминал"},{"id":14,"name":"Евросеть/Связной"},{"id":15,"name":"Яндекс Деньги"},{"id":16,"name":"WebMoney"},{"id":17,"name":"Безналичный платёж"},{"id":18,"name":"Авито Кошелек"},{"id":19,"name":"Сбербанк Онлайн"}]}],"info":[{"id":1,"name":"Номер объявления","systemName":"itemId"}]},{"id":24,"parentId":22,"name":"Оплата и применение дополнительных услуг","additions":[{"name":"Тематика","items":[{"id":2,"name":"Премиум размещение"},{"id":3,"name":"VIP-объявление"},{"id":4,"name":"Поднять объявление в поиске"},{"id":5,"name":"Выделить объявление"},{"id":6,"name":"Пакет «Турбо продажа»"},{"id":7,"name":"Пакет «Быстрая продажа»"},{"id":8,"name":"Плата за размещение"}]},{"name":"Способ оплаты","items":[{"id":10,"name":"SMS"},{"id":11,"name":"Пластиковая карта"},{"id":12,"name":"QIWI Кошелек"},{"id":13,"name":"QIWI Терминал"},{"id":14,"name":"Евросеть/Связной"},{"id":15,"name":"Яндекс Деньги"},{"id":16,"name":"WebMoney"},{"id":17,"name":"Безналичный платёж"},{"id":18,"name":"Авито Кошелек"},{"id":19,"name":"Сбербанк Онлайн"}]}],"info":null},{"id":25,"parentId":22,"name":"Пополнение Кошелька Avito","additions":[{"name":"Способ оплаты","items":[{"id":10,"name":"SMS"},{"id":11,"name":"Пластиковая карта"},{"id":12,"name":"QIWI Кошелек"},{"id":13,"name":"QIWI Терминал"},{"id":14,"name":"Евросеть/Связной"},{"id":15,"name":"Яндекс Деньги"},{"id":16,"name":"WebMoney"},{"id":17,"name":"Безналичный платёж"},{"id":18,"name":"Авито Кошелек"},{"id":19,"name":"Сбербанк Онлайн"}]}],"info":null},{"id":26,"parentId":22,"name":"Другие вопросы и консультации","additions":[{"name":"Тематика","items":[{"id":2,"name":"Премиум размещение"},{"id":3,"name":"VIP-объявление"},{"id":4,"name":"Поднять объявление в поиске"},{"id":5,"name":"Выделить объявление"},{"id":6,"name":"Пакет «Турбо продажа»"},{"id":7,"name":"Пакет «Быстрая продажа»"},{"id":8,"name":"Плата за размещение"}]},{"name":"Способ оплаты","items":[{"id":10,"name":"SMS"},{"id":11,"name":"Пластиковая карта"},{"id":12,"name":"QIWI Кошелек"},{"id":13,"name":"QIWI Терминал"},{"id":14,"name":"Евросеть/Связной"},{"id":15,"name":"Яндекс Деньги"},{"id":16,"name":"WebMoney"},{"id":17,"name":"Безналичный платёж"},{"id":18,"name":"Авито Кошелек"},{"id":19,"name":"Сбербанк Онлайн"}]}],"info":null},{"id":28,"parentId":27,"name":"Блокировка или отклонение размещенного объявления","additions":null,"info":null},{"id":29,"parentId":27,"name":"Пакеты размещений","additions":null,"info":null},{"id":30,"parentId":27,"name":"Разовое размещение","additions":null,"info":null},{"id":31,"parentId":27,"name":"Лимит бесплатных размещений","additions":null,"info":null},{"id":32,"parentId":27,"name":"Другие вопросы и консультации","additions":null,"info":null},{"id":34,"parentId":33,"name":"Проблемы с доступом к сайту","additions":null,"info":null},{"id":35,"parentId":33,"name":"Проблемы со входом в Личный кабинет","additions":null,"info":null},{"id":36,"parentId":33,"name":"Проблемы при подаче, активации или редактировании","additions":null,"info":null},{"id":37,"parentId":33,"name":"Проблемы при загрузке фото","additions":null,"info":null},{"id":38,"parentId":33,"name":"Ошибки отображения элементов сайта","additions":null,"info":null},{"id":39,"parentId":33,"name":"Некорректная работа поиска","additions":null,"info":null},{"id":40,"parentId":33,"name":"Проблемы с отправкой сообщений","additions":null,"info":null},{"id":41,"parentId":33,"name":"Другие технические проблемы","additions":null,"info":null},{"id":43,"parentId":42,"name":"Блокировка или отклонение объявлений","additions":null,"info":null},{"id":44,"parentId":42,"name":"Платные услуги и Кошелек Avito ","additions":null,"info":null},{"id":45,"parentId":42,"name":"Безналичные платежи","additions":null,"info":null},{"id":46,"parentId":42,"name":"Реквизиты организации","additions":null,"info":null},{"id":47,"parentId":42,"name":"Закрывающие документы","additions":null,"info":null},{"id":48,"parentId":42,"name":"Сервисы Автозагрузка, ActiAgent, ActiDealer","additions":[{"name":"Тематика","items":[{"id":47,"name":"Автозагрузка"},{"id":48,"name":"ActiDealer"},{"id":49,"name":"ActiAgent"}]}],"info":null},{"id":49,"parentId":42,"name":"Технические вопросы","additions":null,"info":null},{"id":50,"parentId":42,"name":"Другие вопросы и консультации","additions":null,"info":null},{"id":67,"parentId":42,"name":"Жалобы","additions":null,"info":null},{"id":53,"parentId":51,"name":"Avito Контекст","additions":[{"name":"Тематика в Контекст","items":[{"id":27,"name":"Создание кампании Avito Контекст"},{"id":28,"name":"Оплата компании Avito Контекст"},{"id":29,"name":"Модерация Avito Контекст"},{"id":30,"name":"Измерение результатов Avito Контекст"},{"id":31,"name":"Общие вопросы и консультации"}]}],"info":null},{"id":54,"parentId":51,"name":"Другие вопросы и консультации","additions":null,"info":null},{"id":56,"parentId":55,"name":"Обман при совершении сделки","additions":null,"info":null},{"id":57,"parentId":55,"name":"Подозрительное объявление или пользователь","additions":null,"info":null},{"id":58,"parentId":55,"name":"Мошенническое SMS, MMS или веб-сайт","additions":null,"info":null},{"id":59,"parentId":55,"name":"Мошенническое письмо","additions":null,"info":null},{"id":60,"parentId":55,"name":"Другие вопросы и консультации","additions":null,"info":null},{"id":62,"parentId":61,"name":"Приложение для iOS","additions":null,"info":null},{"id":63,"parentId":61,"name":"Приложение для Android","additions":null,"info":null},{"id":64,"parentId":61,"name":"Мобильная версия сайта","additions":null,"info":null},{"id":65,"parentId":61,"name":"Полная версия сайта с мобильного устройства","additions":null,"info":null},{"id":66,"parentId":61,"name":"Другие вопросы и консультации","additions":null,"info":null},{"id":80,"parentId":79,"name":"Вопрос по отправке заказа","additions":null,"info":null},{"id":81,"parentId":79,"name":"Вопрос по получению заказа","additions":null,"info":null},{"id":1,"parentId":null,"name":"Учетная запись и Личный кабинет","additions":null,"info":null},{"id":7,"parentId":null,"name":"Работа с объявлениями","additions":null,"info":null},{"id":13,"parentId":null,"name":"Блокировки и отклонения","additions":null,"info":null},{"id":17,"parentId":null,"name":"Подтверждение телефонных номеров","additions":null,"info":[{"id":2,"name":"Телефон","systemName":"phone"}]},{"id":22,"parentId":null,"name":"Платные услуги и сервисы","additions":null,"info":null},{"id":27,"parentId":null,"name":"Платное размещение объявлений","additions":null,"info":null},{"id":33,"parentId":null,"name":"Технические проблемы","additions":null,"info":null},{"id":42,"parentId":null,"name":"Магазины, Автозагрузка и юридические лица","additions":null,"info":null},{"id":51,"parentId":null,"name":"Рекламные сервисы (Avito Контекст)","additions":null,"info":null},{"id":55,"parentId":null,"name":"Безопасность на Avito","additions":null,"info":null},{"id":61,"parentId":null,"name":"Мобильный Avito","additions":null,"info":null},{"id":79,"parentId":null,"name":"Avito Доставка","additions":null,"info":null}]';
}
//++++++++++ Записываем в глобальную JSON строку всех проблем HD ++++++++++//

//---------- Agent ID ----------//
function findAgentID() {
    var url = "https://adm.avito.ru/helpdesk/api/1/permissions";

    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, false);
    xhr.send(null);

    var json = JSON.parse(xhr.responseText);

    localStorage.agentID = json.id;
    localStorage.agentEmail = json.email;
    localStorage.agentName = json.name;

    return json.id;
}
//+++++++++ Agent ID ++++++++++//

// информация о тегах
function getTagsInfo() {
    var data = {
        user_id: +userGlobalInfo.id
    }

    chrome.runtime.sendMessage({
        action: 'XMLHttpRequest',
        method: "POST",
        url: "http://avitoadm.ru/support_helper/other/getTags.php",
        data: "param=" + JSON.stringify(data),
    },
            function (response) {
                if (~response.indexOf('Неверный запрос') || response == 'error') {
                    // outTextFrame('Ошибка загрузки тегов.');
                    settingsGlobal.helpdeskTags = 'FatalError';
                    return;
                }
                // console.log(response);

                try {
                    var resp = JSON.parse(response);
                } catch (e) {
                    settingsGlobal.helpdeskTags = 'FatalError';
                    return;
                }

                settingsGlobal.helpdeskTags = resp;

                renderTagsPopup(); // создание попапа тегов один раз

                renderQBWindow(); // создание окна QB один раз
                updateQBInfo(); // удаляем все, что нет в наборе или удалено/деактивировано
            }
    );
}

// инфа обо всех пользователях allUsersGlobalInfo
function getAllUsers() {
    chrome.runtime.sendMessage({
        action: 'XMLHttpRequest',
        method: "GET",
        url: "http://avitoadm.ru/journal/include/php/user/getAllUsers.php",
    },
            function (response) {
                try {
                    var jsonParse = JSON.parse(response);
                } catch (e) {
                    allUsersGlobalInfo = 'FatalError';
                    showAgentInfoTicket();
                    return;
                }

                allUsersGlobalInfo = jsonParse.table;

                // первый раз запуск после загузки страницы
                showAgentInfoTicket();
                showAgentInfoQueue();
            }
    );
}

// инфа о негативных юзерах
function getNegativeUsers() {
    const lsKey = '/helpdesk/negativeUsers';
    let res = {
        isLoading: true,
        error: null
    };

    try {
        const currentLs = JSON.parse(localStorage[lsKey]);
        res.clients = currentLs.clients;
    } catch (e) {
        res.clients = null;
    }

    localStorage[lsKey] = JSON.stringify(res);

    getNegativeUsersRequest().then(
        response => {
            res.clients = response;
            return res;
        },
        error => {
            res.error = error.toString();
            return res;
        }
    ).then(
        (res) => {
            res.isLoading = false;
            localStorage[lsKey] = JSON.stringify(res);
            addNegativeUsersAbusesNotification();
        }
    );
}

//++++++++++++++ Создание обращения ++++++++++++++//
function renderCreateNewTicketWindow(route) {
    $('#layer-blackout-modal').append('<div class="ah-modal-content" data-modal-info="modal-create-new-ticket" style="top: 30px;"><div class="ah-modal-container" style=""></div></div>');

    var modal = $('#layer-blackout-modal').find('[data-modal-info="modal-create-new-ticket"]');
    var modalContainer = $(modal).find('.ah-modal-container');
    $(modalContainer).append('<div style="width: 600px;" class="ah-modal-column"></div>');
    var modalColumn = $(modalContainer).find('.ah-modal-column');

    // ХЕДЕР
    $(modalColumn).append('<div class="ah-modal-header"><span class="ah-modal-title">Новое обращение</span><button type="button" class="ah-modal-close">x</button></div>');

    // ТЕЛО
    $(modalColumn).append('<div class="ah-modal-body" style=""></div>');
    var body = $(modalColumn).find('.ah-modal-body');

    // Канал и источник
    $(body).append('<div class="ah-field-group ah-horizontal-group-united" style="padding: 0 10px 0 0; margin-bottom: 0;"><div class="ah-field-title" style="">Канал</div><div class="ah-field-horizontal ah-field-flex"><select class="ah-form-control" style="" name="create-ticket-channelId"><option value="1">Почта</option><option value="2">Форма</option><option value="3">Телефон</option><option value="4">Чат</option><option value="5" selected>Агент</option></select></div></div>');
    $(body).append('<div class="ah-field-group ah-horizontal-group-united" style="padding: 0 0 0 10px; margin-bottom: 0;"><div class="ah-field-title" style="">Источник</div><div class="ah-field-horizontal ah-field-flex"><select class="ah-form-control" style="" name="create-ticket-receivedAtEmail"><option value="support@avito.ru">support@avito.ru</option><option value="shop_support@avito.ru">shop_support@avito.ru</option><option value="android@avito.ru">android@avito.ru</option><option value="ios@avito.ru">ios@avito.ru</option><option value="supportautoload@avito.ru">supportautoload@avito.ru</option><option value="dostavkasupport@avito.ru">dostavkasupport@avito.ru</option><option value="uslugipro@avito.ru">uslugipro@avito.ru</option><option value="info@actiagent.ru">info@actiagent.ru</option><option value="info@actidealer.ru">info@actidealer.ru</option></select></div></div>');
    $(body).append('<div class="ah-clearfix" style="margin-bottom: 15px;"></div>');

    // Тема запроса
    $(body).append('<div class="ah-field-group"><div class="ah-field-title">Тема запроса</div><div class="" style=""><select class="ah-form-control" style="" name="create-ticket-theme"><option value="" hidden="">Тема запроса</option></select></div></div>');

    // Тип проблемы (вопрос)
    $(body).append('<div class="ah-field-group"><div class="ah-field-title">Тип проблемы (вопрос)</div><div class="" style=""><select class="ah-form-control" style="" name="create-ticket-problem"></select></div></div>');

    try {
        var helpdeskProblemsStr = settingsGlobal.helpdeskProblemsJSON;
    } catch (e) {
        var helpdeskProblemsStr = '[]';
    }

    var themesSelect = $(modal).find('[name="create-ticket-theme"]');
    var problemsArr = JSON.parse(helpdeskProblemsStr);
    problemsArr.forEach(function (problem) {
        if (!problem.parentId) {
            $(themesSelect).append('<option value="' + problem.id + '" style="color: #000;">' + problem.name + '</option>');
        }
    });

    var problemsSelect = $(modal).find('[name="create-ticket-problem"]');
    var selectedThemeId = +$(themesSelect).find('option:selected').val();
    problemsArr.forEach(function (problem) {
        if (problem.parentId == selectedThemeId) {
            $(problemsSelect).append('<option value="' + problem.id + '" style="color: #000;">' + problem.name + '</option>');
        }
    });

    // Инструменты
    $(body).append('<div class="ah-field-group" style="margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between;"><div class="ah-field-horizontal"><label for="create-ticket-statusId-1" class="ah-radio-inline"><input type="radio" name="create-ticket-statusId" id="create-ticket-statusId-1" value="1" checked>Новое</label><label for="create-ticket-statusId-5" class="ah-radio-inline"><input type="radio"  name="create-ticket-statusId" id="create-ticket-statusId-5" value="5">В решено</label><label for="create-ticket-statusId-3" class="ah-radio-inline"><input type="radio" name="create-ticket-statusId" id="create-ticket-statusId-3" value="3">На ожидании</label></div><div class="ah-field-horizontal" style=""><div class="ah-dropmenu-holder btn-group" style="display: inline-block;"><input type="text" class="ah-form-control ah-btn-group-left" style="height: 30px; width: 200px; display: none;" id="create-ticket-search-templates-input"><button type="button" class="sh-default-btn ah-btn-small ah-btn-group-left" id="create-ticket-choose-templates" style="height: 30px;    padding: 1px 10px;" disabled>Шаблоны<span class="ah-caret"></span></button><ul class="ah-dropdown-menu-templates" style="width: 350px; max-height: 50vh; overflow: auto;"></ul></div><label class="sh-default-btn ah-btn-small ah-btn-group-right" style="line-height: 1; margin-bottom: 0; height: 30px;"><input type="file" multiple style="display: none;" name="create-ticket-attaches[]"><i class="ah-btn-icon ah-icon-paperclip"></i></label></div></div>');

    // Описание
    $(body).append('<div class="alert alert-warning" style="position: absolute; top: 1px;left: calc(100% + 10px);width: 320px;border-radius: 0;"><strong>Данная форма не поддерживает Markdown. </strong>В случае необходимости, воспользуйтесь оригинальной формой <a target="_blank" href="https://adm.avito.ru/helpdesk">здесь</a>.</div><div class="ah-field-group" style="position: relative;"><div class="ah-form-control" style="min-height: 180px;" id="create-ticket-description-clone"></div></div><div class="ah-field-group"><textarea type="text" class="ah-form-control" style="min-height: 180px; resize: vertical; " name="create-ticket-description"></textarea></div>');

    // Почта и имя
    $(body).append('<div class="ah-field-group ah-horizontal-group-united" style="padding: 0 10px 0 0; margin-bottom: 0;"><div class="ah-field-title" style="">Почта пользователя</div><div class="ah-field-horizontal ah-field-flex"><input type="text" class="ah-form-control" name="create-ticket-requesterEmail" pattern="^.+@.+\..+$"></div></div>');
    $(body).append('<div class="ah-field-group ah-horizontal-group-united" style="padding: 0 0 0 10px; margin-bottom: 0;"><div class="ah-field-title" style="">Имя</div><div class="ah-field-horizontal ah-field-flex"><input type="text" class="ah-form-control" name="create-ticket-requesterName"></div></div>');
    $(body).append('<div class="ah-clearfix" style="margin-bottom: 15px;"></div>');

    // на странице юзера +++
    if (route === '/users/user/info') {
        var requesterNameInput = $(body).find('[name="create-ticket-requesterName"]');
        $(requesterNameInput).css({
            'border-top-right-radius': '0',
            'border-bottom-right-radius': '0'
        });
        $(requesterNameInput).after('<button class="sh-default-btn" style="border-top-left-radius: 0;border-bottom-left-radius: 0; margin-left: -1px; outline: none;" id="create-ticket-search-name" title="Поиск обращений в Helpdesk по e-mail, указанном в поле \'Почта пользователя\'. Если есть хотя бы один тикет, подставляет Инициатора, указанного в первом найденном тикете"><i class="glyphicon glyphicon-search" style="top: 2px;"></i></button>');

        var requesterMailInput = $(body).find('[name="create-ticket-requesterEmail"]');
        $(requesterMailInput).css({
            'border-top-right-radius': '0',
            'border-bottom-right-radius': '0'
        });
        $(requesterMailInput).after('<button class="sh-default-btn" style="border-top-left-radius: 0;border-bottom-left-radius: 0; margin-left: -1px; outline: none;" id="create-ticke-search-by-mail"><i class="glyphicon glyphicon-new-window" style="top: 2px;"></i></button>');

        $('#create-ticket-search-name').click(function () {
            var mail = $(requesterMailInput).val();
            if (!mail) {
                alert('Укажите электронный адрес в поле "Почта пользователя".');
                return;
            }
            searchHDUserNameInTickets(mail);
        });

        $('#create-ticke-search-by-mail').click(function () {
            var mail = $(requesterMailInput).val();
            if (!mail) {
                alert('Укажите электронный адрес в поле "Почта пользователя".');
                return;
            }

            var isOpened = window.open('https://adm.avito.ru/helpdesk?p=1&requesterEmail="' + mail + '"&sortField=createdTxtime&sortType=desc');
            if (!isOpened) {
                alert('К сожалению, невозможно открыть окно, так как в вашем браузере блокируются всплывающие окна для этого сайта.\nПожалуйста, снимите эту блокировку для сайта adm.avito.ru.');
            }
        });
    }
    // на странице юзера ---

    // Теги
    $(body).append('<div class="ah-field-group" style="position: relative;"><div class="ah-field-title">Теги</div><div class="" style=""><div id="create-ticket-added-tag-ids"></div><div class="ah-form-control" style="position: relative; min-height: 32px;" id="create-ticket-choose-tags"><b class="ah-caret-right" style="top: 13px; transform: none;"></b></div><div class="ah-dropdown-menu create-ticket-choose-tags-menu" style=""><input type="text" class="ah-form-control" style="margin-bottom: 8px;"><ul class="create-ticket-choose-tags-list"></ul></div></div></div>');


    // ФУТЕР
    $(modalColumn).append('<div class="ah-modal-footer"></div>');
    var footer = $(modalColumn).find('.ah-modal-footer');
    $(footer).append('<button type="button" class="sh-action-btn" style="letter-spacing: .1px; float: left;">Создать обращение</button>');
    $(footer).append('<div class="ah-clearfix" style=""></div>');


    // обработчики
    var closeBtn = $(modal).find('.ah-modal-close');
    var attachesInput = $(modal).find('[name="create-ticket-attaches[]"]');
    var statusInputs = $('[name="create-ticket-statusId"]');
    var chooseTemplateBtn = $('#create-ticket-choose-templates');

    $(closeBtn).click(function () {
        $(modal).hide();
        $('#layer-blackout-modal').removeClass('ah-layer-flex');
        $('#layer-blackout-modal').removeClass('ah-layer-y-scroll');
        closeModal();

        resetCreateTicketValues();
    });

    $(chooseTemplateBtn).click(function () {
        var list = $(this).next();
        $(list).addClass('ah-dropped');
        $(list).show();

        if (!settingsGlobal.helpdeskTemplatesJSON) {
            $(list).append('<span id="create-ticket-loading-templates" style="text-align: center; width: 100%; display: inline-block; color: #c5c5c5; font-weight: 500;">Загрузка...</span>');
            getHDTemplates();
        }

        if ($(list).hasClass('ah-dropped')) {
            $(this).hide();
            $(this).prev().show();
            $('#create-ticket-search-templates-input').val('');
            $('#create-ticket-search-templates-input').keyup();
            $('#create-ticket-search-templates-input').focus();

            $(document).mouseup(function (e) {
                var div = list;
                var input = $('#create-ticket-search-templates-input');
                if (!div.is(e.target)
                        && div.has(e.target).length === 0
                        && !input.is(e.target)
                        && !input.is(':focus')) {
                    div.removeClass('ah-dropped');
                    div.hide();
                    $('#create-ticket-search-templates-input').hide();
                    $(chooseTemplateBtn).show();
                }
            });
        }

        return false;
    });

    $(attachesInput).click(function () {
        $(this).val('');
    });
    $(attachesInput).change(function () {
        files = this.files;
        // console.log(files);
        if (!files.length) {
            $(this).parent().find('.ah-icon-paperclip').show();
            $(this).parent().find('.create-ticket-attaches-count').remove();
            return;
        }

        $(this).parent().find('.create-ticket-attaches-count').remove();
        var filesCount = files.length;
        $(this).parent().find('.ah-icon-paperclip').hide();
        $(this).parent().append('<span class="create-ticket-attaches-count" style="line-height: 26px; font-weight: 700;">Файлов: ' + filesCount + '</span>');
    });

    $(themesSelect).change(function () {
        if (!$(this).val()) {
            $(this).css('color', '#757575');
        } else {
            $(this).css('color', '#000');
        }

        var selectedThemeId = +$(this).find('option:selected').val();
        $(problemsSelect).find('option').remove();
        problemsArr.forEach(function (problem) {
            if (problem.parentId == selectedThemeId) {
                $(problemsSelect).append('<option value="' + problem.id + '" style="color: #000;">' + problem.name + '</option>');
                $(problemsSelect).css('color', '#000');
            }
        });

        if (!selectedThemeId) {
            $(problemsSelect).append('<option value="" hidden="">Тип проблемы (вопрос)</option>');
            $(problemsSelect).css('color', '#757575');
        }
    });

    $(statusInputs).change(function () {
        var statusId = +$(this).val();
        if (statusId != 1) {
            $(chooseTemplateBtn).prop('disabled', false);
        } else {
            $(chooseTemplateBtn).prop('disabled', true);
        }
    });

    $('#create-ticket-choose-tags').click(function (e) {
        $(this).next().find('input[type="text"]').val('');

        var removeTagBtn = $(modal).find('.ah-helpdesk-tag-remove');
        if (removeTagBtn.is(e.target)) {
            return false;
        }

        var list = $(modal).find('.create-ticket-choose-tags-list');
        if (!settingsGlobal.helpdeskTagsJSON) {
            $(list).append('<span id="create-ticket-loading-tags" style="text-align: center; width: 100%; display: inline-block; color: #c5c5c5; font-weight: 500;">Загрузка...</span>');
            getHDTags();
        } else {
            createTicketAddTagHandler();
        }

        dropdownCall($(this));
        if ($(this).next().hasClass('ah-dropped')) {
            $(this).next().find('input[type="text"]').focus();
        }
        return false;
    });

    var description = $(body).find('[name="create-ticket-description"]');
    var descriptionClone = $('#create-ticket-description-clone');
    $(description).unbind('keyup').keyup(function (e) {
        var content = $(this).val();

        if (e.which == 13)
            content = content + '<div>&nbsp;</div>';

        $(descriptionClone).html(content);
        createTicketResizeDescription();
    });
    $(description).focus(function () {
        var content = $(this).val();
        $(descriptionClone).html(content);
        $(this).css('overflow', 'hidden');
        createTicketResizeDescription();
    });

    var createTicketBtn = $(footer).find('.sh-action-btn');
    $(createTicketBtn).click(function () {
        var errors = [];

        var channelId = $(body).find('[name="create-ticket-channelId"]').val();
        if (!channelId)
            errors.push('Канал');

        var receivedAtEmail = $(body).find('[name="create-ticket-receivedAtEmail"]').val();
        if (!receivedAtEmail)
            errors.push('Источник');

        var theme = $(body).find('[name="create-ticket-theme"]').val();
        if (!theme)
            errors.push('Тема запроса');

        var problem = $(body).find('[name="create-ticket-problem"]').val();
        if (!problem)
            errors.push('Тип проблемы (вопрос)');

        var statusId = $(body).find('[name="create-ticket-statusId"]:checked').val();
        if (!statusId)
            errors.push('Статус');

        var requesterEmail = $(body).find('[name="create-ticket-requesterEmail"]').val();
        if (!requesterEmail)
            errors.push('Почта пользователя');

        var requesterName = $(body).find('[name="create-ticket-requesterName"]').val();
        if (!requesterName)
            errors.push('Имя');

        var description = $(body).find('[name="create-ticket-description"]').val();
        descrReplaced = description.replace(/\s/g, '');
        if (descrReplaced == '')
            errors.push('Описание');

        var data = [{
                name: 'channelId',
                value: channelId
            }, {
                name: 'receivedAtEmail',
                value: receivedAtEmail
            }, {
                name: 'theme',
                value: theme
            }, {
                name: 'problem',
                value: problem
            }, {
                name: 'problemId',
                value: problem
            }, {
                name: 'subject',
                value: $(body).find('[name="create-ticket-problem"] option:selected').text()
            }, {
                name: 'statusId',
                value: statusId
            }, {
                name: 'requesterEmail',
                value: requesterEmail
            }, {
                name: 'requesterName',
                value: requesterName
            }, {
                name: 'description',
                value: description
            }, {
                name: 'typeId',
                value: 1
            }];

        // теги
        var tags = $(body).find('[name^="create-ticket-tags"]');
        $(tags).each(function (i, tag) {
            data.push({
                name: 'tags[' + i + ']',
                value: $(tag).val()
            })
        });

        // сабмиттер
        if (!localStorage.agentID) {
            findAgentID();
        }
        data.push({
            name: 'submitterId',
            value: localStorage.agentID
        });

        if (errors.length == 0) {
            var pattern = /^.+@.+\..+$/;
            if (!pattern.test(requesterEmail)) {
                alert('Введите корректную почту пользователя.');
                return;
            }
            $('#sh-loading-layer').show();
            createTicket(data);
        } else {
            alert('Пропущены следующие поля: \n-' + errors.join('\n-'));
        }
    });
}

function getHDTemplates() {
    var url = 'https://adm.avito.ru/helpdesk/api/1/templates/list';

    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.send(null);
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
            $('#create-ticket-loading-templates').remove();
            if (xhr.status == 200) {
                try {
                    var response = JSON.parse(xhr.responseText);
                } catch (e) {
                    var response = xhr.responseText;
                    setTimeout(function () {
                        alert('Произошла техническая ошибка.\n' + e + '\n\n' + response);
                    }, 100);
                    return;
                }

                settingsGlobal.helpdeskTemplatesJSON = response;
                settingsGlobal.helpdeskTemplatesJSON.sort(compareTemplatesNames);

                var templatesAll = settingsGlobal.helpdeskTemplatesJSON;

                var btn = $('#create-ticket-choose-templates');
                var list = $(btn).next();

                $(list).append('<li templatesListBack style="display: none;"><a style="font-weight: 700;">Назад</a></li>');

                templatesAll.forEach(function (temp) {
                    if (!temp.isActive)
                        return;

                    var tempItem = getTemplateListItem(temp);

                    $(list).append('<li class="ah-hidden" data-temp-id="' + temp.id + '" data-temp-parentId="' + temp.parentId + '" data-temp-haschild="' + temp.hasChild + '" data-temp-level="' + temp.level + '"><a style="overflow : hidden; text-overflow : ellipsis; position : relative; white-space : normal;">' + tempItem.number + '<span style="">' + tempItem.name + '</span><span style="float: right;">' + tempItem.arrow + '</span></a></li>');
                });

                $(list).find('li[data-temp-level="0"]').removeClass('ah-hidden').addClass('ah-visible');

                // обработчики
                $(list).find('li:not([templatesListBack])').click(function () {
                    var tempClickedId = $(this).attr('data-temp-id');
                    var tempClickedParentId = $(this).attr('data-temp-parentId');
                    var tempClickedHasChild = $(this).data('tempHaschild');
                    var tempClickedLevel = $(this).attr('data-temp-level');

                    $(list).find('li').removeClass('ah-visible').addClass('ah-hidden');
                    $(list).find('li[data-temp-parentId="' + tempClickedId + '"]').removeClass('ah-hidden').addClass('ah-visible');

                    var curLevel = +$(list).find('li.ah-visible:first').attr('data-temp-level');
                    if (curLevel != 0) {
                        $(list).find('li[templatesListBack]').show();
                    }

                    if (!tempClickedHasChild) {
                        templatesAll.forEach(function (temp) {
                            if (temp.id == tempClickedId) {

                                var modal = $('#layer-blackout-modal').find('[data-modal-info="modal-create-new-ticket"]');
                                var body = $(modal).find('.ah-modal-body');
                                var description = $(body).find('[name="create-ticket-description"]');
                                var descriptionClone = $('#create-ticket-description-clone');

                                var curDescrVal = $(description).val();

                                var text = temp.text;

                                var textFinal = curDescrVal + '\n' + text;
                                textFinal = textFinal.replace(/^\n/, '');
                                $(description).val(textFinal);
                                $(descriptionClone).text(textFinal);
                                createTicketResizeDescription();

                                $(list).removeClass('ah-dropped');
                                $(list).hide();

                                $('#create-ticket-search-templates-input').hide();
                                $('#create-ticket-choose-templates').show();

                                $('#create-ticket-search-templates-input').keyup();

                                var allTags = temp.tags;
                                var allTagNames = temp.tagNames;
                                var addedTagIdsBlock = $('#create-ticket-added-tag-ids');
                                var addedTagsBlock = $('#create-ticket-choose-tags');
                                var exsistingTagIds = [];
                                $(addedTagIdsBlock).find('input').each(function (i, tag) {
                                    exsistingTagIds.push(+$(tag).val());
                                });

                                var exsistingTagNames = [];
                                $(addedTagsBlock).find('.ah-helpdesk-tag-label').each(function (i, tag) {
                                    exsistingTagNames.push($(tag).text());
                                });

                                if (allTags && allTags.length) {
                                    allTags.forEach(function (tag) {
                                        if (~exsistingTagIds.indexOf(tag))
                                            return;
                                        var addedTagsLength = $(addedTagIdsBlock).find('[name^="create-ticket-tags"]').length;
                                        $(addedTagIdsBlock).append('<input type="hidden" name="create-ticket-tags[' + addedTagsLength + ']" value="' + tag + '">');
                                    });
                                }

                                if (allTagNames && allTagNames.length) {
                                    allTagNames.forEach(function (tagName) {
                                        if (~exsistingTagNames.indexOf(tagName))
                                            return;
                                        $(addedTagsBlock).append('<div class="ah-helpdesk-tag"><span class="ah-helpdesk-tag-label">' + tagName + '</span><button type="button" class="ah-helpdesk-tag-remove">×</button></div>');
                                    });
                                }

                                createTicketRemoveTagBtnHandler();
                            }
                        });
                    }
                });

                $(list).find('li[templatesListBack]').click(function () {
                    var curParentId = +$(list).find('li.ah-visible:first').attr('data-temp-parentid');
                    var parentLevelParentId = +$(list).find('li[data-temp-id="' + curParentId + '"]:first').attr('data-temp-parentid');

                    if (!parentLevelParentId)
                        parentLevelParentId = 'null';

                    $(list).find('li').removeClass('ah-visible').addClass('ah-hidden');
                    $(list).find('li[data-temp-parentid="' + parentLevelParentId + '"]').removeClass('ah-hidden').addClass('ah-visible');

                    var curLevel = +$(list).find('li.ah-visible:first').attr('data-temp-level');
                    if (curLevel == 0) {
                        $(list).find('li[templatesListBack]').hide();
                    }
                });

                var searchInput = $('#create-ticket-search-templates-input');
                $(searchInput).unbind('keyup').keyup(function (e) {
                    var typedText = $(this).val();
                    if (!typedText) {
                        $(list).find('li').removeClass('ah-visible').addClass('ah-hidden');
                        $(list).find('li[data-temp-level="0"]').removeClass('ah-hidden').addClass('ah-visible');
                        $(list).find('li[templatesListBack]').hide();
                        return;
                    }

                    $(list).find('li[templatesListBack]').hide();
                    $(list).find('li').removeClass('ah-visible').addClass('ah-hidden');
                    var matched = $(list).find('li:containsCI(' + typedText + ')');
                    $(matched).removeClass('ah-hidden').addClass('ah-visible');

                    if (e.which == 13) {
                        $(list).find('li.ah-visible[data-temp-haschild="false"]:first').click();
                    }
                });
            }
        }
    }
}

function createTicketResizeDescription() {
    var modal = $('#layer-blackout-modal').find('[data-modal-info="modal-create-new-ticket"]');
    var body = $(modal).find('.ah-modal-body');
    var description = $(body).find('[name="create-ticket-description"]');
    var descriptionClone = $('#create-ticket-description-clone');

    var height = $(descriptionClone).outerHeight() + 20;
    $(description).css('height', '' + height + 'px');
}

function resetCreateTicketValues() {
    var modal = $('#layer-blackout-modal').find('[data-modal-info="modal-create-new-ticket"]');
    var attachesInput = $(modal).find('[name="create-ticket-attaches[]"]');

    $(attachesInput).val('');
    $(attachesInput).parent().find('.ah-icon-paperclip').show();
    $(attachesInput).parent().find('.create-ticket-attaches-count').remove();

    var tagsList = $(modal).find('.create-ticket-choose-tags-list');
    var addedTagIds = $(modal).find('#create-ticket-added-tag-ids [name^="create-ticket-tags"]');
    var addedTags = $(modal).find('#create-ticket-choose-tags .ah-helpdesk-tag');
    $(tagsList).find('li').remove();
    $(addedTagIds).remove();
    $(addedTags).remove();

    var userMail = $(modal).find('[name="create-ticket-requesterEmail"]');
    $(userMail).val('');

    var userName = $(modal).find('[name="create-ticket-requesterName"]');
    $(userName).val('');

    var description = $(modal).find('[name="create-ticket-description"]');
    var descriptionClone = $('#create-ticket-description-clone');
    $(description).val('');
    $(descriptionClone).text('');
    $(description).css('height', '180px');
    $(description).css('overflow', 'auto');
}

function getHDTags() {
    var url = 'https://adm.avito.ru/helpdesk/api/1/dictionaries/tags';

    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.send(null);
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
            $('#create-ticket-loading-tags').remove();
            if (xhr.status == 200) {
                try {
                    var response = JSON.parse(xhr.responseText);
                } catch (e) {
                    var response = xhr.responseText;
                    setTimeout(function () {
                        alert('Произошла техническая ошибка.\n' + e + '\n\n' + response);
                    }, 100);
                    return;
                }

                settingsGlobal.helpdeskTagsJSON = response;
                createTicketAddTagHandler();
            }
        }
    }
}

function createTicketAddTagHandler() {
    var tagsAll = settingsGlobal.helpdeskTagsJSON;

    var modal = $('#layer-blackout-modal').find('[data-modal-info="modal-create-new-ticket"]');
    var list = $(modal).find('.create-ticket-choose-tags-list');
    $(list).find('li').remove();

    var alreadyAdded = [];
    var addedTagIdsBlock = $('#create-ticket-added-tag-ids');
    $(addedTagIdsBlock).find('[name^="create-ticket-tags"]').each(function (i, tag) {
        var tagId = +$(tag).val();
        alreadyAdded.push(tagId);
    });

    tagsAll.forEach(function (tag) {
        if (!tag.isActive || tag.isSystem || ~alreadyAdded.indexOf(tag.id))
            return;
        $(list).append('<li class="create-ticket-tag-item" data-tag-id="' + tag.id + '" data-tag-name="' + tag.name + '">' + tag.name + '</li>');
    });

    createTicketRenderedTagsHandler();

    var searchInput = $(modal).find('.create-ticket-choose-tags-menu [type="text"]');
    $(searchInput).unbind('keyup').keyup(function (e) {
        var typedText = $(this).val();
        typedText = typedText.toLowerCase();

        var alreadyAdded = [];
        $(addedTagIdsBlock).find('[name^="create-ticket-tags"]').each(function (i, tag) {
            var tagId = +$(tag).val();
            alreadyAdded.push(tagId);
        });

        if (!typedText) {
            $(list).find('li').remove();
            tagsAll.forEach(function (tag) {
                if (!tag.isActive || tag.isSystem || ~alreadyAdded.indexOf(tag.id))
                    return;
                $(list).append('<li class="create-ticket-tag-item" data-tag-id="' + tag.id + '" data-tag-name="' + tag.name + '">' + tag.name + '</li>');
            });
            return;
        }

        var matched = tagsAll.filter(function (tag) {
            return ~tag.name.toLowerCase().indexOf(typedText) && tag.isActive && !tag.isSystem
                    && alreadyAdded.indexOf(tag.id) == -1;
        });

        $(list).find('li').remove();
        $('#create-ticket-no-matched-tags').remove();
        if (matched.length == 0) {
            $(list).append('<li style="color: #777;" id="create-ticket-no-matched-tags"><i>Значений не найдено</i></li>');
        } else {
            matched.forEach(function (tag) {
                $(list).append('<li class="create-ticket-tag-item" data-tag-id="' + tag.id + '" data-tag-name="' + tag.name + '">' + tag.name + '</li>');

                createTicketRenderedTagsHandler();
            });
        }

        if (e.which == 13) {
            $(list).find('li.create-ticket-tag-item:first').click();
        }
    });
}

function createTicketRenderedTagsHandler() {
    var modal = $('#layer-blackout-modal').find('[data-modal-info="modal-create-new-ticket"]');
    var addedTagIdsBlock = $('#create-ticket-added-tag-ids');
    var addedTagsBlock = $('#create-ticket-choose-tags');

    var tagItem = $(modal).find('.create-ticket-tag-item');
    $(tagItem).unbind('click').click(function () {
        var addedTagsLength = $(addedTagIdsBlock).find('[name^="create-ticket-tags"]').length;
        var tagId = +$(this).attr('data-tag-id');
        var tagName = $(this).attr('data-tag-name');

        $(addedTagIdsBlock).append('<input type="hidden" name="create-ticket-tags[' + addedTagsLength + ']" value="' + tagId + '">');

        $(addedTagsBlock).append('<div class="ah-helpdesk-tag"><span class="ah-helpdesk-tag-label">' + tagName + '</span><button type="button" class="ah-helpdesk-tag-remove">×</button></div>');

        setTimeout(() => {
            $(this).remove();
        }, 10);

        // удаление
        createTicketRemoveTagBtnHandler();
    });
}

function createTicketRemoveTagBtnHandler() {
    var modal = $('#layer-blackout-modal').find('[data-modal-info="modal-create-new-ticket"]');
    var addedTagIdsBlock = $('#create-ticket-added-tag-ids');

    var removeTagBtn = $(modal).find('.ah-helpdesk-tag-remove');
    $(removeTagBtn).unbind('click').click(function () {
        var clickedBtn = $(this);
        var $addedHolder = $(clickedBtn).parents('#create-ticket-choose-tags').find('.ah-helpdesk-tag');
        var idx = $addedHolder.index($(this).parents('.ah-helpdesk-tag'));

        setTimeout(function () {
            $(clickedBtn).parents('.ah-helpdesk-tag').remove();
            $(addedTagIdsBlock).find('input[type="hidden"][name="create-ticket-tags[' + idx + ']"]').remove();

            $(addedTagIdsBlock).find('[name^="create-ticket-tags"]').each(function (i, tag) {
                $(tag).attr('name', 'create-ticket-tags[' + i + ']');
            });
        }, 10);
    });
}

function compareTemplatesNames(a, b) {
    if (a.name > b.name)
        return 1;
    if (a.name < b.name)
        return -1;
}

function getTemplateListItem(temp) {
    var obj = {};

    var regTempNumber = /^\d+/;
    var tempNumber = temp.name.match(regTempNumber);
    if (!tempNumber) {
        tempNumber = '';
    } else {
        tempNumber = '<span style="color: #959595; border: 1px solid transparent; float: left; margin-right: 5px; margin-top: -1px;">' + tempNumber[0] + '</span>';
    }

    var tempName = temp.name.replace(regTempNumber, '');

    var tempArrow = '';
    if (temp.hasChild) {
        tempArrow = '<i class="glyphicon  glyphicon-menu-right" style="position: absolute; right: 5px;top: 6px;"></i>';
    }

    obj = {
        number: tempNumber,
        name: tempName,
        arrow: tempArrow
    }

    return obj;
}

function addCreateTicketBtn(route) {
    if ($('#sh-outgoing-mail-btn').length > 0)
        return;

    switch (route) {
        case '/helpdesk/details':
            $('div.helpdesk-side-panel div.btn-group:contains(Список)').after('<input type="button" class="sh-default-btn" id="sh-outgoing-mail-btn" value="" style="" title="Создать обращение">');
            break;

        case '/users/user/info':
            $('.header__title:eq(0)').append('<input type="button" class="sh-default-btn" id="sh-outgoing-mail-btn" value="" style="height: 34px;" title="Создать обращение">');
            break;
    }

    var btnShow = $('#sh-outgoing-mail-btn');

    $(btnShow).click(function () {
        showCreateNewTicketWindow();
    });
}
function showCreateNewTicketWindow() {
    var modal = $('#layer-blackout-modal').find('[data-modal-info="modal-create-new-ticket"]');
    substituteCreateTicketValues();
    $(modal).show();
    $('#layer-blackout-modal').addClass('ah-layer-flex');
    $('#layer-blackout-modal').addClass('ah-layer-y-scroll');
    showModal();
}
function substituteCreateTicketValues() {
    var channelId = $('[name="channelId"]').val();
    channelId = channelId || '5';
    var receivedAtEmail = $('[name="receivedAtEmail"]').val();
    receivedAtEmail = receivedAtEmail || 'support@avito.ru';

    var problemId = $('[name="problemId"]').val();
    var theme = '';

    var helpdeskProblemsStr = settingsGlobal.helpdeskProblemsJSON;
    if (!settingsGlobal.helpdeskProblemsJSON) {
        helpdeskProblemsStr = '[]';
    }

    var problems = JSON.parse(helpdeskProblemsStr);
    problems.forEach(function (item) {
        if (item.id == problemId) {
            theme = item.parentId;
        }
    });

    var description = $('.helpdesk-html-view:last').html();
    if (!description) {
        description = '';
    } else {
        description = description.replace(/<br>/g, '\n');
        description = description.replace(/<\/p><p>/g, '\n\n');
        description = description.replace(/<[^>]+>/g, '');
        description = description.replace(/^ /gm, '');
    }

    var requesterEmail = $('[name="user"]').val();
    if (!requesterEmail)
        requesterEmail = $('.js-fakeemail-field').text();

    var requesterName = $('[href^="/helpdesk/client/"]').text();

    var modal = $('#layer-blackout-modal').find('[data-modal-info="modal-create-new-ticket"]');
//    $(modal).find('[name="create-ticket-channelId"]').val(channelId);
    $(modal).find('[name="create-ticket-receivedAtEmail"]').val(receivedAtEmail);
    $(modal).find('[name="create-ticket-theme"]').val(theme).change();
    $(modal).find('[name="create-ticket-problem"]').val(problemId);
    $(modal).find('[name="create-ticket-description"]').val(description);
    $(modal).find('[name="create-ticket-requesterEmail"]').val(requesterEmail);
    $(modal).find('[name="create-ticket-requesterName"]').val(requesterName);

    // tag callcenter for voice support
    let allowedCallcenterTagSubdivisions = [
        79, // 1st line - voice support	Вероника Чалова
        80, // 1st line - voice support	Елизавета Шульгина
        30 // script developers
    ];
    if (~allowedCallcenterTagSubdivisions.indexOf(+userGlobalInfo.subdivision_id)) {
        let addedTagIdsBlock = $(modal).find('#create-ticket-added-tag-ids');
        let addedTagsBlock = $(modal).find('#create-ticket-choose-tags');
        $(addedTagIdsBlock).append('<input type="hidden" name="create-ticket-tags[0]" value="1521">');
        $(addedTagsBlock).append('<div class="ah-helpdesk-tag"><span class="ah-helpdesk-tag-label">callcenter</span><button type="button" class="ah-helpdesk-tag-remove">×</button></div>');
        createTicketRemoveTagBtnHandler();
    }

}

function searchHDUserNameInTickets(mail) {

    mail = encodeURIComponent(mail);
    var url = 'https://adm.avito.ru/helpdesk/api/1/ticket/search?p=1&sortField=createdTxtime&sortType=desc&requesterEmail="' + mail + '"&statusId%5B%5D=&problemId%5B%5D=&tags%5B%5D=';

    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.send();

    $('#sh-loading-layer').show();

    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 && xhr.status == 200) {
            $('#sh-loading-layer').hide();
            var response = JSON.parse(xhr.responseText);

            if (response.tickets.length == 0) {
                setTimeout(() => {
                    alert('Имя не найдено');
                }, 100);
            } else {
                outTextFrame('Имя найдено');
                $('input[name="create-ticket-requesterName"]').val(response.tickets[0].requesterName);
            }
        }

        if (xhr.readyState == 4 && xhr.status >= 400) {
            $('#sh-loading-layer').hide();
            setTimeout(function () {
                alert('Произошла техническая ошибка.\n' + xhr.status + ', ' + xhr.statusText + '');
            }, 100);
        }
    }
}

function createTicket(data) {
    var formData = new FormData();

    data.forEach(function (item) {
        formData.append('' + item.name + '', '' + item.value + '');
    });

    var files = $('[name="create-ticket-attaches[]"]');
    var newslide = files.prop('files');
    var filesArr = [];
    for (var i = 0; i < newslide.length; i++) {
        filesArr[i] = newslide[i];
        formData.append('attaches[]', filesArr[i]);
    }

    var url = 'https://adm.avito.ru/helpdesk/api/1/ticket/add';

    var xhr = new XMLHttpRequest();
    xhr.open('POST', url, true);
    xhr.send(formData);

    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
            $('#sh-loading-layer').hide();

            if (xhr.status == 200) {
                var response = JSON.parse(xhr.responseText);
                if (response.hasOwnProperty('error')) {
                    var errorText = JSON.stringify(response.error);
                    setTimeout(function () {
                        alert('error: ' + errorText);
                    }, 100);
                    return;
                }
                var ticketId = response.id;

                var modal = $('#layer-blackout-modal').find('[data-modal-info="modal-create-new-ticket"]');
                var closeBtn = $(modal).find('.ah-modal-close');
                $(closeBtn).click();

                var isOpened = window.open('https://adm.avito.ru/helpdesk/details/' + ticketId);
                if (!isOpened) {
                    chrome.runtime.sendMessage({action: 'copyToClipboard', text: ticketId});
                    setTimeout(function () {
                        alert('Обращение было создано, однако в вашем браузере блокируются всплывающие окна для этого сайта.\nПожалуйста, снимите эту блокировку для сайта adm.avito.ru.\nНомер созданного обращения был скопирован в буфер обмена');
                    }, 100);
                }
            }

            if (xhr.status >= 400) {
                setTimeout(function () {
                    alert('Произошла техническая ошибка.\n' + xhr.status + ', ' + xhr.statusText + '');
                }, 100);
            }
        }
    }
}
//---------- Создание обращения ----------//