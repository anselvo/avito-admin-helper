function premoderationsStartNew() {
    // таймер
    preTimer();

    // элементы для каждого айтема
    addElementsForEachItemNew();

    // Добавляет Info и Abuse и Block user
    addSomeElementsNew();

    // Сравнение фото
    comparePhotoPreNew();

    // Закрывание прежки
    closePre();

    // Красит кнопки, если флагов больше двух
    colorButtons();

    // spam links
    eyeLinks($('.item-info-name'));

    // искать картинки в интернете
    searchByImageLinks();

    // Добавление инфы в комперисон
    comparisonInfo();

    // убрать лишние категории для модеров
    // hideSubcategory();

    // пометка объявлений, что они тестовые
    abTest();

    // добавление ссылок для антифрода
    antifraudLinks('pre');

    // убрать "Искать тестовые" объявления из ПРЕ
    hideTestItemsSearch();
}

function hideTestItemsSearch() {
    if (userGlobalInfo.division_name === "Moderator")
        $('[name="isTest"]').parents('.form-group').hide();
}

function abTest() {
    let abTestInfo = [
        { categoryID: "10", locationID: "660710" },
        { categoryID: "10", locationID: "660300" },
        { categoryID: "10", locationID: "628780" },
        { categoryID: "10", locationID: "625670" },
        { categoryID: "24", locationID: "654070", containsOption: "Квартиры / Сдам  / Посуточно" },
        { categoryID: "24", locationID: "653240", containsOption: "Квартиры / Сдам  / Посуточно" }
    ];

    for (let i = 0; i < abTestInfo.length; ++i) {
        markTestItems(abTestInfo[i].categoryID, abTestInfo[i].locationID, abTestInfo[i].containsOption);
    }
}

function markTestItems(categoryID, locationID, containsOption) {
    containsOption = containsOption ? containsOption : '';

    $.ajax({
        type: 'GET',
        url: 'https://adm.avito.ru/js/locations?json=true&id='+locationID,
        success: function(data) {
            if (data.length === 0) {
                abTestHighlight(categoryID, locationID, containsOption);
            } else {
                for (let i = 0; i < data.length; ++i) {
                    let id = data[i].id;

                    abTestHighlight(categoryID, id, containsOption);
                }
            }
        }
    })
}

function abTestHighlight(categoryID, locationID, containsOption) {
    let items = $('tr[data-category="' + categoryID + '"][data-location="' + locationID + '"]:contains(' + containsOption + ')');

    $(items).find('.item-info-row_user-actions').prev()
        .addClass('ah-ab-test-mark')
        .prepend('<div class="ah-ab-test">A/B TEST</div>');
}

function hideSubcategory() {
    let goodCategory = ['1', '4', '110', '111', '112', '113', '5', '2', '6', '7', '35', '8'];

    if (userGlobalInfo.subdivision !== 'TL' && userGlobalInfo.subdivision !== 'SD'  && userGlobalInfo.subdivision !== 'ME') {
        $('.subcategory:not(:contains(Вакансии), :contains(Резюме))').hide();
        $('.js-multiselect-reasons').hide();

        let url = new URL(location).searchParams;
        let category = url.getAll('categoryId[]');
        let reasons = url.getAll('reasons[]');

        let redirect = false;

        if (reasons.length > 0) redirect = true;

        for (let i = 0; i < category.length; ++i) {
            let exist = false;
            for (let j = 0; j < goodCategory.length; ++j) {
                if (category[i] === goodCategory[j]) exist = true;
            }

            if (!exist) {
                redirect = true;
                break;
            }
        }

        if (redirect) {
            chrome.runtime.sendMessage({
                action: 'sendNotification',
                username: userGlobalInfo.username,
                head: 'Информация о сотруднике',
                body: 'Ваш сотрудник ' + userGlobalInfo.surname + ' ' + userGlobalInfo.name + ' (' + userGlobalInfo.username + ') пытался зайти на страницу премодерации с запрещенными параметрами и был перенаправлен на чистую страницу премодерации.\n\nИспользуемые параметры:\nКатегории: ' + category + '\nПричины: ' + reasons,
                to_type: '|username|',
                to_name: '|' + userGlobalInfo.teamlead_login + '|'
            }, function(response) {
                console.log(response);
            });


            window.onbeforeunload = null;
            location.href = "https://adm.avito.ru/items/moder";
        }
    }
}

