// iconGrid.js
export function setupIconGrid(containerId, icons, onClickHandler) {
    const container = document.getElementById(containerId);
    if (!container) return console.warn(`Container ${containerId} not found`);

    container.innerHTML = ''; // clear existing content

    icons.forEach(icon => {
        const wrapper = document.createElement('div');
        wrapper.classList.add('card');

        const img = document.createElement('img');
        img.src = icon.src;
        img.classList.add('icon');
        img.alt = icon.title ?? '';
        img.title = icon.title ?? '';
        img.money = icon.money ?? 1;

        const label = document.createElement('div');
        label.classList.add('card-label');
        label.textContent = icon.money ?? '';

        wrapper.appendChild(img);
        wrapper.appendChild(label);
        wrapper.addEventListener('click', () => {
            onClickHandler(icon, img);
            wrapper.remove(); // remove whole card container
        });

        container.appendChild(wrapper);
    });

    return container;
}
