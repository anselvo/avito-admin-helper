
function messengerLinkOnUser() {
    var userId = getParamOnUserInfo('user-id');

    $('.form-group:contains(ID) .help-inline').append('<span style="margin-left: 0;" class="sh-messenger-link-wrapper"><a title="Мессенджер" class="sh-messenger-link" href="/messenger/user/' + userId + '" target="_blank" style=""></a></span>');
}

// информацио о том какой мадератор относиться к какой категории
function adminTableCategory() {
    var len = $('.table tr').length;

    chrome.runtime.sendMessage({
        action: 'XMLHttpRequest',
        method: "GET",
        url: "http://avitoadm.ru/journal/include/php/user/getAllUsers.php",
    },
            function (response) {
                var jsonParse = JSON.parse(response);

                var usersList = jsonParse.table;

                for (var i = 1; i < len; i++) {
                    var currentLogin = $('.table tr').slice(i, i + 1).find('td:eq(2)').text();

                    for (var j = 0; j < usersList.length; ++j) {
                        if (currentLogin == usersList[j].username) {
                            $('.table tr').slice(i, i + 1).find('td:eq(2)').html('<span class="label" title="' + usersList[j].subdivision_name + ' (' + usersList[j].teamlead + ')\nСмена: ' + usersList[j].shift + '\nВыходные: ' + usersList[j].weekend + '"  style="background:#' + usersList[j].sub_color + ';">' + usersList[j].subdivision + '</span><span style="margin-left:5px;">' + usersList[j].username + '</span>');
                            break;
                        }
                    }
                }
            }
    );
}

// Сравнение учетных записей
function userChekDoubles() {
    $('.col-xs-offset-1').find('hr').before('<div class="input-group"><input type="text" placeholder="Ссылка на учетку" id="go_text_result_box" style="" class="form-control"/><span class="input-group-btn"><input type="button" class="btn btn-primary chekUser" title="Находит совпадение между учетными записями, в поле текста надо вставить url учетки с которой надо сверить" value="Проверить" style=""/></span></div>');
    $('.chekUser').click(function () {
        $('#check_result_user_box').detach();
        var href1 = window.location.href;
        var href2 = $('#go_text_result_box').val();

        href1 = href1.replace(/\D/gi, '');
        href2 = href2.replace(/\D/gi, '');

        if (href1 != href2 && href2 != '') {
            addBlock();
            chekUserforDubles(href1, href2);
        } else if (href1 == href2) {
            outTextFrame('Это текущая УЗ');
        } else {
            outTextFrame('Вставьте URL');
        }
    });
}

// сменить мыло
function userChangeEmail() {

    var email = $(".js-fakeemail-field").text();

    $('.col-xs-offset-1').find('hr').before('<div class="input-group" id="changeEmail"><input type="text" class="form-control" id="checkEmailText" value maxlength placeholder="' + email + '"/><span class="input-group-btn"><input type="button" class="btn btn-primary" value="Change email" title="КНОПКА ДЛЯ ВЛЗОМАННЫХ УЗ С ИЗМЕНЕННЫМ E-MAIL\n- меняет e-mail на вставленный в поле\n- меняет имя на точку\n- восстанавливает УЗ (relevant items)\n- ставит комментарий \'взлом, поменял почту на \*вставленную\*\'\n- нажимает кнопку Send New Password\n- делает мыло Not Fake" id="checkButton"/></span></div>');
    $('#changeEmail').after('<br><div><span id="statusEmail"></span></div>');

    $('#checkButton').click(function () {
        var checkemail = $("#checkEmailText").val().split("@");
        var id = $('.js-user-id').attr('data-user-id');
        var status = $('.js-user-info-form-user .form-group label:contains(Статус)').next().find('b').text();

        changeEmail(checkemail[0], checkemail[1], id, status);
    });

    function changeEmail(email, domen, id, status) {
        var href = "https://adm.avito.ru/users/user/change_email/" + id;

        var request = new XMLHttpRequest();
        request.open("POST", href, true);
        request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
        request.setRequestHeader("Accept", "*/*");
        request.setRequestHeader("X-Requested-With", "XMLHttpRequest");
        request.send("email=+" + email + "%40" + domen);
        request.onreadystatechange = function () {
            if (request.readyState == 4 && request.status == 200) {
                var r = request.responseText;
                if (r.indexOf("success") + 1) {
                    notfake(email, domen);
                    sendNewPassword(id);
                    commentOnUserHack(id, email, domen, " вернул, взлом.");
                    if (status.indexOf("Blocked") + 1) {
                        unblockUserHack(id);
                    }
                    changeName();
                } else {
                    $('#statusEmail').text(r);
                }
            }
        };
    }
    function notfake(emailCheck, domen) {
        var href = "https://adm.avito.ru/users/fakeemail/removeOld";

        var request = new XMLHttpRequest();
        request.open("POST", href, true);
        request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
        request.setRequestHeader("Accept", "application/json, text/javascript, */*; q=0.01");
        request.setRequestHeader("X-Requested-With", "XMLHttpRequest");
        request.send("email=" + emailCheck + "%40" + domen);
    }
    function commentOnUserHack(id, email, domen, comment) {
        var commentFull = email + "@" + domen + comment;
        var request = new XMLHttpRequest();
        request.open("POST", 'https://adm.avito.ru/comment', true);
        request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        request.send("objectTypeId=2&objectId=" + id + "&comment=" + encodeURIComponent(commentFull));
    }
    function sendNewPassword(id) {
        var href = "https://adm.avito.ru/users/user/edit/" + id + "/password";

        var request = new XMLHttpRequest();
        request.open("POST", href, true);
        request.setRequestHeader("Accept", "*/*");
        request.setRequestHeader("X-Requested-With", "XMLHttpRequest");
        request.send(null);
    }
    function unblockUserHack(id) {
        var request = new XMLHttpRequest();
        request.open("GET", 'https://adm.avito.ru/users/user/unblock_relevant/' + id, true);
        request.send();
    }
    function changeName() {
        var formElem = $('.js-user-info-form-user');
        var name = $(formElem).find('[name="name"]');
        var saveBtn = $(formElem).find('[name="save"]');
        if (!formElem || !name || !saveBtn) {
            alert('Ошибка: не удалось изменить имя пользователя.');
            location.reload();
        }

        $(name).val('.');
        $(saveBtn).click();
    }
}

