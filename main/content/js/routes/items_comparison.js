function copyItemIdsComparisonPage() {
    var table = $('.comparison-table');
    var itemTitles = $(table).find('.item-title');
    $(itemTitles).each(function(i, title) {
        var itemTag = $(title).find('[href^="/items/item/info"]');
        var itemId = $(itemTag).attr('href').replace(/\D/g, '');
        $(title).after('<div style="margin-top: 4px;"><button type="button" class="comparison-copy-item-id sh-default-btn ah-btn-small" data-item-id="'+ itemId +'" style="">Скопировать ID ('+ itemId +')</button></div>');
    });

    $('.comparison-copy-item-id').click(function() {
        var itemId = $(this).data('itemId');
        chrome.runtime.sendMessage( { action: 'copyToClipboard', text: itemId } );
        outTextFrame('ID объявления '+ itemId +' скопирован!');
    });
}



// дополнительаня информация в комперисоне
function comparisonInfoOld() {
    var len = $('.item-title').length;

    $('.items-table tr:eq(0)')
        .after('<tr id="itemIP"><th>IP</th></tr>')
        .after('<tr id="startTime"><th>Start time</th></tr>');

    var currentUserID = $('.user-login-wrap:eq(0) a').attr('href').split('/');

    for (var i = 0; i < len; ++i) {

        if (!$('.items-table tr:eq(0) td').slice(i,i+1).hasClass("hidden") && !$('.items-table tr:eq(0) td').slice(i,i+1).hasClass("skipped")) {
            var item = $('.item_title').slice(i,i+1).attr('href');
            var userID = $('.user-login-wrap a').slice(i,i+1).attr('href').split('/');

            $('#itemIP').append('<td item="'+item+'"></td>');
            $('#startTime').append('<td item="'+item+'"></td>');
            $('.item-sort-time').slice(i,i+1).append('<span item="'+item+'"> </span>');

            if ($('.row-user-block td').slice(i,i+1).text().indexOf('Заблокированных') === -1) {
                $('.row-user-block td').slice(i,i+1).append('<div style="margin-top:5px;"><a href="#" class="red moсx" userID="'+userID[4]+'"><i class="glyphicon glyphicon-ban-circle"> </i> Мошенническая схема</a></div>');
                $('.row-user-block td').slice(i,i+1).append('<div style="margin-top:5px;"><a href="#" class="red padact" userID="'+userID[4]+'"><i class="glyphicon glyphicon-ban-circle"> </i> Подозрительная активность</a></div>');
            }

            if (i > 0) {
                $('.user-login-wrap').slice(i,i+1).append('<span style="margin-left:5px;">(<button class="btn btn-link ah-pseudo-link compareUserOnComperison" userID="'+userID[4]+'" title="Сравнить учетные записи">&#8644</button>)</span>');
            }

            loadItem(i, item);
        }

        if ($('.user-login').slice(i,i+1).find('.glyphicon-tag').length > 0) {
            $('.row-user-block td').slice(i,i+1).find('a').hide();
        }
    }

    $('.compareUserOnComperison').click(function () {
        const similarUserID = $(this).attr('userID');

        const btn = this;
        const users = {};
        users.compared = [similarUserID];
        users.abutment = currentUserID[4];

        btnLoaderOn(btn);
        const comparison = new UsersComparison(users);
        comparison.render()
            .then(() => {
                comparison.showModal();
            }, error => alert(error))
            .then(() => btnLoaderOff(btn));
    });

    $('.moсx').click(function () {
        var userID = $(this).attr('userid');
        blockUser(userID, 'MC');
        $(this).parents('td').empty().append('<b class="red">Blocked</b>');
    });
    $('.padact').click(function () {
        var userID = $(this).attr('userid');
        blockUser(userID, 'PA');
        $(this).parents('td').empty().append('<b class="red">Blocked</b>');
    });
}

var mainIP;

function loadItem(i, item) {
    var url = "https://adm.avito.ru"+item;

    var request = new XMLHttpRequest();
    request.open("GET", url, true);
    request.send(null);
    request.onreadystatechange=function() {
        if (request.readyState === 4 && request.status === 200)  {
            var r = request.responseText;

            var sortTime = $(r).find('[title="Sort time"]').text().split(' ');
            var startTime = $(r).find('[title="Start time"]').text();
            var itemIP = $(r).find('.ip-info').attr('data-ip');

            $('#itemIP [item="'+item+'"]').append('<a href="https://adm.avito.ru/items/search?ip='+itemIP+'" target="_blank">'+itemIP+'</a>');
            $('.item-sort-time [item="'+item+'"]').append(sortTime[1]);
            $('#startTime [item="'+item+'"]').append(startTime);

            if (i == 0) mainIP = itemIP;
            else {
                if (mainIP == itemIP) {
                    $('#itemIP td:eq(0) a').css('background', '#ffe1e6');
                    $('#itemIP [item="'+item+'"] a').css('background', '#ffe1e6');
                }
            }
        }
    };
}