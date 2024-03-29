function commentOnUserModer(id, comment){
    var request = new XMLHttpRequest();
    request.open("POST", `${global.connectInfo.adm_url}/comment`, true);
    request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    request.send("objectTypeId=2&objectId="+id+"&comment="+encodeURIComponent(comment));
}

function commentOnItem(id, comment, action){
	action = action || '';
    var request = new XMLHttpRequest();
    request.open("POST", `${global.connectInfo.adm_url}/comment`, true);
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

function commentOnUserSupport(id, comment, action){
    action = action || '';
    var request = new XMLHttpRequest();
    request.open("POST", `${global.connectInfo.adm_url}/comment`, true);
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

// Запрос на BO через одну УЗ с правами
function getAdmWithSuperAcc(url) {
    return new Promise(function(resolve, reject) {
        chrome.runtime.sendMessage({
                action: 'XMLHttpRequest',
                method: "POST",
                url: `${global.connectInfo.ext_url}/journal/include/php/load/get_avito_adm.php`,
                data: 'url=' + encodeURIComponent(url)
            },
            function (response) {
                let json;
                try {
                    json = JSON.parse(response);
                } catch (e) {
                    reject(e);
                }

                if (json.http_code !== 200) {
                    reject(`Произошла ошибка: http code - ${json.http_code}`);
                }

                resolve(json.response_body);
            }
        );
    });
}

function getVerificationLog(phone) {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", `${global.connectInfo.adm_url}/users/phones_verification/full`, true);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
    xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
    xhr.send("phone="+phone);

    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4 && xhr.status == 200) {
            $('#ah-loading-layer').hide();
            var html = xhr.responseText;

            findUserWithVerifiedPhone(html, phone);
        }
        if (xhr.readyState == 4 && xhr.status > 200) {
            $('#ah-loading-layer').hide();
            setTimeout(function() {
                alert('Произошла техническая ошибка.\n'+ xhr.status +', '+ xhr.statusText +'');
            }, 100);
        }
    }
}

function changeEmail(email, domen, id) {
    var href = `${global.connectInfo.adm_url}/users/user/change_email/${id}`;

    var request = new XMLHttpRequest();
    request.open("POST", href, true);
    request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
    request.setRequestHeader("Accept", "*/*");
    request.setRequestHeader("X-Requested-With", "XMLHttpRequest");
    request.send("email=+" + email + "%40" + domen);
    request.onreadystatechange = function () {
        if (request.readyState == 4 && request.status == 200) {
            var r = request.responseText;
            if (r.indexOf("success") + 1) {
                notfake(email, domen);
                sendNewPassword(id);
                commentOnUserHack(id, email, domen, " вернул, взлом.");
                changeName();

                function changeName() {
                    var formElem = $('.js-user-info-form-user');
                    var name = $(formElem).find('[name="name"]');
                    var saveBtn = $(formElem).find('[name="save"]');
                    if (!formElem || !name || !saveBtn) {
                        alert('Ошибка: не удалось изменить имя пользователя.');
                        location.reload();
                    }

                    $(name).val('.');
                    $(saveBtn).click();
                }
            } else {
                $('#statusEmail').text(r);
            }
        }
    };
}

function notfake(emailCheck, domen) {
    var href = `${global.connectInfo.adm_url}/users/fakeemail/remove`;

    var request = new XMLHttpRequest();
    request.open("POST", href, true);
    request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
    request.setRequestHeader("Accept", "application/json, text/javascript, */*; q=0.01");
    request.setRequestHeader("X-Requested-With", "XMLHttpRequest");
    request.send("email=" + emailCheck + "%40" + domen);
}

function commentOnUserHack(id, email, domen, comment) {
    var commentFull = "[Admin.Helper.Email] " + email + "@" + domen + comment;
    var request = new XMLHttpRequest();
    request.open("POST", `${global.connectInfo.adm_url}/comment`, true);
    request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    request.send("objectTypeId=2&objectId=" + id + "&comment=" + encodeURIComponent(commentFull));
}

function sendNewPassword(id) {
    var href = `${global.connectInfo.adm_url}/users/user/edit/${id}/password`;

    var request = new XMLHttpRequest();
    request.open("POST", href, true);
    request.setRequestHeader("Accept", "*/*");
    request.setRequestHeader("X-Requested-With", "XMLHttpRequest");
    request.send(null);
}

function blockItem(id, reason) {
    var formDate = new FormData();
    formDate.append('reasons[]', reason);
    formDate.append('id', id);

    var xhr = new XMLHttpRequest();
    xhr.open("POST", `${global.connectInfo.adm_url}/items/item/block`, true);
    xhr.send(formDate);

    outTextFrame(id+' item is blocked');
}

