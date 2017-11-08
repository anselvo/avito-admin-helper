function changeUserType(id, type) {
    var request = new XMLHttpRequest();
    request.open("GET", 'https://adm.avito.ru/users/user/'+type+'/'+id, true);
    request.send('reasons%5B%5D=128&id='+id);
}

// item info
function getItemInfo(id) {
     return fetch(`/items/item/info/${id}`, {
             credentials: 'include'
         }).then(response => {
             if (response.status !== 200) {
                 return Promise.reject(response);
             }
             return response.text();
         });
}

// ip info
function getIpInfo(ip) {
    return fetch(`/ip/info?ip=${ip}`, {
            credentials: 'include',
            headers: {"X-Requested-With": "XMLHttpRequest"}
        }).then(response =>  {
            if (response.status !== 200) {
                return Promise.reject(response);
            }
            return response.text();
        });
}

// shop info
function getShopInfo(id) {
    return fetch(`https://adm.avito.ru/shops/info/view/${id}`, {
            credentials: 'include'
        }).then(response =>  {
            if (response.status !== 200) {
                return Promise.reject(response);
            }
            return response.text();
        });
}

// user account info
function getUserAccountInfo(id) {
    return fetch(`https://adm.avito.ru/users/account/info/${id}`, {
        credentials: 'include'
    }).then(response =>  {
        if (response.status !== 200) {
            return Promise.reject(response);
        }
        return response.text();
    });
}

// список юзеров RE Premium
function getPremiumUsersList() {
    return new Promise(function(resolve, reject) {
        chrome.runtime.sendMessage({
                action: 'XMLHttpRequest',
                method: "GET",
                url: "http://avitoadm.ru/support_helper/other/premium_users.json"
            },
            function (response) {
                if (response === 'error') {
                    reject('response error');
                }
                let json;
                try {
                    json = JSON.parse(response);
                } catch (e) {
                    reject(e);
                }

                resolve(json);
            }
        );
    });
}

// user info
function getUserInfo(id) {
    return fetch(`https://adm.avito.ru/users/user/info/${id}`, {
        credentials: 'include'
    }).then(response =>  {
        if (response.status !== 200) {
            return Promise.reject(response);
        }
        return response.text();
    });
}

// негативные пользователи
function getNegativeUsersRequest() {
    return new Promise(function(resolve, reject) {
        chrome.runtime.sendMessage({
                action: 'XMLHttpRequest',
                method: "GET",
                url: "http://avitoadm.ru/admin/sections/helpdesk/negative_users/include/php/user/get.php"
            },
            function (response) {
                if (response === 'error') {
                    reject('response error');
                }
                let json;
                try {
                    json = JSON.parse(response);
                } catch (e) {
                    reject(e);
                }

                resolve(json);
            }
        );
    });
}