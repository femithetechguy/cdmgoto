// Global JavaScript for CDM Documentation Portal

class CDMApp {
    constructor() {
        this.config = null;
        this.currentTab = 'homepage';
        this.contentCache = new Map();
        this.init();
    }

    async init() {
        try {
            // Load app configuration
            await this.loadConfig();
            
            // Initialize the application
            this.setupEventListeners();
            this.generateNavigation();
            this.updateFooter();
            this.loadInitialContent();
            
            console.log('CDM Documentation Portal initialized successfully');
        } catch (error) {
            console.error('Failed to initialize app:', error);
            this.showError('Failed to load application configuration');
        }
    }

    async loadConfig() {
        try {
            const response = await fetch('./app.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.config = await response.json();
        } catch (error) {
            console.error('Error loading config:', error);
            // Fallback configuration
            this.config = this.getFallbackConfig();
        }
    }

    getFallbackConfig() {
        return {
            app: {
                name: "CDM Documentation Portal",
                version: "1.0.0"
            },
            navigation: {
                tabs: [
                    {
                        id: "homepage",
                        name: "Home",
                        title: "CDM Documentation Home",
                        active: true,
                        type: "dynamic",
                        order: 1
                    }
                ]
            }
        };
    }

    setupEventListeners() {
        // Handle tab clicks
        document.addEventListener('click', (e) => {
            if (e.target.matches('.nav-tab-link')) {
                e.preventDefault();
                const tabId = e.target.getAttribute('data-tab');
                this.switchTab(tabId);
            }
        });

        // Handle browser back/forward
        window.addEventListener('popstate', (e) => {
            if (e.state && e.state.tab) {
                this.switchTab(e.state.tab, false);
            }
        });

        // Handle window resize for responsive behavior
        window.addEventListener('resize', this.debounce(() => {
            this.handleResize();
        }, 250));
    }

    generateNavigation() {
        const navContainer = document.getElementById('navigation-tabs');
        const footerLinksContainer = document.getElementById('footer-links');
        
        if (!navContainer || !this.config.navigation) return;

        // Sort tabs by order
        const tabs = [...this.config.navigation.tabs].sort((a, b) => (a.order || 0) - (b.order || 0));

        // Generate navigation HTML
        const navHTML = tabs.map(tab => `
            <li>
                <a href="#${tab.id}" 
                   class="nav-tab-link ${tab.active ? 'active' : ''}" 
                   data-tab="${tab.id}"
                   title="${tab.title || tab.name}">
                    ${tab.icon ? `<i class="icon-${tab.icon}"></i>` : ''}
                    ${tab.name}
                </a>
            </li>
        `).join('');

        navContainer.innerHTML = navHTML;

        // Generate footer links
        if (footerLinksContainer) {
            const footerHTML = tabs.map(tab => `
                <li><a href="#${tab.id}" data-tab="${tab.id}">${tab.name}</a></li>
            `).join('');
            footerLinksContainer.innerHTML = footerHTML;
        }
    }

    async switchTab(tabId, updateHistory = true) {
        const tab = this.config.navigation.tabs.find(t => t.id === tabId);
        if (!tab) {
            console.error(`Tab not found: ${tabId}`);
            return;
        }

        // Update active states
        this.updateActiveTab(tabId);
        
        // Load tab content
        await this.loadTabContent(tab);
        
        // Update browser history
        if (updateHistory) {
            const url = new URL(window.location);
            url.hash = tabId;
            window.history.pushState({ tab: tabId }, '', url);
        }

        this.currentTab = tabId;
    }

    updateActiveTab(activeTabId) {
        // Update navigation active states
        document.querySelectorAll('.nav-tab-link').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-tab') === activeTabId) {
                link.classList.add('active');
            }
        });

        // Update config
        this.config.navigation.tabs.forEach(tab => {
            tab.active = tab.id === activeTabId;
        });
    }

    async loadTabContent(tab) {
        const contentContainer = document.getElementById('content-container');
        if (!contentContainer) return;

        // Show loading state
        this.showLoading();

        try {
            // Load and inject tab-specific styles
            await this.loadTabStyles(tab);
            
            // Load and inject tab-specific scripts
            await this.loadTabScripts(tab);
            
            // Load content based on tab configuration
            const content = await this.getTabContent(tab);
            
            // Update content
            contentContainer.innerHTML = content;
            contentContainer.classList.add('fade-in');
            
            // Update page title
            document.title = `${tab.title || tab.name} - ${this.config.app.name}`;
            
        } catch (error) {
            console.error(`Error loading tab content for ${tab.id}:`, error);
            this.showError(`Failed to load ${tab.name} content`);
        }
    }

    async loadTabStyles(tab) {
        if (!tab.styles) return;

        const styleId = `style-${tab.id}`;
        
        // Remove existing tab-specific styles
        document.querySelectorAll('[id^="style-"]').forEach(el => {
            if (el.id !== styleId) el.remove();
        });

        // Add new styles if not already loaded
        if (!document.getElementById(styleId)) {
            const link = document.createElement('link');
            link.id = styleId;
            link.rel = 'stylesheet';
            link.href = `${tab.styles.path || 'css/'}${tab.styles.file}`;
            
            return new Promise((resolve, reject) => {
                link.onload = resolve;
                link.onerror = () => {
                    console.warn(`Could not load styles for ${tab.id}`);
                    resolve(); // Don't fail the entire load for missing styles
                };
                document.head.appendChild(link);
            });
        }
    }

    async loadTabScripts(tab) {
        if (!tab.scripts) return;

        const scriptId = `script-${tab.id}`;
        
        // Remove existing tab-specific scripts
        document.querySelectorAll('[id^="script-"]').forEach(el => {
            if (el.id !== scriptId) el.remove();
        });

        // Add new script if not already loaded
        if (!document.getElementById(scriptId)) {
            const script = document.createElement('script');
            script.id = scriptId;
            script.src = `${tab.scripts.path || 'js/'}${tab.scripts.file}`;
            
            return new Promise((resolve, reject) => {
                script.onload = resolve;
                script.onerror = () => {
                    console.warn(`Could not load scripts for ${tab.id}`);
                    resolve(); // Don't fail the entire load for missing scripts
                };
                document.head.appendChild(script);
            });
        }
    }

    async getTabContent(tab) {
        const cacheKey = tab.id;
        
        // Check cache first
        if (this.contentCache.has(cacheKey)) {
            return this.contentCache.get(cacheKey);
        }

        let content = '';

        try {
            if (tab.content && tab.content.source === 'json') {
                content = await this.loadJsonContent(tab);
            } else if (tab.content && tab.content.source === 'markdown') {
                content = await this.loadMarkdownContent(tab);
            } else if (tab.content && tab.content.source === 'html') {
                content = await this.loadHtmlContent(tab);
            } else {
                content = this.getEmptyTabContent(tab);
            }
        } catch (error) {
            console.error(`Error loading content for ${tab.id}:`, error);
            content = this.getEmptyTabContent(tab);
        }

        // Cache the content
        this.contentCache.set(cacheKey, content);
        return content;
    }

    async loadJsonContent(tab) {
        try {
            const jsonFile = `${tab.content.path || 'json/'}${tab.content.file}`;
            const response = await fetch(jsonFile);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const jsonData = await response.json();
            return this.generateHtmlFromJson(jsonData, tab);
        } catch (error) {
            console.warn(`Could not load JSON for ${tab.id}:`, error);
            return this.getEmptyTabContent(tab);
        }
    }

    generateHtmlFromJson(data, tab) {
        let html = '';

        // Generate page header if title exists
        if (data.title) {
            html += `<div class="page-header">
                <h1>${data.title}</h1>
                ${data.subtitle ? `<p class="subtitle">${data.subtitle}</p>` : ''}
            </div>`;
        }

        // Generate sections
        if (data.sections && Array.isArray(data.sections)) {
            data.sections.forEach(section => {
                html += this.generateSectionHtml(section);
            });
        }

        // Generate hero section if exists
        if (data.hero) {
            html = this.generateHeroHtml(data.hero) + html;
        }

        // Generate grid sections if exists
        if (data.grid) {
            html += this.generateGridHtml(data.grid);
        }

        // Generate cards if exists
        if (data.cards && Array.isArray(data.cards)) {
            html += '<div class="cards-container">';
            data.cards.forEach(card => {
                html += this.generateCardHtml(card);
            });
            html += '</div>';
        }

        // Generate lists if exists
        if (data.lists && Array.isArray(data.lists)) {
            data.lists.forEach(list => {
                html += this.generateListHtml(list);
            });
        }

        // Wrap in content section
        return `<div class="content-section ${tab.id}-content">${html}</div>`;
    }

    generateHeroHtml(hero) {
        return `
            <div class="${hero.className || 'hero-section'}">
                ${hero.title ? `<h1>${hero.title}</h1>` : ''}
                ${hero.subtitle ? `<p class="hero-subtitle">${hero.subtitle}</p>` : ''}
                ${hero.description ? `<p class="hero-description">${hero.description}</p>` : ''}
                ${hero.buttons && Array.isArray(hero.buttons) ? 
                    hero.buttons.map(btn => 
                        `<a href="${btn.link || '#'}" class="btn ${btn.className || ''}">${btn.text}</a>`
                    ).join(' ') : ''
                }
            </div>
        `;
    }

    generateSectionHtml(section) {
        let html = `<div class="content-section ${section.className || ''}">`;
        
        if (section.title) {
            html += `<h2>${section.title}</h2>`;
        }
        
        if (section.content) {
            html += `<div class="section-content">${section.content}</div>`;
        }
        
        if (section.items && Array.isArray(section.items)) {
            html += '<div class="section-items">';
            section.items.forEach(item => {
                html += `<div class="section-item">
                    ${item.title ? `<h3>${item.title}</h3>` : ''}
                    ${item.content ? `<p>${item.content}</p>` : ''}
                    ${item.link ? `<a href="${item.link}" class="btn btn-secondary">Learn More</a>` : ''}
                </div>`;
            });
            html += '</div>';
        }
        
        html += '</div>';
        return html;
    }

    generateGridHtml(grid) {
        let html = `<div class="grid-container ${grid.className || ''}">`;
        
        if (grid.title) {
            html += `<h2 class="grid-title">${grid.title}</h2>`;
        }
        
        html += `<div class="grid ${grid.columns ? `grid-cols-${grid.columns}` : 'grid-auto'}">`;
        
        if (grid.items && Array.isArray(grid.items)) {
            grid.items.forEach(item => {
                html += `<div class="grid-item">
                    ${item.icon ? `<div class="grid-icon">${item.icon}</div>` : ''}
                    ${item.title ? `<h3>${item.title}</h3>` : ''}
                    ${item.description ? `<p>${item.description}</p>` : ''}
                    ${item.link ? `<a href="${item.link}" class="grid-link">View</a>` : ''}
                </div>`;
            });
        }
        
        html += '</div></div>';
        return html;
    }

    generateCardHtml(card) {
        return `
            <div class="card ${card.className || ''}">
                ${card.image ? `<img src="${card.image}" alt="${card.title || ''}" class="card-image">` : ''}
                <div class="card-content">
                    ${card.title ? `<h3 class="card-title">${card.title}</h3>` : ''}
                    ${card.content ? `<p class="card-text">${card.content}</p>` : ''}
                    ${card.link ? `<a href="${card.link}" class="btn card-btn">Read More</a>` : ''}
                </div>
            </div>
        `;
    }

    generateListHtml(list) {
        let html = `<div class="list-container ${list.className || ''}">`;
        
        if (list.title) {
            html += `<h3 class="list-title">${list.title}</h3>`;
        }
        
        const listType = list.type === 'ordered' ? 'ol' : 'ul';
        html += `<${listType} class="content-list">`;
        
        if (list.items && Array.isArray(list.items)) {
            list.items.forEach(item => {
                if (typeof item === 'string') {
                    html += `<li>${item}</li>`;
                } else {
                    html += `<li>
                        ${item.title ? `<strong>${item.title}</strong>` : ''}
                        ${item.content ? `<span>${item.content}</span>` : ''}
                    </li>`;
                }
            });
        }
        
        html += `</${listType}></div>`;
        return html;
    }

    async loadHtmlContent(tab) {
        try {
            const htmlFile = `${tab.content.path || ''}${tab.content.file}`;
            const response = await fetch(htmlFile);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const htmlContent = await response.text();
            return htmlContent;
        } catch (error) {
            console.warn(`Could not load HTML for ${tab.id}:`, error);
            return this.getEmptyTabContent(tab);
        }
    }

    async loadMarkdownContent(tab) {
        try {
            const markdownFile = `markdown/${tab.content.file}`;
            const response = await fetch(markdownFile);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const markdownText = await response.text();
            
            // Basic markdown to HTML conversion (you might want to use a proper markdown parser)
            return this.parseMarkdown(markdownText);
        } catch (error) {
            console.warn(`Could not load markdown for ${tab.id}:`, error);
            return this.getDefaultContent(tab);
        }
    }

    parseMarkdown(markdown) {
        // Basic markdown parsing (consider using marked.js or similar for production)
        return markdown
            .replace(/^# (.*$)/gm, '<h1>$1</h1>')
            .replace(/^## (.*$)/gm, '<h2>$1</h2>')
            .replace(/^### (.*$)/gm, '<h3>$1</h3>')
            .replace(/^\* (.*$)/gm, '<li>$1</li>')
            .replace(/\n\n/g, '</p><p>')
            .replace(/^(.+)$/gm, '<p>$1</p>')
            .replace(/<p><li>/g, '<ul><li>')
            .replace(/<\/li><\/p>/g, '</li></ul>')
            .replace(/<p><h/g, '<h')
            .replace(/<\/h([1-6])><\/p>/g, '</h$1>');
    }

    getDefaultContent(tab) {
        return this.getEmptyTabContent(tab);
    }

    getEmptyTabContent(tab) {
        return `
            <div class="content-section empty-tab">
                <div class="empty-state">
                    <div class="empty-icon">📄</div>
                    <h2>${tab.title || tab.name}</h2>
                    <p class="empty-message">This tab is ready for content!</p>
                    <div class="empty-instructions">
                        <h3>To add content, create these files:</h3>
                        <ul class="file-list">
                            <li>
                                <code>${tab.content?.path || 'json/'}${tab.content?.file || tab.id + '.json'}</code>
                                <span class="file-desc">- Page content and structure</span>
                            </li>
                            <li>
                                <code>${tab.styles?.path || 'css/'}${tab.styles?.file || tab.id + '.css'}</code>
                                <span class="file-desc">- Custom styles for this tab</span>
                            </li>
                            <li>
                                <code>${tab.scripts?.path || 'js/'}${tab.scripts?.file || tab.id + '.js'}</code>
                                <span class="file-desc">- Interactive functionality</span>
                            </li>
                        </ul>
                    </div>
                    <div class="empty-example">
                        <h4>Example JSON structure:</h4>
                        <pre class="code-block">{
  "title": "${tab.title || tab.name}",
  "subtitle": "Welcome to ${tab.name}",
  "hero": {
    "title": "Hero Section Title",
    "description": "Hero description"
  },
  "sections": [
    {
      "title": "Section Title",
      "content": "Section content here..."
    }
  ]
}</pre>
                    </div>
                </div>
            </div>
        `;
    }

    getErrorContent(tab) {
        return `
            <div class="content-section">
                <h2>Error Loading ${tab.name}</h2>
                <div class="card">
                    <h3>Content Not Available</h3>
                    <p>There was an error loading the content for this section.</p>
                    <p>Please check that the required files exist and try again.</p>
                </div>
            </div>
        `;
    }

    showLoading() {
        const contentContainer = document.getElementById('content-container');
        if (contentContainer) {
            contentContainer.innerHTML = '<div class="loading">Loading content...</div>';
            contentContainer.classList.remove('fade-in');
        }
    }

    showError(message) {
        const contentContainer = document.getElementById('content-container');
        if (contentContainer) {
            contentContainer.innerHTML = `
                <div class="content-section">
                    <h2>Error</h2>
                    <div class="card">
                        <p>${message}</p>
                    </div>
                </div>
            `;
        }
    }

    updateFooter() {
        const lastUpdatedEl = document.getElementById('last-updated');
        if (lastUpdatedEl && this.config.app) {
            const date = this.config.app.lastUpdated || new Date().toISOString().split('T')[0];
            lastUpdatedEl.textContent = new Date(date).toLocaleDateString();
        }
    }

    loadInitialContent() {
        // Load content based on URL hash or default to first tab
        const hash = window.location.hash.slice(1);
        const initialTab = hash && this.config.navigation.tabs.find(t => t.id === hash) 
            ? hash 
            : this.config.navigation.tabs.find(t => t.active)?.id || this.config.navigation.tabs[0]?.id;

        if (initialTab) {
            this.switchTab(initialTab, false);
        }
    }

    handleResize() {
        // Handle responsive behavior
        const header = document.querySelector('.header');
        const nav = document.querySelector('.main-nav');
        
        if (window.innerWidth <= 768) {
            header?.classList.add('mobile');
            nav?.classList.add('mobile');
        } else {
            header?.classList.remove('mobile');
            nav?.classList.remove('mobile');
        }
    }

    // Utility function for debouncing
    debounce(func, wait) {
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

    // Clear content cache (useful for development)
    clearCache() {
        this.contentCache.clear();
        console.log('Content cache cleared');
    }

    // Refresh current tab content
    async refreshContent() {
        this.contentCache.delete(this.currentTab);
        const currentTabConfig = this.config.navigation.tabs.find(t => t.id === this.currentTab);
        if (currentTabConfig) {
            await this.loadTabContent(currentTabConfig);
        }
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.cdmApp = new CDMApp();
});

// Global utility functions
window.CDMUtils = {
    // Refresh the app
    refresh: () => window.cdmApp?.refreshContent(),
    
    // Clear cache
    clearCache: () => window.cdmApp?.clearCache(),
    
    // Get current config
    getConfig: () => window.cdmApp?.config,
    
    // Switch to a specific tab
    switchTab: (tabId) => window.cdmApp?.switchTab(tabId)
};
