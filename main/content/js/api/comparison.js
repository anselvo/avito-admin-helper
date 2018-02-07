function AhComparison(ids) {
    this.ids = ids;
}

AhComparison.prototype.getUnique = function(ids) {
    const maxCount = 30;

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

    if (res.length > maxCount) {
        return {
            success: false,
            message: `Нельзя сравнивать более ${maxCount}`
        }
    }

    return {
        success: true,
        message: null,
        unique: res
    }
};

AhComparison.prototype.parseEntities = function(functions) {
    const all = this.ids.compared;
    all.unshift(this.ids.abutment);
    const entities = this.getUnique(all);

    return new Promise(function(resolve, reject) {
        if (entities.success) {
            const unique = entities.unique;
            const parsedEntities = {};
            let doneRequestsCount = 0;

            unique.forEach((id) => {
                parsedEntities[`id_${id}`] = null; // хак с нечисловой строкой, чтобы сохранить порядок

                functions.getEntityRequest(id)
                    .then(
                        response => parsedEntities[`id_${id}`] = functions.getEntityParams(response),
                        error => {
                            outTextFrame(`Ошибка для №${id}: \n${error.status}\n${error.statusText}`);
                            delete parsedEntities[`id_${id}`];
                        }
                    ).then(
                    () => {
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

AhComparison.prototype.getResultModal = function(options) {
    options = options || {};
    const modalTitle = options.title || `Сравнение`;
    const modalClass = options.class || '';

    $(`.ah-compare-modal`).remove();

    $('body').append(`
        <div class="modal ah-dynamic-bs-modal ah-compare-modal ${modalClass}" tabindex="-1" role="dialog">
            <div class="modal-dialog modal-lg" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                        <h4 class="modal-title">${modalTitle}</h4>
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
        </div>
    `);

    const modal = document.querySelector(`.ah-compare-modal`);
    const scrollBtns = modal.querySelectorAll('.ah-compare-scroll');
    const container = modal.querySelector('.ah-compare-container');

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
        const container = modal.querySelector('.ah-compare-container');

        while (target !== this) {
            // collapse
            if (target.classList.contains('ah-compare-show-more')) {
                const prev = target.previousElementSibling;
                const collapsible = prev.querySelectorAll('.ah-compare-collapsible');

                $(collapsible).toggleClass('ah-none-overflow-y');
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

    return modal;
};

// строгое сравнение
AhComparison.prototype.compareStrict = function(modal, abutmentId) {
    const $allCompareNodes = $(modal).find('[data-compare]');
    const $abutmentNodes = $allCompareNodes.filter(`[data-entity-id="${abutmentId}"]`);
    const $comparingNodes = $allCompareNodes.not(`[data-entity-id="${abutmentId}"]`);
    $abutmentNodes.each(function () {
        const $abutment = $(this);
        const abutmentText = $abutment.text().trim().toLocaleLowerCase();
        const abutmentDataCompare = $abutment.data('compare');

        $comparingNodes.each(function () {
            const $comparing = $(this);
            const comparingText = $comparing.text().trim().toLocaleLowerCase();
            const comparingDataCompare = $comparing.data('compare');

            if (abutmentText === comparingText && abutmentDataCompare === comparingDataCompare) {
                $comparing.addClass('ah-compare-similar');
            }
        });
    });
};

function ItemsComparison() {
    AhComparison.apply(this, arguments);
}

ItemsComparison.prototype = Object.create(AhComparison.prototype);
ItemsComparison.prototype.constructor = AhComparison;

ItemsComparison.prototype.renderEntities = function(modal, parsedEntities) {
    let modalContainer = $(modal).find('.ah-compare-container');
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
        sortTime: '',
        photos: '',
        description: '',
        microCategory: '',
        region: '',
        phone_ip: '',
        sellerName: '',
        user: ''
    };

    for (let key in parsedEntities) {
        if (!parsedEntities.hasOwnProperty(key)) continue;

        let item = parsedEntities[key];
        let mainPhoto = '';
        let prevPhotos = '';
        let reasons = '';
        let microCategoryes = [];

        // превьюшки
        item.photos.forEach(function(photo, i) {
            let activeImgClass = (i === 0) ? 'ah-photo-prev-img-active' : '';
            prevPhotos += `
                    <div class="ah-photo-prev-wrap">
                        <img class="ah-photo-prev-img ${activeImgClass}" src="${photo.thumbUrl}" data-original-image="${photo.url}">
                    </div>
                `;
        });

        // главное фото
        if (item.photos.length !== 0) {
            mainPhoto = `
                    <span class="ah-compare-photo-count">${item.photos.length}</span>
                    <a style="background-image: url(${item.photos[0].url});" target="_blank" href="${item.photos[0].url}" 
                        class="ah-photo-link">
                    </a>
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
            microCategoryes.push(`<span data-compare="microCategory[${i}]" data-entity-id="${item.id}">${mircoCategory}</span>`);
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

        rows.sortTime += `
                <div class="ah-compare-cell" data-entity-id="${item.id}">
                    <span title="Sort Time">${item.sortTime}</span>
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
                    <i>${microCategoryes.join(' / ')}</i>
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
                        ${item.userMail}</a>, 
                    <a target="_blank" href="/items/search?user_id=${item.userId}">${item.userItems}</a>
                </div>
            `;
    }

    $(modalContainer).append(`
        <div class="ah-compare-row">
            ${rows.id_title_price}
        </div>
        <div class="ah-compare-row">
            ${rows.status_reasons}
        </div>
        <div class="ah-compare-row">
            ${rows.sortTime}
        </div>
        <div class="ah-compare-row">
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
        <div class="ah-compare-row">
            ${rows.phone_ip}
        </div>
        <div class="ah-compare-row">
            ${rows.sellerName}
        </div>
        <div class="ah-compare-row">
            ${rows.user}
        </div>
    `);

    const abutmentId = this.ids.abutment;

    // опорное
    let abutmentItemIdNode = $(modal).find(`.ah-compare-items-item-id[data-entity-id="${abutmentId}"]`);
    $(abutmentItemIdNode).before(`<span class="label label-primary">Опорное</span> `);

    // тултип причина
    $(modal).find(`.ah-compare-items-reason-tooltip`).tooltip({
        placement: 'bottom',
        container: 'body'
    });

    // поповер инфо об ip
    let ipPopovers = $(modal).find('.ah-compare-items-ip-info-btn');
    $(ipPopovers).click(function () {
        let ip = $(this).data('ip');
        let btn = $(this);
        btnLoaderOn($(btn));

        getIpInfo(ip)
            .then(
                response => showIpInfoPopover($(btn), response, {container: modalContainer}),
                error => alert(`Произошла ошибка:\n${error.status}\n${error.statusText}`)
            ).then(
            () => btnLoaderOff($(btn))
        );
    });

    // копирование айтемов
    let itemsToCopy = $(modal).find('.ah-compare-items-item-id');
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
    $(modal).find('.ah-photo-prev-wrap').click(function () {
        let allPreviews = this.closest('.ah-compare-photo-prev').querySelectorAll('.ah-photo-prev-img');
        let mainPhoto = this.closest('.ah-compare-cell').querySelector('.ah-compare-photo-main .ah-photo-link');
        let currPreview = this.querySelector('.ah-photo-prev-img');
        let originalImg = currPreview.dataset.originalImage;

        $(allPreviews).removeClass('ah-photo-prev-img-active');
        currPreview.classList.add('ah-photo-prev-img-active');
        mainPhoto.style.backgroundImage = `url(${originalImg})`;
        mainPhoto.href = originalImg;
    });

    this.compareStrict(modal, abutmentId);
};

function UsersComparison() {
    AhComparison.apply(this, arguments);
}

UsersComparison.prototype = Object.create(AhComparison.prototype);
UsersComparison.prototype.constructor = AhComparison;

UsersComparison.prototype.renderEntities = function(modal, parsedEntities) {

    const $modalContainer = $(modal).find('.ah-compare-container');
    const rows = {
        mail_chance: {},
        status: {},
        reg_time: {},
        name_manager: {},
        location_metro_district: {},
        user_agent: {},
        phones: {
            class: 'ah-compare-row-phones',
            hasShowMore: true,
            showMoreText: 'Телефоны'
        },
        ips: {
            hasShowMore: true,
            showMoreText: 'IP-адреса'
        },
        control: {
            class: 'ah-compare-row-controls'
        },
        items: {
            class: 'ah-compare-row-items'
        }
    };
    const statusPatterns = {
        blocked: /\bblocked\b/i,
        active: /\bactive\b/i,
        removed: /\bremoved\b/i,
        unconfirmed: /\bunconfirmed\b/i
    };
    const $rowsHtml = {};
    const abutmentId = this.ids.abutment;

    for (let row in rows) {
        if (!rows.hasOwnProperty(row)) continue;
        const value = rows[row];

        $rowsHtml[row] = $(`<div class="ah-compare-row" data-row-name="${row}"></div>`);
        if (value.class) {
            $rowsHtml[row].addClass(value.class);
        }

        $modalContainer.append($rowsHtml[row]);
        if (value.hasShowMore) {
            $modalContainer.append(`
                <div class="ah-compare-row ah-compare-show-more hidden">
                    <span class="ah-compare-more-text">
                    ${value.showMoreText} <span class="glyphicon glyphicon-collapse-down"></span>
                    </span>
                </div>
            `);
        }
    }

    for (let entity in parsedEntities) {
        if (!parsedEntities.hasOwnProperty(entity)) continue;

        const info = parsedEntities[entity];

        $rowsHtml.mail_chance.append(`<div class="ah-compare-cell" data-entity-id="${info.id}"></div>`);
        $rowsHtml.status.append(`<div class="ah-compare-cell" data-entity-id="${info.id}"></div>`);
        $rowsHtml.reg_time.append(`<div class="ah-compare-cell ah-compare-cell__padding-top_big" data-entity-id="${info.id}"></div>`);
        $rowsHtml.name_manager.append(`<div class="ah-compare-cell" data-entity-id="${info.id}"></div>`);
        $rowsHtml.location_metro_district.append(`<div class="ah-compare-cell ah-compare-cell__padding-bottom_big" data-entity-id="${info.id}"></div>`);
        $rowsHtml.user_agent.append(`<div class="ah-compare-cell ah-compare-cell__padding-bottom_big" data-entity-id="${info.id}"></div>`);
        $rowsHtml.phones.append(`<div class="ah-compare-cell ah-compare-cell__padding-top_big ah-compare-cell__padding-bottom_big" data-entity-id="${info.id}"></div>`);
        $rowsHtml.ips.append(`<div class="ah-compare-cell ah-compare-cell__padding-top_big ah-compare-cell__padding-bottom_big" data-entity-id="${info.id}"></div>`);
        $rowsHtml.control.append(`<div class="ah-compare-cell ah-compare-cell__padding-top_big ah-compare-cell__padding-bottom_big" data-entity-id="${info.id}"></div>`);
        $rowsHtml.items.append(`<div class="ah-compare-cell" data-entity-id="${info.id}"></div>`);

        renderEntityCells(info);
    }

    function renderEntityCells(info) {
        const $cellMailChance = $rowsHtml.mail_chance.find(`.ah-compare-cell[data-entity-id="${info.id}"]`);
        const $cellStatus = $rowsHtml.status.find(`.ah-compare-cell[data-entity-id="${info.id}"]`);
        const $cellRegTime = $rowsHtml.reg_time.find(`.ah-compare-cell[data-entity-id="${info.id}"]`);
        const $cellNameManager = $rowsHtml.name_manager.find(`.ah-compare-cell[data-entity-id="${info.id}"]`);
        const $cellLocationMetroDistrict = $rowsHtml.location_metro_district.find(`.ah-compare-cell[data-entity-id="${info.id}"]`);
        const $cellUserAgent = $rowsHtml.user_agent.find(`.ah-compare-cell[data-entity-id="${info.id}"]`);
        const $cellPhones = $rowsHtml.phones.find(`.ah-compare-cell[data-entity-id="${info.id}"]`);
        const $cellIps = $rowsHtml.ips.find(`.ah-compare-cell[data-entity-id="${info.id}"]`);
        const $cellControl = $rowsHtml.control.find(`.ah-compare-cell[data-entity-id="${info.id}"]`);

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
                <button class="btn btn-info btn-xs ah-compare-similar-info-btn" data-entity-id="${info.id}">Совпадения</button>
                <button class="btn btn-default btn-xs ah-compare-items-list-btn" data-entity-id="${info.id}"
                title="Загрузить первую страницу объявлений">Объявления (c.1)</button>
            `;
        }

        $cellControl.append(control);

        $cellMailChance.append(`
            ${(+info.id === +abutmentId) ? `<span class="label label-primary">Опорная</span> `: ``}
            <a class="ah-compare-users-user-mail ah-visitable-link" data-entity-id="${info.id}" target="_blank" 
                href="https://adm.avito.ru/users/user/info/${info.id}">${info.mail}</a>,
            <span> Шанс -</span> ${chance}
        `);

        $cellStatus.append(`
            <b class="${statusClass}">${info.status}</b>
            ${(info.blockReasons) ? `<span class="glyphicon glyphicon-info-sign text-danger ah-compare-users-reason-tooltip" 
                title="${info.blockReasons.join(', ')}"></span>` : ``}
        `);

        $cellRegTime.append(`
            <b>Зарегистрирован:</b> <span>${info.regTime}</span>
        `);

        $cellNameManager.append(`
            <b>Название:</b> <span data-compare="name" data-compare-formatted="Название" data-entity-id="${info.id}">${info.name}</span>${(info.manager) ?
            `, <b>Менеджер:</b> <span data-compare="manager" data-compare-formatted="Менеджер" data-entity-id="${info.id}">${info.manager}</span>` : ''}
        `);

        $cellLocationMetroDistrict.append(`
            <b>Регион:</b> <span data-compare="location" data-compare-formatted="Регион" data-entity-id="${info.id}">${info.location}</span>
            ${(info.metro) ?
            ` (<span data-compare="metro" data-compare-formatted="Метро" data-entity-id="${info.id}">${info.metro}</span>)` : ''}
            ${(info.district) ?
            ` (<span data-compare="district" data-compare-formatted="Направление" data-entity-id="${info.id}">${info.district}</span>)` : ''}
        `);

        $cellUserAgent.append(`
            <i data-compare="userAgent" data-compare-formatted="User-Agent" data-entity-id="${info.id}">${info.userAgent}</i>
        `);

        $cellPhones.append(`
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
        $cellPhones.addClass('ah-compare-collapsible');

        $cellIps.append(`
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
        $cellIps.addClass('ah-compare-collapsible');

        // тултип причина
        $cellStatus.find(`.ah-compare-users-reason-tooltip`).tooltip({
            placement: 'bottom',
            container: 'body'
        });

        // поповер инфо об ip
        $cellIps.find('.ah-compare-ip-info-btn').click(function () {
            let ip = $(this).data('ip');
            let btn = $(this);
            btnLoaderOn($(btn));

            getIpInfo(ip)
                .then(
                    response => showIpInfoPopover($(btn), response, {container: $modalContainer}),
                    error => alert(`Произошла ошибка:\n${error.status}\n${error.statusText}`)
                ).then(
                () => btnLoaderOff($(btn))
            );
        });
    }

    // controls
    let abutmentUserItems = []; // тайтлы айтемов опорной УЗ
    let abutmentUserItemsParsed = false; // айтемы опорной УЗ спарсены

    const $controlRow = $modalContainer.find('[data-row-name="control"]');
    $controlRow.on('click', function (e) {
        const $target = $(e.target);

        // совпадения
        if ($target.hasClass('ah-compare-similar-info-btn')) {

            const resultTable = document.createElement('table');
            resultTable.className = 'table table-bordered ah-compare-similar-info-table';

            const dataInfo = $target.data('similarInfo');
            for (let key in dataInfo) {
                if (!dataInfo.hasOwnProperty(key)) continue;
                const row = document.createElement('tr');
                row.innerHTML = `<td>${key}</td><td>${dataInfo[key]}</td>`;
                resultTable.appendChild(row);
            }

            $($target).popover({
                html: true,
                container: $modalContainer,
                placement: 'top',
                content: resultTable.outerHTML,
                template: `
                    <div class="popover ah-popover-destroy-outclicking ah-compare-similar-info-popover">
                        <div class="arrow"></div>
                        <div class="popover-content"></div>
                    </div>`
            }).popover('show');
        }

        if ($target.hasClass('ah-compare-items-list-btn')) {
            const entityId = $target.data('entityId');

            btnLoaderOn($target);
            if (!abutmentUserItemsParsed) { // парсить нажатую + опорную
                Promise.all([
                        getUserItems(abutmentId),
                        getUserItems(entityId)
                    ])
                    .then(result => {
                            renderItems(result[0], abutmentId);
                            abutmentUserItemsParsed = true;
                            renderItems(result[1], entityId);
                            $target.remove();
                        }, error => {
                            alert(`Произошла ошибка:\n${error.status}\n${error.statusText}`);
                            btnLoaderOff($target)
                        }
                    );
            } else { // парсить только нажатую
                getUserItems(entityId)
                    .then(result => {
                            renderItems(result, entityId);
                            $target.remove();
                        }, error => {
                            alert(`Произошла ошибка:\n${error.status}\n${error.statusText}`);
                            btnLoaderOff($target);
                        }
                    );
            }

        }
    });

    function renderItems(htmlStr, entityId) {
        const htmlNode = document.createElement('div');
        htmlNode.innerHTML = htmlStr;

        const entityCell = $modalContainer.find(`[data-row-name="items"] .ah-compare-cell[data-entity-id="${entityId}"]`)[0];
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
    }

    // сравнение
    this.compareStrict(modal, abutmentId);

    // проверить совпадения
    const $similarBtns = $modalContainer.find(`.ah-compare-similar-info-btn`);
    $similarBtns.each((idx, item) => {
        const $item = $(item);
        const entityId = $item.data('entityId');
        const $cells = $modalContainer.find(`.ah-compare-cell[data-entity-id="${entityId}"]`);
        const $similar = $cells.find('.ah-compare-similar');
        const result = new Map();

        $similar.each((idx, item) => {
            const $item = $(item);
            const compareField = $item.data('compareFormatted');
            if (!compareField) return;

            const compareValue = $item.text();

            if (!result.has(compareField)) {
                result.set(compareField, [compareValue]);
            } else {
                const arr = result.get(compareField);
                arr.push(compareValue);
                result.set(compareField, arr);
            }
        });

        if (result.size === 0) {
            $item.replaceWith(`<span class="label label-default">Нет совпадений</span>`);
        } else {
            const dataInfo = {};
            result.forEach((value, key) => {
                dataInfo[key] = value.join(', ');
            });
            $item.attr('data-similar-info', JSON.stringify(dataInfo));
        }
    });
};