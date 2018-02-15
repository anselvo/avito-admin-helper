let stompClient = null;
let connectInfo = {
    adm_auth: false,
    adm_username: null,
    adm_url: "https://adm.avito.ru",
    spring_auth: false,
    spring_user: null,
    spring_url: "http://spring.avitoadm.ru",
    spring_reconnect: false,
    status: null,
    error: null
};

$(function () {
    // забираем необходимую инфу со стореджа для старта расширения
    getStorageInfo();

    // определяем кто залогинен в админку
    getCookieInfo();

    // запускаем чекер дня
    chrome.alarms.create('day', {delayInMinutes: 1, periodInMinutes: 1});
});

// ПРОВЕРКА НА ОБНОВЛЕНИЯ
chrome.runtime.onUpdateAvailable.addListener(() => {
    // принудительное обновление расширения
    chrome.runtime.reload();
});

// ЛОВИТ КОГДА РАСШИРЕНИЕ УСТАНОВЛЕНО ИЛИ ОБНОВЛЕННО
chrome.runtime.onInstalled.addListener(details => {
	// нотификация об апдейте расширения
    const version = chrome.runtime.getManifest().version;

    if (details.reason === 'update') addChromeNotification("Updated "+ version + "\n\nДля корректной работы расширения, рекомендуется обновить страницы в браузере");
    if (details.reason === 'install') addChromeNotification("Installed " + version);
});

// ЛОВИТ БУДИЛЬНИК
chrome.alarms.onAlarm.addListener(alarm => {
    if (alarm.name === 'day') clearDayInfo();
    if (alarm.name === 'reconnect') connect();
});

// ОПРЕДЕЛЯЕТ КАКАЯ ВКЛАДКА АКТИВНАЯ
chrome.tabs.onActivated.addListener(info => {

});

// ЛОВИТ ИЗМЕНЕНИЯ ВО ВКЛАДКАХ
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
	if (changeInfo.status === 'complete') chrome.tabs.sendMessage(tabId, {onUpdated: 'complete'});
});

// ЛОВИТ КАКИЕ ЗАПРОСЫ ОТПРАВЛЕНЫ НА СЕРВЕР
chrome.webRequest.onBeforeRequest.addListener(details => {
        if (details.method === 'POST' && details.requestBody) {
            if (connectInfo.spring_user) moderationListener(details);
		}
    },
    {urls: [`${connectInfo.adm_url}/*`, "https://br-analytics.ru/*"]},
    ['blocking', 'requestBody']
);

// ЛОВИТ КАКИЕ ОТВЕТЫ ПОЛУЧЕНЫ ОТ СЕРВЕРА
chrome.webRequest.onCompleted.addListener(detailsURL => {
        requestListener(detailsURL.tabId, detailsURL.url);
	}, 
	{ urls: [`${connectInfo.adm_url}/*`] }
);

// ЛОВИТ СООБЩЕНИЯ
chrome.runtime.onMessage.addListener((request, sender, callback) => {
    switch (request.action) {
        case "XMLHttpRequest":
            let xhr = new XMLHttpRequest();
            let method = request.method ? request.method.toUpperCase() : 'GET';
            let contentType = request.contentType;

            if (method === 'POST') contentType = request.contentType ? request.contentType : 'application/x-www-form-urlencoded';

            xhr.open(method, request.url, true);
            if (contentType) xhr.setRequestHeader('Content-Type', contentType);
            xhr.send(request.data);

            xhr.onload = () => callback(xhr.responseText);
            xhr.onerror = () => callback('error');
            return true;

        case "copyToClipboard":
            const textarea = document.createElement('textarea');
            textarea.style.position = 'fixed';
            textarea.value = request.text;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('Copy');
            document.body.removeChild(textarea);
            return false;

        case "ws":
            if (request.notification.status === 'read') {
                stompClient.send('/app/notification/update/read', {}, request.notification.uuid);
            }
            return false;

        case "connect":
            if (request.password) chrome.storage.local.set({ password: request.password });
            else chrome.storage.local.set({ password: null });

            connect();
            return false;
    }
});

