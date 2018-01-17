function countMoneyAccount() {
    let userID = $('.form-group:contains(ID пользователя) a').text();

    if (!localStorage['users/account/info/countMoney']) {
        resetLocalStorageCountMoney();
    }

    let countMoneyObj = JSON.parse(localStorage['users/account/info/countMoney']);
    let currentUserIDonMoney = countMoneyObj.currentUser;
    if (currentUserIDonMoney.indexOf(userID) === -1) {
        resetLocalStorageCountMoney();
    }

    renderMoneyCounter();

    let moneyCounterBlock = $('#money-counter-block');
    let moneyCounterToggler = $('#money-counter-toggler');

    let rightPos = 2;
    if (countMoneyObj.counterVisibility === 'hidden') {
        hideMoneyCounter();
    } else {
        $(moneyCounterBlock).css('right', '' + rightPos + 'px');
    }
    $(moneyCounterBlock).css('visibility', 'visible');

    $(moneyCounterToggler).click(function () {
        let transitionValue = $(moneyCounterBlock).css('transition');
        if (transitionValue.indexOf('right 0.25s') === -1) {
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

    let rows = $('.account-history tr[data-oid]');
    $(rows).each(function(){
        let amountClassList = $(this).find('.text-nowrap span').attr('class');
        let btnData = {
            itemLink: $(this).find('td:eq(1) a').attr('href'),
            amount: $(this).find('.text-nowrap span').text().replace(',', '.').replace(/[^\d.]/g, '').replace(/.$/, ''),
            description: $(this).find('td:eq(1)').text().replace(/\n/g, "").replace(/ {2,}/g, ""),
            wlLink: $(this).find('.text-nowrap a').attr('href'),
            oid: $(this).attr('data-oid'),
            date: $(this).find('td:eq(0)').html().replace(/<br>/g, ', '),
            method: $(this).find('.payment-method').text(),
            methodProvider: $(this).find('.payment-method').next('.gray').text(),
            status: $(this).find('.text-nowrap a').text(),
            amountType: getCountMoneyAmountType(amountClassList),
            userId: userID
        };
        let btn = getCountMoneyBtn(btnData);
        $(this).find('td:last').append(btn);
    });
}

function countMoneyWalletlog() {
    if (!localStorage['users/account/info/countMoney']) {
        resetLocalStorageCountMoney();
    }

    let countMoneyObj = JSON.parse(localStorage['users/account/info/countMoney']);

    renderMoneyCounter();

    let moneyCounterBlock = $('#money-counter-block');
    let moneyCounterToggler = $('#money-counter-toggler');

    let rightPos = 2;
    if (countMoneyObj.counterVisibilityWalletlog === 'hidden') {
        hideMoneyCounter();
    } else {
        $(moneyCounterBlock).css('right', '' + rightPos + 'px');
    }
    $(moneyCounterBlock).css('visibility', 'visible');

    $(moneyCounterToggler).click(function () {
        let transitionValue = $(moneyCounterBlock).css('transition');
        if (transitionValue.indexOf('right 0.25s') === -1) {
            $(moneyCounterBlock).css('transition', 'right 0.25s');
        }
        let isVisible = $(moneyCounterBlock).hasClass('money-counter-visible');
        let lsObj = JSON.parse(localStorage['users/account/info/countMoney']);

        if (isVisible) {
            hideMoneyCounter();
            lsObj.counterVisibilityWalletlog = 'hidden';
        } else {
            $(moneyCounterBlock).addClass('money-counter-visible');
            $(moneyCounterBlock).css('right', '2px');
            $(this).html('<span class="glyphicon glyphicon-menu-right"></span>');
            lsObj.counterVisibilityWalletlog = 'visible';
        }

        localStorage['users/account/info/countMoney'] = JSON.stringify(lsObj);
    });

    let rows = $('.billing .table tbody tr');
    $(rows).each(function(){
        let amountClassList = $(this).find('td:eq(8) span').attr('class');
        let btnData = {
            itemLink: $(this).find('td:eq(4) a').attr('href'),
            amount: $(this).find('td:eq(8) span').text().replace(',', '.').replace(/[^\d.]/g, '').replace(/.$/, ''),
            description: $(this).find('td:eq(4)').text().replace(/\n/g, ""),
            oid: $(this).find('td:eq(0)').text().trim(),
            date: $(this).find('td:eq(2)').html().split('<br>')[0].trim(),
            method: $(this).find('td:eq(6)').text().trim(),
            methodProvider: $(this).find('td:eq(7)').html().replace(/<br>(?:\s+)?/g, ' ').trim(),
            status: $(this).find('td:last').text().trim(),
            amountType: getCountMoneyAmountType(amountClassList),
            userId: $(this).find('td:eq(3) a:first').text().trim()
        };

        btnData.wlLink = (function() {
            let changedDate = btnData.date.replace(/\./g, '/');
            let statusId = '';
            $('[name="operationStatusIds[]"] option').each(function() {
                if ($(this).text().trim() === btnData.status) {
                    statusId = $(this).val();
                }
            });
            return `/billing/walletlog/?operationIds=${btnData.oid}&date=${changedDate}&operationStatusIds[]=${statusId}`;
        })();
        let btn = getCountMoneyBtn(btnData);
        $(this).find('td:first').append(btn);
    });
}

function renderMoneyCounter() {
    let countMoneyObj = JSON.parse(localStorage['users/account/info/countMoney']);

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

    $(moneyCounterWrapper).append(`
        <div class="money-counter-current-user">
            Пользователь: <a target="_blank" id="money-counter-user-id"></a>, 
            <i><a target="_blank" id="money-counter-user-account"></a></i>
        </div>
    `);

    if (countMoneyObj.operations.length !== 0) {
        showMoneyCounterCurrentUser();
    }

    setFixedElemUnderFooter($('#money-counter-block'), 2);

    let moneyCounterValue = $('#money-counter-value');

    renderMoneyCounterMoreTable();

    var setToZeroBtn = $('#money-counter-set-to-zero');
    $(setToZeroBtn).click(function () {
        resetLocalStorageCountMoney();
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

        $(moneyCounterValue).text(lsObj.value);

        let operationsCounters = $(moneyCounterBlock).find('.operations-counter');
        let operationsText = getMoneyCounterOperationsCounterText();
        $(operationsCounters).text(operationsText);

        setTimeout(() => {
            $(moneyCounterValue).css('visibility', 'visible');
        }, 100);

        if (lsObj.operations.length === 0) {
            $('.money-counter-current-user').hide();
        } else {
            showMoneyCounterCurrentUser();
        }
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

function getCountMoneyAmountType(amountClassList) {
    let amountType = '';
    if (~amountClassList.indexOf('amount-payment')) {
        amountType = 'payment';
    } else if (~amountClassList.indexOf('amount-payin')) {
        amountType = 'payin';
    } else {
        amountType = 'undefined';
    }

    return amountType;
}

function getCountMoneyBtn(data) {
    let countMoneyObj = JSON.parse(localStorage['users/account/info/countMoney']);
    let moneyCounterBlock = $('#money-counter-block');
    let allOids = countMoneyObj.operations.map(function (operation) {
        return operation.id;
    });

    let itemLink = data.itemLink || '';
    let itemId = itemLink.split('/')[4];

    let value = '+';
    let btnClass = 'btn-success';

    if (~allOids.indexOf(data.oid)) {
        value = '-';
        btnClass = 'btn-danger';
    }

    let add = $('<input/>', {
        type: 'button',
        class: 'btn btn-default btn-xs calculate',
        value: value,
        oid: data.oid,
        date: data.date,
        method: data.method,
        methodProvider: data.methodProvider,
        status: data.status,
        itemId: itemId,
        wlLink: data.wlLink,
        amount: data.amount,
        description: data.description,
        amountType: data.amountType,
        userId: data.userId,
        click: function () {
            let userId = $(this).attr('userId');
            let lsObj = JSON.parse(localStorage['users/account/info/countMoney']);

            let currentUserIDonMoney = lsObj.currentUser;
            if (currentUserIDonMoney.indexOf(userId) === -1) {
                resetLocalStorageCountMoney();
            }

            let itemId = $(this).attr('itemId');
            let reason = '';
            let itemStatusText = $('.parsed-item-info[data-item-id="' + itemId + '"] span:first').text();
            if (~itemStatusText.indexOf('Blocked')) {
                reason = $('.parsed-item-info[data-item-id="' + itemId + '"] span:last').text();
            }

            let operation = {
                id: $(this).attr('oid'),
                date: $(this).attr('date'),
                description: $(this).attr('description'),
                method: $(this).attr('method'),
                methodProvider: $(this).attr('methodProvider'),
                amount: $(this).attr('amount'),
                status: $(this).attr('status'),
                wlLink: $(this).attr('wlLink'),
                itemId: itemId,
                reason: reason,
                amountType: $(this).attr('amountType'),
                userId: userId
            };

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

    return add;
}

function resetLocalStorageCountMoney() {
    let counterVisibility = 'visible';
    let moreInfoVisibility = 'hidden';
    let counterVisibilityWalletlog = 'visible';
    if (localStorage['users/account/info/countMoney']) {
        let lsObj = JSON.parse(localStorage['users/account/info/countMoney']);
        counterVisibility = lsObj.counterVisibility;
        moreInfoVisibility = lsObj.moreInfoVisibility;
        counterVisibilityWalletlog = lsObj.counterVisibilityWalletlog || 'visible';
    }

    let lsObj = {
        currentUser: '',
        value: '0.00',
        operations: [],
        counterVisibility: counterVisibility,
        moreInfoVisibility: moreInfoVisibility,
        counterVisibilityWalletlog: counterVisibilityWalletlog
    };
    localStorage['users/account/info/countMoney'] = JSON.stringify(lsObj);

    let moneyCounterBlock = $('#money-counter-block');
    let moneyCounterValue = $('#money-counter-value');

    $(moneyCounterValue).css('visibility', 'hidden');
    $('.calculate').attr('value', '+');
    $('.calculate').removeClass('btn-danger');
    $('.calculate').addClass('btn-success');
    renderMoneyCounterMoreTable();

    $(moneyCounterValue).text(lsObj.value);

    let operationsCounters = $(moneyCounterBlock).find('.operations-counter');
    let operationsText = getMoneyCounterOperationsCounterText();
    $(operationsCounters).text(operationsText);
    setTimeout(() => {
        $(moneyCounterValue).css('visibility', 'visible');
    }, 100);

    $('.money-counter-current-user').hide();
}

function showMoneyCounterCurrentUser() {
    let lsObj = JSON.parse(localStorage['users/account/info/countMoney']);
    let userId = lsObj.currentUser;

    $('#money-counter-user-id').attr('href', `https://adm.avito.ru/users/user/info/${userId}`)
        .text(`${userId}`);
    $('#money-counter-user-account').attr('href', `https://adm.avito.ru/users/account/info/${userId}`)
        .text(`Счёт`);

    $('.money-counter-current-user').show();
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
    $(moneyCounterToggler).html('<span class="glyphicon glyphicon-menu-left"></span>');
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
    let moneyCounterBlock = $('#money-counter-block');
    let moneyCounterValue = $('#money-counter-value');
    let operationsCounters = $(moneyCounterBlock).find('.operations-counter');

    let lsObj = JSON.parse(localStorage['users/account/info/countMoney']);
    let isExisting = false;
    for (let i = 0; i < lsObj.operations.length; i++) {
        if (lsObj.operations[i].id === operation.id) {
            lsObj.operations.splice(i, 1);
            isExisting = true;
            break;
        }
    }

    lsObj.operations.push(operation);

    if (!isExisting) {
        let moneyAmount = parseFloat(lsObj.value);
        moneyAmount += parseFloat(operation.amount);
        lsObj.value = moneyAmount.toFixed(2);
    }

    addMoneyCounterMoreRow(operation);

    $('.calculate[oid="' + operation.id + '"]').attr('value', '-').removeClass('btn-success').addClass('btn-danger');

    $(moneyCounterValue).text(lsObj.value);

    lsObj.currentUser = operation.userId;

    localStorage['users/account/info/countMoney'] = JSON.stringify(lsObj);
    showMoneyCounterCurrentUser();

    let operationsText = getMoneyCounterOperationsCounterText();
    $(operationsCounters).text(operationsText);
}
function removeMoneyCounterOperation(operation) {
    let moneyCounterBlock = $('#money-counter-block');
    let moneyCounterValue = $('#money-counter-value');
    let markedOperationsInfoBlock = $('#money-counter-marked-operations-info');
    let markedOperationsInfoTableBody = $(markedOperationsInfoBlock).find('tbody');
    let operationsCounters = $(moneyCounterBlock).find('.operations-counter');

    let lsObj = JSON.parse(localStorage['users/account/info/countMoney']);
    let isExisting = false;
    for (let i = 0; i < lsObj.operations.length; i++) {
        if (lsObj.operations[i].id === operation.id) {
            lsObj.operations.splice(i, 1);
            isExisting = true;
            break;
        }
    }

    let moneyAmount = parseFloat(lsObj.value);
    moneyAmount -= parseFloat(operation.amount);
    lsObj.value = moneyAmount.toFixed(2);

    $(moneyCounterValue).text(lsObj.value);

    lsObj.currentUser = operation.userId;

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

        $('.money-counter-current-user').hide();
    }

    $('.calculate[oid="' + operation.id + '"]').attr('value', '+').removeClass('btn-danger').addClass('btn-success');
}