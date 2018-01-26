//++++++++++++++ Открывать тикеты из очереди в новой вкладке ++++++++++++++ //
function openTicketInNewTab() {
    $('.sh-open-in-new-tab-link').remove();
    var rows = $('.helpdesk-main-section table tbody tr');

    $(rows).each(function (i, item) {
        var ticketId = $(item).find('td:eq(2)').text().split(' ')[0];
        $(item).before(''+
        '<a class="sh-open-in-new-tab-link" style=""'+
        'href="https://adm.avito.ru/helpdesk/details/' + ticketId + '" target="_blank" '+
        'title="Открыть тикет в новой вкладке">&#x21b7'+
        '</a>');
    });
}
//-------------- Открывать тикеты из очереди в новой вкладке -------------- //

function showAgentInfoQueue() {
    $('.agent-info-sign').remove();
    
    let table = $('table');
    let rows = $(table).find('tr');
        
    $(rows).each(function(i, row) {
        let assigneeNameBlock = $(row).find('td:last');
        let assigneeNameText = $(assigneeNameBlock).find('span').attr('title');
        
        for (var i = 0; i < global.allUsersInfo.length; i++) {
            let user = global.allUsersInfo[i];
            let agentFullName = user.name.replace(/(^ | $)/g, '') 
                    +' '+ user.surname.replace(/(^ | $)/g, '');
            if (assigneeNameText === agentFullName) {
                $(assigneeNameBlock).prepend(''+
                '<span class="agent-info-sign" style="margin-right: 4px;">'+
                    '<span class="label" title="'+user.subdivision_name+' '+
                    '('+user.teamlead+')'+
                    '\nСмена: '+user.shift+'\nВыходные: '+user.weekend+'"  '+
                    'style="background:#'+user.sub_color+';">'+
                    ''+user.subdivision+'</span>'+
                '</span>');
            }
        }
    });
}