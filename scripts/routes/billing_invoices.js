function showUsersIdsBillingInvoices() {
    let table = $('.table');
    let rowHeader = table.find('thead tr');
    rowHeader.find('th:eq(5)').after('<th>ID пользователя</th>');
    let rowsBody = table.find('tbody tr');
    rowsBody.each(function() {
        let row = $(this);
        let emailRow = row.find('td:eq(5)');
        let emailHref = emailRow.find('a').attr('href');
        let userId = emailHref.replace(/\D/g, '');
        emailRow.after(`<td>${userId}</td>`);
    });
}