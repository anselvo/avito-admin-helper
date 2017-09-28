function currentTime() {
    date = new Date();
    var day = (date.getDate() < 10 ? '0' : '') + date.getDate();
    var month = ((date.getMonth() + 1) < 10 ? '0' : '') + (date.getMonth() + 1);
    var year = date.getFullYear();
    var hours = (date.getHours() < 10 ? '0' : '') + date.getHours();
    var minutes = (date.getMinutes() < 10 ? '0' : '') + date.getMinutes();
    var seconds = (date.getSeconds() < 10 ? '0' : '') + date.getSeconds();

    return day + "." + month + "." + year + " " + hours + ":" + minutes + ":" + seconds;
}

function DDMMYYY() {
    var today = new Date();
    today.setDate(today.getDate());
    today = today.getDate() + '.' + (today.getMonth() + 1) + '.' + today.getFullYear();
    return today;
}

function outTextFrame(text) {
    $('#outputTextFrame').detach();
    $('body').append('<div id="outputTextFrame">' + text + '</div>');
}

function loadingBar(attr, top) {
    $(attr).append('<div class="cssload-loader" style="top:' + top + 'px;">' +
            '<div class="cssload-inner cssload-one"></div>' +
            '<div class="cssload-inner cssload-two"></div>' +
            '<div class="cssload-inner cssload-three"></div>' +
            '</div>');
}

// скрывать элемент вне клика на него (передаём элемент)
function hideElementOutClicking(elem) {
    // скрываем попап выбора тегов
    $(document).mouseup(function (e) { // событие клика по веб-документу
        var div = elem; // элемент
        if (!div.is(e.target) // если клик был не по элементу
                && div.has(e.target).length === 0) { // и не по его дочерним элементам
            div.detach(); // убираем его
        }
    });
}

function realHideElementOutClicking(elem) {
    $(document).mouseup(function (e) { // событие клика по веб-документу
        var div = elem; // элемент
        if (!div.is(e.target) // если клик был не по элементу
                && div.has(e.target).length === 0) { // и не по его дочерним элементам
            div.hide(); // убираем его
        }
    });
}

// Сброс форматирования текста в буфере обмена (во всем документе)
function resetTextFormatInClipboardData() {

    // document.querySelector('div.helpdesk-details-panel').addEventListener('copy', function(e) {
    document.addEventListener('copy', function (e) {
        var text = getSelectedText().toString();
        e.clipboardData.setData('Text', text);
        e.preventDefault();
    });
}

function showModal() {
    $('body').addClass('ah-modal-open');
    $('body').css('padding-right', '17px');
}
function closeModal() {
    $('body').removeClass('ah-modal-open');
    $('body').css('padding-right', 'none');
}

// dorpdown-menu ---
function dropdownCall(elem) {
    var dropMenu = $(elem).siblings('.ah-dropdown-menu');

    var wasDropped = ($(dropMenu).hasClass('ah-dropped'));
    $('.ah-dropped').removeClass('ah-dropped');
    if (wasDropped) {
        $(dropMenu).addClass('ah-dropped');
    }

    $(dropMenu).toggleClass('ah-dropped');
}

$(function () {
    var dd = new DropDownBody($('.ah-dropdown-menu'));

    $(document).click(function (e) {
        var div = $('.ah-dropdown-menu');
        if (!div.is(e.target)
                && div.has(e.target).length === 0) {
            $('.ah-dropdown-menu').removeClass('ah-dropped');
        }
    });
});

function DropDownBody(el) {
    this.dd = el;
    this.initEvents();
}
DropDownBody.prototype = {
    initEvents: function () {
        var obj = this;

        obj.dd.on('click', function (event) {
            $(this).toggleClass('ah-dropped');
            event.stopPropagation();
        });
    }
}
// dorpdown-menu +++

// сравнение двух массивов (не строгое);
function isArraysEqual(arr1, arr2) {
    if (arr1.length != arr2.length)
        return false;

    var controlCount = 0;
    for (var i = 0; i < arr1.length; i++) {
        for (var j = 0; j < arr2.length; j++) {
            if (arr1[i] == arr2[j]) {
                controlCount++;
                break;
            }
        }
    }
    return (controlCount == arr1.length) ? true : false;
}

