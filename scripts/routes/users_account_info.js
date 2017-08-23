// добавление кнопок подсчета в Account info
function countMoney(script) {
    let userID = $('.form-group:contains(ID пользователя) a').text();

    if (!localStorage['users/account/info/countMoney']) {
        resetLocalStorageCountMoney();
    }

    let countMoneyObj = JSON.parse(localStorage['users/account/info/countMoney']);
    let currentUserIDonMoney = countMoneyObj.currentUser;
    if (currentUserIDonMoney.indexOf(userID) == -1) {
        resetLocalStorageCountMoney();
        countMoneyObj = JSON.parse(localStorage['users/account/info/countMoney']);
    }

    // console.log(countMoneyObj);

    // Счетчик ДС
    $('body').append('<div id="money-counter-block" class="alert alert-info money-counter-visible" style="right: 2px; visibility: hidden; z-index: 1050;"></div>');
    let moneyCounterBlock = $('#money-counter-block');

    let wrapperMinWidth = '300px';
    let operationsInfoDisplay = 'none';
    if (countMoneyObj.moreInfoVisibility === 'visible') {
        wrapperMinWidth = '400px';
        operationsInfoDisplay = 'block';
    }

    let operationsText = getMoneyCounterOperationsCounterText();

    $(moneyCounterBlock).append('<button type="button" class="sh-default-btn" id="money-counter-toggler" title="Переключить режим отображения счетчика"><span class="glyphicon glyphicon-menu-right"></span></button><div id="money-counter-wrapper" style="line-height: 1; padding: 10px; vertical-align: middle; position: relative; display: inline-block; transition: all .15s; min-width: ' + wrapperMinWidth + ';">Отмечено: <span id="money-counter-value" style="font-weight: 700;">' + countMoneyObj.value + '</span><span style="font-weight: 700;"> руб., <span class="operations-counter pseudo-link" style="font-weight: 400; user-select: none;" id="money-counter-show-more">' + operationsText + '</span></span><span class="glyphicon glyphicon-remove" id="money-counter-set-to-zero" title="Обнулить" style="top: 2px; float: right;"></span><span class="glyphicon glyphicon-refresh" id="money-counter-refresh" title="Обновить" style="top: 2px; float: right;"></span></div>');

    let moneyCounterWrapper = $('#money-counter-wrapper');
    $(moneyCounterWrapper).append('<div id="money-counter-marked-operations-info" style="display: ' + operationsInfoDisplay + '; position: absolute;bottom: calc(100% + 6px); right: 0; background-color: white; width: 100%; padding: 4px; border-radius: 4px; border: 1px solid #bce8f1;"><button id="count-money-open-all-operations" type="button" class="btn btn-info btn-block" style="outline: none; border-radius: 4px; margin-bottom: 4px;">Открыть все в Wallet log</button><div class="table-scroll" style="margin-bottom: 0; max-height: 400px; border: 1px solid #ccc; border-radius: 4px; margin-bottom: 4px;"><table class="table table-condensed table-striped around-bordered-table" style=""><thead></thead><tbody></tbody></table></div><button type="butotn" class="btn btn-default btn-block"" style="padding: 2px 12px; border-radius: 4px; outline: none;" id="money-counter-hide-more">Скрыть операции</button></div>');
    let markedOperationsInfoBlock = $('#money-counter-marked-operations-info');
    let markedOperationsInfoTableBody = $(markedOperationsInfoBlock).find('tbody');

    setFixedElemUnderFooter($('#money-counter-block'));

    let rightPos = 2;
    if (countMoneyObj.counterVisibility === 'hidden') {
        hideMoneyCounter();
    } else {
        $(moneyCounterBlock).css('right', '' + rightPos + 'px');
    }
    $(moneyCounterBlock).css('visibility', 'visible');

    let moneyCounterValue = $('#money-counter-value');
    let rows = $('tr[data-oid]');

    let allOids = countMoneyObj.operations.map(function (operation) {
        return operation.id;
    });
    $(rows).each(function (i, row) {
        let itemLink = $(row).find('td:eq(1) a').attr('href');
        let amount = $(row).find('.text-nowrap span').text().replace(',', '.').replace(/[^\d.]/g, '').replace(/.$/, '');
        let description = $(row).find('td:eq(1)').text().replace(/\n/g, "").replace(/ {2,}/g, "");
        let wlLink = $(row).find('.text-nowrap a').attr('href');
        let oid = $(row).attr('data-oid');
        let date = $(row).find('td:eq(0)').html().replace(/<br>/g, ', ');
        let method = $(row).find('.payment-method').text();
        let methodProvider = $(row).find('.payment-method').next('.gray').text();
        let status = $(row).find('.text-nowrap a').text();

        let amountClassList = $(row).find('.text-nowrap span').attr('class');
        let amountType = '';
        if (~amountClassList.indexOf('amount-payment')) {
            amountType = 'payment';
        } else if (~amountClassList.indexOf('amount-payin')) {
            amountType = 'payin';
        } else {
            amountType = 'undefined';
        }

        let value = '+';
        let btnClass = 'btn-success';

        if (~allOids.indexOf(oid)) {
            value = '-';
            btnClass = 'btn-danger';
        }
        
        itemLink = itemLink || '';
        let itemId = itemLink.split('/')[4];
        if (script === 'support') {
            if (!isFinite(itemId)) {
                return;
            }
        }

        let add = $('<input/>', {
            type: 'button',
            class: 'btn btn-default btn-xs calculate',
            value: value,
            oid: oid,
            date: date,
            method: method,
            methodProvider: methodProvider,
            status: status,
            itemId: itemId,
            wlLink: wlLink,
            amount: amount,
            description: description,
            amountType: amountType,
            click: function () {
                let oid = $(this).attr('oid');
                let date = $(this).attr('date');
                let method = $(this).attr('method');
                let methodProvider = $(this).attr('methodProvider');
                let status = $(this).attr('status');
                let wlLink = $(this).attr('wlLink');
                let description = $(this).attr('description');
                let itemId = $(this).attr('itemId');
                let amount = $(this).attr('amount');
                let reason = '';
                let itemStatusText = $('.account-history [data-item-id="' + itemId + '"] span:first').text();
                if (~itemStatusText.indexOf('Blocked')) {
                    reason = $('.account-history [data-item-id="' + itemId + '"] span:last').text();
                }
                let amountType = $(this).attr('amountType');

                let lsObj = JSON.parse(localStorage['users/account/info/countMoney']);

                let currentUserIDonMoney = lsObj.currentUser;
                if (currentUserIDonMoney.indexOf(userID) == -1) {
                    resetLocalStorageCountMoney();
                }

                let operation = {
                    id: oid,
                    date: date,
                    description: description,
                    method: method,
                    methodProvider: methodProvider,
                    amount: amount,
                    status: status,
                    wlLink: wlLink,
                    itemId: itemId,
                    reason: reason,
                    amountType: amountType,
                }

                if (~$(this).attr('value').indexOf('+')) {
                    addMoneyCounterOperation(operation);
                } else {
                    removeMoneyCounterOperation(operation);
                }
                let isVisible = $(moneyCounterBlock).hasClass('money-counter-visible');
                if (!isVisible) {
                    $(moneyCounterBlock).css('transition', 'none');
                    hideMoneyCounter();
                }
            }
        }).css({
            'width': '24px',
            'display': 'block',
            'margin-top': '4px',
            'color': '#fff',
            'font-size': '13px',
            'outline': 'none'
        }).addClass(btnClass);

        $(row).find('.actions-button-placeholder').append(add);
    });

    renderMoneyCounterMoreTable();

    var setToZeroBtn = $('#money-counter-set-to-zero');
    $(setToZeroBtn).click(function () {
        $(moneyCounterValue).css('visibility', 'hidden');
        $('.calculate').attr('value', '+');
        $('.calculate').removeClass('btn-danger');
        $('.calculate').addClass('btn-success');
        resetLocalStorageCountMoney();
        var lsObj = JSON.parse(localStorage['users/account/info/countMoney']);
        renderMoneyCounterMoreTable();

//        if (lsObj.moreInfoVisibility === 'visible') {
//            $(markedOperationsInfoBlock).hide();
//            $(markedOperationsInfoBlock).fadeIn('fast');
//        }

        $(moneyCounterValue).text(lsObj.value);

        let operationsCounters = $(moneyCounterBlock).find('.operations-counter');
        let operationsText = getMoneyCounterOperationsCounterText();
        $(operationsCounters).text(operationsText);
        setTimeout(() => {
            $(moneyCounterValue).css('visibility', 'visible');
        }, 100);
    });

    var refreshBtn = $('#money-counter-refresh');
    $(refreshBtn).click(function () {
        var lsObj = JSON.parse(localStorage['users/account/info/countMoney']);
        var allOids = lsObj.operations.map(function (operation) {
            return operation.id;
        });

        $(moneyCounterValue).css('visibility', 'hidden');
        $('.calculate').each(function (i, btn) {
            var oid = $(btn).attr('oid');
            if (~allOids.indexOf(oid)) {
                $(btn).val('-');
                $(btn).removeClass('btn-success');
                $(btn).addClass('btn-danger');
            } else {
                $(btn).val('+');
                $(btn).removeClass('btn-danger');
                $(btn).addClass('btn-success');
            }
        });

        renderMoneyCounterMoreTable();
//        if (lsObj.moreInfoVisibility === 'visible') {
//            $(markedOperationsInfoBlock).hide();
//            $(markedOperationsInfoBlock).fadeIn('fast');
//        }

        $(moneyCounterValue).text(lsObj.value);

        let operationsCounters = $(moneyCounterBlock).find('.operations-counter');
        let operationsText = getMoneyCounterOperationsCounterText();
        $(operationsCounters).text(operationsText);

        setTimeout(() => {
            $(moneyCounterValue).css('visibility', 'visible');
        }, 100);
    });

    let moneyCounterToggler = $('#money-counter-toggler');
    $(moneyCounterToggler).click(function () {
        let transitionValue = $(moneyCounterBlock).css('transition');
        if (transitionValue.indexOf('right 0.25s') == -1) {
            $(moneyCounterBlock).css('transition', 'right 0.25s');
        }
        let isVisible = $(moneyCounterBlock).hasClass('money-counter-visible');
        let lsObj = JSON.parse(localStorage['users/account/info/countMoney']);

        if (isVisible) {
            hideMoneyCounter();
            lsObj.counterVisibility = 'hidden';
        } else {
            $(moneyCounterBlock).addClass('money-counter-visible');
            $(moneyCounterBlock).css('right', '2px');
            $(this).html('<span class="glyphicon glyphicon-menu-right"></span>');
            lsObj.counterVisibility = 'visible';
        }

        localStorage['users/account/info/countMoney'] = JSON.stringify(lsObj);
    });

    let showMoreInfo = $('#money-counter-show-more');
    $(showMoreInfo).click(function () {
        let lsObj = JSON.parse(localStorage['users/account/info/countMoney']);
        $(moneyCounterWrapper).css('min-width', '400px');

        setTimeout(() => {
            $(markedOperationsInfoBlock).fadeIn(200);
        }, 200);

        lsObj.moreInfoVisibility = 'visible';
        localStorage['users/account/info/countMoney'] = JSON.stringify(lsObj);
    });

    let hideMoreInfo = $('#money-counter-hide-more');
    $(hideMoreInfo).click(function () {
        let lsObj = JSON.parse(localStorage['users/account/info/countMoney']);
        $(markedOperationsInfoBlock).fadeOut(200, function () {
            $(moneyCounterWrapper).css('min-width', '300px');
        });
        lsObj.moreInfoVisibility = 'hidden';
        localStorage['users/account/info/countMoney'] = JSON.stringify(lsObj);
    });

    let openAllOperationsBtn = $('#count-money-open-all-operations');
    $(openAllOperationsBtn).click(function () {
        let lsObj = JSON.parse(localStorage['users/account/info/countMoney']);

        if (lsObj.operations.length === 0) {
            alert('Сначала отметьте хотя бы одну операцию.');
            return;
        }

        let allWlLinks = lsObj.operations.map(function (operation) {
            return operation.wlLink;
        });

        try {
            var joinedLink = joinWalletLogLinks(allWlLinks);
        } catch (e) {
            if (allWlLinks.length > 0) {
                alert('Не удалось сформировать ссылку на Wallet Log');
            }
            return;
        }

        var isOpened = window.open(joinedLink);
        if (!isOpened) {
            alert('В вашем браузере заблокированы всплывающие окна для текущего сайта. Пожалуйста, отключите эту блокировку для сайта adm.avito.ru и повторите попытку.');
            return;
        }
    });

    var timer = null;
    $(document).scroll(function () {
        $(markedOperationsInfoBlock).css('will-change', 'transform');
        clearTimeout(timer);

        timer = setTimeout(function () {
            $(markedOperationsInfoBlock).css('will-change', false);
        }, 10);
    });
}

