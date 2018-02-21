function commentOnUserModer(id, comment){
    var request = new XMLHttpRequest();
    request.open("POST", `${global.connectInfo.adm_url}/comment`, true);
    request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    request.send("objectTypeId=2&objectId="+id+"&comment="+encodeURIComponent(comment));
}

function commentOnItem(id, comment, action){
	action = action || '';
    var request = new XMLHttpRequest();
    request.open("POST", `${global.connectInfo.adm_url}/comment`, true);
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
    request.open("POST", `${global.connectInfo.adm_url}/comment`, true);
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
                url: `${global.connectInfo.ext_url}/journal/include/php/load/get_avito_adm.php`,
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

function editPersonalManager(userId, managerId) {
    const headers = new Headers({
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
    });
    return fetch(`${global.connectInfo.adm_url}/users/user/edit/manager/${userId}`, {
        method: 'post',
        credentials: 'include',
        headers: headers,
        body: `managerId=${managerId}`,
        redirect: 'error'
    }).then(response =>  {
        if (!response.ok) {
            return Promise.reject(response);
        }
        return response.json();
    });
}