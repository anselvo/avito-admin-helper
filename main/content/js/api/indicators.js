function AhIndicators(indicatorsArr, container) {
    // init
    let indicators = {
        inn: {
            index: indicatorsArr.indexOf('inn'),
            text: 'ИНН'
        },
        pro: {
            index: indicatorsArr.indexOf('pro'),
            text: 'ЛК Про'
        },
        legalEntity: {
            index: indicatorsArr.indexOf('legalEntity'),
            text: 'Юр. лицо'
        },
        auto: {
            index: indicatorsArr.indexOf('auto'),
            text: 'Автозагрузка'
        },
        shop: {
            index: indicatorsArr.indexOf('shop'),
            text: 'Магазин'
        },
        subscription: {
            index: indicatorsArr.indexOf('subscription'),
            text: 'Подписка'
        },
        persManager: {
            index: indicatorsArr.indexOf('persManager'),
            text: 'Перс. менеджер'
        },
        delivery: {
            index: indicatorsArr.indexOf('delivery'),
            text: 'Avito Доставка'
        },
        onlyBankTransfer: {
            index: indicatorsArr.indexOf('onlyBankTransfer'),
            text: 'Только банк. перевод'
        },
        rePremium: {
            index: indicatorsArr.indexOf('REPremium'),
            text: 'RE Premium'
        },
        extension: {
            index: indicatorsArr.indexOf('extension'),
            text: 'Расширение'
        }
    };

    for (let key in indicators) {
        if (!indicators.hasOwnProperty(key)) continue;
        indicators[key].on = indicators[key].index !== -1;
        indicators[key].node = container.find(`[data-indicator="${indicatorsArr[indicators[key].index]}"]`);
    }

    this.get = function() {
        return indicators;
    };

    let userIndicators;
    let shopIndicators;
    let accountInfoIndicators;

    let shopId, userId;

    this.renderForUser = function(userNode) {
        // check shop
        let shopLink = userNode.find('[href^="/shops/info/view/"]');
        shopId = null;
        if (shopLink.length !== 0) {
            shopId = shopLink.attr('href').replace(/\D/g, '');
        }

        userId = getParamOnUserInfo('user-id', userNode);

        // RENDERING
        userIndicators = new UserInfoIndicators({searchNode: userNode});
        // inn
        if (indicators.inn.on) {
            let info = userIndicators.getInnInfo();
            if (info.isFired) {
                fireUp(indicators.inn);
                addInnStatus(info);
            } else {
                snuffOut(indicators.inn);
            }
        }

        // pro
        if (indicators.pro.on) {
            let info = userIndicators.getProInfo();
            if (info.isFired) {
                fireUp(indicators.pro);
            } else {
                snuffOut(indicators.pro);
            }
        }

        // legalEntity
        if (indicators.legalEntity.on) {
            let info = userIndicators.getLegalEntityInfo();
            if (info.isFired) {
                fireUp(indicators.legalEntity);
            } else {
                snuffOut(indicators.legalEntity);
            }
        }

        // auto
        if (indicators.auto.on) {
            let info = userIndicators.getAutoInfo();
            if (info.isFired) {
                fireUp(indicators.auto);
            } else {
                snuffOut(indicators.auto);
            }
        }

        // shop
        if (indicators.shop.on) {
            let info = userIndicators.getShopInfo();
            if (info.isFired) {
                fireUp(indicators.shop);
            } else {
                snuffOut(indicators.shop);
            }
        }

        // subscription
        if (indicators.subscription.on) {
            let info = userIndicators.getSubscriptionInfo();
            if (info.isFired) {
                fireUp(indicators.subscription);
                indicators.subscription.node.append(`<br><span class="ah-indicators-subtext">${info.subType}</span>`);
            } else {
                snuffOut(indicators.subscription);
            }
        }
        // persManager
        if (indicators.persManager.on) {
            let info = userIndicators.getPersManagerInfo();
            if (info.isFired) {
                fireUp(indicators.persManager);
            } else {
                snuffOut(indicators.persManager);
            }
        }

        // delivery
        if (indicators.delivery.on) {
            let info = userIndicators.getDeliveryInfo();
            if (info.isFired) {
                fireUp(indicators.delivery);
            } else {
                snuffOut(indicators.delivery);
            }
        }

        // onlyBankTransfer
        if (indicators.onlyBankTransfer.on) {
            addLoader(indicators.onlyBankTransfer);
        }

        // rePemium
        if (indicators.rePremium.on) {
            if (!shopId) {
                snuffOut(indicators.rePremium);
            } else {
                addLoader(indicators.rePremium);
                if (userIndicators.getSubscriptionInfo().isFired) {
                    addLoader(indicators.subscription);
                }
            }
        }

        // extension
        if (indicators.extension.on) {
            if (!shopId) {
                snuffOut(indicators.extension);
            } else {
                addLoader(indicators.extension);
            }
        }

        // shop info required
        if ((indicators.extension.on || indicators.rePremium.on) && shopId) {
            getShopInfo(shopId).then(
                response => {
                    shopIndicators = new ShopInfoIndicators({searchNode: $(response)});
                    if (indicators.rePremium.on) {
                        renderRePremium();
                        renderSubscriptionInfo();
                    }

                    if (indicators.extension.on) {
                        renderExtension();
                    }
                },
                error => {
                    if (indicators.rePremium.on) {
                        showError(indicators.rePremium);
                        showError(indicators.subscription);
                    }

                    if (indicators.extension.on) {
                        showError(indicators.extension);
                    }

                    console.log(error);
                }
            )
        }

        // account info required
        if (indicators.onlyBankTransfer.on) {
            getUserAccountInfo(userId).then(
                response => {
                    accountInfoIndicators = new AccountInfoIndicators({searchNode: $(response)});
                    renderOnlyBankTransfer();
                },
                error => showError(indicators.onlyBankTransfer)
            );
        }
    };

    function renderRePremium() {
        let rePremium = shopIndicators.getRePremiumInfo();
        if (rePremium.isFired) {
            fireUpDanger(indicators.rePremium);
        } else {
            getPremiumUsersList().then(
                response => {
                    try {
                        for (let i = 0; i < response.realty.length; i++) {
                            if (+userId === +response.realty[i].id) {
                                fireUpDanger(indicators.rePremium);
                                return;
                            }
                        }
                        snuffOut(indicators.rePremium);
                    } catch (e) {
                        showError(indicators.rePremium);
                        console.log(e);
                    }
                },
                error => {
                    showError(indicators.rePremium);
                    console.log(error);
                }
            );
        }
    }

    function renderSubscriptionInfo() {
        let subscription = shopIndicators.getSubscriptionInfo();
        if (subscription) {
            fireUp(indicators.subscription);
            indicators.subscription.node.append(`<br><span class="ah-indicators-subtext">
                ${subscription.status}, ${subscription.vertical}, ${subscription.tariffPlan}
            </span>`);
        }
    }

    function renderExtension() {
        let extensions = shopIndicators.getExtensionsInfo();
        if (extensions.isFired) {
            fireUpDanger(indicators.extension);
            addExtensionPopover(extensions);
        } else {
            snuffOut(indicators.extension);
        }
    }

    function renderOnlyBankTransfer() {
        let info = accountInfoIndicators.getOnlyBankTransfer();
        if (info.isFired) {
            fireUp(indicators.onlyBankTransfer);
        } else {
            snuffOut(indicators.onlyBankTransfer);
        }
    }

    function fireUp(indicator) {
        indicator.node.html(`<span class="ah-indicators-title ah-indicators-fired">${indicator.text}</span>`);
    }

    function fireUpDanger(indicator) {
        indicator.node.html(`<span class="ah-indicators-title ah-indicators-fired-danger">${indicator.text}</span>`);
    }

    function snuffOut(indicator) {
        indicator.node.html(`<span class="ah-indicators-title ah-inactive">${indicator.text}</span>`);
    }

    function addLoader(indicator) {
        indicator.node.html(`<span class="loading-indicator-text">Загрузка...</span>`);
    }

    function showError(indicator) {
        indicator.node.html(`<span class="ah-indicators-title ah-indicators-error">Error</span>`);
    }

    function addExtensionPopover(extensions) {
        let node = indicators.extension.node;
        node.append(`
                <span class="text-info glyphicon glyphicon-info-sign ah-user-extensions-popover"></span>
            `);

        node.find('.ah-user-extensions-popover').popover({
            placement: 'top',
            html: true,
            container: 'body',
            trigger: 'hover',
            template: `<div class="popover ah-extension-indicator-subinfo-popover">
                           <div class="arrow"></div><div class="popover-content"></div>
                       </div>`,
            content: `<ul>${extensions.names.map((item) => '<li>' + item.name + '</li>').join('')}</ul>`
        });
    }

    function addInnStatus(info) {
        let statusClass = (info.isVerifyed) ? 'glyphicon-ok-sign text-success' : 'glyphicon-remove-sign text-danger';
        indicators.inn.node.append(`<span style="margin-left: 4px;" class="glyphicon ${statusClass}"></span>`);
    }

    this.fireUp = fireUp;
    this.snuffOut = snuffOut;
    this.showError = showError;
    this.addLoader = addLoader;
}

