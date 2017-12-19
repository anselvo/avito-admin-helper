function ShopModeration() {
    this.mainBlock = document.querySelector('.shop-moderation');
    this.pseudoInputsChanged = this.mainBlock.querySelectorAll('.shop-moderation-list-cell_changes .pseudo-input');
    this.patterns = {
        inputChangedValue: /(<del>[\s\S][^>]+>)|(<[^>]+>)/gi
    };
}

ShopModeration.prototype.addMailForm = function () {
    const self = this;
    const section = document.createElement('section');
    const form = document.createElement('form');
    const managerEmail = JSON.parse(this.mainBlock.dataset.emails).manager;
    const shopId = this.mainBlock.dataset.shopId;
    let templates = {};

    section.className = 'ah-shop-moderation-section';
    section.innerHTML = `
        <div class="panel panel-default ah-shop-moderation-form-panel">
            <div class="panel-heading"><h4>Отправка письма</h4></div>
            <div class="panel-body"></div>
            <div class="ah-overlay dark" tabindex="1">
                <span class="ah-overlay-text">Выполняется отправка...</span>
            </div>
        </div>
    `;

    form.className = 'ah-shop-moderation-mail-form';
    form.innerHTML = `
        <input type="hidden" disabled value="${shopId}" name="shop_id">
        ${(!managerEmail) ? `
            <div class="form-group">
                <label for="ahManagerEmail">Почта персонального менеджера</label>
                <input type="email" class="form-control" name="manager_email" id="ahManagerEmail">
            </div>` : ``
        }
        <div class="form-group">
            <label>Текст сообщения</label>
            <div contenteditable="true" class="form-control ah-message-text-input"></div>
        </div>
        <div class="clearfix">
            <div class="dropup ah-template-dropdown">
                <button class="btn btn-default dropdown-toggle" type="button" data-toggle="dropdown">Использовать шаблон
                <span class="caret"></span></button>
                <ul class="dropdown-menu"><li><a>Загрузка...</a></li></ul>
            </div>
            <button type="submit" class="btn btn-primary pull-right">Отправить</button>
        </div>
    `;

    section.querySelector('.panel-body').appendChild(form);
    this.mainBlock.appendChild(section);

    this.section = section;
    this.shopId = shopId;

    const messageInput = form.querySelector('.ah-message-text-input');

    getShopModerationTemplates()
        .then(response => {
            templates = response;

            const menu = form.querySelector('.ah-template-dropdown .dropdown-menu');
            menu.innerHTML = `
                ${templates.map(
                    item => `<li><a class="ah-template-item" data-id="${item.id}">${item.name}</a></li>`).join('')
                }
            `;
        }, () => {
                const dropdown = form.querySelector('.ah-template-dropdown');
                dropdown.innerHTML = `<span class="text-danger">Произошла техническая ошибка</span>`;
        });


    form.addEventListener('submit', function (e) {
        e.preventDefault();

        const data = new FormData(this);
        const shopId = this.elements.shop_id.value;
        const overlay = this.closest('.ah-shop-moderation-form-panel').querySelector('.ah-overlay');

        if (messageInput.innerText.replace(/\s/g, '') === '') {
            alert('Введите текст сообщения');
            return;
        }

        data.append('text', messageInput.innerHTML);
        overlay.style.display = 'block';
        overlay.focus();

        fetch(`/shops/moderation/send/email/${shopId}`, {
                method: 'post',
                credentials: 'include',
                body: data
            })
            .then(response => {
                if (!response.ok) {
                    overlay.style.display = 'none';
                    return Promise.reject(response);
                }

                form.reset();
                messageInput.innerHTML = '';
                outTextFrame('Письмо успешно отправлено');
                overlay.style.display = 'none';
            }).
            catch(error => alert(`Произошла ошибка:\n${error.status}\n${error.statusText}`));
    });

    messageInput.addEventListener('paste', function(e) {
        e.preventDefault();
        const text = e.clipboardData.getData('text/plain');
        window.document.execCommand('insertText', false, text);
    });

    form.addEventListener('click', function (e) {
        const target = e.target;

        if (target.classList.contains('ah-template-item')) {
            const id = target.dataset.id;
            const template = templates.find(item => item.id === id);
            if (template) {
                const checkboxes = self.mainBlock.querySelectorAll('.ah-shop-moderation-coordination-checkbox');
                const checkboxesText = [].filter.call(checkboxes, item => item.dataset.type === 'text' && item.checked);
                const checkboxesImg = [].filter.call(checkboxes, item => item.dataset.type === 'image' && item.checked);

                messageInput.innerHTML += template.body;

                checkboxesText.forEach(item => {
                    messageInput.innerHTML += `<br><div><b>${item.dataset.sectionName}: ${item.dataset.fieldName}</b><br>${item.dataset.fieldValue.trim()}</div>`;
                });

                checkboxesImg.forEach(item => {
                    const imgWrapper = document.createElement('table');
                    const cellStyle = `
                        font-size:0; 
                        line-height:0; 
                        background-color: #ffffff; 
                        border: 1px solid silver;
                    `;
                    const href = item.dataset.href;
                    const sizePatterns = {
                        logo_photo: /(640x480)|(175x105)/,
                        bg: /1350x3880/
                    };
                    const thumbnail = {
                        href: href,
                        maxWidth: '100px'
                    };

                    if (sizePatterns.logo_photo.test(href)) {
                        thumbnail.href = href.replace(sizePatterns.logo_photo, '100x75');
                    }
                    if (sizePatterns.bg.test(href)) {
                        thumbnail.href = href.replace(sizePatterns.bg, '140x105');
                        thumbnail.maxWidth = '140px';
                    }

                    imgWrapper.cellSpacing = 0;
                    imgWrapper.cellPadding = 0;
                    imgWrapper.width = '100%';
                    imgWrapper.border = 0;
                    imgWrapper.style.cssText = `
                        border-collapse:collapse; 
                        text-align:left;
                    `;
                    imgWrapper.innerHTML = `
                        <tr>
                            <td valign="middle" align="center" width="100" height="75" style="${cellStyle}">
                                <a href="https:${href}" target="_blank" 
                                style="display: block;">
                                    <img style="max-width: ${thumbnail.maxWidth};" alt="Изображение" border="0" src="https:${thumbnail.href}">
                                </a>
                            </td>
                            <td></td>
                        </tr>
                    `;

                    imgWrapper.setAttribute('contenteditable', 'false');
                    messageInput.innerHTML += `<br><div><b>${item.dataset.fieldName}</b><br>${imgWrapper.outerHTML}</div><br>`;
                });
            }
        }
    });
};

