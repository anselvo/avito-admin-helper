let userGlobalInfo;
let scriptGlobal;
let currentUrl;

$(function () {
    currentUrl = location.href;

    chrome.storage.local.get(result => {
        userGlobalInfo = result.authInfo.user.principal;
        scriptGlobal = result.script;

        console.log(userGlobalInfo);

        startNotification(result.notifications);

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