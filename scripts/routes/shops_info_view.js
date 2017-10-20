
function shopsInfoElements() {

    var timer = null;
    $(window).on('scroll', function() {
        $('#shop-side-panel').css('will-change', 'transform');
        clearTimeout(timer);

        timer = setTimeout(function() {
            $('#shop-side-panel').css('will-change', false);
        }, 100);
    });


    var navbarHeight = $('div.navbar-fixed-top').height();
    if (!navbarHeight) {
        navbarHeight = 50;
    }

    // для переключателя
    $('body').append('<div id="switch-wrapper" style="position: fixed; bottom: 10px; left: 15px; background-color: white; z-index: 3; padding: 4px; box-shadow: 0 0 10px 6px white;"></div>');
    $('#switch-wrapper').append('<input type="checkbox" class="default-switch" id="side-panel-switch" checked>');
    $('#switch-wrapper').append('<label for="side-panel-switch" title="" style="margin-bottom: 0;"><span style="vertical-align: middle; font-weight: normal;">Боковая панель<span style="color: rgb(149, 149, 149);"> (Alt+S)</span></span></label>');

    $('body').append('<div id="shop-side-panel" style="position: fixed; top: 0px; padding-top: ' + (navbarHeight + 10) + 'px; right: 0; background-color: white; z-index: 2; width: 42%; height: 100%; border-left: 1px solid #ccc;"></div>');

    $('#shop-side-panel').append('<div id="shop-menu-container" style="padding: 0 17px 40px 10px; width: 103%; height: 100%; overflow-y: scroll;"></div>');

    // для переключателя
    $('#shop-menu-container').append('<div id="shop-header" style="line-height: 30px;"><div class="main-info"><span id="shop-moderation-status">Проверка...</span></div><div class="shop-header-notification" style="padding-top: 4px;"><span id="non-editalbe-notification" class="shop-notofication-item" style=""></span></div><hr class="default-hr"></div>');

    // горячие клавиши переключателя
    document.onkeydown = function(e) {
        if (e.which == 83 && e.altKey) {
            $('#side-panel-switch').click();
            return false;
        }
    };

    // обработчик переключателя
    $('#side-panel-switch').click(function() {
        // console.log($(this).is(':checked'));

        var originalSidePanel = $('div.col-xs-5');
        if ($(this).is(':checked')) {
            $('#shop-side-panel').show();
            $(originalSidePanel).detach();
            fromToSideBar(originalSidePanel, 'addOld');
        } else {
            $('#shop-side-panel').hide();
            fromToSideBar(originalSidePanel, 'removeOld');
        }
    });


    showFields(); // показ полей

    // searchForeignText(); // поиск текста на иностранном

    getRexExp(); // ключевые слова

    checkPass(); // проверка нажатия Pass

    $('input[name="image"]').attr('multiple', true); // мультизагрузка фото

    // // Премиум-аккаунты
    var userId = $('a[href^="/users/user/info/"]').attr('href').replace(/\D/g, '');
    showPremiumUsers(userId);


    // оригинальный сайдбар
    var originalSidePanel = $('div.col-xs-5').detach();
    fromToSideBar(originalSidePanel, 'addOld');

    checkNoneditableFields(); // Проверка нередактируемых полей
}

