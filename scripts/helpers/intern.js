function startIntern() {
	console.log('intern script start');

    $(document).ready(function () {
        let location1 = location.href;

        //ИНТЕРН ЛОГ
        if (userGlobalInfo.subdivision === 'TL' || userGlobalInfo.subdivision === 'SD' || userGlobalInfo.subdivision === 'SO') {
            $('.dropdown-menu:contains(Выход) li').before('</li><li><a href="http://avitoadm.ru/intern_helper/internlog/" target = "_blank">Intern log</a><li><li class="divider" role="separator">');
        }
        
        if (location1.indexOf('https://adm.avito.ru/items/search') + 1 || location1.indexOf('https://adm.avito.ru/adm/items/search') + 1) {
            searchInform(); // поиск информ агентств
            addButtonsIntern();
            premoderationInternNew(userGlobalInfo.username, 'post');
        }
        
        if (location1.indexOf("https://adm.avito.ru/items/comparison/") > -1) {
            premoderationInternComparison(userGlobalInfo.username, location1);
        }
        if (location1.indexOf("https://adm.avito.ru/items/moder") + 1) {
            addButtonsIntern();
            premoderationInternNew(userGlobalInfo.username, 'pre');
            premoderationInternComparisonNew();
        }

        if (location1.indexOf("http://avitoadm.ru/intern_helper/") > -1) {
            eg();
        }
    });
}

function premoderationInternComparisonNew() {

	$('.js-comparison-link').click(function () {
		let compOpen = setInterval(function () {
			if ($('.js-btn-apply').length !== 0) {

                $('.js-btn-apply').remove();
                $('.js-comparison-modal .modal-footer').append('<button type="button" class="btn btn-primary btn-apply comperisonLog" style="background: #43bb54; border-color: #30ab59">Применить</button>');

                $('.comperisonLog').click(function () {
                    let mainItemID = $('.comparison-similarity:eq(0)').text().replace(/[^0-9]/gi, '');

                    let compItems = $('.comparison-row:eq(0) .comparison-cell');
                    let reason = [];

                    for (let i = 0; i < $(compItems).length; ++i) {
                    	let item = $(compItems).slice(i, i+1);
                    	let itemClass = $(item).attr('class').split(' ');
                    	let itemID, userID;

                        for (let j = 0; j < itemClass.length; ++j) {
                    		if (itemClass[j].indexOf('item')+1) itemID = itemClass[j].split('js-item-')[1];
                            if (itemClass[j].indexOf('user')+1) userID = itemClass[j].split('js-user-')[1];
                        }

                    	if (item.hasClass('not-valuable')) reason.push('Дубль [' + itemID + ']');
						else if (item.hasClass('is-valuable')) reason.push('Оставить [' + itemID + ']');
						else reason.push('Не дубль [' + itemID + ']');
                    }

                    interntoJSONitem(userGlobalInfo.username, 'Comparison', mainItemID, 'Open', [], reason);

                    $('tr[data-id="' + mainItemID + '"]').detach();
                    $('.close').click();
                    $('.js-comparison-link:eq(0)').click();
                });

                clearInterval(compOpen);
            }
        }, 100);
    });
}

function premoderationInternComparison(adm_username, url) {
	$('[type="button"]').removeClass('mb_block mb_skip mb_alive mb_user_alive');
	$('.row-user-block td a').removeClass('mb_user_block');
	
	let len = $('.comparison-actions td').length;
	
	for (let i = 0; i < len; i++) {
		let itemID =  $('.comparison-actions td').slice(i,i+1).attr('data-id');
		
		if (adm_username == 'asergeev' || adm_username == 'vorlovsky') $('.comparison-actions td').slice(i,i+1).find('div').before('<div>Item ID: '+itemID+'</div>');
		$('.comparison-actions td').slice(i,i+1).attr('i',i+1);
		$('.row-user-block td a').slice(i,i+1).attr('i',i+1);
	}
	
	let compID = url.split('/');
	
	let reason = [];
	
	$('[type="button"]').click(function () {
		let value = $(this).attr('value');
		let itemID = $(this).parents('td').attr('data-id');
		let i = $(this).parents('td').attr('i');
		
		interntoJSONitem(adm_username, 'Comparison', compID[5], value, [], [value + i + ' [' + itemID +']']);
		
		location.reload();
	});
	
	$('.row-user-block td a').click(function () {
		let value = 'Block user';
		let itemID = $(this).attr('data-id');
		let i = $(this).attr('i');
		
		interntoJSONitem(adm_username, 'Comparison', compID[5], value, [], [value + i + ' [' + itemID +']']);
		
		location.reload();
	});
}

function eg() {
	let size = $('.item_table').length;

	for (let i = 0; i < size; i++) {
		$('.item_table').slice(i,i+1).append('<div id="'+i+'" class="checkboxTest">'+
											 '<input type="checkbox" name="reason" value="101" iditem="'+i+'" reason="Фото">Фото'+
											 '<input type="checkbox" name="reason" value="102" iditem="'+i+'" reason="Название" style="margin-left:100px;">Название'+
											 '<input type="checkbox" name="reason" value="103" iditem="'+i+'" reason="Цена" style="margin-left:100px;">Цена'+
											 '<input type="checkbox" name="ok" value="104" iditem="'+i+'" reason="Все хорошо" style="margin-left:100px;">Все хорошо</div>');
	}

	$('.l-footer').before('<input id="submittest" type="button" value="Отправить">');
	$('.catalog-filters').after('<div style="font-weight:bold;">Введите вашу фамилию и имя: <input id="nametest" type="text" size="40"></div>');

	$('#submittest').click(function () {
		let nametest = $('#nametest').val();

		if (nametest.length == 0) alert('Введите, пожалуйста, имя и фамилию.');
		else {
			for (let i = 0; i < size; i++) {
				let selectedReason = [];
				let id = $('.checkboxTest').slice(i,i+1).attr('id');
				$('#'+id+' input:checked').each(function() {
					selectedReason.push($(this).attr('reason'));
				});
				interntoJSONitemAllow(nametest, 'Test', i+1, 'completed', [], selectedReason, currentTime(), i, size);
			}
			alert('Тест завершен! Спасибо.');
			window.location.reload();
		}
	});
}

