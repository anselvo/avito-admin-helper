function antifraudLinks(page) {
    let trList = $('#items').find('tr');
    let flagDispersion = 5;
    let priceDispersion = 20;

    let dateStart = new Date(new Date() - 7.776e+9);
    let dateEnd = new Date();
    let formatDateStart = parseDateToSearchFormat(dateStart);
    let formatDateEnd = parseDateToSearchFormat(dateEnd);

    for (let i = 0; i < trList.length; ++i) {
        let categoryItemID;
        if (page === 'pre') categoryItemID = $(trList[i]).attr('data-category');
        else categoryItemID = $(trList[i]).find('[name="item_id[]"]').attr('data-category');

        let locationItemID = $(trList[i]).attr('data-location');

        let firstParam = '', firstParamMap = '';
        if ($(trList[i]).attr('data-params')) {
            firstParam = JSON.parse($(trList[i]).attr('data-params'))[0];
            firstParamMap = JSON.parse($(trList[i]).attr('data-params-map'))[firstParam[0]];
        }

        let itemPrice;
        if (page === 'pre') itemPrice = parseInt($(trList[i]).find('.item-info-row:eq(0)')[0].firstChild.data.replace(/\D/g, ''));
        else itemPrice = parseInt($(trList[i]).find('.item-price').text().replace(/\D/g, ''));

        let itemPriceMin = '';
        let itemPriceMax = '';
        if (itemPrice) {
            itemPriceMin = Math.ceil(itemPrice * (100 - priceDispersion) / 100);
            itemPriceMax = Math.floor(itemPrice * (100 + priceDispersion) / 100);
        }

        let flagList = $(trList[i]).find('.b-antifraud');
        for (let j = 0; j < flagList.length; ++j) {
            let percent = parseInt($(flagList[j]).attr('title'));
            let percentMin = percent - flagDispersion;
            let percentMax = percent + flagDispersion;

            let flagName = $(flagList[j]).find('.name').text();
            let flagInfo = $('ul.multiselect-container li:contains(' + flagName + ')').find('input[type="checkbox"]')[0];
            let flagId = $(flagInfo).val();

            if (flagId) {
                let flagAction = $(flagInfo).parents('[data-title]').attr('data-title');
                let flagStatus = 'block_id[]';
                if (~flagAction.indexOf('Все прич. отклонения') || ~flagAction.indexOf('-- all reject flags --')) flagStatus = 'reject_id[]';
                if (~flagAction.indexOf('all user block reasons') || ~flagAction.indexOf('-- all block user flags --')) flagStatus = 'user_block_id[]';

                let flagLink = `${global.connectInfo.adm_url}/items/search?date=${formatDateStart}+-+${formatDateEnd}&location_id[]=${locationItemID}&cid[]=${categoryItemID}&price_min=${itemPriceMin}&price_max=${itemPriceMax}&${flagStatus}=${flagId}&percent_min=${percentMin}&percent_max=${percentMax}&params[${firstParam[0]}]=${firstParamMap}&s_type=2`;

                $(flagList[j]).find('.name').html('<a href="' + flagLink + '" target="_blank">' + flagName + '</a>');
            }
        }
    }
}

function fakeComments() {
    $('button[name="block"], input.internBlock').click(function () {
        $(`input.btn.red[type="submit"]`).unbind();
        const buttonSelector = $(this);
        const findReason = setInterval(function () {
            if ($('.moderate-modal').length) {
                clearInterval(findReason);
                const itemId = buttonSelector.parents('tr').data('id');
                if (itemId) optionFakeComments(itemId, '.moderate-modal','.moderateBox_item','input.btn.red[type="submit"]', '.moderateBox_item');
            }
        }, 100);
    });
}

function optionFakeComments(itemId, blockSelector, reasonSelector, clickSelector, parentSelector, click = false) {
    $(blockSelector).find('.ah-other-reasons').remove();

    const reasonSelectorContain = $(blockSelector).find(reasonSelector + ':contains(Фейк)');
    const reasons = global.blockFakeComments;

    let content = '';
    for (let i = 0; i < reasons.length; ++i) {
        const { comment, hasInput } = reasons[i];

        content += `
            <div class="ah-other-reason-block">
                <label>
                    <input type="checkbox" name="ah-other-reasons"/>
                    <span>${comment}</span>
                    ${hasInput ? `<input type="text" class="ah-other-reasons-input" placeholder="Вставьте ссылку">` : ''}
                </label>
            </div>
        `;
    }

    const template = '<div class="ah-other-reasons"><div class="popover-content">' + content + '</div></div>';

    $(reasonSelectorContain)
        .append(template)
        .mouseenter(function () {
            let blockItem = $(this).find('>.ah-other-reasons');

            $(blockItem).show();

            const width = $(blockItem).width();
            const offset = $(blockItem).offset();

            const rightPoint = offset.left + width;
            if (rightPoint > $(window).width()) $(blockItem).css('transform', 'translate(-100%, -60%)');
        })
        .mouseleave(function () {
            const blockItem = $(this).find('>.ah-other-reasons');

            $(blockItem).hide();
        });

    $(reasonSelectorContain)
        .find('[type="checkbox"]')
        .change(function () {
            // TODO косячная строчка, нужно передавать предка в функцию addOtherReasons()
            const difParent = '.moderateBox_item, .ah-other-reason-block, .moderate-block-list-item';

            if ($(this).prop('checked')) {
                $(this).parents().find('>label input[type="checkbox"], >.moderateBox_check input[type="checkbox"]').prop('checked', true);
            } else {
                $(this).closest(difParent).find('[type="checkbox"]').prop('checked', false);

                let notCheckedReasons = $(this).parents(difParent);

                for (let i = 0; i < notCheckedReasons.length; ++i) {
                    if ($(notCheckedReasons[i]).find(':checked').length === 1) $(notCheckedReasons[i]).find('[type="checkbox"]').prop('checked', false);
                }
            }
        });


    $(blockSelector).find('.ah-other-reasons').click((event) => {
        event.stopPropagation();
    });

    $(clickSelector).click(function () {
        const checkedList = $(blockSelector).find(reasonSelector).find('.ah-other-reason-block').find('[type="checkbox"]:checked');

        if (checkedList) {
            let commentReasons = [];

            for (let i = 0; i < checkedList.length; ++i) {
                const block = checkedList[i].parentElement;
                const text = $(block).find('span').text();
                const inputText = $(block).find('.ah-other-reasons-input').val();

                commentReasons.push(text);
                if (inputText) commentReasons.push('Ссылка на сайт с фейком: ' + inputText);
            }

            if (commentReasons.length) commentOnItem(itemId, `Блокировка за 'Фейк', Причины: ${commentReasons.join(', ')}`);
        }

        $(clickSelector).unbind();
    });
}

// Авто добавление причине в поле "Другая причина"
function autoOtherReasons() {
    $('button[name="reject"], button[name="activate"], input.internReject').click(function () {
        let buttonSelector = $(this);
        let findReason = setInterval(function () {
            let box = $('.moderate-modal');

            if ($(box).length > 0) {
                clearInterval(findReason);
                let prob = buttonSelector.parents('tr').data('pathProbs');
                optionOtherReasons('.moderate-modal', '.moderateBox_item', '[name="reason_other"]', prob);
            }
        }, 100);
    });
}

function optionOtherReasons(blockSelector, reasonSelector, textSelector, prob) {
    $(`${blockSelector} .ah-other-reasons`).remove();
    const block = $(blockSelector);

    for (let i = 0; i < block.length; ++i) {
        addOtherReasons(block[i], reasonSelector, textSelector, global.otherReasonsCategory, prob);
        addOtherReasons(block[i], reasonSelector, textSelector, global.otherReasonsService, prob);

        if (localStorage.autoCheckOtherReason === 'true')
            addAutoCheckSuggestReason(block[i], reasonSelector);
    }

    $(`${blockSelector} .ah-other-reasons`).click((event) => {
        event.stopPropagation();
    });

}

function addOtherReasonProb(name, prob) {
    let progress = '';
    let probability = 0;

    for (let i = 0; i < prob.length; ++i) {
        if (prob[i]) {
            const categoryName = prob[i].categoryName;
            const tmp = categoryName.split(" / ");
            const currentProbability = prob[i].prob.toFixed(2) * 100;

            if ((name === tmp[0] || name === tmp[1]) && probability < currentProbability) {
                probability = currentProbability;

                let color = '#2f8b55';

                if (probability > 70) color = '#f75a20';
                else if (probability > 30) color = '#fc7b23';
                else if (probability > 0) color = '#96873c';

                progress = '<div class="progress-line" style="display: block; margin-left: 20px; border: 1px solid ' + color + ';">' +
                    '<div class="progress-bar" style="background-color: ' + color + '; width: ' + probability + 'px;"></div>' +
                    '</div>';
            }
        }
    }

    return progress;
}

function addAutoCheckSuggestReason(block, reasonSelector) {
    let suggestReason = $(block).find(reasonSelector + ':contains(Неправильная категория) .description').text().toLowerCase();
    suggestReason = suggestReason.substring(0, 1).toUpperCase() + suggestReason.substring(1);

    if (suggestReason !== '') {
        $('[name="ah-other-reasons"]').closest('label:contains(' + suggestReason + ') input[type="checkbox"]').prop('checked', true).change();
    }
}