// проверка на json
function isJson(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

// возвращает уникальные элементы массива
function unique(arr) {
    var obj = {};

    for (var i = 0; i < arr.length; i++) {
        var str = arr[i];
        obj[str] = true;
    }

    return Object.keys(obj);
}

// возвращает выделенный текст
function getSelectedText() {
    var text = "";
    if (window.getSelection) {
        text = window.getSelection();
    } else if (document.getSelection) {
        text = document.getSelection();
    } else if (document.selection) {
        text = document.selection.createRange().text;
    }
    return text;
}

// Поиск по соцсети +++
function searchBySocialBtnHandler(btn) {
    var socialId = $(btn).parents('.search-user-by-social-wrapper').find('[name="socialId"]').val();
    socialId = socialId.replace(/ /gi, '');
    if (!socialId) {
        alert('Введите ID социальной сети.');
        return;
    }

    var avitoSocialInfo = [{
            id: 1,
            name: 'vk.com'
        }, {
            id: 2,
            name: 'facebook.com'
        }, {
            id: 3,
            name: 'ok.ru'
        }, {
            id: 4,
            name: 'my.mail.ru'
        }, {
            id: 5,
            name: 'plus.google.com'
        }, {
            id: 6,
            name: 'twitter.com'
        }];

    renderSearchUserBySocialPopup(avitoSocialInfo);

    $('#sh-loading-layer').show();
    avitoSocialInfo.forEach(function (prefix, iter, arr) {
        setTimeout(getSocialSearchResults, 250, prefix, socialId);
    });
}
function renderSearchUserBySocialPopup(avitoSocialInfo) {
    $('#search-user-by-social-popup').remove();

    $('#layer-blackout-popup').append('<div class="ah-default-popup" id="search-user-by-social-popup" style="min-width: 300px;"></div>');
    var popup = $('#search-user-by-social-popup');
    $(popup).append('<div class="ah-popup-container"></div>');
    var container = $(popup).find('.ah-popup-container');

    $(container).append('<div class="ah-popup-header" style="padding: 15px 0 10px 0;"></div>');
    $(container).append('<div class="ah-popup-body" style="padding-top: 0; border-bottom: none;"></div>');

    var header = $(popup).find('.ah-popup-header');
    var body = $(popup).find('.ah-popup-body');
    var footer = $(popup).find('.ah-popup-footer');

    $(header).append('<span class="ah-popup-title">Результаты поиска</span><button type="button" class="sh-default-btn ah-btn-small ah-popup-close">x</button>');
    $(body).append('<div class="search-user-by-social-container"><table class="ah-default-table"></table></div>');
    var searchTable = $(body).find('.search-user-by-social-container table');

    avitoSocialInfo.forEach(function (prefix) {
        $(searchTable).append('<tr class="ah-default-table-row" data-prefix-id="' + prefix.id + '"><td class="ah-default-table-td ah-default-table-td-label">' + prefix.name + '</td><td class="ah-default-table-td loading-indicator-text">Загрузка...</td></tr>');
    });

    // Обработчики
    var closeBtn = $(popup).find('.ah-popup-close');
    $(closeBtn).click(function () {
        $('#layer-blackout-popup').removeClass('ah-layer-flex');
        $('div.ah-default-popup').hide();
        closeModal();
    });
}
function getSocialSearchResults(prefix, socialId) {
    var url = 'https://adm.avito.ru/users/search?login=' + prefix.id + '_' + socialId;

    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.send(null);
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
            var popup = $('#search-user-by-social-popup');
            var body = $(popup).find('.ah-popup-body');
            var searchTable = $(body).find('.search-user-by-social-container table');

            var response = xhr.responseText;
            var alertWarninig = $(response).find('.alert-warning').text().toLowerCase();
            if (~alertWarninig.indexOf('пользователей не найдено')) {
                $(searchTable).find('[data-prefix-id="' + prefix.id + '"] td:eq(1)').html('<em>не найдено</em>').removeClass('loading-indicator-text');
            } else {
                var userId = $(response).find('.js-user-id').text();
                if (!userId)
                    userId = 'error';
                $(searchTable).find('[data-prefix-id="' + prefix.id + '"] td:eq(1)').html('<a target="_blank" class="ah-nocontent-default-link" href="https://adm.avito.ru/users/user/info/' + userId + '">' + userId + '</a>').removeClass('loading-indicator-text');
                $(searchTable).find('[data-prefix-id="' + prefix.id + '"] td:eq(0)').css('color', 'black');
                $(searchTable).find('[data-prefix-id="' + prefix.id + '"]').css('font-weight', '700');
            }

            var indicators = $(searchTable).find('.loading-indicator-text');
            if ($(indicators).length == 0) {
                $('#layer-blackout-popup').addClass('ah-layer-flex');
                showModal();

                $('#sh-loading-layer').hide();
            }
        }
    }
}
// Поиск по соцсети ---

// Копирование Email для ответа +++
function getMailForAnswer(email) {
    var emailName = email.split('@')[0];
    var pattern, resultStr;
    switch (emailName.length) {
        case 3:
            pattern = /\S{2}@/;
            resultStr = '**@';
            break;

        case 2:
            pattern = /\S{1}@/;
            resultStr = '*@';
            break;

        case 1:
            pattern = /@\S{3}/;
            resultStr = '@***';
            break;

        default:
            pattern = /\S{3}@/;
            resultStr = '***@';
    }
    var result = email.replace(pattern, resultStr);
    return result;
}
// Копирование Email для ответа ---

