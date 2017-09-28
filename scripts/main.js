var userGlobalInfo;
var scriptGlobal;

chrome.storage.local.get(function (result) {
    userGlobalInfo = result.user;
    scriptGlobal = result.script;
    
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

$(document).mouseup(function (e) {
    let destroyOutclickingPopovers = $('.ah-popover-destroy-outclicking');
    if (!destroyOutclickingPopovers.is(e.target)
        && destroyOutclickingPopovers.has(e.target).length === 0) {
        $(destroyOutclickingPopovers).popover('destroy');
    }
});