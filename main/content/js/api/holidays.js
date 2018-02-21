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
    $('body').append('<div class="ah-holidays"></div>');
    $('.ah-holidays').append('<img id="newyaerImg" class="ah-holidaysbody" src="'+url+'"/>');
    $('.ah-holidays').append('<div class="ah-holidaysCR">&copy Avito Helper</div>');
    $('.ah-holidays').append('<div class="ah-holidaysClose">&#x2716</div>');

    $('.ah-holidaysClose').click(function () {
        $('.ah-holidays').detach();
        localStorage.holidays = 'true';
    });
}

function newyear() {
    if (!localStorage.holidays) postcardbody(`${connectInfo.ext_url}/holidays/newyear/postcard.jpg`);
}

function christmas() {
    if (!localStorage.holidays) postcardbody(`${connectInfo.ext_url}/holidays/christmas/postcard.jpg`);
}