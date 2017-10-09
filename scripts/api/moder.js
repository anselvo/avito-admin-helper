
// Авто добавление причине в поле "Другая причина"

function autoOtherReasons() {
    $('button[name="reject"], button[name="activate"], input.internReject').click(function () {
        let findReason = setInterval(function () {
            let box = $('.moderate-modal');

            if ($(box).length > 0) {
                clearInterval(findReason);
                optionOtherReasons('.moderate-modal', '.moderateBox_item', '[name="reason_other"]');
            }
        }, 100);
    });
}

function optionOtherReasons(blockSelector, reasonSelector, textSelector) {
    let otherReasonsCategory = {
        name: "Неправильная категория",
        reason: [
            {name: "Личные вещи", reason: ['Одежда, обувь, аксессуары', 'Детская одежда и обувь', 'Товары для детей и игрушки', 'Красота и здоровье', 'Часы и украшения']},
            {name: "Транспорт", reason: ['Запчасти и аксессуары', 'Автомобили', 'Грузовики и спецтехника', 'Мотоциклы и мототехника', 'Водный транспорт']},
            {name: "Для дома и дачи", reason: ['Ремонт и строительство', 'Мебель и интерьер', 'Бытовая техника', 'Посуда и товары для кухни', 'Растения', 'Продукты питания']},
            {name: "Бытовая электроника", reason: ['Телефоны', 'Аудио и видео', 'Товары для компьютера', 'Фототехника', 'Оргтехника и расходники', 'Игры, приставки и программы', 'Ноутбуки', 'Планшеты и электронные книги', 'Настольные компьютеры']},
            {name: "Хобби и отдых", reason: ['Коллекционирование', 'Спорт и отдых', 'Книги и журналы', 'Велосипеды', 'Музыкальные инструменты', 'Охота и рыбалка', 'Билеты и путешествия']},
            {name: "Недвижимость", reason: ['Квартиры', 'Дома, дачи, коттеджи', 'Земельные участки', 'Коммерческая недвижимость', 'Гаражи и машиноместа', 'Комнаты', 'Недвижимость за рубежом']},
            {name: "Работа", reason: ['Резюме', 'Вакансии']},
            {name: "Услуги", reason: ['Предложение услуг']},
            {name: "Животные", reason: ['Кошки', 'Собаки', 'Товары для животных', 'Другие животные', 'Аквариум', 'Птицы']},
            {name: "Для бизнеса", reason: ['Оборудование для бизнеса', 'Готовый бизнес']}
        ]
    };

    let otherReasonsService = {
        name: "Вид услуги",
        reason: ['IT, интернет, телеком', 'Бытовые услуги', 'Деловые услуги', 'Искусство', 'Красота, здоровье', 'Курьерские поручения',
            'Мастер на час', 'Няни, сиделки', 'Оборудование, производство', 'Обучение, курсы', 'Охрана, безопасность', 'Питание, кейтеринг',
            'Праздники, мероприятия', 'Реклама, полиграфия', 'Ремонт и обслуживание техники', 'Ремонт, строительство', 'Сад, благоустройство',
            'Транспорт, перевозки', 'Уборка', 'Установка техники', 'Уход за животными', 'Фото- и видеосъёмка', 'Другое']
    };

    let block = $(blockSelector);

    for (let i = 0; i < block.length; ++i) {
        addOtherReasons(block[i], reasonSelector, textSelector, otherReasonsCategory);
        addOtherReasons(block[i], reasonSelector, textSelector, otherReasonsService);
    }

    $('.ah-other-reasons').click(function (event) {
        event.stopPropagation();
    });

}

function addOtherReasons(block, reasonSelector, textSelector, otherReasons) {
    let name = otherReasons.name;
    let reasons = otherReasons.reason;

    let reasonSelectorContain = $(block).find(reasonSelector+':contains('+name+')');

    let content = '';
    let inReasons = [];
    for (let i = 0; i < reasons.length; ++i) {
        if (typeof reasons[i] === "object") {
            content += '<div class="ah-other-reason-block ah-has-children"><label><input type="checkbox" name="ah-other-reasons"/>' + reasons[i].name + '</label></div>';
            inReasons.push(reasons[i]);
        } else content += '<div class="ah-other-reason-block"><label><input type="checkbox" name="ah-other-reasons"/>' + reasons[i] + '</label></div>';
    }

    let template = '<div class="ah-other-reasons"><div class="popover-content">' + content + '</div></div>';

    if ($(reasonSelectorContain).find('.ah-other-reasons').length === 0) {

        $(reasonSelectorContain)
            .append(template)
            .mouseenter(function () {
                let blockItem = $(this).find('>.ah-other-reasons');

                $(blockItem).show();

                let width = $(blockItem).width();
                let offset = $(blockItem).offset();

                let rightPoint = offset.left + width;
                if (rightPoint > $(window).width()) $(blockItem).css('transform', 'translate(-100%, -60%)');
            })
            .mouseleave(function () {
                let blockItem = $(this).find('>.ah-other-reasons');

                $(blockItem).hide();
            });

        $(reasonSelectorContain)
            .find('[type="checkbox"]')
            .change(function () {
                // TODO косячная строчка, нужно передавать предка в функцию addOtherReasons()
                let difParent = '.moderateBox_item, .ah-other-reason-block, .moderate-block-list-item';

                if ($(this).prop('checked')) {
                    // $(this).closest(difParent).find('[type="checkbox"]').prop('checked', true);

                    $(this).parents().find('>label input[type="checkbox"], >.moderateBox_check input[type="checkbox"]').prop('checked', true);
                } else {
                    $(this).closest(difParent).find('[type="checkbox"]').prop('checked', false);

                    let notCheckedReasons = $(this).parents(difParent);

                    for (let i = 0; i < notCheckedReasons.length; ++i) {
                        if ($(notCheckedReasons[i]).find(':checked').length === 1) $(notCheckedReasons[i]).find('[type="checkbox"]').prop('checked', false);
                    }
                }

                let text = '';

                // let checkedReasons = $('[name="ah-other-reasons"]').parents('.ah-other-reason-block:not(.ah-has-children)').find(':checked');
                let checkedReasons = $('[name="ah-other-reasons"]').parents('.ah-other-reason-block').find(':checked');

                if ($(checkedReasons).length > 0) text = 'Пожалуйста, измените на ';

                for (let i = 0; i < checkedReasons.length; ++i) {
                    if ($(checkedReasons[i]).closest(difParent).find('[type="checkbox"]:checked').length <= 1) {
                        let texReason = $(checkedReasons[i]).parent().text();
                        let textChildrenSelector = $(checkedReasons[i]).parents('.ah-other-reason-block').parents('.ah-has-children').find('>label');
                        let textChildren = '';

                        for (let j = 0; j < textChildrenSelector.length; ++j) {
                            textChildren += $(textChildrenSelector[j]).text() + ' -> ';
                        }

                        if (text === 'Пожалуйста, измените на ') text += '"' + textChildren + texReason + '"';
                        else text += ' или "' + textChildren + texReason + '"';
                    }
                }

                $(block).find(textSelector).val(text);
            });

        for (let i = 0; i < inReasons.length; ++i)
            addOtherReasons(block, '.ah-other-reason-block', textSelector, inReasons[i]);
    }
}

// ФООРМИРОВАНИЕ ССЫЛКИ ПО ПАРАМЕТРАМ