function addChromeNotification(message) {
    const options = {
        type: "basic",
        title: "Admin.Helper",
        message: message,
        iconUrl: "include/image/black/logo_notification.png",
    };
    chrome.notifications.create(options);
}

function getStorageInfo() {
    chrome.storage.local.get(result => {
        setBudgetIcon(result.script);
        setConnectInfo(result.connectInfo);
    });

    chrome.storage.onChanged.addListener(changes => {
        if (changes.script) setBudgetIcon(changes.script.newValue);
        if (changes.connectInfo) setConnectInfo(changes.connectInfo.newValue);
    });
}

function getCookieInfo() {
	chrome.cookies.get({'url': `${connectInfo.adm_url}`, 'name': 'adm_username'}, cookie => {
		if (cookie) {
			console.log('You login to adm.avito.ru as ' + cookie.value);

            connectInfo.adm_auth = true;
            connectInfo.adm_username = cookie.value;

            connect();
		} else {
			console.log('You not login in adm.avito.ru');

            connectInfo.adm_auth = false;
            connectInfo.adm_username = null;

            disconnect();
		}
	});

	chrome.cookies.onChanged.addListener(changeInfo => {
		if (changeInfo.cookie.domain === 'adm.avito.ru' && changeInfo.cookie.name === 'adm_username' && changeInfo.removed === false) {
			console.log('You login to adm.avito.ru as ' + changeInfo.cookie.value);

            connectInfo.adm_auth = true;
            connectInfo.adm_username = changeInfo.cookie.value;

            connect();
		}
        if (changeInfo.cookie.domain === 'adm.avito.ru' && changeInfo.cookie.name === 'adm_username' && changeInfo.removed === true) {
            console.log('You logout from adm.avito.ru as ' + changeInfo.cookie.value);

            connectInfo.adm_auth = false;
            connectInfo.adm_username = null;

            disconnect();
        }
	});
}

function connect() {
    if (connectInfo.adm_auth) {
        chrome.storage.local.get('password', result => {
            const password = result.password ? result.password : null;

            login(connectInfo.adm_username, password)
                .then(() => {
                    connectInfo.spring_auth = true;
                    connectInfo.spring_reconnect = false;
                    connectInfo.error = null;

                    reconnect();
                    startWebSocket();
                    return getPrincipal();
                }, error => {
                    connectInfo.spring_auth = false;

                    if (error.message === 'No message available') error.message = error.error;
                    if (error.message === 'Failed to fetch') {
                        error.status = "(failed)";
                        connectInfo.status = null;
                    }
                    if (error.message === 'Authentication with ajax is failure') {
                        if (password) error.status = 4012;
                        else error.status = 4011;
                    }
                    errorMessage(error.status, error.message);
                })
                .then(() => setConnectInfoToStorage());
        });
    }
}

function disconnect() {
    if (!connectInfo.adm_auth) {
        logout();
        connectInfo.spring_auth = false;
        connectInfo.spring_user = null;

        connectInfo.status = null;

        chrome.storage.local.set({script: null});
        chrome.storage.local.set({authorities: null});

        errorMessage(connectInfo.status);
        setConnectInfoToStorage();
    }
}

function reconnect() {
    if (connectInfo.spring_reconnect) chrome.alarms.create('reconnect', {delayInMinutes: 1, periodInMinutes: 1});
    else chrome.alarms.clear('reconnect');
}

function login(username, password) {
    let formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);

    const headers = {
        method: 'POST',
        credentials: 'include',
        headers: { "X-Ajax-call": 'true' },
        body: formData
    };

    return fetch(`${connectInfo.spring_url}/login`, headers)
        .then(response => {
            connectInfo.status = response.status;

            if (response.status === 200) return Promise.resolve();
            else return errorListener(response);
        });
}

function logout() {
    return fetch(`${connectInfo.spring_url}/logout`, { credentials: 'include' });
}

function getPrincipal() {
    return fetch(`${connectInfo.spring_url}/auth/principal`, { credentials: 'include', redirect: 'error' })
        .then(response => {
            connectInfo.status = response.status;

            if (response.status === 200) return response.json();
            else return errorListener(response);
        })
        .then(json => {
            connectInfo.spring_user = json;
            setAuthoritiesToStorage(json.principal.authoritiesMap);
        }, error => errorMessage(error.status, error.error));
}