// Проверка премиум-юзера на странице шопа +++
function checkPremiumUsersShopInfo(html, script) {
    var allLabels = [];
    var blocks = $(html).find('h4:contains(Тариф подписки)').nextAll();
    for (var i = 0; i < $(blocks).length; i++) {
        var block = $(blocks).slice(i, i + 1);

        if ($(block)[0].nodeName === 'H4')
            break;

        var label = $(block).find('.control-label');
        if (!$(label).length)
            continue;
        allLabels.push($(label)[0]);
    }

    var verticalBlock = [].find.call(allLabels, 
    singleItem => singleItem.innerText === 'Вертикаль');
    var verticalValue = $(verticalBlock).next().text();

    var tariffPlanBlock = [].find.call(allLabels, 
    singleItem => singleItem.innerText === 'Тарифный план');
    var tariffPlanValue = $(tariffPlanBlock).next().text();

    var statusBlock = [].find.call(allLabels, 
    singleItem => singleItem.innerText === 'Статус');
    var statusValue = $(statusBlock).next().text();

    if (~verticalValue.indexOf('Realty')
            && ~tariffPlanValue.indexOf('Золото')
            && ~statusValue.indexOf('Оплачено')) {
        switch (script) {
            case 'support':
                var css = {'color': '#d9534f'};
                break;

            case 'traffic':
                var css = {'color': '#5cb85c', 
                    'font-weight': 'bold', 
                    'font-style': 'normal'
                };
                break;
        }

        var text = 'RE premium';
        premiumUsersIndicatorHandler(text, css);
    } else if (script === 'support') {
        var userId = getParamOnUserInfo('user-id');
        userId = userId || $('[href^="/users/user/info"]').text();
        checkPremiumUsersList(userId);
    } else {
        var css = {};
        var text = 'RE premium';
        premiumUsersIndicatorHandler(text, css);
    }
    
    // инфа о подписке
    if (script === 'support') {
        let reg = / $/;
        let subscrInfoText = statusValue.replace(reg, '') 
            +', '+ verticalValue.replace(reg, '') 
            +', '+ tariffPlanValue.replace(reg, '');
        
        let subscrIndicator = $('#statusSubscription');
        let isFired = $(subscrIndicator)[0].hasAttribute('fired');
        if (isFired) {
            $('#statusSubscription').html( '• Подписка: <br><span '+
            'style="font-size: 12px; color: #000; margin-left: 9px; font-weight: 400;">' 
            + subscrInfoText +'</span>');
        }
    }
}

function premiumUsersIndicatorHandler(text, css) {
    $('#REpremium span').removeClass('loading-indicator-text');
    $('#REpremium span').text(text);
    $('#REpremium').css(css);
}
// Проверка премиум-юзера на странице шопа ---

// jQuery case-insensitive +++
jQuery.extend(
        jQuery.expr[':'].containsCI = function (a, i, m) {
    //-- faster than jQuery(a).text()
    var sText = (a.textContent || a.innerText || "");
    var zRegExp = new RegExp(m[3], 'i');
    return zRegExp.test(sText);
}
);
// jQuery case-insensitive ---

// приклеивает fixed элемент к верхушке футера в БО +++
function setFixedElemUnderFooter(elem) {
    checkFooterVisibility(elem);
    $(document).scroll(function () {
        checkFooterVisibility(elem);
    });
}
function checkFooterVisibility(elem) {
    var footerHeight = $('footer').outerHeight() + 2;
    var scrollTop = $(window).scrollTop();
    var windowHeight = $(window).height();
    var offset = $('.js-footer-gotop').offset();
    var bottomValue = (windowHeight + scrollTop + 2) - offset.top;

    var isFooterVisible = isInWindow('.js-footer-gotop', footerHeight);
    if (isFooterVisible) {
        $(elem).css('bottom', '' + bottomValue + 'px');
    } else {
        $(elem).css('bottom', '2px');
    }
}
// приклеивает fixed элемент к верхушке футера в БО ---

// проверяет, виден ли элемент +++
function isInWindow(elem, err) {
    err = err || 0;
    var scrollTop = $(window).scrollTop();
    var windowHeight = $(window).height();
    var el = $(elem);
    var result = false;
    var offset = el.offset();
    if (scrollTop <= offset.top && ((el.height() - err) + offset.top) < (scrollTop + windowHeight)) {
        result = true;
    } else {
        result = false;
    }

    return result;
}
// проверяет, виден ли элемент ---

