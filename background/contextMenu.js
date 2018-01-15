// КОНТЕКСТНОЕ МЕНЮ
// Create contextMenu for open info
const contextSearchAdm = ["selection"];

function goToTicket(info) {
    let newURL = 'https://adm.avito.ru/helpdesk/details/' + info.selectionText;
    chrome.tabs.create({ url: newURL });
}

function goToItem(info) {
    let newURL = 'https://adm.avito.ru/items/item/info/' + info.selectionText;
    chrome.tabs.create({ url: newURL });
}

function goToUser(info) {
    let text = info.selectionText;
    let newURL;
    if (text.indexOf('@')+1) newURL = 'https://adm.avito.ru/users/search?email=' + text;
    else newURL = 'https://adm.avito.ru/users/user/info/' + text;

    chrome.tabs.create({ url: newURL });
}

function goToComparison(info) {
    let newURL = 'https://adm.avito.ru/items/comparison/' + info.selectionText + '/archive';
    chrome.tabs.create({ url: newURL });
}

function goToMoney(info) {
    let newURL = 'https://adm.avito.ru/users/account/info/' + info.selectionText;
    chrome.tabs.create({ url: newURL });
}

const openLink = chrome.contextMenus.create({title: "Открыть по ID", contexts: contextSearchAdm});
chrome.contextMenus.create({title: "тикет", contexts: contextSearchAdm, parentId: openLink, onclick: goToTicket});
chrome.contextMenus.create({title: "объявление", contexts: contextSearchAdm, parentId: openLink, onclick: goToItem});
chrome.contextMenus.create({title: "комперисон", contexts: contextSearchAdm, parentId: openLink, onclick: goToComparison});
chrome.contextMenus.create({title: "пользователя", contexts: contextSearchAdm, parentId: openLink, onclick: goToUser});
chrome.contextMenus.create({title: "кошелек", contexts: contextSearchAdm, parentId: openLink, onclick: goToMoney});

chrome.contextMenus.create({type: 'separator', contexts: contextSearchAdm});


// Create contextMenu for items/search
function searchInItemByQuery(info) {
    let newURL = 'https://adm.avito.ru/items/search?query=' + info.selectionText;
    chrome.tabs.create({ url: newURL });
}

function searchInItemByPhone(info) {
    let newURL = 'https://adm.avito.ru/items/search?phone=' + info.selectionText;
    chrome.tabs.create({ url: newURL });
}

function searchInItemByUser(info) {
    let newURL = 'https://adm.avito.ru/items/search?user=' + info.selectionText;
    chrome.tabs.create({ url: newURL });
}

function searchInItemByIP(info) {
    let newURL = 'https://adm.avito.ru/items/search?ip=' + info.selectionText;
    chrome.tabs.create({ url: newURL });
}

const itemSearch = chrome.contextMenus.create({title: "Искать в items/search", contexts: contextSearchAdm});
chrome.contextMenus.create({title: "по тексту", contexts: contextSearchAdm, parentId: itemSearch, onclick: searchInItemByQuery});
chrome.contextMenus.create({title: "по телефону", contexts: contextSearchAdm, parentId: itemSearch, onclick: searchInItemByPhone});
chrome.contextMenus.create({title: "по IP", contexts: contextSearchAdm, parentId: itemSearch, onclick: searchInItemByIP});
chrome.contextMenus.create({title: "по пользователю", contexts: contextSearchAdm, parentId: itemSearch, onclick: searchInItemByUser});

// Create contextMenu for users/search
function searchInUserByPhone(info) {
    let newURL = 'https://adm.avito.ru/users/search?phone=' + info.selectionText;
    chrome.tabs.create({ url: newURL });
}

function searchInUserByName(info) {
    let newURL = 'https://adm.avito.ru/users/search?name=' + info.selectionText;
    chrome.tabs.create({ url: newURL });
}

function searchInUserByIP(info) {
    let newURL = 'https://adm.avito.ru/users/search?ip=' + info.selectionText;
    chrome.tabs.create({ url: newURL });
}