function setBudgetIcon(script) {
    switch (script) {
        case true:
            chrome.browserAction.setBadgeText({text: 'On'});
            chrome.browserAction.setBadgeBackgroundColor({color: '#e2442c'});

            console.log('Content scripts - On');
            break;
        case false:
            chrome.browserAction.setBadgeText({text: "Off"});
            chrome.browserAction.setBadgeBackgroundColor({color: '#595959'});

            console.log('Content scripts - Off');
            break;
        default:
            chrome.browserAction.setBadgeText({text: ''});
    }
}

function setConnectInfo(connectInfo) {
    this.connectInfo = connectInfo;
}

function setAuthoritiesToStorage(authorities) {
    chrome.storage.local.get('authorities', result => {
        const tmp = result.authorities ? result.authorities : {};

        for (let key in tmp)
            if (key in authorities) authorities[key] = tmp[key];

        chrome.storage.local.set({ authorities: authorities });
    });
}

function setConnectInfoToStorage() {
    chrome.storage.local.set({ connectInfo: connectInfo });
}

function errorListener(response) {
    return response.json().then(json => { throw json }, () => { throw { message: response.statusText, status: response.status }; });
}

function errorMessage(status, error) {
    const previousError = connectInfo.error;

    switch (status) {
        case null:
            connectInfo.error = "Для продолжения работы с Admin.Helper, вам необходимо зайти в adm.avito.ru";
            connectInfo.spring_reconnect = false;
            break;
        case "(failed)":
            connectInfo.error = "Отсутствует соединение с сервером\nЕсли проблема сохраняется в течение длительного времени, сообщите тимлидеру";
            connectInfo.spring_reconnect = true;
            break;
        case 4012:
            connectInfo.error = "Вы ввели неправильный пароль";
            connectInfo.spring_reconnect = false;
            break;
        case 4011:
            connectInfo.error = "Вас нет в списке пользователей или у вас установлен персональный пароль";
            connectInfo.spring_reconnect = false;
            break;
        case 401:
            connectInfo.error = status + " " + error + "\nПроблемы с аутентификацией\nСообщите о проблеме тимлидеру";
            connectInfo.spring_reconnect = false;
            break;
        case 403:
            connectInfo.error = status + " " + error + "\nС вашего IP адреса отсутствует доступ к расширению";
            connectInfo.spring_reconnect = true;
            break;
        case 500:
            connectInfo.error = status + " " + error + "\nК сожалению, произошла техническая ошибка\nПопробуйте закрыть окно расширения и открыть его заново";
            connectInfo.spring_reconnect = true;
            break;
        case 502:
            connectInfo.error = status + " " + error + "\nНа сервере проводятся технические работы\nЕсли проблема сохраняется в течение длительного времени, сообщите тимлидеру";
            connectInfo.spring_reconnect = true;
            break;
        case 504:
            connectInfo.error = status + " " + error + "\nСервер не может получить ответ вовремя\nЕсли проблема сохраняется в течение длительного времени, сообщите тимлидеру";
            connectInfo.spring_reconnect = true;
            break;
        default:
            connectInfo.error = status + " " + error + "\nСообщите о проблеме тимлидеру";
            connectInfo.spring_reconnect = true;
    }

    if (previousError !== connectInfo.error) {
        reconnect();
        addChromeNotification("Ошибка: " + connectInfo.error);
    }
}

