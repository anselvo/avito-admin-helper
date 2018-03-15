
function chooseItem() {
    $('.ah-item-checkbox').click(function () {
        $(this).find('input[type="checkbox"]').click();
    }).on('click', '[type="checkbox"]', function (e) {
        e.stopPropagation();
    });
}

function showItemsInfoForItems() {
    let showItemInfo = false;
    $('#ah-user-info-show')
        .find('ul')
        .append('<li>' +
            '<div class="ah-show-info ah-postShowItemInfo">' +
            '<i class="glyphicon glyphicon-book"></i> ' +
            '<span class="ah-menu-name">Показать Item Info</span><span class="ah-hot-keys">Alt+I</span></div>' +
            '</li>');

    function clickPostShowItemInfo() {
        let selector = $('.ah-postShowItemInfo');

        if (!showItemInfo) {
            showItemInfo = true;
            itemsInfoForItems();
        }

        if ($(selector).find('span.ah-menu-name').text() === 'Показать Item Info') {
            $('.ah-item-info').show();
            $(selector).find('span.ah-menu-name').text('Скрыть Item Info');
        } else {
            $('.ah-item-info').hide();
            $(selector).find('span.ah-menu-name').text('Показать Item Info');

        }
    }

    $('.ah-postShowItemInfo').click(clickPostShowItemInfo);

    if (isAuthority('ROLE_ITEMS_INFO_AUTOLOAD')) clickPostShowItemInfo();

    $(document).keydown(function (e) {
        if (e.altKey && e.keyCode === 'I'.charCodeAt(0))
            clickPostShowItemInfo();
    });
}

function itemsInfoForItems() {
    let itemList = $('#items').find('tr');

    for (let i = 1; i < itemList.length; i++) {
        let id = $(itemList[i]).attr("data-id");

        $(itemList[i]).find('td:eq(4)').append('<div class="ah-item-info ah-item-info-status" itemid="' + id + '"></div>');

        $(itemList[i])
            .find('.description-cell')
            .append('<div class="ah-item-info ah-item-info-main" itemid="' + id + '"></div>');

        $(itemList[i])
            .find('.item_title')
            .next()
            .after('<span class="ah-auto-refund" itemid="' + id + '"></span>');



        loadItemInfo(id);
    }
}

function loadItemInfo(id) {
    let url = `${global.connectInfo.adm_url}/items/item/info/${id}`;

    let xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.send(null);
    xhr.onreadystatechange=function() {
        if (xhr.readyState === 4 && xhr.status === 200)  {
            let response = xhr.responseText;
            let ip = $(response).find('[data-ip]').attr('data-ip');

            let microCategory = $(response).find('.form-group:contains(Микрокатегория) .form-control-static').html();
            let address = $(response).find('.form-group:contains(Адрес) input[type="text"]').val();

            let historyTable = $(response).find('[data-url*="frst_history"] tbody tr');
            let lastStatus = null;
            let lastTime = null;

            let refundWallet = false;
            let refundWalletTime = null;
            let refundPackage = false;
            let refundPackageTime = null;

            for (let i = 0, statusCnt = 0; i < historyTable.length; ++i) {
                let time = $(historyTable[i]).find('td:eq(0)').text();
                let status = $(historyTable[i]).find('td:eq(2)').text();
                let payEvent = $(historyTable[i]).find('td:eq(3)').text();

                if (payEvent === 'Refund to wallet' && !refundWallet) {
                    refundWallet = true;
                    refundWalletTime = time;
                }
                if (payEvent === 'Refund to package' && !refundPackage) {
                    refundPackage = true;
                    refundPackageTime = time;
                }

                if (status !== '' && !lastStatus) {
                	++statusCnt;
                	if (statusCnt === 2) {
                        lastStatus = status;
                        lastTime = time;
                    }
                }
            }

            if (refundWallet) $('.ah-auto-refund[itemid="' + id + '"')
                .append('<div class="ah-auto-refund-label" ' +
                    'title="Refund to wallet\nLast refund to wallet at ' + refundWalletTime+ '" ' +
                    'style="background: #ffe168">RW</div>');

            if (refundPackage) $('.ah-auto-refund[itemid="' + id + '"')
                .append('<div class="ah-auto-refund-label" ' +
                    'title="Refund to package\nLast refund to package at ' + refundPackageTime + '" ' +
                    'style="background: #90CAF9; width: 25px">RP</div>');

            if (address) $('.ah-item-info-main[itemid="' + id + '"').append(
                '<hr style="margin: 3px 0 3px">' +
                '<div><b>Адрес:</b> '+ address + '</div>'
            );

            if (microCategory) $('.ah-item-info-main[itemid="' + id + '"').append(
                '<hr style="margin: 3px 0 3px">' +
                '<div><b>Микрокатегория:</b> '+ microCategory + '</div>'
            );

            if (lastStatus) $('.ah-item-info-status[itemid="' + id + '"]').append(
            	'<hr style="margin: 3px 0 3px">' +
                '<div><b>Пред.:</b> ' + lastStatus + '</div>' +
                '<div><b>Дата:</b> ' + lastTime + '</div>'
            );

            if (ip) $('.ah-item-info-status[itemid="' + id + '"]').append(`
                <hr style="margin: 3px 0 3px">
                <div>
                <b>IP:</b> <a class="ipLinks" href="${global.connectInfo.adm_url}/items/search?ip=${ip}" target="_blank">${ip}</a>
                </div>`
            );
        }
    }
}

