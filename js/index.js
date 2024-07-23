import { collection, getDocs } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';
import { ref, getDownloadURL } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-storage.js';

const modsContainer = document.getElementById('mods-container');
const searchBar = document.getElementById('search-bar');
const searchButton = document.getElementById('search-button');

let allMods = [];

const fetchMods = async () => {
    const modsCollection = collection(db, 'mods');
    const snapshot = await getDocs(modsCollection);
    
    allMods = [];

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

        allMods.push(mod);
        displayMod(mod);
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

const performSearch = () => {
    const searchTerm = searchBar.value.toLowerCase();
    const filteredMods = allMods.filter(mod => 
        mod.title.toLowerCase().includes(searchTerm) ||
        mod.author.toLowerCase().includes(searchTerm) ||
        mod.description.toLowerCase().includes(searchTerm)
    );
    modsContainer.innerHTML = '';
    filteredMods.forEach(displayMod);
};

searchButton.addEventListener('click', performSearch);
searchBar.addEventListener('keyup', (event) => {
    if (event.key === 'Enter') {
        performSearch();
    }
});

fetchMods();