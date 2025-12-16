// Changelog modal functionality
(function() {
    const modal = document.getElementById('changelog-modal');
    const btn = document.getElementById('changelog-btn');
    const closeBtn = document.querySelector('.modal-close');
    const changelogList = document.getElementById('changelog-list');
    
    // GitHub repository details
    const GITHUB_REPO = 'druskii128/druskii128.github.io';
    const GITHUB_API = `https://api.github.com/repos/${GITHUB_REPO}/commits`;
    
    let changelogLoaded = false;
    
    // Open modal
    btn.onclick = function(e) {
        e.preventDefault();
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        
        // Load changelog on first open
        if (!changelogLoaded) {
            loadChangelog();
            changelogLoaded = true;
        }
    };
    
    // Close modal
    closeBtn.onclick = function() {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    };
    
    // Close modal when clicking outside
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    };
    
    // Close modal with Escape key
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && modal.style.display === 'block') {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });
    
    // Load changelog from GitHub API
    function loadChangelog() {
        fetch(GITHUB_API + '?per_page=50')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch commits');
                }
                return response.json();
            })
            .then(commits => {
                displayChangelog(commits);
            })
            .catch(error => {
                console.error('Error loading changelog:', error);
                // Show a helpful error message using textContent to prevent XSS
                changelogList.innerHTML = '';
                const errorDiv = document.createElement('div');
                errorDiv.className = 'loading';
                if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                    errorDiv.textContent = 'GitHub API is not accessible in local development. The changelog will display commit history when deployed to GitHub Pages.';
                    errorDiv.style.color = 'var(--text-muted)';
                    errorDiv.style.fontSize = '0.95rem';
                    errorDiv.style.padding = '20px';
                } else {
                    errorDiv.textContent = 'Failed to load changelog. Please try again later.';
                    errorDiv.style.color = 'var(--secondary)';
                }
                changelogList.appendChild(errorDiv);
            });
    }
    
    // Display changelog items
    function displayChangelog(commits) {
        changelogList.innerHTML = '';
        
        if (!commits || commits.length === 0) {
            changelogList.innerHTML = '<div class="loading">No commits found.</div>';
            return;
        }
        
        commits.forEach(commit => {
            const item = createChangelogItem(commit);
            changelogList.appendChild(item);
        });
    }
    
    // Create a single changelog item
    function createChangelogItem(commit) {
        const item = document.createElement('div');
        item.className = 'changelog-item';
        
        const date = new Date(commit.commit.author.date);
        const formattedDate = formatDate(date);
        
        // Truncate long commit messages
        const message = commit.commit.message.split('\n')[0];
        const truncatedMessage = message.length > 80 ? message.substring(0, 77) + '...' : message;
        
        // Validate GitHub URL to prevent XSS
        const commitUrl = commit.html_url || '';
        const isValidGitHubUrl = commitUrl.startsWith('https://github.com/');
        
        // Create date element
        const dateDiv = document.createElement('div');
        dateDiv.className = 'changelog-date';
        dateDiv.textContent = formattedDate;
        
        // Create content wrapper
        const contentDiv = document.createElement('div');
        contentDiv.className = 'changelog-content';
        
        // Create message element
        const messageDiv = document.createElement('div');
        messageDiv.className = 'changelog-message';
        messageDiv.textContent = truncatedMessage;
        
        // Create link element with GitHub icon
        const link = document.createElement('a');
        link.className = 'changelog-link';
        link.title = 'View commit on GitHub';
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        if (isValidGitHubUrl) {
            link.href = commitUrl;
        } else {
            link.href = '#';
            link.style.cursor = 'not-allowed';
            link.style.opacity = '0.5';
        }
        
        // Add GitHub SVG icon
        link.innerHTML = `
            <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
            </svg>
        `;
        
        // Assemble the item
        contentDiv.appendChild(messageDiv);
        contentDiv.appendChild(link);
        item.appendChild(dateDiv);
        item.appendChild(contentDiv);
        
        return item;
    }
    
    // Format date to a readable string
    function formatDate(date) {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const month = months[date.getMonth()];
        const day = date.getDate();
        const year = date.getFullYear();
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        
        return `${month} ${day}, ${year}\n${hours}:${minutes}`;
    }
    
    // Escape HTML to prevent XSS
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
})();
