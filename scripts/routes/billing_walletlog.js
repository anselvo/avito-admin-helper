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