// iconGrid.js
let iconGrid = null;
export function setupIconGrid(containerId, icons, onClickHandler) {
    const container = document.getElementById(containerId);
    iconGrid = container;
    if (!container) return console.warn(`Container ${containerId} not found`);

    container.innerHTML = ''; // clear existing content

    const iconsReverse = [...icons].reverse(); // Reverse the icons array
    iconsReverse.forEach(icon => {
        addCard(icon, onClickHandler)
    });
    return container;
}
export function addCard(icon, onClickHandler) {
    const wrapper = document.createElement('div');
    wrapper.classList.add('card');

    const img = document.createElement('img');
    img.src = icon.src;
    img.classList.add('icon');
    img.alt = icon.title ?? '';
    img.title = icon.title ?? '';
    img.money = icon.money ?? 1;
    img.style.outline = icon.locked ? '2px solid red' : ''; // Add red border if locked

    const label = document.createElement('div');
    label.classList.add('card-label');
    label.textContent = icon.money ?? '';

    let holdTimer;
    let justUnlocked = false;
    wrapper.onmousedown = (e) => {
        if (e.button !== 0) return; // Only handle left mouse button
        holdTimer = setTimeout(() => {
            icon.locked = !icon.locked; // Lock the icon
            if (icon.locked) {
                img.style.outline = '2px solid red'; // Change border to red
            } else {
                img.style.outline = ''; // Remove border
                justUnlocked = true;
            }
        }, 800);
    };

    wrapper.addEventListener('mouseup', () => {
        clearTimeout(holdTimer);
        if (icon.locked) return; // Ignore clicks on locked icons
        if (justUnlocked) {
            justUnlocked = false;
            return;
        } else {
            onClickHandler(icon, img);
            wrapper.remove(); // remove whole card container
        }
    });

    wrapper.addEventListener('mouseleave', () => {
        clearTimeout(holdTimer);
    });

    wrapper.appendChild(img);
    wrapper.appendChild(label);
    iconGrid.prepend(wrapper);
}



export function setupReleaseButton(onClickHandler) {
    const button = document.getElementById('clear-cards-btn');
    button.addEventListener('click', () => {
        onClickHandler();
    });
    return document.getElementById('clear-cards-btn');
}