// доп инфа об УЗ
function showUserInfoIndicators(indicators) {
    $('.col-xs-offset-1').append(''+
    '<div id="statusUser" style="display: block;'+
        'position: absolute; z-index:10; font-weight: bolder; '+
        'font-size: 15px; top: 0; right: 100%; white-space: nowrap; background-color: white">'+
    '</div>');
    let block = $('#statusUser');

    let colorFired = '#5cb85c';

    // Инн
    if (~indicators.indexOf('inn')) {
        $(block).append('<div class="unactive" id="statusINN">• ИНН</div>');
        let innIndicator = $('#statusINN');
        let innInput = $('[name="inn"]');
        if ($(innInput).val()) {
            $(innIndicator).css({'color': '' + colorFired + ''});
            let innParentBlock = $(innInput).parents('.form-group');
            let innInfoBlock = $(innParentBlock).find('div.i-verify');
            if ($(innInfoBlock).hasClass('i-verify-checked')) {
                $(innIndicator).append('<span class="glyphicon glyphicon glyphicon-ok-sign '+
                'text-success" style="margin-left: 4px; top: 3px;"></span>');
            } else {
                $(innIndicator).append('<span class="glyphicon glyphicon-remove-sign '+
                'text-danger" style="margin-left: 4px; top: 3px;"></span>');
            }
        }

        let innParent = $(innInput).parents('.form-group');
        userInfoScrollableIndic(innParent, innIndicator);
    }

    // Про
    if (~indicators.indexOf('pro')) {
        $(block).append('<div class="unactive" id="statusPro">• ЛК Про</div>');
        let proIndicator = $('#statusPro');
        let proInput = $('#isPro');
        if ($(proInput).is(":checked")) {
            $(proIndicator).css({'color': '' + colorFired + ''});
        }

        let proParent = $(proInput).parents('.form-group');
        userInfoScrollableIndic(proParent, proIndicator);
    }
    
    // Юр. лицо
    if (~indicators.indexOf('legalEntity')) {
        $(block).append('<div class="unactive" id="legalEntity">• Юр. лицо</div>');
        let legalIndicator = $('#legalEntity');
        let companyInfoForm = $('#company-info');
        let convertBtn = $(companyInfoForm).find('[name="convertToLegal"]');
        if ($(companyInfoForm).length !== 0 && $(convertBtn).length === 0) {
            $(legalIndicator).css({'color': '' + colorFired + ''});
        }

        let legalParent = $(companyInfoForm)
                .find('.control-label:contains(Convert to legal)')
                .parents('.form-group');
        userInfoScrollableIndic(legalParent, legalIndicator);
    }

    // Автозагрузка
    if (~indicators.indexOf('auto')) {
        $(block).append('<div class="unactive" id="statusAuto">• Автозагрузка</div>');
        let autoIndicator = $('#statusAuto');
        let autoInput = $('#isAutoupload');
        if ($(autoInput).is(":checked")) {
            $(autoIndicator).css({'color': '' + colorFired + ''});
        }

        let autoParent = $(autoInput).parents('.form-group');
        userInfoScrollableIndic(autoParent, autoIndicator);
    }

    // Магазин
    if (~indicators.indexOf('shop')) {
        $(block).append('<div class="unactive" id="statusShop">• Магазин</div>');
        let shopIndicator = $('#statusShop');
        let shopInput = $('.control-label:contains(Магазин)').next().find('a');
        let shopInputText = $(shopInput).text();
        if (~shopInputText.indexOf("Оплачен")) {
            $(shopIndicator).css({'color': '' + colorFired + ''});
        }

        let shopParent = $(shopInput).parents('.form-group');
        userInfoScrollableIndic(shopParent, shopIndicator);
    }

    // Подписка
    if (~indicators.indexOf('subscription')) {
        $(block).append('<div class="unactive" id="statusSubscription">'+
        '• Подписка</div>');
        let subscrIndicator = $('#statusSubscription');
        let subscrInput = $('.form-group:contains(Подписка) a');
        let subscrInputText = $(subscrInput).text();
        let shopIndicator = $('#statusShop');
        let shopInput = $('.control-label:contains(Магазин)').next().find('a');
        let shopInputText = $(shopInput).text();
        if (~subscrInputText.indexOf("Подписка")) {
            $(subscrIndicator).attr('fired', true);
        }
        if (~subscrInputText.indexOf("Подписка")
                && ~shopInputText.indexOf("Оплачен")) {
            var sub = subscrInputText.split('"');
            $(subscrIndicator).text($(subscrIndicator).text() + ': ' + sub[1]);
            $(subscrIndicator).css({'color': '' + colorFired + ''});
            $(shopIndicator).css({'color': 'rgb(189, 189, 189)'});
        }

        let subscrParent = $(subscrInput).parents('.form-group');
        userInfoScrollableIndic(subscrParent, subscrIndicator);
    }

    // Персональный менеджер
    if (~indicators.indexOf('persManager')) {
        $(block).append('<div class="unactive" id="personalManager">'+
        '• Перс. менеджер</div>');
        let persManagerIndicator = $('#personalManager');
        let persManagerSelect = $('select[name="managerId"]');
        if ($(persManagerSelect).val()) {
            $(persManagerIndicator).css({'color': '' + colorFired + ''});
        }

        let persManagerParent = $(persManagerSelect).parents('.form-group');
        userInfoScrollableIndic(persManagerParent, persManagerIndicator);
    }

    // Авито доставка
    if (~indicators.indexOf('delivery')) {
        $(block).append('<div class="unactive" id="avitoDelivery">'+
        '• Avito Доставка</div>');
        let deliveryIndicator = $('#avitoDelivery');
        let deliveryForm = $('.user-info-deliver-form');
        let deliveryIsActive = $(deliveryForm).find('[name="isActive"]');
        let deliveryApiKey = $(deliveryForm).find('[name="apiKey"]');

        if ($(deliveryIsActive).is(':checked')
                && $(deliveryApiKey).val()) {
            $(deliveryIndicator).css({'color': '' + colorFired + ''});
        }

        let deliveryParent = $(deliveryIsActive).parents('.form-group');
        userInfoScrollableIndic(deliveryParent, deliveryIndicator);
    }
    
    // только банковский перевод
    if (~indicators.indexOf('onlyBankTransfer')) {
        $(block).append('<div class="unactive loading-indicator-text" id="onlyBankTransfer">• Загрузка...</div>');
        let indicator = $('#onlyBankTransfer');
        let userId = getParamOnUserInfo('user-id');
        getOnlyBankTransferStatus(userId, indicator, colorFired);
    }
}

