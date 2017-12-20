let version = chrome.runtime.getManifest().version;
let scriptList = [];
let userGlobalInfo;
let page = 'error';

$(function() {
    cookieInfo();
    loadingBar();
});

function cookieInfo() {
    chrome.cookies.get({'url': 'https://adm.avito.ru/', 'name': 'adm_username'}, function(cookie) {
        if (cookie) {
            console.log('You login to adm.avito.ru as '+cookie.value);

            userInfo(cookie.value);
        } else {
            console.log('You not login in adm.avito.ru');

            userInfo('');
        }
    });
}


function userInfo(username) {
    let table = {
        username: username
    };

    let jsonTable = JSON.stringify(table);

    let xhr = new XMLHttpRequest();
    xhr.open('POST', 'http://avitoadm.ru/journal/include/php/loginCheckExt.php', true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.send("param="+jsonTable);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
			if (xhr.status === 200) {
                let json = JSON.parse(xhr.responseText);

                console.log(json);

                if (json.adm_login === false && json.login === false) {
                    errorPage('logout');
                    chrome.storage.local.set({'user': 'none'});
                } else {
                    if (json.login === true) {
                        page = 'login';
                    } else {
                        page = 'main';
                    }

                    if (json.user === false) {
                        chrome.storage.local.set({'user': 'user does not exist'});

                        errorPage('user does not exist');
                    } else {
                        userGlobalInfo = json.user;

                        chrome.storage.local.set({'user': json.user});

                        createScriptList();
                        choosePage();
                    }
                }
			}
			
			if (xhr.status >= 400) {
				switch (xhr.status) {
					case 403: 
						errorPage('403');
						break;
					
					case 500: 
						errorPage('500');
						break;
					
					default: 
						errorPage('>=400', xhr.status);
				}
			}
		}
    };
}

function createScriptList() {
	if (userGlobalInfo.division_name === 'Moderator') {
		
		scriptList = ['moderator'];
	} else if (userGlobalInfo.division_name === 'Support') {
		
		scriptList = ['support', 'moderator'];
	} else if (userGlobalInfo.division_name === 'Intern') {
		
		scriptList = ['support', 'moderator', 'intern'];
	} else if (userGlobalInfo.division_name === 'Traffic') {
		
		scriptList = ['traffic'];
	} else if (userGlobalInfo.division_name === 'SMM') {

        scriptList = ['smm'];
    } else if (userGlobalInfo.division_name === 'InfoDoc') {

        scriptList = ['infoDoc'];
    } else {
		
		scriptList = ['support','moderator','intern','traffic','smm', 'infoDoc'];
	}

    if (!localStorage.script || scriptList.indexOf(localStorage.script) === -1) {
        localStorage.scriptStatus = 'off';
        localStorage.script = scriptList[0];
        chrome.storage.local.set({'script': 'none'});
    }
}


function choosePage() {
    if (page === 'main') mainPage();
    if (page === 'login') loginPage();
}

// ОСНОВНАЯ СТРАНИЦА

function mainPage() {
    pageGenerator(
		'Admin.Helper',
		mainButtonGenerator(),
		'',
		'Удачного рабочего дня, '+userGlobalInfo.name+'!'
	);
}


function mainButtonGenerator() {
    let html = '';

    let script = localStorage.script;

    let name = script.charAt(0).toUpperCase() + script.substr(1);
    let chooseScriptBtn = (scriptList.length > 1) ? '<span class="script-group horizontal" id="choose-scripts"><i class="fa fa-list fa-3x" aria-hidden="true" style="margin-top: 6px; font-size: 28px;"></i></span>' : '';

    html += '<span class="avito-logo script-group horizontal">' +
                '<img id="avitoLogo" src="image/logo_white.png" style="">' +
            '</span>' +
            '<button id="mainScript" class="script-name script-group horizontal" name="'+script+'" title="'+name+' Helper">'+ name +
                '<span class="script-toggler toggler-on">On</span>' +
                '<span class="script-toggler toggler-off">Off</span>' +
            '</button>'
            + chooseScriptBtn;

    return html;
}

// СТРАНИЦА ОШИБОК