function addButtonsIntern() {
	//REJECT
	$('body').append('<div id="reject" kind="Reject" class="moderate-modal is-hidden"><form class="moderateBox moderateBox_mini"> <div class="moderateBox_redflags" style="display: none;"><span></span></div>'+
		 '<div class="moderateBox_item_container has-children">'+
		 '<div class="moderateBox_item" style="display: block;"> <div class="moderateBox_check"> <input type="checkbox" name="reason" class="moderateBox_checkbox" id="reason_160" value="160" data-disabled="true" disabled=""> </div> <div class="moderateBox_data"> <div class="b-antifraud" title="0%"> <div class="name">Название</div> <div class="progress-line" style="display: block; border: 1px solid rgb(47, 139, 85);"><div class="progress-bar" style="width: 0px; background-color: rgb(47, 139, 85);"></div></div> <div class="description" style="display: block;"></div> </div> </div> </div>'+
		 '<div class="moderateBox_subitems" style="margin-top: 0px;">'+
		 '<div class="moderateBox_item" data-parent-id="160" style="display: block;"> <div class="moderateBox_check"> <input type="checkbox" name="reason" class="moderateBox_checkbox" id="reason_4" value="4"> </div> <div class="moderateBox_data"> <div class="b-antifraud" title="0%"> <div class="name">Цена</div> <div class="progress-line" style="display: block; border: 1px solid rgb(47, 139, 85);"><div class="progress-bar" style="width: 0px; background-color: rgb(47, 139, 85);"></div></div> <div class="description" style="display: block;"></div> </div> </div> </div>'+
		 '<div class="moderateBox_item" data-parent-id="160" style="display: block;"> <div class="moderateBox_check"> <input type="checkbox" name="reason" class="moderateBox_checkbox" id="reason_12" value="12"> </div> <div class="moderateBox_data"> <div class="b-antifraud" title="0%"> <div class="name">Привлечение внимания</div> <div class="progress-line" style="display: block; border: 1px solid rgb(47, 139, 85);"><div class="progress-bar" style="width: 0px; background-color: rgb(47, 139, 85);"></div></div> <div class="description" style="display: block;"></div> </div> </div> </div>'+
		 '<div class="moderateBox_item" data-parent-id="160" style="display: block;"> <div class="moderateBox_check"> <input type="checkbox" name="reason" class="moderateBox_checkbox" id="reason_161" value="161"> </div> <div class="moderateBox_data"> <div class="b-antifraud" title="0%"> <div class="name">Контакты</div> <div class="progress-line" style="display: block; border: 1px solid rgb(47, 139, 85);"><div class="progress-bar" style="width: 0px; background-color: rgb(47, 139, 85);"></div></div> <div class="description" style="display: block;"></div> </div> </div> </div>'+
		 '<div class="moderateBox_item" data-parent-id="160" style="display: block;"> <div class="moderateBox_check"> <input type="checkbox" name="reason" class="moderateBox_checkbox" id="reason_114" value="114"> </div> <div class="moderateBox_data"> <div class="b-antifraud" title="0%"> <div class="name">Некорректное</div> <div class="progress-line" style="display: block; border: 1px solid rgb(47, 139, 85);"><div class="progress-bar" style="width: 0px; background-color: rgb(47, 139, 85);"></div></div> <div class="description" style="display: block;"></div> </div> </div> </div>'+
		 '<i class="arrow" style="margin-top: 0px;"></i> </div>'+
		 '</div>'+
		 '<div class="moderateBox_item_container has-children">'+
		 '<div class="moderateBox_item" data-category-ids="101,106,89,90,91,92,93,94,24,23,25,26,85,42,86,27,29,11,30,28,88,32,97,31,98,99,96,84,33,38,109,9,14,81,10,21,20,87,19,34,83,36,102,39,40,82,1,2,35,4,5,6,7,105,8,114,110,111,115,113,112,116" style="display: block;"> <div class="moderateBox_check"> <input type="checkbox" name="reason" class="moderateBox_checkbox" id="reason_162" value="162" data-disabled="true" disabled=""> </div> <div class="moderateBox_data"> <div class="b-antifraud" title="0%"> <div class="name">Цена</div> <div class="progress-line" style="display: block; border: 1px solid rgb(47, 139, 85);"><div class="progress-bar" style="width: 0px; background-color: rgb(47, 139, 85);"></div></div> <div class="description" style="display: block;"></div> </div> </div> </div>'+
		 '<div class="moderateBox_subitems">'+
		 '<div class="moderateBox_item" data-category-ids="101,106,89,90,91,92,93,94,24,23,25,26,85,42,86,27,29,11,30,28,88,32,97,31,98,99,96,84,33,38,109,9,14,81,10,21,20,87,19,34,83,36,102,39,40,82,1,2,35,4,5,6,7,105,8,114,110,111,115,113,112,116" data-parent-id="162" style="display: block;"> <div class="moderateBox_check"> <input type="checkbox" name="reason" class="moderateBox_checkbox" id="reason_11" value="11"> </div> <div class="moderateBox_data"> <div class="b-antifraud" title="0%"> <div class="name">Нереалистичная</div> <div class="progress-line" style="display: block; border: 1px solid rgb(47, 139, 85);"><div class="progress-bar" style="width: 0px; background-color: rgb(47, 139, 85);"></div></div> <div class="description" style="display: block;"></div> </div> </div> </div>'+
		 '<div class="moderateBox_item" data-category-ids="101,106,89,90,91,92,93,94,24,23,25,26,85,42,86,27,29,11,30,28,88,32,97,31,98,99,96,84,33,38,109,9,14,81,10,21,20,87,19,34,83,36,102,39,40,82,1,2,35,4,5,6,7,105,8,114,110,111,115,113,112,116" data-parent-id="162" style="display: block;"> <div class="moderateBox_check"> <input type="checkbox" name="reason" class="moderateBox_checkbox" id="reason_165" value="165"> </div> <div class="moderateBox_data"> <div class="b-antifraud"> <div class="name">Несоответствующая</div> <div class="progress-line" style="display: none;"><div class="progress-bar"></div></div> <div class="description" style="display: none;"></div> </div> </div> </div>'+
		 '<i class="arrow"></i> </div>'+
		 '</div>'+
		 '<div class="moderateBox_item_container has-children">'+
		 '<div class="moderateBox_item" style="display: block;"> <div class="moderateBox_check"> <input type="checkbox" name="reason" class="moderateBox_checkbox" id="reason_166" value="166" data-disabled="true" disabled=""> </div> <div class="moderateBox_data"> <div class="b-antifraud"> <div class="name">Фото</div> <div class="progress-line" style="display: block; border: 1px solid rgb(47, 139, 85);"><div class="progress-bar" style="width: 0px; background-color: rgb(47, 139, 85);"></div></div> <div class="description" style="display: block;"></div> </div> </div> </div>'+
		 '<div class="moderateBox_subitems" style="margin-top: 0px;">'+
		 '<div class="moderateBox_item" data-parent-id="166" style="display: block;"> <div class="moderateBox_check"> <input type="checkbox" name="reason" class="moderateBox_checkbox" id="reason_167" value="167"> </div> <div class="moderateBox_data"> <div class="b-antifraud" title="0%"> <div class="name">Контакты</div> <div class="progress-line" style="display: block; border: 1px solid rgb(47, 139, 85);"><div class="progress-bar" style="width: 0px; background-color: rgb(47, 139, 85);"></div></div> <div class="description" style="display: block;"></div> </div> </div> </div>'+
		 '<div class="moderateBox_item" data-parent-id="166" style="display: block;"> <div class="moderateBox_check"> <input type="checkbox" name="reason" class="moderateBox_checkbox" id="reason_168" value="168"> </div> <div class="moderateBox_data"> <div class="b-antifraud" title="0%"> <div class="name">Привлечение внимания</div> <div class="progress-line" style="display: block; border: 1px solid rgb(47, 139, 85);"><div class="progress-bar" style="width: 0px; background-color: rgb(47, 139, 85);"></div></div> <div class="description" style="display: block;"></div> </div> </div> </div>'+
		 '<div class="moderateBox_item" data-parent-id="166" style="display: block;"> <div class="moderateBox_check"> <input type="checkbox" name="reason" class="moderateBox_checkbox" id="reason_169" value="169"> </div> <div class="moderateBox_data"> <div class="b-antifraud"> <div class="name">Вотермарки и логотипы</div> <div class="progress-line" style="display: none;"><div class="progress-bar"></div></div> <div class="description" style="display: none;"></div> </div> </div> </div>'+
		 '<div class="moderateBox_item" data-category-ids="111" data-parent-id="166" style="display: block;"> <div class="moderateBox_check"> <input type="checkbox" name="reason" class="moderateBox_checkbox" id="reason_170" value="170"> </div> <div class="moderateBox_data"> <div class="b-antifraud"> <div class="name">Не логотип</div> <div class="progress-line" style="display: none;"><div class="progress-bar"></div></div> <div class="description" style="display: none;"></div> </div> </div> </div>'+
		 '<div class="moderateBox_item" data-category-ids="112" data-parent-id="166" style="display: none;"> <div class="moderateBox_check"> <input type="checkbox" name="reason" class="moderateBox_checkbox" id="reason_171" value="171"> </div> <div class="moderateBox_data"> <div class="b-antifraud"> <div class="name">Не фото</div> <div class="progress-line" style="display: none;"><div class="progress-bar"></div></div> <div class="description" style="display: none;"></div> </div> </div> </div>'+
		 '<div class="moderateBox_item" data-parent-id="166" style="display: block;"> <div class="moderateBox_check"> <input type="checkbox" name="reason" class="moderateBox_checkbox" id="reason_112" value="112"> </div> <div class="moderateBox_data"> <div class="b-antifraud"> <div class="name">Некорректное</div> <div class="progress-line" style="display: none;"><div class="progress-bar"></div></div> <div class="description" style="display: none;"></div> </div> </div> </div>'+
		 '<div class="moderateBox_item" data-parent-id="166" style="display: block;"> <div class="moderateBox_check"> <input type="checkbox" name="reason" class="moderateBox_checkbox" id="reason_15" value="15"> </div> <div class="moderateBox_data"> <div class="b-antifraud" title="100%"> <div class="name">Несоответствующее</div> <div class="progress-line" style="display: block; border: 1px solid rgb(47, 139, 85);"><div class="progress-bar" style="width: 0px; background-color: rgb(47, 139, 85);"></div></div> <div class="description" style="display: block;"></div> </div> </div> </div>'+
		 '<div class="moderateBox_item" data-category-ids="4,23,24,25,26,42,85,86" data-parent-id="166" style="display: block;"> <div class="moderateBox_check"> <input type="checkbox" name="reason" class="moderateBox_checkbox" id="reason_729" value="729"> </div> <div class="moderateBox_data"> <div class="b-antifraud" title="0%"> <div class="name">Недостаточно фото</div> <div class="progress-line" style="display: block; border: 1px solid rgb(47, 139, 85);"><div class="progress-bar" style="background-color: rgb(47, 139, 85); width: 0px;"></div></div> <div class="description" style="display: block;"></div> </div> </div> </div>' +
         '<div class="moderateBox_item" data-category-ids="112" data-parent-id="166" style="display: block;"> <div class="moderateBox_check"> <input type="checkbox" name="reason" class="moderateBox_checkbox" id="reason_171" value="171"> </div> <div class="moderateBox_data"> <div class="b-antifraud" title="0%"> <div class="name">Не фото</div> <div class="progress-line" style="display: block; border: 1px solid rgb(47, 139, 85);"><div class="progress-bar" style="background-color: rgb(47, 139, 85); width: 0px;"></div></div> <div class="description" style="display: block;"></div> </div> </div> </div>'+
		 '<i class="arrow" style="margin-top: 0px;"></i> </div>'+
		 '</div>'+
		 '<div class="moderateBox_item_container has-children">'+
		 '<div class="moderateBox_item" style="display: block;"> <div class="moderateBox_check"> <input type="checkbox" name="reason" class="moderateBox_checkbox" id="reason_172" value="172" data-disabled="true" disabled=""> </div> <div class="moderateBox_data"> <div class="b-antifraud" title="0%"> <div class="name">Описание</div> <div class="progress-line" style="display: block; border: 1px solid rgb(47, 139, 85);"><div class="progress-bar" style="width: 0px; background-color: rgb(47, 139, 85);"></div></div> <div class="description" style="display: block;"></div> </div> </div> </div>'+
		 '<div class="moderateBox_subitems" style="margin-top: 0px;">'+
		 '<div class="moderateBox_item" data-parent-id="172" style="display: block;"> <div class="moderateBox_check"> <input type="checkbox" name="reason" class="moderateBox_checkbox" id="reason_106" value="106"> </div> <div class="moderateBox_data"> <div class="b-antifraud" title="0%"> <div class="name">Контакты</div> <div class="progress-line" style="display: block; border: 1px solid rgb(47, 139, 85);"><div class="progress-bar" style="width: 0px; background-color: rgb(47, 139, 85);"></div></div> <div class="description" style="display: block;"></div> </div> </div> </div>'+
		 '<div class="moderateBox_item" data-parent-id="172" style="display: block;"> <div class="moderateBox_check"> <input type="checkbox" name="reason" class="moderateBox_checkbox" id="reason_16" value="16"> </div> <div class="moderateBox_data"> <div class="b-antifraud"> <div class="name">Ключевые слова</div> <div class="progress-line" style="display: none;"><div class="progress-bar"></div></div> <div class="description" style="display: none;"></div> </div> </div> </div>'+
		 '<div class="moderateBox_item" data-category-ids="116,82,0,101,106,89,90,91,92,93,94,24,23,25,26,85,42,86,27,29,11,30,28,88,32,97,31,98,99,96,84,33,38,100,14,81,10,21,20,87,19,34,83,36,102,39,40,1,2,35,4,5,6,7,105,8,104,43,114,110,115,113,112,109,9,103" data-parent-id="172" style="display: block;"> <div class="moderateBox_check"> <input type="checkbox" name="reason" class="moderateBox_checkbox" id="reason_14" value="14"> </div> <div class="moderateBox_data"> <div class="b-antifraud"> <div class="name">Не подробное</div> <div class="progress-line" style="display: none;"><div class="progress-bar"></div></div> <div class="description" style="display: none;"></div> </div> </div> </div>'+
		 '<div class="moderateBox_item" data-category-ids="111" data-parent-id="172" style="display: block;"> <div class="moderateBox_check"> <input type="checkbox" name="reason" class="moderateBox_checkbox" id="reason_117" value="117"> </div> <div class="moderateBox_data"> <div class="b-antifraud"> <div class="name">Дискриминация</div> <div class="progress-line" style="display: block;"><div class="progress-bar"></div></div> <div class="description" style="display: none;"></div> </div> </div> </div>'+
		 '<div class="moderateBox_item" data-parent-id="172" style="display: block;"> <div class="moderateBox_check"> <input type="checkbox" name="reason" class="moderateBox_checkbox" id="reason_177" value="177"> </div> <div class="moderateBox_data"> <div class="b-antifraud" title="0%"> <div class="name">Некорректное</div> <div class="progress-line" style="display: block; border: 1px solid rgb(47, 139, 85);"><div class="progress-bar" style="width: 0px; background-color: rgb(47, 139, 85);"></div></div> <div class="description" style="display: block;"></div> </div> </div> </div>'+
		 '<div class="moderateBox_item" data-category-ids="111" data-parent-id="172" style="display: block;"> <div class="moderateBox_check"> <input type="checkbox" name="reason" class="moderateBox_checkbox" id="reason_465" value="465"> </div> <div class="moderateBox_data"> <div class="b-antifraud"> <div class="name">Не подробное (вакансии)</div> <div class="progress-line" style="display: none;"><div class="progress-bar"></div></div> <div class="description" style="display: none;"></div> </div> </div> </div>'+
		 '<i class="arrow" style="margin-top: 0px;"></i> </div>'+
		 '</div>'+
		 '<div class="moderateBox_item_container has-children">'+
		 '<div class="moderateBox_item" data-category-ids="101,89,90,93,24,23,25,26,85,42,86,27,29,11,30,28,88,32,97,99,96,84,33,38,109,9,14,81,10,21,20,87,19,34,83,36,39,40,103,1,2,35,4,5,6,7,105,8,114,110,111,115,113,112,116" data-params="true" style="display: block;"> <div class="moderateBox_check"> <input type="checkbox" name="reason" class="moderateBox_checkbox" id="reason_175" value="175" data-disabled="true" disabled=""> </div> <div class="moderateBox_data"> <div class="b-antifraud"> <div class="name">Параметр</div> <div class="progress-line" style="display: none;"><div class="progress-bar"></div></div> <div class="description" style="display: none;"></div> </div> </div> </div>'+
		 '<div id="parameters" class="moderateBox_subitems">'+
		 '</div>'+
		 '</div>'+
		 '<div class="moderateBox_item_container">'+
		 '<div class="moderateBox_item" style="display: block;"> <div class="moderateBox_check"> <input type="checkbox" name="reason" class="moderateBox_checkbox" id="reason_13" value="13"> </div> <div class="moderateBox_data"> <div class="b-antifraud"> <div class="name">Несколько товаров</div> <div class="progress-line" style="display: none;"><div class="progress-bar"></div></div> <div class="description" style="display: none;"></div> </div> </div> </div>'+
		 '</div>'+
		 '<div class="moderateBox_item_container">'+
         '<div class="moderateBox_item" data-category-ids="116,82,0,101,106,89,90,91,92,93,94,24,23,25,26,85,42,86,27,29,11,30,28,88,32,97,31,98,99,96,84,33,38,100,14,81,10,21,20,87,19,34,83,36,102,39,40,1,2,35,4,5,6,7,105,8,104,43,114,110,115,113,112,109,9,103" style="display: block;"> <div class="moderateBox_check"> <input type="checkbox" name="reason" class="moderateBox_checkbox" id="reason_14" value="14"> </div> <div class="moderateBox_data"> <div class="b-antifraud" title="0%"> <div class="name">Не подробное</div> <div class="progress-line" style="display: none; border: 1px solid rgb(47, 139, 85);"><div class="progress-bar" style="background-color: rgb(47, 139, 85); width: 0px;"></div></div> <div class="description" style="display: none;"></div> </div> </div> </div>'+
    	 '</div>'+
		 '<div class="moderateBox_item_container">'+
		 '<div class="moderateBox_item" style="display: block;"> <div class="moderateBox_check"> <input type="checkbox" name="reason" class="moderateBox_checkbox" id="reason_122" value="122"> </div> <div class="moderateBox_data"> <div class="b-antifraud"> <div class="name">Отсутствие товара</div> <div class="progress-line" style="display: none;"><div class="progress-bar"></div></div> <div class="description" style="display: none;"></div> </div> </div> </div>'+
		 '</div>'+
		 '<div class="moderateBox_item_container">'+
		 '<div class="moderateBox_item" style="display: block;"> <div class="moderateBox_check"> <input type="checkbox" name="reason" class="moderateBox_checkbox" id="reason_178" value="178"> </div> <div class="moderateBox_data"> <div class="b-antifraud" title="0%"> <div class="name">Неправильная категория</div> <div class="progress-line" style="display: block; border: 1px solid rgb(47, 139, 85);"><div class="progress-bar" style="width: 0px; background-color: rgb(47, 139, 85);"></div></div> <div class="description" style="display: block;"></div> </div> </div> </div>'+
		 '</div>'+
		 '<div class="moderateBox_item_container">'+
		 '<div class="moderateBox_item" data-category-ids="24" style="display: block;"> <div class="moderateBox_check"> <input type="checkbox" name="reason" class="moderateBox_checkbox" id="reason_500" value="500"> </div> <div class="moderateBox_data"> <div class="b-antifraud"> <div class="name">Ссылка на документацию</div> <div class="progress-line" style="display: none;"><div class="progress-bar"></div></div> <div class="description" style="display: none;"></div> </div> </div> </div>'+
		 '</div>'+
		 '<div class="moderateBox_item_container">'+
		 '<div class="moderateBox_item" style="display: block;"> <div class="moderateBox_check"> <input type="checkbox" name="reason" class="moderateBox_checkbox" id="reason_608" value="608"> </div> <div class="moderateBox_data"> <div class="b-antifraud"> <div class="name">Точка на карте</div> <div class="progress-line" style="display: none;"><div class="progress-bar"></div></div> <div class="description" style="display: none;"></div> </div> </div> </div>'+
		 '</div><div class="moderateBox_other"> <input type="text" placeholder="Другие причины" name="reason_other" class="reason_other"> <input type="text" placeholder="Комментарий" name="reason_comment" class="reason_comment"> </div> <div class="moderateBox_buttons"> <input id="rejectSubmit" class="btn red" type="button" value="Отклонить" data-item-block="Block" data-item-block-fake="Unblock" data-item-reject="Reject" data-item-reject-fake="Allow" data-user-block="Block" style="color: rgb(47, 139, 85);"> <input class="btn" type="reset" value="Отмена"></div> </form></div>');


	//BLOCK
	$('body').append('<div id="block" kind="Block" class="moderate-modal is-hidden"><form class="moderateBox moderateBox_mini"> <div class="moderateBox_redflags" style="display: none;"><span></span></div>'+
		 '<div class="moderateBox_item_container">'+
		 '<div class="moderateBox_item" style="display: block;"> <div class="moderateBox_check"> <input type="checkbox" name="reason" class="moderateBox_checkbox" id="reason_20" value="20"> </div> <div class="moderateBox_data"> <div class="b-antifraud" title="0%"> <div class="name">Повторная подача объявления</div> <div class="progress-line" style="display: block; border: 1px solid rgb(47, 139, 85);"><div class="progress-bar" style="width: 0px; background-color: rgb(47, 139, 85);"></div></div> <div class="description" style="display: block;"></div> </div> </div> </div>'+
		 '</div>'+
		 '<div class="moderateBox_item_container">'+
		 '<div class="moderateBox_item_container has-children">'+
		 '<div class="moderateBox_item" style="display: block;"> <div class="moderateBox_check"> <input type="checkbox" name="reason" class="moderateBox_checkbox" id="reason_21" value="21"> </div> <div class="moderateBox_data"> <div class="b-antifraud" title="0%"> <div class="name">Запрещённый товар</div> <div class="progress-line" style="display: block; border: 1px solid rgb(47, 139, 85);"><div class="progress-bar" style="width: 0px; background-color: rgb(47, 139, 85);"></div></div> <div class="description" style="display: block;"></div> </div> </div> </div>'+
		 '<div class="moderateBox_subitems">'+
		 '<div class="moderateBox_item" data-parent-id="21" style="display: block;"> <div class="moderateBox_check"> <input type="checkbox" name="reason" class="moderateBox_checkbox" id="reason_134" value="134"> </div> <div class="moderateBox_data"> <div class="b-antifraud"> <div class="name">Наркотики</div> <div class="progress-line" style="display: none;"><div class="progress-bar"></div></div> <div class="description" style="display: none;"></div> </div> </div> </div>'+
		 '<div class="moderateBox_item" data-parent-id="21" style="display: block;"> <div class="moderateBox_check"> <input type="checkbox" name="reason" class="moderateBox_checkbox" id="reason_135" value="135"> </div> <div class="moderateBox_data"> <div class="b-antifraud"> <div class="name">Оружие</div> <div class="progress-line" style="display: none;"><div class="progress-bar"></div></div> <div class="description" style="display: none;"></div> </div> </div> </div>'+
		 '<div class="moderateBox_item" data-parent-id="21" style="display: block;"> <div class="moderateBox_check"> <input type="checkbox" name="reason" class="moderateBox_checkbox" id="reason_136" value="136"> </div> <div class="moderateBox_data"> <div class="b-antifraud"> <div class="name">Медикаменты и оборудование</div> <div class="progress-line" style="display: none;"><div class="progress-bar"></div></div> <div class="description" style="display: none;"></div> </div> </div> </div>'+
		 '<div class="moderateBox_item" data-parent-id="21" style="display: block;"> <div class="moderateBox_check"> <input type="checkbox" name="reason" class="moderateBox_checkbox" id="reason_137" value="137"> </div> <div class="moderateBox_data"> <div class="b-antifraud"> <div class="name">Алкоголь и табак</div> <div class="progress-line" style="display: none;"><div class="progress-bar"></div></div> <div class="description" style="display: none;"></div> </div> </div> </div>'+
		 '<div class="moderateBox_item" data-parent-id="21" style="display: block;"> <div class="moderateBox_check"> <input type="checkbox" name="reason" class="moderateBox_checkbox" id="reason_138" value="138"> </div> <div class="moderateBox_data"> <div class="b-antifraud"> <div class="name">Интим</div> <div class="progress-line" style="display: none;"><div class="progress-bar"></div></div> <div class="description" style="display: none;"></div> </div> </div> </div>'+
		 '<div class="moderateBox_item" data-parent-id="21" style="display: block;"> <div class="moderateBox_check"> <input type="checkbox" name="reason" class="moderateBox_checkbox" id="reason_139" value="139"> </div> <div class="moderateBox_data"> <div class="b-antifraud"> <div class="name">Финансовые операции</div> <div class="progress-line" style="display: none;"><div class="progress-bar"></div></div> <div class="description" style="display: none;"></div> </div> </div> </div>'+
		 '<div class="moderateBox_item" data-parent-id="21" style="display: block;"> <div class="moderateBox_check"> <input type="checkbox" name="reason" class="moderateBox_checkbox" id="reason_140" value="140"> </div> <div class="moderateBox_data"> <div class="b-antifraud"> <div class="name">Красная книга и браконьерство</div> <div class="progress-line" style="display: none;"><div class="progress-bar"></div></div> <div class="description" style="display: none;"></div> </div> </div> </div>'+
		 '<div class="moderateBox_item" data-parent-id="21" style="display: block;"> <div class="moderateBox_check"> <input type="checkbox" name="reason" class="moderateBox_checkbox" id="reason_141" value="141"> </div> <div class="moderateBox_data"> <div class="b-antifraud"> <div class="name">Награды</div> <div class="progress-line" style="display: none;"><div class="progress-bar"></div></div> <div class="description" style="display: none;"></div> </div> </div> </div>'+
		 '<div class="moderateBox_item" data-parent-id="21" style="display: block;"> <div class="moderateBox_check"> <input type="checkbox" name="reason" class="moderateBox_checkbox" id="reason_142" value="142"> </div> <div class="moderateBox_data"> <div class="b-antifraud"> <div class="name">Специальные технические средства</div> <div class="progress-line" style="display: none;"><div class="progress-bar"></div></div> <div class="description" style="display: none;"></div> </div> </div> </div>'+
		 '<div class="moderateBox_item" data-parent-id="21" style="display: block;"> <div class="moderateBox_check"> <input type="checkbox" name="reason" class="moderateBox_checkbox" id="reason_143" value="143"> </div> <div class="moderateBox_data"> <div class="b-antifraud"> <div class="name">Спам-базы и БД</div> <div class="progress-line" style="display: none;"><div class="progress-bar"></div></div> <div class="description" style="display: none;"></div> </div> </div> </div>'+
		 '<div class="moderateBox_item" data-parent-id="21" style="display: block;"> <div class="moderateBox_check"> <input type="checkbox" name="reason" class="moderateBox_checkbox" id="reason_144" value="144"> </div> <div class="moderateBox_data"> <div class="b-antifraud"> <div class="name">Игорный бизнес</div> <div class="progress-line" style="display: none;"><div class="progress-bar"></div></div> <div class="description" style="display: none;"></div> </div> </div> </div>'+
		 '<div class="moderateBox_item" data-category-ids="111" data-parent-id="21" style="display: none;"> <div class="moderateBox_check"> <input type="checkbox" name="reason" class="moderateBox_checkbox" id="reason_145" value="145"> </div> <div class="moderateBox_data"> <div class="b-antifraud"> <div class="name">Сомнительная работа</div> <div class="progress-line" style="display: none;"><div class="progress-bar"></div></div> <div class="description" style="display: none;"></div> </div> </div> </div>'+
		 '<div class="moderateBox_item" data-category-ids="1,2,4,5,6,7,8,9,10,11,14,19,20,21,23,24,25,26,27,28,29,30,31,32,33,34,35,36,38,39,40,42,81,82,83,84,85,86,87,88,89,90,91,92,93,94,96,97,98,99,101,102,103,105,106,109,110,112,113,114,115,116" data-parent-id="21" style="display: block;"> <div class="moderateBox_check"> <input type="checkbox" name="reason" class="moderateBox_checkbox" id="reason_146" value="146"> </div> <div class="moderateBox_data"> <div class="b-antifraud"> <div class="name">Сомнительное объявление</div> <div class="progress-line" style="display: none;"><div class="progress-bar"></div></div> <div class="description" style="display: none;"></div> </div> </div> </div>'+
		 '<div class="moderateBox_item" data-parent-id="21" style="display: block;"> <div class="moderateBox_check"> <input type="checkbox" name="reason" class="moderateBox_checkbox" id="reason_716" value="716"> </div> <div class="moderateBox_data"> <div class="b-antifraud"> <div class="name">Запрещенная работа</div> <div class="progress-line" style="display: none;"><div class="progress-bar"></div></div> <div class="description" style="display: none;"></div> </div> </div> </div>'+
		 '<i class="arrow"></i> </div>'+
		 '</div>'+
		 '<div class="moderateBox_item_container">'+
		 '<div class="moderateBox_item" data-category-ids="24,23,25,26,85,42,86" style="display: block;"> <div class="moderateBox_check"> <input type="checkbox" name="reason" class="moderateBox_checkbox" id="reason_25" value="25"> </div> <div class="moderateBox_data"> <div class="b-antifraud" title="0%"> <div class="name">Неправильный город</div> <div class="progress-line" style="display: block; border: 1px solid rgb(47, 139, 85);"><div class="progress-bar" style="width: 0px; background-color: rgb(47, 139, 85);"></div></div> <div class="description" style="display: block;"></div> </div> </div> </div>'+
		 '</div>'+
         '<div class="moderateBox_item_container">' +
        ' <div class="moderateBox_item" data-category-ids="9,109,14,81,11,10,21,20,87,19,106,27,29,30,28,88,32,97,31,98,99,96,84,101,105,33,34,83,36,38,102,39,103,40,82,89,90,91,92,93,94,114,115,116,117" style="display: block;"> <div class="moderateBox_check"> <input type="checkbox" name="reason" class="moderateBox_checkbox" id="reason_26" value="26"> </div> <div class="moderateBox_data"> <div class="b-antifraud" title="0%"> <div class="name">Объявление о покупке</div> <div class="progress-line" style="display: block; border: 1px solid rgb(47, 139, 85);"><div class="progress-bar" style="background-color: rgb(47, 139, 85); width: 0px;"></div></div> <div class="description" style="display: block;"></div> </div> </div> </div>' +
        '  </div>' +
		 '<div class="moderateBox_item_container">'+
		 '<div class="moderateBox_item" style="display: block;"> <div class="moderateBox_check"> <input type="checkbox" name="reason" class="moderateBox_checkbox" id="reason_125" value="125"> </div> <div class="moderateBox_data"> <div class="b-antifraud"> <div class="name">Реклама бизнеса и сайтов</div> <div class="progress-line" style="display: none;"><div class="progress-bar"></div></div> <div class="description" style="display: none;"></div> </div> </div> </div>'+
		 '</div>'+
		 '<div class="moderateBox_item_container">'+
		 '<div class="moderateBox_item" style="display: block;"> <div class="moderateBox_check"> <input type="checkbox" name="reason" class="moderateBox_checkbox" id="reason_119" value="119"> </div> <div class="moderateBox_data"> <div class="b-antifraud"> <div class="name">Копии товаров</div> <div class="progress-line" style="display: none;"><div class="progress-bar"></div></div> <div class="description" style="display: none;"></div> </div> </div> </div>'+
		 '</div>'+
		 '<div class="moderateBox_item_container">'+
		 '<div class="moderateBox_item" style="display: block;"> <div class="moderateBox_check"> <input type="checkbox" name="reason" class="moderateBox_checkbox" id="reason_131" value="131"> </div> <div class="moderateBox_data"> <div class="b-antifraud"> <div class="name">Типовой товар</div> <div class="progress-line" style="display: none;"><div class="progress-bar"></div></div> <div class="description" style="display: none;"></div> </div> </div> </div>'+
		 '</div>'+
		 '<div class="moderateBox_item_container">'+
		 '<div class="moderateBox_item" style="display: block;"> <div class="moderateBox_check"> <input type="checkbox" name="reason" class="moderateBox_checkbox" id="reason_23" value="23"> </div> <div class="moderateBox_data"> <div class="b-antifraud"> <div class="name">Жалобы пользователей</div> <div class="progress-line" style="display: none;"><div class="progress-bar"></div></div> <div class="description" style="display: none;"></div> </div> </div> </div>'+
		 '</div>'+
		 '<div class="moderateBox_item_container">'+
		 '<div class="moderateBox_item" data-category-ids="9,109,14,81,11,10,24,23,25,26,85,42,86,111,112,114,115,27,29,30,28,88,21,20,87,82,19,106,32,97,31,98,99,96,84,101,105,33,34,83,36,38,102,39,89,90,91,92,93,94,116,40" style="display: block;"> <div class="moderateBox_check"> <input type="checkbox" name="reason" class="moderateBox_checkbox" id="reason_129" value="129"> </div> <div class="moderateBox_data"> <div class="b-antifraud"> <div class="name">Жалобы правообладателей</div> <div class="progress-line" style="display: none;"><div class="progress-bar"></div></div> <div class="description" style="display: none;"></div> </div> </div> </div>'+
		 '</div>'+
		 '<div class="moderateBox_item_container">'+
		 '<div class="moderateBox_item" data-category-ids="10,23,24,25,111,112,114,115" style="display: block;"> <div class="moderateBox_check"> <input type="checkbox" name="reason" class="moderateBox_checkbox" id="reason_256" value="256"> </div> <div class="moderateBox_data"> <div class="b-antifraud"> <div class="name">Автовыгрузка</div> <div class="progress-line" style="display: none;"><div class="progress-bar"></div></div> <div class="description" style="display: none;"></div> </div> </div> </div>'+
		 '</div>'+
		 '<div class="moderateBox_item_container">'+
		 '<div class="moderateBox_item" style="display: block;"> <div class="moderateBox_check"> <input type="checkbox" name="reason" class="moderateBox_checkbox" id="reason_130" value="130"> </div> <div class="moderateBox_data"> <div class="b-antifraud" title="0%"> <div class="name">Мошенническая схема</div> <div class="progress-line" style="display: block; border: 1px solid rgb(47, 139, 85);"><div class="progress-bar" style="width: 0px; background-color: rgb(47, 139, 85);"></div></div> <div class="description" style="display: block;"></div> </div> </div> </div>'+
		 '</div>'+
		 '<div class="moderateBox_item_container">'+
		 '<div class="moderateBox_item" style="display: block;"> <div class="moderateBox_check"> <input type="checkbox" name="reason" class="moderateBox_checkbox" id="reason_384" value="384"> </div> <div class="moderateBox_data"> <div class="b-antifraud"> <div class="name">Фейк</div> <div class="progress-line" style="display: none;"><div class="progress-bar"></div></div> <div class="description" style="display: none;"></div> </div> </div> </div>'+
		 '</div>'+
		 '<div class="moderateBox_item_container">'+
		 '<div class="moderateBox_item" data-category-ids="9" style="display: none;"> <div class="moderateBox_check"> <input type="checkbox" name="reason" class="moderateBox_checkbox" id="reason_548" value="548"> </div> <div class="moderateBox_data"> <div class="b-antifraud"> <div class="name">Автомобиль в розыске</div> <div class="progress-line" style="display: none;"><div class="progress-bar"></div></div> <div class="description" style="display: none;"></div> </div> </div> </div>'+
		 '</div>' +
        '<div class="moderateBox_item_container">' +
        ' <div class="moderateBox_item" data-category-ids="9" style="display: block;"> <div class="moderateBox_check"> <input type="checkbox" name="reason" class="moderateBox_checkbox" id="reason_548" value="548"> </div> <div class="moderateBox_data"> <div class="b-antifraud"> <div class="name">Автомобиль в розыске</div> <div class="progress-line" style="display: none;"><div class="progress-bar"></div></div> <div class="description" style="display: none;"></div> </div> </div> </div>' +
        '  </div>'+
        '<div class="moderateBox_item_container">' +
        ' <div class="moderateBox_item" style="display: block;"> <div class="moderateBox_check"> <input type="checkbox" name="reason" class="moderateBox_checkbox" id="reason_694" value="694"> </div> <div class="moderateBox_data"> <div class="b-antifraud"> <div class="name">Подозрительная активность</div> <div class="progress-line" style="display: none;"><div class="progress-bar"></div></div> <div class="description" style="display: none;"></div> </div> </div> </div>' +
        '  </div>'+
        '<div class="moderateBox_item_container">' +
        ' <div class="moderateBox_item" style="display: block;"> <div class="moderateBox_check"> <input type="checkbox" name="reason" class="moderateBox_checkbox" id="reason_703" value="703"> </div> <div class="moderateBox_data"> <div class="b-antifraud"> <div class="name">Объявление о заказе</div> <div class="progress-line" style="display: none;"><div class="progress-bar"></div></div> <div class="description" style="display: none;"></div> </div> </div> </div>' +
        '  </div>'+
		'<div class="moderateBox_other"> <input type="text" placeholder="Другие причины" name="reason_other" class="reason_other"> <input type="text" placeholder="Комментарий" name="reason_comment" class="reason_comment"> </div> <div class="moderateBox_buttons"> <input id="blockSubmit" class="btn red" type="button" value="Блок" data-item-block="Block" data-item-block-fake="Unblock" data-item-reject="Reject" data-item-reject-fake="Allow" data-user-block="Block" style="color: rgb(47, 139, 85);"> <input class="btn" type="reset" value="Отмена"> </div>' +
        ' </form>' +
        '</div>');
}

