
function usersInfoAction() {
    $('.userInfoActionButton').click(function () {
        let offset = $(this).offset();
        usersInfo($(this).attr("userid"), $(this).attr("itemid"), offset, $(this).attr("infoQuery"));
    });

    $('.userAbuseActionButton').click(function () {
        let offset = $(this).offset();
        usersAbuses($(this).attr("useridab"), $(this).attr("itemidab"), offset);
    });

    $('.userWalletActionButton').click(function () {
        let offset = $(this).offset();
        usersWallet($(this).attr("userid"), offset);
    });
}

function usersWallet(userId, offset) {
    openInfoWindow(300, offset);

    $('.userInfoMain')
        .append('<div class="ah-usersWallet" style="text-align: center; color: #2b8932; font-weight: bold">Wallet Log</div>')
        .append('<div class="ah-userTransactions"></div>');


    let href = 'http://spring.avitoadm.ru/avito/user/wallet/log';

    chrome.runtime.sendMessage({
            action: 'XMLHttpRequest',
            url: href,
            method: 'POST',
            contentType: 'application/json',
            data: userId
        },
        function(response) {
            try {
                let json = JSON.parse(response);

                if (json.length === 0) {
                    $('.ah-userTransactions').append('<div style="font-weight: bold; text-align: center">Транзакций не найдено</div>');
                    closeLoadBarInfoWindow();
                } else {
                    $('.ah-userTransactions').append('<table><thead><tr><th>Транзакции</th><th>Учетки</th></tr></thead><tbody></tbody></table>');
                    for (let row of json) {
                        let link = 'https://adm.avito.ru/items/search?user=';
                        let usersLink = '';
                        for (let userId of row.userIds) {
                            link += userId + '|';
                            usersLink += '<div><a href="https://adm.avito.ru/users/user/info/' + userId + '" target="_blank">' + userId + '</a></div>';
                        }

                        $('.ah-userTransactions tbody').append('<tr>' +
                            '<td><a href="' + link + '" target="_blank">' + row.transaction + '</a></td>' +
                            '<td>' + usersLink + '</td>' +
                            '</tr>');
                    }

                    closeLoadBarInfoWindow();
                }
            } catch (e) {
                $('.ah-userTransactions').append('<div style="font-weight: bold; text-align: center">'+response+'</div>');

                closeLoadBarInfoWindow();

                console.log(response);
                console.log(e);
            }
        }
    );
}