// дополнения к операциям резервирования ---
function reservedOperation(route) {
    var toDay = new Date();

    var day = toDay.getDate().toString();
    day = (day.length == 1) ? '0' + day : day;
    var month = (toDay.getMonth() + 1).toString();
    month = (month.length == 1) ? '0' + month : month;

    toDay = day + '/' + month + '/' + toDay.getFullYear();

    var elems;
    switch (route) {
        case '/users/account/info':
            elems = $('table.account-history tr[data-oid]');
            break;

        case '/billing/walletlog':
            elems = $('table.table-striped tr');
            break;
    }

    $(elems).each(function (i, elem) {
        var rowText = $(elem).text();
        if (rowText.indexOf('Резервирование средств') == -1)
            return;

        $(elem).hide();
        addBindedWLLink(elem, toDay, route);
        $(elem).addClass('table-background-highlight');
    });

    toggleReservedOperations(route); // переключатель отображения резервированных
}

function addBindedWLLink(elem, toDay, route) {
    var block, decrcText, operationId, newLinkText, dateStart;

    switch (route) {
        case '/users/account/info':
            block = $(elem).find('td:eq(1)');
            decrcText = $(elem).find('td:eq(1) a[href^="/items/item/info"]').text();
            operationId = decrcText.split('(');
            operationId = operationId[1].split(')')[0];
            operationId = +operationId.replace(/\D/g, '');
            newLinkText = isFinite(operationId) ? 'ID операции' : 'error';
            dateStart = $(elem).find('td').find('[href^="/billing/walletlog"]').attr('href').split('&date=');
            dateStart = dateStart[1].split(' ')[0];
            $(block).find('a[href^="/items/item/info"]').after(' | <a target="_blank" href="https://adm.avito.ru/billing/walletlog/?operationIds=' + operationId + '&date=' + dateStart + '%2000:00+-+' + toDay + '%2023:59&operationStatusIds%5B%5D=0&operationStatusIds%5B%5D=1&operationStatusIds%5B%5D=2&operationStatusIds%5B%5D=3&operationStatusIds%5B%5D=4" title="Переход в Wallet Log на операцию, для которой было резервирование">' + newLinkText + '</a>');
            break;

        case '/billing/walletlog':
            block = $(elem).find('td:contains(Резервирование средств)');
            decrcText = $(block).text();
            operationId = decrcText.split('(');
            operationId = operationId[1].split(')')[0];
            operationId = +operationId.replace(/\D/g, '');
            newLinkText = isFinite(operationId) ? 'ID операции' : 'error';
            dateStart = $(elem).find('td:eq(2)')[0].childNodes[4].nodeValue.replace(/^\s+/, '');
            dateStart = dateStart.split(' ')[0];
            $(block).append(' | <a target="_blank" href="https://adm.avito.ru/billing/walletlog/?operationIds=' + operationId + '&date=' + dateStart + '%2000:00+-+' + toDay + '%2023:59&operationStatusIds%5B%5D=0&operationStatusIds%5B%5D=1&operationStatusIds%5B%5D=2&operationStatusIds%5B%5D=3&operationStatusIds%5B%5D=4" title="Переход в Wallet Log на операцию, для которой было резервирование">' + newLinkText + '</a>');
            break;
    }
}

function toggleReservedOperations(route) {
    var isCheckedAttr;
    var rows = $('table .table-background-highlight');
    var lsItem = 'reservedOperations';
    var lsObj = JSON.parse(localStorage.getItem(lsItem));

    // if (lsObj && lsObj.visibility == 'hidden') {
    if (lsObj && lsObj[route] === 'hidden') {
        $(rows).hide();
        isCheckedAttr = '';
    } else {
        $(rows).show();
        isCheckedAttr = 'checked';
    }

    var block;
    switch (route) {
        case '/users/account/info':
            block = $('#history')
            break;

        case '/billing/walletlog':
            block = $('.billing-walletlog-result')
            break;
    }

    $(block).append(''+
            '<div class="ah-switch-wrapper" style="float: right; margin-left: 10px;"><input type="checkbox" class="ah-switch-checkbox" id="reserved-operations-toogler" ' + isCheckedAttr + '><label class="ah-switch-label" for="reserved-operations-toogler" title="Переключает режим отображения операций \'Резервирование средств...\'"><span>Показывать резервирование</span></label>'+
            '</div>');

    var switcher = $('#reserved-operations-toogler');

    $(switcher).click(function () {
        var lsItem = 'reservedOperations';
        if (!localStorage.getItem(lsItem)) {
            localStorage.setItem(lsItem, '{"' + route + '": "visible"}');
        }

        var lsObj = JSON.parse(localStorage.getItem(lsItem));

        if (document.getElementById('reserved-operations-toogler').checked) {
            lsObj[route] = 'visible';
            $(rows).show();
        } else {
            lsObj[route] = 'hidden';
            $(rows).hide();
        }
        localStorage.setItem(lsItem, JSON.stringify(lsObj));
    });

}

