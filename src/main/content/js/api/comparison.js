function AhComparison(ids) {
    this._ids = ids;
    this._maxCount = 30;
}

AhComparison.prototype.getUnique = function(ids) {
    // чтобы сохранить опорную сущность первой, используется медленный способ отброса дубликатов
    const res = [];
    let k = 0;

    for (let i = 0; i < ids.length; i++) {
        let j = 0;
        while (j < k && res[j] !== ids[i]) j++;
        if (j === k) res[k++] = ids[i];
    }

    if (res.length === 1) {
        return {
            success: false,
            message: `В сравнении должно учавствовать более одной сущности`
        }
    }

    if (res.length > this._maxCount) {
        return {
            success: false,
            message: `Нельзя сравнивать более ${this._maxCount}`
        }
    }

    return {
        success: true,
        message: null,
        unique: res
    }
};

AhComparison.prototype.parseEntities = function(parseFunctions) {
    const all = this._ids.compared;
    all.unshift(this._ids.abutment);
    const entities = this.getUnique(all);

    return new Promise(function(resolve, reject) {
        if (entities.success) {
            const unique = entities.unique;
            const parsedEntities = {};
            let doneRequestsCount = 0;

            unique.forEach((id) => {
                parsedEntities[`id_${id}`] = null; // хак с нечисловой строкой, чтобы сохранить порядок

                parseFunctions.getEntityRequest(id)
                    .then(
                        response => parsedEntities[`id_${id}`] = parseFunctions.getEntityParams(response),
                        error => {
                            outTextFrame(`Ошибка для №${id}: \n${error.status}\n${error.statusText}`);
                            delete parsedEntities[`id_${id}`];
                        }
                    ).then(() => {
                        doneRequestsCount++;
                        if (unique.length === doneRequestsCount) { // все запросы завершены
                            if (Object.keys(parsedEntities).length === 1) {
                                reject(`В сравнении должно учавствовать более одной сущности`) ;
                            }

                            resolve(parsedEntities);
                        }
                    }
                );
            });
        } else {
            reject(entities.message);
        }
    });
};