// Информация о пользователе
function usersInfo(id, itemid, offset, query) {
    openInfoWindow(380, offset);

    if (!query) query = '';
    beforeID = id;

    let href = "https://adm.avito.ru/users/user/info/"+id;
    let hrefitem = "https://adm.avito.ru/items/item/info/"+itemid;

    $('.userInfoMain')
        .append('<div id="nameuser" class="userInfoDiv" style="width:100%; text-align: center; color: orange; font-weight: bold;"></div>')
        .append('<div id="ah-info-break-in" show-status="false" class="ah-info-break-in ah-info-link" title="Информация о взломе"><i class="glyphicon glyphicon-resize-full"></i></div>')
        .append('<div class="ah-info-break-in-title userInfoDiv">Проверка пользователя на взлом</div>');

    if (localStorage.checkboxInfo.indexOf('1')+1) $('.userInfoMain').append('<div id="ah-info-email" class="userInfoDiv"><b>Email:</b> </div>');
    if (localStorage.checkboxInfo.indexOf('1')+1) $('.userInfoMain').append('<div id="status" class="userInfoDiv"><b>Status:</b> </div>');
    if (localStorage.checkboxInfo.indexOf('2')+1) $('.userInfoMain').append('<div id="registeredTime" class="userInfoDiv"><b>Registered:</b> </div>');
    if (localStorage.checkboxInfo.indexOf('3')+1) $('.userInfoMain').append('<div id="activeItems" class="userInfoDiv"><b>Items:</b> </div>');
    if (localStorage.checkboxInfo.indexOf('5')+1) $('.userInfoMain').append('<div id="lastIP" class="userInfoDiv"><b>Last IP:</b> </div>');
    if (localStorage.checkboxInfo.indexOf('4')+1) $('.userInfoMain').append('<div id="ipItem" class="userInfoDiv"><b>Item IP:</b> </div>');
    if (localStorage.checkboxInfo.indexOf('13')+1) $('.userInfoMain').append('<div id="startTime" class="userInfoDiv"><b>Start Time:</b> </div>');
    // Право собственности
    if (localStorage.checkboxInfo.indexOf('6')+1) $('.userInfoMain').append('<div id="proprietary" class="userInfoDiv"><b>Proprietary:</b></div>');
    if (localStorage.checkboxInfo.indexOf('7')+1) $('.userInfoMain').append('<div id="phoneHistory" class="userInfoDiv"><b>Phones:</b><br></div>');
    if (localStorage.checkboxInfo.indexOf('12')+1) $('.userInfoMain').append('<div id="yanMap" class="userInfoDiv"><b>Address:</b></div>');

    // Информация о взломе
    $('#ah-info-break-in').click(function () {
        let breakInDisplay = $(this).attr('show-status');

        if (breakInDisplay === 'false') {
            $('#status').hide('slow');
            $('#registeredTime').hide('slow');
            $('#activeItems').hide('slow');
            $('#ipItem').hide('slow');
            $('#proprietary').hide('slow');
            $('#yanMap').hide('slow');

            $('#ah-info-email').show('slow');
            $('.ah-info-history-email').show('slow');
            $('#lastIP').show('slow');
            $('.ah-info-history-ip').show('slow');
            $('#startTime').show('slow');
            $('#phoneHistory').show('slow');
            $('.ah-info-break-in-title').show('slow');

            $('.ah-info-break-in .glyphicon').removeClass('glyphicon-resize-full').addClass('glyphicon-resize-small');
            $(this).attr('show-status', 'true');
        } else {
            $('.ah-info-history-email').hide('slow');
            $('.ah-info-history-ip').hide('slow');
            $('.ah-info-break-in-title').hide('slow');

            $('#status').show('slow');
            $('#registeredTime').show('slow');
            $('#activeItems').show('slow');
            $('#ipItem').show('slow');
            $('#proprietary').show('slow');
            $('#yanMap').show('slow');
            $('#ah-info-email').show('slow');
            $('#lastIP').show('slow');
            $('#startTime').show('slow');
            $('#phoneHistory').show('slow');

            $('.ah-info-break-in .glyphicon').removeClass('glyphicon-resize-small').addClass('glyphicon-resize-full');
            $(this).attr('show-status', 'false');
        }
    });

    // ЗАПРОС НА ПОЛЬЗОВАТЕЛЯ
    let request = new XMLHttpRequest();
    request.open("GET", href, true);
    request.send(null);
    request.onreadystatechange = function() {
        if (request.readyState === 4 && request.status === 200)  {
            let ruser = request.responseText;

            let phoneList = $(ruser).find('.controls-phone');
            let email = $(ruser).find('.fakeemail-field').text();
            let region = $(ruser).find('[data-city-id]').val();
            let register = $(ruser).find('.form-group:contains(Зарегистрирован) div').text();
            let visitIpTime = $(ruser).find('.ip-info-list li:eq(0)').text().split("-")[0];
            let ip = $(ruser).find('[data-ip]:eq(0)').text();
            let status = $(ruser).find('.form-group:contains(Статус) div b').text();
            let nameuser =  $(ruser).find('.form-group:contains(Название) input').attr('value');
            let date = new Date(new Date() - 7.776e+9);
            let formatDate = (date.getDate()<10?'0':'')+date.getDate() + "/" + ((date.getMonth()+1)<10?'0':'')+(date.getMonth()+1) + "/" + date.getFullYear() + '+00:00';

            let color;
            if (status.indexOf('Active')+1) color = 'green';
            if (status.indexOf('Block')+1) color = 'red';
            if (status.indexOf('Unconfirmed')+1) color = 'orange';

            $('#ah-info-email').append('<span>'+ email + '</span> ');
            $('#nameuser').append(nameuser);
            $('#status').append('<b style="color:'+color+'">'+status+'<b>');
            $('#registeredTime').append(register);
            $('#lastIP').append(visitIpTime + '- <a href="https://adm.avito.ru/users/search?ip='+ip+'" target="_blank">'+ip+'</a> ');

            // ЗАПРОС НА ИСТОРИЮ МЫЛЬНИКА
            emailHistory('#ah-info-email', id);

            // ИСТОРИЯ IP АДРЕСА
            ipHistory('#lastIP', id, ruser);

            // ЗАПРОС НА ОБЪЯВЛЕНИЕ
            let requestitem = new XMLHttpRequest();
            requestitem.open("GET", hrefitem, true);
            requestitem.send(null);
            requestitem.onreadystatechange = function() {
                if (requestitem.readyState === 4 && requestitem.status === 200)  {
                    let ritem = requestitem.responseText;

                    let startTime = $(ritem).find('[title="Start time"]').text();
                    let ipItem = $(ritem).find('[data-ip]:eq(0)').html();
                    let categoryItem = $(ritem).find('.form-group:contains(Категория) option:selected').parents('.category').attr('label');
                    let categoryItemID = $(ritem).find('#fld_category_id option:selected').attr('value');
                    let history = $(ritem).find('a[href^="/items/search?user_id="]').attr('target', '_blank');
                    let phoneInItem = '#7' + $(ritem).find('#fld_phone').attr('value').replace(/\D/g,'').slice(-10);
                    let regionItem = $(ritem).find('#region option:selected').text();
                    let regionItemID = $(ritem).find('#region').attr('data-location-id');
                    let districtItem = $(ritem).find('#fld_district_id option:selected').text();
                    let streetItem = $(ritem).find('#flt_param_address').val();
                    // Право собственности
                    let proprietary = $(ritem).find('div.form-group:contains(Право собственности) option:selected').text();
                    let addressItem = regionItem + ", " + streetItem;
                    let firstParam = $(ritem).find('.js-component__parameters select[data-id]:eq(0)').attr('data-id');
                    let firstParamVal = $(ritem).find('.js-component__parameters select[data-id]:eq(0) option:selected').attr('value');

                    for (let i = 0; i < phoneList.length; i++) {
                        let number = $(phoneList[i]).find('input[name^="phone["]').attr("value");
                        let newNumber = '';
                        for(let j = 1; j < 8; j++) {
                            newNumber = newNumber + number[j];
                        }

                        let verify = '';
                        let verifyDate = '';

                        if ($(ruser).find('.controls-phone .i-verify').slice(i,i+1).hasClass('i-verify-checked')) {
                            verify = '<span class="verify" style="color: green;" title="Телефон верифицирован">&#10003;</span>';
                            verifyDate = $(phoneList[i]).find('.phone-verify-date').text();
                        } else verify = '<span class="verify" style="color: red;" title="Телефон не верифицирован">&#10060;</span>';

                        $('#phoneHistory').append('<div id="'+number+'" style="margin-left:10px;"></div>');
                        if (localStorage.checkboxInfo.indexOf('8')+1) $('#'+number).append('<span class="phoneInItem"></span>' + verify + ' <a href="https://adm.avito.ru/items/search?phone='+newNumber+'???&cid[]='+categoryItemID+'&query='+query+'&date='+formatDate+'+-+Now" target="_blank">'+number+'</a>');
                        if (localStorage.checkboxInfo.indexOf('9')+1) $('#'+number).append(' <a href="https://adm.avito.ru/items/search?phone='+newNumber+'???&cid[]='+categoryItemID+'&location_id[]='+regionItemID+'&query='+query+'&date='+formatDate+'+-+Now" target="_blank">city</a>');
                        if (localStorage.checkboxInfo.indexOf('10')+1) $('#'+number).append(' <a href="https://adm.avito.ru/items/search?phone='+newNumber+'???&cid[]='+categoryItemID+'&location_id[]='+regionItemID+'&is_company=2&query='+query+'&date='+formatDate+'+-+Now" target="_blank">+private</a>');
                        if (localStorage.checkboxInfo.indexOf('11')+1 && firstParam) $('#'+number).append(' <a href="https://adm.avito.ru/items/search?phone='+newNumber+'???&cid[]='+categoryItemID+'&params['+firstParam+']='+firstParamVal+'&query='+query+'&date='+formatDate+'+-+Now" target="_blank">parameter</a>');
                        if (localStorage.checkboxInfo.indexOf('14')+1) $('#'+number).append(' <a href="https://adm.avito.ru/items/search?phone='+newNumber+'???&ip='+ipItem+'&query='+query+'&date='+formatDate+'+-+Now" target="_blank">item_ip</a>');
                        if (localStorage.checkboxInfo.indexOf('15')+1) $('#'+number).append('<div class="ah-phone-verify-date" title="Дата верификации телефона">'+verifyDate+'</div>');
                    }

                    $('#startTime').append(startTime);
                    $('#activeItems').append(history);
                    $('#ipItem').append('<a href="https://adm.avito.ru/items/search?ip='+ipItem+'&cid[]='+categoryItemID+'&query='+query+'&date='+formatDate+'+-+Now" target="_blank">'+ipItem+'</a>');
                    $(phoneInItem+" .phoneInItem").append('&#9733;').attr('title', 'Номер телефона в объявлении');
                    $('#proprietary').append(' ' + proprietary);
                    $('#yanMap').append(' ' + addressItem);

                    if (categoryItem === 'Недвижимость') {
                        let bleach = $(ritem).find('a[href^="/items/item/soil"]');
                        let reasonBlock = $(ritem).find('#adminTable:contains(Блокировка учётной записи)');

                        if (bleach.length !== 0 && reasonBlock.length !== 0) $('#nameuser').after('<div style="text-align: center; color: #31b4ff; font-weight: bold;">Объявление на прозвоне</div>')
                    }

                    ymapapi(addressItem);

                    closeLoadBarInfoWindow();
                }
            };
        }
    };

}


