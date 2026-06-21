// --- GLOBAL ANIMATION & DRAG VARIABLES ---
let currentX = 0;
let currentY = 0;
let initialX = 0;
let initialY = 0;
let xOffset = 0;
let yOffset = 0;
let isDragging = false;
let animationFrameId;

// --- SCREEN NAVIGATION SYSTEM ---
function nextScreen(screenNumber) {
    // Hide all active screens by removing the active class
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    // Reveal the targeted screen
    const targetScreen = document.getElementById('screen' + screenNumber);
    if (targetScreen) {
        targetScreen.classList.add('active');
    }
}

// Store the chosen icon and move to screen 3
function selectIcon(icon) {
    const selectedIconElement = document.getElementById('drag-icon');
    if (selectedIconElement) {
        selectedIconElement.innerText = icon;
    }
    nextScreen(3);
    initializeDragAndDrop();
}

// --- DRAG AND DROP ENGINE ---
function initializeDragAndDrop() {
    const dragIcon = document.getElementById('drag-icon');
    const container = document.getElementById('screen3');

    if (!container || !dragIcon) return;

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
    
    e.preventDefault(); // Prevent scrolling on mobile devices while dragging

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
    checkProximity();
}

function dragEnd() {
    if (!isDragging) return;
    
    isDragging = false;
    const dragIcon = document.getElementById('drag-icon');
    if (!dragIcon) return;
    
    dragIcon.style.cursor = 'grab';

    const iconRect = dragIcon.getBoundingClientRect();
    const yesBowlRect = document.getElementById('bowl-yes').getBoundingClientRect();

    // Collision check with the YES bowl
    if (
        iconRect.left < yesBowlRect.right &&
        iconRect.right > yesBowlRect.left &&
        iconRect.top < yesBowlRect.bottom &&
        iconRect.bottom > yesBowlRect.top
    ) {
        nextScreen(4); 
        launchConfetti(); 
        startHeartAnimation();
    }
}

function setTranslate(xPos, yPos, el) {
    el.style.transform = `translate3d(${xPos}px, ${yPos}px, 0)`;
}

// Calculate distance and make the NO bowl run away
function checkProximity() {
    const dragIcon = document.getElementById('drag-icon');
    const bowlNo = document.getElementById('bowl-no');

    if (!dragIcon || !bowlNo) return;

    const iconRect = dragIcon.getBoundingClientRect();
    const noRect = bowlNo.getBoundingClientRect();

    const iconCenter = {
        x: iconRect.left + iconRect.width / 2,
        y: iconRect.top + iconRect.height / 2
    };

    const noCenter = {
        x: noRect.left + noRect.width / 2,
        y: noRect.top + noRect.height / 2
    };

    const distance = Math.hypot(iconCenter.x - noCenter.x, iconCenter.y - noCenter.y);

    if (distance < 120) {
        const randomX = (Math.random() - 0.5) * (window.innerWidth * 0.6);
        const randomY = (Math.random() - 0.5) * (window.innerHeight * 0.4);

        bowlNo.style.transform = `translate3d(${randomX}px, ${randomY}px, 0)`;
    }
}

// --- CELEBRATION EFFECTS ---
function launchConfetti() {
    confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#ff4d6d', '#ffb3c1', '#ffffff', '#ffd100'],
        gravity: 1.2
    });

    setTimeout(() => {
        confetti({
            particleCount: 50,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: ['#ff4d6d', '#ffffff']
        });
    }, 250);

    setTimeout(() => {
        confetti({
            particleCount: 50,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: ['#ffb3c1', '#ffd100']
        });
    }, 400);
}

// --- NEON HEART COLLAGE ENGINE ---
function startHeartAnimation() {
    const canvas = document.getElementById('heartCanvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.removeEventListener('resize', resizeCanvas); 
    window.addEventListener('resize', resizeCanvas);

    const heartPoints = [];
    const maxAttempts = 6000; 
    
    const targetCount = window.innerWidth < 600 ? 190 : 340;
    const minDist = window.innerWidth < 600 ? 15 : 20;

    let attempts = 0;

    while (heartPoints.length < targetCount && attempts < maxAttempts) {
        attempts++;
        
        let x = (Math.random() * 2.6) - 1.3;
        let y = (Math.random() * 2.8) - 1.4;

        const checkY = -y;
        const heartFormulaValue = Math.pow(x*x + checkY*checkY - 1, 3) - x*x * Math.pow(checkY, 3);
        
        if (heartFormulaValue <= 0) {
            const scale = Math.min(window.innerWidth, window.innerHeight) / 3.3;
            const posX = (window.innerWidth / 2) + x * scale;
            const posY = (window.innerHeight / 2) + (y + 0.1) * scale; 

            let tooDense = false;
            for (let p of heartPoints) {
                const dist = Math.hypot(posX - p.posX, posY - p.posY);
                if (dist < minDist) {
                    tooDense = true;
                    break;
                }
            }

            if (!tooDense) {
                heartPoints.push({
                    posX: posX,
                    posY: posY,
                    visible: false,
                    fontSize: window.innerWidth < 600 ? (9 + Math.random() * 3) : (11 + Math.random() * 3),
                    opacity: 0.85 + Math.random() * 0.15
                });
            }
        }
    }

    let currentIndex = 0;
    let lastStepTime = 0;
    const revealSpeed = 35; 

    if (animationFrameId) cancelAnimationFrame(animationFrameId);

    function drawLoop(timestamp) {
        if (!lastStepTime) lastStepTime = timestamp;

        if (timestamp - lastStepTime > revealSpeed && currentIndex < heartPoints.length) {
            const batchSize = window.innerWidth < 600 ? 3 : 5; 
            for (let i = 0; i < batchSize; i++) {
                if (currentIndex < heartPoints.length) {
                    heartPoints[currentIndex].visible = true;
                    currentIndex++;
                }
            }
            lastStepTime = timestamp;
        }

        // Wipe canvas cleanly so your us.jpg wallpaper shows through beautifully
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        heartPoints.forEach(p => {
            if (!p.visible) return;

            ctx.save();
            ctx.translate(p.posX, p.posY);

            ctx.font = `bold ${p.fontSize}px 'Segoe UI', Arial, sans-serif`;
            ctx.fillStyle = `rgba(255, 30, 75, ${p.opacity})`; 
            
            ctx.shadowColor = '#ff003c';
            ctx.shadowBlur = 4;
            
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            ctx.fillText('I love you', 0, 0);
            ctx.restore();
        });

        animationFrameId = requestAnimationFrame(drawLoop);
    }

    animationFrameId = requestAnimationFrame(drawLoop);
}
