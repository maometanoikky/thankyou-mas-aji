document.addEventListener('DOMContentLoaded', () => {
    // ==========================================
    // DOM ELEMENTS
    // ==========================================
    const introScreen = document.getElementById('intro-screen');
    const modernCard = document.getElementById('modern-card');
    const openEnvelopeBtn = document.getElementById('open-envelope-btn');
    const mainContent = document.getElementById('main-content');
    
    const audioControl = document.getElementById('audio-control');
    const bgMusic = document.getElementById('bg-music');
    const visualizer = document.getElementById('visualizer');
    const audioIcon = document.getElementById('audio-icon');
    const audioStatusText = document.getElementById('audio-status-text');
    
    const headerLoveBtn = document.getElementById('header-love-btn');
    const gratitudeForm = document.getElementById('gratitude-form');
    const notesGrid = document.getElementById('notes-grid');
    const noteCountEl = document.getElementById('note-count');
    
    const canvas = document.getElementById('effects-canvas');
    const ctx = canvas.getContext('2d');

    // ==========================================
    // AUDIO CONTROLLER (INTERACTIVE PLAYBACK)
    // ==========================================
    let isMusicPlaying = false;

    bgMusic.volume = 0.4; // 0.4 volume is more pleasant and less intrusive

    function playMusic() {
        bgMusic.play().then(() => {
            isMusicPlaying = true;
            visualizer.classList.add('playing');
            if (audioIcon) {
                audioIcon.className = 'fas fa-pause';
            }
            if (audioStatusText) {
                audioStatusText.textContent = 'Playing';
            }
        }).catch(err => {
            console.log("Autoplay blocked by browser. Awaiting user interaction.", err);
        });
    }

    function pauseMusic() {
        bgMusic.pause();
        isMusicPlaying = false;
        visualizer.classList.remove('playing');
        if (audioIcon) {
            audioIcon.className = 'fas fa-play';
        }
        if (audioStatusText) {
            audioStatusText.textContent = 'Paused';
        }
    }

    function toggleMusic() {
        if (isMusicPlaying) {
            pauseMusic();
        } else {
            playMusic();
        }
    }

    // Interactive audio controller click handler
    audioControl.addEventListener('click', (e) => {
        toggleMusic();
    });

    // ==========================================
    // MODERN CARD INTERACTION (OPENING SCREEN)
    // ==========================================
    function openCard() {
        modernCard.classList.add('open');
        
        // Auto play music (triggered by user gesture)
        playMusic();
        
        // Spawn small initial confetti blast inside intro screen
        triggerBlast(window.innerWidth / 2, window.innerHeight / 2, 80);
        
        // Transition screen after card animation finishes
        setTimeout(() => {
            introScreen.classList.add('fade-out');
            mainContent.classList.add('active');
            audioControl.classList.add('visible');
            
            // Trigger a huge celebration blast on main screen
            setTimeout(() => {
                triggerBlast(window.innerWidth / 2, window.innerHeight * 0.3, 150);
            }, 400);
        }, 850);
    }

    // Trigger on button click
    openEnvelopeBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent duplicate triggers
        openCard();
    });

    // Also trigger if clicking the card itself
    modernCard.addEventListener('click', () => {
        if (!modernCard.classList.contains('open')) {
            openCard();
        }
    });

    // 3D Parallax Tilt Effect on MouseMove
    modernCard.addEventListener('mousemove', (e) => {
        const rect = modernCard.getBoundingClientRect();
        const x = e.clientX - rect.left; // x coordinate inside element
        const y = e.clientY - rect.top;  // y coordinate inside element
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        // Calculate tilt angle (max 12 degrees)
        const tiltX = ((centerY - y) / centerY) * 12;
        const tiltY = ((x - centerX) / centerX) * 12;
        
        modernCard.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-8px) scale(1.02)`;
    });

    modernCard.addEventListener('mouseleave', () => {
        modernCard.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0) scale(1)';
    });

    // ==========================================
    // CANVAS PARTICLE SYSTEM (CONFETTI & HEARTS)
    // ==========================================
    let particles = [];
    const colors = [
        '#00f2fe', '#4facfe', '#00d2ff', // Neon Cyan
        '#f355da', '#7000ff', '#b800ff', // Neon Magenta/Purple
        '#ffb300', '#ff4e00', '#ffd700', // Neon Gold/Orange
        '#ffffff'
    ];

    // Resize canvas
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    
    // Global Mouse Coordinates Tracker & Spark Spawner
    let mouse = { x: null, y: null };
    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
        
        // Spawn small sparkling trails when main screen is active
        if (mainContent.classList.contains('active') && Math.random() < 0.35) {
            spawnMouseSpark(mouse.x, mouse.y);
        }
    });
    
    window.addEventListener('mouseleave', () => {
        mouse.x = null;
        mouse.y = null;
    });

    // Constellation Stars Background
    let stars = [];
    const maxStars = 60;
    
    function initStars() {
        stars = [];
        const width = window.innerWidth;
        const height = window.innerHeight;
        for (let i = 0; i < maxStars; i++) {
            stars.push({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                radius: Math.random() * 3 + 1,
                alpha: Math.random() * 0.5 + 0.2,
                pulseSpeed: Math.random() * 0.008 + 0.003,
                pulseDir: Math.random() > 0.5 ? 1 : -1
            });
        }
    }
    
    window.addEventListener('resize', () => {
        resizeCanvas();
        initStars();
    });
    
    resizeCanvas();
    initStars();

    class Particle {
        constructor(x, y, type = 'confetti') {
            this.x = x;
            this.y = y;
            this.type = type; // 'confetti', 'heart', or 'spark'
            this.size = type === 'heart' ? Math.random() * 12 + 10 : (type === 'spark' ? Math.random() * 3 + 1.5 : Math.random() * 8 + 6);
            this.color = colors[Math.floor(Math.random() * colors.length)];
            
            // Random velocities
            const angle = Math.random() * Math.PI * 2;
            let speed;
            if (type === 'heart') {
                speed = Math.random() * 3 + 1;
            } else if (type === 'spark') {
                speed = Math.random() * 1.5 + 0.5;
            } else {
                speed = Math.random() * 6 + 2;
            }
            
            this.vx = Math.cos(angle) * speed;
            this.vy = Math.sin(angle) * speed - (type === 'heart' ? 2 : (type === 'spark' ? 0.8 : 0)); // floating upward
            
            this.gravity = type === 'heart' ? -0.02 : (type === 'spark' ? -0.01 : 0.15); // Sparks and hearts float up
            this.opacity = 1;
            this.rotation = Math.random() * 360;
            this.rotationSpeed = type === 'spark' ? 0 : (Math.random() - 0.5) * 5;
            this.decay = type === 'spark' ? Math.random() * 0.025 + 0.015 : (Math.random() * 0.015 + 0.01);
        }

        draw() {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate((this.rotation * Math.PI) / 180);
            ctx.globalAlpha = this.opacity;

            if (this.type === 'heart') {
                ctx.fillStyle = this.color;
                // Draw heart shape
                ctx.beginPath();
                const size = this.size;
                ctx.moveTo(0, size / 4);
                ctx.quadraticCurveTo(0, 0, size / 2, 0);
                ctx.quadraticCurveTo(size, 0, size, size / 4);
                ctx.quadraticCurveTo(size, size / 2, size / 2, size * 0.75);
                ctx.quadraticCurveTo(0, size / 2, 0, size / 4);
                ctx.closePath();
                ctx.fill();
            } else if (this.type === 'spark') {
                // Draw a small glowing star / round sparkle
                let grad = ctx.createRadialGradient(0, 0, 0, 0, 0, this.size * 2);
                grad.addColorStop(0, '#ffffff');
                grad.addColorStop(0.3, this.color);
                grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(0, 0, this.size * 2, 0, Math.PI * 2);
                ctx.fill();
            } else {
                ctx.fillStyle = this.color;
                // Draw standard confetti square/rectangle
                ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
            }
            
            ctx.restore();
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;
            this.vy += this.gravity;
            this.rotation += this.rotationSpeed;
            this.opacity -= this.decay;
        }
    }

    function triggerBlast(x, y, count = 80) {
        for (let i = 0; i < count; i++) {
            particles.push(new Particle(x, y, Math.random() > 0.4 ? 'confetti' : 'heart'));
        }
    }

    function spawnFloatingHearts() {
        // Spawns slow floating hearts from the bottom
        const x = Math.random() * canvas.width;
        const y = canvas.height + 20;
        const p = new Particle(x, y, 'heart');
        p.vx = (Math.random() - 0.5) * 1.5; // Slight drift
        p.vy = -Math.random() * 2 - 1.5; // Strictly upward speed
        p.decay = 0.008; // Slower fade
        particles.push(p);
    }

    function spawnGoldDust() {
        // Spawns slow moving gold/cyan sparkles on the intro screen
        const x = Math.random() * canvas.width;
        const y = canvas.height + 20;
        const p = new Particle(x, y, 'spark');
        p.vx = (Math.random() - 0.5) * 0.8;
        p.vy = -Math.random() * 1.2 - 0.4;
        p.color = Math.random() > 0.5 ? '#00f2fe' : '#f355da'; // Cyan and magenta sparks
        p.size = Math.random() * 2.5 + 1.2;
        p.decay = 0.004; // longer life
        particles.push(p);
    }

    function spawnMouseSpark(x, y) {
        const p = new Particle(x, y, 'spark');
        p.vx = (Math.random() - 0.5) * 1.8;
        p.vy = (Math.random() - 0.5) * 1.8 - 0.6;
        p.decay = Math.random() * 0.03 + 0.02; // fades quickly
        particles.push(p);
    }

    // Animation Loop
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Determine constellation intensity (fainter in main content)
        const isMainActive = mainContent.classList.contains('active');
        const intensity = isMainActive ? 0.22 : 1.0;

        // Draw Constellation Stars
        stars.forEach(s => {
            // Update position
            s.x += s.vx;
            s.y += s.vy;

            // Bounce off boundaries
            if (s.x < 0 || s.x > canvas.width) s.vx *= -1;
            if (s.y < 0 || s.y > canvas.height) s.vy *= -1;

            // Pulsing alpha
            s.alpha += s.pulseSpeed * s.pulseDir;
            if (s.alpha > 0.75 || s.alpha < 0.15) s.pulseDir *= -1;

            // Mouse attraction (magnetic effect)
            if (mouse.x !== null && mouse.y !== null) {
                let dx = mouse.x - s.x;
                let dy = mouse.y - s.y;
                let dist = Math.sqrt(dx*dx + dy*dy);
                if (dist < 150) {
                    s.x += (dx / dist) * 0.18;
                    s.y += (dy / dist) * 0.18;
                }
            }

            // Draw glowing star bokeh
            ctx.save();
            ctx.globalAlpha = s.alpha * intensity;
            let grad = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.radius * 4);
            grad.addColorStop(0, '#ffffff');
            grad.addColorStop(0.3, 'rgba(0, 242, 254, 0.4)');
            grad.addColorStop(1, 'rgba(0, 242, 254, 0)');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.radius * 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });

        // Draw Lines between stars
        for (let i = 0; i < stars.length; i++) {
            for (let j = i + 1; j < stars.length; j++) {
                let s1 = stars[i];
                let s2 = stars[j];
                let dx = s1.x - s2.x;
                let dy = s1.y - s2.y;
                let dist = Math.sqrt(dx*dx + dy*dy);

                if (dist < 110) {
                    ctx.save();
                    ctx.globalAlpha = intensity;
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(0, 242, 254, ${(1 - dist/110) * 0.16})`;
                    ctx.lineWidth = 0.5;
                    ctx.moveTo(s1.x, s1.y);
                    ctx.lineTo(s2.x, s2.y);
                    ctx.stroke();
                    ctx.restore();
                }
            }
        }

        // Draw Lines to mouse cursor
        if (mouse.x !== null && mouse.y !== null) {
            stars.forEach(s => {
                let dx = s.x - mouse.x;
                let dy = s.y - mouse.y;
                let dist = Math.sqrt(dx*dx + dy*dy);

                if (dist < 160) {
                    ctx.save();
                    ctx.globalAlpha = intensity;
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(243, 85, 218, ${(1 - dist/160) * 0.22})`;
                    ctx.lineWidth = 0.6;
                    ctx.moveTo(s.x, s.y);
                    ctx.lineTo(mouse.x, mouse.y);
                    ctx.stroke();
                    ctx.restore();
                }
            });
        }

        // Spawn particles based on current screen active state
        if (isMainActive) {
            if (Math.random() < 0.04) {
                spawnFloatingHearts();
            }
        } else {
            if (Math.random() < 0.18) {
                spawnGoldDust();
            }
        }

        particles.forEach((p, idx) => {
            p.update();
            p.draw();
            
            // Remove dead particles
            if (p.opacity <= 0 || p.x < 0 || p.x > canvas.width || p.y < -50 || p.y > canvas.height + 50) {
                particles.splice(idx, 1);
            }
        });

        requestAnimationFrame(animate);
    }
    animate();

    // Wire up "Kirim Cinta" headers & trigger particles
    headerLoveBtn.addEventListener('click', (e) => {
        const rect = headerLoveBtn.getBoundingClientRect();
        triggerBlast(rect.left + rect.width / 2, rect.top + rect.height / 2, 60);
    });

    // ==========================================
    // GRATITUDE JAR LOCALSTORAGE & INTEGRATION
    // ==========================================
    
    // Default messages to pre-populate board if empty
    const defaultNotes = [
        {
            sender: "Koordinator Pemorsian",
            message: "Terima kasih banyak Pak Aji atas bimbingannya mengenai standar gizi dan ketelitian pemorsian. Sangat bermanfaat bagi kinerja tim dapur."
        },
        {
            sender: "Rian (Tim Dapur)",
            message: "Selamat jalan Pak Aji, terima kasih sudah selalu sabar membimbing kami. Semoga sukses di tempat baru dan rezekinya selalu lancar!"
        },
        {
            sender: "Staf Pemorsian",
            message: "Terima kasih atas dedikasi dan ilmu yang telah dibagikan selama ini di SPPG Tanjung Tirto. Semoga sehat dan bahagia selalu sekeluarga."
        }
    ];

    function getStoredNotes() {
        const stored = localStorage.getItem('thank_you_notes');
        if (stored) {
            const parsed = JSON.parse(stored);
            // Force reset if old placeholder data is detected
            if (parsed.length > 0 && parsed.some(n => n.sender === "Budi Santoso")) {
                localStorage.setItem('thank_you_notes', JSON.stringify(defaultNotes));
                return defaultNotes;
            }
            return parsed;
        } else {
            // Set defaults if empty
            localStorage.setItem('thank_you_notes', JSON.stringify(defaultNotes));
            return defaultNotes;
        }
    }

    function saveNote(sender, message) {
        const notes = getStoredNotes();
        notes.unshift({ sender, message }); // Add new note at the start
        localStorage.setItem('thank_you_notes', JSON.stringify(notes));
    }

    function renderNotes() {
        const notes = getStoredNotes();
        notesGrid.innerHTML = '';
        
        notes.forEach(note => {
            const card = document.createElement('div');
            card.className = 'sticky-note';
            
            card.innerHTML = `
                <div class="note-pin"><i class="fas fa-thumbtack"></i></div>
                <p class="note-text">"${escapeHTML(note.message)}"</p>
                <div class="note-sender">— ${escapeHTML(note.sender)}</div>
            `;
            
            notesGrid.appendChild(card);
        });

        noteCountEl.textContent = notes.length;
    }

    // Helper to escape user inputs
    function escapeHTML(str) {
        return str.replace(/[&<>'"]/g, 
            tag => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                "'": '&#39;',
                '"': '&quot;'
            }[tag] || tag)
        );
    }

    // Submit form logic with flying card animation
    gratitudeForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const senderInput = document.getElementById('input-sender');
        const messageInput = document.getElementById('input-message');
        const submitBtn = gratitudeForm.querySelector('.submit-btn');
        
        const sender = senderInput.value.trim();
        const message = messageInput.value.trim();
        
        if (sender && message) {
            // Get coordinates for animation
            const startRect = submitBtn.getBoundingClientRect();
            const jarEl = document.querySelector('.gratitude-jar');
            const endRect = jarEl.getBoundingClientRect();
            
            // Create flying wish card element
            const flyingCard = document.createElement('div');
            flyingCard.className = 'flying-wish-card';
            flyingCard.innerHTML = '<i class="fas fa-envelope"></i>';
            flyingCard.style.left = `${startRect.left + startRect.width / 2 - 30}px`;
            flyingCard.style.top = `${startRect.top + startRect.height / 2 - 20}px`;
            document.body.appendChild(flyingCard);
            
            // Disable button during flight
            submitBtn.disabled = true;
            
            // Start flight path
            setTimeout(() => {
                flyingCard.style.left = `${endRect.left + endRect.width / 2 - 30}px`;
                flyingCard.style.top = `${endRect.top + endRect.height / 2 - 20}px`;
                flyingCard.classList.add('shrink');
            }, 50);
            
            // Callback when flight arrives
            setTimeout(() => {
                // Save note
                saveNote(sender, message);
                
                // Re-render notes
                renderNotes();
                
                // Trigger visual celebration over the jar location
                triggerBlast(endRect.left + endRect.width / 2, endRect.top + endRect.height / 3, 80);
                
                // Remove flying element
                flyingCard.remove();
                
                // Re-enable button
                submitBtn.disabled = false;
                
                // Clear inputs
                senderInput.value = '';
                messageInput.value = '';
                
                // Scroll down to show the new sticky note
                setTimeout(() => {
                    document.querySelector('.notes-board-wrapper').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }, 400);
            }, 850);
        }
    });

    // Initial render
    renderNotes();
});