function eyeLinks(list) {
    let eyeCity = localStorage.eyeCity;
    let searchParam = localStorage.eyeParamList.split(', ');

    for (let i = 0; i < list.length; ++i) {
        let param = $(list[i]).parents('tr').attr('data-params');
        let paramMap = $(list[i]).parents('tr').attr('data-params-map');
        let cid = $(list[i]).parents('tr').find('[data-category]').attr('data-category');
        let city = $(list[i]).parents('tr').attr('data-location');

        let link = 'https://adm.avito.ru/items/search?status[]=active&cid[]='+cid;

        if (eyeCity === 'true') {
            link += '&location_id[]='+city;
        }

        if (param) {
            let jsomParam = JSON.parse(param);

            let searchParamID = [];
            for (let j = 0; j < searchParam.length; ++j) {
                for (let k = 0; k < jsomParam.length; ++k) {
                    if (searchParam[j] === jsomParam[k][1]) searchParamID.push(jsomParam[k][0]);
                }
            }

            let jsomParamMap = JSON.parse(paramMap);
            let isParams = false;



            for (let j = 0; j < searchParamID.length; ++j) {
                let tmp = jsomParamMap[searchParamID[j]];
                if (tmp) {
                    isParams = true;
                    link += '&params['+searchParamID[j]+']='+tmp;
                }
            }

            if (!isParams) {
                for (let val in jsomParamMap) {
                    link += '&params['+val+']='+jsomParamMap[val];
                }
            }
        }

        $(list[i]).append('<a href="' + link + '" target="_blank" style="margin: 0 10px;" title="Формирование поиска по параметрам\n\nВыдача строится четко по параметрам, независимо от того выбран ли визуально параметр в items/search\n\nЕсли в категории нету параметров, которые вы указали, то подставляются все возможные параметры для данной категории"><i class="glyphicon glyphicon-eye-open"></i></a>');
    }
}


// Дополнительная информация о пользователе и объявлениях

function addInfoToItems() {
    $('form.form-inline').next().append('<div id="ah-user-info-show" class="dropdown" style="float: right">' +
        '  <button class="btn btn-info dropdown-toggle btn-xs" type="button" data-toggle="dropdown">Показать' +
        '  <span class="caret"></span></button>' +
        '  <ul class="dropdown-menu dropdown-menu-right"></ul>' +
        '</div>');

}

// МАССОВАЯ БЛОКИРОВКА ПОЛЬЗОВАТЕЛЕЙ

function addActionButton() {
    $('#apply_all')
        .append('<input type="button" class="btn btn-default red" id="postBlockChoose" value="Block" title="Choose reason for Block users">')
        .append('<span class="showUsers" title="Show users list">Users: <span class="digit">0</span></span>');


    $('body')
        .append('<div class="postBlockChoose ah-post-block-user" style="display: none;">' +
            '<div class="ah-post-block-users ah-postBlockReason" reasonId="593"><i class="glyphicon glyphicon-ban-circle"></i> Подозрительная активност</div>' +
            '<div class="ah-post-block-users ah-postBlockReason" reasonId="91"><i class="glyphicon glyphicon-ban-circle"></i> Несколько учетных записей</div>' +
            '<div class="ah-post-block-users ah-postBlockReason" reasonId="128"><i class="glyphicon glyphicon-ban-circle"></i> Мошенническая схема</div>' +
            '</div>')
        .append('<div class="postBlockInfo ah-post-block-user" style="display: none;">' +
            '<div class="ah-post-block-users ah-postClearList"><i class="glyphicon glyphicon-tint"></i> <span>Очистить список</span></div>' +
            '<hr style="margin-bottom: 10px; margin-top: 0">' +
            '<table id="postBlockTable">' +
            '<thead><tr><th>ID</th><th>Request</th><th>Response</th></tr></thead>' +
            '<tbody></tbody>' +
            '</table>' +
            '</div>');

    $('#ah-user-info-show')
        .find('ul')
        .append('<li>' +
            '<div class="ah-show-info ah-postUserAgent">' +
            '<i class="glyphicon glyphicon-phone"></i> ' +
            '<span class="ah-menu-name">Показать User Info</span><span class="ah-hot-keys">Alt+U</span>' +
            '</div>' +
            '</li>');

    clickActionButton();
}

function clickActionButton() {
    realHideElementOutClicking($('.ah-post-block-user'));

    $('#postBlockChoose').click(function () {
        var position = $(this).position();

        $('.postBlockChoose').css({bottom: 83, left: position.left - 50}).show();
    });

    $('.showUsers').click(function () {
        var position = $(this).position();

        $('.postBlockInfo').css({bottom: 83, left: position.left - 50}).show();
    });

    $('.ah-postBlockReason').click(function () {
        var reasonId = $(this).attr('reasonId');

        $('.postBlockChoose').hide();
        $('.showUsers').click();

        postBlockReasonList(reasonId);
    });

    $('.ah-postClearList').click(function () {
        sessionStorage.postBlockID = '';
        sessionStorage.postBlockActiveUserID = '';

        $('.ah-post-block-user').hide();
        usersListCheck();
        outTextFrame('Список пользователей очищен!')
    });

    let showUserInfo = false;

    function clickPostUserAgent() {
        let selector = $('.ah-postUserAgent');

        if (!showUserInfo) {
            showUserInfo = true;
            usersInfoForItems();
        }

        if ($(selector).find('span.ah-menu-name').hasClass('showUserAgent')) {
            $('.userAgent').hide();
            $(selector).find('span.ah-menu-name').text('Показать User Info').removeClass('showUserAgent');
        } else {
            $('.userAgent').show();
            $(selector).find('span.ah-menu-name').text('Скрыть User Info').addClass('showUserAgent').attr('show', 'true');
        }

    }

    $('.ah-postUserAgent').click(clickPostUserAgent);

    $(document).keydown(function (e) {
        if (e.altKey && e.keyCode === 'U'.charCodeAt(0))
            clickPostUserAgent();
    });

}

function clickChooseButton() {
    $('.postBlockButton').click(function () {
        let val = $(this).val();

        if (val === '+') addPlusBlockUser(this);
        if (val === '-') addStarBlockUser(this);
        if (val === '★') removeMinusBlockUser(this);

        usersListCheck();
    });
}

function usersListCheck() {
    let usersListBlock = sessionStorage.postBlockID.split(', ');
    let usersListActive = sessionStorage.postBlockActiveUserID.split(', ');

    $('.digit').text(usersListBlock.length-1);

    $('.postBlockButton').removeClass('postStar').removeClass('postMinus').addClass('postPlus').val('+').parent().removeClass('postStarBlock').removeClass('postMinusBlock');

    let postBlockTable = '';
    for (let i = 0; i < usersListBlock.length-1; i++) {
        $('input[userid="'+usersListBlock[i]+'"]').removeClass('postPlus').addClass('postMinus').val('-').parent().addClass('postMinusBlock');

        postBlockTable += '<tr name="'+usersListBlock[i]+'"><td><a href="/users/user/info/'+usersListBlock[i]+'" target="_blank">'+usersListBlock[i]+'</a></td><td>-</td><td>-</td></tr>';
    }

    for (let i = 0; i < usersListActive.length-1; i++) {
        $('input[userid="' + usersListActive[i] + '"]').removeClass('postMinus').addClass('postStar').val('★').parent().removeClass('postMinusBlock').addClass('postStarBlock');
    }

    $('#postBlockTable').find('tbody').html(postBlockTable);

    if (usersListActive.length-1 !== 0 || usersListBlock.length-1 !== 0) {
        outTextFrame(`Выделено:\n‧ Активных пользователей - ${usersListActive.length - 1}\n‧ Заблокированных пользователей - ${usersListBlock.length - 1}`);
    }
}

function addPlusBlockUser(button) {
    let id = $(button).attr('userid');

    sessionStorage.postBlockID += id + ', ';
}

function addStarBlockUser(button) {
    let id = $(button).attr('userid');

    sessionStorage.postBlockID = sessionStorage.postBlockID.replace(id + ', ', '');
    sessionStorage.postBlockActiveUserID = sessionStorage.postBlockActiveUserID += id + ', ';
}

