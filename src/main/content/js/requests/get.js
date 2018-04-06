function changeUserType(id, type) {
    var request = new XMLHttpRequest();
    request.open("GET", `${global.connectInfo.adm_url}/users/user/${type}/${id}`, true);
    request.send('reasons%5B%5D=128&id='+id);
}

// item info
function getItemInfo(id) {
     return fetch(`${global.connectInfo.adm_url}/items/item/info/${id}`, {
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
    return fetch(`${global.connectInfo.adm_url}/ip/info?ip=${ip}`, {
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
    return fetch(`${global.connectInfo.adm_url}/shops/info/view/${id}`, {
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
    return fetch(`${global.connectInfo.adm_url}/users/account/info/${id}`, {
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
                url: `${global.connectInfo.ext_url}/support_helper/other/premium_users.json`
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
    return fetch(`${global.connectInfo.adm_url}/users/user/info/${id}`, {
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
                url: `${global.connectInfo.ext_url}/admin/sections/helpdesk/negative_users/include/php/user/get.php`
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

function getShopModerationTemplates() {
    return new Promise(function(resolve, reject) {
        chrome.runtime.sendMessage({
                action: 'XMLHttpRequest',
                method: "GET",
                url: `${global.connectInfo.spring_url}/traffic/template/list`
            },
            function (response) {
                if (response === 'error') {
                    reject({success: false});
                }

                let json;
                try {
                    json = JSON.parse(response);
                } catch (e) {
                    reject(e);
                }

                if (json.error && json.status !== 200) {
                    reject(json);
                }

                resolve(json);
            }
        );
    });
}

function getShopRegexp() {
    return new Promise(function(resolve, reject) {
        chrome.runtime.sendMessage({
                action: 'XMLHttpRequest',
                method: "GET",
                url: `${global.connectInfo.ext_url}/traffic_helper/getRegExp.php`
            },
            function (response) {
                if (response === 'error') {
                    reject({success: false});
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

function getImageByItemId(id) {
    return fetch(`${global.connectInfo.adm_url}/items/moder/images?item_id=${id}`, {
        credentials: 'include'
    }).then(response =>  {
        if (response.status !== 200) {
            return Promise.reject(response);
        }
        return response.json();
    });
}

// shop managers
function getShopManagers() {
    return fetch(`${global.connectInfo.adm_url}/shops/moderation/managers/list`, {
        credentials: 'include'
    }).then(response =>  {
        if (response.status !== 200) {
            return Promise.reject(response);
        }
        return response.json();
    });
}

// user items
function getUserItems(userId, page, searchParam) {
    return fetch(`${global.connectInfo.adm_url}/items/search?p=${page || 1}&user_id=${userId}&${searchParam || ''}`, {
        credentials: 'include'
    }).then(response =>  {
        if (response.status !== 200) {
            return Promise.reject(response);
        }
        return response.text();
    });
}

function getGroupFilterCountHD(id) {
    return fetch(`${global.connectInfo.adm_url}/helpdesk/api/1/filter/group/${id}/count`, {
        credentials: 'include'
    }).then(response =>  {
        if (response.status !== 200) {
            return Promise.reject(response);
        }
        return response.json();
    });
}

function getUserMessenger(id) {
    return fetch(`${global.connectInfo.adm_url}/messenger/user/${id}`, {
        credentials: 'include'
    }).then(response =>  {
        if (response.status !== 200) {
            return Promise.reject(response);
        }
        return response.text();
    });
}

function getDetectivesQueuePrune(id) {
    return fetch(`${global.connectInfo.adm_url}/detectives/queue/prune/${id}`, {
        credentials: 'include'
    }).then(response =>  {
        if (response.status !== 200) {
            return Promise.reject(response);
        }
        return response.json();
    });
}

function getSpringJsonTable(uuid) {
    return new Promise(function(resolve, reject) {
        chrome.runtime.sendMessage({
                action: 'XMLHttpRequest',
                method: "GET",
                url: `${global.connectInfo.spring_url}/json/${uuid}`
            },
            function (response) {
                if (response === 'error') {
                    reject({success: false});
                }

                let json;
                try {
                    json = JSON.parse(response);
                } catch (e) {
                    reject(e);
                }

                if (json.error && json.status !== 200) {
                    reject(json);
                }

                resolve(json);
            }
        );
    });
}

// antifraud info about item
function getItemAntifraudInfo(id) {
    return fetch(`${global.connectInfo.adm_url}/items/item/afrodprobabilities/${id}`, {
        credentials: 'include'
    }).then(response =>  {
        if (response.status !== 200) {
            return Promise.reject(response);
        }
        return response.json();
    });
}

function getHDTemplates() {
    return fetch(`${global.connectInfo.adm_url}/helpdesk/api/1/templates/list`, {
        credentials: 'include'
    }).then(response =>  {
        if (response.status !== 200) {
            return Promise.reject(response);
        }
        return response.json();
    });
}


function getHDTags() {
    return fetch(`${global.connectInfo.adm_url}/helpdesk/api/1/dictionaries/tags`, {
        credentials: 'include'
    }).then(response =>  {
        if (response.status !== 200) {
            return Promise.reject(response);
        }
        return response.json();
    });
}

function unlinkPaymentSource(url) {
    return fetch(url, {
        credentials: 'include'
    }).then(response =>  {
        if (response.status !== 200) {
            return Promise.reject(response);
        }
        return response.text();
    });
}

function getPermissions() {
    return fetch('https://adm.avito.ru/helpdesk/api/1/permissions', {
        credentials: 'include'
    }).then(response =>  {
        if (response.status !== 200) {
            return Promise.reject(response);
        }
        return response.json();
    });
}