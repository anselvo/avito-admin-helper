let SCRIPT, USER;
let stompClient = null;

chrome.storage.local.get(function (result) {
    SCRIPT = result.script;
    USER = result.user;

    testWebSocket(USER, '0000');
    setBadgetIcon(SCRIPT);
});

// ПРОВЕРКА НА ОБНОВЛЕНИЯ
chrome.runtime.onUpdateAvailable.addListener(function(details) {
    // принудительное обновление расширения
    chrome.runtime.reload();

});

// ЛОВИТ КОГДА РАСШИРЕНИЕ УСТАНОВЛЕНО ИЛИ ОБНОВЛЕННО
chrome.runtime.onInstalled.addListener(function(details) {
	//нотификация об апдейте расширения
    let message;
    let version = chrome.runtime.getManifest().version;

    if (details.reason === 'update') message = "Avito Helper is updated\nPrevious version is "+details.previousVersion+"\nNew version is "+version;
    if (details.reason === 'install')  message = "Thanks you for installing Avito Helper\nCurrent version is "+version;

    let options = {
        type: "basic",
        title: "Avito Helper",
        message: message,
        iconUrl: "image/notificationLogo.png",
    };
    chrome.notifications.create(options);

	// определяем кто залогинен в админку
	cookieInfo();

	// запускаем чекер дня
    chrome.alarms.create('day', {delayInMinutes: 1, periodInMinutes: 1});
});

// ЛОВИТ БУДИЛЬНИК
chrome.alarms.onAlarm.addListener(function(alarm) {
    if (alarm.name === 'day') clearDayInfo();
});

// ОПРЕДЕЛЯЕТ КАКАЯ ВКЛАДКА АКТИВНАЯ
chrome.tabs.onActivated.addListener(function (info) {
	chrome.tabs.get(info.tabId, function(tab){
		iconStatus(info.tabId, tab.url);
	});
});

// ЛОВИТ ИЗМЕНЕНИЯ ВО ВКЛАДКАХ
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
	iconStatus(tabId, tab.url);
	
	if (changeInfo.status === 'complete') chrome.tabs.sendMessage(tabId, {onUpdated: 'complete'});
});

// ЛОВИТ КАКИЕ ЗАПРОСЫ ОТПРАВЛЕНЫ НА СЕРВЕР
chrome.webRequest.onBeforeRequest.addListener(
	function (details) {
        //console.log(details);
        if (details.method === 'POST' && details.requestBody) {
            if (SCRIPT === 'moderator') moderationListener(details, USER);
            if (SCRIPT === 'smm') smmListener(details);
		}
    },
    {urls: ["https://adm.avito.ru/*", "https://br-analytics.ru/*"]},
    ['blocking', 'requestBody']
);

// ЛОВИТ КАКИЕ ОТВЕТЫ ПОЛУЧЕНЫ ОТ СЕРВЕРА
chrome.webRequest.onCompleted.addListener(function (detailsURL) {
        requestListener(detailsURL.tabId, detailsURL.url);
	}, 
	{ urls: ["https://adm.avito.ru/*"] }
);

// ЛОВИТ ИНФОРМАЦИЮ ОБ ИЗМЕНЕНИИ СТОРАДЖА
chrome.storage.onChanged.addListener(function (result) {
	if ("script" in result) {
	    SCRIPT = result.script.newValue;
	    setBadgetIcon(SCRIPT);

    }
    if ("user" in result) {
        USER = result.user.newValue;
	}
});

