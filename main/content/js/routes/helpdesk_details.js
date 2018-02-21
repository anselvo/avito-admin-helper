//---------- Tags ----------//
function addTags() {
    $('#ah-tags-btn').detach();

    let allPanelHeaders = getHdLeftPanelHeaders();
    let classifHeader = [].find.call(allPanelHeaders, singleItem => singleItem.firstChild.data === 'Классификация');
    let allLabels = $(classifHeader).next().find('tr td:first-child');
    let tagLabel = [].find.call(allLabels, singleItem => singleItem.firstChild.data === 'Теги');

    $(tagLabel).append('<button id="ah-tags-btn" type="button" class="ah-default-btn" style="" title="Выбрать теги">Выбор</button>');

    $('#ah-tags-btn').click(function() {
        if (!global.hdSettings.helpdeskTags) {
            alert('Теги еще не загрузились.\nПопробуйте подождать несколько секунд и повторить попытку.\nЕсли проблема сохраняется в течение длительного времени, попробуйте перезагрузить страницу.');
            return;
        }
        if (global.hdSettings.helpdeskTags == 'FatalError') {
            alert('Произошла техническая ошибка: не удалось загрузить теги. Попробуйте перезагрузить страницу.');
            return;
        }
        showTagsPopup();
    });
}
function showTagsPopup() {
    var popup = $('div.ah-tags-popup');

    $('#ah-layer-blackout-popup').addClass('ah-layer-flex');
    $(popup).show();
    showModal();
}

function renderTagsPopup() {
    // console.log(set);
    // $('div.ah-tags-popup').detach();

    $('#ah-layer-blackout-popup').append('<div class="ah-tags-popup ah-default-popup" style="display: none; min-width: 0px;"></div>');

    // хедер попапа тегов
    $('div.ah-tags-popup').append('<div class="ah-tags-popup-header"></div>');

    // Help
    $('div.ah-tags-popup-header').append('<span class="ah-tooltip">Справка<ul></ul></span>');

    var help = {
        list: [
            'Можно добавлять сразу несколько тегов, отметив их и нажав "Применить"',
            'Можно добавить один тег, нажав "+" рядом с ним'
        ]
    }

    var itemEnd = ';'
    help.list.forEach(function(item, i, arr) {
        if (i == arr.length - 1) itemEnd = '.';
        $('div.ah-tags-popup-header .ah-tooltip ul').append('<li>'+ item +''+ itemEnd +'</li>');
    });
    $('div.ah-tags-popup-header').append('<button type="button" class="ah-tags-popup-close">x</button>');

    $('.ah-tags-popup-header .ah-tags-popup-close').click(function() {
        $('#ah-layer-blackout-popup').removeClass('ah-layer-flex');
        $('div.ah-default-popup').hide();
        closeModal();
    });
    // контейнер для групп тегов
    $('div.ah-tags-popup').append('<div class="ah-tags-group-container"></div>');

    global.hdSettings.helpdeskTags.set.popup.columns.forEach(function(column) {
        $('div.ah-tags-group-container').append('<div class="ah-tags-column" data-column-id="'+ column.id +'"></div>');
        column.groups.forEach(function(group) {

            global.hdSettings.helpdeskTags.tagGroups.forEach(function(globalGroup) {
                if (group.id == globalGroup.id && globalGroup.is_active) {
                    $('div.ah-tags-column[data-column-id="'+ column.id +'"]').append('<div class="ah-tags-group" data-tags-group-id="'+ group.id +'"><ul class="ah-default-list"></ul></div>');
                }
            });
            group.tags.forEach(function(tag) {

                global.hdSettings.helpdeskTags.tags.forEach(function(globalTag) {
                    if (tag == globalTag.avito_desk_id && globalTag.is_active) {
                        $('div.ah-tags-group-container [data-column-id="'+ column.id +'"] [data-tags-group-id="'+ group.id +'"] ul').append('<li class="ah-default-list-item" title="'+ globalTag.description +'"><input type="checkbox" id="popup-tag-'+ globalTag.avito_desk_id +'" value="'+ globalTag.avito_desk_id +'" class="ah-tags-checkbox"><label for="popup-tag-'+ globalTag.avito_desk_id +'"><span>'+ globalTag.name +'</span></label><button class="ah-fast-tag-add-btn" data-tag-id="'+ globalTag.avito_desk_id +'" data-tag-name="'+ globalTag.name +'">+</button></li>');
                    }
                });
            });
        });
    });

    // футер попапа тегов
    $('div.ah-tags-popup').append('<div class="ah-tags-popup-footer"></div>');

    // баттон добавления тегов
    $('div.ah-tags-popup-footer').append('<button class="ah-action-btn" id="sh-add-tag-btn" title="" style="">Применить</button>');

    // запоминаем состояния чекбоксов в локалсторадж
    if (!localStorage.getItem('/helpdesk/popupTags')) {
        localStorage.setItem('/helpdesk/popupTags', '{"tags": []}' );
    }
    var LSObj = JSON.parse(localStorage.getItem('/helpdesk/popupTags'));

    $('input.ah-tags-checkbox').each(function(i, input) {
        LSObj.tags.forEach(function(tagId) {
            if (+$(input).val() == tagId) {
                $(input).prop('checked', true);
            }
        });
    });


    $('input.ah-tags-checkbox').click(function() {
        var btnTagId = +$(this).val();

        if ( $(this).prop('checked') ) {
            LSObj.tags.push(btnTagId);
        } else {
            LSObj.tags.forEach(function(tagId, i, arr) {
                if (tagId == btnTagId) {
                    arr.splice(i, 1);
                }
            });
        }

        localStorage.setItem('/helpdesk/popupTags', JSON.stringify(LSObj) );
    });

    popupTagsAddListener();
}

function popupTagsAddListener() { // обработчик попапа тегов
    // быстрая простановка тегов
    $('button.ah-fast-tag-add-btn').click(function() {
		$('#ah-loading-layer').show();
        checkTagInTicket($(this).data('tagId'));
        $('#ah-layer-blackout-popup').removeClass('ah-layer-flex');
        $('div.ah-tags-popup').hide();
        closeModal();
    });

    // массовая простановка тегов
    $('#sh-add-tag-btn').click(function() {
        var currentTagsArr = [];
        for (var i = 0; i < $('input[name ^= "tags"]').length; i++) {
            currentTagsArr[i] = $('input[name ^= "tags"]:eq(' + i + ')').val();
        }
        // создаем массив из айдишников отмеченных тегов, айдишники хранятся в значениях value
        var checkboxCount = $('input.ah-tags-checkbox:checked').length;

        var newTagsArr = [];
        for (var i = 0; i < checkboxCount; i++) {
            newTagsArr.push( $('input.ah-tags-checkbox:checked').slice(i, i + 1).val() );
        }
        // console.log('newTagsArr ' + newTagsArr);

        // проверяем, проставлен ли хотя бы один из выбранных тегов
        var tagsIsAlreadyAdded = '';
        for (var i = 0; i < currentTagsArr.length; i++) {
            for (var j = 0; j < newTagsArr.length; j++) {
                if (currentTagsArr[i] == newTagsArr[j]) {
                    tagsIsAlreadyAdded += ', ' + $('input[value = "' + newTagsArr[j] + '"] + label').text().toUpperCase();
                }
            }
        }

        if (tagsIsAlreadyAdded != '') {
            var tagsCountTmp = tagsIsAlreadyAdded.split(', ');

            if (tagsCountTmp.length == 2) {
                alert('Этот тег ' + tagsIsAlreadyAdded.slice(2) + ' уже есть в тикете.');
            } else alert('Эти теги ' + tagsIsAlreadyAdded.slice(2) + ' уже есть в тикете.');

            return;
        }

        newTagsArr = newTagsArr.join(', ');

        if (newTagsArr.length != 0) {
			$('#ah-loading-layer').show();
            addTagToTicket(newTagsArr);
            $('div.ah-tags-popup').hide();
            $('#ah-layer-blackout-popup').removeClass('ah-layer-flex');
            closeModal();
        } else alert('Выберите теги');

    });
}

