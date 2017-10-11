function changeUserType(id, type) {
    var request = new XMLHttpRequest();
    request.open("GET", 'https://adm.avito.ru/users/user/'+type+'/'+id, true);
    request.send('reasons%5B%5D=128&id='+id);
}

function getItemInfo(id) {
     return fetch(`/items/item/info/${id}`, {credentials: 'include'})
            .then(response => {
                if (response.status !== 200) {
                    return Promise.reject(response);
                }
                return response.text();
            });
}

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