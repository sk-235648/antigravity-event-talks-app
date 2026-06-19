// Global State
let allNotes = [];
let filteredNotes = [];
let currentFilter = 'all';
let searchQuery = '';

// DOM Elements
const refreshBtn = document.getElementById('refresh-btn');
const refreshIcon = document.getElementById('refresh-icon');
const syncTimeEl = document.getElementById('sync-time');
const feedSubtitle = document.getElementById('feed-subtitle');

const searchInput = document.getElementById('search-input');
const clearSearchBtn = document.getElementById('clear-search');
const filterTags = document.querySelectorAll('.filter-tag');
const statCards = document.querySelectorAll('.stat-card');

const skeletonContainer = document.getElementById('skeleton-container');
const errorContainer = document.getElementById('error-container');
const errorMsgEl = document.getElementById('error-msg');
const retryBtn = document.getElementById('retry-btn');
const emptyState = document.getElementById('empty-state');
const resetSearchBtn = document.getElementById('reset-search-btn');
const notesList = document.getElementById('notes-list');

// Stats Elements
const statAllCount = document.getElementById('stat-all-count');
const statFeatureCount = document.getElementById('stat-feature-count');
const statChangeCount = document.getElementById('stat-change-count');
const statFixCount = document.getElementById('stat-fix-count');
const statDeprecationCount = document.getElementById('stat-deprecation-count');

// Modal Elements
const tweetModal = document.getElementById('tweet-modal');
const tweetTextarea = document.getElementById('tweet-textarea');
const charCounter = document.getElementById('char-counter');
const shareTweetBtn = document.getElementById('share-tweet-btn');
const cancelTweetBtn = document.getElementById('cancel-tweet-btn');
const closeModalBtn = document.getElementById('close-modal-btn');
const charCounterContainer = document.querySelector('.tweet-char-count-bar');

// Toast Container
const toastContainer = document.getElementById('toast-container');

// Category icons map
const categoryIcons = {
    feature: 'fa-star',
    change: 'fa-sliders',
    fix: 'fa-wrench',
    deprecation: 'fa-triangle-exclamation',
    general: 'fa-circle-info'
};

// Category emojis for Twitter
const categoryEmojis = {
    feature: '🚀 New Feature',
    change: '⚙️ Changed',
    fix: '🛠️ Fixed',
    deprecation: '⚠️ Deprecation',
    general: '📢 Update'
};

/* ==========================================================================
   Initialization & Event Listeners
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
    // Initial Fetch
    fetchReleaseNotes();
    
    // Refresh events
    refreshBtn.addEventListener('click', fetchReleaseNotes);
    retryBtn.addEventListener('click', fetchReleaseNotes);
    
    // Search event
    searchInput.addEventListener('input', handleSearch);
    clearSearchBtn.addEventListener('click', () => {
        searchInput.value = '';
        handleSearch();
    });
    
    // Filter click events
    filterTags.forEach(tag => {
        tag.addEventListener('click', () => {
            setActiveFilter(tag.getAttribute('data-filter'));
        });
    });
    
    // Stats cards click events (syncs with filters)
    statCards.forEach(card => {
        card.addEventListener('click', () => {
            const filter = card.getAttribute('data-filter');
            setActiveFilter(filter);
            // Scroll to control bar for better mobile view
            document.querySelector('.controls-bar').scrollIntoView({ behavior: 'smooth' });
        });
    });
    
    // Reset search empty state
    resetSearchBtn.addEventListener('click', () => {
        searchInput.value = '';
        currentFilter = 'all';
        syncFilterUI();
        handleSearch();
    });
    
    // Modal events
    closeModalBtn.addEventListener('click', hideTweetModal);
    cancelTweetBtn.addEventListener('click', hideTweetModal);
    tweetTextarea.addEventListener('input', updateTweetCharCount);
    
    // Close modal when clicking overlay
    tweetModal.addEventListener('click', (e) => {
        if (e.target === tweetModal) {
            hideTweetModal();
        }
    });
    
    // ESC key closes modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && tweetModal.style.display !== 'none') {
            hideTweetModal();
        }
    });
});

/* ==========================================================================
   API Fetch & Data Loading
   ========================================================================== */