// дополнения к операциям резервирования +++

// удаление элемента массива по названию ---
Array.prototype.remove = function (value) {
    var idx = this.indexOf(value);
    if (idx != -1) {
        return this.splice(idx, 1);
    }
    return false;
}
// удаление элемента массива по названию +++

// склонение числительных ---
function declensionOfNumerals(number, titles) {
    cases = [2, 0, 1, 1, 1, 2];
    return titles[(number % 100 > 4 && number % 100 < 20) ? 2 : cases[(number % 10 < 5) ? number % 10 : 5]];
}
// склонение числительных +++

// скролл до элемента ---
function scrollToElem(elem) {
    var navbarHeight = $('div.navbar-fixed-top').height();
    if (!navbarHeight) {
        navbarHeight = 50;
    }

    var scrollPos = $(elem).offset().top - navbarHeight - 10;
    $('html, body').animate({scrollTop: scrollPos}, 100);
}
// скролл до элемента +++



// BANANA

function banana() {
    if (!localStorage.banana) localStorage.banana = 0;
    $('body').append('<div class="banana banana-animation"><img src="http://animagehub.com/wp-content/uploads/2016/11/Banana-vector-14.png" width="30" height="30" title="SPY BANANA"></div>');

    let pageHeight = $(window).height();
    let pageWidth = $(window).width();

    $('.banana').click(function () {
        let bananaCount = localStorage.banana;

        if ($('#bananaCount').length === 0) {
            $('.statShow').append('<div style="color: #ffa900">Bananas found: <span id="bananaCount">'+bananaCount+'</span></div>');
        }

        bananaCount = parseInt(bananaCount)+1;
        localStorage.banana = bananaCount;
        $('#bananaCount').text(bananaCount);

        let randomBottom = getRandomArbitary(10, pageHeight-35);
        let randomRight = getRandomArbitary(10, pageWidth-35);

        $('.banana').css({bottom: randomBottom, right: randomRight});
    });
}

function getRandomArbitary(min, max) {
    return Math.random() * (max - min) + min;
}

// BANANA

// инструменты справа внизу (настройки в HD, кнопка вверх) ---
function addFixedTools(elem, tools) {
    if ($('#ah-fixed-tools-holder').length > 0)
        return;

    $(elem).append('<div id="ah-fixed-tools-holder"></div>');
    let holder = $('#ah-fixed-tools-holder');
    setFixedElemUnderFooter(holder);
    
    if (~tools.indexOf('hd-settings')) {
        addHdSettings();
    }
    
    if (~tools.indexOf('scroll-top')) {
        addScrollTopBtn();
    }
}
// инструменты справа внизу (настройки в HD, кнопка вверх) +++

// показывать/скрывать настройки HD+++
function addHdSettings() {
    let holder = $('#ah-fixed-tools-holder');

    $(holder).append('<div class="hd-global-settings-wrapper"></div>');

    $(holder).append(''+
        '<button type="button" '+
        'class="sh-default-btn sh-settings-btn-bottom-right" '+
        'id="sh-settings-bottom-right-btn">Настройки'+
        '</button>');

    $('#sh-settings-bottom-right-btn').click(function() {
        $('div.hd-global-settings-wrapper').toggle();
        $(this).toggleClass('sh-active-btn');
    });
}
// показывать/скрывать настройки HD ---

// кнопка вверх ---
function addScrollTopBtn() {
    let holder = $('#ah-fixed-tools-holder');
    $(holder).append('' +
        '<button type="button" ' +
        'class="sh-default-btn" id="ah-scrolltop-btn" ' +
        'title="Прокрутить страницу вверх">↑' +
        '</button>');

    $('#ah-scrolltop-btn').click(function () {
        $('html, body').animate({scrollTop: 0}, 100);
    });
}
// кнопка вверх +++

