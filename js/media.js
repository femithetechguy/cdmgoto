// Media Page Specific JavaScript - Extends Global Functionality

(function() {
    'use strict';

    // Media page initialization
    function initMediaPage() {
        console.log('Media page JavaScript loaded');
        
        // Add media-specific functionality
        initTimerFeatures();
        initChecklistFunctionality();
        initEquipmentStatus();
        initEmergencyProtocols();
        initProcessTimeline();
        addMediaPageAnimations();
        initSearchAndFilter();
    }

    function initTimerFeatures() {
        // Add countdown timers for pre-service setup
        const preServiceItems = document.querySelectorAll('.pre-service-section .section-item');
        
        preServiceItems.forEach((item, index) => {
            const title = item.querySelector('h3');
            if (title) {
                // Extract timing from content
                const content = item.querySelector('p').textContent;
                const timeMatch = content.match(/(\d+)\s*min/i);
                
                if (timeMatch) {
                    const minutes = parseInt(timeMatch[1]);
                    addTimerButton(item, minutes, title.textContent);
                }
            }
        });
    }

    function addTimerButton(item, minutes, taskName) {
        const timerContainer = document.createElement('div');
        timerContainer.className = 'timer-container';
        timerContainer.innerHTML = `
            <button class="timer-btn" onclick="startTaskTimer(${minutes}, '${taskName}')">
                🕐 Start ${minutes}min Timer
            </button>
            <div class="timer-display hidden" id="timer-${minutes}">
                <span class="timer-text">Time Remaining: </span>
                <span class="timer-countdown">00:00</span>
                <button class="stop-timer" onclick="stopTaskTimer(${minutes})">Stop</button>
            </div>
        `;
        
        item.appendChild(timerContainer);
    }

    function initChecklistFunctionality() {
        // Add interactive checkboxes to process lists
        const processLists = document.querySelectorAll('.content-list');
        
        processLists.forEach(list => {
            const items = list.querySelectorAll('li');
            items.forEach((item, index) => {
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.className = 'process-checkbox';
                checkbox.id = `process-${Date.now()}-${index}`;
                
                checkbox.addEventListener('change', function() {
                    if (this.checked) {
                        item.classList.add('completed');
                        playCompletionSound();
                    } else {
                        item.classList.remove('completed');
                    }
                    updateProgressBar();
                });
                
                item.insertBefore(checkbox, item.firstChild);
            });
        });
        
        // Add progress bar for checklists
        addProgressBar();
    }

    function addProgressBar() {
        const progressContainer = document.createElement('div');
        progressContainer.className = 'progress-container';
        progressContainer.innerHTML = `
            <div class="progress-header">
                <h4>Overall Progress</h4>
                <span class="progress-percentage">0%</span>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: 0%"></div>
            </div>
            <div class="progress-actions">
                <button class="reset-progress" onclick="resetAllProgress()">Reset All</button>
                <button class="export-progress" onclick="exportProgress()">Export Status</button>
            </div>
        `;
        
        // Insert after hero section
        const heroSection = document.querySelector('.media-hero');
        if (heroSection && heroSection.parentNode) {
            heroSection.parentNode.insertBefore(progressContainer, heroSection.nextSibling);
        }
    }

    function updateProgressBar() {
        const checkboxes = document.querySelectorAll('.process-checkbox');
        const checkedBoxes = document.querySelectorAll('.process-checkbox:checked');
        const percentage = checkboxes.length > 0 ? Math.round((checkedBoxes.length / checkboxes.length) * 100) : 0;
        
        const progressFill = document.querySelector('.progress-fill');
        const progressPercentage = document.querySelector('.progress-percentage');
        
        if (progressFill && progressPercentage) {
            progressFill.style.width = percentage + '%';
            progressPercentage.textContent = percentage + '%';
            
            // Change color based on progress
            if (percentage < 30) {
                progressFill.style.background = '#dc3545';
            } else if (percentage < 70) {
                progressFill.style.background = '#ffc107';
            } else {
                progressFill.style.background = '#28a745';
            }
        }
    }

    function initEquipmentStatus() {
        // Add equipment status indicators
        const equipmentItems = document.querySelectorAll('.equipment-grid .grid-item');
        
        equipmentItems.forEach(item => {
            const statusIndicator = document.createElement('div');
            statusIndicator.className = 'equipment-status';
            statusIndicator.innerHTML = `
                <div class="status-indicator online" title="Status: Online">
                    <span class="status-dot"></span>
                    <span class="status-text">Online</span>
                </div>
                <button class="check-equipment" onclick="checkEquipmentStatus(this)">Check Status</button>
            `;
            
            item.appendChild(statusIndicator);
        });
    }

    function initEmergencyProtocols() {
        // Add quick access emergency buttons
        const emergencyContainer = document.createElement('div');
        emergencyContainer.className = 'emergency-quick-access';
        emergencyContainer.innerHTML = `
            <div class="emergency-header">
                <h3>🚨 Emergency Quick Access</h3>
                <p>Click for immediate action steps</p>
            </div>
            <div class="emergency-buttons">
                <button class="emergency-btn audio-fail" onclick="showEmergencyProtocol('audio')">
                    🎵 Audio Failure
                </button>
                <button class="emergency-btn stream-down" onclick="showEmergencyProtocol('stream')">
                    📡 Stream Down
                </button>
                <button class="emergency-btn projector-fail" onclick="showEmergencyProtocol('projector')">
                    📽️ Projector Issue
                </button>
                <button class="emergency-btn mic-fail" onclick="showEmergencyProtocol('mic')">
                    🎤 Mic Failure
                </button>
            </div>
        `;
        
        // Insert after troubleshooting list
        const troubleshootingList = document.querySelector('.troubleshooting-list');
        if (troubleshootingList && troubleshootingList.parentNode) {
            troubleshootingList.parentNode.insertBefore(emergencyContainer, troubleshootingList.nextSibling);
        }
    }

    function initProcessTimeline() {
        // Add visual timeline for service procedures
        const timelineContainer = document.createElement('div');
        timelineContainer.className = 'service-timeline';
        timelineContainer.innerHTML = `
            <h3>📅 Service Timeline</h3>
            <div class="timeline">
                <div class="timeline-item" data-time="-90">
                    <div class="timeline-marker"></div>
                    <div class="timeline-content">
                        <strong>90 min before</strong>
                        <p>Power up & gear check</p>
                    </div>
                </div>
                <div class="timeline-item" data-time="-60">
                    <div class="timeline-marker"></div>
                    <div class="timeline-content">
                        <strong>60 min before</strong>
                        <p>A/V system test</p>
                    </div>
                </div>
                <div class="timeline-item" data-time="-45">
                    <div class="timeline-marker"></div>
                    <div class="timeline-content">
                        <strong>45 min before</strong>
                        <p>Video camera setup</p>
                    </div>
                </div>
                <div class="timeline-item" data-time="-30">
                    <div class="timeline-marker"></div>
                    <div class="timeline-content">
                        <strong>30 min before</strong>
                        <p>Presentation prep</p>
                    </div>
                </div>
                <div class="timeline-item" data-time="-5">
                    <div class="timeline-marker active"></div>
                    <div class="timeline-content">
                        <strong>5 min before</strong>
                        <p>Start live stream</p>
                    </div>
                </div>
                <div class="timeline-item" data-time="0">
                    <div class="timeline-marker service"></div>
                    <div class="timeline-content">
                        <strong>Service Start</strong>
                        <p>Live operations</p>
                    </div>
                </div>
            </div>
            <div class="timeline-controls">
                <button onclick="setCurrentTime()">Set Current Time</button>
                <button onclick="resetTimeline()">Reset Timeline</button>
            </div>
        `;
        
        // Insert after pre-service section
        const preServiceSection = document.querySelector('.pre-service-section');
        if (preServiceSection && preServiceSection.parentNode) {
            preServiceSection.parentNode.insertBefore(timelineContainer, preServiceSection.nextSibling);
        }
    }

    function addMediaPageAnimations() {
        // Add scroll-triggered animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                    
                    // Special animation for equipment grid
                    if (entry.target.classList.contains('equipment-grid')) {
                        animateEquipmentGrid(entry.target);
                    }
                }
            });
        }, observerOptions);

        // Observe sections for animation
        const animateElements = document.querySelectorAll('.sop-details, .pre-service-section, .live-service-section, .post-service-section, .equipment-grid, .pro-tips-section');
        animateElements.forEach(el => {
            observer.observe(el);
        });
    }

    function animateEquipmentGrid(gridContainer) {
        const gridItems = gridContainer.querySelectorAll('.grid-item');
        gridItems.forEach((item, index) => {
            setTimeout(() => {
                item.style.transform = 'translateY(0)';
                item.style.opacity = '1';
            }, index * 100);
        });
    }

    function initSearchAndFilter() {
        // Add search and filter functionality
        const searchContainer = document.createElement('div');
        searchContainer.className = 'media-search-filter';
        searchContainer.innerHTML = `
            <div class="search-filter-header">
                <h3>🔍 Quick Search & Filter</h3>
            </div>
            <div class="search-filter-controls">
                <input type="text" id="media-search" placeholder="Search procedures, equipment, or protocols..." class="search-input">
                <select id="media-filter" class="filter-select">
                    <option value="all">All Sections</option>
                    <option value="pre-service">Pre-Service</option>
                    <option value="live-service">Live Service</option>
                    <option value="post-service">Post-Service</option>
                    <option value="equipment">Equipment</option>
                    <option value="emergency">Emergency</option>
                    <option value="training">Training</option>
                </select>
                <button onclick="clearSearch()" class="clear-search">Clear</button>
            </div>
        `;
        
        // Insert after hero section
        const heroSection = document.querySelector('.media-hero');
        if (heroSection && heroSection.parentNode) {
            heroSection.parentNode.insertBefore(searchContainer, heroSection.nextSibling);
        }
        
        // Add event listeners
        document.getElementById('media-search').addEventListener('input', debounce(performMediaSearch, 300));
        document.getElementById('media-filter').addEventListener('change', performMediaSearch);
    }

    function performMediaSearch() {
        const searchTerm = document.getElementById('media-search').value.toLowerCase();
        const filterValue = document.getElementById('media-filter').value;
        
        const allSections = document.querySelectorAll('.content-section, .sop-details, .pre-service-section, .live-service-section, .post-service-section, .equipment-grid, .cards-container, .list-container, .pro-tips-section');
        
        allSections.forEach(section => {
            let shouldShow = true;
            
            // Filter by category
            if (filterValue !== 'all') {
                shouldShow = section.classList.contains(filterValue + '-section') || 
                           section.classList.contains(filterValue + '-grid') ||
                           section.classList.contains(filterValue + '-list');
            }
            
            // Filter by search term
            if (shouldShow && searchTerm) {
                const text = section.textContent.toLowerCase();
                shouldShow = text.includes(searchTerm);
            }
            
            // Show/hide section with animation
            if (shouldShow) {
                section.style.display = 'block';
                section.classList.add('search-match');
            } else {
                section.style.display = 'none';
                section.classList.remove('search-match');
            }
        });
    }

    // Global functions for timer and emergency features
    window.startTaskTimer = function(minutes, taskName) {
        const timerDisplay = document.getElementById(`timer-${minutes}`);
        const countdownElement = timerDisplay.querySelector('.timer-countdown');
        const timerBtn = timerDisplay.previousElementSibling;
        
        let timeLeft = minutes * 60; // Convert to seconds
        
        timerBtn.style.display = 'none';
        timerDisplay.classList.remove('hidden');
        
        const interval = setInterval(() => {
            const mins = Math.floor(timeLeft / 60);
            const secs = timeLeft % 60;
            
            countdownElement.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
            
            if (timeLeft <= 0) {
                clearInterval(interval);
                countdownElement.textContent = 'COMPLETE!';
                countdownElement.style.color = '#28a745';
                playCompletionSound();
                showNotification(`${taskName} timer completed!`);
            }
            
            timeLeft--;
        }, 1000);
        
        // Store interval for cleanup
        timerDisplay.dataset.interval = interval;
    };

    window.stopTaskTimer = function(minutes) {
        const timerDisplay = document.getElementById(`timer-${minutes}`);
        const timerBtn = timerDisplay.previousElementSibling;
        const interval = timerDisplay.dataset.interval;
        
        if (interval) {
            clearInterval(interval);
        }
        
        timerDisplay.classList.add('hidden');
        timerBtn.style.display = 'block';
    };

    window.showEmergencyProtocol = function(type) {
        const protocols = {
            audio: 'Switch to backup feed → Use handheld mic → Check connections',
            stream: 'Check internet → Restart streaming software → Switch to backup platform',
            projector: 'Check HDMI connections → Toggle input source → Use backup monitor',
            mic: 'Hand backup handheld mic → Mute original channel → Use podium mic if available'
        };
        
        const protocol = protocols[type];
        if (protocol) {
            showNotification(`Emergency Protocol: ${protocol}`, 'emergency');
        }
    };

    window.checkEquipmentStatus = function(button) {
        const statusIndicator = button.previousElementSibling;
        const statusDot = statusIndicator.querySelector('.status-dot');
        const statusText = statusIndicator.querySelector('.status-text');
        
        // Simulate status check
        button.textContent = 'Checking...';
        button.disabled = true;
        
        setTimeout(() => {
            const isOnline = Math.random() > 0.2; // 80% chance of being online
            
            if (isOnline) {
                statusIndicator.className = 'status-indicator online';
                statusText.textContent = 'Online';
                statusDot.style.backgroundColor = '#28a745';
            } else {
                statusIndicator.className = 'status-indicator offline';
                statusText.textContent = 'Offline';
                statusDot.style.backgroundColor = '#dc3545';
            }
            
            button.textContent = 'Check Status';
            button.disabled = false;
        }, 1500);
    };

    window.resetAllProgress = function() {
        const checkboxes = document.querySelectorAll('.process-checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.checked = false;
            checkbox.closest('li').classList.remove('completed');
        });
        updateProgressBar();
        showNotification('Progress reset successfully!');
    };

    window.exportProgress = function() {
        const checkboxes = document.querySelectorAll('.process-checkbox');
        const checkedBoxes = document.querySelectorAll('.process-checkbox:checked');
        
        const progressData = {
            timestamp: new Date().toISOString(),
            total: checkboxes.length,
            completed: checkedBoxes.length,
            percentage: Math.round((checkedBoxes.length / checkboxes.length) * 100),
            completedTasks: Array.from(checkedBoxes).map(cb => {
                const li = cb.closest('li');
                const title = li.querySelector('strong');
                return title ? title.textContent : li.textContent.substring(0, 50);
            })
        };
        
        const dataStr = JSON.stringify(progressData, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `media-progress-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        showNotification('Progress exported successfully!');
    };

    window.clearSearch = function() {
        document.getElementById('media-search').value = '';
        document.getElementById('media-filter').value = 'all';
        performMediaSearch();
    };

    // Utility functions
    function playCompletionSound() {
        // Create a simple completion sound
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.1);
        
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.2);
    }

    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(initMediaPage, 100);
        });
    } else {
        setTimeout(initMediaPage, 100);
    }

})();