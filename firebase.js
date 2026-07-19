// Firebase Integration module with LocalStorage fallback for local development/testing
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import { getAnalytics } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-analytics.js';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  increment, 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  runTransaction,
  serverTimestamp 
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

// --- PLACE YOUR FIREBASE CONFIGURATION HERE ---
const firebaseConfig = {
  apiKey: "AIzaSyDeCgX4d0ibyW-VsjOkXJEmSs-6uqi9gpI",
  authDomain: "literary-world-of-sadia.firebaseapp.com",
  databaseURL: "https://literary-world-of-sadia-default-rtdb.firebaseio.com",
  projectId: "literary-world-of-sadia",
  storageBucket: "literary-world-of-sadia.firebasestorage.app",
  messagingSenderId: "933364114427",
  appId: "1:933364114427:web:541b19435442d88265e15e",
  measurementId: "G-ZNMFXHEGNS"
};

let db = null;
let useFallback = true;

// Check if the config is updated with valid credentials
if (firebaseConfig.apiKey && firebaseConfig.apiKey !== "YOUR_API_KEY") {
  try {
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    useFallback = false;
    console.log("Firebase initialized successfully. Using Firestore database.");
    
    // Initialize Analytics safely
    try {
      getAnalytics(app);
      console.log("Firebase Analytics initialized.");
    } catch (analyticsError) {
      console.warn("Firebase Analytics failed to initialize (this is normal if ad blockers are active):", analyticsError);
    }
  } catch (error) {
    console.error("Firebase failed to initialize. Falling back to local storage.", error);
    useFallback = true;
  }
} else {
  console.log("No valid Firebase configuration found. Running in LocalStorage Fallback mode (all interactive features will still function locally).");
}

// ==========================================
// INTERACTIVE FEATURES & HELPER ACTIONS
// ==========================================

// 1. STATS (Views, Reads, Downloads)
export async function getBookStats(bookId) {
  if (useFallback) {
    const stats = JSON.parse(localStorage.getItem(`book_stats_${bookId}`)) || { views: 0, reads: 0, downloads: 0 };
    return stats;
  } else {
    try {
      const bookRef = doc(db, 'books', bookId);
      const snap = await getDoc(bookRef);
      if (snap.exists()) {
        const data = snap.data();
        return {
          views: data.views || 0,
          reads: data.reads || 0,
          downloads: data.downloads || 0
        };
      } else {
        return { views: 0, reads: 0, downloads: 0 };
      }
    } catch (e) {
      console.error("Error fetching book stats: ", e);
      return { views: 0, reads: 0, downloads: 0 };
    }
  }
}

export async function incrementBookStat(bookId, statType) {
  if (statType !== 'views' && statType !== 'reads' && statType !== 'downloads') return;

  if (useFallback) {
    const key = `book_stats_${bookId}`;
    const stats = JSON.parse(localStorage.getItem(key)) || { views: 0, reads: 0, downloads: 0 };
    stats[statType] = (stats[statType] || 0) + 1;
    localStorage.setItem(key, JSON.stringify(stats));
    // Trigger local update event for UI
    window.dispatchEvent(new CustomEvent('statsUpdated', { detail: { bookId, stats } }));
    return stats;
  } else {
    try {
      const bookRef = doc(db, 'books', bookId);
      // Create document if it doesn't exist
      await setDoc(bookRef, { [statType]: increment(1) }, { merge: true });
      
      // Return updated stats
      const updatedSnap = await getDoc(bookRef);
      const data = updatedSnap.data();
      const stats = {
        views: data.views || 0,
        reads: data.reads || 0,
        downloads: data.downloads || 0
      };
      window.dispatchEvent(new CustomEvent('statsUpdated', { detail: { bookId, stats } }));
      return stats;
    } catch (e) {
      console.error(`Error incrementing ${statType} for ${bookId}: `, e);
    }
  }
}

// 2. RATINGS
export async function getBookRating(bookId) {
  if (useFallback) {
    const ratings = JSON.parse(localStorage.getItem(`book_ratings_${bookId}`)) || { ratingSum: 0, ratingCount: 0 };
    return ratings;
  } else {
    try {
      const bookRef = doc(db, 'books', bookId);
      const snap = await getDoc(bookRef);
      if (snap.exists()) {
        const data = snap.data();
        return {
          ratingSum: data.ratingSum || 0,
          ratingCount: data.ratingCount || 0
        };
      }
      return { ratingSum: 0, ratingCount: 0 };
    } catch (e) {
      console.error("Error fetching rating: ", e);
      return { ratingSum: 0, ratingCount: 0 };
    }
  }
}

