// iconGrid.js
export function setupIconGrid(containerId, icons, onClickHandler) {
    const container = document.getElementById(containerId);
    if (!container) return console.warn(`Container ${containerId} not found`);

    container.innerHTML = ''; // clear existing content

    const iconsReverse = [...icons].reverse(); // Reverse the icons array
    iconsReverse.forEach(icon => {
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
        wrapper.onmousedown = (e) => {
            if (e.button !== 0) return; // Only handle left mouse button
            holdTimer = setTimeout(() => {
                icon.locked = !icon.locked; // Lock the icon
                if(icon.locked) {
                img.style.outline = '2px solid red'; // Change border to red
                } else {
                img.style.outline = ''; // Remove border
                }
            }, 800);
        };

        wrapper.addEventListener('mouseup', () => {
            clearTimeout(holdTimer);
        });

        wrapper.addEventListener('mouseleave', () => {
            clearTimeout(holdTimer);
        });

        wrapper.addEventListener('click', () => {
            if (icon.locked) return; // Ignore clicks on locked icons
            onClickHandler(icon, img);
            wrapper.remove(); // remove whole card container
            //add  white border to the icon
            // img.style.border = '2px solid white';
            // img.style.borderRadius = '5px';
            // img.style.boxShadow = '0 0 10px rgba(255, 255, 255, 0.5)';
            // img.style.transition = 'all 0.3s ease';
            // img.style.transform = 'scale(1.1)'; // slightly enlarge the icon
        });

        wrapper.appendChild(img);
        wrapper.appendChild(label);
        container.appendChild(wrapper);
    });

    return container;
}

export function setupReleaseButton(onClickHandler) {
    const button = document.getElementById('clear-cards-btn');
    button .addEventListener('click', () => {
        onClickHandler();
    });
    return document.getElementById('clear-cards-btn');
}