async function fetchReleaseNotes() {
    setLoadingState(true);
    
    try {
        const response = await fetch('/api/release-notes');
        const data = await response.json();
        
        if (data.status === 'success') {
            allNotes = data.notes;
            
            // Update Headers & Subtitles
            if (data.subtitle) {
                feedSubtitle.textContent = data.subtitle;
            }
            
            // Set Sync Time
            const now = new Date();
            syncTimeEl.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            
            // Calculate and display statistics
            updateStats();
            
            // Filter and Render
            applyFilterAndSearch();
            
            setLoadingState(false);
            showToast('Release notes loaded successfully!', 'success');
        } else {
            throw new Error(data.message || 'Unknown server error');
        }
    } catch (error) {
        console.error('Error fetching release notes:', error);
        setLoadingState(false, error.message);
        showToast('Failed to load release notes.', 'error');
    }
}

function setLoadingState(isLoading, errorMessage = null) {
    if (isLoading) {
        refreshIcon.classList.add('spin');
        refreshBtn.disabled = true;
        
        skeletonContainer.style.display = 'grid';
        notesList.style.display = 'none';
        errorContainer.style.display = 'none';
        emptyState.style.display = 'none';
    } else {
        refreshIcon.classList.remove('spin');
        refreshBtn.disabled = false;
        
        skeletonContainer.style.display = 'none';
        
        if (errorMessage) {
            errorMsgEl.textContent = errorMessage;
            errorContainer.style.display = 'flex';
            notesList.style.display = 'none';
        }
    }
}

/* ==========================================================================
   Stats & Filtering Logic
   ========================================================================== */
function updateStats() {
    const counts = {
        all: allNotes.length,
        feature: 0,
        change: 0,
        fix: 0,
        deprecation: 0
    };
    
    allNotes.forEach(note => {
        if (counts[note.category] !== undefined) {
            counts[note.category]++;
        }
    });
    
    // Update labels in DOM
    statAllCount.textContent = counts.all;
    statFeatureCount.textContent = counts.feature;
    statChangeCount.textContent = counts.change;
    statFixCount.textContent = counts.fix;
    statDeprecationCount.textContent = counts.deprecation;
}

function handleSearch() {
    searchQuery = searchInput.value.trim().toLowerCase();
    
    if (searchQuery) {
        clearSearchBtn.style.display = 'block';
    } else {
        clearSearchBtn.style.display = 'none';
    }
    
    applyFilterAndSearch();
}

function setActiveFilter(filter) {
    currentFilter = filter;
    syncFilterUI();
    applyFilterAndSearch();
}

function syncFilterUI() {
    // Sync Tags
    filterTags.forEach(tag => {
        if (tag.getAttribute('data-filter') === currentFilter) {
            tag.classList.add('active');
        } else {
            tag.classList.remove('active');
        }
    });
    
    // Sync Stats Cards
    statCards.forEach(card => {
        if (card.getAttribute('data-filter') === currentFilter) {
            card.classList.add('active');
        } else {
            card.classList.remove('active');
        }
    });
}

function applyFilterAndSearch() {
    // 1. Filter by category
    if (currentFilter === 'all') {
        filteredNotes = allNotes;
    } else {
        filteredNotes = allNotes.filter(note => note.category === currentFilter);
    }
    
    // 2. Filter by search query
    if (searchQuery) {
        filteredNotes = filteredNotes.filter(note => {
            const titleMatch = note.title.toLowerCase().includes(searchQuery);
            const contentMatch = note.content.toLowerCase().includes(searchQuery);
            return titleMatch || contentMatch;
        });
    }
    
    // Render Results
    renderNotes();
}

/* ==========================================================================
   Rendering Release Note Cards
   ========================================================================== */
function renderNotes() {
    notesList.innerHTML = '';
    
    if (filteredNotes.length === 0) {
        notesList.style.display = 'none';
        emptyState.style.display = 'flex';
        return;
    }
    
    emptyState.style.display = 'none';
    notesList.style.display = 'grid';
    
    filteredNotes.forEach(note => {
        const card = createNoteCard(note);
        notesList.appendChild(card);
    });
}

