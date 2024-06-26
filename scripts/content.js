
const body_mutation_config = { attribute: true, childList: true, subtree: true, characterData: true, characterDataOldValue: true, attributes: true, attributeFilter: ['class'] };

let initDone = false;

const body_mutation_callback = (mutation_list, observer) => {
    for (const mutation of mutation_list) {

        if (mutation.type === "childList") {
            if (mutation.target.className == 'combat-tracker__combatants') {
                if (mutation.addedNodes.length > 0 && mutation.addedNodes[0].className == 'combatants combatants--all') {
                    for (let child of mutation.addedNodes[0].children) {
                        if (child.className.includes('combatant-card--character')) {
                            let extensionDiv = createExtensionsDiv();
                            createEffectDiv(extensionDiv);
                            child.insertAdjacentElement('afterEnd', extensionDiv);
                            createAddEffectBtn(child);
                            initDone = true;
                        }
                    }
                }

            }
            else if (mutation.target.className == 'combatant-summary__stats') {
                const addEffectBtnDiv = mutation.target.querySelector('.add-effect-line-item');
                if (addEffectBtnDiv != null && mutation.target.lastChild != addEffectBtnDiv) {
                    mutation.target.appendChild(addEffectBtnDiv);
                }
            }
        }
        else if (mutation.type === 'characterData') {
            if (mutation.target.parentElement.className == 'combatant-card__hp-current') {
                // If current value is smaller athan previous, we have lost HP
                const combatantCard = mutation.target.parentElement.closest('.combatant-card');
                const currentHpAmount = parseInt(mutation.target.data);
                if (combatantCard.className.includes('combatant-card--character')) {
                    // Card belongs to a character
                    if (currentHpAmount < parseInt(mutation.oldValue)) {
                        checkIsConcentrating(combatantCard);
                    }
                }
                else {
                    // Card belongs to a monster
                    if (currentHpAmount == 0) {
                        combatantCard.classList.add('combatant-card--is-dead');
                    }
                    else if (currentHpAmount > 0 && parseInt(mutation.oldValue) == 0) {
                        combatantCard.classList.remove('combatant-card--is-dead');
                    }
                }
            }
            else if (initDone && mutation.target.parentElement.parentElement.className.includes('turn-controls__turn')) {
                let activeCharacterCard = document.querySelector('.combatant-card--character.is-turn');
                if (activeCharacterCard != null && activeCharacterCard.nextElementSibling != null) {
                    activeCharacterCard.nextElementSibling.querySelectorAll('.duration-input').forEach(element => {
                        element.stepDown();
                    });
                }

            }
        }
        else if (mutation.type === 'attributes') {
            if (mutation.attributeName === 'class') {
                const isSVGANimatedString = mutation.target.className instanceof SVGAnimatedString;
                if (!isSVGANimatedString) {
                    if (mutation.target.className.includes('combatant-card--monster') &&
                        mutation.target.querySelector('.combatant-card__hp-current').innerText == "0" &&
                        !mutation.target.className.includes('combatant-card--is-dead')) {

                        mutation.target.classList.add('combatant-card--is-dead');
                    }
                }

            }
        }
    }
}

const body_observer = new MutationObserver(body_mutation_callback);
body_observer.observe(document.body, body_mutation_config);

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request == 'reset') {
            for (const concentrateCheckbox of document.getElementsByClassName('concentrate-checkbox')) {
                concentrateCheckbox.checked = false;
            }
        }
    }
);

function addEffectClick(clickEvent) {
    const combatantCharacterCard = clickEvent.target.closest('.combatant-card--character');
    const extensionsDiv = combatantCharacterCard.nextElementSibling;
    extensionsDiv.classList.remove('hidden');
    const effectsTable = extensionsDiv.querySelector('.effects-table');
    addEffectTableInputRow(effectsTable);
}

function createExtensionsDiv() {
    let extensionDiv = document.createElement('div');
    extensionDiv.className = 'extension-div hidden';
    return extensionDiv;
}

function createEffectDiv(extensionDiv) {
    let effectDiv = document.createElement('div');
    effectDiv.className = 'effect-div';
    extensionDiv.appendChild(effectDiv);
    let effectsTable = document.createElement('table');
    effectsTable.className = 'effects-table';
    let effectsTableHeaderRow = document.createElement('tr');
    let effectsTableNameHeader = document.createElement('th');
    effectsTableNameHeader.innerText = 'Effect name';
    effectsTableNameHeader.className = 'effect-header';
    effectsTableHeaderRow.appendChild(effectsTableNameHeader);
    let effectsTableDurationHeader = document.createElement('th');
    effectsTableDurationHeader.innerText = 'Duration';
    effectsTableHeaderRow.appendChild(effectsTableDurationHeader);
    let effectsTableConcentratingHeader = document.createElement('th');
    effectsTableConcentratingHeader.innerText = 'Concentrate';
    effectsTableHeaderRow.appendChild(effectsTableConcentratingHeader);
    // Add empty header for buttons
    effectsTableHeaderRow.appendChild(document.createElement('th'));
    effectsTable.appendChild(effectsTableHeaderRow);
    effectDiv.appendChild(effectsTable);
}