function startWebSocket() {
    const socket = new SockJS(`${connectInfo.spring_url}/ws`);
    stompClient = Stomp.over(socket);
    stompClient.debug = null;
    stompClient.connect({}, stompSuccessCallback, stompFailureCallback);

    function stompSuccessCallback() {
        chrome.storage.local.set({notifications: {}});

        stompClient.subscribe('/user/queue/error', e => console.log(e));

        stompClient.subscribe('/user/queue/notification.new', addNotificationToStorage);

        stompClient.subscribe('/user/queue/notification.update', removeNotificationFromStorage);

        stompClient.send('/app/notification/unread', {});
    }

    function stompFailureCallback() {
        chrome.storage.local.set({notifications: {}});

        connect();
    }

    function addNotificationToStorage(response) {
        const newNotifications = JSON.parse(response.body);

        chrome.storage.local.get('notifications', result => {
            let notifications = result.notifications;
            notifications.old = null;

            if (notifications.all) {
                notifications.all = notifications.all.concat(newNotifications);
                notifications.new = newNotifications
            } else notifications.all = newNotifications;

            result.notifications = notifications;
            chrome.storage.local.set(result);
        });
    }

    function removeNotificationFromStorage(response) {
        const oldNotifications = JSON.parse(response.body);

        chrome.storage.local.get('notifications', result => {
            let notifications = result.notifications;
            notifications.new = null;

            for (let i = 0; i < notifications.all.length; ++i)
                if (notifications.all[i].notification.uuid === oldNotifications.notification.uuid)
                    notifications.all.splice(i, 1);

            notifications.old = oldNotifications;

            result.notifications = notifications;
            chrome.storage.local.set(result);
        });
    }
}

function moderationListener(details) {
	let count = 0, ids, reason = '', items_id = '';

	let formData = details.requestBody.formData;

    if (!formData) return;

	if (formData['reasons[]']) reason = formData['reasons[]'].join();
	
	//pre
	if (details.url === `${connectInfo.adm_url}/items/moder/submit/all`) {
		chrome.storage.local.get(function (result) {
            let blockedItemsID;
			if (!result.blockedItemsID) blockedItemsID = [];
			else blockedItemsID = result.blockedItemsID;
			
			for (let key in formData) {
				if (key.indexOf('[id]')+1) ++count;

				for (let i = 0; i < blockedItemsID.length; ++i) {
					if (formData[key] === blockedItemsID[i]) --count;
				}
			}
			
			sendLogToDB('allow all', reason, count, items_id);
			chrome.storage.local.set({'blockedItemsID': []});
		});
	}
	
	if (details.url === `${connectInfo.adm_url}/items/moder/submit`) {
		count = formData['item_id'].length;
        items_id = formData['item_id'].join();

        if (formData['action'] == 'reject') sendLogToDB('reject item', reason, count, items_id);
		if (formData['action'] == 'block') sendLogToDB('block item', reason, count, items_id);
	}
	
	//post
	if (details.url === `${connectInfo.adm_url}/items/item/reject`) {
		if (formData['id[]']) {
			count = formData['id[]'].length;
			ids = formData['id[]'];
            items_id = ids.join();
		} else { 
			count = formData['id'].length;
			ids = formData['id'];
            items_id = ids.join();
		}
		
		sendLogToDB('reject item', reason, count, items_id);
		addBlockedItemsIDtoStorage(ids);
	}
	if (details.url === `${connectInfo.adm_url}/items/item/block`) {
		if (formData['id[]']) {
			count = formData['id[]'].length;
			ids = formData['id[]'];
            items_id = ids.join();
		} else { 
			count = formData['id'].length;
			ids = formData['id'];
            items_id = ids.join();
		}
	
		sendLogToDB('block item', reason, count, items_id);
		addBlockedItemsIDtoStorage(ids);
	}
	
	//comparison
	if (details.url.indexOf(`${connectInfo.adm_url}/items/comparison/`)+1 && details.url.indexOf('alive')+1) {
		let alive = details.url.split('/');
		count = formData['ids[]'].length-1;
		ids = formData['ids[]'];
        items_id = ids.join();
		
		let del = ids.indexOf(alive[7]);
		
		ids.splice(del, 1);
		
		sendLogToDB('block item', '20', count, items_id);
		addBlockedItemsIDtoStorage(ids);
	}
	if (details.url.indexOf(`${connectInfo.adm_url}/items/comparison/`)+1 && details.url.indexOf('block')+1) {
		count = formData['ids[]'].length;
        items_id = formData['ids[]'].join();
		let blockItem = details.url.split('/');
		ids = [blockItem[7]];
		
		sendLogToDB('block item', '20', 1, items_id);
		addBlockedItemsIDtoStorage(ids);
	}

	//comparison 3.0
    if (details.url.indexOf(`${connectInfo.adm_url}/items/comparison/moderate`)+1) {
        let comment = formData['comment'];
        let items = comment[0].split(', ');
        let tmp = items[0].split(':');
        let tmp1 = tmp[0].split('_');
        let baseItemID = [tmp1[2]];

        let countReject = 0;
        let countBlock = 0;
        let countAllow = true;

        for (let key in formData) {
            if( formData.hasOwnProperty( key ) ) {
                if (~key.indexOf('others') && ~key.indexOf('[reject]')) {
                    if (~key.indexOf(baseItemID.toString())) countAllow = false;
                    ++countReject;
                }
                if (~key.indexOf('others') && ~key.indexOf('[block]')) {
                    if (~key.indexOf(baseItemID.toString())) countAllow = false;
                    ++countBlock;
                }
                if (~key.indexOf('doubles')) {
                    if (~key.indexOf(baseItemID.toString())) countAllow = false;
                    ++countBlock;
                }
                if (~key.indexOf('revive')) countBlock--;
            }
        }

        if (countAllow) sendLogToDB('allow all', reason, 1, items_id);
        if (countBlock > 0) sendLogToDB('block item', '20', countBlock, items_id);
        if (countReject > 0) sendLogToDB('reject item', reason, countReject, items_id);
        addBlockedItemsIDtoStorage(baseItemID);
    }
	
	//users
	if (details.url === `${connectInfo.adm_url}/users/user/block`) {
		count = formData['id'].length;
        items_id = formData['id'].join();
		
		sendLogToDB('block user', reason, count, items_id);
	}

	if (details.url === `${connectInfo.adm_url}/detectives/queue/add`) {
        items_id = formData['itemId'].join();
        sendLogToDB('detectives', reason, 1, items_id);
    }
}