function ipHistory(selector, id, response) {
    $(selector)
        .append('<span class="ah-info-history-ip-link ah-info-link" user-id="' + id + '" title="История ip адресов и информация о них">' +
                '<i class="glyphicon glyphicon-list-alt"></i>' +
            '</span>')
        .after('<div class="ah-info-history-ip ah-info-history"></div>');

    $('.ah-info-history-ip-link').click(function () {
        $('.ah-info-history-ip').toggle("slow");
    });

    $('.ah-info-history-ip').append('<table class="ah-info-history-ip-table ah-info-table">' +
        '<thead><tr><th>IP</th><th>Страна</th><th>Время</th></tr></thead>' +
        '<tbody></tbody>' +
        '</table>');

    let ipInfoList = $(response).find('.ip-info-list li');
    for (let i = 0; i < ipInfoList.length; ++i) {
        let ipInfo = $(ipInfoList[i]).find('.ip-info').attr('data-ip');
        let ipVisitTime = $(ipInfoList[i]).text().split("-")[0];

        $('.ah-info-history-ip-table').append('<tr>' +
                '<td><a href="https://adm.avito.ru/users/search?ip='+ipInfo+'" target="_blank">'+ipInfo+'</a></td>' +
                '<td><span ipinfo="' + ipInfo + '"></span></td>' +
                '<td>'+ipVisitTime+'</td>' +
            '</tr>');

        requestInfoIP(ipInfo);
    }
}

