let version = chrome.runtime.getManifest().version;
let scriptList = [];
let script = false;
let connectInfo = null;

$(function() {
    loadingBar();

    chrome.storage.local.get(result  => {
        script = result.script;
        connectInfo = result.connectInfo;

        pageSelector();
    });

    chrome.storage.onChanged.addListener(changes => {
        if (changes.connectInfo) {
            connectInfo = changes.connectInfo.newValue;
            pageSelector();
        }
    });
});

function pageSelector() {
    if (!connectInfo.error) mainPage();
    else {
        if (connectInfo.status === 401) errorAuthPage(connectInfo.error);
        else errorPage(connectInfo.error);
    }
}

// ОСНОВНАЯ СТРАНИЦА
function mainPage() {
    pageGenerator(
		'Admin.Helper',
		mainButtonGenerator(),
		'',
		'Удачного рабочего дня, ' + connectInfo.spring_user.principal.name + '!'
	);
}


function mainButtonGenerator() {
    let html = '';

    html += '<span class="avito-logo script-group horizontal">' +
                '<img id="avitoLogo" src="../../include/image/logo_white.png">' +
            '</span>' +
            '<button id="mainScript" class="script-name script-group horizontal" name="script">Script' +
                '<span class="script-toggler toggler-on">On</span>' +
                '<span class="script-toggler toggler-off">Off</span>' +
            '</button>' +
            '<span class="script-group horizontal"><img id="settings" class="settings-logo" src="../../include/image/settings_white.png"></span>';

    return html;
}

// СТРАНИЦА ОШИБОК
function errorPage(error) {
    pageGenerator(
        'Ошибка',
        error,
        '<img id="avitoLogo" class="big-logo" src="../../include/image/logo_white.png">',
        '',
        true
    );

    chrome.runtime.sendMessage({ action: 'connect' });
}

// СТРАНИЦА ОШИБКИ АВТОРИЗАЦИИ
function errorAuthPage(error) {
	pageGenerator(
		'Авторизация',
		error,
		'<input id="password" type="password" name="pass" placeholder="password" required>',
		'<input class="btn" type="submit" id="submit" value="SIGN IN">',
        true
	);
			
	$('#submit').click(() => {
	    const password = $('#password').val();

        chrome.runtime.sendMessage({ action: 'connect', password: password });
	});
}


// СТРАНИЦА ВЫБОРА СКРИПТА
function settingsPage() {
    $('#settings').click(() => {
        pageGenerator(
            'Admin.Helper',
            '',
            settingsGenerator(),
            ''
        );

        chooseScript();
    });
}


function settingsGenerator() {
    const authorities = connectInfo.spring_user.principal.authorities;
    console.log(authorities)

    let html = '';
    for (let authority in authorities) {
        let id = authority;

        html += '<input type="radio" class="radioLabel" name="option" id="' + id + '" />' +
            '<label class="script-name script-group vertical" for="' + id + '" title="' + authority + ' Helper">' + authority + '</label>';
    }

    return html;
}

function chooseScript() {
    $('label[for]').click(event => {
        let clickScript = $(event.currentTarget).attr('for');
        $('#'+clickScript).prop('checked', true);

        mainPage();
    });
}

// СТРАНИЦА ПРИ ЛОГИНЕ
function authPage() {
	pageGenerator(
        connectInfo.spring_user.principal.username,
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
function pageGenerator(head, scripts, body, end, error) {
    const $body = $('body');

    $body.empty()
        .append('<div id="background-body"><img id="avitoBackground" src="../../include/image/popup_background.jpg"></div>');
	
	if (head !== '') {
        $body.append('<div id="head" class="line"></div>');
		$('#head').html(head);
	}

	if (scripts !== '') {
        if (!error) {
            $body.append('<div id="scripts" class="radio_buttons"></div>');
            $('#scripts').html(scripts);

            scriptStatus();
            settingsPage();
        } else {
            $body.append('<div id="error" class="line"></div>');
            $('#error').html(scripts);
        }
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

function scriptStatus() {
    const $mainScript = $('#mainScript');

    if (script) {
        $mainScript.addClass('active');
    } else {
        $mainScript.removeClass('active');
    }

    $mainScript.click(() => {
        if (script) {
            script = false;
            $mainScript.removeClass('active');
            chrome.storage.local.set({ script: false });
        } else {
            script = true;
            $mainScript.addClass('active');
            chrome.storage.local.set({ script: true });
        }
    });
}

function loadingBar() {
    $('body')
        .empty()
        .append('<div id="body" class="line"><img id="avitoBackground" src="../../include/image/popup_background.jpg"></div>')
        .append('<div class="cssload-loader">'+
            '<div class="cssload-inner cssload-one"></div>'+
            '<div class="cssload-inner cssload-two"></div>'+
            '<div class="cssload-inner cssload-three"></div>'+
        '</div>');
}