function errorPage(error, xhrStatus) {
    //page = 'error';
    localStorage.scriptStatus = 'off';
    chrome.storage.local.set({'script': 'none'});

    let logo = '<img id="avitoLogo" class="big-logo" src="image/logo_white.png">';

    if (error === 'logout') {
        pageGenerator(
            'Admin.Helper',
            'Для продолжения работы с Admin.Helper, вам необходимо зайти в adm.avito.ru',
            logo,
            ''
        );
    } else if (error === 'user does not exist') {
        pageGenerator(
            'Admin.Helper',
            'К сожалению, вы отсутсутствуете в списке пользователей Admin.Helper. Обратитесь к вашему тимлидеру для решения данной проблемы.',
            logo,
            ''
        );
    } else if (error === '403') {
        pageGenerator(
            'Admin.Helper',
            'К сожалению, что-то пошло не так и я не могу предоставить вам доступ к своему функционалу. Возможно, вы пытаетесь зайти с чуждого для меня IP адреса.',
            logo,
            ''
        );
    } else if (error === '500') {
        pageGenerator(
            'Admin.Helper',
            'К сожалению, произошла техническая ошибка. Попробуйте закрыть окно расширения и открыть его заново.',
            logo,
            ''
        );
    } else if (error === '>=400') {
        pageGenerator(
            'Admin.Helper',
            'К сожалению, произошла техническая ошибка. Код ошибки: '+ xhrStatus +'.',
            logo,
            ''
        );
    } else {
        pageGenerator(
            'Admin.Helper',
            'К сожалению, возникла ошибка. Обратитесь к тимлидеру.',
            logo,
            ''
        );
    }

    logoChange();
}

function logoChange() {
	let countClick = 0;
	
	$('#avitoLogo').click(() => {
		countClick++;
		if (countClick === 6) {
			countClick = 0;
			
			authorizationPage();
		}
	});
}

// СТРАНИЦА АВТОРИЗАЦИИ

function authorizationPage() {
	pageGenerator(
		'Авторизация',
		'',
		'<input id="username" type="text" name="user" placeholder="username" autofocus required><input id="password" type="password" name="pass" placeholder="password" required><div id="error"></div>',
		'<input class="btn" type="submit" id="submit" value="Sign in">'
	);
			
	$('#submit').click(() => {
		const username = $('#username').val();
        const password = $('#password').val();
		
		login(username, password);
	});
}

function login(username, password) {
    loadingBar();

	let xhr = new XMLHttpRequest();
	xhr.open('POST', 'http://avitoadm.ru/journal/include/php/login.php', true);
	xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
	xhr.send("user="+username+"&pass="+password);
	xhr.onreadystatechange = function () {
	    if (xhr.readyState === 4) {
            if(xhr.status === 200) {
                if (xhr.responseText === 'username or password correct') {
                    cookieInfo();
                } else {
                    authorizationPage();
                    $('#error').text(xhr.responseText);
                    console.log(xhr.responseText);
                }
            }

            if (xhr.status >= 400) {
                switch (xhr.status) {
                    case 403:
                        errorPage('403');
                        break;

                    case 500:
                        errorPage('500');
                        break;

                    default:
                        errorPage('>=400', xhr.status);
                }
            }
        }
    };
}


// СТРАНИЦА ВЫБОРА СКРИПТА

function chooseScriptPage() {
    $('#choose-scripts').click(() => {
        pageGenerator(
            'Admin.Helper',
            '',
            chooseButtonGenerator(scriptList),
            ''
        );

        chooseScript();
    });
}


function chooseButtonGenerator(buttons) {
    let html = '';

    buttons.forEach(function(btn) {
        let id = btn;
        let name = btn.charAt(0).toUpperCase() + btn.substr(1);

        html += '<input type="radio" class="radioLabel" name="option" id="'+id+'" />' +
            '<label class="script-name script-group vertical" for="'+id+'" title="'+name+' Helper">'+name+'</label>';
    });

    return html;
}

function chooseScript() {
    $('label[for]').click(event => {
        let clickScript = $(event.currentTarget).attr('for');
        $('#'+clickScript).prop('checked', true);

        localStorage.script = clickScript;
        localStorage.scriptStatus = 'on';
        chrome.storage.local.set({'script': clickScript});

        choosePage('main');
    });
}

// СТРАНИЦА ПРИ ЛОГИНЕ

