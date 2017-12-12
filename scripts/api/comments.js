// Парсер комментов ++++ 
function linksOnComments(tableClass, currentUserID) {
    $(tableClass+' .sh-unicode-links').detach();

    var n = $(tableClass).length;

    // Patterns
    var duplicateReg = /duplicate.+/i;
    var duplicatePluralReg = /(duplicates|duplicate items):.+/i;

    for (var j = 0; j < n; j++) {
        var commentBlock = $(tableClass).slice(j, j + 1);
        var commentText = $(commentBlock).html();
        
        if (duplicateReg.test(commentText)) { // dublicate
            var text = commentText;
            text = text.replace(/\d{2,}/g, '<a href="https://adm.avito.ru/items/item/info/$&" target="_blank">$&</a>');

            var duplicatePluralText = commentText.match(duplicatePluralReg);
            if (duplicatePluralText) {
                var itemIds = duplicatePluralText[0].match(/\d+/g);
                if (itemIds && itemIds.length > 1) {
                    var dublicatePhrase = duplicatePluralText[0].split(':')[0];
                    text = text.replace(dublicatePhrase, '<a href="https://adm.avito.ru/items/search?query=' + itemIds.join('%7C') + '" target="_blank">$&</a>');
                }
            }

            $(commentBlock).html(text);
        }

        if (~commentText.indexOf('item_')) { // cron-dublicate on Item
            var text = commentText;
            let ids = text.match(/\d+(?![\].])\b/g);

            text = text.replace(/\d+(?![\].])\b/g, '<a href="https://adm.avito.ru/items/item/info/$&" target="_blank">$&</a>');

            if (ids.length > 4)
                text += '<a class="glyphicon glyphicon-new-window" href="https://adm.avito.ru/items/search?query=' + ids.join('|') + '" target="_blank"></a>';
            else {
                let link = 'https://adm.avito.ru/items/comparison/' + ids[0] + '/archive?';
                for (let i = 1; i < ids.length; ++i) link += 'ids[]=' + ids[i] + '&';

                text += '<a class="glyphicon glyphicon-new-window" href="' + link + '" target="_blank"></a>';
            }

            $(commentBlock).html(text);
        }

        if (~commentText.indexOf('revived')) { //comparison on Item
            var text = commentText;
            let ids = text.match(/\d{2,}/g);

            text = text.replace(/\d{2,}/g, '<a href="https://adm.avito.ru/items/item/info/$&" target="_blank">$&</a>');

            if (ids.length > 4)
                text += '<a class="glyphicon glyphicon-new-window" href="https://adm.avito.ru/items/search?query=' + ids.join('|') + '" target="_blank"></a>';
            else {
                let link = 'https://adm.avito.ru/items/comparison/' + ids[0] + '/archive?';
                for (let i = 1; i < ids.length; ++i) link += 'ids[]=' + ids[i] + '&';

                text += '<a class="glyphicon glyphicon-new-window" href="' + link + '" target="_blank"></a>';
            }

            $(commentBlock).html(text);
        }

        if (~commentText.indexOf('https://adm.avito.ru/')) { // user links
            var text1 = commentText;
            if (text1 == undefined) continue;
            var links = text1.split(/(?: |<br>|\n)/);
            var avito = 'https://adm.avito.ru/';

            var shortUserLinkReg = /https\:\/\/adm\.avito\.ru\/\d+u(?!\/)\b/i;

            for (var i = 0; i < links.length; i++){
                if ((links[i].indexOf(avito) + 1) && (text1.indexOf('href="' + links[i]) + 1) === 0){
                    if (~links[i].indexOf('https://adm.avito.ru/users/user/info/') || shortUserLinkReg.test(links[i])) {
                        var userID = links[i].replace(/\D/gi, '');
                        text1 = text1.replace(links[i], '<a href="' + links[i] + '" target="_blank">' + links[i] + '</a><span class="sh-unicode-links">(<span class="pseudo-link compareUser" userID="' + userID + '" title="Сравнить учетные записи">&#8644</span>)</span>');
                        $(commentBlock).html(text1);
                    } else {
                        text1 = text1.replace(links[i], '<a href="' + links[i] + '" target="_blank">' + links[i] + '</a>');
                        $(commentBlock).html(text1);
                    }
                }
            }
        }

        if (~commentText.indexOf('Alive user ID:')) { // comparison on User
            var text = commentText;

            var tmp = text.split("Alive user ID: ");
            if (tmp[1] == undefined) continue;
            var users = tmp[1].split(/\D/);
            text = text.replace(users[0], '<a href="https://adm.avito.ru/users/user/info/' + users[0] + '" target="_blank">' + users[0] + '</a><span class="sh-unicode-links">(<span class="pseudo-link compareUser" userID="' + users[0] + '" title="Сравнить учетные записи">&#8644</span>)</span>');
            $(commentBlock).html(text);

            var tmp2 = text.split("Base item ID: ");
            if (tmp2[1] == undefined) continue;
            var users2 = tmp2[1].split(/\D/);
            text = text.replace(users2[0], '<a href="https://adm.avito.ru/items/item/info/' + users2[0] + '" target="_blank">' + users2[0] + '</a><span class="sh-unicode-links">(<span class="pseudo-link compareItems" itemID="'+users2[0]+'" target="_blank">%</span>)</span>');
            $(commentBlock).html(text);

            var part = text.split(", ");
            if (part[2] == undefined) continue;
            var sii = part[2].split("Similar item IDs: [");
            var sii1 = sii[1].split(",");
            for (var i = 0; i < sii1.length; i++) {
                var siiLinks = sii1[i].split(" -");
                text = text.replace(siiLinks[0],'<a href="https://adm.avito.ru/items/item/info/'+siiLinks[0]+'" target="_blank">'+siiLinks[0]+'</a><span class="sh-unicode-links">(<span class="pseudo-link compareItems" itemID="'+siiLinks[0]+'" target="_blank">%</span>)</span>');
            }
            $(tableClass).slice(j,j+1).html(text);
        }

        if (~commentText.indexOf('Similar accounts:')) { // comparison on User
            var text = commentText;

            var tmp = text.split("Base item ID: ");
            if (tmp[1] == undefined) continue;
            var users = tmp[1].split(/\D/);
            text = text.replace(users[0], '<a href="https://adm.avito.ru/items/item/info/' + users[0] + '" target="_blank">' + users[0] + '</a><span class="sh-unicode-links">(<span class="pseudo-link compareItems" itemID="'+ users[0] +'" target="_blank">%</span>)</span>');
            $(commentBlock).html(text);

            var tmp2 = text.split("Similar accounts: ");
            if (tmp2[1] == undefined) continue;
            var users2 = tmp2[1].split(/\D/);
            for (var i = 1; i < users2.length; i++) { // Цикл с 1, т.к. ID дублируются
                text = text.replace(users2[i], '<a href="https://adm.avito.ru/users/user/info/' + users2[i] + '" target="_blank">' + users2[i] + '</a><span class="sh-unicode-links">(<span class="pseudo-link compareUser" userID="' + users2[i] + '" title="Сравнить учетные записи">&#8644</span>)</span>');
                $(commentBlock).html(text);
            }
        }

        if (~commentText.indexOf('по обращению №')) { // link on ticket
            var text = commentText;

            var tmp = text.split("по обращению №");
            if (tmp[1] == undefined) continue;
            var tickets = tmp[1].split(/\D/);
            text = text.replace(tickets[0], '<a href="https://adm.avito.ru/helpdesk/details/' + tickets[0] + '" target="_blank">' + tickets[0] + '</a>');
            $(commentBlock).html(text);
        }

        // Выделение текста
        if (~commentText.indexOf('СПАМ')) {
            let text = $(commentBlock).html();

            text = text.replace('СПАМ', '<b style="color: #ff4545">СПАМ</b>');
            text = text.replace('Ссылка открытая модератором при блокировке:', '<b>Ссылка открытая модератором при блокировке:</b>');
            text = text.replace('Ссылка на активного пользователя:', '<b>Ссылка на активного пользователя:</b>');
            text = text.replace('Ссылка на заблокированных пользователей в items/search:', '<b>Ссылка на заблокированных пользователей в items/search:</b>');
            text = text.replace('Ссылки на заблокированные учетные записи:', '<b>Ссылки на заблокированные учетные записи:</b>');
            $(commentBlock).html(text);
        }
    }

    $('.compareUser').unbind('click').click(function () {
        var similarUserID = $(this).attr('userID');

        addBlock();
        chekUserforDubles(currentUserID, similarUserID);
    });

    $('.compareItems').unbind('click').click(function () {
        var itemID = $(this).attr('itemID');
        if (!itemID) return;

        $('#sh-loading-layer').show();

        $('.images-preview-gallery').remove();
        $('body').append('<div class="images-preview-gallery" style="display: none; position:fixed; z-index: 1080; background-color: rgba(255, 255, 255, 0.95); text-align: center; border-radius: 0; padding: 10px; border: 1px solid rgba(153, 153, 153, 0.56);"></div>');

        loadComperison(itemID, currentUserID);
    });
}

