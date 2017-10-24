function addShowItemStatusBtn() {
    $('.billing-walletlog-result').append(`
        <button class="btn btn-primary btn-xs show-unactive-items" title="Показать только операции для неактивных объявлений и статусы объявлений">Неактивные объяввленя</button>
    `);

    $('.show-unactive-items').click(function() {
        $('.parsed-item-info').remove();
        statusItemWalletlog({unactiveOnly: true});
    });
}

function statusItemWalletlog(options) {
    let rows = $('.billing .table tbody tr');

    let allItems = [];
    $(rows).each(function (i, row) {
        let itemLinkNode = $(row).find('td:eq(4) a');
        let itemLink = $(itemLinkNode).attr('href');

        if (itemLink) {
            let itemId = itemLink.split('/')[4];

            if (!isFinite(itemId))
                return;

            $(itemLinkNode).after('<div data-item-id="' + itemId + '" class="parsed-item-info"><span class="loading-indicator-text" style="color: rgb(149, 149, 149);">Загрузка...</span></div>');
            allItems.push(itemId);
        }
    });

    if ($('.parsed-item-info .loading-indicator-text').length !== 0) {
        $('#sh-loading-layer').show();
        $('.show-unactive-items').prop('disabled', true);

        allItems = unique(allItems);
        allItems.forEach(function (id) {
            getItemInfoRequest(id, options);
        });
    } else {
        outTextFrame('На странице нет операций к объявлениям');
    }
}

function addLfPackageInfoWalletlog() {
    let table = $('.billing .table');
    let rows = table.find('tbody tr');
    let packageReg = /(из|по|покупка) пакет[ау]/i;
    rows.each(function() {
        let row = $(this);
        let descriptionCell = row.find('td:eq(4)');
        let descriptionText = descriptionCell.text();
        let statusCell = row.find('td:eq(9)');
        let statusText = statusCell.text().trim();
        if (packageReg.test(descriptionText) && ~statusText.indexOf('Исполнено')) {
            let ids = descriptionText.match(/\d+/);
            if (ids) {
                let packageId = ids[0];
                let userId = row.find('td:eq(3)').text().trim();

                descriptionCell.append(`<div data-package-id="${packageId}" data-user-id="${userId}" 
                    class="ah-lf-package-info"></div>`);
            }
        }
    });

    let wlResultNode = $('.billing-walletlog-result');
    wlResultNode.append(`
        <button class="btn btn-info btn-xs pull-right ah-wl-controls-btn" id="get-lf-packages-info-btn" title="Показать информацию о пакетах размещений">
            <span class="glyphicon glyphicon-info-sign"></span> Пакеты LF
        </button>
    `);

    showLfPackagesBtnHandler($('#get-lf-packages-info-btn'));
}