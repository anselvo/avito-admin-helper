
// статус объявления и причина блокировки
function statusItem() {
    var rows = $('tr[data-oid]');

    var allItems = [];
    $(rows).each(function (i, row) {
        let itemLinkNode = $(row).find('td:eq(1) a');
        let itemLink = $(itemLinkNode).attr('href');

        if (itemLink) {
            let itemId = itemLink.split('/')[4];

            if (!isFinite(itemId))
                return;

            $(itemLinkNode).after('<div data-item-id="' + itemId + '" class="parsed-item-info"><span class="ah-loading-indicator-text" style="color: rgb(149, 149, 149);">Загрузка...</span></div>');
            allItems.push(itemId);
        }
    });

    allItems = unique(allItems);
    allItems.forEach(function (id) {
        getItemInfoRequest(id);
    });


}
function getItemInfoRequest(itemId, options) {
    options = options || {};
    var url = `${global.connectInfo.adm_url}/items/item/info/${itemId}`;

    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.send();
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
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
                if (~status.indexOf('Activated') || ~status.indexOf('Added')) {
                    color = '#2E8B58';
                } else if (~status.indexOf('Blocked')) {
                    color = '#e00';
                } else if (~status.indexOf('Expired')) {
                    color = '#000';
                } else if (~status.indexOf('Removed') || ~status.indexOf('Closed') || ~status.indexOf('Archived')) {
                    color = '#666';
                    secondStatus = $(doc).find('.table-striped:contains(Статус) tbody tr:eq(1) td:eq(2)').text();
                    if (!secondStatus) {
                        secondStatus = $(doc).find('.table-striped:contains(Статус) tbody tr:eq(2) td:eq(2)').text();
                        if (secondStatus === 'Blocked') {
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

                $('.parsed-item-info[data-item-id="' + itemId + '"]').html('<span style="color:' + color + '; font-weight:bold;" class="parsed-item-status">' + status + '</span> <span>' + secondStatus + '</span> ' + reasonDivider + '<span>' + reason + '</span>');
            }

            if (xhr.status >= 400) {
                $('.parsed-item-info[data-item-id="' + itemId + '"]').html('<span style="color: #e00; font-weight:bold;">' + xhr.status + '</span> <span>' + xhr.statusText + '</span> <span></span>');
            }

            if ($('.parsed-item-info .ah-loading-indicator-text').length === 0) {
                let btn = $('.ah-show-unactive-items');
                $(btn).prop('disabled', false);
                $('#ah-loading-layer').hide();

                if (options.unactiveOnly) {
                    $('.billing .table tbody tr').each(function() {
                        let itemStatus = $(this).find('.parsed-item-status').text();
                        if (itemStatus.indexOf('Blocked') === -1
                        && itemStatus.indexOf('Expired') === -1
                        && itemStatus.indexOf('Removed') === -1
                        && itemStatus.indexOf('Closed') === -1
                        && itemStatus.indexOf('Rejected') === -1) {
                            $(this).hide();
                        }
                    });

                    $('#reserved-operations-toogler').prop('checked', false);
                }
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
    $('#payin').append('<div style="position: relative; display: inline-block;"><button id="comment-items-for-compensation" type="button" class="ah-action-btn btn-xs" title="" style="margin-left: 8px; font-size: 13px; margin-top: -2px; padding: 1px 8px;">Комментировать объявления</button><span class="glyphicon glyphicon-question-sign" style="top: 3px; margin-left: 4px; font-size: 17px;"></span><div style="position: absolute; top: calc(-50% - 20px); left: calc(100% + 4px); display: none; min-width: 300px; background-color: black; border: 1px solid rgb(204, 204, 204); padding: 8px; z-index: 1050; color: white; border-radius: 4px; font-size: 13px; text-align: center;"><span>Оставить комментарий "За данное объявление была произведена компенсация" на объявлениях, которые отмечены для компенсации. Комментарии начинают проставляться сразу после нажатия кнопки.</span></div></div>');

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

    $('#ah-layer-blackout-modal').append('<div class="ah-modal-content" style="background-color: transparent; box-shadow: none; border: none" id="comment-items-compensation-modal"><div class="ah-modal-container" style=""></div></div>');
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
        $(table).find('tbody').append(`<tr><td><a target="_blank" href="${global.connectInfo.adm_url}/items/item/info/${id}" class="ah-visitable-link">${id}</a></td><td class="ah-loading-indicator-text" data-item-id="${id}" ><span style="color: rgb(149, 149, 149);">Выполняется...</span></td></tr>`);

        setTimeout(commentOnItem, i * delay, id, commentText, action);
    });

    $(body).append('<div class="alert alert-warning" style="margin-bottom: 0; font-size: 14px; text-align: center;">Пожалуйста, дождитесь окончания выполнения всех запросов.</div>');

    $(footer).append('<button type="button" class="btn btn-info btn-sm" style="outline: none; font-size: 14px;" id="open-all-items-in-new-window"><span class="glyphicon glyphicon-new-window"></span> Открыть объявления (' + allItems.length + ')</button>');

    $('#ah-layer-blackout-modal').addClass('ah-layer-flex');
    $(modal).show();
    showModal();

    // Обработчики
    var closeBtn = $(modal).find('.ah-modal-close');
    $(closeBtn).click(function () {
        $('#ah-layer-blackout-modal').removeClass('ah-layer-flex');
        $(modal).remove();
        closeModal();
    });

    var openAllBtn = $('#open-all-items-in-new-window');
    $(openAllBtn).click(function () {
        for (var i = 0; i < allItems.length; i++) {
            var isOpened = window.open(`${global.connectInfo.adm_url}/items/item/info/${allItems[i]}`);
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

    if ((xhr.status >= 400 || xhr.status < 200) && xhr.responseURL === `${global.connectInfo.adm_url}/comment`) {
        $(table).find('[data-item-id="' + itemId + '"]').append('<span data-error>(' + xhr.status + ', ' + xhr.statusText + ')</span>');
        $(table).find('[data-item-id="' + itemId + '"]').parent().addClass('danger');
    }

    $(table).find('[data-item-id="' + itemId + '"].ah-loading-indicator-text').removeClass('ah-loading-indicator-text');

    var indicators = $(table).find('.ah-loading-indicator-text');
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

    result = `${global.connectInfo.adm_url}/billing/walletlog?date=${dateRange}&operationIds=${operationIds.join('%2C') + allStatusesStr}`;
    return result;
}

function userViewOperations() {
    let rows = $('table.account-history tr[data-oid]');
    let reg = /(?:резервирование|применение|списание (?:при|остатка|зарезервированных|из|за)|корректировка за)/i;
    
    $(rows).each(function(i, row) {
        let text = $(row).text();
        if (reg.test(text)) {
            $(row).addClass('ah-user-view-operaion');
        }
    });
    
    toggleUserViewOperations();
}

function toggleUserViewOperations() {
    var isCheckedAttr;
    var rows = $('table .ah-user-view-operaion:not(.ah-table-background-highlight)');
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

// ссылка на ВЛ на счете
function addWlLinkAccountInfo(getLinkFunc, options) {
    options = options || {};
    let linkTitle = options.linkTitle || '';
    let linkName = options.linkName || 'Wallet Log';

    let userId = $('a[href^="/users/user/info/"]').text();
    let link = getLinkFunc(userId);
    $('#history').find('a[href^="/users/account/info"]').after(` <a title="${linkTitle}" target="_blank" style="font-size: 14px;" href="${link}">${linkName}</a>`);
}

// инфа о пакетах
function addPackageInfoAccountInfo() {
    let userId = $('a[href^="/users/user/info/"]').text();
    let table = $('.account-history');
    let rows = table.find('tbody tr');
    let packageReg = /((из|по|покупка) пакет[ау])|(пакет «)/i;
    rows.each(function() {
        let row = $(this);
        let descriptionCell = row.find('td:eq(1)');
        let descriptionText = descriptionCell.text();
        let statusCell = row.find('td:nth-last-child(2)');
        let statusText = statusCell.text().trim();
        if (packageReg.test(descriptionText) && ~statusText.indexOf('Исполнено')) {
            let ids = descriptionText.match(/\d+/);
            if (ids) {
                let packageId = ids[0];
                descriptionCell.append(`<div data-package-id="${packageId}" data-user-id="${userId}" 
                    class="ah-package-info"></div>`);
            }
        }
    });

    table.before(`
        <div class="ah-account-history-table-controls">
            <button class="btn btn-info btn-xs" id="get-lf-packages-info-btn" title="Показать информацию о пакетах LF и CV">
                <span class="glyphicon glyphicon-info-sign"></span> Пакеты LF и CV
            </button>
        </div>
    `);

    showLfPackagesBtnHandler($('#get-lf-packages-info-btn'));
}

function addAccountOperationInfo() {
    const table = document.querySelector('.account-history');
    const rows = table.querySelectorAll('[data-oid]');

    rows.forEach(row => {
        const statusCell = row.querySelector('td:nth-last-child(2)');
        const wlLink = statusCell.querySelector('a').getAttribute('href');

        const infoLink = document.createElement('button');
        infoLink.className = 'btn btn-link ah-pseudo-link ah-operation-info-link ah-operation-info-link__block';
        infoLink.innerHTML = `инфо`;
        infoLink.setAttribute('data-link', wlLink);

        statusCell.appendChild(infoLink);
    });

    const loadedInfo = new Map();

    table.addEventListener('click', e => {
        const target = e.target;

        if (target.classList.contains('ah-operation-info-link')) {
            const link = target.dataset.link;
            const loaded = loadedInfo.get(link);

            if (loaded) {
                showPopover(target, loaded);
                return;
            }

            btnLoaderOn(target);
            fetch(link, {
                    credentials: 'include'
                })
                .then(response =>  {
                    if (response.status !== 200) {
                        const error = `${response.status}${response.statusText ? `, ${response.statusText}` : ''}`;
                        return Promise.reject(error);
                    }
                    return response.text();
                })
                .then(html => {
                    handleSuccessResponse(target, html, link);
                    btnLoaderOff(target);
                })
                .catch(error => {
                    btnLoaderOff(target);
                    alert(error);
                });
        }
    });

    // обработать успешный ответ от сервера
    function handleSuccessResponse(target, html, link) {
        try {
            const div = document.createElement('div');
            div.innerHTML = html;
            const row = div.querySelector('.billing table tbody tr');
            const info = getParamsOperationInfo(row);
            const content = `
                <table class="ah-operation-info-table">
                    <tr>
                        <td class="ah-operation-info-table__col">Внешний ID транзакции</td>
                        <td class="ah-operation-info-table__col">${info.externalId}</td>
                    </tr>
                </table>
            `;

            loadedInfo.set(link, content);

            showPopover(target, content);
        } catch (e) {
            console.log(e);
            alert(e);
        }
    }

    // показать поповер
    function showPopover(target, content) {
        $(target).popover({
            html: true,
            container: 'body',
            placement: 'top',
            content: content,
            template: `
            <div class="popover ah-popover-destroy-outclicking">
                <div class="arrow"></div>
                <div class="popover-content"></div>
            </div>`
        }).popover('show');
    }
}