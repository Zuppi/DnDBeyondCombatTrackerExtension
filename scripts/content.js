
const body_mutation_config = { attribute: true, childList: true, subtree: true, characterData: true, characterDataOldValue: true };

//TODO:
// - Siirrä concentrate osaksi efektiä, muokkaa tarkistus tukemaan muutosta
// - Tablen tyylit
// - Korjaa aktiivisen pelaajan laatikon reunukset (CSS injektio?)
// - Tablen kestojen laskeminen kun vuoro vaihtuu ja tulee hahmon vuoro

const body_mutation_callback = (mutation_list, observer) => {
    for (const mutation of mutation_list) {
        //console.log(mutation);
        if (mutation.type === "childList") {
            if (mutation.target.className.includes('combatant-card--character') && mutation.addedNodes.length > 0 && mutation.addedNodes[0].className == 'combatant-card__right-bit') {
                let extensionDiv = createExtensionsDiv();
                createEffectDiv(extensionDiv);
                modifyCharacterCardStyle(mutation.target);
                mutation.target.insertAdjacentElement('afterEnd', extensionDiv);
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
    addEffectTableInputRow(effectsTable);
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

function createEffectDiv(extensionDiv) {
    let effectDiv = document.createElement('div');
    effectDiv.className = 'effect-div';
    extensionDiv.appendChild(effectDiv);
    let effectsTable = document.createElement('table');
    effectsTable.className = 'effects-table';
    effectsTable.style.display = 'none';
    let effectsTableHeaderRow = document.createElement('tr');
    let effectsTableNameHeader = document.createElement('th');
    effectsTableNameHeader.innerText = 'Effect name';
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
    let addEffectBtn = document.createElement('button');
    addEffectBtn.type = 'button';
    addEffectBtn.className = 'add-effect-btn';
    addEffectBtn.innerText = 'Add effect';
    addEffectBtn.style.marginTop = '0.4rem';
    addEffectBtn.style.marginBottom = '0.4rem';
    addEffectBtn.addEventListener('click', addEffectClick);
    effectDiv.appendChild(addEffectBtn);
}

function addEffectTableInputRow(effectsTable) {
    let effectsTableInputRow = document.createElement('tr');
    let effectsTableNameInputCell = document.createElement('td');
    effectsTableNameInputCell.className = 'name-input-cell';
    let effectsTableNameInput = document.createElement('input');
    effectsTableNameInput.type = 'text';
    effectsTableNameInput.style.maxWidth = '10rem';
    effectsTableNameInputCell.appendChild(effectsTableNameInput);
    effectsTableInputRow.appendChild(effectsTableNameInputCell);
    let effectsTableDurationInputCell = document.createElement('td');
    effectsTableDurationInputCell.className = 'duration-input-cell';
    let effectsTableDurationInput = document.createElement('input');
    effectsTableDurationInput.type = 'number';
    effectsTableDurationInput.style.maxWidth = '5rem';
    effectsTableDurationInputCell.appendChild(effectsTableDurationInput);
    effectsTableInputRow.appendChild(effectsTableDurationInputCell);
    let concentratingInputCell = document.createElement('td');
    concentratingInputCell.className = 'concentrating-input-cell';
    concentratingInputCell.style.display = 'flex';
    concentratingInputCell.style.justifyContent = 'center';
    let concentrateCheck = document.createElement('input');
    concentrateCheck.type = 'checkbox';
    concentrateCheck.className = 'concentrate-checkbox';
    concentrateCheck.style.marginLeft = '0px';
    concentrateCheck.style.verticalAlign = 'middle';
    concentrateCheck.style.transform = 'scale(1.5)';
    concentratingInputCell.appendChild(concentrateCheck);
    effectsTableInputRow.appendChild(concentratingInputCell);
    let effectsTableSetBtnCell = document.createElement('td');
    effectsTableSetBtnCell.className = 'btn-cell';
    let effectsTableSetBtn = document.createElement('button');
    effectsTableSetBtn.type = 'button';
    effectsTableSetBtn.innerText = 'Set';
    effectsTableSetBtn.addEventListener('click', setButtonClicked);
    effectsTableSetBtnCell.appendChild(effectsTableSetBtn);
    effectsTableInputRow.appendChild(effectsTableSetBtnCell);
    effectsTable.appendChild(effectsTableInputRow);
    if (effectsTable.style.display == 'none') {
        effectsTable.style.display = 'block';
    }
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
    effectsTableRowDeleteBtn.innerText = 'Delete';
    effectsTableRowDeleteBtn.addEventListener('click', removeButtonClicked);
    buttonCell.appendChild(effectsTableRowDeleteBtn);
}

function modifyCharacterCardStyle(characterCard) {
    characterCard.querySelector('.combatant-card__left-bit').style.borderBottomLeftRadius = '0px';
    characterCard.querySelector('.combatant-card__right-bit').style.borderBottomRightRadius = '0px';
}

function removeButtonClicked(clickEvent) {
    // We need to get the effects table before we remove the row
    let effectsTable = clickEvent.target.closest('table');
    clickEvent.target.closest('tr').remove();
    if (effectsTable.querySelector('td') == null) {
        effectsTable.style.display = 'none';
    }
}

function checkIsConcentrating(combatantCard) {
    console.log(combatantCard);
    console.log(combatantCard.nextElementSibling);
    console.log(combatantCard.nextElementSibling.querySelector('.concentrate-checkbox'));
    console.log(combatantCard.nextElementSibling.querySelector('.concentrate-checkbox').checked);

    if (combatantCard.nextElementSibling.querySelector('.concentrate-checkbox').checked) {
        const characterName = combatantCard.querySelector('.combatant-summary__name').textContent;
        alert(`CHECK ${characterName} CONCENTRATE`);
    }
}