function resetLocalStorageCountMoney() {
    let counterVisibility = 'visible';
    let moreInfoVisibility = 'hidden';
    if (localStorage['users/account/info/countMoney']) {
        let lsObj = JSON.parse(localStorage['users/account/info/countMoney']);
        counterVisibility = lsObj.counterVisibility;
        moreInfoVisibility = lsObj.moreInfoVisibility;
    }

    let lsObj = {
        currentUser: '',
        value: '0.00',
        operations: [],
        counterVisibility: counterVisibility,
        moreInfoVisibility: moreInfoVisibility
    }
    localStorage['users/account/info/countMoney'] = JSON.stringify(lsObj);
}

function getMoneyCounterOperationsCounterText() {
    let lsObj = JSON.parse(localStorage['users/account/info/countMoney']);
    let operationsCount = lsObj.operations.length;
    let operationsWord = declensionOfNumerals(operationsCount, ['операция', 'операции', 'операций']);
    let operationsText = '(' + operationsCount + ' ' + operationsWord + ')';
    return operationsText;
}

function hideMoneyCounter() {
    var moneyCounterBlock = $('#money-counter-block');
    var moneyCounterToggler = $('#money-counter-toggler');
    $(moneyCounterBlock).removeClass('money-counter-visible');
    var width = $(moneyCounterBlock)[0].getBoundingClientRect().width;
    var rightPos = width - 28;
    rightPos = '-' + rightPos;
    $(moneyCounterBlock).css('right', '' + rightPos + 'px');
    $('#money-counter-toggler').html('<span class="glyphicon glyphicon-menu-left"></span>');
}
function renderMoneyCounterMoreTable() {
    let markedOperationsInfoBlock = $('#money-counter-marked-operations-info');
    let markedOperationsInfoTableBody = $(markedOperationsInfoBlock).find('tbody');

    $(markedOperationsInfoTableBody).find('tr').remove();

    let lsObj = JSON.parse(localStorage['users/account/info/countMoney']);
    lsObj.operations.forEach(function (operation) {
        addMoneyCounterMoreRow(operation);
    });

    if (lsObj.operations.length === 0) {
        $(markedOperationsInfoTableBody).append(''+
        '<tr not-marked '+
        'style="display: none; transform: translateX(-100%); '+
        'transition: transform .2s;">'+
            '<td style="text-align: center; font-style: italic;">'+
            'Не отмечено ни одной операции'+
            '</td>'+
        '</tr>');
        
        let addedRow = $(markedOperationsInfoTableBody).find('tr[not-marked]');
        $(addedRow).fadeIn('slow');
        $(addedRow).css('transform', 'translateX(0)');
    }
}
function addMoneyCounterMoreRow(operation) {
    let markedOperationsInfoBlock = $('#money-counter-marked-operations-info');
    let markedOperationsInfoTableBody = $(markedOperationsInfoBlock).find('tbody');
    $(markedOperationsInfoTableBody).find('tr[not-marked]').remove();

    let amountColor, amountSign;
    switch (operation.amountType) {
        case 'payment':
            amountColor = '#a94442';
            amountSign = '-';
            break;

        case 'payin':
            amountColor = '#3c763d';
            amountSign = '+';
            break;

        default:
            amountColor = '#31708f';
            amountSign = '';
            break;
    }

    let method = operation.method;
    if (operation.methodProvider) {
        method = operation.method + '<span style="color: #666;"> - ' + operation.methodProvider + '</span>';
    }
    
    let itemLink = (operation.itemId) ? 
        '<a target="_blank" href="/items/item/info/' + operation.itemId + '" '+
        'class="glyphicon glyphicon-new-window ah-visitable-link"></a>' :
        '';
            
    $(markedOperationsInfoTableBody).append(''+
    '<tr data-oid="' + operation.id + '" '+
    'style="display: none; transform: translateX(-100%); transition: transform .2s;">'+
        '<td>'+
            '<span style="color: #666;">' + operation.date + '</span>, '+
            '<span style="">' + operation.description + '</span> '+
            itemLink +'<br>'+
            '<a target="_blank" href="' + operation.wlLink + '" '+
            'class="ah-visitable-link">' + operation.status + '</a>, '+
            '<span style="font-style: italic;">' + method + '</span>, '+
            '<span style="color: ' + amountColor + ';">'+
            '' + amountSign + operation.amount + ' руб.'+
            '</span>'+
        '</td>'+
        '<td>'+
            '<button type="button" class="close count-money-remove-operation" '+
            'style="outline: none;">x</button>'+
        '</td>'+
    '</tr>');
    // анимация и скролл вниз +++
    let addedRow = $(markedOperationsInfoTableBody).find('tr[data-oid="' + operation.id + '"]');
    $(addedRow).fadeIn('slow');
    $(addedRow).css('transform', 'translateX(0)');
    var tableBlock = $(markedOperationsInfoBlock).find('.table-scroll');
    $(tableBlock).scrollTop($(tableBlock).prop('scrollHeight'));
    // анимация и скролл вниз ---

    let removeBtns = $(markedOperationsInfoTableBody).find('.count-money-remove-operation');
    $(removeBtns).unbind('click').click(function () {
        let lsObj = JSON.parse(localStorage['users/account/info/countMoney']);
        let oid = $(this).parents('tr[data-oid]').data('oid');
        let operation = lsObj.operations.filter(function (item) {
            return item.id == oid;
        });

        removeMoneyCounterOperation(operation[0]);
    });
}
function addMoneyCounterOperation(operation) {
    let userID = $('.form-group:contains(ID пользователя) a').text();
    let moneyCounterBlock = $('#money-counter-block');
    let moneyCounterValue = $('#money-counter-value');
    let operationsCounters = $(moneyCounterBlock).find('.operations-counter');

    let lsObj = JSON.parse(localStorage['users/account/info/countMoney']);
    lsObj.operations.push(operation);
    addMoneyCounterMoreRow(operation);

    let moneyAmount = parseFloat(lsObj.value);
    moneyAmount += parseFloat(operation.amount);
    lsObj.value = moneyAmount.toFixed(2);

    let boTable = $('.account-history');
    $(boTable).find('.calculate[oid="' + operation.id + '"]').attr('value', '-').removeClass('btn-success').addClass('btn-danger');

    $(moneyCounterValue).text(lsObj.value);

    lsObj.currentUser = userID;
    localStorage['users/account/info/countMoney'] = JSON.stringify(lsObj);

    let operationsText = getMoneyCounterOperationsCounterText();
    $(operationsCounters).text(operationsText);
}
function removeMoneyCounterOperation(operation) {
    let userID = $('.form-group:contains(ID пользователя) a').text();
    let moneyCounterBlock = $('#money-counter-block');
    let moneyCounterValue = $('#money-counter-value');
    let markedOperationsInfoBlock = $('#money-counter-marked-operations-info');
    let markedOperationsInfoTableBody = $(markedOperationsInfoBlock).find('tbody');
    let operationsCounters = $(moneyCounterBlock).find('.operations-counter');

    let lsObj = JSON.parse(localStorage['users/account/info/countMoney']);
    for (var i = 0; i < lsObj.operations.length; i++) {
        if (lsObj.operations[i].id == operation.id) {
            lsObj.operations.splice(i, 1);
            break;
        }
    }

    let moneyAmount = parseFloat(lsObj.value);
    moneyAmount -= parseFloat(operation.amount);
    lsObj.value = moneyAmount.toFixed(2);

    $(moneyCounterValue).text(lsObj.value);

    lsObj.currentUser = userID;
    localStorage['users/account/info/countMoney'] = JSON.stringify(lsObj);

    let operationsText = getMoneyCounterOperationsCounterText();
    $(operationsCounters).text(operationsText);

    let markedOperationRow = $(markedOperationsInfoTableBody).find('tr[data-oid="' + operation.id + '"]');
    $(markedOperationRow).remove();

    if (lsObj.operations.length === 0) {
        $(markedOperationsInfoTableBody).append(''+
        '<tr not-marked '+
        'style="display: none; transform: translateX(-100%); '+
        'transition: transform .2s;">'+
            '<td style="text-align: center; font-style: italic;">'+
            'Не отмечено ни одной операции'+
            '</td>'+
        '</tr>');
        
        let addedRow = $(markedOperationsInfoTableBody).find('tr[not-marked]');
        $(addedRow).fadeIn('slow');
        $(addedRow).css('transform', 'translateX(0)');
    }

    let boTable = $('.account-history');
    $(boTable).find('.calculate[oid="' + operation.id + '"]').attr('value', '+').removeClass('btn-danger').addClass('btn-success');
}
// статус объявления и причина блокировки
function statusItem() {
    var rows = $('tr[data-oid]');
    if (~window.location.href.indexOf('/billing/walletlog')) {
        rows = $('.table tbody tr');
    }

    var allItems = [];
    $(rows).each(function (i, row) {
        let itemLinkNode = $(row).find('td:eq(1) a');
        if (~window.location.href.indexOf('/billing/walletlog')) {
            itemLinkNode = $(row).find('td:eq(4) a');
        }

        let itemLink = $(itemLinkNode).attr('href');

        if (itemLink) {
            let itemId = itemLink.split('/')[4];

            if (!isFinite(itemId))
                return;

            $(itemLinkNode).after('<div data-item-id="' + itemId + '" class="parsed-item-info"><span class="loading-indicator-text" style="color: rgb(149, 149, 149);">Загрузка...</span></div>');
            allItems.push(itemId);
        }
    });

    $('.show-items-statutes').prop('disabled', true);
    allItems = unique(allItems);
    allItems.forEach(function (id) {
        getItemInfoRequest(id);
    });


}
function getItemInfoRequest(itemId) {
    var url = "https://adm.avito.ru/items/item/info/" + itemId;

    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.send();
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
            if (xhr.status == 200) {
                var doc = xhr.responseText;
                var status = $(doc).find('.form-group:contains(Статус) div span:first').text().replace(' Paid', '');
                var reason = [];
                $(doc).find('.form-group:contains(Причины) div span[data-id]').each(function() {
                    reason.push($(this).text());
                });
                reason = reason.join(', ');

                var secondStatus = '';
                var reasonDivider = '';

                var color = 'black';
                if (~status.indexOf('Activated')
                        || ~status.indexOf('Added')) {
                    color = '#2E8B58';

                } else if (~status.indexOf('Blocked')) {
                    color = '#e00';

                } else if (~status.indexOf('Expired')) {
                    color = '#000';

                } else if (~status.indexOf('Removed')
                        || ~status.indexOf('Closed')) {

                    color = '#666';
                    secondStatus = $(doc).find('.table-striped:contains(Статус) tbody tr:eq(1) td:eq(2)').text();
                    if (!secondStatus) {
                        secondStatus = $(doc).find('.table-striped:contains(Статус) tbody tr:eq(2) td:eq(2)').text();
                        if (secondStatus == 'Blocked') {
                            var time = $(doc).find('.table-striped:contains(Статус) tbody tr:eq(2) td:eq(0)').text();
                            var tmp0 = $(doc).find('#adminTable tbody tr:contains(' + time + ') td:eq(1)').text().split('(');
                            reason = tmp0[1].replace(')', '');
                        }
                    }
                } else {
                    color = '#f0ad4e';
                }

                if (secondStatus) {
                    secondStatus = '/ ' + secondStatus;
                }
                if (reason) {
                    reasonDivider = '- ';
                }

                $('.parsed-item-info[data-item-id="' + itemId + '"]').html('<span style="color:' + color + '; font-weight:bold;">' + status + '</span> <span>' + secondStatus + '</span> ' + reasonDivider + '<span>' + reason + '</span>');
            }

            if (xhr.status >= 400) {
                $('.parsed-item-info[data-item-id="' + itemId + '"]').html('<span style="color: #e00; font-weight:bold;">' + xhr.status + '</span> <span>' + xhr.statusText + '</span> <span></span>');
            }

            if ($('.parsed-item-info .loading-indicator-text').length === 0) {
                $('.show-items-statutes').prop('disabled', false);
            }

        }
    };
}

