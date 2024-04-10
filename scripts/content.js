
const body_mutation_config = { attribute: true, childList: true, subtree: true, characterData: true, characterDataOldValue: true };

const body_mutation_callback = (mutation_list, observer) => {
    for (const mutation of mutation_list) {
        //console.log(mutation);
        if (mutation.type === "childList") {
            if (mutation.target.className === 'combat-tracker__combatants') {
                if (mutation.addedNodes.length == 1 && mutation.addedNodes[0].className == 'combatants combatants--all') {
                    let characterIndex = 0;
                    for (const combatantCardDetails of document.getElementsByClassName('combatant-summary__details')) {
                        if (combatantCardDetails.parentElement.parentElement.className.includes('combatant-card--character')) {
                            let extensionDiv = createExtensionsDiv();
                            createConcentrateCheckBox(extensionDiv, characterIndex);
                            combatantCardDetails.insertAdjacentElement('beforeEnd', extensionDiv);
                            characterIndex++;
                        }
                    }
                }
            }
        }
        else if (mutation.type === 'characterData') {
            if (mutation.target.parentElement.className == 'combatant-card__hp-current') {

                // If current value is smaller athan previous, we have lost HP
                if (parseInt(mutation.target.data) < parseInt(mutation.oldValue)) {
                    let characterCard = mutation.target.parentElement.closest('.combatant-card');
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

function createExtensionsDiv() {
    let extensionDiv = document.createElement('div');
    extensionDiv.className = 'extensions-div';
    return extensionDiv;
}

function createConcentrateCheckBox(extensionDiv, characterIndex) {
    let concentrateCheck = document.createElement('input');
    concentrateCheck.type = 'checkbox';
    concentrateCheck.id = 'concentrateCheck' + characterIndex;
    concentrateCheck.className = 'concentrate-checkbox';
    concentrateCheck.style.marginLeft = '0px';
    concentrateCheck.style.verticalAlign = 'middle';
    extensionDiv.appendChild(concentrateCheck);
    let concentrateCheckLabel = document.createElement('label');
    concentrateCheckLabel.textContent = 'Concentrating';
    concentrateCheckLabel.htmlFor = 'concentrateCheck' + characterIndex;
    concentrateCheckLabel.style.color = '#738694';
    concentrateCheckLabel.style.fontWeight = '700';
    concentrateCheckLabel.style.letterSpacing = '1px';
    concentrateCheckLabel.style.verticalAlign = 'bottom';
    extensionDiv.appendChild(concentrateCheckLabel);
}

function checkIsConcentrating(combatantCard) {
    if (combatantCard.querySelector('.concentrate-checkbox').checked) {
        const characterName = combatantCard.querySelector('.combatant-summary__name').textContent;
        alert(`CHECK ${characterName} CONCENTRATE`);
    }
}