function addBlock() {
    $('#check_result_user_box').detach();

    $('body').append('<div id="check_result_user_box" class="sh-default-popup" style="color:black;position:fixed;width:600px;height:500px;z-index:999999;-webkit-box-shadow:0 3px 20px rgba(0, 0, 0, 0.9);"></div>');
    $('#check_result_user_box').append('<div id="result_result_box" class="ah-compare-users-container" style="height:440px;overflow:auto;"></div>');
    $('#result_result_box').append('<input id="userforchek1_result_box" type="text" style="width:200px;height:30px;" placeholder="Ссылка на пользователя1"></input>');
    $('#result_result_box').append('<input id="userforchek2_result_box" type="text" style="width:200px;height:30px;" placeholder="Ссылка на пользователя2"></input>');
    $('#check_result_user_box').append('<div id="button_result_box" class="sh-tags-popup-footer" style="height:30px; text-align:left;"></div>');
    $('#button_result_box').append('<input type="button" value="Проверить" id="go_button_result_box" class="sh-action-btn"></input>');
    $('#button_result_box').append('<input type="button" style="margin-left:5px;" value="Объявы(1-лист)" id="go_button_item" class="sh-action-btn"></input>');
    $('#button_result_box').append('<input type="button" value="Close" id="close_button_result_box" class="sh-action-btn" style="float:right;"></input>');

    $('#close_button_result_box').click(function (){
        $('#check_result_user_box').detach();
    });
    $('#go_button_result_box').click(function (){
        chekresultQuicly(true);
    });
    $('#go_button_item').click(function (){
        chekItemForDubles();
    });

    $(document).mouseup(function(e) { // событие клика по веб-документу
        var div = $('#check_result_user_box'); // элемент
        if (!div.is(e.target) // если клик был не по элементу
            && div.has(e.target).length === 0) { // и не по его дочерним элементам
            div.detach(); // убираем его
        }
    });
}
function chekUserforDubles(href1, href2) {
    var url1, url2;
    if (href1.indexOf('https')+1) {
        url1 = href1.replace(/\D/gi, '');
    } else {
        url1 = href1;
    }
    if (href2.indexOf('https')+1) {
        url2 = href2.replace(/\D/gi, '');
    } else {
        url2 = href2;
    }

    if (url1 == url2) {
        alert('Вы пытаетесь сравнить одну и ту же учетную запись');
        $('#check_result_user_box').detach();
        return;
    }

    $('#result_result_box').html('');
    $('#result_result_box').append('<div id="user1" userID="'+url1+'" class="ah-user-column-one" style="display:inline;float:left;"></div>');
    $('#result_result_box').append('<div id="user2" userID="'+url2+'" class="ah-user-column-two" style="display:inline;float:right;"></div>');
    $('#result_result_box').append('<div id="overallBar" class="sh-default-list" style="position:absolute;display:none;background:#E0F2F1;box-shadow: 0 1px 1px rgba(0,0,0,.175);left:220px;width:140px;height:30px;padding:1px;text-align:center;"></div>');

    $('#overallBar').append('<input type="button" class="sh-action-btn"  value="TN" title="Техническая неполадка (восстанавливает учетную запись, на которой вы сейчас находитесь с Relevantive items)" id="texNep" style="background:#CE93D8;font-weight:bold;padding:3px;font-size:13px;border-color:#BA68C8;">'+
        ' <input type="button" class="sh-action-btn"  value="SP" title="SPAM (блокирует учетную запись, на которой вы сейчас находитесь с прекращением)" id="spamUsers" style="background:#CE93D8;font-weight:bold;padding:3px;font-size:13px;border-color:#BA68C8;">'+
        ' <input type="button" class="sh-action-btn"  value="PM" title="Put a mark on users (простановка пометок, где активная и где заблокированная)" id="putMark" style="background:#CE93D8;font-weight:bold;padding:3px;font-size:13px;border-color:#BA68C8;">'+
        ' <input type="button" class="sh-action-btn"  value="SU" title="Swap Users Status (восстанавливает заблокированного и блокирует активного)" id="swapUsers" style="background:#CE93D8;font-weight:bold;padding:3px;font-size:13px;border-color:#BA68C8;">');

    $('#user2,#user1').append('<div class="loadingBar sh-default-list" style="position:absolute;width:267px;height:440px;background:#e0e7e8;text-align:center;vertical-align:middle;color:red;padding-top:150px;">Loading...</div>');

    $('#user2,#user1').append('<div class="forchekuser actionBar" style="display:block;width:267px;height:30px;"></div>');
    $('#user1 .actionBar').append('<div class="actionBarIN sh-default-list" style="background:#E0F2F1;width:200px;box-shadow: 0 1px 1px rgba(0,0,0,.175);float:left;padding:1px;text-align:left;"></div>');
    $('#user2 .actionBar').append('<div class="actionBarIN sh-default-list" style="background:#E0F2F1;width:200px;box-shadow: 0 1px 1px rgba(0,0,0,.175);float:right;padding:1px;text-align:right;"></div>');

    $('#user2,#user1').append('<div class="forchekuser itemforcheknone sh-default-list" style="display:none;background:#eef5f7;width:267px;box-shadow: 0 1px 1px rgba(0,0,0,.175);height:200px;padding:5px;overflow:auto;"></div>');
    $('#user2,#user1').append('<div class="forchekuser itemforchek sh-default-list" style="display:none;background:#eef5f7;height:30px;box-shadow: 0 1px 1px rgba(0,0,0,.175);width:267px;padding:5px;overflow:auto;"></div>');
    $('#user2,#user1').append('<div class="forchekuser emailforchek sh-default-list" title="Email address" style="display:block;box-shadow: 0 1px 1px rgba(0,0,0,.175);background:#eef5f7;padding:5px;width:267px;height:30px;"></div>');
    $('#user2,#user1').append('<div class="forchekuser statusforchek sh-default-list" title="User status" style="display:block;box-shadow: 0 1px 1px rgba(0,0,0,.175);background:#eef5f7;padding:5px;width:267px;height:30px;font-weight:bold;"></div>');
    $('#user2,#user1').append('<div class="forchekuser registeredforchek sh-default-list" title="Registered time" style="display:block;box-shadow: 0 1px 1px rgba(0,0,0,.175);background:#eef5f7;padding:5px;width:267px;height:30px;"></div>');
    $('#user2,#user1').append('<div class="forchekuser nameforchek sh-default-list" title="User name" style="display:block;box-shadow: 0 1px 1px rgba(0,0,0,.175);background:#eef5f7;padding:5px;width:267px;height:30px;"></div>');
    $('#user2,#user1').append('<div class="forchekuser namemanagerforchek sh-default-list" title="User manager name" style="display:block;box-shadow: 0 1px 1px rgba(0,0,0,.175);background:#eef5f7;padding:5px;width:267px;height:30px;"></div>');
    $('#user2,#user1').append('<div class="forchekuser cityforchek sh-default-list"  title="User location" style="display:block;box-shadow: 0 1px 1px rgba(0,0,0,.175);background:#eef5f7;padding:5px;width:267px;height:30px;"></div>');
    $('#user2,#user1').append('<div class="forchekuser metroforchek sh-default-list" title="User Metro station" style="display:block;box-shadow: 0 1px 1px rgba(0,0,0,.175);background:#eef5f7;padding:5px;width:267px;height:30px;"></div>');
    $('#user2,#user1').append('<div class="forchekuser tehforchek sh-default-list" title="Last auth user agent" style="display:block;box-shadow: 0 1px 1px rgba(0,0,0,.175);background:#eef5f7;height:200px;width:267px;padding:5px;overflow:auto;color:black;"></div>');
    $('#user2,#user1').append('<div class="forchekuser phoneforchek sh-default-list" title="User phones numbers" style="display:block;box-shadow: 0 1px 1px rgba(0,0,0,.175);background:#eef5f7;padding:5px;width:267px;height:200px;overflow:auto;"></div>');
    $('#user2,#user1').append('<div class="forchekuser ipforchek sh-default-list" title="Last auth IPs" style="display:block;box-shadow: 0 1px 1px rgba(0,0,0,.175);background:#eef5f7;height:200px;width:267px;padding:5px;overflow:auto;"></div>');
    $('.forchekuser').css("margin-bottom", "3px");

    loadUsersForDoublesCheck('user1', url1);
    loadUsersForDoublesCheck('user2', url2);

    var timerId = setInterval(function () {
        // if ($('#user1 .statusforchek').html() != '' && $('#user1 .ipforchek').html() != '' && $('#user1 .phoneforchek').html() != '' && $('#user2 .ipforchek').html() != '' && $('#user2 .phoneforchek').html() != '') {
			
		if ($('#result_result_box .loadingBar').length == 0) {
            $('#overallBar').show();
            chekresultQuicly(false);
            compareButtonsListener();
            clearInterval(timerId);
        }
    },10);
}

