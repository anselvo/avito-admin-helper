let userGlobalInfo;
let scriptGlobal;
let currentUrl;
let springUrl;
let admUrl;

$(function () {
    currentUrl = location.href;

    chrome.storage.local.get(result => {
        if (result.connectInfo) {
            springUrl = result.connectInfo.spring_url;
            admUrl = result.connectInfo.adm_url;
        }
        if (result.connectInfo.spring_user) userGlobalInfo = result.connectInfo.spring_user.principal;

        scriptGlobal = result.script;

        startNotification(result.notifications);

        holidays();

        if (result.script === 'infoDoc') {
            startInfoDoc();
        }

        if (result.script === 'intern') {
            startIntern();
            startModerator();
        }

        if (result.script === 'moderator') {
            startModerator();
        }

        if (result.script === 'smm') {
            startSmm();
        }

        if (result.script === 'support') {
            startSupport();
        }

        if (result.script === 'traffic') {
            startTraffic();
        }
    });

    $(document).mouseup(e => {
        let destroyOutclickingPopovers = $('.ah-popover-destroy-outclicking');
        if (!destroyOutclickingPopovers.is(e.target)
            && destroyOutclickingPopovers.has(e.target).length === 0) {
            $(destroyOutclickingPopovers).popover('destroy');
        }
    });
});