chrome.commands.onCommand.addListener((command) => {
    chrome.tabs.executeScript({
        code: 'window.getSelection().toString();'
    }, (selection) => {
        const selectionText = selection ? selection[0] : null;

        if (selectionText && selectionText.trim()) {
            switch (command) {
                case 'open-ticket':
                    goToTicket({ selectionText });
                    break;
                case 'open-item':
                    goToItem({ selectionText });
                    break;
                case 'open-comparison':
                    goToComparison({ selectionText });
                    break;
                case 'open-user':
                    goToUser({ selectionText });
                    break;
                case 'open-account':
                    goToMoney({ selectionText });
                    break;
            }
        } else {
            addChromeNotification(`Выделите ID ${command === 'open-user' ? 'или email' : ''}, чтобы выполнить переход`);
        }
    });
});