function UserInfoIndicators(options) {
    options = options || {};
    const searchNode = options.searchNode || $('html');

    const innInput = searchNode.find('[name="inn"]');
    const innParentBlock = innInput.parents('.form-group');
    const innInfoBlock = innParentBlock.find('div.i-verify');
    const proInput = searchNode.find('#isPro');
    const companyInfoForm = searchNode.find('#company-info');
    const convertHelpBlock = companyInfoForm.find('.help-block');
    const autoInput = searchNode.find('#isAutoupload');
    const autoBanIcon = autoInput.parents('.checkbox').next().find('.glyphicon-ban-circle');
    const shopInput = searchNode.find('.control-label:contains(Магазин)').next().find('a');
    const shopInputText = shopInput.text();
    const subscrInput = searchNode.find('.form-group:contains(Подписка) a');
    const subscrInputText = subscrInput.text();
    const persManagerSelect = searchNode.find('select[name="managerId"]');
    const deliveryForm = searchNode.find('.user-info-deliver-form');
    const deliveryIsActive = deliveryForm.find('[name="isActive"]');
    const deliveryApiKey = deliveryForm.find('[name="apiKey"]');

    this.getInnInfo = function() {
        let res = {};
        if (innInput.val()) {
            res.isFired = true;
            res.isVerifyed = innInfoBlock.hasClass('i-verify-checked');
        } else {
            res.isFired = false;
        }

        res.scrollTo = innInput.parents('.form-group');

        return res;
    };

    this.getProInfo = function() {
        let res = {};
        res.isFired = proInput.is(":checked");
        res.scrollTo = proInput.parents('.form-group');
        return res;
    };

    this.getLegalEntityInfo = function() {
        let res = {};
        res.isFired = (companyInfoForm.length !== 0 && ~convertHelpBlock.text().indexOf('converted on'));
        res.scrollTo = convertHelpBlock.parents('.form-group');
        return res;
    };

    this.getAutoInfo = function() {
        let res = {};
        res.isFired = autoInput.is(":checked") && autoBanIcon.length === 0;
        res.scrollTo = autoInput.parents('.form-group');
        return res;
    };

    this.getShopInfo = function() {
        let res = {};
        res.isFired = !!(~shopInputText.indexOf("Оплачен") && subscrInputText.indexOf("Подписка") === -1);
        res.scrollTo = shopInput.parents('.form-group');
        return res;
    };

    this.getSubscriptionInfo = function() {
        let res = {};
        res.isFired = !!(~subscrInputText.indexOf("Подписка") && ~shopInputText.indexOf("Оплачен"));
        res.subType = (res.isFired) ? subscrInputText.split('"')[1] : '';
        res.scrollTo = subscrInput.parents('.form-group');
        return res;
    };

    this.getPersManagerInfo = function() {
        let res = {};
        res.isFired = !!(persManagerSelect.val());
        res.scrollTo = persManagerSelect.parents('.form-group');
        return res;
    };

    this.getDeliveryInfo = function() {
        let res = {};
        res.isFired = ($(deliveryIsActive).is(':checked') && $(deliveryApiKey).val());
        return res;
    };
}

