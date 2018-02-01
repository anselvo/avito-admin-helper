function ShopModeration() {
    this.mainBlock = document.querySelector('.shop-moderation');
    this.pseudoInputsChanged = this.mainBlock.querySelectorAll('.shop-moderation-list-cell_changes .pseudo-input');
    this.patterns = {
        inputChangedValue: /(<del>[\s\S][^>]+>)|(<[^>]+>)/gi
    };
    this.shopId = this.mainBlock.dataset.shopId;
}

ShopModeration.prototype.addMailForm = function () {
    const self = this;
    const fixedContainer = document.createElement('div');
    const modal = document.createElement('div');
    const form = document.createElement('form');
    const managerEmail = JSON.parse(this.mainBlock.dataset.emails).manager;
    const isManagerField = !managerEmail;

    let templates = {};

    fixedContainer.className = 'ah-shop-moderation-mail-controls';
    fixedContainer.innerHTML = `
        <div class="btn-group">
            <button class="btn btn-default ah-shop-moderation-mail-btn" data-toggle="tooltip" title="Alt+Q" data-container="body">
                <span class="glyphicon glyphicon-envelope"></span>
            </button>
            <div class="btn-group dropup ah-template-dropdown">
                <button class="btn btn-default dropdown-toggle" type="button" data-toggle="dropdown">Использовать шаблон
                <span class="caret"></span></button>
                <ul class="dropdown-menu dropdown-menu-right"><li><a>Загрузка...</a></li></ul>
            </div>
        </div>
    `;

    modal.className = 'modal fade';
    modal.setAttribute('tabindex', '-1');
    modal.innerHTML = `
        <div class="modal-dialog modal-lg">
            <div class="modal-content ah-shop-moderation-form-content">
                <div class="modal-header">
                    <button type="button" class="close" data-dismiss="modal">&times;</button>
                    <h4 class="modal-title">Отправка письма</h4>
                </div>
                <div class="modal-body"></div>
                <div class="ah-overlay dark" tabindex="1">
                    <span class="ah-overlay-text">Выполняется отправка...</span>
                </div>
          </div>
        </div>
    `;

    form.className = 'ah-shop-moderation-mail-form';
    form.innerHTML += `
        <div class="form-group">
            <label>Текст сообщения</label>
            <div contenteditable="true" class="form-control ah-message-text-input"></div>
        </div>
        <div class="clearfix">
            <button type="submit" class="btn btn-primary pull-right">Отправить</button>
        </div>
    `;

    modal.querySelector('.modal-body').appendChild(form);
    this.mainBlock.appendChild(modal);
    document.body.appendChild(fixedContainer);
    setFixedElemUnderFooter(fixedContainer, 0);

    const messageInput = form.querySelector('.ah-message-text-input');

    getShopModerationTemplates()
        .then(response => {
            templates = response;

            const menu = fixedContainer.querySelector('.ah-template-dropdown .dropdown-menu');
            menu.innerHTML = `
                ${templates.map(
                    item => `
                        <li class="ah-template-list-row">
                            <label class="ah-template-label"><input type="checkbox" data-id="${item.id}"></label>
                            <a class="ah-template-item" data-id="${item.id}">${item.name}</a>
                        </li>
                    `)
                    .join('')
                }
            `;

            const controls = document.createElement('li');
            controls.className = 'ah-template-controls';
            controls.innerHTML = `
                <button class="btn btn-primary ah-template-accept-btn">Применить</button>
            `;
            menu.appendChild(controls);

        }, () => {
                const dropdown = fixedContainer.querySelector('.ah-template-dropdown');
                dropdown.innerHTML = `<span class="text-danger">Произошла техническая ошибка</span>`;
        });

    // все менеджеры
    const managerEmailFormGroup = document.createElement('div');
    const managerLabel = document.createElement('label');
    const managerInput = document.createElement('input');
    const loader = document.createElement('div');

    managerEmailFormGroup.className = 'form-group';

    managerLabel.textContent = 'Персональный менеджер';

    managerInput.type = 'email';
    managerInput.name = 'manager_email';
    managerInput.placeholder = 'Введите email';
    managerInput.hidden = true;

    loader.className = 'text-muted';
    loader.innerHTML = `Загрузка...`;

    managerEmailFormGroup.appendChild(managerLabel);
    managerEmailFormGroup.appendChild(managerInput);
    managerEmailFormGroup.appendChild(loader);

    if (isManagerField) {
        form.insertBefore(managerEmailFormGroup, form.firstChild);

        getShopManagers()
            .then( response => {
                try {
                    renderShopManagersSearch(response);
                } catch (e) {
                    handleShopManagersSearchError(e);
                }
            }, error => {
                const statusText = error.statusText ? `, ${error.statusText}`: '';
                handleShopManagersSearchError(error.status + statusText);
            })
            .then(() => loader.remove());
    }

    // обработать ошибку функции поиска менеджеров
    function handleShopManagersSearchError(errorMsg) {
        managerLabel.setAttribute('for', 'ahManagerEmail');
        managerInput.id = 'ahManagerEmail';
        managerInput.hidden = false;
        managerInput.className = 'form-control';

        const tooltip = document.createElement('span');
        tooltip.className = 'text-danger ah-shop-moderation-tooltip-error';
        tooltip.innerHTML = `Не удалось сформировать список <span class="glyphicon glyphicon-info-sign"></span>`;

        $(tooltip).tooltip({
            container: 'body',
            placement: 'left',
            title: errorMsg
        });

        managerLabel.insertAdjacentElement('afterend', tooltip);
    }

    // отрисовать поиск менеджеров
    function renderShopManagersSearch(response) {
        const searchDropdown = document.createElement('div');
        const searchDropdownInputGroup = document.createElement('div');
        const searchDropdownInput = document.createElement('input');
        const searchDropdownTooltip = document.createElement('span');

        const toggleBtn = document.createElement('button');
        const togglePlaceholder = document.createElement('span');
        const resetBtn = document.createElement('button');
        const manualBtn = document.createElement('button');

        const managersList = document.createElement('ul');
        const selectedListItemTooltip = document.createElement('span');

        searchDropdown.className = 'dropdown ah-search-dropdown';

        searchDropdownInputGroup.className = 'input-group hidden';

        searchDropdownInput.className = 'form-control ah-search-dropdown__search-input';
        searchDropdownInput.type = 'text';
        searchDropdownInput.autocomplete = 'off';
        searchDropdownInput.placeholder = 'Поиск';

        searchDropdownTooltip.className = 'ah-search-dropdown__tooltip input-group-addon';
        searchDropdownTooltip.innerHTML = `
            <kbd>↑</kbd>
            <kbd>↓</kbd>
             - навигация,
            <kbd>Tab</kbd> - отмена
        `;

        searchDropdownInputGroup.appendChild(searchDropdownInput);
        searchDropdownInputGroup.appendChild(searchDropdownTooltip);

        toggleBtn.className = 'btn btn-default btn-block dropdown-toggle ah-search-dropdown__toggle ah-search-dropdown__toggle_not-checked ';
        toggleBtn.type = 'button';
        toggleBtn.setAttribute('data-toggle', 'dropdown');

        togglePlaceholder.innerHTML = 'Не выбрано';
        togglePlaceholder.className = 'ah-search-dropdown__toggle-placeholder';

        toggleBtn.appendChild(togglePlaceholder);
        toggleBtn.insertAdjacentHTML('beforeend', `<span class="caret"></span>`);

        resetBtn.className = 'btn btn-default ah-search-dropdown__reset';
        resetBtn.type = 'button';
        resetBtn.innerHTML = `<span class="glyphicon glyphicon-remove"></span>`;

        manualBtn.className = 'btn btn-default ah-search-dropdown__manual';
        manualBtn.type = 'button';
        manualBtn.innerHTML = `<span class="glyphicon glyphicon-pencil"></span>`;

        managersList.className = 'dropdown-menu ah-search-dropdown__list';
        managersList.innerHTML = response.reduce((html, item) => {
            html += getListItem(item);
            return html;
        }, '');

        selectedListItemTooltip.className = 'ah-search-dropdown__list-item-tooltip';
        selectedListItemTooltip.innerHTML = `<kbd>Enter</kbd> - выбрать`;

        searchDropdown.appendChild(searchDropdownInputGroup);
        searchDropdown.appendChild(toggleBtn);
        searchDropdown.appendChild(resetBtn);
        searchDropdown.appendChild(manualBtn);

        managerEmailFormGroup.appendChild(searchDropdown);

        // ручной режим
        const managerInputGroup = document.createElement('div');
        const managerInputGroupBtn = document.createElement('span');
        const listBtn = document.createElement('button');

        managerInputGroup.className = 'input-group hidden ah-shop-moderation__manager-input-group';
        managerInputGroupBtn.className = 'input-group-btn';

        listBtn.className = 'btn btn-default ah-shop-moderation__manager-list';
        listBtn.type = 'button';
        listBtn.innerHTML = `<span class="glyphicon glyphicon-list"></span>`;

        managerInputGroupBtn.appendChild(listBtn);

        managerInputGroup.appendChild(managerInput);
        managerInputGroup.appendChild(managerInputGroupBtn);
        managerEmailFormGroup.appendChild(managerInputGroup);

        // tooltips
        $(manualBtn).tooltip({
            title: 'Ввести email вручную',
            container: 'body',
            placement: 'left'
        });
        $(listBtn).tooltip({
            title: 'Выбрать из списка',
            container: 'body',
            placement: 'left'
        });

        // отследить открыт/закрыт дропдаун
        const searchDropdownObserver = new MutationObserver(function(mutations) {
            mutations.forEach(mutation => {
                const isOpen = mutation.target.classList.contains('open');

                if (isOpen) {
                    toggleBtn.classList.add('hidden');
                    resetBtn.classList.add('hidden');
                    manualBtn.classList.add('hidden');
                    searchDropdownInputGroup.classList.remove('hidden');
                    searchDropdownInput.focus();
                    searchDropdown.appendChild(managersList);
                    handleListNavigation();
                } else {
                    searchDropdownInputGroup.classList.add('hidden');
                    searchDropdownInput.value = '';
                    searchDropdownInput.dispatchEvent(new Event('input'));
                    toggleBtn.classList.remove('hidden');
                    resetBtn.classList.remove('hidden');
                    manualBtn.classList.remove('hidden');
                    managersList.remove();
                    toggleBtn.focus();
                }
            });
        });

        searchDropdownObserver.observe(searchDropdown, {attributes: true, attributeFilter: ['class']});

        // отследить изменение свойства value у инпута
        searchDropdown.addEventListener('managerValueChange', function() {
            const value = managerInput.value;
            if (value === '') {
                togglePlaceholder.innerHTML = 'Не выбрано';
                toggleBtn.classList.add('ah-search-dropdown__toggle_not-checked');
            } else {
                const name = managerInput.dataset.name;
                togglePlaceholder.innerHTML = `${name}, <span class="text-muted">${value}</span>`;
                toggleBtn.classList.remove('ah-search-dropdown__toggle_not-checked');
            }
        });

        // автокомплит при вводе символов
        searchDropdownInput.addEventListener('input', function() {
            const value = this.value;

            if (value === '') {
                managersList.innerHTML = response.reduce((html, item) => {
                    html += getListItem(item);
                    return html;
                }, '');
            } else {
                managersList.innerHTML = response.reduce((html, item) => {
                    if (~item.name.toLowerCase().indexOf(value.toLowerCase())) {
                        html += getListItem(item);
                    }

                    return html;
                }, '');
            }

            handleListNavigation();
            checkListScroll();
        });

        // горячие клавиши
        searchDropdownInput.addEventListener('keydown', e => {
            const selected = managersList.querySelector('.ah-search-dropdown__list-item_selected');

            if (selected) {
                switch (e.keyCode) {
                    case 40: // вниз
                        e.preventDefault();
                        const next = selected.nextElementSibling;
                        if (next) {
                            selected.classList.remove('ah-search-dropdown__list-item_selected');
                            addSelectedListItemTooltip(next);
                        }
                        checkListScroll();
                        break;

                    case 38: // вверх
                        e.preventDefault();
                        const prev = selected.previousElementSibling;
                        if (prev) {
                            selected.classList.remove('ah-search-dropdown__list-item_selected');
                            addSelectedListItemTooltip(prev);
                        }
                        checkListScroll();
                        break;

                    case 13: // enter
                        const firstItem = selected.querySelector('.ah-search-dropdown__list-value');
                        firstItem.dispatchEvent(new Event('click', {bubbles: true}));
                        break;
                }
            }

            if (e.keyCode === 13) { // enter (отменить сабмит формы)
                e.preventDefault();
            }

            if (e.keyCode === 27) { // esc (не закрывать модальное окно)
                e.stopPropagation();
            }

            if (e.keyCode === 9) { // tab (отменить фокус на след элемент и скрыть поиск)
                e.preventDefault();
                searchDropdown.classList.remove('open');
            }
        });

        // выбор менеджера
        searchDropdown.addEventListener('click', e => {
            const target = e.target;

            // пункт списка
            if (target.closest('.ah-search-dropdown__list-value')) {
                const item = target.closest('.ah-search-dropdown__list-value');
                managerInput.value = item.dataset.email;
                managerInput.setAttribute('data-name', item.dataset.name);
                dispatchManagerValueChange();
            }

            // сброс
            if (target.closest('.ah-search-dropdown__reset')) {
                managerInput.value = '';
                dispatchManagerValueChange();
            }

            // ручной ввод
            if (target.closest('.ah-search-dropdown__manual')) {
                searchDropdown.classList.add('hidden');
                managerInput.hidden = false;
                managerInput.className = 'form-control';
                managerInputGroup.classList.remove('hidden');
                managerInput.value = '';
                dispatchManagerValueChange();
            }
        });

        // обновлять плейсхолдер у дропдауна
        form.addEventListener('reset', function() {
            managerInput.value = '';
            dispatchManagerValueChange();
        });

        // переход к списку менеджеров
        listBtn.addEventListener('click', function () {
            searchDropdown.classList.remove('hidden');
            managerInputGroup.classList.add('hidden');
            managerInput.value = '';
            dispatchManagerValueChange();
        });

        // получить элемент списка
        function getListItem(item) {
            return `
                <li class="ah-search-dropdown__list-item">
                    <a class="ah-search-dropdown__list-value" data-email="${item.email}" data-name="${item.name}">
                        ${item.name}, <span class="text-muted">${item.email}</span>
                    </a>
                </li>
            `;
        }

        // обработать навигацию
        function handleListNavigation() {
            const firstLi = managersList.querySelector('li:first-child');
            if (firstLi) {
                addSelectedListItemTooltip(firstLi);
            }
        }

        // добавить подсказку для выбранного пункта
        function addSelectedListItemTooltip(item) {
            item.classList.add('ah-search-dropdown__list-item_selected');
            item.appendChild(selectedListItemTooltip);
        }

        // проверить скоролл
        function checkListScroll() {
            const selected = managersList.querySelector('.ah-search-dropdown__list-item_selected');
            if (!selected) return;

            const selectedTopPos = selected.offsetTop;
            const selectedBottomPos = selectedTopPos + selected.clientHeight;

            if (selectedBottomPos > (managersList.clientHeight + managersList.scrollTop)) {
                managersList.scrollTop = selectedBottomPos - managersList.clientHeight;
            }

            if (selectedTopPos < managersList.scrollTop) {
                managersList.scrollTop = selectedTopPos;
            }
        }

        // отправить событие изменения инпута
        function dispatchManagerValueChange() {
            const event = new Event('managerValueChange');
            searchDropdown.dispatchEvent(event);
        }
    }

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        const data = new FormData(this);
        const overlay = this.closest('.ah-shop-moderation-form-content').querySelector('.ah-overlay');
        const textWrapperStyle = `font-size: 14px; line-height: 20px; font-family: Arial,Helvetica,sans-serif;`;

        if (messageInput.innerText.replace(/\s/g, '') === '') {
            alert('Введите текст сообщения');
            return;
        }

        let userId;
        try {
            userId = self.parsedInfo.shop.mainInfo.userId;
        } catch (e) {
            alert('Не удалось определить ID пользователя. Возможно, информация еще не загрузилась или произошла ошибка. Проверьте Сводку.\nВ случае ошибки, перезагрузите страницу');
            return;
        }

        data.append('text', `<hr><div style="${textWrapperStyle}"><div style="color: #8c8c8c">ID Пользователя: ${userId}</div><br>${messageInput.innerHTML}</div>`);

        overlay.style.display = 'block';
        overlay.focus();

        fetch(`/shops/moderation/send/email/${self.shopId}`, {
                method: 'post',
                credentials: 'include',
                body: data
            })
            .then(response => {
                if (!response.ok) {
                    return Promise.reject(`Произошла ошибка:\n${response.status}\n${response.statusText}`);
                }
                if (response.redirected) {
                    return Promise.reject(`Произошла техническая ошибка`);
                }

                $(modal).modal('hide');
                form.reset();
                messageInput.innerHTML = '';
                outTextFrame('Письмо успешно отправлено');
                overlay.style.display = 'none';
            }).
            catch(error => {
                overlay.style.display = 'none';
                alert(error);
            });
    });

    messageInput.addEventListener('paste', function(e) {
        e.preventDefault();
        const text = e.clipboardData.getData('text/plain');
        window.document.execCommand('insertText', false, text);
    });

    $(fixedContainer.querySelector('.ah-shop-moderation-mail-btn')).tooltip();

    fixedContainer.addEventListener('click', function (e) {
        const target = e.target;

        if (target.closest('.ah-shop-moderation-mail-btn')) {
            $(modal).modal('show');
        }

        if (target.classList.contains('ah-template-item')) {
            const id = target.dataset.id;
            const template = templates.find(item => item.id === id);
            if (template) {
                messageInput.innerHTML += template.body;
                handelTemplateInsert();
                outTextFrame('Шаблон применен');
            }
        }

        if (target.closest('.ah-template-label') || target.closest('.ah-template-controls')) {
            e.stopPropagation();
        }

        if (target.closest('.ah-template-accept-btn')) {
            const dropdown = target.closest('.ah-template-dropdown');
            const menu = dropdown.querySelector('.dropdown-menu');
            const templateCheckboxes = menu.querySelectorAll('.ah-template-label input[type="checkbox"]');
            const templateCheckboxesChecked = [].filter.call(templateCheckboxes, item => item.checked);

            if (templateCheckboxesChecked.length === 0) {
                alert('Ни одного шаблона не выбрано');
                return;
            }

            templateCheckboxesChecked.forEach(item => {
                const id = item.dataset.id;
                const template = templates.find(item => item.id === id);
                if (template) {
                    messageInput.innerHTML += template.body;
                }
                item.checked = false;
            });

            handelTemplateInsert();
            dropdown.classList.remove('open');
            outTextFrame('Шаблоны применены');
        }
    });

    function handelTemplateInsert() {
        const checkboxes = self.mainBlock.querySelectorAll('.ah-shop-moderation-coordination-checkbox');
        const checkboxesText = [].filter.call(checkboxes, item => item.dataset.type === 'text' && item.checked);
        const checkboxesImg = [].filter.call(checkboxes, item => item.dataset.type === 'image' && item.checked);

        checkboxesText.forEach(item => {
            const value = item.dataset.fieldValue.trim().replace(/\n/g, '<br>');
            messageInput.innerHTML += `<div><b>${item.dataset.sectionName}: ${item.dataset.fieldName}</b><br>${value}</div><br>`;

            item.checked = false;
            item.dispatchEvent(new Event('change', {bubbles: true}));
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
                bg: /1350x3880/,
                plank: /984x120/
            };
            const thumbnail = {
                href: href,
                style: 'max-width: 100px;'
            };

            if (sizePatterns.logo_photo.test(href)) {
                thumbnail.href = href.replace(sizePatterns.logo_photo, '100x75');
            }
            if (sizePatterns.bg.test(href)) {
                thumbnail.href = href.replace(sizePatterns.bg, '140x105');
                thumbnail.style = 'max-width: 140px;';
            }

            if (sizePatterns.plank.test(href)) {
                thumbnail.style = 'width: 100px;';
            }

            imgWrapper.cellSpacing = 0;
            imgWrapper.cellPadding = 0;
            imgWrapper.width = '100%';
            imgWrapper.border = 0;
            imgWrapper.style.cssText = `
                        border-collapse: collapse; 
                        text-align: left;
                    `;
            imgWrapper.innerHTML = `
                        <tr>
                            <td valign="middle" align="center" width="100" height="75" style="${cellStyle}">
                                <a href="https:${href}" target="_blank" 
                                style="display: block;">
                                    <img style="${thumbnail.style};" alt="Изображение" border="0" src="https:${thumbnail.href}">
                                </a>
                            </td>
                            <td></td>
                        </tr>
                    `;

            imgWrapper.setAttribute('contenteditable', 'false');
            messageInput.innerHTML += `<div><b>${item.dataset.fieldName}</b><br>${imgWrapper.outerHTML}</div><br><br>`;

            item.checked = false;
            item.dispatchEvent(new Event('change', {bubbles: true}));
        });
    }

    document.addEventListener('keydown', function (e) {
        if (e.altKey && e.keyCode === 'Q'.charCodeAt(0)) {
            e.preventDefault();
            if (modal.classList.contains('in')) {
                $(modal).modal('hide');
            } else {
                $(modal).modal('show');
            }
        }
    });

    // скрыть поиск менеджеров
    $(modal).on('hidden.bs.modal', function() {
        const searchDropdown = modal.querySelector('.ah-search-dropdown');
        if (searchDropdown) {
            searchDropdown.classList.remove('open');
        }
    });
};