function showFields() {
    $('#shop-menu-container').append('<div id="shop-fields"><h4>Поля</h4></div>');
    $('#shop-fields').append('<table width="100%"></table>');

    var fields = [{name: 'Название', isLink: false, fieldNameAttr: 'name'}, {name: 'Домен', isLink: false, fieldNameAttr: 'domain'}, {name: 'Видео URL', isLink: true, fieldNameAttr: 'videoUrl'}, {name: 'Сайт', isLink: true, fieldNameAttr: 'url'}];

    var textInput, label, value;
    for (var i = 0; i < fields.length; i++) {
        textInput = $('form[action^="/shops/info/view"] input[name="'+ fields[i].fieldNameAttr +'"]')[0];
        label = $('.form-group label:contains('+ fields[i].name +')').text();

        value = $(textInput).val();
        value = value == '' ? '<i>Отсутствует</i>' : value;

        if (fields[i].isLink && value != '<i>Отсутствует</i>') {
            $('#shop-fields table').append('<tr width="100%" data-containter-label="'+ label +'"><td class="shop-field-name"><a style="" title="">'+ fields[i].name +'</a></td><td class="shop-field-value"><span style=""><a href="'+ value +'" target="_blank">'+ value +'</a></span></td></tr>');
        } else {
            $('#shop-fields table').append('<tr width="100%" data-containter-label="'+ label +'"><td class="shop-field-name"><a style="" title="">'+ fields[i].name +'</a></td><td class="shop-field-value"><span style="">'+ value +'</span></td></tr>');
        }
    }

    var regApple = /(apple|i\W{0,2}phone|i\W{0,2}pod|i\W{0,2}pad)/gi;
    var domain = $('#shop-fields tr:contains(Домен) .shop-field-value')[0];
    var result;
    if ($(domain).text().match(regApple)) {
        result = $(domain).text().match(regApple);
        $(domain).append('<span class="field-alert" data-matched="'+ result +'"></span>');
    }

    var regDomain = /([a-zA-Z0-9а-яёА-ЯЁ]([a-zA-Z0-9а-яёА-ЯЁ\-]{0,61}[a-zA-Z0-9а-яёА-ЯЁ])?\.)+[a-zA-Zа-яёА-ЯЁ]{2,6}/gi;
    var name = $('#shop-fields tr:contains(Название) .shop-field-value')[0];
    var result;
    if ($(name).text().match(regDomain)) {
        result = $(name).text().match(regDomain);
        $(name).append('<span class="field-alert" data-matched="'+ result +'"></span>');
    }

    var matched;
    $('span.field-alert').hover(
        function() {
            matched = $(this).data('matched');
            matched = matched.split(',');
            for (var i = 0; i < matched.length; i++) {
                $(this).prev('span').html($(this).prev('span').html().replace(matched[i], '<span style="color: #d9534f;">'+ matched[i] +'</span>'));
            }
        },
        function() {
            $(this).prev('span').html($(this).prev('span').text());
        });


    // Пользователь
    var anotherField, anotherFieldObj;
    anotherField = 'Пользователь';
    anotherFieldObj = $('.form-group:contains('+ anotherField +') .help-block')[0];

    var userId = $(anotherFieldObj).find('a[href^="/users/user/info/"]').attr('href').replace(/\D/g, '');
    var userMail = $(anotherFieldObj).find('a[href^="/users/user/info/"]')[0].nextSibling;
    userMail = userMail.data.replace(/[\s\(\)]/g, '');

    $('#shop-fields table').append('<tr width="100%" data-containter-label="'+ anotherField +'"><td class="shop-field-name"><a style="" title="">'+ anotherField +'</a></td><td class="shop-field-value"><span style=""><a href="/users/user/info/'+ userId +'" target="_blank">'+ userId +'</a></span><button data-content="ID" id="" class="default-btn text-to-clipboard" type="button" title="Скопировать ID в буфер обмена" style="margin: 0 4px; padding: 2px; font-size: 12px; position: relative;"><span class="button-label orange-background" style="border-radius: 0; font-size: 12px; min-width: 15px; top: 0px; margin-right: 0;">Б</span></button>|<span style="margin-left: 4px;">'+ userMail +'</span><button data-content="E-mail" id="" class="default-btn text-to-clipboard" type="button" title="Скопировать E-mail в буфер обмена" style="margin: 0 4px; padding: 2px; font-size: 12px; position: relative;"><span class="button-label orange-background" style="border-radius: 0; font-size: 12px; min-width: 15px; top: 0px; margin-right: 0;">Б</span></button></td></tr>');

    $('.text-to-clipboard').click(function() {
        var text = $(this).prev('span').text();
        chrome.runtime.sendMessage( { action: 'copyToClipboard', text: text } );
        outTextFrame($(this).data('content') +' '+ text +' скопирован');
    });

    var scrollElem;
    $('#shop-fields table tr').click(function(e) {
        // console.log(e);
        if (e.target.target == '_blank' || e.target.innerText == 'Б') return;
        var scrollElemLabel = $(this).data('containterLabel');
        scrollElem = $('.form-group label:contains('+ scrollElemLabel +')');

        scrollToElem(scrollElem);
    });



}