function ShopInfoIndicators(options) {
    options = options || {};
    let searchNode = options.searchNode || $('html');

    let params = getParamsShopInfo(searchNode);

    this.getExtensionsInfo = function() {
        let res = {};
        res.isFired = !!params.extensions.length;
        res.names = params.extensions.map((item) => item);
        return res;
    };

    this.getRePremiumInfo = function() {
        let res = {};
        res.isFired = !!(params.subscription
            && ~params.subscription.vertical.indexOf('Realty')
            && ~params.subscription.tariffPlan.indexOf('Золото')
            && ~params.subscription.status.indexOf('Оплачено'));
        return res;
    };

    this.getSubscriptionInfo = function() {
        return params.subscription;
    }
}

function AccountInfoIndicators(options) {
    options = options || {};
    let searchNode = options.searchNode || $('html');

    this.getOnlyBankTransfer = function() {
        let res = {};
        let legend = searchNode.find('legend:contains(Счёт пользователя)');
        let label = legend.next().find('label:contains(Оплата только)');
        let checkbox = label.next().find('.js-toggle-payment');
        let isChecked = checkbox.prop('checked');
        let text = label.next().find('.form-control-static').text();
        res.isFired = !!(isChecked || ~text.indexOf('Включено'));
        return res;
    }
}