ShopModeration.prototype.addCoordinationControls = function () {
    const shopSection = this.mainBlock.querySelector('section[data-section="shop"]');
    const shopLabels = shopSection.querySelectorAll('.shop-moderation-list-cell_changes .shop-moderation-list-cell-name');

    const allLabels = this.mainBlock.querySelectorAll('.shop-moderation-list-cell-name');
    const singleImagesLabels = [].filter.call(allLabels, label =>
        (label.textContent === 'Плашка' && label.closest('.shop-moderation-list-cell_changes')) ||
        (label.textContent === 'Логотип' && label.closest('.shop-moderation-list-cell_changes')) ||
        (label.textContent === 'Фон' && label.closest('.shop-moderation-list-cell_original'))
    );

    const passAllBtn = this.mainBlock.querySelector('.js-pass-all');
    const checkboxGeneralLabel = document.createElement('label');

    // чекбоксы для псевдоинпутов
    this.pseudoInputsChanged.forEach(item => {
        const cellName = item.closest('.shop-moderation-list-cell').querySelector('.shop-moderation-list-cell-name');
        const fieldName = (cellName.textContent === 'Information line') ? 'Информационная строка' : cellName.textContent;
        const fieldValue = item.innerHTML.replace(this.patterns.inputChangedValue,'');
        const sectionName = cellName.closest('.shop-moderation-section').dataset.section;
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

        const checkbox = document.createElement('input');
        const checkboxLabel = document.createElement('label');

        checkbox.type = 'checkbox';
        checkbox.className = 'ah-shop-moderation-coordination-checkbox';
        checkbox.setAttribute('data-type', 'text');
        checkbox.setAttribute('data-field-name', fieldName);
        checkbox.setAttribute('data-field-value', fieldValue);
        checkbox.setAttribute('data-section-name', sectionNameFormatted);

        checkboxLabel.className = 'ah-shop-moderation-label-text';
        checkboxLabel.appendChild(checkbox);
        checkboxLabel.appendChild(document.createTextNode(` ${cellName.firstChild.textContent}`));
        cellName.replaceChild(checkboxLabel, cellName.firstChild);
    });

    // чекбоксы для фото
    try {
        const photoLabel = [].find.call(shopLabels, label => label.textContent === 'Фотографии');
        const photoField = photoLabel.nextElementSibling;
        const photoPreviews = photoField.querySelectorAll('.images-preview-gallery-item');
        const checkboxPhotoLabel = document.createElement('label');

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
            const checkbox = document.createElement('input');
            const checkboxLabel = document.createElement('label');

            checkbox.type = 'checkbox';
            checkbox.className = 'ah-shop-moderation-coordination-checkbox ah-photo-preview-checkbox';
            checkbox.setAttribute('data-type', 'image');
            checkbox.setAttribute('data-field-name', 'Фотография');
            checkbox.setAttribute('data-href', imgHref);

            checkboxLabel.className = 'ah-shop-moderation-label-image';
            checkboxLabel.appendChild(checkbox);
            item.appendChild(checkboxLabel);
        });
    } catch (e){}

    // чекбоксы для одиночных изображений
    singleImagesLabels.forEach(label => {
        const fieldName = label.textContent;
        const fieldParent = label.parentNode;
        const imgLink = fieldParent.querySelector('.images-preview-gallery-item-image');

        if (!imgLink) return;

        const imgHref = imgLink.getAttribute('href');
        const checkbox = document.createElement('input');
        const checkboxLabel = document.createElement('label');

        checkbox.type = 'checkbox';
        checkbox.className = 'ah-shop-moderation-coordination-checkbox';
        checkbox.setAttribute('data-type', 'image');
        checkbox.setAttribute('data-field-name', fieldName);
        checkbox.setAttribute('data-href', imgHref);

        checkboxLabel.className = 'ah-shop-moderation-label-text';
        checkboxLabel.appendChild(checkbox);
        checkboxLabel.appendChild(document.createTextNode(` ${label.firstChild.textContent}`));
        label.replaceChild(checkboxLabel, label.firstChild);
    });

    // общий чекбокс
    checkboxGeneralLabel.className = 'ah-shop-moderation-label-general';
    checkboxGeneralLabel.innerHTML = `
        <input type="checkbox" id="ahCheckboxGeneral">
        Отметить все
    `;
    this.mainBlock.insertBefore(checkboxGeneralLabel, shopSection);

    this.mainBlock.addEventListener('change', function (e) {
        const target = e.target;
        const allCheckboxes = this.querySelectorAll('.ah-shop-moderation-coordination-checkbox');
        const generalCheckbox = document.getElementById('ahCheckboxGeneral');
        const allPhotoCheckboxes = this.querySelectorAll('.ah-photo-preview-checkbox');
        const generalPhotoCheckbox = this.querySelector('.ah-shop-moderation-check-all-photos');

        if (target.getAttribute('id') === 'ahCheckboxGeneral') {
            handleGeneralCheckbox(target, allCheckboxes);
        }

        if (target.classList.contains('ah-shop-moderation-coordination-checkbox')) {
            handleAssociatedCheckboxes(allCheckboxes, generalCheckbox);
        }

        if (target.classList.contains('ah-shop-moderation-check-all-photos')) {
            handleGeneralCheckbox(target, allPhotoCheckboxes);
        }

        if (target.classList.contains('ah-photo-preview-checkbox')) {
            handleAssociatedCheckboxes(allPhotoCheckboxes, generalPhotoCheckbox);
        }

        const allCheckboxesChecked = [].filter.call(allCheckboxes, item => item.checked);
        const iconsUnlocked = this.querySelectorAll('.icon-locked_unlocked');
        if (iconsUnlocked.length === 0) {
            passAllBtn.disabled = allCheckboxesChecked.length > 0;
        }
    });

    // общие чекбоксы
    function handleGeneralCheckbox(general, associated) {
        if (general.checked) {
            associated.forEach(item => {
                item.checked = true;
                item.dispatchEvent(new Event('change', {bubbles: true}));
            });
        } else {
            associated.forEach(item => {
                item.checked = false;
                item.dispatchEvent(new Event('change', {bubbles: true}));
            });
        }
    }

    // чекбоксы, связанные с общим
    function handleAssociatedCheckboxes(associated, general) {
        const checked = [].filter.call(associated, item => item.checked);

        if (associated.length === checked.length) {
            general.checked = true;
            general.indeterminate = false;
        }

        if (associated.length > checked.length) {
            general.checked = true;
            general.indeterminate = true;
        }

        if (checked.length === 0) {
            general.checked = false;
            general.indeterminate = false;
        }
    }
};