function getOnlyBankTransferStatus(userId, indicator, colorFired) {
    var url = 'https://adm.avito.ru/users/account/info/' + userId;
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.send();
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            $(indicator).removeClass('loading-indicator-text');
            
            if (xhr.status === 200) {
                let resp = xhr.responseText;
                let legend = $(resp).find('legend:contains(Счёт пользователя)');
                let label = $(legend).next().find('label:contains(Оплата только)');
                let checkbox = $(label).next().find('.js-toggle-payment');
                let isChecked = $(checkbox).prop('checked');
                let text = $(label).next().find('.form-control-static').text();
                if (isChecked || ~text.indexOf('Включено') ) {
                    $(indicator).css({'color': '' + colorFired + ''});
                }
                
                $(indicator).text('• Только банк. перевод');
            }
            if (xhr.status >= 400) {
                $(indicator).text('Error');
                $(indicator).css({'color': '#d9534f'});
            }
        }
    };
}

function userInfoScrollableIndic(scrollTo, indicator) {
    if ($(scrollTo).length) {
        $(indicator).css('cursor', 'pointer');
        $(indicator).hover(function () {
            $(this).css('background-color', '#f5f5f5');
        }, function () {
            $(this).css('background-color', '#fff');
        });
        $(indicator).click(function () {
            scrollToElem(scrollTo);
        });
    }
}

function addPremiumUsersIndicator() {
    var agentSubdivisionId = +userGlobalInfo.subdivision_id;
    if (allowedPremiumUsersSubd.indexOf(agentSubdivisionId) == -1)
        return;

    var userId = getParamOnUserInfo('user-id');

    $('#statusUser').append(''+
    '<div class="unactive" id="REpremium">'+
        '• <span class="loading-indicator-text">Загрузка...</span>'+
    '</div>');

    if (!userId || !isFinite(userId)) {
        var css = {
            'color': 'black'
        };
        var text = 'Error';
        premiumUsersIndicatorHandler(text, css);
        return;
    }

    var shopLink = $('[href^="/shops/info/view/"]');
    if ($(shopLink).length === 0) {
        checkPremiumUsersList(userId);
    } else {
        let subscrIndicator = $('#statusSubscription');
        let isFired = $(subscrIndicator)[0].hasAttribute('fired');
        if (isFired) {
            $(subscrIndicator).html('• Подписка: <br><span '+
            'style="font-size: 12px; color: #000; margin-left: 9px; font-weight: 400;">'+
            'Загрузка...</span>');
        }
        var shopId = $(shopLink).attr('href').replace(/\D/g, '');
        sendShopInfoRequest(shopId);
    }
}

function checkPremiumUsersList(userId) {
    chrome.runtime.sendMessage({
        method: 'POST',
        action: 'XMLHttpRequest',
        url: 'http://avitoadm.ru/support_helper/other/premium_users.json',
    }, function (response) {
        if (response == 'error') {
            var css = {
                'color': 'black'
            };
            var text = 'Error';
            premiumUsersIndicatorHandler(text, css);
            return;
        }

        try {
            var response = JSON.parse(response);
        } catch (e) {
            var css = {
                'color': 'black'
            };
            var text = 'Error';
            premiumUsersIndicatorHandler(text, css);
            return;
        }

        for (var i = 0; i < response.realty.length; i++) {
            if (userId == response.realty[i].id) {
                var css = {
                    'color': '#d9534f'
                };
                var text = 'RE premium';
                premiumUsersIndicatorHandler(text, css);
                return;
            }
        }

        var css = {};
        var text = 'RE premium';
        premiumUsersIndicatorHandler(text, css);
    });
}
function sendShopInfoRequest(shopId) {
    var url = 'https://adm.avito.ru/shops/info/view/' + shopId;

    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.send();
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
            if (xhr.status == 200) {
                var response = xhr.responseText;
                checkPremiumUsersShopInfo(response, 'support');
            }
        }
    };
}

// индикатор Расширение
function addExtensionIndicator() {
    let userId = +getParamOnUserInfo('user-id');
    $('#statusUser').append(''+
        '<div class="unactive" id="ExtensionInd">'+
        '• <span>Расширение</span><span id="ExtensionIndGroup"></span>'+
        '</div>');

    checkExtensionIndUser(userId);
}

