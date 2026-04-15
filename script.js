const monthData = [
    { name: "JAN", color: "#ff6b6b", placeholder: "Goals" },
    { name: "FEB", color: "#fca048", placeholder: "Goals" },
    { name: "MAR", color: "#fed330", placeholder: "Goals" },
    { name: "APR", color: "#2bcbba", placeholder: "Goals" },
    { name: "MAY", color: "#45aaf2", placeholder: "Goals" },
    { name: "JUNE", color: "#4b7bec", placeholder: "Goals" },
    { name: "JULY", color: "#a55eea", placeholder: "Goals" },
    { name: "AUG", color: "#fc5c65", placeholder: "Goals" },
    { name: "SEPT", color: "#fd9644", placeholder: "Goals" },
    { name: "OCT", color: "#f7b731", placeholder: "Goals" },
    { name: "NOV", color: "#20bf6b", placeholder: "Goals" },
    { name: "DEC", color: "#0fb9b1", placeholder: "Goals" }
];

function initRoadmap() {
    const roadmapEl = document.getElementById('roadmap');
    roadmapEl.innerHTML = '';

    monthData.forEach((data, index) => {
        const monthDiv = document.createElement('div');
        monthDiv.className = 'month';

        // Load saved card color or default to data.color
        const savedCardColor = localStorage.getItem(`roadmap-card-color-${index}`);
        const cardColor = savedCardColor ? savedCardColor : data.color;

        monthDiv.innerHTML = `
            <div class="card" id="card-${index}" style="--pin-color: ${cardColor}">
                <div class="month-header">
                    <div class="month-name" id="month-name-${index}">${data.name}</div>
                    <input type="color" class="month-color-picker" id="month-color-${index}" value="${cardColor}" title="Change Month Color">
                </div>
                <div class="goals" contenteditable="true" spellcheck="false" data-placeholder="${data.placeholder}" id="goals-${index}"></div>
            </div>
            <div class="pin" id="pin-${index}" style="--pin-color: ${cardColor}"></div>
        `;

        roadmapEl.appendChild(monthDiv);

        // Handle inner components
        const cardEl = document.getElementById(`card-${index}`);
        const pinEl = document.getElementById(`pin-${index}`);
        const monthColorPicker = document.getElementById(`month-color-${index}`);

        monthColorPicker.addEventListener('input', (e) => {
            const newColor = e.target.value;
            cardEl.style.setProperty('--pin-color', newColor);
            pinEl.style.setProperty('--pin-color', newColor);
            localStorage.setItem(`roadmap-card-color-${index}`, newColor);
        });

        // Load saved goals
        const savedGoal = localStorage.getItem(`roadmap-goal-${index}`);
        const goalsDiv = document.getElementById(`goals-${index}`);
        if (savedGoal) {
            goalsDiv.innerHTML = savedGoal;
        }

        // Load completed state
        const monthNameEl = document.getElementById(`month-name-${index}`);
        const isCompleted = localStorage.getItem(`roadmap-completed-${index}`) === 'true';
        if (isCompleted) {
            monthNameEl.classList.add('completed');
        }

        // Save completed state on click
        monthNameEl.addEventListener('click', () => {
            const completed = monthNameEl.classList.toggle('completed');
            localStorage.setItem(`roadmap-completed-${index}`, completed);
        });

        // Save on input and trigger UI redraw for dynamic height changes
        goalsDiv.addEventListener('input', (e) => {
            localStorage.setItem(`roadmap-goal-${index}`, e.target.innerHTML);
            requestAnimationFrame(drawRoad);
        });
    });

    // Load saved year title
    const yearTitle = document.getElementById('year-title');
    const savedYear = localStorage.getItem('roadmap-year');
    if (savedYear) {
        yearTitle.innerText = savedYear;
    }

    // Save year title on input
    yearTitle.addEventListener('input', (e) => {
        localStorage.setItem('roadmap-year', e.target.innerText);
        requestAnimationFrame(drawRoad);
    });

    // Theme setup
    const themeToggleBtn = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');

    const savedTheme = localStorage.getItem('roadmap-theme');
    if (savedTheme === 'light') {
        document.body.classList.add('light-theme');
        updateThemeIcon(themeIcon, 'light');
    }

    themeToggleBtn.addEventListener('click', () => {
        const isLight = document.body.classList.toggle('light-theme');
        localStorage.setItem('roadmap-theme', isLight ? 'light' : 'dark');
        updateThemeIcon(themeIcon, isLight ? 'light' : 'dark');
        requestAnimationFrame(drawRoad);
    });

    // Initial draw
    setTimeout(() => {
        drawRoad();
        
        // If we're later in the year, automatically bring the current month into view
        const currentMonthIndex = new Date().getMonth();
        if (currentMonthIndex >= 7) { // August or later
            setTimeout(() => {
                const currentMonthCard = document.getElementById(`card-${currentMonthIndex}`);
                if (currentMonthCard) {
                    currentMonthCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 250);
        }
    }, 100);
}

function updateThemeIcon(icon, theme) {
    if (theme === 'light') {
        icon.innerHTML = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>';
    } else {
        icon.innerHTML = '<circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>';
    }
}

function smoothPath(points, radius) {
    if (points.length < 2) return '';
    if (points.length === 2) return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`;

    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length - 1; i++) {
        let prev = points[i - 1];
        let curr = points[i];
        let next = points[i + 1];

        let dx1 = curr.x - prev.x;
        let dy1 = curr.y - prev.y;
        let len1 = Math.hypot(dx1, dy1);
        let nDx1 = len1 ? dx1 / len1 : 0;
        let nDy1 = len1 ? dy1 / len1 : 0;

        let dx2 = next.x - curr.x;
        let dy2 = next.y - curr.y;
        let len2 = Math.hypot(dx2, dy2);
        let nDx2 = len2 ? dx2 / len2 : 0;
        let nDy2 = len2 ? dy2 / len2 : 0;

        let r = Math.min(radius, len1 / 2, len2 / 2);

        let sx = curr.x - nDx1 * r;
        let sy = curr.y - nDy1 * r;

        let ex = curr.x + nDx2 * r;
        let ey = curr.y + nDy2 * r;

        d += ` L ${sx} ${sy}`;
        d += ` Q ${curr.x} ${curr.y} ${ex} ${ey}`;
    }
    d += ` L ${points[points.length - 1].x} ${points[points.length - 1].y}`;
    return d;
}

function drawRoad() {
    const svg = document.getElementById('road-svg');
    const carSvg = document.getElementById('car-svg');
    const pins = document.querySelectorAll('.pin');
    const wrapper = document.querySelector('.roadmap-wrapper');

    if (!wrapper || pins.length === 0) return;

    svg.setAttribute('width', wrapper.offsetWidth);
    svg.setAttribute('height', wrapper.offsetHeight);
    if (carSvg) {
        carSvg.setAttribute('width', wrapper.offsetWidth);
        carSvg.setAttribute('height', wrapper.offsetHeight);
    }

    const wrapperRect = wrapper.getBoundingClientRect();

    const points = Array.from(pins).map(pin => {
        const rect = pin.getBoundingClientRect();
        return {
            x: rect.left - wrapperRect.left + rect.width / 2,
            y: rect.top - wrapperRect.top + rect.height / 2
        };
    });

    window.roadPoints = points;

    // Generate smoothed path
    const pathData = smoothPath(points, 50);

    // Ensure defs and gradients exist
    let defs = svg.querySelector('defs');
    if (!defs) {
        svg.innerHTML = `
            <defs>
                <linearGradient id="road-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#4e54c8" />
                    <stop offset="100%" stop-color="#8f94fb" />
                </linearGradient>
            </defs>
        `;
    }

    // Thick dark glowing base path
    let base = svg.querySelector('.path-base');
    if (!base) {
        base = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        base.classList.add('path-base');
        base.id = 'main-path';
        svg.appendChild(base);
    }
    const isLight = document.body.classList.contains('light-theme');

    base.setAttribute('d', pathData);
    base.setAttribute('fill', 'none');
    base.setAttribute('stroke', isLight ? '#d4d4e0' : '#1a1a24');
    base.setAttribute('stroke-width', '40');
    base.setAttribute('stroke-linejoin', 'round');
    base.setAttribute('stroke-linecap', 'round');

    // Dashed center line
    let dash = svg.querySelector('.path-dash');
    if (!dash) {
        dash = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        dash.classList.add('path-dash');
        svg.appendChild(dash);
    }
    dash.setAttribute('d', pathData);
    dash.setAttribute('fill', 'none');
    dash.setAttribute('stroke', isLight ? '#888899' : '#ffffff');
    dash.setAttribute('stroke-width', '4');
    dash.setAttribute('stroke-linejoin', 'round');
    dash.setAttribute('stroke-dasharray', '8 12');
    dash.setAttribute('stroke-linecap', 'round');
}

function spawnCar(onComplete) {
    const roadSvg = document.getElementById('road-svg');
    const carSvg = document.getElementById('car-svg');
    if (!roadSvg || !carSvg || !document.getElementById('main-path')) {
        if (onComplete) setTimeout(onComplete, 5000);
        return;
    }

    const carG = document.createElementNS('http://www.w3.org/2000/svg', 'g');

    // Drop shadow for car (using simple opacity instead of blur filter)
    const shadow = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    shadow.setAttribute('width', '28');
    shadow.setAttribute('height', '16');
    shadow.setAttribute('x', '-14');
    shadow.setAttribute('y', '-6');
    shadow.setAttribute('rx', '6');
    shadow.setAttribute('fill', 'rgba(0,0,0,0.3)');

    // Car body
    const car = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    car.setAttribute('width', '24');
    car.setAttribute('height', '12');
    car.setAttribute('x', '-12');
    car.setAttribute('y', '-6');
    car.setAttribute('rx', '4');

    // 15% chance to roll a grayscale car (white, silver, grey)
    if (Math.random() < 0.15) {
        const lightness = 30 + Math.floor(Math.random() * 70); // 30% to 100% lightness
        car.setAttribute('fill', `hsl(0, 0%, ${lightness}%)`);
    } else {
        const hue = Math.floor(Math.random() * 360);
        car.setAttribute('fill', `hsl(${hue}, 80%, 60%)`);
    }
    car.setAttribute('stroke', '#fff');
    car.setAttribute('stroke-width', '1');

    // Headlight glows (using simple shapes instead of expensive drop-shadow filters)
    const leftGlow = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    leftGlow.setAttribute('cx', '11');
    leftGlow.setAttribute('cy', '-4');
    leftGlow.setAttribute('r', '5');
    leftGlow.setAttribute('fill', 'rgba(255,255,255,0.4)');

    const rightGlow = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    rightGlow.setAttribute('cx', '11');
    rightGlow.setAttribute('cy', '4');
    rightGlow.setAttribute('r', '5');
    rightGlow.setAttribute('fill', 'rgba(255,255,255,0.4)');

    // Headlight cores
    const leftLight = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    leftLight.setAttribute('cx', '10');
    leftLight.setAttribute('cy', '-4');
    leftLight.setAttribute('r', '2');
    leftLight.setAttribute('fill', '#fff');

    const rightLight = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    rightLight.setAttribute('cx', '10');
    rightLight.setAttribute('cy', '4');
    rightLight.setAttribute('r', '2');
    rightLight.setAttribute('fill', '#fff');

    carG.appendChild(shadow);
    carG.appendChild(car);
    carG.appendChild(leftGlow);
    carG.appendChild(rightGlow);
    carG.appendChild(leftLight);
    carG.appendChild(rightLight);

    carG.style.pointerEvents = 'all';
    carG.style.cursor = 'crosshair';
    carG.style.willChange = 'transform';
    
    let exploded = false;
    carG.addEventListener('click', () => {
        if (exploded) return;
        exploded = true;
        window.trafficDestroyed = true; // Block future reschuduling
        
        // 8-bit explosion sound (quiet square wave)
        try {
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            
            osc.type = 'square';
            osc.frequency.setValueAtTime(150, audioCtx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(10, audioCtx.currentTime + 0.5);
            
            gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
            
            osc.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            
            osc.start();
            osc.stop(audioCtx.currentTime + 0.5);
        } catch (e) {
            console.log("Audio could not be played");
        }

        // Remove rotation so explosion and fire gifs are always upright
        let currentTransform = carG.getAttribute('transform');
        if (currentTransform) {
            const translateMatch = currentTransform.match(/translate\([^)]+\)/);
            if (translateMatch) {
                carG.setAttribute('transform', translateMatch[0]);
            }
        }

        // Convert the structural group to our locally generated animated GIF
        carG.innerHTML = `
            <image href="explosion.gif" x="-32" y="-32" width="64" height="64" style="pointer-events: none;" />
        `;
        
        // After the initial explosion finishes (960ms), swap to the infinitely burning wreckage fire
        setTimeout(() => {
            carG.innerHTML = `
                <image href="fire.gif" x="-32" y="-32" width="64" height="64" style="pointer-events: none;" />
            `;
        }, 960);
        
        // Remove the wreckage entirely after 5 seconds of burning
        setTimeout(() => {
            if (carG.parentNode) carG.remove();
        }, 5000);
    });

    carSvg.appendChild(carG);

    const path = document.getElementById('main-path');
    const pathLength = path.getTotalLength();
    if (pathLength === 0) {
        carG.remove();
        return;
    }

    // Speed reduced by another 15% (approx 58 - 82 seconds)
    const duration = 58800 + Math.random() * 23500;
    const startTime = performance.now();
    const passedPins = new Set();

    function animate(time) {
        if (exploded) return; // Stop advancing animation
        
        let elapsed = time - startTime;
        let progress = elapsed / duration;

        if (progress > 1) {
            carG.remove();
            if (onComplete) onComplete();
            return;
        }

        let distance = progress * pathLength;
        let point = path.getPointAtLength(distance);

        // Calculate tangent for rotation
        let nextDistance = Math.min(distance + 1, pathLength);
        let nextPoint = path.getPointAtLength(nextDistance);
        let angle = Math.atan2(nextPoint.y - point.y, nextPoint.x - point.x) * 180 / Math.PI;

        carG.setAttribute('transform', `translate(${point.x}, ${point.y}) rotate(${angle})`);

        // Collision detection for pins to trigger pulse
        if (window.roadPoints) {
            window.roadPoints.forEach((pt, index) => {
                if (!passedPins.has(index)) {
                    let dx = pt.x - point.x;
                    let dy = pt.y - point.y;
                    if (dx * dx + dy * dy < 2500) { // approx 50px radius (to account for cars cutting corners on curves)
                        passedPins.add(index);
                        const pinEl = document.getElementById(`pin-${index}`);
                        if (pinEl) {
                            pinEl.classList.remove('pulse-anim');
                            void pinEl.offsetWidth; // Trigger DOM reflow to restart animation
                            pinEl.classList.add('pulse-anim');
                        }
                    }
                }
            });
        }

        requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
}

function initCarTraffic() {
    if (window.trafficStarted) return;
    window.trafficStarted = true;
    
    function logicLoop() {
        if (window.trafficDestroyed) return; // Permanent killswitch
        
        // Wait 5-10 seconds, then spawn 1 car. 
        // When it finishes, loop.
        const delay = 5000 + Math.random() * 5000;
        setTimeout(() => {
            if (window.trafficDestroyed) return;
            spawnCar(() => {
                logicLoop();
            });
        }, delay);
    }
    
    logicLoop(); 
}

// Toolbar formatting
let lastRange = null;
let lastActiveElement = null;

document.addEventListener('selectionchange', () => {
    const sel = window.getSelection();
    if (sel.rangeCount > 0) {
        const node = sel.anchorNode;
        if (node && (node.nodeType === Node.TEXT_NODE ? node.parentElement.closest('.goals, #year-title') : (node.tagName && node.closest('.goals, #year-title')))) {
            lastRange = sel.getRangeAt(0);

            const active = node.nodeType === Node.TEXT_NODE ? node.parentElement.closest('.goals, #year-title') : node.closest('.goals, #year-title');
            if (active && active.id) {
                lastActiveElement = active.id;
            }

            // Sync toolbar UI sizes to the caret's actual formatting
            const currentSize = document.queryCommandValue('fontSize');
            if (currentSize) {
                const sizeBtns = document.querySelectorAll('.size-btn');
                sizeBtns.forEach(b => b.classList.remove('active'));
                const matchingBtn = document.querySelector(`.size-btn[data-size="${currentSize}"]`);
                if (matchingBtn) matchingBtn.classList.add('active');
            }

            // Sync font dropdown
            let currentFont = document.queryCommandValue('fontName');
            const fontSelect = document.getElementById('font-select');
            if (fontSelect) {
                if (currentFont) {
                    currentFont = currentFont.replace(/['"]/g, '');
                    let found = false;
                    for (let i = 0; i < fontSelect.options.length; i++) {
                        if (fontSelect.options[i].value && currentFont.toLowerCase().includes(fontSelect.options[i].value.toLowerCase())) {
                            fontSelect.selectedIndex = i;
                            found = true;
                            break;
                        }
                    }
                    if (!found) fontSelect.value = '';
                } else {
                    fontSelect.value = '';
                }
            }
        }
    }
});

function applyFormat(command, value, restoreFocus = false) {
    if (lastRange) {
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(lastRange);

        // Fix WebKit bug where consecutive execCommands on a collapsed caret clobber their predecessors
        if (sel.isCollapsed && value) {
            const zwsp = document.createTextNode('\u200B');
            lastRange.insertNode(zwsp);
            sel.removeAllRanges();
            const newRange = document.createRange();
            newRange.selectNodeContents(zwsp);
            sel.addRange(newRange);
        }

        document.execCommand(command, false, value);

        if (sel.rangeCount > 0) {
            lastRange = sel.getRangeAt(0); // Update lastRange immediately so the next consecutive format stacks perfectly onto this ZWSP block
        }

        if (lastActiveElement) {
            const el = document.getElementById(lastActiveElement);
            if (el) {
                el.dispatchEvent(new Event('input', { bubbles: true }));
                if (restoreFocus) el.focus();
            }
        }
    }
}

function hexToHSL(H) {
    let r = 0, g = 0, b = 0;
    if (H.length == 4) {
        r = "0x" + H[1] + H[1];
        g = "0x" + H[2] + H[2];
        b = "0x" + H[3] + H[3];
    } else if (H.length == 7) {
        r = "0x" + H[1] + H[2];
        g = "0x" + H[3] + H[4];
        b = "0x" + H[5] + H[6];
    }
    r /= 255; g /= 255; b /= 255;
    let cmin = Math.min(r, g, b), cmax = Math.max(r, g, b), delta = cmax - cmin, h = 0, s = 0, l = 0;

    if (delta == 0) h = 0;
    else if (cmax == r) h = ((g - b) / delta) % 6;
    else if (cmax == g) h = (b - r) / delta + 2;
    else h = (r - g) / delta + 4;

    h = Math.round(h * 60);
    if (h < 0) h += 360;

    l = (cmax + cmin) / 2;
    s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
    s = +(s * 100).toFixed(1);
    l = +(l * 100).toFixed(1);

    return [h, s, l];
}

function HSLToHex(h, s, l) {
    s /= 100; l /= 100;
    let c = (1 - Math.abs(2 * l - 1)) * s,
        x = c * (1 - Math.abs((h / 60) % 2 - 1)),
        m = l - c / 2, r = 0, g = 0, b = 0;

    if (0 <= h && h < 60) { r = c; g = x; b = 0; }
    else if (60 <= h && h < 120) { r = x; g = c; b = 0; }
    else if (120 <= h && h < 180) { r = 0; g = c; b = x; }
    else if (180 <= h && h < 240) { r = 0; g = x; b = c; }
    else if (240 <= h && h < 300) { r = x; g = 0; b = c; }
    else if (300 <= h && h < 360) { r = c; g = 0; b = x; }

    r = Math.round((r + m) * 255).toString(16);
    g = Math.round((g + m) * 255).toString(16);
    b = Math.round((b + m) * 255).toString(16);

    if (r.length == 1) r = "0" + r;
    if (g.length == 1) g = "0" + g;
    if (b.length == 1) b = "0" + b;

    return "#" + r + g + b;
}

function updateHarmonyColors(hex) {
    const [h, s, l] = hexToHSL(hex);

    const color1 = HSLToHex((h + 45) % 360, s, l); // Analogous right
    const color2 = HSLToHex((h + 180) % 360, s, l); // Complementary
    const color3 = HSLToHex((h + 315) % 360, s, l); // Analogous left

    const btn1 = document.getElementById('harmony_color01');
    const btn2 = document.getElementById('harmony_color02');
    const btn3 = document.getElementById('harmony_color03');

    if (btn1) btn1.style.backgroundColor = color1;
    if (btn2) btn2.style.backgroundColor = color2;
    if (btn3) btn3.style.backgroundColor = color3;
}

window.addEventListener('DOMContentLoaded', () => {
    const textColor = document.getElementById('text-color');
    const fontSelect = document.getElementById('font-select');
    const harmonyBtns = document.querySelectorAll('.harmony-btn');

    if (textColor) {
        const savedColor = localStorage.getItem('roadmap_color');
        if (savedColor) {
            textColor.value = savedColor;
        }

        textColor.addEventListener('input', (e) => {
            if (lastRange && !lastRange.collapsed) {
                applyFormat('foreColor', e.target.value, false);
            }
            updateHarmonyColors(e.target.value);
            localStorage.setItem('roadmap_color', e.target.value);
        });

        textColor.addEventListener('change', (e) => {
            if (lastRange && lastRange.collapsed) {
                applyFormat('foreColor', e.target.value, true);
            } else if (lastActiveElement) {
                const el = document.getElementById(lastActiveElement);
                if (el) el.focus();
            }
        });

        updateHarmonyColors(textColor.value); // Set initial colors
    }

    const sizeBtns = document.querySelectorAll('.size-btn');
    const sizeMap = {
        '1': '0.8rem',
        '3': '1.05rem',
        '5': '1.5rem',
        '7': '2.5rem'
    };

    if (fontSelect) {
        fontSelect.addEventListener('change', (e) => applyFormat('fontName', e.target.value, true));
    }

    sizeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const size = btn.dataset.size;
            applyFormat('fontSize', size, true);

            sizeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    harmonyBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (btn.style.backgroundColor) {
                applyFormat('foreColor', btn.style.backgroundColor, true);
            }
        });
    });

    const allToolbarBtns = document.querySelectorAll('.toolbar-btn, .harmony-btn');
    allToolbarBtns.forEach(btn => {
        if (btn.tagName.toLowerCase() === 'button') {
            btn.addEventListener('mousedown', (e) => e.preventDefault());
        }
    });

    // Small delay to ensure webfonts have applied or layout has stabilized
    setTimeout(() => {
        initRoadmap();
        initCarTraffic();
    }, 50);
});

window.addEventListener('resize', drawRoad);