function addOtherReasons(block, reasonSelector, textSelector, otherReasons, prob) {
    const name = otherReasons.name;
    const reasons = otherReasons.reason;

    const reasonSelectorContain = $(block).find(reasonSelector + ':contains(' + name + ')');

    let content = '';
    let inReasons = [];

    if (reasons) {
        for (let i = 0; i < reasons.length; ++i) {
            let progress = '';
            if (typeof reasons[i] === "object") {
                if (prob) progress = addOtherReasonProb(reasons[i].name, prob);

                content += '<div class="ah-other-reason-block ah-has-children">' +
                    '<label><input type="checkbox" name="ah-other-reasons"/><span>' + reasons[i].name + progress + '</span></label>' +
                    '</div>';

                inReasons.push(reasons[i]);
            } else {
                if (prob) progress = addOtherReasonProb(reasons[i], prob);

                content += '<div class="ah-other-reason-block">' +
                    '<label><input type="checkbox" name="ah-other-reasons"/><span>' + reasons[i] + progress + '</span></label>' +
                    '</div>';
            }
        }


        const template = '<div class="ah-other-reasons"><div class="popover-content">' + content + '</div></div>';

        $(reasonSelectorContain)
            .append(template)
            .mouseenter(function () {
                let blockItem = $(this).find('>.ah-other-reasons');

                $(blockItem).show();

                const width = $(blockItem).width();
                const offset = $(blockItem).offset();

                const rightPoint = offset.left + width;
                if (rightPoint > $(window).width()) $(blockItem).css('transform', 'translate(-100%, -60%)');
            })
            .mouseleave(function () {
                const blockItem = $(this).find('>.ah-other-reasons');

                $(blockItem).hide();
            });
    }

    $(reasonSelectorContain)
        .find('[type="checkbox"]')
        .change(function () {
            // TODO косячная строчка, нужно передавать предка в функцию addOtherReasons()
            const difParent = '.moderateBox_item, .ah-other-reason-block, .moderate-block-list-item';

            if ($(this).prop('checked')) {
                $(this).parents().find('>label input[type="checkbox"], >.moderateBox_check input[type="checkbox"]').prop('checked', true);
            } else {
                $(this).closest(difParent).find('[type="checkbox"]').prop('checked', false);

                let notCheckedReasons = $(this).parents(difParent);

                for (let i = 0; i < notCheckedReasons.length; ++i) {
                    if ($(notCheckedReasons[i]).find(':checked').length === 1) $(notCheckedReasons[i]).find('[type="checkbox"]').prop('checked', false);
                }
            }

            let text = '';

            const checkedReasons = $(block).find('[name="ah-other-reasons"]').parents('.ah-other-reason-block').find(':checked');

            if ($(checkedReasons).length > 0) text = 'Пожалуйста, измените на ';

            for (let i = 0; i < checkedReasons.length; ++i) {
                if ($(checkedReasons[i]).closest(difParent).find('[type="checkbox"]:checked').length <= 1) {
                    const texReason = $(checkedReasons[i]).parent().text();
                    const textChildrenSelector = $(checkedReasons[i]).parents('.ah-other-reason-block').parents('.ah-has-children').find('>label');
                    let textChildren = '';

                    for (let j = 0; j < textChildrenSelector.length; ++j) {
                        textChildren += $(textChildrenSelector[j]).text() + ' / ';
                    }

                    if (text === 'Пожалуйста, измените на ') text += '"' + textChildren + texReason + '"';
                    else text += ' или "' + textChildren + texReason + '"';
                }
            }

            $(block).find(textSelector).val(text);
        });

    for (let i = 0; i < inReasons.length; ++i)
        addOtherReasons(block, '.ah-other-reason-block', textSelector, inReasons[i], prob);
}

// ФООРМИРОВАНИЕ ССЫЛКИ ПО ПАРАМЕТРАМ

function eyeLinks(list) {
    let eyeCity = localStorage.eyeCity;
    let searchParam = localStorage.eyeParamList.split(', ');

    for (let i = 0; i < list.length; ++i) {
        let param = $(list[i]).parents('tr').attr('data-params');
        let paramMap = $(list[i]).parents('tr').attr('data-params-map');
        let cid = $(list[i]).parents('tr').find('[data-category]').attr('data-category');
        let city = $(list[i]).parents('tr').attr('data-location');

        let link = `${global.connectInfo.adm_url}/items/search?status[]=active&cid[]=${cid}`;

        if (eyeCity === 'true') {
            link += '&location_id[]=' + city;
        }

        if (param) {
            let jsomParam = JSON.parse(param);

            let searchParamID = [];
            for (let j = 0; j < searchParam.length; ++j) {
                for (let k = 0; k < jsomParam.length; ++k) {
                    if (searchParam[j] === jsomParam[k][1]) searchParamID.push(jsomParam[k][0]);
                }
            }

            let jsomParamMap = JSON.parse(paramMap);
            let isParams = false;

            for (let j = 0; j < searchParamID.length; ++j) {
                let tmp = jsomParamMap[searchParamID[j]];
                if (tmp) {
                    isParams = true;
                    link += '&params[' + searchParamID[j] + ']=' + tmp;
                }
            }

            if (!isParams) {
                for (let val in jsomParamMap) {
                    link += '&params[' + val + ']=' + jsomParamMap[val];
                }
            }
        }

        $(list[i]).append('<a href="' + link + '" target="_blank" style="margin: 0 5px;" title="Формирование поиска по параметрам\n\nВыдача строится четко по параметрам, независимо от того выбран ли визуально параметр в items/search\n\nЕсли в категории нету параметров, которые вы указали, то подставляются все возможные параметры для данной категории"><i class="glyphicon glyphicon-eye-open"></i></a>');
    }
}


// Дополнительная информация о пользователе и объявлениях

function addInfoToItems() {
    $('form.form-inline').next().append('<div id="ah-user-info-show" class="dropdown" style="float: right">' +
        '  <button class="btn btn-info dropdown-toggle btn-xs" type="button" data-toggle="dropdown" style="padding: 1px 9px">Показать' +
        '  <span class="caret"></span></button>' +
        '  <ul class="dropdown-menu dropdown-menu-right"></ul>' +
        '</div>');

}

// МАССОВАЯ БЛОКИРОВКА ПОЛЬЗОВАТЕЛЕЙ

function addActionButton() {
    $('#apply_all')
        .append('<input type="button" class="btn btn-default green" id="ah-postBlockChoose" value="Action" title="Выбор активных действия с пользователем">')
        .append('<span class="ah-showUsers" title="Show users list">Users: <span class="ah-digit">0</span></span>');


    $('body')
        .append(`
            <div class="ah-postBlockChoose ah-post-block-user" style="display: none;">
                ${isAuthority('ROLE_COMMERCIAL_STATUS') ?
            '<div class="ah-post-block-users ah-post-com-status ah-disabled-block"><i class="glyphicon glyphicon glyphicon-rub"></i> Коммерческий статус</div>' : ''
            }
                <hr style="margin: 3px 0 3px"/>
                <div class="ah-post-block-users ah-postBlockReason" reasonId="593"><i class="glyphicon glyphicon-ban-circle"></i> Подозрительная активность</div>
                <div class="ah-post-block-users ah-postBlockReason" reasonId="91"><i class="glyphicon glyphicon-ban-circle"></i> Несколько учетных записей</div>
                <div class="ah-post-block-users ah-postBlockReason" reasonId="128"><i class="glyphicon glyphicon-ban-circle"></i> Мошенническая схема</div>
                <hr style="margin: 3px 0 3px"/>
                <div class="ah-post-block-users ah-postBlockModerComment"><i class="glyphicon glyphicon-pencil"></i> <input id="ah-post-block-comment" type="text" placeholder="доп. комментарий"></div>
            </div>
        `).append(`
            <div class="postBlockInfo ah-post-block-user" style="display: none;">
                <div class="ah-post-block-users ah-compareUsers"><i class="glyphicon glyphicon-random"></i> <span>Сравнить учетные записи</span></div>
                <div class="ah-post-block-users ah-postClearList"><i class="glyphicon glyphicon-tint"></i> <span>Очистить список</span></div>
                <hr style="margin-bottom: 10px; margin-top: 0">
                <table id="ah-postBlockTable">
                    <thead><tr><th>ID</th><th>Request</th><th>Response</th></tr></thead>
                    <tbody></tbody>
                </table>
            </div>
        `);

    $('#ah-user-info-show')
        .find('ul')
        .append(`
            <li>
                <div class="ah-show-info ah-postUserAgent">
                    <i class="glyphicon glyphicon-phone"></i> 
                    <span class="ah-menu-name">Показать User Info</span><span class="ah-hot-keys">Alt+U</span>
                </div>
            </li>
         `);

    clickActionButton();
}

function clickActionButton() {
    realHideElementOutClicking($('.ah-post-block-user'));

    $('#ah-postBlockChoose').click(function () {
        const position = $(this).position();
        const $category = $('.js-multiselect-search .subcategory.active');
        const $button = $('.ah-post-com-status');
        const categoryName = $category.find('label').text().trim();

        $button.addClass('ah-disabled-block').find('.ah-category-com-status').remove();

        if ($category.length === 1) {
            $button.append(`<div class="ah-category-com-status">(${categoryName})</div>`).removeClass('ah-disabled-block');
        }

        $('.ah-postBlockChoose').css({bottom: 83, left: position.left - 50}).show();
    });

    $('.ah-showUsers').click(function () {
        const position = $(this).position();

        $('.postBlockInfo').css({bottom: 83, left: position.left - 50}).show();
    });

    $('.ah-postBlockReason').click(function () {
        const reasonId = $(this).attr('reasonId');

        $('.ah-postBlockChoose').hide();
        $('.ah-showUsers').click();

        postBlockReasonList(reasonId);
    });

    $('.ah-compareUsers').click(function () {
        const activeUsers = sessionStorage.postBlockActiveUserID.match(/\d{5,}/g) || [];
        const blockedUsers = sessionStorage.postBlockID.match(/\d{5,}/g) || [];
        const allUsers = activeUsers.concat(blockedUsers);
        const users = {};
        users.abutment = allUsers[0];
        users.compared = allUsers;

        btnLoaderOn(this.children[0]);
        const comparison = new UsersComparison(users);
        comparison.render()
            .then(() => {
                comparison.showModal();
            }, error => alert(error))
            .then(() => btnLoaderOff(this.children[0]));
    });

    $('.ah-post-com-status').on('click', function () {
        const activeUsers = sessionStorage.postBlockActiveUserID.match(/\d{5,}/g) || [];
        const blockedUsers = sessionStorage.postBlockID.match(/\d{5,}/g) || [];
        const userIds = blockedUsers.concat(activeUsers).map(id => Number(id));
        const comment = document.getElementById('ah-post-block-comment').value;
        const searchUrl = window.location.href;
        const $category = $('.js-multiselect-search .subcategory.active');

        if ($category.length === 1) {
            const categoryId = Number($category.find('input').val());
            const selector = this.children[0];

            btnLoaderOn(selector);
            updateUserCommercialStatus({userIds, categoryId, comment, searchUrl}, selector);
        } else {
            outTextFrame('Превышено кол-во категорий в поиске. Категория может быть выбрана только одна.')
        }
    });

    $('.ah-postClearList').click(function () {
        sessionStorage.postBlockID = '';
        sessionStorage.postBlockActiveUserID = '';

        $('.ah-post-block-user').hide();
        usersListCheck();
        outTextFrame('Список пользователей очищен!')
    });

    let showUserInfo = false;

    function clickPostUserAgent() {
        if (!showUserInfo) {
            showUserInfo = true;
            usersInfoForItems();
        }

        let selector = $('.ah-postUserAgent');

        if ($(selector).find('span.ah-menu-name').hasClass('showUserAgent')) {
            $('.ah-post-userAgent').hide();
            $(selector).find('span.ah-menu-name').text('Показать User Info').removeClass('showUserAgent');
        } else {
            $('.ah-post-userAgent').show();
            $(selector).find('span.ah-menu-name').text('Скрыть User Info').addClass('showUserAgent').attr('show', 'true');
        }

    }

    $('.ah-postUserAgent').click(clickPostUserAgent);

    if (isAuthority('ROLE_USERS_INFO_AUTOLOAD') || ~global.currentUrl.indexOf("?phone=") || ~global.currentUrl.indexOf("?ip=")) clickPostUserAgent();

    $(document).keydown(function (e) {
        if (e.altKey && e.keyCode === 'U'.charCodeAt(0))
            clickPostUserAgent();
    });

}

