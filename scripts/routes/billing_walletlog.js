function addShowItemStatusBtn() {
    $('.billing-walletlog-result').append(`
        <button class="btn btn-primary btn-xs show-items-statutes" title="Показать статусы объявлений">Статусы объяввлений</button>
    `);

    $('.show-items-statutes').click(function() {
        $('.parsed-item-info').remove();
        statusItem();
    });
}