// ЛОВИТ СООБЩЕНИЯ
chrome.runtime.onMessage.addListener(function(request, sender, callback) {
    if (request.action === "XMLHttpRequest") {
        let xhttp = new XMLHttpRequest();
        let method = request.method ? request.method.toUpperCase() : 'GET';	
		
		xhttp.open(method, request.url, true);
		
        if (method === 'POST') {
            let contentType = request.contentType ? request.contentType : 'application/x-www-form-urlencoded';
            xhttp.setRequestHeader('Content-Type', contentType);
        }

        xhttp.send(request.data);

        xhttp.onload = function() {
            callback(xhttp.responseText);
        };
        xhttp.onerror = function() {
            callback('error');
        };
        
        return true;
    }

	if (request.action === "copyToClipboard") {
		const textarea = document.createElement('textarea');
        textarea.style.position = 'fixed';
        textarea.style.opacity = 0;
        textarea.value = request.text;
		document.body.appendChild(textarea);
        textarea.select();
		document.execCommand('Copy');
		document.body.removeChild(textarea);
	}

    if (request.action === 'ws') {
        if (request.notification.status === 'read') {
            stompClient.send('/app/notification/update/read', {}, request.notification.uuid);
        }
    }
});

function cookieInfo() {
	chrome.cookies.get({'url': 'https://adm.avito.ru/', 'name': 'adm_username'}, function(cookie) {
		if (cookie) {
			console.log('You login to adm.avito.ru as '+cookie.value);
			userInfo(cookie.value);
		} else {
			console.log('You not login in adm.avito.ru');

            localStorage.scriptStatus = 'off';
            chrome.storage.local.set({'script': 'none'});
            chrome.storage.local.set({'user': 'none'});
		}
	});

	chrome.cookies.onChanged.addListener(function (changeInfo){
		if (changeInfo.cookie.domain === 'adm.avito.ru' && changeInfo.cookie.name === 'adm_username' && changeInfo.removed === false) {
			console.log('You login to adm.avito.ru as '+changeInfo.cookie.value);
			userInfo(changeInfo.cookie.value);
		}
        if (changeInfo.cookie.domain === 'adm.avito.ru' && changeInfo.cookie.name === 'adm_username' && changeInfo.removed === true) {
            console.log('You logout from adm.avito.ru as '+changeInfo.cookie.value);

            localStorage.scriptStatus = 'off';
            chrome.storage.local.set({'script': 'none'});
            chrome.storage.local.set({'user': 'none'});
        }
	});
}

function userInfo(username) {
	let table = { 
		username: username,
	};
	
	let jsonTable = JSON.stringify(table);
	
	let xhr = new XMLHttpRequest();
	xhr.open('POST', 'http://avitoadm.ru/journal/include/php/user/getByName.php', true);
	xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
	xhr.send("param="+jsonTable);
	xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            let json = JSON.parse(xhr.responseText);
			if (json.table.length === 0) {
				chrome.storage.local.set({'user': 'user does not exist'});

                localStorage.scriptStatus = 'off';
                chrome.storage.local.set({'script': 'none'});

                console.log('user does not exist');
			} else {
				chrome.storage.local.set({'user': json.table[0]});
			}
        }
    };
}

function smmListener(details) {
    if (details.url === 'https://br-analytics.ru/elastic/ajax/12381016/update/') {
        let requestBody = decodeURIComponent(String.fromCharCode.apply(null,
            new Uint8Array(details.requestBody.raw[0].bytes)));

        let json = JSON.parse(requestBody)

        let messageId = json.filter.fmessage[0];
        let tagString = json.changes.tags.tag_string;


        smmLogToDB(messageId, tagString);

        console.log(json);
    }
}

function smmLogToDB(messageId, tagString) {
    let log = {
        messageId: messageId,
        tagString: tagString,
        usernameId: USER.id
    };

    let json = JSON.stringify(log);
    let url = 'http://spring.avitoadm.ru/smmstat/update';

    $.ajax({
        url: url,
        type: 'PUT',
        data: json,
        contentType: "application/json"
    }).then(function(data) {

        console.log(data);
    });
}

