
function personalStatistics() {
    $('body').append('<div id="rightShotBar"></div>');
    $('#rightShotBar').append('<div id="personalStatistics"></div>');
    $('#personalStatistics').append('<div class="statHide">Statistics</div>');
    $('#personalStatistics').append('<div class="statShow" style="display:none;"></div>');
    $('.statShow').append('<div>Users is blocked: <span id="blockUserCount">0</span></div>');
    $('.statShow').append('<div>Items is blocked: <span id="blockItemCount">0</span></div>');
    $('.statShow').append('<div>Items is rejected: <span id="rejectItemCount">0</span></div>');
    $('.statShow').append('<div>Items is allowed: <span id="allowAllCount">0</span></div>');

    chrome.storage.local.get(['mod_stat', 'currentDay'], function (result) {
        $('#blockUserCount').text(result.mod_stat.blockUserCount);
        $('#blockItemCount').text(result.mod_stat.blockItemCount);
        $('#rejectItemCount').text(result.mod_stat.rejectItemCount);
        $('#allowAllCount').text(result.mod_stat.allowAllCount);
    });

    chrome.storage.onChanged.addListener(function (result) {
        if ("mod_stat" in result) {
            $('#blockUserCount').text(result.mod_stat.newValue.blockUserCount);
            $('#blockItemCount').text(result.mod_stat.newValue.blockItemCount);
            $('#rejectItemCount').text(result.mod_stat.newValue.rejectItemCount);
            $('#allowAllCount').text(result.mod_stat.newValue.allowAllCount);
        }
    });

    $('#personalStatistics').click(function () {
        if (!localStorage.personalStatistics || localStorage.personalStatistics === 'false') {
            localStorage.personalStatistics = true;
            personalStatisticsMouse();
        } else {
            localStorage.personalStatistics = false;
            personalStatisticsMouse();
        }
    });

    personalStatisticsMouse();
    setFixedElemUnderFooter($('#rightShotBar'));
}

function personalStatisticsMouse() {
    if (!localStorage.personalStatistics || localStorage.personalStatistics === 'false') {
        $('.statShow').hide();
        $('.statHide').show();
        $('.statHide').mouseenter(function(){
            $('.statHide').hide();
            $('.statShow').show();
        });

        $('.statShow').mouseleave(function(){
            $('.statShow').hide();
            $('.statHide').show();
        });
    } else {
        $('.statHide').unbind();
        $('.statShow').unbind();
        $('.statHide').hide();
        $('.statShow').show();
    }
}



function premoderationsStart() {
    // Добавляет Info и Abuse и Block user
    addsomeelements();

    // элементы для каждого айтема
    addElementsForEachItem();

    // таймер
    preTimer();

    // Сравнение фото
    comparePhotoPre();

    // Закрывание прежки
    closePre();

    // убрать лишние категории для модеров
    hideSubcategory();
}