function addCompensationBtns() {
    let moneyCounterValue = $('#money-counter-value');

    // автозаполнение полей в форме пэй ин +++
    $('button[value=payin]').after('<div class="btn-group" style="margin-left: 10px;"><input type="button" id="calculate" value="Calculate" class="btn btn-default btn-fill-fields" style="outline: none;"><input type="button" id="calculateShort" value="Short" class="btn btn-default btn-fill-fields" style="outline: none;"></div>');

    $('.payin input[name=comment]').after('<div class="form-warning-field" id="no-compensation-reasons-warning" style="display: none; color: #8a6d3b; margin-top: 6px;">Не указаны причины компенсации</div>');

    $('.btn-fill-fields').click(function () {
        let lsObj = JSON.parse(localStorage['users/account/info/countMoney']);
        let btnId = $(this).attr('id');
        let comment = '';
        switch (btnId) {
            case 'calculate':
                let allWlLinks = lsObj.operations.map(function (operation) {
                    return operation.wlLink;
                });
                let allDescriptions = lsObj.operations.map(function (operation) {
                    return operation.description;
                });

                comment = allDescriptions.join('; ');
                try {
                    var joinedLink = joinWalletLogLinks(allWlLinks);
                } catch (e) {
                    if (allWlLinks.length > 0) {
                        outTextFrame('Не удалось сформировать ссылку на Wallet Log');
                    }
                    var joinedLink = '';
                }

                comment = allDescriptions.join('; ') + '; ' + joinedLink;
                break;

            case 'calculateShort':
                let allItems = [];
                lsObj.operations.forEach(function(operation) {
                    if (!operation.itemId) return;
                    allItems.push(operation.itemId);
                });
                let uniqueItems = unique(allItems);
                comment = uniqueItems.join('|');
                break;
        }

        let allReasons = [];
        lsObj.operations.forEach(function (operation) {
            if (operation.reason) {
                allReasons.push(operation.reason);
            }
        });

        let uniqueReasons = unique(allReasons);
        uniqueReasons = uniqueReasons.join(', ');

        $('.payin input[name=amount]').val(lsObj.value);
        $('.payin input[name=comment]').val('Бонусами за: ' + comment + ' (' + uniqueReasons + ')');
        let methodSelect = $('.payin [name="methodId"]');
        if (!$(methodSelect).find('option:selected').val()) {
            $('.payin [name="methodId"] option[value="101"]').prop('selected', true);
        }
        if (!uniqueReasons) {
            $('#no-compensation-reasons-warning').show();
        } else {
            $('#no-compensation-reasons-warning').hide();
        }
    });
    // автозаполнение полей в форме пэй ин ---

    // Комментирование айтемов +++
    $('#payin').append('<div style="position: relative; display: inline-block;"><button id="comment-items-for-compensation" type="button" class="sh-action-btn btn-xs" title="" style="margin-left: 8px; font-size: 13px; margin-top: -2px; padding: 1px 8px;">Комментировать объявления</button><span class="glyphicon glyphicon-question-sign" style="top: 3px; margin-left: 4px; font-size: 17px;"></span><div style="position: absolute; top: calc(-50% - 20px); left: calc(100% + 4px); display: none; min-width: 300px; background-color: black; border: 1px solid rgb(204, 204, 204); padding: 8px; z-index: 1050; color: white; border-radius: 4px; font-size: 13px; text-align: center;"><span>Оставить комментарий "За данное объявление была произведена компенсация" на объявлениях, которые отмечены для компенсации. Комментарии начинают проставляться сразу после нажатия кнопки.</span></div></div>');

    let commentBtn = $('#comment-items-for-compensation');

    $(commentBtn).next('.glyphicon-question-sign').hover(function () {
        $(this).next('div').show();
    }, function () {
        $(this).next('div').hide();
    });

    $(commentBtn).click(function () {
        let lsObj = JSON.parse(localStorage['users/account/info/countMoney']);
        let allItems = lsObj.operations.map(function (operation) {
            return operation.itemId;
        });
        let uniqueItems = unique(allItems);

        if (uniqueItems.length === 0) {
            alert('Ни одного объявления не отмечено для компенсации.');
            return;
        }

        renderCommentItemsCompensation(uniqueItems);
    });

    // Комментирование айтемов ---

    // обработка кнопки в БО "Внести средства" +++
    $('button[value=payin]').click(function () {
        let userID = $('.form-group:contains(ID пользователя) a').text();
        if (!userID) {
            alert('Невозможно проставить комментарий на учетной записи - не удалось определить ID пользователя.');
            return;
        }

        let commentuser = confirm("Проставить комментарий в учетной записи пользователя?");
        if (commentuser) {
            let commentText = $('form.payin input[name="comment"]').val();
            commentOnUserSupport(userID, commentText);
        }
    });
    // обработка кнопки в БО "Внести средства" ---
}

