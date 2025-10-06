// Homepage specific JavaScript functionality

(function() {
    'use strict';

    // Homepage initialization
    function initHomepage() {
        console.log('Homepage JavaScript loaded');
        
        // Add smooth scrolling for internal links
        addSmoothScrolling();
        
        // Initialize interactive elements
        initInteractiveElements();
        
        // Add search functionality
        initSearch();
        
        // Add animation triggers
        initAnimations();
    }

    function addSmoothScrolling() {
        // Smooth scrolling for anchor links
        document.addEventListener('click', function(e) {
            if (e.target.matches('a[href^="#"]')) {
                e.preventDefault();
                const targetId = e.target.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    }

    function initInteractiveElements() {
        // Add click handlers for grid items
        const gridItems = document.querySelectorAll('.grid-item');
        gridItems.forEach(item => {
            item.addEventListener('click', function() {
                const link = this.querySelector('.grid-link');
                if (link) {
                    const href = link.getAttribute('href');
                    if (href.startsWith('#')) {
                        // Internal navigation
                        const tabId = href.substring(1);
                        if (window.CDMUtils && window.CDMUtils.switchTab) {
                            window.CDMUtils.switchTab(tabId);
                        }
                    } else {
                        // External link
                        window.open(href, '_blank');
                    }
                }
            });
        });

        // Add hover effects for cards
        const cards = document.querySelectorAll('.card');
        cards.forEach(card => {
            card.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-5px)';
            });
            
            card.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0)';
            });
        });

        // Add click handlers for quick access items
        const quickAccessItems = document.querySelectorAll('.section-item');
        quickAccessItems.forEach(item => {
            item.addEventListener('click', function() {
                const link = this.querySelector('a');
                if (link) {
                    const href = link.getAttribute('href');
                    if (href.startsWith('#')) {
                        const tabId = href.substring(1);
                        if (window.CDMUtils && window.CDMUtils.switchTab) {
                            window.CDMUtils.switchTab(tabId);
                        }
                    }
                }
            });
        });
    }

    function initSearch() {
        // Create search functionality
        const searchContainer = document.createElement('div');
        searchContainer.className = 'homepage-search';
        searchContainer.innerHTML = `
            <h3>Quick Search</h3>
            <div class="search-box">
                <input type="text" id="homepage-search-input" class="search-input" placeholder="Search departments, resources, or documentation...">
                <button class="search-btn" onclick="performSearch()">Search</button>
            </div>
            <div id="search-results" class="search-results hidden"></div>
        `;

        // Insert search after hero section
        const heroSection = document.querySelector('.homepage-hero');
        if (heroSection && heroSection.parentNode) {
            heroSection.parentNode.insertBefore(searchContainer, heroSection.nextSibling);
        }

        // Add search input event listener
        const searchInput = document.getElementById('homepage-search-input');
        if (searchInput) {
            searchInput.addEventListener('input', debounce(performSearch, 300));
            searchInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    performSearch();
                }
            });
        }
    }

    function performSearch() {
        const searchInput = document.getElementById('homepage-search-input');
        const searchResults = document.getElementById('search-results');
        
        if (!searchInput || !searchResults) return;

        const query = searchInput.value.trim().toLowerCase();
        
        if (query.length < 2) {
            searchResults.classList.add('hidden');
            return;
        }

        // Get app config for search
        const config = window.CDMUtils ? window.CDMUtils.getConfig() : null;
        if (!config) return;

        const results = [];
        
        // Search through tabs/departments
        if (config.navigation && config.navigation.tabs) {
            config.navigation.tabs.forEach(tab => {
                if (tab.name.toLowerCase().includes(query) || 
                    tab.title.toLowerCase().includes(query)) {
                    results.push({
                        type: 'department',
                        title: tab.name,
                        description: tab.title,
                        action: () => window.CDMUtils.switchTab(tab.id)
                    });
                }
            });
        }

        // Search through departments list
        if (config.departments && config.departments.list) {
            config.departments.list.forEach(dept => {
                if (dept.toLowerCase().includes(query)) {
                    results.push({
                        type: 'department',
                        title: dept.charAt(0).toUpperCase() + dept.slice(1),
                        description: `${dept.charAt(0).toUpperCase() + dept.slice(1)} Department`,
                        action: () => window.CDMUtils.switchTab(dept)
                    });
                }
            });
        }

        displaySearchResults(results, searchResults);
    }

    function displaySearchResults(results, container) {
        if (results.length === 0) {
            container.innerHTML = '<p class="no-results">No results found</p>';
        } else {
            container.innerHTML = results.map(result => `
                <div class="search-result-item" onclick="(${result.action.toString()})()">
                    <h4>${result.title}</h4>
                    <p>${result.description}</p>
                    <span class="result-type">${result.type}</span>
                </div>
            `).join('');
        }
        
        container.classList.remove('hidden');
    }

    function initAnimations() {
        // Intersection Observer for animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, observerOptions);

        // Observe elements for animation
        const animateElements = document.querySelectorAll('.grid-item, .card, .section-item');
        animateElements.forEach(el => {
            observer.observe(el);
        });
    }

    // Utility function for debouncing
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

    // Statistics counter animation
    function animateCounters() {
        const counters = document.querySelectorAll('.stat-number');
        
        counters.forEach(counter => {
            const target = parseInt(counter.textContent);
            let current = 0;
            const increment = target / 50;
            
            const updateCounter = () => {
                if (current < target) {
                    current += increment;
                    counter.textContent = Math.floor(current);
                    requestAnimationFrame(updateCounter);
                } else {
                    counter.textContent = target;
                }
            };
            
            updateCounter();
        });
    }

    // Add some dynamic content
    function addDynamicContent() {
        // Add last updated timestamp
        const lastUpdated = document.createElement('div');
        lastUpdated.className = 'last-updated';
        lastUpdated.innerHTML = `
            <p><strong>Last Updated:</strong> ${new Date().toLocaleDateString()}</p>
        `;
        
        const contentSection = document.querySelector('.homepage-content');
        if (contentSection) {
            contentSection.appendChild(lastUpdated);
        }

        // Add quick stats if they don't exist
        const quickStats = document.createElement('div');
        quickStats.className = 'homepage-stats';
        quickStats.innerHTML = `
            <div class="stats-grid">
                <div class="stat-item">
                    <span class="stat-number">6</span>
                    <span class="stat-label">Departments</span>
                </div>
                <div class="stat-item">
                    <span class="stat-number">25</span>
                    <span class="stat-label">Resources</span>
                </div>
                <div class="stat-item">
                    <span class="stat-number">100</span>
                    <span class="stat-label">Documents</span>
                </div>
            </div>
        `;

        // Insert stats after the grid
        const grid = document.querySelector('.grid-container');
        if (grid && grid.parentNode) {
            grid.parentNode.insertBefore(quickStats, grid.nextSibling);
            
            // Animate counters after insertion
            setTimeout(animateCounters, 100);
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(() => {
                initHomepage();
                addDynamicContent();
            }, 100);
        });
    } else {
        setTimeout(() => {
            initHomepage();
            addDynamicContent();
        }, 100);
    }

    // Export functions for global access
    window.performSearch = performSearch;

})();
