import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js';
import { getFirestore, collection, doc, setDoc, serverTimestamp, getDoc } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-storage.js';

document.addEventListener('DOMContentLoaded', function() {
    const auth = getAuth();
    const db = getFirestore();
    const storage = getStorage();

    const uploadForm = document.getElementById('upload-form');
    const uploadStatus = document.getElementById('upload-status');

    onAuthStateChanged(auth, async (user) => {
        if (user) {
            const userDocRef = doc(db, 'users', user.uid);
            const userDoc = await getDoc(userDocRef);
            
            if (userDoc.exists()) {
                const userData = userDoc.data();
                if (userData.role === 'staff' || userData.role === 'admin') {
                    uploadForm.style.display = 'block';
                } else {
                    uploadStatus.textContent = 'You do not have permission to upload mods.';
                    uploadForm.style.display = 'none';
                }
            } else {
                uploadStatus.textContent = 'User data not found. Please contact an administrator.';
                uploadForm.style.display = 'none';
            }
        } else {
            window.location.href = 'login.html';
        }
    });

    uploadForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        console.log('Form submitted');

        const title = document.getElementById('title').value;
        const description = document.getElementById('description').value;
        const author = document.getElementById('author').value;
        const features = document.getElementById('features').value;
        const thumbnail = document.getElementById('thumbnail').files[0];
        const image1 = document.getElementById('image1').files[0];
        const image2 = document.getElementById('image2').files[0];
        const modFile = document.getElementById('mod-file').files[0];

        console.log('Uploading files:', { title, description, author, features, thumbnail, image1, image2, modFile });

        uploadStatus.textContent = 'Uploading...';

        try {
            const modId = doc(collection(db, 'mods')).id;
            console.log('Generated mod ID:', modId);

            const uploadTasks = [
                uploadFile(`mods/${modId}/thumbnail`, thumbnail, ['image/jpeg', 'image/png', 'image/webp']),
                uploadFile(`mods/${modId}/image1`, image1, ['image/jpeg', 'image/png', 'image/webp']),
                uploadFile(`mods/${modId}/image2`, image2, ['image/jpeg', 'image/png', 'image/webp']),
                uploadFile(`mods/${modId}/modFile`, modFile, ['application/zip', 'application/x-zip-compressed'])
            ];

            const urls = await Promise.all(uploadTasks);
            console.log('File paths obtained:', urls);

            const [thumbnailPath, image1Path, image2Path, modFilePath] = urls;

            const modData = {
                title,
                description,
                author,
                features,
                thumbnailPath,
                image1Path,
                image2Path,
                modFilePath,
                timestamp: serverTimestamp(),
                downloadCount: 0
            };

            await setDoc(doc(db, 'mods', modId), modData);
            console.log('Mod document created in Firestore:', modData);

            if (modFilePath) {
                const verifyDownloadUrl = await getDownloadURL(ref(storage, modFilePath));
                console.log('Verified download URL:', verifyDownloadUrl);
            }

            uploadStatus.textContent = 'Mod uploaded successfully!';
            uploadForm.reset();
        } catch (error) {
            console.error('Error uploading mod:', error);
            uploadStatus.textContent = 'Error uploading mod. Please try again.';
        }
    });

    async function uploadFile(path, file, allowedMimeTypes) {
        if (!file) {
            console.log(`No file provided for ${path}`);
            return null;
        }

        console.log('Uploading file to path:', path, 'with file name:', file.name);

        if (!allowedMimeTypes.includes(file.type)) {
            console.warn(`Invalid file type: ${file.type}. Allowed types: ${allowedMimeTypes.join(', ')}`);
            return null;
        }

        const uniqueFileName = `${Date.now()}_${file.name}`;
        const fullPath = `${path}/${uniqueFileName}`;
        const storageRef = ref(storage, fullPath);
        const metadata = {
            contentType: file.type
        };
        
        await uploadBytes(storageRef, file, metadata);
        const downloadUrl = await getDownloadURL(storageRef);
        console.log('File uploaded. Full path:', fullPath);
        console.log('Download URL generated:', downloadUrl);
        return fullPath;
    }
});