function createAddEffectBtn(characterCard) {
    const statsDiv = characterCard.querySelector('.combatant-summary__stats');
    if (statsDiv != null) {
        const addEffectButtonDiv = document.createElement('div');
        addEffectButtonDiv.className = 'line-item line-item-horizontal add-effect-line-item';
        const addEffectButton = document.createElement('button');
        addEffectButton.type = 'button';
        addEffectButton.className = 'add-effect-btn';
        addEffectButton.dataset.tooltiptext = 'Add new effect';
        addEffectButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6" style="width:24px;height:24px;"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>';
        addEffectButton.addEventListener('click', addEffectClick);
        addEffectButtonDiv.appendChild(addEffectButton);
        statsDiv.appendChild(addEffectButtonDiv);
    }
}

function addEffectTableInputRow(effectsTable) {
    let effectsTableInputRow = document.createElement('tr');
    let effectsTableNameInputCell = document.createElement('td');
    effectsTableNameInputCell.className = 'name-input-cell';
    let effectsTableNameInput = document.createElement('input');
    effectsTableNameInput.className = 'name-input';
    effectsTableNameInput.type = 'text';
    effectsTableNameInputCell.appendChild(effectsTableNameInput);
    effectsTableInputRow.appendChild(effectsTableNameInputCell);
    let effectsTableDurationInputCell = document.createElement('td');
    effectsTableDurationInputCell.className = 'duration-input-cell';
    let effectsTableDurationInput = document.createElement('input');
    effectsTableDurationInput.type = 'number';
    effectsTableDurationInput.className = 'duration-input';
    effectsTableDurationInputCell.appendChild(effectsTableDurationInput);
    effectsTableInputRow.appendChild(effectsTableDurationInputCell);
    let concentratingInputCell = document.createElement('td');
    concentratingInputCell.className = 'concentrating-input-cell';
    let concentrateCheck = document.createElement('input');
    concentrateCheck.type = 'checkbox';
    concentrateCheck.className = 'concentrate-checkbox';
    concentratingInputCell.appendChild(concentrateCheck);
    effectsTableInputRow.appendChild(concentratingInputCell);
    let effectsTableSetBtnCell = document.createElement('td');
    effectsTableSetBtnCell.className = 'btn-cell';
    let effectsTableSetBtn = document.createElement('button');
    effectsTableSetBtn.type = 'button';
    effectsTableSetBtn.className = 'ddbeb-button ddbeb-button--dark ddbeb-button-small';
    effectsTableSetBtn.innerText = 'Set';
    effectsTableSetBtn.addEventListener('click', setButtonClicked);
    effectsTableSetBtnCell.appendChild(effectsTableSetBtn);
    effectsTableInputRow.appendChild(effectsTableSetBtnCell);
    effectsTable.appendChild(effectsTableInputRow);
}

function setButtonClicked(clickEvent) {
    let tableRow = clickEvent.target.closest('tr');
    let nameInputCell = tableRow.getElementsByClassName('name-input-cell')[0];
    nameInputCell.firstChild.setAttribute('disabled', '');
    let durationInputCell = tableRow.getElementsByClassName('duration-input-cell')[0];
    durationInputCell.firstChild.setAttribute('disabled', '');
    let buttonCell = tableRow.getElementsByClassName('btn-cell')[0];
    buttonCell.innerHTML = '';
    let effectsTableRowDeleteBtn = document.createElement('button');
    effectsTableRowDeleteBtn.type = 'button';
    effectsTableRowDeleteBtn.innerHTML = 'Delete';
    effectsTableRowDeleteBtn.className = 'ddbeb-button ddbeb-button-small';
    effectsTableRowDeleteBtn.addEventListener('click', removeButtonClicked);
    buttonCell.appendChild(effectsTableRowDeleteBtn);
}

function removeButtonClicked(clickEvent) {
    // We need to get the effects table before we remove the row
    let effectsTable = clickEvent.target.closest('table');
    clickEvent.target.closest('tr').remove();
    if (effectsTable.querySelector('td') == null) {
        // If table has no data cells, hide the extension div
        effectsTable.closest('.extension-div').classList.add('hidden');
    }
}

function checkIsConcentrating(combatantCard) {
    combatantCard.nextElementSibling.querySelectorAll('.concentrate-checkbox').forEach(element => {
        if (element.checked) {
            const characterName = combatantCard.querySelector('.combatant-summary__name').textContent;
            alert(`CHECK ${characterName} CONCENTRATE`);
        }
    });
}