function loadUsersForDoublesCheck(divID, userURL) {
    var url = 'https://adm.avito.ru/users/user/info/'+userURL;

    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.send(null);
    xhr.onreadystatechange=function() {
        if (xhr.readyState==4 && xhr.status==200)  {
            var response = xhr.responseText;

            var status = $(response).find('.form-group:contains(Статус) .form-control-static b').text();
            $('#'+divID+' .statusforchek').html(status);

            if (status == '' && $('#'+divID+' .statusforchek').length > 0) {
                if ($('#userBlocking').attr('blockingColor') == undefined) var blockingColor = 0;
                else var blockingColor = parseInt($('#userBlocking').attr('blockingColor')) + 1;

                $('#userBlocking').detach();

                if (blockingColor%2 == 0) { color = 'red'; }
                else { color = '#E53935'; }

                if (blockingColor == 30) {
                    alert('Превышен лимит ожидания');
                    $('#check_result_user_box').detach();
                }

                $('#'+divID+' .loadingBar').append('<div id="userBlocking" blockingColor="'+blockingColor+'" style="color:'+color+';">' + $(response).find('.form-group:contains(Статус) .form-control-static').text() + '</div>');
                setTimeout(loadUsersForDoublesCheck(divID, userURL), 1000);
                return;
            }

            $('#'+divID+' .tehforchek').html($(response).find('form.form-horizontal:eq(0) label:contains("User-Agent последнего посещения")').next().find('.help-block').text()); 

            var ipArr = $(response).find('form.form-horizontal:eq(0) .js-ip-info').clone();
            $(ipArr).each(function(i, ip) {
                var ipText = $(ip).text();
                $('#'+divID+' .ipforchek').append('<a target="_blank" href="/users/search?ip='+ ipText +'" title="Поиск пользователей по IP">'+ ipText +'</a>');
            });

            $('#'+divID+' .phoneforchek').html($(response).find('form.form-horizontal:eq(0) .controls-phone input').clone());
            $('#'+divID+' .nameforchek').html($(response).find('form.form-horizontal:eq(0) input[name="name"]').attr('value'));
            $('#'+divID+' .namemanagerforchek').html($(response).find('form.form-horizontal:eq(0) input[name="manager"]').attr('value'));
            $('#'+divID+' .cityforchek').html($(response).find('form.form-horizontal:eq(0) #region [selected]').text());
            $('#'+divID+' .metroforchek').html($(response).find('form.form-horizontal:eq(0) #fld_metro_id [selected]').text());
            $('#'+divID+' .emailforchek').html('<a href="'+url+'" target="_blink">'+$(response).find('form.form-horizontal:eq(0) .fakeemail-field').text()+'</a>');
            $('#'+divID+' .itemforchek').html($(response).find('form.form-horizontal:eq(0) a[href*="items/search?user_id="]').clone());
            $('#'+divID+' .registeredforchek').html($(response).find('.form-group:contains(Зарегистрирован) .form-control-static').text());

            var chanceUser = $(response).find('.btn-group-xs .active').attr('id');
            var colorChanceUser = '#81ce50';
            var colorStatusUser = 'black';

            var shop = $(response).find('.form-group:contains(Магазин) .form-control-static a').text().replace(/\s/g, '');
            if (shop == 'Оплачен') {
                $('#'+divID+' .emailforchek').css('background', '#dff0d8');
                $('#'+divID+' .actionBarIN').html('<b>This is Shop</b>');
                $('#'+divID+' .actionBarIN').css('padding', '5px');
            }

            if (chanceUser == undefined) chanceUser = '0';
            else chanceUser = chanceUser.replace('cval_','');

            if (chanceUser == '10') colorChanceUser = 'red';
            $('#'+divID+' .emailforchek').append(' <span title="User chance" style="font-weight: bold;">(<span class="userChance" style="color:'+colorChanceUser+';">'+chanceUser+'</span>/<span style="color:red;">10</span>)</span>');

            if (status == 'Blocked') colorStatusUser = 'red';
            if (status == 'Active') colorStatusUser = '#3c763d';
            $('#'+divID+' .statusforchek').css('color', colorStatusUser);

            if (shop != 'Оплачен') {
                if (status == 'Blocked' || status == 'Removed') {
                    $('#'+divID+' .statusforchek').attr("title", 'Reason:' + $(response).find('.form-group:contains(Причины) .form-control-static').text().replace(/\n/,'') + '\nBlock time: ' + $(response).find('#adminTable tr:eq(1) td:eq(0)').text());
                    $('#'+divID+' .actionBarIN').html('<input type="button" class="sh-action-btn activeUserCompare" userID="'+userURL+'" userNum="'+divID+'" value="AU" title="Active user" style="background:#689F38;font-weight:bold; padding:3px;font-size:13px;border-color:#558B2F;">'+
                        ' <input type="button" class="sh-action-btn activeUserItemCompare" userID="'+userURL+'" userNum="'+divID+'" value="UT" title="Unblock user and his items" style="background:#689F38;font-weight:bold; padding:3px;font-size:13px;border-color:#558B2F;">'+
                        ' <input type="button" class="sh-action-btn activeUserReItemCompare" userID="'+userURL+'" userNum="'+divID+'" value="RT" title="Unblock user and relevant items" style="background:#689F38;font-weight:bold;padding:3px;font-size:13px;border-color:#558B2F;">');
                } else {
                    $('#'+divID+' .actionBarIN').html('<input type="button" class="sh-action-btn blockNes" userID="'+userURL+'" userNum="'+divID+'" value="BN" title="Block: Несколько учетных записей" style="background:#D84315;font-weight:bold;padding:3px;font-size:13px;border-color:#BF360C;">'+
                        ' <input type="button" class="sh-action-btn blockNesPov" userID="'+userURL+'" userNum="'+divID+'" value="BP" title="Block: Несколько учетных записей, Повторная подача объявлений"style="background:#D84315;font-weight:bold;padding:3px;font-size:13px;border-color:#BF360C;">'+
                        ' <input type="button" class="sh-action-btn blockBlock" userID="'+userURL+'" userNum="'+divID+'" value="BB" title="Block: Нарушение правил" style="background:#D84315;font-weight:bold;padding:3px;font-size:13px;border-color:#BF360C;">');
                }
            }
            $('#'+divID+' .loadingBar').detach();
        }
    };
}

