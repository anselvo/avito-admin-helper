// Парсер комментов ++++
function linksOnComments(tableClass, currentUserID) {
    $(tableClass+' .sh-unicode-links').detach();

    const $tableList = $(tableClass);

    // Patterns
    let duplicateReg = /duplicate.+/i;
    let duplicatePluralReg = /(duplicates|duplicate items):.+/i;

    for (let j = 0; j < $tableList.length; j++) {
        let commentBlock = $tableList[j];
        let commentText = $(commentBlock).html();

        commentText = commentText.replace(/\[Admin.Helper\D+]/, pattern => {
            return `<b style="color: red">[</b><b>${pattern.substring(1, pattern.length-1)}</b><b style="color: red">]</b>`;
        });

        if (~commentText.indexOf('Admin.Helper')) { // Admin.Helper comments
            let text = commentText;
            const regIds = /\d+(?![\].])\b/g;
            const ids = text.match(regIds);

            if (~text.indexOf('Item')) {
                text = text.replace(regIds, `<a href="${global.connectInfo.adm_url}/items/item/info/$&" target="_blank">$&</a>`);
            }
            if (~text.indexOf('User')) {
                text = text.replace(regIds, `<a href="${global.connectInfo.adm_url}/users/user/info/$&" target="_blank">$&</a>`);
            }

            if (~text.indexOf('Item.Comparison')) {
                text += '(';
                text += generateCommentCompareItems(ids);
                text += generateCommentLinkOnItemComparison(ids);
                text += generateCommentLinkOnItemsSearch(ids);
                text += ')';
            }
            if (~text.indexOf('User.Comparison')) {
                text += '(';
                text += generateCommentCompareUsers(ids);
                text += ')';
            }

            $(commentBlock).html(text);
        }

        if (duplicateReg.test(commentText)) { // dublicate
            let text = commentText;
            text = text.replace(/\d{2,}/g, `<a href="${global.connectInfo.adm_url}/items/item/info/$&" target="_blank">$&</a>`);

            let duplicatePluralText = commentText.match(duplicatePluralReg);
            if (duplicatePluralText) {
                let itemIds = duplicatePluralText[0].match(/\d+/g);
                if (itemIds && itemIds.length > 1) {
                    let dublicatePhrase = duplicatePluralText[0].split(':')[0];
                    text = text.replace(dublicatePhrase, `<a href="${global.connectInfo.adm_url}/items/search?query=${itemIds.join('%7C')}" target="_blank">$&</a>`);
                }
            }

            $(commentBlock).html(text);
        }

        if (~commentText.indexOf('item_')) { // cron-dublicate on Item
            let text = commentText;

            const regIds = /\d+(?![\].])\b/g;
            const regIdsStatus = /\d+: \[[a-z]+](?![\].])/g;

            const itemIds = text.match(regIds);
            const itemIdsStatus = text.match(regIdsStatus);

            if (itemIdsStatus) {
                const items = itemIdsStatus.map(item => {
                    const obj = {};
                    obj.id = item.match(/\d+/)[0];
                    obj.status = item.match(/[a-z]+/)[0];
                    return obj;
                });

                text = text.replace(regIds, `<a href="${global.connectInfo.adm_url}/items/item/info/$&" target="_blank">$&</a>`);

                let itemSearch = items[0].id;
                for (let i = 1; i < items.length; ++i) itemSearch += `|${items[i].id}`;

                text += '(';
                text += generateCommentCompareItems(itemIds);
                text += generateCommentLinkOnItemComparisonWithStatus(items);
                text += generateCommentLinkOnItemsSearch(itemIds);
                text += ')';

                $(commentBlock).html(text);
            }
        }

        if (~commentText.indexOf('revived')) { //comparison on Item
            let text = commentText;
            let ids = text.match(/\d{2,}/g);

            text = text.replace(/\d{2,}/g, `<a href="${global.connectInfo.adm_url}/items/item/info/$&" target="_blank">$&</a>`);

            if (ids.length <= 4) {
                let link = `${global.connectInfo.adm_url}/items/comparison/${ids[0]}/archive?`;
                for (let i = 1; i < ids.length; ++i) link += 'ids[]=' + ids[i] + '&';

                text += ` <a class="glyphicon glyphicon-new-window" href="${link}" style="margin-right: 4px;" target="_blank"></a>`;
            }

            text += ` <a class="glyphicon glyphicon-search" href="${global.connectInfo.adm_url}/items/search?query=${ids.join('|')}" target="_blank"></a>`;
            text += generateCommentCompareItems(ids);

            $(commentBlock).html(text);
        }

        if (~commentText.indexOf(`http`)) { // links
            let text = commentText;
            const regUrl = /(https?|ftp):\/\/[^\s/$.?#].[^\s<]*/gi;

            text = text.replace(regUrl, url => {
                const ids = url.match(/\d{2,}/g);
                let tmp = '';

                if (~url.indexOf('users/user/info') && ~global.currentUrl.indexOf('users/user/info'))
                    tmp += generateCommentCompareUsers(ids);

                if (~url.indexOf('items/item/info') && ~global.currentUrl.indexOf('items/item/info'))
                    tmp += generateCommentCompareItems(ids);

                return `<a href="${url}" target="_blank">${url}</a>${tmp ? ' (' + tmp + ')' : ''}`;
            });

            $(commentBlock).html(text);
        }

        if (~commentText.indexOf('Alive user ID:')) { // comparison on User
            let text = commentText;

            let tmp = text.split("Alive user ID: ");
            if (tmp[1] === undefined) continue;
            let users = tmp[1].split(/\D/);
            text = text.replace(users[0], `<a href="${global.connectInfo.adm_url}/users/user/info/${users[0]}" target="_blank">${users[0]}</a><span class="sh-unicode-links">(${generateCommentCompareUsers(users[0])})</span>`);
            $(commentBlock).html(text);

            let tmp2 = text.split("Base item ID: ");
            if (tmp2[1] === undefined) continue;
            let users2 = tmp2[1].split(/\D/);
            text = text.replace(users2[0], `<a href="${global.connectInfo.adm_url}/items/item/info/${users2[0]}" target="_blank">${users2[0]}</a><span class="sh-unicode-links">(${generateCommentCompareItems(users2[0])})</span>`);
            $(commentBlock).html(text);

            let part = text.split(", ");
            if (part[2] === undefined) continue;
            let sii = part[2].split("Similar item IDs: [");
            let sii1 = sii[1].split(",");
            for (let i = 0; i < sii1.length; i++) {
                let siiLinks = sii1[i].split(" -");
                text = text.replace(siiLinks[0],`<a href="${global.connectInfo.adm_url}/items/item/info/${siiLinks[0]}" target="_blank">${siiLinks[0]}</a><span class="sh-unicode-links">(${generateCommentCompareItems(siiLinks[0])})</span>`);
            }
            $(tableClass).slice(j,j+1).html(text);
        }

        if (~commentText.indexOf('Similar accounts:')) { // comparison on User
            let text = commentText;

            let tmp = text.split("Base item ID: ");
            if (tmp[1] === undefined) continue;
            let users = tmp[1].split(/\D/);
            text = text.replace(users[0], `<a href="${global.connectInfo.adm_url}/items/item/info/${users[0]}" target="_blank">${users[0]}</a><span class="sh-unicode-links">(${generateCommentCompareItems(users[0])})</span>`);
            $(commentBlock).html(text);

            let tmp2 = text.split("Similar accounts: ");
            if (tmp2[1] === undefined) continue;
            let users2 = tmp2[1].split(/\D/);
            for (let i = 1; i < users2.length; i++) { // Цикл с 1, т.к. ID дублируются
                text = text.replace(users2[i], `<a href="${global.connectInfo.adm_url}/users/user/info/${users2[i]}" target="_blank">${users2[i]}</a><span class="sh-unicode-links">(${generateCommentCompareUsers(users2[i])}</span>`);
                $(commentBlock).html(text);
            }
        }

        if (~commentText.indexOf('по обращению №')) { // link on ticket
            let text = commentText;

            let tmp = text.split("по обращению №");
            if (tmp[1] === undefined) continue;
            let tickets = tmp[1].split(/\D/);
            text = text.replace(tickets[0], `<a href="${global.connectInfo.adm_url}/helpdesk/details/${tickets[0]}" target="_blank">${tickets[0]}</a>`);
            $(commentBlock).html(text);
        }

        // Выделение текста
        if (~commentText.indexOf('СПАМ') || ~commentText.indexOf('МОШЕННИК') || ~commentText.indexOf('ВЗЛОМ')) {
            let text = $(commentBlock).html();

            text = text.replace('СПАМ', '<b style="color: #ff4545">СПАМ</b>');
            text = text.replace('МОШЕННИК', '<b style="color: #9b3aff">МОШЕННИК</b>');
            text = text.replace('ВЗЛОМ', '<b style="color: #61145c">ВЗЛОМ</b>');
            text = text.replace('Ссылка открытая модератором при блокировке:', '<b>$&</b>');
            text = text.replace('Ссылка на активного пользователя:', '<b>$&</b>');
            text = text.replace('Ссылка на заблокированных пользователей в items/search:', '<b>$&</b>');
            text = text.replace('Ссылки на заблокированные учетные записи:', '<b>$&</b>');
            $(commentBlock).html(text);
        }

        // Выделение текста
        if (~commentText.indexOf('[Коммерческий статус]')) {
            let text = $(commentBlock).html();
            const regIds = /(,\s|\s)\d{3,}/g;
            const regSpace = /(,\s|\s)/;
            const ids = text.match(regIds).map(id => id.replace(regSpace, ''));

            text = text.replace(regIds, (pattern, other)=> {
                return `${other}<a href="${global.connectInfo.adm_url}/items/item/info/${pattern.replace(regSpace, '')}" target="_blank">${pattern.replace(regSpace, '')}</a>`
            });
            text = text.replace('[Коммерческий статус]', pattern => {
                return `<b style="color: dodgerblue">[</b><b>${pattern.substring(1, pattern.length-1)}</b><b style="color: dodgerblue">]</b>`;
            });
            text = text.replace('Ссылка, открытая модератором:', '<b>$&</b>');
            text = text.replace('Связанные пользователи:', `<b>$&</b> (${generateCommentCompareUsers(ids)})`);
            text = text.replace('Комментарий модератора:', '<b>$&</b>');
            $(commentBlock).html(text);
        }
    }

    $('.ah-compare-item-action-link').click(function () {
        const itemsIds = $(this).data('compared');
        if (~currentUserID.indexOf('https')) {
            currentUserID = currentUserID.replace(/\D/gi, '');
        }

        const items = {};
        items.abutment = currentUserID;
        items.compared = itemsIds;

        btnLoaderOn(this);
        const comparison = new ItemsComparison(items);
        comparison.render()
            .then(() => {
                comparison.showModal();
            }, error => alert(error))
            .then(() => btnLoaderOff(this));
    });

    $('.ah-compare-user-action-link').click(function () {
        const usersIds = $(this).data('compared');
        if (~currentUserID.indexOf('https')) {
            currentUserID = currentUserID.replace(/\D/gi, '');
        }

        const users = {};
        users.abutment = currentUserID;
        users.compared = usersIds;

        btnLoaderOn(this);
        const comparison = new UsersComparison(users);
        comparison.render()
            .then(() => {
                comparison.showModal();
            }, error => alert(error))
            .then(() => btnLoaderOff(this));

    });
}

