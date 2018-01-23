const version = chrome.runtime.getManifest().version;
let script = false;
let authorities = null;
let connectInfo = null;

$(function() {
    loadingPage();

    const divVersion = document.getElementById('version');
    divVersion.innerHTML = `<span title="Версия расширения">Версия ${version}</span>`;

    chrome.storage.local.get(result  => {
        script = result.script;
        connectInfo = result.connectInfo;
        authorities = result.authorities;

        pageSelector();
    });

    chrome.storage.onChanged.addListener(changes => {
        if (changes.connectInfo) {
            connectInfo = changes.connectInfo.newValue;
            pageSelector();
        }

        if (changes.authorities) {
            authorities = changes.authorities.newValue;
            console.log(authorities);
        }
    });
});

function pageSelector() {
    if (!connectInfo.error) authPage();
    else errorPage(connectInfo.status, connectInfo.error);
}

// ОСНОВНАЯ СТРАНИЦА
function authPage() {
    const div = document.createElement('div');
    div.className = 'ah-user-info ah-body-block';

    const divAvatar = document.createElement('div');
    divAvatar.className = 'ah-user-avatar-block';

    const avatar = document.createElement('img');
    avatar.className = 'ah-user-avatar';
    if (connectInfo.spring_user.principal.avatar) avatar.src = connectInfo.spring_url + '/employee/img/' + connectInfo.spring_user.principal.avatar;
    else avatar.src = '../../include/image/logo_user_default.png';

    divAvatar.appendChild(avatar);

    const divUserInfo = document.createElement('div');
    divUserInfo.className = 'ah-user-info-block';

    const name = document.createElement('div');
    name.className = 'ah-user-name';
    name.textContent = connectInfo.spring_user.principal.name + " " + connectInfo.spring_user.principal.surname;

    const position = document.createElement('div');
    position.className = 'ah-user-position';
    position.textContent = connectInfo.spring_user.principal.subdivision.divisionName;

    const schedule = document.createElement('div');
    schedule.className = 'ah-user-schedule';
    schedule.textContent = connectInfo.spring_user.principal.shift.shift + ", " + connectInfo.spring_user.principal.weekend.weekend;

    const divContactInfo = document.createElement('div');
    divContactInfo.className = 'ah-user-info-contact';

    divContactInfo.appendChild(addContactInfoElement('Email', connectInfo.spring_user.principal.email));
    divContactInfo.appendChild(addContactInfoElement('Phone', connectInfo.spring_user.principal.phone));
    divContactInfo.appendChild(addContactInfoElement('Skype', connectInfo.spring_user.principal.skype));

    divUserInfo.appendChild(name);
    divUserInfo.appendChild(position);
    divUserInfo.appendChild(schedule);

    div.appendChild(divAvatar);
    div.appendChild(divUserInfo);

    pageGenerator([div], true);
}

function addContactInfoElement(name, option) {
    if (connectInfo.spring_user.principal.email) {
        const tmp = document.createElement('div');
        tmp.innerHTML = `<span>${name}: </span>${option}`;
        return tmp;
    }
}

// СТРАНИЦА ОШИБОК
function errorPage(status, message) {
    const div = document.createElement('div');
    div.className = 'ah-error ah-body-block';
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
    pageGenerator([div], false);
}


// СТРАНИЦА ВЫБОРА СКРИПТА
function settingsPage() {
    let body = [];

    if (connectInfo.spring_user.principal.permissions) {
        const userSettings = document.createElement('div');
        userSettings.className = 'ah-settings-user ah-body-block';
        userSettings.appendChild(addSettingsTable(connectInfo.spring_user.principal.permissions, "Личные настройки"));
        body.push(userSettings);
    }

    if (connectInfo.spring_user.principal.position) {
        const groupSettings = document.createElement('div');
        groupSettings.className = 'ah-settings-group ah-body-block';
        groupSettings.appendChild(addSettingsTable(connectInfo.spring_user.principal.position.permissions, "Настройки"));
        body.push(groupSettings);
    }

    pageGenerator(body, true);
}

function addSettingsTable(permission, caption) {
    const table = document.createElement('table');
    table.className = 'ah-table-settings';

    const captionSelector = document.createElement('caption');
    captionSelector.textContent = caption;

    table.appendChild(captionSelector);

    for (let i = 0; i < permission.length; ++i) {
        if (permission[i].visible) {
            const tr = document.createElement('tr');

            const roleName = "ROLE_" + permission[i].name.toUpperCase();
            const checked = authorities[roleName] ? 'checked' : '';
            const id = permission[i].id + (Math.floor(Math.random() * (1000 - 1)) + 1);

            tr.innerHTML = `<td><div class="ah-table-settings-name">${permission[i].name}</div><div class="ah-table-settings-description">${permission[i].description}</div></td>
                        <td width="20">${permission[i].visible}</td>
                        <td width="35">
                            <input id="${id}" class="ah-checkbox" type="checkbox" name="settings" data-uuid="${permission[i].id}" data-role="${roleName}" ${checked} />
                            <label class="ah-checkbox-label" for="${id}"></label>
                        </td>`;

            table.appendChild(tr);
        }
    }

    table.addEventListener('change', event => {
        authorities[event.target.dataset.role] = event.target.checked;

        const checkbox = document.querySelectorAll(`[data-uuid="${event.target.dataset.uuid}"]`);
        for (let i = 0; i < checkbox.length; ++i) checkbox[i].checked = event.target.checked;

        chrome.storage.local.set({ authorities: authorities });
    });

    return table;
}

// СТРАНИЦА Загрузки
function loadingPage() {
    const div = document.createElement('div');
    div.className = 'ah-loader';

    const divLoaderOne = document.createElement('div');
    divLoaderOne.className = 'ah-loader-inner ah-loader-one';

    const divLoaderTwo = document.createElement('div');
    divLoaderTwo.className = 'ah-loader-inner ah-loader-two';

    const divLoaderThree = document.createElement('div');
    divLoaderThree.className = 'ah-loader-inner ah-loader-three';

    div.appendChild(divLoaderOne);
    div.appendChild(divLoaderTwo);
    div.appendChild(divLoaderThree);

    pageGenerator([div], false);
}

// ФУНКЦИИ ДЛЯ ВСЕХ СТРАНИЦ
function pageGenerator(body, isNav) {
    navRemove();

    const bodySelector = document.getElementById('body');

    bodySelector.innerHTML = '';
    for (let i = 0; i < body.length; ++i) {
        bodySelector.appendChild(body[i]);
    }

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

    navLeft.appendChild(addNavElement(`<img id="home" class="ah-nav-icon" src="../../include/image/black/icon_home.png">`));

    const navRight = document.createElement('section');
    navRight.className = 'ah-nav-right';

    const checked = script ? 'checked' : '';
    navRight.appendChild(addNavElement(`<input id="switch" class="ah-checkbox" type="checkbox" ${checked} /><label class="ah-checkbox-label" for="switch"></label>`));
    navRight.appendChild(addNavElement(`<img id="setting" class="ah-nav-icon" src="../../include/image/black/icon_settings.png">`));

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

function addNavElement(html) {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div;
}

function scriptSwitch(checked) {
    script = checked;
    chrome.storage.local.set({ script: checked });
}