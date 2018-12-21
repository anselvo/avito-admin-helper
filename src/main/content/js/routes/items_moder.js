function consultationCount() {
    if (!localStorage.consultation) localStorage.consultation = `{}`;

    $('body').append(`
        <div class="ah-consultation">
            <div class="ah-consultation-main"></div>
            <div class="ah-consultation-selector" style="display: none"></div>
         </div>
    `);

    const $consultation = $('.ah-consultation');
    const $consultationSelector = $('.ah-consultation-selector');

    $consultation.mouseenter(() => {
        $consultationSelector.show();
    });
    $consultation.mouseleave(() => {
        $consultationSelector.hide();
    });

    $consultationSelector.change(checkbox => {
        const consultationList = JSON.parse(localStorage.consultation);

        consultationList[$(checkbox.target).parent().data("queueId")] = checkbox.target.checked;

        localStorage.consultation = JSON.stringify(consultationList);
        consultationNotificationHot(consultationList);
    });

    chrome.storage.local.get("helpDeskQueueChecker", result => {
        consultationCountShow($consultationSelector, result.helpDeskQueueChecker);
    });

    chrome.storage.onChanged.addListener(changes => {
        if (changes.helpDeskQueueChecker) {
            consultationCountShow($consultationSelector, changes.helpDeskQueueChecker.newValue);
        }
    });
}

function consultationCountShow($consultationSelector, response) {
    if (response) {
        $consultationSelector.html('');

        for (let i = 0; i < response.length; ++i) {
            $consultationSelector.append(`<div class="ah-checkbox" data-queue-id="${response[i].queue.id}">
                                           <input id="checkbox-${i}" name="checkbox" type="checkbox">
                                           <label for="checkbox-${i}" class="ah-checkbox-label ah-cons-checkbox-flex">
                                               <div class="ah-consultation-name ah-cons-checkbox-name">${response[i].queue.name}</div>
                                               <div class="ah-consultation-count ah-cons-checkbox-count">${response[i].count}</div>
                                           </label>
                                      </div>`);
        }

        const consultation = JSON.parse(localStorage.consultation);
        for (let id in consultation) {
            if (consultation.hasOwnProperty(id) && consultation[id])
                $(`.ah-checkbox[data-queue-id="${id}"]`).find('[name="checkbox"]').prop('checked', true);
        }

        consultationNotificationHot(consultation);
    }
}

function consultationNotificationHot(list) {
    const $consultationMain = $('.ah-consultation-main');

    $consultationMain.html(`<div class="ah-consultation-name ah-cons-name-empty">Выберите консультацию</div>`);

    for (let id in list) {
        if (list.hasOwnProperty(id) && list[id]) {
            const $checkbox = $(`.ah-checkbox[data-queue-id="${id}"]`);
            const count = $checkbox.find('.ah-consultation-count').text();
            const name = $checkbox.find('.ah-consultation-name').text();

            $consultationMain.find('.ah-cons-name-empty').remove();
            $consultationMain.append(`
                <a class="ah-cons-link" href="${global.connectInfo.adm_url}/helpdesk?fid=${id}" target="_blank">
                    <div class="ah-consultation-name ah-cons-name">${(name[0] + name[name.length - 1]).toUpperCase()}</div>
                    <div class="ah-consultation-count ah-cons-count">${count}</div>
                </a>
            `);
        }
    }
}

function hideTestItemsSearch() {
    $('[name="isTest"]').parents('.form-group').hide();
}

function abTest() {
    getSpringJsonTable('e68c1466-1e1e-11e8-b467-0ed5f89f718b').then(response => {
        const json = JSON.parse(response.json);
        for (let i = 0; i < json.length; ++i) {
            markTestItems(json[i].categoryID, json[i].locationID, json[i].containsOption);
        }
    });
}