function getParameterByName(name, url) {
    if (!url) {
        url = window.location.href;
    }
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

function closePre() {
    window.onbeforeunload = function() {
        return 'Close tab?';
    };

    $('button').click(function () {
        window.onbeforeunload = null;
    });
}

//----- Compare Photos -----//
var comparePhotoLoadItemsCount;

function comparePhotoPre() {

    var photoSelector = $('a:contains(Чужое фото), a:contains(Похожее фото)');
    var len = photoSelector.length;

    for (var i = 0; i < len; ++i) {
        var item1id = photoSelector.slice(i, i+1).parents('tr').attr('id').split('_')[1];
        var item2id = photoSelector.slice(i, i+1).attr('href').split('/')[6];

        photoSelector.slice(i, i+1).before(' <span class="comparePhotoPre pseudo-link" item1id="'+item1id+'" item2id="'+item2id+'">&#128247</span>');
    }

    clickComparePhoto();
}

function comparePhotoPreNew() {

    var photoSelector = $('a:contains(Чужое фото), a:contains(Похожее фото)');
    var len = photoSelector.length;

    for (var i = 0; i < len; ++i) {
        var item1id = photoSelector.slice(i, i+1).parents('tr').attr('id').split('_')[1];
        var item2id = photoSelector.slice(i, i+1).attr('href').split('/')[6];

        photoSelector.slice(i, i+1).before(' <span class="comparePhotoPre pseudo-link" item1id="'+item1id+'" item2id="'+item2id+'">&#128247</span>');
    }

    clickComparePhoto();
}

function comparePhotoPost() {

    var photoSelector = $('a:contains(Чужое фото), a:contains(Похожее фото)');
    var len = photoSelector.length;

    for (var i = 0; i < len; ++i) {
        var item1id = photoSelector.slice(i, i+1).parents('tr').attr('data-id');
        var item2id = photoSelector.slice(i, i+1).attr('href').split('/')[6];

        photoSelector.slice(i, i+1).before(' <span class="comparePhotoPre pseudo-link" item1id="'+item1id+'" item2id="'+item2id+'">&#128247</span>');
    }

    clickComparePhoto();
}

function clickComparePhoto() {
    $('.comparePhotoPre').click(function () {
        comparePhotoLoadItemsCount = 0;
        var item1id = $(this).attr('item1id');
        var item2id = $(this).attr('item2id');

        $('body').append('<div id="comparePhotoBackground"><div id="comparePhotoWindow"><div id="comparePhotoItems"><div id="comparePhotoItem1"></div><div id="comparePhotoItem2"></div></div><div id="comparePhotoButton"></div></div></div>');
        $('#comparePhotoWindow').append('<div class="comparePhotoLoadingWindow"></div>');

        loadingBar('.comparePhotoLoadingWindow', 0);
        $('.cssload-loader').css({'top': '50%', 'transform': 'translateY(-50%)'});

        $('#comparePhotoButton').append('<input id="comparePhotoDuplicate" type="button" class="btn btn-primary" value="Photo Duplicates" title="В зависимости от категории и старт тайма данная кнопка принимает соответствующее действия с объявлением нарушителя">');


        showComparePhotosPre(item1id, 'comparePhotoItem1');
        showComparePhotosPre(item2id, 'comparePhotoItem2');

        $('#comparePhotoDuplicate').click(function () {
            comparePhotoActionWithButtons(item1id, item2id);
        });

        $(document).mouseup(function(e) {
            var div = $('div#comparePhotoWindow');
            if (!div.is(e.target) && div.has(e.target).length === 0) {
                div.detach();
                $('div#comparePhotoBackground').detach();
            }
        });
    });
}

function showComparePhotosPre(id, appendID) {
    $('#'+appendID).append('<div id="login'+appendID+'" class="infoBlockOnPopupWindow" title="Логин">' +
        '<div class="">' +
        '<input type="button" class="sh-action-btn comparePhotoBlockUser blockUser'+appendID+'" value="MC" title="Block: Нарушение условий пользовательского соглашения">' +
        '<input type="button" class="sh-action-btn comparePhotoBlockUser blockUser'+appendID+'" value="PA" title="Block: Подозрительная активность">' +
        '<input type="button" class="sh-action-btn comparePhotoBlockUser blockUser'+appendID+'" value="BN" title="Block: Несколько учетных записей">' +
        '</div>' +
        '</div>');

    $('#'+appendID).append('<div id="items'+appendID+'" class="infoBlockOnPopupWindow" title="Кол-во активных объявлений"></div><hr class="coolHR">');
    $('#'+appendID).append('<div id="head'+appendID+'" class="infoBlockOnPopupWindow" title="Тема объявления"></div>');
    $('#'+appendID).append('<div id="startTime'+appendID+'" class="infoBlockOnPopupWindow" title="Start Time"></div>');
    $('#'+appendID).append('<div id="price'+appendID+'" class="infoBlockOnPopupWindow" title="Цена"></div>');
    $('#'+appendID).append('<div id="photo'+appendID+'" class="itemPhotosBlock infoBlockOnPopupWindow"></div>');

    var href = 'https://adm.avito.ru/items/item/info/'+id;

    var xhr = new XMLHttpRequest();
    xhr.open("GET", href, true);
    xhr.send(null);
    xhr.onreadystatechange = function() {
        if (xhr.readyState==4 && xhr.status==200)  {
            var request = xhr.responseText;

            var login = $(request).find('a[href^="/users/user/info/"]');
            var email = $(request).find('.js-autoselect').text();
            var status = $(request).find('.form-group:contains(Статус) span:first').text();
            var userID = $(request).find('a[href^="/users/user/info/"]').attr('href').split('/')[4];
            var categoryItem = $(request).find('.form-group:contains(Категория) option:selected').parents('.category').attr('label');
            var itemType = $(request).find('.form-group:contains(Тип объявления) option:selected').text();
            var items = $(request).find('a[href^="/items/search?user_id="]');
            var head = $(request).find('.subhead a').text();
            var startTime = $(request).find('[title="Start time"]');
            var price = $(request).find('#fld_price').val();
            var jsonPhotos = $(request).find('.photo-component').attr('data-json');
            var bleach = $(request).find('a[href^="/items/item/soil"]');
            var jsonParsePhotos = JSON.parse(jsonPhotos);


            $('#login'+appendID).append(login).append('<br>'+email);
            $('#items'+appendID).append(items);
            $('#head'+appendID).append('<a href="'+href+'" target="_blank">'+head+'</a>').attr('category', categoryItem).attr('type', itemType);
            $('#startTime'+appendID).append(startTime);
            $('#price'+appendID).append(price);
            $('.blockUser'+appendID).attr('itemID', userID);

            if (bleach.length != 0) {
                $('#head'+appendID).addClass('bleach');
                $('#startTime'+appendID).addClass('bleach');
                $('#price'+appendID).addClass('bleach');
                $('#photo'+appendID).addClass('bleach');
            }
            if (status.indexOf('Blocked')+1) {
                comparePhotoRemoveButton('Item '+id+' is blocked');
            }
            if (status.indexOf('Removed')+1) {
                comparePhotoRemoveButton('Item '+id+' is removed');
            }
            if (status.indexOf('Closed')+1) {
                comparePhotoRemoveButton('Item '+id+' is closed');
            }
            if (status.indexOf('Expired')+1) {
                comparePhotoRemoveButton('Item '+id+' is expired');
            }
            if (status.indexOf('Archived')+1) {
                comparePhotoRemoveButton('Item '+id+' is archived');
            }

            $('#'+appendID+' a').attr('target','_blank');
            for (var i = 0; i < jsonParsePhotos.length; ++i) {
                $('#photo'+appendID).append('<div class="photo-component-image-border"><a class="photo-component-link" href="'+jsonParsePhotos[i].url+'" target="_blank"><img class="photo-component-image js-image" alt="" src="'+jsonParsePhotos[i].thumbUrl+'"></a></div>');
            }

            ++comparePhotoLoadItemsCount;
            if (comparePhotoLoadItemsCount == 2) {
                $('.comparePhotoLoadingWindow').detach();
                comparePhotoItemCategory();
            }
        }
    };

    $('.blockUser'+appendID).click(function () {
        var userID = $(this).attr('itemID');
        var val = $(this).val();

        outTextFrame('Вы заблокировали пользователя '+userID);
        blockUser(userID, val);

        $('#comparePhotoWindow').detach();
        $('#comparePhotoBackground').detach();

        if (appendID == 'comparePhotoItem1') {
            $('#item_'+id).detach();
        }
    });
}

function comparePhotoItemCategory() {
    var item1 = $('#headcomparePhotoItem1');
    var item2 = $('#headcomparePhotoItem2');
    var item1Category = $(item1).attr('category');
    var item2Category = $(item2).attr('category');
    var item1Bleach = $(item1).hasClass('bleach');
    var item2Bleach = $(item2).hasClass('bleach');

    if (item1Category != item2Category) comparePhotoRemoveButton('Объявления размещены в разных категориях');
    if (item1Bleach && item2Bleach) comparePhotoRemoveButton('Оба объявления отбелены');
}

function comparePhotoActionWithButtons(item1id, item2id) {
    var st1 = $('#startTimecomparePhotoItem1 span').text();
    var st2 = $('#startTimecomparePhotoItem2 span').text();
    var item1 = $('#headcomparePhotoItem1');
    var item2 = $('#headcomparePhotoItem2');
    var item1Type = $(item1).attr('type');
    var item2Type = $(item2).attr('type');
    var item1Category = $(item1).attr('category');
    var item2Category = $(item2).attr('category');
    var item1Bleach = $(item1).hasClass('bleach');
    var item2Bleach = $(item2).hasClass('bleach');
    var blockItemBlock = comparePhotoTimeChecker(st1 , st2);

    if (item1Bleach && !item2Bleach) blockItemBlock = 'second';
    if (!item1Bleach && item2Bleach) blockItemBlock = 'first';

    if (blockItemBlock == 'first') {
        comparePhotoDecideBlockReason(item1id, item1Category, item1Type);

        commentOnItemModer(item1id, 'Duplicate photo: https://adm.avito.ru/items/item/info/' + item2id + ' [Alive]');
        commentOnItemModer(item2id, 'Duplicate photo: https://adm.avito.ru/items/item/info/' + item1id + ' [Blocked]');
        $('#item_'+item1id).detach();

        outTextFrame('Опорное объявление было<br>заблокировано/отклонено');
    }
    if (blockItemBlock == 'second') {
        comparePhotoDecideBlockReason(item2id, item2Category, item2Type);

        commentOnItemModer(item1id, 'Duplicate photo: https://adm.avito.ru/items/item/info/' + item2id + ' [Blocked]');
        commentOnItemModer(item2id, 'Duplicate photo: https://adm.avito.ru/items/item/info/' + item1id + ' [Alive]');

        outTextFrame('Второстепенное объявление было<br>заблокировано/отклонено');
    }

    $('#comparePhotoWindow').detach();
    $('#comparePhotoBackground').detach();
}

function comparePhotoDecideBlockReason(id, category, type) {
    if (category == 'Недвижимость' && type == 'Продам') rejectItem(id, 15);
    else if (category == 'Недвижимость' && type == 'Сдам') blockItem(id, 384);
    else if (category == 'Недвижимость' && type == 'Cниму') rejectItem(id, 15);
    else if (category == 'Недвижимость' && type == 'Куплю') rejectItem(id, 15);
    else blockItem(id, 20);
}

function comparePhotoRemoveButton(text) {
    $('#comparePhotoDuplicate').detach();
    $('#comparePhotoFake').detach();

    $('#comparePhotoButton').append('<div style="color: red; font-weight: bold;">'+text+'</div>');
}


function comparePhotoTimeChecker(st1, st2) {
    return dateParse(st1) > dateParse(st2) ? 'first' : 'second';
}

function dateParse(dateString) {
    var tmp = dateString.split(' ');
    var date = tmp[0].split('.');
    var time = tmp[1].split(':');

    return new Date(parseInt(date[2]), parseInt(date[1])-1, parseInt(date[0]), parseInt(time[0]), parseInt(time[1]));
}

function blockItem(id, reason) {
    var formDate = new FormData();
    formDate.append('reasons[]', reason);
    formDate.append('id', id);

    var xhr = new XMLHttpRequest();
    xhr.open("POST", 'https://adm.avito.ru/items/item/block', true);
    xhr.send(formDate);

    outTextFrame(id+' item is blocked');
}

function rejectItem(id, reason) {
    var formDate = new FormData();
    formDate.append('reasons[]', reason);
    formDate.append('id', id);

    var xhr = new XMLHttpRequest();
    xhr.open("POST", 'https://adm.avito.ru/items/item/reject', true);
    xhr.send(formDate);

    outTextFrame(id+' item is rejected');
}

function commentOnItemModer(id, comment){
    var request = new XMLHttpRequest();
    request.open("POST", 'https://adm.avito.ru/comment', true);
    request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    request.send("objectTypeId=1&objectId="+id+"&comment="+encodeURIComponent(comment));
}

//----- Compare Photos -----//

function addsomeelements() {
    var user = $('.user-actions').length;

    for(var i=0; i<user; i++){
        var id = $('.user-actions a[href^="/users/user/info/"]').slice(i,i+1).attr("href").split("/")[4];
        var itemid = $('.it_tiles').slice(i,i+1).attr("id").replace('desc_', '');
        var category = $('#items tr').slice(i,i+1).attr("data-category");
        var params = $('#items tr').slice(i,i+1).attr("data-params-map");
        params = params ? params.replace(/"/g, "&quot;") : '{}';
        var cityItem = $('#items tr').slice(i,i+1).attr("data-location");

        // USER INFO and USER ABUSE
        $('.user-actions').slice(i,i+1)
            .append('<a class="userInfoActionButton" cityItem="'+cityItem+'" userid="'+id+'" itemid="'+itemid+'" data-category="'+category+'" data-params-map="'+params+'" style="margin-left: 10px;">Info</a>')
            .append('<a class="userAbuseActionButton" useridab="'+id+'" itemidab="'+itemid+'" style="margin-left: 10px;">Abuses</a>');

        // кнопки блокировки
        if (localStorage.createdButtons.indexOf('blockUser|&|MC')+1) $('.user-actions').slice(i,i+1).after('<input type="button" userID="'+id+'" class="btn btn-default btn-sm red" value="MC" title="Нарушение условий пользовательского соглашения">');
        if (localStorage.createdButtons.indexOf('blockUser|&|PA')+1) $('.user-actions').slice(i,i+1).after('<input type="button" userID="'+id+'" class="btn btn-default btn-sm red" value="PA" title="Подозрительная активность">');
        if (localStorage.createdButtons.indexOf('blockUser|&|BN')+1) $('.user-actions').slice(i,i+1).after('<input type="button" userID="'+id+'" class="btn btn-default btn-sm red" value="BN" title="Несколько учетных записей">');
    }

    usersInfoAction();

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

//----- Элементы для каждого айтема -----//
function addElementsForEachItem() {

    // для цикла
    var interval = null;
    var lastReject = '';
    var count = $('span#counter').text();
    var countTest = count;

    var n = $('div.it_tiles').length;
    var j = 0;
    for (var i = 0; i < n; i++) {
        // j=i*2;
        //var value = $('div.b-antifraud-section').slice(j,j+1).attr("data-item-id");
        var value = $('a.item_title').slice(i, i + 1).parents('div.it_tiles:eq(0)').attr("id");
        var itemVersion = $('tr[id^="item_"] td.first-cell input[name="version"]').slice(i, i + 1).val();

        var paramId = null;
        var paramsArr = $('tr[id^="item_"]').slice(i, i + 1).data('params');

        if (paramsArr) {
            for (var j = 0; j < paramsArr.length; j++) {
                if (paramsArr[j][1] == 'Адрес') {
                    paramId = paramsArr[j][0];
                }
            }
        }


        // console.log(paramId + ' ' + value);

        var title = $('a.item_title').slice(i, i + 1).attr("title");

        var buttitleOn = $('<input/>',{
            type: 'button',
            value: '^',
            class: 'btn btn-default btn-sm',
            bvalue: value,
            title: title,
            gvalue: '1',
            click:  function () {
                if(($(this).attr("gvalue"))!='0'){
                    var temple = $(this).attr("bvalue");
                    $('#' + temple).next().detach();

                    $('#' + temple).parents('tr:eq(0)').css("opacity","0.57");
                    $(this).attr("gvalue", "0");
                    $(this).attr("value", "v");
                    $('div.b-antifraud-section').attr("style", "min-height: 100px;");

                } else{
                    var tt = $(this).attr("bvalue");
                    $(this).attr("gvalue", "1");
                    $(this).attr("value", "^");
                    $('#' + tt).parents('tr:eq(0)').css("opacity","1");

                    var g = $(this).attr("title");
                    var newtitle = $('<div/>',{
                        class: 'myopis',
                        text: g,
                        style: 'max-width: 750px; overflow: auto;',
                    });
                    $('#' + tt).after(newtitle);
                }

            }
        });

        //RK баттон "описание скрыто"
        var buttitleOff = $('<input/>',{
            type: 'button',
            value: 'v',
            class: 'btn btn-default btn-sm',
            bvalue: value,
            title: title,
            gvalue: '0',
            click:  function () {
                if(($(this).attr("gvalue")) !='0'){
                    var temple = $(this).attr("bvalue");
                    $('#' + temple).next().detach();

                    $('#' + temple).parents('tr:eq(0)').css("opacity","0.57");
                    $(this).attr("gvalue", "0");
                    $(this).attr("value", "v");
                    $('div.b-antifraud-section').attr("style", "min-height: 100px;");

                } else{
                    var tt = $(this).attr("bvalue");
                    $(this).attr("gvalue", "1");
                    $(this).attr("value", "^");
                    $('#' + tt).parents('tr:eq(0)').css("opacity","1");

                    var g = $(this).attr("title");
                    var newtitle = $('<div/>',{
                        class: 'myopis',
                        text: g,
                        style: 'max-width: 750px; overflow: auto;',
                    });

                    $('#' + tt).after(newtitle);
                }

            }
        });

        var opis = $('<div/>',{
            class: 'myopis',
            text: title,
            style: 'margin-top:10px; max-width: 750px; overflow: auto;',
            // style: 'max-width: 100%;',
        });

        //RK показывать описания, если есть определенный флаг
        var regHideDescr = /Запрещ[её]нный товар|Объявление о покупке|Ключевые слова в описании|Контакты и ссылки в описании|Недостаточно подробное описание|Неправильная категория|Признаки дискриминации|Копии товаров/;

        //RK режим показа/скрытия описаний (всегда/никогда/с флагами)
        if ($('#radioDescrAlways').prop("checked")) {
            $('div.it_tiles').slice(i,i+1).append(buttitleOn ,'\t');
            $('div.it_tiles').slice(i,i+1).after(opis);
        } else if ($('#radioDescrNever').prop("checked")) {
            $('div.it_tiles').slice(i,i+1).append(buttitleOff ,'\t');
        } else if ($('div.b-antifraud-wrapper').slice(i,i+1).text().search(regHideDescr) + 1) {
            $('div.it_tiles').slice(i,i+1).append(buttitleOn ,'\t');
            $('div.it_tiles').slice(i,i+1).after(opis);
        } else {
            $('div.it_tiles').slice(i,i+1).append(buttitleOff ,'\t');
            // $('tr').slice(i,i+1).css("opacity","0.57"); скрытые описания прозрачны по умолчанию
        }

        //RK подсветка категории, если есть флаг неправильной категории
        var regSetIllum = /Неправильная категория/;
        if ($('div.b-antifraud-wrapper').slice(i,i+1).text().search(regSetIllum) + 1) {
            var tmp = $('span.it_description').slice(i,i+1).html();
            var tmpCat = tmp.split('</span>');
            var tmpAddr = tmp.split(/<|<span/);
            // console.log(tmpAddr[0]);

            if (tmpCat.length == 3) {
                tmpCat[1] = tmpCat[2];
            }

            var tmpText = $('span.it_description').slice(i,i+1).children().remove();
            $('span.it_description').slice(i,i+1).text(tmpAddr[0]).append(tmpText).append($("<div id='item-category-id' class='item-category' style='display: inline-block;padding: 0 5px; border-radius: 3px; border: 2px solid red; margin-left: 4px;'>" + tmpCat[1] + "</div>"));
        }

        // ------ отображение кол-ва активных айтемов, как в items/search  ------ //

        if (localStorage.addElementsForEachItem == 'true') {
            getActiveItems(i);
        }

        function getActiveItems(i) {
            // $('div.user-actions a[href ^= "/items/search"]').slice(i,i+1).html('test');
            var url = $('div.item-link a[href ^= "/items/item/info"]').slice(i,i+1).attr('href');
            // console.log(url);
            // console.log(url);


            var xhr = new XMLHttpRequest();
            xhr.open('GET', url, true);
            xhr.send();

            xhr.onreadystatechange = function() {
                if (xhr.readyState == 4 && xhr.status == 200) {
                    var r = xhr.responseText;

                    var activeItems = $(r).find('.form-group:contains(Пользователь) a[href ^= "/items/search?user_id"]').text();
                    var categoryItem = $(r).find('.form-group:contains(Категория) option:selected').parents('.category').attr('label');
                    // console.log( activeItems );

                    if (categoryItem == 'Недвижимость') {
                        var bleach = $(r).find('a[href^="/items/item/soil"]');
                        var reasonBlock = $(r).find('#adminTable:contains(Блокировка учётной записи)');

                        if (bleach.length != 0 && reasonBlock.length != 0) $('div.item-link').slice(i,i+1).append('<span title="Данное объявление находится на прозвоне" style="font-weight: bold; color: #099f00; font-size: 19px; margin-left: 10px;">&#9742;</span>');
                    }

                    $('div.user-actions a[href ^= "/items/search"]').slice(i,i+1).html(activeItems);
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

                    $('div.it_tiles').slice(i,i+1).append('<input type="button" value="' + name + '" class="btn btn-default btn-sm mh-action-btn" bvalue="' + value + '" data-reason="' + reason + '" data-action="' + action + '" data-version="' + itemVersion + '">');
                }
            }
        }
    }


    $('div.it_tiles input.mh-action-btn').click(function() {
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
            lastReject = lastReject.replace("/items/item/info/","");
            if(lastReject==''){
                outTextFrame('Ничего небыло отклонено или заблокировано!');
            }else{
                var href = 'https://adm.avito.ru/items/search?date=&phone=&user=&ip=&query='+lastReject+'&price_min=&price_max=&percent_min=&percent_max=&sort_field=sort_time';
                window.open(href, '_blank');
            }
        }
    });
    $('#apply_all').append(butShow);


    if(localStorage.chbx1 == 0){
        $("#chbx1").removeAttr("checked");
    }
    if(localStorage.title!=='' && localStorage.title != undefined){
        searchWordsGlobal(localStorage.title, localStorage.title1, '.item_title');
        $("#mbuttonS").attr('disabled',true);
    }

    $("#chbx1").change(function(){
        $("#mbuttonS").removeAttr('disabled');
    });

    $("#textaclass").keypress(function(){
        $("#mbuttonS").removeAttr('disabled');
    });
}
//+++++ Элементы для каждого айтема +++++//


function find_title_user(what, className){
    what = what.split("|");
    var n=$(className).length;
    var a;
    for(var i=0; i<n; i++){
        var title = $(className).slice(i,i+1).text();
        for(var j=0; j < what.length; j++) {
            a = new RegExp( what[j], "gi" );
            title = title.replace(a, '<span class="redTemple" oldOpis="'+title+'">$&</span>');
            $(className).slice(i,i+1).html(title);

        }
    }
}


function find_words(whatParse, where, category) { //поиск слов
    let what = [];
    if (whatParse !== '') {

        for (let key in whatParse) {
            if (whatParse.hasOwnProperty(key) && category) {
                if (category.indexOf(key) + 1) {
                    what = what.concat(whatParse[key]);
                    break;
                }
            }
        }

        if (whatParse['Все']) {
            what = what.concat(whatParse['Все']);
        }

        let text = where.html();

        if (text) {
            for (let i = 0; i < what.length; i++) {
                let a = new RegExp(what[i], "gi");
                text = text.replace(a, '<span class="redTemple">$&</span>');
            }

            where.html(text);
        }
    }
}

function find_words_parse(words) {
    let obj = {};

    if (words === '') {
        return '';
    } else if (words.indexOf(';') + 1) {
        let categories = words.split(';');

        for (let i = 0; i < categories.length; ++i) {
            if (categories[i].indexOf(':')+1) {
                let tmp = categories[i].split(':');

                obj[tmp[0]] = tmp[1].indexOf(',') + 1 ? tmp[1].split(',') : [tmp[1]];
            }
        }
    } else {
        obj['Все'] = words.indexOf(',') + 1 ? words.split(',') : [words];
    }

    return obj;
}

function sbrosBut(className) { //сброс подсвета
    var nsize=$(className).length;
    for(var i=0; i<nsize; i++){
        $(className).slice(i,i+1).css("background-color","");
        var title = $(className).slice(i,i+1).attr("title");
        var globalTitle =$(className).slice(i,i+1).find('span').attr("oldOpis");
        $(className).slice(i,i+1).text(globalTitle);
        $('div.myopis').slice(i,i+1).html( title );
    }
}


function searchWordsGlobal(temp1, temp2, className) {  //глобальный поиск
    if(localStorage.chbx1 === 1) {
        find_title_user(temp2, className);
    }
    let n = $('#items tr');
    temp1 = find_words_parse(temp1.replace(/\s/g, ''));
    for(let i = 0; i < n.length; i++){
        let opisTemple = $(n[i]).find('.item-info .item-info-description');
        let category = $(n[i]).find('.item-info').children('.item-info-row:eq(1)').text();
        find_words(temp1, opisTemple, category);
    }
}

// отклонение или блокировка
function submitItem(data) {
    // console.log(data);
    var formData = new FormData();

    formData.append('item_id', data.itemId);
    formData.append('version', data.version);
    formData.append('action', data.action);


    if (typeof data.reason == "object") {
        for (var i = 0; i < data.reason.length; i++) {
            // console.log(data.reason[i], typeof data.reason[i]);
            if (data.reason[i] == 'null') {
                alert('Что-то пошло не так');
                return;
            }
            formData.append('reasons[0][]', data.reason[i]);
        }
    } else {
        formData.append('reasons[]', data.reason);
    }


    var url = 'https://adm.avito.ru/items/moder/submit';

    var xhr = new XMLHttpRequest();
    xhr.open('POST', url, true);

    xhr.send(formData);

    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4 && xhr.status == 200) {
            // console.log(xhr.responseText);
            $('tr[data-id="' + data.itemId + '"]').remove();
        }

        if (xhr.readyState == 4 && xhr.status > 200) {
            // alert('Произошла ошибка. Техническая информация:\n' + xhr.status  + ': ' + xhr.statusText + '\n\nОбъявление будет открыто в новой вкладке');
            // window.open('https://adm.avito.ru/items/item/info/' + data.itemId + '','_blank');

            $('body').append('<div id="mh-error-alert" style="position: fixed; margin: auto; left: 0; right: 0; top: 0; bottom: 0; width: 320px; height: 110px; background-color: white;  padding: 10px; box-shadow: 0 0 10px; border-radius: 4px;"><span class="mh-close-btn" style="float: right;" id="mh-error-alert-close-btn"></span><span>Произошла ошибка. Техническая информация:</span><br><b><span>' + xhr.status  + ': ' + xhr.statusText + '</span></b><hr class="mh-default-hr"><span>Ссылка на объявление: <a href="https://adm.avito.ru/items/item/info/' + data.itemId + '" target="_blank">'+ data.itemId +'</a></span></div>');


            hideElementOutClicking($('#mh-error-alert'));

            $('#mh-error-alert-close-btn').click(function() {
                $('#mh-error-alert').detach();
            });


            $('tr[data-id="' + data.itemId + '"]').remove();
        }
    }
}


