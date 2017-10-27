function addHoldItems() {
    let doc = document;
    let body = doc.body;
    let itemsTable = body.querySelector('.table');
    let itemsRows = itemsTable.querySelectorAll('.js-item-row');
    let admCounterInfo = body.querySelector('.moderation-info-text');
    let lsKey = 'callQueueHoldedItems';

    if (itemsRows.length !== 0) {
        itemsRows.forEach((row) => {
            addHoldMenu(row);
        });
    }

    hideHoldedItems();
    renderHoldedItemsBlock();
    addSetHoldTimeModal();

    let setHoldTimeModal = doc.getElementById('ahSetHoldTimeModal');
    let holdedBlock = body.querySelector('.ah-holded-items-wrapper');
    let holdedCounter = holdedBlock.querySelector('.ah-items-counter');
    let holdedPanelBody = holdedBlock.querySelector('.panel-body');
    let holdedTable = holdedBlock.querySelector('.ah-holded-items-table');
    let holdedTableBody = holdedTable.querySelector('tbody');
    let admCounterHoldedInfo = doc.createElement('i');
    admCounterHoldedInfo.className = 'text-muted ah-adm-holded-counter';
    admCounterInfo.appendChild(admCounterHoldedInfo);

    startMonitoring();
    checkHoldedList();
    handleHoldCountUpdate();

    // подписаться на изменения таблицы и добавлять меню по необходимости
    let observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            let addedNodes = mutation.addedNodes;
            addedNodes.forEach((node) => {
                if (node.nodeType === 1 && node.classList.contains('js-item-row')) {
                    addHoldMenu(node);
                }
            });
        });
    });
    let config = { childList: true, subtree: true };
    observer.observe(itemsTable, config);

    // обработчики
    itemsTable.addEventListener('click', handleHoldMenuClick);
    holdedBlock.addEventListener('click', handleHoldedBlockClick);
    setHoldTimeModal.addEventListener('click', handleSetHoldTimeModalClick);
    setHoldTimeModal.addEventListener('input', handleSetHoldTimeModalInput);

    // обработчиик клика меню Hold
    function handleHoldMenuClick(e) {
        let target = e.target;

        if (target.closest('[data-predefined-time]')) {
            let itemId = target.closest('.ah-hold-item-dropdown').dataset.itemId;
            let menuItem = target.closest('[data-predefined-time]');
            let minutes = +menuItem.dataset.predefinedTime;
            holdItem(itemId, minutes);
        }

        if (target.closest('[data-set-time]')) {
            let itemId = target.closest('.ah-hold-item-dropdown').dataset.itemId;
            let modalBody = setHoldTimeModal.querySelector('.modal-body');
            setHoldTimeModal.setAttribute('data-item-id', itemId);
            modalBody.innerHTML = `
                <div class="form-group">
                    <label for="ahSetHoldHours">Часы:</label>
                    <input type="number" min="0" class="form-control" value="0" id="ahSetHoldHours">
                </div>
                <div class="form-group">
                    <label for="ahSetHoldMinutes">Минуты:</label>
                    <input type="number" min="0" class="form-control" value="0" id="ahSetHoldMinutes">
                </div>
                <div>
                    <i>Итог: </i> <span id="ahSetHoldTimeResult">0 мин.</span>
                </div>
                
            `;
            $(setHoldTimeModal).modal('show');
        }

        if (target.closest('[data-no-time]')) {
            let itemId = target.closest('.ah-hold-item-dropdown').dataset.itemId;
            holdItem(itemId, null);
        }
    }

    // обработчик клика кнопок онхолднутых
    function handleHoldedBlockClick(e) {
        let target = e.target;

        if (target.closest('[data-action="unhold"]')) { // unhold
            let itemRow = target.closest('tr');
            let itemId = +itemRow.dataset.itemId;
            let row = holdedTable.querySelector(`tr[data-item-id="${itemId}"]`);
            unsaveItem(itemId);
            row.parentNode.removeChild(row);
            let holdedItem = itemsTable.querySelector(`[href="/detectives/queue/unlock/${itemId}"]`);
            if (holdedItem) {
                let holdedRow = holdedItem.closest('.js-item-row');
                holdedRow.classList.remove('hidden');
            }
            handleHoldCountUpdate();
        }

        if (target.closest('[data-action="collapse"]')) { // collapse
            holdedPanelBody.classList.toggle('hidden');
            let icon = target.closest('[data-action="collapse"]').querySelector('.glyphicon');
            icon.classList.toggle('glyphicon-collapse-up');
        }
    }

    // обработчик клика модалки ручного ввода времени
    function handleSetHoldTimeModalClick(e) {
        let target = e.target;

        if (target.closest('#ahSetHoldTimeBtn')) {
            let itemId = setHoldTimeModal.dataset.itemId;
            let hours = +doc.getElementById('ahSetHoldHours').value;
            let minutes = +doc.getElementById('ahSetHoldMinutes').value;
            let totalMinutes = (hours * 60) + minutes;
            const MINUTES_LIMIT = 14400; // 10 суток
            let isTimeCorrect = (isFinite(totalMinutes) && hours >= 0 && minutes >= 0);

            if (!isTimeCorrect) {
                alert('Некорректно указано время');
                return;
            }

            if (totalMinutes > MINUTES_LIMIT) {
                alert('Указано слишком большое значение');
                return;
            }

            holdItem(itemId, totalMinutes);
            $(setHoldTimeModal).modal('hide');
        }
    }

    // обработчик инпутов модалки ручного ввода времени
    function handleSetHoldTimeModalInput() {
        let hours = +doc.getElementById('ahSetHoldHours').value;
        let minutes = +doc.getElementById('ahSetHoldMinutes').value;
        let resultNode = doc.getElementById('ahSetHoldTimeResult');

        let totalMinutes = (hours * 60) + minutes;

        let minutesCalc = totalMinutes % 60;
        let hoursCalc = (totalMinutes - minutesCalc) / 60;

        resultNode.innerHTML = `${hoursCalc} ч. ${minutesCalc} мин.`;
    }

    // добавить меню в строку
    function addHoldMenu(row) {
        let btnsCell = row.querySelector('td:last-child');
        let btnLink = btnsCell.querySelector('a[href^="/detectives/queue/"]');
        let itemId;
        try {
            itemId = btnLink.href.replace(/\D/g, '');
        } catch(e) {
            itemId = null;
        }
        let holdMenu = doc.createElement('div');
        holdMenu.className = 'dropdown ah-hold-item-dropdown';
        holdMenu.setAttribute('data-item-id', itemId);
        holdMenu.innerHTML = `
            <button class="btn btn-default dropdown-toggle" type="button" data-toggle="dropdown">Удержать 
                <span class="caret"></span></button>
            <ul class="dropdown-menu dropdown-menu-right ah-hold-item-menu">
                <li data-predefined-time="30"><a>На 30 минут</a></li>
                <li data-predefined-time="60"><a>На 1 час</a></li>
                <li data-predefined-time="120"><a>На 2 часа</a></li>
                <li data-predefined-time="240"><a>На 4 часа</a></li>
                <li data-set-time><a>Задать время...</a></li>
                <li class="divider"></li>
                <li data-no-time><a>Бессрочно</a></li>
            </ul>
        `;

        btnsCell.appendChild(holdMenu);
    }

    // захолдить айтем
    function holdItem(itemId, minutes) {
        if (!itemId) {
            alert('Произошла ошибка:\nНе удалось определить ID объявления');
            return;
        }

        let itemUnlockBtn = itemsTable.querySelector(`.js-return-btn[href="/detectives/queue/unlock/${itemId}"]`);
        let itemRow = itemUnlockBtn.closest('.js-item-row');
        let itemTitleNode = itemRow.querySelector('td:nth-child(2) .item-info-name');
        let itemTitleText = itemTitleNode.textContent;
        let expiresMs;

        if (minutes === null) {
            expiresMs = 'Infinity';
        } else {
            let added = new Date();
            expiresMs = added.setMinutes(added.getMinutes() + minutes);
        }

        let info = {
            itemId: itemId,
            itemTitle: itemTitleText,
            expiresMs: expiresMs
        };

        let newRow = getNewRow(info);
        if (info.expiresMs !== 'Infinity') {
            newRow.classList.add('warning');
        }

        let existing = getHoldedInfo();
        if (existing.length === 0 || info.expiresMs === 'Infinity') {
            holdedTableBody.appendChild(newRow);
        } else {
            existing = existing.sort(sortHolded);
            let beforeId;

            for (let i = 0; i < existing.length; i++) {
                if (info.expiresMs <= +existing[i].expiresMs && existing[i].expiresMs !== 'Infinity') {
                    beforeId = existing[i].itemId;
                    break;
                }
            }

            let beforeNode;
            if (!beforeId) {
                beforeNode = holdedTableBody.querySelectorAll(`[data-expires-ms="Infinity"]`)[0];
            } else {
                beforeNode = holdedTableBody.querySelector(`[data-item-id="${beforeId}"]`);
            }

            holdedTableBody.insertBefore(newRow, beforeNode);
        }

        saveItem(info);
        itemRow.classList.add('hidden');
        handleHoldCountUpdate();
    }

    // сохранить айтем
    function saveItem(info) {
        let json = getHoldedInfo();
        json.push(info);

        localStorage[lsKey] = JSON.stringify(json);
    }

    // удалить айтем из сохраненных
    function unsaveItem(itemId) {
        let existing = getHoldedInfo();
        for (let i = 0; i < existing.length; i++) {
            let existingItemId = +existing[i].itemId;
            if (existingItemId === itemId) {
                existing.splice(i, 1);
                i--;
            }
        }

        localStorage[lsKey] = JSON.stringify(existing);
    }

    // получить новую строку
    function getNewRow(info) {
        let expiresFormatted;
        if (info.expiresMs !== 'Infinity') {
            expiresFormatted = new Date(info.expiresMs).toLocaleString('ru', {
                month: 'numeric',
                day: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
                year: 'numeric',
                second: 'numeric'
            });
        } else {
            expiresFormatted = '-';
        }

        let newRow = doc.createElement('tr');
        newRow.setAttribute('data-item-id', info.itemId);
        newRow.setAttribute('data-expires-ms', info.expiresMs);
        newRow.className = 'ah-holded-item-row';
        newRow.innerHTML = `
            <td>
                <h3>
                    <a class="ah-visitable-link" target="_blank" href="/${info.itemId}">${info.itemTitle}</a>
                </h3>
            </td>
            <td class="text-muted">${expiresFormatted}</td>
            <td>
                <button class="btn btn-xs btn-default" data-action="unhold">Отпустить</button>
            </td>
        `;

        return newRow;
    }

    // обновления счетчиков онхолднутых
    function handleHoldCountUpdate() {
        let existing = getHoldedInfo();
        let count = existing.length;

        admCounterHoldedInfo.innerHTML = `(Удержано - ${count})`;
        holdedCounter.innerHTML = count;

        if (count === 0) {
            holdedPanelBody.classList.add('hidden');
            holdedBlock.setAttribute('empty', 'true');
        } else {
            holdedPanelBody.classList.remove('hidden');
            holdedBlock.removeAttribute('empty');
        }
    }

    // спрятать онхолднутые на странице
    function hideHoldedItems() {
        if (itemsRows.length === 0) return;

        let existing = getHoldedInfo();
        existing.forEach((item) => {
            let itemId = item.itemId;
            let holdedItem = itemsTable.querySelector(`[href="/detectives/queue/unlock/${itemId}"]`);
            if (holdedItem) {
                let holdedRow = holdedItem.closest('.js-item-row');
                holdedRow.classList.add('hidden');
            }
        });
    }

    // отрисовка блока онхолднутых
    function renderHoldedItemsBlock() {
        let existing = getHoldedInfo();
        let rows = [];
        existing = existing.sort(sortHolded);
        existing.forEach((item) => {
            let newRow = getNewRow(item);
            if (item.expiresMs !== 'Infinity') {
                newRow.classList.add('warning');
            }
            rows.push(newRow.outerHTML);
        });

        let holdedBlock = doc.createElement('div');
        holdedBlock.className = 'panel panel-default ah-holded-items-wrapper';
        holdedBlock.innerHTML = `
            <div class="panel-heading">
                <h2>
                    Удержанные объявления <span class="text-muted">(<span class="ah-items-counter"></span>)</span>
                </h2>
                <button class="btn btn-xs btn-link ah-holded-items-btn-collapse" data-action="collapse">
                    <span class="glyphicon glyphicon-collapse-down"></span>
                </button>
            </div>
            <div class="panel-body">
                <div class="table-scroll">
                    <table class="table table-condensed ah-holded-items-table">
                        <thead>
                            <tr><th>Объявление</th><th>Прозвонить</th><th></th></tr>
                        </thead>
                        <tbody>${rows.join('')}</tbody>
                    </table>
                </div>
            </div>
        `;

        body.appendChild(holdedBlock);
    }

    // сортировка онхолднутых
    function sortHolded(a, b) {
        return +a.expiresMs - +b.expiresMs;
    }

    // добавить модалку для установки времени
    function addSetHoldTimeModal() {
        let modal = doc.createElement('div');
        modal.className = 'modal fade';
        modal.setAttribute('tabindex', '-1');
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('id', 'ahSetHoldTimeModal');
        modal.innerHTML = `
            <div class="modal-dialog modal-sm" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                        <h4 class="modal-title">Время удержания</h4>
                    </div>
                    <div class="modal-body"></div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-primary" id="ahSetHoldTimeBtn">Применить</button>
                    </div>
                </div>
            </div>
        `;

        body.appendChild(modal);
    }

    // старт мониторинга
    function startMonitoring() {
        setInterval(() => {
            checkHoldedList();
        }, 1000);
    }

    // проверка онолднутых
    function checkHoldedList() {
        let now = Date.now();
        let rows = holdedTable.querySelectorAll('.ah-holded-item-row');
        rows.forEach((row) => {
            let expiresTimeMs = +row.dataset.expiresMs;
            if (expiresTimeMs && now > expiresTimeMs) {
                let itemId = row.dataset.itemId;
                fireUpItem(itemId);
            }
        });
    }

    // зажечь айтем
    function fireUpItem(itemId) {
        let row = holdedTable.querySelector(`[data-item-id="${itemId}"]`);
        row.classList.remove('warning');
        row.classList.add('success');
    }

    // получить json онхолднутых
    function getHoldedInfo() {
        let json;
        if (localStorage[lsKey]) {
            json = JSON.parse(localStorage[lsKey]);
        } else {
            json = [];
        }

        return json;
    }
}