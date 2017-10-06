// Добавление объявлений в базу данных
function allowlist(currentUrl, agentLogin) {
    // var itemID = currentUrl.split('/');
    var itemID = currentUrl.replace(/\D/gi, '');
    $('.status-buttons').append('<div id="allowlist" class="btn btn-default green">Allow list</div>');

    $('#allowlist').click(function () {
        allowListtoJSONitem(agentLogin, itemID);
    });
}

function allowListtoJSONitem(agentID, itemID) {
    if (localStorage.allowList.indexOf(itemID) == -1) {
        var time = currentTime();

        var jsonItem = {
            agentID : agentID,
            itemID : itemID,
            status : 'check',
            time : time
        };


        allowListSendLogServer(jsonItem);

        localStorage.allowList += '|'+itemID+'&'+time;
    } else {
        alert('Вы уже добавили данное объявление на проверку. Пожалуйста, будьте терпеливы и дождитесь результата. Как только ваше объявление будет проверенно в Notification Bar появится уведомление об этом.');
    }
}

function allowListSendLogServer(log) {
    var data = JSON.stringify(log);

    chrome.runtime.sendMessage({
            action: 'XMLHttpRequest',
            method: "POST",
            url: "http://avitoadm.ru/support_helper/allowlist/allowlist.php",
            headers: 'json',
            data: data,
        }, function(response) {
            console.log(response);
        }
    );
}

// Добавления сообщения о проверке объявления в базе данных
function allowListMSG(currentUrl, agentLogin) {
    if (currentUrl.indexOf('?st=')+1) {
        var url = currentUrl.split('/');
        var info = url[6].split('?');
        var itemID = info[0];
        var startTime = info[1].split('=');

        $('.status-buttons').append('<div id="itemChecked" class="btn btn-default green">Checked</div>');

        $('#itemChecked').click(function () {
            var msg = prompt('Введите статус проверки объявления:', 'ok');
            if (msg != null) {
                if (msg.toLowerCase() == 'ok' || msg.toLowerCase() == 'ок') {
                    window.location.replace('https://adm.avito.ru/items/item/activate/' + itemID +'');
                }

                changeAllowListItem(itemID, startTime[1], 'status', 'checked');
                changeAllowListItem(itemID, startTime[1], 'msg', msg);

            }
        });
    }
}


function userInfoOnItem() {
    var id = $('a[href^="/users/user/info/"]').attr('href').split('/')[4];
    var itemid = $('form').attr('data-item-id');
    var category = $('#fld_category_id :selected').attr('value');
    var param = $('.js-component__parameters select.form-control:eq(1)').attr("data-id");
    var paramid = $('.js-component__parameters select.form-control:eq(1) :selected').attr('value');
    var params = '{&quot;'+param+'&quot;: '+paramid+'}';
    var cityItem = $('[data-city-id]').val();

    // USER INFO and USER ABUSE
    $('.form-group:contains(Пользователь) div.form-control-static').append('<div class="ah-item-user-info"></div>');

    $('.ah-item-user-info')
        .append('<a class="userInfoActionButton" cityItem="'+cityItem+'" userid="'+id+'" itemid="'+itemid+'" data-category="'+category+'" data-params-map="'+params+'" style="margin-left: 10px;">Info</a>')
        .append('<a class="userAbuseActionButton" useridab="'+id+'" itemidab="'+itemid+'" style="margin-left: 10px;">Abuses</a>')
        .append('<a class="userWalletActionButton" userid="'+id+'" itemid="'+itemid+'" style="margin-left: 10px;">WL</a>');

    usersInfoAction();
}


// кол центра

function callCenter() {
    if (userGlobalInfo.subdivision === 'RC' || userGlobalInfo.subdivision === 'SD' || userGlobalInfo.subdivision === 'DTR'
        || userGlobalInfo.subdivision === 'DRE' || userGlobalInfo.subdivision === 'DJB' || userGlobalInfo.subdivision === 'DSR'
        || userGlobalInfo.subdivision === 'DBH' || userGlobalInfo.subdivision === 'D3D' || userGlobalInfo.subdivision === 'DLV'
        || userGlobalInfo.subdivision === 'DC' || userGlobalInfo.subdivision === 'TL' || userGlobalInfo.subdivision === 'ME') {

        rejectByCall();
        timeInCity();

    }
}

