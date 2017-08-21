function addAssistant() {
    let body = $('body');
    $(body).append(`
    <div class="assistant-bar">
        <span>А</span>
        <span>с</span>
        <span>с</span>
        <span>и</span>
        <span>с</span>
        <span>т</span>
        <span>е</span>
        <span>н</span>
        <span>т</span>
    </div>`);

    $(body).append(`
    <div class="assistant-modal">
        <div class="assistant-content">
            <div class="overlay-container">
                <div class="assistant-header">
                    <span class="assistant-title"></span>
                    <button class="close-assistant control" title="Закрыть">X</button>
                    <button class="fold-assistant control" title="Свернуть">_</button>
                </div>
                <div class="assistant-body"></div>
                
                <div class="assistant-overlay"></div>
            </div>
        </div>
    </div>
    `);

    let modal = $('.assistant-modal');
    $(modal).draggable({
        containment: "window",
        handle: ".assistant-header"
    });

    $('.assistant-bar').click(function() {
        if (!localStorage['assistantCurrentVertex']) {
            getRegulations();
        }
        showAssistant();
    });

    $('.close-assistant').click(function() {
        hideAssistant();
        resetAssistant();
    });

    $('.fold-assistant').click(function() {
        hideAssistant();
    });

    if (localStorage['assistantCurrentVertex']) {
        continueAssistant();
    }

    $( window ).on('unload', function() {
        showAssistant();
        let position  = {
            top: $(modal).offset().top - $(window).scrollTop(),
            left: $(modal).offset().left
        };
        localStorage['assistantPosition'] = JSON.stringify(position);
    });

    document.onkeydown = function(e) {
        if (e.altKey && e.keyCode === 83) {
            if (!localStorage['assistantCurrentVertex']) {
                getRegulations();
            }
            showAssistant();
            return false;
        }
        if (e.altKey && e.keyCode === 70) {
            hideAssistant();
            return false;
        }
    };

    let modalHeader = $(modal).find('.assistant-header');
    $(modalHeader).dblclick(function() {
        hideAssistant();
    });
}

function getRegulations() {
    assistantOverlayIn();
    chrome.runtime.sendMessage({
            action: 'XMLHttpRequest',
            method: "GET",
            url: "http://spring.avitoadm.ru/assistant/graphs/list"
        },

        function(response) {
            let regulations;
            try {
                regulations = JSON.parse(response);
            } catch(e) {
                alert(e);
            }
            renderRegulations(regulations);
            resetAssistant();
            assistantOverlayOut();
        }
    );
}

function renderRegulations(regulations) {
    let modal = $('.assistant-modal');
    let modalBody = $(modal).find('.assistant-body');

    let modalHeader = $(modal).find('.assistant-header');
    let modalTitle = $(modalHeader).find('.assistant-title');
    $(modalTitle).text('Выбор регламента');

    $(modalHeader).find('.regulation-control').remove();

    $(modalBody).empty().append(`<ol class="regulations-list"></ol>`);
    let regulationsList = $(modalBody).find('.regulations-list');
    regulations.forEach((item) => {
        regulationsList.append(`
        <li class="regulations-item" title="${item.description}" data-regulation="${JSON.stringify(item).replace(/"/g, "&quot;")}">
            ${item.name}
        </li>
        `);
    });

    $('.regulations-item').click(function() {
        let regulation = $(this).data('regulation');
        gerRegulationHead(regulation);
    });
}

function gerRegulationHead(regulation) {
    assistantOverlayIn();
    chrome.runtime.sendMessage({
            action: 'XMLHttpRequest',
            method: "GET",
            url: "http://spring.avitoadm.ru/assistant/graphs/head/"+ regulation.uuid
        },

        function(response) {
            let responseObj;
            try {
                responseObj = JSON.parse(response);
            } catch(e) {
                alert(e);
            }

            if (responseObj.error) {
                alert('Error: '+ responseObj.error + '\nMessage: '+ responseObj.message);
                assistantOverlayOut();
                return;
            }

            renderVertex(responseObj);
            assistantOverlayOut();
        }
    );
}

function renderVertex(vertex) {
    let modal = $('.assistant-modal');

    let modalHeader = $(modal).find('.assistant-header');
    let modalTitle = $(modalHeader).find('.assistant-title');

    try {
        $(modalTitle).text(vertex.assistantGraphs.name);
    } catch (e){ }


    $(modalHeader).find('.regulation-control').remove();

    let modalBody = $(modal).find('.assistant-body');
    $(modalBody).empty().append(`
    <div class="regulation-vertex-metadata" data-current-vertex="${JSON.stringify(vertex).replace(/"/g, "&quot;")}"></div>
    <div class="regulation-vertex-description">
        ${vertex.description}
    </div>
    `);

    storeAssistantCurrentVertex(vertex);
    getVertexChildren(vertex.children.join('&children='));
}

