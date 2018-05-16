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

    let allPanelHeaders = getHdLeftPanelHeaders();
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
        $('#ah-loading-layer').hide();
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
    var allPanelHeaders = getHdLeftPanelHeaders();
    var classifBlock = [].find.call(allPanelHeaders, singleItem => singleItem.innerText === 'Классификация');
    var classifFrom = classifBlock.nextSibling;

    var additionalInput = document.createElement('input');
    additionalInput.name = 'assigneeId';
    additionalInput.type = 'hidden';
    additionalInput.value = agentId;
    additionalInput.id = 'sh-extra-assigneeId';

    classifFrom.appendChild(additionalInput);
}


//---------- Получить проблемы helpdesk ----------//
function getHelpdeskProblems() {
    document.dispatchEvent(new Event('requestHelpdeskStore'));
    try {
        return global.hdSettings.helpdeskStore.dictionaries.problems;
    } catch (e) {
        return null;
    }
}
//++++++++++ Получить проблемы helpdesk ++++++++++//

//---------- Agent ID ----------//
function getAgentId() {
    document.dispatchEvent(new Event('requestHelpdeskStore'));
    try {
        return global.hdSettings.helpdeskStore.auth.id;
    } catch (e) {
        return null;
    }
}
//+++++++++ Agent ID ++++++++++//


// информация о тегах
function getTagsInfo() {
    var data = {
        user_id: +global.userInfo.id
    }

    chrome.runtime.sendMessage({
        action: 'XMLHttpRequest',
        method: "POST",
        url: `${global.connectInfo.ext_url}/support_helper/other/getTags.php`,
        data: "param=" + JSON.stringify(data),
    },
            function (response) {
                if (~response.indexOf('Неверный запрос') || response == 'error') {
                    // outTextFrame('Ошибка загрузки тегов.');
                    global.hdSettings.helpdeskTags = 'FatalError';
                    return;
                }
                // console.log(response);

                try {
                    var resp = JSON.parse(response);
                } catch (e) {
                    global.hdSettings.helpdeskTags = 'FatalError';
                    return;
                }

                global.hdSettings.helpdeskTags = resp;

                renderTagsPopup(); // создание попапа тегов один раз

                if (isAuthority('ROLE_HELPDESK_QUICK_BUTTONS')) {
                    renderQBWindow(); // создание окна QB один раз
                    updateQBInfo(); // удаляем все, что нет в наборе или удалено/деактивировано
                }
            }
    );
}