// Копирование с тултипом ---
function copyDataTooltip(targets, options) {
    options = options || {};
    let targetClass = options.targetClass || 'ah-copy-tooltip-pseudo-link',
        placement = options.placement || 'top',
        title = options.title || '<div>Клик - скопировать</div>',
        template = options.template || '<div class="tooltip ah-copy-tooltip"><div class="tooltip-arrow"><div class="ah-tooltip-arrow-inner"></div></div><div class="tooltip-inner"></div></div>',
        container = options.container || 'body',
        getText = options.getText || function(target) {return $(target).text().trim()},
        getTextAlt = options.getTextAlt || getText,
        getNotification = options.getNotification || function(text) {return `Скопировано: ${text}`},
        getNotificationAlt = options.getNotificationAlt || getNotification;

    $(targets).addClass(targetClass);
    $(targets).tooltip({
        html: true,
        delay: {show: 20},
        trigger: 'hover',
        container: container,
        template: template,
        placement: placement,
        title: title
    });

    $(targets).click(function(e) {
        let text,
            notification;

        if (e.altKey) {
            text = getTextAlt($(this));
            notification = getNotificationAlt(text);
        } else {
            text = getText($(this));
            notification = getNotification(text);
        }

        chrome.runtime.sendMessage({action: 'copyToClipboard', text: text});
        outTextFrame(notification);
        e.stopPropagation();
    });
}
// Копирование с тултипом +++

// Поповер на ховере
function createNotHidingPopover(target, content, options) {
    options = options || {};
    let targetClass = options.targetClass || 'ah-not-hiding-popover-pseudo-link',
        placement = options.placement || 'right',
        onShownFunc = options.onShownFunc || function() {},
        template = options.template || `<div class="popover ah-not-hiding-popover"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>`,
        container = options.container || 'body';

    $(target).addClass(targetClass);
    $(target).popover({
        animation: false,
        html: true,
        trigger: 'manual',
        container: container,
        placement: placement,
        content: content,
        template: template
    }).unbind('shown.bs.popover').on('shown.bs.popover', onShownFunc
    ).on("mouseenter", function () {
        let _this = this;
        $(this).popover("show");
        $(".popover").on("mouseleave", function () {
            $(_this).popover('hide');
        });
    }).on("mouseleave", function () {
        let _this = this;

        if (!$(".popover:hover").length) {
            $(_this).popover("hide");
        }
    });
}

// Баттон лоадер
function btnLoaderOn(btn) {
    $(btn).prop('disabled', true).addClass('ah-btn-loader');
}
function btnLoaderOff(btn) {
    $(btn).prop('disabled', false).removeClass('ah-btn-loader');
}

function addInfoDocQueueLink(target) {
    $(target).append(`<a class="ah-infodoc-queue-link" target="_blank" href="https://adm.avito.ru/helpdesk?fid=841&fname=%D0%94%D0%BE%D0%BA%D1%83%D0%BC%D0%B5%D0%BD%D1%82%D0%BE%D0%BE%D0%B1%D0%BE%D1%80%D0%BE%D1%82&limit=30&p=1&sortField=reactionTxtime&sortType=asc">Очередь "Документооборот"</a>`);
}

// линк на ВЛ для юзера (фильтры: последние полгода, айди юзера, все статусы)
function getWlLinkForUser(userId) {
    let maxDate = currentTime().split(' ')[0];
    maxDate = maxDate.replace(/\./g, '/');
    let today = new Date();
    let sixMonthAgoMs = today.setMonth(today.getMonth() - 6);
    let sixMonthAgo = new Date(sixMonthAgoMs);
    let minDate = sixMonthAgo.toLocaleString("ru", {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
    });
    minDate = minDate.replace(/\./g, '/');

    let dateRange = `${minDate}+00:00+-+${maxDate}+23:59`;

    return `/billing/walletlog?date=${dateRange}&userIds=${userId}&operationStatusIds%5B%5D=0&operationStatusIds%5B%5D=1&operationStatusIds%5B%5D=2&operationStatusIds%5B%5D=3&operationStatusIds%5B%5D=4`;

}

// имя пользователя
function getUserNameTamplate(text) {
    let splitted = text.split(' ');
    let res = [];
    splitted.forEach((item) => {
        res.push( item[0].toUpperCase() + item.slice(1).toLowerCase() );
    });

    return res.join(' ');
}

// контент для тултипа с сльтернативным копированием
function getCopyTooltipContentAlt(altText) {
    return `<ul><li>Клик - скопировать</li><li><kbd>Alt</kbd> + Клик - ${altText}</li></ul>`;
}

