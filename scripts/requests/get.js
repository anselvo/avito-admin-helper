function changeUserType(id, type) {
    var request = new XMLHttpRequest();
    request.open("GET", 'https://adm.avito.ru/users/user/'+type+'/'+id, true);
    request.send('reasons%5B%5D=128&id='+id);
}

