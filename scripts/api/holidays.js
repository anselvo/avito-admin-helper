function holidays() {
    var date = new Date();

    var day = date.getDate();
    var month = date.getMonth()+1;

    if (day == 31 && month == 10) {
        // halloween();
    } else if (day == 29 && month == 12) {
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

function halloween() {
    // создание формы для открытки один раз
    if (!localStorage.holidays) postcardbody('http://avitoadm.ru/holidays/halloween/Vector-Cute-Halloween-Illustration.jpg');

    // тыква
    var currentUrl = window.location.href;
    if ( ~currentUrl.indexOf('/messages/premoderation') || ~currentUrl.indexOf('/abuses/search') || ~currentUrl.indexOf('/items/search') ) {
        $('body').append('<img id="halloween-pumpkin-right" src="http://avitoadm.ru/holidays/halloween/halloween-emoticons-png-8.png"/>');
    } else {
        $('body').append('<img id="halloween-pumpkin-left" src="http://avitoadm.ru/holidays/halloween/halloween-emoticons-png-8.png"/>');
    }


    // ведьма
    $('body').append('<img id="halloween-witch" src="http://avitoadm.ru/holidays/halloween/Witch-PNG-Picture.png">');

    if ( ~currentUrl.indexOf('/users/user/info/') || ~currentUrl.indexOf('/helpdesk?p=1') ) {
        setTimeout(function() {
            halloweenEventLestener();
        }, 500);
    }


    // паук
    var navbarHeight = $('div.navbar-fixed-top').height();
    if (!navbarHeight) {
        navbarHeight = 50;
    }
    $('body').append('<img id="halloween-spider" src="http://avitoadm.ru/holidays/halloween/Cute-Spider-PNG-Transparent-Image.png" style="top: '+ (navbarHeight - 10 )+'px">');
}

function halloweenEventLestener() {
    // console.log('halloweenEventLestener func');

    $('#halloween-witch').addClass('halloween-witch-animation');

    setTimeout(function() {
        $('#halloween-witch').removeClass('halloween-witch-animation');
    }, 1000);
}