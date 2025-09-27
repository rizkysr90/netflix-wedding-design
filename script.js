// CONFIGURATION - Change these values
const CONFIG = {
    // WhatsApp number for RSVP (without + or spaces)
    // Example: '6281234567890' for Indonesian number
    whatsappNumber: '628156158013', // CHANGE THIS TO YOUR NUMBER

    // Couple names
    brideName: 'Ruby',
    groomName: 'John',

    // Optional: Change audio file URL
    audioURL: 'Westlife - Beautiful in white (Lyrics).mp3'
};
// Get guest name from URL parameter
const urlParams = new URLSearchParams(window.location.search);
const guestName = urlParams.get('to') || urlParams.get('nama') || 'Tamu Undangan';
document.getElementById('guest-name-display').textContent = guestName;

// Audio Player Controls
const audio = document.getElementById('backgroundAudio');
const playIcon = document.getElementById('playIcon');
const pauseIcon = document.getElementById('pauseIcon');
const progressBar = document.getElementById('progressBar');
const currentTimeEl = document.getElementById('currentTime');
const durationEl = document.getElementById('duration');
const volumeSlider = document.getElementById('volumeSlider');
const volumeIcon = document.getElementById('volumeIcon');
const muteIcon = document.getElementById('muteIcon');
const audioPlayer = document.getElementById('audioPlayer');

// Set initial volume
audio.volume = 0.7;

// Toggle audio player visibility
function toggleAudioPlayer() {
    audioPlayer.classList.toggle('hidden');
    if (!audioPlayer.classList.contains('hidden') && audio.paused) {
        audio.play();
        updatePlayPauseIcon();
    }
}
// Minimize/Expand player
function minimizePlayer() {
    audioPlayer.classList.add('minimized');
}

// Click on minimized player to expand
audioPlayer.addEventListener('click', (e) => {
    if (audioPlayer.classList.contains('minimized')) {
        // Only expand if clicking on the player itself or play button
        if (e.target.closest('.play-pause-btn') || e.target === audioPlayer) {
            audioPlayer.classList.remove('minimized');
        }
    }
});
// Play/Pause functionality
function togglePlay() {
    if (audio.paused) {
        audio.play();
    } else {
        audio.pause();
    }
    updatePlayPauseIcon();
}

function updatePlayPauseIcon() {
    if (audio.paused) {
        playIcon.style.display = 'block';
        pauseIcon.style.display = 'none';
    } else {
        playIcon.style.display = 'none';
        pauseIcon.style.display = 'block';
    }
}

// Update progress bar
audio.addEventListener('timeupdate', () => {
    const progress = (audio.currentTime / audio.duration) * 100;
    progressBar.style.width = progress + '%';
    currentTimeEl.textContent = formatTime(audio.currentTime);
});

// Set duration when metadata loads
audio.addEventListener('loadedmetadata', () => {
    durationEl.textContent = formatTime(audio.duration);
});

// Seek functionality
function seekAudio(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;
    const percentage = x / width;
    audio.currentTime = percentage * audio.duration;
}

// Volume control
function changeVolume(value) {
    audio.volume = value / 100;
    updateVolumeIcon();
}

function toggleMute() {
    if (audio.muted) {
        audio.muted = false;
        volumeSlider.value = audio.volume * 100;
    } else {
        audio.muted = true;
        volumeSlider.value = 0;
    }
    updateVolumeIcon();
}

function updateVolumeIcon() {
    if (audio.muted || audio.volume === 0) {
        volumeIcon.style.display = 'none';
        muteIcon.style.display = 'block';
    } else {
        volumeIcon.style.display = 'block';
        muteIcon.style.display = 'none';
    }
}

// Format time helper
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
}

// Auto-play when user clicks the main play button
document.querySelector('.play-button').addEventListener('click', (e) => {
    e.preventDefault();
    document.querySelector('#header').scrollIntoView({ behavior: 'smooth' });

    // Show audio player and start playing
    setTimeout(() => {
        audioPlayer.classList.remove('hidden');
        audio.play().catch(err => {
            console.log('Auto-play prevented:', err);
            // If autoplay is blocked, user needs to interact first
        });
        updatePlayPauseIcon();
    }, 500);
});

// Smooth scroll with active navigation
const navItems = document.querySelectorAll('.nav-item');
const sections = document.querySelectorAll('section[id]');

window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (scrollY >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });

    navItems.forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('href') === '#' + current) {
            item.classList.add('active');
        }
    });
});

// Copy to clipboard function
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        alert('Nomor rekening berhasil disalin!');
    });
}

// Intersection Observer for fade-in animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

document.querySelectorAll('.fade-in').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'all 0.8s ease-out';
    observer.observe(el);
});

// Form submission via WhatsApp
document.querySelector('.rsvp-form').addEventListener('submit', (e) => {
    e.preventDefault();

    // Get form values
    const name = document.getElementById('guestName').value;
    const message = document.getElementById('guestMessage').value;
    const attendance = document.getElementById('attendance').value;

    // Format message for WhatsApp
    const waMessage = `*RSVP Wedding ${CONFIG.groomName} & ${CONFIG.brideName}*%0A%0A` +
        `*Nama:* ${name}%0A` +
        `*Kehadiran:* ${attendance}%0A` +
        `*Ucapan:* ${message}%0A%0A` +
        `_Sent from Netflix Wedding Invitation_`;

    // Create WhatsApp URL
    const whatsappURL = `https://wa.me/${CONFIG.whatsappNumber}?text=${waMessage}`;

    // Open WhatsApp in new tab
    window.open(whatsappURL, '_blank');

    // Optional: Reset form after sending
    setTimeout(() => {
        if (confirm('Apakah pesan sudah terkirim via WhatsApp?')) {
            e.target.reset();
        }
    }, 1000);
});
// Handle visibility change to pause audio when tab is inactive
document.addEventListener('visibilitychange', () => {
    if (document.hidden && !audio.paused) {
        audio.pause();
        updatePlayPauseIcon();
    }
});

// Set the wedding date and time (YYYY, MM-1, DD, HH, MM, SS)
// Note: Month is 0-indexed (0 = January, 11 = December)
const weddingDate = new Date(2025, 11, 25, 10, 0, 0); // December 25, 2025, 10:00 AM

function updateCountdown() {
    const now = new Date().getTime();
    const distance = weddingDate.getTime() - now;

    // Calculate time units
    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    // Update the display
    document.getElementById("days").innerHTML = days.toString().padStart(2, '0');
    document.getElementById("hours").innerHTML = hours.toString().padStart(2, '0');
    document.getElementById("minutes").innerHTML = minutes.toString().padStart(2, '0');
    document.getElementById("seconds").innerHTML = seconds.toString().padStart(2, '0');

    // If countdown is finished
    if (distance < 0) {
        document.getElementById("days").innerHTML = "00";
        document.getElementById("hours").innerHTML = "00";
        document.getElementById("minutes").innerHTML = "00";
        document.getElementById("seconds").innerHTML = "00";

        // Optional: Show a message when countdown reaches zero
        // document.querySelector('.countdown-container').innerHTML = '<div style="color: #e50914; font-size: 1.5rem; font-weight: bold;">The Big Day is Here! 🎉</div>';
    }
}

// Update countdown every second
updateCountdown(); // Run once immediately
setInterval(updateCountdown, 1000);