function getRexExp(refresh) {
    if (!refresh) {
        $('#shop-menu-container').append('<hr class="default-hr"><div id="shop-keywords"><h4>Ключевые слова и фразы<span class="shop-searching-indicator">Загрузка...</span></h4></div>');
    }

    chrome.runtime.sendMessage({
        action: 'XMLHttpRequest',
        method: "GET",
        url: "http://avitoadm.ru/traffic_helper/getRegExp.php",
    }, function(response) {
        $('#shop-keywords .shop-searching-indicator').detach();
        $('#shop-keywords h4').append('<span class="refresh-btn" style="float: right; margin-left: 4px;" title="Обновить"></span>');
        $('#shop-keywords').append('<table width="100%"></table>');

        if (~response.indexOf('Неверный запрос') || response == 'error') {
            $('#shop-keywords table').append('<tr><td style="color: rgb(217, 83, 79); ">Произошла техническая ошибка</td></tr>');
            return;
        }

        try {
            var response = JSON.parse(response);
        } catch(e) {
            $('#shop-keywords table').append('<tr><td style="color: rgb(217, 83, 79); ">Произошла техническая ошибка</td></tr>');
            return;
        }

        // var regsObj = [];
        var regs = [];
        for (var i = 0; i < response.length; i++) {
            regs.push(new RegExp(response[i].true_reg, "gi"));
        }
        // console.log(regs);

        $('#shop-keywords .refresh-btn').click(function() {

            var refresh = true;
            $('#shop-keywords table').detach();
            $('#shop-keywords').append('<table width="100%"></table>');
            $('.form-control').removeClass('bad-text-highlighting-key');
            searchKeywords(regs, refresh);
        });
        // поиск слов
        searchKeywords(regs);
    });
}
// поиск слов
function searchKeywords(regs, refresh) {
    var fields = $('form[action^="/shops/info/view"] input.form-control, form[action^="/shops/info/view"] textarea.form-control');
    var fieldsCount = $('form[action^="/shops/info/view"] input.form-control, form[action^="/shops/info/view"] textarea.form-control').length;

    var text, tagName, tmpRes = null, result = [], label;

    for (var i = 0; i < fieldsCount; i++) {
        tagName = $(fields[i])[0].tagName;
        switch(tagName) {
            case 'INPUT':
                text = $(fields[i]).val();
                break;

            case 'TEXTAREA':
                // text = $(fields[i]).text();
                text = $(fields[i]).val(); // можно и так брать, как и для инпута
                break;

            default:
                alert('Произошла ошибка при подсветке слов');
                break;
        }

        for (var j = 0; j < regs.length; j++) {
            if (text.match(regs[j])) {
                tmpRes = text.match(regs[j]);
                // console.log(result);
                for (var k = 0; k < tmpRes.length; k++) {
                    if (~tmpRes[k].charAt(0).search(/[^а-яё\w]/i)) {
                        tmpRes[k] = tmpRes[k].slice(1);
                    }
                    if (~tmpRes[k].charAt(tmpRes[k].length - 1).search(/[^а-яё\w\W]/i)) {
                        tmpRes[k] = tmpRes[k].slice(0, -1);
                    }

                    result.push(tmpRes[k]);
                }
            }
        }

        if (result.length) {
            label = $(fields[i]).closest('.form-group').find('label').text();

            $('#shop-keywords table').append('<tr data-containter-label="'+ label +'" class="words-selection-result"><td style=""><a style="cursor: default;" title="">'+ label +'</a></td><td class="shops-words-result" style="">'+ result.join('|') +'</td></tr>');

            $(fields[i]).addClass('bad-text-highlighting-key');

            tmpRes = null, result = [];
        }
    }

    // если ничего нет - говорим, что ничего нет:)
    if (!$('#shop-keywords table tr').length) {
        $('#shop-keywords table').append('<tr><td style="color: rgb(149, 149, 149); "><i>Ничего не найдено</i></td></tr>');
    }

    // разбиваем на спаны каждое ключевое слово
    var singleKeyWords = $('#shop-keywords table td.shops-words-result');
    var singleText;
    for (var i = 0; i < singleKeyWords.length; i++) {
        singleText = $(singleKeyWords[i]).text();
        singleText = singleText.replace(/\|/g, '</span><span class="words-separator">|</span><span class="single-word">');

        $(singleKeyWords[i]).html('<span class="single-word">'+ singleText +'</span>');
    }

    var elem, textInput, start, end;
    var posStart, posEnd, parentElem, textField, resArr = [];
    var singleWordArr = $('#shop-keywords td.shops-words-result');

    $('#shop-keywords table span.single-word').click(function() {
        // добавляем атрибуты позиции для каждого спана
        for (var i = 0; i < singleWordArr.length; i++) {
            parentElem = $(singleWordArr[i]).closest('.words-selection-result').attr('data-containter-label');
            textField = $('.form-group:contains('+ parentElem +') .bad-text-highlighting-key')[0];
            resArr =  $(singleWordArr[i]).text().split('|');

            // console.log(resArr);
            for (var j = 0; j < resArr.length; j++) {
                posStart = $(textField).val().indexOf(resArr[j]);
                posEnd = $(textField).val().indexOf(resArr[j]) + resArr[j].length;

                // console.log(posStart, posEnd);

                $(singleWordArr[i]).find('span.single-word').slice(j, j + 1).attr('data-pos-start', ''+ posStart +'');
                $(singleWordArr[i]).find('span.single-word').slice(j, j + 1).attr('data-pos-end', ''+ posEnd +'');
            }
        }

        elem = $(this).closest('.words-selection-result').data('containterLabel');
        textInput = $('.form-group:contains('+ elem +') .bad-text-highlighting-key')[0];
        start =  +$(this).attr('data-pos-start');
        end =  +$(this).attr('data-pos-end');

        if (start == -1) {
            outTextFrame('Не найдено');
            return;
        }
        selectFromTo(textInput, start, end);
        scrollToSelection(textInput);
    });

    var scrollElem;
    $('tr.words-selection-result').click(function() {
        var scrollElemLabel = $(this).data('containterLabel');
        scrollElem = $('.form-group:contains('+ scrollElemLabel +')');

        scrollToElem(scrollElem);
    });

    if (refresh) {
        outTextFrame('Обновлено');
    }
}