ShopModeration.prototype.addBrief = function () {
    const self = this;
    const shopSection = this.mainBlock.querySelector('.shop-moderation-section[data-section="shop"]');

    const section = document.createElement('section');
    const infoPanel = document.createElement('div');
    const panelBody = document.createElement('div');

    const leftColumn = document.createElement('div');
    const middleColumn = document.createElement('div');
    const rightColumn = document.createElement('div');

    const fieldsInfo = document.createElement('div');
    const keyWords = document.createElement('div');
    const companyInfo = document.createElement('div');
    const commentsInfo = document.createElement('div');

    const parsedInfo = {};
    this.parsedInfo = parsedInfo;
    // фикс верстки админки
    if (shopSection) {
        const stickyHolder = shopSection.querySelector('.shop-moderation-buttons-holder_sticky');
        const list = shopSection.querySelector('.shop-moderation-list');
        if (stickyHolder && list) {
            stickyHolder.style.cssText = `margin: 0 auto`;
            list.style.cssText = `margin-top: -90px`;
        }
    }

    section.className = 'ah-shop-moderation-section';

    infoPanel.className = 'panel panel-info ah-shop-moderation-info-panel';
    infoPanel.innerHTML = `<div class="panel-heading"><h4>Сводка</h4></div>`;

    panelBody.className = 'ah-panel-body';

    leftColumn.className = 'ah-column';
    middleColumn.className = 'ah-column ah-column-middle';
    rightColumn.className = 'ah-column';

    fieldsInfo.innerHTML = `<h4>Поля</h4><span class="text-muted">Загрузка...</span>`;
    commentsInfo.innerHTML = `<h4>Комментарии</h4><span class="text-muted">Загрузка...</span>`;
    keyWords.innerHTML = `<h4>Ключевые слова и фразы</h4><span class="text-muted">Загрузка...</span>`;
    companyInfo.innerHTML = `
        <table class="ah-shop-moderation-info-table">
        <caption>Информация о компании</caption>
            <tr><td class="text-muted">Загрузка...</td></tr>
        </table>
    `;

    leftColumn.appendChild(fieldsInfo);
    leftColumn.appendChild(companyInfo);
    middleColumn.appendChild(keyWords);
    rightColumn.appendChild(commentsInfo);

    panelBody.appendChild(leftColumn);
    panelBody.appendChild(middleColumn);
    panelBody.appendChild(rightColumn);

    infoPanel.appendChild(panelBody);
    section.appendChild(infoPanel);
    this.mainBlock.insertBefore(section, this.mainBlock.firstChild);

    getShopInfo(this.shopId)
        .then(response => {
            const info = getParamsShopInfo($(response));
            renderFieldsInfo(info);
            renderComments(info);
            parsedInfo.shop = info;
            return info;
        }, error => {
            fieldsInfo.innerHTML = `
                <h4>Поля</h4><span class="text-danger">Произошла ошибка: ${error.status}<br>${error.statusText}</span>
            `;
            commentsInfo.innerHTML = `
                <h4>Комментарии</h4><span class="text-danger">Произошла ошибка: ${error.status}<br>${error.statusText}</span>
            `;
            companyInfo.innerHTML = `
                <table class="ah-shop-moderation-info-table">
                <caption>Информация о компании</caption>
                    <tr><td class="text-danger">Произошла ошибка: ${error.status}<br>${error.statusText}</td></tr>
                </table>
            `;
            return Promise.reject(error);
        })
        .then(shopInfo => {
            return getUserInfo(shopInfo.mainInfo.userId);
        })
        .then(response => {
            const userInfo = getParamsUserInfo($(response));
            renderCompanyInfo(userInfo);
            renderPersonalManagerEdit(userInfo);
        }, error => {
            companyInfo.innerHTML = `
                <table class="ah-shop-moderation-info-table">
                <caption>Информация о компании</caption>
                    <tr><td class="text-danger">Произошла ошибка: ${error.status}<br>${error.statusText}</td></tr>
                </table>
            `;
        });

    getShopRegexp()
        .then(regs => {
            renderKeyWords(regs);
        }, () => {
            keyWords.innerHTML = `
                <h4>Ключевые слова и фразы</h4><span class="text-danger">Произошла техническая ошибка</span>
            `;
        });

    function renderFieldsInfo(shop) {
        const shopSection = self.mainBlock.querySelector('.shop-moderation-section[data-section="shop"]');
        const shopLabelsOriginal = shopSection.querySelectorAll('.shop-moderation-list-cell_original .shop-moderation-list-cell-name');
        const shopNameLabel = [].find.call(shopLabelsOriginal, label => label.textContent === 'Название');
        const shopNameValue = shopNameLabel.nextElementSibling.querySelector('.pseudo-input').textContent;
        const shopDomainLabel = [].find.call(shopLabelsOriginal, label => label.textContent === 'Домен');
        const shopDomainValue = shopDomainLabel.nextElementSibling.querySelector('.pseudo-input').textContent;
        const shopVideoLabel = [].find.call(shopLabelsOriginal, label => label.textContent === 'Видео URL');
        const shopVideoValue = shopVideoLabel.nextElementSibling.querySelector('.pseudo-input').textContent.trim();

        const urlSection = self.mainBlock.querySelector('.shop-moderation-section[data-section="url"]');
        const urlLabelsOriginal = urlSection.querySelectorAll('.shop-moderation-list-cell_original .shop-moderation-list-cell-name');
        const urlSiteLabel = [].find.call(urlLabelsOriginal, label => label.textContent === 'URL');
        const urlSiteValue = urlSiteLabel.nextElementSibling.querySelector('.pseudo-input').textContent;

        const userEmail = JSON.parse(self.mainBlock.dataset.emails).user;

        fieldsInfo.innerHTML = `
            <h4>Поля</h4>
            <table class="ah-shop-moderation-info-table">
                <tr>
                    <td>Тариф</td>
                    <td>${shop.mainInfo.tariff}</td>
                </tr>
                <tr>
                    <td>Персональный менеджер</td>
                    <td class="ah-personal-manager-cell">${shop.personalManager}</td>
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
                        <a target="_blank" href="/users/user/info/${shop.mainInfo.userId}">${shop.mainInfo.userId}</a>
                        <span class="glyphicon glyphicon-copy ah-copy-btn" data-copy="${shop.mainInfo.userId}" 
                            title="Скопировать ID пользователя"></span> |
                        <span>${userEmail}</span>
                        <span class="glyphicon glyphicon-copy ah-copy-btn" data-copy="${userEmail}" 
                            title="Скопировать E-mail пользователя"></span>
                    </td>
                </tr>
            </table>
        `;
    }

    function renderComments(info) {
        let comments;

        if (info.commentsTable) {
            comments = document.createElement('div');
            comments.className = 'table-scroll';
            info.commentsTable.removeAttribute('id');
            info.commentsTable.className = 'table table-striped';
            comments.appendChild(info.commentsTable);
        } else {
            comments = document.createElement('div');
            comments.innerHTML = `<span class="text-muted">Комментарии отсутствуют</span>`;
        }

        commentsInfo.innerHTML = `
            <h4>Комментарии</h4>
            <form method="post" action="/comment">
                <input type="hidden" name="objectTypeId" value="3">
                <input type="hidden" name="objectId" value="${self.shopId}">
                <div class="form-group">
                    <textarea class="form-control ah-shop-comment-field" name="comment" rows="3"></textarea>
                </div>
                <div class="form-group text-right"> 
                    <button type="submit" class="btn btn-success" value="Добавить">
                        <i class="glyphicon glyphicon-plus"></i> Добавить
                    </button>      
                </div>
            </form>
            ${comments.outerHTML}
        `;
    }

    function renderCompanyInfo(user) {
        companyInfo.innerHTML = (user.companyInfo) ? `
            <table class="ah-shop-moderation-info-table">
            <caption>Информация о компании</caption>
                <tr>
                    <td>Название компании</td>
                    <td>${(user.companyInfo.name) ? user.companyInfo.name : `<i class="text-muted">Отсутствует</i>`}</td>
                </tr>
                <tr>
                    <td>ИНН</td>
                    <td>${(user.companyInfo.inn) ? user.companyInfo.inn : `<i class="text-muted">Отсутствует</i>`}</td>
                </tr>
                <tr>
                    <td>Юридический адрес</td>
                    <td>${(user.companyInfo.legaAddress) ? user.companyInfo.legaAddress : `<i class="text-muted">Отсутствует</i>`}</td>
                </tr>
            </table>
        ` : `<table class="ah-shop-moderation-info-table">
            <caption>Информация о компании</caption>
                <tr><td class="text-muted">Отсутствует</td></tr>
            </table>
        `;
    }

    function renderPersonalManagerEdit(user) {
        if (!user.personalManager) return;

        const selectedVal = user.personalManager.selected.value;
        const cell = fieldsInfo.querySelector('.ah-personal-manager-cell');
        cell.innerHTML = `
            <div class="input-group">
                <select class="form-control input-sm" name="managerId">
                    ${user.personalManager.options.map(item => 
                        `<option value="${item.value}" ${(item.value === selectedVal) ? 'selected' : ''}>${item.name}</option>`)
                    .join('')}
                </select>
                <span class="input-group-btn">
                    <button class="btn btn-default btn-sm ah-edit-personal-manager" title="Сохранить" 
                        data-user-id="${parsedInfo.shop.mainInfo.userId}">
                        <span class="glyphicon glyphicon-floppy-save"></span>
                    </button>
                </span>
            </div>
        `;
    }

    function renderKeyWords(regs) {
        const allSections = self.mainBlock.querySelectorAll('.shop-moderation-section');
        const result = document.createElement('div');
        let hasResults = false;

        keyWords.innerHTML = `
            <h4>Ключевые слова и фразы</h4>
        `;
        keyWords.appendChild(result);

        allSections.forEach(section => {
            renderForSection(section, regs);
        });

        function renderForSection(section, regs) {
            const allRows = section.querySelectorAll('.js-shop-moderation-row');
            const sectionName = section.dataset.section;
            const table = document.createElement('table');
            let sectionNameFormatted = sectionName;
            let hasMatches = false;

            switch (sectionName) {
                case 'shop':
                    sectionNameFormatted = 'Магазин';
                    break;
                case 'delivery':
                    sectionNameFormatted = 'Доставка';
                    break;
                case 'payment':
                    sectionNameFormatted = 'Оплата';
                    break;
                case 'url':
                    sectionNameFormatted = 'URL';
                    break;
            }

            table.className = 'ah-shop-moderation-info-table';
            table.innerHTML = `<caption>${sectionNameFormatted}</caption>`;

            allRows.forEach(singleRow => {
                const cells = singleRow.querySelectorAll('.shop-moderation-list-cell');
                const fieldName = cells[0].querySelector('.shop-moderation-list-cell-name').textContent.trim();

                cells.forEach(cell => {
                    const input = cell.querySelector('.pseudo-input');
                    const matched = new Map();
                    let value;
                    let matchedClassName;

                    if (cell.classList.contains('shop-moderation-list-cell_original')) {
                        value = input.innerHTML.trim();
                        matchedClassName = 'text-primary';
                    } else {
                        value = input.innerHTML.replace(self.patterns.inputChangedValue,'').trim();
                        matchedClassName = 'text-danger';
                    }

                    regs.forEach(reg => {
                        const regObj = new RegExp(reg.true_reg, "gi");
                        let result;

                        while (result = regObj.exec(value)) {
                            const resultFormatted = result[0].trim();

                            if (matched.has(resultFormatted)) {
                                matched.set(resultFormatted, matched.get(resultFormatted) + 1);
                            } else {
                                matched.set(resultFormatted, 1);
                            }
                        }
                    });

                    if (matched.size !== 0) {
                        hasMatches = true;
                        const matchedArr = [];
                        const rowExisting = table.querySelector(`.ah-shop-moderation-scrollable-row[data-section-name="${sectionName}"][data-field-name="${fieldName}"]`);

                        matched.forEach((val, key) => {
                            matchedArr.push(`<span class="${matchedClassName}">${key} ${(val > 1) ? `(${val})`: ''}</span>`);
                        });

                        if (rowExisting) {
                            const cell = rowExisting.querySelector('.ah-shop-moderation-matched-cell');
                            cell.innerHTML += ` | ${matchedArr.join(' | ')}`;
                        } else {
                            const row = document.createElement('tr');
                            row.className = 'ah-shop-moderation-scrollable-row';
                            row.setAttribute('data-section-name', sectionName);
                            row.setAttribute('data-field-name', fieldName);
                            row.innerHTML = `
                                <td>${fieldName}</td>
                                <td class="ah-shop-moderation-matched-cell">${matchedArr.join(' | ')}</td>
                            `;
                            table.appendChild(row);
                        }

                        const alert = document.createElement('div');
                        alert.className = 'alert alert-warning ah-shop-moderation-matched-container';
                        alert.innerHTML = `${matchedArr.join(' | ')}`;
                        input.parentNode.appendChild(alert);
                    }
                });
            });

            if (hasMatches) {
                hasResults = true;
                result.appendChild(table);
            }
        }

        if (!hasResults) {
            const message = document.createElement('div');
            message.innerHTML = `<span class="text-muted">Ничего не найдено</span>`;
            result.appendChild(message);
        }
    }

    fieldsInfo.addEventListener('click', function (e) {
        const target = e.target;

        if (target.classList.contains('ah-copy-btn')) {
            const text = target.dataset.copy;
            chrome.runtime.sendMessage( { action: 'copyToClipboard', text: text } );
            outTextFrame(`Скопировано: ${text}`);
        }

        if (target.closest('.ah-edit-personal-manager')) {
            const btn = target.closest('.ah-edit-personal-manager');
            const cell = target.closest('.ah-personal-manager-cell');
            const select = cell.querySelector('[name="managerId"]');
            const userId = btn.dataset.userId;
            const managerId = select.value;

            btnLoaderOn(btn);
            editPersonalManager(userId, +managerId).then(() => {
                    alert(`Операция прошла успешно. Пользователь: ${userId}`);
                }, error => {
                    alert(`Произошла ошибка\n${error.status || ''}\n${error.statusText || ''}`);
                })
                .then(() => btnLoaderOff(btn));
        }
    });

    keyWords.addEventListener('click', function(e) {
        const target = e.target;

        if (target.closest('.ah-shop-moderation-scrollable-row')) {
            try {
                const row = target.closest('.ah-shop-moderation-scrollable-row');
                const section = self.mainBlock.querySelector(`.shop-moderation-section[data-section="${row.dataset.sectionName}"]`);
                const allLabels = section.querySelectorAll('.shop-moderation-list-cell .shop-moderation-list-cell-name');
                const targetLabel = [].find.call(allLabels, label => label.textContent.trim() === row.dataset.fieldName);
                const targetField = targetLabel.closest('.shop-moderation-list-row');
                scrollToElem(targetField);
            } catch (e) {
                alert(`Произошла техническая ошибка`);
            }
        }
    });
};