function renderCommentItemsCompensation(allItems) {
    $('#comment-items-compensation-modal').remove();

    $('#layer-blackout-modal').append('<div class="ah-modal-content" style="background-color: transparent; box-shadow: none; border: none" id="comment-items-compensation-modal"><div class="ah-modal-container" style=""></div></div>');
    var modal = $('#comment-items-compensation-modal');
    var modalContainer = $(modal).find('.ah-modal-container');

    $(modalContainer).append('<div style="width: 480px;" class="ah-modal-column"></div>');

    var modalColumn = $(modalContainer).find('.ah-modal-column');

    $(modalColumn).append('<div class="ah-modal-header"></div>');
    $(modalColumn).append('<div class="ah-modal-body"></div>');
    $(modalColumn).append('<div class="ah-modal-footer" style="text-align: left;"></div>');

    var header = $(modal).find('.ah-modal-header');
    var body = $(modal).find('.ah-modal-body');
    var footer = $(modal).find('.ah-modal-footer');

    $(header).append('<span class="ah-modal-title">Комментирование</span><button type="button" class="ah-modal-close">x</button>');
    $(body).append('<div class="table-scroll"><table class="table table-striped comment-items-compensation-table"><thead><tr><th>ID объявления</th><th>Статус запроса</th></tr></thead><tbody></tbody></table></div>');
    var table = $(body).find('.comment-items-compensation-table');

    var commentText = 'За данное объявление была произведена компенсация';
    var action = 'compensation';
    var delay = 250;

    if (allItems.length >= 25)
        delay = 500;

    allItems.forEach(function (id, i) {
        $(table).find('tbody').append('<tr><td><a target="_blank" href="https://adm.avito.ru/items/item/info/' + id + '" class="ah-visitable-link">' + id + '</a></td><td class="loading-indicator-text" data-item-id="' + id + '" ><span style="color: rgb(149, 149, 149);">Выполняется...</span></td></tr>');

        setTimeout(commentOnItem, i * delay, id, commentText, action);
    });

    $(body).append('<div class="alert alert-warning" style="margin-bottom: 0; font-size: 14px; text-align: center;">Пожалуйста, дождитесь окончания выполнения всех запросов.</div>');

    $(footer).append('<button type="button" class="btn btn-info btn-sm" style="outline: none; font-size: 14px;" id="open-all-items-in-new-window"><span class="glyphicon glyphicon-new-window"></span> Открыть объявления (' + allItems.length + ')</button>');

    $('#layer-blackout-modal').addClass('ah-layer-flex');
    $(modal).show();
    showModal();

    // Обработчики
    var closeBtn = $(modal).find('.ah-modal-close');
    $(closeBtn).click(function () {
        $('#layer-blackout-modal').removeClass('ah-layer-flex');
        $(modal).remove();
        closeModal();
    });

    var openAllBtn = $('#open-all-items-in-new-window');
    $(openAllBtn).click(function () {
        for (var i = 0; i < allItems.length; i++) {
            var isOpened = window.open('https://adm.avito.ru/items/item/info/' + allItems[i]);
            if (!isOpened) {
                alert('В вашем браузере заблокированы всплывающие окна для текущего сайта. Пожалуйста, отключите эту блокировку для сайта adm.avito.ru и повторите попытку.');
                break;
            }
        }
    });
}