function createNoteCard(note) {
    const card = document.createElement('article');
    card.className = `note-card category-${note.category}`;
    card.setAttribute('data-id', note.id);
    
    // Format Date beautifully
    let displayDate = 'Unknown Date';
    if (note.published) {
        try {
            const dateObj = new Date(note.published);
            if (!isNaN(dateObj)) {
                displayDate = dateObj.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
            } else {
                displayDate = note.published;
            }
        } catch (e) {
            displayDate = note.published;
        }
    }
    
    const iconClass = categoryIcons[note.category] || categoryIcons.general;
    
    card.innerHTML = `
        <div class="note-header">
            <div class="note-meta">
                <span class="badge ${note.category}">
                    <i class="fa-solid ${iconClass}"></i> ${note.category}
                </span>
                <span class="note-date">
                    <i class="fa-regular fa-calendar-days"></i> ${displayDate}
                </span>
            </div>
            <div class="note-actions-top">
                <button class="action-icon-btn copy-btn" title="Copy link to clipboard">
                    <i class="fa-regular fa-copy"></i>
                </button>
            </div>
        </div>
        <div class="note-body">
            <h2>${note.title}</h2>
            <div class="note-content">
                ${note.content}
            </div>
        </div>
        <div class="note-footer">
            <button class="btn-tweet-action">
                <i class="fa-brands fa-x-twitter"></i> Tweet Update
            </button>
        </div>
    `;
    
    // Add Click listener for copy link button
    const copyBtn = card.querySelector('.copy-btn');
    copyBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        copyToClipboard(note.link || note.id);
    });
    
    // Add Click listener for Tweet button
    const tweetBtn = card.querySelector('.btn-tweet-action');
    tweetBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        openTweetModal(note);
    });
    
    return card;
}

/* ==========================================================================
   Twitter Share Modal Functionality
   ========================================================================== */
function openTweetModal(note) {
    // Generate initial tweet draft
    const emoji = categoryEmojis[note.category] || '📢 BigQuery';
    const cleanTitle = stripHtmlTags(note.title);
    
    // Construct text
    let tweetText = `${emoji}: ${cleanTitle}\n\nRead more details here:\n${note.link || note.id}\n\n#BigQuery #GoogleCloud #DataWarehousing`;
    
    // Pre-fill modal fields
    tweetTextarea.value = tweetText;
    updateTweetCharCount();
    
    // Show Modal
    tweetModal.style.display = 'flex';
    tweetTextarea.focus();
}

function hideTweetModal() {
    tweetModal.style.display = 'none';
}

function updateTweetCharCount() {
    const text = tweetTextarea.value;
    const length = text.length;
    
    // Approximate Twitter URL counting logic:
    // Any URL is counted as exactly 23 characters.
    // Let's perform a simple count replacing URLs to check accurate length.
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urlMatches = text.match(urlRegex) || [];
    let twitterLength = length;
    
    urlMatches.forEach(url => {
        twitterLength = twitterLength - url.length + 23;
    });
    
    charCounter.textContent = `${twitterLength} / 280`;
    
    if (twitterLength > 280) {
        charCounterContainer.classList.add('warning');
        shareTweetBtn.classList.add('btn-disabled');
        shareTweetBtn.style.pointerEvents = 'none';
        shareTweetBtn.style.opacity = '0.5';
    } else {
        charCounterContainer.classList.remove('warning');
        shareTweetBtn.classList.remove('btn-disabled');
        shareTweetBtn.style.pointerEvents = 'auto';
        shareTweetBtn.style.opacity = '1';
    }
    
    // Update Web Intent link dynamically
    shareTweetBtn.href = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
}

// Strip HTML tags helper
function stripHtmlTags(str) {
    if (!str) return '';
    return str.replace(/<[^>]*>/g, '').trim();
}

/* ==========================================================================
   Utilities (Clipboard & Toast Notifications)
   ========================================================================== */
function copyToClipboard(text) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
            showToast('Link copied to clipboard!', 'success');
        }).catch(err => {
            console.error('Could not copy text: ', err);
            showToast('Failed to copy link.', 'error');
        });
    } else {
        // Fallback
        const textArea = document.createElement("textarea");
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
            document.execCommand('copy');
            showToast('Link copied to clipboard!', 'success');
        } catch (err) {
            console.error('Fallback copy failed', err);
            showToast('Failed to copy link.', 'error');
        }
        document.body.removeChild(textArea);
    }
}

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    const iconClass = type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation';
    
    toast.innerHTML = `
        <i class="fa-solid ${iconClass} toast-icon"></i>
        <div class="toast-content">${message}</div>
    `;
    
    toastContainer.appendChild(toast);
    
    // Slide out after 3 seconds
    setTimeout(() => {
        toast.classList.add('toast-out');
        // Remove from DOM after transition
        setTimeout(() => {
            toast.remove();
        }, 250);
    }, 3000);
}