function chekresultQuicly(showAlert) {
    var resultIP = '';
    var n = $('#user1 .ipforchek a').length;
    var n2 = $('#user2 .ipforchek a').length;
    for (var i = 0; i < n; i++)
    {
        var ip1 = $('#user1 .ipforchek a').slice(i, i + 1).text();
        for (var j = 0; j < n2; j++)
        {
            var ip2 = $('#user2 .ipforchek a').slice(j, j + 1).text();
            if (ip2 == ip1)
            {
                resultIP += ip2 + '\n';
                $('#user2 .ipforchek a').slice(j, j + 1).css("background-color", "rgb(255, 198, 207)");
                $('#user1 .ipforchek a').slice(i, i + 1).css("background-color", "rgb(255, 198, 207)")
            }
        }
    }
    var resultPhone = '';
    n = $('#user1 .phoneforchek input').length;
    n2 = $('#user2 .phoneforchek input').length;
    for (var i = 0; i < n; i++)
    {
        var phone1 = $('#user1 .phoneforchek input').slice(i, i + 1).val();
        for (var j = 0; j < n2; j++)
        {
            var phone2 = $('#user2 .phoneforchek input').slice(j, j + 1).val();
            if (phone1 == phone2)
            {
                resultPhone += phone1 + '\n';
                $('#user2 .phoneforchek input').slice(j, j + 1).css("background-color", "rgb(255, 198, 207)");
                $('#user1 .phoneforchek input').slice(i, i + 1).css("background-color", "rgb(255, 198, 207)")
            }
        }
    }
    var tehResult = 'none';
    var teh1 = $('#user1 .tehforchek').text();
    var teh2 = $('#user2 .tehforchek').text();
    if (teh1 == teh2)
    {
        $('#user1 .tehforchek').css("background-color", "rgb(255, 198, 207)");
        $('#user2 .tehforchek').css("background-color", "rgb(255, 198, 207)");
        tehResult = teh1
    }
    var nameResult = 'none';
    var name1 = $('#user1 .nameforchek').text();
    var name2 = $('#user2 .nameforchek').text();
    if (name1 == name2)
    {
        $('#user1 .nameforchek').css("background-color", "rgb(255, 198, 207)");
        $('#user2 .nameforchek').css("background-color", "rgb(255, 198, 207)");
        nameResult = name1
    }
    var cityforchekResult = 'none';
    var city1 = $('#user1 .cityforchek').text();
    var city2 = $('#user2 .cityforchek').text();
    if (city1 == city2)
    {
        $('#user1 .cityforchek').css("background-color", "rgb(255, 198, 207)");
        $('#user2 .cityforchek').css("background-color", "rgb(255, 198, 207)");
        cityforchekResult = city1
    }
    var emailResult = 'none';
    var email1 = $('#user1 .emailforchek').text();
    var email2 = $('#user2 .emailforchek').text();
    if (email1 == email2)
    {
        $('#user1 .emailforchek').css("background-color", "rgb(255, 198, 207)");
        $('#user2 .emailforchek').css("background-color", "rgb(255, 198, 207)");
        emailResult = email1
    }
    var namemanagerResult = 'none';
    var namem1 = $('#user1 .namemanagerforchek').text();
    var namem2 = $('#user2 .namemanagerforchek').text();
    if (namem1 == namem2 && namem1 != undefined && namem2 != undefined && namem1 != '' && namem2 != '')
    {
        $('#user1 .namemanagerforchek').css("background-color", "rgb(255, 198, 207)");
        $('#user2 .namemanagerforchek').css("background-color", "rgb(255, 198, 207)");
        namemanagerResult = namem2;
    }
    var resultAll = '';
    if (resultPhone != '') {
        resultAll += "Совпадение по номерам:\n" + resultPhone + "\n\n"
    }
    if (resultIP != '') {
        resultAll += "Совпадение по ип:\n" + resultIP + "\n\n"
    }
    if (tehResult != 'none') {
        resultAll += "Совпадение по тех:\n" + tehResult + "\n\n"
    }
    if (nameResult != 'none') {
        resultAll += "Совпадение по имени:\n" + nameResult + "\n\n"
    }
    if (cityforchekResult != 'none') {
        resultAll += "Совпадение по городу:\n" + cityforchekResult + "\n\n"
    }
    if (emailResult != 'none') {
        resultAll += "Совпадение по email:\n" + emailResult + "\n\n"
    }
    if (namemanagerResult != 'none') {
        resultAll += "Совпадение по manager:\n" + namemanagerResult + "\n\n"
    }
    if (resultAll != '') {
        if (showAlert == true) alert(resultAll);
    } else {
        alert('Совпадений нет!');
    }
}
function ChekFhotoForDublesFunc(id1, id2){
    var count = 0;
    var templeImageCount = 0;
    var arrAllImageUser1 = [];
    var arrAllImageUser2 = [];
    function getLengthImage(text)
    {
        var t = text.split('Expires');
        var t1 = t[0].split('Content-Length:');
        return parseInt(t1[1], 10)
    }
    $.getJSON("/items/moder/images", {
        item_id : id1
    }).done(function (e)
    {
        $.getJSON("/items/moder/images", {
            item_id : id2
        }).done(function (g)
        {
            var allImageCount = e.length + g.length;
            inspectImage(e, g, allImageCount, id1, id2)
        })
    });
    function chekCountFordouble(templeImageCount, allImageCount, id1, id2)
    {
        if (templeImageCount == allImageCount)
        {
            var n1 = arrAllImageUser1.length;
            var n2 = arrAllImageUser2.length;
            for (var i = 0; i < n1; i++)
            {
                for (var j = 0; j < n2; j++)
                {
                    if (Math.abs(arrAllImageUser1[i] - arrAllImageUser2[j]) < 100)
                    {
                        $('#user1 a[href*="' + id1 + '"]').css("background-color", "rgb(255, 84, 84)");
                        $('#user2 a[href*="' + id2 + '"]').css("background-color", "rgb(255, 84, 84)")
                    }
                }
            }
        }
    }
    function inspectImage(e, g, allImageCount, id1, id2)
    {
        for (var i = 0; i < e.length; i++)
        {
            var href = 'https:' + e[i].thumb;
            var xhr = new XMLHttpRequest();
            xhr.open("HEAD", href, true);
            xhr.send(null);
            xhr.onreadystatechange=function() {
                if (xhr.readyState==4 && xhr.status==200)  {
                    var length1 = getLengthImage(xhr.responseHeaders);
                    var push = arrAllImageUser1.push(length1);
                    templeImageCount++;
                    chekCountFordouble(templeImageCount, allImageCount, id1, id2)
                }
            };
        }
        for (var i = 0; i < g.length; i++)
        {
            var href = 'https:' + g[i].thumb;
            var xhr = new XMLHttpRequest();
            xhr.open("HEAD", href, true);
            xhr.send(null);
            xhr.onreadystatechange=function() {
                if (xhr.readyState==4 && xhr.status==200)  {
                    var length1 = getLengthImage(response.responseHeaders);
                    var push = arrAllImageUser2.push(length1);
                    templeImageCount++;
                    chekCountFordouble(templeImageCount, allImageCount, id1, id2)
                }
            };
        }
    }
}
function chekItemForDubles(){
    var usr1h = $('#user1 .itemforchek a').attr("href");
    var usr2h = $('#user2 .itemforchek a').attr("href");
    var count = 0;
    var count2 = 0;
    $('#user1 .itemforcheknone').load(usr1h + ' #items .item_title', function (){
        $('#user2 .itemforcheknone').load(usr2h + ' #items .item_title', function (){
            $('.itemforcheknone').css("display", "block");
            var n1 = $('#user1 .itemforcheknone a').length;
            var n2 = $('#user2 .itemforcheknone a').length;
            for (var i = 0; i < n1; i++)
            {
                var t1 = $('#user1 .itemforcheknone a').slice(i, i + 1).text();
                for (var j = 0; j < n2; j++)
                {
                    var t2 = $('#user2 .itemforcheknone a').slice(j, j + 1).text();
                    if (t1 == t2)
                    {
                        count++;
                        $('#user1 .itemforcheknone a').slice(i, i + 1).css("background-color", "rgba(255, 153, 0, 0.5)");
                        $('#user2 .itemforcheknone a').slice(j, j + 1).css("background-color", "rgba(255, 153, 0, 0.5)");
                        var title1 = $('#user1 .itemforcheknone a').slice(i, i + 1).attr("title");
                        var title2 = $('#user2 .itemforcheknone a').slice(j, j + 1).attr("title");
                        var hr1 = $('#user1 .itemforcheknone a').slice(i, i + 1).attr("href");
                        var hr2 = $('#user2 .itemforcheknone a').slice(j, j + 1).attr("href");
                        var temle = hr1.split("/");
                        var id1 = temle[temle.length - 1];
                        var temle2 = hr2.split("/");
                        var id2 = temle2[temle2.length - 1];
                        ChekFhotoForDublesFunc(id1, id2);
                        var proz = shinglChek(title1, title2);
                        $('#user1 .itemforcheknone a').slice(i, i + 1).after('<span class="prozshingle" style="font-weight: bold;color: black;margin-left: 5px;border: 1px solid;" href="' + hr2 + '">' + proz + '%</span>');
                        $('#user2 .itemforcheknone a').slice(j, j + 1).after('<span class="prozshingle" style="font-weight: bold;color: black;margin-left: 5px;border: 1px solid;" href="' + hr1 + '">' + proz + '%</span>');
                        if (proz > 40)
                        {
                            $('#user1 .itemforcheknone a').slice(i, i + 1).next().css("background-color",
                                "rgb(255, 198, 207)");
                            $('#user2 .itemforcheknone a').slice(j, j + 1).next().css("background-color",
                                "rgb(255, 198, 207)")
                        }
                    }
                }
            }
            $('.prozshingle').click(function ()
            {
                var href = $(this).attr("href");
                window.open(href, '_blank')
            });
            var res = '';
            if (count != 0) {
                res += 'Совпало по названию: ' + count + ' объявлений!\n\n'
            }
            if (count2 != 0) {
                res += 'Совпало точных объяв: ' + count2
            }
            if (res != '') {
                alert(res)
            }
            else {
                alert('Совпадений нет!')
            }
        });
    });
}
function shinglChek(title1, title2){
    function tellMeHach(str){
        var hash = 0;
        var char;
        var str = String(str);
        if (str.length == 0) {
            return hash
        }
        for (var i = 0; i < str.length; i++) {
            char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash
        }
        return hash
    }
    var shLength = 1;
    title1 = title1.replace(/\s\S{1,3}\s/g, " ");
    title1 = title1.replace(/[\!\?\.\,]/g, "");
    title2 = title2.replace(/\s\S{1,3}\s/g, " ");
    title2 = title2.replace(/[\!\?\.\,]/g, "");
    title1 = title1.toLowerCase();
    title2 = title2.toLowerCase();
    var words1 = title1.split(" ");
    var words2 = title2.split(" ");
    var words1Length = words1.length;
    var words2Length = words2.length;
    var shinglArr1 = [];
    var shinglArr2 = [];
    var i, j, k;
    for (i = 1, k = 0; i < words1Length - shLength; i++, k++)
    {
        shinglArr1[k] = words1[i - 1] + ' ';
        for (j = i; j < i + shLength; j++) {
            shinglArr1[k] += words1[j] + ' '
        }
        shinglArr1[k] += words1[j]
    }
    for (i = 1, k = 0; i < words2Length - shLength; i++, k++)
    {
        shinglArr2[k] = words2[i - 1] + ' ';
        for (j = i; j < i + shLength; j++) {
            shinglArr2[k] += words2[j] + ' '
        }
        shinglArr2[k] += words2[j]
    }
    var hashArr1 = [];
    var hashArr2 = [];
    for (var i = 0; i < shinglArr1.length; i++) {
        hashArr1[i] = tellMeHach(shinglArr1[i])
    }
    for (var i = 0; i < shinglArr2.length; i++) {
        hashArr2[i] = tellMeHach(shinglArr2[i])
    }
    var allOperation = hashArr1.length;
    var countOper = 0;
    for (var i = 0; i < hashArr1.length; i++)
    {
        for (var j = 0; j < hashArr2.length; j++) {
            if (hashArr1[i] == hashArr2[j]) {
                countOper++;
                j = hashArr2.length;
            }
        }
    }
    return parseInt(countOper * 100 / allOperation, 10);
}


