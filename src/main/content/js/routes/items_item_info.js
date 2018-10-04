function vinSymbolCount() {
    const $vinFormGroupSelector = $('.form-group:contains(VIN или номер кузова)');
    if ($vinFormGroupSelector.length > 0) {
        const $vinInputSelector = $vinFormGroupSelector.find('#flt_param_836');
        const vin = $vinInputSelector.val();

        let alert = 'ah-alert';
        let title = '';
        if (vin.length === 17) {
            alert = 'ah-alert-success';
            title += '- корректное кол-во символов\n';
        }
        if (vin.length < 17) {
            alert = 'ah-alert-warning';
            title += '- недостаточное кол-во символов\n';
        }
        if (~vin.search(/i/i) || ~vin.search(/q/i) || ~vin.search(/o/i)) {
            alert = 'ah-alert-danger';
            title += '- присутствуют запрещеные символы: q, i, o\n';
        }

        $vinInputSelector.after(`<div class="ah-vin-symbol-count ${alert}" title="${title}">Символов: ${vin.length}</div>`);
    }
}


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
    if (localStorage.allowList.indexOf(itemID) === -1) {
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
            url: `${global.connectInfo.ext_url}/support_helper/allowlist/allowlist.php`,
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
                if (msg.toLowerCase() === 'ok' || msg.toLowerCase() === 'ок') {
                    window.location.replace(`${global.connectInfo.adm_url}/items/item/activate/${itemID}`);
                }

                changeAllowListItem(itemID, startTime[1], 'status', 'checked');
                changeAllowListItem(itemID, startTime[1], 'msg', msg);

            }
        });
    }
}


function userInfoOnItem() {
    const id = $('a[href^="/users/user/info/"]').attr('href').split('/')[4];
    const email = $('.js-autoselect').text().trim();
    const itemid = $('form').attr('data-item-id');
    const category = $('#fld_category_id :selected').attr('value');
    const param = $('.js-component__parameters select.form-control:eq(1)').attr("data-id");
    const paramid = $('.js-component__parameters select.form-control:eq(1) :selected').attr('value');
    const params = '{&quot;'+param+'&quot;: '+paramid+'}';
    const cityItem = $('[data-city-id]').val();

    // USER INFO and USER ABUSE
    $('.form-group:contains(Пользователь) div.form-control-static').append('<div class="ah-item-user-info"></div>');

    const $blockUserInfo = $('.ah-item-user-info');


    if (isAuthority('ROLE_USER_INFO_INFO')) {
        $blockUserInfo
            .prepend('<span class="ah-userInfoActionButton ah-user-api" data-user-id="'+id+'" data-item-id="'+itemid+'" title="Info"><i class="glyphicon glyphicon-info-sign"></i></span>');
    }
    if (isAuthority('ROLE_USER_INFO_ABUSES')) {
        $blockUserInfo
            .prepend('<span class="ah-userAbuseActionButton ah-user-api" data-user-id="'+id+'" data-item-id="'+itemid+'" title="Abuse"><i class="glyphicon glyphicon-fire"></i></span>');
    }
    if (isAuthority('ROLE_USER_INFO_WL')) {
        $blockUserInfo
            .prepend('<span class="ah-userWalletActionButton ah-user-api" data-user-id="'+id+'" data-item-id="'+itemid+'" title="WalletLog"><i class=" glyphicon glyphicon-ruble"></i></span>');
    }
    if (isAuthority('ROLE_USER_INFO_SHOW_ITEMS')) {
        $blockUserInfo
            .prepend('<span class="ah-userShowItemsActionButton ah-user-api" data-user-id="'+id+'" data-item-id="'+itemid+'" data-email="'+email+'" title="Show items"><i class="glyphicon glyphicon-list-alt"></i></span>');
    }
    if (isAuthority('ROLE_USER_INFO_MESSENGER')) {
        $blockUserInfo
            .prepend('<span class="ah-userMessengerActionButton ah-user-api" data-user-id="'+id+'" data-item-id="'+itemid+'" title="Messenger"><i class="glyphicon glyphicon-send"></i></span>');
    }


    usersInfoAction();
}


