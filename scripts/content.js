
const body_mutation_config = { attribute: true, childList: true, subtree: true, characterData: true, characterDataOldValue: true };
let characterIndex = 0;

const body_mutation_callback = (mutation_list, observer) => {
    for (const mutation of mutation_list) {
        //console.log(mutation);
        if (mutation.type === "childList") {
            if (mutation.target.className.includes('combatant-card--character') && mutation.addedNodes.length > 0 && mutation.addedNodes[0].className == 'combatant-card__right-bit') {
                let extensionDiv = createExtensionsDiv();
                createConcentrateDiv(extensionDiv, characterIndex);
                //createEffectDiv(extensionDiv, characterIndex);
                modifyCharacterCardStyle(mutation.target);
                mutation.target.insertAdjacentElement('afterEnd', extensionDiv);
                characterIndex++;
            }
        }
        else if (mutation.type === 'characterData') {
            if (mutation.target.parentElement.className == 'combatant-card__hp-current') {
                // If current value is smaller athan previous, we have lost HP
                if (parseInt(mutation.target.data) < parseInt(mutation.oldValue)) {
                    const characterCard = mutation.target.parentElement.closest('.combatant-card');
                    checkIsConcentrating(characterCard);
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
    const parentDiv = clickEvent.target.closest('.effect-div');
    const effectsTable = parentDiv.querySelector('.effects-table');
    addEffectTableRow(effectsTable);
}

function createExtensionsDiv() {
    let extensionDiv = document.createElement('div');
    extensionDiv.className = 'extensions-div';
    extensionDiv.style.display = 'flex';
    extensionDiv.style.marginBottom = '8px';
    extensionDiv.style.padding = '3px';
    extensionDiv.style.border = '1px solid #d8e1e8';
    extensionDiv.style.borderBottomLeftRadius = '3px';
    extensionDiv.style.borderBottomRightRadius = '3px';
    return extensionDiv;
}

function createConcentrateDiv(extensionDiv, characterIndex) {
    let concentrateDiv = document.createElement('div');
    extensionDiv.appendChild(concentrateDiv);
    let concentrateCheck = document.createElement('input');
    concentrateCheck.type = 'checkbox';
    concentrateCheck.id = 'concentrateCheck' + characterIndex;
    concentrateCheck.className = 'concentrate-checkbox';
    concentrateCheck.style.marginLeft = '0px';
    concentrateCheck.style.verticalAlign = 'middle';
    concentrateDiv.appendChild(concentrateCheck);
    let concentrateCheckLabel = document.createElement('label');
    concentrateCheckLabel.textContent = 'Concentrating';
    concentrateCheckLabel.htmlFor = 'concentrateCheck' + characterIndex;
    concentrateCheckLabel.style.color = '#738694';
    concentrateCheckLabel.style.fontWeight = '700';
    concentrateCheckLabel.style.letterSpacing = '1px';
    concentrateCheckLabel.style.verticalAlign = 'bottom';
    concentrateDiv.appendChild(concentrateCheckLabel);
}

function createEffectDiv(extensionDiv, characterIndex) {
    let effectDiv = document.createElement('div');
    effectDiv.className = 'effect-div';
    extensionDiv.appendChild(effectDiv);
    let effectsTable = document.createElement('table');
    effectsTable.className = 'effects-table';
    let effectsTableHeaderRow = document.createElement('tr');
    let effectsTableNameHeader = document.createElement('th');
    effectsTableNameHeader.innerText = 'Effect';
    effectsTableHeaderRow.appendChild(effectsTableNameHeader);
    let effectsTableDurationHeader = document.createElement('th');
    effectsTableDurationHeader.innerText = 'Duration';
    effectsTableHeaderRow.appendChild(effectsTableDurationHeader);
    effectsTableHeaderRow.appendChild(document.createElement('th'));
    effectsTable.appendChild(effectsTableHeaderRow);

    effectDiv.appendChild(effectsTable);
    let addEffectBtn = document.createElement('button');
    addEffectBtn.type = 'button';
    addEffectBtn.className = 'add-effect-btn';
    addEffectBtn.innerText = 'Add effect';
    addEffectBtn.addEventListener('click', addEffectClick);
    effectDiv.appendChild(addEffectBtn);
}

function addEffectTableRow(effectsTable) {
    let effectsTableTestRow = document.createElement('tr');
    let effectsTableTestRowName = document.createElement('td');
    effectsTableTestRowName.innerText = 'RagettiSpagetti';
    effectsTableTestRow.appendChild(effectsTableTestRowName);
    let effectsTableTestRowDuration = document.createElement('td');
    effectsTableTestRowDuration.innerText = '10';
    effectsTableTestRow.appendChild(effectsTableTestRowDuration);
    let effectsTableTestRowDelete = document.createElement('button');
    effectsTableTestRowDelete.type = 'button';
    effectsTableTestRowDelete.innerText = 'Delete';
    effectsTableTestRowDelete.addEventListener('click', removeButtonClicked);
    effectsTableTestRow.appendChild(effectsTableTestRowDelete);
    effectsTable.appendChild(effectsTableTestRow);
}

function modifyCharacterCardStyle(characterCard) {
    characterCard.querySelector('.combatant-card__left-bit').style.borderBottomLeftRadius = '0px';
    characterCard.querySelector('.combatant-card__right-bit').style.borderBottomRightRadius = '0px';
}

function removeButtonClicked(clickEvent) {
    clickEvent.target.closest('tr').remove();
}

function checkIsConcentrating(combatantCard) {
    if (combatantCard.querySelector('.concentrate-checkbox').checked) {
        const characterName = combatantCard.querySelector('.combatant-summary__name').textContent;
        alert(`CHECK ${characterName} CONCENTRATE`);
    }
}