// ЗАПРОС НА ИСТОРИЮ МЫЛЬНИКА

function emailHistory(selector, id) {
    $(selector)
        .append('<span class="ah-info-history-email-link ah-info-link" user-id="' + id + '" title="История изменения электронного адреса">' +
                '<i class="glyphicon glyphicon-list-alt"></i>' +
            '</span>')
        .after('<div class="ah-info-history-email ah-info-history"></div>');


    $('.ah-info-history-email-link').click(function () {
        $('.ah-info-history-email').toggle("slow");
    });

    let historyUrl = 'https://adm.avito.ru/users/user/'+id+'/emails/history';
    $.ajax({
        type: 'GET',
        url: historyUrl,
        success: function(data) {
            let content = data.content;
            if (content === '') $('.ah-info-history-email').append('<span style="color: #ff7e72;">Истории изменения не найдена</span>');
            else {
                let trList = $(content).find('tbody tr');

                $('.ah-info-history-email').append('<table class="ah-info-history-email-table ah-info-table">' +
                        '<thead><tr><th>До</th><th>После</th><th>Время</th></tr></thead>' +
                        '<tbody></tbody>' +
                    '</table>');

                $('.ah-info-history-email-table').append(trList);
            }
        }
    });
}

function ymapapi(address) {
    let script = document.createElement('script');
    script.src = "https://api-maps.yandex.ru/2.1.17/?lang=ru-RU&onload=avito.ymapsReady";
    script.onload = function () {
        let script = document.createElement('script');
        script.textContent = '(' + function (address) {
            // Runs in the context of your page
            ymaps.ready(init);//Waits DOM loaded and run function
            let myMap;

            function init() {
                $('#yanMap').append('<div id="ymap"  style="width: 350px; height: 200px; border: 1px solid rgba(0,0,0,.2);"></div>');

                myMap = new ymaps.Map("ymap", {
                    center: [55.76, 37.64],
                    zoom: 10,
                    controls: []
                });

                let myGeocoder = ymaps.geocode(address);
                myGeocoder.then(function (res) {
                    // Выбираем первый результат геокодирования.
                    let firstGeoObject = res.geoObjects.get(0),
                        // Координаты геообъекта.
                        coords = firstGeoObject.geometry.getCoordinates(),
                        // Область видимости геообъекта.
                        bounds = firstGeoObject.properties.get('boundedBy');

                    firstGeoObject.options.set('preset', 'islands#darkBlueDotIconWithCaption');
                    // Получаем строку с адресом и выводим в иконке геообъекта.
                    firstGeoObject.properties.set('iconCaption', firstGeoObject.getAddressLine());

                    // Добавляем первый найденный геообъект на карту.
                    myMap.geoObjects.add(firstGeoObject);
                    // Масштабируем карту на область видимости геообъекта.
                    myMap.setBounds(bounds, {
                        // Проверяем наличие тайлов на данном масштабе.
                        checkZoomRange: true,
                        zoomMargin: 90
                    });
                });
            }

        } + ')('+ JSON.stringify(address) +')';
        document.head.appendChild(script);
    };
    document.head.appendChild(script);
}

