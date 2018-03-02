function callTableListener() {
    const itemsTable = document.querySelector('.table');
    const trList = itemsTable.querySelectorAll('tr');

    for (let i = 0; i < trList.length; ++i) {
        addRejectButtonNotActualPhone(trList[i]);
    }

    const config = { childList: true, subtree: true };
    const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            mutation.addedNodes.forEach(node => {
                if (node.nodeType === 1 && node.classList.contains('js-item-row')) {
                    addRejectButtonNotActualPhone(node)
                }
            });
        });
    });
    observer.observe(itemsTable, config);
}

function addRejectButtonNotActualPhone(tr) {
    const tdButtons = tr.querySelector('td:last-child');

    let btnLink = tdButtons.querySelector('a[href^="/detectives/queue/"]');
    let itemId;
    try {
        itemId = btnLink.href.replace(/\D/g, '');
    } catch(e) {
        itemId = null;
    }

    const buttons = document.createElement('div');
    buttons.style.textAlign = 'right';
    buttons.style.margin = '3px 0';

    const notActualPhone = document.createElement('input');
    notActualPhone.type = 'button';
    notActualPhone.className = 'btn btn-danger';
    notActualPhone.value = 'Неактуальный телефон';
    notActualPhone.addEventListener('click', () => {
        rejectItem(itemId, 734);
        getDetectivesQueuePrune(itemId);
        tr.remove();
    });

    buttons.appendChild(notActualPhone);
    tdButtons.appendChild(buttons);
}