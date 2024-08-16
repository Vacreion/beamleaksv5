import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js';
import { getFirestore, doc, getDoc, updateDoc, increment } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';
import { getStorage, ref, getDownloadURL } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-storage.js';

const firebaseConfig = {  
    apiKey: "AIzaSyBwU5BhPXKaEvb7YdVYbrTou7kHfaGjWF8",
    authDomain: "beamleaksv3.firebaseapp.com",
    projectId: "beamleaksv3",
    storageBucket: "beamleaksv3.appspot.com",
    messagingSenderId: "657885182981",
    appId: "1:657885182981:web:d113473377db33d9edf06c",
    measurementId: "G-DL5V933Y34"
};

const app = initializeApp(firebaseConfig); 
const db = getFirestore(app); 
const storage = getStorage(app);

const modContainer = document.getElementById('mod-container');

async function loadModDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const modId = urlParams.get('id');

    if (!modId) {
        modContainer.innerHTML = 'No mod specified.';
        return;
    }

    try {
        const docRef = doc(db, 'mods', modId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const modData = docSnap.data();
            let thumbnailUrl = 'path/to/default-thumbnail.png';
            if (modData.thumbnailPath) {
                thumbnailUrl = await getDownloadURL(ref(storage, modData.thumbnailPath));
            }

            let modFileUrl = '#'; 
            if (modData.modFilePath) {
                modFileUrl = await getDownloadURL(ref(storage, modData.modFilePath));
                console.log('Generated Mod File URL:', modFileUrl);
            }

            let image1Url = modData.image1Path ? await getDownloadURL(ref(storage, modData.image1Path)) : '';
            let image2Url = modData.image2Path ? await getDownloadURL(ref(storage, modData.image2Path)) : '';

            modContainer.innerHTML = `
                <h2>${modData.title}</h2>
                <p>By ${modData.author}</p>
                <div class="mod-images-grid">
                    <div class="mod-image-wrapper">
                        <img src="${thumbnailUrl}" alt="${modData.title}" class="mod-image">
                    </div>
                    ${image1Url ? `<div class="mod-image-wrapper"><img src="${image1Url}" alt="Additional image 1" class="mod-image"></div>` : ''}
                    ${image2Url ? `<div class="mod-image-wrapper"><img src="${image2Url}" alt="Additional image 2" class="mod-image"></div>` : ''}
                </div>
                <p>${modData.description}</p>
                ${modData.features ? `<p><strong>Features:</strong> ${modData.features}</p>` : ''}
                <p><strong>Downloads:</strong> ${modData.downloadCount || 0}</p>
                <a href="${modFileUrl}" class="download-button" download="${modData.title}.zip">Download Mod</a>
            `;

            const downloadButton = document.querySelector('.download-button');
            downloadButton.addEventListener('click', async () => {
                await updateDoc(docRef, {
                    downloadCount: increment(1)
                });
                console.log('Download count incremented');
            });
        } else {
            modContainer.innerHTML = 'Mod not found.';
        }
    } catch (error) {
        console.error('Error fetching mod details:', error);
        modContainer.innerHTML = 'Error loading mod details. Please try again later.';
    }
}

loadModDetails();