AhComparison.prototype.renderResultModal = function(options) {
    options = options || {};
    const modalTitle = options.title || `Сравнение`;
    const modalClass = options.class || '';
    const modalRefContent = options.refContent || null;

    const modal = document.createElement('div');
    modal.className = `modal ah-dynamic-bs-modal ah-compare-modal ${modalClass}`;
    modal.setAttribute('tabindex', '-1');
    modal.setAttribute('role', 'dialog');

    modal.innerHTML = `
         <div class="modal-dialog modal-lg" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <button type="button" class="close ah-compare-modal-close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                    <h4 class="modal-title">
                        <span>${modalTitle}</span>
                        ${modalRefContent ? '<span class="modal-title-ref" tabindex="-1">(Справка)</span>' : ''}
                    </h4>
                </div>
                <div class="modal-body">
                    <button class="ah-compare-scroll ah-compare-scroll-left" data-direction="left">
                        <span class="glyphicon glyphicon-chevron-left ah-compare-scroll-arrow"></span>
                    </button>
                    <button class="ah-compare-scroll ah-compare-scroll-right" data-direction="right">
                        <span class="glyphicon glyphicon-chevron-right ah-compare-scroll-arrow"></span>
                    </button>
                    <div class="ah-compare-container"></div>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    const scrollBtns = modal.querySelectorAll('.ah-compare-scroll');
    const container = modal.querySelector('.ah-compare-container');

    // справка
    if (modalRefContent) {
        const ref = modal.querySelector('.modal-title-ref');
        $(ref).popover({
            placement: 'bottom',
            html: true,
            container: container,
            content: modalRefContent,
            trigger: 'focus',
            template: `
                 <div class="popover ah-compare-ref__popover">
                     <div class="arrow"></div>
                     <div class="popover-content"></div>
                 </div>`
        });
    }

    $(modal).on('shown.bs.modal', modalShownHandler);
    modal.addEventListener('click', modalClickHandler);
    modal.addEventListener('transitionend', modalTransitionendHandler);

    function modalShownHandler() {
        // если есть скролл у ограниченных по высоте ячеек, добавить коллапс
        const allCollapsible = modal.querySelectorAll('.ah-compare-collapsible');
        for (let i = 0; i < allCollapsible.length; i++) {
            const elem = allCollapsible[i];
            if (elem.scrollHeight > elem.clientHeight) { // есть скоролл
                const row = elem.closest('.ah-compare-row'),
                    showMore = row.nextElementSibling;

                showMore.classList.remove('hidden');
            }
        }

        // проверка скролл баттонов
        checkScrollBtns();
    }

    function modalClickHandler(e) {
        let target = e.target;

        while (target !== this && target) {
            // collapse
            if (target.classList.contains('ah-compare-show-more')) {
                const prev = target.previousElementSibling;
                const collapsible = prev.querySelectorAll('.ah-compare-collapsible');

                collapsible.forEach(item => item.classList.toggle('ah-none-overflow-y'));
                target.querySelector('.glyphicon-collapse-down').classList.toggle('glyphicon-collapse-up');
            }

            // scroll
            if (target.classList.contains('ah-compare-scroll') && !target.disabled) {
                const direction = target.dataset.direction;
                const abutmentCells = container.querySelectorAll('.ah-compare-cell:first-child');
                const exceptAbutmentCells = container.querySelectorAll('.ah-compare-cell:not(:first-child)');
                const cellWidth = container.querySelector('.ah-compare-cell').offsetWidth;
                const allHidden = modal.querySelectorAll('.ah-compare-cell-hidden-by-scroll');

                if (direction === 'right' && getScrollSizeRight(container) !== 0) {
                    for (let i = 0; i < scrollBtns.length; i++) {
                        scrollBtns[i].disabled = true;
                    }

                    for (let i = 0; i < abutmentCells.length; i++) { // показывать опорное всегда
                        let allHidden = abutmentCells[i].parentNode.querySelectorAll('.ah-compare-cell-hidden-by-scroll');
                        let lastHidden = allHidden[allHidden.length - 1];
                        let nextVisible = (lastHidden) ? lastHidden.nextElementSibling : abutmentCells[i].nextElementSibling;

                        nextVisible.classList.add('ah-compare-cell-hidden-by-scroll');
                    }

                    for (let i = 0; i < exceptAbutmentCells.length; i++) {
                        let cell = exceptAbutmentCells[i];
                        let cellRight = parseFloat(getComputedStyle(cell).right);
                        cell.style.right = +(cellRight + cellWidth) + 'px';
                    }
                }

                if (direction === 'left' && allHidden.length !== 0) {
                    for (let i = 0; i < scrollBtns.length; i++) {
                        scrollBtns[i].disabled = true;
                    }
                    for (let i = 0; i < abutmentCells.length; i++) { // показывать опорное всегда
                        let allHidden = abutmentCells[i].parentNode.querySelectorAll('.ah-compare-cell-hidden-by-scroll');
                        let lastHidden = allHidden[allHidden.length - 1];
                        if (lastHidden) {
                            lastHidden.classList.remove('ah-compare-cell-hidden-by-scroll');
                        }

                        for (let i = 0; i < exceptAbutmentCells.length; i++) {
                            let cell = exceptAbutmentCells[i];
                            let cellRight = parseFloat(getComputedStyle(cell).right);
                            cell.style.right = +(cellRight - cellWidth) + 'px';
                        }
                    }
                }
            }

            target = target.parentNode;
        }
    }

    function modalTransitionendHandler(e) {
        const target = e.target;

        // убрать disabled у баттонов для скролла
        if (target.classList.contains('ah-compare-cell')) {
            for (let i = 0; i < scrollBtns.length; i++) {
                scrollBtns[i].disabled = false;
            }
            checkScrollBtns();
        }
    }

    function checkScrollBtns() {
        const rightScroll = modal.querySelector('.ah-compare-scroll[data-direction="right"]');
        const leftScroll = modal.querySelector('.ah-compare-scroll[data-direction="left"]');
        const allHiddens = modal.querySelectorAll('.ah-compare-cell-hidden-by-scroll');

        if (getScrollSizeRight(container) === 0) {
            rightScroll.classList.add('ah-compare-scroll-disabled');
        } else {
            rightScroll.classList.remove('ah-compare-scroll-disabled');
        }

        if (allHiddens.length === 0) {
            leftScroll.classList.add('ah-compare-scroll-disabled');
        } else {
            leftScroll.classList.remove('ah-compare-scroll-disabled');
        }
    }

    this.modal = modal;
};

// показ первой модалки
AhComparison.prototype.showModal = function() {
    const openedModal = document.querySelector('.ah-compare-modal');
    if (openedModal) {
        $(openedModal).modal("hide");
        openedModal.remove();
    }

    $(this.modal).modal('show');
};

// показ модалки поверх первой
AhComparison.prototype.showModalSecond = function() {
    // удалить вторую скриптовую модалку, если есть
    const existingSecondModal = document.querySelector('.ah-compare-modal__second');
    if (existingSecondModal) {
        existingSecondModal.remove();
    }

    // проверить наличие первой модалки
    const existingBsModal = document.querySelector('.modal.in');
    if (existingBsModal) {
        existingBsModal.removeAttribute('tabindex');
    }

    this.modal.style.cssText = 'display: block;';
    this.modal.classList.add('ah-compare-modal__second');
    $(this.modal).trigger('shown.bs.modal');
    this.modal.focus();

    $(this.modal).on('hidden.bs.modal', function() {
        if (existingBsModal) {
            existingBsModal.setAttribute('tabindex', '-1');
            existingBsModal.focus();
            this.remove();
        }
    });

    this.modal.addEventListener('keydown', e => {
        // Закрывать сркиптовый комперисон по Escape
        if (e.keyCode === 27) { // Esc
            this.modal.style.cssText = 'display: none;';
            $(this.modal).trigger('hidden.bs.modal');
        }
    });

    this.modal.addEventListener('click', e => {
        if (!e.target.closest('.modal-dialog')
            || e.target.closest('.ah-compare-modal-close')) {
            this.modal.style.cssText = 'display: none;';
            $(this.modal).trigger('hidden.bs.modal');
        }
    });
};

// строгое сравнение
AhComparison.prototype.compareStrict = function() {
    const allCompareNodes = this.modal.querySelectorAll('[data-compare]');
    const abutmentNodes = [].filter.call(allCompareNodes, node => node.dataset.entityId === this._ids.abutment);
    const comparingNodes = [].filter.call(allCompareNodes, node => node.dataset.entityId !== this._ids.abutment);

    abutmentNodes.forEach(abutment => {
        const abutmentText = abutment.textContent.trim().toLocaleLowerCase();
        const abutmentDataCompare = abutment.dataset.compare;

        comparingNodes.forEach(comparing => {
            const comparingText = comparing.textContent.trim().toLocaleLowerCase();
            const comparingDataCompare = comparing.dataset.compare;

            if (abutmentText === comparingText && abutmentDataCompare === comparingDataCompare) {
                comparing.classList.add('ah-compare-similar');

                let abutmentSimilars = [comparing.dataset.entityId];
                if (abutment.hasAttribute('data-similar-entity-ids')) {
                    const current = JSON.parse(abutment.dataset.similarEntityIds);
                    abutmentSimilars = abutmentSimilars.concat(current);
                }
                abutment.setAttribute('data-similar-entity-ids', JSON.stringify(abutmentSimilars));

                abutment.classList.add('ah-compare-similar');
            }
        });
    });
};

AhComparison.prototype.compareTime = function () {
    const allCompareNodes = this.modal.querySelectorAll('[data-compare-time]');
    const allNodesByName = {};

    allCompareNodes.forEach(node => {
        const nodeName = node.dataset.compareTime;

        if (!allNodesByName.hasOwnProperty(nodeName)) {
            allNodesByName[node.dataset.compareTime] = [];
        }

       allNodesByName[node.dataset.compareTime].push(node);
    });

    console.log(allNodesByName);

    for (let key in allNodesByName) {
        let maxTime = Number.NEGATIVE_INFINITY;
        let maxTimeNode = null;
        let minTime = Number.POSITIVE_INFINITY;
        let minTimeNode = null;

        allNodesByName[key].forEach(node => {
            const time = parseRuDate(node.textContent);

            if (time > maxTime) {
                maxTime = time;
                maxTimeNode = node;
            }
            if (time < minTime) {
                minTime = time;
                minTimeNode = node;
            }
        });

        maxTimeNode.className = 'ah-compare-max-time';
        minTimeNode.className = 'ah-compare-min-time';
    }
};

function ItemsComparison() {
    AhComparison.apply(this, arguments);
}

ItemsComparison.prototype = Object.create(AhComparison.prototype);
ItemsComparison.prototype.constructor = AhComparison;

ItemsComparison.prototype.renderEntities = function(parsedEntities) {
    let modalContainer = this.modal.querySelector('.ah-compare-container');

    let statusPatterns = {
        blocked: /\bblocked\b/i,
        rejected: /\brejected\b/i,
        paid: /\bpaid\b/i,
        active: /\b(added|activated|unblocked)\b/i,
        closed_removed_archived: /\b(removed|closed|archived)\b/i,
        vas: /\b(premium|vip|pushed up|highlighted)\b/i
    };
    let rows = {
        id_title_price: '',
        status_reasons: '',
        time: '',
        photos: '',
        description: '',
        microCategory: '',
        region: '',
        phone_ip: '',
        sellerName: '',
        user: ''
    };

    const abutmentId = this._ids.abutment;
    let abutmentUserId = null;

    for (let key in parsedEntities) {
        if (!parsedEntities.hasOwnProperty(key)) continue;

        let item = parsedEntities[key];
        let mainPhoto = '';
        let prevPhotos = '';
        let reasons = '';
        let microCategories = [];

        // превьюшки
        item.photos.forEach(function(photo, i) {
            let activeImgClass = (i === 0) ? 'ah-photo-prev-img-active' : '';
            const date = new Date(photo.date);
            prevPhotos += `
                    <div class="ah-photo-prev-wrap">
                        <img class="ah-photo-prev-img ${activeImgClass}" src="${photo.thumbUrl}" data-original-image="${photo.url}">
                        <div class="ah-photo-prev-img-date" title="${photo.date}">
                            ${dateWithZero(date.getDate())}.${dateWithZero(date.getMonth()+1)} 
                            ${dateWithZero(date.getHours())}:${dateWithZero(date.getMinutes())}
                        </div>
                    </div>
                `;
        });

        // главное фото
        if (item.photos.length !== 0) {
            mainPhoto = `
                    <div class="ah-compare-photo-date">${item.photos[0].date}</div>
                    <span class="ah-compare-photo-count">${item.photos.length}</span>
                    <a style="background-image: url(${item.photos[0].url});" target="_blank" href="${item.photos[0].url}" class="ah-photo-link"></a>
                `;
        } else {
            mainPhoto = `<div class="text-muted">Нет Фото</div>`;
        }

        // причины
        if (item.reasons.length !== 0) {
            reasons = `(${item.reasons.join(', ')})`;
        }

        // микрокатегория
        item.microCategoryes.forEach(function(mircoCategory, i) {
            microCategories.push(`<span data-compare="microCategory[${i}]" data-entity-id="${item.id}">${mircoCategory}</span>`);
        });

        // статусы
        if (statusPatterns.blocked.test(item.status)) {
            item.status = item.status.replace(statusPatterns.blocked, `
                    <span class="text-danger" title="${reasons}">
                        $& <span class="glyphicon glyphicon-info-sign ah-compare-items-reason-tooltip" title="${reasons}"></span>
                    </span>`);
        }
        if (statusPatterns.rejected.test(item.status)) {
            item.status = item.status.replace(statusPatterns.rejected, `
                    <span class="text-warning">
                        $& <span class="glyphicon glyphicon-info-sign ah-compare-items-reason-tooltip" title="${reasons}"></span>
                    </span>`);
        }
        if (statusPatterns.paid.test(item.status)) {
            item.status = item.status.replace(statusPatterns.paid, '<span class="text-primary">$&</span>');
        }
        if (statusPatterns.active.test(item.status)) {
            item.status = item.status.replace(statusPatterns.active, '<span class="text-success">$&</span>');
        }
        if (statusPatterns.closed_removed_archived.test(item.status)) {
            item.status = item.status.replace(statusPatterns.closed_removed_archived, '<span class="text-muted">$&</span>');
        }
        if (statusPatterns.vas.test(item.status)) {
            item.status = item.status.replace(statusPatterns.vas, '<span class="ah-text-vas">$&</span>');
        }

        // ячейки
        rows.id_title_price += `
                <div class="ah-compare-cell" data-entity-id="${item.id}">
                    <span class="text-muted"><span class="ah-compare-items-item-id" data-entity-id="${item.id}">${item.id}</span></span>,
                    <a target="_blank" class="ah-compare-items-item-title" href="/items/item/info/${item.id}" 
                        data-compare="title" data-entity-id="${item.id}">${item.title}</a>
                    (<span data-compare="price" data-entity-id="${item.id}">${item.price}${(/\d/.test(item.price)) ? ' руб.' : ''}</span>)
                </div>
            `;

        rows.status_reasons += `
                <div class="ah-compare-cell" data-entity-id="${item.id}">
                    <span class="ah-compare-items-status">${item.status}</span>
                </div>
            `;

        rows.time += `
                <div class="ah-compare-cell" data-entity-id="${item.id}">
                    <div>
                        <span class="ah-compare-items-label">Sort time: </span>
                        <span data-compare-time="sort" data-entity-id="${item.id}" title="Sort Time">${item.time}</span>
                    </div>
                    <div>
                        <span class="ah-compare-items-label">Start time: </span>
                        <span data-compare-time="start" data-entity-id="${item.id}" title="Start Time">${item.startTime}</span>
                    </div>
                </div>
            `;

        rows.photos += `
                <div class="ah-compare-cell" data-entity-id="${item.id}">
                    <div class="ah-compare-photo-main">
                        ${mainPhoto}
                    </div>
                    <div class="ah-compare-photo-prev ah-compare-collapsible">
                        ${prevPhotos}
                    </div>
                </div>
            `;

        rows.microCategory += `
                <div class="ah-compare-cell" data-entity-id="${item.id}">
                    <i>${microCategories.join(' / ')}</i>
                </div>
            `;

        rows.description += `
                <div class="ah-compare-cell" data-entity-id="${item.id}">
                    <div class="ah-compare-items-cell-description ah-compare-collapsible"
                        data-compare="description" data-entity-id="${item.id}">${item.description}</div>
                </div>
            `;

        rows.region += `
                <div class="ah-compare-cell" data-entity-id="${item.id}">
                    <span class="ah-compare-items-label">Город:</span>
                    <span data-compare="region" data-entity-id="${item.id}">${item.region}</span>
                </div>
            `;

        rows.phone_ip += `
                <div class="ah-compare-cell" data-entity-id="${item.id}">
                    <span class="ah-compare-items-label">Тел.:</span>
                    <span data-compare="phone" data-entity-id="${item.id}">${item.phone}</span>,
                    <span class="ah-compare-items-label">IP:</span>
                    <span>
                    <button data-compare="ip" data-entity-id="${item.id}" 
                        class="btn btn-link ah-pseudo-link ah-compare-items-ip-info-btn" data-ip="${item.ip}">
                        ${item.ip}
                    </button>
                    </span>
                </div>
            `;

        rows.sellerName += `
                <div class="ah-compare-cell" data-entity-id="${item.id}">
                    <span class="ah-compare-items-label">Название:</span>
                    <span data-compare="sellerName" data-entity-id="${item.id}">${item.sellerName}</span>
                </div>
            `;

        rows.user += `
                <div class="ah-compare-cell" data-entity-id="${item.id}">
                    <span class="ah-compare-items-label">Пользователь:</span>
                    <a target="_blank" href="/users/user/info/${item.userId}" data-compare="userMail" data-entity-id="${item.id}">
                    ${item.userMail}</a>
                    ${(abutmentId !== item.id && abutmentUserId !== item.userId) ? `
                        (<button class="btn btn-link ah-pseudo-link ah-compare-users-btn" data-user-id="${item.userId}" title="Сравнить УЗ">&#8644</button>)
                    ` : ``}
                    <div><span class="ah-compare-items-label">Объявления:</span> <a target="_blank" href="/items/search?user_id=${item.userId}">${item.userItems}</a></div>
                </div>
            `;

        if (abutmentId === item.id) {
            abutmentUserId = item.userId;
        }
    }

    modalContainer.innerHTML = `
        <div class="ah-compare-row">
            ${rows.id_title_price}
        </div>
        <div class="ah-compare-row">
            ${rows.status_reasons}
        </div>
        <div class="ah-compare-row">
            ${rows.time}
        </div>
        <div class="ah-compare-row ah-compare-items-row-photos">
            ${rows.photos}
        </div>
        <div class="ah-compare-row ah-compare-show-more hidden">
            <span class="ah-compare-more-text">
                Фото <span class="glyphicon glyphicon-collapse-down"></span>
            </span>
        </div>

        <div class="ah-compare-row">
            ${rows.microCategory}
        </div>
        <div class="ah-compare-row ah-compare-items-row-description">
            ${rows.description}
        </div>
        <div class="ah-compare-row ah-compare-show-more hidden">
            <span class="ah-compare-more-text">
                Описания <span class="glyphicon glyphicon-collapse-down"></span>
            </span>
        </div>

        <div class="ah-compare-row">
            ${rows.region}
        </div>
        <div class="ah-compare-row ah-compare-items-row-ip">
            ${rows.phone_ip}
        </div>
        <div class="ah-compare-row">
            ${rows.sellerName}
        </div>
        <div class="ah-compare-row ah-compare-items-row-user">
            ${rows.user}
        </div>
    `;

    // опорное
    const abutmentItemIdNode = this.modal.querySelector(`.ah-compare-items-item-id[data-entity-id="${abutmentId}"]`);
    abutmentItemIdNode.insertAdjacentHTML('beforebegin',`<span class="label label-primary ah-compare-label-abutment">Опорное</span> `);

    // тултипы причин
    $(this.modal.querySelectorAll(`.ah-compare-items-reason-tooltip`)).tooltip({
        placement: 'bottom',
        container: 'body'
    });

    // поповер инфо об ip
    const ipRow = this.modal.querySelector('.ah-compare-items-row-ip');
    ipRow.addEventListener('click', e => {
        const target = e.target;

        if (target.classList.contains('ah-compare-items-ip-info-btn')) {
            const ip = target.dataset.ip;
            btnLoaderOn(target);

            getIpInfo(ip)
                .then(
                    response => showIpInfoPopover(target, response, {container: modalContainer}),
                    error => alert(`Произошла ошибка:\n${error.status}\n${error.statusText}`)
                ).then(
                () => {
                    btnLoaderOff(target);
                    this.modal.focus();
                }
            );
        }
    });

    // копирование айтемов (jQuery пока остается - надо перепиливать copyDataTooltip)
    const itemsToCopy = this.modal.querySelectorAll('.ah-compare-items-item-id');
    copyDataTooltip(itemsToCopy, {
        title: getCopyTooltipContentAlt('скопировать с заголовком'),
        getText: function(elem) {
            let itemId = $(elem).text().trim();
            return `№${itemId}`;
        },
        getTextAlt: function(elem) {
            let itemTitle = $(elem).parents('.ah-compare-cell').find('.ah-compare-items-item-title').text();
            let itemId = $(elem).text().trim();
            return `№${itemId} («${itemTitle}»)`;
        }
    });

    // фото
    const photosRow = this.modal.querySelector('.ah-compare-items-row-photos');
    photosRow.addEventListener('click', e => {
        const target = e.target;

        if (target.closest('.ah-photo-prev-wrap')) {
            const preview = target.closest('.ah-photo-prev-wrap');

            const allPreviews = preview.closest('.ah-compare-photo-prev').querySelectorAll('.ah-photo-prev-img');
            const main = preview.closest('.ah-compare-cell').querySelector('.ah-compare-photo-main');
            const mainPhoto = main.querySelector('.ah-photo-link');
            const mainPhotoDate = main.querySelector('.ah-compare-photo-date');
            const currPreview = preview.querySelector('.ah-photo-prev-img');
            const photoDate = preview.querySelector('.ah-photo-prev-img-date');
            const originalImg = currPreview.dataset.originalImage;

            allPreviews.forEach(item => item.classList.remove('ah-photo-prev-img-active'));
            currPreview.classList.add('ah-photo-prev-img-active');
            mainPhoto.style.backgroundImage = `url(${originalImg})`;
            mainPhoto.href = originalImg;

            mainPhotoDate.textContent = photoDate.title;
        }
    });

    // Пользователь
    const userRow = this.modal.querySelector('.ah-compare-items-row-user');
    userRow.addEventListener('click', e => {
        const target = e.target;

        if (target.classList.contains('ah-compare-users-btn')) {
            const users = {};
            users.compared = [target.dataset.userId];
            users.abutment = abutmentUserId;

            btnLoaderOn(target);

            const comparison = new UsersComparison(users);
            comparison.render()
                .then(() => {
                    comparison.showModalSecond();
                }, error => alert(error))
                .then(() => {
                    btnLoaderOff(target);
                });
        }
    });

    this.compareStrict();
    this.compareTime();
};

ItemsComparison.prototype.render = function() {
    return new Promise((resolve, reject) => {
        this.parseEntities({
                getEntityRequest: getItemInfo,
                getEntityParams: getParamsItemInfo,
            })
            .then(result => {
                this.renderResultModal({
                    title: `Сравнение объявлений`
                });
                this.renderEntities(result);
                resolve();
            }, error => {
                reject(error);
            });
    });

};

function UsersComparison() {
    AhComparison.apply(this, arguments);
}

UsersComparison.prototype = Object.create(AhComparison.prototype);
UsersComparison.prototype.constructor = AhComparison;

UsersComparison.prototype.renderEntities = function(parsedEntities) {
    const self = this;

    const modalContainer = this.modal.querySelector('.ah-compare-container');
    const rows = {
        control: {
            class: 'ah-compare-row-controls'
        },
        mail_chance: {
            class: 'ah-compare-row-muted'
        },
        status: {},
        reg_time: {
            class: 'ah-compare-row-muted'
        },
        name_manager: {},
        location_metro_district: {
            class: 'ah-compare-row-muted'
        },
        user_agent: {},
        phones: {
            class: 'ah-compare-row-phones ah-compare-row-muted',
            hasShowMore: true,
            showMoreText: 'Телефоны'
        },
        ips: {
            hasShowMore: true,
            showMoreText: 'IP-адреса',
            class: 'ah-compare-row-ips'
        },
        items: {
            class: 'ah-compare-row-items ah-compare-row-muted'
        }
    };
    const statusPatterns = {
        blocked: /\bblocked\b/i,
        active: /\bactive\b/i,
        removed: /\bremoved\b/i,
        unconfirmed: /\bunconfirmed\b/i
    };
    const rowsHtml = {};
    const abutmentId = this._ids.abutment;

    for (let row in rows) {
        if (!rows.hasOwnProperty(row)) continue;
        const value = rows[row];

        rowsHtml[row] = document.createElement('div');
        rowsHtml[row].className = `ah-compare-row ${(value.class) ? value.class : ''}`;
        rowsHtml[row].setAttribute('data-row-name', row);

        modalContainer.appendChild(rowsHtml[row]);
        if (value.hasShowMore) {
            const showMore = document.createElement('div');
            showMore.className = 'ah-compare-row ah-compare-show-more hidden';
            showMore.innerHTML = `
                <span class="ah-compare-more-text">
                    ${value.showMoreText} <span class="glyphicon glyphicon-collapse-down"></span>
                </span>
            `;

            modalContainer.appendChild(showMore);
        }
    }

    for (let entity in parsedEntities) {
        if (!parsedEntities.hasOwnProperty(entity)) continue;

        const info = parsedEntities[entity];

        rowsHtml.control.insertAdjacentHTML('beforeend', `<div class="ah-compare-cell" data-entity-id="${info.id}"></div>`);
        rowsHtml.mail_chance.insertAdjacentHTML('beforeend', `<div class="ah-compare-cell" data-entity-id="${info.id}"></div>`);
        rowsHtml.status.insertAdjacentHTML('beforeend', `<div class="ah-compare-cell" data-entity-id="${info.id}"></div>`);
        rowsHtml.reg_time.insertAdjacentHTML('beforeend', `<div class="ah-compare-cell" data-entity-id="${info.id}"></div>`);
        rowsHtml.name_manager.insertAdjacentHTML('beforeend', `<div class="ah-compare-cell" data-entity-id="${info.id}"></div>`);
        rowsHtml.location_metro_district.insertAdjacentHTML('beforeend', `<div class="ah-compare-cell" data-entity-id="${info.id}"></div>`);
        rowsHtml.user_agent.insertAdjacentHTML('beforeend', `<div class="ah-compare-cell" data-entity-id="${info.id}"></div>`);
        rowsHtml.phones.insertAdjacentHTML('beforeend', `<div class="ah-compare-cell" data-entity-id="${info.id}"></div>`);
        rowsHtml.ips.insertAdjacentHTML('beforeend', `<div class="ah-compare-cell" data-entity-id="${info.id}"></div>`);
        rowsHtml.items.insertAdjacentHTML('beforeend', `<div class="ah-compare-cell" data-entity-id="${info.id}"></div>`);

        renderEntityCells(info);
    }

    function renderEntityCells(info) {
        const cellControl = rowsHtml.control.querySelector(`.ah-compare-cell[data-entity-id="${info.id}"]`);
        const cellMailChance = rowsHtml.mail_chance.querySelector(`.ah-compare-cell[data-entity-id="${info.id}"]`);
        const cellStatus = rowsHtml.status.querySelector(`.ah-compare-cell[data-entity-id="${info.id}"]`);
        const cellRegTime = rowsHtml.reg_time.querySelector(`.ah-compare-cell[data-entity-id="${info.id}"]`);
        const cellNameManager = rowsHtml.name_manager.querySelector(`.ah-compare-cell[data-entity-id="${info.id}"]`);
        const cellLocationMetroDistrict = rowsHtml.location_metro_district.querySelector(`.ah-compare-cell[data-entity-id="${info.id}"]`);
        const cellUserAgent = rowsHtml.user_agent.querySelector(`.ah-compare-cell[data-entity-id="${info.id}"]`);
        const cellPhones = rowsHtml.phones.querySelector(`.ah-compare-cell[data-entity-id="${info.id}"]`);
        const cellIps = rowsHtml.ips.querySelector(`.ah-compare-cell[data-entity-id="${info.id}"]`);
        const cellItems = rowsHtml.items.querySelector(`.ah-compare-cell[data-entity-id="${info.id}"]`);

        let control = '';
        let statusClass = 'text-info';
        let chance = '';

        if (statusPatterns.blocked.test(info.status)) {
            statusClass = `text-danger`;
        }

        if (statusPatterns.active.test(info.status)) {
            statusClass = `text-success`;
        }

        if (statusPatterns.unconfirmed.test(info.status)) {
            statusClass = `text-muted`;
        }

        if (statusPatterns.removed.test(info.status)) {
            statusClass = `text-muted`;
        }

        if (info.chance) {
            chance = (+info.chance === 10) ?
                `<span class="glyphicon glyphicon-ban-circle text-danger ah-compare-ban-icon"></span>`
                : `<b class="text-success">${info.chance}</b>`;
        } else {
            chance = `<b>0</b>`;
        }

        if (+info.id !== +abutmentId) {
            control += `
                <button class="btn btn-sm ah-compare-show-abutment-similar-btn" data-entity-id="${info.id}">Совпадения</button>
            `;
        } else {
            control += `
                <div class="ah-compare-abutment-legend"></div>
            `;
        }

        cellControl.insertAdjacentHTML('beforeend', control);

        cellMailChance.insertAdjacentHTML('beforeend',`
            ${(+info.id === +abutmentId) ? '<span class="label label-primary ah-compare-label-abutment">Опорная</span> ': ''}
            <a class="ah-compare-users-user-mail ah-visitable-link" data-entity-id="${info.id}" target="_blank" 
                href="${global.connectInfo.adm_url}/users/user/info/${info.id}">${info.mail}</a>,
            <span> Шанс -</span> ${chance}
        `);

        cellStatus.insertAdjacentHTML('beforeend',`
            <b class="${statusClass}">${info.status}</b>
            ${(info.blockReasons) ? `<span class="glyphicon glyphicon-info-sign text-danger ah-compare-users-reason-tooltip" 
                title="${info.blockReasons.join(', ')}"></span>` : ``}
        `);

        cellRegTime.insertAdjacentHTML('beforeend',`
            <b>Зарегистрирован:</b> <span>${info.regTime}</span>
        `);

        cellNameManager.insertAdjacentHTML('beforeend',`
            <b>Название:</b> <span data-compare="name" data-compare-formatted="Название" data-entity-id="${info.id}">${info.name}</span>${(info.manager) ?
            `, <b>Менеджер:</b> <span data-compare="manager" data-compare-formatted="Менеджер" data-entity-id="${info.id}">${info.manager}</span>` : ''}
        `);

        cellLocationMetroDistrict.insertAdjacentHTML('beforeend',`
            <b>Регион:</b> <span data-compare="location" data-compare-formatted="Регион" data-entity-id="${info.id}">${info.location}</span>
            ${(info.metro) ?
            ` (<span data-compare="metro" data-compare-formatted="Метро" data-entity-id="${info.id}">${info.metro}</span>)` : ''}
            ${(info.district) ?
            ` (<span data-compare="district" data-compare-formatted="Направление" data-entity-id="${info.id}">${info.district}</span>)` : ''}
        `);

        cellUserAgent.insertAdjacentHTML('beforeend',`
            <b>User-Agent: </b>
            <span data-compare="userAgent" data-compare-formatted="User-Agent" data-entity-id="${info.id}">${info.userAgent}</span>
        `);

        cellPhones.insertAdjacentHTML('beforeend',`
            <ul class="ah-compare-list">
                ${info.phones.map(phone =>
                `<li>
                    <span data-compare="phone" data-compare-formatted="Телефоны" data-entity-id="${info.id}">${phone.value}</span>
                    ${(phone.isVerifyed) ? `<span class="glyphicon glyphicon-ok text-success"></span>`
                    : `<span class="glyphicon glyphicon-remove text-danger"></span>`}
                    (<a href="/users/search?phone=${phone.value}" target="_blank" class="ah-visitable-link">in users</a> <span class="text-muted">|</span>
                    <a href="/items/search?phone=${phone.value}" target="_blank" class="ah-visitable-link">in items</a>)
                </li>`).join('')}
            </ul>
        `);
        cellPhones.classList.add('ah-compare-collapsible');

        cellIps.insertAdjacentHTML('beforeend',`
            <ul class="ah-compare-list">
                ${info.ips.map(ip =>
                `<li>
                    <button data-compare="ip" data-compare-formatted="IP" data-entity-id="${info.id}" data-ip="${ip}" 
                        class="btn btn-link ah-pseudo-link ah-compare-ip-info-btn">${ip}</button>
                    (<i class="glyphicon glyphicon-user"></i>
                    <a href="/users/search?ip=${ip}" target="_blank" class="ah-visitable-link">Users</a> <span class="text-muted">/</span>
                    <i class="glyphicon glyphicon-file"></i>
                    <a href="/items/search?ip=${ip}" target="_blank" class="ah-visitable-link">Items</a>)
                </li>`).join('')}
            </ul>
        `);
        cellIps.classList.add('ah-compare-collapsible');

        // items
        if (+info.id !== +abutmentId) {
            cellItems.insertAdjacentHTML('beforeend', `
                <button class="btn btn-default btn-xs ah-compare-items-list-btn" data-entity-id="${info.id}"
                title="Загрузить первую страницу объявлений">Объявления (c.1)</button>
            `);
        }

        // тултип причина
        $(cellStatus.querySelector(`.ah-compare-users-reason-tooltip`)).tooltip({
            placement: 'bottom',
            container: 'body'
        });
    }

    // поповер инфо об ip
    rowsHtml.ips.addEventListener('click', e => {
        const target = e.target;

        if (target.classList.contains('ah-compare-ip-info-btn')) {
            const ip = target.dataset.ip;
            btnLoaderOn(target);

            getIpInfo(ip)
                .then(
                    response => showIpInfoPopover(target, response, {container: modalContainer}),
                    error => alert(`Произошла ошибка:\n${error.status}\n${error.statusText}`)
                ).then(
                () => {
                    btnLoaderOff(target);
                    self.modal.focus();
                }
            );
        }
    });

    // controls
    const controlRow = modalContainer.querySelector('[data-row-name="control"]');
    controlRow.addEventListener('click', function (e) {
        const target = e.target;

        // совпадения в опорной
        if (target.classList.contains('ah-compare-show-abutment-similar-btn')) {
            const entityId = target.dataset.entityId;
            showAbutmentSimilarInfo(entityId);
        }

        // убрать совпадения с опорной
        if (target.classList.contains('ah-compare-abutment-legend__reset')) {
            const allAbutmentSimilars = self.modal.querySelectorAll('.ah-compare-abutment-similar');
            allAbutmentSimilars.forEach(node => node.classList.remove('ah-compare-abutment-similar'));

            self.compareStrict();

            const legend = target.closest('.ah-compare-abutment-legend');
            legend.classList.add('hidden');
            self.modal.focus();
        }
    });

    // items
    let abutmentUserItems = []; // тайтлы айтемов опорной УЗ
    let abutmentUserItemsParsed = false; // айтемы опорной УЗ спарсены

    const itemsRow = modalContainer.querySelector('[data-row-name="items"]');
    itemsRow.addEventListener('click', function (e) {
        const target = e.target;

        // объявления
        if (target.classList.contains('ah-compare-items-list-btn')) {
            const entityId = target.dataset.entityId;

            btnLoaderOn(target);
            if (!abutmentUserItemsParsed) { // парсить нажатую + опорную

                // дизейблить все кнопки
                const allBtns = modalContainer.querySelectorAll('.ah-compare-items-list-btn');
                allBtns.forEach(btn => btn.disabled = true);

                Promise.all([
                    getUserItems(abutmentId),
                    getUserItems(entityId)
                ])
                    .then(result => {
                            renderItems(result[0], abutmentId);
                            abutmentUserItemsParsed = true;
                            renderItems(result[1], entityId);
                            target.remove();
                        }, error => {
                            alert(`Произошла ошибка:\n${error.status}\n${error.statusText}`);
                            btnLoaderOff(target)
                        }
                    )
                    .then(() => allBtns.forEach(btn => btn.disabled = false));
            } else { // парсить только нажатую
                getUserItems(entityId)
                    .then(result => {
                            renderItems(result, entityId);
                            target.remove();
                        }, error => {
                            alert(`Произошла ошибка:\n${error.status}\n${error.statusText}`);
                            btnLoaderOff(target);
                        }
                    );
            }

        }
    });

    // показать совпадения на опорной
    function showAbutmentSimilarInfo(entityId) {
        const allAbutmentSimilars = self.modal.querySelectorAll('[data-similar-entity-ids]');
        const abutmentEntitySimilars = [].filter.call(allAbutmentSimilars, node => {
            return ~JSON.parse(node.dataset.similarEntityIds).indexOf(entityId);
        });
        const comparingEntitySimilars = self.modal.querySelectorAll(`.ah-compare-similar[data-entity-id="${entityId}"]`);
        const abutmentAllSimilars = self.modal.querySelectorAll(`.ah-compare-similar[data-entity-id="${abutmentId}"]`);
        const allCurrentSimilars = self.modal.querySelectorAll('.ah-compare-abutment-similar');

        allCurrentSimilars.forEach(node => node.classList.remove('ah-compare-abutment-similar'));
        abutmentAllSimilars.forEach(node => node.classList.remove('ah-compare-similar'));
        abutmentEntitySimilars.forEach(node => node.classList.add('ah-compare-abutment-similar'));
        comparingEntitySimilars.forEach(node => node.classList.add('ah-compare-abutment-similar'));

        // legend
        const abutmentControlLegend = self.modal.querySelector('.ah-compare-abutment-legend');
        const entityInfo = parsedEntities[`id_${entityId}`];
        abutmentControlLegend.innerHTML = `
            <span>
                Сравнивается с
                <strong>
                    <a target="_blank" href="/users/user/info/${entityInfo.id}"  
                    title="${entityInfo.mail}">${entityInfo.mail}</a>
                </strong>
            </span>
            <button class="close ah-compare-abutment-legend__reset" title="Убрать сравнение">x</button>
        `;
        abutmentControlLegend.classList.remove('hidden');
    }

    // отрисовка объявлений
    function renderItems(htmlStr, entityId) {
        const htmlNode = document.createElement('div');
        htmlNode.innerHTML = htmlStr;

        const entityCell = modalContainer.querySelector(`[data-row-name="items"] .ah-compare-cell[data-entity-id="${entityId}"]`);
        let similarTitlesCount = 0;

        const list = document.createElement('ul');
        list.className = 'ah-compare-list ah-compare-list-items';

        const table = htmlNode.querySelector('#items');
        if (table) {
            const rows = table.querySelectorAll('.item-row');

            const listItems = [].reduce.call(rows, (res, row) => {
                const itemTitle = row.querySelector('.item_title');
                const itemTitleText = itemTitle.textContent;
                const li = document.createElement('li');
                const a = document.createElement('a');

                a.textContent = itemTitleText;
                a.className = 'ah-visitable-link';

                // проверить совпадение с айтемами опорной
                if (abutmentUserItemsParsed && abutmentUserItems.includes(itemTitleText.trim().toLowerCase())) {
                    a.classList.add('ah-compare-similar');
                    similarTitlesCount++;
                }

                a.href = itemTitle.getAttribute('href');
                a.target = '_blank';
                a.setAttribute('title', itemTitle.getAttribute('title'));

                li.appendChild(a);
                res.push(li);
                return res;
            }, []);

            if (listItems.length > 0) {
                list.append(...listItems);
            } else {
                const li = document.createElement('li');
                li.className = 'text-muted';
                li.textContent = 'Объявления не найдены';
                list.append(li);
            }

            const info = document.createElement('div');
            info.className = 'ah-compare-user-items-header';
            if (entityId === abutmentId) { // если для опорной
                abutmentUserItems = listItems.map(item => item.textContent.trim().toLowerCase());
                info.innerHTML = `Объявления (1я страница)`;
            } else { // если не для опорной
                const word = declensionOfNumerals(similarTitlesCount, ['объявление', 'объявления', 'объявлений']);
                if (similarTitlesCount === 0)  {
                    info.classList.add('text-muted');
                } else {
                    info.classList.add('text-danger');
                }
                info.innerHTML = `${similarTitlesCount} ${word} совпало по названию`;
            }
            entityCell.appendChild(info);
        } else {
            const li = document.createElement('li');
            li.className = 'text-muted';
            li.textContent = 'Объявления не найдены';
            list.append(li);
        }

        entityCell.appendChild(list);
        self.modal.focus();
    }

    // сравнение
    this.compareStrict();

    // проверить совпадения
    const similarBtns = modalContainer.querySelectorAll(`.ah-compare-show-abutment-similar-btn`);
    similarBtns.forEach(btn => {
        const entityId = btn.dataset.entityId;
        const cells = modalContainer.querySelectorAll(`.ah-compare-cell[data-entity-id="${entityId}"]`);

        const similars = [].reduce.call(cells, (res, cell) => {
            const nodesArr = [].slice.call(cell.querySelectorAll('.ah-compare-similar'));
            res = res.concat(nodesArr);
            return res;
        }, []);

        const result = new Map();

        similars.forEach(item => {
            const compareField = item.dataset.compareFormatted;
            if (!compareField) return;

            const compareValue = item.textContent;

            if (!result.has(compareField)) {
                result.set(compareField, [compareValue]);
            } else {
                const arr = result.get(compareField);
                arr.push(compareValue);
                result.set(compareField, arr);
            }
        });

        if (result.size === 0) {
            const label = document.createElement('span');
            label.className = 'label label-success ah-no-matches-label';
            label.innerHTML = 'Нет совпадений';

            btn.replaceWith(label);
        } else {
            const resultTable = document.createElement('table');
            resultTable.className = 'table table-bordered ah-compare-similar-info-table';

            result.forEach((value, key) => {
                const row = document.createElement('tr');
                row.innerHTML = `<td>${key}</td><td>${value.join(', ')}</td>`;
                resultTable.appendChild(row);
            });

            const className = (result.size === 1) ? 'btn-warning': 'btn-danger';
            const word = declensionOfNumerals(result.size, ['совпадение', 'совпадения', 'совпадений']);
            btn.classList.add(className);
            btn.innerHTML = `${result.size} ${word}`;

            const clonedBtn = btn.cloneNode(true);
            const btnGroup = document.createElement('div');
            btnGroup.className = 'btn-group';

            const info = document.createElement('button');
            info.className = `btn btn-sm ${className}`;
            info.innerHTML = `<span class="glyphicon glyphicon-info-sign"></span>`;

            btnGroup.appendChild(clonedBtn);
            btnGroup.appendChild(info);
            btn.replaceWith(btnGroup);

            $(info).popover({
                placement: 'bottom',
                html: true,
                container: modalContainer,
                content: resultTable.outerHTML,
                trigger: 'focus',
                template: `
                     <div class="popover ah-compare-similar-info-popover">
                         <div class="arrow"></div>
                         <div class="popover-content"></div>
                     </div>`
            });
        }
    });
};

UsersComparison.prototype.render = function() {
    return new Promise((resolve, reject) => {
        this.parseEntities({
                getEntityRequest: getUserInfo,
                getEntityParams: getParamsUserInfo,
            })
            .then(result => {
                this.renderResultModal({
                    title: `Сравнение УЗ`,
                    class: 'ah-compare-modal-users',
                    refContent: `
                        <ul class="ah-compare-ref__list">
                            <li>В сравнении могут участвовать до ${this._maxCount} УЗ.</li>
                            <li>В опорной подсвечиваются совпадения со всеми сравниваемыми УЗ.</li>
                            <li>Клик на количество совпадений в сравниваемой УЗ показывает совпадения только с этой УЗ.</li>
                        </ul>
                    `
                });
                this.renderEntities(result);
                resolve();
            }, error => {
                reject(error);
            });
    });
};