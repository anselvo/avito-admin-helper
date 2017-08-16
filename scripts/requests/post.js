function blockUserIDNeskolko(id){
    var request = new XMLHttpRequest();
    request.open("POST", 'https://adm.avito.ru/users/user/block', true);
    request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
    request.setRequestHeader("Accept", "*/*");
    request.setRequestHeader("X-Requested-With", "XMLHttpRequest");
    request.send('reasons%5B%5D=91&id='+id);
    request.onreadystatechange=function(){
        if (request.readyState==4 && request.status==200)  {
            $('#'+id+'').text(' - OK');
        } else {
            $('#'+id+'').text(' - Error');
        }
    };
}

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


function postblockUserIDNeskolko(id){
    //alert(id);
    var request = new XMLHttpRequest();
    request.open("POST", 'https://adm.avito.ru/users/user/block', true);
    request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
    request.setRequestHeader("Accept", "*/*");
    request.setRequestHeader("X-Requested-With", "XMLHttpRequest");
    request.send('reasons%5B%5D=91&id='+id);
    request.onreadystatechange=function() {
        if (request.readyState == 4 && request.status != 200) {
            console.log('Error: произошла ошибка при блокировки УЗ '+id);
            outTextFrame('Error: произошла ошибка при блокировки УЗ '+id);
        }
    };
}
function postblockUserIDMC(id){
    //alert(id);
    var request = new XMLHttpRequest();
    request.open("POST", 'https://adm.avito.ru/users/user/block', true);
    request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
    request.setRequestHeader("Accept", "*/*");
    request.setRequestHeader("X-Requested-With", "XMLHttpRequest");
    request.send('reasons%5B%5D=128&id='+id);
    request.onreadystatechange=function() {
        if (request.readyState == 4 && request.status != 200) {
            console.log('Error: произошла ошибка при блокировки УЗ '+id);
            outTextFrame('Error: произошла ошибка при блокировки УЗ '+id);
        }
    };
}

function postblockUserIDblock(id){
    //alert(id);
    var request = new XMLHttpRequest();
    request.open("POST", 'https://adm.avito.ru/users/user/block', true);
    request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
    request.setRequestHeader("Accept", "*/*");
    request.setRequestHeader("X-Requested-With", "XMLHttpRequest");
    request.send('reasons%5B%5D=593&id='+id);
    request.onreadystatechange=function() {
        if (request.readyState == 4 && request.status != 200) {
            console.log('Error: произошла ошибка при блокировки УЗ '+id);
            outTextFrame('Error: произошла ошибка при блокировки УЗ '+id);
        }
    };
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

function commentUserCharacteristics(id, comment) {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", 'https://adm.avito.ru/comment', true);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.send("objectTypeId=2&objectId="+id+"&comment="+encodeURIComponent(comment));
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4 && xhr.status < 400) {
            $('#sh-loading-layer').hide();
            $('#user-characteristics-popup').hide();
            outTextFrame('Комментарий успешно проставлен.');
        }
        if (xhr.readyState == 4 && xhr.status >= 400) {
            $('#sh-loading-layer').hide();
            setTimeout(function() {
                alert('Произошла техническая ошибка.\n'+ xhr.status +', '+ xhr.statusText +'');
                $('#user-characteristics-popup').hide();
            }, 100);
        }
    }
}