// инфа обо всех пользователях global.allUsersInfo.list
function getAllUsers() {
    chrome.runtime.sendMessage({
            action: 'XMLHttpRequest',
            method: "GET",
            url: `${global.connectInfo.ext_url}/journal/include/php/user/getAllUsers.php`,
        },
        function (response) {
            let jsonParse;
            try {
                jsonParse = JSON.parse(response);
            } catch (e) {
                global.allUsersInfo.fail = true;
                global.allUsersInfo.isLoading = false;
                showAgentInfoTicket();
                addTicketTlHelp();
                return;
            }

            global.allUsersInfo.list = jsonParse.table;
            global.allUsersInfo.isLoading = false;

            // первый раз запуск после загузки страницы
            showAgentInfoTicket();
            showAgentInfoQueue();

            // Помощь ТЛ
            addTicketTlHelp();
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
    $('#ah-layer-blackout-modal').append('<div class="ah-modal-content" data-modal-info="modal-create-new-ticket" style="top: 30px;"><div class="ah-modal-container" style=""></div></div>');

    var modal = $('#ah-layer-blackout-modal').find('[data-modal-info="modal-create-new-ticket"]');
    var modalContainer = $(modal).find('.ah-modal-container');
    $(modalContainer).append('<div style="width: 600px;" class="ah-modal-column"></div>');
    var modalColumn = $(modalContainer).find('.ah-modal-column');

    // ХЕДЕР
    $(modalColumn).append('<div class="ah-modal-header"><span class="ah-modal-title">Новое обращение</span><button type="button" class="ah-modal-close">x</button></div>');

    // ТЕЛО
    $(modalColumn).append('<div class="ah-modal-body" style=""></div>');
    var body = $(modalColumn).find('.ah-modal-body');

    // Источник
    $(body).append('<div class="ah-field-group"><div class="ah-field-title">Источник</div><div><select class="ah-form-control" style="" name="create-ticket-sourceId"><option value="2">support@avito.ru</option><option value="3">shop_support@avito.ru</option><option value="4">android@avito.ru</option><option value="5">ios@avito.ru</option><option value="6">supportautoload@avito.ru</option><option value="7">dostavkasupport@avito.ru</option><option value="12">info@actiagent.ru</option><option value="13">info@actidealer.ru</option><option value="14">10let@avito.ru</option><option value="15">info-pro@avito.ru</option><option value="16">rentsupport@avito.ru</option></select></div></div>');
    $(body).append('<div class="ah-clearfix" style="margin-bottom: 15px;"></div>');

    // Тема запроса
    $(body).append('<div class="ah-field-group"><div class="ah-field-title">Тема запроса</div><div class="" style=""><select class="ah-form-control" style="" name="create-ticket-theme"><option value="" hidden="">--</option></select></div></div>');

    // Тип проблемы (вопрос)
    $(body).append('<div class="ah-field-group"><div class="ah-field-title">Тип проблемы (вопрос)</div><div class="" style=""><select class="ah-form-control" style="" name="create-ticket-problem"><option value="" hidden="">--</option></select></div></div>');

    var themesSelect = $(modal).find('[name="create-ticket-theme"]');
    var problemsSelect = $(modal).find('[name="create-ticket-problem"]');

    // Инструменты
    $(body).append('<div class="ah-field-group" style="margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between;"><div class="ah-field-horizontal"><label for="create-ticket-statusId-1" class="ah-radio-inline"><input type="radio" name="create-ticket-statusId" id="create-ticket-statusId-1" value="1" checked>Новое</label><label for="create-ticket-statusId-5" class="ah-radio-inline"><input type="radio"  name="create-ticket-statusId" id="create-ticket-statusId-5" value="5">В решено</label><label for="create-ticket-statusId-3" class="ah-radio-inline"><input type="radio" name="create-ticket-statusId" id="create-ticket-statusId-3" value="3">На ожидании</label></div><div class="ah-field-horizontal" style=""><div class="ah-dropmenu-holder btn-group" style="display: inline-block;"><input type="text" class="ah-form-control ah-btn-group-left" style="height: 30px; width: 200px; display: none;" id="create-ticket-search-templates-input"><button type="button" class="ah-default-btn ah-btn-small ah-btn-group-left" id="ah-create-ticket-choose-templates" style="height: 30px;    padding: 1px 10px;" disabled>Шаблоны<span class="ah-caret"></span></button><ul class="ah-dropdown-menu-templates" style="width: 350px; max-height: 50vh; overflow: auto;"></ul></div><label class="ah-default-btn ah-btn-small ah-btn-group-right" style="line-height: 1; margin-bottom: 0; height: 30px;"><input type="file" multiple style="display: none;" name="create-ticket-attaches[]"><i class="ah-btn-icon ah-icon-paperclip"></i></label></div></div>');

    // Описание
    $(body).append(`<div class="alert alert-warning" style="position: absolute; top: 1px;left: calc(100% + 10px);width: 320px;border-radius: 0;"><strong>Данная форма не поддерживает Markdown. </strong>В случае необходимости, воспользуйтесь оригинальной формой <a target="_blank" href="${global.connectInfo.adm_url}/helpdesk">здесь</a>.</div><div class="ah-field-group" style="position: relative;"><div class="ah-form-control" style="min-height: 180px;" id="ah-create-ticket-description-clone"></div></div><div class="ah-field-group"><textarea class="ah-form-control" style="min-height: 180px; resize: vertical; " name="create-ticket-description"></textarea></div>`);

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
        $(requesterNameInput).after('<button class="ah-default-btn" style="border-top-left-radius: 0;border-bottom-left-radius: 0; margin-left: -1px; outline: none;" id="create-ticket-search-name" title="Поиск обращений в Helpdesk по e-mail, указанном в поле \'Почта пользователя\'. Если есть хотя бы один тикет, подставляет Инициатора, указанного в первом найденном тикете"><i class="glyphicon glyphicon-search" style="top: 2px;"></i></button>');

        var requesterMailInput = $(body).find('[name="create-ticket-requesterEmail"]');
        $(requesterMailInput).css({
            'border-top-right-radius': '0',
            'border-bottom-right-radius': '0'
        });
        $(requesterMailInput).after('<button class="ah-default-btn" style="border-top-left-radius: 0;border-bottom-left-radius: 0; margin-left: -1px; outline: none;" id="create-ticke-search-by-mail"><i class="glyphicon glyphicon-new-window" style="top: 2px;"></i></button>');

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

            var isOpened = window.open(`${global.connectInfo.adm_url}/helpdesk?p=1&requesterEmail="${mail}"&sortField=createdTxtime&sortType=desc`);
            if (!isOpened) {
                alert('К сожалению, невозможно открыть окно, так как в вашем браузере блокируются всплывающие окна для этого сайта.\nПожалуйста, снимите эту блокировку для сайта adm.avito.ru.');
            }
        });
    }
    // на странице юзера ---

    // Теги
    $(body).append('<div class="ah-field-group" style="position: relative;"><div class="ah-field-title">Теги</div><div class="" style=""><div id="create-ticket-added-tag-ids"></div><div class="ah-form-control" style="position: relative; min-height: 32px;" id="create-ticket-choose-tags"><b class="ah-caret-right" style="top: 13px; transform: none;"></b></div><div class="ah-dropdown-menu ah-create-ticket-choose-tags-menu" style=""><input type="text" class="ah-form-control" style="margin-bottom: 8px;"><ul class="ah-create-ticket-choose-tags-list"></ul></div></div></div>');


    // ФУТЕР
    $(modalColumn).append('<div class="ah-modal-footer"></div>');
    var footer = $(modalColumn).find('.ah-modal-footer');
    $(footer).append('<button type="button" class="ah-action-btn" style="letter-spacing: .1px; float: left;">Создать обращение</button>');
    $(footer).append('<div class="ah-clearfix" style=""></div>');

    // автозаполнение
    const $dropdown = $(`
    <div class="dropup ah-create-ticket-dropdown ah-create-ticket-dropdown_inline">
        <div class="btn-group">
            <button class="btn btn-default ah-create-ticket-dropdown__info"><span class="glyphicon glyphicon-info-sign"></span></button>
            <button class="btn btn-default dropdown-toggle" type="button" data-toggle="dropdown">Автозаполнение
            <span class="caret"></span></button>
            <ul class="dropdown-menu dropdown-menu-right">
                <li>
                    <a class="ah-create-ticket-dropdown__item" data-fill="callcenter"
                        data-placement="left" data-toggle="tooltip" data-html="true" 
                        title="
                        <table class='ah-create-ticket-tooltip__table'>
                            <tr>
                                <td class='ah-create-ticket-tooltip__col'>Источник</td>
                                <td class='ah-create-ticket-tooltip__col'>support@avito.ru</td>
                            </tr>
                            <tr>
                                <td class='ah-create-ticket-tooltip__col'>Тема запроса</td>
                                <td class='ah-create-ticket-tooltip__col'>-</td>
                            </tr>
                            <tr>
                                <td class='ah-create-ticket-tooltip__col'>Описание</td>
                                <td class='ah-create-ticket-tooltip__col'>-</td>
                            </tr>
                            <tr>
                                <td class='ah-create-ticket-tooltip__col'>Теги</td>
                                <td class='ah-create-ticket-tooltip__col'>callcenter</td>
                            </tr>
                        </table>">
                       Callcenter
                    </a>
                </li>
                <li>
                    <a class="ah-create-ticket-dropdown__item" data-fill="c2c"
                        data-placement="left" data-toggle="tooltip" data-html="true" 
                        title="
                        <table class='ah-create-ticket-tooltip__table'>
                            <tr>
                                <td class='ah-create-ticket-tooltip__col'>Источник</td>
                                <td class='ah-create-ticket-tooltip__col'>dostavkasupport@avito.ru</td>
                            </tr>
                            <tr>
                                <td class='ah-create-ticket-tooltip__col'>Тема запроса</td>
                                <td class='ah-create-ticket-tooltip__col'>Avito Доставка</td>
                            </tr>
                            <tr>
                                <td class='ah-create-ticket-tooltip__col'>Описание</td>
                                <td class='ah-create-ticket-tooltip__col'>Телефонное обращение в службу поддержки Пользователей</td>
                            </tr>
                            <tr>
                                <td class='ah-create-ticket-tooltip__col'>Теги</td>
                                <td class='ah-create-ticket-tooltip__col'>delivery_call</td>
                            </tr>
                        </table>">
                       C2C
                    </a>
                </li>
                <li>
                    <a class="ah-create-ticket-dropdown__item" data-fill="claimline"
                        data-placement="left" data-toggle="tooltip" data-html="true" 
                        title="
                        <table class='ah-create-ticket-tooltip__table'>
                            <tr>
                                <td class='ah-create-ticket-tooltip__col'>Источник</td>
                                <td class='ah-create-ticket-tooltip__col'>support@avito.ru</td>
                            </tr>
                            <tr>
                                <td class='ah-create-ticket-tooltip__col'>Тема запроса</td>
                                <td class='ah-create-ticket-tooltip__col'>-</td>
                            </tr>
                            <tr>
                                <td class='ah-create-ticket-tooltip__col'>Описание</td>
                                <td class='ah-create-ticket-tooltip__col'>Телефонное обращение в службу поддержки Пользователей</td>
                            </tr>
                            <tr>
                                <td class='ah-create-ticket-tooltip__col'>Теги</td>
                                <td class='ah-create-ticket-tooltip__col'>claim_call</td>
                            </tr>
                        </table>">
                       Claimline
                    </a>
                </li>
            </ul>
        </div>
    </div>`);

    footer.prepend($dropdown);

    $dropdown.click( e => {
        const target = e.target;

        if (target.closest('.ah-create-ticket-dropdown__item')) {
            e.stopPropagation();
            const item = target.closest('.ah-create-ticket-dropdown__item');

            if (item.dataset.checked) {
                const checkbox = item.querySelector('.ah-create-ticket-dropdown__checkbox');
                checkbox.remove();
                item.removeAttribute('data-checked');
                localStorage.removeItem('ah-create-ticket-autofill');
            } else {
                const fill = item.dataset.fill;
                autoFillCreateTicket(fill);
            }
        }
    });

    $('.ah-create-ticket-dropdown__item').tooltip({
        container: '[data-modal-info="modal-create-new-ticket"]',
        animation: false,
        template: `
            <div class="tooltip ah-create-ticket-tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner ah-create-ticket-tooltip__tooltip-inner"></div></div>
        `
    });

    $('.ah-create-ticket-dropdown__info').tooltip({
        container: '[data-modal-info="modal-create-new-ticket"]',
        title: 'При каждом открытии формы её поля будут автоматически заполняться в соответствии с выбранной опцией',
        trigger: 'focus'
    });

    // обработчики
    var closeBtn = $(modal).find('.ah-modal-close');
    var attachesInput = $(modal).find('[name="create-ticket-attaches[]"]');
    var statusInputs = $('[name="create-ticket-statusId"]');
    var chooseTemplateBtn = $('#ah-create-ticket-choose-templates');

    $(closeBtn).click(function () {
        $(modal).hide();
        $('#ah-layer-blackout-modal').removeClass('ah-layer-flex');
        $('#ah-layer-blackout-modal').removeClass('ah-layer-y-scroll');
        closeModal();

        resetCreateTicketValues();
    });

    $(chooseTemplateBtn).click(function () {
        var list = $(this).next();
        $(list).addClass('ah-dropped');
        $(list).show();

        if (!global.hdSettings.helpdeskTemplatesJSON) {
            $(list).append('<span id="create-ticket-loading-templates" style="text-align: center; width: 100%; display: inline-block; color: #c5c5c5; font-weight: 500;">Загрузка...</span>');
            createTicketGetHDTemplates();
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
        const problemsArr = getHelpdeskProblems() || global.hdSettings.problems.info;
        problemsArr.forEach(function (problem) {
            if (problem.parentId == selectedThemeId && !problem.isArchive) {
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

        var list = $(modal).find('.ah-create-ticket-choose-tags-list');
        if (!global.hdSettings.helpdeskTagsJSON) {
            $(list).append('<span id="create-ticket-loading-tags" style="text-align: center; width: 100%; display: inline-block; color: #c5c5c5; font-weight: 500;">Загрузка...</span>');
            createTicketGetHDTags();
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
    var descriptionClone = $('#ah-create-ticket-description-clone');
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

    var createTicketBtn = $(footer).find('.ah-action-btn');
    $(createTicketBtn).click(function () {
        var errors = [];

        var sourceId = $(body).find('[name="create-ticket-sourceId"]').val();
        if (!sourceId)
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
                value: 5
            }, {
                name: 'sourceId',
                value: sourceId
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

        const submitterId = getAgentId() || localStorage.getItem('agentID');
        if (!submitterId) {
            alert('Не удалось определить ваш ID');
            return;
        }
        // сабмиттер
        data.push({
            name: 'submitterId',
            value: submitterId
        });

        if (errors.length == 0) {
            var pattern = /^.+@.+\..+$/;
            if (!pattern.test(requesterEmail)) {
                alert('Введите корректную почту пользователя.');
                return;
            }
            $('#ah-loading-layer').show();
            createTicket(data);
        } else {
            alert('Пропущены следующие поля: \n-' + errors.join('\n-'));
        }
    });
}

function createTicketGetHDTemplates() {
    if (global.hdSettings.helpdeskTagsJSON) {
        getHDTemplates()
            .then(response => {
                global.hdSettings.helpdeskTemplatesJSON = response.result;
                global.hdSettings.helpdeskTemplatesJSON.sort(compareTemplatesNames);
                renderList();
            }, () => {
                outTextFrame('Произошла техническая ошибка при загрузке шаблонов.');
            })
            .then(() => $('#create-ticket-loading-templates').remove());
    } else {
        getHDTemplates()
            .then(response => {
                global.hdSettings.helpdeskTemplatesJSON = response.result;
                global.hdSettings.helpdeskTemplatesJSON.sort(compareTemplatesNames);
                return getHDTags();
            }, () => {
                outTextFrame('Произошла техническая ошибка при загрузке шаблонов.');
            })
            .then(tags => {
                if (tags) {
                    global.hdSettings.helpdeskTagsJSON = tags;
                    renderList();
                }
            }, () => {
                outTextFrame('Произошла техническая ошибка при загрузке тегов.');
            })
            .then(() => $('#create-ticket-loading-templates').remove());
    }

    function renderList() {
        const templatesAll = global.hdSettings.helpdeskTemplatesJSON;
        const tagsAll = global.hdSettings.helpdeskTagsJSON;

        var btn = $('#ah-create-ticket-choose-templates');
        var list = $(btn).next();

        $(list).append('<li templatesListBack style="display: none;"><a style="font-weight: 700;">Назад</a></li>');

        templatesAll.forEach(function (temp) {
            if (!temp.isActive)
                return;

            var tempItem = getTemplateListItem(temp);

            $(list).append('<li class="ah-hidden" data-temp-id="' + temp.id + '" data-temp-parentId="' + temp.parentId + '" data-temp-haschild="' + temp.hasChild + '"><a style="overflow : hidden; text-overflow : ellipsis; position : relative; white-space : normal;">' + tempItem.number + '<span style="">' + tempItem.name + '</span><span style="float: right;">' + tempItem.arrow + '</span></a></li>');
        });


        $(list).find('li[data-temp-parentid="null"]').removeClass('ah-hidden').addClass('ah-visible');

        // обработчики
        $(list).find('li:not([templatesListBack])').click(function () {
            var tempClickedId = $(this).attr('data-temp-id');
            var tempClickedHasChild = $(this).data('tempHaschild');

            $(list).find('li').removeClass('ah-visible').addClass('ah-hidden');
            $(list).find('li[data-temp-parentId="' + tempClickedId + '"]').removeClass('ah-hidden').addClass('ah-visible');

            const curLevel = $(list).find('li.ah-visible:first').data('tempParentid');
            if (curLevel !== null) {
                $(list).find('li[templatesListBack]').show();
            }

            if (!tempClickedHasChild) {
                templatesAll.forEach(function (temp) {
                    if (temp.id == tempClickedId) {

                        var modal = $('#ah-layer-blackout-modal').find('[data-modal-info="modal-create-new-ticket"]');
                        var body = $(modal).find('.ah-modal-body');
                        var description = $(body).find('[name="create-ticket-description"]');
                        var descriptionClone = $('#ah-create-ticket-description-clone');

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
                        $('#ah-create-ticket-choose-templates').show();

                        $('#create-ticket-search-templates-input').keyup();

                        var allTags = temp.tags;
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
                            allTags.forEach(function (tagId) {
                                if (~exsistingTagIds.indexOf(tagId)) return;

                                const { name: tagName } = tagsAll.find(tag => tag.id === tagId);
                                const addedTagsLength = $(addedTagIdsBlock).find('[name^="create-ticket-tags"]').length;
                                $(addedTagIdsBlock).append('<input type="hidden" name="create-ticket-tags[' + addedTagsLength + ']" value="' + tagId + '">');
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

            const curLevel = $(list).find('li.ah-visible:first').data('tempParentid');
            if (curLevel === null) {
                $(list).find('li[templatesListBack]').hide();
            }
        });

        var searchInput = $('#create-ticket-search-templates-input');
        $(searchInput).unbind('keyup').keyup(function (e) {
            var typedText = $(this).val();
            if (!typedText) {
                $(list).find('li').removeClass('ah-visible').addClass('ah-hidden');
                $(list).find('li[data-temp-parentid="null"]').removeClass('ah-hidden').addClass('ah-visible');
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

function createTicketResizeDescription() {
    var modal = $('#ah-layer-blackout-modal').find('[data-modal-info="modal-create-new-ticket"]');
    var body = $(modal).find('.ah-modal-body');
    var description = $(body).find('[name="create-ticket-description"]');
    var descriptionClone = $('#ah-create-ticket-description-clone');

    var height = $(descriptionClone).outerHeight() + 20;
    $(description).css('height', '' + height + 'px');
}

function resetCreateTicketValues() {
    var modal = $('#ah-layer-blackout-modal').find('[data-modal-info="modal-create-new-ticket"]');
    var attachesInput = $(modal).find('[name="create-ticket-attaches[]"]');

    $(attachesInput).val('');
    $(attachesInput).parent().find('.ah-icon-paperclip').show();
    $(attachesInput).parent().find('.create-ticket-attaches-count').remove();

    var tagsList = $(modal).find('.ah-create-ticket-choose-tags-list');
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
    var descriptionClone = $('#ah-create-ticket-description-clone');
    $(description).val('');
    $(descriptionClone).text('');
    $(description).css('height', '180px');
    $(description).css('overflow', 'auto');
}

function createTicketGetHDTags() {
    getHDTags()
        .then(response => {
            global.hdSettings.helpdeskTagsJSON = response;
            createTicketAddTagHandler();
        }, () => {
            outTextFrame('Произошла техническая ошибка при тегов.');
        })
        .then(() => $('#create-ticket-loading-tags').remove());
}

function createTicketAddTagHandler() {
    var tagsAll = global.hdSettings.helpdeskTagsJSON;

    var modal = $('#ah-layer-blackout-modal').find('[data-modal-info="modal-create-new-ticket"]');
    var list = $(modal).find('.ah-create-ticket-choose-tags-list');
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

    var searchInput = $(modal).find('.ah-create-ticket-choose-tags-menu [type="text"]');
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
    var modal = $('#ah-layer-blackout-modal').find('[data-modal-info="modal-create-new-ticket"]');
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
    var modal = $('#ah-layer-blackout-modal').find('[data-modal-info="modal-create-new-ticket"]');
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
    if ($('#ah-outgoing-mail-btn').length > 0)
        return;

    switch (route) {
        case '/helpdesk/details':
            $('div.helpdesk-side-panel div.btn-group:contains(Список)').after('<input type="button" class="ah-default-btn" id="ah-outgoing-mail-btn" value="" style="" title="Создать обращение">');
            break;

        case '/users/user/info':
            $('.header__title:eq(0)').append('<input type="button" class="ah-default-btn" id="ah-outgoing-mail-btn" value="" style="height: 34px;" title="Создать обращение">');
            break;
    }

    var btnShow = $('#ah-outgoing-mail-btn');

    global.hdSettings.problems = {
        isLoaded: false,
        info: []
    };

    $(btnShow).click(function () {
        if (route === '/users/user/info') {
            if (!localStorage.getItem('agentID')) {
                getPermissions()
                    .then(({ id }) => {
                        localStorage.setItem('agentID', id);

                        if (!global.hdSettings.problems.isLoaded) {
                            getHDProblems()
                                .then(response => {
                                    global.hdSettings.problems.isLoaded = true;
                                    global.hdSettings.problems.info = response;
                                    showCreateNewTicketWindow();
                                }, error => {
                                    console.log(error);
                                })
                        } else {
                            showCreateNewTicketWindow();
                        }
                    }, () => {
                        localStorage.setItem('agentID', null);
                    });
                return;
            }

            if (!global.hdSettings.problems.isLoaded) {
                getHDProblems()
                    .then(response => {
                        global.hdSettings.problems.isLoaded = true;
                        global.hdSettings.problems.info = response;
                        showCreateNewTicketWindow();
                    }, error => {
                        console.log(error);
                    });
                return;
            }

            showCreateNewTicketWindow();
        } else {
            showCreateNewTicketWindow();
        }

    });
}
function showCreateNewTicketWindow() {
    var modal = $('#ah-layer-blackout-modal').find('[data-modal-info="modal-create-new-ticket"]');
    $(modal).show();
    $('#ah-layer-blackout-modal').addClass('ah-layer-flex');
    $('#ah-layer-blackout-modal').addClass('ah-layer-y-scroll');
    showModal();

    let helpdeskProblems = getHelpdeskProblems() || global.hdSettings.problems.info;

    if (!helpdeskProblems) {
        helpdeskProblems = [];
    }

    const $themesSelect = $('[name="create-ticket-theme"]');
    $themesSelect.html('');
    $themesSelect.append('<option value="" hidden="">--</option><');

    const problemsArr = helpdeskProblems;
    problemsArr.forEach(function (problem) {
        if (!problem.parentId && !problem.isArchive) {
            $themesSelect.append('<option value="' + problem.id + '" style="color: #000;">' + problem.name + '</option>');
        }
    });

    substituteCreateTicketValues();
}
function substituteCreateTicketValues() {
    var sourceId = 2;

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

    var modal = $('#ah-layer-blackout-modal').find('[data-modal-info="modal-create-new-ticket"]');
    $(modal).find('[name="create-ticket-sourceId"]').val(sourceId);
    $(modal).find('[name="create-ticket-description"]').val(description);
    $(modal).find('[name="create-ticket-requesterEmail"]').val(requesterEmail);
    $(modal).find('[name="create-ticket-requesterName"]').val(requesterName);

    if (localStorage.getItem('ah-create-ticket-autofill')) {
        const fill = localStorage.getItem('ah-create-ticket-autofill');
        autoFillCreateTicket(fill);
    }
}

function autoFillCreateTicket(fill) {
    const modal = $('#ah-layer-blackout-modal').find('[data-modal-info="modal-create-new-ticket"]');
    const $addedTagIdsBlock = modal.find('#create-ticket-added-tag-ids');
    const $addedTagsBlock = modal.find('#create-ticket-choose-tags');
    const $dropdown = modal.find('.ah-create-ticket-dropdown');
    const $descriptionBlock = modal.find('[name="create-ticket-description"]');
    const $sourceIdBlock = modal.find('[name="create-ticket-sourceId"]');
    const $themeBlock = modal.find('[name="create-ticket-theme"]');

    $addedTagIdsBlock.find('[name^="create-ticket-tags"]').remove();
    $addedTagsBlock.find('.ah-helpdesk-tag').remove();

    $dropdown.find('.ah-create-ticket-dropdown__checkbox').remove();
    $dropdown.find('.ah-create-ticket-dropdown__item').removeAttr('data-checked');
    localStorage.setItem('ah-create-ticket-autofill', fill);

    switch (fill) {
        case 'callcenter':
            // tag callcenter
            $addedTagIdsBlock.append('<input type="hidden" name="create-ticket-tags[0]" value="1521">');
            $addedTagsBlock.append('<div class="ah-helpdesk-tag"><span class="ah-helpdesk-tag-label">callcenter</span><button type="button" class="ah-helpdesk-tag-remove">×</button></div>');
            createTicketRemoveTagBtnHandler();

            // description
            $descriptionBlock.val('');

            // theme
            $themeBlock.val('').change();

            // sourceId
            $sourceIdBlock.val(2); // support@avito.ru
            break;

        case 'c2c':
            // tag delivery_call
            $addedTagIdsBlock.append('<input type="hidden" name="create-ticket-tags[0]" value="1549">');
            $addedTagsBlock.append('<div class="ah-helpdesk-tag"><span class="ah-helpdesk-tag-label">delivery_call</span><button type="button" class="ah-helpdesk-tag-remove">×</button></div>');
            createTicketRemoveTagBtnHandler();

            // description
            $descriptionBlock.val('Телефонное обращение в службу поддержки Пользователей');

            // theme
            $themeBlock.val(79).change();

            // sourceId
            $sourceIdBlock.val(7); // dostavkasupport@avito.ru
            break;

        case 'claimline':
            // tag claim_call
            $addedTagIdsBlock.append('<input type="hidden" name="create-ticket-tags[0]" value="1481">');
            $addedTagsBlock.append('<div class="ah-helpdesk-tag"><span class="ah-helpdesk-tag-label">claim_call</span><button type="button" class="ah-helpdesk-tag-remove">×</button></div>');
            createTicketRemoveTagBtnHandler();

            // description
            $descriptionBlock.val('Телефонное обращение в службу поддержки Пользователей');

            // theme
            $themeBlock.val('').change();

            // sourceId
            $sourceIdBlock.val(2); // support@avito.ru
            break;
    }

    const icon = document.createElement(`span`);
    icon.className = `glyphicon glyphicon-ok text-success ah-create-ticket-dropdown__checkbox`;

    const fillItem = $dropdown.find(`.ah-create-ticket-dropdown__item[data-fill=${fill}]`);
    fillItem.append(icon);
    fillItem.attr('data-checked', 'true');
}

function searchHDUserNameInTickets(mail) {

    mail = encodeURIComponent(mail);
    var url = `${global.connectInfo.adm_url}/helpdesk/api/1/ticket/search?p=1&sortField=createdTxtime&sortType=desc&requesterEmail="${mail}"&statusId%5B%5D=&problemId%5B%5D=&tags%5B%5D=`;

    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.send();

    $('#ah-loading-layer').show();

    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 && xhr.status == 200) {
            $('#ah-loading-layer').hide();
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
            $('#ah-loading-layer').hide();
            setTimeout(function () {
                alert('Произошла техническая ошибка.\n' + xhr.status + ', ' + xhr.statusText + '');
            }, 100);
        }
    }
}
//---------- Создание обращения ----------//

function getHdLeftPanelHeaders() {
    return document.querySelectorAll('.col-xs-3:first-child h4');
}

// проверка оверлея в хелпдеске
function helpdeskLoadingEnd() {
    const timeLimitMs = 10000;
    const start = Date.now();

    return new Promise(function (resolve, reject) {
        const timer = setInterval(() => {
            const loader = document.querySelector('.helpdesk-loading');
            if (!loader) {
                clearInterval(timer);
                reject('No Loader');
                return;
            }

            if (!loader.classList.contains('helpdesk-loading_visible')) {
                clearInterval(timer);
                resolve();
            }

            const now = Date.now();
            if ((now - start) > timeLimitMs) {
                clearInterval(timer);
                reject('Timeout');
            }
        }, 50);
    });
}