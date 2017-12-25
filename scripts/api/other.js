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
    $('body').css('padding-right', 'unset');
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
function setFixedElemUnderFooter(elem, indent) {
    checkFooterVisibility(elem, indent);
    $(document).scroll(function () {
        checkFooterVisibility(elem, indent);
    });
}
function checkFooterVisibility(elem, indent) {
    var footerHeight = $('footer').outerHeight() + indent;
    var scrollTop = $(window).scrollTop();
    var windowHeight = $(window).height();
    var offset = $('.js-footer-gotop').offset();
    var bottomValue = (windowHeight + scrollTop + indent) - offset.top;

    var isFooterVisible = isInWindow('.js-footer-gotop', footerHeight);
    if (isFooterVisible) {
        $(elem).css('bottom', '' + bottomValue + 'px');
    } else {
        $(elem).css('bottom', indent + 'px');
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
    setFixedElemUnderFooter(holder, 2);
    
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
        $(".ah-not-hiding-popover").unbind('mouseleave').on("mouseleave", function () {
            $(_this).popover('hide');
        });
    }).on("mouseleave", function () {
        let _this = this;
        if (!$(".ah-not-hiding-popover:hover").length) {
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

// валлет лог с фильтрами для сверки с документами + текущий пользователь _
function getWlLinkForDocuments(userId) {
    let maxDate = currentTime().split(' ')[0];
    maxDate = maxDate.replace(/\./g, '/');
    let today = new Date();
    let firstDayMs = today.setDate(1);
    let firstDay = new Date(firstDayMs);
    let minDate = firstDay.toLocaleString("ru", {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
    });
    minDate = minDate.replace(/\./g, '/');

    let dateRange = `${minDate}+00:00+-+${maxDate}+23:59`;

    return `/billing/walletlog?date=${dateRange}&userIds=${userId}&itemIds=&payerCode=&operationIds=&orderIds=&serviceTransactionIds=&externalIds=&fiscalIds=&payCode=0&personType=0&accountType=0&legalEntityIds%5B%5D=0&operationStatusIds%5B%5D=1&paymentMethodIds%5B%5D=0&userTypes%5B%5D=&operationTypeIds%5B%5D=vas_vip&operationTypeIds%5B%5D=vas_highlight&operationTypeIds%5B%5D=vas_pushup&operationTypeIds%5B%5D=vas_premium&operationTypeIds%5B%5D=vas_activation&operationTypeIds%5B%5D=vas_fast&operationTypeIds%5B%5D=vas_turbo&operationTypeIds%5B%5D=lf_single&operationTypeIds%5B%5D=lf_package_writeoff&operationTypeIds%5B%5D=lf_package_extrawriteoff&operationTypeIds%5B%5D=lf_package_burn&operationTypeIds%5B%5D=promo_writeoff&operationTypeIds%5B%5D=context_writeoff&operationTypeIds%5B%5D=shop_tariff_writeoff&operationTypeIds%5B%5D=shop_extension_writeoff&operationTypeIds%5B%5D=cv_single_view&operationTypeIds%5B%5D=cv_package_writeoff&operationTypeIds%5B%5D=cv_package_expired&operationTypeIds%5B%5D=cv_package_extra_writeoff&operationTypeIds%5B%5D=srf_single_placement&operationTypeIds%5B%5D=subscription_writeoff&operationTypeIds%5B%5D=subscription_extra_writeoff&operationTypeIds%5B%5D=vas_domofond&operationTypeIds%5B%5D=subscription_extension_writeoff&operationTypeIds%5B%5D=subscription_extension_extra_writeoff`;
}

// имя пользователя
function getUserNameTamplate(text) {
    let splitted = text.trim().split(' ');
    let res = [];
    splitted.forEach((item) => {
        if (!item[0]) return;
        res.push( item[0].toUpperCase() + item.slice(1).toLowerCase() );
    });

    return res.join(' ');
}

function parseDateToSearchFormat(date) {
    return encodeURIComponent(
            (date.getDate() < 10 ? '0' : '') + date.getDate() + "/" +
            ((date.getMonth() + 1) < 10 ? '0' : '') + (date.getMonth() + 1) + "/" +
            date.getFullYear()
        ) + '+' + encodeURIComponent(
            (date.getHours() < 10 ? '0' : '') + date.getHours() + ":" +
            (date.getMinutes() < 10 ? '0' : '') + date.getMinutes()
        );
}

// контент для тултипа с сльтернативным копированием
function getCopyTooltipContentAlt(altText) {
    return `<ul><li>Клик - скопировать</li><li><kbd>Alt</kbd> + Клик - ${altText}</li></ul>`;
}

// поповер для ip
function showIpInfoPopover(target, response, options) {
    options = options || {};
    let container = options.container || 'body';
    let placement = options.placement || 'top';

    $(target).popover({
        html: true,
        container: container,
        placement: placement,
        content: response,
        template: `
            <div class="popover ah-ip-info-popover ah-popover-destroy-outclicking">
                <div class="arrow"></div>
                <div class="popover-content"></div>
            </div>`
    }).popover('show');
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

    const entityMap = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': '&quot;',
        "'": '&#39;',
        "/": '&#x2F;'
    };

    $(searchNode).find('.reasons span[data-id]').each(function () {
        reasons.push( $(this).text().replace(/[&<>"'\/]/g, s => entityMap[s]) );
    });
    $(microCategoryBlock).find('[data-toggle="tooltip"]:not([class*="icon-category-suggest"])').each(function () {
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
    res.updateTime = $(timeBlock).find('span:eq(1)').text().trim();
    res.startTime = $(timeBlock).find('span:eq(2)').text().trim();
    res.finishTime = $(timeBlock).find('span:eq(3)').text().trim();
    res.sellerName = $(searchNode).find('#fld_seller_name').val();
    res.manager = $(searchNode).find('#fld_manager').val();
    res.phone = $(searchNode).find('#fld_phone').val();
    res.region = $(searchNode).find('#region').find('option:selected').text();
    res.microCategoryes = microCategories;
    res.title = $(searchNode).find('#fld_title').val();
    res.description = $(searchNode).find('#fld_description').text();
    res.price = $(searchNode).find('#fld_price').val();
    res.photos = $(searchNode).find('.js-photo-component').data('json');
    res.comparisonLink = $(searchNode).find('a[href^="/items/comparison"]').attr('href') || null;
    res.activeVAS = [].map.call($(searchNode).find('.paid-services .btn-warning'), item => {
        const res = {};
        const $item = $(item);
        res.name = $item.text().trim();
        res.expires = $item.attr('title') || null;
        return res;
    });
    res.siteLink = $(searchNode).find('a[href^="https://www.avito.ru/"]').attr('href');

    return res;
}

// параметры на странице шопа
function getParamsShopInfo(html) {
    let searchNode = html || $('html');

    let res = {};
    res.extensions = [];
    res.subscription = {};

    const allHeaders = searchNode.find('h4');
    const allFormGroups = searchNode.find('.form-group');
    const allLabels = searchNode.find('.control-label');

    const extensionsHeader = [].find.call(allHeaders, singleItem => singleItem.textContent === 'Расширения');
    const subscriptionHeader = [].find.call(allHeaders, singleItem => singleItem.textContent === 'Тариф подписки');


    // extensions
    const allExtensionsGroups = getFormGroups(extensionsHeader, 'H4');
    const extensions = [];
    allExtensionsGroups.forEach((item) => {
        const allLabels = item.querySelectorAll('.control-label');
        const nameLabel = [].find.call(allLabels, single => single.textContent === 'Название');
        if (!nameLabel) return;

        extensions.push({
            name: nameLabel.nextElementSibling.textContent
        });
    });
    res.extensions = extensions;

    // subscription tariff
    const allSubscriptionGroups = getFormGroups(subscriptionHeader, 'H4');
    if (!allSubscriptionGroups.length) {
        res.subscription = null;
    } else {
        allSubscriptionGroups.forEach((item) => {
            const label = item.querySelector('.control-label');
            if (!label) return;

            const labelName = label.textContent;
            if (labelName === 'Статус') {
                res.subscription.status = label.nextElementSibling.textContent.trim();
            }
            if (labelName === 'Вертикаль') {
                res.subscription.vertical = label.nextElementSibling.textContent.trim();
            }
            if (labelName === 'Тарифный план') {
                res.subscription.tariffPlan = label.nextElementSibling.textContent.trim();
            }
        });
    }

    // main (top) info
    res.mainInfo = {};
    const allMainGroups = getFormGroups(allFormGroups[0], 'H4');
    allMainGroups.forEach(item => {
        const label = item.querySelector('.control-label');

        if (label && label.textContent === 'Тариф') {
            res.mainInfo.tariff = label.nextElementSibling.textContent.trim();
        }

        if (label && label.textContent === 'Пользователь') {
            const field = label.nextElementSibling;
            const userLink = field.querySelector('a[href^="/users/user/info/"]');

            res.mainInfo.userId = userLink.getAttribute('href').replace(/\D/g, '');
        }
    });

    // personal manager
    const personalManagerLabel = [].find.call(allLabels, label => label.textContent === 'Personal manager');
    try {
        res.personalManager = personalManagerLabel.nextElementSibling.querySelector('.help-block').firstChild.textContent.trim();
    } catch (e) {
        res.personalManager = null;
    }

    // comments
    res.commentsTable = searchNode.find('#dataTable')[0] || null;

    // возвращает все .form-groups от startNode и далее, пока не встретит тег с именем breakTagName
    function getFormGroups(startNode, breakTagName) {
        const groups = [];

        do {
            if (!startNode) break;

            if (startNode.classList.contains('form-group')) {
                groups.push(startNode);
            }
            startNode = startNode.nextElementSibling;
        } while (startNode && startNode.nodeName !== breakTagName);

        return groups;
    }

    return res;
}

function getParamsUserInfo(html) {
    let searchNode = html || $('html');

    let res = {};

    let activeLFPackagesTable = searchNode.find('.fees-packages-active_content .table');
    let expiredLFPackagesTable = searchNode.find('.fees-packages-expired_content .table');
    let activeCVPackagesTable = searchNode.find('h4:contains(Купленные и активные пакеты просмотров)').next();
    let expiredCVPackagesTable = searchNode.find('h4:contains(Истёкшие, завершённые и отменённые пакеты просмотров)')
        .next().find('.table');
    const $companyInfoForm = searchNode.find('#company-info');

    res.activeLFPackagesTableHtml = (activeLFPackagesTable.length) ? activeLFPackagesTable[0].outerHTML : null;
    res.expiredLFPackagesTableHtml = (expiredLFPackagesTable.length) ? expiredLFPackagesTable[0].outerHTML : null;
    res.activeCVPackagesTableHtml = (activeCVPackagesTable.length) ? activeCVPackagesTable[0].outerHTML : null;
    res.expiredCVPackagesTableHtml = (expiredCVPackagesTable.length) ? expiredCVPackagesTable[0].outerHTML : null;

    res.companyInfo = ($companyInfoForm.length) ? {} : null;
    if (res.companyInfo) {
        const $labels = $companyInfoForm.find('.control-label');
        const $nameLabel = $labels.filter(function(){
            return this.textContent === 'Название компании';
        });
        const $innLabel = $labels.filter(function(){
            return this.textContent === 'ИНН';
        });
        const $legalAddressLabel = $labels.filter(function(){
            return this.textContent === 'Юридический адрес';
        });

        res.companyInfo.name = $nameLabel.next().find('[name="companyName"]').val() || null;
        res.companyInfo.inn = $innLabel.next().find('[name="inn"]').val() || null;
        res.companyInfo.legaAddress = $legalAddressLabel.next().find('[name="legalAddress"]').val() || null;
    }

    return res;
}

// получить оставшийся скролл справа
function getScrollSizeRight(elem) {
    return elem.scrollWidth - elem.scrollLeft - elem.clientWidth;
}

/*
* Сравнение объявлений.
* @param ids - массив id сущностей (0й элемент - опорная сущность)
* @param {functions} - объект функций:
    - getEntityRequest: запрсо на инфо о сущности,
    - getEntityParams: получение параметров сущности по результатам запроса getEntityRequest,
    - renderEntities: отрисовка всех сущностей, когда все запросы завершены,
    - [callback]
* @param {modalOpts} - объект параметров модального окна:
    - title: тайтл модального окна
 */
function ahComparison(ids, functions, modalOpts) {
    let callback = functions.callback || function() {};
    // чтобы сохранить опорную сущность первой, используется медленный способ отброса дубликатов
    let unique = [], k = 0;
    for (let i = 0; i < ids.length; i++) {
        let j = 0;
        while (j < k && unique[j] !== ids[i]) j++;
        if (j === k) unique[k++] = ids[i];
    }

    if (unique.length === 1) {
        alertMoreThanOne();
        callback();
        return;
    }

    const MAX_COUNT = 10;
    if (unique.length > MAX_COUNT) {
        alert(`Нельзя сравнивать более ${MAX_COUNT}`);
        callback();
        return;
    }

    let doneRequestsCount = 0;
    let parsedEntities = {};
    unique.forEach((id) => {
        parsedEntities[`id${id}`] = null; // хак с нечисловой строкой, чтобы сохранить порядок

        functions.getEntityRequest(id)
            .then(
                response => parsedEntities[`id${id}`] = functions.getEntityParams(response),
                error => {
                    alert(`Ошибка для №${id}: \n${error.status}\n${error.statusText}`);
                    delete parsedEntities[`id${id}`];
                }
            ).then(
                () => {
                    doneRequestsCount++;
                    if (unique.length === doneRequestsCount) { // все запросы завершены
                        if (Object.keys(parsedEntities).length === 1) {
                            alertMoreThanOne();
                            callback();
                            return;
                        }
                        renderComparisonModal(modalOpts);
                        functions.renderEntities(parsedEntities);
                        let modal = $('.ah-compare-modal');
                        $(modal).modal('show');
                        callback();
                    }
                }
        );
    });

    function alertMoreThanOne() {
        alert('В сравнении должно участвовать более одной сущности');
    }
}

function renderComparisonModal(modalOpts) {
    $(`.ah-compare-modal`).remove();

    $('body').append(`
        <div class="modal ah-dynamic-bs-modal ah-compare-modal" tabindex="-1" role="dialog">
            <div class="modal-dialog modal-lg" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                        <h4 class="modal-title">${modalOpts.title}</h4>
                    </div>
                    <div class="modal-body">
                        <button class="ah-compare-scroll ah-compare-scroll-left" data-direction="left">
                            <span class="glyphicon glyphicon-chevron-left ah-compare-scroll-arrow"></span>
                        </button>
                        <button class="ah-compare-scroll ah-compare-scroll-right" data-direction="right">
                            <span class="glyphicon glyphicon-chevron-right ah-compare-scroll-arrow"></span>
                        </button>
                        
                        <div class="ah-compare-container"></div>
                    </div>
                </div>
            </div>
        </div>
    `);

    let modal = document.querySelector(`.ah-compare-modal`);
    let scrollBtns = modal.querySelectorAll('.ah-compare-scroll');
    let container = modal.querySelector('.ah-compare-container');

    $(modal).on('shown.bs.modal', modalShownHandler);
    modal.addEventListener('click', modalClickHandler);
    modal.addEventListener('transitionend', modalTransitionendHandler);

    function modalShownHandler() {
        // если есть скролл у ограниченных по высоте ячеек, добавить коллапс
        let allCollapsible = modal.querySelectorAll('.ah-compare-collapsible');
        for (let i = 0; i < allCollapsible.length; i++) {
            let elem = allCollapsible[i];
            if (elem.scrollHeight > elem.clientHeight) { // есть скоролл
                let row = elem.closest('.ah-compare-row'),
                    showMore = row.nextElementSibling;

                showMore.classList.remove('hidden');
            }
        }

        // проверка скролл баттонов
        checkScrollBtns();
    }

    function modalClickHandler(e) {
        let target = e.target;
        let container = modal.querySelector('.ah-compare-container');

        while (target !== this) {
            // collapse
            if (target.classList.contains('ah-compare-show-more')) {
                let prev = target.previousElementSibling;
                let collapsible = prev.querySelectorAll('.ah-compare-collapsible');

                $(collapsible).toggleClass('ah-none-overflow-y');
                target.querySelector('.glyphicon-collapse-down').classList.toggle('glyphicon-collapse-up');
            }

            // scroll
            if (target.classList.contains('ah-compare-scroll') && !target.disabled) {
                let direction = target.dataset.direction;
                let abutmentCells = container.querySelectorAll('.ah-compare-cell:first-child');
                let exceptAbutmentCells = container.querySelectorAll('.ah-compare-cell:not(:first-child)');
                let cellWidth = container.querySelector('.ah-compare-cell').offsetWidth;
                let allHidden = modal.querySelectorAll('.ah-compare-cell-hidden-by-scroll');

                if (direction === 'right' && getScrollSizeRight(container) !== 0) {
                    for (let i = 0; i < scrollBtns.length; i++) {
                        scrollBtns[i].disabled = true;
                    }

                    for (let i = 0; i < abutmentCells.length; i++) { // показывать опорное всегда
                        let allHidden = abutmentCells[i].parentNode.querySelectorAll('.ah-compare-cell-hidden-by-scroll');
                        let lastHidden = allHidden[allHidden.length - 1];
                        let nextVisible = (lastHidden) ? lastHidden.nextElementSibling : abutmentCells[i].nextElementSibling;

                        nextVisible.classList.add('ah-compare-cell-hidden-by-scroll');
                    }

                    for (let i = 0; i < exceptAbutmentCells.length; i++) {
                        let cell = exceptAbutmentCells[i];
                        let cellRight = parseFloat(getComputedStyle(cell).right);
                        cell.style.right = +(cellRight + cellWidth) + 'px';
                    }
                }

                if (direction === 'left' && allHidden.length !== 0) {
                    for (let i = 0; i < scrollBtns.length; i++) {
                        scrollBtns[i].disabled = true;
                    }
                    for (let i = 0; i < abutmentCells.length; i++) { // показывать опорное всегда
                        let allHidden = abutmentCells[i].parentNode.querySelectorAll('.ah-compare-cell-hidden-by-scroll');
                        let lastHidden = allHidden[allHidden.length - 1];
                        if (lastHidden) {
                            lastHidden.classList.remove('ah-compare-cell-hidden-by-scroll');
                        }

                        for (let i = 0; i < exceptAbutmentCells.length; i++) {
                            let cell = exceptAbutmentCells[i];
                            let cellRight = parseFloat(getComputedStyle(cell).right);
                            cell.style.right = +(cellRight - cellWidth) + 'px';
                        }
                    }
                }
            }

            target = target.parentNode;
        }
    }

    function modalTransitionendHandler(e) {
        let target = e.target;

        // убрать disabled у баттонов для скролла
        if (target.classList.contains('ah-compare-cell')) {
            for (let i = 0; i < scrollBtns.length; i++) {
                scrollBtns[i].disabled = false;
            }
            checkScrollBtns();
        }
    }

    function checkScrollBtns() {
        let rightScroll = modal.querySelector('.ah-compare-scroll[data-direction="right"]');
        let leftScroll = modal.querySelector('.ah-compare-scroll[data-direction="left"]');
        let allHiddens = modal.querySelectorAll('.ah-compare-cell-hidden-by-scroll');

        if (getScrollSizeRight(container) === 0) {
            rightScroll.classList.add('ah-compare-scroll-disabled');
        } else {
            rightScroll.classList.remove('ah-compare-scroll-disabled');
        }

        if (allHiddens.length === 0) {
            leftScroll.classList.add('ah-compare-scroll-disabled');
        } else {
            leftScroll.classList.remove('ah-compare-scroll-disabled');
        }
    }
}

function renderCompareItems(items) {
    let modal = $('.ah-compare-modal');
    let modalContainer = $(modal).find('.ah-compare-container');
    let statusPatterns = {
        blocked: /\bblocked\b/i,
        rejected: /\brejected\b/i,
        paid: /\bpaid\b/i,
        active: /\b(added|activated|unblocked)\b/i,
        closed_removed_archived: /\b(removed|closed|archived)\b/i,
        vas: /\b(premium|vip|pushed up|highlighted)\b/i
    };
    let rows = {
        id_title_price: '',
        status_reasons: '',
        sortTime: '',
        photos: '',
        description: '',
        microCategory: '',
        region: '',
        phone_ip: '',
        sellerName: '',
        user: ''
    };
    let firstObj = Object.keys(items)[0];
    let abutmentItemId = items[firstObj].id;

    for (let key in items) {
        if (!items.hasOwnProperty(key)) continue;

        let item = items[key];
        let mainPhoto = '';
        let prevPhotos = '';
        let reasons = '';
        let microCategoryes = [];

        // превьюшки
        item.photos.forEach(function(photo, i) {
            let activeImgClass = (i === 0) ? 'ah-photo-prev-img-active' : '';
            prevPhotos += `
                <div class="ah-photo-prev-wrap">
                    <img class="ah-photo-prev-img ${activeImgClass}" src="${photo.thumbUrl}" data-original-image="${photo.url}">
                </div>
            `;
        });

        // главное фото
        if (item.photos.length !== 0) {
            mainPhoto = `
                <span class="ah-compare-photo-count">${item.photos.length}</span>
                <a style="background-image: url(${item.photos[0].url});" target="_blank" href="${item.photos[0].url}" 
                    class="ah-photo-link">
                </a>
            `;
        } else {
            mainPhoto = `<div class="text-muted">Нет Фото</div>`;
        }

        // причины
        if (item.reasons.length !== 0) {
            reasons = `(${item.reasons.join(', ')})`;
        }

        // микрокатегория
        item.microCategoryes.forEach(function(mircoCategory, i) {
            microCategoryes.push(`<span data-compare="microCategory[${i}]" data-item-id="${item.id}">${mircoCategory}</span>`);
        });

        // статусы
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
        if (statusPatterns.closed_removed_archived.test(item.status)) {
            item.status = item.status.replace(statusPatterns.closed_removed_archived, '<span class="text-muted">$&</span>');
        }
        if (statusPatterns.vas.test(item.status)) {
            item.status = item.status.replace(statusPatterns.vas, '<span class="ah-text-vas">$&</span>');
        }

        // ячейки
        rows.id_title_price += `
            <div class="ah-compare-cell" data-item-id="${item.id}">
                <span class="text-muted"><span class="ah-compare-items-item-id" data-item-id="${item.id}">${item.id}</span></span>,
                <a target="_blank" class="ah-compare-items-item-title" href="/items/item/info/${item.id}" 
                    data-compare="title" data-item-id="${item.id}">${item.title}</a>
                (<span data-compare="price" data-item-id="${item.id}">${item.price}${(/\d/.test(item.price)) ? ' руб.' : ''}</span>)
            </div>
        `;

        rows.status_reasons += `
            <div class="ah-compare-cell" data-item-id="${item.id}">
                <span class="ah-compare-items-status">${item.status}</span>
            </div>
        `;

        rows.sortTime += `
            <div class="ah-compare-cell" data-item-id="${item.id}">
                <span title="Sort Time">${item.sortTime}</span>
            </div>
        `;

        rows.photos += `
            <div class="ah-compare-cell" data-item-id="${item.id}">
                <div class="ah-compare-photo-main">
                    ${mainPhoto}
                </div>
                <div class="ah-compare-photo-prev ah-compare-collapsible">
                    ${prevPhotos}
                </div>
            </div>
        `;

        rows.microCategory += `
            <div class="ah-compare-cell" data-item-id="${item.id}">
                <i>${microCategoryes.join(' / ')}</i>
            </div>
        `;

        rows.description += `
            <div class="ah-compare-cell" data-item-id="${item.id}">
                <div class="ah-compare-items-cell-description ah-compare-collapsible"
                    data-compare="description" data-item-id="${item.id}">${item.description}</div>
            </div>
        `;

        rows.region += `
            <div class="ah-compare-cell" data-item-id="${item.id}">
                <span class="ah-compare-items-label">Город:</span>
                <span data-compare="region" data-item-id="${item.id}">${item.region}</span>
            </div>
        `;

        rows.phone_ip += `
            <div class="ah-compare-cell" data-item-id="${item.id}">
                <span class="ah-compare-items-label">Тел.:</span>
                <span data-compare="phone" data-item-id="${item.id}">${item.phone}</span>,
                <span class="ah-compare-items-label">IP:</span>
                <span>
                <button data-compare="ip" data-item-id="${item.id}" 
                    class="btn btn-link ah-pseudo-link ah-compare-items-ip-info-btn" data-ip="${item.ip}">
                    ${item.ip}
                </button>
                </span>
            </div>
        `;

        rows.sellerName += `
            <div class="ah-compare-cell" data-item-id="${item.id}">
                <span class="ah-compare-items-label">Название:</span>
                <span data-compare="sellerName" data-item-id="${item.id}">${item.sellerName}</span>
            </div>
        `;

        rows.user += `
            <div class="ah-compare-cell" data-item-id="${item.id}">
                <span class="ah-compare-items-label">Пользователь:</span>
                <a target="_blank" href="/users/user/info/${item.userId}" data-compare="userMail" data-item-id="${item.id}">
                    ${item.userMail}</a>, 
                <a target="_blank" href="/items/search?user_id=${item.userId}">${item.userItems}</a>
            </div>
        `;
    }

    $(modalContainer).append(`
        <div class="ah-compare-row">
            ${rows.id_title_price}
        </div>
        <div class="ah-compare-row">
            ${rows.status_reasons}
        </div>
        <div class="ah-compare-row">
            ${rows.sortTime}
        </div>
        <div class="ah-compare-row">
            ${rows.photos}
        </div>
        <div class="ah-compare-row ah-compare-show-more hidden">
            <span class="ah-compare-items-more-text">
                Фото <span class="glyphicon glyphicon-collapse-down"></span>
            </span>
        </div>

        <div class="ah-compare-row">
            ${rows.microCategory}
        </div>
        <div class="ah-compare-row ah-compare-items-row-description">
            ${rows.description}
        </div>
        <div class="ah-compare-row ah-compare-show-more hidden">
            <span class="ah-compare-items-more-text">
                Описания <span class="glyphicon glyphicon-collapse-down"></span>
            </span>
        </div>

        <div class="ah-compare-row">
            ${rows.region}
        </div>
        <div class="ah-compare-row">
            ${rows.phone_ip}
        </div>
        <div class="ah-compare-row">
            ${rows.sellerName}
        </div>
        <div class="ah-compare-row">
            ${rows.user}
        </div>
    `);

    // опорное
    let abutmentItemIdNode = $(modal).find(`.ah-compare-items-item-id[data-item-id="${abutmentItemId}"]`);
    $(abutmentItemIdNode).before(`<span class="label label-primary">Опорное</span> `);

    // тултип причина
    $(modal).find(`.ah-compare-items-reason-tooltip`).tooltip({
        placement: 'bottom',
        container: 'body'
    });

    // поповер инфо об ip
    let ipPopovers = $(modal).find('.ah-compare-items-ip-info-btn');
    $(ipPopovers).click(function () {
        let ip = $(this).data('ip');
        let btn = $(this);
        btnLoaderOn($(btn));

        getIpInfo(ip)
            .then(
                response => showIpInfoPopover($(btn), response),
                error => alert(`Произошла ошибка:\n${error.status}\n${error.statusText}`)
            ).then(
                () => btnLoaderOff($(btn))
            );
    });

    // копирование айтемов
    let itemsToCopy = $(modal).find('.ah-compare-items-item-id');
    copyDataTooltip(itemsToCopy, {
        title: getCopyTooltipContentAlt('скопировать с заголовком'),
        getText: function(elem) {
            let itemId = $(elem).text().trim();
            return `№${itemId}`;
        },
        getTextAlt: function(elem) {
            let itemTitle = $(elem).parents('.ah-compare-cell').find('.ah-compare-items-item-title').text();
            let itemId = $(elem).text().trim();
            return `№${itemId} («${itemTitle}»)`;
        }
    });

    // фото
    $(modal).find('.ah-photo-prev-wrap').click(function () {
        let allPreviews = this.closest('.ah-compare-photo-prev').querySelectorAll('.ah-photo-prev-img');
        let mainPhoto = this.closest('.ah-compare-cell').querySelector('.ah-compare-photo-main .ah-photo-link');
        let currPreview = this.querySelector('.ah-photo-prev-img');
        let originalImg = currPreview.dataset.originalImage;

        $(allPreviews).removeClass('ah-photo-prev-img-active');
        currPreview.classList.add('ah-photo-prev-img-active');
        mainPhoto.style.backgroundImage = `url(${originalImg})`;
        mainPhoto.href = originalImg;
    });

    // сравнение
    let allCompareNodes = $(modal).find('[data-compare]');
    let abutmentNodes = $(allCompareNodes).filter(`[data-item-id="${abutmentItemId}"]`);
    let comparingNodes = $(allCompareNodes).not(`[data-item-id="${abutmentItemId}"]`);
    $(abutmentNodes).each(function () {
        let abutment = $(this);
        let abutmentText = $(abutment).text().trim().toLocaleLowerCase();
        let abutmentDataCompare = $(abutment).data('compare');

        $(comparingNodes).each(function () {
            let comparing = $(this);
            let comparingText = $(comparing).text().trim().toLocaleLowerCase();
            let comparingDataCompare = $(comparing).data('compare');

            if (abutmentText === comparingText && abutmentDataCompare === comparingDataCompare) {
                $(this).addClass('ah-compare-matched');
            }
        });
    });
}

// информация о пакетах размещений
function showLfPackagesBtnHandler(btn) {
    btn.click(function () {
        let allInfoBlocks = $('.ah-package-info');
        if (allInfoBlocks.length === 0) {
            alert('На странице нет операций с пакетами');
            return;
        }

        let self = $(this);
        btnLoaderOn(self);
        let callback = function() {
            btnLoaderOff(self);
            outTextFrame('Информация о пакетах добавлена к операциям');
        };
        showLfPackagesInfo(callback);
    });
}

function showLfPackagesInfo(callback) {
    callback = callback || function() {};

    let allInfoBlocks = $('.ah-package-info');

    allInfoBlocks.html(`<span class="text-muted">Загрузка...</span>`);

    let allUsersIds = getUsersIds();
    let doneRequestCount = 0;
    allUsersIds.forEach((userId) => {
        getUserInfo(userId).then(
            response => {
                let params = getParamsUserInfo($(response));
                let packagesTables = {
                    activeLF: params.activeLFPackagesTableHtml,
                    expiredLF: params.expiredLFPackagesTableHtml,
                    activeCV: params.activeCVPackagesTableHtml,
                    expiredCV: params.expiredCVPackagesTableHtml
                };
                renderPackagesInfo(packagesTables, userId);
            },
            error => renderPackagesError(error, userId)
        ).then(
            () => {
                doneRequestCount++;
                if (allUsersIds.length === doneRequestCount) {
                    callback();
                }
            }
        );
    });

    function renderPackagesError(error, userId) {
        let errorNodes = allInfoBlocks.filter(`[data-user-id="${userId}"]`);
        errorNodes.html(`<span class="text-danger">Ошибка: ${error.status} ${(error.statusText) ? `(${error.statusText})` : ''}</span>`)
    }

    function renderPackagesInfo(packagesTables, userId) {
        let allPackages = getPackagesIdsForUser(userId);
        allPackages.forEach((id) => {
            let info = getPackageInfo(id, packagesTables);
            let nodes = allInfoBlocks.filter(`[data-package-id="${id}"]`);
            let html;
            let isFound = false;

            if (info) {
                isFound = true;
                html = info.html;
            } else {
                html = `<span class="text-muted">Пакет не найден</span>`;
            }

            nodes.html(html);

            if (isFound) {
                let popoverTargets = $(nodes).find('.ah-lf-package-details');
                let popoverContent = info.htmlPopover;

                $(popoverTargets).popover({
                    trigger: 'hover',
                    container: 'body',
                    content: popoverContent,
                    template: `<div class="popover ah-package-info-popover"><div class="arrow"></div><div class="popover-content"></div></div>`,
                    html: true
                });
            }
        });
    }

    function getPackagesIdsForUser(userId) {
        let tmp = {};
        allInfoBlocks.each(function () {
            let userIdIter = $(this).data('userId').toString();
            if (userIdIter !== userId) return;

            let packageId = $(this).data('packageId');
            tmp[packageId] = true;
        });

        return Object.keys(tmp);
    }

    function getUsersIds() {
        let tmp = {};
        allInfoBlocks.each(function () {
            let id = $(this).data('userId');
            tmp[id] = true;
        });

        return Object.keys(tmp);
    }

    function getPackageInfo(packageId, packagesTables) {
        let info = {};

        let activeLFTable = packagesTables.activeLF;
        let expiredLFTable = packagesTables.expiredLF;
        let activeCVTable = packagesTables.activeCV;
        let expiredCVTable = packagesTables.expiredCV;

        if (activeLFTable) { // активный LF
            let column = $(activeLFTable).find(`.id-col:contains(${packageId})`);
            if (column.length !== 0) {
                let row = column.parent();

                let location = row.find('.location-col').text();
                let category = row.find('.category-col').text().trim();
                let size = row.find('.size-col').text();
                let duration = row.find('.duration-col').text();
                let expires = row.find('.expires-col').text();

                info.html = `
                    <i>Пакет ${packageId}: </i>
                    <span class="text-success ah-lf-package-details">
                        <b>Active</b> <span class="text-muted">(${size})</span>
                    </span>
                `;

                info.htmlPopover = `
                    <table class="ah-package-details-table">
                        <tr>
                            <td>Регион</td><td>${location}</td>
                        </tr>
                        <tr>
                            <td>Категория</td><td>${category}</td>
                        </tr>
                        <tr>
                            <td>Размер</td><td>${size}</td>
                        </tr>
                        <tr>
                            <td>Длительность</td><td>${duration}</td>
                        </tr>
                        <tr>
                            <td>Срок действия</td><td>${expires}</td>
                        </tr>
                    </table>
                `;

                return info;
            }
        }

        if (expiredLFTable) { // истекший LF
            let column = $(expiredLFTable).find(`.id-col:contains(${packageId})`);
            if (column.length !== 0) {
                let row = column.parent();

                let location = row.find('.location-col').text();
                let category = row.find('.category-col').text().trim();
                let size = row.find('.size-col').text();
                let expires = row.find('.expires-col').text();

                info.html = `
                    <i>Пакет ${packageId}: </i>
                    <span class="ah-lf-package-details">
                        <b>Expired</b> <span class="text-muted">(${size})</span>
                    </span>
                `;

                info.htmlPopover = `
                    <table class="ah-package-details-table">
                        <tr>
                            <td>Регион</td><td>${location}</td>
                        </tr>
                        <tr>
                            <td>Категория</td><td>${category}</td>
                        </tr>
                        <tr>
                            <td>Размер</td><td>${size}</td>
                        </tr>
                        <tr>
                            <td>Срок действия</td><td>${expires}</td>
                        </tr>
                    </table>
                `;

                return info;
            }
        }

        if (activeCVTable) { // активный CV
            let column = $(activeCVTable).find(`td:eq(0):contains(${packageId})`);
            if (column.length !== 0) {
                let row = column.parent();

                let name = row.find('td:eq(1)').text();
                let size = row.find('td:eq(2)').text();
                let status = row.find('td:eq(3)').text();
                let paid = row.find('td:eq(4)').text();
                let expires = row.find('td:eq(5)').text();

                info.html = `
                    <i>Пакет ${packageId}: </i>
                    <span class="text-success ah-lf-package-details">
                        <b>${status}</b> <span class="text-muted">(${size})</span>
                    </span>
                `;

                info.htmlPopover = `
                    <table class="ah-package-details-table">
                        <tr>
                            <td>Название</td><td>${name}</td>
                        </tr>
                        <tr>
                            <td>Просмотры</td><td>${size}</td>
                        </tr>
                        <tr>
                            <td>Статус</td><td>${status}</td>
                        </tr>
                        <tr>
                            <td>Оплачен</td><td>${paid}</td>
                        </tr>
                        <tr>
                            <td>Истекает</td><td>${expires}</td>
                        </tr>
                    </table>
                `;

                return info;
            }
        }

        if (expiredCVTable) { // истекший CV
            let column = $(expiredCVTable).find(`td:eq(0):contains(${packageId})`);
            if (column.length !== 0) {
                let row = column.parent();

                let name = row.find('td:eq(1)').text();
                let size = row.find('td:eq(2)').text();
                let status = row.find('td:eq(3)').text();
                let paid = row.find('td:eq(4)').text();
                let deactivated = row.find('td:eq(5)').text();

                info.html = `
                    <i>Пакет ${packageId}: </i>
                    <span class="ah-lf-package-details">
                        <b>${status}</b> <span class="text-muted">(${size})</span>
                    </span>
                `;

                info.htmlPopover = `
                    <table class="ah-package-details-table">
                        <tr>
                            <td>Название</td><td>${name}</td>
                        </tr>
                        <tr>
                            <td>Просмотры</td><td>${size}</td>
                        </tr>
                        <tr>
                            <td>Статус</td><td>${status}</td>
                        </tr>
                        <tr>
                            <td>Оплачен</td><td>${paid}</td>
                        </tr>
                        <tr>
                            <td>Деактивирован</td><td>${deactivated}</td>
                        </tr>
                    </table>
                `;

                return info;
            }
        }

        info = null;
        return info;
    }
}

function injectScript(url, node) {
    const script = document.createElement('script');
    script.setAttribute('src', url);
    node.appendChild(script);
}