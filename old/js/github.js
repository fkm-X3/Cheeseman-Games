
const ANNOUNCEMENTS_URL = 'https://raw.githubusercontent.com/fkm-X3/my-database/main/Announcements.json';



let statusText, feedEl, userStatusSection;


let authSection, accountInfoDisplay, settingsUsername, settingsSignoutBtn;


let profileUsernameInput, updateProfileBtn;




function initElements() {
    statusText = document.getElementById('status-text');
    feedEl = document.getElementById('community-feed');
    userStatusSection = document.getElementById('user-status-section');


    authSection = document.getElementById('auth-section');
    accountInfoDisplay = document.getElementById('account-info-display');
    settingsUsername = document.getElementById('settings-username');
    settingsSignoutBtn = document.getElementById('settings-signout-btn');


    profileUsernameInput = document.getElementById('profile-username-input');
    updateProfileBtn = document.getElementById('update-profile-btn');




    
    attachListeners();
}


const FEED_PAGE_SIZE = 5;
let currentOffset = 0;
let allAnnouncements = []; 


function renderAnnouncements(rows, isLoadMore = false) {
    
    const existingShowMore = document.getElementById('feed-show-more-btn');
    if (existingShowMore) existingShowMore.remove();

    if (!isLoadMore) {
        if (!rows || rows.length === 0) {
            feedEl.innerHTML = `
          <div class="glass p-8 rounded-3xl border border-white/5 text-center">
            <i class="fa-solid fa-wind text-4xl text-cheeseman-muted mb-4"></i>
            <p class="text-white text-lg font-bold">It's quiet here...</p>
            <p class="text-cheeseman-muted">No announcements found yet.</p>
          </div>`;
            return;
        }
        feedEl.innerHTML = '';
    }

    rows.forEach(row => {
        const div = document.createElement('div');
        div.className = 'glass p-6 rounded-3xl border border-white/5 hover:border-cheeseman-primary/30 transition-all group mb-6 animate-fade-in relative overflow-hidden';

        
        const title = row.Title || row.title || 'Announcement';
        const content = row.content || row.body || '';
        const rawDate = row.date || row.created_at;
        const dateStr = rawDate ? new Date(rawDate).toLocaleDateString() : 'Just now';

        
        const typeLabel = row.type || row.topic || 'Community';
        const isPinned = row.pinned === true || row.pinned === 'true';
        const priority = (row.priority || 'low').toLowerCase();
        const tags = row.tags || [];

        
        let iconClass = 'fa-bullhorn';
        let iconColor = 'text-cheeseman-primary';
        let borderColor = 'border-white/5';

        
        let priorityBadge = '';
        if (priority === 'high') {
            borderColor = 'border-rose-500/30';
            priorityBadge = `<span class="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-400 text-[10px] font-bold uppercase border border-rose-500/20 mr-2">High Priority</span>`;
        } else if (priority === 'medium') {
            priorityBadge = `<span class="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-400 text-[10px] font-bold uppercase border border-amber-500/20 mr-2">Notice</span>`;
        }

        if (typeLabel.toLowerCase().includes('update')) { iconClass = 'fa-rotate'; iconColor = 'text-emerald-400'; }
        else if (typeLabel.toLowerCase().includes('event')) { iconClass = 'fa-calendar-star'; iconColor = 'text-pink-400'; }
        else if (typeLabel.toLowerCase().includes('score')) { iconClass = 'fa-trophy'; iconColor = 'text-yellow-400'; }
        else if (typeLabel.toLowerCase().includes('alert')) { iconClass = 'fa-triangle-exclamation'; iconColor = 'text-amber-400'; }

        
        let tagsHtml = '';
        if (Array.isArray(tags) && tags.length > 0) {
            tagsHtml = `<div class="flex flex-wrap gap-2 mt-3">
                ${tags.map(tag => `<span class="px-2 py-1 rounded-lg bg-white/5 text-cheeseman-muted text-xs font-bold border border-white/5 hover:bg-white/10 transition-colors">#${tag}</span>`).join('')}
            </div>`;
        }

        const authorName = row.author || 'Community Member';

        
        const pinnedIcon = isPinned ? `<div class="absolute top-4 right-4 text-cheeseman-primary transform rotate-45"><i class="fa-solid fa-thumbtack text-xl opacity-20 group-hover:opacity-100 transition-opacity"></i></div>` : '';

        
        if (priority === 'high') {
            div.style.borderColor = 'rgba(244, 63, 94, 0.3)'; 
        }

        div.innerHTML = `
      ${pinnedIcon}
      <div class="flex items-center gap-4 mb-4 relative z-10">
        <div class="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center ${iconColor} text-xl border border-white/5 shadow-inner">
           <i class="fa-solid ${iconClass}"></i>
        </div>
        <div>
           <div class="flex items-center gap-2 mb-1">
               ${priorityBadge}
               <h3 class="font-bold text-white group-hover:text-cheeseman-primary transition-colors text-lg leading-tight">${title}</h3>
           </div>
           <p class="text-xs text-cheeseman-muted font-bold tracking-wide uppercase">
             ${authorName} • ${dateStr}
           </p>
        </div>
      </div>
      <div class="text-slate-300 mb-4 leading-relaxed whitespace-pre-line relative z-10 text-sm md:text-base pl-2 border-l-2 border-white/5 hover:border-white/20 transition-colors">
        ${content}
      </div>
      
      ${tagsHtml}
      
      <div class="flex items-center gap-6 text-cheeseman-muted text-sm font-bold border-t border-white/5 pt-4 mt-4">
          <button class="hover:text-pink-500 transition-colors flex items-center gap-2 group/btn">
            <div class="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover/btn:bg-pink-500/20 transition-colors">
                <i class="fa-regular fa-heart"></i> 
            </div>
            <span>Like</span>
          </button>
          <button class="hover:text-sky-500 transition-colors flex items-center gap-2 ml-auto group/btn">
            <i class="fa-solid fa-share"></i> Share
          </button>
      </div>
    `;
        feedEl.appendChild(div);
    });

    
    if (currentOffset < allAnnouncements.length) {
        renderShowMoreButton();
    }
}

function renderShowMoreButton() {
    const btnContainer = document.createElement('div');
    btnContainer.id = 'feed-show-more-btn';
    btnContainer.className = 'flex justify-center mt-4 pb-8';
    btnContainer.innerHTML = `
        <button id="show-more-btn-action" class="px-6 py-2 bg-white/5 hover:bg-white/10 text-cheeseman-muted hover:text-white font-bold rounded-xl transition-all border border-white/5">
            Show More <i class="fa-solid fa-chevron-down ml-2"></i>
        </button>
    `;
    feedEl.appendChild(btnContainer);

    document.getElementById('show-more-btn-action').addEventListener('click', () => {
        loadMoreAnnouncements();
    });
}



async function fetchAnnouncements() {
    if (!feedEl) return;

    
    currentOffset = 0;
    allAnnouncements = [];

    
    feedEl.innerHTML = `
        <div class="text-center py-12">
            <i class="fa-solid fa-circle-notch fa-spin text-cheeseman-primary text-3xl mb-4"></i>
            <p class="text-cheeseman-muted">Loading community updates...</p>
        </div>
    `;

    try {
        const response = await fetch(ANNOUNCEMENTS_URL);
        if (!response.ok) throw new Error("Failed to fetch announcements");

        const data = await response.json();

        
        if (Array.isArray(data)) {
            allAnnouncements = data;
        } else if (data.announcements && Array.isArray(data.announcements)) {
            allAnnouncements = data.announcements;
        } else {
            console.error("Unknown data format", data);
            allAnnouncements = [];
        }

        
        allAnnouncements.sort((a, b) => {
            const dateA = new Date(a.date || a.created_at || 0);
            const dateB = new Date(b.date || b.created_at || 0);
            return dateB - dateA;
        });

        
        const initialBatch = allAnnouncements.slice(0, FEED_PAGE_SIZE);
        currentOffset = initialBatch.length;
        renderAnnouncements(initialBatch, false);

    } catch (err) {
        console.error(err);
        feedEl.innerHTML = `
          <div class="glass p-8 rounded-3xl border border-white/5 text-center">
            <i class="fa-solid fa-wifi text-4xl text-cheeseman-muted mb-4"></i>
            <p class="text-white text-lg font-bold">Connection Failed</p>
            <p class="text-cheeseman-muted mb-4">Could not load announcements.</p>
            <button onclick="fetchAnnouncements()" class="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-white font-bold transition-colors">
                Retry
            </button>
          </div>`;
    }
}

function loadMoreAnnouncements() {
    const nextBatch = allAnnouncements.slice(currentOffset, currentOffset + FEED_PAGE_SIZE);

    
    const btn = document.getElementById('show-more-btn-action');
    if (btn) {
        btn.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i> Loading...`;
        btn.disabled = true;
    }

    setTimeout(() => {
        if (nextBatch.length > 0) {
            currentOffset += nextBatch.length;
            renderAnnouncements(nextBatch, true);
        } else {
            
            const existingShowMore = document.getElementById('feed-show-more-btn');
            if (existingShowMore) existingShowMore.remove();
        }
    }, 500);
}







function updateUI(isLoggedIn) {
    let username = localStorage.getItem('cheeseman_username') || 'Guest';

    if (isLoggedIn) {
        
        if (userStatusSection) userStatusSection.style.display = 'flex';

        if (statusText) statusText.textContent = username;

        
        
        if (authSection) {
            authSection.style.display = 'none';
        }

        if (accountInfoDisplay) accountInfoDisplay.classList.remove('hidden');
        if (settingsUsername) settingsUsername.textContent = username;
        if (profileUsernameInput) profileUsernameInput.value = username;

    } else {
        
        if (userStatusSection) userStatusSection.style.display = 'none';


        if (authSection) authSection.style.display = 'block';
        if (accountInfoDisplay) accountInfoDisplay.classList.add('hidden');
    }
}


function loginLocal(username) {
    localStorage.setItem('cheeseman_is_logged_in', 'true');
    localStorage.setItem('cheeseman_username', username);
    updateUI(true);
}

function handleSignOut() {
    localStorage.removeItem('cheeseman_is_logged_in');
    localStorage.removeItem('cheeseman_username');
    window.location.reload();
}

function updateProfile() {
    const newName = profileUsernameInput.value.trim();
    if (newName) {
        localStorage.setItem('cheeseman_username', newName);
        updateUI(true);
        alert("Profile updated locally!");
    }
}

function initAuth() {
    
    const isLoggedIn = localStorage.getItem('cheeseman_is_logged_in') === 'true';
    updateUI(isLoggedIn);

    
    
    const magicBtn = document.getElementById('magic-btn');
    const magicEmail = document.getElementById('magic-email');

    if (magicBtn) {
        magicBtn.innerHTML = '<i class="fa-solid fa-right-to-bracket mr-2"></i> Enter (Local)';
        
        magicBtn.onclick = (e) => {
            e.preventDefault();
            const email = magicEmail.value || 'User';
            const name = email.split('@')[0];
            loginLocal(name);
        };
    }
}




function attachListeners() {

    if (settingsSignoutBtn) settingsSignoutBtn.onclick = handleSignOut;



    if (updateProfileBtn) {
        updateProfileBtn.onclick = updateProfile;
    }
}


document.addEventListener('DOMContentLoaded', () => {
    initElements();
    initAuth();
    fetchAnnouncements();
});