function searchInUserByEmail(info) {
    let newURL = 'https://adm.avito.ru/users/search?email=' + info.selectionText;
    chrome.tabs.create({ url: newURL });
}

const userSearch = chrome.contextMenus.create({title: "Искать в users/search", contexts: contextSearchAdm});
chrome.contextMenus.create({title: "по email", contexts: contextSearchAdm, parentId: userSearch, onclick: searchInUserByEmail});
chrome.contextMenus.create({title: "по имени", contexts: contextSearchAdm, parentId: userSearch, onclick: searchInUserByName});
chrome.contextMenus.create({title: "по телефону", contexts: contextSearchAdm, parentId: userSearch, onclick: searchInUserByPhone});
chrome.contextMenus.create({title: "по IP", contexts: contextSearchAdm, parentId: userSearch, onclick: searchInUserByIP});


// Create contextMenu for search in CF
function searchInCfAll(info) {
    let newURL = 'https://mus.avito.ru/cf/dosearchsite.action?cql=siteSearch ~ "' + info.selectionText + '"&queryString=' + info.selectionText;
    chrome.tabs.create({ url: newURL });
}

function searchInCfRules(info) {
    let newURL = 'https://mus.avito.ru/cf/dosearchsite.action?cql=siteSearch ~ "' + info.selectionText + '" and space = "coaching"&queryString=' + info.selectionText;
    chrome.tabs.create({ url: newURL });
}

function searchInCfMod(info) {
    let newURL = 'https://mus.avito.ru/cf/dosearchsite.action?cql=siteSearch ~ "' + info.selectionText + '" and space = "moderation"&queryString=' + info.selectionText;
    chrome.tabs.create({ url: newURL });
}

function searchInCfSup1(info) {
    let newURL = 'https://mus.avito.ru/cf/dosearchsite.action?cql=siteSearch ~ "' + info.selectionText + '" and space = "1stLine"&queryString=' + info.selectionText;
    chrome.tabs.create({ url: newURL });
}

function searchInCfSup2(info) {
    let newURL = 'https://mus.avito.ru/cf/dosearchsite.action?cql=siteSearch ~ "' + info.selectionText + '" and space = "SUP"&queryString=' + info.selectionText;
    chrome.tabs.create({ url: newURL });
}

const confluence = chrome.contextMenus.create({title: "Искать в Confluence", contexts: contextSearchAdm});
chrome.contextMenus.create({title: "Везде", contexts: contextSearchAdm, parentId: confluence, onclick: searchInCfAll});
chrome.contextMenus.create({title: "в Правилах", contexts: contextSearchAdm, parentId: confluence, onclick: searchInCfRules});
chrome.contextMenus.create({title: "в Модерации", contexts: contextSearchAdm, parentId: confluence, onclick: searchInCfMod});
chrome.contextMenus.create({title: "в Support 1st line", contexts: contextSearchAdm, parentId: confluence, onclick: searchInCfSup1});
chrome.contextMenus.create({title: "в Support 2nd line", contexts: contextSearchAdm, parentId: confluence, onclick: searchInCfSup2});


// Create contextMenu image Google, Yandex search
function googleImageSearch(info) {
    let imageURL;
    if (info.mediaType === 'image') imageURL = info.srcUrl;
    else imageURL = info.linkUrl;

    let newURL = 'https://www.google.ru/searchbyimage?image_url=' + imageURL;
    chrome.tabs.create({ url: newURL });
}

function yandexImageSearch(info) {
    let imageURL;
    if (info.mediaType === 'image') imageURL = info.srcUrl;
    else imageURL = info.linkUrl;

    let newURL = 'https://yandex.ru/images/search?url=' + imageURL + '&rpt=imageview';
    chrome.tabs.create({ url: newURL });
}

const contextImage = ["image", "link"];
chrome.contextMenus.create({title: "Поиск картинки в Google", contexts: contextImage, onclick: googleImageSearch});
chrome.contextMenus.create({title: "Поиск картинки в Yandex", contexts: contextImage, onclick: yandexImageSearch});
