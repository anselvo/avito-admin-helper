let version = chrome.runtime.getManifest().version;
let scriptList = [];
let userGlobalInfo;

$(function() {
    loadingBar();

    chrome.storage.local.get("authInfo", result  => {
        pageListener(result.authInfo);
    });

    chrome.storage.onChanged.addListener(changes => {
        if (changes.authInfo) pageListener(changes.authInfo.newValue);
    });
});

function pageListener(authInfo) {
    console.log(authInfo);

    if (!authInfo.adm) errorPage('logout');
    else if (!authInfo.auth) authorizationPage(authInfo.error);
    else if (authInfo.auth) {
        userGlobalInfo = authInfo.user.principal;
        createScriptList();
        mainPage();

        // update info about user
        chrome.runtime.sendMessage({ action: 'principal' });
    } else if (authInfo.status >= 400) {
        switch (authInfo.status) {
            case 403:
                errorPage('403');
                break;

            case 500:
                errorPage('500');
                break;

            default:
                errorPage('>=400', authInfo.status);
        }
    }
}

function createScriptList() {
	if (userGlobalInfo.subdivision.divisionName === 'Moderator') {
		
		scriptList = ['moderator'];
	} else if (userGlobalInfo.subdivision.divisionName === 'Support') {
		
		scriptList = ['support', 'moderator'];
	} else if (userGlobalInfo.subdivision.divisionName === 'Intern') {
		
		scriptList = ['support', 'moderator', 'intern'];
	} else if (userGlobalInfo.subdivision.divisionName === 'Traffic') {
		
		scriptList = ['traffic'];
	} else if (userGlobalInfo.subdivision.divisionName === 'SMM') {

        scriptList = ['smm'];
    } else if (userGlobalInfo.subdivision.divisionName === 'InfoDoc') {

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

// ОСНОВНАЯ СТРАНИЦА

function mainPage() {
    pageGenerator(
		'Admin.Helper',
		mainButtonGenerator(),
		'',
		'Удачного рабочего дня, ' + userGlobalInfo.name + '!'
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
}

// СТРАНИЦА АВТОРИЗАЦИИ

function authorizationPage(error) {
	pageGenerator(
		'Авторизация',
		error,
		'<input id="password" type="password" name="pass" placeholder="password" required>',
		'<input class="btn" type="submit" id="submit" value="SIGN IN">'
	);
			
	$('#submit').click(() => {
	    const password = $('#password').val();

        loadingBar();
        chrome.runtime.sendMessage({ action: 'authentication', password: password });
	});
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

        mainPage();
    });
}

// СТРАНИЦА ПРИ ЛОГИНЕ
function authPage() {
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
	);

	$('.journal').on('click', 'a', function() {
		chrome.tabs.create({ url: $(this).attr('href') });
		return false;
	});
}

// ФУНКЦИИ ДЛЯ ВСЕХ СТРАНИЦ

function pageGenerator(head, scripts, body, end) {
    const $body = $('body');

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
        $body.append('<div id="error" class="line"></div>');
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
