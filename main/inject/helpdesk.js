document.addEventListener('requestHelpdeskStore', () => {
    const data = JSON.parse(JSON.stringify(helpdeskStore.getState()));
    document.dispatchEvent(new CustomEvent('receiveHelpdeskStore', {detail: data}));
});