function checkExtensionIndUser(userId) {
    let indicator = $('#ExtensionInd');
    let indicatorGroup = $('#ExtensionIndGroup');

    let colorFired = '#d9534f';

    if (~extensionIndGroupOne.indexOf(userId)) {
        $(indicator).css('color', ''+ colorFired +'');
        $(indicatorGroup).text(' - 1');
    }
    if (~extensionIndGroupTwo.indexOf(userId)) {
        $(indicator).css('color', ''+ colorFired +'');
        $(indicatorGroup).text(' - 2');
    }
}
// альтернативный поиск по телефону (с ???)
function alternatePhoneSearch() {

    if ($('a.phone-search-link').length == 0)
        return;

    var nuser = $('.controls-phone').length;
    var region = $('#region').val();
    if (!region) {
        region = '';
    } else {
        region = '&location_id%5B%5D=' + region;
    }
    for (var i = 0; i < nuser; i++) {
        var number = $('.input-group').slice(i, i + 1).find('input').attr("value");
        var newNumber = '';
        for (var j = 1; j < 8; j++) {
            newNumber = newNumber + number[j];
        }

        $('.controls-phone').slice(i, i + 1).find('td:eq(6)').append('<br><a class="anatherNumber" href="https://adm.avito.ru/items/search?phone=' + newNumber + '%3F%3F%3F' + region + '" target="_blank">item???</a>');
    }
}

// копирование данных в буфер
function copyDataToClipboard(data) {
    data = data || [];

    // url
    if (~data.indexOf('url')) {
        $('.form-group:contains(ID) .help-inline').append('<button id="copyurl" class="sh-default-btn" type="button" title="Скопировать URL страницы" style="margin-left:26px;position: absolute; padding: 1px 5px; font-size: 12px;"><span class="sh-button-label sh-copy-img" style="border-radius: 0; font-size: 12px; top: 2px; line-height: 16px;"></span>Скопировать URL</button>');

        $('#copyurl').click(function () {
            var href = window.location.href;
            chrome.runtime.sendMessage({action: 'copyToClipboard', text: href});
            outTextFrame('URL скопирован!');
        });
    }


    // e-mail
    if (~data.indexOf('e-mail')) {
        $('.js-fakeemail-field').after('<button id="autoEmail" class="sh-default-btn" type="button" title="Скопировать E-mail со звездочками" style="height:30px;padding: 5px 10px; font-size: 12px; border-top-left-radius: 0; border-bottom-left-radius: 0; position: relative;"><span class="sh-button-label sh-green-background" style="border-radius: 0; font-size: 12px; min-width: 15px; top: 0px; line-height: 16px;">О</span>В ответ</button>');
        $('#autoEmail').click(function () {
            var emailText = $('.js-fakeemail-field').text();
            var text = getMailForAnswer(emailText);

            localStorage.autoEmail = text;
            chrome.runtime.sendMessage({action: 'copyToClipboard', text: text});

            outTextFrame('Email ' + text + ' скопирован!');

        });

        $('label:contains("E-mail")').next().find('span:eq(0)').after('<button id="copyEmailJH" class="sh-default-btn" type="button" title="Скопировать E-mail" style="height:30px;padding: 5px 10px; font-size: 12px; border-top-right-radius: 0; border-bottom-right-radius: 0; margin-right: -1px; margin-left: -30px; position: relative;"><span class="sh-button-label sh-orange-background" style="border-radius: 0; font-size: 12px; min-width: 15px; top: 0px; line-height: 16px;">Б</span>В буфер</button>');
        $('#copyEmailJH').click(function () {
            var text = $(this).prev().text();
            chrome.runtime.sendMessage({action: 'copyToClipboard', text: text});
            outTextFrame('Email ' + text + ' скопирован!');
        });
    }

    // phones
    if (~data.indexOf('phones')) {
        var telCount = $('div.phones-list tr.controls-phone').length;
        var telNumber;

        for (var i = 0; i < telCount; i++) {
            telNumber = $('div.phones-list tr.controls-phone div.input-group input.form-control').slice(i, i + 1).val();

            if (telNumber) {
                $('div.phones-list tr.controls-phone').slice(i, i + 1).append('<td style="padding-right: 0px;"><button type="button" class="sh-default-btn sh-copy-tel-to-clip" style="padding: 8px 2px; float: right; font-size: 12px;" title="Скопировать телефон в буфер обмена" data-tel-number="' + telNumber + '"><span class="sh-button-label sh-orange-background"  style="cursor: pointer; display: inline-block; border-radius: 0; text-align: center; min-width: 15px; font-size: 12px; vertical-align: middle; margin-right: 0; top: 0px; line-height: 16px;">Б</span></button></td>');
            }
        }

        $('.sh-copy-tel-to-clip').click(function () {
            var text = String($(this).data('telNumber'));

            chrome.runtime.sendMessage({action: 'copyToClipboard', text: text});
            outTextFrame('Телефон ' + text + ' скопирован!');
        });

        $('.sh-copy-tel-to-clip').hover(
            function () {
                $(this).parents('tr').addClass('sh-tr-hover-background');
            },
            function () {
                $(this).parents('tr').removeClass('sh-tr-hover-background');
            });
    }
    
//    companyE-mail
    if (~data.indexOf('companyE-mail')) {
        let companyInfoForm = $('#company-info');
        let emailInput = $(companyInfoForm).find('[name="bookkeeperEmail"]');
        let emailValue = $(emailInput).val();
        if (emailValue) {
            $(emailInput).parent().addClass('input-group')
                    .css('padding', '0 15px');
            $(emailInput).after(''+
                '<span '+
                'class="input-group-btn ah-input-copy-top-clip-btn-group">'+
                '</span>');
        
            let btnGroup = $(emailInput).parent().find('.input-group-btn');
            $(btnGroup).append(''+
                '<button type="button" class="sh-btn sh-default-btn" '+
                'title="Скопировать E-mail" '+
                'id="copy-bookkeeperEmail-full">'+
                    '<span class="sh-button-label sh-orange-background">Б</span>'+
                '</button>'+
                '<button type="button" class="sh-btn sh-default-btn" '+
                'title="Скопировать E-mail со звездочками" '+
                'id="copy-bookkeeperEmail-stars">'+
                    '<span class="sh-button-label sh-green-background">О</span>'+
                '</button>');
            
            $('#copy-bookkeeperEmail-full').click(function() {
                let text = emailValue;
                chrome.runtime.sendMessage({action: 'copyToClipboard', text: text});
                outTextFrame('Email ' + text + ' скопирован!');
            });
            $('#copy-bookkeeperEmail-stars').click(function() {
                let text = getMailForAnswer(emailValue);
                chrome.runtime.sendMessage({action: 'copyToClipboard', text: text});
                outTextFrame('Email ' + text + ' скопирован!');
            });
        }
    }
    
//    inn
    if (~data.indexOf('inn')) {
        let companyInfoForm = $('#company-info');
        let innInput = $(companyInfoForm).find('[name="inn"]');
        let innValue = $(innInput).val();
        
        if (innValue) {
            $(innInput).parent().addClass('input-group')
                    .css({
                        'padding': '0 15px',
                        'float': 'left',
                        'min-width': '200px'
                    });
            $(innInput).after(''+
                '<span '+
                'class="input-group-btn ah-input-copy-top-clip-btn-group">'+
                '</span>');
        
            let btnGroup = $(innInput).parent().find('.input-group-btn');
            $(btnGroup).append(`
                <button type="button" class="btn btn-default"
                title="Скопировать E-mail"
                id="copy-inn">
                    <span class="sh-button-label sh-orange-background">Б</span>
                </button>
            `);
                
            $('#copy-inn').click(function() {
                let text = innValue;
                chrome.runtime.sendMessage({action: 'copyToClipboard', text: text});
                outTextFrame('ИНН ' + text + ' скопирован!');
            });
        }
    }
}


