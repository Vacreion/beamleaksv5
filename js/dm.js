import { getAuth } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js';
import { getFirestore, collection, addDoc, query, where, orderBy, onSnapshot } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';

const auth = getAuth();
const db = getFirestore();

const bannedWords = [
    // Racial slurs (censored)
    'n****r', 'n***a', 'c***k', 'g**k', 's**c', 'w*****k', 'k**e', 'b****r',
    // Homophobic slurs (censored)
    'f****t', 'f*g', 'd**e',
    // Transphobic slurs (censored)
    't****y', 't******s', 's*****e',
    // Ableist slurs (censored)
    'r****d', 'r******d', 's**z', 's*****c',
    // Misogynistic slurs (censored)
    'c**t', 'b***h', 'w***e',
    // Religious slurs (censored)
    'k****r',
    // Ethnic slurs (censored)
    'g***o', 'g****k', 'p**i', 'k**e', 'k**e',
    // Body shaming terms
    'fatso', 'lardass', 'butterball', 'chunky', 'tubby',
    // Ageist terms
    'geezer', 'fossil', 'old fart', 'decrepit',
    // Classist terms
    'white trash', 'redneck', 'hillbilly', 'trailer trash',
    // Sexist terms
    'bimbo', 'slut', 'hoe', 'thot',
    // Mental health stigmatizing terms
    'psycho', 'schizo', 'lunatic', 'crazy',
    // Addiction stigmatizing terms
    'junkie', 'crackhead', 'alkie',
    // Xenophobic terms
    'fob', 'wetback', 'anchor baby',
    // Offensive terms related to sexual orientation
    'homo', 'lesbo', 'queer',
    // Offensive terms related to gender identity
    'he-she', 'it',
    // General offensive terms
    'scumbag', 'douchebag', 'asshole', 'dickhead', 'bastard',
    // Compound offensive words
    'motherfucker', 'son of a bitch', 'piece of shit',
    // Censored variations
    'f**k', 's**t', 'a*s', 'b***h', 'd**k', 'p***y',
    // Additional offensive terms
    'twat', 'wanker', 'tosser', 'minger', 'prick', 'knobhead',
    // More body-related insults
    'uggo', 'butterface', 'lardbutt', 'fatass', 'porker',
    // Additional ageist terms
    'boomer', 'millennial', 'zoomer', 'snowflake',
    // More classist terms
    'chav', 'pleb', 'bogan', 'yobbo', 'hick',
    // Additional sexist terms
    'feminazi', 'mangina', 'soyboy', 'simp',
    // More mental health stigmatizing terms
    'nutjob', 'loony', 'mental', 'spaz',
    // Additional addiction stigmatizing terms
    'pillhead', 'tweaker', 'pothead', 'stoner',
    // More xenophobic terms
    'gringo', 'gaijin', 'yankee', 'limey',
    // Additional offensive terms related to sexual orientation
    'fruit', 'poof', 'fairy',
    // More offensive terms related to gender identity
    'ladyboy', 'shim',
    // Additional general offensive terms
    'turd', 'numpty', 'muppet', 'pillock', 'bellend',
    // More compound offensive words
    'shithead', 'fuckwit', 'cockwomble', 'thundercunt',
    // Additional censored variations
    'w**k', 'b******t', 'c**p', 'p**s'
];

function filterMessage(message) {
    let filteredMessage = message.toLowerCase();
    bannedWords.forEach(word => {
        const regex = new RegExp('\\b' + word + '\\b', 'gi');
        filteredMessage = filteredMessage.replace(regex, '*'.repeat(word.length));
    });
    return filteredMessage;
}

async function sendMessage(recipientId, message) {
    const sender = auth.currentUser;
    if (!sender) return;

    const filteredMessage = filterMessage(message);

    try {
        await addDoc(collection(db, 'messages'), {
            senderId: sender.uid,
            recipientId: recipientId,
            message: filteredMessage,
            timestamp: new Date()
        });
    } catch (error) {
        console.error('Error sending message:', error);
    }
}

function listenToMessages(userId, callback) {
    const q = query(
        collection(db, 'messages'),
        where('recipientId', '==', userId),
        orderBy('timestamp', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
        const messages = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        callback(messages);
    });
}

export { sendMessage, listenToMessages };