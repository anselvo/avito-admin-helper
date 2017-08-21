var userGlobalInfo;
var scriptGlobal;

chrome.storage.local.get(function (result) {
    userGlobalInfo = result.user;
    scriptGlobal = result.script;
    
    if (result.script === 'infoDoc') {
        startInfoDoc();
    }

    if (result.script === 'intern') {
        startModerator();
        startIntern();
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

    if (result.script === 'assistant') {
        startSupport();
        startAssistant();
    }

});