// БЫСТРЫЕ КНОПКИ ---
function addQuickButtons() {
    $('div.sh-quick-btns-wrapper').remove();

    checkLocalStorageQBkey();

    $('h4:contains(Участники)').before('<div class="sh-quick-btns-wrapper" style="display: none; box-sizing: border-box; width: 100%; padding-top: 10px;"></div>');

    $('div.sh-quick-btns-wrapper').append('<div class="sh-quick-btns-header" style=""></div>');

    $('div.sh-quick-btns-header').append('<div class="ah-line-title"><button type="button" class="ah-default-btn ah-btn-small" id="ah-quick-btns-settings" style="">Quick buttons</button></div>');

    $('div.sh-quick-btns-wrapper').append('<div id="side-panel-qb-holder-wrapper"><div id="side-panel-qb-holder" class="ah-qb-holder" style="margin-top: 4px;"></div></div>');

    $('div.sh-quick-btns-wrapper').append('<hr class="sh-additional-line-bottom" style="margin-top: 4px; margin-bottom: 0;">');

    var LSobj = JSON.parse(localStorage.getItem('/helpdesk/quickbuttons'));

    let allPanelHeaders = getHdLeftPanelHeaders();
    let classifHeader = [].find.call(allPanelHeaders, singleItem => singleItem.firstChild.data === 'Классификация');
    let classifTable = $(classifHeader).next().find('table');
    let membersHeader = [].find.call(allPanelHeaders, singleItem => singleItem.firstChild.data === 'Участники');

    // позиция
    if (LSobj.position == 'top') {
        $(membersHeader).before( $('div.sh-quick-btns-wrapper') );
    } else {
        $(classifTable).after( $('div.sh-quick-btns-wrapper') );
    }

    // отрисовка кнопок
    var QBHolder = $('#side-panel-qb-holder');
    LSobj.buttons.forEach(function(btn) {
        $(QBHolder).append('<button type="button" class="ah-qb-btn" style="background-color: '+ btn.bgColor +'; color: '+ btn.textColor +';" data-full-obj="'+ JSON.stringify(btn).replace(/"/g, "&quot;") +'" title="'+ btn.description +'"><span>'+ btn.name +'</span></button>');
    });

    // отображение QB
    // если нет кнопок или они скрыты, скрываем нижнюю линию и кнопки.
    var btnsCount = $(QBHolder).find('button').length;
    if (!btnsCount || !LSobj.isVisible) {
        $('.sh-quick-btns-wrapper .sh-additional-line-bottom').hide();
        $(QBHolder).hide();
    }

    // обработчики
    // настройки
    $('#ah-quick-btns-settings').click(function() {
        if (!global.hdSettings.helpdeskTags) {
            alert('Теги еще не загрузились.\nПопробуйте подождать несколько секунд и повторить попытку.\nЕсли проблема сохраняется в течение длительного времени, попробуйте перезагрузить страницу.');
            return;
        }
        if (global.hdSettings.helpdeskTags == 'FatalError') {
            alert('Произошла техническая ошибка: не удалось загрузить теги. Попробуйте перезагрузить страницу.');
            return;
        }

        showQBWindow();
    });

    // Кнопки
    var btns = $(QBHolder).find('.ah-qb-btn');
    $(btns).unbind('click').click(function() {
		$('#ah-loading-layer').show();
        sidePanelQBHandler( JSON.parse($(this).attr('data-full-obj')) );
    });

    $('div.sh-quick-btns-wrapper').show();
}

function showQBWindow() {
    $('[data-modal-info="qb-modal-create"]').show();
    $('#ah-layer-blackout-modal').addClass('ah-layer-flex ah-layer-y-scroll');
    showModal();

    var modal = $('[data-modal-info="qb-modal-create"]');
    var closeBtn = $(modal).find('.ah-modal-close');

    $('.ah-modal-close').click(function() {
        $('[data-modal-info]').hide();
        $('#ah-layer-blackout-modal').removeClass('ah-layer-flex ah-layer-y-scroll');
        closeModal();
    });
}

function sidePanelQBHandler(btn) {
    if (!btn.problemId) { // только теги
        addTagToTicket(btn.tags.join(', '));
        return;
    }
    if (!btn.tags.length) { // только тема
        changeThemeInTicket(btn);
        return;
    }

    changeThemeAndTagsInTicket(btn); // теги и тема
}

function changeThemeInTicket(btn, currentYOffset) {
    var offset;
    if (!currentYOffset && currentYOffset !== 0) {
        offset = window.pageYOffset;
    } else {
        offset = currentYOffset;
    }

    let allPanelHeaders = getHdLeftPanelHeaders();
    let classifHeader = [].find.call(allPanelHeaders, singleItem => singleItem.firstChild.data === 'Классификация');
    let allLabels = $(classifHeader).next().find('tr td:first-child');
    let problemLabel = [].find.call(allLabels, singleItem => singleItem.firstChild.data === 'Тема / Проблема');
    var problemParent = problemLabel.parentNode;

    let clickFog = $('.helpdesk-click-fog');
    if ($(clickFog).length === 0) {
        problemParent.querySelector('.pseudo-link').click();
    }

    setTimeout(() => {
        let problemInput = problemParent.querySelector('[name="problemId"]');
        problemInput.value = btn.problemId;

        let clickFog = $('.helpdesk-click-fog');
        $(clickFog).click();

        window.scrollTo(0, offset);
        $('#ah-loading-layer').hide();
    }, 10);
}

function changeThemeAndTagsInTicket(btn) {
    addTagToTicket(btn.tags.join(', '), btn);
}

function updateQBInfo() {
    if ( !localStorage.getItem('/helpdesk/quickbuttons') ) {
        return;
    }

    var LSobj = JSON.parse(localStorage.getItem('/helpdesk/quickbuttons'));

    // проверка длины названий кнопок ---
    LSobj.buttons.forEach(function(btn) {
        let name = btn.name;
        if (name.length > 30) {
            name = name.substr(0, 30);
            btn.name = name;
            // console.log(btn.name);
        }
    });
    // проверка длины названий кнопок +++

    // синхронизация тегов ---
    var allTagsGlobal = [];
    global.hdSettings.helpdeskTags.tags.forEach(function(tag) {
        if (tag.is_active) {
            allTagsGlobal.push(tag.avito_desk_id);
        }
    });

    var allTagsInSet = [];
    global.hdSettings.helpdeskTags.set.QB.groups.forEach(function(group) {
        group.tags.forEach(function(tagId) {
            allTagsInSet.push(tagId);
        });
    });

    var removedTags = [];
    LSobj.buttons.forEach(function(btn) {
        for (var i = 0; i < btn.tags.length; i++) {
            let arr = btn.tags;
            let tagId = btn.tags[i];

            if (allTagsGlobal.indexOf(tagId) == -1 || allTagsInSet.indexOf(tagId) == -1) {
                removedTags.push({
                    id: tagId,
                    QBname: btn.name
                });
                arr.splice(i, 1);
                i--;
            }
        }
    });

    if (removedTags.length > 0) {
        let tagNames = [];
        removedTags.forEach(function(tag) {
            tagNames.push('"'+ tag.QBname+ '"');
        });

        tagNames = unique(tagNames);

        alert('Один или несколько тегов были удалены из созданных/импортированных Quick Buttons. Названия кнопок перечислены ниже:\n - '+ tagNames.join('\n - '));
    }
    // синхронизация тегов +++

    localStorage.setItem('/helpdesk/quickbuttons', JSON.stringify(LSobj));

}

function renderQBWindow() {
    $('#ah-layer-blackout-modal').append('<div class="ah-modal-content" style="display: none; background-color: transparent; box-shadow: none; border: none" data-modal-info="qb-modal-create"><div class="ah-modal-container" style=""></div></div>');

    $('[data-modal-info="qb-modal-create"] .ah-modal-container').append('<div id="sh-quick-btns-create" style="min-width: 450px; max-width: 550px;" class="ah-modal-column"></div>');
    // header
    $('#sh-quick-btns-create').append('<div class="ah-modal-header"><span class="ah-modal-title">Создание кнопки</span><button type="button" class="ah-modal-close">x</button></div>');

    var modal = $('#ah-layer-blackout-modal').find('[data-modal-info="qb-modal-create"]');
    var closeBtn = $(modal).find('.ah-modal-close');
    $(closeBtn).click(function() {
        $('[data-modal-info="qb-modal-settings"]').detach();
        resetCreateQBModal();
    });

    $('#sh-quick-btns-create').append('<div class="ah-modal-body" style=""></div>');

    // ПРОБЛЕМЫ
    $('#sh-quick-btns-create .ah-modal-body').append('<div class="ah-field-group"><div class="ah-field-title">Тип проблемы</div><div class="ah-btn-group ah-field-flex" style=""><select class="ah-form-control ah-btn-group-left ah-flex-grow-extended" id="sh-qb-problems-select" style="margin-bottom: 0;"></select><button type="button" class="ah-default-btn ah-btn-group-right ah-reset-all-btn" id="qb-reset-selected-problem">✕</button></div></div>');

    let helpdeskProblemsStr = global.hdSettings.helpdeskProblemsJSON;
    if (!global.hdSettings.helpdeskProblemsJSON) {
        helpdeskProblemsStr = '[]';
    }
    $('#sh-qb-problems-select').append('<option value="">Не выбрано</option>');

    let problemsArr = JSON.parse(helpdeskProblemsStr);
    problemsArr.forEach(function(problem) {
        if (problem.parentId) {
            $('#sh-qb-problems-select').append('<option value="'+ problem.id +'" data-parent-id="'+ problem.parentId +'">--'+ problem.name +'</option>');
        }
    });
    problemsArr.forEach(function(problem) {
        if (!problem.parentId) {
            $('#sh-qb-problems-select option[data-parent-id="'+ problem.id +'"]:eq(0)').before('<option disabled></option><option value="'+ problem.id +'" disabled>'+ problem.name +'</option>');
        }
    });

    // ТЕГИ
    $('#sh-quick-btns-create .ah-modal-body').append('<div class="ah-field-group"><div class="ah-field-title">Теги</div><div class="ah-btn-group ah-field-flex" style=""><button type="button" class="ah-default-btn ah-btn-group-left ah-flex-grow-extended" id="sh-qb-tags-select-btn" style=""><span class="ah-btn-name-left">Не выбрано</span><b class="ah-caret-right"></b></button><button type="button" class="ah-default-btn ah-btn-group-right ah-reset-all-btn" id="qb-reset-all-selected-tags">✕</button><ul id="ah-qb-tags-multiselect" class="ah-dropdown-menu ah-multiselect" style="top: 35px; width: 100%;"></ul></div></div>');

    var allTagsSettingsGlobal = global.hdSettings.helpdeskTags;
    if (!global.hdSettings.helpdeskTags) {
        allTagsSettingsGlobal = [];
    }
    allTagsSettingsGlobal.set.QB.groups.forEach(function(group) {
        allTagsSettingsGlobal.tagGroups.forEach(function(globalGroup) {
            if (group.id == globalGroup.id && globalGroup.is_active) {
                $('#ah-qb-tags-multiselect').append('<li class="ah-group-list-item" data-tags-group-id="'+ globalGroup.id +'"><label data-value="'+ globalGroup.id +'">'+ globalGroup.name +'<span class="ah-caret"></span></label><ul class="ah-select-field-sub"></ul></li>');
            }
        });

        group.tags.forEach(function(tag) {
            allTagsSettingsGlobal.tags.forEach(function(globalTag) {
                if (tag == globalTag.avito_desk_id && globalTag.is_active) {
                    $('#ah-qb-tags-multiselect li[data-tags-group-id="'+ group.id +'"] ul').append('<li data-value="'+ globalTag.avito_desk_id +'"><label data-value="'+ globalTag.avito_desk_id +'"><input type="checkbox" value="'+ globalTag.avito_desk_id +'"><span>'+ globalTag.name +'</span></label></li>');
                }
            });
        });
    });

    // скрыть/раскрыть список
    $('#sh-qb-tags-select-btn').click(function() {
        dropdownCall($(this));
        return false;
    });

    // скрыть/раскрыть подменю
    $('#ah-qb-tags-multiselect .ah-group-list-item > label').click(function() {
        $(this).siblings('.ah-select-field-sub').toggle();
        $(this).toggleClass('ah-dropup');
    });

    // счетчик отмеченных
    $('#ah-qb-tags-multiselect .ah-select-field-sub [type="checkbox"]').change(function() {
        let count = $('#ah-qb-tags-multiselect [type="checkbox"]:checked').length;
        if (count != 0) {
            $('#sh-qb-tags-select-btn span').text('Выбрано: '+ count +'');
        } else {
            $('#sh-qb-tags-select-btn span').text('Не выбрано');
        }
    });

    // Название
    $('#sh-quick-btns-create .ah-modal-body').append('<div class="ah-field-group"><div class="ah-field-title">Название</div><input type="text" class="ah-form-control" id="sh-qb-name-input" maxlength="30"></div>');

    // Описание
    $('#sh-quick-btns-create .ah-modal-body').append('<div class="ah-field-group"><div class="ah-field-title">Описание</div><textarea type="text" class="ah-form-control" id="sh-qb-description-input" style="height: 40px; resize: vertical;" maxlength="1000"></textarea></div>');

    // Цвет фона
    var styleColor = {
        black: '#000',
        grey: '#777'
    };

    var bgColors = [{
        value: '#5cb85c',
        name: 'Зеленый',
        styleColor: styleColor.black
    },{
        value: '#337ab7',
        name: 'Синий',
        styleColor: styleColor.black
    },{
        value: '#d9534f',
        name: 'Красный',
        styleColor: styleColor.black
    },{
        value: '#e4771f',
        name: 'Оранжевый',
        styleColor: styleColor.black
    },{
        value: '#777777',
        name: 'Серый',
        styleColor: styleColor.black
    },{
        value: '',
        name: 'Свой',
        styleColor: styleColor.grey
    }];
    $('#sh-quick-btns-create .ah-modal-body').append('<div class="ah-field-group ah-horizontal-group-united" style="padding: 0 10px 0 0; margin-bottom: 0;"><div class="ah-field-title" style="">Цвет фона</div><div class="ah-field-horizontal ah-field-flex"><input type="color" class="ah-default-btn" id="sh-qb-bg-color-input" value="#5cb85c" style=""><select class="ah-form-control ah-choose-color-select" id="sh-qb-bg-color-select" style=""></select></div></div>');

    bgColors.forEach(function(color) {
        $('#sh-qb-bg-color-select').append('<option value="'+ color.value +'" style="color: '+ color.styleColor +'">'+ color.name +'</option>');
    });
    $('#sh-qb-bg-color-select').change(function() {
        let selectedColor = $(this).val();

        if (!selectedColor) {
            $(this).siblings('[type="color"]').click();
            return;
        }
        $('#sh-qb-bg-color-input').val(selectedColor);
        $('#sh-qb-bg-color-input').change();
    });

    // Цвет текста
    var textColors = [{
        value: '#ffffff',
        name: 'Белый',
        styleColor: styleColor.black
    },{
        value: '#000000',
        name: 'Черный',
        styleColor: styleColor.black
    },{
        value: '',
        name: 'Свой',
        styleColor: styleColor.grey
    }];

    $('#sh-quick-btns-create .ah-modal-body').append('<div class="ah-field-group ah-horizontal-group-united" style="padding: 0 0 0 10px; margin-bottom: 0;"><div class="ah-field-title" style="">Цвет текста</div><div class="ah-field-horizontal ah-field-flex"><input type="color" class="ah-default-btn" id="sh-qb-text-color-input" value="#ffffff" style=""><select class="ah-form-control ah-choose-color-select" id="sh-qb-text-color-select" style=""></select></div></div>');

    textColors.forEach(function(color) {
        $('#sh-qb-text-color-select').append('<option value="'+ color.value +'" style="color: '+ color.styleColor +'">'+ color.name +'</option>');
    });
    $('#sh-qb-text-color-select').change(function() {
        let selectedColor = $(this).val();

        if (!selectedColor) {
            $(this).siblings('[type="color"]').click();
            return;
        }
        $('#sh-qb-text-color-input').val(selectedColor);
        $('#sh-qb-text-color-input').change();
    });

    // обработка селекта
    $('#sh-quick-btns-create [type="color"]').click(function() {
        $(this).siblings('.ah-form-control').find('option[value=""]').prop('selected', true);
    });

    // Распорка
    $('#sh-quick-btns-create .ah-modal-body').append('<div class="ah-clearfix"></div>');

    // Футер
    $('#sh-quick-btns-create').append('<div class="ah-modal-footer"></div>');
    $('#sh-quick-btns-create .ah-modal-footer').append('<button type="button" class="ah-default-btn" id="settings-qb" style="float: left;">К настройкам</button><button type="button" class="ah-action-btn" id="create-qb">Создать</button>');

    // PREVIEW
    addQBPreview();

    var tagsPrev = $('#ah-qb-preview-added-content [data-qb-preview-info="tags"]');
    var problemPrev = $('#ah-qb-preview-added-content [data-qb-preview-info="problem"]');
    // сбросить все выбранные теги
    $('#qb-reset-all-selected-tags').click(function() {
        $('#ah-qb-tags-multiselect .ah-select-field-sub [type="checkbox"]').prop('checked', false);
        $('#sh-qb-tags-select-btn span').text('Не выбрано');
        $(tagsPrev).text('-');
    });
    // сбросить выбранную тему / проблему
    $('#qb-reset-selected-problem').click(function() {
        $('#sh-qb-problems-select option[value=""]').prop('selected', true);
        $(problemPrev).text('-');
    });

    // Создание
    $('#create-qb').click(function() {
        createQB();
    });
    // Настройки
    $('#settings-qb').click(function() {
        showQBSettings();
    });
}

function addQBPreview() {
    var nameInput = $('#sh-qb-name-input');
    var descr = $('#sh-qb-description-input');
    var bgColorInput = $('#sh-qb-bg-color-input');
    var textColorInput = $('#sh-qb-text-color-input');
    var problemSelect = $('#sh-qb-problems-select');
    var tagsList = $('#ah-qb-tags-multiselect .ah-select-field-sub [type="checkbox"]');

    $('[data-modal-info="qb-modal-create"] .ah-modal-container').append('<div id="ah-qb-preview" class="ah-modal-column"></div>');

    // header
    $('#ah-qb-preview').append('<div id="ah-qb-preview-header">Превью</div>');

    $('#ah-qb-preview').append('<div id="ah-qb-preview-btn-holder"><button type="button" class="ah-qb-btn" id="ah-qb-preview-btn" style="background-color: '+ $(bgColorInput).val() +'; color: '+ $(textColorInput).val() +';"><span>-</span></button></div>');

    $('#ah-qb-preview').append('<div class="ah-modal-table-holder" id="ah-qb-preview-added-content"><table></table></div>');
    $('#ah-qb-preview-added-content table').append('<tr><td>Тема / Проблема</td><td data-qb-preview-info="problem">-</td></tr><tr><td>Теги</td><td data-qb-preview-info="tags">-</td></tr>');

    // Обработка Превью
    var btnPrev = $('#ah-qb-preview-btn');
    var btnPrevText = $(btnPrev).find('span');
    var problemPrev = $('#ah-qb-preview-added-content [data-qb-preview-info="problem"]');
    var tagsPrev = $('#ah-qb-preview-added-content [data-qb-preview-info="tags"]');

    // название
    $(nameInput).keyup(function() {
        $(btnPrevText).text( $(this).val() );
        if (!$(btnPrevText).text()) {
            $(btnPrevText).text('-');
        }
    });

    // описание
    $(descr).keyup(function() {
        let curDesrc = $(this).val();
        $(btnPrev).attr('title', ''+ curDesrc +'');
    });

    // цвет
    $(bgColorInput).change(function() {
        $(btnPrev).css('background-color', ''+ $(this).val() +'');
    });
    $(textColorInput).change(function() {
        $(btnPrev).css('color', ''+ $(this).val() +'');
    });

    // тема / проблема
    $(problemSelect).change(function() {
        let problem = $(this).find('option:selected');
        if (!$(problem).val()) {
            $(problemPrev).text('-');
            return;
        }

        let problemParentId = +$(problem).attr('data-parent-id');

        let theme = $(this).find('option[value="'+ problemParentId +'"]');

        $(problemPrev).text( $(theme).text() +' / '+ $(problem).text().slice(2) );
    });

    // теги
    $(tagsList).change(function() {
        var checked = $('#ah-qb-tags-multiselect [type="checkbox"]:checked');
        if ($(checked).length == 0) {
            $(tagsPrev).text('-');
            return;
        }

        let checkedNames = [];
        $(checked).each(function(i, item) {
            checkedNames.push( $(item).siblings('span').text() );
        });

        $(tagsPrev).text(checkedNames.join(', '));
    });
}
// создание---
function createQB() {
    // поля
    var problem = $('#sh-qb-problems-select option:selected');
    var tags = $('#ah-qb-tags-multiselect .ah-select-field-sub [type="checkbox"]:checked');
    var name = $('#sh-qb-name-input');
    var descr = $('#sh-qb-description-input');
    var bgColor = $('#sh-qb-bg-color-input');
    var textColor = $('#sh-qb-text-color-input');

    // Проверка полей ---
    if ( !$(problem).val() && $(tags).length == 0) {
        alert ('Выберите проблему и/или тег(и).');
        return;
    }
    $(name).val( $(name).val().replace(/^\s+/g, '') );
    if (!$(name).val()) {
        alert ('Введите название кнопки.');
        return;
    }
    // Проверка полей +++


    // создание кнопки
    checkLocalStorageQBkey();
    var LSobj =  JSON.parse(localStorage.getItem('/helpdesk/quickbuttons'));

    var existingButtons = LSobj.buttons;
    var existingBtnIds = [];
    LSobj.buttons.forEach(function(btn) {
        existingBtnIds.push(btn.id);
    });

    var id = (existingButtons.length != 0) ? (Math.max.apply(null, existingBtnIds) + 1) : 0;
    var order = id + 1;

    var checkedTagIds = [];
    $(tags).each(function(i, tag) {
        checkedTagIds.push( +$(tag).val() );
    });
    var theme;
    var problemParentId = +$(problem).attr('data-parent-id');
    theme = $('#sh-qb-problems-select').find('option[value="'+ problemParentId +'"]');

    var newBtn = {
        id: id,
        theme: $(theme).text(),
        problem: ( $(problem).val() ) ? $(problem).text().slice(2) : '',
        problemId: +$(problem).val(),
        tags: checkedTagIds,
        name: $(name).val(),
        description: $(descr).val(),
        bgColor: $(bgColor).val(),
        textColor: $(textColor).val(),
        order: order
    }

    var existsBtnInfo;
    if (existsBtnInfo = isQBAlreadyExists(newBtn)) {
        alert('Ошибка: кнопка с такими параметрами уже существует.\nНазвание кнопки - "'+ existsBtnInfo.name +'".');
        return;
    }


    LSobj.buttons.push(newBtn);
    localStorage.setItem('/helpdesk/quickbuttons', JSON.stringify(LSobj));
    outTextFrame('Кнопка "'+ newBtn.name +'" создана.');
    addQuickButtons();
}

function isQBAlreadyExists(newBtn) {
    var LSobj =  JSON.parse(localStorage.getItem('/helpdesk/quickbuttons'));

    var sameBtnInfo = false;

    LSobj.buttons.forEach(function(btn) {
        if (btn.problemId == newBtn.problemId && isArraysEqual(btn.tags, newBtn.tags)) {
            sameBtnInfo = btn;
        }
    });

    return sameBtnInfo;
}
// создание+++

// настройки ---
function showQBSettings() {
    $('[data-modal-info="qb-modal-create"]').hide();

    $('#ah-layer-blackout-modal').append('<div class="ah-modal-content" style="display: none; background-color: transparent; box-shadow: none; border: none" data-modal-info="qb-modal-settings"><div class="ah-modal-container" style=""></div></div>');

    $('[data-modal-info="qb-modal-settings"] .ah-modal-container').append('<div id="ah-qb-settings-modal" style="min-width: 450px;" class="ah-modal-column"></div>');

    var contaiter = $('#ah-qb-settings-modal');
    // header
    $(contaiter).append('<div class="ah-modal-header"><span class="ah-modal-title">Настройки Quick Buttons</span><button type="button" class="ah-modal-close">x</button></div>');
    $('[data-modal-info="qb-modal-settings"] .ah-modal-close').click(function() {
        $('[data-modal-info="qb-modal-settings"]').detach();
        $('#ah-layer-blackout-modal').removeClass('ah-layer-flex ah-layer-y-scroll');
        closeModal();
        resetCreateQBModal();
    });

    // Тело
    // созданные кнопки
    $(contaiter).append('<div class="ah-modal-body" style=""><div class="ah-field-group" data-filed-info="qb-all-created"><div class="ah-field-title ah-title-medium">Созданные кнопки</div><div id="ah-created-qb-holder" class="ah-qb-holder"></div></div></div>');
    setQBHolderWidth();

    checkQBObjKeys(); // добавление обязательных ключей, если их нет
    var LSobj = JSON.parse(localStorage.getItem('/helpdesk/quickbuttons'));

    LSobj.buttons.forEach(function(btn) {
        $('#ah-created-qb-holder').append('<button type="button" class="ah-qb-btn" style="background-color: '+ btn.bgColor +'; color: '+ btn.textColor +';" data-full-obj="'+ JSON.stringify(btn).replace(/"/g, "&quot;") +'" title="'+ btn.description +'"><span>'+ btn.name +'</span></button>');
    });
    // выбор действия в тайтле
    var btnNamesCreated = {
        createdBtnOrder: 'Изменить порядок',
        createdBtnRemove: 'Удалить все',
        createdBtnImportOld: 'Импорт старых'
    }
    $('[data-filed-info="qb-all-created"] .ah-field-title').append('<div class="ah-pseudo-link-dropmenu-holder" style="float: right;"><a class="ah-pseudo-link" id="qb-all-created-btn">Выбор действия<i class="ah-arrow-down ah-arrow"></i></a><ul class="ah-dropdown-menu" id="qb-all-created-dropdown" style="right: 0; min-width: 0px;"><li class="" title="Изменение порядка созданных кнопок"><a>'+ btnNamesCreated.createdBtnOrder +'</a></li><li  class="" title="Удаление всех созданных кнопок"><a>'+ btnNamesCreated.createdBtnRemove +'</a></li><li  class="" title="Поиск и импорт кнопок, которые были созданы в первой версии Quick Buttons"><a>'+ btnNamesCreated.createdBtnImportOld +'</a></li></ul></div>');
    $('#qb-all-created-btn').click(function() {
        dropdownCall($(this));
        return false;
    });

    // параметры выбранной кнопки
    var modalBody = $(contaiter).find('.ah-modal-body');
    $(modalBody).append('<div class="ah-field-group" data-filed-info="qb-params"><div class="ah-field-title ah-title-medium">Параметры кнопки <b></b></div><div class="ah-modal-table-holder" id="qb-selected-btn-params"><table style=""></table></div></div>');

    // выбор действия в тайтле
    var btnNames = {
        selBtnEdit: 'Редактировать',
        selBtnRemove: 'Удалить'
    }
    $('[data-filed-info="qb-params"] .ah-field-title').append('<div class="ah-pseudo-link-dropmenu-holder" style="float: right;"><a class="ah-pseudo-link" id="qb-change-selected-btn">Выбор действия<i class="ah-arrow-down ah-arrow"></i></a><ul class="ah-dropdown-menu" id="qb-selected-dropdown" style="right: 0; min-width: 0px;"><li class="" title="Перейти к редактированию выбранной кнопки"><a>'+ btnNames.selBtnEdit +'</a></li><li  class="" title="Удалить выбранную кнопку"><a>'+ btnNames.selBtnRemove +'</a></li></ul></div>');
    $('#qb-change-selected-btn').click(function() {
        dropdownCall($(this));
        return false;
    });

    var table = [{
        param: 'Тема / Проблема',
        dataInfo: 'problem',
        data: '-'
    },{
        param: 'Теги',
        dataInfo: 'tags',
        data: '-'
    },{
        param: 'Название',
        dataInfo: 'name',
        data: '-'
    },{
        param: 'Описание',
        dataInfo: 'description',
        data: '-'
    }];

    table.forEach(function(row) {
        $('#qb-selected-btn-params table').append('<tr><td>'+ row.param +'</td><td data-qb-selected-info="'+ row.dataInfo +'">'+ row.data +'</td></tr>');
    });

    generateQBSettings();

    // Глобальные параметры
    $(modalBody).append('<div class="ah-field-group" data-filed-info="qb-global-params"><div class="ah-field-title ah-title-medium">Глобальные параметры</div><div class="ah-modal-table-holder" id="qb-global-params-holder"><table></table></div></div>');
    $('#qb-global-params-holder table').append('<tr><td>Позиция кнопок</td><td><select class="ah-form-control" id="qb-position-select" style=""></select></td></tr>');
    var positions = [{
        name: 'Внизу',
        value: 'bottom'
    },{
        name: 'Вверху',
        value: 'top'
    }];
    positions.forEach(function(item) {
        $('#qb-position-select').append('<option value="'+ item.value +'">'+ item.name +'</option>');
    });

    $('#qb-position-select option[value="'+ LSobj.position +'"]').prop('selected', true);

    $('#qb-global-params-holder table').append('<tr><td><div class="ah-switch-wrapper ah-field-group" style=""><input type="checkbox" class="ah-switch-checkbox" id="qb-visibility-toggler"><label class="ah-switch-label" for="qb-visibility-toggler" title="Скрывать/показывать созданные кнопки" style="margin-bottom: 0; color: rgb(149, 149, 149);"><span>Скрыть кнопки</span></label></div></td><td></td></tr>');
    if (!LSobj.isVisible) {
        $('#qb-visibility-toggler').attr('checked', 'checked');
    }

    // Футер
    $(contaiter).append('<div class="ah-modal-footer"></div>');
    $(contaiter).find('.ah-modal-footer').append('<button type="button" class="ah-default-btn" id="create-qb-modal" style="float: left;">К созданию</button><a id="export-qb" class="ah-link-btn" style="padding-right: 0;" title="Экспорт текущих настроек Quick Buttons в файл">Экспорт</a><input type="file" id="import-qb" class="ah-link-btn" style="display: none;" accept="text/plain"><label for="import-qb" class="ah-link-btn" style="padding-right: 0; margin-bottom: 0;" title="Импот настроек Quick Buttons из файла"><span>Импорт</span></label>');

    // обработчики
    $('#ah-created-qb-holder .ah-qb-btn').click(function() {
        createdQBClickListener($(this));
    });

    // дропдаун во всех созданных кнопках
    $('#qb-all-created-dropdown a').click(function() {
        $('#qb-all-created-dropdown').toggleClass('ah-dropped');
        var allBtns = $('#ah-created-qb-holder .ah-qb-btn');

        switch ($(this).text()) {
            case btnNamesCreated.createdBtnOrder:
                if (allBtns.length == 0) {
                    alert('Ошибка: созданных кнопок нет.');
                    return;
                }
                changeQBOrder();
                break;

            case btnNamesCreated.createdBtnRemove:
                if (allBtns.length == 0) {
                    alert('Ошибка: созданных кнопок нет.');
                    return;
                }
                var isProceed = confirm('Вы действительно хотите удалить все созданные кнопки?');
                if (isProceed) removeAllQB();
                break;

            case btnNamesCreated.createdBtnImportOld:
                var isProceed = confirm('В случае, если старые кнопки будут найдены, и кнопок с такими же параметрами (Тема / Проблема и Теги) еще не существует, кнопки будут автоматически созданы.\nПродолжить?');
                if (isProceed) importOldQB();
                break;
        }
    });

    // дропдаун в выбранной кнопке
    $('#qb-selected-dropdown a').click(function() {
        switch ($(this).text()) {
            case btnNames.selBtnEdit:
                showEditSelectedQBParams();
                break;

            case btnNames.selBtnRemove:
                let btnName = $('#ah-created-qb-holder .ah-qb-selected').text();
                let isProceed = confirm('Вы действительно хотите удалить кнопку "'+ btnName +'"?');
                if (isProceed) removeSelectedQB();

                $('#qb-selected-dropdown').toggleClass('ah-dropped');
                break;
        }
    });

    // изменение позиции QB
    $('#qb-position-select').change(function() {
        changeQBPosition($(this));
    });

    // изменение отображения QB
    $('#qb-visibility-toggler').click(function() {
        changeQBVisibility(this);
    });

    // вернуться к созданию
    $('#create-qb-modal').click(function() {
        $('[data-modal-info="qb-modal-settings"]').detach();
        $('[data-modal-info="qb-modal-create"]').show();
    });

    // экспорт
    $('#export-qb').click(function() {
        exportQB(this);
    });
    // импорт
    $('#import-qb').click(function() {
        $(this).val('');
    });
    $('#import-qb').change(function() {
        importQB(this);
    });

    // изменение ширины холдера кнопок, при ресайзе окна
    $(window).resize(function() {
        setQBHolderWidth();
    });

    $('[data-modal-info="qb-modal-settings"]').show();
}

function generateQBSettings() {
    let allBtns = $('#ah-created-qb-holder .ah-qb-btn');
    if (allBtns.length == 0) {
        $('[data-filed-info="qb-params"]').hide();
        $('#ah-created-qb-holder').append('<div class="ah-notification-wrapper"><span>Созданных кнопок нет</span></div>');

        // $('[data-filed-info="qb-all-created"]').find('.ah-pseudo-link-dropmenu-holder').hide();
        return;
    }

    $('#ah-created-qb-holder .ah-qb-btn').addClass('ah-qb-not-selected');

    let firstBtn = $('#ah-created-qb-holder .ah-qb-btn:eq(0)');
    $(firstBtn).removeClass('ah-qb-not-selected');
    $(firstBtn).addClass('ah-qb-selected');
    showSelectedQBParams(JSON.parse( $(firstBtn).attr('data-full-obj') ));
}

function createdQBClickListener(btn) {
    $('#ah-created-qb-holder .ah-qb-btn').removeClass('ah-qb-selected');
    $('#ah-created-qb-holder .ah-qb-btn').addClass('ah-qb-not-selected');

    $(btn).removeClass('ah-qb-not-selected');
    $(btn).addClass('ah-qb-selected');

    $('#qb-selected-btn-params [data-qb-selected-info]').html('');

    let btnInfo = JSON.parse( $(btn).attr('data-full-obj') );
    showSelectedQBParams(btnInfo);
}

function showSelectedQBParams(btnInfo) {
    var nameTitle = btnInfo.name;
    if (nameTitle.length > 10) nameTitle = nameTitle.substr(0, 10) + '...';
    $('[data-filed-info="qb-params"] .ah-field-title > b').text('"'+ nameTitle +'"');

    // тема проблема
    var themeProblem = (btnInfo.problemId) ? (btnInfo.theme +' / '+ btnInfo.problem) : '-';
    $('#qb-selected-btn-params [data-qb-selected-info="problem"]').text(themeProblem);

    // теги
    var tagsNames = [];
    btnInfo.tags.forEach(function(tagId) {
        global.hdSettings.helpdeskTags.tags.forEach(function(globalTag) {
            if (tagId == globalTag.avito_desk_id && globalTag.is_active) {
                tagsNames.push(globalTag.name);
            }
        });
    });
    tagsNames = (tagsNames.length > 0) ? tagsNames.join(', ') : '-';
    $('#qb-selected-btn-params [data-qb-selected-info="tags"]').text(tagsNames);

    // название
    var name = btnInfo.name;
    $('#qb-selected-btn-params [data-qb-selected-info="name"]').attr('title', name);
    if (name.length > 30) name = name.substr(0, 30) + '...';
    $('#qb-selected-btn-params [data-qb-selected-info="name"]').text(name);

    // описание
    var descr = (btnInfo.description) ? btnInfo.description : '-';
    $('#qb-selected-btn-params [data-qb-selected-info="description"]').attr('title', descr);
    if (descr.length > 50) descr = descr.substr(0, 50) + '...';
    $('#qb-selected-btn-params [data-qb-selected-info="description"]').text(descr);
}

function showEditSelectedQBParams() {
    var btn = $('#ah-created-qb-holder .ah-qb-selected');
    if (!btn.length) {
        alert('Ошибка: кнопка не выбрана.');
        return;
    }
    var selectedBtn = JSON.parse( $(btn).attr('data-full-obj') );

    $('[data-modal-info="qb-modal-settings"]').hide();

    var modalCreate = $('[data-modal-info="qb-modal-create"]');

    // подменяем хедер
    var nameTitle = selectedBtn.name;
    if (nameTitle.length > 10) nameTitle = nameTitle.substr(0, 10) + '...';
    $(modalCreate).find('.ah-modal-header .ah-modal-title').html('Редактирование кнопки <b>"'+ nameTitle +'"</b>');

    // вставляем в поля все данные ---
    // тема / проблема
    $('#sh-qb-problems-select option[value="'+ selectedBtn.problemId +'"]').prop('selected', true);
    $('#sh-qb-problems-select').change();

    // теги
    selectedBtn.tags.forEach(function(tagId) {
        $('#ah-qb-tags-multiselect .ah-select-field-sub [type="checkbox"][value="'+ tagId +'"]').prop('checked', true);
        $('#ah-qb-tags-multiselect .ah-select-field-sub [type="checkbox"]').change();
    });

    // название
    $('#sh-qb-name-input').val(selectedBtn.name);
    $('#sh-qb-name-input').keyup();

    // описание
    $('#sh-qb-description-input').val(selectedBtn.description);
    $('#sh-qb-description-input').keyup();

    // цвет фона
    $('#sh-qb-bg-color-input').val(selectedBtn.bgColor);
    $('#sh-qb-bg-color-input').change();
    let allBgColors = [];
    $('#sh-qb-bg-color-select option').each(function(i, elem) {
        allBgColors.push($(elem).val());
    });
    if (~allBgColors.indexOf(selectedBtn.bgColor)) {
        $('#sh-qb-bg-color-select option[value="'+ selectedBtn.bgColor +'"]').prop('selected', true);
    } else {
        $('#sh-qb-bg-color-select option[value=""]').prop('selected', true);
    }

    // цвет текста
    $('#sh-qb-text-color-input').val(selectedBtn.textColor);
    $('#sh-qb-text-color-input').change();
    let allTextColors = [];
    $('#sh-qb-text-color-select option').each(function(i, elem) {
        allTextColors.push($(elem).val());
    });
    if (~allTextColors.indexOf(selectedBtn.textColor)) {
        $('#sh-qb-text-color-select option[value="'+ selectedBtn.textColor +'"]').prop('selected', true);
    } else {
        $('#sh-qb-text-color-select option[value=""]').prop('selected', true);
    }

    // вставляем в поля все данные +++

    // подменяем футер
    $(modalCreate).find('.ah-modal-footer button').hide();
    $(modalCreate).find('.ah-modal-footer').append('<button type="button" class="ah-link-btn" id="discard-qb-edit" data-btn-modal="edit-qb">Отмена</button><button type="button" class="ah-action-btn" id="apply-qb-edit" data-btn-modal="edit-qb">Сохранить</button>');

    $('#discard-qb-edit').click(function() {
        resetCreateQBModal(modalCreate);
        $('[data-modal-info="qb-modal-create"]').hide();
        $('[data-modal-info="qb-modal-settings"]').show();
    });
    $('#apply-qb-edit').click(function() {
        if (editQB()) {
            resetCreateQBModal(modalCreate);
            updateCreatedQBSettings();
            addQuickButtons();
            $('[data-modal-info="qb-modal-create"]').hide();
            $('[data-modal-info="qb-modal-settings"]').show();
        }
    });

    // при закрытии модалки возвращаем все на место
    // $(modalCreate).find('.ah-modal-close').click(function() {
    // resetCreateQBModal(modalCreate);
    // });

    $(modalCreate).show();
}

function editQB() {
    // поля
    var problem = $('#sh-qb-problems-select option:selected');
    var tags = $('#ah-qb-tags-multiselect .ah-select-field-sub [type="checkbox"]:checked');
    var name = $('#sh-qb-name-input');
    var descr = $('#sh-qb-description-input');
    var bgColor = $('#sh-qb-bg-color-input');
    var textColor = $('#sh-qb-text-color-input');

    // Проверка полей ---
    if ( !$(problem).val() && $(tags).length == 0) {
        alert ('Выберите проблему и/или тег(и).');
        return;
    }
    $(name).val( $(name).val().replace(/^\s+/g, '') );
    if (!$(name).val()) {
        alert ('Введите название кнопки.');
        return;
    }
    // Проверка полей +++

    var LSobj =  JSON.parse(localStorage.getItem('/helpdesk/quickbuttons'));
    var curBtnData = JSON.parse( $('#ah-created-qb-holder .ah-qb-selected').attr('data-full-obj') );

    var checkedTagIds = [];
    $(tags).each(function(i, tag) {
        checkedTagIds.push( +$(tag).val() );
    });
    var theme;
    var problemParentId = +$(problem).attr('data-parent-id');
    theme = $('#sh-qb-problems-select').find('option[value="'+ problemParentId +'"]');

    var changedBtn = {
        id: +curBtnData.id,
        theme: $(theme).text(),
        problem: ( $(problem).val() ) ? $(problem).text().slice(2) : '',
        problemId: +$(problem).val(),
        tags: checkedTagIds,
        name: $(name).val(),
        description: $(descr).val(),
        bgColor: $(bgColor).val(),
        textColor: $(textColor).val(),
        order: +curBtnData.order
    }

    var existsBtnInfo = isQBAlreadyExists(changedBtn);
    if (existsBtnInfo && existsBtnInfo.id != changedBtn.id) {
        alert('Ошибка: кнопка с такими параметрами уже существует.\nНазвание кнопки - "'+ existsBtnInfo.name +'".');
        return;
    }

    LSobj.buttons.forEach(function(btn, i, arr) {
        if (btn.id == changedBtn.id) {
            arr.splice(i, 1, changedBtn);
        }
    });

    $('#ah-created-qb-holder .ah-qb-selected').attr( 'data-full-obj', JSON.stringify(changedBtn));
    localStorage.setItem('/helpdesk/quickbuttons', JSON.stringify(LSobj));

    outTextFrame('Кнопка "'+ changedBtn.name +'" отредактирована.');
    showSelectedQBParams(changedBtn);
    return true;
}
function updateCreatedQBSettings() {

    var LSobj = JSON.parse(localStorage.getItem('/helpdesk/quickbuttons'));
    var allBtns = $('#ah-created-qb-holder button');

    LSobj.buttons.forEach(function(btn) {
        $(allBtns).each(function(i, elem) {
            let curBtnInfo = $(elem).attr('data-full-obj');
            curBtnInfo = JSON.parse( curBtnInfo );

            if (curBtnInfo.id == btn.id) {
                $(elem).css({
                    'background-color': btn.bgColor,
                    'color': btn.textColor,
                });
                $(elem).attr('data-full-obj', JSON.stringify(btn));
                $(elem).find('span').text(btn.name);
            }
        });
    });
}

function removeSelectedQB() {
    var LSobj = JSON.parse(localStorage.getItem('/helpdesk/quickbuttons'));
    var selectedBtn = $('#ah-created-qb-holder .ah-qb-selected');
    var selectedBtnInfo = JSON.parse( $(selectedBtn).attr('data-full-obj') );

    LSobj.buttons.forEach(function(btn, i, arr) {
        if (btn.id == selectedBtnInfo.id) {
            arr.splice(i, 1);
        }
    });
    localStorage.setItem('/helpdesk/quickbuttons', JSON.stringify(LSobj));

    $(selectedBtn).remove();
    generateQBSettings();

    outTextFrame('Кнопка "'+ selectedBtnInfo.name +'" удалена.');
    addQuickButtons();
}

function changeQBOrder() {
    var LSobj = JSON.parse(localStorage.getItem('/helpdesk/quickbuttons'));

    var allBtns = $('#ah-created-qb-holder .ah-qb-btn');
    $(allBtns).unbind('click');
    $(allBtns).removeClass('ah-qb-selected');
    $(allBtns).addClass('ah-qb-not-selected');
    $('[data-filed-info="qb-params"]').hide();
    $('#qb-all-created-btn').hide();

    showChangeQBOrderHelp();

    var action = 'choose first';
    var firstBtnObj = false, secondBtnObj = false;
    var firstBtn, secondBtn;

    $(allBtns).click(function() {
        if (action == 'choose first') {
            firstBtnObj = JSON.parse( $(this).attr('data-full-obj') );
            firstBtn = $(this);
            $(firstBtn).removeClass('ah-qb-not-selected');
            $(firstBtn).addClass('ah-qb-selected');
            $(firstBtn).css('transform', 'translateY(-2px)');
            action = 'choose second';
        } else {
            secondBtnObj = JSON.parse( $(this).attr('data-full-obj') );
            secondBtn = $(this);
            $(allBtns).removeClass('ah-qb-selected');
            $(firstBtn).css('transform', 'translateY(0px)');
            action = 'choose first';
        }

        if (firstBtnObj && secondBtnObj) {
            var firstOrder = firstBtnObj.order,
                secondOrder = secondBtnObj.order;

            LSobj.buttons.forEach(function(btn, i, arr) {
                if (btn.id == firstBtnObj.id) {
                    firstBtnObj.order = secondOrder;
                    arr.splice(i, 1, firstBtnObj);
                    firstBtn.attr('data-full-obj', JSON.stringify(firstBtnObj));
                }
                if (btn.id == secondBtnObj.id) {
                    secondBtnObj.order = firstOrder;
                    arr.splice(i, 1, secondBtnObj);
                    secondBtn.attr('data-full-obj', JSON.stringify(secondBtnObj));
                }
            });

            LSobj.buttons.sort(compareObjByOrder);

            $('#ah-created-qb-holder button').remove();
            LSobj.buttons.forEach(function(btn) {
                $('#ah-created-qb-holder').append('<button type="button" class="ah-qb-btn ah-qb-not-selected" style="background-color: '+ btn.bgColor +'; color: '+ btn.textColor +';" data-full-obj="'+ JSON.stringify(btn).replace(/"/g, "&quot;") +'"><span>'+ btn.name +'</span></button>');
            });

            localStorage.setItem('/helpdesk/quickbuttons', JSON.stringify(LSobj));
            // outTextFrame('Операция прошла успешно.');
            addQuickButtons();

            changeQBOrder();
        }
    });
}
function showChangeQBOrderHelp() {
    if ($('#ah-change-qb-order-help').length > 0) return;

    $('[data-modal-info="qb-modal-settings"]').append('<div id="ah-change-qb-order-help" class="ah-modal-column"><div style="font-weight: 700; margin-bottom: 10px;">Включен режим изменения порядка</div><div style="margin-bottom: 10px;"><p>Нажимайте на кнопки, чтобы поменять их местами.</p><p>Также можно изменять порядок кнопок, в зависимости от ширины их названий. Для этого нажимайте кнопку "По ширине".</p><p>Изменения вступают в силу после каждого действия.</p></div><div class=""><button type="button" class="ah-action-btn" id="qb-change-order-by-width" data-sort="asc" title="">По ширине <span class="ah-thin-arrow-symbol">↑</span></button><button type="button" class="ah-link-btn" id="cancel-qb-change-order-mode" style="float: right; padding-right: 0;">Отключить режим</button><div class="ah-clearfix"></div></div></div>');
    $('#cancel-qb-change-order-mode').click(function() {
        $('[data-filed-info="qb-params"]').show();
        $('#qb-all-created-btn').show();

        let allBtns = $('#ah-created-qb-holder .ah-qb-btn');
        $(allBtns).removeClass('ah-qb-selected');
        $(allBtns).unbind('click');
        $(allBtns).click(function() {
            createdQBClickListener($(this));
        });

        generateQBSettings();

        $('#ah-change-qb-order-help').remove();
    });

    // сортировка по ширине спанов
    $('#qb-change-order-by-width').click(function() {
        let sortBy = $(this).attr('data-sort');
        if (sortBy == 'asc') {
            $(this).attr('data-sort', 'desc');
            $('#ah-change-qb-order-help .ah-thin-arrow-symbol').text('↓');
        } else {
            $(this).attr('data-sort', 'asc');
            $('#ah-change-qb-order-help .ah-thin-arrow-symbol').text('↑');
        }
        changeQBOrderByWidth(sortBy);
    });
}
function changeQBOrderByWidth(sortBy) {
    var LSobj = JSON.parse(localStorage.getItem('/helpdesk/quickbuttons'));

    var list = $('#ah-created-qb-holder .ah-qb-btn');
    list.sort(compareBtnsBySpanWidth);
    LSobj.buttons = [];

    $(list).each(function() {
        LSobj.buttons.push( $(this).data('fullObj') );
    });

    if (sortBy == 'desc') {
        LSobj.buttons.reverse();
    }
    LSobj.buttons.forEach(function(btn, i) {
        btn.order = i + 1;
    });

    LSobj.buttons.sort(compareObjByOrder);

    $('#ah-created-qb-holder button').remove();
    LSobj.buttons.forEach(function(btn) {
        $('#ah-created-qb-holder').append('<button type="button" class="ah-qb-btn" style="background-color: '+ btn.bgColor +'; color: '+ btn.textColor +';" data-full-obj="'+ JSON.stringify(btn).replace(/"/g, "&quot;") +'"><span>'+ btn.name +'</span></button>');
    });

    localStorage.setItem('/helpdesk/quickbuttons', JSON.stringify(LSobj));
    // outTextFrame('Операция прошла успешно.');
    changeQBOrder();
    addQuickButtons();
}
function compareBtnsBySpanWidth(a, b) {
    var aWidth = a.firstChild.getBoundingClientRect().width;
    var bWidth = b.firstChild.getBoundingClientRect().width;

    if (aWidth < bWidth) return -1;
    if (aWidth > bWidth) return 1;
    return 0;
}
function compareObjByOrder(a, b) {
    if (a.order > b.order) return 1;
    if (a.order < b.order) return -1;
}

function removeAllQB() {
    var LSobj = JSON.parse(localStorage.getItem('/helpdesk/quickbuttons'));
    var allBtns = $('#ah-created-qb-holder button');

    LSobj.buttons = [];
    localStorage.setItem('/helpdesk/quickbuttons', JSON.stringify(LSobj));
    $(allBtns).remove();
    generateQBSettings();

    outTextFrame('Все кнопки удалены.');
    addQuickButtons();
}

function importOldQB() {
    var allBtns = [];
    var LSobj =  JSON.parse(localStorage.getItem('/helpdesk/quickbuttons'));

    for (var key in localStorage) {
        if (~key.indexOf('sh-quick-theme-btn')) {
            var oldArr = localStorage.getItem(key).split('|&|');
            var oldObj = {
                name: oldArr[0],
                problemId: oldArr[1],
                description: oldArr[2]
            }

            if (createOldQBTheme(oldObj)) {
                allBtns.push(createOldQBTheme(oldObj));
            }
        }
        if (~key.indexOf('sh-quick-tags-btn')) {
            var oldArr = localStorage.getItem(key).split('|&|');
            var oldObj = {
                name: oldArr[0],
                tagId: oldArr[1],
                description: oldArr[2]
            }

            if (createOldQBTag(oldObj)) {
                allBtns.push(createOldQBTag(oldObj));
            }
        }
    }

    if (allBtns.length) {
        $('[data-modal-info="qb-modal-settings"]').remove();
        updateQBInfo();

        showQBSettings();
        outTextFrame('Импорт старых кнопок прошел успешно.');
        addQuickButtons();
    } else {
        outTextFrame('Старые кнопки не были найдены.');
    }
}
function createOldQBTheme(oldObj) {
    var LSobj =  JSON.parse(localStorage.getItem('/helpdesk/quickbuttons'));

    var helpdeskProblemsStr = global.hdSettings.helpdeskProblemsJSON;
    if (!global.hdSettings.helpdeskProblemsJSON) {
        helpdeskProblemsStr = '[]';
    }
    var allProblems = JSON.parse(helpdeskProblemsStr);

    var existingButtons = LSobj.buttons;
    var existingBtnIds = [];
    LSobj.buttons.forEach(function(btn) {
        existingBtnIds.push(btn.id);
    });

    var id = (existingButtons.length != 0) ? (Math.max.apply(null, existingBtnIds) + 1) : 0;
    var order = id + 1;

    var theme, problem;
    var problemId = oldObj.problemId;
    var problemParentId;
    allProblems.forEach(function(item) {
        if (item.id == problemId && item.parentId) {
            problemParentId = item.parentId;
            problem = item.name;
        }
    });
    allProblems.forEach(function(item) {
        if (item.id == problemParentId) {
            theme = item.name;
        }
    });

    if (!theme || !problem) return;

    var newBtn = {
        id: id,
        theme: theme,
        problem: problem,
        problemId: +problemId,
        tags: [],
        name: oldObj.name,
        description: oldObj.description,
        bgColor: "#5cb85c",
        textColor: "#ffffff",
        order: order
    }

    var existsBtnInfo;
    if (existsBtnInfo = isQBAlreadyExists(newBtn)) {
        return;
    }

    LSobj.buttons.push(newBtn);
    localStorage.setItem('/helpdesk/quickbuttons', JSON.stringify(LSobj));
    return newBtn;
}

function createOldQBTag(oldObj) {
    var LSobj =  JSON.parse(localStorage.getItem('/helpdesk/quickbuttons'));

    var existingButtons = LSobj.buttons;
    var existingBtnIds = [];
    LSobj.buttons.forEach(function(btn) {
        existingBtnIds.push(btn.id);
    });

    var id = (existingButtons.length != 0) ? (Math.max.apply(null, existingBtnIds) + 1) : 0;
    var order = id + 1;

    var newBtn = {
        id: id,
        theme: "",
        problem: "",
        problemId: 0,
        tags: [+oldObj.tagId],
        name: oldObj.name,
        description: oldObj.description,
        bgColor: "#337ab7",
        textColor: "#ffffff",
        order: order
    }

    var existsBtnInfo;
    if (existsBtnInfo = isQBAlreadyExists(newBtn)) {
        return;
    }

    LSobj.buttons.push(newBtn);
    localStorage.setItem('/helpdesk/quickbuttons', JSON.stringify(LSobj));
    return newBtn;
}

function changeQBPosition(elem) {
    var LSobj = JSON.parse(localStorage.getItem('/helpdesk/quickbuttons'));

    LSobj.position = $(elem).val();

    localStorage.setItem('/helpdesk/quickbuttons', JSON.stringify(LSobj));
    outTextFrame('Позиция изменена.');
    addQuickButtons();
}

function changeQBVisibility(elem) {
    var LSobj = JSON.parse(localStorage.getItem('/helpdesk/quickbuttons'));

    var notifText;
    if (elem.checked) {
        LSobj.isVisible = false;
        notifText = 'Quick Buttons скрыты.';
    } else {
        LSobj.isVisible = true;
        notifText = 'Quick Buttons отображаются.';
    }

    localStorage.setItem('/helpdesk/quickbuttons', JSON.stringify(LSobj));
    outTextFrame(notifText);
    addQuickButtons();
}

function exportQB(elem) {
    var text = localStorage.getItem('/helpdesk/quickbuttons');
    var date = currentTime();
    date = date.split(' ')[0];
    var textData = 'data:text/plain;charset=utf-8,' + encodeURIComponent(text);
    elem.href = textData;
    elem.target = '_blank';
    elem.download = 'QB_'+ date +'.txt';
}

function importQB(elem) {
    file = elem.files[0];
    if (!file) return;

    var reader = new FileReader();
    reader.onload = function(event) {
        var data = event.target.result;
        if (!isJson(data) || file.type != 'text/plain') {
            alert('Ошибка: не удалось выполнить импорт файла "'+ file.name +'".\nВозможно, данные файла были повреждены, или Вы пытаетесь загрузить файл, не имеющий отношения к Quick Buttons.');
            return;
        }

        data = JSON.parse(data);
        if ( !("buttons" in data) ) {
            alert('Ошибка: не удалось выполнить импорт файла "'+ file.name +'".\nВозможно, данные файла были повреждены, или Вы пытаетесь загрузить файл, не имеющий отношения к Quick Buttons.');
            return;
        }

        localStorage.setItem('/helpdesk/quickbuttons', JSON.stringify(data));
        $('[data-modal-info="qb-modal-settings"]').remove();
        updateQBInfo();

        showQBSettings();
        outTextFrame('Импорт файла "'+ file.name +'" выполнен.');

        addQuickButtons();
    };

    reader.onerror = function(event) {
        alert('Ошибка: файл не может быть прочитан.\nКод ошибки: ' + event.target.error.code);
    };

    reader.readAsText(file);
}

// не будет использоваться (слишком костыльно)
function isQBButtonObjHasRequiredKeys(buttons) { // при добавлении полей не изменять, чтобы поддерживать старые импорты. При удалении полей - удалить их здесь.
    var result = true;
    buttons.forEach(function(btn) {
        if (!("id" in btn) ||
            !("theme" in btn) ||
            !("problem" in btn) ||
            !("problemId" in btn) ||
            !("tags" in btn) ||
            !("name" in btn) ||
            !("description" in btn) ||
            !("bgColor" in btn) ||
            !("textColor" in btn) ||
            !("order" in btn)) {
            result = false;
        }
    });

    return result;
}

function setQBHolderWidth() {
    var sidePanelHolder = $('#side-panel-qb-holder-wrapper');
	if (!sidePanelHolder.length) {
		outTextFrame('Не удалось определить ширину Quick Buttons на боковой панели.');
        $('#ah-created-qb-holder').css('width', ''+ 400 +'');
		return;
	}
	var sidePanelHolderWidth = $(sidePanelHolder)[0].getBoundingClientRect().width;
    $('#ah-created-qb-holder').css('width', ''+ sidePanelHolderWidth +'');
}
// настройки +++

// дополнительно ---
function checkLocalStorageQBkey() {
    if ( !localStorage.getItem('/helpdesk/quickbuttons') ) {
        var LSobj =  {
            isVisible: true,
            position: 'bottom',
            buttons: []
        }

        localStorage.setItem('/helpdesk/quickbuttons', JSON.stringify(LSobj));
    }
}

function checkQBObjKeys() { // добавление обязательных ключей, если их нет
    var LSobj = JSON.parse(localStorage.getItem('/helpdesk/quickbuttons'));

    // проверка всех ключей
    if (!("buttons" in LSobj)) {
        LSobj.buttons = [];
        localStorage.setItem('/helpdesk/quickbuttons', JSON.stringify(LSobj));
    }
    if (!("position" in LSobj)) {
        LSobj.position = 'bottom';
        localStorage.setItem('/helpdesk/quickbuttons', JSON.stringify(LSobj));
    }
    if (!("isVisible" in LSobj)) {
        LSobj.isVisible = true;
        localStorage.setItem('/helpdesk/quickbuttons', JSON.stringify(LSobj));
    }

    // проверка ключей в массиве buttons (если будут добавляться поля, сюда можно затести дефолтные значения)
    // if (LSobj.buttons.length > 0) {
    // LSobj.buttons.forEach(function(btn) {
    // if (!("bgColor" in btn)) {
    // btn.bgColor = "#5cb85c";
    // localStorage.setItem('/helpdesk/quickbuttons', JSON.stringify(LSobj));
    // }
    // if (!("textColor" in btn)) {
    // btn.textColor = "#ffffff";
    // localStorage.setItem('/helpdesk/quickbuttons', JSON.stringify(LSobj));
    // }
    // });
    // }
}

function resetCreateQBModal(modalCreate) {
    modalCreate = modalCreate || $('[data-modal-info="qb-modal-create"]');

    $('button[data-btn-modal="edit-qb"]').detach();
    $(modalCreate).find('.ah-modal-footer button').show();
    $(modalCreate).find('.ah-modal-header .ah-modal-title').text('Создание кнопки');

    $('#sh-qb-problems-select option[value=""]').prop('selected', true);
    $('#sh-qb-problems-select').change();

    $('#ah-qb-tags-multiselect .ah-select-field-sub [type="checkbox"]').prop('checked', false);
    $('#ah-qb-tags-multiselect .ah-select-field-sub [type="checkbox"]').change();

    $('#sh-qb-name-input').val('');
    $('#sh-qb-name-input').keyup();

    $('#sh-qb-description-input').val('');
    $('#sh-qb-description-input').keyup();

    $('#sh-qb-bg-color-input').val('#5cb85c');
    $('#sh-qb-bg-color-input').change();
    $('#sh-qb-bg-color-select option[value="#5cb85c"]').prop('selected', true);
    $('#sh-qb-bg-color-select').change();

    $('#sh-qb-text-color-input').val('#ffffff');
    $('#sh-qb-text-color-input').change();
    $('#sh-qb-text-color-select option[value="#ffffff"]').prop('selected', true);
    $('#sh-qb-text-color-select').change();
}
// дополнительно +++
// БЫСТРЫЕ КНОПКИ +++

function checkTagInTicket(tagId) {
    var isAdded = false;
    document.querySelectorAll('input[name^="tags"]').forEach(function(item) {
        if (item.value == tagId) {
            alert('Этот тег уже есть в тикете.');
            isAdded = true;
			$('#ah-loading-layer').hide();
            return;
        }
    });

    if (isAdded) return;

    addTagToTicket(tagId);
}

// добавляем тег
function addTagToTicket(tags, btnQB) {
    tags = tags.toString().split(', ');
    var allTags = document.querySelectorAll('input[name^="tags"]');
    var currentTagsArr = [];
    allTags.forEach(function(item) {
        currentTagsArr.push({val: item.value, name: item.name});
    });

    var currentYOffset = window.pageYOffset;

    let allPanelHeaders = getHdLeftPanelHeaders();
    let classifHeader = [].find.call(allPanelHeaders, singleItem => singleItem.firstChild.data === 'Классификация');
    let allLabels = $(classifHeader).next().find('tr td:first-child');
    let tagLabel = [].find.call(allLabels, singleItem => singleItem.firstChild.data === 'Теги');
    var tagParent = tagLabel.parentNode;
    tagParent.querySelector('.pseudo-link').click();

    // console.log(tags);
    if (~tags.indexOf('482')) {
        chekCurrentTags({id: 482, name: 'stat_hack_pc'}, currentTagsArr);
    }
    if (~tags.indexOf('410')) {
        chekCurrentTags({id: 410, name: 'info_action_bo'}, currentTagsArr);
    }

    setTimeout(() => {
        var existingTags, newInput;
        for (var i = 0; i < tags.length; i++) {
            existingTags = tagParent.querySelectorAll('input[name*=tag]');
            newInput = document.createElement('input');
            newInput.name = `tags[${existingTags.length}]`;
            newInput.type = 'text';
            newInput.value = tags[i];
            existingTags[0].parentNode.appendChild(newInput);
        }

        if (btnQB) { // если передали быструю кнопку, она с тегами и темой, после тегов меняется тема
            changeThemeInTicket(btnQB, currentYOffset);
        } else {
            document.querySelector('.helpdesk-click-fog').click();
            window.scrollTo(0, currentYOffset);
        }
		
		$('#ah-loading-layer').hide();

    },10);
}

function chekCurrentTags(newTag, currentTagsArr) {
    // console.log(newTag, currentTagsArr);
    var tagParent = document.querySelector('input[name^="tags"]').parentNode;

    if (newTag.id == 482) {
        currentTagsArr.forEach(function(item) {
            if (item.val == 613) {
                tagParent.removeChild(document.querySelector('input[value="'+ item.val +'"]'));
            }
        });
    }

    if (newTag.id == 410) {
        currentTagsArr.forEach(function(item) {
            if (item.val == 421 || item.val == 184 || item.val == 249) {
                tagParent.removeChild(document.querySelector('input[value="'+ item.val +'"]'));
            }
        });
    }
}
//++++++++++ Tags ++++++++++//

//---------- Hyperlinks ----------//
function createHyperLinksIpInTechInfo() {

    $('.sh-ip-links').detach();

    var regForIp = /((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)/g;

    let allPanelHeaders = getHdLeftPanelHeaders();
    let techInfoHeader = [].find.call(allPanelHeaders, singleItem => singleItem.firstChild.data === 'Техническая информация');
    let allLabels = $(techInfoHeader).next().find('tr td:first-child');
    let ipLabel = [].find.call(allLabels, singleItem => singleItem.firstChild.data === 'IP');

    var ipBlock = $(ipLabel).next();

    if ( $(ipBlock).text().search(regForIp) + 1 ) {
        var text = $(ipBlock).text();

        // поиск ip в юзерах и айтемах
        $(ipBlock).append('<span class="sh-ip-links"></span>');
        $('.sh-ip-links').append(' | <a href="https://adm.avito.ru/users/search?ip=' + text + '" target="_blank">users</a>');
        $('.sh-ip-links').append(' | <a href="https://adm.avito.ru/items/search?ip=' + text + '" target="_blank">items</a>');
        $('.sh-ip-links').append(' | <a href="https://adm.avito.ru/system/access?ip=' + text + '" target="_blank">access</a>');
    }
}

function createHyperLinksInCommentsHeading() {
    if ( $('div.helpdesk-ticket-single-comment-heading a[href ^= "https://adm.avito.ru/users/search?email="]').length > 0 ) return;

    var regForMail = /\b[-\w.]+@([A-z0-9][-A-z0-9]+\.)+[A-z]{2,4}(?!("|(<\/?a)))\b/gi;

    for (var i = 0; i < $('div.helpdesk-ticket-single-comment-heading').length; i++) {
        if ( $('div.helpdesk-ticket-single-comment-heading').slice(i, i + 1).html().search(regForMail) + 1 ) {
            // console.log('mails Comments Heading find');
            $('div.helpdesk-ticket-single-comment-heading').slice(i, i + 1).html( $('div.helpdesk-ticket-single-comment-heading').slice(i, i + 1).html().replace(regForMail, '<a target="_blank" href="https://adm.avito.ru/users/search?email=$&">$&</a>') );
        }
    }
}
//++++++++++ Hyperlinks ++++++++++//

//---------- Причина блокировки юзера ----------//
function showReasonBlockedUser() {
    $('span.sh-reason-blocked-user').detach();
    $('div.helpdesk-usersidebar-status:first').removeClass('ah-blocked-user');

    var startTicketId = getCurrentTicketId(window.location.href);

    if ($('div.helpdesk-usersidebar-status:first').text().indexOf("Blocked") + 1) {
        var blockedUserId = $('.helpdesk-additional-info-panel:eq(0) div div:eq(0) a').text();
        $('div.helpdesk-usersidebar-status:first').addClass('ah-blocked-user');

        var url = "https://adm.avito.ru/users/user/info/" + blockedUserId;

        var xhr = new XMLHttpRequest();
        xhr.open("GET", url, true);
        xhr.send(null);
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4 && xhr.status === 200) {
                var response = xhr.responseText;
                var reason = $(response).find('.form-group:contains(Причины) div').text();
                var time = $(response).find('h4:contains(История админки)').next().find('tr:contains(User is blocked):eq(0) td:eq(0)').text();

                var ticketId = getCurrentTicketId(window.location.href)
                if (ticketId !== startTicketId) return;

                $('span.sh-reason-blocked-user').detach();

                if (!time) {
                    time = '<span class="ah-pseudo-link" id="get-user-block-time-from-history" title="Показать дату">> 1,5 месяца назад</span>';
                }
                $('div.helpdesk-usersidebar-status:first').append('<span class="sh-reason-blocked-user" style="color:black;"> | </span><span class="sh-reason-blocked-user" title="' + blockedUserId + '" style="color:#A52A2A;">' + reason + '</span><span class="sh-reason-blocked-user" style="color:black;">| '+time+'</span>');
                $('#get-user-block-time-from-history').click(function () {
                    btnLoaderOn($(this));
                    getUserBlockTimeFromHistory(blockedUserId, $(this));
                });
            }
        }
    }
}

//++++++++++ Причина блокировки юзера ++++++++++//

//---------- Причина блокировки юзера из админ хистори (> 1,5 месяца назад) ----------//
function getUserBlockTimeFromHistory(userId, timeDisplayNode) {
    $(timeDisplayNode).unbind('click');
    let url = `https://adm.avito.ru/users/user/info/${userId}/usr_adm_history`;

    let xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.send();
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
            let json = JSON.parse(xhr.responseText);
            for (let i = 0; i < json.length; i++) {
                if (~json[i].operation.indexOf('User is blocked')) {
                    $(timeDisplayNode).replaceWith(`<span>${json[i].formatedDate}</span>`);
                    break;
                }
            }
        }
    }
}
//++++++++++ Причина блокировки юзера из админ хистори (> 1,5 месяца назад) ++++++++++//

//---------- простановка коммента на УЗ из HD ----------//
function addCommentOnUserFromTicket() {
	$('.sh-comment-onuser-wrapper').remove();
	
	var userId = $('.helpdesk-additional-info-panel:eq(0) a[href *= "/users/search?user_id="]').text();
	if (!userId) return;
	
    $('.helpdesk-additional-info-panel div:eq(0) ').after('<div class="sh-comment-onuser-wrapper"><textarea class="form-control" id="sh-areaComment" placeholder="Оставить комментарий на УЗ" rows="3"></textarea><input type="button" class="btn btn-primary btn-success" value="Add Comment" title="" id="addComment" style="float: right; margin-top: 10px; outline: none;"/><br><br><hr class="sh-comment-onuser-hr"></div>');

    if (isAuthority('ROLE_HELPDESK_COMMENT_USER_TICKET_LINK')) {
        let ticketLink = getCurrentTicketLink();
        $('#sh-areaComment').val(ticketLink + ' ');
    }

    $('#addComment').click(function() {
        var comment = $('#sh-areaComment').val();
		if (!comment) {
			alert('Введите комментарий.');
			return;
		}
		
		$('#ah-loading-layer').show();
        commentOnUserSupport(userId, comment, 'fromTicket');
    });
}

function commentUserFromTicketHandler(userId, xhr) {
	$('#ah-loading-layer').hide();
	
	if ((xhr.status >= 400 || xhr.status < 200) && xhr.responseURL == 'https://adm.avito.ru/comment') {
		setTimeout(() => {
			alert('Произошла техническая ошибка при попытке оставить комментарий.\n'+ xhr.status +', '+ xhr.statusText);
		}, 100);
	} else {
		outTextFrame('Комментарий был успешно оставлен на учетной записи');
	}
}
//++++++++++ простановка коммента на УЗ из HD ++++++++++//

//---------- разблокировка юзера из HD + коммент ----------//
function unblockUserHD() {
    $('.sh-unblockUsers').detach();

    if ($('div.helpdesk-usersidebar-status:first').text().indexOf("Blocked") + 1) {
        $('.helpdesk-usersidebar-status:first').after('<div class="sh-unblockUsers"></div>');
        $('.sh-unblockUsers').append('<input type="button" class="btn btn-default btn-xs green" value="Активировать" id="activeUser"/> ');
        $('.sh-unblockUsers').append('<input type="button" class="btn btn-default btn-xs green" value="Разблокировать + объявления" id="activeUserItem"/><br>');
        $('.sh-unblockUsers').append('<input type="button" class="btn btn-default btn-xs green" value="Разблокировать + релевантные объявления" id="activeUserReItem" style="margin-top: 5px;"/>');
    }

    $('#activeUser').click(function() {
        var ticketid = getCurrentTicketId(window.location.href);
        var id = $('.helpdesk-additional-info-panel:eq(0) a[href *= "/users/search?user_id="]').text();

        commentOnUserSupport(id, 'Восстановил по обращению №'+ticketid);
        chanceUser(id, 1); //RK всегда первый шанс

        var request = new XMLHttpRequest();
        request.open("GET", 'https://adm.avito.ru/users/user/activate/'+id, true);
        request.send();

        $('.sh-unblockUsers').detach();
        // $('.helpdesk-usersidebar-status:first').text('Active');
        $('.helpdesk-usersidebar-status:first').removeClass('ah-blocked-user');
        // $('.helpdesk-usersidebar-status:first').addClass('helpdesk-usersidebar-status-active');
        outTextFrame($(this).val() + '<br>' + id);
    });

    $('#activeUserItem').click(function() {
        var ticketid = getCurrentTicketId(window.location.href);
        var id = $('.helpdesk-additional-info-panel:eq(0) a[href *= "/users/search?user_id="]').text();

        commentOnUserSupport(id, 'Восстановил по обращению №'+ticketid);
        chanceUser(id, 1); //RK всегда первый шанс

        var request = new XMLHttpRequest();
        request.open("GET", 'https://adm.avito.ru/users/user/unblock/'+id, true);
        request.send();

        $('.sh-unblockUsers').detach();
        // $('.helpdesk-usersidebar-status:first').text('Active');
        $('.helpdesk-usersidebar-status:first').removeClass('ah-blocked-user');
        // $('.helpdesk-usersidebar-status:first').addClass('helpdesk-usersidebar-status-active');
        outTextFrame($(this).val() + '<br>' + id);
    });

    $('#activeUserReItem').click(function() {
        var ticketid = getCurrentTicketId(window.location.href);
        var id = $('.helpdesk-additional-info-panel:eq(0) a[href *= "/users/search?user_id="]').text();

        commentOnUserSupport(id, 'Восстановил по обращению №'+ticketid);
        chanceUser(id, 1); //RK всегда первый шанс

        var request = new XMLHttpRequest();
        request.open("GET", 'https://adm.avito.ru/users/user/unblock_relevant/'+id, true);
        request.send();

        $('.sh-unblockUsers').detach();
        // $('.helpdesk-usersidebar-status:first').text('Active');
        $('.helpdesk-usersidebar-status:first').removeClass('ah-blocked-user');
        // $('.helpdesk-usersidebar-status:first').addClass('helpdesk-usersidebar-status-active');
        outTextFrame($(this).val() + '<br>' + id);
    });
}
//++++++++++ разблокировка юзера из HD + коммент ++++++++++//

//---------- альтернативный поиск в переписке ----------//
function setAlternateSearchInTicketCorresp() {
    changeHrefs();

    if ( $('#ah-alternate-search-checkbox').length == 0 ) {
        $('div.ah-hd-global-settings-wrapper').append('<input type="checkbox" class="ah-alternate-search-checkbox" id="ah-alternate-search-checkbox">');
        $('div.ah-hd-global-settings-wrapper').append('<label for="ah-alternate-search-checkbox" title="Если опция включена, все гиперссылки для E-mail в переписке (в среднем блоке) будут вести на поиск в /items/search"><span>Alternate search</span></label>');
    }

    if (localStorage.getItem('ah-alternate-search-checkbox') == "true") {
        $("#ah-alternate-search-checkbox").prop("checked", true);
        changeHrefs();
    }
    if (localStorage.getItem('shblockquoteHide') == "false" || !localStorage.getItem('shblockquoteHide')) {
        $("#ah-alternate-search-checkbox").prop("checked", false);
    }

    // запоминаем состояние чекбокса в локалсторадже
    $('#ah-alternate-search-checkbox').click(function() {
        if(document.getElementById('ah-alternate-search-checkbox').checked) {
            localStorage.setItem('ah-alternate-search-checkbox', "true");
            localStorage.shAlternateMode = '1';
            changeHrefs();
        } else {
            localStorage.setItem('ah-alternate-search-checkbox', "false");
            localStorage.shAlternateMode = '';
            changeHrefs();
        }
    });
}

function changeHrefs() {
    if (localStorage.shAlternateMode == '1') {
        var n = $('.helpdesk-html-view a').length;
        var regAlterSearchMail = /[\w.\-]*@\w*?[\w.\-]*\.\w*/gi;
        // var regAlterSearchPhone = /((8|\+7)[\- ]?)?(\(?\d{3}\)?[\- ]?)?[\d\- ]{7,10}/gi;
        // var regAlterSearchItem = /[0-9]{9}/gi;

        for (var i = 0; i < n; i++) {
            if ($('.helpdesk-html-view a').slice(i, i + 1).text().search(regAlterSearchMail) + 1) {
                var text = $('.helpdesk-html-view a').slice(i, i + 1).text();
                var newtext = text.replace(regAlterSearchMail, '<a target="_blank" href="https://adm.avito.ru/items/search?user=$&">$&</a>');
                $('.helpdesk-html-view a').slice(i, i + 1).replaceWith(newtext);
            }
        }
    } else {
        var n = $('.helpdesk-html-view a').length;
        var regAlterSearchMail = /[\w.\-]*@\w*?[\w.\-]*\.\w*/g;
        // var regAlterSearchPhone = /((8|\+7)[\- ]?)?(\(?\d{3}\)?[\- ]?)?[\d\- ]{7,10}/gi;
        // var regAlterSearchItem = /[0-9]{9}/gi;

        for (var i = 0; i < n; i++) {
            if ($('.helpdesk-html-view a').slice(i, i + 1).text().search(regAlterSearchMail) + 1) {
                var text = $('.helpdesk-html-view a').slice(i, i + 1).text();
                var newtext = text.replace(regAlterSearchMail, '<a target="_blank" href="https://adm.avito.ru/users/search?email=$&">$&</a>');
                $('.helpdesk-html-view a').slice(i, i + 1).replaceWith(newtext);
            }
        }
    }
}
//++++++++++ альтернативный поиск в переписке ++++++++++//

//---------- элементы в тайтле тикета ----------//
function addElementsTicketTitle() {
    $('.sh-links').detach();

    let ticketTitle = $('.hd-ticket-header-title').text();
    let email = $('.hd-ticket-header-metadata:eq(0) a[href^="/helpdesk"]').text();
    email = email.replace(/[\(\)]/g, '');

    if (ticketTitle.indexOf('Заблокированное объявление №')+1) {
        ticketTitle = ticketTitle.replace(/[0-9]+\b/g, '<a href="https://adm.avito.ru/items/item/info/$&" target="_blank">$&</a>');
        $('.hd-ticket-header-title').html(ticketTitle);
    }
    if (email !== '') {
        $('.hd-ticket-header-metadata:eq(0) .hd-ticket-header-metadata-left').append('<span class="sh-links"></span>');
        $('.sh-links').append(' | <a href="https://adm.avito.ru/users/search?email=' + email + '" target="_blank">in users</a>');
        $('.sh-links').append(' | <a href="https://adm.avito.ru/items/search?user=' + email + '" target="_blank">in items</a>');
    }
}
//++++++++++ элементы в тайтле тикета ++++++++++//

// линк на мессенджер
function addMessengerLinkInTicket() {
	$('div.helpdesk-additional-info-panel a.ah-messenger-link').parent().remove();
	
	var id = $('div.helpdesk-additional-info-panel a[href^="/users/search?user_id"]').text();
    $('div.helpdesk-additional-info-panel a[href^="/users/search?user_id"]').after('<span style="" class="ah-messenger-link-wrapper"><a title="Мессенджер" class="ah-messenger-link" href="/messenger/user/'+id+'" target="_blank" style=""></a></span>');
}

// копирование мыла юзера
function addCopyUserMailInTicket() {
	$('#ah-copy-mail-ticket-title, #sh-automail-ticket-title').remove();
	
	var email = $('div.helpdesk-additional-info-panel div:eq(0) div.helpdesk-usersidebar-status').prev().text();
    $('div.helpdesk-additional-info-panel div:eq(0) div.helpdesk-usersidebar-status').prev().append('<button id="ah-copy-mail-ticket-title" class="ah-default-btn" type="button" title="Скопировать E-mail" style="margin-left: 8px; padding: 2px; font-size: 12px; border-top-right-radius: 0; border-bottom-right-radius: 0; margin-right: -1px; position: relative;"><span class="ah-support-button-label ah-orange-background" style="border-radius: 0; font-size: 12px; min-width: 15px; top: 0px; margin-right: 0;">Б</span></button><button id="sh-automail-ticket-title" class="ah-default-btn" type="button" title="Скопировать E-mail со звездочками" style="padding: 2px; font-size: 12px; border-top-left-radius: 0; border-bottom-left-radius: 0; position: relative;"><span class="ah-support-button-label ah-support-green-background" style="border-radius: 0; font-size: 12px; min-width: 15px; top: 0px; margin-right: 0;">О</span></button>');
    $('#sh-automail-ticket-title').click(function () {
        var text = getMailForAnswer(email);
        localStorage.autoEmail = text;
        chrome.runtime.sendMessage( { action: 'copyToClipboard', text: text } );
        outTextFrame('Email '+ text +' скопирован!');
    });

    $('#ah-copy-mail-ticket-title').click(function () {
        var text = email;
        chrome.runtime.sendMessage( { action: 'copyToClipboard', text: text } );
        outTextFrame('Email '+ text +' скопирован!');
    });
}

// копирование имени юзера
function copyUserNameOnTicket() {
    if ($('#ahCopyUserName').length !== 0) return;

    let userNameNode = $('.helpdesk-additional-info-panel div:eq(0) div:eq(0) b');
    $(userNameNode).wrap(`<span id="ahCopyUserName"></span>`);
    copyDataTooltip($('#ahCopyUserName'), {
        getText: function(elem) {
            return getUserNameTamplate($(elem).text());
        }
    });
}

// проверка использования VAS
function addHelpdeskCheckVasUsage() {
    const btnExisting = document.querySelector('.ah-check-vas-usage-btn');
    if (btnExisting) return;

    const additionalPanel = document.querySelector('.helpdesk-additional-info-panel');
    const userLink = additionalPanel.querySelector('a[href^="/users/search?user_id"]');
    if (!userLink) return;

    const userId = userLink.textContent;
    const itemsLink = additionalPanel.querySelector('a[href^="/items/search?user_id"]');
    const itemsLinkHolder = itemsLink.closest('div');

    const btn = document.createElement('button');
    btn.className = 'btn btn-link ah-pseudo-link ah-check-vas-usage-btn';
    btn.innerHTML = 'Проверить VAS';
    btn.type = 'button';
    btn.setAttribute('data-user-id', userId);

    const btnHolder = document.createElement('div');
    btnHolder.className = 'ah-check-vas-usage-btn-holder';
    btnHolder.appendChild(btn);

    itemsLinkHolder.insertAdjacentElement('afterend', btnHolder);

    handleCheckVasUsage(btn);
}

//---------- предполагаемая УЗ ----------//
function infoAboutUser() {
    // console.log('infoAboutUser func');
    $('#ah-rightPanel').detach();
    $('#sh-expected-hacked-userid').detach();
    $('.ah-cssload-loader').detach();

    var email = $('.hd-ticket-header-metadata:eq(0) a[href^="/helpdesk"]').text();
    email = email.replace(/[\(\)]/g, '');
    localStorage.currentTicketEmail = email;

    // console.log(email);

    if (email == '') {
        return;
    }

    var currentTicketId = getCurrentTicketId(window.location.href);

    $('.helpdesk-additional-info-panel').before('<div id="sh-expected-hacked-userid"><div>');

    $('.helpdesk-additional-info-panel').before('<div id="ah-rightPanel"><div>');

    // ищем пользователя
    searchUser(email, currentTicketId);

    // ИЗМЕНЕНИЯ ПРАВОЙ ПАНЕЛИ
    if ($('#sh-AddRightPanel').length == 0) {
        $('.ah-hd-global-settings-wrapper').append('<br><input type="checkbox" class="ah-alternate-search-checkbox" id="sh-AddRightPanel">');
        $('.ah-hd-global-settings-wrapper').append('<label for="sh-AddRightPanel" title="Показывать правую панель из Скрипта">Add right Panel</label>');
    }

    if (localStorage.shAddRightPanel == "true") {
        $("#sh-AddRightPanel").prop("checked", true);
        $('.helpdesk-additional-info-panel').hide();
        $('#sh-expected-hacked-userid').hide();
        $('#ah-rightPanel').show();
    }

    if (localStorage.shAddRightPanel == "false" || !localStorage.shAddRightPanel) {
        $("#sh-AddRightPanel").prop("checked", false);
        $('#ah-rightPanel').hide();
        $('.helpdesk-additional-info-panel').show();
        $('#sh-expected-hacked-userid').show();
    }

    $('#sh-AddRightPanel').click(function() {
        if($("#sh-AddRightPanel").prop("checked")) {
            localStorage.shAddRightPanel = 'true';
            $('.helpdesk-additional-info-panel').hide();
            $('#sh-expected-hacked-userid').hide();
            $('#ah-rightPanel').show();
        } else {
            localStorage.shAddRightPanel = 'false';
            $('#ah-rightPanel').hide();
            $('.helpdesk-additional-info-panel').show();
            $('#sh-expected-hacked-userid').show();
        }
    });
}

function addRightPanelSettings(response, assume, currentTicketId) {
    $('#ah-rightPanelSettings').detach();
    $('#ah-rightPanelSettingsBody').detach();
    $('#ah-rightPanel').append('<div id="ah-rightPanelSettings">&#9776;</div>');

    addRightPanelSettingsBody(response, assume, currentTicketId);

    $('#ah-rightPanelSettings').click(function () {
        $('#rightPanelBody').hide();
        $('#ah-rightPanelSettings').hide();
        $('#ah-rightPanelSettingsBody').show();
    });
}

function addRightPanelSettingsBody(response, assume, currentTicketId) {
    $('#ah-rightPanel').append('<div id="ah-rightPanelSettingsBody"></div>');

    $('#ah-rightPanelSettingsBody').append('<div title="Замечание: чем больше информации вы загружаете, тем дольше загрузка панели." style="text-align:center; color: rgb(0, 136, 204); font-weight:bold;">Right panel settings</div>');

    $('#ah-rightPanelSettingsBody').append('<div id="ah-rightPanelSettingsList"></div>');
    $('#ah-rightPanelSettingsList').append('<ul class="ah-panelSettingsLeft"></ul>');
    $('.ah-panelSettingsLeft').append('<li class="ah-default-list-item"><input type="checkbox" id="sh-rightPanel-name" value="rp-name" class="ah-support-dafault-checkbox"><label for="sh-rightPanel-name"><span>Name</span></label></li>');
    $('.ah-panelSettingsLeft').append('<li class="ah-default-list-item"><input type="checkbox" id="sh-rightPanel-id" value="rp-id" class="ah-support-dafault-checkbox"><label for="sh-rightPanel-id"><span>ID</span></label></li>');
    $('.ah-panelSettingsLeft').append('<li class="ah-default-list-item"><input type="checkbox" id="sh-rightPanel-login" value="rp-login" class="ah-support-dafault-checkbox"><label for="sh-rightPanel-login"><span>Login</span></label></li>');
    $('.ah-panelSettingsLeft').append('<li class="ah-default-list-item"><input type="checkbox" id="sh-rightPanel-email" value="rp-email" class="ah-support-dafault-checkbox"><label for="sh-rightPanel-email"><span>E-mail</span></label></li>');
    $('.ah-panelSettingsLeft').append('<li class="ah-default-list-item"><input type="checkbox" id="sh-rightPanel-reg" value="rp-reg" class="ah-support-dafault-checkbox"><label for="sh-rightPanel-reg"><span>Registered</span></label></li>');
    $('.ah-panelSettingsLeft').append('<li class="ah-default-list-item"><input type="checkbox" id="sh-rightPanel-stat" value="rp-stat" class="ah-support-dafault-checkbox"><label for="sh-rightPanel-stat"><span>Status</span></label></li>');
    $('.ah-panelSettingsLeft').append('<li class="ah-default-list-item"><input type="checkbox" id="sh-rightPanel-item" value="rp-item" class="ah-support-dafault-checkbox"><label for="sh-rightPanel-item"><span>Items</span></label></li>');

    $('#ah-rightPanelSettingsList').append('<ul class="ah-panelSettingsRight"></ul>');
    $('.ah-panelSettingsRight').append('<li class="ah-default-list-item"><input type="checkbox" id="sh-rightPanel-acc" value="rp-acc" class="ah-support-dafault-checkbox"><label for="sh-rightPanel-acc"><span>Account</span></label></li>');
    $('.ah-panelSettingsRight').append('<li class="ah-default-list-item"><input type="checkbox" id="sh-rightPanel-loc" value="rp-loc" class="ah-support-dafault-checkbox"><label for="sh-rightPanel-loc"><span>Location</span></label></li>');
    $('.ah-panelSettingsRight').append('<li class="ah-default-list-item"><input type="checkbox" id="sh-rightPanel-ip" value="rp-ip" class="ah-support-dafault-checkbox"><label for="sh-rightPanel-ip"><span>Last IP</span></label></li>');
    $('.ah-panelSettingsRight').append('<li class="ah-default-list-item"><input type="checkbox" id="sh-rightPanel-ti" value="rp-ti" class="ah-support-dafault-checkbox"><label for="sh-rightPanel-ti"><span>Tex Info</span></label></li>');
    $('.ah-panelSettingsRight').append('<li class="ah-default-list-item"><input type="checkbox" id="sh-rightPanel-type" value="rp-type" class="ah-support-dafault-checkbox"><label for="sh-rightPanel-type"><span>Type</span></label></li>');
    $('.ah-panelSettingsRight').append('<li class="ah-default-list-item"><input type="checkbox" id="sh-rightPanel-manager" value="rp-manager" class="ah-support-dafault-checkbox"><label for="sh-rightPanel-manager"><span>Manager</span></label></li>');
    $('.ah-panelSettingsRight').append('<li class="ah-default-list-item"><input type="checkbox" id="sh-rightPanel-phone" value="rp-phone" class="ah-support-dafault-checkbox"><label for="sh-rightPanel-phone"><span>Phone</span></label></li>');
    $('.ah-panelSettingsRight').append('<li class="ah-default-list-item"><input type="checkbox" id="sh-rightPanel-subscription" value="rp-subscription" class="ah-support-dafault-checkbox"><label for="sh-rightPanel-subscription"><span>Subscription</span></label></li>');

    $('#ah-rightPanelSettingsBody').append('<div id="ah-rightPanelSettingsListOpt"></div>');
    $('#ah-rightPanelSettingsListOpt').append('<ul class="ah-panelSettingsCenter" style="list-style: none; padding:8px 0px;"></ul>');
    $('.ah-panelSettingsCenter').append('<li class="ah-default-list-item"><input type="checkbox" id="sh-rightPanel-com" value="rp-com" class="ah-support-dafault-checkbox"><label for="sh-rightPanel-com"><span>Comments</span></label><input id="rp-com-val" class="ah-rightPanelSetInput" type="text" title="Введите кол-во отображаемых элементов (по-умолчанию оно равно 3)"></li>');

    $('#ah-rightPanelSettingsBody').append('<div id="rightPanelSettingsButton" style="text-align:center;"></div>');
    $('#rightPanelSettingsButton').append('<input id="rightPanelSettingsButtonSave" type="button" class="ah-action-btn" value="Save">');
    $('#rightPanelSettingsButton').append('<input id="rightPanelSettingsButtonCancel" type="button" class="ah-action-btn" value="Cancel" style="margin-left:20px;">');

    // отображения какие настройки включены
    displayRightPanelSettings();

    $('#rightPanelSettingsButtonCancel').click(function () {
        $('#rightPanelBody').show();
        $('#ah-rightPanelSettings').show();
        $('#ah-rightPanelSettingsBody').hide();
    });

    $('#rightPanelSettingsButtonSave').click(function () {
        $('#rightPanelBody').show();
        $('#ah-rightPanelSettings').show();
        $('#ah-rightPanelSettingsBody').hide();

        changeRightPanelSettings();
        displayUserInfoOnRightPanel(response, assume, currentTicketId);
    });
}

function displayRightPanelSettings() {
    if (!localStorage.rightPanelSettings) localStorage.rightPanelSettings = '{"list":["rp-name","rp-id","rp-login","rp-email","rp-reg","rp-stat","rp-item","rp-acc","rp-loc","rp-ip","rp-ti","rp-type"],"listOpt":{"rp-com":"3"}}';

    var rightPanelSettings = JSON.parse(localStorage.rightPanelSettings);

    for (var i = 0; i < rightPanelSettings.list.length; ++i) {
        $('input[value='+rightPanelSettings.list[i]+']').prop('checked', true);
    }

    var listOpt = rightPanelSettings.listOpt;

    for (var key in listOpt) {
        $('input[value='+key+']').prop('checked', true);
        $('#'+key+'-val').val(listOpt[key]);
    }
}

function changeRightPanelSettings() {
    var rightPanelSettings = {
        list: [],
        listOpt: {}
    };
    var lenList = $('#ah-rightPanelSettingsList input[type=checkbox]').length;

    for (var i = 0; i < lenList; ++i) {
        if ($('#ah-rightPanelSettingsList input[type=checkbox]').slice(i,i+1).prop('checked')) {
            rightPanelSettings.list.push($('#ah-rightPanelSettingsBody input[type=checkbox]').slice(i,i+1).val());
        }
    }

    var lenListOpt = $('#ah-rightPanelSettingsListOpt input[type=checkbox]').length;

    for (var i = 0; i < lenListOpt; ++i) {
        if ($('#ah-rightPanelSettingsListOpt input[type=checkbox]').slice(i,i+1).prop('checked')) {
            rightPanelSettings.listOpt[$('#ah-rightPanelSettingsListOpt input[type=checkbox]').slice(i,i+1).val()] = $('.ah-rightPanelSetInput').slice(i,i+1).val();
        }
    }

    localStorage.rightPanelSettings = JSON.stringify(rightPanelSettings);
}

function searchUser(email, currentTicketId) {
    // анимация загрузки
    loadingBar('#ah-rightPanel', 80);

    var href = 'https://adm.avito.ru/users/search?email='+email;
    
    var xhr = new XMLHttpRequest();
    xhr.open("GET", href, true);
    xhr.send(null);
    xhr.onreadystatechange=function() {
        if (xhr.readyState === 4 && xhr.status === 200 && localStorage.currentTicketEmail === email)  {
            var response = xhr.responseText;
            if (response.indexOf('О пользователе') + 1) {
                // настройки правой панели
                addRightPanelSettings(response, false, currentTicketId);

                displayUserInfoOnRightPanel(response, false, currentTicketId);
            } else {
                searchIdInItems(email, currentTicketId);
            }
        }
    };
}

function searchIdInItems(mail, currentTicketId) {
    var hrefAdmShowItems = "https://adm.avito.ru/items/search?user="+mail;

    var requestAdmShowItems = new XMLHttpRequest();
    requestAdmShowItems.open("GET", hrefAdmShowItems, true);
    requestAdmShowItems.send(null);
    requestAdmShowItems.onreadystatechange=function() {
        if (requestAdmShowItems.readyState === 4 && requestAdmShowItems.status === 200 && localStorage.currentTicketEmail === mail)  {
            var rAdmShowItems = requestAdmShowItems.responseText;
            var login = mail.split('@');

            if (rAdmShowItems.indexOf(login[0])+1) {
                if ($(rAdmShowItems).find('.item_user_login:eq(0)').attr('href') == undefined) {
                    displayUserNotFound();
                } else {
                    var admIdUser = $(rAdmShowItems).find('.item_user_login:eq(0)').attr('href').split('/');

                    $('#sh-expected-hacked-userid').attr("href", "https://adm.avito.ru/users/user/info/"+admIdUser);

                    showUserByID(admIdUser[4], mail, currentTicketId);
                }
            }
        }
    };
}

function showUserByID(admIdUser, mail, currentTicketId) {
    var hrefAdmShowUserByID = "https://adm.avito.ru/users/user/info/"+admIdUser;

    var requestShowUserByID = new XMLHttpRequest();
    requestShowUserByID.open("GET", hrefAdmShowUserByID, true);
    requestShowUserByID.send(null);
    requestShowUserByID.onreadystatechange=function() {
        if (requestShowUserByID.readyState === 4 && requestShowUserByID.status === 200 && localStorage.currentTicketEmail === mail)  {
            var rShowUserByID = requestShowUserByID.responseText;

            var statusUser = $(rShowUserByID).find('.form-group:eq(1) b').text();

            // настройки правой панели
            addRightPanelSettings(rShowUserByID, true, currentTicketId);

            displayUserInfoOnRightPanel(rShowUserByID, true, currentTicketId);
            showHistoryEmail(admIdUser, statusUser, mail, currentTicketId);
        }
    };
}

function showHistoryEmail(admIdUser, statusUser, mail, currentTicketId) {
    var hrefAdmShowHistoryEmail = "https://adm.avito.ru/users/user/"+admIdUser+"/emails/history";

    var requestHistory = new XMLHttpRequest();
    requestHistory.open("GET", hrefAdmShowHistoryEmail, true);
    requestHistory.setRequestHeader("Accept", "application/json, text/javascript, */*; q=0.01");
    requestHistory.setRequestHeader("X-Requested-With", "XMLHttpRequest");
    requestHistory.send(null);
    requestHistory.onreadystatechange=function(){
        if (requestHistory.readyState === 4 && requestHistory.status === 200 && localStorage.currentTicketEmail === mail)  {
            var json = JSON.parse(requestHistory.responseText);

            var content = json.content;

            var countEmailsHistory = 0;
            var length = mail.length;
            var pos = content.indexOf(mail);

            while (pos !== -1) {
                countEmailsHistory++;
                pos = content.indexOf(mail, pos + length);
            }

            var countPhrase = ' раз';
            if (countEmailsHistory > 1 && countEmailsHistory < 5) countPhrase = ' раза';

            $('#changedEmailTimes').text(' - '+countEmailsHistory);
            displaySuggestUser(admIdUser, statusUser, countEmailsHistory, countPhrase);
        }
    };
}

function displayUserNotFound() {
    $('.ah-user-not-found').detach();

    $('#ah-rightPanel').append('<div id="rightPanelBody"></div>');
    $('#rightPanelBody').append('<div class="ah-user-not-found">Учетная запись не найдена</div>');
    $('#sh-expected-hacked-userid').append('<div class="ah-user-not-found">Учетная запись не найдена</div>');

    $('.ah-cssload-loader').detach();
}

function displaySuggestUser(admIdUser, statusUser, countEmailsHistory, countPhrase) {
    $('#sh-expected-hacked-userid-current').detach();
    $('#sh-expected-hacked-userid').append('<div id="sh-expected-hacked-userid-current"></div>');

    $('#sh-expected-hacked-userid-current').append('<b>Предполагаемый ID:</b> <a  href="https://adm.avito.ru/users/user/info/'+admIdUser+'" target="_blank">'+admIdUser+'</a> | <b>Статус:</b> <span class="sh-expected-user-status"><b>'+statusUser+'</b></span> | <b>E-mail был изменен <span style="color:blue;">'+countEmailsHistory+'</span>' + countPhrase + '<b>');

    if (statusUser.indexOf('Blocked') + 1) {
        $('span.sh-expected-user-status').css('color', 'red');
    }
    if (statusUser.indexOf('Active') + 1) {
        $('span.sh-expected-user-status').css('color', '#3c763d');
    }
}

function displayUserInfoOnRightPanel(response, assume, currentTicketId) {
    $('#rightPanelBody').detach();
    $('#ah-rightPanel').append('<div id="rightPanelBody"></div>');
    $('#rightPanelBody').append('<table id="ah-userInfoTable"><tbody></tbody></table>');

    let rightPanelSettings = localStorage.rightPanelSettings;
    let rightPanelSettingsParse = JSON.parse(rightPanelSettings);

    let mainTable = $('#ah-userInfoTable');

    if (assume) $(mainTable).before('<div style="text-align:center; color: #FFC107; font-weight:bold;" title="Внимание! Данная учетная запись является предполагаемой и была найдена с помощию созданного алгоритма поиска.">Предполагаемая УЗ</div>');

    let id = $(response).find('.form-group:contains(ID) .js-user-id').attr('data-user-id');
    
    if (rightPanelSettings.indexOf('rp-name')+1) {
        let name = $(response).find('.form-group:contains(Название) .form-control').val();
        $(mainTable).append('<tr><td>Name</td><td><span id="ahCopyUserNameRp">'+name+'</span></td></tr>');
        copyDataTooltip( $('#ahCopyUserNameRp'), {
            getText: function(elem) {
                return getUserNameTamplate($(elem).text());
            }
        } );
    }

    if (rightPanelSettings.indexOf('rp-id')+1) {
        $(mainTable).append('<tr><td>ID</td><td><a href="/users/user/info/'+id+'" target="_blank">'+id+'</a><span style="" class="ah-messenger-link-wrapper"><a title="Мессенджер" href="/messenger/user/'+id+'" target="_blank" style="" class="ah-messenger-link"></a></span></td></tr>');
    }

    if (rightPanelSettings.indexOf('rp-login')+1) {
        let login = $(response).find('.form-group:contains(Логин) .form-control-static').text();
        $(mainTable).append('<tr><td>Login</td><td><a href="https://adm.avito.ru/items/search?user='+login+'" target="_blank">'+login+'</a></td></tr>');
    }

    if (rightPanelSettings.indexOf('rp-email')+1) {
        let email = $(response).find('.js-fakeemail-field').text();
        $(mainTable).append('<tr>' +
                '<td>E-mail</td>' +
                '<td><div id="ah-rp-email">' +
                    '<a href="https://adm.avito.ru/users/search?email='+email+'" target="_blank">'+email+'</a> ' +
                    '<span id="changedEmailTimes" title="Кол-во изменения E-mail адреса" style="color:blue; font-weight:bold;"></span>' +
                    '<button id="sh-copy-mail-right-panel" class="ah-default-btn" type="button" title="Скопировать E-mail в буфер обмена" style="margin-left: 4px; padding: 2px; font-size: 12px; border-top-right-radius: 0; border-bottom-right-radius: 0; margin-right: -1px; position: relative;">' +
                        '<span class="ah-support-button-label ah-orange-background" style="border-radius: 0; font-size: 12px; min-width: 15px; top: 0px; margin-right: 0;">Б</span>' +
                    '</button>' +
                    '<button id="sh-automail-right-panel" class="ah-default-btn" type="button" title="Копирует E-mail в буфер, заменяя последние 3 символа перед @ на звездочки" style="padding: 2px; font-size: 12px; border-top-left-radius: 0; border-bottom-left-radius: 0; position: relative;">' +
                        '<span class="ah-support-button-label ah-support-green-background" style="border-radius: 0; font-size: 12px; min-width: 15px; top: 0px; margin-right: 0;">О</span>' +
                    '</button>' +
                '</div></td>' +
            '</tr>');

        emailHistory('#ah-rp-email', id);

        $('#sh-automail-right-panel').click(function () {
            let text = getMailForAnswer(email);
            localStorage.autoEmail = text;
            chrome.runtime.sendMessage( { action: 'copyToClipboard', text: text } );
            outTextFrame('Email '+ text +' скопирован!');
        });

        $('#sh-copy-mail-right-panel').click(function () {
            let text = email;
            chrome.runtime.sendMessage( { action: 'copyToClipboard', text: text } );
            outTextFrame('Email '+ text +' скопирован!');
        });
    }

    if (rightPanelSettings.indexOf('rp-reg')+1) {
        let registered = $(response).find('.form-group:contains(Зарегистрирован) .form-control-static').text();
        $(mainTable).append('<tr><td>Registered</td><td>'+registered+'</td></tr>');
    }

    // СТАТУС УЧЕТНОЙ ЗАПИСИ
    if (rightPanelSettings.indexOf('rp-stat')+1) {
        let statusTmp = $(response).find('.form-group:contains(Статус) .form-control-static b').text();
        let status = statusTmp ? statusTmp : $(response).find('.form-group:contains(Статус) .form-control-static').text();
        let chanceTmp = $(response).find('.form-group:contains(Chance) .form-control-static .active').attr('id');
        let chance = chanceTmp ? chanceTmp.replace('cval_', '') : '0';

        let colorStatus = '#a4a4a4';
        if (status === 'Active') colorStatus = '#3c763d';
        if (status === 'Remove' || status === 'Unconfirmed') colorStatus = '#a4a4a4';
        if (status === 'Blocked') colorStatus = 'rgb(220, 20, 60)';

        let colorChance = '#65a947';
        if (chance === '10') colorChance = '#b3263c';

        $(mainTable).append('<tr class="ah-grayBlock"><td>Status</td><td><span style="color:'+colorStatus+';font-weight:bold;">'+status+'</span> <span style="font-weight:bold;">(<span style="color:'+colorChance+';">'+chance+'</span>/<span style="color:red;">10</span>)</span><div id="unblockUser" style="float:right;"></div></td></tr>');


        if (status === 'Blocked') {
            rightPanelUnblockUser();

            let reason = $(response).find('.form-group:contains(Причины) .form-control-static').text();
            $(mainTable).append('<tr class="ah-grayBlock"><td>Reasons</td><td class="ah-reasonStyle">'+reason+'</td></tr>');

            let blockTime = $(response).find('h4:contains(История админки)').next().find('tr:contains(User is blocked):eq(0) td:eq(0)').text();
            if (!blockTime) {
                blockTime = '<span class="ah-pseudo-link" id="get-user-block-time-from-history-rp" title="Показать дату">> 1,5 месяца назад</span>';
            }
            $(mainTable).append('<tr class="ah-grayBlock"><td>Blocked at</td><td>'+blockTime+'</td></tr>');

            $('#get-user-block-time-from-history-rp').click(function () {
                btnLoaderOn($(this));
                getUserBlockTimeFromHistory(id, $(this));
            });

            if (reason.indexOf("Нарушение условий пользовательского соглашения")+1) {
                let calls = $(response).find('.form-group:contains(Звонки) .form-control-static').html();
                $(mainTable).append('<tr class="ah-grayBlock"><td>Calls</td><td>'+calls+'</td></tr>');
            }
        }
    }

    // ИНФОРМАЦИЯ О ОБЪЯВЛЕНИЯХ И БАБЛУ
    if (rightPanelSettings.indexOf('rp-item')+1) {
        let items = $(response).find('.form-group:contains(Объявления) .form-control-static').html().split(',');
        $(mainTable).append('<tr><td>Items</td><td><a href="https://adm.avito.ru/items/search?user_id='+id+'" target="_blank">'+items[0]+'</a></td></tr>');
    }

    if (rightPanelSettings.indexOf('rp-subscription')+1) {
        let subscriptionNode = $(response).find('.form-group:contains(Подписка) .form-control-static');
        let subscriptionLinkNode = $(subscriptionNode).find('a');
        $(subscriptionLinkNode).attr('target', '_blank');
        $(mainTable).append('<tr><td>Subscription</td><td data-rp-filed-name="subscription"></td></tr>');
        $('[data-rp-filed-name="subscription"]').append(subscriptionLinkNode);
    }

    if (rightPanelSettings.indexOf('rp-acc')+1) {
        let wallet = $(response).find('.form-group:contains(Счёт) .help-block a:eq(0)').text();

        let checkVasUsageHtml = '';
        if (isAuthority('ROLE_CHECK_VAS_USAGE')) {
            checkVasUsageHtml = `<span class="text-muted">|</span> <button class="btn btn-link ah-pseudo-link ah-rp-check-vas-usage-btn" type="button" data-user-id="${id}">Проверить VAS</button>`;
        }

        $(mainTable).append('<tr><td>Account</td><td><a href="https://adm.avito.ru/users/account/info/'+id+'" target="_blank">'+wallet+'</a> '+checkVasUsageHtml+'</td></tr>');

        if (isAuthority('ROLE_CHECK_VAS_USAGE')) {
            const checkVasUsageBtn = document.querySelector('.ah-rp-check-vas-usage-btn');
            if (checkVasUsageBtn) {
                handleCheckVasUsage(checkVasUsageBtn);
            }
        }
    }


    // ИНФОРМАЦИЯ О КОМПЬЮТЕРЕ И ЛОКАЦИИ
    if (rightPanelSettings.indexOf('rp-loc')+1) {
        let location =  $(response).find('#region option:selected').text();
        if (location !== "-- Select location --") {
            $(mainTable).append('<tr class="ah-grayBlock"><td>Location</td><td>'+location+'</td></tr>');
        }
    }

    if (rightPanelSettings.indexOf('rp-ip')+1) {
        let lastIP = $(response).find('.ip-info-list li:eq(0)').html();
        if (lastIP !== undefined) {
            lastIP = lastIP.split('(');
            $(mainTable).append('<tr class="ah-grayBlock">' +
                    '<td>Last IP</td>' +
                    '<td><div id="ah-rp-ip">'+lastIP[0]+'</div></td>' +
                '</tr>');
            $(mainTable).find('tr:contains(Last IP) a').attr('target', '_blank');

            ipHistory('#ah-rp-ip', id, response);
        }
    }

    if (rightPanelSettings.indexOf('rp-ti')+1) {
        let lastTInfo =  $(response).find('.form-group:contains(User-Agent последнего посещения) .help-block').html();
        if (lastTInfo !== undefined) {
            $(mainTable).append('<tr class="ah-grayBlock"><td>Tex Info</td><td>'+lastTInfo+'</td></tr>');
        }
    }

    // ИНФОРМАЦИЯ О ВИДЕ УЧЕТНОЙ ЗАПИСИ
    if (rightPanelSettings.indexOf('rp-type') + 1) {
        let type = $(response).find('.form-group:contains(Тип) .form-control-static').children().remove().end().text();
        let changeType = $(response).find('.form-group:contains(Тип) a[href^="/users/user/"]').length;
        $(mainTable).append('<tr><td>Type</td><td id="ah-rightPanelType" style="font-weight:bold; color:#CE93D8;">' + type + '</td></tr>');

        if (type.indexOf('компания') + 1) {
            if (changeType > 0) $('#ah-rightPanelType').append('<a class="ah-rightPanelTypeChange" typeStatus="personal">установить как частное лицо</a>');

            let indicators = ['inn','pro', 'auto', 'shop', 'subscription'];
            if (isAuthority('ROLE_USER_INDICATORS_REPREMIUM')) {
                indicators.push('REPremium');
            }
            if (isAuthority('ROLE_USER_INDICATORS_EXTENSION')) {
                indicators.push('extension');
            }
            addIndicatorsHelpdeskDetails(indicators, $(response));
        } else {
            if (changeType > 0) $('#ah-rightPanelType').append('<a class="ah-rightPanelTypeChange" typeStatus="company">установить как компанию</a>');
        }

        $('.ah-rightPanelTypeChange').click(function () {
            let type = $(this).attr("typeStatus");

            changeUserType(id, type);
            infoAboutUser();
        });
    }

    if (rightPanelSettings.indexOf('rp-manager')+1) {
        let name = $(response).find('select[name="managerId"] option:selected').text();
        let colorStyle = (name == 'None') ? '' : 'color: red; font-weight: bold;';

        $(mainTable).append('<tr><td title="Персональный менеджер">Manager</td><td style="'+ colorStyle +'">'+name+'</td></tr>');
    }

    if (rightPanelSettings.indexOf('rp-phone')+1) {
        let phoneList = $(response).find('.controls-phone');
        $(mainTable).append('<tr class="ah-grayBlock"><td style="vertical-align: top;">Phone</td><td><div><span class="ah-show-unverify-phone">show unverify phone</span></div><div id="ah-phoneHistory"></div></td></tr>');

        for (let i = 0; i < phoneList.length; i++) {
            let phoneInfo = phoneList[i];
            let number = $(phoneInfo).find('input[name^="phone["]').attr("value");


            let verify = '';
            let unVerify = '';
            let statusPhone = '';
            let phoneVerifyDate = '';

            if ($(phoneInfo).find('.i-verify').hasClass('i-verify-checked')) {
                statusPhone = 'verify';
                phoneVerifyDate = $(phoneInfo).find('.phone-verify-date').text().replace(' ', '');
                verify = '<span class="ah-verify" style="color: green;" title="Телефон верифицирован">&#10003;</span>';
                unVerify = '<span type="button" class="ah-default-btn ah-unverify-phones-multi" style="" data-phone="' + number + '" title="Формирование списка телефонных номеров для открепления">&#10060;</span>';
            } else {
                statusPhone = 'unverify';
                verify = '<span class="ah-verify" style="color: red;" title="Телефон не верифицирован">&#10060;</span>';
            }

            $('#ah-phoneHistory').append('<div id="'+number+'" ah-phone-status="'+statusPhone+'" style="padding: 3px">' +
                verify +
                ' <a href="https://adm.avito.ru/users/search?phone='+number+'" target="_blank">'+number+'</a> ' +
                '<span class="ah-phone-verify-date" title="Время верификации">('+ phoneVerifyDate + ')</span> ' +
                unVerify +
                '</div>');

            if ($(phoneInfo).find('i').hasClass('glyphicon-book')) {
                $('#'+number+' a').attr('title', 'Номер в черном списке').css('color', 'black');
            }
        }

        $('.ah-show-unverify-phone').click(function () {
            let text = $(this).text();
            $(this).text(text === "show unverify phone" ? "hide unverify phone" : "show unverify phone");

            $('[ah-phone-status="unverify"]').toggle();
        });

        unverifyPhones(id);
    }

    $('#rightPanelBody').append('<hr>');

    // КОММЕНТАРИИ
    if (rightPanelSettings.indexOf('rp-com')+1) {
        $('#rightPanelBody').append('<div id="userComments"><div class="ah-commentsNameStyle">Comments:</div></div>');

        rightPanelAddComment(id);

        var tableLength = $(response).find('#dataTable tbody tr').length;
        if (tableLength > 0) {
            $('#userComments').append('<div class="ah-commentList"></div>');

            var commentsLength = rightPanelSettingsParse.listOpt['rp-com'];
            if (commentsLength === "") commentsLength = 3;
            if (tableLength < commentsLength || commentsLength === "all") commentsLength = tableLength;

            var tmp = $(response).find('#dataTable tbody tr');

            for (var i = 0; i < commentsLength; ++i) {
                var date = tmp.slice(i,i+1).find('td:eq(0)').text();
                var username = tmp.slice(i,i+1).find('td:eq(1)').text();
                var comment = tmp.slice(i,i+1).find('td:eq(2)').text().replace(/&/g, '&amp;');

                $('.ah-commentList').append('<div class="ah-commentBlockStyle"><div class="ah-commentStyle">'+comment+'</div><div class="ah-commentInfoStyle"><span>'+username+'</span><span style="float: right;">'+date+'</span></div></div>');
            }

            linksOnComments('.ah-commentStyle', id);
        }
    }
	
	// Поиск по соц сети
	$('#rightPanelBody').append('<hr><h4>Пользователи</h4><div class="input-group search-user-by-social-wrapper"><input type="text" class="form-control" name="socialId" placeholder="ID социальной сети"><span class="input-group-btn"><input type="button" class="btn btn-primary social-search-btn" value="Найти" title="Поиск пользователя" id="rp-search-by-social-btn"></span></div>');
	
	var searchBtn = $('#rp-search-by-social-btn');
    $(searchBtn).unbind('click').click(function() {
		searchBySocialBtnHandler($(this));
    });
	
    $('.ah-cssload-loader').detach();
}

function rightPanelAddComment(id) {
    $('#userComments').append('<div class="input-group"><textarea class="form-control" id="rpAreaComment" placeholder="add comment" rows="1"></textarea><span class="input-group-btn"><input type="button" class="btn btn-primary btn-success" value="Add" title="Добавляет комментарий на УЗ, если она определилась в HD" id="rpAddComment"></span></div>');

    let ticketLink = getCurrentTicketLink();
    $('#rpAreaComment').val(ticketLink + ' ');

    $('#rpAddComment').click(function() {
        var comment = $('#rpAreaComment').val();

        commentOnUserSupport(id, comment);
        infoAboutUser();
    });
}

function rightPanelUnblockUser() {
    $('#unblockUser').append('<input type="text" id="rpChance" class="btn btn-default btn-xs" title="Chance on user" value="1" size="1" style="font-size: 12px">')
        .append('<input type="button" id="rpAU" class="btn btn-default btn-xs green" title="Active user" value="A">')
        .append('<input type="button" id="rpHI" class="btn btn-default btn-xs green" title="Unblock user and his items" value="I">')
        .append('<input type="button" id="rpRI" class="btn btn-default btn-xs green" title="Unblock user and relevant items" value="R">');

    $('#rpAU').click(function() {
        var ticketid = getCurrentTicketId(window.location.href);
        var id = $('.helpdesk-additional-info-panel:eq(0) a[href *= "/users/search?user_id="]').text();
        var chance = $('#rpChance').val();

        commentOnUserSupport(id, 'Восстановил по обращению №'+ticketid);
        chanceUser(id, chance); //RK всегда первый шанс

        var request = new XMLHttpRequest();
        request.open("GET", 'https://adm.avito.ru/users/user/activate/'+id, true);
        request.send();

        infoAboutUser();
        outTextFrame($(this).attr('title') + ' with ' + chance + ' chance<br>' + id);
    });

    $('#rpHI').click(function() {
        var ticketid = getCurrentTicketId(window.location.href);
        var id = $('.helpdesk-additional-info-panel:eq(0) a[href *= "/users/search?user_id="]').text();
        var chance = $('#rpChance').val();

        commentOnUserSupport(id, 'Восстановил по обращению №'+ticketid);
        chanceUser(id, chance); //RK всегда первый шанс

        var request = new XMLHttpRequest();
        request.open("GET", 'https://adm.avito.ru/users/user/unblock/'+id, true);
        request.send();

        infoAboutUser();
        outTextFrame($(this).attr('title') + ' with ' + chance + ' chance<br>' + id);
    });

    $('#rpRI').click(function() {
        var ticketid = getCurrentTicketId(window.location.href);
        var id = $('.helpdesk-additional-info-panel:eq(0) a[href *= "/users/search?user_id="]').text();
        var chance = $('#rpChance').val();

        commentOnUserSupport(id, 'Восстановил по обращению №'+ticketid);
        chanceUser(id, chance); //RK всегда первый шанс

        var request = new XMLHttpRequest();
        request.open("GET", 'https://adm.avito.ru/users/user/unblock_relevant/'+id, true);
        request.send();

        infoAboutUser();
        outTextFrame($(this).attr('title') + ' with ' + chance + ' chance<br>' + id);
    });
}
//++++++++++ предполагаемая УЗ ++++++++++//

//---------- Смена ассигни -----------//
function changeAssignee() {
    if ($('#ah-change-assignee-wrapper').length > 0) return;

    let allPanelHeaders = getHdLeftPanelHeaders();
    let membersHeader = [].find.call(allPanelHeaders, singleItem => singleItem.firstChild.data === 'Участники');
    let allLabels = $(membersHeader).next().find('tr td:first-child');
    let assigneeBlock = [].find.call(allLabels, singleItem => singleItem.firstChild.data === 'Исполнитель');
    
    $(assigneeBlock).append(`
        <div id="ah-change-assignee-wrapper">
            <button type="button" id="ah-change-assignee-to-me-btn" 
                class="ah-default-btn ah-change-assignee-btn" 
                title="Назначить себя в качестве исполнителя">
            </button>
            <button type="button" id="ah-clear-assignee-btn" 
                class="ah-default-btn ah-change-assignee-btn" 
                title="Сбросить исполнителя">
                <span class="glyphicon glyphicon-remove-circle"></span>
            </button>
        </div>
    `);
    
    let changeBtns = $('#ah-change-assignee-to-me-btn, #ah-clear-assignee-btn');
    $(changeBtns).click(function () {
        let ticketStatus = getTicketStatusText();
        if ((~ticketStatus.indexOf('закрытое')
            || ticketStatus === 'решенное')
            && !isAuthority('ROLE_HELPDESK_CHANGE_ASSIGNEE_ANY_STATUS')) {
            alert('Это действие недоступно для обращений со статусами "Закрытое" и "Решенное"');
            return;
        }
        
        let btn = $(this).attr('id');
        let agentId;
        switch (btn) {
            case 'ah-change-assignee-to-me-btn':
                agentId = localStorage.agentID;
                break;
                
            case 'ah-clear-assignee-btn':
                agentId = '';
                break;
        }
        
        $('#ah-loading-layer').show();
        addExtraAssigneeId(agentId);
        helpDeskClickImitation();
    });
}
//+++++++++++ Смена ассигни +++++++++++//

function addTicketControlTools() {
    $('#ah-ticket-control-tools-container').remove();

    $('.helpdesk-side-panel-setting-checkbox').after('<div id="ah-ticket-control-tools-container" style=""><div class="ah-clearfix"></div></div>');

    addSmiles();

    attendantTL();
}

//---------- смайлы (пользователь похвалил или наругал нас) ----------//
function addSmiles() {
    $('#ah-ticket-control-tools-container').prepend('<div class="ah-class-ticket-container" style=""><b style="vertical-align : middle; line-height : 1; font-size : 13px; font-weight : 500; color : #959595;">Классифицировать: </b></div>');

    $('div.ah-class-ticket-container').append('<input type="button" class="ah-default-btn ah-img-btn" id="ah-smile-btn-up" style="margin: 0; border-radius: 0;" title="Положительный тикет от пользователя - нас похвалили за что-то" data-tag-id="1000" data-tag-name="user_joy">');
    $('div.ah-class-ticket-container').append('<input type="button" class="ah-default-btn ah-img-btn" id="ah-smile-btn-down" style="margin: 0; border-radius: 0;" title="Отрицательный тикет от пользователя - нас поругали за что-то" data-tag-id="999" data-tag-name="user_pain">');

    $('input[id^="sh-smile-btn"]').click(function() {
		$('#ah-loading-layer').show();
        checkTagInTicket($(this).data('tagId'));
    });
}

//++++++++++ смайлы (пользователь похвалил или наругал нас) ++++++++++//

//---------- дежурный тимлид ----------//
function attendantTL() {
	 $('#attendant-tl-notification').remove();
	 
    $('#ah-ticket-control-tools-container').prepend('<button type="button" class="ah-default-btn ah-btn-small ah-attendant-tl-btn" style="" id="ah-attendant-tl-btn" title="Отправка обращения дежурному тимлидеру">Помощь ТЛ </button>');

	var commentsToggleBlock = $('.helpdesk-ticket-comments-toggle');
	var openAnswerInput = $(commentsToggleBlock).find('[name="type-selector"][value="2"]');
	$(openAnswerInput).unbind('click');
	
    $('#ah-attendant-tl-btn').click(function() {
        attendantTLBtnHandler($(this));
    });
}

function attendantTLBtnHandler(btn) {
    // проверка на статус тикета
    var statusText = getTicketStatusText();
    if (statusText != 'открытое' && statusText != 'на удержании') {
        alert('Для отправки обращения дежурному тимлидеру статус обращения должен быть "открытое" или "на удержании"');
        return;
    }
	
	// проверка ассигни
	var commentsToggleBlock = $('.helpdesk-ticket-comments-toggle');
    var input = $(commentsToggleBlock).find('[name="type-selector"][value="2"]');
	if ($(input).prop('disabled')) {
		alert('Для отправки обращения дежурному тимлидеру Вы долджны быть назначены в качестве Исполнителя');
        return;
	}

	// проверка вкладки "Параметры"
    let allPanelHeaders = getHdLeftPanelHeaders();
	if (allPanelHeaders.length === 0) {
        alert('Пожалуйста, перейдите во вкладку "Параметры" и повторите попытку');
        return;
    }
	
    if (!$(btn).hasClass('ah-active-btn')) {
        $('#ah-loading-layer').show();
        getAttendantTL(btn);
    } else {
        $(btn).toggleClass('ah-active-btn');
        $('#attendant-tl-notification').remove();
		outTextFrame('Отключен режим отправки обращения дежурному тимлидеру');
		
		var receiverField = $('.helpdesk-comment-holder .helpdesk-select-typeahead');
		var receiverClear = $(receiverField).find('.close');
		if ($(receiverClear).length) {
			$(receiverClear).click();
		}
    }
}

function getAttendantTL(btn) {
    chrome.runtime.sendMessage({
            action: 'XMLHttpRequest',
            method: "GET",
            url: `${connectInfo.ext_url}/support_helper/attendant_tl/getTL.php?login=`+ global.userInfo.subdivision.teamlead_login,
        },

        function(response) {
            global.attendantTlInfo = {};
            $('#ah-loading-layer').hide();
            if (response == 'error') {
                setTimeout(function() {
                    alert('Произошла техническая ошибка.');
                }, 100);
                return;
            }
			
			if (response == '') {
                setTimeout(function() {
                    alert('Не удалось определить вашего тимлидера.');
                }, 100);
                return;
            }
			
            try {
                var response = JSON.parse(response);
            } catch(e) {
                setTimeout(function() {
                    alert('Произошла техническая ошибка.\n'+ e);
                }, 100);
                return;
            }
			
            global.attendantTlInfo = response;
			// console.log(global.attendantTlInfo);
			
            setInternalNoteMode(btn);
        }
    );
}

function setInternalNoteMode(btn) {
    $(btn).toggleClass('ah-active-btn');

    var commentsToggleBlock = $('.helpdesk-ticket-comments-toggle');
    var input = $(commentsToggleBlock).find('[name="type-selector"][value="3"]');
    var label = $(input).parent('label');

    if (!label.length) {
        alert('Ошибка: не удалось переключиться в режим внутреннего примечания.');
        $(btn).toggleClass('ah-active-btn');
        $('#attendant-tl-notification').remove();
		global.attendantTlInfo = {};
        return;
    }
    $(label).click();

    setTimeout(() => {
        var commentForm = $('form.js-new-comment');
        var usersSelect = $(commentForm).find('.helpdesk-select-typeahead-value');
        if (!usersSelect.length) {
            alert('Ошибка: не удалось выбрать тимлидера в качестве адресата.');
            $(btn).toggleClass('ah-active-btn');
            $('#attendant-tl-notification').remove();
			global.attendantTlInfo = {};
            return;
        }
        $(usersSelect).click();

        setTimeout(() => {
            var teamLeadName = global.attendantTlInfo.name +' '+ global.attendantTlInfo.surname;
            var list = $(commentForm).find('.helpdesk-select-typeahead-dropdown-list');
            var item = $(list).find('.helpdesk-select-typeahead-dropdown-item:contains('+ teamLeadName +')');
            var value = $(commentForm).find('.helpdesk-select-typeahead-value div');
			showAttendantTlNotification();
			
            if (!item.length) {
                setTimeout(function() {
                    alert('Не удалось найти тимлидера "'+ teamLeadName +'" в списке получателей внутреннего примечания.\nЕсли данный тимлидер еще не назначен получателем, пожалуйста, сделайте это вручную.');
                    $(usersSelect).click();
                }, 100);
                return;
            }

            $(item).click();
			
			var openAnswerInput = $(commentsToggleBlock).find('[name="type-selector"][value="2"]');
			$(openAnswerInput).unbind('click').click(function() {
				if (!$(btn).hasClass('ah-active-btn')) return;
				$(btn).toggleClass('ah-active-btn');
				$('#attendant-tl-notification').remove();
				outTextFrame('Отключен режим отправки обращения дежурному тимлидеру');
			});
			
        }, 10);
    }, 10);
}
function showAttendantTlNotification() {
    $('#attendant-tl-notification').remove();

    var detailsPanel = $('.helpdesk-details-panel');

    var ticketStatus = getTicketStatusText();
    var notifBody;
    switch (ticketStatus) {
        case 'открытое':
            notifBody = '<b>Включен режим отправки обращения дежурному тимлидеру.</b><br>Напишите внутреннее примечание для тимлидера, и нажмите кнопку "На удержании". После этого в обращении автоматически поменяется Исполнитель и проставится служебный тег <i>agent_help</i>.<br>Изменять получателя внутреннего примечания не нужно.';
            break;
        case 'на удержании':
            notifBody = '<b>Включен режим отправки обращения дежурному тимлидеру.</b><br>Напишите внутреннее примечание для тимлидера, и нажмите кнопку "Отправить". После этого в обращении автоматически поменяется Исполнитель и проставится служебный тег <i>agent_help</i>.<br>Изменять получателя внутреннего примечания не нужно.';
            break;

        default:
            notifBody = '<b>Включен режим отправки обращения дежурному тимлидеру.</b><br>Напишите внутреннее примечание для тимлидера, и нажмите кнопку "На удержании", если статус тикета "Открытый", или кнопку "Отправить", если статус тикета "На удержании". После этого в обращении автоматически поменяется Исполнитель и проставится служебный тег <i>"agent_help"</i>.<br>Изменять получателя внутреннего примечания не нужно.';
            break;
    }
    $(detailsPanel).before('<div id="attendant-tl-notification" class="ah-sh-helpdesk-notification ah-alert-warning"></div>');
    var notifBlock = $('#attendant-tl-notification');
    $(notifBlock).html(notifBody);
    $(notifBlock).fadeIn(100);
}

function checkAdmUserIdAttendantTL() {
    var teamLeadName = global.attendantTlInfo.name +' '+ global.attendantTlInfo.surname;
    if (!global.attendantTlInfo.adm_user_id) {
		$('#ah-loading-layer').hide();
		setTimeout(() => {
			alert('Не удалось назначить тимлидера "'+ teamLeadName +'" в качестве исполнителя. Пожалуйста, сообщите о данной ошибке вашему тимлидеру.');
		}, 100);
        return;
    }
	
	addTagAttendantTL();
}

function addTagAttendantTL() {
	var currentYOffset = window.pageYOffset;
    let allPanelHeaders = getHdLeftPanelHeaders();
    let classifHeader = [].find.call(allPanelHeaders, singleItem => singleItem.firstChild.data === 'Классификация');
    let allLabels = $(classifHeader).next().find('tr td:first-child');
    let tagLabel = [].find.call(allLabels, singleItem => singleItem.firstChild.data === 'Теги');
    let tagParent = tagLabel.parentNode;
    tagParent.querySelector('.pseudo-link').click();
	
	setTimeout(() => {
        var existingTags, newInput;
		existingTags = tagParent.querySelectorAll('input[name*=tag]');
		newInput = document.createElement('input');
		newInput.name = `tags[${existingTags.length}]`;
		newInput.type = 'text';
		newInput.value = 1251; // agent_help
        existingTags[0].parentNode.appendChild(newInput);

		var admUserId = global.attendantTlInfo.adm_user_id;
		addExtraAssigneeId(admUserId);
			
	    document.querySelector('.helpdesk-click-fog').click();
		window.scrollTo(0, currentYOffset);
		$('#ah-loading-layer').hide();
    },10);
}
//++++++++++ дежурный тимлид ++++++++++//

//---------- парсинг и одобрение IP ----------//
function parseIPInDetailsPanel(block, className) {
    if ( $('.'+ className +'').length > 0 ) {
        return;
    }
    // console.log('test');
    var regForIp = /((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)/g;
    var detailsBlock = block;

    if ( $(detailsBlock).length ) {
        $(detailsBlock).each(function(i, item) {
            var allLinks = $(item).find('a');
            $(allLinks).each(function(i, singleLink) {
                var singleLinkText = $(singleLink).text();
                if ( ~singleLinkText.search(regForIp) ) {
                    $(singleLink).replaceWith('<span class="ah-replaced-ip-link">'+ singleLinkText +'</span>');
                }
            });

            var itemHtml = $(item).html();
            if ( ~itemHtml.search(regForIp) ) {
                $(item).html( itemHtml.replace(regForIp, '<span class="ah-matched-ip-container"><a target="_blank" href="https://adm.avito.ru/system/access?ip=$&" class="'+ className +'">$&</a></span>') );
            }
        });
    }

    $('.'+ className +'').each(function(i, item) {
        let parentBlock = $(item).parents('.ah-matched-ip-container');
        let ipText = $(parentBlock).find('.'+ className +'').text();
        let content = `
            <div class="btn-group-vertical">
                <button type="button" class="btn btn-info btn-sm info-ip-ticket-details" data-ip="${ipText}">
                    <span class="glyphicon glyphicon-info-sign"></span> Инфо
                </button>
                <button type="button" class="btn btn-default btn-sm copy-ip-ticket-details" data-copy-text="${ipText}">
                    <span class="glyphicon glyphicon-copy"></span> Скопировать
                </button>
                <button type="button" class="btn btn-default btn-sm ah-sanction-ip-btn" data-ip="${ipText}">
                    <span class="glyphicon glyphicon-ok"></span> Одобрить
                </button>
            </div>
        `;
        createNotHidingPopover($(parentBlock), content, {
            placement: 'top',
            onShownFunc: function() {
                let popover = $('.ah-not-hiding-popover');
                let infoBtn = $(popover).find('.info-ip-ticket-details');
                let self = $(this);

                $(infoBtn).unbind('click').click(function () {
                    let ip = $(this).data('ip');
                    let btn = $(this);
                    btnLoaderOn($(btn));

                    getIpInfo(ip)
                        .then(
                            response => showIpInfoPopover($(self).find('a'), response),
                            error => alert(`Произошла ошибка:\n${error.status}\n${error.statusText}`)
                        ).then(
                            () => {
                                btnLoaderOff($(btn));
                                let notHidingPopoverId = $('.ah-not-hiding-popover').attr('id');
                                $(`[aria-describedby="${notHidingPopoverId}"]`).popover('hide');
                            }
                        );
                });

                let copyBtn = $(popover).find('.copy-ip-ticket-details');
                $(copyBtn).unbind('click').click(function () {
                    let text = $(this).data('copyText');
                    chrome.runtime.sendMessage( { action: 'copyToClipboard', text: text } );
                    outTextFrame(`IP ${text} скопирован!`);
                });

                let sanctionBtn = $(popover).find('.ah-sanction-ip-btn');
                $(sanctionBtn).unbind('click').click(function() {
                    let ip = $(this).attr('data-ip');
                    let ticketLink = window.location.href;
                    renderSanctionIPPopup(ip, ticketLink);
                    showSanctionIPPopup();
                });
            }
        });
    });
}

// Одобрение IP в техинфо
function sanctionIPTechInfo() {
    $('#ah-tech-info-sanction-ip-btn').remove();

    var regForIp = /((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)/g;

    let allPanelHeaders = getHdLeftPanelHeaders();
    let techInfoHeader = [].find.call(allPanelHeaders, singleItem => singleItem.firstChild.data === 'Техническая информация');
    let allLabels = $(techInfoHeader).next().find('tr td:first-child');
    let ipLabel = [].find.call(allLabels, singleItem => singleItem.firstChild.data === 'IP');
    let ipBlock = $(ipLabel).next();
    let ipInfoText = $(ipBlock).text();

    if ( ~ipInfoText.search(regForIp)) {
        var ip = ipInfoText.match(regForIp);
        $(ipLabel).append('<button id="ah-tech-info-sanction-ip-btn" type="button" class="ah-default-btn ah-sanction-ip-btn" style="" title="" data-ip="'+ ip +'">Одобрить</button>');

        $('#ah-tech-info-sanction-ip-btn').click(function() {
            var ip = $(this).attr('data-ip');
            var ticketLink = window.location.href;
            renderSanctionIPPopup(ip, ticketLink);
            showSanctionIPPopup();
        });
    }
}


//++++++++++ парсинг и одобрение ++++++++++//

//---------- поиск по соцсети ----------//
function addSearchUserBySocialBlock() {
    $('#search-user-by-social-form').remove();

    var formBlock = $('form[action="/users/search"]');

	$(formBlock).after('<div class="form-group search-user-by-social-wrapper" style="margin-top: 15px;" id="search-user-by-social-form"><input type="text" class="form-control" name="socialId" placeholder="ID социальной сети"><button class="btn btn-primary social-search-btn" type="button" style="margin-top: 15px;" id="search-by-social-btn"><i aria-hidden="true" class="glyphicon  glyphicon-search"></i> Search</button></div>');

    var searchBtn = $('#search-by-social-btn');
    $(searchBtn).unbind('click').click(function() {
		searchBySocialBtnHandler($(this));
    });
}
//++++++++++ поиск по соцсети ++++++++++//

//---------- Копирование ссылки на тикет ----------//
function copyCurrentTicketLink() {
    $('#copyCurrentTicketLink').remove();

   let ticketHeaderTitle = $('.hd-ticket-header-title');
   $(ticketHeaderTitle).before(`<button id="copyCurrentTicketLink" class="ah-default-btn ah-btn-small" type="button" style="margin-bottom: 6px;">
        <span class="ah-support-button-label ah-copy-img" style="border-radius: 0; font-size: 12px; top: 2px; line-height: 16px;"></span>
        Скопировать ссылку на обращение
        </button>`);

    $('#copyCurrentTicketLink').click(function () {
        let ticketLink = getCurrentTicketLink();
        chrome.runtime.sendMessage({action: 'copyToClipboard', text: ticketLink});
        outTextFrame('Ссылка скопирована!');
    });
}
//++++++++++ Копирование ссылки на тикет ++++++++++//

//---------- Копирование имени реквестера ----------//
function copyRequesterName() {
    if ($('#ahCopyRequesterName').length !== 0) return;

    try {
        let requesterNameNode = $('.hd-ticket-header-metadata:eq(0) .hd-ticket-header-metadata-left b')[0].childNodes[1];
        $(requesterNameNode).wrap(`<span id="ahCopyRequesterName"></span>`);
        copyDataTooltip($('#ahCopyRequesterName'), {
            getText: function(elem) {
                return getUserNameTamplate($(elem).text());
            }
        });
    } catch (e) {}
}
//++++++++++ Копирование имени реквестера ++++++++++//

//---------- Копирование айди тикета ----------//
function copyTicketId() {
    if ($('#ahCopyTicketId').length !== 0) return;

    try {
        let ticketIdNode = $('.hd-ticket-header-metadata:eq(0) .hd-ticket-header-metadata-left')[0].childNodes[5];
        $(ticketIdNode).wrap(`<span id="ahCopyTicketId"></span>`);

        copyDataTooltip($('#ahCopyTicketId'), {
            getText: function(elem) {
                let ticketid = $(elem).text().trim();
                return `№${ticketid}`;
            }
        });
    } catch (e) {}
}
//++++++++++ Копирование айди тикета ++++++++++//

//---------- поповер для айди айтема на левой панели ----------//
function addItemIdPopoverOnLeftPanel() {
    if ($('.ah-hd-item-id-left-panel-popover').length !== 0) return;

    try {
        const allPanelHeaders = getHdLeftPanelHeaders();
        const classifHeader = [].find.call(allPanelHeaders, singleItem => singleItem.firstChild.data === 'Классификация');
        const $allLabels = $(classifHeader).next().find('tr td:first-child');
        const itemIdLabel = [].find.call($allLabels, singleItem => singleItem.firstChild.data === 'Номер объявления');
        const $itemLinks = $(itemIdLabel).next().find('a');
        $itemLinks.wrap(`<span class="ah-hd-item-id-left-panel-popover"></span>`);

        const $popoverNodes = $('.ah-hd-item-id-left-panel-popover');

        $popoverNodes.each((idx, item) => {
            const $item = $(item);
            const itemId = $item.text();
            const content = `
                <div class="btn-group-vertical">
                    <button type="button" class="btn btn-default btn-sm" id="ah-copyItemIdOnLeftPanel" data-item-id="${itemId}">
                       <span class="glyphicon glyphicon-copy"></span> Скопировать
                   </button>
                </div>
            `;

            createNotHidingPopover($item, content, {
                placement: 'top',
                onShownFunc: function() {
                    const $copyBtn = $('#ah-copyItemIdOnLeftPanel');
                    $copyBtn.click(function () {
                        const text = `№${$(this).data('itemId')}`;
                        chrome.runtime.sendMessage( { action: 'copyToClipboard', text: text } );
                        outTextFrame(`Скопировано: ${text}`);
                    });
                }
            });
        });
    } catch (e) {
        console.log(e);
    }
}
//++++++++++ поповер для айди айтема на левой панели ++++++++++//

//---------- поповер для айпи на левой панели ----------//
function addIpPopoverOnLeftPanel() {
    if ($('#ahIpOnLeftPanelPopover').length !== 0) return;

    try {
        let allPanelHeaders = getHdLeftPanelHeaders();
        let techInfoHeader = [].find.call(allPanelHeaders, singleItem => singleItem.firstChild.data === 'Техническая информация');
        let allLabels = $(techInfoHeader).next().find('tr td:first-child');
        let ipLabel = [].find.call(allLabels, singleItem => singleItem.firstChild.data === 'IP');
        let ipTextBlock = $(ipLabel).next()[0].firstChild;
        let ip = $(ipTextBlock).text();

        $(ipTextBlock).wrap(`<span id="ahIpOnLeftPanelPopover"></span>`);
        $(ipTextBlock).wrap(`<span id="ahIpInfoOnLeftPanelTrigger"></span>`);
        let content = `
            <div class="btn-group-vertical">
                <button type="button" class="btn btn-info btn-sm" id="infoIpOnLeftPanel" data-ip="${ip}">
                    <span class="glyphicon glyphicon-info-sign"></span> Инфо
                </button>
                <button type="button" class="btn btn-default btn-sm" id="copyIpOnLeftPanel" data-copy-text="${ip}">
                    <span class="glyphicon glyphicon-copy"></span> Скопировать
                </button>
            </div>
        `;

        createNotHidingPopover($('#ahIpOnLeftPanelPopover'), content, {
            placement: 'top',
            onShownFunc: function() {
                let infoBtn = $('#infoIpOnLeftPanel');
                $(infoBtn).unbind('click').click(function () {
                    let ip = $(this).data('ip');
                    let btn = $(this);
                    btnLoaderOn($(btn));

                    getIpInfo(ip)
                        .then(
                            response => showIpInfoPopover($('#ahIpInfoOnLeftPanelTrigger'), response),
                            error => alert(`Произошла ошибка:\n${error.status}\n${error.statusText}`)
                        ).then(
                            () => {
                                btnLoaderOff($(btn));
                                let notHidingPopoverId = $('.ah-not-hiding-popover').attr('id');
                                $(`[aria-describedby="${notHidingPopoverId}"]`).popover('hide');
                            }
                        );
                });

                let copyBtn = $('#copyIpOnLeftPanel');
                $(copyBtn).unbind('click').click(function () {
                    let text = $(this).data('copyText');
                    chrome.runtime.sendMessage( { action: 'copyToClipboard', text: text } );
                    outTextFrame(`IP ${text} скопирован!`);
                });
            }
        });
    } catch (e) {}
}

function helpdeskIpInfoHandler(xhr, options) {
    let popoverTrigger = $(options.popoverTrigger);
    btnLoaderOff($(options.clickedBtn));

    $(popoverTrigger).popover({
        html: true,
        container: 'body',
        placement: 'top',
        content: xhr.responseText,
        template: `
            <div class="popover ah-ip-info-popover ah-popover-destroy-outclicking">
                <div class="arrow"></div>
                <div class="popover-content"></div>
            </div>`
    }).popover('show');

    let notHidingPopoverId = $('.ah-not-hiding-popover').attr('id');
    $(`[aria-describedby="${notHidingPopoverId}"]`).popover('hide');

}
//++++++++++ поповер для айпи на левой панели ++++++++++//

//---------- поповер для номера телефона на левой панели ----------//
function addPhoneNumberPopoverOnLeftPanel() {
    if ($('#ahPhoneNumberOnLeftPanelPopover').length !== 0) return;

    try {
        let allPanelHeaders = getHdLeftPanelHeaders();
        let classifHeader = [].find.call(allPanelHeaders, singleItem => singleItem.firstChild.data === 'Классификация');
        let allLabels = $(classifHeader).next().find('tr td:first-child');
        let phoneLabel = [].find.call(allLabels, singleItem => singleItem.firstChild.data === 'Телефон');
        let phoneLink = $(phoneLabel).next().find('a');

        $(phoneLink).wrap(`<span id="ahPhoneNumberOnLeftPanelPopover"></span>`);
        let phoneNumber = $(phoneLink).text();
        let content = `
            <button type="button" class="btn btn-default btn-sm" id="copyPhoneNumberOnLeftPanel" data-copy-text="${phoneNumber}">
                <span class="glyphicon glyphicon-copy"></span> Скопировать
            </button>
        `;
        createNotHidingPopover($('#ahPhoneNumberOnLeftPanelPopover'), content, {
            placement: 'top',
            onShownFunc: function() {
                let copyBtn = $('#copyPhoneNumberOnLeftPanel');
                $(copyBtn).unbind('click').click(function () {
                    let text = $(this).data('copyText');
                    chrome.runtime.sendMessage( { action: 'copyToClipboard', text: text } );
                    outTextFrame(`Скопировано: ${text}`);
                });
            }
        });
    } catch (e) {}
}
//++++++++++ поповер для номера телефона на левой панели ++++++++++//

//---------- нотификация о жалобах от крайне негативных юзеров ----------//
function addNegativeUsersAbusesNotification() {
    const doc = document;
    const existingNotification = doc.getElementById('ah-negative-users-abuses-notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    const detailsPanel = doc.querySelector('.helpdesk-details-panel');
    const notification = doc.createElement('div');
    notification.setAttribute('id', 'ah-negative-users-abuses-notification');
    notification.className = 'alert ah-helpdesk-notification ah-negative-user-notification';
    if (!detailsPanel) return;
    detailsPanel.parentNode.insertBefore(notification, detailsPanel);

    const negativesInfo = JSON.parse(localStorage['/helpdesk/negativeUsers']);
    if (negativesInfo.isLoading) {
        notification.classList.add('ah-loading-notification');
        notification.innerHTML = `Загрузка информации о негативных клиентах...`;
        return;
    }

    if (negativesInfo.error && !negativesInfo.clients) {
        notification.classList.add('alert-danger', 'ah-load-error');
        notification.innerHTML = `Возникла ошибка при загрузке информации о негативных клиентах`;
        return;
    }

    let isFromCache = false;
    if (negativesInfo.error && negativesInfo.clients) {
        isFromCache = true;
    }

    document.dispatchEvent(new Event('requestHelpdeskStore'));
    const helpdeskStore = global.hdSettings.helpdeskStore;
    if (!helpdeskStore) return;
    const currentClientId = helpdeskStore.tickets.loadedInfo.requesterId;
    const currentInfo = negativesInfo.clients.find(item => item.client_id === currentClientId);

    if (currentInfo) {
        showNotification(currentInfo);
    } else {
        notification.classList.add('hidden');
    }

    function showNotification(info) {
        const currentTicketId = getCurrentTicketId(location.href);
        let notificationClassName = (+currentTicketId === info.root_ticket_id) ? 'alert-danger' : 'alert-warning';
        notification.classList.add(notificationClassName);
        let notificationTextHtml = (+currentTicketId === info.root_ticket_id) ?
            `Жалобы данного клиента обрабатываются в текущем обращении.
            <strong>Не закрывайте данное обращение со статусом "Решено".</strong>` :
            `Жалобы данного клиента обрабатываются в 
                <strong>
                    <a target="_blank" href="/helpdesk/details/${info.root_ticket_id}">отдельном обращении 
                        <span class="glyphicon glyphicon-new-window"></span></a>
                </strong>`;

        notification.innerHTML = `${notificationTextHtml} 
            (<i>Клиент: </i><span class="label label-default ah-user-type-label">${info.type_name}</span>)`;

        if (isFromCache) {
            const cache = doc.createElement('span');
            cache.className = `label label-warning ah-from-cache-label`;
            cache.innerHTML = `Данные взяты из кэша`;
            notification.appendChild(cache);
        }
    }
}
//++++++++++ нотификация о жалобах от крайне негативных юзеров ++++++++++//

//++++++++++ очистка цитат ++++++++++//
function blockquoteClear() {
    var size = $('blockquote').length;

    for (var i = 0; i < size; i++) {
        var text = $('blockquote').slice(i, i+1).html();
        text = text.replace(/(<br>){2,}/g,'');
        $('blockquote').slice(i, i+1).html(text);

    }
}

//---------- очистка цитат ----------//

//++++++++++ показать/скрыть цитаты ++++++++++//

function blockquoteHide() {
    if ( $('#sh-blockquoteHide').length == 0 ) {
        $('.ah-hd-global-settings-wrapper').append('<br><input type="checkbox" class="ah-alternate-search-checkbox" id="sh-blockquoteHide">');
        $('.ah-hd-global-settings-wrapper').append('<label for="sh-blockquoteHide" title="Скрывает все цитаты в обращении">Hide quotes</label>');
    }

    if (localStorage.getItem('shblockquoteHide') == "false" || !localStorage.getItem('shblockquoteHide')) {
        $("#sh-blockquoteHide").prop("checked", false);
        $('div.helpdesk-details-panel blockquote').show();
    }

    if (localStorage.getItem('shblockquoteHide') == "true") {
        $("#sh-blockquoteHide").prop("checked", true);
        $('div.helpdesk-details-panel blockquote').hide();
    }

    // запоминаем состояние чекбокса в локалсторадже
    $('#sh-blockquoteHide').click(function() {
        if(document.getElementById('sh-blockquoteHide').checked) {
            localStorage.setItem('shblockquoteHide', "true");
            $('div.helpdesk-details-panel blockquote').hide();
        } else {
            localStorage.setItem('shblockquoteHide', "false");
            $('div.helpdesk-details-panel blockquote').show();
        }
    });
}

//---------- показать/скрыть цитаты ----------//

//++++++++++ Показывать линию саппортов в HD ++++++++++//
function showAgentInfoTicket() {
    $('#ah-line-sup').remove();
    $('#customer-claim-notification').remove();

    let allPanelHeaders = getHdLeftPanelHeaders();
    let membersHeader = [].find.call(allPanelHeaders, singleItem => singleItem.firstChild.data === 'Участники');
    let allLabels = $(membersHeader).next().find('tr td:first-child');
    let assigneeLabel = [].find.call(allLabels, singleItem => singleItem.firstChild.data === 'Исполнитель');
    let assigneeBlock = $(assigneeLabel).next();
    let assigneeBlockSpan = $(assigneeBlock).find('span:last');

    // если никого нет, все падало:)
    if ($(assigneeBlockSpan).text() === "Назначить") {
        claimReevaluation();
        return;
    }
    if (global.allUsersInfo === 'FatalError') {
        $(assigneeBlockSpan).before('<span id="ah-line-sup" style=""><span class="label" title="Произошла техническая ошибка"  style="color: #d9534f; padding: 0; font-weight: 700;">Er</span></span> ');
        return;
    }

    var name = $(assigneeBlockSpan).text();
    var tmp = name.split('(');
    if (tmp[1] != undefined) {
        var currentLogin = tmp[1].split('@');
    } else {
        return;
    }
    
    for (var i = 0; i < global.allUsersInfo.length; i++) {
        let user = global.allUsersInfo[i];
        if (user.username == currentLogin[0]) {
            // console.log(user);
            let teamleadLogin = user.teamlead_login;
            claimReevaluation(teamleadLogin); // переоценка претензионщиками
            $(assigneeBlockSpan).before('<span id="ah-line-sup"><span class="label" title="'+user.subdivision_name+' ('+user.teamlead+')\nСмена: '+user.shift+'\nВыходные: '+user.weekend+'"  style="background:#'+user.sub_color+';">'+user.subdivision+'</span></span> ');
        }
        let userSubdId = +user.subdivision_id;
        if (userSubdId === 76 && user.username == currentLogin[0]) {
            customerClaimNotif();
        }
    }
    
    // если не нашло по логину, пробуем по нейму (логины иногда не совпадают с мылом)
    if ($('#ah-line-sup').length === 0) {
        try {
            var assigneeNameText = tmp[0].replace(/(^ | $)/g, '');
        } catch(e) {
            return;
        }
        
        for (var i = 0; i < global.allUsersInfo.length; i++) {
            let user = global.allUsersInfo[i];
            let userFullName = user.name.replace(/(^ | $)/g, '') 
                    +' '+ user.surname.replace(/(^ | $)/g, '');
            
            if (assigneeNameText === userFullName) {
                let teamleadLogin = user.teamlead_login;
                claimReevaluation(teamleadLogin); // переоценка претензионщиками
                $(assigneeBlockSpan).before('<span id="ah-line-sup"><span class="label" title="'+user.subdivision_name+' ('+user.teamlead+')\nСмена: '+user.shift+'\nВыходные: '+user.weekend+'"  style="background:#'+user.sub_color+';">'+user.subdivision+'</span></span> ');
            }
        }
    }

    if ($('#ah-line-sup').length === 0) {
        claimReevaluation();
    }
}
//---------- Показывать линию саппортов в HD ----------//

//---------- нотификация об ассигни претензионной линии ----------//
function customerClaimNotif() {
    var detailsPanel = $('.helpdesk-details-panel');
    var notifBody = '<b>В текущем обращении исполнителем назначен агент претензионной линии.</b>';
    $(detailsPanel).before('<div id="customer-claim-notification" class="ah-sh-helpdesk-notification ah-alert-danger"></div>');
    var notifBlock = $('#customer-claim-notification');
    $(notifBlock).html(notifBody);
    $(notifBlock).show();
}
//++++++++++ нотификация об ассигни претензионной линии ++++++++++//

//---------- переоценка претензионщиками ----------//
function claimReevaluation(teamleadLogin) {
    $('#reevaluate-ticket-container').remove();

    if (!isAuthority('ROLE_HELPDESK_CLAIM_REEVALUATION')) return;

    $('.helpdesk-side-panel-setting-checkbox').append(`
        <div style="margin: 10px 0;" id="reevaluate-ticket-container" class="ah-tooltip-wrapper ah-disabled">
        </div>
    `);

    $('#reevaluate-ticket-container').append(`
        <button type="button" class="btn btn-default btn-block btn-sm" id="reevaluate-ticket" disabled>Переоценить обращение</button>
    `);

    let starsFired = $('.hd-ticket-header-metadata header span').filter(function() {
        return this.classList.length === 2;
    });

    let btn = $('#reevaluate-ticket');
    let btnContainer = $('#reevaluate-ticket-container');
    if ($(starsFired).length >= 1 && $(starsFired).length <=3 && teamleadLogin) {
        $(btn).prop('disabled', false).click(function() {
            $('#ah-loading-layer').show();
            getReevaluateTLTagId(teamleadLogin);
        });
    } else {
        $(btnContainer).attr('data-toggle', 'tooltip')
                .attr('data-placement', 'left')
                .attr('title', 'Функция доступна только при наличии инфо-значка рядом с текущим Исполнителем и только для обращений с оценкой 1, 2 или 3.');
        $(btnContainer).tooltip();
    }
}

function getReevaluateTLTagId(leaderLogin) {
    chrome.runtime.sendMessage({
            action: 'XMLHttpRequest',
            method: "GET",
            url: `${connectInfo.ext_url}/support_helper/reevaluate_tags/getTag.php?leader_login=`+ leaderLogin,
        },

        function(response) {
            $('#ah-loading-layer').hide();
            let error = false;
            if (response === 'error') {
                error = true;
            }

            let json;
            let tlTagId;
            try {
                json = JSON.parse(response);
                tlTagId = json.avito_desk_id;
            } catch(e) {
                error = true;
            }


            if (!tlTagId || error) {
                alert("Не удалось определить тег для тимлидера. Пожалуйста, добавьте тег вручную.");
            }
            let tags = [tlTagId, 1265];

            addExtraAssigneeId(localStorage.agentID);
            addTagToTicket(tags.join(', '));
        }
    );
}
//++++++++++ переоценка претензионщиками ++++++++++//

//++++++++++ парсинг айди айтемов в комменте ++++++++++//
function parseItemIdsInTicket() {
    // console.log('parseItemIdsInTicket Func');

    $('.sh-parsing-tools-holder').remove();
    $('#parsed-item-ids').remove();
    // $('#parsed-item-ids').removeOld();

    // var trueReg = /\d{9,10}(?!@|[ёа-я])\b/gi;
    var trueReg = /(^|[_ ,>]|(avito\.ru\/)|(item\/info\/))\d{9,10}(?!(.[ёа-я\w]*){0,1}@|[ёа-я])\b/gim;
    // var falseReg = /(\+7\d+)|(8\d{10})/gi;
    var trueMatches = [];
    var falseMatches = [];

    var btnName = 'Получить ID объявлений';
    // комменты
    var allComments = $('.helpdesk-details-panel .helpdesk-html-view:not(.hidden)');
    $(allComments).each(function(i, comment) {
        var commentText = $(comment).html();
        trueMatches = commentText.match(trueReg);
        if (!trueMatches) return;

        trueMatches.forEach(function(item, i, arr) {
            arr[i] = item.replace(/\D/g, '');
        });
        // falseMatches = commentText.match(falseReg);

        // console.log(trueMatches, falseMatches);
        // if (!trueMatches || falseMatches) return;


        trueMatches = unique(trueMatches);

        var commentBlock = $(comment).parents('.helpdesk-ticket-single-comment');
        $(commentBlock).append('<div class="sh-parsing-tools-holder sh-comment-parsing-tools" style="margin-top: 4px;"><button type="button" class="ah-default-btn ah-btn-small ah-get-item-ids" style="" data-item-ids="'+ trueMatches.join(', ') +'">'+ btnName +'</button></div>');
    });

    // описание
    var desciption = $('.helpdesk-details-panel .helpdesk-html-view.helpdesk-ticket-paragraph:not(.hidden)');
    if ( $(desciption).length ) {
        var descText = $(desciption).html();
        trueMatches = descText.match(trueReg);
        // falseMatches = descText.match(falseReg);
        if (!trueMatches) return;

        trueMatches.forEach(function(item, i, arr) {
            arr[i] = item.replace(/\D/g, '');
        });
        // if (!trueMatches || falseMatches) return;
        // if (!trueMatches) return;

        trueMatches = unique(trueMatches);

        $(desciption).after('<div class="sh-parsing-tools-holder sh-description-parsing-tools" style="margin-top: 10px;"><button type="button" class="ah-default-btn ah-btn-small ah-get-item-ids" style="" data-item-ids="'+ trueMatches.join(', ') +'">'+ btnName +'</button></div>');
    }

    $('.ah-get-item-ids').click(function() {
        var ids = $(this).attr('data-item-ids').split(', ');
        showParsedItemIdsInTicket(ids);
    });
}

function showParsedItemIdsInTicket(ids) {
    $('#parsed-item-ids').remove();

    $('body').append('<div class="ah-no-blocking-popup-fixed" id="parsed-item-ids" style="left: 10px; width: calc(25% - 20px);"></div>');
    var popup = $('#parsed-item-ids');
    $(popup).append('<div class="ah-popup-container"></div>');
    var container = $(popup).find('.ah-popup-container');

    $(container).append('<div class="ah-popup-header" style="border-bottom: none;"></div>');
    $(container).append('<div class="ah-popup-body" style="padding-top: 0;"></div>');
    $(container).append('<div class="ah-popup-footer" style="text-align: right;"></div>');

    var header = $(popup).find('.ah-popup-header');
    var body = $(popup).find('.ah-popup-body');
    var footer = $(popup).find('.ah-popup-footer');

    $(header).append('<span class="ah-popup-title">Проверка объявлений <span class="ah-parsed-item-checked-counter"></span></span><button type="button" class="ah-default-btn ah-btn-small ah-popup-close">x</button>');
    (header).append('<div class="ah-clearfix"></div>');

    $(body).append('<div class="ah-all-parsed-items"></div>');
    var parsedContainer = $(body).find('.ah-all-parsed-items');
    ids.forEach(function(id) {
        $(parsedContainer).append('<div class="ah-parsed-item-row"><div class="single-parsed-item-header" data-item-id="'+ id +'"><span class="ah-single-parsed-item"><input class="ah-transparent-checkbox" type="checkbox" id="parsed-item-'+ id +'" value="'+ id +'" checked><label for="parsed-item-'+ id +'"><a target="_blank" href="https://adm.avito.ru/items/item/info/'+ id +'">'+ id +'</a><span class="parsed-item-info"></span></label></span></div><div class="ah-parsed-item-user-info-details ah-popover" style="left: calc(100% + 10px);"></div></div>');
    });

    $(footer).append('<a target="_blank" class="ah-link-btn" data-btn-info="items-search" href="https://adm.avito.ru/items/search?query='+ ids.join('%7C') +'" title="Поиск отмеченных объявлений в items/search">Найти</a><button type="button" class="ah-default-btn" style="" data-btn-info="check-users" title="Получение информации об учетных записях, на которых размещены отмеченные объявления">Проверить УЗ</button>');


    // обработчики
    var checkboxes = $(body).find('[id^="parsed-item"]');
    var counter = $(header).find('.ah-parsed-item-checked-counter');
    var checked = $(body).find('[id^="parsed-item"]:checked');
    $(counter).text( '('+ $(checked).length +' из '+ $(checkboxes).length+')' );

    var searchLink = $(footer).find('[data-btn-info="items-search"]');
    var checkUsers = $(footer).find('[data-btn-info="check-users"]');

    var closeBtn = $(popup).find('.ah-popup-close');
    $(closeBtn).click(function() {
        $(popup).remove();
    });

    $(checkboxes).change(function() {
        var checked = $(body).find('[id^="parsed-item"]:checked');
        var checkedIds = [];
        $(checked).each(function(i, item) {
            checkedIds.push( $(item).val() );
        });
        $(searchLink).attr('href', 'https://adm.avito.ru/items/search?query='+ checkedIds.join('%7C'));

        $(counter).text( '('+ $(checked).length +' из '+ $(checkboxes).length+')' );

        if ( !$(this).prop('checked') ) {
            $(this).parents('.single-parsed-item-header').css('opacity', '0.6');
        } else {
            $(this).parents('.single-parsed-item-header').css('opacity', '1');
        }
    });

    $(checkUsers).click(function() {

        var checked = $(body).find('[id^="parsed-item"]:checked');
        var checkedIds = [];
        $(checked).each(function(i, item) {
            checkedIds.push( $(item).val() );
        });

        if (!checkedIds.length) {
            alert('Выберите хотя бы одно объявление.');
            return;
        }

        $('#ah-loading-layer').show();

        var labels = $(checked).next();
        $(labels).find('.parsed-item-info').html('');

        var userInfoBlocks = $(checked).parents('.ah-parsed-item-row').find('.ah-parsed-item-user-info-details');
        $(userInfoBlocks).html('');

        $(labels).find('.parsed-item-info').append('<span class="ah-loading-indicator-text" style="margin-left: 6px;">Загрузка...</span>');

        checkedIds.forEach(function(itemId, i) {
            setTimeout(getUserIdByItem, i * 250, itemId);
        });
    });

    $(popup).show();
}

function getUserIdByItem(itemId) {
    var popup = $('#parsed-item-ids');
    var label = $(popup).find('.single-parsed-item-header[data-item-id="'+ itemId +'"] label');
    var parsedItemInfo = $(label).find('.parsed-item-info');

    var url = 'https://adm.avito.ru/items/item/info/' + itemId;
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.send(null);
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
            var userId;

            if (xhr.status == 200) {
                var response = xhr.responseText;
                try {
                    userId = $(response).find('[href^="/users/user/info/"]');
                    userId = $(userId).attr('href').replace(/\D/gi, '');
                } catch(e) {
                    userId = 'error';
                }

            }

            if (xhr.status >= 400) {
                $(parsedItemInfo).find('.ah-loading-indicator-text').remove();
                $(parsedItemInfo).append('<span style="color: #d9534f; margin-left: 4px; font-weight: 700;">- '+ xhr.status +', '+ xhr.statusText +'</span>');
            }

            $(parsedItemInfo).append('<span data-user-id="'+ userId +'" style="display: none;"></span>');

            var checked = $(popup).find('.ah-popup-body [id^="parsed-item"]:checked');
            var checkedCount = $(checked).length;
            var allParsed = $(checked).next().find('[data-user-id]');
            var allParsedCount = $(allParsed).length;

            if (checkedCount == allParsedCount) {
                var allUsers = [];
                $(allParsed).each(function(i, item) {
                    var userId = $(item).attr('data-user-id');
                    allUsers.push(userId);
                });

                allUsers = unique(allUsers);
                for (var i = 0; i < allUsers.length; i++) {
                    if ( !isFinite(allUsers[i]) ) {
                        allUsers.splice(i, 1);
                        i--;
                    }
                }
                // console.log(allUsers);
                allUsers.forEach(function(userId, i) {
                    setTimeout(getUserInfoByItem, i * 250, userId);
                });
            }

            // скрываем оверлей, если нет индикаторов
            var indicators = $(popup).find('.parsed-item-info .ah-loading-indicator-text');
            if ( $(indicators).length == 0 ) {
                $('#ah-loading-layer').hide();
            }
        }
    }
}

function getUserInfoByItem(userId) {
    var popup = $('#parsed-item-ids');
    var label = $(popup).find('.single-parsed-item-header [id^="parsed-item"]:checked').next().find('[data-user-id="'+ userId +'"]').parents('label[for^="parsed-item"]');
    var itemInfo = $(label).find('.parsed-item-info');

    var url = 'https://adm.avito.ru/users/user/info/' + userId;
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.send(null);
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
            if (xhr.status == 200) {
                var response = xhr.responseText;
                var formElem = $(response).find('.js-user-info-form-user');
                var allLabels = $(formElem).find('.control-label');

                var shopField, subscriptionField, persManagerField;
                var shopValue, subscriptionValue, persManagerValue;

                $(allLabels).each(function(i, label) {
                    if ( $(label).text() == 'Магазин') {
                        shopField = $(label).parent('.form-group');
                        shopValue = $(shopField).find('.col-xs-9').text();
                    }
                    if ( $(label).text() == 'Подписка') {
                        subscriptionField = $(label).parent('.form-group');
                        subscriptionValue = $(subscriptionField).find('.col-xs-9').text();
                    }
                    if ( $(label).text() == 'Персональный менеджер') {
                        persManagerField = $(label).parent('.form-group');
                        persManagerValue = $(persManagerField).find('select option:selected').text();
                    }
                });
            }

            $(label).find('.parsed-item-info .ah-loading-indicator-text').remove();

            if (isFinite(userId)) {
                $(itemInfo).append('<span style="margin-left: 4px;">| <b>УЗ</b>: <a target="_blank" href="https://adm.avito.ru/users/user/info/'+ userId +'">'+ userId +'</a><span class="ah-parsed-item-user-info" style="margin-left: 4px;"><i>инфо</i></span></span>');

                var userInfo = $(itemInfo).find('.ah-parsed-item-user-info');
                if (!shopValue || !subscriptionValue || !persManagerValue) {
                    $(userInfo).html('<i>error</i>');
                }

                shopValue = shopValue || '';
                subscriptionValue = subscriptionValue || '';
                persManagerValue = persManagerValue || '';

                var isShop = false;
                var hasSubscription = false;
                var hasManager = false;
                if (~shopValue.toLowerCase().indexOf('оплачен')) {
                    isShop = true;
                }
                if (~subscriptionValue.toLowerCase().indexOf('подписка') && subscriptionValue.toLowerCase().indexOf('бронза') == -1) {
                    hasSubscription = true;
                }
                if (persManagerValue.toLowerCase() != 'нет' && persManagerValue) {
                    hasManager = true;
                }

                if (isShop || hasSubscription || hasManager) {
                    $(userInfo).css('color', '#d9534f');
                }

                var infoElem = $(itemInfo).find('.ah-parsed-item-user-info');
                $(infoElem).hover(function() {
                    var detailsParent = $(this).parents('.ah-parsed-item-row');
                    var detailsBlock = $(detailsParent).find('.ah-parsed-item-user-info-details');
                    var parentOffset = $(detailsParent)[0].offsetTop;
                    var body = $(popup).find('.ah-popup-body');
                    var bodyScrollTop = $(body)[0].scrollTop;

                    $(detailsBlock).css('top', ''+ (parentOffset - bodyScrollTop) +'px');

                    $(detailsBlock).show();
                }, function() {
                    var detailsParent = $(this).parents('.ah-parsed-item-row');
                    var detailsBlock = $(detailsParent).find('.ah-parsed-item-user-info-details');

                    $(detailsBlock).hide();
                });

                var userInfoBlock = $(itemInfo).parents('.ah-parsed-item-row').find('.ah-parsed-item-user-info-details');
                $(userInfoBlock).append('<table></table>');

                var userInfoTable = $(userInfoBlock).find('table');
                $(userInfoTable).append('<tr><td>'+ $(shopField).find('label').text() +'</td><td>'+ shopValue +'</td></tr>');
                $(userInfoTable).append('<tr><td>'+ $(subscriptionField).find('label').text() +'</td><td>'+ subscriptionValue +'</td></tr>');
                $(userInfoTable).append('<tr><td>'+ $(persManagerField).find('label').text() +'</td><td>'+ persManagerValue +'</td></tr>');
            }

            // скрываем оверлей, если нет индикаторов
            var indicators = $(popup).find('.parsed-item-info .ah-loading-indicator-text');
            if ( $(indicators).length == 0 ) {
                $('#ah-loading-layer').hide();
            }
        }
    }
}
//---------- парсинг айди айтемов в комменте ----------//

// мониторинг скиперов
function skipersMonitoring() {
    // console.log('skipersMonitoring FUNC');
    var ticketId, userName, userLogin;
    var dataObj;
    var ticketStatus;

    ticketId = getCurrentTicketId(window.location.href);
    userName = global.userInfo.name +' '+ global.userInfo.surname;
    userLogin = global.userInfo.username;

    var regExpNotSkiped = /ticket(Edit|Comment|Pending|Solve|OnHold|Spam|Duplicate)/i;

    ticketStatus = getTicketStatusText();
    var regExpTicketStatus = /новое|открытое|переоткрытое/i;

    chrome.runtime.onMessage.addListener(function (request, sender, callback) {

        if (request.onUpdated) {
            if (~request.onUpdated.search(regExpNotSkiped)) {
                chrome.runtime.onMessage.removeListener(arguments.callee);
            }

            if (request.onUpdated == 'ticketEnter') {
                if (~ticketStatus.search(regExpTicketStatus)) {
                    dataObj = {
                        ticketId: ticketId,
                        userName: userName,
                        userLogin: userLogin,
                        ticketStatus: ticketStatus
                    }
                    addSkipedTicketToDatabase(dataObj);
                }

                chrome.runtime.onMessage.removeListener(arguments.callee);
            }
        }
    });
}

function addSkipedTicketToDatabase(data) {
    // console.log('addSkipedTicketToDatabase FUNC', data);
    chrome.runtime.sendMessage({
            action: 'XMLHttpRequest',
            method: "POST",
            url: `${connectInfo.ext_url}/support_helper/other/addSkipedTicket.php`,
            data: "param=" + JSON.stringify(data),
        },

        function(response) {
            // console.log(response);

            if (~response.indexOf('Неверный запрос')) {
                // console.log('Произошла техническая ошибка.');
                return;
            }
        }
    );
}