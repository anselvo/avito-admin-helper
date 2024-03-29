
function startNotification(notifications) {
    notificationBar();
    notificationsWS(notifications);
    setInterval(startAllowList, 180000);
}

function notificationsWS(notifications) {
    notificationAddWS(notifications.all);

    chrome.storage.onChanged.addListener(changes => {
        if (changes.notifications) {
            notifications = changes.notifications;

            if (notifications.newValue.new) notificationAddWS(notifications.newValue.new);
            if (notifications.newValue.old) notificationRemoveWS(notifications.newValue.old);
        }
    });
}

function notificationAddWS(notifications) {
	if (notifications) {
        if (Array.isArray(notifications)) {
            for (let i = 0; i < notifications.length; ++i) {
                let name = notifications[i].notification.head.replace(' ', '').toLowerCase();

                notificationBarAdd(notifications[i].notification.uuid,
                    name + 'Header',
                    notifications[i].notification.head,
                    name + 'Body',
                    notifications[i].notification.body);
            }
        } else {
            notificationBarAdd(notifications.notification.uuid,
                name + 'Header',
                notifications.notification.head,
                name + 'Body',
                notifications.notification.body);
        }
    }
}

function notificationRemoveWS(notifications) {
    $('#' + notifications.notification.uuid).parents('.ah-notificationBarItem').remove();

    notificationBarStatus();
}

//---------- Allow List Checker ----------//

function startAllowList() {
	if (global.userInfo.subdivision) allowListCheck(global.userInfo.subdivision.subdivision, global.userInfo.username);
}

function allowListCheck(agentLine, agentlogin) {
	if (agentLine === 'S1' || agentLine === 'SD') {
		findItemsFromAllowList(agentlogin);
	}
	if (agentLine === 'S2' || agentLine === 'SD') {
		parseAllowListCheckingItems(agentlogin);
	}
}

function findItemsFromAllowList(agentlogin) {
	if (localStorage.allowList) {
		var len = $('.allowListItemHeaderChecked').length;

		for (var i = 0; i < len; ++i) {
			var itemChecked = $('.allowListItemHeaderChecked span').slice(i, i+1).attr('id').replace('checked', '');
			if (localStorage.allowList.indexOf(itemChecked) === -1) $('#checked'+itemChecked).click();
		}

		if (localStorage.allowList !== '') {
			var myItems = localStorage.allowList.split('|');
			var myItemsLen = myItems.length;

			for (var i = 1; i < myItemsLen; i++) {
				var tmp = myItems[i].split('&');
				var item = tmp[0];
				var time = tmp[1];

				if ($('#checked'+item).length === 0) isItemChecked('status', 'checked', item, time);
			}
		}
	}
}

function isItemChecked(reason, reasonText, item, time) {
	var data = reason+'&'+reasonText+'&'+item+'&'+time;

	chrome.runtime.sendMessage({
			action: 'XMLHttpRequest',
			method: "POST",
			url: `${global.connectInfo.ext_url}/support_helper/allowlist/allowlistchecker.php`,
			data: data,
		}, function(response) {
			var jsonParse = JSON.parse(response);
			var len = jsonParse.length;

			if (len > 0) {
				var itemID = jsonParse[0].itemID;
				var msg = jsonParse[0].msg;
				var modAgentID = jsonParse[0].modAgentID;

				notificationBarAdd('checked'+itemID,'allowListItemHeaderChecked', 'Allow List', 'allowListItemBodyChecked', `<span style="color:black;"><a href="${global.connectInfo.adm_url}/items/item/info/${itemID}" target="_blank">${itemID}</a> is checked by </span><span style="color:#9C27B0;">${modAgentID}</span><br><span>MSG: ${msg}</span>`);

				$('#checked'+itemID).click(function () {
					localStorage.allowList = localStorage.allowList.replace('|'+item+'&'+time,'');
				});
			}
		}
	);
}

function parseAllowListCheckingItems(agentlogin) {

	var data = 'status&check';

	chrome.runtime.sendMessage({
			action: 'XMLHttpRequest',
			method: "POST",
			url: `${global.connectInfo.ext_url}/support_helper/allowlist/allowlistchecker.php`,
			data: data,
		}, function(response) {
        	try {
				var jsonParse = JSON.parse(response);
				var len = jsonParse.length;
				$('.itemIDal').addClass('oldItem');

				if (len > 0) {
                    for (var i = 0; i < len; i++) {
                        var agentID = jsonParse[i].agentID;
                        var itemID = jsonParse[i].itemID;
                        var startTime = jsonParse[i].time;

                        var lenIDal = $('.itemIDal').length;
                        var itemCheck = false;

                        for (var j = 0; j < lenIDal; j++) {
                            var itemIDal = $('.itemIDal').slice(j, j + 1).text();
                            if (itemID == itemIDal) {
                                itemCheck = true;
                                $('.itemIDal:contains(' + itemIDal + ')').removeClass('oldItem');
                            }
                        }

                        if (!itemCheck) {
                            notificationBarAdd('check' + itemID, 'allowListItemHeaderCheck', 'Allow List', 'allowListItemBodyCheck', '<span class="itemIDal" style="color:black;">' + itemID + '</span><span class="agentIDal" style="color:#33691E;margin-left:8px;">' + agentID + '</span><span class="checkAllowListItem pseudo-link" style="float: right;" item="' + itemID + '" startTime="' + startTime + '">проверить</span>');
                            allowListButtonListener(itemID, agentlogin);
                        }
                    }

                    notificationBarStatus('on');
				}
				$('.oldItem').parents('.ah-notificationBarItem').find('.ah-notificationRemove').click();
            } catch (e) {
				console.log('allowListChecker have problem with JSON or server');
            }
		}
	);
}