function getVertexChildren(children) {
    assistantOverlayIn();
    chrome.runtime.sendMessage({
            action: 'XMLHttpRequest',
            method: "GET",
            url: "http://spring.avitoadm.ru/assistant/list/?children="+ children
        },

        function(response) {
            assistantOverlayOut();
            let children;
            try {
                children = JSON.parse(response);
            } catch(e) {
                alert(e);
            }
            renderVertexChildren(children);
        }
    );
}

function renderVertexChildren(children) {
    let modal = $('.assistant-modal');
    let modalBody = $(modal).find('.assistant-body');
    $(modalBody).append(`
        <ul class="regulation-vertex-children"></ul>
    `);

    let childrenList = $(modalBody).find('.regulation-vertex-children');
    $(childrenList).empty();
    children.forEach((item) => {
        $(childrenList).append(`
        <li class="vertex-children-item" data-vertex="${JSON.stringify(item).replace(/"/g, "&quot;")}">
            ${item.description}
        </li>`);
    });

    $('.vertex-children-item').click(function() {
        let currentVertex = $(modalBody).find('.regulation-vertex-metadata').data('currentVertex');
        let nextVertex = $(this).data('vertex');
        renderVertex(nextVertex);
        storeAssistantProgress(nextVertex, currentVertex);
    });

    renderRegulationControls();
}

function renderRegulationControls() {
    let modal = $('.assistant-modal');
    let modalHeader = $(modal).find('.assistant-header');
    let modalBody = $(modal).find('.assistant-body');
    let currentVertex = $(modalBody).find('.regulation-vertex-metadata').data('currentVertex');

    if (localStorage['assistantProgress']) {
        let progress = JSON.parse(localStorage['assistantProgress']);
        let vertex = progress.filter(function(item) {
            return item.uuid === currentVertex.uuid;
        });
        if (vertex[0]) {
            $(modalHeader).append('<button class="regulation-back regulation-control"><</button>');
            let btnBack = $(modalHeader).find('.regulation-back');
            $(btnBack).click(function() {
                renderVertex(vertex[0].comeFrom);
            });
        }
    }

    $(modalHeader).append('<button class="regulations-list-btn regulation-control">Регламенты</button>');

    let btnList = $(modalHeader).find('.regulations-list-btn');
    $(btnList).click(function() {
        getRegulations();
    });
}

/*Common*/
function showAssistant() {
    $('.assistant-modal').show();
    $('.assistant-bar').hide();
}

function hideAssistant() {
    $('.assistant-modal').hide();
    $('.assistant-bar').show();
}

function assistantOverlayIn() {
    let modal = $('.assistant-modal');
    let overlay = $(modal).find('.assistant-overlay');
    $(overlay).show();
}

function assistantOverlayOut() {
    let modal = $('.assistant-modal');
    let overlay = $(modal).find('.assistant-overlay');
    $(overlay).fadeOut('fast');
}


function storeAssistantCurrentVertex(vertex) {
    localStorage['assistantCurrentVertex'] = JSON.stringify(vertex);
}

function storeAssistantProgress(nextVertex, currentVertex) {
    let obj = nextVertex;
    obj.comeFrom = currentVertex;
    let LSKey = 'assistantProgress';

    if (!localStorage[LSKey]) {
        let arr = [];
        arr.push(obj);
        localStorage[LSKey] = JSON.stringify(arr);
    } else {
        let currentProgress = JSON.parse(localStorage[LSKey]);
        let isExists = false;
        for (let i = 0; i < currentProgress.length; i++) {
            if (currentProgress[i].uuid === nextVertex.uuid) {
                currentProgress[i] = obj;
                isExists = true;
            }
        }

        if (!isExists) {
            currentProgress.push(obj);
        }

        localStorage[LSKey] = JSON.stringify(currentProgress);
    }
}

function resetAssistant() {
    delete localStorage['assistantCurrentVertex'];
    delete localStorage['assistantProgress'];
}

function continueAssistant() {
    let modal = $('.assistant-modal');

    let currentVertex = JSON.parse(localStorage['assistantCurrentVertex']);
    renderVertex(currentVertex);

    try {
        let position = JSON.parse(localStorage['assistantPosition']);
        $(modal).css({
            left: position.left,
            top: position.top
        });
    } catch (e){
        console.log(e);
    }
    showAssistant();
}