function generateCommentCompareUsers(ids) {
    return `<button class="btn btn-link ah-pseudo-link ah-compare-user-action-link" title="Сравнение пользователей" data-compared="[${ids}]">⇄</button>`;
}

function generateCommentCompareItems(ids) {
    return `<button class="btn btn-link ah-pseudo-link ah-compare-item-action-link" title="Сравнение объявлений" data-compared="[${ids}]">%</button>`;
}

function generateCommentLinkOnItemsSearch(ids) {
    return ` <a class="glyphicon glyphicon-search" href="${global.connectInfo.adm_url}/items/search?query=${ids.join('|')}" target="_blank"></a>`
}

function generateCommentLinkOnItemComparison(ids) {
    let itemComparison = `${global.connectInfo.adm_url}/items/comparison/${ids[0]}/archive?`;
    const len = ids.length < 4 ? ids.length : 4;
    for (let i = 0; i < len; ++i) itemComparison += `ids[]=${ids[i]}&`;
    return ` <a class="glyphicon glyphicon-new-window" href="${itemComparison}"  style="margin-right: 4px;" target="_blank"></a>`;
}

function generateCommentLinkOnItemComparisonWithStatus(ids) {
    let itemComparison = `${global.connectInfo.adm_url}/items/comparison/${ids[0].id}/archive?`;
    const len = ids.length < 4 ? ids.length : 4;
    for (let i = 0; i < len; ++i) itemComparison += `ids[]=${ids[i].id}&${ids[i].status}&`;
    return ` <a class="glyphicon glyphicon-new-window" href="${itemComparison}"  style="margin-right: 4px;" target="_blank"></a>`;
}