export async function submitBookRating(bookId, stars) {
  if (stars < 1 || stars > 5) return;

  if (useFallback) {
    const key = `book_ratings_${bookId}`;
    const ratings = JSON.parse(localStorage.getItem(key)) || { ratingSum: 0, ratingCount: 0 };
    ratings.ratingSum += stars;
    ratings.ratingCount += 1;
    localStorage.setItem(key, JSON.stringify(ratings));
    window.dispatchEvent(new CustomEvent('ratingUpdated', { detail: { bookId, ratings } }));
    return ratings;
  } else {
    try {
      const bookRef = doc(db, 'books', bookId);
      
      // Update atomically using increments
      await setDoc(bookRef, {
        ratingSum: increment(stars),
        ratingCount: increment(1)
      }, { merge: true });

      const updatedSnap = await getDoc(bookRef);
      const data = updatedSnap.data();
      const ratings = {
        ratingSum: data.ratingSum || 0,
        ratingCount: data.ratingCount || 0
      };
      window.dispatchEvent(new CustomEvent('ratingUpdated', { detail: { bookId, ratings } }));
      return ratings;
    } catch (e) {
      console.error("Error submitting rating: ", e);
    }
  }
}

// 3. COMMENTS
export function listenToComments(announcementId, callback) {
  if (useFallback) {
    const getLocalComments = () => {
      const comments = JSON.parse(localStorage.getItem(`comments_${announcementId}`)) || [];
      // Sort newest first
      return comments.sort((a, b) => b.timestamp - a.timestamp);
    };

    // Initial load
    callback(getLocalComments());

    // Listen to local storage changes (for local multi-tab sync)
    const listener = (e) => {
      if (e.key === `comments_${announcementId}`) {
        callback(getLocalComments());
      }
    };
    window.addEventListener('storage', listener);

    // Custom trigger for same page updates
    const localUpdateListener = (e) => {
      if (e.detail && e.detail.announcementId === announcementId) {
        callback(getLocalComments());
      }
    };
    window.addEventListener('localCommentAdded', localUpdateListener);

    return () => {
      window.removeEventListener('storage', listener);
      window.removeEventListener('localCommentAdded', localUpdateListener);
    };
  } else {
    const commentsRef = collection(db, 'comments');
    const q = query(
      commentsRef, 
      where('announcementId', '==', announcementId)
    );

    return onSnapshot(q, (snapshot) => {
      const comments = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        comments.push({
          id: doc.id,
          name: data.name,
          text: data.text,
          // Format date or handle null serverTimestamp before sync
          timestamp: data.timestamp ? data.timestamp.toDate().getTime() : Date.now()
        });
      });
      
      // Sort client-side (newest first) to bypass Firebase composite index requirement
      comments.sort((a, b) => b.timestamp - a.timestamp);
      
      callback(comments);
    }, (error) => {
      console.error("Error listening to comments: ", error);
    });
  }
}

export async function addComment(announcementId, name, text) {
  if (!name.trim() || !text.trim()) return;

  if (useFallback) {
    const key = `comments_${announcementId}`;
    const comments = JSON.parse(localStorage.getItem(key)) || [];
    const newComment = {
      id: 'local_' + Date.now() + Math.random().toString(36).substr(2, 5),
      name: name,
      text: text,
      timestamp: Date.now()
    };
    comments.push(newComment);
    localStorage.setItem(key, JSON.stringify(comments));

    // Dispatch update event to active listeners in this window
    window.dispatchEvent(new CustomEvent('localCommentAdded', { detail: { announcementId } }));
    return newComment;
  } else {
    try {
      const commentsRef = collection(db, 'comments');
      const docRef = await addDoc(commentsRef, {
        announcementId,
        name,
        text,
        timestamp: serverTimestamp()
      });
      return { id: docRef.id, name, text, timestamp: Date.now() };
    } catch (e) {
      console.error("Error adding comment: ", e);
      throw e;
    }
  }
}