function markTestItems(categoryID, locationID, containsOption) {
    containsOption = containsOption ? containsOption : '';

    $.ajax({
        type: 'GET',
        url: `${global.connectInfo.adm_url}/js/locations?json=true&id=${locationID}`,
        success: function(data) {
            if (data.length === 0) {
                abTestHighlight(categoryID, locationID, containsOption);
            } else {
                for (let i = 0; i < data.length; ++i) {
                    let id = data[i].id;

                    abTestHighlight(categoryID, id, containsOption);
                }
            }
        }
    })
}

function abTestHighlight(categoryID, locationID, containsOption) {
    const $items = $('tr[data-category="' + categoryID + '"][data-location="' + locationID + '"]:contains(' + containsOption + ')');

    $items.find('.item-info-row_user-actions').prev().addClass('ah-ab-test-mark').prepend('<div class="ah-ab-test">A/B TEST</div>');
}

/**
 * Отказались от парсинга SCR-601
 * @deprecated
 */
function abTestCheckedPhoto($items) {
    for (let i = 0; i < $items.length; ++ i) {
        const $item = $($items[i]);
        const $id = $item.data('id');

        getItemInfo($id).then(response => {
            const $itemHistory = $(response).find('#dataTable tr');
            let isPhotoChecked = false;
            let time = '', username = '';

            for (let j = 0; j < $itemHistory.length; ++j) {
                const $comment = $($itemHistory[j]).find("td:eq(2)").text();

                if ($comment.indexOf('#ab-photos-checked') + 1) {
                    time = $($itemHistory[j]).find("td:eq(0)").text();
                    username = $($itemHistory[j]).find("td:eq(1)").text();

                    isPhotoChecked = true;
                    break;
                }
            }

            let photoSpan = '';
            if (isPhotoChecked) {
                photoSpan = '<span style="color: #229048" title="Последния проверка: ' + username + ' в ' + time + '">' +
                    'Фото проверены <i class="glyphicon glyphicon-thumbs-up"></i>' +
                    '</span>';
            } else {
                photoSpan = '<span style="color: #9c2323">Фото не проверены <i class="glyphicon glyphicon-thumbs-down"></i></span>' +
                    '<input class="ah-ab-test-photo-ok" type="button" value="Проверить" title="Пометить фото как проверенные">';
            }

            let checkedClass = $('<div class="ah-ab-test-photo"></div>').append(photoSpan);

            $item.find('.ah-ab-test-mark').append(checkedClass);

            checkedClass.find('.ah-ab-test-photo-ok').click(function () {
                checkedClass.html('<span style="color: #229048" title="Проверенно вами">' +
                        'Фото проверены <i class="glyphicon glyphicon-thumbs-up"></i>' +
                    '</span>');

                commentOnItem($id, '[Admin.Helper.Photo.Check] #ab-photos-checked');
            });
        });
    }
}

function comparisonInfo() {
    let target = $('.js-modal-content')[0];

    let observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes.length > 0) addComparisonInfo();
        });
    });

    let config = { childList: true };

    observer.observe(target,  config);
}

