function ShopModeration() {
    this.mainBlock = document.querySelector('.shop-moderation');
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
    const allPseudoInputs = this.mainBlock.querySelectorAll('.shop-moderation-list-cell_changes .pseudo-input');
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

    allPseudoInputs.forEach(item => {
        const cellName = item.closest('.shop-moderation-list-cell').querySelector('.shop-moderation-list-cell-name');
        const fieldName = (cellName.textContent === 'Information line') ? 'Информационная строка' : cellName.textContent;
        const fieldValue = item.innerHTML.replace(/(<del>[\s\S][^>]+>)|(<[^>]+>)/gi,'');
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