function commentItemCompensationHandler(itemId, xhr) {
    var modal = $('#comment-items-compensation-modal');
    var body = $(modal).find('.ah-modal-body');
    var table = $(body).find('.comment-items-compensation-table');

    $(table).find('[data-item-id="' + itemId + '"]').html('<span>Выполнен </span>');

    if ((xhr.status >= 400 || xhr.status < 200) && xhr.responseURL == 'https://adm.avito.ru/comment') {
        $(table).find('[data-item-id="' + itemId + '"]').append('<span data-error>(' + xhr.status + ', ' + xhr.statusText + ')</span>');
        $(table).find('[data-item-id="' + itemId + '"]').parent().addClass('danger');
    }

    $(table).find('[data-item-id="' + itemId + '"].loading-indicator-text').removeClass('loading-indicator-text');

    var indicators = $(table).find('.loading-indicator-text');
    if ($(indicators).length == 0) {
        var errors = $(table).find('[data-error]');
        if ($(errors).length) {
            $(modal).find('.ah-modal-body .alert').removeClass('alert-warning').addClass('alert-danger').text('При выполнении запросов возникли ошибки.');
        } else {
            $(modal).find('.ah-modal-body .alert').removeClass('alert-warning').addClass('alert-success').text('Выполнение всех запросов завершено. Комментарии были успешно проставлены.');
        }

    }
}