function loginPage() {
	pageGenerator(
        userGlobalInfo.username,
        mainButtonGenerator(),
		'<ul class="journal">'+
			'<li><a href="http://avitoadm.ru/journal/users.html">Сотрудники</a></li>'+
			'<li><a href="http://avitoadm.ru/journal/">Cобытия на сайте S&M</a></li>'+
			'<li><a href="http://avitoadm.ru/journal/tasklog.html">Task log</a></li>'+
			'<li><a href="http://avitoadm.ru/journal/mod_stat.html">Moderation Statistics</a></li>'+
			'<li><a href="http://avitoadm.ru/support_helper/allowlist/">Allow List</a></li>'+
			'<li><a href="http://avitoadm.ru/intern_helper/internlog/">Intern log</a></li>'+
			'<li><span id="sendNotification" class="click">Отправить уведомление</span></li>'+
		'</ul>',
		'<input class="btn" type="submit" id="logout" value="Sign out">'
	);
	
	$('#logout').click(() => {
		logout();
	});
	
	$('#sendNotification').click(() => {
        sendNotificationPage(userGlobalInfo);
    });
	
	$('.journal').on('click', 'a', function(){
		chrome.tabs.create({url: $(this).attr('href')});
		return false;
	});
}

function sendNotificationPage(user) {
    pageGenerator(
        user.username,
        mainButtonGenerator(),
        '<dl id="to_type" class="dropdown">'+
			'<dt>'+
				'<a href="#">'+
					'<div class="hida">Select type</div>'+
					'<div class="multiSel"></div>'+
				'</a>'+
			'</dt>'+
			'<dd>'+
				'<div class="mutliSelect">'+
					'<ul>'+
						'<li><label><input type="checkbox" value="Subdivision" />Subdivision</label></li>'+
						'<li><label><input type="checkbox" value="Username" />Username</label></li>'+
					'</ul>'+
				'</div>'+
			'</dd>'+
        '</dl>'+
		'<dl id="to_category" class="dropdown" style="display: none;">'+
			'<dt>'+
				'<a href="#">'+
					'<div class="hida">Select Subdivision</div>'+
					'<div class="multiSel"></div>'+
				'</a>'+
			'</dt>'+
			'<dd>'+
				'<div class="mutliSelect">'+
					'<ul>'+
						'<li><label><input type="checkbox" value="SD" />SD (Script Developer)</label></li>'+
						'<li><label><input type="checkbox" value="TL" />TL (Teamlead)</label></li>'+
						'<li><label><input type="checkbox" value="KK" />KK (Контроль Кач)</label></li>'+
						'<li><label><input type="checkbox" value="SP" />SP (ProSupport)</label></li>'+
        				'<li><label><input type="checkbox" value="S2" />SA (Жалобы)</label></li>'+
						'<li><label><input type="checkbox" value="S1" />S1 (Первая линия)</label></li>'+
						'<li><label><input type="checkbox" value="S2" />S2 (Вторая линия)</label></li>'+
       					'<li><label><input type="checkbox" value="TR" />TR (Транспорт)</label></li>'+
						'<li><label><input type="checkbox" value="RE" />RE (Недвижимость)</label></li>'+
						'<li><label><input type="checkbox" value="JB" />JB (Работа)</label></li>'+
						'<li><label><input type="checkbox" value="SR" />SR (Услуги)</label></li>'+
        				'<li><label><input type="checkbox" value="LV" />LV (Личные вещи)</label></li>'+
						'<li><label><input type="checkbox" value="BH" />BH (БЭХО)</label></li>'+
						'<li><label><input type="checkbox" value="3D" />3D (ДДД)</label></li>'+
						'<li><label><input type="checkbox" value="TM" />TM (Траффики)</label></li>'+
					'</ul>'+
				'</div>'+
			'</dd>'+
        '</dl>'+
		'<input id="to_username" type="text" name="notification" placeholder="usernames" title="Вводите логины через запятую!" style="display: none;">'+
        '<input id="headNotification" type="text" name="notification" placeholder="Notification Head" title="Введите заголовок уведомления">'+
        '<textarea id="bodyNotification" name="notification" placeholder="Notification Body" title="Введите уведомление"></textarea>',
        '<input class="btn" type="submit" id="sendNotificationToBD" value="Send Notification">'
    );


    $(".dropdown dt a").click(() => {
        $(this).parents('.dropdown').find("dd ul").slideToggle('fast');
    });

    $(".dropdown dd ul li a").click(() => {
        $(this).parents('.dropdown').find("dd ul").hide();
    });

    $(document).on('click', (e) => {
        let $clicked = $(e.target);
        if (!$clicked.parents().hasClass("dropdown")) $(".dropdown dd ul").hide();
    });

    $('.mutliSelect input[type="checkbox"]').on('click', function() {

        let title = $(this).val();

        if ($(this).is(':checked')) {
            let html = '<span title="'+title+'">'+title+'</span>';
            $(this).parents('.dropdown').find('.multiSel').append(html);
            $(this).parents('.dropdown').find(".hida").hide();
            if ($(this).val() === 'Subdivision') $('#to_category').show();
			if ($(this).val() === 'Username') $('#to_username').show();
        } else {
            $(this).parents('.dropdown').find('span[title="' + title + '"]').remove();
            if ($(this).parents('.dropdown').find('.multiSel span').length === 0) $(this).parents('.dropdown').find(".hida").show();
            if ($(this).val() === 'Subdivision') $('#to_category').hide();
            if ($(this).val() === 'Username') $('#to_username').hide();
        }
    });

    $(document).mouseup((e) => {
        let div = $('.dropdown dd ul');
        if (!div.is(e.target) && div.has(e.target).length === 0) {
            div.hide();
        }
    });

    $('#sendNotificationToBD').click(() => {
        sendNotificationToBD(user);
        choosePage();
    });
}