function removeMinusBlockUser(button) {
    let id = $(button).attr('userid');

    sessionStorage.postBlockActiveUserID = sessionStorage.postBlockActiveUserID.replace(id + ', ', '');
}


function postBlockReasonList(reasonId) {
    let usersListBlock = sessionStorage.postBlockID.split(', ');
    let usersListActive = sessionStorage.postBlockActiveUserID.split(', ');
    let url = window.location.href;

    let commentSearchLink = 'https://adm.avito.ru/items/search?user=';
    let commentUsersLink = '';
    for (let i = 0; i < usersListBlock.length-1; i++) {
        commentSearchLink += usersListBlock[i];
        commentUsersLink += 'https://adm.avito.ru/users/user/info/' +  usersListBlock[i];
        if (i < usersListBlock.length-2) {
            commentUsersLink += '\n';
            commentSearchLink += '|';
        }
    }

    let commentActiveUsersLink = '';
    for (let i = 0; i < usersListActive.length-1; i++) {
        commentActiveUsersLink += 'https://adm.avito.ru/users/user/info/' +  usersListActive[i];
        if (i < usersListActive.length-2) commentActiveUsersLink += '\n';
    }


    let comment = `СПАМ
    Ссылка открытая модератором при блокировке:
    ${url}
    
    Ссылка на активного пользователя:
    ${commentActiveUsersLink}
    
    Ссылка на заблокированных пользователей в items/search:
    ${commentSearchLink}
    
    Ссылки на заблокированные учетные записи:
    ${commentUsersLink}
    `;

    for (let i = 0; i < usersListBlock.length-1; i++) {
        postBlockRequest(usersListBlock[i], reasonId);
        commentOnUserModer(usersListBlock[i], comment);
    }

    for (let i = 0; i < usersListActive.length-1; i++) {
        commentOnUserModer(usersListActive[i], comment);
    }

    sessionStorage.postBlockID = '';
    sessionStorage.postBlockActiveUserID = '';
}

function postBlockRequest(id, reason){
    var request = new XMLHttpRequest();
    request.open("POST", 'https://adm.avito.ru/users/user/block', true);
    request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
    request.setRequestHeader("Accept", "*/*");
    request.setRequestHeader("X-Requested-With", "XMLHttpRequest");
    request.send('reasons%5B%5D='+reason+'&id='+id);
    request.onreadystatechange=function(){
        if (request.readyState === 4) {
            $('#postBlockTable').find('tr[name="' + id + '"] td:eq(1)').text('DONE').css({color: '#009500'});

            if (request.status === 200) {
                $('#postBlockTable').find('tr[name="' + id + '"] td:eq(2)').text('OK').css({color: '#009500'});
            } else {
                $('#postBlockTable').find('tr[name="' + id + '"] td:eq(2)').text('FAIL').css({color: '#ff0000'});
            }
        } else {
            $('#postBlockTable')
                .find('tr[name="' + id + '"] td:eq(1)').text('FAIL').css({color: '#ff0000'})
                .find('tr[name="' + id + '"] td:eq(2)').text('FAIL').css({color: '#ff0000'});
        }
    };
}

// МАССОВАЯ БЛОКИРОВКА ПОЛЬЗОВАТЕЛЕЙ

// запрос на отображения информации о юзере для большого кол-ва

function usersInfoForItems() {
    let list = $('[userAgent]');

    for (let i = 0; i < list.length; i++) {
        let id = $(list[i]).attr('useragent');

        usersInfoForManyItems(id);
    }
}

function usersInfoForManyItems(id) {
    let href = "https://adm.avito.ru/users/user/info/"+id;
    let request = new XMLHttpRequest();
    request.open("GET", href, true);
    request.send(null);
    request.onreadystatechange=function() {
        if (request.readyState === 4 && request.status === 200)  {
            let r = request.responseText;

            let userAgent = $(r).find('.help-block:eq(7)').text();
            let chanceTmp = $(r).find('.form-group:contains(Chance) .form-control-static .active').attr('id');
            let chance = chanceTmp ? chanceTmp.replace('cval_', '') : '0';
            let chanceTime = $(r).find('.form-group:contains(Chance) b').text();

            $('[ah-post-block-chance="'+id+'"]').text(chance);
            if (chanceTime !== '') $('[ah-post-block-chance-time="'+id+'"]').text(' - ' + chanceTime).parents('.userAgent').show();
            $('[userAgent="'+id+'"]').text(userAgent).parents('.userAgent').show();
        }
    };
}

// запрос на отображения информации о юзере для большого кол-во

// ССЫЛКИ НА ПОИСК ПО КАРТИНКЕ

function searchByImageLinks() {
    $('.js-images-preview').click(function () {
        var interval = setInterval(function () {
            let list = $('.images-preview-gallery-item');

            if (list.length > 0) {
                clearInterval(interval);

                for (let i = 0; i < list.length; ++i) {
                    let url = $(list[i]).find('a').attr('href').substr(2);
                    let existLinks = $(list[i]).find('.searchByImageLinks');

                    if (existLinks.length === 0) $(list[i]).append('<div class="searchByImageLinks">' +
                            '<a class="google" href="https://www.google.ru/searchbyimage?image_url=' + url + '" target="_blank">' +
                                '<span>G</span><span>o</span><span>o</span><span>g</span><span>l</span><span>e</span>' +
                            '</a> ' +
                            '<a class="yandex" href="https://yandex.ru/images/search?url=' + url + '&rpt=imageview" target="_blank">' +
                                '<span>Y</span><span>andex</span>' +
                            '</a> ' +
                        '</div>');
                }
            }
        }, 200);
    });
}

// ССЫЛКИ НА ПОИСК ПО КАРТИНКЕ

function settings() {
    // Отображать настройки
    getSettings();

    // подсветка слов
    addWordsIllumination();

    // включение настроек
    $('.dropdown .dropdown-toggle:contains(Moderation)').parent().find('.dropdown-menu').append('<li id="ah-settings"><a href="#">AH Settings</a></li>');

    $('#ah-settings').click(function () {
        $('#layer-blackout-popup').addClass('ah-layer-flex');
        $('#divOptions').show();
        showModal();
    });
}