function joinWalletLogLinks(links) {
    var result = '';

    var operationIds = [];
    var dates = [];
    var datesMs = [];
    var statusIds = [];
    links.forEach(function (item) {
        var operationId = item.split('operationIds=')[1].split('&')[0];

        var date = item.split('date=')[1].split(' ')[0];
        var year = date.split('/')[2] + '/';
        var month = date.split('/')[1] + '/';
        var day = date.split('/')[0];
        var dateMs = new Date(year + month + day).getTime();

        var statusId = item.split('operationStatusIds[]=')[1].split('&')[0].replace(/\D/g, '');
        operationIds.push(operationId);
        dates.push({
            date: date,
            dateMs: dateMs
        });
        datesMs.push(dateMs);

        statusIds.push(statusId);
    });

    minDateMs = Math.min.apply(null, datesMs);
    maxDateMs = Math.max.apply(null, datesMs);
    var minDate = dates.filter(function (item) {
        return item.dateMs == minDateMs;
    });
    minDate = minDate[0].date;
    var maxDate = dates.filter(function (item) {
        return item.dateMs == maxDateMs;
    });
    maxDate = maxDate[0].date;

    statusIds = unique(statusIds);
    var allStatusesStr = '';
    statusIds.forEach(function (id) {
        allStatusesStr += '&operationStatusIds[]=' + id;
    });

    var dateRange = (minDate === maxDate) ? minDate + '+00:00' : minDate + '+00:00+-+' + maxDate + '+23:59';

    result = 'https://adm.avito.ru/billing/walletlog?date=' + dateRange + '&operationIds=' + operationIds.join('%2C') + allStatusesStr;
    return result;
}