function clickChooseButton() {
    $('.ah-postBlockButton').click(function () {
        let val = $(this).val();

        if (val === '+') addPlusBlockUser(this);
        if (val === '-') addStarBlockUser(this);
        if (val === '★') removeMinusBlockUser(this);

        usersListCheck();
    });
}

function usersListCheck() {
    let usersListBlock = sessionStorage.postBlockID.split(', ');
    let usersListActive = sessionStorage.postBlockActiveUserID.split(', ');

    $('.ah-digit').text(usersListBlock.length - 1);

    $('.ah-postBlockButton').removeClass('ah-postStar').removeClass('ah-postMinus').addClass('ah-postPlus').val('+').parent().removeClass('ah-postStarBlock').removeClass('ah-postMinusBlock');

    let postBlockTable = '';
    for (let i = 0; i < usersListBlock.length - 1; i++) {
        $('input[userid="' + usersListBlock[i] + '"]').removeClass('ah-postPlus').addClass('ah-postMinus').val('-').parent().addClass('ah-postMinusBlock');

        postBlockTable += '<tr name="' + usersListBlock[i] + '"><td><a href="/users/user/info/' + usersListBlock[i] + '" target="_blank">' + usersListBlock[i] + '</a></td><td>-</td><td>-</td></tr>';
    }

    for (let i = 0; i < usersListActive.length - 1; i++) {
        $('input[userid="' + usersListActive[i] + '"]').removeClass('ah-postMinus').addClass('ah-postStar').val('★').parent().removeClass('ah-postMinusBlock').addClass('ah-postStarBlock');
    }

    $('#ah-postBlockTable').find('tbody').html(postBlockTable);

    if (usersListActive.length - 1 !== 0 || usersListBlock.length - 1 !== 0) {
        outTextFrame(`Выделено:\n‧ Активных пользователей - ${usersListActive.length - 1}\n‧ Заблокированных пользователей - ${usersListBlock.length - 1}`);
    }
}

function addPlusBlockUser(button) {
    let id = $(button).attr('userid');

    sessionStorage.postBlockID += id + ', ';
}

function addStarBlockUser(button) {
    let id = $(button).attr('userid');

    sessionStorage.postBlockID = sessionStorage.postBlockID.replace(id + ', ', '');
    sessionStorage.postBlockActiveUserID = sessionStorage.postBlockActiveUserID += id + ', ';
}

function removeMinusBlockUser(button) {
    let id = $(button).attr('userid');

    sessionStorage.postBlockActiveUserID = sessionStorage.postBlockActiveUserID.replace(id + ', ', '');
}


function postBlockReasonList(reasonId) {
    let usersListBlock = sessionStorage.postBlockID.split(', ');
    let usersListActive = sessionStorage.postBlockActiveUserID.split(', ');
    let url = window.location.href;

    let commentSearchLink = `${global.connectInfo.adm_url}/items/search?user=`;
    let commentUsersLink = '';
    for (let i = 0; i < usersListBlock.length - 1; i++) {
        commentSearchLink += usersListBlock[i];
        commentUsersLink += `${global.connectInfo.adm_url}/users/user/info/${usersListBlock[i]}`;
        if (i < usersListBlock.length - 2) {
            commentUsersLink += '\n';
            commentSearchLink += '|';
        }
    }

    let commentActiveUsersLink = '';
    for (let i = 0; i < usersListActive.length - 1; i++) {
        commentActiveUsersLink += `${global.connectInfo.adm_url}/users/user/info/${usersListActive[i]}`;
        if (i < usersListActive.length - 2) commentActiveUsersLink += '\n';
    }

    let reason = '';
    if (reasonId === '91') reason = 'СПАМ';
    if (reasonId === '593') reason = 'ВЗЛОМ';
    if (reasonId === '128') reason = 'МОШЕННИК';
    const moderComment = document.getElementById('ah-post-block-comment');

    const comment = `[Admin.Helper.Users.Block]
    ${reason} ${moderComment.value ? '( ' + moderComment.value + ' )' : ''}
    Ссылка открытая модератором при блокировке:
    ${url}
    Ссылка на активного пользователя:
    ${commentActiveUsersLink}
    Ссылка на заблокированных пользователей в items/search:
    ${commentSearchLink}
    Ссылки на заблокированные учетные записи:
    ${commentUsersLink}`;

    for (let i = 0; i < usersListBlock.length - 1; i++) {
        postBlockRequest(usersListBlock[i], reasonId);
        commentOnUserModer(usersListBlock[i], comment);
    }

    for (let i = 0; i < usersListActive.length - 1; i++) {
        commentOnUserModer(usersListActive[i], comment);
    }

    sessionStorage.postBlockID = '';
    sessionStorage.postBlockActiveUserID = '';
}

// запрос на отображения информации о юзере для большого кол-ва

function usersInfoForItems() {
    const userAgentSelector = document.querySelectorAll('[userAgent]');
    const map = [].map.call(userAgentSelector, selector => selector.getAttribute('useragent'));
    const userSet = new Set(map);

    for (let id of userSet.keys()) {
        usersInfoForManyItems(id);
    }
}

function usersInfoForManyItems(id) {
    const href = `${global.connectInfo.adm_url}/users/user/info/${id}`;
    const request = new XMLHttpRequest();
    request.open("GET", href, true);
    request.send(null);
    request.onreadystatechange = function () {
        if (request.readyState === 4 && request.status === 200) {
            const json = getParamsUserInfo(request.responseText);

            $('[ah-post-block-chance="' + id + '"]').text(json.chance ? json.chance : 0);
            $('[ah-post-block-status="' + id + '"]').text(json.status);
            $('[ah-post-block-regist="' + id + '"]').text(json.regTime);
            if (json.blockReasons) $('[ah-post-block-reason="' + id + '"]').text(json.blockReasons).parent().show();
            if (json.chanceTime) $('[ah-post-block-chance-time="' + id + '"]').text(' - ' + json.chanceTime).parents('.ah-post-userAgent').show();
            if (json.subscription) $('[ah-post-block-subscription="' + id + '"]').html(json.subscription).parents('.ah-post-userAgent').show();
            $('[userAgent="' + id + '"]').text(json.userAgent).parents('.ah-post-userAgent').show();
        }
    };
}

// запрос на отображения информации о юзере для большого кол-во

// ССЫЛКИ НА ПОИСК ПО КАРТИНКЕ

function searchByImageLinks() {
    let target = $('body')[0];

    let observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            // console.log(mutation);
            if ($(mutation.addedNodes[0]).hasClass('js-images-preview-gallery')) {
                watchForGalleryOnPre();

                observer.disconnect();
            }
        });
    });

    let config = {childList: true};

    observer.observe(target, config);
}

function watchForGalleryOnPre() {
    let target = $('.js-images-preview-gallery')[0];

    let observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            if (mutation.addedNodes.length > 0) {
                searchByImageLinks1();
            }
        });
    });

    let config = {childList: true};

    observer.observe(target, config);
}

function searchByImageLinks1() {
    let list = $('.images-preview-gallery-item');

    if (list.length > 0) {

        for (let i = 0; i < list.length; ++i) {
            let url = $(list[i]).find('a').attr('href').substr(2);
            let existLinks = $(list[i]).find('.ah-searchByImageLinks');

            if (existLinks.length === 0) $(list[i]).append('<div class="ah-searchByImageLinks">' +
                '<a class="ah-google" href="https://www.google.ru/searchbyimage?image_url=' + url + '" target="_blank">' +
                '<span>G</span><span>o</span><span>o</span><span>g</span><span>l</span><span>e</span>' +
                '</a> ' +
                '<a class="ah-yandex" href="https://yandex.ru/images/search?url=' + url + '&rpt=imageview" target="_blank">' +
                '<span>Y</span><span>andex</span>' +
                '</a> ' +
                '</div>');
        }
    }
}

// ССЫЛКИ НА ПОИСК ПО КАРТИНКЕ

function settings() {
    // Отображать настройки
    getSettings();

    // подсветка слов
    addWordsIllumination();

    // включение настроек
    $('.dropdown .dropdown-toggle:contains(Moderation)').parent().find('.dropdown-menu').append('<li id="ah-settings"><a href="#">AH Settings</a></li>');

    $('#ah-settings').click(function () {
        $('#ah-layer-blackout-popup').addClass('ah-layer-flex');
        $('#ah-divOptions').show();
        showModal();
    });
}

