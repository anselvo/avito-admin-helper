let version = chrome.runtime.getManifest().version;
let script = false;
let connectInfo = null;

$(function() {
    loadingPage();

    $('#version').html('<span title="Версия расширения">Версия '+version+'</span>');

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
    if (!connectInfo.error) authPage();
    else errorPage(connectInfo.status, connectInfo.error);
}

// ОСНОВНАЯ СТРАНИЦА
function authPage() {
    let div = document.createElement('div');
    div.className = 'ah-user-info';
    div.innerHTML = `<div><img class="ah-user-avatar" src="http://spring.avitoadm.ru/employee/img/${connectInfo.spring_user.principal.avatar}"></div>
                     <div>
                        <div class="ah-user-name">${connectInfo.spring_user.principal.name} ${connectInfo.spring_user.principal.surname}</div>
                        <div class="ah-user-italic">${connectInfo.spring_user.principal.subdivision.divisionName}</div>
                        <div class="ah-user-italic">${connectInfo.spring_user.principal.shift.shift}, ${connectInfo.spring_user.principal.weekend.weekend}</div>
                        <div><span>Skype: </span>${connectInfo.spring_user.principal.skype}</div>
                        <div><span>Email: </span>${connectInfo.spring_user.principal.email}</div>
                        <div><span>Phone: </span>${connectInfo.spring_user.principal.phone}</div>
                     </div>`;

    pageGenerator(div, true);
}

// СТРАНИЦА ОШИБОК
function errorPage(status, message) {
    const div = document.createElement('div');
    div.className = 'ah-error';
    div.innerHTML = `<div class="ah-error-message">${message}</div>`;

    if (status === 401) {
        const form = document.createElement('form');
        form.className = 'ah-auth';

        const pass = document.createElement('input');
        pass.type = 'password';
        pass.placeholder = 'password';
        pass.className = 'ah-password';
        pass.id = 'password';
        pass.required = true;

        const submit = document.createElement('input');
        submit.type = 'submit';
        submit.placeholder = 'sign in';
        submit.className = 'ah-button';
        submit.id = 'submit';

        form.appendChild(pass);
        form.appendChild(submit);
        form.addEventListener('submit', () => chrome.runtime.sendMessage({ action: 'connect', password: pass.value }));

        div.appendChild(form);
    } else {
        chrome.runtime.sendMessage({ action: 'connect' });
    }

    scriptSwitch(null);
    pageGenerator(div, false);
}


// СТРАНИЦА ВЫБОРА СКРИПТА
function settingsPage() {
    const authorities = connectInfo.spring_user.principal.authorities;

    const div = document.createElement('div');
    div.className = 'ah-settings';

    const table = document.createElement('table');
    for (let authority in authorities) {
        let id = authority;
        const tr = document.createElement('tr');

        tr.innerHTML = `<td>${id}</td><td width="35"><input id="${id}" type="checkbox" name="settings" /><label class="ah-checkbox" for="${id}"></label></td>`;

        table.appendChild(tr);
    }

    div.appendChild(table);

    pageGenerator(div, true);
}

// СТРАНИЦА Загрузки
function loadingPage() {
    const div = document.createElement('div');
    div.className = 'ah-loader';
    div.innerHTML = `<div class="ah-loader-inner ah-loader-one"></div>
                     <div class="ah-loader-inner ah-loader-two"></div>
                     <div class="ah-loader-inner ah-loader-three"></div>`;

    pageGenerator(div, false);
}

// ФУНКЦИИ ДЛЯ ВСЕХ СТРАНИЦ
function pageGenerator(body, isNav) {
    navRemove();

    const bodySelector = document.getElementById('body');

    bodySelector.innerHTML = '';
    bodySelector.appendChild(body);

    if (isNav) navGenerator();
}

function navRemove() {
    const nav = document.getElementById('nav');
    if (nav) nav.remove();
}

function navGenerator() {
    const app = document.getElementById('app');

    const nav = document.createElement('nav');
    nav.id = 'nav';
    nav.className = 'ah-nav';

    const navLeft = document.createElement('section');
    navLeft.className = 'ah-nav-left';

    navLeft.appendChild(navElement('<img id="home" class="ah-nav-icon" src="../../include/image/black/icon_home.png">'));

    const navRight = document.createElement('section');
    navRight.className = 'ah-nav-right';

    let checked = '';
    if (script) checked = 'checked';
    navRight.appendChild(navElement('<input id="switch" type="checkbox" ' + checked + ' /><label class="ah-nav-switch" for="switch"></label>'));
    navRight.appendChild(navElement('<img id="setting" class="ah-nav-icon" src="../../include/image/black/icon_settings.png">'));

    nav.appendChild(navLeft);
    nav.appendChild(navRight);

    nav.addEventListener('click', event => {
        switch (event.target.id) {
            case 'home':
                pageSelector();
                break;
            case 'setting':
                settingsPage();
                break;
        }
    });

    nav.addEventListener('change', event => {
        switch (event.target.id) {
            case 'switch':
                scriptSwitch(event.target.checked);
                break;
        }
    });

    app.appendChild(nav);
}

function navElement(html) {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div;
}

function scriptSwitch(checked) {
    script = checked;
    chrome.storage.local.set({ script: checked });
}