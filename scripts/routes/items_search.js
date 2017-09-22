
function chooseItem() {
    $('.item-checkbox').click(function () {
        $(this).find('input[type="checkbox"]').click();
    }).on('click', '[type="checkbox"]', function (e) {
        e.stopPropagation();
    });
}



function postIP() {
    var n = $('#items tr').length;

    for (var i=1; i<n; i++) {
        var id = $('#items tr').slice(i,i+1).attr("data-id");

        loadItemInfo(id, i);
    }
}

function loadItemInfo(id, i) {
    var url = 'https://adm.avito.ru/items/item/info/'+id;

    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.send(null);
    xhr.onreadystatechange=function() {
        if (xhr.readyState === 4 && xhr.status === 200)  {
            var response = xhr.responseText;
            var ip = $(response).find('[data-ip]').attr('data-ip');
            // console.log(ip);

            $('#items tr').slice(i,i+1).find('td:eq(3) a:last').after('<br><b>IP</b> <a class="ipLinks" href="https://adm.avito.ru/items/search?ip='+ip+'" target="_blank">'+ip+'</a>');
        }
    }
}

function userInfoForPost() {
    const itemList = $('.b-item');

    for (let i = 0; i < itemList.length; ++i) {

        var id = $(itemList[i]).parents('tr').find('.item_user_login').attr('href').split('/')[4];

        var itemid = $(itemList[i]).attr("id").replace('desc_', '');
        var category = $(itemList[i]).parents('tr').find('[data-category]').attr("data-category");
        var params = $(itemList[i]).parents('tr').attr("data-params-map");
        params = params ? params.replace(/"/g, "&quot;") : '{}';
        var cityItem = $(itemList[i]).parents('tr').attr("data-location");

        if (scriptGlobal === 'moderator') {
            $(itemList[i])
                .prepend('<span class="userInfoActionButton" cityItem="'+cityItem+'" userid="'+id+'" itemid="'+itemid+'" data-category="'+category+'" data-params-map="'+params+'" style="margin-left: 10px; float: right;">Info</span>')
                .prepend('<span class="userAbuseActionButton" useridab="'+id+'" itemidab="'+itemid+'" style="margin-left: 10px; float: right">Abuses</span>');
        }

        $(itemList[i])
            .prepend('<span class="userWalletActionButton" userid="'+id+'" itemid="'+itemid+'" style="margin-left: 10px; float: right">WL</span>');

    }

    usersInfoAction();
}

// МАССОВАЯ БЛОКИРОВКА ПОЛЬЗОВАТЕЛЕЙ


function postBlockUsers() {
    if (!sessionStorage.postBlockID) sessionStorage.postBlockID = '';

    addActionButton();
    addChooseButton();
    usersListCheck();
}


function addChooseButton() {
    const loginList = $('.item_user_login');

    for (let i = 0; i < loginList.length; ++i) {
        let id = $(loginList[i]).attr('href').split('/')[4];

        $(loginList[i]).parent().css('padding', '5px');
        $(loginList[i]).parent().after('<hr style="margin-bottom: 10px; margin-top: 0">');
        $(loginList[i]).parent().append('<input type="button" userid="' + id + '" class="postBlockButton postPlus" value="+">');
        $(loginList[i]).parents('tr').find('.description-cell').append('<div class="userAgent"><b>User agent:</b> <span userAgent="'+id+'"></span></div>');
    }

    clickChooseButton();
}

// МАССОВАЯ БЛОКИРОВКА ПОЛЬЗОВАТЕЛЕЙ


// Отправка письма пользователю о взломе и смена пароля
function smartSNP(id) {
    $('.pull-right').append('<span id="isEmailChange" class="wheelSNP" title="Информирует о смене email:\n- СЕРЫЙ - email не был изменен\n- ЗЕЛЕНЫЙ - на учетной записи уже менялся email адрес">EML</span>' +
        '<span id="isUseSNP" class="wheelSNP" title="Информирует о смене пароля:\n- СЕРЫЙ - пароль (snp) был отправлен менее 3 раз\n- КРАСНЫЙ - пароль (snp) был отправлено 3 и более раз">SNP</span>' +
        '<input id="snp" type="button" class="btn btn-primary" value="SNP" title="Отправляет пользователю новый пароль, а также уведомляет его о том, что данная учетная запись была взломана" style="margin-left: 5px;" disabled/>')

    var href = 'https://adm.avito.ru/users/user/info/'+id;
    var cancelLoadSNP = 0;

    var request = new XMLHttpRequest();
    request.open("GET", href, true);
    request.send(null);
    request.onreadystatechange=function() {
        if (request.readyState == 4 && request.status == 200) {
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

    var hrefEmailHistory = 'https://adm.avito.ru/users/user/'+id+'/emails/history';

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

        var xhrSendSNP = new XMLHttpRequest();
        xhrSendSNP.open("POST", 'https://adm.avito.ru/users/user/edit/'+id+'/password', true);
        xhrSendSNP.send(null);
        xhrSendSNP.onreadystatechange=function() {
            if (xhrSendSNP.readyState == 4 && xhrSendSNP.status == 200) {
                console.log(xhrSendSNP.responseText);
            }
        };

        chrome.runtime.sendMessage({
            action: 'XMLHttpRequest',
            method: 'POST',
            url: 'http://avitoadm.ru/journal/include/php/load/create_ticket_avito_adm.php',
            data: 'email='+email+'&name='+name,
        }, function(response) {
            console.log(response);
        });

        commentOnUserModer(id, '#SNP Отправил(а) новый пароль пользователю и уведомление о взломе');
        outTextFrame('Пользователю отправлен новый пароль и уведомление о взломе');
    });
}

// поиск информ агентств +++
function searchInform() {
	var table = $('#items');
	var tableRows = $(table).find('tr[data-id]');
	addSearchInformTogglers();
	
	$(tableRows).each(function(i, row) {
		var descrBlock = $(row).find('.description-cell');
		var priceBlock = $(descrBlock).find('.item-price');
		var categoryBlock = $(descrBlock).find('span');
		var priceText = $(priceBlock).text();
		var categoryText = $(categoryBlock).text().toLowerCase();
		var locationText = $(descrBlock).find('p:last').text().split(',')[0];
		var itemTitleText = $(descrBlock).find('.item_title').text();
		
		var categoryPattern = /(дома, дачи, коттеджи \/ сдам)|(квартиры \/ сдам)|(комнаты \/ сдам)/i;
		if (priceText.indexOf('месяц') == -1 || !categoryPattern.test(categoryText)) {
				return;
			}
		
		var locationId = $(this).attr('data-location');
		var price = +priceText.split('руб.')[0].replace(/\s/g, '');
		
		var isPriceMin = false; // цена из док-та минималок
		if (price < 1000) {
			price = getLocationMinPrice(locationText, itemTitleText);
			isPriceMin = true;
		}
		
		var price_min, price_max;
		if (!isFinite(price) || !price) {
			price_min = '';
			price_max = '';
		} else {
			price_min = price - 1000;
			price_max = price + 1000;
		}
		
		// последние 30 дней +++
		var thirtyDaysAgo = new Date(new Date().setDate(new Date().getDate() - 29));
		var dateStart = thirtyDaysAgo.getDate() +'/'+ (thirtyDaysAgo.getMonth() + 1) +'/'+ thirtyDaysAgo.getFullYear();
		var checkDateStart = dateStart.split('/');
		var checkedDateStart = '';
		checkDateStart.forEach(function(item) {
			if (item.length == 1) {
				item = '0'+ item;
			}
			checkedDateStart += item + '/';
		});
		checkedDateStart = checkedDateStart.slice(0, -1);
		
		dateStart = checkedDateStart;
		
		var today = new Date();
		var dateEnd = today.getDate() +'/'+ (today.getMonth() + 1) +'/'+ today.getFullYear();
		var checkDateEnd = dateEnd.split('/');
		var checkedDateEnd = '';
		checkDateEnd.forEach(function(item) {
			if (item.length == 1) {
				item = '0'+ item;
			}
			checkedDateEnd += item + '/';
		});
		checkedDateEnd = checkedDateEnd.slice(0, -1);
		dateEnd = checkedDateEnd;
		
		var date = dateStart +' 00:00 - '+ dateEnd+ ' 23:59';
		date = encodeURIComponent(date);
		// последние 30 дней ---
		
		var s_type = 2; // не магазин
		var is_images = 1; // с фото
		var itemStatus = 'blocked';
		
		var queryStringParams = {};
		if (~categoryText.indexOf('дома, дачи, коттеджи') ) {
			queryStringParams = {
				'cid[]': 25, // айди категории
				'params[202]': 1065,
				'params[528]': 5476,
				'location_id[]': locationId,
				'price_min': price_min,
				'price_max': price_max,
				'date': date,
				's_type': s_type,
				'is_images': is_images,
				'status[]': itemStatus
			}
		}
		if (~categoryText.indexOf('квартиры') ) {
			queryStringParams = {
				'cid[]': 24,
				'params[201]': 1060,
				'params[504]': 5256,
				'location_id[]': locationId,
				'price_min': price_min,
				'price_max': price_max,
				'date': date,
				's_type': s_type,
				'is_images': is_images,
				'status[]': itemStatus
			}
		}
		if (~categoryText.indexOf('комнаты') ) {
			if (!isPriceMin) {
				price_min = price - 500;
				price_max = price + 500;
			}
			
			queryStringParams = {
				'cid[]': 23,
				'params[200]': 1055,
				'params[596]': 6203,
				'location_id[]': locationId,
				'price_min': price_min,
				'price_max': price_max,
				'date': date,
				's_type': s_type,
				'is_images': is_images,
				'status[]': itemStatus
			}
		}
		
		var href = getSearchInformHref(queryStringParams);
		
		$(descrBlock).find('.it_tiles').append('<a target="_blank" href="'+ href +'" class="" style="">Поиск информ</a>');
		
		// console.log($(this).data('id'), price, isPriceMin);
	});
}

function getLocationMinPrice(locationText, itemTitleText) {
	var minPricesStr = '[{"location":"Абакан","roomPrice":null,"oneRoomedPrice":9000,"twoRoomedPrice":null}, {"location":"Альметьевск","roomPrice":null,"oneRoomedPrice":9000,"twoRoomedPrice":null}, {"location":"Архангельск","roomPrice":null,"oneRoomedPrice":10000,"twoRoomedPrice":null}, {"location":"Астрахань","roomPrice":null,"oneRoomedPrice":10000,"twoRoomedPrice":null}, {"location":"Ачинск","roomPrice":null,"oneRoomedPrice":10000,"twoRoomedPrice":null}, {"location":"Балаково","roomPrice":null,"oneRoomedPrice":6000,"twoRoomedPrice":null}, {"location":"Балашиха","roomPrice":9000,"oneRoomedPrice":18000,"twoRoomedPrice":null}, {"location":"Балашиха","roomPrice":null,"oneRoomedPrice":18000,"twoRoomedPrice":null}, {"location":"Барнаул","roomPrice":4000,"oneRoomedPrice":8000,"twoRoomedPrice":null}, {"location":"Батайск","roomPrice":null,"oneRoomedPrice":9000,"twoRoomedPrice":null}, {"location":"Белгород","roomPrice":null,"oneRoomedPrice":10000,"twoRoomedPrice":null}, {"location":"Бердск","roomPrice":null,"oneRoomedPrice":9000,"twoRoomedPrice":null}, {"location":"Бийск","roomPrice":null,"oneRoomedPrice":5000,"twoRoomedPrice":null}, {"location":"Благовещенск","roomPrice":null,"oneRoomedPrice":9000,"twoRoomedPrice":null}, {"location":"Бор","roomPrice":null,"oneRoomedPrice":10000,"twoRoomedPrice":null}, {"location":"Братск","roomPrice":null,"oneRoomedPrice":7000,"twoRoomedPrice":null}, {"location":"Брянск","roomPrice":null,"oneRoomedPrice":9000,"twoRoomedPrice":null}, {"location":"Брянск","roomPrice":null,"oneRoomedPrice":9000,"twoRoomedPrice":null}, {"location":"Великий Новгород","roomPrice":null,"oneRoomedPrice":9000,"twoRoomedPrice":null}, {"location":"Владивосток","roomPrice":null,"oneRoomedPrice":13000,"twoRoomedPrice":null}, {"location":"Владикавказ","roomPrice":null,"oneRoomedPrice":10000,"twoRoomedPrice":null}, {"location":"Владимир","roomPrice":null,"oneRoomedPrice":10000,"twoRoomedPrice":null}, {"location":"Волгоград","roomPrice":4000,"oneRoomedPrice":8000,"twoRoomedPrice":null}, {"location":"Волгодонск","roomPrice":null,"oneRoomedPrice":7000,"twoRoomedPrice":null}, {"location":"Волжский","roomPrice":null,"oneRoomedPrice":7000,"twoRoomedPrice":null}, {"location":"Вологда","roomPrice":null,"oneRoomedPrice":8000,"twoRoomedPrice":null}, {"location":"Воронеж","roomPrice":3500,"oneRoomedPrice":7000,"twoRoomedPrice":null}, {"location":"Гатчина","roomPrice":null,"oneRoomedPrice":8000,"twoRoomedPrice":null}, {"location":"Дзержинский","roomPrice":9000,"oneRoomedPrice":18000,"twoRoomedPrice":null}, {"location":"Долгопрудный","roomPrice":10000,"oneRoomedPrice":20000,"twoRoomedPrice":null}, {"location":"Домодедово","roomPrice":9500,"oneRoomedPrice":19000,"twoRoomedPrice":null}, {"location":"Екатеринбург","roomPrice":5000,"oneRoomedPrice":10000,"twoRoomedPrice":null}, {"location":"Ессентуки","roomPrice":null,"oneRoomedPrice":8000,"twoRoomedPrice":null}, {"location":"Жуковский","roomPrice":10000,"oneRoomedPrice":20000,"twoRoomedPrice":null}, {"location":"Звенигород","roomPrice":7000,"oneRoomedPrice":14000,"twoRoomedPrice":null}, {"location":"Иваново","roomPrice":null,"oneRoomedPrice":9000,"twoRoomedPrice":null}, {"location":"Ижевск","roomPrice":4000,"oneRoomedPrice":8000,"twoRoomedPrice":null}, {"location":"Иркутск","roomPrice":6500,"oneRoomedPrice":13000,"twoRoomedPrice":null}, {"location":"Йошкар-Ола","roomPrice":null,"oneRoomedPrice":9000,"twoRoomedPrice":null}, {"location":"Казань","roomPrice":5000,"oneRoomedPrice":10000,"twoRoomedPrice":null}, {"location":"Калининград","roomPrice":6000,"oneRoomedPrice":12000,"twoRoomedPrice":null}, {"location":"Калуга","roomPrice":null,"oneRoomedPrice":13000,"twoRoomedPrice":null}, {"location":"Каспийск","roomPrice":null,"oneRoomedPrice":12000,"twoRoomedPrice":null}, {"location":"Кемерово","roomPrice":4500,"oneRoomedPrice":9000,"twoRoomedPrice":null}, {"location":"Киров","roomPrice":4000,"oneRoomedPrice":8000,"twoRoomedPrice":null}, {"location":"Королёв","roomPrice":9000,"oneRoomedPrice":18000,"twoRoomedPrice":null}, {"location":"Кострома","roomPrice":4000,"oneRoomedPrice":8000,"twoRoomedPrice":null}, {"location":"Краснодар","roomPrice":5000,"oneRoomedPrice":10000,"twoRoomedPrice":null}, {"location":"Красноярск","roomPrice":5000,"oneRoomedPrice":12000,"twoRoomedPrice":null}, {"location":"Кстово","roomPrice":5000,"oneRoomedPrice":10000,"twoRoomedPrice":null}, {"location":"Курган","roomPrice":4000,"oneRoomedPrice":8000,"twoRoomedPrice":null}, {"location":"Курск","roomPrice":3000,"oneRoomedPrice":6000,"twoRoomedPrice":null}, {"location":"Липецк","roomPrice":4000,"oneRoomedPrice":8000,"twoRoomedPrice":null}, {"location":"Люберцы","roomPrice":11000,"oneRoomedPrice":22000,"twoRoomedPrice":null}, {"location":"Магнитогорск","roomPrice":3500,"oneRoomedPrice":7000,"twoRoomedPrice":null}, {"location":"Майкоп","roomPrice":3500,"oneRoomedPrice":7000,"twoRoomedPrice":null}, {"location":"Махачкала","roomPrice":4000,"oneRoomedPrice":8000,"twoRoomedPrice":null}, {"location":"Миасс","roomPrice":3500,"oneRoomedPrice":7000,"twoRoomedPrice":null}, {"location":"Москва","roomPrice":15000,"oneRoomedPrice":30000,"twoRoomedPrice":35000}, {"location":"Мурманск","roomPrice":6500,"oneRoomedPrice":13000,"twoRoomedPrice":null}, {"location":"Мытищи","roomPrice":9000,"oneRoomedPrice":18000,"twoRoomedPrice":null}, {"location":"Набережные Челны","roomPrice":4000,"oneRoomedPrice":8000,"twoRoomedPrice":null}, {"location":"Нальчик","roomPrice":4000,"oneRoomedPrice":8000,"twoRoomedPrice":null}, {"location":"Нефтекамск","roomPrice":4250,"oneRoomedPrice":8500,"twoRoomedPrice":null}, {"location":"Нефтеюганск","roomPrice":7500,"oneRoomedPrice":15000,"twoRoomedPrice":null}, {"location":"Нижнекамск","roomPrice":2500,"oneRoomedPrice":5000,"twoRoomedPrice":null}, {"location":"Нижний Новгород","roomPrice":4000,"oneRoomedPrice":10000,"twoRoomedPrice":null}, {"location":"Нижний Тагил","roomPrice":4000,"oneRoomedPrice":8000,"twoRoomedPrice":null}, {"location":"Новоалтайск","roomPrice":4500,"oneRoomedPrice":9000,"twoRoomedPrice":null}, {"location":"Новокузнецк","roomPrice":4000,"oneRoomedPrice":8000,"twoRoomedPrice":null}, {"location":"Новокуйбышевск","roomPrice":4000,"oneRoomedPrice":8000,"twoRoomedPrice":null}, {"location":"Новороссийск","roomPrice":6000,"oneRoomedPrice":12000,"twoRoomedPrice":null}, {"location":"Новосибирск","roomPrice":6000,"oneRoomedPrice":11000,"twoRoomedPrice":14000}, {"location":"Новочеркасск","roomPrice":4000,"oneRoomedPrice":8000,"twoRoomedPrice":null}, {"location":"Норильск","roomPrice":4500,"oneRoomedPrice":9000,"twoRoomedPrice":null}, {"location":"Обнинск","roomPrice":7500,"oneRoomedPrice":15000,"twoRoomedPrice":null}, {"location":"Одинцово","roomPrice":11000,"oneRoomedPrice":22000,"twoRoomedPrice":null}, {"location":"Октябрьский","roomPrice":4500,"oneRoomedPrice":9000,"twoRoomedPrice":null}, {"location":"Омск","roomPrice":4000,"oneRoomedPrice":8000,"twoRoomedPrice":null}, {"location":"Орел","roomPrice":3500,"oneRoomedPrice":7000,"twoRoomedPrice":null}, {"location":"Оренбург","roomPrice":4500,"oneRoomedPrice":9000,"twoRoomedPrice":null}, {"location":"Орехово-Зуево","roomPrice":5000,"oneRoomedPrice":10000,"twoRoomedPrice":null}, {"location":"Пенза","roomPrice":4000,"oneRoomedPrice":8000,"twoRoomedPrice":null}, {"location":"Пермь","roomPrice":4000,"oneRoomedPrice":8000,"twoRoomedPrice":10000}, {"location":"Петрозаводск","roomPrice":3750,"oneRoomedPrice":7500,"twoRoomedPrice":null}, {"location":"Петропавловск-Камчатский","roomPrice":7000,"oneRoomedPrice":14000,"twoRoomedPrice":null}, {"location":"Подольск","roomPrice":8000,"oneRoomedPrice":16000,"twoRoomedPrice":null}, {"location":"Псков","roomPrice":4000,"oneRoomedPrice":8000,"twoRoomedPrice":null}, {"location":"Пятигорск","roomPrice":4000,"oneRoomedPrice":8000,"twoRoomedPrice":null}, {"location":"Реутов","roomPrice":10500,"oneRoomedPrice":21000,"twoRoomedPrice":null}, {"location":"Ростов-на-Дону","roomPrice":5500,"oneRoomedPrice":11000,"twoRoomedPrice":null}, {"location":"Рыбинск","roomPrice":3500,"oneRoomedPrice":7000,"twoRoomedPrice":null}, {"location":"Рязань","roomPrice":5000,"oneRoomedPrice":10000,"twoRoomedPrice":null}, {"location":"Салават","roomPrice":4500,"oneRoomedPrice":9000,"twoRoomedPrice":null}, {"location":"Самара","roomPrice":4000,"oneRoomedPrice":10000,"twoRoomedPrice":null}, {"location":"Санкт-Петербург","roomPrice":10000,"oneRoomedPrice":15000,"twoRoomedPrice":22000}, {"location":"Саранск","roomPrice":4000,"oneRoomedPrice":8000,"twoRoomedPrice":null}, {"location":"Саратов","roomPrice":4000,"oneRoomedPrice":8000,"twoRoomedPrice":10000}, {"location":"Севастополь","roomPrice":7500,"oneRoomedPrice":15000,"twoRoomedPrice":null}, {"location":"Симферополь","roomPrice":7000,"oneRoomedPrice":14000,"twoRoomedPrice":null}, {"location":"Смоленск","roomPrice":4500,"oneRoomedPrice":9000,"twoRoomedPrice":null}, {"location":"Сочи","roomPrice":6000,"oneRoomedPrice":12000,"twoRoomedPrice":null}, {"location":"Ставрополь","roomPrice":4500,"oneRoomedPrice":9000,"twoRoomedPrice":null}, {"location":"Старый Оскол","roomPrice":4000,"oneRoomedPrice":8000,"twoRoomedPrice":null}, {"location":"Стерлитамак","roomPrice":3750,"oneRoomedPrice":7500,"twoRoomedPrice":null}, {"location":"Сургут","roomPrice":8000,"oneRoomedPrice":16000,"twoRoomedPrice":null}, {"location":"Сыктывкар","roomPrice":6000,"oneRoomedPrice":12000,"twoRoomedPrice":null}, {"location":"Таганрог","roomPrice":3000,"oneRoomedPrice":6000,"twoRoomedPrice":null}, {"location":"Тамбов","roomPrice":4000,"oneRoomedPrice":8000,"twoRoomedPrice":null}, {"location":"Тверь","roomPrice":5000,"oneRoomedPrice":10000,"twoRoomedPrice":null}, {"location":"Тольятти","roomPrice":4500,"oneRoomedPrice":9000,"twoRoomedPrice":null}, {"location":"Томск","roomPrice":4000,"oneRoomedPrice":8000,"twoRoomedPrice":null}, {"location":"Тула","roomPrice":4500,"oneRoomedPrice":9000,"twoRoomedPrice":null}, {"location":"Тюмень","roomPrice":5000,"oneRoomedPrice":10000,"twoRoomedPrice":null}, {"location":"Улан-Удэ","roomPrice":5000,"oneRoomedPrice":10000,"twoRoomedPrice":null}, {"location":"Ульяновск","roomPrice":4000,"oneRoomedPrice":8000,"twoRoomedPrice":null}, {"location":"Уфа","roomPrice":6000,"oneRoomedPrice":12000,"twoRoomedPrice":null}, {"location":"Хабаровск","roomPrice":7000,"oneRoomedPrice":15000,"twoRoomedPrice":null}, {"location":"Химки","roomPrice":11000,"oneRoomedPrice":22000,"twoRoomedPrice":null}, {"location":"Челябинск","roomPrice":5500,"oneRoomedPrice":11000,"twoRoomedPrice":12000}, {"location":"Череповец","roomPrice":3500,"oneRoomedPrice":7000,"twoRoomedPrice":null}, {"location":"Черкесск","roomPrice":4000,"oneRoomedPrice":8000,"twoRoomedPrice":null}, {"location":"Чита","roomPrice":5500,"oneRoomedPrice":11000,"twoRoomedPrice":null}, {"location":"Энгельс","roomPrice":3500,"oneRoomedPrice":7000,"twoRoomedPrice":null}, {"location":"Ярославль","roomPrice":5000,"oneRoomedPrice":10000,"twoRoomedPrice":null}]';
	
	var minPricesArr = JSON.parse(minPricesStr);
	
	// сопоставление ключа из таблицы с тайтлом айтема
	var roomKey = null;
	if (~itemTitleText.indexOf('Комната')) {
		roomKey = 'roomPrice';
	}
	if (~itemTitleText.indexOf('1-к квартира')) {
		roomKey = 'oneRoomedPrice';
	}
	if (~itemTitleText.indexOf('2-к квартира')) {
		roomKey = 'twoRoomedPrice';
	}
	if (!roomKey) return false;
	
	// проверка города
	var curLocationArr = minPricesArr.filter(function(item) {
		return item.location == locationText;
	});
	if (!curLocationArr.length) return false;
	
	// проверка цены
	var locationObj = curLocationArr[0];
	if (!locationObj[roomKey]) {
		return false;
	} else {
		return locationObj[roomKey];
	}
}

function getSearchInformHref(queryStringParams) {
	var query = '';
	for (var key in queryStringParams) {
		query += encodeURIComponent(key) +'='+ queryStringParams[key] +'&';
	}
	// console.log(query);
	var href = 'https://adm.avito.ru/items/search?'+ query;
	href += 'search_inform_link&search_inform_location_id='+ queryStringParams['location_id[]'];
	
	return href;
}

function addSearchInformTogglers() {
	var url = window.location.href;
	
	if (url.indexOf('search_inform_link') == -1) return;
	
	var formBlock = $('#itemsearchform');
	var rowBlock = $(formBlock).find('.form-row:eq(1)');
	$(rowBlock).append('<div class="btn-group"><button type="button" class="btn btn-primary sh-search-inform-toggler" style="outline: none;" id="search-inform-blocked">Блокированные</button><button type="button" class="btn btn-primary sh-search-inform-toggler" style="outline: none;" id="search-inform-inp">АВ 97-100</button></div><div style="display: none;"><input type="hidden" name="search_inform_link" value=""></div>');
	
	var btnBlocked = $('#search-inform-blocked');
	var btnInp = $('#search-inform-inp');
	
	if (~url.indexOf('status%5B%5D=blocked')) {
		$(btnBlocked).addClass('sh-active-btn');
	}
	if (~url.indexOf('block_id%5B%5D=256') 
		&& ~url.indexOf('percent_min=97') 
		&& ~url.indexOf('percent_max=100')) {
		
		$(btnInp).addClass('sh-active-btn');
	}
	
	var blockedInpTogglerBtns = $('#search-inform-blocked, #search-inform-inp');
	
	// переключатель области +++
	var regionSelect = $('#region');
	var regionSelectParent = $(regionSelect).parent();
	var globalLocationId = url.match(/&search_inform_location_id=\d+/g)[0].split('=')[1];

	var optionSelected = $(regionSelect).find('option:selected');
	var optionSelectedIndex;
	if (!$(optionSelected).length) {
		optionSelectedIndex = -1;
	} else {
		optionSelectedIndex = $(optionSelected)[0].index;
	}
	
	var optionSelectedText = $(optionSelected).text();
	var optionSelectedPattern = /(московская|ленинградская) область/i;
	var selectedLocationId = $(regionSelect).data('locationId');
	
	var regionOpt = $(regionSelect).find('option:eq(2)');
	if (selectedLocationId == 637640 || selectedLocationId == 653240) {
		regionOpt = $(regionSelect).find('option:eq(3)');
	}
	var locationId = $(regionOpt).val();
	
	$(regionSelectParent).find('.multiselect-toggle').after('<button type="button" class="btn btn-primary" id="search-inform-region-toggler" style="display: none;"><i class="glyphicon glyphicon-transfer" style="top: 3px;"></i> Регион</button><div style="display: none;"><input type="hidden" name="search_inform_location_id" value="'+ globalLocationId +'"></div>');
	var regionTogglerBtn = $('#search-inform-region-toggler');
	
	if ( (optionSelectedIndex == 2 
		&& selectedLocationId != 637640 
		&& selectedLocationId != 653240) 
		|| optionSelectedPattern.test(optionSelectedText) ) {
			$(regionTogglerBtn).html('<i class="glyphicon glyphicon-transfer" style="top: 3px;"></i> Город');
			locationId = $(regionTogglerBtn).next().find('[name="search_inform_location_id"]').val();
	}
	
	if (optionSelectedIndex != -1) {
		$(regionTogglerBtn).show();
	}
	// переключатель области ---
	
	// обработчики
	var newUrl;
	$(blockedInpTogglerBtns).click(function() {
		var isPressed = $(this).hasClass('sh-active-btn');
		var btn = $(this).attr('id');
		if (isPressed) {
			switch (btn) {
				case 'search-inform-blocked':
					newUrl = url.replace(/&status%5B%5D=blocked/, '');
					break;
					
				case 'search-inform-inp':
					newUrl = url.replace(/(block_id%5B%5D=256)|(percent_min=97)|(percent_max=100)/g, '');
					break;
			}
		} else {
			switch (btn) {
				case 'search-inform-blocked':
					newUrl = url.replace(/(block_id%5B%5D=256)|(percent_min=97)|(percent_max=100)/g, '');
					newUrl += '&status%5B%5D=blocked';
					break;
					
				case 'search-inform-inp':
					newUrl = url.replace(/&status%5B%5D=blocked/, '');
					newUrl += '&block_id%5B%5D=256&percent_min=97&percent_max=100';
					break;
			}
		}
		
		newUrl = newUrl.replace(/&{2,}/g, '&');
		window.location.assign(newUrl);
		// $('#sh-loading-layer').show();
	});
	
	$(regionTogglerBtn).click(function() {
		if (!locationId) return;
		newUrl = url.replace(/&location_id%5B%5D=\d+/g, '');
		newUrl += '&location_id%5B%5D='+ locationId;
		window.location.assign(newUrl);
		// $('#sh-loading-layer').show();
	});
}
// поиск информ агентств ---

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
					'<hr>' +
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