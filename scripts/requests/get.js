function changeUserType(id, type) {
    var request = new XMLHttpRequest();
    request.open("GET", 'https://adm.avito.ru/users/user/'+type+'/'+id, true);
    request.send('reasons%5B%5D=128&id='+id);
}

function getItemInfo(id) {
    return new Promise(function(resolve, reject) {
        fetch(`/items/item/info/${id}`, {credentials: 'include'})
            .then(function(response) {
                if (response.status !== 200) {
                    reject(response);
                }
                resolve(response.text());
            })
    });
}

function getIpInfo(ip) {
    return new Promise(function(resolve, reject) {
        fetch(`/ip/info?ip=${ip}`, {
            credentials: 'include',
            headers: {"X-Requested-With": "XMLHttpRequest"}
        }).then(function(response) {
            if (response.status !== 200) {
                reject(response);
            }
            resolve(response.text());
        })
    });
}