ShopModeration.prototype.addCoordinationControls = function () {
    const self = this;
    const shopSection = this.mainBlock.querySelector('section[data-section="shop"]');
    const shopLabels = shopSection.querySelectorAll('.shop-moderation-list-cell_changes .shop-moderation-list-cell-name');

    const photoLabel = [].find.call(shopLabels, label => label.textContent === 'Фотографии');
    const photoField = photoLabel.nextElementSibling;
    const photoPreviews = photoField.querySelectorAll('.images-preview-gallery-item');
    const checkboxPhotoLabel = document.createElement('label');

    const allLabels = this.mainBlock.querySelectorAll('.shop-moderation-list-cell-name');
    const singleImagesLabels = [].filter.call(allLabels, label =>
        (label.textContent === 'Плашка' && label.closest('.shop-moderation-list-cell_changes')) ||
        (label.textContent === 'Логотип' && label.closest('.shop-moderation-list-cell_changes')) ||
        (label.textContent === 'Фон' && label.closest('.shop-moderation-list-cell_original'))
    );

    this.pseudoInputsChanged.forEach(item => {
        const cellName = item.closest('.shop-moderation-list-cell').querySelector('.shop-moderation-list-cell-name');
        const fieldName = (cellName.textContent === 'Information line') ? 'Информационная строка' : cellName.textContent;
        const fieldValue = item.innerHTML.replace(this.patterns.inputChangedValue,'');
        const sectionName = cellName.closest('.shop-moderation-section').dataset.section;
        const checkboxLabel = document.createElement('label');
        let sectionNameFormatted = '';

        switch (sectionName) {
            case 'shop':
                sectionNameFormatted = 'Информация о магазине';
                break;
            case 'delivery':
                sectionNameFormatted = 'Информация о доставке';
                break;
            case 'payment':
                sectionNameFormatted = 'Информация об оплате';
                break;
            case 'url':
                sectionNameFormatted = 'Информация об URL';
                break;
        }

        checkboxLabel.className = 'ah-shop-moderation-label-text';
        checkboxLabel.innerHTML = `
            <input data-field-name="${fieldName}" data-field-value="${fieldValue}" data-section-name="${sectionNameFormatted}"
                data-type="text" type="checkbox" class="ah-shop-moderation-coordination-checkbox">
            ${cellName.firstChild.textContent}
        `;
        cellName.replaceChild(checkboxLabel, cellName.firstChild);
    });

    checkboxPhotoLabel.className = 'ah-shop-moderation-label-text';
    checkboxPhotoLabel.innerHTML = `
        <input type="checkbox" class="ah-shop-moderation-check-all-photos">
        ${photoLabel.firstChild.textContent}
    `;
    photoLabel.replaceChild(checkboxPhotoLabel, photoLabel.firstChild);

    photoPreviews.forEach(item => {
        const imgLink = item.querySelector('.images-preview-gallery-item-image');

        if (!imgLink) return;

        const imgHref = imgLink.getAttribute('href');
        const checkboxLabel = document.createElement('label');

        checkboxLabel.className = 'ah-shop-moderation-label-image';
        checkboxLabel.innerHTML = `
            <input data-href="${imgHref}" data-field-name="Фотография" data-type="image"
                type="checkbox" class="ah-shop-moderation-coordination-checkbox ah-photo-preview-checkbox">
        `;
        item.appendChild(checkboxLabel);
    });

    singleImagesLabels.forEach(label => {
        const fieldName = label.textContent;
        const fieldParent = label.parentNode;
        const imgLink = fieldParent.querySelector('.images-preview-gallery-item-image');

        if (!imgLink) return;

        const imgHref = imgLink.getAttribute('href');
        const checkboxLabel = document.createElement('label');

        checkboxLabel.className = 'ah-shop-moderation-label-text';
        checkboxLabel.innerHTML = `
            <input data-href="${imgHref}" data-field-name="${fieldName}" data-type="image"
                type="checkbox" class="ah-shop-moderation-coordination-checkbox">
            ${label.firstChild.textContent}
        `;

        label.replaceChild(checkboxLabel, label.firstChild);
    });

    this.mainBlock.addEventListener('change', function (e) {
        const target = e.target;
        const allPhotoCheckboxes = document.querySelectorAll('.ah-photo-preview-checkbox');

        if (target.classList.contains('ah-shop-moderation-check-all-photos')) {
            if (target.checked) {
                allPhotoCheckboxes.forEach(item => item.checked = true);
            } else {
                allPhotoCheckboxes.forEach(item => item.checked = false);
            }
        }

        if (target.classList.contains('ah-photo-preview-checkbox')) {
            const all = allPhotoCheckboxes;
            const checked = [].filter.call(allPhotoCheckboxes, item => item.checked);
            const checkAllCheckbox = self.mainBlock.querySelector('.ah-shop-moderation-check-all-photos');

            if (all.length === checked.length) {
                checkAllCheckbox.checked = true;
                checkAllCheckbox.indeterminate = false;
            }

            if (all.length > checked.length) {
                checkAllCheckbox.checked = false;
                checkAllCheckbox.indeterminate = true;
            }

            if (checked.length === 0) {
                checkAllCheckbox.checked = false;
                checkAllCheckbox.indeterminate = false;
            }
        }
    });
};

