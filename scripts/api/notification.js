var userGlobalInfo;

chrome.storage.local.get(function (result) {
	userGlobalInfo = result.user;
});

chrome.runtime.onMessage.addListener(function(request, sender, callback) {
	if (request.notification) {
		var compactName = request.notification.name.toLowerCase().replace(' ', '');
		var id = compactName+request.notification.id;
		if ($('#'+id).length == 0) {
			notificationBarAdd(id, request.notification.name+'Header', request.notification.head, compactName+'Body', request.notification.body);
			$('#'+id).attr('time', request.notification.time);

			notificationBarStatus('on');
		}
	}
});

// запуск чекера для notification bar
setInterval(agentcheck, 180000);

// Notification Bar Start
$(document).ready(function () {
	notificationBar();
});
	
//---------- Allow List Chaker ----------//

function agentcheck() {
	allowListCheck(userGlobalInfo.subdivision, userGlobalInfo.username);
}

function allowListCheck(agentLine, agentlogin) {
	if (agentLine == 'S1' || agentLine == 'SD') {
		
		findItemsFromAllowList(agentlogin);
	}
	if (agentLine == 'S2' || agentLine == 'SD') {
		
		parseAllowListCheckingItems(agentlogin);
	}
}

function findItemsFromAllowList(agentlogin) {
	if (localStorage.allowList) {
		var len = $('.allowListItemHeaderChecked').length;
		
		for (var i = 0; i < len; ++i) {
			var itemChecked = $('.allowListItemHeaderChecked span').slice(i, i+1).attr('id').replace('checked', '');
			if (localStorage.allowList.indexOf(itemChecked) == -1) $('#checked'+itemChecked).click();
		}
		
		if (localStorage.allowList != '') {
			var myItems = localStorage.allowList.split('|');
			var myItemsLen = myItems.length;
			
			for (var i = 1; i < myItemsLen; i++) {
				var tmp = myItems[i].split('&');
				var item = tmp[0];
				var time = tmp[1];
				
				if ($('#checked'+item).length == 0) isItemChecked('status', 'checked', item, time);
			}
		}
	}
}

function isItemChecked(reason, reasonText, item, time) {
	var data = reason+'&'+reasonText+'&'+item+'&'+time;

	chrome.runtime.sendMessage({
			action: 'XMLHttpRequest',
			method: "POST",
			url: "http://avitoadm.ru/support_helper/allowlist/allowlistchecker.php",
			data: data,
		}, function(response) {
			var jsonParse = JSON.parse(response);
			var len = jsonParse.length;
			
			if (len > 0) {		
				var itemID = jsonParse[0].itemID;
				var msg = jsonParse[0].msg;
				var modAgentID = jsonParse[0].modAgentID;
				
				notificationBarAdd('checked'+itemID,'allowListItemHeaderChecked', 'Allow List', 'allowListItemBodyChecked', '<span style="color:black;"><a href="https://adm.avito.ru/items/item/info/'+itemID+'" target="_blank">'+itemID+'</a> is checked by </span><span style="color:#9C27B0;">'+modAgentID+'</span><br><span>MSG: '+msg+'</span>');
			
				$('#checked'+itemID).click(function () {
					localStorage.allowList = localStorage.allowList.replace('|'+item+'&'+time,'');
				});
				
				notificationBarStatus('on');
			}
		}
	);
}

function parseAllowListCheckingItems(agentlogin) {

	var data = 'status&check';

	chrome.runtime.sendMessage({
			action: 'XMLHttpRequest',
			method: "POST",
			url: "http://avitoadm.ru/support_helper/allowlist/allowlistchecker.php",
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
				$('.oldItem').parents('.notificationBarItem').find('.notificationRemove').click();
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

	var json;
	chrome.runtime.sendMessage({
			action: 'XMLHttpRequest',
			method: "POST",
			url: "http://avitoadm.ru/support_helper/allowlist/allowlistchecker.php",
			data: data,
		}, function(response) {
			var jsonParse = JSON.parse(response);
			var len = jsonParse.length;
			
			if (len > 0) {
				window.open('https://adm.avito.ru/items/item/info/'+item+'?st='+encodeURIComponent(time));
				changeAllowListItem(item, time, 'modAgentID', agentlogin);
				changeAllowListItem(item, time, 'status', 'checking');
				$('[item='+item+']').parents('.notificationBarItem').find('.notificationRemove').click();
				existGlobal = undefined;
			} else {
				alert('Данное объявление уже проверяется другим агентом.');
				$('[item='+item+']').parents('.notificationBarItem').find('.notificationRemove').click();
				existGlobal = undefined;
			}
		}
	);
}

function changeAllowListItem(item, time, reason, reasonText) {
	var data = item+'&'+time+'&'+reason+'&'+reasonText;

	chrome.runtime.sendMessage({
			action: 'XMLHttpRequest',
			method: "POST",
			url: "http://avitoadm.ru/support_helper/allowlist/allowlistchange.php",
			data: data,
		}, function(response) {
			console.log(response);
		}
	);
}

//++++++++++ Allow List Chaker ++++++++++//

//---------- Notification Bar ----------//
function notificationBar() {
	$('div.navbar-fixed-top ul.navbar-nav:last').append('<div class="nb-wheel"></div>');
	$('body').append('<div id="notifications"></div>');
	$('#notifications').append('<div class="notificationArrow notificationArrowBorder" style="right:10px;"></div>');
	$('#notifications').append('<div class="notificationArrow" style="right:10px;"></div>');
	$('#notifications').append('<div id="notificationBar"></div>');
	$('#notificationBar').append('<div id="noNotifications" style="text-align:center;weight:100%;">no notifications</div>');
    $('#notificationBar').append('<div class="notificationBarCloseAll"><a id="notificationBarCloseAll">close all</a></div>')
	
	$('.nb-wheel').click(function () {
		$('#notifications').toggle();
	});

    $('#notificationBarCloseAll').click(function () {
        $('.notificationBarCloseAll').hide();
        $('.notificationBarItem').remove();
        notificationBarStatus('off');

        var date = new Date();

        chrome.storage.local.set({'lastNotificationTime': date.getFullYear() + '-' + (date.getMonth()+1) + '-' + date.getDate() + ' ' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds()});
    });

    // hideElementOutClicking('#notifications');
}

function notificationBarAdd(idRemove, classHeader, header, classBody, body) {
	$('#notificationBar').append('<div class="notificationBarItem"><div class="notificationBarHeader '+classHeader+'" style="font-weight:bold;">'+header+'<span id="'+idRemove+'" class="notificationRemove">&#10060</span></div><div class="notificationBarBody '+classBody+'">'+body+'</div></div>');

    if ($('.notificationBarItem').length > 5) $('.notificationBarCloseAll').show();

	$('.notificationRemove').click(function () {
		$(this).parents('.notificationBarItem').detach();
		if ($(this).attr('time')) chrome.storage.local.set({'lastNotificationTime': $(this).attr('time')});

        if ($('.notificationBarItem').length <= 5) $('.notificationBarCloseAll').hide();

		if ($('.notificationBarItem').length == 0) notificationBarStatus('off');
		else notificationBarStatus('');
	});


}

function notificationBarStatus(status) {
	$('.nb-wheel').text($('.notificationBarItem').length);
	if (status == 'on') {
		$('.nb-wheel').addClass('barOn');
		$('#noNotifications').hide();
	}
	if (status == 'off') {
		$('.nb-wheel').removeClass('barOn');
		$('.nb-wheel').text('');
		$('#noNotifications').show();
	}
}
//++++++++++ Notification Bar ++++++++++//