function compareButtonsListener() {
    $('.activeUserCompare').click(function () {
        var currentUser = $(this).attr('userNum');
        var id = $(this).attr('userID');

        unblockUser('activate', id);
        smartChance('Activate', currentUser);

        smartComments(currentUser, id, 'Active');
    });
    $('.activeUserItemCompare').click(function () {
        var currentUser = $(this).attr('userNum');
        var id = $(this).attr('userID');

        unblockUser('unblock', id);
        smartChance('Activate', currentUser);

        smartComments(currentUser, id, 'Active');
    });
    $('.activeUserReItemCompare').click(function () {
        var currentUser = $(this).attr('userNum');
        var id = $(this).attr('userID');

        unblockUser('unblock_relevant', id);
        smartChance('Activate', currentUser);

        smartComments(currentUser, id, 'Active');
    });
    $('.blockNes').click(function () {
        var currentUser = $(this).attr('userNum');
        var id = $(this).attr('userID');

        blockUser(id, 'BN');
        smartChance('Blocked', currentUser);

        smartComments(currentUser, id, 'Blocked');
    });
    $('.blockNesPov').click(function () {
        var currentUser = $(this).attr('userNum');
        var id = $(this).attr('userID');

        blockUser(id, 'BP');
        smartChance('Blocked', currentUser);

        smartComments(currentUser, id, 'Blocked');
    });
    $('.blockBlock').click(function () {
        var currentUser = $(this).attr('userNum');
        var id = $(this).attr('userID');

        blockUser(id, 'BB');
        smartChance('Blocked', currentUser);

        smartComments(currentUser, id, 'Blocked');
    });
    $('#texNep').click(function () {
        var id1 = $('#user1').attr('userID');
        var id2 = $('#user2').attr('userID');

        var id1Status = $('#user1 .statusforchek').text();

        if (id1Status == 'Blocked') {
            unblockUser('unblock_relevant', id1);
            commentOnUserSupport(id1, 'ТН');
            chekUserforDubles(id1, id2);
        } else alert('Учетная запись активна или удалена');
    });
    $('#spamUsers').click(function () {
        var id1 = $('#user1').attr('userID');
        var id2 = $('#user2').attr('userID');

        var id1Status = $('#user1 .statusforchek').text();

        var id1Shop = $('#user1 .actionBarIN').text();
        var id2Shop = $('#user2 .actionBarIN').text();

        if (id1Shop != 'This is Shop' && id2Shop != 'This is Shop') {
            if (id1Status == 'Active') {
                blockUser(id1, 'BN');
                chanceUser(id1, '10');
                commentOnUserSupport(id1, 'spam');
                chekUserforDubles(id1, id2);
            } else alert('Учетная запись заблокированна.');
        } else alert('Данная функция недоступна, так как одна из учетных записей со статусом Магазин');
    });
    $('#putMark').click(function () {
        var id = $('#user1').attr('userID');
        var currentStatus = $('#user1 .statusforchek').text();

        smartComments('user1', id, currentStatus);
    });
    $('#swapUsers').click(function () {
        var id1 = $('#user1').attr('userID');
        var id2 = $('#user2').attr('userID');
        var id1Status = $('#user1 .statusforchek').text();
        var id2Status = $('#user2 .statusforchek').text();

        var id1Shop = $('#user1 .actionBarIN').text();
        var id2Shop = $('#user2 .actionBarIN').text();

        if (id1Shop != 'This is Shop' && id2Shop != 'This is Shop') {
            if ((id1Status == 'Active' || id1Status == 'Unconfirmed') && (id2Status == 'Blocked' || id2Status == 'Removed')) {
                blockUser(id1, 'BN');

                if (id2Status == 'Removed') unblockUser('activate', id2);
                else unblockUser('unblock_relevant', id2);

                commentOnUserSupport(id1, 'https://adm.avito.ru/users/user/info/'+id2+' активная');
                commentOnUserSupport(id2, 'https://adm.avito.ru/users/user/info/'+id1+' заблокированная');
                chekUserforDubles(id1, id2);
            } else if ((id1Status == 'Blocked' || id1Status == 'Removed') && (id2Status == 'Active' || id2Status == 'Unconfirmed')) {
                blockUser(id2, 'BN');

                if (id1Status == 'Removed') unblockUser('activate', id1);
                else unblockUser('unblock_relevant', id1);

                commentOnUserSupport(id2, 'https://adm.avito.ru/users/user/info/'+id1+' активная');
                commentOnUserSupport(id1, 'https://adm.avito.ru/users/user/info/'+id2+' заблокированная');
                chekUserforDubles(id1, id2);
            } else alert('Статусы учетных записей одинаковые.');
        } else alert('Данная функция недоступна, так как одна из учетных записей со статусом Магазин');
    });
}

