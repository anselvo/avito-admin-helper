// одобрение IP в аксессе
function sanctionIPSystemAccess() {
    var header = $('.container-fluid header');
    var headerTitle = $(header).find('.header__title');
    var headerBtnContainer = $(headerTitle).find('.header-right');
    $(headerBtnContainer).prepend('<button id="system-access-sanction-ip-btn" type="button" class="sh-default-btn sh-sanction-ip-btn" style="" title="">Одобрить IP</button>');

    $('#system-access-sanction-ip-btn').click(function() {
        renderSanctionIPPopup();
        showSanctionIPPopup();
    });
}

function showSanctionIPPopup() {
    $('#layer-blackout-popup').addClass('ah-layer-flex');
    showModal();
}
function renderSanctionIPPopup(ip, ticketLink) {
    ip = ip || '';
    ticketLink = ticketLink || '';

    $('#sh-sanction-ip-popup').remove();
    $('#sanction-ip-btn').unbind('click');

    var regForIp = /^((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$/;

    $('#layer-blackout-popup').append('<div id="sh-sanction-ip-popup" class="ah-default-popup" style="display: none; width: 500px;" ></div>');
    var popup = $('#sh-sanction-ip-popup');
    $(popup).append('<div class="ah-popup-container"></div>');
    var container = $(popup).find('.ah-popup-container');

    $(container).append('<div class="ah-popup-header" style="padding: 15px 0 10px 0;"></div>');
    $(container).append('<div class="ah-popup-body" style="border-bottom: 1px solid transparent;"></div>');
    $(container).append('<div class="ah-popup-footer" style="text-align: right;"></div>');

    var header = $(popup).find('.ah-popup-header');
    var body = $(popup).find('.ah-popup-body');
    var footer = $(popup).find('.ah-popup-footer');

    $(header).append('<span class="ah-popup-title" style="">Одобрение IP <span style="font-weight: 400;">'+ ip +'</span></span><button type="button" class="sh-default-btn ah-btn-small ah-popup-close">x</button>');

    $(body).append('<form name="shSanctionIp"></form>');
    var bodyForm = $(body).find('form[name="shSanctionIp"]');


    var agentFullName = global.userInfo.name +' '+ global.userInfo.surname;
    $(bodyForm).append('<div class=""><input type="hidden" name="agent" value="'+ agentFullName +'"></div>');

    $(bodyForm).append('<div class="ah-field-group"><div class="ah-field-title">IP-адрес</div><div class="ah-field-flex" style=""><input class="ah-form-control" style="" name="ip" value="'+ ip +'" placeholder=""></div></div>');

    $(bodyForm).append('<div class="ah-field-group"><div class="ah-field-title">Ссылка на тикет</div><div class="ah-btn-group ah-field-flex" style=""><input class="ah-form-control ah-btn-group-left ah-flex-grow-extended" style="" name="ticketLink" value="'+ ticketLink +'" placeholder=""><button type="button" class="sh-default-btn ah-btn-group-right" style="white-space: nowrap; letter-spacing: .1px;" title="Используется, когда одобрение IP происходит по звонку, а не по тикету">По звонку</button></div></div>');

    if (~window.location.href.indexOf('https://adm.avito.ru/helpdesk/details')) {
        var ipInput = $(bodyForm).find('[name="ip"]');
        var ticketLinkInput = $(bodyForm).find('[name="ticketLink"]');
        ipInputParent = $(ipInput).parents('.ah-field-group');
        ticketLinkInputParent = $(ticketLinkInput).parents('.ah-field-group');

        $(ipInputParent).hide();
        $(ticketLinkInputParent).hide();
    }

    $(bodyForm).append('<div class="ah-field-group"><div class="ah-field-title">Тег (для комментария к правилу)</div><div class="ah-field-flex" style=""><select class="ah-form-control" style="" name="tag"></select></div></div>');
    var tagSelect = $(bodyForm).find('[name="tag"]');
    var tags = ['foreign_ip_stat', 'incorrect_region_maxmind', 'stopforumspam_stat'];
    tags.forEach(function(tag) {
        $(tagSelect).append('<option value="'+ tag +'">'+ tag +'</option>');
    });

    $(footer).append('<button type="button" class="sh-action-btn" title="" style="" id="sanction-ip-btn">Сохранить правило</button>');

    $(footer).append('<div class="ah-clearfix"></div>');


    // Обработчики
    var closeBtn = $(popup).find('.ah-popup-close');
    $(closeBtn).click(function() {
        $('#layer-blackout-popup').removeClass('ah-layer-flex');
        $('div.ah-default-popup').hide();
        closeModal();
    });

    var byTellCallBtn = $(bodyForm).find('[name="ticketLink"]').next();

    $(byTellCallBtn).click(function() {
        if (!isAuthority('ROLE_SYSTEM_ACCESS_SANCTION_IP_BY_CALL')) {
            alert('У вас нет доступа для включения этой опции.');
            return;
        }

        $(this).toggleClass('sh-active-btn');

        var input = $(this).prev();
        if ($(this).hasClass('sh-active-btn')) {
            $(input).prop('disabled', true);
            $(input).val('');
        } else {
            $(input).prop('disabled', false);
        }
    });

    $('#sanction-ip-btn').click(function() {
        var ticketLink = $(bodyForm).find('[name="ticketLink"]').val();
        var agent = $(bodyForm).find('[name="agent"]').val();
        var tag = $(bodyForm).find('[name="tag"]').val();
        var ip = $(bodyForm).find('[name="ip"]').val().trim();

        var helpdeskLinkPatter = /https\:\/\/adm\.avito\.ru\/helpdesk\/details\/.+/i;

        if (!regForIp.test(ip)) {
            alert('Некорректный IP.');
            return;
        }

        if ( $(byTellCallBtn).hasClass('sh-active-btn') && isAuthority('ROLE_SYSTEM_ACCESS_SANCTION_IP_BY_CALL')) {
            ticketLink = 'По звонку';
        } else {
            if (!helpdeskLinkPatter.test(ticketLink)) {
                alert('Некорректная ссылка на тикет.');
                return;
            }
        }

        if (!agent) {
            alert('Не удалось определить агента.');
            return;
        }
        if (!tag) {
            alert('Не удалось определить тег.');
            return;
        }

        var data = {
            ticketLink: ticketLink.split('?')[0],
            agent: agent,
            tag: tag,
            ip: ip
        }
        // console.log(data);

        checkSanctionIPAllowRules(data);
        $('#sh-loading-layer').show();

    });

    $('#sh-sanction-ip-popup').show();
}
function checkSanctionIPAllowRules(data) {
    var url = "https://adm.avito.ru/system/access/allow?sort=-finishAt&status=active&ip=" + data.ip;

    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.send(null);
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
            if (xhr.status >= 200 && xhr.status < 400) {
                var response = xhr.responseText;
                var table = $(response).find('.table-striped');
                var alertBlock = $(table).find('.alert');
                var alertText = $(alertBlock).text().toLowerCase();

                if (~alertText.indexOf('правила не найдены')) {
                    checkSanctionIPDisallowRules(data);
                } else {
                    $('#sh-loading-layer').hide();
                    setTimeout(function() {
                        alert('На данный момент для этого IP уже существует активное разрешающее правило.');
                    }, 100);
                }
            }

            if (xhr.status >= 400) {
                $('#sh-loading-layer').hide();
                setTimeout(function() {
                    alert('Произошла техническая ошибка при проверке правил.\n'+ xhr.status +', '+ xhr.statusText +'');
                }, 100);
            }
        }
    }
}
function checkSanctionIPDisallowRules(data) {
    var url = "https://adm.avito.ru/system/access/disallow?sort=-finishAt&status=active&ip=" + data.ip;

    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.send(null);
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
            if (xhr.status >= 200 && xhr.status < 400) {
                var response = xhr.responseText;
                var table = $(response).find('.table-striped');
                var alertBlock = $(table).find('.alert');
                var alertText = $(alertBlock).text().toLowerCase();

                if (~alertText.indexOf('правила не найдены')) {
                    setSanctionIP(data);
                } else {
                    var isBlackForumspam = true;
                    $(table).find('tbody tr').each(function(i, tr) {
                        var rowText = $(tr).text();
                        if ( rowText.indexOf('black_forumspam') == -1 ) {
                            isBlackForumspam = false;
                        }
                    });

                    if (!isBlackForumspam) {
                        $('#sh-loading-layer').hide();
                        setTimeout(function() {
                            alert('На данный момент для этого IP существует активное запрещающее правило, отличное от black_forumspam.');
                        }, 100);
                    } else {
                        setSanctionIP(data);
                    }
                }
            }

            if (xhr.status >= 400) {
                $('#sh-loading-layer').hide();
                setTimeout(function() {
                    alert('Произошла техническая ошибка при проверке правил.\n'+ xhr.status +', '+ xhr.statusText +'');
                }, 100);
            }
        }
    }
}