function userInfoForPost() {
    const itemList = $('.b-item');

    for (let i = 0; i < itemList.length; ++i) {
        const $userLinkSelector = $(itemList[i]).parents('tr').find('.item_user_login')

        const id = $userLinkSelector.attr('href').split('/')[4];
        const email = $userLinkSelector.text().trim();
        const itemid = $(itemList[i]).attr("id").replace('desc_', '');
        const category = $(itemList[i]).parents('tr').find('[data-category]').attr("data-category");
        let params = $(itemList[i]).parents('tr').attr("data-params-map");
        params = params ? params.replace(/"/g, "&quot;") : '{}';
        const cityItem = $(itemList[i]).parents('tr').attr("data-location");

        if (isAuthority('ROLE_USER_INFO_INFO')) {
            $(itemList[i])
                .prepend('<span class="ah-userInfoActionButton ah-user-api" data-user-id="'+id+'" data-item-id="'+itemid+'" title="Info"><i class="glyphicon glyphicon-info-sign"></i></span>');
        }

        if (isAuthority('ROLE_USER_INFO_ABUSES')) {
            $(itemList[i])
                .prepend('<span class="ah-userAbuseActionButton ah-user-api" data-user-id="'+id+'" data-item-id="'+itemid+'" title="Abuse"><i class="glyphicon glyphicon-fire"></i></span>');
        }

        if (isAuthority('ROLE_USER_INFO_WL')) {
            $(itemList[i])
                .prepend('<span class="ah-userWalletActionButton ah-user-api" data-user-id="'+id+'" data-item-id="'+itemid+'" title="WalletLog"><i class=" glyphicon glyphicon-ruble"></i></span>');
		}

        if (isAuthority('ROLE_USER_INFO_SHOW_ITEMS')) {
            $(itemList[i])
                .prepend('<span class="ah-userShowItemsActionButton ah-user-api" data-user-id="'+id+'" data-item-id="'+itemid+'" data-email="'+email+'" title="Show items"><i class="glyphicon glyphicon-list-alt"></i></span>');
        }

        if (isAuthority('ROLE_USER_INFO_MESSENGER')) {
            $(itemList[i])
                .prepend('<span class="ah-userMessengerActionButton ah-user-api" data-user-id="'+id+'" data-item-id="'+itemid+'" title="Messenger"><i class="glyphicon glyphicon-send"></i></span>');
        }
    }

    usersInfoAction();
}

// МАССОВАЯ БЛОКИРОВКА ПОЛЬЗОВАТЕЛЕЙ


function postBlockUsers() {
    if (!sessionStorage.postBlockID) sessionStorage.postBlockID = '';
    if (!sessionStorage.postBlockActiveUserID) sessionStorage.postBlockActiveUserID = '';

    addChooseButton();
    addActionButton();
    usersListCheck();
}


function addChooseButton() {
    const loginList = $('.item_user_login');

    for (let i = 0; i < loginList.length; ++i) {
        let id = $(loginList[i]).attr('href').split('/')[4];

        $(loginList[i]).parent()
			.css('padding', '5px')
			.after('<hr class="ah-separate-line">')
			.append('<input type="button" userid="' + id + '" class="ah-postBlockButton ah-postPlus" value="+">')
            .append('<div class="ah-post-userAgent" title="User chance">' +
                '<b>Шанс:</b> ' +
                '<span ah-post-block-chance="'+id+'" style="color:#65a947">?</span>/<span style="color:red;">10</span>' +
                '<span ah-post-block-chance-time="'+id+'"></span>' +
                '</div>')
            .append(`<div><b>Статус: </b><span ah-post-block-status="${id}"></span></div>`);

        $(loginList[i])
            .parents('tr')
            .find('.description-cell')
            .append('<div class="ah-post-userAgent"><hr class="ah-separate-line"><b>User-Agent:</b> <span userAgent="'+id+'"></span></div>');
    }

    clickChooseButton();
}

// МАССОВАЯ БЛОКИРОВКА ПОЛЬЗОВАТЕЛЕЙ


// Отправка письма пользователю о взломе и смена пароля
function smartSNP(id) {
    $('.pull-right').append('<span id="isEmailChange" class="ah-wheelSNP" title="Информирует о смене email:\n- СЕРЫЙ - email не был изменен\n- ЗЕЛЕНЫЙ - на учетной записи уже менялся email адрес">EML</span>' +
        '<span id="isUseSNP" class="ah-wheelSNP" title="Информирует о смене пароля:\n- СЕРЫЙ - пароль (snp) был отправлен менее 3 раз\n- КРАСНЫЙ - пароль (snp) был отправлено 3 и более раз">SNP</span>' +
        '<input id="snp" type="button" class="btn btn-primary" value="SNP" title="Отправляет пользователю новый пароль, а также уведомляет его о том, что данная учетная запись была взломана" style="margin-left: 5px;" disabled/>');

    var href = `${global.connectInfo.adm_url}/users/user/info/${id}`;
    var cancelLoadSNP = 0;

    var request = new XMLHttpRequest();
    request.open("GET", href, true);
    request.send(null);
    request.onreadystatechange=function() {
        if (request.readyState === 4 && request.status === 200) {
            var r = request.responseText;

            var email = $(r).find('.js-fakeemail-field').text();
            var name = $(r).find('[name="name"]').val();

            $('#snp').attr('email', email);
            $('#snp').attr('name', name);

            var comments = $(r).find('#dataTable td.is-break');
            var countSNP = 0;

            for (var i = 0; i < comments.length; ++i) {
                var com = comments.slice(i, i+1).text();
                if (com.indexOf('#SNP')+1) ++countSNP;
                if (countSNP >= 3) {
                    $('#isUseSNP').css('background','#fb615f');
                    break;
                }
            }

            ++cancelLoadSNP;
            if (cancelLoadSNP == 2) {
                $('#snp').prop('disabled', false);
            }
        }
    };

    var hrefEmailHistory = `${global.connectInfo.adm_url}/users/user/${id}/emails/history`;

    var xhrEmailHistory = new XMLHttpRequest();
    xhrEmailHistory.open("GET", hrefEmailHistory, true);
    xhrEmailHistory.setRequestHeader("Accept", "application/json, text/javascript, */*; q=0.01");
    xhrEmailHistory.setRequestHeader("X-Requested-With", "XMLHttpRequest");
    xhrEmailHistory.send(null);
    xhrEmailHistory.onreadystatechange=function() {
        if (xhrEmailHistory.readyState == 4 && xhrEmailHistory.status == 200) {
            var json = JSON.parse(xhrEmailHistory.responseText);

            if (json.content != '') {
                $('#isEmailChange').css('background','#0ce00c');
            }

            ++cancelLoadSNP;
            if (cancelLoadSNP == 2) {
                $('#snp').prop('disabled', false);
            }
        }
    };

    $('#snp').click(function () {
        var email = $(this).attr('email');
        var name = $(this).attr('name');

        sendNewPassword(id);

        chrome.runtime.sendMessage({
            action: 'XMLHttpRequest',
            method: 'POST',
            url: `${global.connectInfo.ext_url}/journal/include/php/load/create_ticket_avito_adm.php`,
            data: 'email='+email+'&name='+name,
        }, function(response) {
            console.log(response);

            if (response === 'error') alert('При создании обращения возникла ошибка.');
        });

        commentOnUserModer(id, '#SNP Отправил(а) новый пароль пользователю и уведомление о взломе');
        outTextFrame('Пользователю отправлен новый пароль и уведомление о взломе');
    });
}

function showDescriptionForItems() {
    let showDescription = false;
    $('#ah-user-info-show')
        .find('ul')
        .append('<li>' +
            '<div class="ah-show-info ah-postShowDescription">' +
            '<i class="glyphicon glyphicon-sort-by-attributes"></i> ' +
            '<span class="ah-menu-name">Показать описание</span><span class="ah-hot-keys">Alt+O</span>' +
            '</div>' +
            '</li>');

    function clickPostShowDescription() {
    	let selector = $('.ah-postShowDescription');

        if (!showDescription) {
            showDescription = true;
            addDescriptionToItemSearch();
        }

        if($(selector).find('span.ah-menu-name').text() === 'Показать описание'){
            $('.ah-description-post').show();
            $(selector).find('span.ah-menu-name').text('Скрыть описание');
        } else {
            $('.ah-description-post').hide();
            $(selector).find('span.ah-menu-name').text('Показать описание');
        }

    }

    $('.ah-postShowDescription').click(clickPostShowDescription);

    $(document).keydown(function (e) {
        if (e.altKey && e.keyCode === 'O'.charCodeAt(0))
            clickPostShowDescription();
    });
}

function addDescriptionToItemSearch() {
	let itemList = $('[data-id]');
    let showDescription = false;
	let showDescriptionMarkup = false;

	if (localStorage.moderationSettings) {
        let moderationSettings = JSON.parse(localStorage.moderationSettings);
        showDescription = moderationSettings.showDescription;
        showDescriptionMarkup = moderationSettings.showDescriptionMarkup;
    }

	for (let i = 0; i < itemList.length; ++i) {
		let description = $(itemList[i]).find('[href^="/items/item/info/"]').attr('title');

		$(itemList[i]).find('.description-cell').append('<div class="ah-description-post" style="display: none">' +
					'<hr class="ah-separate-line">' +
					'<div class="ah-description-post-header">Описание:</div>' +
					'<div class="ah-description-post-body">' + description + '</div>' +
				'</div>');

		if (showDescriptionMarkup) {
			$('.ah-description-post-body').css('white-space', 'normal');
		}
	}
}

// копирование айди и неймов айтемов
function copyItemsOnItemsSearch() {
	let cells = $('#items .item-row').find('td:eq(3)');
	let itemsIdsNodes = [];
	$(cells).each(function() {
        let id = $(this)[0].lastChild;
        $(id).wrap('<span></span>');
		itemsIdsNodes.push($(this)[0].lastChild);
	});
    copyDataTooltip(itemsIdsNodes, {
    	placement: 'right',
		title: getCopyTooltipContentAlt('скопировать с заголовком'),
        getText: function(elem) {
            let itemId = $(elem).text().trim();
            return `№${itemId}`;
		},
        getTextAlt: function(elem) {
    		let itemTitle = $(elem).parents('.item-row').find('.description-cell .item_title').text();
			let itemId = $(elem).text().trim();
    		return `№${itemId} («${itemTitle}»)`;
		}
	});
}