function addUnverifyPhonesButtons() {
    if ($('#phones') && $('#phones').length) {
        $('input[name^=phone]').each(function () {
            if ($(this).attr('value').length && !$(this).parents('tr').find('.i-verify-unchecked').length) {
                var phone = $(this).parents('tr').next('tr').find('button[data-verify-text="Верифицировать"]').data('phone');

                $(this).parents('tr').next('tr').find('button[data-verify-text="Верифицировать"]').after('<button type="button" class="sh-default-btn sh-unverify-phone-btn" style="float: left; margin-right: 4px;" data-phone="' + phone + '" title="">Отвязать для...</button>');


                $(this).parents('tr').find('table.phone-verify td:eq(0)').append('<span type="button" class="sh-default-btn sh-unverify-phones-multi" data-phone="' + phone + '" title="Формирование списка телефонных номеров для открепления">&#10060;</span>');

            }
        });
    }

    let id = getUserIdFromUrl(window.location.href);
    
    unverifyPhones(id);
}

// отвязка номеров с комментами
function unverifyPhones(id) {


    $('.sh-unverify-phone-btn').unbind().click(function () {
        var phone = $(this).data('phone');

        $('body').append('<div id="sh-unverify-url-container" style="position: fixed; top: 0; right: 0; left:0; bottom: 0; margin: auto; width: 450px; height: 220px; background-color: white; box-shadow: 0 0 10px; border-radius: 4px; padding: 10px; z-index: 9999;"><span style="font-size: 16px;"><b>Отвязка номера</b></span><span class="sh-circle-close-btn" style="float: right; margin: 0 0 0 20px;"></span><hr class="sh-default-hr"><span style="display: block; font-weight: bold;">E-mail, ссылка на УЗ или ссылка на тикет</span><div class="input-group" style="margin-top: 2px;"><input type="text" class="form-control" id="sh-unverify-comment-input" value="" maxlength=""><span class="input-group-btn"><input type="button" class="btn btn-primary" value="Продолжить" title="" id="sh-unverify-url-ok-btn"></span></div><span style="display: block; margin-top: 10px;"> - При указании ссылки на тикет - ставит комменнтарий с указанной ссылкой на текущей УЗ.</span><span style="display: block;"> - При указании ссылки на УЗ - ставит комментарии на обеих УЗ.</span><span style="display: block;"> - При указании E-mail - ставит комменнтарий с указанным E-mail на текущей УЗ (<b>\'Номер\'</b> отвязан для <b>\'E-mail\'</b>).</span></div>');

        $('#sh-popup-layer-blackout-btn').show();

        $('#sh-unverify-url-container span.sh-circle-close-btn').click(function () {
            $('#sh-popup-layer-blackout-btn').hide();
            $('#sh-unverify-url-container').detach();
            return;
        });

        $('#sh-unverify-url-ok-btn').click(function () {
            var url = $('#sh-unverify-comment-input').val();

            if (url == '') {
                alert('Введите адрес');
                return;
            }

            if (url != null) {
                var o = {id: id, phone: phone};
                var reloadPage = true;
                var mailPattern = /.+@.+\..+/i;
                var userLinkPatter = /https\:\/\/adm\.avito\.ru\/users\/user\/info\/.+/i;
                var helpdeskLinkPatter = /https\:\/\/adm\.avito\.ru\/helpdesk\/details\/.+/i;
                var shortUserLinkReg = /https\:\/\/adm\.avito\.ru\/\d+u(?!\/)\b/i;

                if (mailPattern.test(url)) {
                    try {
                        commentOnUserSupport(id, phone + " отвязан для " + url);
                        unverify(o, reloadPage);
                        return;
                    } catch (e) {
                        alert(e);
                    }
                }

                if (helpdeskLinkPatter.test(url)) {
                    try {
                        commentOnUserSupport(id, phone + " отвязан, тикет: " + url);
                        unverify(o, reloadPage);
                        return;
                    } catch (e) {
                        alert(e);
                    }
                }

                if (userLinkPatter.test(url) || shortUserLinkReg.test(url)) {
                    try {
                        commentOnUserSupport(getUserIdFromUrl(url), phone + " отвязан от " + window.location.href);
                        commentOnUserSupport(id, phone + " отвязан для " + url);
                        unverify(o, reloadPage);
                        return;
                    } catch (e) {
                        alert(e);
                    }
                }

                alert('Ошибка: данные введены некорректно.');
            }
        });
    });

    // мультиотвязка
    $('.sh-unverify-phones-multi').click(function () {
        var TEL_LIMIT = 10; // лимит на кол-во номеров

        if ($('#sh-unverify-phones-multi-container').length == 0) {
            var navbarHeight = $('div.navbar-fixed-top').height();
            if (!navbarHeight) {
                navbarHeight = 50;
            }
            $('body').append('<div id="sh-unverify-phones-multi-container" style="position: fixed; top: ' + (navbarHeight + 10) + 'px; right: 10px; background-color: white; box-shadow: 0 0 10px; border-radius: 4px; padding: 10px; z-index: 2;"><span style="font-size: 16px;"><b>Отвязка номеров</b></span><span class="sh-circle-close-btn" style="float: right; margin: 0 0 0 20px;"></span><hr class="sh-default-hr"><span>Добавленные номера:</span><ul id="sh-added-phone-multi-unverify-list" style="padding-left: 20px; margin-top: 4px;"></ul><hr class="sh-default-hr"><div id="sh-multi-unverify-action-btns"></div></div>');
            $('#sh-multi-unverify-action-btns').append('<div><button type="button" class="sh-default-btn sh-multi-unverify-btn" style="width: 100%;" title="">Отвязать для...</button><br><button type="button" class="sh-default-btn sh-multi-unverify-btn" style="width: 100%; margin-top: 4px;" title="Отвязывает добавленные номера и проставляет на текущей УЗ введенный комментарий">Просто отвязать</button><div>');
            $('#sh-multi-unverify-action-btns').append('<button type="button" class="sh-default-btn" style="width: 100%; display: none" title="" id="sh-close-and-reboot-btn">Перезагрузить страницу</button>');


            $('#sh-close-and-reboot-btn').click(function () {
                if (window.location.href.indexOf('helpdesk')+1) {
                    $('#sh-unverify-phones-multi-container').detach();
                    infoAboutUser();
                } else {
                    location.reload();
                }
            });
        }

        if ($(this).hasClass('sh-active-btn')) {
            $(this).removeClass('sh-active-btn');
            $('#sh-unverify-phones-multi-container li:contains(' + $(this).data('phone') + ')').detach();

            if ($('.sh-added-phone-multi-unverify').length == 0) {
                $('#sh-unverify-phones-multi-container').detach();
            }

        } else {
            if ($('.sh-added-phone-multi-unverify').length >= TEL_LIMIT) {
                alert('К сожалению, добавить больше номеров для отвязки невозможно. Лимит - ' + TEL_LIMIT + ' шт. за один раз.');
                return;
            }

            $(this).addClass('sh-active-btn');
            $('#sh-added-phone-multi-unverify-list').append('<li><span class="sh-added-phone-multi-unverify">' + $(this).data('phone') + '</span></li>');
        }

        $('#sh-unverify-phones-multi-container span.sh-circle-close-btn').click(function () {
            $('#sh-unverify-phones-multi-container').detach();
            $('.sh-unverify-phones-multi').removeClass('sh-active-btn');
        });

        // action btns
        $('.sh-multi-unverify-btn').unbind().click(function () {
            var phrase = 'отвязаны';
            if ($('.sh-added-phone-multi-unverify').length == 1) {
                phrase = 'отвязан';
            }

            var telStr = '';
            for (var i = 0; i < $('.sh-added-phone-multi-unverify').length; i++) {
                telStr += $('.sh-added-phone-multi-unverify').slice(i, i + 1).text() + ', ';
            }
            telStr = telStr.slice(0, -2);

            if ($(this).text() == 'Просто отвязать') {

                $('body').append('<div id="sh-multi-unverify-comment-container" style="position: fixed; top: 0; right: 0; left:0; bottom: 0; margin: auto; width: 400px; height: 180px; background-color: white; box-shadow: 0 0 10px; border-radius: 4px; padding: 10px; z-index: 9999;"><span style="display: block; font-weight: bold;">Ваш комментарий:</span><textarea id="sh-multi-unverify-comment-textarea" style="width: 100%; height: 100px; resize: none; padding: 4px;" onkeydown="if(event.keyCode == 13){ return false;}"></textarea><div style="margin-top: 4px;"><button type="button" class="sh-default-btn" id="sh-multi-unverify-comment-ok-btn" style="margin-right: 8px;"><span class="sh-button-label sh-green-background">&#10003;</span>Ок</button><button type="button" class="sh-default-btn" id="sh-multi-unverify-comment-close-btn"><span class="sh-button-label sh-red-background">&#10007;</span>Отмена</button></div></div>');

                $('#sh-multi-unverify-comment-textarea').val(telStr + ' ' + phrase + ' ');

                $('#sh-popup-layer-blackout-btn').show();

                $('#sh-multi-unverify-comment-close-btn').click(function () {
                    $('#sh-popup-layer-blackout-btn').hide();
                    $('#sh-multi-unverify-comment-container').detach();
                    return;
                });

                $('#sh-multi-unverify-comment-ok-btn').click(function () {
                    var comment = $('#sh-multi-unverify-comment-textarea').val();

                    $('#sh-popup-layer-blackout-btn').hide();
                    $('#sh-multi-unverify-comment-container').detach();

                    $('#sh-loading-layer').show();

                    commentOnUserSupport(id, comment);

                    var reloadPage = false;
                    for (var i = 0; i < $('.sh-added-phone-multi-unverify').length; i++) {
                        var phone = $('.sh-added-phone-multi-unverify').slice(i, i + 1).text();
                        var obj = {id: id, phone: phone};
                        unverify(obj, reloadPage);
                    }
                });

            } else {
                $('body').append('<div id="sh-unverify-url-container" style="position: fixed; top: 0; right: 0; left:0; bottom: 0; margin: auto; width: 450px; height: 220px; background-color: white; box-shadow: 0 0 10px; border-radius: 4px; padding: 10px; z-index: 9999;"><span style="font-size: 16px;"><b>Отвязка номеров</b></span><span class="sh-circle-close-btn" style="float: right; margin: 0 0 0 20px;"></span><hr class="sh-default-hr"><span style="display: block; font-weight: bold;">E-mail, ссылка на УЗ или ссылка на тикет</span><div class="input-group" style="margin-top: 2px;"><input type="text" class="form-control" id="sh-unverify-comment-input" value="" maxlength=""><span class="input-group-btn"><input type="button" class="btn btn-primary" value="Продолжить" title="" id="sh-unverify-url-ok-btn"></span></div><span style="display: block; margin-top: 10px;"> - При указании ссылки на тикет - ставит комменнтарий с указанной ссылкой на текущей УЗ.</span><span style="display: block;"> - При указании ссылки на УЗ - ставит комментарии на обеих УЗ.</span><span style="display: block;"> - При указании E-mail - ставит комменнтарий с указанным E-mail на текущей УЗ (<b>\'Номер\'</b> отвязан для <b>\'E-mail\'</b>).</span></div>');

                $('#sh-popup-layer-blackout-btn').show();

                $('#sh-unverify-url-container span.sh-circle-close-btn').click(function () {
                    $('#sh-popup-layer-blackout-btn').hide();
                    $('#sh-unverify-url-container').detach();
                    return;
                });

                $('#sh-unverify-url-ok-btn').click(function () {
                    var url = $('#sh-unverify-comment-input').val();

                    if (url == '') {
                        alert('Введите адрес');
                        return;
                    }

                    $('#sh-popup-layer-blackout-btn').hide();
                    $('#sh-unverify-url-container').detach();

                    if (url != null) {
                        $('#sh-loading-layer').show();

                        var obj = {id: id, phone: phone};
                        var reloadPage = false;
                        var mailPattern = /.+@.+\..+/i;
                        var userLinkPatter = /https\:\/\/adm\.avito\.ru\/users\/user\/info\/.+/i;
                        var helpdeskLinkPatter = /https\:\/\/adm\.avito\.ru\/helpdesk\/details\/.+/i;
                        var shortUserLinkReg = /https\:\/\/adm\.avito\.ru\/\d+u(?!\/)\b/i;

                        if (mailPattern.test(url)) {
                            try {
                                commentOnUserSupport(id, telStr + ' ' + phrase + ' для ' + url);
                                for (var i = 0; i < $('.sh-added-phone-multi-unverify').length; i++) {
                                    var phone = $('.sh-added-phone-multi-unverify').slice(i, i + 1).text();
                                    var obj = {id: id, phone: phone};
                                    unverify(obj, reloadPage);
                                }
                                return;
                            } catch (e) {
                                alert(e);
                            }
                        }

                        if (helpdeskLinkPatter.test(url)) {
                            try {
                                commentOnUserSupport(id, telStr + ' ' + phrase + ',  тикет: ' + url);
                                for (var i = 0; i < $('.sh-added-phone-multi-unverify').length; i++) {
                                    var phone = $('.sh-added-phone-multi-unverify').slice(i, i + 1).text();
                                    var obj = {id: id, phone: phone};
                                    unverify(obj, reloadPage);
                                }
                                return;
                            } catch (e) {
                                alert(e);
                            }
                        }

                        if (userLinkPatter.test(url) || shortUserLinkReg.test(url)) {
                            try {
                                commentOnUserSupport(getUserIdFromUrl(url), telStr + ' ' + phrase + ' от ' + window.location.href);
                                commentOnUserSupport(id, telStr + ' ' + phrase + ' для ' + url);
                                for (var i = 0; i < $('.sh-added-phone-multi-unverify').length; i++) {
                                    var phone = $('.sh-added-phone-multi-unverify').slice(i, i + 1).text();
                                    var obj = {id: id, phone: phone};
                                    unverify(obj, reloadPage);
                                }
                                return;
                            } catch (e) {
                                alert(e);
                            }
                        }

                        $('#sh-loading-layer').hide();
                        alert('Ошибка: данные введены некорректно.');
                    }
                });

            }
        });
    });
}

