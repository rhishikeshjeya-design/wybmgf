let selectedIconElement = document.getElementById('drag-icon');
let currentX = 0;
let currentY = 0;
let initialX = 0;
let initialY = 0;
let xOffset = 0;
let yOffset = 0;
let isDragging = false;

// Function to handle switching between pages
function nextScreen(screenNumber) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById('screen' + screenNumber).classList.add('active');
}

// Store the chosen icon and move to screen 3
function selectIcon(icon) {
    selectedIconElement.innerText = icon;
    nextScreen(3);
    initializeDragAndDrop();
}

function initializeDragAndDrop() {
    const dragIcon = document.getElementById('drag-icon');
    const container = document.getElementById('screen3');

    // Reset positions if returning to this screen
    xOffset = 0;
    yOffset = 0;
    setTranslate(0, 0, dragIcon);

    // Mouse Events
    container.addEventListener('mousedown', dragStart, false);
    container.addEventListener('mousemove', drag, false);
    window.addEventListener('mouseup', dragEnd, false);

    // Touch Events (For Mobile/Tablets)
    container.addEventListener('touchstart', dragStart, { passive: false });
    container.addEventListener('touchmove', drag, { passive: false });
    window.addEventListener('touchend', dragEnd, false);
}

function dragStart(e) {
    const dragIcon = document.getElementById('drag-icon');
    
    // Make sure we are actually clicking/touching the drag icon
    if (e.target === dragIcon) {
        isDragging = true;
        dragIcon.style.cursor = 'grabbing';

        if (e.type === 'touchstart') {
            initialX = e.touches[0].clientX - xOffset;
            initialY = e.touches[0].clientY - yOffset;
        } else {
            initialX = e.clientX - xOffset;
            initialY = e.clientY - yOffset;
        }
    }
}

function drag(e) {
    if (!isDragging) return;
    
    e.preventDefault(); // Prevent scrolling on mobile while dragging

    const dragIcon = document.getElementById('drag-icon');

    if (e.type === 'touchmove') {
        currentX = e.touches[0].clientX - initialX;
        currentY = e.touches[0].clientY - initialY;
    } else {
        currentX = e.clientX - initialX;
        currentY = e.clientY - initialY;
    }

    xOffset = currentX;
    yOffset = currentY;

    setTranslate(currentX, currentY, dragIcon);
    
    // Check real-time distances during the drag process
    checkProximity();
}

function dragEnd() {
    if (!isDragging) return;
    
    isDragging = false;
    const dragIcon = document.getElementById('drag-icon');
    dragIcon.style.cursor = 'grab';

    // Check if successfully dropped into YES bowl
    const iconRect = dragIcon.getBoundingClientRect();
    const yesBowlRect = document.getElementById('bowl-yes').getBoundingClientRect();

    // Check for collision/overlap with YES bowl
    if (
        iconRect.left < yesBowlRect.right &&
        iconRect.right > yesBowlRect.left &&
        iconRect.top < yesBowlRect.bottom &&
        iconRect.bottom > yesBowlRect.top
    ) {
        nextScreen(4); // Trigger celebration screen!
    }
}

function setTranslate(xPos, yPos, el) {
    el.style.transform = `translate3d(${xPos}px, ${yPos}px, 0)`;
}

// THE CATCH: Calculate distance and make the NO bowl run away
function checkProximity() {
    const dragIcon = document.getElementById('drag-icon');
    const bowlNo = document.getElementById('bowl-no');

    const iconRect = dragIcon.getBoundingClientRect();
    const noRect = bowlNo.getBoundingClientRect();

    // Find the center points of both elements
    const iconCenter = {
        x: iconRect.left + iconRect.width / 2,
        y: iconRect.top + iconRect.height / 2
    };

    const noCenter = {
        x: noRect.left + noRect.width / 2,
        y: noRect.top + noRect.height / 2
    };

    // Calculate straight-line distance using the Pythagorean theorem
    const distance = Math.hypot(iconCenter.x - noCenter.x, iconCenter.y - noCenter.y);

    // If the icon gets within 100 pixels of the NO bowl, run away!
    if (distance < 120) {
        // Calculate a random target position within the safe boundaries of the screen
        const randomX = (Math.random() - 0.5) * (window.innerWidth * 0.6);
        const randomY = (Math.random() - 0.5) * (window.innerHeight * 0.4);

        // Teleport/slide the NO bowl away smoothly
        bowlNo.style.transform = `translate3d(${randomX}px, ${randomY}px, 0)`;
    }
}