//----- Подсветка слов -----//
function addWordsIllumination() {
    if (!localStorage.title) localStorage.title = '';
    if (!localStorage.title1) localStorage.title1 = '';
    if (!localStorage.titleColor) localStorage.titleColor = '#ffaa1a';

    var chbx1 = $('<input/>', {
        class: 'mycheckbox1 ah-dafault-checkbox',
        type: 'checkbox',
        id: 'chbx1',
        checked: 'checked',
    });

    var butSearch = $('<input/>', {
        value: 'Save',
        type: 'button',
        class: 'btn btn-default btn-sm green',
        style: 'margin-right: -1px; border-top-right-radius: 0; border-bottom-right-radius: 0;',
        id: 'mbuttonS',

        click: function () {
            sbrosBut('.item_title');
            sbrosBut('.item-info-name a');
            var temp = $("#textaclass").val();
            localStorage.title = temp;
            var temp1 = $("#textaclass1").val();
            localStorage.title1 = temp1;
            if ($('#chbx1').prop("checked")) {
                localStorage.chbx1 = 1;
            } else {
                localStorage.chbx1 = 0;
            }
            searchWordsGlobal(temp, temp1, '.item_title');
            $(this).attr('disabled', true);
        }
    });

    var butReload = $('<input/>', {
        value: 'Reset',
        type: 'button',
        class: 'btn btn-default btn-sm green',
        style: 'margin-right: -1px; border-radius: 0;',

        click: function () {
            sbrosBut('.item_title');
            sbrosBut('.item-info-name a');
            $("#mbuttonS").removeAttr('disabled');
        }
    });
    var butReloadFull = $('<input/>', {
        value: 'Reset All',
        type: 'button',
        class: 'btn btn-default btn-sm green',
        style: 'border-top-left-radius: 0; border-bottom-left-radius: 0;',

        click: function () {
            sbrosBut('.item_title');
            sbrosBut('.item-info-name a');
            localStorage.title = '';
            localStorage.chbx1 = 0;
            localStorage.title1 = '';
            $('#textaclass').val('');
            $("#mbuttonS").removeAttr('disabled');
            $("#chbx1").removeAttr("checked");
        }
    });

    let titleInfo = 'Доступна подсветка слов по категориям. Для того, чтобы воспользоваться данным функционалом необходимо написать название категории, потом поставить двоеточение ' +
        'и перечислить интересующие слова через запятую, закрыв это все точкой с запятой и тд. Если вы хотите, чтобы слова применялись ко всем категориям, нужно просто написать Все ' +
        'и также как для категорий перечислить слова. Название категорий должно полностью или частично соответствовать названию в админке. Частичное название можете повлечь за собой ' +
        'неприятные последствия.\n\n' +
        'Пример 1\n\t Все: Кран; Автомобили: Машина, Вася, Петя; Квартиры: агент, дом\n' +
        'Пример 2\n\t дом, информ, ангент, кривая труба';

    //RK блок для подсветки слов
    let colorTitle = `Формат цветов задавать след методами:
        - Hexadecimal colors
        - RGB colors
        - RGBA colors
        - HSL colors
        - HSLA colors
        - Predefined/Cross-browser color names
        `;

    $('div.block-descriptionMode').append('<div class="illumination" style=""><span style="display: block; margin-bottom: 10px; font-size: 14px;">Подсветка слов</span></div>');
    $('div.illumination').append('<textarea class="textaclassS" id="textaclass" placeholder="тут запрос на описание" style="width: 100%; height: 65px; resize: none; padding: 5px; border-radius: 4px;" title="' + titleInfo + '">' + localStorage.title + '</textarea>');
    $('div.illumination').append('<textarea class="textaclasstitle" id="textaclass1" placeholder="тут запрос на заголовок" style="width: 100%; height: 40px;resize: none;padding: 5px; margin-top: 6px; border-radius: 4px;">' + localStorage.title1 + '</textarea>');
    $('div.illumination').append('<input id="highlight-color" type="color" value="' + localStorage.titleColor + '">');

    $('div.illumination').append('<div class="ah-illumination-btn-box" style="margin-top: 6px;"></div>');
    $('div.ah-illumination-btn-box').append(butSearch);
    $('div.ah-illumination-btn-box').append(butReload);
    $('div.ah-illumination-btn-box').append(butReloadFull);
    $('div.illumination').append('<div class="mh-chbx-field" style="margin-top: 8px;"></div>')
    $('div.mh-chbx-field').append(chbx1, '<label style="" for="chbx1">Искать в названии</label>');

    $('#highlight-color').change(function () {
        localStorage.titleColor = $(this).val();
    });
}

//+++++ Подсветка слов +++++//