function addComparisonInfo() {
    $('.modal-content').css('margin-bottom', '25px');

    let basedItemID = $('.js-comparison').attr('data-based-item');
    let basedItemInfo = $('tr[data-id="'+basedItemID+'"]');
    let baseItemToggle = basedItemInfo.find('.ah-pro-user-toggle [data-user-id]');

    let content = $('[data-based-item="'+basedItemID+'"]');

    let comparisonItemParamList = $(content).find('.details-info');

    let comparisonNamesList = $(content).find('.comparison-item-name').parent();
    let comparisonUserList = $(content).find('.comparison-user-wrap');
    let comparisonImageList = $(content).find('.gallery-prev');
    let comparisonDescriptionList = $(content).find('.comparison-description-text');
    let comparisonCategoriesList = $(content).find('.js-param-1a .details-info-value');

    // AB test в комперисоне
    if ($(basedItemInfo).find('.ah-ab-test-mark').length !== 0) {
        $('.comparison-item-address:eq(0)')
            .addClass('ah-ab-test-mark')
            .prepend('<div class="ah-ab-test">A/B TEST</div>');
    }

    // AB test в комперисоне
    if ($(basedItemInfo).find('.ah-led-yellow').length !== 0) {
        $('.comparison-item-name:eq(0)')
            .after('<div class="ah-led-yellow" title="Обратите внимание на флаги!"></div>');
    }

    comparisonNamesList.change(({ target }) => {
        const userId = target.dataset.userId;
        const toggle = target.checked;
        const categoryId = target.dataset.categoryId;

        updateUserProCheck(userId, toggle, categoryId);

        const similarUsersToggles = comparisonNamesList.find(`.ah-pro-user-toggle_comparison [data-user-id="${userId}"]`);
        similarUsersToggles.prop('checked', toggle);
        baseItemToggle.prop('checked', toggle);
    });

    // добавить причины отклонения
    optionOtherReasons('.btn-group-reject .moderate-block', '.moderate-block-list-item:not(.moderate-block-list-item_nested-list)', '.js-moderation-reject-other');

    let wordsParse = find_words_parse(localStorage.title.replace(/\s/g, ''));
    let mainUserId = null;
    for (let i = 0; i < comparisonUserList.length; ++i) {
        const comparisonDescriptionListChildren = $(comparisonDescriptionList[i]).find('span');
        const comparisonItemCategory = $(comparisonItemParamList[i]).find('[data-param-id="1a"]').attr("title");
        const categoryName = $(comparisonCategoriesList[i]).text().trim();

        if (comparisonDescriptionListChildren.length === 0)
            find_words(wordsParse, $(comparisonDescriptionList[i]), comparisonItemCategory);
        else {
            for (let j = 0; j < comparisonDescriptionListChildren.length; ++j) {
                if ($(comparisonDescriptionListChildren[j]).find('span').length === 0)
                    find_words(wordsParse, $(comparisonDescriptionListChildren[j]), comparisonItemCategory);
            }
        }

        const email = $(comparisonUserList[i]).text().trim();
        let tmp = $(comparisonUserList[i]).parent().attr('class').split(' ');
        let userid = tmp[3].split('-')[2];
        let itemid = tmp[2].split('-')[2];
        const $comparisonUserListParent = $(comparisonUserList[i]).parents('.'+tmp[2]);

        global.proUserInCategory.forEach(({ id, name }) => {
            if (categoryName === name) {
                const toggle = $(`
                    <label class="ah-pro-user-toggle_comparison ah-switch">
                        <input type="checkbox" data-user-id="${userid}" data-category-id="${id}">
                        <span class="ah-slider ah-round" title="Pro User In Category"></span>
                    </label>
                `);
                const baseItemChecked = baseItemToggle.prop('checked');

                toggle.find('[data-user-id]').prop('checked', baseItemChecked);
                $(comparisonNamesList[i]).append(toggle);
            }
        });

        if (isAuthority('ROLE_USER_INFO_INFO'))
            $comparisonUserListParent.prepend('<span class="ah-userInfoActionButton userInfoComparison ah-user-api" data-user-id="'+userid+'" data-item-id="'+itemid+'" title="Info"><i class="glyphicon glyphicon-info-sign"></i></span>');

        if (isAuthority('ROLE_USER_INFO_ABUSES'))
            $comparisonUserListParent
                .prepend('<span class="ah-userAbuseActionButton userAbuseComparison ah-user-api" data-user-id="'+userid+'" data-item-id="'+itemid+'" title="Abuse"><i class="glyphicon glyphicon-fire"></i></span>');

        if (isAuthority('ROLE_USER_INFO_WL'))
            $comparisonUserListParent
                .prepend('<span class="ah-userWalletActionButton userWalletComparison ah-user-api" data-user-id="'+userid+'" data-item-id="'+itemid+'" title="WalletLog"><i class="glyphicon glyphicon-ruble"></i></span>');

        if (isAuthority('ROLE_USER_INFO_SHOW_ITEMS'))
            $comparisonUserListParent
                .prepend('<span class="ah-userShowItemsActionButton userShowItemsComparison ah-user-api" data-user-id="'+userid+'" data-item-id="'+itemid+'" data-email="'+email+'" title="Show items"><i class="glyphicon glyphicon-list-alt"></i></span>');

        if (isAuthority('ROLE_USER_INFO_MESSENGER'))
            $comparisonUserListParent
                .prepend('<span class="ah-userMessengerActionButton userMessengerComparison ah-user-api" data-user-id="'+userid+'" data-item-id="'+itemid+'" title="Messenger"><i class="glyphicon glyphicon-send"></i></span>');


        if (i === 0) mainUserId = userid;

        if (mainUserId !== userid)  // disable for test
            $(comparisonUserList[i])
                .parents('.'+tmp[2])
                .append('<button class="btn btn-link ah-pseudo-link compareUserOnComparison" userid="'+userid+'" itemid="'+itemid+'" title="Сравнить учетные записи" style="margin-left: 10px;  float: right;">&#8644</button>');


        if (localStorage.imageSearchComparison === 'true') {
            let imageList = $(comparisonImageList[i]).find('.js-gallery-prev-img');
            for (let j = 0; j < imageList.length; ++j) {
                let url = $(imageList[j]).attr('data-original-image').substr(2);

                $(imageList[j]).parent().append('<div class="ah-searchByImageLinks" style="font-size: 9px; font-weight: bold; margin: 0px; padding: 0px;">' +
                    '<a class="ah-google" href="https://www.google.ru/searchbyimage?image_url=' + url + '" target="_blank"><span>G</span></a>' +
                    '<a class="ah-yandex" href="https://yandex.ru/images/search?url=' + url + '&rpt=imageview" target="_blank" style="margin-left: 10px"><span>Y</span></a>' +
                    '</div>');
            }
        }

        $('.compareUserOnComparison[itemid='+itemid+']').click(function (e) {
            const similarUserID = $(this).attr('userid');

            const btn = this;
            const users = {};
            users.compared = [similarUserID];
            users.abutment = mainUserId;

            btnLoaderOn(btn);
            const comparison = new UsersComparison(users);
            comparison.render()
                .then(() => {
                    if (global.admUrlPatterns.items_comparison_archive.test(global.currentUrl)) { // comparison/archive
                        comparison.showModal();
                    }

                    if (global.admUrlPatterns.items_moder.test(global.currentUrl)) { // items/moder
                        comparison.showModalSecond();

                        // Предотвратить обработку хоткеев админского комперисона
                        comparison.modal.addEventListener('keydown', e => {
                            const admKeyCodes = [
                                81, // q
                                87, // w
                                69, // e
                                82, // r
                            ];
                            if (admKeyCodes.includes(e.keyCode)) {
                                e.stopPropagation();
                            }
                        });

                        // Предотвратить сабмит админского комперисона
                        comparison.modal.addEventListener('keyup', e => {
                            if (e.keyCode === 32) { // Space
                                e.stopPropagation();
                            }
                        });
                    }
                }, error => alert(error))
                .then(() => btnLoaderOff(btn));
        });

        $('.userInfoComparison[data-item-id='+itemid+']').click(function () {
            let offset = $(this).offset();
            usersInfo($(this).data("userId"), $(this).data("itemId"), offset, $(this).data("query"));
        });

        $('.userAbuseComparison[data-item-id='+itemid+']').click(function () {
            let offset = $(this).offset();
            usersAbuses($(this).data("userId"), $(this).data("itemId"), offset);
        });

        $('.userWalletComparison[data-item-id='+itemid+']').click(function () {
            let offset = $(this).offset();
            usersWallet($(this).data("userId"), offset);
        });

        $('.userShowItemsComparison[data-item-id='+itemid+']').click(function () {
            let offset = $(this).offset();
            userShowItems($(this).data("userId"), $(this).data("email"), offset);
        });

        $('.userMessengerComparison[data-item-id='+itemid+']').click(function () {
            let offset = $(this).offset();
            userMessenger($(this).data("userId"), offset);
        });
    }
}

