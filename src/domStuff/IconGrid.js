// iconGrid.js
export function setupIconGrid(containerId, icons, onClickHandler) {
    const container = document.getElementById(containerId);
    if (!container) return console.warn(`Container ${containerId} not found`);

    container.innerHTML = ''; // clear existing content

    // const iconSection = document.getElementById('icon-section');
    // const iconGrid = document.getElementById('icon-grid');

    // iconGrid.addEventListener('wheel', (e) => {
    //     const sectionRect = iconSection.getBoundingClientRect();

    //     const isFullyVisible =
    //         sectionRect.top <= 0 &&
    //         sectionRect.bottom >= window.innerHeight;

    //     const canScrollDown =
    //         iconGrid.scrollTop + iconGrid.clientHeight < iconGrid.scrollHeight;
    //     const canScrollUp = iconGrid.scrollTop > 0;

    //     // Determine scroll direction
    //     const scrollDown = e.deltaY > 0;
    //     const scrollUp = e.deltaY < 0;

    //     if (!isFullyVisible) {
    //         // Let page scroll if section not fully visible or grid can't scroll in that direction
    //         return;
    //     }

    //     // Otherwise, allow the grid to scroll and stop the page from scrolling
    //     e.stopPropagation();
    // }, { passive: false });

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