// параметры на странице айтема
function getParamsItemInfo(html) {
    let searchNode = html || $('html'),
        res = {},
        itemForm = $(searchNode).find('#form_item'),
        allLabels = $(itemForm).find('.control-label'),
        userLabel = [].find.call(allLabels, singleLabel => singleLabel.firstChild.data === 'Пользователь'),
        userBlock = $(userLabel).next(),
        userLink = $(userBlock).find('[href^="/users/user/info/"]'),
        statusLabel = [].find.call(allLabels, singleLabel => singleLabel.firstChild.data === 'Статус'),
        statusBlock = $(statusLabel).next(),
        reasons = [],
        timeLabel = [].find.call(allLabels, singleLabel => singleLabel.firstChild.data === 'Время'),
        timeBlock = $(timeLabel).next(),
        microCategoryLabel = [].find.call(allLabels, singleLabel => singleLabel.firstChild.data === 'Микрокатегория'),
        microCategoryBlock = $(microCategoryLabel).next(),
        microCategories = [];

    $(searchNode).find('.reasons span[data-id]').each(function () {
        reasons.push($(this).text());
    });
    $(microCategoryBlock).find('[data-toggle="tooltip"]:not(.icon-category-suggest)').each(function () {
        microCategories.push($(this).text().replace(/\n/g, '').trim());
    });

    res.id = $(itemForm).attr('data-item-id');
    res.userId = $(userLink).attr('href').replace(/\D/g, '');
    res.userLogin = $(userLink).text();
    res.userMail = $(userBlock).find('.js-autoselect ').text();
    res.userItems = $(userBlock).find('[href^="/items/search"]').text().split(' ')[0];
    res.ip = $(searchNode).find('.ip-info').text();
    res.status = $(statusBlock).find('span:eq(0)').text().trim();
    res.reasons = reasons;
    res.sortTime = $(timeBlock).find('span:eq(0)').text().trim();
    res.sellerName = $(searchNode).find('#fld_seller_name').val();
    res.manager = $(searchNode).find('#fld_manager').val();
    res.phone = $(searchNode).find('#fld_phone').val();
    res.region = $(searchNode).find('#region').find('option:selected').text();
    res.microCategoryes = microCategories;
    res.title = $(searchNode).find('#fld_title').val();
    res.description = $(searchNode).find('#fld_description').text();
    res.price = $(searchNode).find('#fld_price').val();
    res.photos = $(searchNode).find('.js-photo-component').data('json');

    return res;
}

// сравнение айтемов
function ahCompareItems(items) {
    items = unique(items);
    if (items.length === 1) {
        alert('В сравнении должно участвовать более одного объявления');
        return;
    }

    addCompareItemsModal();
    let modal = $('#ahCompareItemsModal'),
        itemsContainer = $(modal).find('.ah-compare-items-container'),
        itemsRows = $(itemsContainer).find('.ah-compare-items-row[data-row-name]');

    $(itemsRows).find('.ah-compare-items-cell').remove();
    items.forEach((id) => {
        $(itemsRows).append(`
            <div class="ah-compare-items-cell" data-item-id="${id}"></div>
        `);

        getItemInfo(id).then(
            response => renderCompareItemsItem(response),
            error => console.log(error)
        );
    });

    $(modal).modal('show').on('hidden.bs.modal', function() {
        $(modal).modal('hide');
    });
    $(modal).find('.ah-overlay').show();
}

function addCompareItemsModal() {
    if ($('#ahCompareItemsModal').length !== 0) return;

    $('body').append(`
        <div class="modal fade ah-dynamic-bs-modal ah-compare-items-modal" id="ahCompareItemsModal" tabindex="-1" role="dialog">
            <div class="modal-dialog modal-lg" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                        <h4 class="modal-title">Сравнение объявлений</h4>
                    </div>
                    <div class="modal-body">
                        <div class="ah-compare-items-container">
                            <div class="ah-compare-items-row" data-row-name="id_title"></div>
                            <div class="ah-compare-items-row" data-row-name="status_reasons"></div>
                            <div class="ah-compare-items-row" data-row-name="sortTime"></div>
                            <div class="ah-compare-items-row" data-row-name="photos"></div>
                            <div class="ah-compare-items-row ah-compare-items-show-more">
                                <span class="ah-compare-items-more-text">
                                    Фото <span class="glyphicon glyphicon-collapse-down"></span>
                                </span>
                            </div>
                            <div class="ah-compare-items-row" data-row-name="microCategory"></div>
                            <div class="ah-compare-items-row ah-compare-items-row-description" data-row-name="description"></div>
                            <div class="ah-compare-items-row ah-compare-items-show-more">
                                <span class="ah-compare-items-more-text">
                                    Описания <span class="glyphicon glyphicon-collapse-down"></span>
                                </span>
                            </div>
                            <div class="ah-compare-items-row" data-row-name="region"></div>
                            <div class="ah-compare-items-row" data-row-name="price_phone"></div>
                            <div class="ah-compare-items-row" data-row-name="sellerName"></div>
                            <div class="ah-compare-items-row" data-row-name="ip"></div>
                            <div class="ah-compare-items-row" data-row-name="user"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `);
}