ShopModeration.prototype.addPageNavigation = function() {
    const navigation = document.createElement('div');
    navigation.className = 'ah-shop-moderation-navigation-container';
    navigation.innerHTML = `
        <div class="btn-group">
            <button type="button" class="btn btn-default btn-lg ah-scroll-btn ah-scroll-top">
                <span class="glyphicon glyphicon-arrow-up"></span>
            </button>
            <button type="button" class="btn btn-default btn-lg ah-scroll-btn ah-scroll-bottom">
                <span class="glyphicon glyphicon-arrow-down"></span>
            </button>
        </div>
    `;
    document.body.appendChild(navigation);

    navigation.addEventListener('click', function(e) {
        let target = e.target;

        while (target !== this) {
            if (target.classList.contains('ah-scroll-top') && !target.disabled) {
                scrollTop();
            }
            if (target.classList.contains('ah-scroll-bottom') && !target.disabled) {
                scrollBottom();
            }

            target = target.parentNode;
        }
    });

    let timerTop;
    function scrollTop() {
        const  top = window.pageYOffset;
        if (top > 0) {
            disableButtons();
            window.scrollBy(0, -150);
            timerTop = setTimeout(scrollTop, 10);
        } else {
            clearTimeout(timerTop);
            enableButtons();
        }
    }

    let timerBottom;
    function scrollBottom() {
        const top = window.pageYOffset;
        const scrollHeight = Math.max(
            document.body.scrollHeight, document.documentElement.scrollHeight,
            document.body.offsetHeight, document.documentElement.offsetHeight,
            document.body.clientHeight, document.documentElement.clientHeight
        );

        if ((scrollHeight - document.documentElement.clientHeight) > top) {
            disableButtons();
            window.scrollBy(0, 150);
            timerBottom = setTimeout(scrollBottom, 10);
        } else {
            clearTimeout(timerBottom);
            enableButtons();
        }
    }

    const buttons = navigation.querySelectorAll('.ah-scroll-btn');
    function disableButtons() {
        buttons.forEach(button => button.disabled = true);
    }

    function enableButtons() {
        buttons.forEach(button => button.disabled = false);
    }
};