function smartComments(currentUser, currentUserID, currentStatus) {
    var secondUserStatus;
    var secondUserID;

    if (currentUser == 'user1') {
        secondUserStatus = $('#user2 .statusforchek').text();
        secondUserID = $('#user2').attr('userID');
        chekUserforDubles(currentUserID, secondUserID);
    } else {
        secondUserStatus = $('#user1 .statusforchek').text();
        secondUserID = $('#user1').attr('userID');
        chekUserforDubles(secondUserID, currentUserID);
    }

    if ((currentStatus == 'Blocked' || currentStatus == 'Removed') && (secondUserStatus == 'Blocked' || secondUserStatus == 'Removed')) {
        commentOnUserSupport(currentUserID, 'https://adm.avito.ru/users/user/info/'+secondUserID);
        commentOnUserSupport(secondUserID, 'https://adm.avito.ru/users/user/info/'+currentUserID);
    } else if ((currentStatus == 'Active' || currentStatus == 'Unconfirmed') && (secondUserStatus == 'Active' || secondUserStatus == 'Unconfirmed')) {
        commentOnUserSupport(currentUserID, 'https://adm.avito.ru/users/user/info/'+secondUserID+' до пересечений');
        commentOnUserSupport(secondUserID, 'https://adm.avito.ru/users/user/info/'+currentUserID+' до пересечений');
    } else if ((currentStatus == 'Active' || currentStatus == 'Unconfirmed') && (secondUserStatus == 'Blocked' || secondUserStatus == 'Removed')) {
        commentOnUserSupport(currentUserID, 'https://adm.avito.ru/users/user/info/'+secondUserID+' заблокированная');
        commentOnUserSupport(secondUserID, 'https://adm.avito.ru/users/user/info/'+currentUserID+' активная');
    } else if ((currentStatus == 'Blocked' || currentStatus == 'Removed') && (secondUserStatus == 'Active' || secondUserStatus == 'Unconfirmed')) {
        commentOnUserSupport(currentUserID, 'https://adm.avito.ru/users/user/info/'+secondUserID+' активная');
        commentOnUserSupport(secondUserID, 'https://adm.avito.ru/users/user/info/'+currentUserID+' заблокированная');
    }
}