function renderCompareItemsItem(response) {
    let item = getParamsItemInfo(response),
        modal = $('#ahCompareItemsModal'),
        cell = `[data-item-id="${item.id}"]`,
        mainPhoto = '',
        prevPhotos = '',
        reasons = '',
        statusPatterns = {
            blocked: /\bblocked\b/i,
            rejected: /\brejected\b/i,
            paid: /\bpaid\b/i,
            active: /\b(added|activated|unblocked)\b/i,
            closed_removed: /\b(removed|closed)\b/i,
            vas: /\b(premium|vip|pushed up|highlighted)\b/i
        };

    console.log(item);

    item.photos.forEach(function(photo) {
        prevPhotos += `
            <div class="ah-photo-prev-wrap">
                <img class="ah-photo-prev-img" src="${photo.thumbUrl}" data-original-image="${photo.url}">
            </div>
        `;
    });

    if (item.photos.length !== 0) {
        mainPhoto = `
            <a style="background-image: url(${item.photos[0].url});" target="_blank" href="${item.photos[0].url}" 
                class="ah-photo-link">
            </a>
        `;
    } else {
        mainPhoto = `<div class="text-muted">Нет Фото</div>`;
    }

    if (item.reasons.length !== 0) {
        reasons = `(${item.reasons.join(', ')})`
    }

    if (statusPatterns.blocked.test(item.status)) {
        item.status = item.status.replace(statusPatterns.blocked, `
            <span class="text-danger" title="${reasons}">
                $& <span class="glyphicon glyphicon-info-sign ah-compare-items-reason-tooltip" title="${reasons}"></span>
            </span>`);
    }
    if (statusPatterns.rejected.test(item.status)) {
        item.status = item.status.replace(statusPatterns.rejected, `
            <span class="text-warning">
                $& <span class="glyphicon glyphicon-info-sign ah-compare-items-reason-tooltip" title="${reasons}"></span>
            </span>`);
    }
    if (statusPatterns.paid.test(item.status)) {
        item.status = item.status.replace(statusPatterns.paid, '<span class="text-primary">$&</span>');
    }
    if (statusPatterns.active.test(item.status)) {
        item.status = item.status.replace(statusPatterns.active, '<span class="text-success">$&</span>');
    }
    if (statusPatterns.closed_removed.test(item.status)) {
        item.status = item.status.replace(statusPatterns.closed_removed, '<span class="text-muted">$&</span>');
    }
    if (statusPatterns.vas.test(item.status)) {
        item.status = item.status.replace(statusPatterns.vas, '<span class="ah-text-vas">$&</span>');
    }

    // id & title
    $(modal).find(`[data-row-name="id_title"] ${cell}`).append(`
        ${item.id}, <a target="_blank" href="/items/item/info/${item.id}">${item.title}</a>
    `);

    // status & reasons
    $(modal).find(`[data-row-name="status_reasons"] ${cell}`).append(`
        <span class="ah-compare-items-status">${item.status}</span>
    `);

    // description
    $(modal).find(`[data-row-name="description"] ${cell}`).append(`
        <div class="ah-compare-items-cell-description">${item.description}</div>
    `);

    // photos
    $(modal).find(`[data-row-name="photos"] ${cell}`).append(`
        <div class="ah-compare-items-photo-main">
            ${mainPhoto}
        </div>
        <div class="ah-compare-items-photo-prev">
            ${prevPhotos}
        </div>
    `);

    // microCategory
    $(modal).find(`[data-row-name="microCategory"] ${cell}`).append(`
        <i>${item.microCategoryes.join(' / ')}</i>
    `);

    // region
    $(modal).find(`[data-row-name="region"] ${cell}`).append(`
        <span class="ah-compare-items-label">Город:</span> ${item.region}
    `);

    // price & phone
    $(modal).find(`[data-row-name="price_phone"] ${cell}`).append(`
        <span class="ah-compare-items-label">Цена:</span> ${item.price},
        <span class="ah-compare-items-label">Тел.:</span> ${item.phone}
    `);

    // sellerName
    $(modal).find(`[data-row-name="sellerName"] ${cell}`).append(`
        <span class="ah-compare-items-label">Название:</span> ${item.sellerName}
    `);

    // sortTime
    $(modal).find(`[data-row-name="sortTime"] ${cell}`).append(`
        <span title="Sort Time">${item.sortTime}</span> 
    `);

    // ip
    $(modal).find(`[data-row-name="ip"] ${cell}`).append(`
        <span class="ah-compare-items-label">IP:</span> ${item.ip}
    `);

    // user
    $(modal).find(`[data-row-name="user"] ${cell}`).append(`
        <span class="ah-compare-items-label">Пользователь:</span> 
        <a target="_blank" href="/users/user/info/${item.userId}">${item.userLogin}</a> 
        (${item.userMail}) 
        <a target="_blank" href="/items/search?user_id=${item.userId}">${item.userItems}</a> 
    `);

    $(modal).find(`${cell} .ah-compare-items-reason-tooltip`).tooltip({placement: 'bottom'});
}