//----- Окно настоек -----//
function getSettings() {
    if (!localStorage.createdButtons) localStorage.createdButtons = '';
    if (!localStorage.checkboxInfo) localStorage.checkboxInfo = '';

    // попап с затемнением
    $('body').append('<div id="ah-layer-blackout-popup"></div>');
    $('#ah-layer-blackout-popup').append('<div id="ah-divOptions" class="ah-divOptions ah-default-popup" style="display: none; font-size: 12px;"></div>');

    $('#ah-layer-blackout-popup').click(function (e) {
        if (!$('div.ah-default-popup').is(e.target) && $('div.ah-default-popup').has(e.target).length === 0) {
            $('#ah-layer-blackout-popup').removeClass('ah-layer-flex');
            $('div.ah-default-popup').hide();
            closeModal();
        }
    });

    //RK Отклонение описание
    var chbxDescrContacts = $('<input/>', {
        class: 'ah-divOptions ah-default-checkbox addOld-button-checkbox',
        type: 'checkbox',
        id: 'chbxDescrContacts',
        action: 'reject',
        value: '106'
    });
    var chbxDescrTags = $('<input/>', {
        class: 'ah-divOptions ah-default-checkbox addOld-button-checkbox',
        type: 'checkbox',
        id: 'chbxDescrTags',
        action: 'reject',
        value: '16'
    });
    var chbxDescrNonDetailed = $('<input/>', {
        class: 'ah-divOptions ah-default-checkbox addOld-button-checkbox',
        type: 'checkbox',
        id: 'chbxDescrNonDetailed',
        action: 'reject',
        value: '14'
    });
    var chbxDescrInCorrect = $('<input/>', {
        class: 'ah-divOptions ah-default-checkbox addOld-button-checkbox',
        type: 'checkbox',
        id: 'chbxDescrInCorrect',
        action: 'reject',
        value: '177'
    });
    var chbxDescrDiscrimination = $('<input/>', {
        class: 'ah-divOptions ah-default-checkbox addOld-button-checkbox',
        type: 'checkbox',
        id: 'chbxDescrDiscrimination',
        action: 'reject',
        value: '117'
    });
    var chbxVacancyNonDetailed = $('<input/>', {
        class: 'ah-divOptions ah-default-checkbox addOld-button-checkbox',
        type: 'checkbox',
        id: 'chbxVacancyNonDetailed',
        action: 'reject',
        value: '465'
    });

    //RK Отклонение фото
    var chbxPhotoContacts = $('<input/>', {
        class: 'ah-divOptions ah-default-checkbox addOld-button-checkbox',
        type: 'checkbox',
        id: 'chbxPhotoContacts',
        action: 'reject',
        value: '167'
    });
    var chbxPhotoFocus = $('<input/>', {
        class: 'ah-divOptions ah-default-checkbox addOld-button-checkbox',
        type: 'checkbox',
        id: 'chbxPhotoFocus',
        action: 'reject',
        value: '168'
    });
    var chbxPhotoMark = $('<input/>', {
        class: 'ah-divOptions ah-default-checkbox addOld-button-checkbox',
        type: 'checkbox',
        id: 'chbxPhotoMark',
        action: 'reject',
        value: '169'
    });
    var chbxPhotoInCorrect = $('<input/>', {
        class: 'ah-divOptions ah-default-checkbox addOld-button-checkbox',
        type: 'checkbox',
        id: 'chbxPhotoInCorrect',
        action: 'reject',
        value: '112'
    });
    var chbxPhotoWrong = $('<input/>', {
        class: 'ah-divOptions ah-default-checkbox addOld-button-checkbox',
        type: 'checkbox',
        id: 'chbxPhotoWrong',
        action: 'reject',
        value: '15'
    });
    var chbxPhotoNonPhoto = $('<input/>', {
        class: 'ah-divOptions ah-default-checkbox addOld-button-checkbox',
        type: 'checkbox',
        id: 'chbxPhotoNonPhoto',
        action: 'reject',
        value: '171'
    });
    var chbxPhotoNonLogo = $('<input/>', {
        class: 'ah-divOptions ah-default-checkbox addOld-button-checkbox',
        type: 'checkbox',
        id: 'chbxPhotoNonLogo',
        action: 'reject',
        value: '170'
    });

    //RK Отклонение Цена
    var chbxPriceUnreal = $('<input/>', {
        class: 'ah-divOptions ah-default-checkbox addOld-button-checkbox',
        type: 'checkbox',
        id: 'chbxPriceUnreal',
        action: 'reject',
        value: '11'
    });
    var chbxPriceWrong = $('<input/>', {
        class: 'ah-divOptions ah-default-checkbox addOld-button-checkbox',
        type: 'checkbox',
        id: 'chbxPriceWrong',
        action: 'reject',
        value: '165'
    });

    //RK Отклонение название
    var chbxTitlePrice = $('<input/>', {
        class: 'ah-divOptions ah-default-checkbox addOld-button-checkbox',
        type: 'checkbox',
        id: 'chbxTitlePrice',
        action: 'reject',
        value: '4'
    });
    var chbxTitleFocus = $('<input/>', {
        class: 'ah-divOptions ah-default-checkbox addOld-button-checkbox',
        type: 'checkbox',
        id: 'chbxTitleFocus',
        action: 'reject',
        value: '12'
    });
    var chbxTitleContacts = $('<input/>', {
        class: 'ah-divOptions ah-default-checkbox addOld-button-checkbox',
        type: 'checkbox',
        id: 'chbxTitleContacts',
        action: 'reject',
        value: '161'
    });
    var chbxTitleInCorrect = $('<input/>', {
        class: 'ah-divOptions ah-default-checkbox addOld-button-checkbox',
        type: 'checkbox',
        id: 'chbxTitleInCorrect',
        action: 'reject',
        value: '114'
    });

    //RK Отклонение общее
    var chbxManyItems = $('<input/>', {
        class: 'ah-divOptions ah-default-checkbox addOld-button-checkbox',
        type: 'checkbox',
        id: 'chbxManyItems',
        action: 'reject',
        value: '13'
    });
    var chbxNoneItems = $('<input/>', {
        class: 'ah-divOptions ah-default-checkbox addOld-button-checkbox',
        type: 'checkbox',
        id: 'chbxNoneItems',
        action: 'reject',
        value: '122'
    });
    var chbxKategor = $('<input/>', {
        class: 'ah-divOptions ah-default-checkbox addOld-button-checkbox',
        type: 'checkbox',
        id: 'chbxKategor',
        action: 'reject',
        value: '178'
    });
    var chbxDocumentation = $('<input/>', {
        class: 'ah-divOptions ah-default-checkbox addOld-button-checkbox',
        type: 'checkbox',
        id: 'chbxDocumentation',
        action: 'reject',
        value: '500'
    });

    var chbxPointOnMap = $('<input/>', {
        class: 'ah-divOptions ah-default-checkbox addOld-button-checkbox',
        type: 'checkbox',
        id: 'chbxPointOnMap',
        action: 'reject',
        value: '608'
    });

    var chbxParamAddress = $('<input/>', {
        class: 'ah-divOptions ah-default-checkbox addOld-button-checkbox',
        type: 'checkbox',
        id: 'chbxParamAddress',
        action: 'reject',
        value: 'ParamAddress'
    });

    //RK Блокировка Общее
    var chbxPovtorka = $('<input/>', {
        class: 'ah-divOptions ah-default-checkbox addOld-button-checkbox',
        type: 'checkbox',
        id: 'chbxPovtorka',
        action: 'block',
        value: '20'
    });
    var chbxWork = $('<input/>', {
        class: 'ah-divOptions ah-default-checkbox addOld-button-checkbox',
        type: 'checkbox',
        id: 'chbxWork',
        action: 'block',
        value: '145'
    });
    var chbxMedikam = $('<input/>', {
        class: 'ah-divOptions ah-default-checkbox addOld-button-checkbox',
        type: 'checkbox',
        id: 'chbxMedikam',
        action: 'block',
        value: '136'
    });
    var chbxCity = $('<input/>', {
        class: 'ah-divOptions ah-default-checkbox addOld-button-checkbox',
        type: 'checkbox',
        id: 'chbxCity',
        action: 'block',
        value: '25'
    });
    var chbxReklama = $('<input/>', {
        class: 'ah-divOptions ah-default-checkbox addOld-button-checkbox',
        type: 'checkbox',
        id: 'chbxReklama',
        action: 'block',
        value: '125'
    });
    var chbxReplica = $('<input/>', {
        class: 'ah-divOptions ah-default-checkbox addOld-button-checkbox',
        type: 'checkbox',
        id: 'chbxReplica',
        action: 'block',
        value: '119'
    });
    var chbxTypal = $('<input/>', {
        class: 'ah-divOptions ah-default-checkbox addOld-button-checkbox',
        type: 'checkbox',
        id: 'chbxTypal',
        action: 'block',
        value: '131'
    });
    var chbxUserAbuse = $('<input/>', {
        class: 'ah-divOptions ah-default-checkbox addOld-button-checkbox',
        type: 'checkbox',
        id: 'chbxUserAbuse',
        action: 'block',
        value: '23'
    });
    var chbxRightHolderAbuse = $('<input/>', {
        class: 'ah-divOptions ah-default-checkbox addOld-button-checkbox',
        type: 'checkbox',
        id: 'chbxRightHolderAbuse',
        action: 'block',
        value: '129'
    });
    var chbxAutoupload = $('<input/>', {
        class: 'ah-divOptions ah-default-checkbox addOld-button-checkbox',
        type: 'checkbox',
        id: 'chbxAutoupload',
        action: 'block',
        value: '256'
    });
    var chbxFraudScheme = $('<input/>', {
        class: 'ah-divOptions ah-default-checkbox addOld-button-checkbox',
        type: 'checkbox',
        id: 'chbxFraudScheme',
        action: 'block',
        value: '130'
    });
    var chbxFake = $('<input/>', {
        class: 'ah-divOptions ah-default-checkbox addOld-button-checkbox',
        type: 'checkbox',
        id: 'chbxFake',
        action: 'block',
        value: '384'
    });
    var chbxTaboo = $('<input/>', {
        class: 'ah-divOptions ah-default-checkbox addOld-button-checkbox',
        type: 'checkbox',
        id: 'chbxTaboo',
        action: 'block',
        value: '21'
    });
    var chbxBuy = $('<input/>', {
        class: 'ah-divOptions ah-default-checkbox addOld-button-checkbox',
        type: 'checkbox',
        id: 'chbxBuy',
        action: 'block',
        value: '26'
    });

    // RK Блокировка запрещенка
    var chbxNarc = $('<input/>', {
        class: 'ah-divOptions ah-default-checkbox addOld-button-checkbox',
        type: 'checkbox',
        id: 'chbxNarc',
        action: 'block',
        value: '134'
    });
    var chbxGuns = $('<input/>', {
        class: 'ah-divOptions ah-default-checkbox addOld-button-checkbox',
        type: 'checkbox',
        id: 'chbxGuns',
        action: 'block',
        value: '135'
    });
    var chbxAlcohol = $('<input/>', {
        class: 'ah-divOptions ah-default-checkbox addOld-button-checkbox',
        type: 'checkbox',
        id: 'chbxAlcohol',
        action: 'block',
        value: '137'
    });
    var chbxSex = $('<input/>', {
        class: 'ah-divOptions ah-default-checkbox addOld-button-checkbox',
        type: 'checkbox',
        id: 'chbxSex',
        action: 'block',
        value: '138'
    });
    var chbxFinancial = $('<input/>', {
        class: 'ah-divOptions ah-default-checkbox addOld-button-checkbox',
        type: 'checkbox',
        id: 'chbxFinancial',
        action: 'block',
        value: '139'
    });
    var chbxRedBook = $('<input/>', {
        class: 'ah-divOptions ah-default-checkbox addOld-button-checkbox',
        type: 'checkbox',
        id: 'chbxRedBook',
        action: 'block',
        value: '140'
    });
    var chbxAward = $('<input/>', {
        class: 'ah-divOptions ah-default-checkbox addOld-button-checkbox',
        type: 'checkbox',
        id: 'chbxAward',
        action: 'block',
        value: '141'
    });
    var chbxTechSpecifics = $('<input/>', {
        class: 'ah-divOptions ah-default-checkbox addOld-button-checkbox',
        type: 'checkbox',
        id: 'chbxTechSpecifics',
        action: 'block',
        value: '142'
    });
    var chbxSpam = $('<input/>', {
        class: 'ah-divOptions ah-default-checkbox addOld-button-checkbox',
        type: 'checkbox',
        id: 'chbxSpam',
        action: 'block',
        value: '143'
    });
    var chbxGamesBus = $('<input/>', {
        class: 'ah-divOptions ah-default-checkbox addOld-button-checkbox',
        type: 'checkbox',
        id: 'chbxGamesBus',
        action: 'block',
        value: '144'
    });
    var chbxQueerItem = $('<input/>', {
        class: 'ah-divOptions ah-default-checkbox addOld-button-checkbox',
        type: 'checkbox',
        id: 'chbxQueerItem',
        action: 'block',
        value: '146'
    });
    var chbxParamVidYsl = $('<input/>', {
        class: 'ah-divOptions ah-default-checkbox addOld-button-checkbox',
        type: 'checkbox',
        id: 'chbxParamVidYsl',
        action: 'reject',
        value: '175_716'
    });
    var chbxParamProb = $('<input/>', {
        class: 'ah-divOptions ah-default-checkbox addOld-button-checkbox',
        type: 'checkbox',
        id: 'chbxParamProb',
        action: 'reject',
        value: '175_2687'
    });

    //RK Отклонение общее
    $('#ah-divOptions').append('<div class="reject-chbx ah-options-group btncheck" style=""></div>');

    $('.reject-chbx').append('<div class="reject-chbx-common" style="display: inline-block; vertical-align: top;"></div>');
    $('.reject-chbx-common').append('<span style="color:red; font-size:17px;">Reject Common</span><br>');
    $('.reject-chbx-common').append(chbxManyItems, '<label for="chbxManyItems" class="ah-default-label">Несколько товаров</label>', '<br>');
    $('.reject-chbx-common').append(chbxNoneItems, '<label for="chbxNoneItems" class="ah-default-label">Отсутствие товара</label>', '<br>');
    $('.reject-chbx-common').append(chbxKategor, '<label for="chbxKategor" class="ah-default-label">Неправильная Категория</label>', '<br>');
    $('.reject-chbx-common').append(chbxDocumentation, '<label for="chbxDocumentation" class="ah-default-label">Ссылка на документацию</label>', '<br>');
    $('.reject-chbx-common').append(chbxPointOnMap, '<label for="chbxPointOnMap" class="ah-default-label">Точка на карте</label>', '<br>');
    $('.reject-chbx-common').append(chbxParamAddress, '<label for="chbxParamAddress" class="ah-default-label">Параметр "Адрес"</label>', '<br>');
    $('.reject-chbx-common').append(chbxParamVidYsl, '<label for="chbxParamVidYsl" class="ah-default-label">Параметр "Вид услуги"</label>', '<br>');
    $('.reject-chbx-common').append(chbxParamProb, '<label for="chbxParamProb" class="ah-default-label">Параметр "Пробег"</label>', '<br>');

    //RK Отклонение название
    $('.reject-chbx').append('<div class="reject-chbx-names" style="display: inline-block; vertical-align: top; margin-left: 20px;"></div>');
    $('.reject-chbx-names').append('<span style="color:red; font-size:17px;">Reject Names</span><br>');
    $('.reject-chbx-names').append(chbxTitlePrice, '<label for="chbxTitlePrice" class="ah-default-label">Цена</label>', '<br>');
    $('.reject-chbx-names').append(chbxTitleFocus, '<label for="chbxTitleFocus" class="ah-default-label">Привлечение внимания</label>', '<br>');
    $('.reject-chbx-names').append(chbxTitleContacts, '<label for="chbxTitleContacts" class="ah-default-label">Контакты</label>', '<br>');
    $('.reject-chbx-names').append(chbxTitleInCorrect, '<label for="chbxTitleInCorrect" class="ah-default-label">Некорректное</label>', '<br>');

    //RK Отклонение цена
    $('.reject-chbx').append('<div class="reject-chbx-price" style="display: inline-block; vertical-align: top; margin-left: 20px;"></div>');
    $('.reject-chbx-price').append('<span style="color:red; font-size:17px;">Reject Price</span><br>');
    $('.reject-chbx-price').append(chbxPriceUnreal, '<label for="chbxPriceUnreal" class="ah-default-label">Нереалистичная</label>', '<br>');
    $('.reject-chbx-price').append(chbxPriceWrong, '<label for="chbxPriceWrong" class="ah-default-label">Несоответствующая</label>', '<br>');

    //RK Отклонение фото
    $('.reject-chbx').append('<div class="reject-chbx-photo" style="display: inline-block; vertical-align: top; margin-left: 20px;"></div>');
    $('.reject-chbx-photo').append('<span style="color:red; font-size:17px;">Reject Photo</span><br>');
    $('.reject-chbx-photo').append(chbxPhotoContacts, '<label for="chbxPhotoContacts" class="ah-default-label">Контакты</label>', '<br>');
    $('.reject-chbx-photo').append(chbxPhotoFocus, '<label for="chbxPhotoFocus" class="ah-default-label">Привлечение внимания</label>', '<br>');
    $('.reject-chbx-photo').append(chbxPhotoMark, '<label for="chbxPhotoMark" class="ah-default-label">Вотермарки и логотипы</label>', '<br>');
    $('.reject-chbx-photo').append(chbxPhotoNonPhoto, '<label for="chbxPhotoNonPhoto" class="ah-default-label">Не фото</label>', '<br>');
    $('.reject-chbx-photo').append(chbxPhotoNonLogo, '<label for="chbxPhotoNonLogo" class="ah-default-label">Не логотип</label>', '<br>');
    $('.reject-chbx-photo').append(chbxPhotoInCorrect, '<label for="chbxPhotoInCorrect" class="ah-default-label">Некорректное</label>', '<br>');
    $('.reject-chbx-photo').append(chbxPhotoWrong, '<label for="chbxPhotoWrong" class="ah-default-label">Несоответствующее</label>', '<br>');

    //RK Отклонение описание
    $('.reject-chbx').append('<div class="reject-chbx-description" style="display: inline-block; vertical-align: top; margin-left: 20px;"></div>');
    $('.reject-chbx-description').append('<span style="color:red; font-size:17px;">Reject Description</span><br>');
    $('.reject-chbx-description').append(chbxDescrContacts, '<label for="chbxDescrContacts" class="ah-default-label">Контакты</label>', '<br>');
    $('.reject-chbx-description').append(chbxDescrTags, '<label for="chbxDescrTags" class="ah-default-label">Ключевые слова</label>', '<br>');
    $('.reject-chbx-description').append(chbxDescrDiscrimination, '<label for="chbxDescrDiscrimination" class="ah-default-label">Дискриминация</label>', '<br>');
    $('.reject-chbx-description').append(chbxDescrNonDetailed, '<label for="chbxDescrNonDetailed" class="ah-default-label">Не подробное</label>', '<br>');
    $('.reject-chbx-description').append(chbxDescrInCorrect, '<label for="chbxDescrInCorrect" class="ah-default-label">Некорректное</label>', '<br>');
    $('.reject-chbx-description').append(chbxVacancyNonDetailed, '<label for="chbxVacancyNonDetailed" class="ah-default-label">Не подробное (вакансии)</label>', '<br>');

    //RK Неправильная категория
    $('#ah-divOptions').append('<div class="ah-chbx-category ah-options-group" style="display: none; margin: 5px;"></div>');
    $('.ah-chbx-category').append('' +
        '<span style="color:red; font-size:17px;">Отклонение "Неправильная категория с подписями"</span>' +
        '<label class="ah-default-label" style="float: right; color: #9f0707">Авто кнопки с прогнозами <input class="ah-default-checkbox" type="checkbox" name="other" value="autoProbButtons" style="margin-right: 3px;"></label>' +
        '<div class="ah-chbx-category-body" style="white-space: nowrap; overflow: auto; width: 850px;"></div>');

    const jsonOtherReasonsCategoryBox = [
        {
            name: "Личные вещи", color: '#f4f400', short_name: 'ЛВ', show: "false",
            reason: [
                {name: 'Одежда, обувь, аксессуары', color: '#dfcc01', short_name: 'ЛВ_Оде', show: "false"},
                {name: 'Детская одежда и обувь', color: '#dfcf11', short_name: 'ЛВ_Дет', show: "false"},
                {name: 'Товары для детей и игрушки', color: '#dfd32f', short_name: 'ЛВ_Игр', show: "false"},
                {name: 'Красота и здоровье', color: '#dfd74a', short_name: 'ЛВ_Крас', show: "false"},
                {name: 'Часы и украшения', color: '#DFDD61', short_name: 'ЛВ_Часы', show: "false"}
            ]
        },
        {
            name: "Для дома и дачи", color: '#996600', short_name: 'ДДД', show: "false",
            reason: [
                {name: 'Ремонт и строительство', color: '#CC9933', short_name: 'ДДД_Рем', show: "false"},
                {name: 'Мебель и интерьер', color: '#CC9900', short_name: 'ДДД_Меб', show: "false"},
                {name: 'Бытовая техника', color: '#FFCC33', short_name: 'ДДД_Быт', show: "false"},
                {name: 'Растения', color: '#FFCC00', short_name: 'ДДД_Раст', show: "false"},
                {name: 'Продукты питания', color: '#FFCC66', short_name: 'ДДД_Пит', show: "false"},
                {name: 'Посуда и товары для кухни', color: '#CC9966', short_name: 'ДДД_Пос', show: "false"}
            ]
        },
        {
            name: "Транспорт", color: '#CC0033', short_name: 'ТР', show: "false",
            reason: [
                {name: 'Запчасти и аксессуары', color: '#FF0033', short_name: 'ТР_Зап', show: "false"},
                {name: 'Автомобили', color: '#FF3333', short_name: 'ТР_Авт', show: "false"},
                {name: 'Грузовики и спецтехника', color: '#FF6666', short_name: 'ТР_Груз', show: "false"},
                {name: 'Мотоциклы и мототехника', color: '#FF9999', short_name: 'ТР_Мот', show: "false"},
                {name: 'Водный транспорт', color: '#FF3300', short_name: 'ТР_Водн', show: "false"}
            ]
        },
        {
            name: "Бытовая электроника", color: '#0033CC', short_name: 'БЭ', show: "false",
            reason: [
                {name: 'Телефоны', color: '#003399', short_name: 'БЭ_Тел', show: "false"},
                {name: 'Аудио и видео', color: '#0033FF', short_name: 'БЭ_Ауд', show: "false"},
                {name: 'Товары для компьютера', color: '#0000CC', short_name: 'БЭ_ТовКомп', show: "false"},
                {name: 'Фототехника', color: '#6666CC', short_name: 'БЭ_Фото', show: "false"},
                {name: 'Оргтехника и расходники', color: '#6666FF', short_name: 'БЭ_Оргт', show: "false"},
                {name: 'Игры, приставки и программы', color: '#9999FF', short_name: 'БЭ_Игры', show: "false"},
                {name: 'Ноутбуки', color: '#6600FF', short_name: 'БЭ_Ноут', show: "false"},
                {name: 'Планшеты и электронные книги', color: '#9999CC', short_name: 'БЭ_Планш', show: "false"},
                {name: 'Настольные компьютеры', color: '#CCCCFF', short_name: 'БЭ_НастКомп', show: "false"}
            ]
        },
        {
            name: "Хобби и отдых", color: '#336666', short_name: 'ХО', show: "false",
            reason: [
                {name: 'Коллекционирование', color: '#006666', short_name: 'ХО_Колл', show: "false"},
                {name: 'Спорт и отдых', color: '#669999', short_name: 'ХО_Спорт', show: "false"},
                {name: 'Книги и журналы', color: '#339999', short_name: 'ХО_Книги', show: "false"},
                {name: 'Велосипеды', color: '#66CCCC', short_name: 'ХО_Вело', show: "false"},
                {name: 'Музыкальные инструменты', color: '#99CCCC', short_name: 'ХО_Муз', show: "false"},
                {name: 'Охота и рыбалка', color: '#0099CC', short_name: 'ХО_Охота', show: "false"},
                {name: 'Билеты и путешествия', color: '#00CCFF', short_name: 'ХО_Бил', show: "false"}
            ]
        },
        {
            name: "Недвижимость", color: '#009933', short_name: 'RE', show: "false",
            reason: [
                {name: 'Квартиры', color: '#00CC66', short_name: 'RE_Кварт', show: "false"},
                {name: 'Дома, дачи, коттеджи', color: '#33CC66', short_name: 'RE_Дома', show: "false"},
                {name: 'Земельные участки', color: '#00FF99', short_name: 'RE_ЗемУч', show: "false"},
                {name: 'Коммерческая недвижимость', color: '#33FF99', short_name: 'RE_Коммерц', show: "false"},
                {name: 'Гаражи и машиноместа', color: '#33CC99', short_name: 'RE_Гараж', show: "false"},
                {name: 'Комнаты', color: '#66FFCC', short_name: 'RE_Комнт', show: "false"},
                {name: 'Недвижимость за рубежом', color: '#33CCCC', short_name: 'RE_Зарубеж', show: "false"}
            ]
        },
        {
            name: "Работа", color: '#009900', short_name: 'Работ', show: "false",
            reason: [
                {name: 'Резюме', color: '#669933', short_name: 'Работ_Рез', show: "false"},
                {name: 'Вакансии', color: '#CCFF99', short_name: 'Работ_Вак', show: "false"}
            ]
        },
        {
            name: "Услуги", color: '#9900FF', short_name: 'Услуги', show: "false",
            reason: [
                {name: 'Вид услуги', color: '#9933FF', short_name: 'Услуги_П', show: "false"}
            ]
        },
        {
            name: "Животные", color: '#99CC66	', short_name: 'Жив', show: "false",
            reason: [
                {name: 'Кошки', color: '#99CC00', short_name: 'Жив_Кош', show: "false"},
                {name: 'Собаки', color: '#669933', short_name: 'Жив_Соб', show: "false"},
                {name: 'Товары для животных', color: '#66CC00', short_name: 'Жив_Тов', show: "false"},
                {name: 'Другие животные', color: '#99FF66', short_name: 'Жив_Другие', show: "false"},
                {name: 'Аквариум', color: '#99FF00', short_name: 'Жив_Аква', show: "false"},
                {name: 'Птицы', color: '#66CC33', short_name: 'Жив_Птицы', show: "false"}
            ]
        },
        {
            name: "Для бизнеса", color: '#CCCC33', short_name: 'ДБ', show: "false",
            reason: [
                {name: 'Оборудование для бизнеса', color: '#999933', short_name: 'ДБ_Обор', show: "false"},
                {name: 'Готовый бизнес', color: '#CCCC66', short_name: 'ДБ_ГотБ', show: "false"}
            ]
        }
    ];

    if (!localStorage.otherReasonsCategoryBox) localStorage.otherReasonsCategoryBox = JSON.stringify(jsonOtherReasonsCategoryBox);

    let otherReasonsCategory = JSON.parse(localStorage.otherReasonsCategoryBox);

    for (let i = 0; i < otherReasonsCategory.length; ++i) {
        let checked = '';
        if (otherReasonsCategory[i].show === 'true') checked = 'checked';
        else checked = '';
        let labels = '<div>' +
            '<span style="color:red; font-size:14px;">' + otherReasonsCategory[i].name + '</span><br>' +
            '<label class="ah-default-label"><input class="ah-default-checkbox" type="checkbox" name="reject-category" short-name="' + otherReasonsCategory[i].short_name + '" value="178" style="margin-right: 3px;" ' + checked + '/>' + otherReasonsCategory[i].name + '</label>' +
            '</div>';

        for (let j = 0; j < otherReasonsCategory[i].reason.length; ++j) {
            let reason = otherReasonsCategory[i].reason[j];

            if (reason.show === 'true') checked = 'checked';
            else checked = '';

            labels += '<div><label class="ah-default-label"><input type="checkbox" class="ah-default-checkbox" name="reject-category" short-name="' + reason.short_name + '" value="178" style="margin-right: 3px;" ' + checked + '/>' + reason.name + '</label></div>';
        }

        $('.ah-chbx-category-body').append('<div style="display: inline-block; vertical-align: top; margin-right: 10px">' + labels + '</div>');
    }

    // RK Блокировка общее
    $('#ah-divOptions').append('<div class="chbx" style="margin-top: 10px;"></div>');
    $('.chbx').append('<div class="block-chbx ah-options-group btncheck" style="display: inline-block; float: left; padding-bottom: 13px;"></div>');

    $('.block-chbx').append('<div class="block-chbx-common" style="display: inline-block; vertical-align: top;"></div>');
    $('.block-chbx-common').append('<span style="color:red; font-size:17px;">Block Common</span><br>');
    $('.block-chbx-common').append(chbxPovtorka, '<label for="chbxPovtorka" class="ah-default-label">Повторная подача объявлений</label>', '<br>');
    $('.block-chbx-common').append(chbxBuy, '<label for="chbxBuy" class="ah-default-label">Объявление о покупке</label>', '<br>');
    $('.block-chbx-common').append(chbxTaboo, '<label for="chbxTaboo" class="ah-default-label">Запрещённый товар</label>', '<br>');
    $('.block-chbx-common').append(chbxCity, '<label for="chbxCity" class="ah-default-label">Неправильный Город</label>', '<br>');
    $('.block-chbx-common').append(chbxReklama, '<label for="chbxReklama" class="ah-default-label">Реклама бизнеса и сайтов</label>', '<br>');
    $('.block-chbx-common').append(chbxReplica, '<label for="chbxReplica" class="ah-default-label">Копии товаров</label>', '<br>');
    $('.block-chbx-common').append(chbxTypal, '<label for="chbxTypal" class="ah-default-label">Типовой товар</label>', '<br>');
    $('.block-chbx-common').append(chbxUserAbuse, '<label for="chbxUserAbuse" class="ah-default-label">Жалобы пользователей</label>', '<br>');
    $('.block-chbx-common').append(chbxRightHolderAbuse, '<label for="chbxRightHolderAbuse" class="ah-default-label">Жалобы Парвообладателей</label>', '<br>');
    $('.block-chbx-common').append(chbxAutoupload, '<label for="chbxAutoupload" class="ah-default-label">Автовыгрузка</label>', '<br>');
    $('.block-chbx-common').append(chbxFraudScheme, '<label for="chbxFraudScheme" class="ah-default-label">Мошенническая схема</label>', '<br>');
    $('.block-chbx-common').append(chbxFake, '<label for="chbxFake" class="ah-default-label">Фейк</label>', '<br>');

    // RK Блокировка запрещенка
    $('.block-chbx').append('<div class="block-chbx-taboo" style="display: inline-block; vertical-align: top; margin-left: 20px;"></div>');
    $('.block-chbx-taboo').append('<span style="color:red; font-size:17px;">Block Taboo</span><br>');
    $('.block-chbx-taboo').append(chbxNarc, '<label for="chbxNarc" class="ah-default-label">Наркотики</label>', '<br>');
    $('.block-chbx-taboo').append(chbxGuns, '<label for="chbxGuns" class="ah-default-label">Оружие</label>', '<br>');
    $('.block-chbx-taboo').append(chbxMedikam, '<label for="chbxMedikam" class="ah-default-label">Медикаменты и оборудование</label>', '<br>');
    $('.block-chbx-taboo').append(chbxAlcohol, '<label for="chbxAlcohol" class="ah-default-label">Алкоголь и табак</label>', '<br>');
    $('.block-chbx-taboo').append(chbxSex, '<label for="chbxSex" class="ah-default-label">Интим</label>', '<br>');
    $('.block-chbx-taboo').append(chbxFinancial, '<label for="chbxFinancial" class="ah-default-label">Финансовые операции</label>', '<br>');
    $('.block-chbx-taboo').append(chbxRedBook, '<label for="chbxRedBook" class="ah-default-label">Красная книга и браконьерство</label>', '<br>');
    $('.block-chbx-taboo').append(chbxAward, '<label for="chbxAward" class="ah-default-label">Награды</label>', '<br>');
    $('.block-chbx-taboo').append(chbxTechSpecifics, '<label for="chbxTechSpecifics" class="ah-default-label">Специальные технические средства</label>', '<br>');
    $('.block-chbx-taboo').append(chbxSpam, '<label for="chbxSpam" class="ah-default-label">Спам-базы и БД</label>', '<br>');
    $('.block-chbx-taboo').append(chbxGamesBus, '<label for="chbxGamesBus" class="ah-default-label">Игорный бизнес</label>', '<br>');
    $('.block-chbx-taboo').append(chbxQueerItem, '<label for="chbxQueerItem" class="ah-default-label">Сомнительное объявление</label>', '<br>');
    $('.block-chbx-taboo').append(chbxWork, '<label for="chbxWork" class="ah-default-label">Сомнительная работа</label>', '<br>');

    // descriptionMode SETTINGS
    $('.chbx').append('<div class="block-descriptionMode ah-options-group" style="float: right; padding: 14px; padding-right: 36px;"></div>');

    $('.chbx').append('<div style="clear: both;"></div>');

    $('#ah-divOptions').append('<div class="ah-infoSetting-chbx ah-options-group" style=" margin-top: 10px;"></div>');
    // BLOCK USERS
    $('.ah-infoSetting-chbx').append('<div id="blockUsersOnPre" class="btncheck"><b style="color:red;">Block users:</b></div>');
    $('#blockUsersOnPre').append('<label class="ah-default-label"><input class="ah-default-checkbox addOld-button-checkbox" id="bubn" action="blockUser" type="checkbox" name="blockUsers" value="BN" style="margin-right: 3px;">BN</label>');
    $('#blockUsersOnPre').append('<label class="ah-default-label"><input class="ah-default-checkbox addOld-button-checkbox" id="bupa" action="blockUser" type="checkbox" name="blockUsers" value="PA" style="margin-right: 3px;">PA</label>');
    $('#blockUsersOnPre').append('<label class="ah-default-label"><input class="ah-default-checkbox addOld-button-checkbox" id="bumc" action="blockUser" type="checkbox" name="blockUsers" value="MC" style="margin-right: 3px;">MC</label>');
    // BLOCK USERS

    // INFO SETTINGS
    $('.ah-infoSetting-chbx').append('<div id="infoSetting"><b style="color:red;">Info settings:</b></div>');
    $('#infoSetting').append('<label class="ah-default-label"><input class="ah-default-checkbox" type="checkbox" name="info" value="infoSetting16" style="margin-right: 3px;">Email</label>');
    $('#infoSetting').append('<label class="ah-default-label"><input class="ah-default-checkbox" type="checkbox" name="info" value="infoSetting1" style="margin-right: 3px;">Status</label>');
    $('#infoSetting').append('<label class="ah-default-label"><input class="ah-default-checkbox" type="checkbox" name="info" value="infoSetting17" style="margin-right: 3px;">Chance</label>');
    $('#infoSetting').append('<label class="ah-default-label"><input class="ah-default-checkbox" type="checkbox" name="info" value="infoSetting2" style="margin-right: 3px;">Registered</label>');
    $('#infoSetting').append('<label class="ah-default-label"><input class="ah-default-checkbox" type="checkbox" name="info" value="infoSetting3" style="margin-right: 3px;">Items</label>');
    $('#infoSetting').append('<label class="ah-default-label"><input class="ah-default-checkbox" type="checkbox" name="info" value="infoSetting4" style="margin-right: 3px;">Item IP</label>');
    $('#infoSetting').append('<label class="ah-default-label"><input class="ah-default-checkbox" type="checkbox" name="info" value="infoSetting13" style="margin-right: 3px;">Start Time</label>');
    $('#infoSetting').append('<label class="ah-default-label"><input class="ah-default-checkbox" type="checkbox" name="info" value="infoSetting5" style="margin-right: 3px;">Last IP</label>');
    $('#infoSetting').append('<label class="ah-default-label"><input class="ah-default-checkbox" type="checkbox" name="info" value="infoSetting6" style="margin-right: 3px;">Proprietary</label>');
    $('#infoSetting').append('<label class="ah-default-label"><input class="ah-default-checkbox" type="checkbox" name="info" value="infoSetting12" style="margin-right: 3px;">Address</label>');
    $('#infoSetting').append('<label class="ah-default-label"><input class="ah-default-checkbox" type="checkbox" name="info" value="infoSetting7" style="margin-right: 3px;">Phones</label>');

    $('.ah-infoSetting-chbx').append('<div id="phoneSetting" style="display:none;"><b style="color:red;">Phones settings:</b></div>');
    $('#phoneSetting').append('<label class="ah-default-label"><input class="ah-default-checkbox" type="checkbox" name="info" value="infoSetting8" style="margin-right: 3px;">Phone link ???</label>');
    $('#phoneSetting').append('<label class="ah-default-label"><input class="ah-default-checkbox" type="checkbox" name="info" value="infoSetting9" style="margin-right: 3px;">+city</label>');
    $('#phoneSetting').append('<label class="ah-default-label"><input class="ah-default-checkbox" type="checkbox" name="info" value="infoSetting10" style="margin-right: 3px;">+private</label>');
    $('#phoneSetting').append('<label class="ah-default-label"><input class="ah-default-checkbox" type="checkbox" name="info" value="infoSetting11" style="margin-right: 3px;">+param</label>');
    $('#phoneSetting').append('<label class="ah-default-label"><input class="ah-default-checkbox" type="checkbox" name="info" value="infoSetting14" style="margin-right: 3px;">+item ip</label>');
    $('#phoneSetting').append('<label class="ah-default-label"><input class="ah-default-checkbox" type="checkbox" name="info" value="infoSetting15" style="margin-right: 3px;">Verify date</label>');

    var checkboxStatus = localStorage.checkboxInfo.split('|');
    for (var i = 0; i < checkboxStatus.length; i++) {
        $('input[value="' + checkboxStatus[i] + '"]').prop('checked', true);
    }

    if (localStorage.checkboxInfo.indexOf('infoSetting7|') + 1) $('#phoneSetting').show();

    $('[name="info"]:checkbox').change(function () {
        var val = $(this).attr("value");
        if (localStorage.checkboxInfo.indexOf(val + '|') + 1) {
            var tmp = localStorage.checkboxInfo;
            tmp = tmp.replace(val + '|', '');
            localStorage.checkboxInfo = tmp;
            if (val === 'infoSetting7') $('#phoneSetting').hide();
        } else {
            localStorage.checkboxInfo += val + '|';
            if (val === 'infoSetting7') $('#phoneSetting').show();
        }
    });

    // ABUSES SETTINGS
    $('.ah-infoSetting-chbx').append('<div id="abusesSetting"><b style="color:red;">Abuses settings:</b></div>');
    $('#abusesSetting').append('<label class="ah-default-label"><input class="ah-default-checkbox" type="checkbox" name="abuses" value="checkItems" style="margin-right: 3px;">Check only current item</label>');

    if (!localStorage.abusesSetting) localStorage.abusesSetting = 'false';

    if (localStorage.abusesSetting === 'true') $('input[value="checkItems"]').prop('checked', true);

    $('[name="abuses"]:checkbox').change(function () {
        if ($('input[value="checkItems"]').prop('checked')) {
            localStorage.abusesSetting = 'true';
        } else {
            localStorage.abusesSetting = 'false';
        }
    });
    // ABUSES SETTINGS

    // EYE SETTINGS
    $('.ah-infoSetting-chbx').append('<div id="eyeSetting"><b style="color:red;">Eye settings:</b></div>');
    $('#eyeSetting')
        .append('<span style="margin-left: 10px;" title="Параметры необходимо вводить через запятую и пробел!\n\nОбращаю ваше внимание на то, что поиск будет построен четко по параметрам, независимо от настройки критериев поиска в items/search.">Список параметров: <input id="eyeParamList" type="text" style="margin-left: 5px; width: 400px" value=""></span>')
        .append('<label class="ah-default-label"><input class="ah-default-checkbox" type="checkbox" name="eye" value="eyeCity" style="margin-right: 3px;">City</label>');

    if (!localStorage.eyeParamList) localStorage.eyeParamList = 'Марка, Модель, Год выпуска, Вид техники, Тип объявления, Количество комнат, Вид объекта, Срок аренды, Вид услуги, Тип услуги, Сфера деятельности, Вид одежды, Вид товара, Вид телефона, Производитель, Вид велосипеда, Порода, Вид животного, Вид бизнеса, Вид оборудования';

    $('#eyeParamList').val(localStorage.eyeParamList);

    if (!localStorage.eyeCity) localStorage.eyeCity = 'false';

    if (localStorage.eyeCity === 'true') $('input[value="eyeCity"]').prop('checked', true);

    $('[name="eye"]:checkbox').change(function () {
        if ($('input[value="eyeCity"]').prop('checked')) {
            localStorage.eyeCity = 'true';
        } else {
            localStorage.eyeCity = 'false';
        }
    });
    // EYE SETTINGS

    // OTHER SETTINGS
    $('.ah-infoSetting-chbx').append('<div id="otherSetting"><b style="color:red;">Other settings:</b></div>');
    $('#otherSetting').append('<label class="ah-default-label"><input class="ah-default-checkbox" type="checkbox" name="other" value="activeItemsPre" style="margin-right: 3px;">Active items on user</label>');
    $('#otherSetting').append('<label class="ah-default-label"><input class="ah-default-checkbox" type="checkbox" name="other" value="imageSearchComparison" style="margin-right: 3px;">Image search in comparison</label>');
    $('#otherSetting').append('<label class="ah-default-label"><input class="ah-default-checkbox" type="checkbox" name="other" value="autoCheckOtherReason" style="margin-right: 3px;">Auto check comment for "Other reason"</label>');

    if (!localStorage.addElementsForEachItem) localStorage.addElementsForEachItem = 'false';
    if (!localStorage.imageSearchComparison) localStorage.imageSearchComparison = 'false';
    if (!localStorage.autoCheckOtherReason) localStorage.autoCheckOtherReason = 'false';
    if (!localStorage.autoProbButtons) localStorage.autoProbButtons = 'false';

    if (localStorage.addElementsForEachItem === 'true') $('input[value="activeItemsPre"]').prop('checked', true);
    if (localStorage.imageSearchComparison === 'true') $('input[value="imageSearchComparison"]').prop('checked', true);
    if (localStorage.autoCheckOtherReason === 'true') $('input[value="autoCheckOtherReason"]').prop('checked', true);
    if (localStorage.autoProbButtons === 'true') $('input[value="autoProbButtons"]').prop('checked', true);

    $('[name="other"]:checkbox').change(function () {
        if ($('input[value="autoProbButtons"]').prop('checked')) {
            localStorage.autoProbButtons = 'true';
        } else {
            localStorage.autoProbButtons = 'false';
        }

        if ($('input[value="activeItemsPre"]').prop('checked')) {
            localStorage.addElementsForEachItem = 'true';
        } else {
            localStorage.addElementsForEachItem = 'false';
        }

        if ($('input[value="imageSearchComparison"]').prop('checked')) {
            localStorage.imageSearchComparison = 'true';
        } else {
            localStorage.imageSearchComparison = 'false';
        }

        if ($('input[value="autoCheckOtherReason"]').prop('checked')) {
            localStorage.autoCheckOtherReason = 'true';
        } else {
            localStorage.autoCheckOtherReason = 'false';
        }
    });
    // OTHER SETTINGS

    // кнопки
    $('#ah-divOptions').append('<div class="btn-ok-cancel" style="text-align: center; margin-top: 10px;"></div>');
    $('.btn-ok-cancel')
        .append('<button id="butOkDivSettings" class="ah-divOptions ah-moderation-default-btn" style="width:110px; margin-right: 6px;"><span class="ah-button-label ah-green-background">&#10003;</span>Ок</button>')
        .append('<button id="butCanselDivSettings" class="ah-divOptions ah-moderation-default-btn" style="width:110px;"><span class="ah-button-label ah-red-background">&#10007;</span>Отмена</button>');

    $('#butOkDivSettings').click(function () {
        localStorage.eyeParamList = $('#eyeParamList').val();
        chekButton();
        location.reload();
    });

    $('#butCanselDivSettings').click(function () {

        $('#ah-layer-blackout-popup').removeClass('ah-layer-flex');
        $('#ah-divOptions').hide();
        closeModal();
    });


    // запоминаем состояния чекбоксов в локалсторадж
    $('.btncheck input[type="checkbox"]')
        .click(function () {
            if ($(this).prop('checked')) {
                localStorage.setItem($(this).attr('id'), "true");
                // console.log($(this).attr('id') + ' added to local');
            } else {
                localStorage.setItem($(this).attr('id'), "false");
                // console.log($(this).attr('id') + ' NOT added to local');
            }
        })
        .each(function (indx) {
            if (localStorage.getItem($(this).attr('id')) === "true") {
                $(this).prop("checked", true);
            } else {
                $(this).prop("checked", false);
            }
        });

    checkOtherReasonsBox();
}