function addBlockedItemsIDtoStorage(ids) {
	chrome.storage.local.get(function (result) {
        let blockedItemsID;
		if (!result.blockedItemsID) blockedItemsID = [];
		else blockedItemsID = result.blockedItemsID;
		
		blockedItemsID = blockedItemsID.concat(ids);
		
		chrome.storage.local.set({'blockedItemsID': blockedItemsID});
	});
}

function sendLogToDB(type, reason, count, items_id) {
	let row = {
        username_id: connectInfo.spring_user.principal.id,
        type: type,
        items_id: items_id,
        reason: reason,
        count: count
	};
	
	let jsonRow = JSON.stringify(row);
	
	let xhr = new XMLHttpRequest();
	xhr.open('POST', 'http://avitoadm.ru/journal/include/php/mod_stat/add.php', true);
	xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
	xhr.send("param="+jsonRow);
	xhr.onreadystatechange = function () {
		if(xhr.readyState === 4 && xhr.status === 200) {
			sendLogToStorage(type, count);
		}
	};
}

function sendLogToStorage(type, count) {
	chrome.storage.local.get('mod_stat', result => {
		if (!result.mod_stat) {
			let mod_stat = {
				'mod_stat': {
					'blockUserCount': type === 'block user' ? count : 0,
					'blockItemCount': type === 'block item' ? count : 0,
					'rejectItemCount': type === 'reject item' ? count : 0,
					'allowAllCount': type === 'allow all' ? count : 0
				}
			};
            chrome.storage.local.set(mod_stat);
		} else {
            if (type === 'block user') {
                result.mod_stat['blockUserCount'] += count;
                chrome.storage.local.set(result);
            }
            if (type === 'block item') {
                result.mod_stat['blockItemCount'] += count;
                chrome.storage.local.set(result);
            }
            if (type === 'reject item') {
                result.mod_stat['rejectItemCount'] += count;
                chrome.storage.local.set(result);
            }
            if (type === 'allow all') {
                result.mod_stat['allowAllCount'] += count;
                chrome.storage.local.set(result);
            }
        }
	});
}

function clearDayInfo() {
	if (newDay(localStorage.currentDay)) {
		let mod_stat = {
			'mod_stat': {
				'blockUserCount': 0,
				'blockItemCount': 0,
				'rejectItemCount': 0,
				'allowAllCount': 0
			}
		};

		chrome.storage.local.set(mod_stat);
	}
}

