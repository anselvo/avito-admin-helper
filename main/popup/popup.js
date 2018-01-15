let version = chrome.runtime.getManifest().version;
let scriptList = [];
let script = false;
let userGlobalInfo;

$(function() {
    loadingBar();

    chrome.storage.local.get(result  => {
        script = result.script;

        pageSelector(result.connectInfo);
    });

    chrome.storage.onChanged.addListener(changes => {
        if (changes.connectInfo) pageSelector(changes.connectInfo.newValue);
    });
});

function pageSelector(connectInfo) {
    if (!connectInfo.error) {
        userGlobalInfo = connectInfo.spring_user.principal;
        createScriptList();
        mainPage();
    } else {
        if (connectInfo.status === 401) errorAuthPage(connectInfo.error);
        else errorPage(connectInfo.error);
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

    let chooseScriptBtn = (scriptList.length > 1) ? '<span class="script-group horizontal" id="choose-scripts"><i class="fa fa-list fa-3x" aria-hidden="true" style="margin-top: 6px; font-size: 28px;"></i></span>' : '';

    html += '<span class="avito-logo script-group horizontal">' +
                '<img id="avitoLogo" src="../../include/image/logo_white.png" style="">' +
            '</span>' +
            '<button id="mainScript" class="script-name script-group horizontal" name="script">Script' +
                '<span class="script-toggler toggler-on">On</span>' +
                '<span class="script-toggler toggler-off">Off</span>' +
            '</button>'
            + chooseScriptBtn;

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
            chooseScriptPage();
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