function loadComperison(itemID, currentUserID) {
    let url = `${global.connectInfo.adm_url}/items/comparison/${itemID}`;

    let xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.send(null);
    xhr.onreadystatechange=function() {
        if (xhr.readyState === 4) {
            $('#ah-loading-layer').hide();

            if (xhr.status === 200) {
                $('#comperison_box').detach();

                $('body').append('<div id="comperison_box" style="background: #f5f5f5;background-clip:padding-box;padding:10px;border-radius:4px;display:none;color:black;position:fixed;top:10%;margin:0 auto;overflow:auto;overflow-y:scroll;max-width:1100px;height:85%;z-index:1050;-webkit-box-shadow:0 3px 20px rgba(0, 0, 0, 0.9); -webkit-box-align: center; "></div>');
                $('#comperison_box').append('<div><a href="'+url+'" target="_blank">Item comparison</a><span id="close_comperison_box" class="pseudo-link" style="float:right;">close</span></div><br>');

                var response = xhr.responseText;
                var comperison = $(response).find('.items-table').clone();

                $(comperison).find('a').attr('target','_blank');
                $(comperison).find('td').addClass('ah-default-list');
                $(comperison).find('td').css({'background':'#eef5f7','min-width':'210px','padding':'5px', 'border-radius':'0px','box-shadow':'none'});
                $(comperison).find('td td').css({'min-width':'0'});

                $(comperison).find('th').css({'min-width':'150px','padding':'5px'});
                $(comperison).find('.pseudo-link').remove();
                $(comperison).find('.more').remove();
                $(comperison).find('[data-match-test="description"]').append('<span class="pseudo-link">еще</span>');

                comperison = compareItems(comperison);

                $('#comperison_box').append(comperison);

				var tableClass = '#comperison_box .comparison-table .row-user-block:last table td';
				linksOnComments(tableClass, currentUserID);

                var widthComperison = $('#comperison_box').width();
                var widthBody = $('body').width();
                var widthLeft = (widthBody-widthComperison)/2;

                $('#comperison_box').css({'display':'inline-block','left':widthLeft});

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

                $('[data-match-test="description"]').click(function () {
                    $('.descr-full').toggle();
                    $('[data-match-test="description"]').find('.pseudo-link').remove();
                });

                $('.js-images-preview').on('click', function() {
                    return false;
                });
                $('.js-images-preview').click(function () {
                    var itemID = $(this).attr('name').split('m_');

                    if (!itemID) {
                        alert('Ошибка: не удалось определить ID объявления.');
                        return;
                    }

                    var imagePrev = $(this).find('.images-preview-img');
                    $(imagePrev).css('opacity', '0.4');
                    $(this).append('<span class="ah-loading-indicator-text ah-loading-comparison-images">Загрузка</span>');
                    loadImageForItem(itemID[1], imagePrev);

                    $('.images-preview-gallery').mouseleave(function() {
                        $('.images-preview-gallery').attr('style','display: none; position:fixed; z-index: 1080; background-color: rgba(255, 255, 255, 0.95); text-align: center; border-radius: 0; padding: 10px; border: 1px solid rgba(153, 153, 153, 0.56);');
                        $('.images-preview-gallery-list').detach();
                    });
                });

                $('#close_comperison_box').click(function() {
                    $('#comperison_box').detach();
                });

                $('.ah-comparison-copy-item-id').click(function() {
                    var itemId = $(this).data('itemId');
                    chrome.runtime.sendMessage( { action: 'copyToClipboard', text: itemId } );
                    outTextFrame('ID объявления '+ itemId +' скопирован!');
                });
            }

            if (xhr.status >= 400) {
                setTimeout(function() {
                    alert('Ошибка: '+ xhr.status +', '+ xhr.statusText +'');
                }, 100);
            }
        }
    };

    $(document).mouseup(function(e) { // событие клика по веб-документу
        var div = $('#comperison_box'); // элемент
        var div1 = $('#check_result_user_box');
        var div2 = $('.images-preview-gallery');
        if (!div.is(e.target) && div.has(e.target).length === 0 && !div1.is(e.target) && div1.has(e.target).length === 0 && !div2.is(e.target) && div2.has(e.target).length === 0) {
            div.detach();
        }
    });
}

