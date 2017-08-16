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
    var id = location.href.split('/')[6];
    $('.calls .col-xs-9').append('<input id="rbc" type="button" class="btn btn-sm btn-default calls-btn_good" value="RBC" style="color: #a12fff">');

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