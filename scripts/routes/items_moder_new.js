
function premoderationsStartNew() {
    // таймер
    preTimer();

    // элементы для каждого айтема
    addElementsForEachItemNew();

    // Добавляет Info и Abuse и Block user
    addsomeelementsNew();

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
}

function abTest() {
    let defaultValue = '[{"categoryID": "10","locationID": "660710"}]';

    if (!localStorage.abTest) localStorage.abTest = defaultValue;

    try {
        let abTestInfo = JSON.parse(localStorage.abTest);

        for (let i = 0; i < abTestInfo.length; ++i) {
            markTestItems(abTestInfo[i].categoryID, abTestInfo[i].locationID);
        }
    } catch (e) {
        localStorage.abTest = defaultValue;
        outTextFrame('Неправильный JSON для A/B теста. Были назначены данные по умолчанию. ID категории - 10, ID локации - 660710');
    }
}

function markTestItems(categoryID, locationID) {
    $.ajax({
        type: 'GET',
        url: 'https://adm.avito.ru/js/locations?json=true&id='+locationID,
        success: function(data) {
            for (let i = 0; i < data.length; ++i) {
                let id = data[i].id;

                let items = $('tr[data-category="'+categoryID+'"][data-location="'+id+'"]');

                $(items).find('.item-info-row:eq(1)')
                    .addClass('ah-ab-test-mark')
                    .prepend('<div class="ah-ab-test">A/B TEST</div>');
            }
        }
    })
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
            location.href = "https://adm.avito.ru/items/moder_new";
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
    let basedItemID = $('.js-comparison').attr('data-based-item');
    let basedItemInfo = $('tr[data-id="'+basedItemID+'"]');

    let content = $('[data-based-item="'+basedItemID+'"]');

    let comparisonItemParamList = $(content).find('.user-main-info');

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

    // добавить причины отклонения для услуг
    optionOtherReasons('.moderate-block', '.moderate-block-list-item:not(.moderate-block-list-item_nested-list)', '.js-moderation-reject-other');

    let wordsParse = find_words_parse(localStorage.title.replace(/\s/g, ''));
    for (let i = 0; i < comparisonUserList.length; ++i) {
        const comparisonDescriptionListChildren = $(comparisonDescriptionList[i]).find('span');
        if (comparisonDescriptionListChildren.length === 0)
            find_words(wordsParse, $(comparisonDescriptionList[i]), $(comparisonItemParamList[i]).find('[data-param-id="1a"]').attr("title"));
        else {
            for (let j = 0; j < comparisonDescriptionListChildren.length; ++j) {
                if ($(comparisonDescriptionListChildren[j]).find('span').length === 0)
                    find_words(wordsParse, $(comparisonDescriptionListChildren[j]), $(comparisonItemParamList[i]).find('[data-param-id="1a"]').attr("title"));
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

function comparisonSmartFlags(content) {

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

function addsomeelementsNew() {
    var user = $('.item-info-row_user-actions').length;

    for(var i=0; i<user; i++){
        var id = $('#items tr').slice(i,i+1).find('a[href^="/users/user/info/"]').attr("href").split("/")[4];
        var itemid = $('.item-info').slice(i,i+1).attr("id").replace('desc_', '');
        var category = $('#items tr').slice(i,i+1).attr("data-category");
        var params = $('#items tr').slice(i,i+1).attr("data-params-map");
        params = params ? params.replace(/"/g, "&quot;") : '{}';
        var cityItem = $('#items tr').slice(i,i+1).attr("data-location");
        var type = $('#items tr').slice(i,i+1).find('.item-info-row-item-type:contains(Тип)').parent().text();

        // USER INFO and USER ABUSE
        $('.item-info-name').slice(i,i+1)
            .append('<span class="item-info-row-item" style="margin-left: 10px; float: right; font-size: 14px;"><a class="userWalletActionButton" userid="'+id+'" itemid="'+itemid+'">WL</a></span>')
            .append('<span class="item-info-row-item" style="margin-left: 10px; float: right; font-size: 14px;"><a class="userAbuseActionButton" useridab="'+id+'" itemidab="'+itemid+'">Abuses</a></span>')
            .append('<span class="item-info-row-item" style="margin-left: 10px; float: right; font-size: 14px;">' +
                '<a class="userInfoActionButton" infoQuery cityItem="'+cityItem+'" userid="'+id+'" itemid="'+itemid+'" data-category="'+category+'" data-params-map="'+params+'">Info</a> ' +
                '<i class="infoSearchIcon glyphicon  glyphicon-search" title="Поисковый запрос для ссылок в Info"></i> ' +
                '<input type="text" placeholder="Info query" class="infoQuery"></span>');

        // кнопки блокировки
        if (localStorage.createdButtons.indexOf('blockUser|&|MC')+1 && type.indexOf('Магазин') === -1) $('.mh_items').slice(i,i+1).append('<input type="button" userID="'+id+'" class="btn btn-default btn-sm red" value="MC" title="Нарушение условий пользовательского соглашения" style="margin-left: 4px;">');
        if (localStorage.createdButtons.indexOf('blockUser|&|PA')+1 && type.indexOf('Магазин') === -1) $('.mh_items').slice(i,i+1).append('<input type="button" userID="'+id+'" class="btn btn-default btn-sm red" value="PA" title="Подозрительная активность">');
        if (localStorage.createdButtons.indexOf('blockUser|&|BN')+1 && type.indexOf('Магазин') === -1) $('.mh_items').slice(i,i+1).append('<input type="button" userID="'+id+'" class="btn btn-default btn-sm red" value="BN" title="Несколько учетных записей">');
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
    $('.item-info-row_user-actions').after('<div class="item-info-row mh_items"></div>');

    // для цикла
    var lastReject = '';

    var n = $('.item-info').length;
    for (var i = 0; i < n; i++) {


        var value = $('.item-info').slice(i, i+1).attr("id");
        var itemVersion = $('input[name="version"]').slice(i, i+1).val();

        var paramId = null;
        var paramsArr = $('tr[id^="item_"]').slice(i, i+1).data('params');

        if (paramsArr) {
            for (var j = 0; j < paramsArr.length; j++) {
                if (paramsArr[j][1] == 'Адрес') {
                    paramId = paramsArr[j][0];
                }
            }
        }

        var title = $('.item-info-name a').slice(i, i + 1).attr("title");

        // ------ отображение кол-ва активных айтемов, как в items/search  ------ //

        if (localStorage.addElementsForEachItem == 'true') {
            getActiveItems(i);
        }

        function getActiveItems(i) {
            // $('div.user-actions a[href ^= "/items/search"]').slice(i,i+1).html('test');
            var url = $('div.item-info-row_user-actions a[href ^= "/items/search"]').slice(i,i+1).attr('href');
            // console.log(url);
            // console.log(url);


            var xhr = new XMLHttpRequest();
            xhr.open('GET', url, true);
            xhr.send();

            xhr.onreadystatechange = function() {
                if (xhr.readyState == 4 && xhr.status == 200) {
                    var r = xhr.responseText;

                    var activeItems = $(r).find('a[href ^= "/items/search?user_id"]:eq(0)').text();
                    var categoryItem = $(r).find('.form-group:contains(Категория) option:selected').parents('.category').attr('label');

                    if (categoryItem == 'Недвижимость') {
                        var bleach = $(r).find('a[href^="/items/item/soil"]');
                        var reasonBlock = $(r).find('#adminTable:contains(Блокировка учётной записи)');

                        if (bleach.length != 0 && reasonBlock.length != 0) $('h3.item-info-name').slice(i,i+1).append('<span title="Данное объявление находится на прозвоне" style="font-weight: bold; color: #099f00; font-size: 19px; margin-left: 10px;">&#9742;</span>');
                    }

                    $('div.item-info-row_user-actions a[href ^= "/items/search"]').slice(i,i+1).html(activeItems);
                }
            };
        }

        // ++++++ отображение кол-ва активных айтемов, как в items/search  ++++++ //
        value = value.replace("desc_","");

        for (var key in localStorage) {
            if (key.indexOf('createdButtons') + 1) {

                var tmpKey = localStorage.getItem(key).split(' ');

                for (var j = 0; j < tmpKey.length; j++) {
                    var name = tmpKey[j].split('|&|')[0];
                    var action = tmpKey[j].split('|&|')[1];
                    var reason = tmpKey[j].split('|&|')[2];

                    if (name == '') continue;

                    if (name == reason) { // для отклонений за "параметр" Адрес
                        reason = '175_' + paramId;
                    }

                    // console.log(reason);

                    $('.mh_items').slice(i,i+1).append('<input type="button" value="' + name + '" class="btn btn-default btn-sm mh-action-btn" bvalue="' + value + '" data-reason="' + reason + '" data-action="' + action + '" data-version="' + itemVersion + '">');
                }
            }
        }
    }


    $('div.mh_items input.mh-action-btn').click(function() {
        var dataObj = {
            itemId: $(this).attr('bvalue'),
            version: $(this).data('version'),
            action: $(this).data('action'),
            reason: String($(this).data('reason'))
        }


        if (~dataObj.reason.indexOf('_')) {
            dataObj.reason = dataObj.reason.split('_');
        }

        // console.log(dataObj.reason, typeof dataObj.reason);
        submitItem(dataObj);
    });


    $("button.mb_reject.btn , button.mb_block.btn , a.areject, input.mh-action-btn").click(function(){
        lastReject += $(this).parents('tr:eq(0)').attr("data-id")+ '|';
    });

    var butShow = $('<input/>', {
        value: 'Last Reject',
        type: 'button',
        class: 'btn btn-default green',
        xernia: lastReject,
        click: function () {
            // lastReject = lastReject.replace("/items/item/info/","");
            // if(lastReject==''){
            //     outTextFrame('Ничего небыло отклонено или заблокировано!');
            // }else{
            //     var href = 'https://adm.avito.ru/items/search?date=&phone=&user=&ip=&query='+lastReject+'&price_min=&price_max=&percent_min=&percent_max=&sort_field=sort_time';
            //     window.open(href, '_blank');
            // }

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