function rejectByCall() {
    var id = location.href.replace(/\D/g, '');

    let allRbcCount = 0;
    let allRbcUsers = new Map();
    $('#dataTable tbody tr').each(function() {
        let commentText = $(this).find('td:last').text();
        if (~commentText.indexOf('#rbc')) {
            allRbcCount++;
            let commentUser = $(this).find('td:eq(1)').text().trim();
            if (allRbcUsers.has(commentUser)) {
                allRbcUsers.set(commentUser, allRbcUsers.get(commentUser) + 1);
            } else {
                allRbcUsers.set(commentUser, 1);
            }
        }
    });

    let usersTable = $.parseHTML(`<div></div>`);
    if (allRbcCount !== 0) {
        usersTable = $(usersTable).append(`<div><table class="table table-condensed table-striped"><thead><tr><td><b>Пользователь</b></td><td><b>Количество</b></td></tr></thead><tbody></tbody></table></div>`);
        allRbcUsers.forEach(function(value, key) {
            let tableBody = $(usersTable).find('tbody');
            $(tableBody).append(`<tr><td>${key}</td><td>${value}</td></tr>`)
        });
    }

    $('.calls .col-xs-9').append(`<input data-html="true" data-toggle="popover" data-trigger="hover" title="" data-content="${$(usersTable).html().replace(/"/g, "&quot;")}" 
        id="rbc" type="button" class="btn btn-sm btn-default calls-btn_good" value="RBC ${allRbcCount}" style="color: #a12fff">`);

    $('#rbc').popover();

    $('#rbc').click(function () {
        commentOnItem(id, 'action_by_call обработано телефонной модерацией RE #rbc');
        location.reload();
    });
}

function timeInCity() {
    let city = $('#region option:selected').text();

    let url = 'https://yandex.ru/search/?text=Время в ' + city;

    chrome.runtime.sendMessage({
        action: 'XMLHttpRequest',
        method: "GET",
        url: url
    }, function(response) {
        let time = $(response).find('.z-time__line').html();

        $('#f_location_id').append('<span class="col-xs-3 control-label currentTimeInCity">Текущее время в ' + time + '</span>');
    });
}

function allowItem() {
    $('a:contains(Одобрить)').click(function (e) {
        e.preventDefault();
        $(this).detach();

        let id = $('#form_item').attr('data-item-id');
        allowItemRequest(id);
    });
}

function allowItemRequest(id) {
    let href = 'http://spring.avitoadm.ru/avito/item/activate';
    
    chrome.runtime.sendMessage({
            action: 'XMLHttpRequest',
            url: href,
            method: 'POST',
            contentType: 'application/json',
            data: id
        },
        function(response) {
            outTextFrame(response);

            if (response === 'Item activated') {
                commentOnItem(id, 'одобрил(а)');

                location.reload();
            }
        }
    );
}

function hideBlockUserButton() {
    $('button[name="user_block"]').parents('.b-antifraud-section').hide();
}

function copyItemOnItemInfo() {
    let subhead = ('.subhead');
    $(subhead).append(`
        <div class="btn-group" style="margin-left: 10px;">
            <button title="Скопировать ID объявления" type="button" class="btn btn-sm btn-default" id="copyItemId">
                <span class="glyphicon glyphicon-copy"></span> ID
            </button>
            <button title="Скопировать ID и заголовок объявления" type="button" class="btn btn-sm btn-default" id="copyItemIdWithTitle">
                <span class="glyphicon glyphicon-copy"></span> ID и заголовок
            </button>
        </div>
    `);

    let itemTitle = $(subhead).find('a').text();
    let itemId = getParamsItemInfo().id;

    $('#copyItemId').click(function () {
        let text = `№${itemId}`;
        chrome.runtime.sendMessage( { action: 'copyToClipboard', text: text } );
        outTextFrame(`Скопировано: ${text}`);
    });

    $('#copyItemIdWithTitle').click(function () {
        let text = `№${itemId} («${itemTitle}»)`;
        chrome.runtime.sendMessage( { action: 'copyToClipboard', text: text } );
        outTextFrame(`Скопировано: ${text}`);
    });


}

// инфо о Refund
function addRefundInfo() {
    let historyTable = $('.loadable-history:eq(0) .table'),
        admHistoryTable = $('.loadable-history:eq(1) .table');

    addRefundInfoBtns(historyTable);
    addRefundInfoBtns(admHistoryTable);

    chrome.runtime.onMessage.addListener(function (request) {
        if (request.onUpdated === 'itemHistory') {
            setTimeout(() => {
                addRefundInfoBtns(historyTable);
            }, 100);
        }

        if (request.onUpdated === 'itemAdmHistory') {
            setTimeout(() => {
                addRefundInfoBtns(admHistoryTable);
            }, 100);
        }
    });

}

