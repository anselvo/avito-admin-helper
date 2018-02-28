// где верифицирован номер ---
function findWherePhoneVerified() {
    $('form[action="/users/search"] .form-row:first-child').append('<button type="button" class=" ah-default-btn" id="find-where-phone-verified" title="Данные берутся из лога верификации по кнопке \'Больше\'">Найти привязку</button>');

    var phone;
    $('#find-where-phone-verified').click(function() {
        $('.ah-info-container').remove();
        $('.ah-verified-icon').remove();
        phone = $(this).parents('form').find('[name="phone"]').val().replace(/\D/g, '');
        if (!phone) {
            alert('Ошибка: номер телефона не указан в соответствующем поле.');
            return false;
        }

        phone = '7' + phone.slice(-10);
        $('#ah-loading-layer').show();
        getVerificationLog(phone);
    });
}

function findUserWithVerifiedPhone(html, phone) {
    var finded = false;

    var statusText = '';
    $(html).each(function(i, elem) {
        statusText = $(elem).find('td:eq(1)').text();
        if (~statusText.indexOf('Верифицирован') || ~statusText.indexOf('Reserved')) {
            finded = true;
            renderUserWithVerifiedPhoneInfo(elem, phone);
            return false;
        }
    });

    if (!finded) {
        renderVerificationLog(html, phone);
    }
}

function renderUserWithVerifiedPhoneInfo(elem, phone) {
    var userId = $(elem).find('td:eq(2) [href^="/users/user/info"]:eq(1)').text() || 'error';

    $('body').append('<div class="ah-info-container" style="z-index: 1050;"></div>');
    $('.ah-info-container').append('<span class="info-header">Привязка для "'+ phone +'" <span style="color: #2e8b57;">найдена</span></span><span class="ah-circle-close-btn"></span><hr class="ah-default-hr">');

    $('.ah-info-container').append('<table></table>');
    $('.ah-info-container table').append('<tr><th>Время действия</th><th>Статус</th><th>Учетная запись</th></tr>');

    $('.ah-info-container table').append(elem);

    $('.ah-info-container').append(`<hr class="ah-default-hr"><span style="padding: 8px;"><a target="_blank" href="${global.connectInfo.adm_url}/users/phones_verification?phone=${phone}">Перейти в лог верификации</a></span>`);

    var tableUserId, tableRow;
    $('table.table-striped tr').each(function(i, elem) {
        tableUserId = $(elem).find('td:eq(3) a').attr('href');
        if (tableUserId) {
            tableUserId = tableUserId.split('/');
            tableUserId = tableUserId[tableUserId.length - 1];
        }

        if (tableUserId === userId) {
            $(elem).find('td:eq(3)').append('<span class="ah-verified-icon"></span>');
        }
    });

    $('.ah-circle-close-btn').click(function() {
        $('.ah-info-container').detach();
        $('tr .ah-verified-icon').detach();
    });
}

function renderVerificationLog(html, phone) {
    $('body').append('<div class="ah-info-container" style=""></div>');
    $('.ah-info-container').append('<span class="info-header">Привязка для "'+ phone +'" <span style="color: #e00;">не найдена</span></span><span class="ah-circle-close-btn"></span><hr class="ah-default-hr">');
    $('.ah-info-container').append('<table></table>');
    $('.ah-info-container table').append('<tr><th>Время действия</th><th>Статус</th><th>Учетная запись</th></tr>');

    $('.ah-info-container table').append(html);

    $('.ah-info-container').append(`<hr class="ah-default-hr"><span style="padding: 8px;"><a target="_blank" href="${global.connectInfo.adm_url}/users/phones_verification?phone=${phone}">Перейти в лог верификации</a></span>`);

    $('.ah-circle-close-btn').click(function() {
        $('.ah-info-container').detach();
        $('tr .ah-verified-icon').detach();
    });
}
// где верифицирован номер +++

// копирование телефона в буфер в формате, как на странице юзера ---
function copyPhoneToClipboard() {
    $('form[action="/users/search"] [name="phone"]')
        .addClass('ah-text-input-with-btn')
        .after('<button type="button" class="ah-default-btn ah-sh-copy-tel-to-clip" style="padding: 8px 2px; float: right; font-size: 12px; border-top-left-radius: 0; border-bottom-left-radius: 0; height: 34px; width: 30px; margin-left: -1px; position: relative;" title="Скопировать телефон в буфер обмена в формате, как на странице пользователя"><span class="ah-support-button-label ah-orange-background"  style="cursor: pointer; display: inline-block; border-radius: 0; text-align: center; min-width: 15px; font-size: 12px; vertical-align: middle; margin-right: 0; top: 0px; line-height: 16px;">Б</span></button>');

    var phone;
    $('.ah-sh-copy-tel-to-clip').click(function() {
        phone = $('form[action="/users/search"] [name="phone"]').val().replace(/\D/g, '');
        if (!phone) {
            alert('Ошибка: номер телефона не указан в соответствующем поле.');
            return false;
        }
        phone = '7' + phone.slice(-10);
        chrome.runtime.sendMessage( { action: 'copyToClipboard', text: phone } );
        outTextFrame('Телефон '+ phone +' скопирован!');
    });
}


function parseQueryURL(strQuery) {
    var strSearch   = strQuery.substr(1),
        strPattern  = /([^=]+)=([^&]+)&?/ig,
        arrMatch    = strPattern.exec(strSearch),
        objRes      = {};
    while (arrMatch != null) {
        objRes[arrMatch[1]] = arrMatch[2];
        arrMatch = strPattern.exec(strSearch);
    }
    return objRes;
}

// МАССОВАЯ БЛОКИРОВКА ПОЛЬЗОВАТЕЛЕЙ

function usersSearchBlockUser() {
    if (!sessionStorage.postBlockID) sessionStorage.postBlockID = '';
    if (!sessionStorage.postBlockActiveUserID) sessionStorage.postBlockActiveUserID = '';

    $('body').append('<div id="apply_all" class="fixed-bottom-toolbar" style="padding-left: 60px;"></div>');

    addChooseButtonUsersSearch();
    addActionButton();
    usersListCheck();
}


function addChooseButtonUsersSearch() {
    const loginList = $('tr td:first-child a');

    $('tr td:first-child').css({width: '140px'});

    for (let i = 0; i < loginList.length; ++i) {
        let id = $(loginList[i]).text();

        if (!$(loginList[i]).parents('tr').hasClass('success'))
            $(loginList[i]).parent().append('<input type="button" userid="' + id + '" class="ah-postBlockButton ah-postPlus" value="+">');

        $(loginList[i]).parents('tr').after('<tr class="ah-post-userAgent" style="background: #f9f9f9"><td colspan="9"  style="border-top: none"><b>User-Agent:</b> <span userAgent="'+id+'"></span></td></tr>');
    }

    clickChooseButton();
}

// МАССОВАЯ БЛОКИРОВКА ПОЛЬЗОВАТЕЛЕЙ