function smartChance(buttonStatus, currentUser) {
    var currentUserID = $('#'+currentUser).attr('userID');
    var currentUserShop = $('#'+currentUser+' .actionBarIN').text();
    var currentUserChance = parseInt($('#'+currentUser+' .userChance').text());

    var secondUserID, secondUserStatus, secondUserShop, secondUserChance;

    if (currentUser == 'user1') {
        secondUserStatus = $('#user2 .statusforchek').text();
        secondUserID = $('#user2').attr('userID');
        secondUserShop = $('#user2 .actionBarIN').text();
        secondUserChance = parseInt($('#user2 .userChance').text());
    } else {
        secondUserStatus = $('#user1 .statusforchek').text();
        secondUserID = $('#user1').attr('userID');
        secondUserShop = $('#user1 .actionBarIN').text();
        secondUserChance = parseInt($('#user1 .userChance').text());
    }

    var maxChance = 0;
    if (currentUserChance > secondUserChance) maxChance = currentUserChance;
    else maxChance = secondUserChance;

    var poka = false;
    // var chance = 0;

    if (maxChance == 10) {
        if (buttonStatus == 'Blocked') poka = true;
        if (buttonStatus == 'Activate') {
            // chance = prompt('Вы восстановили учетную запись '+currentUserID+', хотя на одной из них стоит прекращение. Какой шанс поставить восстановленной учетной записи?', 1);


            // if (chance > 0 && chance < 11) {
            // chanceUser(currentUserID, chance);
            chanceUser(currentUserID, 1); //RK всегда первый шанс
            commentOnUserSupport(currentUserID, 'вынес(ла) из пока');
            // } else alert('Вы ввели некорректный шанс, это должна быть цифра от 1 до 10. Проставьте шанс на самой учетной записи.');
        }
    }

    //RK всегда первый шанс
    /* else if (maxChance == 9) {
     if (buttonStatus == 'Blocked') {
     poka = confirm("У одного из пользователей стоит последний шанс, оба пользователя будут заблокированны с прекращением.");
     blockUser(secondUserID, 'BN');
     }
     if (buttonStatus == 'Activate') {
     alert('Вы восстановили пользователя, хотя по регламенту ему необходимо было выписывать прекращение. Шанс останется прежним.');
     }
     } */ else {
        if (buttonStatus == 'Activate') {
            // chanceUser(currentUserID, currentUserChance+1);
            chanceUser(currentUserID, 1); //RK всегда первый шанс
        }
        if (buttonStatus == 'Blocked') {
            if (secondUserStatus == 'Active' && secondUserShop != 'This is Shop') {
                // chanceUser(secondUserID, maxChance+1);
                chanceUser(secondUserID, 1); //RK всегда первый шанс
            }
        }
    }

    if (poka == true) {
        chanceUser(currentUserID, '10');
        commentOnUserSupport(currentUserID, 'пока');
        chanceUser(secondUserID, '10');
        commentOnUserSupport(secondUserID, 'пока');
    }
}

function unblockUser(reason, id) {
    var request = new XMLHttpRequest();
    request.open("GET", 'https://adm.avito.ru/users/user/'+reason+'/'+id, true);
    request.send();
}

function blockUser(id, reason) {
    var request = new XMLHttpRequest();
    request.open("POST", 'https://adm.avito.ru/users/user/block', true);
    request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
    request.setRequestHeader("Accept", "*/*");
    request.setRequestHeader("X-Requested-With", "XMLHttpRequest");
    if (reason === 'BN') request.send('reasons%5B%5D=91&id='+id);
    else if (reason === 'BP') request.send('reasons%5B%5D=2&reasons%5B%5D=91&id='+id);
    else if (reason === 'BB') request.send('id='+id);
    else if (reason === 'MC') request.send('reasons%5B%5D=128&id='+id);
    else if (reason === 'PA') request.send('reasons%5B%5D=593&id='+id);
}

function chanceUser(id, chance) {
    var request = new XMLHttpRequest();
    request.open("POST", 'https://adm.avito.ru/users/user/save/chance', true);
    request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    request.send('chance='+chance+'&user='+id);
}

function loadComperison(itemID, currentUserID) {
    var url = 'https://adm.avito.ru/items/comparison/'+itemID;

    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.send(null);
    xhr.onreadystatechange=function() {
        if (xhr.readyState == 4) {
            $('#sh-loading-layer').hide();

            if (xhr.status == 200) {
                $('#comperison_box').detach();

                $('body').append('<div id="comperison_box" style="background: #f5f5f5;background-clip:padding-box;padding:10px;border-radius:4px;display:none;color:black;position:fixed;top:10%;margin:0 auto;overflow:auto;overflow-y:scroll;max-width:1100px;height:85%;z-index:1050;-webkit-box-shadow:0 3px 20px rgba(0, 0, 0, 0.9); -webkit-box-align: center; "></div>');
                $('#comperison_box').append('<div><a href="'+url+'" target="_blank">Item comparison</a><span id="close_comperison_box" class="pseudo-link" style="float:right;">close</span></div><br>');

                var response = xhr.responseText;
                var comperison = $(response).find('.items-table').clone();

                $(comperison).find('a').attr('target','_blank');
                $(comperison).find('td').addClass('sh-default-list');
                $(comperison).find('td').css({'background':'#eef5f7','min-width':'210px','padding':'5px', 'border-radius':'0px','box-shadow':'none'});
                $(comperison).find('td td').css({'min-width':'0'});

                $(comperison).find('th').css({'min-width':'150px','padding':'5px'});
                $(comperison).find('.pseudo-link').remove();
                $(comperison).find('.more').remove();
                $(comperison).find('[data-match-test="description"]').append('<span class="pseudo-link">еще</span>');

                comperison = compareItems(comperison);

                $('#comperison_box').append(comperison);
				
				var tableClass = '#comperison_box .comparison-table .row-user-block:last table td';
				linksOnComments(tableClass, currentUserID);
				
                var widthComperison = $('#comperison_box').width();
                var widthBody = $('body').width();
                var widthLeft = (widthBody-widthComperison)/2;

                $('#comperison_box').css({'display':'inline-block','left':widthLeft});

                $('.compareUserOnComperison').click(function () {
                    var similarUserID = $(this).attr('userID');

                    addBlock();
                    chekUserforDubles(currentUserID, similarUserID);
                });

                $('[data-match-test="description"]').click(function () {
                    $('.descr-full').toggle();
                    $('[data-match-test="description"]').find('.pseudo-link').remove();
                });

                $('.js-images-preview').on('click', function() {
                    return false;
                });
                $('.js-images-preview').click(function () {
                    var itemID = $(this).attr('name').split('m_');

                    if (!itemID) {
                        alert('Ошибка: не удалось определить ID объявления.');
                        return;
                    }

                    var imagePrev = $(this).find('.images-preview-img');
                    $(imagePrev).css('opacity', '0.4');
                    $(this).append('<span class="loading-indicator-text loading-comparison-images">Загрузка</span>');
                    loadImageForItem(itemID[1], imagePrev);

                    $('.images-preview-gallery').mouseleave(function() {
                        $('.images-preview-gallery').attr('style','display: none; position:fixed; z-index: 1080; background-color: rgba(255, 255, 255, 0.95); text-align: center; border-radius: 0; padding: 10px; border: 1px solid rgba(153, 153, 153, 0.56);');
                        $('.images-preview-gallery-list').detach();
                    });
                });

                $('#close_comperison_box').click(function() {
                    $('#comperison_box').detach();
                });

                $('.comparison-copy-item-id').click(function() {
                    var itemId = $(this).data('itemId');
                    chrome.runtime.sendMessage( { action: 'copyToClipboard', text: itemId } );
                    outTextFrame('ID объявления '+ itemId +' скопирован!');
                });
            }

            if (xhr.status >= 400) {
                setTimeout(function() {
                    alert('Ошибка: '+ xhr.status +', '+ xhr.statusText +'');
                }, 100);
            }
        }
    };

    $(document).mouseup(function(e) { // событие клика по веб-документу
        var div = $('#comperison_box'); // элемент
        var div1 = $('#check_result_user_box');
        var div2 = $('.images-preview-gallery');
        if (!div.is(e.target) && div.has(e.target).length === 0 && !div1.is(e.target) && div1.has(e.target).length === 0 && !div2.is(e.target) && div2.has(e.target).length === 0) {
            div.detach();
        }
    });
}