function comparisonInfo() {
    let target = $('.js-modal-content')[0];

    let observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes.length > 0) addComparisonInfo();
        });
    });

    let config = { childList: true };

    observer.observe(target,  config);
}

function addComparisonInfo() {
    $('.modal-content').css('margin-bottom', '25px');

    let basedItemID = $('.js-comparison').attr('data-based-item');
    let basedItemInfo = $('tr[data-id="'+basedItemID+'"]');

    let content = $('[data-based-item="'+basedItemID+'"]');

    let comparisonItemParamList = $(content).find('.details-info');

    let comparisonUserList = $(content).find('.comparison-user-wrap');
    let comparisonImageList = $(content).find('.gallery-prev');
    let comparisonDescriptionList = $(content).find('.comparison-description-text');
    let comparisonRejectOtherList = $(content).find('.js-moderation-reject-other');
    let comparisonBlockListItem = $(content).find('.btn-group-reject');

    // AB test в комперисоне
    if ($(basedItemInfo).find('.ah-ab-test-mark').length !== 0) {
        $('.comparison-item-address:eq(0)')
            .addClass('ah-ab-test-mark')
            .prepend('<div class="ah-ab-test">A/B TEST</div>');
    }

    // добавить причины отклонения
    optionOtherReasons('.btn-group-reject .moderate-block', '.moderate-block-list-item:not(.moderate-block-list-item_nested-list)', '.js-moderation-reject-other');

    let wordsParse = find_words_parse(localStorage.title.replace(/\s/g, ''));
    for (let i = 0; i < comparisonUserList.length; ++i) {
        const comparisonDescriptionListChildren = $(comparisonDescriptionList[i]).find('span');
        const comparisonItemCategory = $(comparisonItemParamList[i]).find('[data-param-id="1a"]').attr("title");

        if (comparisonDescriptionListChildren.length === 0)
            find_words(wordsParse, $(comparisonDescriptionList[i]), comparisonItemCategory);
        else {
            for (let j = 0; j < comparisonDescriptionListChildren.length; ++j) {
                if ($(comparisonDescriptionListChildren[j]).find('span').length === 0)
                    find_words(wordsParse, $(comparisonDescriptionListChildren[j]), comparisonItemCategory);
            }
        }

        let tmp = $(comparisonUserList[i]).parent().attr('class').split(' ');
        let userid = tmp[3].split('-')[2];
        let itemid = tmp[2].split('-')[2];

        $(comparisonUserList[i])
            .parents('.'+tmp[2])
            .append('<span class="userWalletActionButton userWalletComparison" userid="'+userid+'" itemid="'+itemid+'" style="margin-left: 10px; float: right">WL</span>')
            .append('<span class="userAbuseActionButton userAbuseComparison" useridab="'+userid+'" itemidab="'+itemid+'" style="margin-left: 10px;  float: right;">Abuses</span>')
            .append('<span class="userInfoActionButton userInfoComparison" userid="'+userid+'" itemid="'+itemid+'" style="margin-left: 10px; float: right;">Info</span>');


        if (i === 0) var mainUserId = userid;
        else {
            if (mainUserId !== userid)
                $(comparisonUserList[i])
                    .parents('.'+tmp[2])
                    .append('<span class="pseudo-link compareUserOnComparison" userid="'+userid+'" itemid="'+itemid+'" title="Сравнить учетные записи" style="margin-left: 10px;  float: right;">&#8644</span>');
        }

        if (localStorage.imageSearchComparison === 'true') {
            let imageList = $(comparisonImageList[i]).find('.js-gallery-prev-img');
            for (let j = 0; j < imageList.length; ++j) {
                let url = $(imageList[j]).attr('src').replace('140x105', '640x480').substr(2);

                $(imageList[j]).parent().append('<div class="searchByImageLinks" style="font-size: 9px; font-weight: bold; margin: 0px; padding: 0px;">' +
                    '<a class="google" href="https://www.google.ru/searchbyimage?image_url=' + url + '" target="_blank"><span>G</span></a>' +
                    '<a class="yandex" href="https://yandex.ru/images/search?url=' + url + '&rpt=imageview" target="_blank" style="margin-left: 10px"><span>Y</span></a>' +
                    '</div>');
            }
        }

        $('.compareUserOnComparison[itemid='+itemid+']').click(function () {
            let similarUserID = $(this).attr('userid');

            addBlock();
            chekUserforDubles(mainUserId, similarUserID);
        });

        $('.userInfoComparison[itemid='+itemid+']').click(function () {
            let offset = $(this).offset();
            usersInfo($(this).attr("userid"), $(this).attr("itemid"), offset, $(this).attr("infoQuery"));
        });

        $('.userAbuseComparison[itemidab='+itemid+']').click(function () {
            let offset = $(this).offset();
            usersAbuses($(this).attr("useridab"), $(this).attr("itemidab"), offset);
        });

        $('.userWalletComparison[itemid='+itemid+']').click(function () {
            let offset = $(this).offset();
            usersWallet($(this).attr("userid"), offset);
        });
    }
}