function moderationListener(details, user) {
	let count = 0, ids, reason = '', items_id = '';

	let formData = details.requestBody.formData;

    if (!formData) return;

	if (formData['reasons[]']) reason = formData['reasons[]'].join();
	
	//pre
	if (details.url === 'https://adm.avito.ru/items/moder/submit/all') {
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
			
			sendLogToDB('allow all', reason, count, user, items_id);
			chrome.storage.local.set({'blockedItemsID': []});
		});
	}
	
	if (details.url === 'https://adm.avito.ru/items/moder/submit') {
		count = formData['item_id'].length;
        items_id = formData['item_id'].join();


        console.log(formData['action']);

        if (formData['action'] == 'reject') sendLogToDB('reject item', reason, count, user, items_id);
		if (formData['action'] == 'block') sendLogToDB('block item', reason, count, user, items_id);
	}
	
	//post
	if (details.url === 'https://adm.avito.ru/items/item/reject') {
		if (formData['id[]']) {
			count = formData['id[]'].length;
			ids = formData['id[]'];
            items_id = ids.join();
		} else { 
			count = formData['id'].length;
			ids = formData['id'];
            items_id = ids.join();
		}
		
		sendLogToDB('reject item', reason, count, user, items_id);
		addBlockedItemsIDtoStorage(ids);
	}
	if (details.url === 'https://adm.avito.ru/items/item/block') {
		if (formData['id[]']) {
			count = formData['id[]'].length;
			ids = formData['id[]'];
            items_id = ids.join();
		} else { 
			count = formData['id'].length;
			ids = formData['id'];
            items_id = ids.join();
		}
	
		sendLogToDB('block item', reason, count, user, items_id);
		addBlockedItemsIDtoStorage(ids);
	}
	
	//comparison
	if (details.url.indexOf('https://adm.avito.ru/items/comparison/')+1 && details.url.indexOf('alive')+1) {
		let alive = details.url.split('/');
		count = formData['ids[]'].length-1;
		ids = formData['ids[]'];
        items_id = ids.join();
		
		let del = ids.indexOf(alive[7]);
		
		ids.splice(del, 1);
		
		sendLogToDB('block item', '20', count, user, items_id);
		addBlockedItemsIDtoStorage(ids);
	}
	if (details.url.indexOf('https://adm.avito.ru/items/comparison/')+1 && details.url.indexOf('block')+1) {
		count = formData['ids[]'].length;
        items_id = formData['ids[]'].join();
		let blockItem = details.url.split('/');
		ids = [blockItem[7]];
		
		sendLogToDB('block item', '20', 1, user, items_id);
		addBlockedItemsIDtoStorage(ids);
	}

	//comparison 3.0
    if (details.url.indexOf('https://adm.avito.ru/items/comparison/moderate')+1) {
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

        if (countAllow) sendLogToDB('allow all', reason, 1, user, items_id);
        if (countBlock > 0) sendLogToDB('block item', '20', countBlock, user, items_id);
        if (countReject > 0) sendLogToDB('reject item', reason, countReject, user, items_id);
        addBlockedItemsIDtoStorage(baseItemID);
    }
	
	//users
	if (details.url === 'https://adm.avito.ru/users/user/block') {
		count = formData['id'].length;
        items_id = formData['id'].join();
		
		sendLogToDB('block user', reason, count, user, items_id);
	}

	if (details.url === 'https://adm.avito.ru/detectives/queue/add') {
        items_id = formData['itemId'].join();
        sendLogToDB('detectives', reason, 1, user, items_id);
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

function sendLogToDB(type, reason, count, user, items_id) {
	let row = {
        username_id: user.id,
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
	chrome.storage.local.get('mod_stat', function (result) {
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
	if (newday(localStorage.currentDay)) {
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

function newday(currentDay) {
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
	if ( ~url.indexOf('https://adm.avito.ru/helpdesk/api/1/ticket/edit/') ) {
		sendMessage(tabId, 'ticketEdit');
	}
	if ( ~url.indexOf('https://adm.avito.ru/helpdesk/api/1/ticket/') && ~url.search(/\/comment\b/)) {
		sendMessage(tabId, 'ticketComment');
	}
	if ( ~url.indexOf('https://adm.avito.ru/helpdesk/api/1/ticket/') && ~url.search(/\/pending\b/)) {
		sendMessage(tabId, 'ticketPending');
	}
	if ( ~url.indexOf('https://adm.avito.ru/helpdesk/api/1/ticket/') && ~url.search(/\/solve\b/)) {
		sendMessage(tabId, 'ticketSolve');
	}
	if ( ~url.indexOf('https://adm.avito.ru/helpdesk/api/1/ticket/') && ~url.search(/\/onHold\b/)) {
		sendMessage(tabId, 'ticketOnHold');
	}
	if ( ~url.indexOf('https://adm.avito.ru/helpdesk/api/1/ticket/') && ~url.search(/\/spam\b/)) {
		sendMessage(tabId, 'ticketSpam');
	}
	if ( ~url.indexOf('https://adm.avito.ru/helpdesk/api/1/ticket/') && ~url.search(/\/duplicate\b/)) {
		sendMessage(tabId, 'ticketDuplicate');
	}
	if ( ~url.indexOf('https://adm.avito.ru/helpdesk/api/1/ticket/') && ~url.search(/\/take\b/)) {
		sendMessage(tabId, 'ticketTake');
	}

	let userPattern = /helpdesk\/api\/1\/user\/\d+$/;
    if (userPattern.test(url)) {
        sendMessage(tabId, 'ticketUser');
    }

	if (url.indexOf('https://adm.avito.ru/helpdesk/api/1/ticket/search')+1) {	
		sendMessage(tabId, 'ticketQueue');
	}

	if (url.indexOf('https://adm.avito.ru/helpdesk/api/1/ticket/')+1 && url.indexOf('/logs') === -1) {
		sendMessage(tabId, 'ticketInfo');
	}
	if ((~url.indexOf('https://adm.avito.ru/helpdesk/api/1/ticket/') && ~url.search(/\/list\b/)) || ~url.indexOf('https://adm.avito.ru/helpdesk/api/1/ticket/next')) {
		sendMessage(tabId, 'ticketEnter');
	}
	
	if (~url.indexOf('https://adm.avito.ru/helpdesk/api/1/ticket/') && ~url.search(/\/comments\b/)) {
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
	chrome.tabs.sendMessage(tabId, {onUpdated: msg});
}

function iconStatus(tabId, url) {
	if (url === undefined) {
		iconDisable(tabId);
	} else {
		iconEnable(tabId);
	}
}

function iconDisable(tabId) {
	chrome.browserAction.disable(tabId);
    chrome.browserAction.setBadgeBackgroundColor({color: "#c4c9c8"});
}

function iconEnable(tabId) {
    chrome.browserAction.enable(tabId);
    chrome.browserAction.setBadgeBackgroundColor({color: "#fbbc05"});
}

function setBadgetIcon(script) {
    if (script !== 'none' && script) {
		let logo = script.charAt(0).toUpperCase();
		chrome.browserAction.setBadgeText({text: logo});
		chrome.browserAction.setBadgeBackgroundColor({color: "#fbbc05"});

        console.log('Включен скрип: ' + SCRIPT);
	} else {
		chrome.browserAction.setBadgeText({text: ""});

        console.log('Скрипты выключены');
	}
}

function testWebSocket(user, password) {
    $.ajax({
        url: "http://spring.avitoadm.ru/login",
        type: 'POST',
        data: 'username=' + user.username + '&password=' + password,
        headers: { "X-Ajax-call": 'true' },
        success: () => {
            let socket = new SockJS('http://spring.avitoadm.ru/ws');
            stompClient = Stomp.over(socket);
            stompClient.debug = null;
            stompClient.connect({}, () => {
                chrome.storage.local.set({ notifications: {} });

                stompClient.subscribe('/user/queue/error', e => console.log(e));

                stompClient.subscribe('/user/queue/notification.new', addNotificationToStorage);

                stompClient.subscribe('/user/queue/notification.update', removeNotificationFromStorage);

                // get unread notification for login user
                stompClient.send('/app/notification/unread', {});

                // make notification as read
                // stompClient.send('/app/notification/update/read', {}, '66032c75-f287-42b2-9051-fd24a1da624a');
            });
        },
        error: result => {
            console.log(result);
        }
    });


    function addNotificationToStorage(response) {
        let newNotifications = JSON.parse(response.body);

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
        let oldNotifications = JSON.parse(response.body);

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