function compareItems(comperison) {
    var trlen = $(comperison).find('tr').length;
    var tdlen = $(comperison).find('.user-login-wrap').length;

    for (var i = 0; i < tdlen; i++) {
        var userID = $(comperison).find('.user-login-wrap').slice(i,i+1).find('a').attr('href').split('/');
        $(comperison).find('.user-login-wrap').slice(i,i+1).append('(<button class="btn btn-link ah-pseudo-link compareUserOnComperison" userID="' + userID[4] + '" title="Сравнить учетные записи">&#8644</button>)');

        var itemName;
        if (i == 0) {
            itemName = $(comperison).find('.item-title').slice(0,1).text();
        } else {
            if (itemName == $(comperison).find('.item-title').slice(i,i+1).text()) {
                $(comperison).find('.item-title').slice(0,1).css('background','rgb(255, 198, 207)');
                $(comperison).find('.item-title').slice(i,i+1).css('background','rgb(255, 198, 207)');
            }
        }
    }

    for (var i = 1; i < trlen; i++) {
        var mainItem = $(comperison).find('tr').slice(i,i+1).find('td span').slice(0,1).text();
        var stopChack = $(comperison).find('tr').slice(i,i+1).find('td').slice(0,1).attr('data-match-test');
        var ismainItem = false;

        if (stopChack == 'description') break;

        for (var j = 1; j < tdlen; j++) {
            var otherItem = $(comperison).find('tr').slice(i,i+1).find('td span').slice(j,j+1).text();
            if (mainItem == otherItem) {
                $(comperison).find('tr').slice(i,i+1).find('td').slice(j,j+1).css('background','rgb(255, 198, 207)');
                ismainItem = true;
            }
        }
        if (ismainItem == true) $(comperison).find('tr').slice(i,i+1).find('td').slice(0,1).css('background','rgb(255, 198, 207)');
    }

    var itemTitles = $(comperison).find('tr .item-title');
    $(itemTitles).each(function(i, title) {
        var itemTag = $(title).find('[href^="/items/item/info"]');
        var itemId = $(itemTag).attr('href').replace(/\D/g, '');
        $(title).after('<div style="margin-top: 4px;"><button type="button" class="ah-comparison-copy-item-id ah-default-btn ah-btn-small" data-item-id="'+ itemId +'" style="">Скопировать ID ('+ itemId +')</button></div>');
    });

    var itemImages = $(comperison).find('tr .item-image');
    $(itemImages).each(function(i, imageBlock) {
        var wrapper = $(imageBlock).find('.image-wrapper')
        $(wrapper).css({
            'display': 'inline-block',
            'line-height': '20px',
            'vertical-align': 'middle',
            'position': 'relative',
            'text-decoration': 'none',
            'width': '140px',
            'height': '105px',
            'box-sizing': 'content-box',
            'border': '1px solid rgba(128,128,128,.5)',
            'background': '#fff',
            'outline': '0',
            'overflow': 'hidden',
            'transition': 'border-color .3s linear'
        });

        $(wrapper).find('.images-preview-counters-icons').css({
            'position': 'absolute',
            'left': '0',
            'top': '0',
            'z-index': '10',
            'background-color': '#ececec',
            'color': '#333',
            'padding': '0 5px'
        });

        $(wrapper).find('.images-preview-img').css({
            'position': 'absolute',
            'left': '50%',
            'top': '50%',
            'transform': 'translate(-50%,-50%)'
        });
    });

    return comperison;
}