function colorButtons() {
    let list = $('.b-antifraud-actions');

    for (let i = 0; i < list.length; ++i) {
        let flagsCount = parseInt($(list[i]).find('span:eq(0)').text());
        if (flagsCount > 2) {
            $(list[i]).find('button').css({background: '#f0ad4e'}).attr('title', 'Выделение в оранжевый цвет произошло, потому что флагов более двух!');
            $(list[i]).find('span').css({color: '#fff'});
        }
    }
}

function addSomeElementsNew() {
    const trList = $('#items').find('tr');

    for(let i = 0; i < trList.length; i++){
        const id = $(trList[i]).find('a[href^="/users/user/info/"]').attr("href").split("/")[4];
        const itemid = $(trList[i]).attr("id").substring(5);
        const category = $(trList[i]).attr("data-category");
        const params = $(trList[i]).attr("data-params-map") ? $(trList[i]).attr("data-params-map").replace(/"/g, "&quot;") : '{}';
        const cityItem = $(trList[i]).attr("data-location");
        const type = $(trList[i]).find('.item-info-row-item-type:contains(Тип)').parent().text();

        // USER INFO and USER ABUSE
        $(trList[i]).find('.item-info-name')
            .append('<span class="item-info-row-item" style="margin-left: 10px; float: right; font-size: 14px;"><a class="userWalletActionButton" userid="'+id+'" itemid="'+itemid+'">WL</a></span>')
            .append('<span class="item-info-row-item" style="margin-left: 10px; float: right; font-size: 14px;"><a class="userAbuseActionButton" useridab="'+id+'" itemidab="'+itemid+'">Abuses</a></span>')
            .append('<span class="item-info-row-item" style="margin-left: 10px; float: right; font-size: 14px;">' +
                '<a class="userInfoActionButton" infoQuery cityItem="'+cityItem+'" userid="'+id+'" itemid="'+itemid+'" data-category="'+category+'" data-params-map="'+params+'">Info</a> ' +
                '<i class="infoSearchIcon glyphicon  glyphicon-search" title="Поисковый запрос для ссылок в Info"></i> ' +
                '<input type="text" placeholder="Info query" class="infoQuery"></span>');

        // кнопки блокировки
        if (localStorage.createdButtons.indexOf('blockUser|&|MC')+1 && type.indexOf('Магазин') === -1)
            $(trList[i]).find('#ah-but-block-users')
                .append('<input type="button" userID="'+id+'" class="btn btn-default btn-sm red ah-mh-action-btn" value="MC" title="Нарушение условий пользовательского соглашения" style="margin-left: 4px;">');
        if (localStorage.createdButtons.indexOf('blockUser|&|PA')+1 && type.indexOf('Магазин') === -1)
            $(trList[i]).find('#ah-but-block-users')
                .append('<input type="button" userID="'+id+'" class="btn btn-default btn-sm red" value="PA" title="Подозрительная активность">');
        if (localStorage.createdButtons.indexOf('blockUser|&|BN')+1 && type.indexOf('Магазин') === -1)
            $(trList[i]).find('#ah-but-block-users')
                .append('<input type="button" userID="'+id+'" class="btn btn-default btn-sm red ah-mh-action-btn" value="BN" title="Несколько учетных записей">');
    }

    usersInfoAction();

    $(".infoQuery").on("input",function() {
        $(this).parent().find('.userInfoActionButton').attr('infoQuery', $(this).val());
    });

    $(".infoSearchIcon").click(function () {
        $(this).parent().find('.infoQuery').animate({width: 'toggle'});
    });

    $('input[value="PA"]').click(function () {
        var userID = $(this).attr('userID');
        blockUser(userID, 'PA');
        $(this).parents('tr').detach();

    });
    $('input[value="BN"]').click(function () {
        var userID = $(this).attr('userID');
        blockUser(userID, 'BN');
        $(this).parents('tr').detach();
    });
    $('input[value="MC"]').click(function () {
        var userID = $(this).attr('userID');
        blockUser(userID, 'MC');
        $(this).parents('tr').detach();
    });
}

function addElementsForEachItemNew() {
    // блок для кнопок хелпера
    $('.item-info-row_user-actions').after('<div class="item-info-row ah-mh-items">' +
            '<div id="ah-but-reject-block"></div>' +
            '<div id="ah-but-reject-with-comment"><span class="ah-but-not-auto-prob"></span><span class="ah-but-auto-prob"></span></div>' +
            '<div id="ah-but-block-users"></div>' +
        '</div>');

    // для цикла
    let lastReject = '';
    let addElementsForEachItem = localStorage.addElementsForEachItem;

    let trList = $('#items').find('tr');
    for (let i = 0; i < trList.length; i++) {
        let value = $(trList[i]).find('.item-info').attr("id");
        let itemVersion = $(trList[i]).find('input[name="version"]').val();
        let prob = $(trList[i]).data('pathProbs');

        let paramId = null;
        let paramsArr = $(trList[i]).data('params');

        if (paramsArr) {
            for (let j = 0; j < paramsArr.length; j++) {
                if (paramsArr[j][1] === 'Адрес') {
                    paramId = paramsArr[j][0];
                }
            }
        }

        // ------ отображение кол-ва активных айтемов, как в items/search  ------ //

        if (addElementsForEachItem === 'true') {
            getActiveItems(trList[i]);
        }

        // ++++++ отображение кол-ва активных айтемов, как в items/search  ++++++ //
        value = value.replace("desc_","");

        for (let key in localStorage) {
            if (key.indexOf('createdButtons') + 1) {

                let tmpKey = localStorage.getItem(key).split(' ');

                for (let j = 0; j < tmpKey.length; j++) {
                    let name = tmpKey[j].split('|&|')[0];
                    let action = tmpKey[j].split('|&|')[1];
                    let reason = tmpKey[j].split('|&|')[2];

                    if (name === '') continue;

                    if (name === reason) { // для отклонений за "параметр" Адрес
                        reason = '175_' + paramId;
                    }

                    $(trList[i])
                        .find('#ah-but-reject-block')
                        .append('<input type="button" ' +
                            'value="' + name + '" ' +
                            'class="btn btn-default btn-sm ah-mh-action-btn" ' +
                            'bvalue="' + value + '" ' +
                            'data-reason="' + reason + '" ' +
                            'data-action="' + action + '" ' +
                            'data-version="' + itemVersion + '">');
                }
            }
        }

        // ++++++ отображение кол-ва активных айтемов, для неправильной категории  ++++++ //
        let localReasons = JSON.parse(localStorage.otherReasonsCategoryBox);

        for (let j = 0; j < localReasons.length; ++j) {
            let category = localReasons[j];

            if (category.show === 'true') $(trList[i])
                .find('#ah-but-reject-with-comment .ah-but-not-auto-prob')
                .append('<input type="button" ' +
                    'value="' + category.short_name + '" ' +
                    'class="btn btn-default btn-sm ah-mh-action-btn" ' +
                    'bvalue="' + value + '" ' +
                    'data-reason="178" ' +
                    'data-action="reject" ' +
                    'data-version="' + itemVersion + '" ' +
                    'data-comment="Пожалуйста, измените на &#34;' + category.name + '&#34;" ' +
                    'title="' + category.name + '" ' +
                    'style="box-shadow: inset 0 0 5px 0 ' + category.color + '; background: white">');

            for (let k = 0; k < category.reason.length; ++k) {
                let background = 'white';
                let probability = 0;

                for (let z = 0; z < prob.length; ++z)
                    if (prob[z] && prob[z].categoryName === category.name + ' / ' + category.reason[k].name) {
                        probability = prob[z].prob.toFixed(2) * 100;

                        background = 'linear-gradient(to right, ' + category.reason[k].color +  '1f ' + probability + '%, #fff ' + probability + '%)';
                    }

                if (category.reason[k].show === 'true') {
                    $(trList[i])
                        .find('#ah-but-reject-with-comment .ah-but-not-auto-prob')
                        .append('<input type="button" ' +
                            'value="' + category.reason[k].short_name + '" ' +
                            'class="btn btn-default btn-sm ah-mh-action-btn" ' +
                            'bvalue="' + value + '" ' +
                            'data-reason="178" ' +
                            'data-action="reject" ' +
                            'data-version="' + itemVersion + '" ' +
                            'data-comment="Пожалуйста, измените на &#34;' + category.name + ' / ' + category.reason[k].name + '&#34;" ' +
                            'title="' + category.name + ' / ' + category.reason[k].name + '\nВероятность: ' + probability + '%" ' +
                            'style="box-shadow: inset 0 0 5px 0 ' + category.reason[k].color + '; background: ' + background + '">');
                } else if (probability > 0 && localStorage.autoProbButtons === 'true') {
                    $(trList[i])
                        .find('#ah-but-reject-with-comment .ah-but-auto-prob')
                        .css({ 'border-left': '1px solid black' })
                        .append('<input type="button" ' +
                            'value="' + category.reason[k].short_name + '" ' +
                            'class="btn btn-default btn-sm ah-mh-action-btn" ' +
                            'bvalue="' + value + '" ' +
                            'data-reason="178" ' +
                            'data-action="reject" ' +
                            'data-version="' + itemVersion + '" ' +
                            'data-comment="Пожалуйста, измените на &#34;' + category.name + ' / ' + category.reason[k].name + '&#34;" ' +
                            'title="' + category.name + ' / ' + category.reason[k].name + '\nВероятность: ' + probability + '%" ' +
                            'style="box-shadow: inset 0 0 5px 0 ' + category.reason[k].color + '; background: ' + background + '">');
                }

            }
        }
    }


    $('div.ah-mh-items input.ah-mh-action-btn').click(function() {
        let dataObj = {
            itemId: $(this).attr('bvalue'),
            version: $(this).data('version'),
            action: $(this).data('action'),
            reason: String($(this).data('reason')),
            customReason: $(this).data('comment') ? $(this).data('comment') : null
        };


        if (~dataObj.reason.indexOf('_')) {
            dataObj.reason = dataObj.reason.split('_');
        }

        submitItem(dataObj);
    });


    $("button.mb_reject.btn , button.mb_block.btn , a.areject, input.ah-mh-action-btn").click(function(){
        lastReject += $(this).parents('tr:eq(0)').attr("data-id")+ '|';
    });

    var butShow = $('<input/>', {
        value: 'Last Reject',
        type: 'button',
        class: 'btn btn-default green',
        xernia: lastReject,
        click: function () {
            window.open('https://adm.avito.ru/moderation/statistics/user/actions', '_blank');
        }
    });
    $('#apply_all').append(butShow);


    if(localStorage.chbx1 == 0){
        $("#chbx1").removeAttr("checked");
    }
    if(localStorage.title!=='' && localStorage.title !== undefined){
        searchWordsGlobal(localStorage.title, localStorage.title1, '.item-info-name a');
        $("#mbuttonS").attr('disabled',true);
    }

    $("#chbx1").change(function(){
        $("#mbuttonS").removeAttr('disabled');
    });

    $("#textaclass").keypress(function(){
        $("#mbuttonS").removeAttr('disabled');
    });
}


function getActiveItems(selector) {
    let url = $(selector).find('div.item-info-row_user-actions a[href ^= "/items/search"]').attr('href');

    let xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.send();
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
            var r = xhr.responseText;

            var activeItems = $(r).find('a[href ^= "/items/search?user_id"]:eq(0)').text();
            var categoryItem = $(r).find('.form-group:contains(Категория) option:selected').parents('.category').attr('label');

            if (categoryItem === 'Недвижимость') {
                var bleach = $(r).find('a[href^="/items/item/soil"]');
                var reasonBlock = $(r).find('#adminTable:contains(Блокировка учётной записи)');

                if (bleach.length !== 0 && reasonBlock.length !== 0) $(selector).find('h3.item-info-name').append('<span title="Данное объявление находится на прозвоне" style="font-weight: bold; color: #099f00; font-size: 19px; margin-left: 10px;">&#9742;</span>');
            }

            $(selector).find('div.item-info-row_user-actions a[href ^= "/items/search"]').html(activeItems);
        }
    };
}