function setSanctionIP(data) {
    chrome.runtime.sendMessage({
            action: 'XMLHttpRequest',
            method: "POST",
            url: "http://avitoadm.ru/support_helper/sanction_ip/sanctionIp.php",
            data: "sanctionIp=" + JSON.stringify(data),
        },

        function(response) {
            $('#sh-loading-layer').hide();
            if (response == 'error') {
                alert('Произошла техническая ошибка при попытке одобрить IP.');
                return;
            }

            try {
                var resp = JSON.parse(response);
            } catch(e) {
                alert('Произошла техническая ошибка при попытке одобрить IP.');
                return;
            }

            var http_code = +resp.http_code;

            if (http_code >=200 && http_code < 400) {
                var popup = $('#sh-sanction-ip-popup');
                var body = $(popup).find('.ah-popup-body');
                var footer = $(popup).find('.ah-popup-footer');

                $(body).empty();
                $(footer).remove();

                $(body).append('<div class="ah-alert ah-alert-success" style="margin-top: 0;"><p>IP-адрес '+ data.ip +' был успешно одобрен. Вы можете <a target="_blank" href="https://adm.avito.ru/system/access/allow?sort=-createdAt&ip='+ data.ip +'">посмотреть разрешающие правила</a> и проверить эту информацию.</p><p style="margin-bottom: 0;">Обратите внимание, что данные в админке могут обновляться с задержкой.</p></div>');
                $('#sh-loading-layer').hide();
            } else {
                alert('Произошла техническая ошибка.\nКод ошибки: '+ http_code);
            }
        }
    );
}