function allowListButtonListener(currentItem, agentlogin) {
	$('[item='+currentItem+']').click(function () {
		var startTime = $('[item='+currentItem+']').attr('startTime');

		checkAllowListItem('status', 'check', currentItem, startTime, agentlogin);
	});
}

function checkAllowListItem(reason, reasonText, item, time, agentlogin) {
	var data = reason+'&'+reasonText+'&'+item+'&'+time;

	chrome.runtime.sendMessage({
			action: 'XMLHttpRequest',
			method: "POST",
			url: `${global.connectInfo.ext_url}/support_helper/allowlist/allowlistchecker.php`,
			data: data,
		}, function(response) {
			var jsonParse = JSON.parse(response);
			var len = jsonParse.length;

			if (len > 0) {
				window.open(`${global.connectInfo.adm_url}/items/item/info/${item}?st=${encodeURIComponent(time)}`);
				changeAllowListItem(item, time, 'modAgentID', agentlogin);
				changeAllowListItem(item, time, 'status', 'checking');
				$('[item='+item+']').parents('.ah-notificationBarItem').find('.ah-notificationRemove').click();
				global.existGlobal = undefined;
			} else {
				alert('Данное объявление уже проверяется другим агентом.');
				$('[item='+item+']').parents('.ah-notificationBarItem').find('.ah-notificationRemove').click();
				global.existGlobal = undefined;
			}
		}
	);
}

function changeAllowListItem(item, time, reason, reasonText) {
	var data = item+'&'+time+'&'+reason+'&'+reasonText;

	chrome.runtime.sendMessage({
			action: 'XMLHttpRequest',
			method: "POST",
			url: `${global.connectInfo.ext_url}/support_helper/allowlist/allowlistchange.php`,
			data: data,
		}, function(response) {
			console.log(response);
		}
	);
}

//++++++++++ Allow List Chaker ++++++++++//

//---------- Notification Bar ----------//
function notificationBar() {
	$('div.navbar-fixed-top ul.navbar-nav:last').append('<div class="ah-nb-wheel"></div>');

	$('body').append('<div id="ah-notifications"></div>');

	const $notification = $('#ah-notifications');

    $notification
        .append('<div class="ah-notificationArrow ah-notificationArrowBorder" style="right:10px;"></div>')
        .append('<div class="ah-notificationArrow" style="right:10px;"></div>')
        .append('<div id="ah-notificationBar"></div>');

	$('#ah-notificationBar')
        .append('<div id="noNotifications" style="text-align: center; width: 100%">no notifications</div>')
        .append('<div class="ah-notificationBarCloseAll"><a id="ah-notificationBarCloseAll">close all</a></div>');

	$('.ah-nb-wheel').click(() => $notification.toggle());

    $('#ah-notificationBarCloseAll').click(() => {
        $('.ah-notificationBarCloseAll').hide();
        $('.ah-notificationBarItem span').click();

        notificationBarStatus()
    });
}

function notificationBarAdd(idRemove, classHeader, header, classBody, body) {
	$('#ah-notificationBar').append('<div class="ah-notificationBarItem">' +
            '<div class="ah-notificationBarHeader ' + classHeader + '" style="font-weight:bold;">' + header +
                '<span id="' + idRemove + '" class="ah-notificationRemove">&#10060</span>' +
            '</div>' +
            '<div class="ah-notificationBarBody '+classBody+'">'+body+'</div>' +
        '</div>');

    if ($('.ah-notificationBarItem').length > 5) $('.ah-notificationBarCloseAll').show();

	document.getElementById(idRemove).addEventListener('click', () => {
        chrome.runtime.sendMessage({
                action: 'ws',
                notification: {
                    status: 'read',
                    uuid: idRemove
                }
            }
        );
	});

    notificationBarStatus();
}

function notificationBarStatus() {
    let $wheel = $('.ah-nb-wheel');
    let $notifications = $('.ah-notificationBarItem');

    if ($notifications.length > 0) {
        $wheel.addClass('ah-barOn').text($notifications.length);
        $('#noNotifications').hide();
    } else {
        $wheel.removeClass('ah-barOn').text('');
        $('#noNotifications').show();
    }
}
//++++++++++ Notification Bar ++++++++++//
