function commentOnUserModer(id, comment){
    var request = new XMLHttpRequest();
    request.open("POST", 'https://adm.avito.ru/comment', true);
    request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    request.send("objectTypeId=2&objectId="+id+"&comment="+encodeURIComponent(comment));
}

function commentOnItem(id, comment, action){
	action = action || '';
    var request = new XMLHttpRequest();
    request.open("POST", 'https://adm.avito.ru/comment', true);
    request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    request.send("objectTypeId=1&objectId="+id+"&comment="+encodeURIComponent(comment));
	request.onreadystatechange = function() {
		if (request.readyState === 4) {
			switch (action) {
				case 'compensation':
					commentItemCompensationHandler(id, request);
					break;
			}
		}
	}
}

function commentOnUserSupport(id, comment, action){
	action = action || '';
    var request = new XMLHttpRequest();
    request.open("POST", 'https://adm.avito.ru/comment', true);
    request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    request.send("objectTypeId=2&objectId="+id+"&comment="+encodeURIComponent(comment));
	request.onreadystatechange = function() {
		if (request.readyState == 4) {
			switch (action) {
				case 'fromTicket':
					commentUserFromTicketHandler(id, request);
					break;
			}
		}
	}
}

// Запрос на BO через одну УЗ с правами
function getAdmWithSuperAcc(url) {
    return new Promise(function(resolve, reject) {
        chrome.runtime.sendMessage({
                action: 'XMLHttpRequest',
                method: "POST",
                url: "http://avitoadm.ru/journal/include/php/load/get_avito_adm.php",
                data: 'url=' + encodeURIComponent(url)
            },
            function (response) {
                let json;
                try {
                    json = JSON.parse(response);
                } catch (e) {
                    reject(e);
                }

                if (json.http_code !== 200) {
                    reject(`Произошла ошибка: http code - ${json.http_code}`);
                }

                resolve(json.response_body);
            }
        );
    });
}

// логировать просмотр инфо айтема для эксперимента
function addHdItemInfoLog(data) {
    return new Promise(function(resolve, reject) {
        chrome.runtime.sendMessage({
                action: 'XMLHttpRequest',
                method: "POST",
                url: "http://avitoadm.ru/support_helper/hd_item_info_log/add.php",
                data: "params=" + JSON.stringify(data),
            },

            function (response) {
                let json;
                try {
                    json = JSON.parse(response);
                } catch (e) {
                    reject(e);
                }

                if (!json.success) reject(json.message);

                resolve(json);
            }
        );
    });

}