function checkOtherReasonsBox() {
    let categorySelector = $('#chbxKategor');

    if (categorySelector.prop('checked')) {
        $('.ah-chbx-category').show();
    }

    categorySelector.change(function () {
        $('.ah-chbx-category').toggle()
    });

    $('[name="reject-category"]').change(function () {
        if ($(this).prop('checked')) {
            changeOtherReasonsBoxStatus($(this).attr('short-name'), 'true');
        } else {
            changeOtherReasonsBoxStatus($(this).attr('short-name'), 'false');
        }
    });
}

function changeOtherReasonsBoxStatus(short_name, show) {
    let localReasons = JSON.parse(localStorage.otherReasonsCategoryBox);

    for (let i = 0; i < localReasons.length; ++i) {
        let category = localReasons[i];
        if (category.short_name === short_name) category.show = show;

        for (let j = 0; j < category.reason.length; ++j) {
            if (category.reason[j].short_name === short_name) category.reason[j].show = show;
        }
    }

    localStorage.otherReasonsCategoryBox = JSON.stringify(localReasons);
}


// обработчик кнопки OK в окне настроек
function chekButton() {
    localStorage.createdButtons = '';

    for (var i = 0; i < $('#ah-divOptions input.addOld-button-checkbox').length; i++) {
        if ($('#ah-divOptions input.addOld-button-checkbox').slice(i, i + 1).prop("checked")) {
            localStorage.createdButtons += ' ' + $('#ah-divOptions input.addOld-button-checkbox').slice(i, i + 1).attr('id').slice(4) + '|&|' + $('#ah-divOptions input.addOld-button-checkbox').slice(i, i + 1).attr('action') + '|&|' + $('#ah-divOptions input.addOld-button-checkbox').slice(i, i + 1).val() + '';
        } else {
            localStorage.createdButtons = localStorage.createdButtons.replace('' + $('#ah-divOptions input.addOld-button-checkbox').slice(i, i + 1).attr('id').slice(4) + '|&|' + $('#ah-divOptions input.addOld-button-checkbox').slice(i, i + 1).attr('action') + '|&|' + $('#ah-divOptions input.addOld-button-checkbox').slice(i, i + 1).val() + '', '');
        }
    }
}

//+++++ Окно настроек +++++//