ShopModeration.prototype.addBrief = function () {
    const self = this;
    const infoPanel = document.createElement('div');
    const panelBody = document.createElement('div');
    const fieldsInfoSection = document.createElement('section');
    const keyWordsSection = document.createElement('section');
    const commentsSection = document.createElement('section');

    infoPanel.className = 'panel panel-info ah-shop-moderation-info-panel';
    infoPanel.innerHTML = `<div class="panel-heading"><h4>Сводка</h4></div>`;

    panelBody.className = 'panel-body';

    fieldsInfoSection.innerHTML = `<span class="text-muted">Загрузка...</span>`;
    commentsSection.innerHTML = `<span class="text-muted">Загрузка...</span>`;
    keyWordsSection.innerHTML = `<span class="text-muted">Загрузка...</span>`;

    panelBody.appendChild(fieldsInfoSection);
    panelBody.appendChild(keyWordsSection);
    panelBody.appendChild(commentsSection);
    infoPanel.appendChild(panelBody);
    this.section.appendChild(infoPanel);

    getShopInfo(this.shopId)
        .then(response => {
            const info = getParamsShopInfo($(response));
            renderFieldsInfo(info);
            renderComments(info);
        }, error => {
            fieldsInfoSection.innerHTML = `
                <span class="text-danger">Произошла ошибка: ${error.status}<br>${error.statusText}</span>
            `;
        });

    getShopRegexp()
        .then(regs => {
            renderKeyWords(regs);
        }, () => {
            keyWordsSection.innerHTML = `
                <span class="text-danger">Произошла техническая ошибка</span>
            `;
        });

    function renderFieldsInfo(shop) {
        const shopSection = self.mainBlock.querySelector('.shop-moderation-section[data-section="shop"]');
        const shopLabelsOriginal = shopSection.querySelectorAll('.shop-moderation-list-cell_original .shop-moderation-list-cell-name');
        const shopNameLabel = [].find.call(shopLabelsOriginal, label => label.textContent === 'Название');
        const shopNameValue = shopNameLabel.nextElementSibling.textContent;
        const shopDomainLabel = [].find.call(shopLabelsOriginal, label => label.textContent === 'Домен');
        const shopDomainValue = shopDomainLabel.nextElementSibling.textContent;
        const shopVideoLabel = [].find.call(shopLabelsOriginal, label => label.textContent === 'Видео URL');
        const shopVideoValue = shopVideoLabel.nextElementSibling.textContent.trim();

        const urlSection = self.mainBlock.querySelector('.shop-moderation-section[data-section="url"]');
        const urlLabelsOriginal = urlSection.querySelectorAll('.shop-moderation-list-cell_original .shop-moderation-list-cell-name');
        const urlSiteLabel = [].find.call(urlLabelsOriginal, label => label.textContent === 'URL');
        const urlSiteValue = urlSiteLabel.nextElementSibling.textContent;

        fieldsInfoSection.innerHTML = `
            <h4>Поля</h4>
            <table class="ah-shop-moderation-info-table">
                <tr>
                    <td>Тариф</td>
                    <td>${shop.mainInfo.tariff}</td>
                </tr>
                <tr>
                    <td>Персональный менеджер</td>
                    <td>${shop.personalManager}</td>
                </tr>
                <tr>
                    <td>Название</td>
                    <td>${shopNameValue}</td>
                </tr>
                <tr>
                    <td>Домен</td>
                    <td>${shopDomainValue}</td>
                </tr>
                <tr>
                    <td>Видео URL</td>
                    <td>${(shopVideoValue) ? 
                        `<a target="_blank" href="${shopVideoValue}">${shopVideoValue}</a>` 
                        : '<i class="text-muted">Отсутствует</i>'}</td>
                </tr>
                <tr>
                    <td>Сайт</td>
                    <td><a target="_blank" href="${urlSiteValue}">${urlSiteValue}</a></td>
                </tr>
                <tr>
                    <td>Пользователь</td>
                    <td>
                        <a target="_blank" href="/users/user/info/${shop.mainInfo.userId}">${shop.mainInfo.userId}</a> |
                        <span>${JSON.parse(self.mainBlock.dataset.emails).user}</span>
                    </td>
                </tr>
            </table>
        `;
    }

    function renderComments(info) {
        const table = info.commentsTable;

        table.removeAttribute('id');
        table.className = 'table table-striped';

        commentsSection.innerHTML = `
            <h4>Комментарии</h4>
            <form method="post" action="/comment">
                <input type="hidden" name="objectTypeId" value="3">
                <input type="hidden" name="objectId" value="${self.mainBlock.dataset.shopId}">
                <div class="form-group">
                    <textarea class="form-control" name="comment" rows="3"></textarea>
                </div>
                <div class="form-group text-right"> 
                    <button type="submit" class="btn btn-success" value="Добавить">
                        <i class="glyphicon glyphicon-plus"></i> Добавить
                    </button>      
                </div>
            </form>
            <div class="table-scroll">${table.outerHTML}</div>
        `;
    }

    function renderKeyWords(regs) {
        const table = document.createElement('table');

        table.className = 'ah-shop-moderation-info-table';
        keyWordsSection.innerHTML = `
            <h4>Ключевые слова и фразы</h4>
        `;
        keyWordsSection.appendChild(table);

        self.pseudoInputsChanged.forEach(item => {
            const cellName = item.closest('.shop-moderation-list-cell').querySelector('.shop-moderation-list-cell-name');
            const fieldName = cellName.textContent.trim();
            const fieldValue = item.innerHTML.replace(self.patterns.inputChangedValue,'').trim();
            const sectionName = cellName.closest('.shop-moderation-section').dataset.section;
            let matchArr = [];

            regs.forEach(reg => {
                const regObj = new RegExp(reg.true_reg, "gi");
                let result;

                while (result = regObj.exec(fieldValue)) {
                    matchArr.push({
                        value: result[0]
                    });
                }
            });

            if (matchArr.length !== 0) {
                const row = document.createElement('tr');
                const alert = document.createElement('div');
                let sectionNameFormatted = '';

                switch (sectionName) {
                    case 'shop':
                        sectionNameFormatted = 'магазин';
                        break;
                    case 'delivery':
                        sectionNameFormatted = 'доставка';
                        break;
                    case 'payment':
                        sectionNameFormatted = 'оплата';
                        break;
                    case 'url':
                        sectionNameFormatted = 'URL';
                        break;
                }

                row.className = 'ah-shop-moderation-scrollable-row';
                row.setAttribute('data-section-name', sectionName);
                row.setAttribute('data-field-name', fieldName);
                row.innerHTML = `
                    <td>${fieldName} (${sectionNameFormatted})</td>
                    <td>${matchArr.map(item => `<span>${item.value}</span>`).join(' | ')}</td>
                `;
                table.appendChild(row);

                alert.className = 'alert alert-warning ah-shop-moderation-matched-container';
                alert.innerHTML = `${matchArr.map(item => `<span>${item.value}</span>`).join(' | ')}`;
                item.parentNode.appendChild(alert);
            }
        });
    }

    keyWordsSection.addEventListener('click', function(e) {
        const target = e.target;

        if (target.closest('.ah-shop-moderation-scrollable-row')) {
            try {
                const row = target.closest('.ah-shop-moderation-scrollable-row');
                const section = self.mainBlock.querySelector(`.shop-moderation-section[data-section="${row.dataset.sectionName}"]`);
                const allLabels = section.querySelectorAll('.shop-moderation-list-cell_changes .shop-moderation-list-cell-name');
                const targetLabel = [].find.call(allLabels, label => label.textContent.trim() === row.dataset.fieldName);
                const targetField = targetLabel.closest('.shop-moderation-list-row');
                scrollToElem(targetField);
            } catch (e) {
                alert(`Произошла техническая ошибка`);
            }
        }
    })
};