function rejectItem(id, reason) {
    var formDate = new FormData();
    formDate.append('reasons[]', reason);
    formDate.append('id', id);

    var xhr = new XMLHttpRequest();
    xhr.open("POST", `${global.connectInfo.adm_url}/items/item/reject`, true);
    xhr.send(formDate);

    outTextFrame(id+' item is rejected');
}

function commentOnItemModer(id, comment){
    var request = new XMLHttpRequest();
    request.open("POST", `${global.connectInfo.adm_url}/comment`, true);
    request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    request.send("objectTypeId=1&objectId="+id+"&comment="+encodeURIComponent(comment));
}

function postBlockRequest(id, reason) {
    var request = new XMLHttpRequest();
    request.open("POST", `${global.connectInfo.adm_url}/users/user/block`, true);
    request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
    request.setRequestHeader("Accept", "*/*");
    request.setRequestHeader("X-Requested-With", "XMLHttpRequest");
    request.send('reasons%5B%5D='+reason+'&id='+id);
    request.onreadystatechange=function(){
        if (request.readyState === 4) {
            $('#ah-postBlockTable').find('tr[name="' + id + '"] td:eq(1)').text('DONE').css({color: '#009500'});

            if (request.status === 200) {
                $('#ah-postBlockTable').find('tr[name="' + id + '"] td:eq(2)').text('OK').css({color: '#009500'});
            } else {
                $('#ah-postBlockTable').find('tr[name="' + id + '"] td:eq(2)').text('FAIL').css({color: '#ff0000'});
            }
        } else {
            $('#ah-postBlockTable')
                .find('tr[name="' + id + '"] td:eq(1)').text('FAIL').css({color: '#ff0000'})
                .find('tr[name="' + id + '"] td:eq(2)').text('FAIL').css({color: '#ff0000'});
        }
    };
}

function blockUser(id, reason) {
    let request = new XMLHttpRequest();
    request.open("POST", `${global.connectInfo.adm_url}/users/user/block`, true);
    request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
    request.setRequestHeader("Accept", "*/*");
    request.setRequestHeader("X-Requested-With", "XMLHttpRequest");
    if (reason === 'BN') request.send('reasons%5B%5D=91&id='+id);
    else if (reason === 'BP') request.send('reasons%5B%5D=2&reasons%5B%5D=91&id='+id);
    else if (reason === 'BB') request.send('id='+id);
    else if (reason === 'MC') request.send('reasons%5B%5D=128&id='+id);
    else if (reason === 'PA') request.send('reasons%5B%5D=593&id='+id);
}

function chanceUser(id, chance) {
    let request = new XMLHttpRequest();
    request.open("POST", `${global.connectInfo.adm_url}/users/user/save/chance`, true);
    request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    request.send('chance='+chance+'&user='+id);
}

function unverify(obj, reloadPage) {

    var formData = new FormData();
    formData.append('id', obj.id);
    formData.append('phone', obj.phone);

    var url = `${global.connectInfo.adm_url}/users/user/phone/cancel_confirm`;

    var xhr = new XMLHttpRequest();
    xhr.open('POST', url, true);
    xhr.send(formData);

    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 && xhr.status == 200) {
            if (reloadPage) {
                alert('Номер успешно отвязан');
                location.reload();
            } else { // мультиотвязка
                $('#sh-added-phone-multi-unverify-list li:contains(' + obj.phone + ')').append('<span class="sh-multi-unverify-status-chacker" style="margin-left: 8px; color: green;">Ok</span>');

                if ($('.sh-multi-unverify-status-chacker').length == $('.sh-added-phone-multi-unverify').length) {
                    $('#ah-loading-layer').hide();

                    $('#sh-multi-unverify-action-btns div').detach();
                    $('#sh-close-and-reboot-btn').show();
                }
            }
        }

        if (xhr.readyState == 4 && xhr.status > 200) {
            if (reloadPage) {
                alert('Не удалось отвязать номер');
            } else {
                $('#sh-added-phone-multi-unverify-list li:contains(' + obj.phone + ')').append('<span class="sh-multi-unverify-status-chacker" style="margin-left: 8px; color: red;">Fail</span>');

                if ($('.sh-multi-unverify-status-chacker').length == $('.sh-added-phone-multi-unverify').length) {
                    $('#ah-loading-layer').hide();

                    $('#sh-multi-unverify-action-btns div').detach();
                    $('#sh-close-and-reboot-btn').show();
                }
            }
        }
    }
}