//----- Подсветка слов -----//
function addWordsIllumination() {
    if (!localStorage.title) localStorage.title = '';
    if (!localStorage.title1) localStorage.title1 = '';

    var chbx1 = $('<input/>',{
        class: 'mycheckbox1 mh-dafault-checkbox',
        type: 'checkbox',
        id: 'chbx1',
        checked: 'checked',
    });

    var butSearch = $('<input/>',{
        value: 'Save',
        type: 'button',
        class: 'btn btn-default btn-sm green',
        style: 'margin-right: -1px; border-top-right-radius: 0; border-bottom-right-radius: 0;',
        id:'mbuttonS',

        click:  function () {
            sbrosBut('.item_title');
            sbrosBut('.item-info-name a');
            var temp = $("#textaclass").val();
            localStorage.title = temp;
            var temp1 = $("#textaclass1").val();
            localStorage.title1 = temp1;
            if($('#chbx1').prop("checked")){
                localStorage.chbx1=1;
            }else{
                localStorage.chbx1=0;
            }
            searchWordsGlobal(temp,temp1,'.item_title');
            $(this).attr('disabled',true);
        }
    });

    var butReload = $('<input/>',{
        value: 'Reset',
        type: 'button',
        class: 'btn btn-default btn-sm green',
        style: 'margin-right: -1px; border-radius: 0;',

        click: function () {
            sbrosBut('.item_title');
            sbrosBut('.item-info-name a');
            $("#mbuttonS").removeAttr('disabled');
        }
    });
    var butReloadFull = $('<input/>',{
        value: 'Reset All',
        type: 'button',
        class: 'btn btn-default btn-sm green',
        style: 'border-top-left-radius: 0; border-bottom-left-radius: 0;',

        click: function () {
            sbrosBut('.item_title');
            sbrosBut('.item-info-name a');
            localStorage.title='';
            localStorage.chbx1=0;
            localStorage.title1='';
            $('#textaclass').val('');
            $("#mbuttonS").removeAttr('disabled');
            $("#chbx1").removeAttr("checked");
        }
    });

    let titleInfo = 'Доступна подсветка слов по категориям. Для того, чтобы воспользоваться данным функционалом необходимо написать название категории, потом поставить двоеточение ' +
        'и перечислить интересующие слова через запятую, закрыв это все точкой с запятой и тд. Если вы хотите, чтобы слова применялись ко всем категориям, нужно просто написать Все ' +
        'и также как для категорий перечислить слова. Название категорий должно полностью или частично соответствовать названию в админке. Частичное название можете повлечь за собой ' +
        'неприятные последствия.\n\n' +
        'Пример 1\n\t Все: Кран; Автомобили: Машина, Вася, Петя; Квартиры: агент, дом\n' +
        'Пример 2\n\t дом, информ, ангент, кривая труба';

    //RK блок для подсветки слов
    $('div.block-descriptionMode').append('<div class="illumination" style=""><span style="display: block; margin-bottom: 10px; font-size: 14px;">Подсветка слов</span></div>');
    $('div.illumination').append('<textarea  class="textaclassS" id="textaclass" placeholder="тут запрос на описание" style="width: 100%; height: 65px; resize: none; padding: 5px; border-radius: 4px;" title="'+titleInfo+'">'+localStorage.title+'</textarea>');
    $('div.illumination').append('<textarea class="textaclasstitle" id="textaclass1" placeholder="тут запрос на заголовок" style="width: 100%; height: 40px;resize: none;padding: 5px; margin-top: 6px; border-radius: 4px;">'+localStorage.title1+'</textarea>');
    $('div.illumination').append('<div class="illumination-btn-box" style="margin-top: 6px;"></div>');
    $('div.illumination-btn-box').append(butSearch);
    $('div.illumination-btn-box').append(butReload);
    $('div.illumination-btn-box').append(butReloadFull);
    $('div.illumination').append('<div class="mh-chbx-field" style="margin-top: 8px;"></div>')
    $('div.mh-chbx-field').append(chbx1,'<label style="" for="chbx1">Искать в названии</label>');
}
//+++++ Подсветка слов +++++//