// индикаторы на УЗ
function addIndicatorsUserInfo(indicatorsArr) {
    $('.col-xs-offset-1').append(`<div id="statusUser" class="ah-user-info-indicators"></div>`);
    let container = $('#statusUser');

    indicatorsArr.forEach((item) => {
        container.append(`
            <div class="ah-indicators-item" data-indicator="${item}"></div>
        `);
    });

    let indicators = new AhIndicators(indicatorsArr, container);
    indicators.renderForUser($('html'));

    let indicatorsObj = indicators.get();

    let userIndicators = new UserInfoIndicators();
    let innScrollTo = userIndicators.getInnInfo().scrollTo;
    let proScrollTo = userIndicators.getProInfo().scrollTo;
    let legalEntityScrollTo = userIndicators.getLegalEntityInfo().scrollTo;
    let autoScrollTo = userIndicators.getAutoInfo().scrollTo;
    let shopScrollTo = userIndicators.getShopInfo().scrollTo;
    let subscriptionScrollTo = userIndicators.getSubscriptionInfo().scrollTo;
    let perManagerScrollTo = userIndicators.getPersManagerInfo().scrollTo;

    userInfoScrollableIndic(innScrollTo, indicatorsObj.inn.node);
    userInfoScrollableIndic(proScrollTo, indicatorsObj.pro.node);
    userInfoScrollableIndic(legalEntityScrollTo, indicatorsObj.legalEntity.node);
    userInfoScrollableIndic(autoScrollTo, indicatorsObj.auto.node);
    userInfoScrollableIndic(shopScrollTo, indicatorsObj.shop.node);
    userInfoScrollableIndic(subscriptionScrollTo, indicatorsObj.subscription.node);
    userInfoScrollableIndic(perManagerScrollTo, indicatorsObj.persManager.node);
}

function addIndicatorsHelpdeskDetails(indicatorsArr, response) {
    $('#rightPanelBody').append(`<div id="companyInfo"></div>`);
    let container = $('#companyInfo');

    container.append(`
        <div id="companyInfo" class="ah-helpdesk-details-indicators">
            <table>
                <tr>
                    <td data-indicator="inn"></td>
                    <td data-indicator="pro"></td>
                    <td data-indicator="subscription"></td>
                </tr>
                <tr>
                    <td data-indicator="shop"></td>
                    <td data-indicator="auto"></td>
                    ${(~indicatorsArr.indexOf('REPremium')) ? '<td data-indicator="REPremium"></td>': ''}
                </tr>
                ${~indicatorsArr.indexOf('extension') ? '<tr><td></td><td data-indicator="extension"></td><td></td></tr>': ''}
            </table>
        </div>
    `);

    let indicators = new AhIndicators(indicatorsArr, container);
    indicators.renderForUser(response);
}