function sendNotificationToBD(user) {
    chrome.runtime.sendMessage({
        action: 'sendNotification',
        username: user.username,
        head: $('#headNotification').val(),
        body: $('#bodyNotification').val(),
        to_type: '|'+makeString($('#to_type').find('.multiSel span'))+'|',
        to_name: '|'+makeString($('#to_category').find('.multiSel span'))+'|'+$('#to_username').val().replace(' ', '').replace(',', '|')+'|'
    }, function(response) {
        console.log(response);
    });
}

function makeString(obj) {
	let array = [];

	for (let i = 0; i < obj.length; ++i) {
		array.push(obj.slice(i, i+1).text());
	}

	return array.join('|');
}

function logout() {
    loadingBar();

    let xhr = new XMLHttpRequest();
	xhr.open('POST', 'http://avitoadm.ru/journal/include/php/logout.php', true);
	xhr.send();

    cookieInfo();
}

// ФУНКЦИИ ДЛЯ ВСЕХ СТРАНИЦ

function pageGenerator(head, scripts, body, end) {
    let $body = $('body');

    $body.empty()
        .append('<div id="background-body"><img id="avitoBackground" src="image/popup_background.jpg"></div>');
	
	if (head !== '') {
        $body.append('<div id="head" class="line"></div>');
		$('#head').html(head);
	}

	if (scripts !== '' && scripts.indexOf('mainScript')+1) {
        $body.append('<div id="scripts" class="radio_buttons"></div>');
		$('#scripts').html(scripts);

        turnScript();
        chooseScriptPage();
	} else if (scripts !== '') {
        $body.append('<div id="error"></div>');
		$('#error').html(scripts);
	}
	
	if (body !== '') {
        $body.append('<div id="body" class="line"></div>');
		
		$('#body').html(body);
	} else {
		$('#scripts').css('margin', '35px 0');
	}
	
	if (end !== '') {
        $body.append('<div id="end" class="line"></div>');
		$('#end').html(end);
	}

    $body.append('<div id="version"></div>');
	$('#version').html('<span title="Версия расширения">v'+version+'</span>');

    logoChange();
}

function turnScript() {
    let scriptStatus = localStorage.scriptStatus;
    let $mainScript = $('#mainScript');
	
    if (scriptStatus === 'off') {
        $mainScript.removeClass('active');
    }
    if (scriptStatus === 'on') {
        $mainScript.addClass('active');
    }

    $mainScript.click(() => {
        scriptStatus = localStorage.scriptStatus;

        if (scriptStatus === 'off') {
            $mainScript.addClass('active');
            localStorage.scriptStatus = 'on';
            chrome.storage.local.set({'script': localStorage.script});
        }

        if (scriptStatus === 'on') {
            $mainScript.removeClass('active');
            localStorage.scriptStatus = 'off';
            chrome.storage.local.set({'script': 'none'});
        }
    });
}

function loadingBar() {
    $('body')
        .empty()
        .append('<div id="body" class="line"><img id="avitoBackground" src="image/popup_background.jpg"></div>')
        .append('<div class="cssload-loader">'+
            '<div class="cssload-inner cssload-one"></div>'+
            '<div class="cssload-inner cssload-two"></div>'+
            '<div class="cssload-inner cssload-three"></div>'+
        '</div>');
}