//----- Окно настоек -----//
function getSettings() {
    if (!localStorage.createdButtons) localStorage.createdButtons = '';
    if (!localStorage.checkboxInfo) localStorage.checkboxInfo = '';

    // попап с затемнением
    $('body').append('<div id="layer-blackout-popup"></div>');
    $('#layer-blackout-popup').append('<div id="divOptions" class="divOptions ah-default-popup" style="display: none; font-size: 12px;"></div>');

    $('#layer-blackout-popup').click(function (e) {
        if (!$('div.ah-default-popup').is(e.target) && $('div.ah-default-popup').has(e.target).length === 0) {
            $('#layer-blackout-popup').removeClass('ah-layer-flex');
            $('div.ah-default-popup').hide();
            closeModal();
        }
    });

    //RK Отклонение описание
    var chbxDescrContacts = $('<input/>',{
        class: 'divOptions mh-default-checkbox addOld-button-checkbox',
        type: 'checkbox',
        id: 'chbxDescrContacts',
        action: 'reject',
        value: '106'
    });
    var chbxDescrTags = $('<input/>',{
        class: 'divOptions mh-default-checkbox addOld-button-checkbox',
        type: 'checkbox',
        id: 'chbxDescrTags',
        action: 'reject',
        value: '16'
    });
    var chbxDescrNonDetailed = $('<input/>',{
        class: 'divOptions mh-default-checkbox addOld-button-checkbox',
        type: 'checkbox',
        id: 'chbxDescrNonDetailed',
        action: 'reject',
        value: '14'
    });
    var chbxDescrInCorrect = $('<input/>',{
        class: 'divOptions mh-default-checkbox addOld-button-checkbox',
        type: 'checkbox',
        id: 'chbxDescrInCorrect',
        action: 'reject',
        value: '177'
    });
    var chbxDescrDiscrimination = $('<input/>',{
        class: 'divOptions mh-default-checkbox addOld-button-checkbox',
        type: 'checkbox',
        id: 'chbxDescrDiscrimination',
        action: 'reject',
        value: '117'
    });
    var chbxVacancyNonDetailed = $('<input/>',{
        class: 'divOptions mh-default-checkbox addOld-button-checkbox',
        type: 'checkbox',
        id: 'chbxVacancyNonDetailed',
        action: 'reject',
        value: '465'
    });

    //RK Отклонение фото
    var chbxPhotoContacts = $('<input/>',{
        class: 'divOptions mh-default-checkbox addOld-button-checkbox',
        type: 'checkbox',
        id: 'chbxPhotoContacts',
        action: 'reject',
        value: '167'
    });
    var chbxPhotoFocus = $('<input/>',{
        class: 'divOptions mh-default-checkbox addOld-button-checkbox',
        type: 'checkbox',
        id: 'chbxPhotoFocus',
        action: 'reject',
        value: '168'
    });
    var chbxPhotoMark = $('<input/>',{
        class: 'divOptions mh-default-checkbox addOld-button-checkbox',
        type: 'checkbox',
        id: 'chbxPhotoMark',
        action: 'reject',
        value: '169'
    });
    var chbxPhotoInCorrect = $('<input/>',{
        class: 'divOptions mh-default-checkbox addOld-button-checkbox',
        type: 'checkbox',
        id: 'chbxPhotoInCorrect',
        action: 'reject',
        value: '112'
    });
    var chbxPhotoWrong = $('<input/>',{
        class: 'divOptions mh-default-checkbox addOld-button-checkbox',
        type: 'checkbox',
        id: 'chbxPhotoWrong',
        action: 'reject',
        value: '15'
    });
    var chbxPhotoNonPhoto = $('<input/>',{
        class: 'divOptions mh-default-checkbox addOld-button-checkbox',
        type: 'checkbox',
        id: 'chbxPhotoNonPhoto',
        action: 'reject',
        value: '171'
    });
    var chbxPhotoNonLogo = $('<input/>',{
        class: 'divOptions mh-default-checkbox addOld-button-checkbox',
        type: 'checkbox',
        id: 'chbxPhotoNonLogo',
        action: 'reject',
        value: '170'
    });

    //RK Отклонение Цена
    var chbxPriceUnreal = $('<input/>',{
        class: 'divOptions mh-default-checkbox addOld-button-checkbox',
        type: 'checkbox',
        id: 'chbxPriceUnreal',
        action: 'reject',
        value: '11'
    });
    var chbxPriceWrong = $('<input/>',{
        class: 'divOptions mh-default-checkbox addOld-button-checkbox',
        type: 'checkbox',
        id: 'chbxPriceWrong',
        action: 'reject',
        value: '165'
    });

    //RK Отклонение название
    var chbxTitlePrice = $('<input/>',{
        class: 'divOptions mh-default-checkbox addOld-button-checkbox',
        type: 'checkbox',
        id: 'chbxTitlePrice',
        action: 'reject',
        value: '4'
    });
    var chbxTitleFocus = $('<input/>',{
        class: 'divOptions mh-default-checkbox addOld-button-checkbox',
        type: 'checkbox',
        id: 'chbxTitleFocus',
        action: 'reject',
        value: '12'
    });
    var chbxTitleContacts = $('<input/>',{
        class: 'divOptions mh-default-checkbox addOld-button-checkbox',
        type: 'checkbox',
        id: 'chbxTitleContacts',
        action: 'reject',
        value: '161'
    });
    var chbxTitleInCorrect = $('<input/>',{
        class: 'divOptions mh-default-checkbox addOld-button-checkbox',
        type: 'checkbox',
        id: 'chbxTitleInCorrect',
        action: 'reject',
        value: '114'
    });

    //RK Отклонение общее
    var chbxManyItems = $('<input/>',{
        class: 'divOptions mh-default-checkbox addOld-button-checkbox',
        type: 'checkbox',
        id: 'chbxManyItems',
        action: 'reject',
        value: '13'
    });
    var chbxNoneItems = $('<input/>',{
        class: 'divOptions mh-default-checkbox addOld-button-checkbox',
        type: 'checkbox',
        id: 'chbxNoneItems',
        action: 'reject',
        value: '122'
    });
    var chbxKategor = $('<input/>',{
        class: 'divOptions mh-default-checkbox addOld-button-checkbox',
        type: 'checkbox',
        id: 'chbxKategor',
        action: 'reject',
        value: '178'
    });
    var chbxDocumentation = $('<input/>',{
        class: 'divOptions mh-default-checkbox addOld-button-checkbox',
        type: 'checkbox',
        id: 'chbxDocumentation',
        action: 'reject',
        value: '500'
    });

    var chbxPointOnMap = $('<input/>',{
        class: 'divOptions mh-default-checkbox addOld-button-checkbox',
        type: 'checkbox',
        id: 'chbxPointOnMap',
        action: 'reject',
        value: '608'
    });

    var chbxParamAddress = $('<input/>',{
        class: 'divOptions mh-default-checkbox addOld-button-checkbox',
        type: 'checkbox',
        id: 'chbxParamAddress',
        action: 'reject',
        value: 'ParamAddress'
    });

    //RK Блокировка Общее
    var chbxPovtorka = $('<input/>',{
        class: 'divOptions mh-default-checkbox addOld-button-checkbox',
        type: 'checkbox',
        id: 'chbxPovtorka',
        action: 'block',
        value: '20'
    });
    var chbxWork = $('<input/>',{
        class: 'divOptions mh-default-checkbox addOld-button-checkbox',
        type: 'checkbox',
        id: 'chbxWork',
        action: 'block',
        value: '145'
    });
    var chbxMedikam = $('<input/>',{
        class: 'divOptions mh-default-checkbox addOld-button-checkbox',
        type: 'checkbox',
        id: 'chbxMedikam',
        action: 'block',
        value: '136'
    });
    var chbxCity = $('<input/>',{
        class: 'divOptions mh-default-checkbox addOld-button-checkbox',
        type: 'checkbox',
        id: 'chbxCity',
        action: 'block',
        value: '25'
    });
    var chbxReklama = $('<input/>',{
        class: 'divOptions mh-default-checkbox addOld-button-checkbox',
        type: 'checkbox',
        id: 'chbxReklama',
        action: 'block',
        value: '125'
    });
    var chbxReplica = $('<input/>',{
        class: 'divOptions mh-default-checkbox addOld-button-checkbox',
        type: 'checkbox',
        id: 'chbxReplica',
        action: 'block',
        value: '119'
    });
    var chbxTypal = $('<input/>',{
        class: 'divOptions mh-default-checkbox addOld-button-checkbox',
        type: 'checkbox',
        id: 'chbxTypal',
        action: 'block',
        value: '131'
    });
    var chbxUserAbuse = $('<input/>',{
        class: 'divOptions mh-default-checkbox addOld-button-checkbox',
        type: 'checkbox',
        id: 'chbxUserAbuse',
        action: 'block',
        value: '23'
    });
    var chbxRightHolderAbuse = $('<input/>',{
        class: 'divOptions mh-default-checkbox addOld-button-checkbox',
        type: 'checkbox',
        id: 'chbxRightHolderAbuse',
        action: 'block',
        value: '129'
    });
    var chbxAutoupload = $('<input/>',{
        class: 'divOptions mh-default-checkbox addOld-button-checkbox',
        type: 'checkbox',
        id: 'chbxAutoupload',
        action: 'block',
        value: '256'
    });
    var chbxFraudScheme = $('<input/>',{
        class: 'divOptions mh-default-checkbox addOld-button-checkbox',
        type: 'checkbox',
        id: 'chbxFraudScheme',
        action: 'block',
        value: '130'
    });
    var chbxFake = $('<input/>',{
        class: 'divOptions mh-default-checkbox addOld-button-checkbox',
        type: 'checkbox',
        id: 'chbxFake',
        action: 'block',
        value: '384'
    });
    var chbxTaboo = $('<input/>',{
        class: 'divOptions mh-default-checkbox addOld-button-checkbox',
        type: 'checkbox',
        id: 'chbxTaboo',
        action: 'block',
        value: '21'
    });
    var chbxBuy = $('<input/>',{
        class: 'divOptions mh-default-checkbox addOld-button-checkbox',
        type: 'checkbox',
        id: 'chbxBuy',
        action: 'block',
        value: '26'
    });

    // RK Блокировка запрещенка
    var chbxNarc = $('<input/>',{
        class: 'divOptions mh-default-checkbox addOld-button-checkbox',
        type: 'checkbox',
        id: 'chbxNarc',
        action: 'block',
        value: '134'
    });
    var chbxGuns = $('<input/>',{
        class: 'divOptions mh-default-checkbox addOld-button-checkbox',
        type: 'checkbox',
        id: 'chbxGuns',
        action: 'block',
        value: '135'
    });
    var chbxAlcohol = $('<input/>',{
        class: 'divOptions mh-default-checkbox addOld-button-checkbox',
        type: 'checkbox',
        id: 'chbxAlcohol',
        action: 'block',
        value: '137'
    });
    var chbxSex = $('<input/>',{
        class: 'divOptions mh-default-checkbox addOld-button-checkbox',
        type: 'checkbox',
        id: 'chbxSex',
        action: 'block',
        value: '138'
    });
    var chbxFinancial = $('<input/>',{
        class: 'divOptions mh-default-checkbox addOld-button-checkbox',
        type: 'checkbox',
        id: 'chbxFinancial',
        action: 'block',
        value: '139'
    });
    var chbxRedBook = $('<input/>',{
        class: 'divOptions mh-default-checkbox addOld-button-checkbox',
        type: 'checkbox',
        id: 'chbxRedBook',
        action: 'block',
        value: '140'
    });
    var chbxAward = $('<input/>',{
        class: 'divOptions mh-default-checkbox addOld-button-checkbox',
        type: 'checkbox',
        id: 'chbxAward',
        action: 'block',
        value: '141'
    });
    var chbxTechSpecifics = $('<input/>',{
        class: 'divOptions mh-default-checkbox addOld-button-checkbox',
        type: 'checkbox',
        id: 'chbxTechSpecifics',
        action: 'block',
        value: '142'
    });
    var chbxSpam = $('<input/>',{
        class: 'divOptions mh-default-checkbox addOld-button-checkbox',
        type: 'checkbox',
        id: 'chbxSpam',
        action: 'block',
        value: '143'
    });
    var chbxGamesBus = $('<input/>',{
        class: 'divOptions mh-default-checkbox addOld-button-checkbox',
        type: 'checkbox',
        id: 'chbxGamesBus',
        action: 'block',
        value: '144'
    });
    var chbxQueerItem = $('<input/>',{
        class: 'divOptions mh-default-checkbox addOld-button-checkbox',
        type: 'checkbox',
        id: 'chbxQueerItem',
        action: 'block',
        value: '146'
    });
    var chbxParamVidYsl = $('<input/>',{
        class: 'divOptions mh-default-checkbox addOld-button-checkbox',
        type: 'checkbox',
        id: 'chbxParamVidYsl',
        action: 'reject',
        value: '175_716'
    });
    var chbxParamProb = $('<input/>',{
        class: 'divOptions mh-default-checkbox addOld-button-checkbox',
        type: 'checkbox',
        id: 'chbxParamProb',
        action: 'reject',
        value: '175_2687'
    });

    //RK Отклонение общее
    $('#divOptions').append('<div class="reject-chbx mh-options-group btncheck" style=""></div>');

    $('.reject-chbx').append('<div class="reject-chbx-common" style="display: inline-block; vertical-align: top;"></div>');
    $('.reject-chbx-common').append('<span style="color:red; font-size:17px;">Reject Common</span><br>');
    $('.reject-chbx-common').append(chbxManyItems,'<label for="chbxManyItems" class="mh-default-label">Несколько товаров</label>','<br>');
    $('.reject-chbx-common').append(chbxNoneItems,'<label for="chbxNoneItems" class="mh-default-label">Отсутствие товара</label>','<br>');
    $('.reject-chbx-common').append(chbxKategor,'<label for="chbxKategor" class="mh-default-label">Неправильная Категория</label>','<br>');
    $('.reject-chbx-common').append(chbxDocumentation,'<label for="chbxDocumentation" class="mh-default-label">Ссылка на документацию</label>','<br>');
    $('.reject-chbx-common').append(chbxPointOnMap,'<label for="chbxPointOnMap" class="mh-default-label">Точка на карте</label>','<br>');
    $('.reject-chbx-common').append(chbxParamAddress,'<label for="chbxParamAddress" class="mh-default-label">Параметр "Адрес"</label>','<br>');
    $('.reject-chbx-common').append(chbxParamVidYsl,'<label for="chbxParamVidYsl" class="mh-default-label">Параметр "Вид услуги"</label>','<br>');
    $('.reject-chbx-common').append(chbxParamProb,'<label for="chbxParamProb" class="mh-default-label">Параметр "Пробег"</label>','<br>');

    //RK Отклонение название
    $('.reject-chbx').append('<div class="reject-chbx-names" style="display: inline-block; vertical-align: top; margin-left: 20px;"></div>');
    $('.reject-chbx-names').append('<span style="color:red; font-size:17px;">Reject Names</span><br>');
    $('.reject-chbx-names').append(chbxTitlePrice,'<label for="chbxTitlePrice" class="mh-default-label">Цена</label>','<br>');
    $('.reject-chbx-names').append(chbxTitleFocus,'<label for="chbxTitleFocus" class="mh-default-label">Привлечение внимания</label>','<br>');
    $('.reject-chbx-names').append(chbxTitleContacts,'<label for="chbxTitleContacts" class="mh-default-label">Контакты</label>','<br>');
    $('.reject-chbx-names').append(chbxTitleInCorrect,'<label for="chbxTitleInCorrect" class="mh-default-label">Некорректное</label>','<br>');

    //RK Отклонение цена
    $('.reject-chbx').append('<div class="reject-chbx-price" style="display: inline-block; vertical-align: top; margin-left: 20px;"></div>');
    $('.reject-chbx-price').append('<span style="color:red; font-size:17px;">Reject Price</span><br>');
    $('.reject-chbx-price').append(chbxPriceUnreal,'<label for="chbxPriceUnreal" class="mh-default-label">Нереалистичная</label>','<br>');
    $('.reject-chbx-price').append(chbxPriceWrong,'<label for="chbxPriceWrong" class="mh-default-label">Несоответствующая</label>','<br>');

    //RK Отклонение фото
    $('.reject-chbx').append('<div class="reject-chbx-photo" style="display: inline-block; vertical-align: top; margin-left: 20px;"></div>');
    $('.reject-chbx-photo').append('<span style="color:red; font-size:17px;">Reject Photo</span><br>');
    $('.reject-chbx-photo').append(chbxPhotoContacts,'<label for="chbxPhotoContacts" class="mh-default-label">Контакты</label>','<br>');
    $('.reject-chbx-photo').append(chbxPhotoFocus,'<label for="chbxPhotoFocus" class="mh-default-label">Привлечение внимания</label>','<br>');
    $('.reject-chbx-photo').append(chbxPhotoMark,'<label for="chbxPhotoMark" class="mh-default-label">Вотермарки и логотипы</label>','<br>');
    $('.reject-chbx-photo').append(chbxPhotoNonPhoto,'<label for="chbxPhotoNonPhoto" class="mh-default-label">Не фото</label>','<br>');
    $('.reject-chbx-photo').append(chbxPhotoNonLogo,'<label for="chbxPhotoNonLogo" class="mh-default-label">Не логотип</label>','<br>');
    $('.reject-chbx-photo').append(chbxPhotoInCorrect,'<label for="chbxPhotoInCorrect" class="mh-default-label">Некорректное</label>','<br>');
    $('.reject-chbx-photo').append(chbxPhotoWrong,'<label for="chbxPhotoWrong" class="mh-default-label">Несоответствующее</label>','<br>');

    //RK Отклонение описание
    $('.reject-chbx').append('<div class="reject-chbx-description" style="display: inline-block; vertical-align: top; margin-left: 20px;"></div>');
    $('.reject-chbx-description').append('<span style="color:red; font-size:17px;">Reject Description</span><br>');
    $('.reject-chbx-description').append(chbxDescrContacts,'<label for="chbxDescrContacts" class="mh-default-label">Контакты</label>','<br>');
    $('.reject-chbx-description').append(chbxDescrTags,'<label for="chbxDescrTags" class="mh-default-label">Ключевые слова</label>','<br>');
    $('.reject-chbx-description').append(chbxDescrDiscrimination,'<label for="chbxDescrDiscrimination" class="mh-default-label">Дискриминация</label>','<br>');
    $('.reject-chbx-description').append(chbxDescrNonDetailed,'<label for="chbxDescrNonDetailed" class="mh-default-label">Не подробное</label>','<br>');
    $('.reject-chbx-description').append(chbxDescrInCorrect,'<label for="chbxDescrInCorrect" class="mh-default-label">Некорректное</label>','<br>');
    $('.reject-chbx-description').append(chbxVacancyNonDetailed,'<label for="chbxVacancyNonDetailed" class="mh-default-label">Не подробное (вакансии)</label>','<br>');

    // RK Блокировка общее
    $('#divOptions').append('<div class="chbx" style="margin-top: 10px;"></div>');
    $('.chbx').append('<div class="block-chbx mh-options-group btncheck" style="display: inline-block; float: left; padding-bottom: 13px;"></div>');

    $('.block-chbx').append('<div class="block-chbx-common" style="display: inline-block; vertical-align: top;"></div>');
    $('.block-chbx-common').append('<span style="color:red; font-size:17px;">Block Common</span><br>');
    $('.block-chbx-common').append(chbxPovtorka,'<label for="chbxPovtorka" class="mh-default-label">Повторная подача объявлений</label>','<br>');
    $('.block-chbx-common').append(chbxBuy,'<label for="chbxBuy" class="mh-default-label">Объявление о покупке</label>','<br>');
    $('.block-chbx-common').append(chbxTaboo,'<label for="chbxTaboo" class="mh-default-label">Запрещённый товар</label>','<br>');
    $('.block-chbx-common').append(chbxCity,'<label for="chbxCity" class="mh-default-label">Неправильный Город</label>','<br>');
    $('.block-chbx-common').append(chbxReklama,'<label for="chbxReklama" class="mh-default-label">Реклама бизнеса и сайтов</label>','<br>');
    $('.block-chbx-common').append(chbxReplica,'<label for="chbxReplica" class="mh-default-label">Копии товаров</label>','<br>');
    $('.block-chbx-common').append(chbxTypal,'<label for="chbxTypal" class="mh-default-label">Типовой товар</label>','<br>');
    $('.block-chbx-common').append(chbxUserAbuse,'<label for="chbxUserAbuse" class="mh-default-label">Жалобы пользователей</label>','<br>');
    $('.block-chbx-common').append(chbxRightHolderAbuse,'<label for="chbxRightHolderAbuse" class="mh-default-label">Жалобы Парвообладателей</label>','<br>');
    $('.block-chbx-common').append(chbxAutoupload,'<label for="chbxAutoupload" class="mh-default-label">Автовыгрузка</label>','<br>');
    $('.block-chbx-common').append(chbxFraudScheme,'<label for="chbxFraudScheme" class="mh-default-label">Мошенническая схема</label>','<br>');
    $('.block-chbx-common').append(chbxFake,'<label for="chbxFake" class="mh-default-label">Фейк</label>','<br>');

    // RK Блокировка запрещенка
    $('.block-chbx').append('<div class="block-chbx-taboo" style="display: inline-block; vertical-align: top; margin-left: 20px;"></div>');
    $('.block-chbx-taboo').append('<span style="color:red; font-size:17px;">Block Taboo</span><br>');
    $('.block-chbx-taboo').append(chbxNarc,'<label for="chbxNarc" class="mh-default-label">Наркотики</label>','<br>');
    $('.block-chbx-taboo').append(chbxGuns,'<label for="chbxGuns" class="mh-default-label">Оружие</label>','<br>');
    $('.block-chbx-taboo').append(chbxMedikam,'<label for="chbxMedikam" class="mh-default-label">Медикаменты и оборудование</label>','<br>');
    $('.block-chbx-taboo').append(chbxAlcohol,'<label for="chbxAlcohol" class="mh-default-label">Алкоголь и табак</label>','<br>');
    $('.block-chbx-taboo').append(chbxSex,'<label for="chbxSex" class="mh-default-label">Интим</label>','<br>');
    $('.block-chbx-taboo').append(chbxFinancial,'<label for="chbxFinancial" class="mh-default-label">Финансовые операции</label>','<br>');
    $('.block-chbx-taboo').append(chbxRedBook,'<label for="chbxRedBook" class="mh-default-label">Красная книга и браконьерство</label>','<br>');
    $('.block-chbx-taboo').append(chbxAward,'<label for="chbxAward" class="mh-default-label">Награды</label>','<br>');
    $('.block-chbx-taboo').append(chbxTechSpecifics,'<label for="chbxTechSpecifics" class="mh-default-label">Специальные технические средства</label>','<br>');
    $('.block-chbx-taboo').append(chbxSpam,'<label for="chbxSpam" class="mh-default-label">Спам-базы и БД</label>','<br>');
    $('.block-chbx-taboo').append(chbxGamesBus,'<label for="chbxGamesBus" class="mh-default-label">Игорный бизнес</label>','<br>');
    $('.block-chbx-taboo').append(chbxQueerItem,'<label for="chbxQueerItem" class="mh-default-label">Сомнительное объявление</label>','<br>');
    $('.block-chbx-taboo').append(chbxWork,'<label for="chbxWork" class="mh-default-label">Сомнительная работа</label>','<br>');

    // descriptionMode SETTINGS
    $('.chbx').append('<div class="block-descriptionMode mh-options-group" style="float: right; padding: 14px; padding-right: 36px;"></div>');

    $('.chbx').append('<div style="clear: both;"></div>');

    $('#divOptions').append('<div class="infoSetting-chbx mh-options-group" style=" margin-top: 10px;"></div>');
    // BLOCK USERS
    $('.infoSetting-chbx').append('<div id="blockUsersOnPre" class="btncheck"><b style="color:red;">Block users:</b></div>');
    $('#blockUsersOnPre').append('<label class="mh-default-label"><input class="mh-default-checkbox addOld-button-checkbox" id="bubn" action="blockUser" type="checkbox" name="blockUsers" value="BN" style="margin-right: 3px;">BN</label>');
    $('#blockUsersOnPre').append('<label class="mh-default-label"><input class="mh-default-checkbox addOld-button-checkbox" id="bupa" action="blockUser" type="checkbox" name="blockUsers" value="PA" style="margin-right: 3px;">PA</label>');
    $('#blockUsersOnPre').append('<label class="mh-default-label"><input class="mh-default-checkbox addOld-button-checkbox" id="bumc" action="blockUser" type="checkbox" name="blockUsers" value="MC" style="margin-right: 3px;">MC</label>');
    // BLOCK USERS

    // INFO SETTINGS
    $('.infoSetting-chbx').append('<div id="infoSetting"><b style="color:red;">Info settings:</b></div>');
    $('#infoSetting').append('<label class="mh-default-label"><input class="mh-default-checkbox" type="checkbox" name="info" value="infoSetting16" style="margin-right: 3px;">Email</label>');
    $('#infoSetting').append('<label class="mh-default-label"><input class="mh-default-checkbox" type="checkbox" name="info" value="infoSetting1" style="margin-right: 3px;">Status</label>');
    $('#infoSetting').append('<label class="mh-default-label"><input class="mh-default-checkbox" type="checkbox" name="info" value="infoSetting2" style="margin-right: 3px;">Registered</label>');
    $('#infoSetting').append('<label class="mh-default-label"><input class="mh-default-checkbox" type="checkbox" name="info" value="infoSetting3" style="margin-right: 3px;">Items</label>');
    $('#infoSetting').append('<label class="mh-default-label"><input class="mh-default-checkbox" type="checkbox" name="info" value="infoSetting4" style="margin-right: 3px;">Item IP</label>');
    $('#infoSetting').append('<label class="mh-default-label"><input class="mh-default-checkbox" type="checkbox" name="info" value="infoSetting13" style="margin-right: 3px;">Start Time</label>');
    $('#infoSetting').append('<label class="mh-default-label"><input class="mh-default-checkbox" type="checkbox" name="info" value="infoSetting5" style="margin-right: 3px;">Last IP</label>');
    $('#infoSetting').append('<label class="mh-default-label"><input class="mh-default-checkbox" type="checkbox" name="info" value="infoSetting6" style="margin-right: 3px;">Proprietary</label>');
    $('#infoSetting').append('<label class="mh-default-label"><input class="mh-default-checkbox" type="checkbox" name="info" value="infoSetting12" style="margin-right: 3px;">Address</label>');
    $('#infoSetting').append('<label class="mh-default-label"><input class="mh-default-checkbox" type="checkbox" name="info" value="infoSetting7" style="margin-right: 3px;">Phones</label>');

    $('.infoSetting-chbx').append('<div id="phoneSetting" style="display:none;"><b style="color:red;">Phones settings:</b></div>');
    $('#phoneSetting').append('<label class="mh-default-label"><input class="mh-default-checkbox" type="checkbox" name="info" value="infoSetting8" style="margin-right: 3px;">Phone link ???</label>');
    $('#phoneSetting').append('<label class="mh-default-label"><input class="mh-default-checkbox" type="checkbox" name="info" value="infoSetting9" style="margin-right: 3px;">+city</label>');
    $('#phoneSetting').append('<label class="mh-default-label"><input class="mh-default-checkbox" type="checkbox" name="info" value="infoSetting10" style="margin-right: 3px;">+private</label>');
    $('#phoneSetting').append('<label class="mh-default-label"><input class="mh-default-checkbox" type="checkbox" name="info" value="infoSetting11" style="margin-right: 3px;">+param</label>');
    $('#phoneSetting').append('<label class="mh-default-label"><input class="mh-default-checkbox" type="checkbox" name="info" value="infoSetting14" style="margin-right: 3px;">+item ip</label>');
    $('#phoneSetting').append('<label class="mh-default-label"><input class="mh-default-checkbox" type="checkbox" name="info" value="infoSetting15" style="margin-right: 3px;">Verify date</label>');

    var checkboxStatus = localStorage.checkboxInfo.split('|');
    for (var i = 0; i < checkboxStatus.length; i++) {
        $('input[value="'+checkboxStatus[i]+'"]').prop('checked', true);
    }

    if (localStorage.checkboxInfo.indexOf('infoSetting7|')+1) $('#phoneSetting').show();

    $('[name="info"]:checkbox').change(function () {
        var val = $(this).attr("value");
        if (localStorage.checkboxInfo.indexOf(val+'|')+1) {
            var tmp = localStorage.checkboxInfo;
            tmp = tmp.replace(val+'|', '');
            localStorage.checkboxInfo = tmp;
            if (val == 'infoSetting7') $('#phoneSetting').hide();
        } else {
            localStorage.checkboxInfo += val+'|';
            if (val == 'infoSetting7') $('#phoneSetting').show();
        }
    });

    // ABUSES SETTINGS
    $('.infoSetting-chbx').append('<div id="abusesSetting"><b style="color:red;">Abuses settings:</b></div>');
    $('#abusesSetting').append('<label class="mh-default-label"><input class="mh-default-checkbox" type="checkbox" name="abuses" value="checkItems" style="margin-right: 3px;">Check only current item</label>');

    if (!localStorage.abusesSetting) localStorage.abusesSetting = 'false';

    if (localStorage.abusesSetting == 'true') $('input[value="checkItems"]').prop('checked', true);

    $('[name="abuses"]:checkbox').change(function () {
        if ($('input[value="checkItems"]').prop('checked')) {
            localStorage.abusesSetting = 'true';
        } else {
            localStorage.abusesSetting = 'false';
        }
    });
    // ABUSES SETTINGS

    // EYE SETTINGS
    $('.infoSetting-chbx').append('<div id="eyeSetting"><b style="color:red;">Eye settings:</b></div>');
    $('#eyeSetting')
        .append('<span style="margin-left: 10px;" title="Параметры необходимо вводить через запятую и пробел!\n\nОбращаю ваше внимание на то, что поиск будет построен четко по параметрам, независимо от настройки критериев поиска в items/search.">Список параметров: <input id="eyeParamList" type="text" style="margin-left: 5px; width: 400px" value=""></span>')
        .append('<label class="mh-default-label"><input class="mh-default-checkbox" type="checkbox" name="eye" value="eyeCity" style="margin-right: 3px;">City</label>');

    if (!localStorage.eyeParamList) localStorage.eyeParamList = 'Марка, Модель, Год выпуска, Вид техники, Тип объявления, Количество комнат, Вид объекта, Срок аренды, Вид услуги, Тип услуги, Сфера деятельности, Вид одежды, Вид товара, Вид телефона, Производитель, Вид велосипеда, Порода, Вид животного, Вид бизнеса, Вид оборудования';

    $('#eyeParamList').val(localStorage.eyeParamList);

    if (!localStorage.eyeCity) localStorage.eyeCity = 'false';

    if (localStorage.eyeCity === 'true') $('input[value="eyeCity"]').prop('checked', true);

    $('[name="eye"]:checkbox').change(function () {
        if ($('input[value="eyeCity"]').prop('checked')) {
            localStorage.eyeCity = 'true';
        } else {
            localStorage.eyeCity = 'false';
        }
    });
    // EYE SETTINGS

    // OTHER SETTINGS
    $('.infoSetting-chbx').append('<div id="otherSetting"><b style="color:red;">Other settings:</b></div>');
    $('#otherSetting').append('<label class="mh-default-label"><input class="mh-default-checkbox" type="checkbox" name="other" value="activeItemsPre" style="margin-right: 3px;">Active items on user</label>');
    $('#otherSetting').append('<label class="mh-default-label"><input class="mh-default-checkbox" type="checkbox" name="other" value="imageSearchComparison" style="margin-right: 3px;">Image search in comparison</label>');

    if (!localStorage.addElementsForEachItem) localStorage.addElementsForEachItem = 'false';
    if (!localStorage.imageSearchComparison) localStorage.imageSearchComparison = 'false';

    if (localStorage.addElementsForEachItem === 'true') $('input[value="activeItemsPre"]').prop('checked', true);
    if (localStorage.imageSearchComparison === 'true') $('input[value="imageSearchComparison"]').prop('checked', true);

    $('[name="other"]:checkbox').change(function () {
        if ($('input[value="activeItemsPre"]').prop('checked')) {
            localStorage.addElementsForEachItem = 'true';
        } else {
            localStorage.addElementsForEachItem = 'false';
        }

        if ($('input[value="imageSearchComparison"]').prop('checked')) {
            localStorage.imageSearchComparison = 'true';
        } else {
            localStorage.imageSearchComparison = 'false';
        }
    });
    // OTHER SETTINGS

    // кнопки
    $('#divOptions').append('<div class="btn-ok-cancel" style="text-align: center; margin-top: 10px;"></div>');
    $('.btn-ok-cancel').append('<button id="butOkDivSettings" class="divOptions mh-default-btn" style="width:110px; margin-right: 6px;"><span class="mh-button-label mh-green-background">&#10003;</span>Ок</button>');
    $('.btn-ok-cancel').append('<button id="butCanselDivSettings" class="divOptions mh-default-btn" style="width:110px;"><span class="mh-button-label mh-red-background">&#10007;</span>Отмена</button>');

    $('#butOkDivSettings').click(function() {
        localStorage.eyeParamList = $('#eyeParamList').val();
        chekButton();
        location.reload();
    });

    $('#butCanselDivSettings').click(function() {

        $('#layer-blackout-popup').removeClass('ah-layer-flex');
        $('#divOptions').hide();
        closeModal();
    });


    // запоминаем состояния чекбоксов в локалсторадж
    $('.btncheck input[type="checkbox"]').click(function() {
        if ( $(this).prop('checked') ) {
            localStorage.setItem( $(this).attr('id'), "true" );
            // console.log($(this).attr('id') + ' added to local');
        } else {
            localStorage.setItem( $(this).attr('id'), "false" );
            // console.log($(this).attr('id') + ' NOT added to local');
        }
    });

    $('.btncheck input[type="checkbox"]').each(function(indx) {
        if ( localStorage.getItem( $(this).attr('id') ) == "true" ) {
            $(this).prop("checked", true);
        } else {
            $(this).prop("checked", false);
        }
    });
}

// обработчик кнопки OK в окне настроек
function chekButton() {
    localStorage.createdButtons = '';

    for (var i = 0; i < $('#divOptions input.addOld-button-checkbox').length; i++) {
        if ( $('#divOptions input.addOld-button-checkbox').slice(i, i + 1).prop("checked") ) {
            localStorage.createdButtons += ' ' + $('#divOptions input.addOld-button-checkbox').slice(i, i + 1).attr('id').slice(4) + '|&|' + $('#divOptions input.addOld-button-checkbox').slice(i, i + 1).attr('action') + '|&|' + $('#divOptions input.addOld-button-checkbox').slice(i, i + 1).val() + '';
        } else {
            localStorage.createdButtons = localStorage.createdButtons.replace('' + $('#divOptions input.addOld-button-checkbox').slice(i, i + 1).attr('id').slice(4) + '|&|' + $('#divOptions input.addOld-button-checkbox').slice(i, i + 1).attr('action') + '|&|' + $('#divOptions input.addOld-button-checkbox').slice(i, i + 1).val() + '','');
        }
    }
}
//+++++ Окно настроек +++++//