function premoderationInternNew(adm_username, page) {
    let tableList = $('#items tr[data-id]');

    let itemIDbutton = 0;
    let userIDbutton = 0;

    //УДАЛЕНИЕ КНОПОК REJECT и BLOCK и ALLOW

    $('[name="reject"]').hide();
    $('[name="block"]').hide();
    $('[name="allow"]').hide();

    //ДОБАВЛЕНИЕ КНОПОКИ ALLOW

    let allowallButton = $('<input/>',{
        id: 'allowall',
        type: 'button',
        name: 'allow',
        class: 'js-apply-all-btn btn btn-default green mb_activate',
        value: 'Разрешить все',
        click:  function () {
            let user = $('#items tr').length;
            for (let i = 0; i < user; i++) {
                let linkUserID = $('tr').slice(i, i + 1).find('a[href^="/users/user/info"]').attr("href").split("/");
                let linkItemID = $('tr').slice(i, i + 1).attr("id").split("_");
                let id = linkUserID[4];
                let itemid = linkItemID[1];

                interntoJSONitemAllow(adm_username, 'Item', itemid, 'Allow', [], [], currentTime(), i, user);

                nextPrePage(location.href);
            }
        }
    });

    if (page === 'pre') $('#apply_all').append(allowallButton);


    //ДОБАВЛЕНИЯ КНОПОК REJECT и BLOCK

    for (let i = 0; i < tableList.length; i++) {

        let id = $(tableList[i]).attr("data-user-id") ? $(tableList[i]).attr("data-user-id") : $(tableList[i]).find('.item_user_login').attr('href').split('/')[4];
        let itemid = $(tableList[i]).attr("data-id");
        let data_params = $(tableList[i]).attr('data-params');
        let data_category = $(tableList[i]).attr('data-category');

        if ($(tableList[i]).find('.reasons').length > 0) {
            $(tableList[i]).find('.js-areject').detach();

            $(tableList[i]).find('.js-reasons').append('<span class="againReject btn btn-default btn-xs" style="cursor: pointer;" title="еще раз"><i class="glyphicon glyphicon-repeat"></i></span>');
        }

        let rejectName = $('tr [name="reject"]').slice(i,i+1).text();
        let blockName = $('tr [name="block"]').slice(i,i+1).text();

        let rejectButton = $('<input/>',{
            type: 'button',
            class: 'internReject btn btn-default mb_reject green',
            item_id: itemid,
            user_id: id,
            data_params: data_params,
            value: rejectName,
            click:  function () {
                $('.reason_other').val('');
                $('.reason_comment').val('');

                if ($(this).attr("data_params")) {
                    let params = $(this).attr("data_params").replace(/\[\[/, "").replace(/\]\]/, "").replace(/"/g, "").split('],[');

                    for (let i = 0; i < params.length; i++) {
                        let tmp = params[i].split(',');
                        let rid = tmp[0];
                        let r = tmp[1];
                        $('#parameters').append('<div class="moderateBox_item parametersRemove" data-parent-id="175" style="display: block;">' +
                            '<div class="moderateBox_check">' +
                            '<input type="checkbox" name="reason" class="moderateBox_checkbox" id="reason_175_' + rid + '" value="' + rid + '">' +
                            '</div>' +
                            '<div class="moderateBox_data">' +
                            '<div class="b-antifraud">' +
                            '<div class="name">' + r + '</div>' +
                            '<div class="progress-line" style="display: none;">' +
                            '<div class="progress-bar"></div>' +
                            '</div>' +
                            '<div class="description" style="display: none;"></div>' +
                            '</div>' +
                            '</div>' +
                            '</div>');
                    }
                }

                $('.moderate-modal__override').removeClass('is-hidden');


                let offset = $(this).offset();
                $('#reject').attr('style', "position: absolute; top: " + (offset.top.toFixed(2)-150) + "px; left: " + (offset.left.toFixed(2)-300) +"px;");

                itemIDbutton = $(this).attr("item_id");
                userIDbutton = $(this).attr("user_id");

                $('#reject').removeClass('is-hidden');
            }
        });

        let blockButton = $('<input/>',{
            type: 'button',
            class: 'internBlock btn btn-default mb_block green',
            item_id: itemid,
            user_id: id,
            data_category: data_category,
            value: blockName,
            click:  function () {
                $('.reason_other').val('');
                $('.reason_comment').val('');

                $('.moderate-modal__override').removeClass('is-hidden');

                let offset = $(this).offset();
                $('#block').attr('style', "position: absolute; top: " + (offset.top.toFixed(2)-150) + "px; left: " + (offset.left.toFixed(2)-300) +"px;");

                itemIDbutton = $(this).attr("item_id");
                userIDbutton = $(this).attr("user_id");

                $('#block').removeClass('is-hidden');
            }
        });

        $('.b-antifraud-actions').find('[name="reject"]').slice(i,i+1).after(rejectButton);
        $('.b-antifraud-actions').find('[name="block"]').slice(i,i+1).after(blockButton);
    }

    //ОБРАБОТКА СОБЫТИЙ

    $('.has-children').mouseenter(function(){
        $(this).addClass('show-subitems');
    });
    $('.has-children').mouseleave(function(){
        $('.has-children').removeClass('show-subitems');
    });

    $('.moderate-modal__override').click(function() {
        hideReasons();
    });

    $('[type="reset"]').click(function() {
        hideReasons();
    });

    $('.againReject').click(function () {
        let itemID = $(this).parents('tr').attr('id').split('_');
        let reason = $(this).parents('tr').find('span[data-id]').text();
        let reasonID = $(this).parents('tr').find('span[data-id]').attr('data-id');

        $('#item_'+itemID[1]).remove();

        interntoJSONitem(adm_username, 'Item', itemID[1], 'again', [reasonID], [reason]);
    });

    $('a[href^="/items/comparison"]').click(function() {
        let compID = $(this).attr('href').split('/');
        interntoJSONitem(adm_username, 'Comparison', compID[3], 'Open', [], []);
    });

    $('#rejectSubmit').click(function() {
        let selectedReason = [];
        let selectedReasonID = [];
        $('.moderateBox_mini input:not([name="ah-other-reasons"]):checked').each(function() {
            let tmp = $(this).parents('.moderateBox_item').find('.name').text();
            if ($(this).parents('.has-children').length > 0) tmp = $(this).parents('.moderateBox_item_container').children('.moderateBox_item').find('.name').text() + ' | ' + tmp;
            selectedReason.push(tmp);
            selectedReasonID.push($(this).attr('id'));
        });

        if ($('.reason_other').val() !== '') selectedReason.push('Reason: ' + $('.reason_other').val());
        if ($('.reason_comment').val() !== '') selectedReason.push('Comment: ' + $('.reason_comment').val());

        $('#item_'+itemIDbutton).remove();

        hideReasons();
        interntoJSONitem(adm_username, 'Item', itemIDbutton, 'Reject', selectedReasonID, selectedReason);
    });
    $('#blockSubmit').click(function() {
        let selectedReason = [];
        let selectedReasonID = [];
        $('.moderateBox_mini input:checked').each(function() {
            let tmp = $(this).parents('.moderateBox_item').find('.name').text();
            if ($(this).parents('.has-children').length > 0) tmp = $(this).parents('.moderateBox_item_container').children('.moderateBox_item').find('.name').text() + ' | ' + tmp;
            selectedReason.push(tmp);
            selectedReasonID.push($(this).attr('id'));
        });

        if ($('.reason_other').val() !== '') selectedReason.push('Reason: ' + $('.reason_other').val());
        if ($('.reason_comment').val() !== '') selectedReason.push('Comment: ' + $('.reason_comment').val());

        $('#item_'+itemIDbutton).remove();

        hideReasons();
        interntoJSONitem(adm_username, 'Item', itemIDbutton, 'Block', selectedReasonID, selectedReason);
    });

    $('.moderateBox_data').click(function() {
        let selectedReason = [$(this).find('.name').text()];
        if ($(this).parents('.has-children').length > 0) selectedReason = [$(this).parents('.moderateBox_item_container').children('.moderateBox_item').find('.name').text() + ' | ' + selectedReason];
        let selectedReasonID = [$(this).parents('.moderateBox_mini').find('input').attr('id')];
        let kind = $(this).parents('.moderate-modal').attr('kind');

        $('#item_'+itemIDbutton).remove();

        hideReasons();
        interntoJSONitem(adm_username, 'Item', itemIDbutton, kind, selectedReasonID, selectedReason);
    });
}

function nextPrePage(href) {
    let tmp = href.indexOf('?')+1 ? href.split('?') : href;
    let link = tmp[0];
    let get = tmp[1].indexOf('&')+1 ? tmp[1].split('&') : tmp[1];

    let currentModerator = parseInt(get[0].split('=')[1]);
    let totalModerators = parseInt(get[1].split('=')[1]);

    if (currentModerator+1 < totalModerators) {
        get[0] = 'currentModerator=' + (currentModerator + 1);
        get[1] = 'totalModerators=' + totalModerators;

        outTextFrame('Вы завершили проверку ' + (currentModerator + 1) + '/' + totalModerators + ' и будите перенаправлены на следующую страницу через 2 секунды');

        setTimeout(function () {
            location.href = link+'?'+get.join('&');
        }, 2500);
    } else {
        outTextFrame('Вы завершили проверку всех страниц ' + (currentModerator + 1) + '/' + totalModerators);
    }
}

function hideReasons() {
	$('.moderate-modal__override').addClass('is-hidden');
	$('#block')
        .addClass('is-hidden')
        .find('[type="checkbox"]').prop("checked", false);
	$('#reject')
        .addClass('is-hidden')
        .find('[type="checkbox"]').prop("checked", false);
	$('.parametersRemove').remove();
}


let json = [];
function interntoJSONitemAllow(agentID, type, itemID, kind, reasonID, reason, time, i, userLength) {

	let jsonItem = {
		agentID : agentID,
		type : type,
		itemID : itemID,
		kind : kind,
		RB : {
			reasonID :  reasonID,
			reason :  reason
		},
		time : time
	};

	json.push(jsonItem);

	if (userLength-1 === i) {
		internSendLogServer(json);
		json = [];
	}
}

function interntoJSONitem(agentID, type, itemID, kind, reasonID, reason) {
	let time = currentTime();

	let jsonItem = [{
		agentID : agentID,
		type : type,
		itemID : itemID,
		kind : kind,
		RB : {
			reasonID :  reasonID,
			reason :  reason
		},
		time : time
	}];

	internSendLogServer(jsonItem);
}

function internSendLogServer(log) {
	let data = JSON.stringify(log);

	chrome.runtime.sendMessage({ 
		action: 'XMLHttpRequest',
		method: "POST",
		url: "http://avitoadm.ru/intern_helper/catcher.php",
		data: data,
	}, function(response) {
		console.log(response);
		outTextFrame(response);
	});
}

function currentTime() {
	let date = new Date();
    let day = (date.getDate()<10?'0':'')+date.getDate();
    let month = ((date.getMonth()+1)<10?'0':'')+(date.getMonth()+1);
    let year = date.getFullYear();
    let hours = (date.getHours()<10?'0':'')+date.getHours();
    let minutes = (date.getMinutes()<10?'0':'')+date.getMinutes();
    let seconds = (date.getSeconds()<10?'0':'')+date.getSeconds();

	return day+"."+month+"."+year+" "+hours+":"+minutes+":"+seconds;
}