function addRefundInfoBtns(table) {
    if ($(table).find('thead tr .ah-additional-refund-cell').length === 0 && ~$(table).text().indexOf('Refund')) {
        $(table).find('thead tr').append('<th class="ah-additional-refund-cell"></th>');
    } else {
        return;
    }

    if ($(table).parents('.overlay-container').length === 0) {
        $(table).parents('.table-scroll').wrap('<div class="overlay-container"></div>');
    }

    $(table).find('tbody tr').each(function () {
        let searchCell = $(this).find('td:eq(1)'),
            dateCell = $(this).find('td:eq(0)'),
            dateTextFormatted = $(dateCell).text().replace(/\./g, '/').slice(0, -3);

        if ($(this).find('.ah-additional-refund-cell').length === 0) {
            $(this).append(`<td class="ah-additional-refund-cell" rowspan="1"></td>`);
        }

        if (~$(searchCell).text().indexOf('Refund') && $(this).find('.ah-get-refund-info').length === 0) {
            let additionalCell = $(this).find('.ah-additional-refund-cell'),
                sameBtns = $(table).find(`.ah-get-refund-info[data-date="${dateTextFormatted}"]`);

            if ($(sameBtns).length > 0) {
                let firstBtn = $(sameBtns)[0],
                    firstCell = $(firstBtn).parents('.ah-additional-refund-cell'),
                    firstCellRowspan = $(firstCell).attr('rowspan');

                $(firstCell).attr('rowspan', ++firstCellRowspan);
                $(additionalCell).remove();
                return;
            }

            $(additionalCell).append(`
                <button title="Посмотреть информацию об операциях" data-date="${dateTextFormatted}" 
                class="btn btn-info btn-xs ah-get-refund-info">
                    <span class="glyphicon glyphicon-info-sign"></span>
                </button>
            `);

            $(additionalCell).find('.ah-get-refund-info').click(function () {
                let data = {
                    dateRange: `${$(this).data('date')} - ${$(this).data('date')}`,
                    itemId: $('form[data-item-id]').data('itemId'),
                    getUrl: function() {
                        return `https://adm.avito.ru/billing/walletlog?date=${this.dateRange}&itemIds=${this.itemId}&paymentMethodIds%5B%5D=114`
                    },
                    clickedElem: $(this)
                };

                btnLoaderOn($(this));
                getAdmWithSuperAcc(data.getUrl())
                    .then(
                        response => renderRefundInfo(response, data),
                        error => alert(error)
                    )
                    .then(() => btnLoaderOff($(this)));
            });
        }
    });
}