function createTicket(data) {
    var formData = new FormData();

    data.forEach(function (item) {
        formData.append('' + item.name + '', '' + item.value + '');
    });

    var files = $('[name="create-ticket-attaches[]"]');
    var newslide = files.prop('files');
    var filesArr = [];
    for (var i = 0; i < newslide.length; i++) {
        filesArr[i] = newslide[i];
        formData.append('attaches[]', filesArr[i]);
    }
    formData.append('attachProcessor', 'ticket_default');
    formData.append('method', 'ticket/admin_add');

    var url = `${global.connectInfo.adm_url}/helpdesk/api/1/proxyWithAttaches`;

    var xhr = new XMLHttpRequest();
    xhr.open('POST', url, true);
    xhr.send(formData);

    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
            $('#ah-loading-layer').hide();

            if (xhr.status == 200) {
                var response = JSON.parse(xhr.responseText);
                if (response.hasOwnProperty('error')) {
                    var errorText = JSON.stringify(response.error);
                    setTimeout(function () {
                        alert('error: ' + errorText);
                    }, 100);
                    return;
                }
                var ticketId = response.result.id;

                var modal = $('#ah-layer-blackout-modal').find('[data-modal-info="modal-create-new-ticket"]');
                var closeBtn = $(modal).find('.ah-modal-close');
                $(closeBtn).click();

                var isOpened = window.open(`${global.connectInfo.adm_url}/helpdesk/details/${ticketId}`);
                if (!isOpened) {
                    chrome.runtime.sendMessage({action: 'copyToClipboard', text: ticketId});
                    setTimeout(function () {
                        alert('Обращение было создано, однако в вашем браузере блокируются всплывающие окна для этого сайта.\nПожалуйста, снимите эту блокировку для сайта adm.avito.ru.\nНомер созданного обращения был скопирован в буфер обмена');
                    }, 100);
                }
            }

            if (xhr.status >= 400) {
                setTimeout(function () {
                    alert('Произошла техническая ошибка.\n' + xhr.status + ', ' + xhr.statusText + '');
                }, 100);
            }
        }
    }
}

function submitItemRequest(formData, data) {
    let url = `${global.connectInfo.adm_url}/items/moder/submit`;

    let xhr = new XMLHttpRequest();
    xhr.open('POST', url, true);
    xhr.send(formData);
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
            $('tr[data-id="' + data.itemId + '"]').remove();
        }

        if (xhr.readyState === 4 && xhr.status > 200) {


            $('body').append(`<div id="mh-error-alert" style="position: fixed; margin: auto; left: 0; right: 0; top: 0; bottom: 0; width: 320px; height: 110px; background-color: white;  padding: 10px; box-shadow: 0 0 10px; border-radius: 4px;"><span class="ah-close-btn" style="float: right;" id="mh-error-alert-close-btn"></span><span>Произошла ошибка. Техническая информация:</span><br><b><span>${xhr.status}:${xhr.statusText}</span></b><hr class="ah-default-hr"><span>Ссылка на объявление: <a href="${global.connectInfo.adm_url}/items/item/info/${data.itemId}" target="_blank">${data.itemId}</a></span></div>`);


            hideElementOutClicking($('#mh-error-alert'));

            $('#mh-error-alert-close-btn').click(function() {
                $('#mh-error-alert').detach();
            });


            $('tr[data-id="' + data.itemId + '"]').remove();
        }
    }
}

function editPersonalManager(userId, managerId) {
    const headers = new Headers({
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
    });
    return fetch(`${global.connectInfo.adm_url}/users/user/edit/manager/${userId}`, {
        method: 'post',
        credentials: 'include',
        headers: headers,
        body: `managerId=${managerId}`,
        redirect: 'error'
    }).then(response =>  {
        if (!response.ok) {
            return Promise.reject(response);
        }
        return response.json();
    });
}

function shopsModerationSendEmail(shopId, data) {
    return fetch(`${global.connectInfo.adm_url}/shops/moderation/send/email/${shopId}`, {
            method: 'post',
            credentials: 'include',
            body: data
        })
        .then(response => {
            if (!response.ok) {
                return Promise.reject(`Произошла ошибка:\n${response.status}\n${response.statusText}`);
            }
            if (response.redirected) {
                return Promise.reject(`Произошла техническая ошибка`);
            }
            return Promise.resolve();
        });
}