function newDay(currentDay) {
	let date = new Date();
    let day = date.getDate();
    let month = date.getMonth()+1;
    let year = date.getFullYear();

	if (!currentDay) {
		localStorage.currentDay = year+'-'+month+'-'+day;
		return true;
	} else {
        currentDay = currentDay.split('-');
		if (currentDay[2] < day) {
            localStorage.currentDay = year+'-'+month+'-'+day;
			return true;
		} else if (currentDay[1] < month) {
            localStorage.currentDay = year+'-'+month+'-'+day;
			return true;
		} else if (currentDay[0] < year) {
            localStorage.currentDay = year+'-'+month+'-'+day;
			return true;
		} else {
			return false;
		}
	}
}

function requestListener(tabId, url) {

	// helpdesk
	if ( ~url.indexOf(`${connectInfo.adm_url}/helpdesk/api/1/ticket/edit/`) ) {
		sendMessage(tabId, 'ticketEdit');
	}
	if ( ~url.indexOf(`${connectInfo.adm_url}/helpdesk/api/1/ticket/`) && ~url.search(/\/comment\b/)) {
		sendMessage(tabId, 'ticketComment');
	}
	if ( ~url.indexOf(`${connectInfo.adm_url}/helpdesk/api/1/ticket/`) && ~url.search(/\/pending\b/)) {
		sendMessage(tabId, 'ticketPending');
	}
	if ( ~url.indexOf(`${connectInfo.adm_url}/helpdesk/api/1/ticket/`) && ~url.search(/\/solve\b/)) {
		sendMessage(tabId, 'ticketSolve');
	}
	if ( ~url.indexOf(`${connectInfo.adm_url}/helpdesk/api/1/ticket/`) && ~url.search(/\/onHold\b/)) {
		sendMessage(tabId, 'ticketOnHold');
	}
	if ( ~url.indexOf(`${connectInfo.adm_url}/helpdesk/api/1/ticket/`) && ~url.search(/\/spam\b/)) {
		sendMessage(tabId, 'ticketSpam');
	}
	if ( ~url.indexOf(`${connectInfo.adm_url}/helpdesk/api/1/ticket/`) && ~url.search(/\/duplicate\b/)) {
		sendMessage(tabId, 'ticketDuplicate');
	}
	if ( ~url.indexOf(`${connectInfo.adm_url}/helpdesk/api/1/ticket/`) && ~url.search(/\/take\b/)) {
		sendMessage(tabId, 'ticketTake');
	}

	let userPattern = /helpdesk\/api\/1\/user\/\d+$/;
    if (userPattern.test(url)) {
        sendMessage(tabId, 'ticketUser');
    }

	if (url.indexOf(`${connectInfo.adm_url}/helpdesk/api/1/ticket/search`)+1) {
		sendMessage(tabId, 'ticketQueue');
	}

	if (url.indexOf(`${connectInfo.adm_url}/helpdesk/api/1/ticket/`)+1 && url.indexOf('/logs') === -1) {
		sendMessage(tabId, 'ticketInfo');
	}
	if ((~url.indexOf(`${connectInfo.adm_url}/helpdesk/api/1/ticket/`) && ~url.search(/\/list\b/)) || ~url.indexOf(`${connectInfo.adm_url}/helpdesk/api/1/ticket/next`)) {
		sendMessage(tabId, 'ticketEnter');
	}
	
	if (~url.indexOf(`${connectInfo.adm_url}/helpdesk/api/1/ticket/`) && ~url.search(/\/comments\b/)) {
		sendMessage(tabId, 'ticketComments');
	}

	// item/info
	let itemAdmHistoryPattern = /items\/item\/info\/\d+\/history/,
		itemHistoryPattern = /items\/item\/info\/\d+\/frst_history/;

    if (itemAdmHistoryPattern.test(url)) {
        sendMessage(tabId, 'itemAdmHistory');
    }

    if (itemHistoryPattern.test(url)) {
        sendMessage(tabId, 'itemHistory');
    }

    // user/info
    let userAdmHistoryPattern = /users\/user\/info\/\d+\/usr_adm_history/;
    if (userAdmHistoryPattern.test(url)) {
        sendMessage(tabId, 'userAdmHistory');
    }
}

function sendMessage(tabId, msg) {	
	chrome.tabs.sendMessage(tabId, { onUpdated: msg });
}