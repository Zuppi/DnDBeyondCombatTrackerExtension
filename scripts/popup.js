document.getElementById('dndcte_resetTrackerBtn').addEventListener('click', reset_tracker);
console.log('asd');
console.log(document.getElementById('dndcte_resetTrackerBtn'));

function reset_tracker() {
    if (confirm('Are you sure you want to reset?') == true) {
        reset_concentrates();
    }
}

function reset_concentrates() {
    console.log(document.getElementsByClassName('concentrate-checkbox'));
    for (const concentrateCheckbox of document.getElementsByClassName('concentrate-checkbox')) {
        concentrateCheckbox.checked = false;
    }
}