// iconGrid.js
let iconGrid = null;
export function setupIconGrid(containerId, icons, onClickHandler) {
    const container = document.getElementById(containerId);
    iconGrid = container;
    if (!container) return console.warn(`Container ${containerId} not found`);

    iconGrid.addEventListener('mousedown', (e) => {
        e.stopPropagation();
        e.preventDefault();
    })
    iconGrid.addEventListener('mouseup', (e) => {
        e.stopPropagation();
        e.preventDefault();
    })

    container.innerHTML = ''; // clear existing content

    //const iconsReverse = [...icons].reverse(); // Reverse the icons array
    icons.forEach(icon => {
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

    wrapper.appendChild(img);
    wrapper.appendChild(label);
    iconGrid.appendChild(wrapper);

    let draggedCard = null;

    wrapper.addEventListener('dragstart', (e) => {
        draggedCard = wrapper;
        console.log(draggedCard);
        e.dataTransfer.effectAllowed = 'move';
        setTimeout(() => wrapper.style.display = 'none', 0); // hide original
    });

    wrapper.addEventListener('dragend', () => {
        console.log('dragend', draggedCard);
        draggedCard.style.display = 'block';
        draggedCard = null;
    });

    wrapper.addEventListener('dragover', (e) => {
        e.preventDefault(); // necessary to allow dropping
        e.dataTransfer.dropEffect = 'move';
    });

    // wrapper.addEventListener('drop', (e) => {
    //     e.preventDefault();
    //     console.log('card', draggedCard, 'wrapper', wrapper, wrapper.parentNode);
    //     if (draggedCard && draggedCard !== wrapper) {
    //         const parent = wrapper.parentNode;
    //         parent.insertBefore(draggedCard, wrapper);
    //     }
    // });


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

    wrapper.addEventListener('mouseup', (e) => {
        if (e.button !== 0) return;
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

}



export function setupReleaseButton(onClickHandler) {
    const button = document.getElementById('clear-cards-btn');
    button.addEventListener('mousedown', (e) => {
        e.stopPropagation();
        e.preventDefault();
        button.blur();
        onClickHandler();
    });
    return document.getElementById('clear-cards-btn');
}

export function setupSortButton(onClickHandler) {
    const button = document.getElementById('sortCards-btn');
    button.addEventListener('mousedown', (e) => {
        e.stopPropagation();
        e.preventDefault();
        button.blur();
        onClickHandler();
    });
    return button;
}