// кол центра
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

    $('#rbc')
        .popover()
        .click(function () {
            commentOnItem(id, '[Admin.Helper.Action.Call] обработано телефонной модерацией RE #rbc');
            location.reload();
        });
}

function timeInCity() {
    const city = $('#region').find('option:selected').text();

    const url = 'https://www.google.ru/search?q=Время в ' + city;

    chrome.runtime.sendMessage({
        action: 'XMLHttpRequest',
        method: "GET",
        url: url
    }, function(response) {
        const $timeNode = $(response).find('#rso div:eq(0)');
        const $clockNode = $timeNode.find('[role="heading"]');

        $timeNode.find('h2').remove();
        $timeNode.find($clockNode).remove();

        $('body').append(`
            <div class="ah-currentTimeInCity">
                <h5 class="ah-currentTimeInCity-header">Местное время: ${$clockNode.text()}</h5>
                ${$timeNode.html()}
            </div>
        `);
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
    let href = `${global.connectInfo.spring_url}/admin/item/activate?id=${id}`;
    
    chrome.runtime.sendMessage({
            action: 'XMLHttpRequest',
            url: href,
            method: 'POST'
        },
        function(response) {
            outTextFrame(response);

            if (response === 'Item activated') {
                commentOnItem(id, '[Admin.Helper.Item.Allow] одобрил(а)');

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
    let historyTable = $('.loadable-history:eq(0) .table');

    addRefundInfoBtns(historyTable);

    chrome.runtime.onMessage.addListener(function (request) {
        if (request.onUpdated === 'itemHistory') {
            setTimeout(() => {
                addRefundInfoBtns(historyTable);
            }, 100);
        }
    });

}

function addRefundInfoBtns(table) {
    if ($(table).find('thead tr .ah-additional-refund-cell').length === 0 && ~$(table).text().indexOf('Refund to')) {
        $(table).find('thead tr').append('<th class="ah-additional-refund-cell"></th>');
    } else {
        return;
    }

    if ($(table).parents('.ah-overlay-container').length === 0) {
        $(table).parents('.table-scroll').wrap('<div class="ah-overlay-container"></div>');
    }

    $(table).find('tbody tr').each(function () {
        let searchCell = $(this).find('td:eq(3)'),
            dateCell = $(this).find('td:eq(0)'),
            dateTextFormatted = $(dateCell).text().replace(/\./g, '/').slice(0, -3);

        if ($(this).find('.ah-additional-refund-cell').length === 0) {
            $(this).append(`<td class="ah-additional-refund-cell" rowspan="1"></td>`);
        }

        if (~$(searchCell).text().indexOf('Refund to') && $(this).find('.ah-get-refund-info').length === 0) {
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
                        return `${global.connectInfo.adm_url}/billing/walletlog?date=${this.dateRange}&itemIds=${this.itemId}&paymentMethodIds%5B%5D=114`
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
        userId = +$('[href^="/users/user/info/"]').attr('href').replace(/\D/g, ''),
        overlayContainer = $(data.clickedElem).parents('.ah-overlay-container'),
        hasMorePages = !!($(responseBody).find('ul.pagination').length);

    let total = {
        all: 0,
        real: 0,
        bonus: 0,
        promoBonus: 0
    };
    let totalFormatted = {};

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

            let div = document.createElement('div');
            $(div).append(amountPopoverContent);
            let real = $(div).find('.billing-amount-real').text().replace(/,/, '.').replace(/\s+/g, '');
            let bonus = $(div).find('.billing-amount-bonus').text().replace(/,/, '.').replace(/\s+/g, '');
            let promoBonus = $(div).find('.billing-amount-promo').text().replace(/,/, '.').replace(/\s+/g, '');

            total.real += parseFloat(real);
            total.bonus += parseFloat(bonus);
            total.promoBonus += parseFloat(promoBonus);

            total.all += parseFloat(amountText.slice(1).replace(/,/, '.').replace(/\s+/g, ''));
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

        for (let key in total) {
            if (!total.hasOwnProperty(key)) continue;
            totalFormatted[key] = total[key].toFixed(2).replace('.', ',');
        }
    }

    $(overlayContainer).append('<div class="ah-overlay show"></div>');
    $(data.clickedElem).parents('.ah-additional-refund-cell').popover({
        container: 'body',
        html: true,
        title: `
                <div class="ah-refund__title-row">
                    <b>Всего: </b>
                    <span class="ah-refund-total-amount">${totalFormatted.all}</span>
                    <span class="ah-refund-info-title-links">
                        <a target="_blank" href="/users/account/info/${userId}">Счёт</a>,
                        <a target="_blank" href="${data.getUrl()}">Wallet Log</a>
                    </span>
                </div>
                <div class="ah-refund__title-row">
                    <span>Из них: </span>
                    <span class="text-info"><span class="ah-refund-total-amount">${totalFormatted.real}</span>  руб.</span> |
                    <span class="text-muted"><span class="ah-refund-total-amount">${totalFormatted.bonus}</span>  бонусов</span> |
                    <span class="text-success"><span class="ah-refund-total-amount">${totalFormatted.promoBonus}</span>  промо бонусов</span>
                </div>
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
    let allTotals = $(popover).find('.ah-refund-total-amount');
    copyDataTooltip(allTotals);
    $(popover).find('.js-popover').addClass('ah-pseudo-link').popover();

    let totalRefundBtn = $('.ah-get-total-refund-info');
    if ($(totalRefundBtn).length !== 0) {
        $(totalRefundBtn).click(function () {
            let totalData = {
                dateRange: data.dateRange,
                itemId: data.itemId,
                getUrl: function() {
                    return `${global.connectInfo.adm_url}/billing/walletlog/total?date=${this.dateRange}&itemIds=${this.itemId}&paymentMethodIds%5B%5D=114`
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
    const $comparisonForm = $(`
        <form>
            <div class="input-group form-group ah-compare-items-input-group">
                <span class="input-group-btn">
                    <button class="btn btn-primary btn-sm" name="submit">Сравнить с</button>
                </span>
                <input type="text" class="form-control input-sm" placeholder="Объявления" name="ids">
                <span class="input-group-addon" id="compare-items-info" data-toggle="tooltip" data-placement="left" 
                    title="Вставьте ID объявлений, разделенные нечислом">
                    <span class="glyphicon glyphicon-info-sign"></span>
                </span>
            </div>
        </form>
    `);
    $('.col-xs-5').prepend($comparisonForm);

    $('#compare-items-info').tooltip({
        container: 'body'
    });

    $comparisonForm.submit(function(e) {
        e.preventDefault();
        const items = {};
        const input = this.elements.ids;
        const btn = this.elements.submit;
        const value = input.value;

        items.compared = value.match(/\d{5,}/g);
        if (!items.compared) return;

        items.abutment = getParamsItemInfo().id.toString();

        btnLoaderOn(btn);
        const comparison = new ItemsComparison(items);
        comparison.render()
            .then(() => {
                comparison.showModal();
            }, error => alert(error))
            .then(() => btnLoaderOff(btn));
    });
}

function addAccountLinkItemInfo() {
    const form = document.getElementById('form_item');
    const itemSearchLink = form.querySelector('a[href^="/items/search?user_id="]');
    const userId = itemSearchLink.href.replace(/\D/g, '');

    const divider = document.createTextNode('| ');
    const accountLink = document.createElement('a');
    accountLink.href = `${global.connectInfo.adm_url}/users/account/info/${userId}`;
    accountLink.textContent = 'Счёт';
    accountLink.target = '_blank';

    itemSearchLink.parentNode.insertBefore(divider, itemSearchLink.nextElementSibling);
    itemSearchLink.parentNode.insertBefore(accountLink, itemSearchLink.nextElementSibling);
}