function compareItems(comperison) {
    var trlen = $(comperison).find('tr').length;
    var tdlen = $(comperison).find('.user-login-wrap').length;

    for (var i = 0; i < tdlen; i++) {
        var userID = $(comperison).find('.user-login-wrap').slice(i,i+1).find('a').attr('href').split('/');
        $(comperison).find('.user-login-wrap').slice(i,i+1).append('(<span class="pseudo-link compareUserOnComperison" userID="' + userID[4] + '" title="Сравнить учетные записи">&#8644</span>)');

        var itemName;
        if (i == 0) {
            itemName = $(comperison).find('.item-title').slice(0,1).text();
        } else {
            if (itemName == $(comperison).find('.item-title').slice(i,i+1).text()) {
                $(comperison).find('.item-title').slice(0,1).css('background','rgb(255, 198, 207)');
                $(comperison).find('.item-title').slice(i,i+1).css('background','rgb(255, 198, 207)');
            }
        }
    }

    for (var i = 1; i < trlen; i++) {
        var mainItem = $(comperison).find('tr').slice(i,i+1).find('td span').slice(0,1).text();
        var stopChack = $(comperison).find('tr').slice(i,i+1).find('td').slice(0,1).attr('data-match-test');
        var ismainItem = false;

        if (stopChack == 'description') break;

        for (var j = 1; j < tdlen; j++) {
            var otherItem = $(comperison).find('tr').slice(i,i+1).find('td span').slice(j,j+1).text();
            if (mainItem == otherItem) {
                $(comperison).find('tr').slice(i,i+1).find('td').slice(j,j+1).css('background','rgb(255, 198, 207)');
                ismainItem = true;
            }
        }
        if (ismainItem == true) $(comperison).find('tr').slice(i,i+1).find('td').slice(0,1).css('background','rgb(255, 198, 207)');
    }

    var itemTitles = $(comperison).find('tr .item-title');
    $(itemTitles).each(function(i, title) {
        var itemTag = $(title).find('[href^="/items/item/info"]');
        var itemId = $(itemTag).attr('href').replace(/\D/g, '');
        $(title).after('<div style="margin-top: 4px;"><button type="button" class="comparison-copy-item-id sh-default-btn ah-btn-small" data-item-id="'+ itemId +'" style="">Скопировать ID ('+ itemId +')</button></div>');
    });

    var itemImages = $(comperison).find('tr .item-image');
    $(itemImages).each(function(i, imageBlock) {
        var wrapper = $(imageBlock).find('.image-wrapper')
        $(wrapper).css({
            'display': 'inline-block',
            'line-height': '20px',
            'vertical-align': 'middle',
            'position': 'relative',
            'text-decoration': 'none',
            'width': '140px',
            'height': '105px',
            'box-sizing': 'content-box',
            'border': '1px solid rgba(128,128,128,.5)',
            'background': '#fff',
            'outline': '0',
            'overflow': 'hidden',
            'transition': 'border-color .3s linear'
        });

        $(wrapper).find('.images-preview-counters-icons').css({
            'position': 'absolute',
            'left': '0',
            'top': '0',
            'z-index': '10',
            'background-color': '#ececec',
            'color': '#333',
            'padding': '0 5px'
        });

        $(wrapper).find('.images-preview-img').css({
            'position': 'absolute',
            'left': '50%',
            'top': '50%',
            'transform': 'translate(-50%,-50%)'
        });
    });

    return comperison;
}

function loadImageForItem(itemID, imagePrev) {
    var url = 'https://adm.avito.ru/items/moder/images?item_id='+itemID;

    $('.images-preview-gallery').css('display','block');
    $('.images-preview-gallery').append('<ul class="images-preview-gallery-list img-for-'+itemID+'" style="padding-left: 0; max-height: 430px; overflow-y: auto; list-style-type: none; padding-right: 4px;"></ul>');

    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.send(null);
    xhr.onreadystatechange=function() {
        if (xhr.readyState==4) {
            if (xhr.status==200)  {
                var json = JSON.parse(xhr.responseText);

                var len = json.length;

                for (var i = 0; i < len; i++) {
                    var thumb = json[i].thumb;
                    var full = json[i].full;

                    $('.img-for-'+itemID).append('<li class="images-preview-gallery-item" style="    background-color: rgba(255, 255, 255, 0.71); margin-bottom: 4px; border-radius: 4px;"><a href="'+full+'" target="blank"><img src="'+thumb+'"></a></li>');
                }
                $('.images-preview-gallery-item:last').css('margin-bottom', '0');
                setTimeout(function() {
                    var maxw = $('.img-for-'+itemID).width();

                    var bw = $('body').width();
                    var offset = $('[name=m_'+itemID+']').offset();
                    var left = offset.left;
                    var top = offset.top - $(window).scrollTop();

                    if (maxw+left+5 >= bw) $('.images-preview-gallery').css({'top':top,'left':'auto','right':'5px','max-width':bw-5});
                    else $('.images-preview-gallery').css({'top':top,'right':'auto','left':left,'max-width':bw-left-5});
                }, 100);
            }
            $(imagePrev).css('opacity', '1');
            $('.loading-comparison-images').remove();
        }
    };
}
// Парсер комментов ----