function renderRefundInfo(responseBody, data) {
    let responseRows = $(responseBody).find('.billing .table tbody tr'),
        resultRows = ``,
        resultContent = `<h6>Дата: <span class="text-muted">${data.dateRange.split('-')[0]}</span></h6>`,
        totalAmount = 0,
        userId = +$('[href^="/users/user/info/"]').attr('href').replace(/\D/g, ''),
        overlayContainer = $(data.clickedElem).parents('.overlay-container'),
        hasMorePages = !!($(responseBody).find('ul.pagination').length);

    if ($(responseRows).length === 0) {
        resultContent += `
            <div class="alert alert-warning text-center">
                По данному объявлению за указанную дату операции в Wallet Log не найдены
            </div>
        `;
    } else if (hasMorePages) {
        resultContent += `
            <div class="alert alert-warning text-center">
                По данному объявлению за указанную дату в Wallet Log найдено более одной страницы операций.
                Доступна только общая информация.
            </div>
            <div class="text-center">
                <button class="btn btn-link ah-pseudo-link ah-get-total-refund-info">
                    Посмотреть общую информацию
                </button>
            </div>
        `;
    } else {
        $(responseRows).each(function () {
            let amountCell = $(this).find('td:eq(8)'),
                amountText = $(amountCell).text(),
                amountPopover = $(amountCell).find('.js-popover'),
                amountPopoverContent = $(amountPopover).data('content'),
                replacedContent = amountPopoverContent.replace('billing-amount-real', 'text-info')
                    .replace('billing-amount-promo', 'text-success');

            totalAmount += parseFloat(amountText.slice(1).replace(/,/, '.').replace(/\s+/g, ''));
            $(amountPopover).attr('data-content', replacedContent);
            resultRows += `
                <tr><td>${$(this).find('td:eq(4)').html()}</td><td class="text-nowrap">${$(amountCell).html()}</td></tr>
            `;
        });

        resultContent += `
            <div class="table-scroll">
                <table class="table table-bordered table-condensed">
                    <thead><tr><th>Операция</th><th>Сумма</th></tr></thead>
                    <tbody>${resultRows}</tbody>
                </table>
            </div>
        `;
    }

    $(overlayContainer).append('<div class="ah-overlay show"></div>');
    $(data.clickedElem).parents('.ah-additional-refund-cell').popover({
        container: 'body',
        html: true,
        title: `
                <b>Всего: </b><span class="ah-refund-total-amount">${totalAmount.toFixed(2)}</span> руб.
                <span class="ah-refund-info-title-links">
                    <a target="_blank" href="/users/account/info/${userId}">Счёт</a> | 
                    <a target="_blank" href="${data.getUrl()}">Wallet Log</a>
                </span>
                `,
        content: resultContent,
        trigger: 'manual',
        placement: 'top',
        template: `
                <div class="popover ah-refund-info-popover ah-popover-destroy-outclicking">
                    <div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div>
                </div>
                `
    }).on('hide.bs.popover', function() {
        $(overlayContainer).find('.ah-overlay').remove();
    }).popover('show');

    let popover = $('.ah-refund-info-popover');
    copyDataTooltip( $(popover).find('.ah-refund-total-amount'), {
        placement: 'right',
        title: getCopyTooltipContentAlt('скопировать с шаблоном'),
        getTextAlt: function(elem) {
            return 'Мы компенсировали затраченные средства в размере ' + $(elem).text() + ' рублей, они были зачислены на Ваш Кошелек Avito.\n\n' +
            'Вы можете воспользоваться этими средствами для оплаты дополнительных услуг и сервисов на Avito. ' +
            'История операций доступна по ссылке: https://www.avito.ru/account/history';
        },
        getNotificationAlt: () => 'Скопировано с шаблоном'
    });
    $(popover).find('.js-popover').addClass('ah-pseudo-link').popover();

    let totalRefundBtn = $('.ah-get-total-refund-info');
    if ($(totalRefundBtn).length !== 0) {
        $(totalRefundBtn).click(function () {
            let totalData = {
                dateRange: data.dateRange,
                itemId: data.itemId,
                getUrl: function() {
                    return `https://adm.avito.ru/billing/walletlog/total?date=${this.dateRange}&itemIds=${this.itemId}&paymentMethodIds%5B%5D=114`
                },
                clickedElem: $(this)
            };

            btnLoaderOn($(this));
            getAdmWithSuperAcc(totalData.getUrl())
                .then(
                    response => renderTotalRefundInfo(response, totalData),
                    error => alert(error)
                )
                .then(() => btnLoaderOff($(this)));
        });
    }
}

function renderTotalRefundInfo(responseBody, data) {
    let json = JSON.parse(responseBody),
        clickedElem = data.clickedElem;

    $(clickedElem).popover({
        html: true,
        placement: 'left',
        content: `
                <ul class="list-group">
                    <li class="list-group-item">
                        <b>Всего операций: </b>${json.count}
                    </li>
                    <li class="list-group-item">
                        <b>Сумма входящих операций: </b> 
                        <span class="ah-total-refund-total-amount">${json.amount.acquired.total.toFixed(2)}</span> руб.
                    </li>
                    <li class="list-group-item">
                        <b>Сумма исходящих операций: </b> ${json.amount.spent.total.toFixed(2)} руб.
                    </li>
                </ul>
                `,
        template: `
                <div class="popover ah-total-refund-info-popover ah-popover-destroy-outclicking">
                    <div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div>
                </div>
                `
    }).popover('show');

    let popover = $('.ah-total-refund-info-popover');
    copyDataTooltip( $(popover).find('.ah-total-refund-total-amount'));
}

// Сравнение айтемов
function addCompareItemsItemInfo() {
    $('.col-xs-5').prepend(`
        <div class="input-group">
            <span class="input-group-btn">
                <button class="btn btn-primary btn-sm" type="button" id="compare-items-btn">Сравнить с</button>
            </span>
            <input type="text" class="form-control input-sm" placeholder="Объявления" name="compareItems">
            <span class="input-group-addon" id="compare-items-info" data-toggle="tooltip" data-placement="left" 
                title="Вставьте ID объявлений, разделенные нечислом">
                <span class="glyphicon glyphicon-info-sign"></span>
            </span>
        </div>
    `);



    $('#compare-items-info').tooltip();
    $('#compare-items-btn').click(function() {
        // let value = $('[name="compareItems"]').val();
        // let items = value.match(/\d+/g);
        //
        // if (!items) return;

        let items = ['1216808540', '1161032058', '1197725249', '967847815', '1011796217', '1103540495', '747120253'];
        // let items = ['1161032058', '1197725249'];
        items.unshift(getParamsItemInfo().id.toString());
        let btn = $(this);
        btnLoaderOn($(btn));
        ahCompareItems(items, function() {
            return btnLoaderOff($(btn));
        });
    });
}