//----- Таймер -----//
function preTimer() {
    var date = new Date();
    if (!localStorage.preTimer) localStorage.preTimer = '';
    if (!localStorage.preHour) localStorage.preHour = date.getHours();

    if (localStorage.preHour > date.getHours()) {
        localStorage.preTimer = '';
        localStorage.preHour = date.getHours();
    } else {
        localStorage.preHour = date.getHours();
    }

    $('body').append('<div id="preTimerLog" style="position:fixed; display:block; max-height:300px; overflow:auto;"></div>');
    $('#apply_all').append('<div class="preTimer"><span id="minute">00</span>:<span id="seconds">00</span></div>');
    var minute = 0;
    var seconds = 0;

    setInterval(function () {
        ++seconds;

        if (seconds == 60) {
            seconds = 0;
            ++minute;
        }

        $('#minute').text((minute<10?'0':'')+minute);
        $('#seconds').text((seconds<10?'0':'')+seconds);
    }, 1000);

    $('[name="allow"]').click(function() {
        localStorage.preTimer += $('#minute').text()+':'+$('#seconds').text()+'|';
    });

    $('.preTimer').click(function() {
        $('#preTimerLog').toggle();
        $('#preTimerLog').html('');

        if (localStorage.preTimer != '') {
            var log = localStorage.preTimer.split('|');

            var offset = $('.preTimer').offset();
            var left = parseInt(offset.left)-25;

            $('#preTimerLog').css({'left':left+'px','bottom':'75px'});

            for (var i = 0; i < log.length-1; ++i) {
                $('#preTimerLog').append('<div class="preTimer">'+i+' - <span>'+log[i]+'</span></div><br>');
            }
        }
    });
}
//+++++ Таймер +++++//