function userViewOperations() {
    let rows = $('table.account-history tr[data-oid]');
    let reg = /(?:резервирование|применение|списание (?:при|остатка|зарезервированных|из|за)|корректировка за)/i;
    
    $(rows).each(function(i, row) {
        let text = $(row).text();
        if (reg.test(text)) {
            $(row).addClass('user-view-operaion');
        }
    });
    
    toggleUserViewOperations();
}

function toggleUserViewOperations() {
    var isCheckedAttr;
    var rows = $('table .user-view-operaion:not(.table-background-highlight)');
    var lsItem = 'userViewOperations';
    var lsObj = JSON.parse(localStorage.getItem(lsItem));

    if (lsObj && lsObj['visibility'] === 'hidden') {
        $(rows).hide();
        isCheckedAttr = 'checked';
    } else {
        $(rows).show();
        isCheckedAttr = '';
    }

    var block = $('#history');
    $(block).append(
        '<div class="ah-switch-wrapper" style="position: absolute; right: 55.5px; margin-top: -30px;">'+
            '<input type="checkbox" class="ah-switch-checkbox" '+
            'id="user-view-operations-toogler" ' + isCheckedAttr + '>'+
            '<label class="ah-switch-label" for="user-view-operations-toogler" title="Переключает режим отображения операций, которые видит пользователь в ЛК">'+
            '<span>Глазами пользователя</span>'+
            '</label>'+
        '</div>');

    var switcher = $('#user-view-operations-toogler');

    $(switcher).click(function () {
        var lsItem = 'userViewOperations';
        if (!localStorage.getItem(lsItem)) {
            localStorage.setItem(lsItem, '{"visibility": "visible"}');
        }

        var lsObj = JSON.parse(localStorage.getItem(lsItem));

        if (document.getElementById('user-view-operations-toogler').checked) {
            lsObj['visibility'] = 'hidden';
            $(rows).hide();
        } else {
            lsObj['visibility'] = 'visible';
            $(rows).show();
        }
        localStorage.setItem(lsItem, JSON.stringify(lsObj));
    });
}