function colorButtons() {
    let list = $('.b-antifraud-actions');

    for (let i = 0; i < list.length; ++i) {
        let flagsCount = parseInt($(list[i]).find('span:eq(0)').text());
        if (flagsCount > 2) {
            $(list[i]).find('button').css({background: '#f0ad4e'}).attr('title', 'Выделение в оранжевый цвет произошло, потому что флагов более двух!');
            $(list[i]).find('span').css({color: '#fff'});
        }
    }
}

function addSomeElementsNew() {
    const trList = $('#items').find('tr');

    for(let i = 0; i < trList.length; i++){
        const $userLinkSelector = $(trList[i]).find('a[href^="/users/user/info/"]');

        const id = $userLinkSelector.attr("href").split("/")[4];
        const email = $userLinkSelector.text().trim();
        const itemid = $(trList[i]).attr("id").substring(5);
        const category = $(trList[i]).attr("data-category");
        const params = $(trList[i]).attr("data-params-map") ? $(trList[i]).attr("data-params-map").replace(/"/g, "&quot;") : '{}';
        const cityItem = $(trList[i]).attr("data-location");
        const type = $(trList[i]).find('.item-info-row-item-type:contains(Тип)').parent().text();

        // USER INFO and USER ABUSE
        const $itemInfoName = $(trList[i]).find('.item-info-name');

        if (isAuthority('ROLE_USER_INFO_INFO'))
            $itemInfoName.prepend('<span class="ah-user-api">' +
                '<span class="ah-userInfoActionButton" data-query data-user-id="'+id+'" data-item-id="'+itemid+'" title="Info"><i class="glyphicon glyphicon-info-sign"></i></span> ' +
                '<i class="ah-infoSearchIcon glyphicon  glyphicon-search" title="Поисковый запрос для ссылок в Info"></i> ' +
                '<input type="text" placeholder="Info query" class="ah-infoQuery"></span>');

        if (isAuthority('ROLE_USER_INFO_ABUSES'))
            $itemInfoName.prepend('<span class="ah-userAbuseActionButton ah-user-api" data-user-id="'+id+'" data-item-id="'+itemid+'" title="Abuse"><i class="glyphicon glyphicon-fire"></i></span>');

        if (isAuthority('ROLE_USER_INFO_WL'))
            $itemInfoName.prepend('<span class="ah-userWalletActionButton ah-user-api" data-user-id="'+id+'" data-item-id="'+itemid+'" title="WalletLog"><i class=" glyphicon glyphicon-ruble"></i></span>');

        if (isAuthority('ROLE_USER_INFO_SHOW_ITEMS'))
            $itemInfoName
                .prepend('<span class="ah-userShowItemsActionButton ah-user-api" data-user-id="'+id+'" data-item-id="'+itemid+'" data-email="'+email+'" title="Show items"><i class="glyphicon glyphicon-list-alt"></i></span>');

        if (isAuthority('ROLE_USER_INFO_MESSENGER'))
            $itemInfoName
                .prepend('<span class="ah-userMessengerActionButton ah-user-api" data-user-id="'+id+'" data-item-id="'+itemid+'" title="Messenger"><i class="glyphicon glyphicon-send"></i></span>');

        // кнопки блокировки
        if (localStorage.createdButtons.indexOf('blockUser|&|MC')+1 && type.indexOf('Магазин') === -1)
            $(trList[i]).find('#ah-but-block-users')
                .append('<input type="button" userID="'+id+'" class="btn btn-default btn-sm red ah-mh-action-btn" value="MC" title="Нарушение условий пользовательского соглашения" style="margin-left: 4px;">');
        if (localStorage.createdButtons.indexOf('blockUser|&|PA')+1 && type.indexOf('Магазин') === -1)
            $(trList[i]).find('#ah-but-block-users')
                .append('<input type="button" userID="'+id+'" class="btn btn-default btn-sm red" value="PA" title="Подозрительная активность">');
        if (localStorage.createdButtons.indexOf('blockUser|&|BN')+1 && type.indexOf('Магазин') === -1)
            $(trList[i]).find('#ah-but-block-users')
                .append('<input type="button" userID="'+id+'" class="btn btn-default btn-sm red ah-mh-action-btn" value="BN" title="Несколько учетных записей">');
    }

    usersInfoAction();

    $(".ah-infoQuery").on("input",function() {
        $(this).parent().find('.ah-userInfoActionButton').data('query', $(this).val());
    });

    $(".ah-infoSearchIcon").click(function () {
        $(this).parent().find('.ah-infoQuery').animate({width: 'toggle'});
    });

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

function addElementsForEachItemNew() {
    // блок для кнопок хелпера
    $('.item-info-row_user-actions').after('<div class="item-info-row ah-mh-items">' +
            '<div id="ah-but-reject-block"></div>' +
            '<div id="ah-but-reject-with-comment"><span class="ah-but-not-auto-prob"></span><span class="ah-but-auto-prob"></span></div>' +
            '<div id="ah-but-block-users"></div>' +
        '</div>');

    // для цикла
    let lastReject = '';
    let addElementsForEachItem = localStorage.addElementsForEachItem;

    let trList = $('#items').find('tr');
    for (let i = 0; i < trList.length; i++) {
        const trItemId = $(trList[i]).data("id");
        const trUserId = $(trList[i]).data("userId");
        const itemVersion = $(trList[i]).find('input[name="version"]').val();
        const prob = $(trList[i]).data('pathProbs');

        let paramId = null;
        let paramsArr = $(trList[i]).data('params');

        if (paramsArr) {
            for (let j = 0; j < paramsArr.length; j++) {
                if (paramsArr[j][1] === 'Адрес') {
                    paramId = paramsArr[j][0];
                }
            }
        }

        // ------ отображение кол-ва активных айтемов, как в items/search  ------ //

        if (addElementsForEachItem === 'true') {
            getActiveItems(trList[i]);
        }

        // ++++++ отображение кол-ва активных айтемов, как в items/search  ++++++ //
        for (let key in localStorage) {
            if (key.indexOf('createdButtons') + 1) {

                let tmpKey = localStorage.getItem(key).split(' ');

                for (let j = 0; j < tmpKey.length; j++) {
                    let name = tmpKey[j].split('|&|')[0];
                    let action = tmpKey[j].split('|&|')[1];
                    let reason = tmpKey[j].split('|&|')[2];

                    if (name === '') continue;

                    if (name === reason) { // для отклонений за "параметр" Адрес
                        reason = '175_' + paramId;
                    }

                    $(trList[i])
                        .find('#ah-but-reject-block')
                        .append('<input type="button" ' +
                            'value="' + name + '" ' +
                            'class="btn btn-default btn-sm ah-mh-action-btn" ' +
                            'bvalue="' + trItemId + '" ' +
                            'data-reason="' + reason + '" ' +
                            'data-action="' + action + '" ' +
                            'data-version="' + itemVersion + '">');
                }
            }
        }

        // ++++++ отображение кол-ва активных айтемов, для неправильной категории  ++++++ //
        let localReasons = JSON.parse(localStorage.otherReasonsCategoryBox);

        for (let j = 0; j < localReasons.length; ++j) {
            let category = localReasons[j];

            if (category.show === 'true') $(trList[i])
                .find('#ah-but-reject-with-comment .ah-but-not-auto-prob')
                .append('<input type="button" ' +
                    'value="' + category.short_name + '" ' +
                    'class="btn btn-default btn-sm ah-mh-action-btn" ' +
                    'bvalue="' + trItemId + '" ' +
                    'data-reason="178" ' +
                    'data-action="reject" ' +
                    'data-version="' + itemVersion + '" ' +
                    'data-comment="Пожалуйста, измените на &#34;' + category.name + '&#34;" ' +
                    'title="' + category.name + '" ' +
                    'style="box-shadow: inset 0 0 5px 0 ' + category.color + '; background: white">');

            for (let k = 0; k < category.reason.length; ++k) {
                let background = 'white';
                let probability = 0;

                if (prob) {
                    for (let z = 0; z < prob.length; ++z)
                        if (prob[z] && prob[z].categoryName === category.name + ' / ' + category.reason[k].name) {
                            probability = prob[z].prob.toFixed(2) * 100;

                            background = 'linear-gradient(to right, ' + category.reason[k].color + '1f ' + probability + '%, #fff ' + probability + '%)';
                        }
                }

                if (category.reason[k].show === 'true') {
                    $(trList[i])
                        .find('#ah-but-reject-with-comment .ah-but-not-auto-prob')
                        .append('<input type="button" ' +
                            'value="' + category.reason[k].short_name + '" ' +
                            'class="btn btn-default btn-sm ah-mh-action-btn" ' +
                            'bvalue="' + trItemId + '" ' +
                            'data-reason="178" ' +
                            'data-action="reject" ' +
                            'data-version="' + itemVersion + '" ' +
                            'data-comment="Пожалуйста, измените на &#34;' + category.name + ' / ' + category.reason[k].name + '&#34;" ' +
                            'title="' + category.name + ' / ' + category.reason[k].name + '\nВероятность: ' + probability + '%" ' +
                            'style="box-shadow: inset 0 0 5px 0 ' + category.reason[k].color + '; background: ' + background + '">');
                } else if (probability > 0 && localStorage.autoProbButtons === 'true') {
                    $(trList[i])
                        .find('#ah-but-reject-with-comment .ah-but-auto-prob')
                        .css({ 'border-left': '1px solid black' })
                        .append('<input type="button" ' +
                            'value="' + category.reason[k].short_name + '" ' +
                            'class="btn btn-default btn-sm ah-mh-action-btn" ' +
                            'bvalue="' + trItemId + '" ' +
                            'data-reason="178" ' +
                            'data-action="reject" ' +
                            'data-version="' + itemVersion + '" ' +
                            'data-comment="Пожалуйста, измените на &#34;' + category.name + ' / ' + category.reason[k].name + '&#34;" ' +
                            'title="' + category.name + ' / ' + category.reason[k].name + '\nВероятность: ' + probability + '%" ' +
                            'style="box-shadow: inset 0 0 5px 0 ' + category.reason[k].color + '; background: ' + background + '">');
                }

            }
        }

        ledItem(trList[i], trItemId, itemVersion);
        onlinePhotoCheck(trList[i], trItemId);
        proUserInCategory(trList[i], trUserId);
    }

    $('div.ah-mh-items input.ah-mh-action-btn').click(function() {
        let dataObj = {
            itemId: $(this).attr('bvalue'),
            version: $(this).data('version'),
            action: $(this).data('action'),
            reason: String($(this).data('reason')),
            customReason: $(this).data('comment') ? $(this).data('comment') : null
        };


        if (~dataObj.reason.indexOf('_')) {
            dataObj.reason = dataObj.reason.split('_');
        }

        submitItem(dataObj);
    });


    $("button.mb_reject.btn , button.mb_block.btn , a.areject, input.ah-mh-action-btn").click(function() {
        lastReject += $(this).parents('tr:eq(0)').attr("data-id")+ '|';
    });

    let butShow = $('<input/>', {
        value: 'Last Reject',
        type: 'button',
        class: 'btn btn-default green',
        xernia: lastReject,
        click: function () {
            window.open(`${global.connectInfo.adm_url}/moderation/statistics/user/actions`, '_blank');
        }
    });
    $('#apply_all').append(butShow);


    if(localStorage.chbx1 === 0){
        $("#chbx1").removeAttr("checked");
    }
    if(localStorage.title!=='' && localStorage.title !== undefined){
        searchWordsGlobal(localStorage.title, localStorage.title1, '.item-info-name a');
        $("#mbuttonS").attr('disabled',true);
    }

    $("#chbx1").change(function(){
        $("#mbuttonS").removeAttr('disabled');
    });

    $("#textaclass").keypress(function(){
        $("#mbuttonS").removeAttr('disabled');
    });
}

/**
 * Добавление кнопки отклонения и выделение флага подсвечивающимся фонариком
 */
function ledItem($itemInfo, trItemId, itemVersion) {
    for (let i = 0; i < global.ledItem.length; ++i) {
        const led = global.ledItem[i];

        const $flagItemType = $($itemInfo).find(`.b-antifraud .name:contains(${led.flagName})`);

        if ($flagItemType.length > 0) {
            if ($($itemInfo).find('.ah-led-yellow').length === 0)
                $($itemInfo).find('.item-info-name').append('<div class="ah-led-yellow" title="Обратите внимание на флаги!"></div>');

            if (led.button) {
                const $butBlock = $($itemInfo).find('#ah-but-reject-block');

                const input = document.createElement('input');
                input.className = "btn btn-default btn-sm ah-led-button";
                input.type = 'button';
                input.value = led.button.value;
                input.title = "LED BUTTON";
                input.addEventListener('click', () => {
                    submitItem({itemId: trItemId, version: itemVersion, action: led.button.action, reason: led.button.reason});
                });

                $butBlock.append(input);
            }
        }
    }
}


function proUserInCategory($itemInfo, trUserId) {
    global.proUserInCategory.forEach(({ id }) => {
        const itemCategoryId = $($itemInfo).data('category');

        if (itemCategoryId === id && $($itemInfo).find('.ah-pro-user-toggle').length === 0) {
            $($itemInfo).find('.item-info-name').append(`
                <label class="ah-pro-user-toggle ah-switch">
                    <input type="checkbox" data-user-id="${trUserId}">
                    <span class="ah-slider ah-round" title="Pro User In Category"></span>
                </label>
            `);

            $(`.ah-pro-user-toggle input[data-user-id="${trUserId}"]`).change(function () {
                const userId = this.dataset.userId;
                const toggle = this.checked;

                updateUserProCheck(userId, toggle, itemCategoryId);
            });
        }
    });
}

function onlinePhotoCheck($itemInfo, trItemId) {
    for (let i = 0; i < global.onlinePhotoCheck.length; ++i) {
        const flagName = global.onlinePhotoCheck[i].flagName;
        const $flagItemType = $($itemInfo).find(`.b-antifraud .name:contains(${flagName})`);

        if ($flagItemType.length > 0 && $($itemInfo).find('.ah-online-photo-check').length === 0) {
            $($itemInfo).find('.item-info-name').append(`
                <label class="ah-online-photo-check ah-switch">
                    <input type="checkbox" data-item-id="${trItemId}">
                    <span class="ah-slider ah-round" title="Online проверка"></span>
                </label>
            `);

            $(`.ah-online-photo-check input[data-item-id="${trItemId}"]`).change(function () {
                const itemId = this.dataset.itemId;
                const toggle = this.checked;

                console.log(toggle);

                updateOnlinePhotoCheck(itemId, toggle);
            });
        }
    }
}

function getActiveItems(selector) {
    let url = $(selector).find('div.item-info-row_user-actions a[href ^= "/items/search"]').attr('href');

    let xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.send();
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
            var r = xhr.responseText;

            var activeItems = $(r).find('a[href ^= "/items/search?user_id"]:eq(0)').text();
            var categoryItem = $(r).find('.form-group:contains(Категория) option:selected').parents('.category').attr('label');

            if (categoryItem === 'Недвижимость') {
                var bleach = $(r).find('a[href^="/items/item/soil"]');
                var reasonBlock = $(r).find('.loadable-history:eq(1):contains(Блокировка учётной записи)');

                if (bleach.length !== 0 && reasonBlock.length !== 0) $(selector).find('h3.item-info-name').append('<span title="Данное объявление находится на прозвоне" style="font-weight: bold; color: #099f00; font-size: 19px; margin-left: 10px;">&#9742;</span>');
            }

            $(selector).find('div.item-info-row_user-actions a[href ^= "/items/search"]').html(activeItems);
        }
    };
}