function loadImageForItem(itemID, imagePrev) {
    var url = `${global.connectInfo.adm_url}/items/moder/images?item_id=${itemID}`;

    $('.images-preview-gallery').css('display','block');
    $('.images-preview-gallery').append('<ul class="images-preview-gallery-list img-for-'+itemID+'" style="padding-left: 0; max-height: 430px; overflow-y: auto; list-style-type: none; padding-right: 4px;"></ul>');

    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.send(null);
    xhr.onreadystatechange=function() {
        if (xhr.readyState==4) {
            if (xhr.status==200)  {
                var json = JSON.parse(xhr.responseText);

                var len = json.length;

                for (var i = 0; i < len; i++) {
                    var thumb = json[i].thumb;
                    var full = json[i].full;

                    $('.img-for-'+itemID).append('<li class="images-preview-gallery-item" style="    background-color: rgba(255, 255, 255, 0.71); margin-bottom: 4px; border-radius: 4px;"><a href="'+full+'" target="blank"><img src="'+thumb+'"></a></li>');
                }
                $('.images-preview-gallery-item:last').css('margin-bottom', '0');
                setTimeout(function() {
                    var maxw = $('.img-for-'+itemID).width();

                    var bw = $('body').width();
                    var offset = $('[name=m_'+itemID+']').offset();
                    var left = offset.left;
                    var top = offset.top - $(window).scrollTop();

                    if (maxw+left+5 >= bw) $('.images-preview-gallery').css({'top':top,'left':'auto','right':'5px','max-width':bw-5});
                    else $('.images-preview-gallery').css({'top':top,'right':'auto','left':left,'max-width':bw-left-5});
                }, 100);
            }
            $(imagePrev).css('opacity', '1');
            $('.ah-loading-comparison-images').remove();
        }
    };
}
// Парсер комментов ----
