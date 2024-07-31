import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js';
import { getFirestore, collection, doc, setDoc, serverTimestamp, getDoc } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-storage.js';

document.addEventListener('DOMContentLoaded', function() {
    const auth = getAuth();
    const db = getFirestore();
    const storage = getStorage();

    const uploadFormsContainer = document.getElementById('upload-forms');
    const addFormButton = document.getElementById('add-form-button');
    const uploadAllButton = document.getElementById('upload-all-button');
    const uploadStatus = document.getElementById('upload-status');

    onAuthStateChanged(auth, async (user) => {
        if (user) {
            const userDocRef = doc(db, 'users', user.uid);
            const userDoc = await getDoc(userDocRef);
            
            if (userDoc.exists()) {
                const userData = userDoc.data();
                if (userData.role === 'staff' || userData.role === 'admin') {
                    uploadFormsContainer.style.display = 'block';
                } else {
                    uploadStatus.textContent = 'You do not have permission to upload mods.';
                    uploadFormsContainer.style.display = 'none';
                    addFormButton.style.display = 'none';
                    uploadAllButton.style.display = 'none';
                }
            } else {
                uploadStatus.textContent = 'User data not found. Please contact an administrator.';
                uploadFormsContainer.style.display = 'none';
                addFormButton.style.display = 'none';
                uploadAllButton.style.display = 'none';
            }
        } else {
            window.location.href = 'login.html';
        }
    });

    let formCount = 1;

    addFormButton.addEventListener('click', () => {
        if (formCount < 20) {
            formCount++;
            const newForm = document.createElement('form');
            newForm.className = 'upload-form';
            newForm.enctype = 'multipart/form-data';
            newForm.innerHTML = `
                <label for="title">Title:</label>
                <input type="text" id="title" name="title" required>
                
                <label for="description">Description:</label>
                <textarea id="description" name="description" required></textarea>

                <label for="author">Author:</label>
                <input type="text" id="author" name="author" required>

                <label for="features">Features (Optional):</label>
                <textarea id="features" name="features"></textarea>

                <label for="thumbnail">Thumbnail:</label>
                <input type="file" id="thumbnail" name="thumbnail" accept="image/*" required>

                <label for="image1">Image 1:</label>
                <input type="file" id="image1" name="image1" accept="image/*" required>

                <label for="image2">Image 2:</label>
                <input type="file" id="image2" name="image2" accept="image/*" required>

                <label for="mod-file">Mod File:</label>
                <input type="file" id="mod-file" name="mod-file" required>

                <hr>
            `;
            uploadFormsContainer.appendChild(newForm);
        } else {
            alert('You can only add up to 20 upload forms.');
        }
    });

    uploadAllButton.addEventListener('click', async () => {
        const uploadForms = document.querySelectorAll('.upload-form');
        let successCount = 0;
        let failCount = 0;

        for (const form of uploadForms) {
            const title = form.querySelector('#title').value;
            const description = form.querySelector('#description').value;
            const author = form.querySelector('#author').value;
            const features = form.querySelector('#features').value;
            const thumbnail = form.querySelector('#thumbnail').files[0];
            const image1 = form.querySelector('#image1').files[0];
            const image2 = form.querySelector('#image2').files[0];
            const modFile = form.querySelector('#mod-file').files[0];

            try {
                const modId = doc(collection(db, 'mods')).id;

                const uploadTasks = [
                    uploadFile(`mods/${modId}/thumbnail`, thumbnail, ['image/jpeg', 'image/png', 'image/webp']),
                    uploadFile(`mods/${modId}/image1`, image1, ['image/jpeg', 'image/png', 'image/webp']),
                    uploadFile(`mods/${modId}/image2`, image2, ['image/jpeg', 'image/png', 'image/webp']),
                    uploadFile(`mods/${modId}/modFile`, modFile, ['application/zip', 'application/x-zip-compressed'])
                ];

                const urls = await Promise.all(uploadTasks);

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
                    createdAt: serverTimestamp()
                };

                await setDoc(doc(db, 'mods', modId), modData);

                successCount++;
                console.log(`Mod ${title} uploaded successfully.`);
            } catch (error) {
                failCount++;
                console.error(`Error uploading mod ${title}:`, error);
            }
            uploadStatus.textContent = `Uploaded ${successCount} mods. Failed: ${failCount}`;
        }

        uploadStatus.textContent = `All uploads complete. Success: ${successCount}, Failed: ${failCount}`;
    });

    async function uploadFile(path, file, allowedMimeTypes) {
        if (!file) {
            console.log(`No file provided for ${path}`);
            return null;
        }

        console.log('Uploading file to path:', path, 'with file name:', file.name);

        // Check MIME type
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