// Жалобы на пользовтаеля
function usersAbuses(id, itemid, offset) {
    openInfoWindow(500, offset);

    beforeID = itemid;

    let href;
    if (localStorage.abusesSetting === 'true') href = "https://adm.avito.ru/abuses/search?userId="+id+"&itemId="+itemid;
    else href = "https://adm.avito.ru/abuses/search?userId="+id;

    $('.userInfoMain').append('<div id="abuseWithCom" style="display:none;"></div>');
    $('#abuseWithCom').append('<div style="width:100%; text-align: center; color: #BA68C8;"><b>Abuses</b></div>');

    $('.userInfoMain').append('<div id="abuseCount" style="display:none;"></div>');
    $('#abuseCount').append('<div style="width:100%; text-align: center; color: #BA68C8;"><b>Abuses Without Comments</b></div>');
    $('#abuseCount').append('<table id="abusesTableCount" align="center"><tr><th style="padding:3px;">Reason</th><th style="padding:3px;">Count</th></tr></table>');


    let request = new XMLHttpRequest();
    request.open("GET", href, true);
    request.send(null);
    request.onreadystatechange=function() {
        if (request.readyState===4 && request.status===200)  {
            let response = request.responseText;

            let len = $(response).find('.abuse-reasons').length;


            if (len === 0) $('.userInfoMain').append('<div style="padding:5px; font-weight:bold; text-align:center;">Жалоб нету!</div>');
            else {
                for (let i = 0; i < len; ++i) {
                    let ip = $(response).find('.list-unstyled').slice(i,i+1).find('li:eq(0) a').text().replace(/\s{2,}/g, '');
                    let reason = $(response).find('.abuse-reasons').slice(i,i+1).find('h5').text();
                    let comment = $(response).find('.abuse-reasons').slice(i,i+1).find('div').text();

                    if ($('[ip="'+ip+'"]').length === 0 && comment !== '') {
                        $('#abuseWithCom').show();
                        $('#abuseWithCom').append('<div class="abusesComment" ip="'+ip+'" style="padding:5px;"><div style="font-weight:bold;">'+reason+'</div>'+comment+'</div>');
                    }

                    if (comment === '') {
                        $('#abuseCount').show();
                        if ($('.abuseNoCom:contains('+reason+')').length === 0) {
                            $('#abusesTableCount').append('<tr class="abuseNoCom"><td style="padding:3px;">'+reason+'</td><td class="countReason" style="padding:3px; text-align:right;">1</td></tr>');
                        } else {
                            let count = parseInt($('.abuseNoCom:contains('+reason+') .countReason').text());
                            ++count;
                            $('.abuseNoCom:contains('+reason+') .countReason').text(count);
                        }
                    }
                }
            }

            closeLoadBarInfoWindow();
        }
    };
}

function openInfoWindow(width, offset) {
    $('body').append('<div class="ah-info" style="top: ' + (offset.top+24) + 'px; left: '+(offset.left-width/2)+'px;">' +
            '<div class="userInfo" style="width: '+width+'px">' +
                '<div class="notificationArrow notificationArrowBorder" style="left: 50%;"></div>' +
                '<div class="notificationArrow" style="left: 50%; border-bottom-color: white"></div>' +
                '<div id="userInfoLoadBar"></div>' +
                '<div class="userInfoMain" style="display: none;"></div>' +
            '</div>' +
        '</div>');
    loadingBar('#userInfoLoadBar', 0);
    hideElementOutClicking($('div.ah-info'));
}

function closeLoadBarInfoWindow() {
    $('#userInfoLoadBar').hide();
    $('.userInfoMain').show();
}

function getParamOnUserInfo(param) { // параметры на странице юзера
    switch (param) {
        case 'user-id':
            let userId = +$('form[action^="/users/user/edit"] [data-user-id]').attr('data-user-id');
            return userId;
            break;

        case 'e-mail':
            let userEmail = $('.js-fakeemail-field').text();
            return userEmail;
            break;

        default:
            return false;
    }

}

