function addShowItemStatusBtn() {
    $('.billing-walletlog-result').append(`
        <button class="btn btn-primary btn-xs show-unactive-items" title="Показать только операции для неактивных объявлений и статусы объявлений">Неактивные объяввленя</button>
    `);

    $('.show-unactive-items').click(function() {
        $('.parsed-item-info').remove();
        statusItem({unactiveOnly: true});
    });
}