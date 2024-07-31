import { collection, getDocs, query, where } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';
import { ref, getDownloadURL } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-storage.js';

const modsContainer = document.getElementById('mods-container');
const searchBar = document.getElementById('search-bar');
const searchButton = document.getElementById('search-button');

const fetchMods = async (searchTerm = '') => {
    const modsCollection = collection(db, 'mods');
    let q = modsCollection;

    if (searchTerm) {
        const lowercaseSearchTerm = searchTerm.toLowerCase();
        q = query(modsCollection, 
            where('titleLowercase', '>=', lowercaseSearchTerm),
            where('titleLowercase', '<=', lowercaseSearchTerm + '\uf8ff')
        );
    }

    const snapshot = await getDocs(q);
    
    modsContainer.innerHTML = ''; // Clear existing mods

    for (const doc of snapshot.docs) {
        const modData = doc.data();
        const modId = doc.id;
        
        let thumbnailUrl = 'path/to/default-thumbnail.png';
        if (modData.thumbnailPath) {
            try {
                thumbnailUrl = await getDownloadURL(ref(storage, modData.thumbnailPath));
            } catch (error) {
                console.error('Error getting thumbnail URL:', error);
            }
        }

        const mod = {
            id: modId,
            ...modData,
            thumbnailUrl
        };

        if (!searchTerm || 
            modData.authorLowercase.includes(lowercaseSearchTerm) || 
            modData.descriptionLowercase.includes(lowercaseSearchTerm)) {
            displayMod(mod);
        }
    }
};

const displayMod = (mod) => {
    const modElement = document.createElement('div');
    modElement.classList.add('mod-item');
    
    modElement.innerHTML = `
        <img data-src="${mod.thumbnailUrl}" alt="${mod.title}" class="mod-thumbnail">
        <div class="mod-info">
            <h3>${mod.title}</h3>
            <p class="mod-author">By ${mod.author}</p>
            <p class="mod-description">${mod.description.substring(0, 100)}...</p>
            <p class="mod-downloads">Downloads: ${mod.downloadCount || 0}</p>
            <a href="download.html?id=${mod.id}" class="view-mod-button">View Mod</a>
        </div>
    `;
    
    modsContainer.appendChild(modElement);

    const lazyImage = modElement.querySelector('img[data-src]');
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                observer.unobserve(img);
            }
        });
    }, { threshold: 0.1 });
    observer.observe(lazyImage);
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
    const searchTerm = searchBar.value;
    fetchMods(searchTerm);
};

searchButton.addEventListener('click', performSearch);
searchBar.addEventListener('input', debounce(() => {
    performSearch();
}, 300));

// Initial load without search term
fetchMods();