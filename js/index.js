import { collection, getDocs, query, where, orderBy, limit } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';
import { ref, getDownloadURL } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-storage.js';

const modsContainer = document.getElementById('mods-container');
const searchBar = document.getElementById('search-bar');
const searchButton = document.getElementById('search-button');
const filterButtons = document.querySelectorAll('.filter-button');

let currentFilter = 'recent';

const fetchMods = async (searchTerm = '') => {
    const modsCollection = collection(db, 'mods');
    let q = modsCollection;

    if (searchTerm) {
        q = query(modsCollection, 
            where('title', '>=', searchTerm),
            where('title', '<=', searchTerm + '\uf8ff')
        );
    }

    switch (currentFilter) {
        case 'downloads':
            q = query(q, orderBy('downloadCount', 'desc'));
            break;
        case 'recent':
            q = query(q, orderBy('createdAt', 'desc'));
            break;
        case 'random':
            // For random, we'll fetch all and then shuffle
            break;
    }

    q = query(q, limit(200)); // Limit to 200 mods for performance

    const snapshot = await getDocs(q);
    let mods = snapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));

    if (currentFilter === 'random') {
        mods = mods.sort(() => Math.random() - 0.5);
    }

    displayMods(mods);
};

const displayMods = (mods) => {
    modsContainer.innerHTML = ''; // Clear existing mods

    mods.forEach(mod => {
        const modElement = createModElement(mod);
        modsContainer.appendChild(modElement);
    });
};

const createModElement = (mod) => {
    const modElement = document.createElement('div');
    modElement.classList.add('mod-item');
    
    modElement.innerHTML = `
        <img data-src="${mod.thumbnailPath}" alt="${mod.title}" class="mod-thumbnail lazy">
        <div class="mod-info">
            <h3>${mod.title}</h3>
            <p class="mod-author">By ${mod.author}</p>
            <p class="mod-description">${mod.description.substring(0, 100)}...</p>
            <p class="mod-downloads">Downloads: ${mod.downloadCount || 0}</p>
            <a href="download.html?id=${mod.id}" class="view-mod-button">View Mod</a>
        </div>
    `;
    
    const lazyImage = modElement.querySelector('img.lazy');
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                getDownloadURL(ref(storage, img.dataset.src))
                    .then((url) => {
                        img.src = url;
                        img.classList.remove('lazy');
                        observer.unobserve(img);
                    })
                    .catch((error) => {
                        console.error("Error loading image:", error);
                    });
            }
        });
    }, { threshold: 0.1 });
    observer.observe(lazyImage);

    return modElement;
};

const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

const performSearch = () => {
    const searchTerm = searchBar.value.toLowerCase();
    if (searchTerm === 'nebula') {
        window.location.href = '/nebula.html';
        return;
    }
    fetchMods(searchTerm);
};

searchButton.addEventListener('click', performSearch);
searchBar.addEventListener('input', debounce(performSearch, 300));

filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        currentFilter = button.id.split('-')[1];
        fetchMods(searchBar.value);
    });
});

// Initial load
fetchMods();