function updateOnlinePhotoCheck(id, status) {
    const formDate = new FormData();
    formDate.append('toggle', status);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${global.connectInfo.adm_url}/items/item/${id}/online_mark_toggle`, true);
    xhr.send(formDate);
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                if (status) outTextFrame(`У объявления ${id} успешно включена Online-проверка`);
                else outTextFrame(`У объявления ${id} успешно отключена Online-проверка`);
            } else {
                $(`.ah-online-photo-check input[data-item-id="${id}"]`).prop('checked', false);
                outTextFrame(`У объявления ${id} возникли проблемы с влючением онлайн проверки. Попробуйте еще раз.`);
            }
        }
    }
}

function updateUserProCheck(id, status, categoryId) {
    const formDate = new FormData();
    formDate.append('toggle', status);
    formDate.append('categoryId', categoryId);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${global.connectInfo.adm_url}/users/user/${id}/user_pro_flag_toggle`, true);
    xhr.send(formDate);
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                if (status) outTextFrame(`У пользователя ${id} успешно включен функционал Pro`);
                else outTextFrame(`У пользователя ${id} успешно отключен функционал Pro`);
            } else {
                $(`.ah-pro-user-toggle input[data-user-id="${id}"]`).prop('checked', false);
                outTextFrame(`У пользователя ${id} возникли проблемы с влючением функционал Pro. Попробуйте еще раз.`);
            }
        }
    }
}

function updateUserCommercialStatus(body, selector = null) {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${global.connectInfo.adm_url}/moderation-service-proxy/commercial-status/set-users`, true);
    xhr.send(JSON.stringify(body));
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                const { userIds } = body;
                const badChance = [];
                userIds.forEach((id, index) => chanceUserFetch(id, 8).then(response => {
                    if (!response) badChance.push(id);
                    if (index === userIds.length - 1) {
                        if (badChance.length === 0) outTextFrame('У выбранных пользоветелй был включен коммерческий статус и был проставлен 8 шанс.');
                        else outTextFrame(`У выбранных пользоветелй был включен коммерческий статус, но что-то пошло не так и шанс не проставился: ${badChance}`);

                        btnLoaderOff(selector);
                    }
                }).catch(() => btnLoaderOff(selector)));
            } else {
                outTextFrame(`Возникли проблемы с влючением коммерческого статуса`);
            }
        }
    }
}

function chanceUserFetch(id, chance) {
    const headers = new Headers({
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
    });
    return fetch(`${global.connectInfo.adm_url}/users/user/save/chance`, {
        credentials: 'include',
        method: 'POST',
        headers,
        body: `chance=${chance}&user=${id}`,
    }).then(response => response.status === 200);
}

function activateUser(userId) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: '/users/user/activate',
            data: { userId: userId },
            type: 'POST'
        })
        .done(data => resolve(data))
        .fail(data =>  reject(data));
    });
}

function getPermissions() {
    return fetch(`${global.connectInfo.adm_url}/helpdesk/api/1/proxy?method=agent/permissions`, {
        credentials: 'include',
        method: 'post',
        body: JSON.stringify({
            method: 'agent/permissions',
        })
    }).then(response =>  {
        if (response.status !== 200) {
            return Promise.reject(response);
        }
        return response.json();
    }).then(json => Promise.resolve(json.result));
}

function getHDProblems() {
    return fetch(`${global.connectInfo.adm_url}/helpdesk/api/1/proxy?method=dictionaries/ticket/problems`, {
        credentials: 'include',
        method: 'post',
        body: JSON.stringify({
            method: 'dictionaries/ticket/problems',
        })
    }).then(response =>  {
        if (response.status !== 200) {
            return Promise.reject(response);
        }
        return response.json();
    });
}

function getHDTags() {
    return fetch(`${global.connectInfo.adm_url}/helpdesk/api/1/proxy?method=dictionaries/tags`, {
        credentials: 'include',
        method: 'post',
        body: JSON.stringify({
            method: 'dictionaries/tags',
        })
    }).then(response => {
        if (response.status !== 200) {
            return Promise.reject(response);
        }
        return response.json();
    }).then(json => Promise.resolve(json.result));
}

function getHDTemplates() {
    return fetch(`${global.connectInfo.adm_url}/helpdesk/api/1/proxy?method=template/list/active`, {
        credentials: 'include',
        method: 'post',
        body: JSON.stringify({
            method: 'template/list/active',
        })
    }).then(response =>  {
        if (response.status !== 200) {
            return Promise.reject(response);
        }
        return response.json();
    });
}

function logHDFeature(feature) {
    return fetch(`${global.connectInfo.adm_url}/helpdesk/api/1/proxy?method=frontend/metrics/helper/feature`, {
        credentials: 'include',
        method: 'post',
        body: JSON.stringify({
            method: 'frontend/metrics/helper/feature',
            feature,
        }),
        headers: {'Content-Type': 'application/json'}
    }).then(response =>  {
        if (response.status !== 200) {
            return Promise.reject(response);
        }
        return response.json();
    });
}
