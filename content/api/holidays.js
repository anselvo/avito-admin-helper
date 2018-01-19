function holidays() {
    var date = new Date();

    var day = date.getDate();
    var month = date.getMonth()+1;

    if (day == 31 && month == 10) {
        // halloween();
    } else if (day == 1 && month == 1) {
        newyear();
    } else if (day == 7 && month == 1) {
        christmas();
    } else {
        localStorage.removeItem('holidays');
    }
}

// ОТКРЫТКА
function postcardbody(url) {
    $('body').append('<div class="holidays"></div>');
    $('.holidays').append('<img id="newyaerImg" class="holidaysbody" src="'+url+'"/>');
    $('.holidays').append('<div class="holidaysCR">&copy Avito Helper</div>');
    $('.holidays').append('<div class="holidaysClose">&#x2716</div>');

    $('.holidaysClose').click(function () {
        $('.holidays').detach();
        localStorage.holidays = 'true';
    });
}

function newyear() {
    if (!localStorage.holidays) postcardbody('http://avitoadm.ru/holidays/newyear/postcard.jpg');
}

function christmas() {
    if (!localStorage.holidays) postcardbody('http://avitoadm.ru/holidays/christmas/postcard.jpg');
}