function getUserIdFromUrl(url) {
    return url.replace(/\D/gi, '');
}

function unverify(obj, reloadPage) {

    var formData = new FormData();
    formData.append('id', obj.id);
    formData.append('phone', obj.phone);

    var url = 'https://adm.avito.ru/users/user/phone/cancel_confirm';

    var xhr = new XMLHttpRequest();
    xhr.open('POST', url, true);
    xhr.send(formData);

    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 && xhr.status == 200) {
            if (reloadPage) {
                alert('Номер успешно отвязан');
                location.reload();
            } else { // мультиотвязка
                $('#sh-added-phone-multi-unverify-list li:contains(' + obj.phone + ')').append('<span class="sh-multi-unverify-status-chacker" style="margin-left: 8px; color: green;">Ok</span>');

                if ($('.sh-multi-unverify-status-chacker').length == $('.sh-added-phone-multi-unverify').length) {
                    $('#sh-loading-layer').hide();

                    $('#sh-multi-unverify-action-btns div').detach();
                    $('#sh-close-and-reboot-btn').show();
                }
            }
        }

        if (xhr.readyState == 4 && xhr.status > 200) {
            if (reloadPage) {
                alert('Не удалось отвязать номер');
            } else {
                $('#sh-added-phone-multi-unverify-list li:contains(' + obj.phone + ')').append('<span class="sh-multi-unverify-status-chacker" style="margin-left: 8px; color: red;">Fail</span>');

                if ($('.sh-multi-unverify-status-chacker').length == $('.sh-added-phone-multi-unverify').length) {
                    $('#sh-loading-layer').hide();

                    $('#sh-multi-unverify-action-btns div').detach();
                    $('#sh-close-and-reboot-btn').show();
                }
            }
        }
    }
}