function searchForeignText(refresh) {
    if (!refresh) {
        $('#shop-menu-container').append('<hr class="default-hr"><div id="shop-foreign-words"><h4>Латиница</h4></span></div>');
    }

    $('#shop-foreign-words h4').append('<span class="refresh-btn" style="float: right; margin-left: 4px;" title="Обновить"></span>');
    $('#shop-foreign-words').append('<table width="100%"></table>');

    $('#shop-foreign-words .refresh-btn').click(function() {
        $('#shop-foreign-words .refresh-btn, #shop-foreign-words table').detach();
        $('.form-control').removeClass('bad-text-highlighting-foreign');

        var refresh = true;
        searchForeignText(refresh);
    });

    var fields = $('form[action^="/shops/info/view"] [name="shortDescription"], form[action^="/shops/info/view"] [name="description"], form[action^="/shops/info/view"] [name="statusBar"], form[action^="/shops/info/view"] [name="deliveringTitle"], form[action^="/shops/info/view"] [name="deliveringDescription"], form[action^="/shops/info/view"] [name="paymentTitle"], form[action^="/shops/info/view"] [name="paymentDescription"]');

    // var reg = /(([^а-яё\s, :'.\-!?;\(\)\"\|\w]([, :'.\-!?;\(\)\"\|]){0,5})+)/gi;
    var reg = /(([^а-яё\d\W_]([, :'.\-!?;\(\)\"\|]){0,5})+)/gi;

    var text, tmpRes = null, result = [], label, resTextVol, color;
    for (var i = 0; i < fields.length; i++) {
        text = $(fields[i]).val();

        if (text.match(reg)) {
            tmpRes = text.match(reg);
            for (var k = 0; k < tmpRes.length; k++) {
                if (~tmpRes[k].charAt(0).search(/\s/)) {
                    tmpRes[k] = tmpRes[k].slice(1);
                }
                result.push(tmpRes[k]);
            }
        }

        if (result.length) {
            label = $(fields[i]).closest('.form-group').find('label').text();

            resTextVol = ((result.join('').replace(/\s/g, '').length / text.replace(/\s/g, '').length) * 100).toFixed();
            // console.log(result.join('').replace(/\s/g, '').length, text.replace(/\s/g, '').length, resTextVol);

            color = resTextVol < 30 ? '#5cb85c;' : '#d9534f;';

            $('#shop-foreign-words table').append('<tr data-containter-label="'+ label +'" class="words-selection-result"><td style=""><a style="cursor: default;" title="">'+ label +'</a><span class="shops-words-volume" style="color:'+ color +'">('+ resTextVol +'%)</span></td><td class="shops-words-result" style="">'+ result.join('|') +'</td></tr>');

            $(fields[i]).addClass('bad-text-highlighting-foreign');

            tmpRes = null, result = [];
        }
    }

    // если ничего нет - говорим, что ничего нет:)
    if (!$('#shop-foreign-words table tr').length) {
        $('#shop-foreign-words table').append('<tr><td style="color: rgb(149, 149, 149);"><i>Ничего не найдено</i></td></tr>');
    }

    // разбиваем на спаны каждое ключевое слово
    var singleKeyWords = $('#shop-foreign-words table td.shops-words-result');
    var singleText;
    for (var i = 0; i < singleKeyWords.length; i++) {
        singleText = $(singleKeyWords[i]).text();
        singleText = singleText.replace(/\|/g, '</span><span class="words-separator">|</span><span class="single-word">');
        $(singleKeyWords[i]).html('<span class="single-word">'+ singleText +'</span>');
    }

    var elem, textInput, start, end;
    var posStart, posEnd, parentElem, textField, resArr = [];
    var singleWordArr = $('#shop-foreign-words td.shops-words-result');

    $('#shop-foreign-words table span.single-word').click(function() {
        // добавляем атрибуты позиции для каждого спана
        for (var i = 0; i < singleWordArr.length; i++) {
            parentElem = $(singleWordArr[i]).closest('.words-selection-result').attr('data-containter-label');
            textField = $('.form-group:contains('+ parentElem +') .bad-text-highlighting-foreign')[0];
            resArr =  $(singleWordArr[i]).text().split('|');

            // console.log(resArr);
            for (var j = 0; j < resArr.length; j++) {
                posStart = $(textField).val().indexOf(resArr[j]);
                posEnd = $(textField).val().indexOf(resArr[j]) + resArr[j].length;

                // console.log(posStart, posEnd);

                $(singleWordArr[i]).find('span.single-word').slice(j, j + 1).attr('data-pos-start', ''+ posStart +'');
                $(singleWordArr[i]).find('span.single-word').slice(j, j + 1).attr('data-pos-end', ''+ posEnd +'');
            }
        }

        elem = $(this).closest('.words-selection-result').data('containterLabel');
        textInput = $('.form-group:contains('+ elem +') .bad-text-highlighting-foreign')[0];
        start =  +$(this).attr('data-pos-start');
        end =  +$(this).attr('data-pos-end');

        if (start == -1) {
            outTextFrame('Не найдено');
            return;
        }
        selectFromTo(textInput, start, end);
        scrollToSelection(textInput);
    });

    var scrollElem;
    $('tr.words-selection-result').click(function() {
        var scrollElemLabel = $(this).data('containterLabel');
        scrollElem = $('.form-group:contains('+ scrollElemLabel +')');

        scrollToElem(scrollElem);
    });
}

function checkPass() {
    var formBlock = $('form[action*="/discount/set"]');
    var fields = $(formBlock).find('.form-group');
    var moderField;
    $(fields).each(function(i, field) {
        var label = $(field).find('.control-label');
        if ($(label).text() == 'Модерация') {
            moderField = $(field);
        }
    });


    if ($(moderField).find('a[href$="moderate"]').length > 0) {
        $('#shop-moderation-status').text('Модерация не пройдена');
        $('#shop-moderation-status').addClass('shop-not-moderated');

        $('#shop-header .main-info').append('<a id="shop-moderate" style="margin-left: 8px; cursor: pointer; vertical-align: middle;" class="" value="">Pass</a>');

        $('#shop-moderate').click(function() {
            var shopId = +$('a[href$="/moderate"]').attr('href').replace(/\D/g, '');
            var isModerate = confirm('Вы уверены?');

            if (isModerate) {
                if (!shopId || !isFinite(shopId)) {
                    alert('Ошибка: не удалось определить ID Магазина.');
                    return;
                }
                window.location.assign('https://adm.avito.ru/shops/'+ shopId +'/moderate');
            } else {
                return;
            }
        });

    } else if ($(moderField).find('.label-success').length > 0) {
        $('#shop-moderation-status').text('Модерация пройдена');
        $('#shop-moderation-status').addClass('shop-moderated');
    } else {
        $('#shop-moderation-status').text('Ошибка: не удалось определить статус модерации');
        $('#shop-moderation-status').addClass('shop-error-notification-item');
    }
}

function checkNoneditableFields() {
    var formBlock = $('form[action^="/shops/info/view"]');
    var allLabels = formBlock[0].querySelectorAll('.control-label');
    var statusBlock = [].find.call(allLabels, singleItem => singleItem.firstChild.data === 'Статус');
    var statusParent = statusBlock.parentNode;
    // console.log(statusParent);

    var shopStatusLabel = $(statusParent).find('.label-primary');
    var shopStatusText = $(shopStatusLabel).text();
    // console.log(shopStatusText);


    var formBlock = $('form[action*="/discount/set"]');
    var fields = $(formBlock).find('.form-group');
    var moderField;
    $(fields).each(function(i, field) {
        var label = $(field).find('.control-label');
        if ($(label).text() == 'Модерация') {
            moderField = $(field);
        }
    });

    if (!shopStatusText) {
        var fieldNotification = $('#non-editalbe-notification');
        $(fieldNotification).addClass('shop-error-notification-item');
        $(fieldNotification).text('Ошибка: не удалось определить статус Магазина');
        $(fieldNotification).show();
        return false;
    }

    if (shopStatusText.toLowerCase() == 'отключённый') {
        indicateNoneditableFields();
    }
}

function indicateNoneditableFields() {
    var fieldNotification = $('#non-editalbe-notification');
    $(fieldNotification).text('Клиент не может редактировать поля "Доставка", "Оплата" и "Сайт"');
    $(fieldNotification).show();

    var formBlock = $('form[action^="/shops/info/view"]');
    var allLabels = formBlock[0].querySelectorAll('.control-label');

    var fields = ['Delivery title', 'Delivery details', 'Payment title', 'Payment details', 'Сайт']
    var fieldsTextElems = [];
    var fieldLabels = [];

    $(allLabels).each(function(i, label) {
        fields.forEach(function(field) {
            if ($(label).text() == field) {
                var fieldParent = $(label).parent();
                var textElem = $(fieldParent).find('.form-control');
                fieldsTextElems.push(textElem[0]);
                fieldLabels.push($(label)[0]);
            }
        });
    });

    $(fieldsTextElems).addClass('noneditable-text-field-highlighting');
    $(fieldLabels).append('<span class="icon-lock" style="margin-left: 2px;" title="Клиент не может редактировать это поле"></span>');
}

function showPremiumUsers(userId) {
    let mainInfo = $('#shop-header .main-info');
    mainInfo.append('<div class="ah-user-indicators-item ah-inactive" id="REpremium" style="float: right; font-style: italic;"></div>');
    let container = $('#REpremium');
    container.append(`<span data-indicator="REPremium"></span>`);

    let indicators = new AhIndicators(['REPremium'], container);
    let rePremium = indicators.get().rePremium;
    let shopIndicators = new ShopInfoIndicators();
    if (shopIndicators.getRePremiumInfo().isFired) {
        indicators.fireUp(rePremium);
    } else {
        indicators.addLoader(rePremium);
        getPremiumUsersList().then(
            response => {
                try {
                    for (let i = 0; i < response.realty.length; i++) {
                        if (+userId === +response.realty[i].id) {
                            indicators.fireUp(rePremium);
                            return;
                        }
                    }
                    indicators.snuffOut(rePremium);
                } catch (e) {
                    indicators.showError(rePremium);
                    console.log(e);
                }
            },
            error => {
                indicators.showError(rePremium);
                console.log(error);
            }
        );
    }
}

// добавление/удаление детачнутых элементов на правой панели
function fromToSideBar(elem, action) {
    if (action == 'addOld') {
        $(elem).addClass('modified-original-shop-side-bar');
        $('#shop-menu-container').append('<hr class="variable-default-hr">', $(elem));
    }

    if (action == 'removeOld') {
        $(elem).removeClass('modified-original-shop-side-bar');
        $('hr.variable-default-hr').detach();
        $('div.row').append($(elem));
    }

}

// браузерное выделение в текстовых полях
function selectFromTo(textInput, i1, i2) {
    if (typeof textInput.selectionStart != 'undefined') {
        textInput.setSelectionRange(i1, i2);
        textInput.focus();
    } else if (textInput.createTextRange) {
        var range = textInput.createTextRange();
        range.moveStart('character', i1);
        range.moveEnd('character', i2);
        range.select();
    } else {
        alert("Что-то пошло не так");
    }
}

// скролл в текстареа
function scrollToSelection(elem) {
    elem.scrollTop = elem.selectionStart;
}