//----- инфа о всех IP на users/info  -----//
function showCountryIP() {
    $('.control-label:contains(Last auth IPs)').append('<span id="showCountryIP" class="pseudo-link" style="margin-left: 5px;" title="Показать у всех IP страну нахождения">ℹ</span>')

    $('#showCountryIP').click(function () {
        $('span[ipinfo]').remove();

        let n = $('.ip-info-list li').length;

        for (var i = 0; i < n; ++i) {
            let tmp = $('.ip-info-list li span[data-ip]').slice(i, i + 1);
            let ip = $(tmp).attr('data-ip');

            requestInfoIP(ip);

            $(tmp).after(' - <span ipinfo="' + ip + '"></span>');
        }
    });
}

function requestInfoIP(ip, action) {
    action = action || '';
    let href = 'https://adm.avito.ru/ip/info?ip=' + ip;

    let xhr = new XMLHttpRequest();
    xhr.open('GET', href, true);
    xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
    xhr.send();
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                switch (action) {
                    case 'helpdesk-ip-info':
                        helpdeskIpInfoHandler(xhr);
                        break;
                }

                let response = xhr.responseText;

                let country = $(response).find('tr:contains(Страна) td').text();
                let city = $(response).find('tr:contains(Город) td').text();

                if (country !== 'Russia') $('span[ipinfo="' + ip + '"]').css('color', 'red');

                $('span[ipinfo="' + ip + '"]').text(country + ', ' + city);
            }
        }
    };
}

//+++++ инфа о всех IP на users/info +++++//

//----- ссылки на system/access рядом с IP  -----//

function addIPSystemAccessLink() {
    var ipList = $('.ip-info-list');
    var allIps = $(ipList).find('li');

    $(allIps).each(function (i, ip) {
        var itemsIpLink = $(ip).find('[href^="/items/search?ip"]');
        var ipText = $(ip).find('.js-ip-info').text();
        $(itemsIpLink).after(' / <a target="_blank" href="https://adm.avito.ru/system/access?ip=' + ipText + '">Access</a>');
    });
}
//+++++ ссылки на system/access рядом с IP +++++//

//----- логирование отвязанных номеров  -----//
function logUnferifiedPhone() {
    var subdivision = userGlobalInfo.subdivision.toLowerCase();
    var allowedSubdivisions = ['s1', 'sa', 'sd', 'tl'];

    if (allowedSubdivisions.indexOf(subdivision) == -1)
        return;

    var parentFormGroup = $('#phones');
    var phoneMoreBlock = $(parentFormGroup).find('.phone-stat-more');

    $(phoneMoreBlock).each(function (i, item) {
        var phoneNumber = $(item).find('button.i-verify').attr('data-phone');
        $(item).prepend('<button type="button" class="sh-default-btn addOld-phone-to-log" title="" style="float: left; margin-right: 4px;" data-phone=' + phoneNumber + '>В лог</button>');
    });

    $('.addOld-phone-to-log').click(function () {
        var phone = $(this).attr('data-phone');
        var avitoUserId = getParamOnUserInfo('user-id');
        var avitoUserEmail = getParamOnUserInfo('e-mail');
        var userId = +userGlobalInfo.id;

        var obj = {
            phone: phone,
            avitoUserId: avitoUserId,
            avitoUserEmail: avitoUserEmail,
            userId: userId
        }

        // console.log(obj);
        $('#sh-loading-layer').show();
        addPhoneToDB(obj);
    });
}

function addPhoneToDB(data) {
    chrome.runtime.sendMessage({
        action: 'XMLHttpRequest',
        method: "POST",
        url: "http://avitoadm.ru/support_helper/phone_log/addPhone.php",
        data: "logPhone=" + JSON.stringify(data),
    },
            function (response) {
                $('#sh-loading-layer').hide();
                // console.log(response);
                if (~response.indexOf('Неверный запрос') || response == 'error') {
                    setTimeout(function () {
                        alert('Произошла техническая ошибка.');
                    }, 100);
                    return;
                }

                if (response == 'Добавлен') {
                    setTimeout(function () {
                        alert('Ошибка: для этого пользователя данный номер телефона уже был добавлен в лог за последние 60 минут.');
                    }, 100);
                    return;
                }


                // console.log(response);
                try {
                    var json = JSON.parse(response);
                    var phone = json.phone;
                } catch (e) {
                    setTimeout(function () {
                        alert('Произошла техническая ошибка.');
                    }, 100);
                    return;
                }
                outTextFrame('Телефон "' + phone + '" был успешно добавлен в лог.');
            }
    );
}
//+++++ логирование отвязанных номеров +++++//

// элементы на странице юзера (траффики)
function usersInfoElements() {
    $('label:contains("E-mail")').next().find('span:eq(0)').after('<button id="copyEmailJH" class="sh-default-btn" type="button" title="Скопировать E-mail в буфер обмена" style="height:30px;padding: 5px 10px; font-size: 12px; margin-left: -30px; position: relative;"><span class="sh-button-label sh-orange-background" style="border-radius: 0; font-size: 12px; min-width: 15px; top: 0px; line-height: 16px;">Б</span>В буфер</button>');
    $('#copyEmailJH').click(function () {
        var text = $(this).prev().text();
        chrome.runtime.sendMessage({action: 'copyToClipboard', text: text});
        outTextFrame('Email ' + text + ' скопирован');
    });
}

// переход в HD
function linkToHDOnUser() {
    var mailToUrl = $('.js-fakeemail-field').text().replace(/\@/, '%40');
    $('.header__title:eq(0)').append('<span style="color: rgb(189, 189, 189);"> | </span><span style="font-size: 14px; vertical-align: middle;"><a id="" style="cursor: pointer;" href="https://adm.avito.ru/helpdesk?p=1&requesterEmail=' + mailToUrl + '&sortField=createdTxtime&sortType=desc" target="_blank">Перейти в Helpdesk</a></span>');
}