

const firebaseConfig = {
  apiKey: "AIzaSyCBDbmBIB3x9v8RAmJJ8fut65j1BHmCets",
  authDomain: "labtask2-cb64c.firebaseapp.com",
  databaseURL: "https://labtask2-cb64c-default-rtdb.firebaseio.com/",
  projectId: "labtask2-cb64c",
  storageBucket: "labtask2-cb64c.firebasestorage.app",
  messagingSenderId: "230466244503",
  appId: "1:230466244503:web:b99864da1301b2b601bed2"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
// Get references to Firebase services
const auth = firebase.auth();
const db = firebase.firestore();
// Authentication
const loginButton = document.getElementById('login-button');
const signupButton = document.getElementById('signup-button');
const logoutButton = document.getElementById('logout-button');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const signupEmailInput = document.getElementById('signup-email');
const signupPasswordInput = document.getElementById('signup-password');
const userInfo = document.getElementById('user-info');
const userEmail = document.getElementById('user-email');
const userName = document.getElementById('signup-name');
// Firestore
const addDataButton = document.getElementById('add-data-button');
const channelNameInput = document.getElementById('channel-name');
const channelDescriptionInput = document.getElementById('channel-description');
const dataList = document.getElementById('data-list').querySelector('ul');
const getUserRole = async (userId) => {
  const userDoc = await db.collection('users').doc(userId).get();
  return userDoc.exists ? userDoc.data().role : null;
};
const setupUIForRole = async (userId) => {
  const role = await getUserRole(userId);
  if (role === 'admin') {
    document.getElementById('firestore-container').style.display = 'block'; // Admin UI
  } else if (role === 'user') {
    document.getElementById('firestore-container').style.display = 'none'; // Hide admin options
  }
};
const assignUserRole = async (userId, role) => {
  try {
    await db.collection('users').doc(userId).set({
      // take the first name and last name from the email address
      Name : userName.value,
      channels: [],
      role: role
    });
    console.log('Role assigned successfully!');
  } catch (error) {
    console.error('Error assigning role:', error);
  }
};

// Authentication Events
loginButton.addEventListener('click', () => {
  const email = emailInput.value;
  const password = passwordInput.value;
  login(email, password);
});

signupButton.addEventListener('click', () => {
  const email = signupEmailInput.value;
  const password = signupPasswordInput.value;
  signup(email, password);
});

logoutButton.addEventListener('click', () => {
  logout();
});

// Firestore Events
addDataButton.addEventListener('click', () => {
  const channelName = channelNameInput.value;
  const channelDescription = channelDescriptionInput.value;
  addChannel(channelName, channelDescription);

});

// Update UI based on authentication state
function updateUI(user) {
  if (user) {
    userInfo.style.display = 'block';
    userEmail.textContent = user.email;
    // Hide login/signup forms
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('signup-form').style.display = 'none';
    setupUIForRole(user.uid);
  } else {
    userInfo.style.display = 'none';
    // Show login/signup forms
    document.getElementById('login-form').style.display = 'block';
    document.getElementById('signup-form').style.display = 'block';
    document.getElementById('firestore-container').style.display = 'none';
  }
}
const signup = async (email, password) => {
  try {
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    const user = userCredential.user;
    assignUserRole(user.uid, 'user');
    updateUI(user);
  } catch (error) {
    console.error('Error creating user:', error);
  }
}

const login = async (email, password) => {
  try {
    const userCredential = await auth.signInWithEmailAndPassword(email, password);
    const user = userCredential.user;
    console.log('User signed in:', user);
    localStorage.setItem("userId", user.uid);
    userDoc = await db.collection('users').doc(user.uid).get();
    const userName = userDoc.data().Name;
    localStorage.setItem("userName", userName);
    updateUI(user);
  } catch (error) {
    console.error('Error signing in:', error);
  }
}
const logout = async () => {
  try {
    await auth.signOut();
    console.log('User signed out');
    updateUI(null);
  } catch (error) {
    console.error('Error signing out:', error);
  }
}

auth.onAuthStateChanged((user) => {
  localStorage.setItem("userId", user.uid);
  updateUI(user);
});

const addChannel = async (channelName, description) => {
  try {
    await db.collection('channels').add({
      name: channelName,
      description: description,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      members: [] // Initially empty
    });
    console.log('Channel added successfully!');

    channelNameInput.value = '';
    channelDescriptionInput.value = '';
    loadChannels();
  } catch (error) {
    console.error('Error adding channel:', error);
  }
};
const removeChannel = async (channelId) => {
  try {
    await db.collection('channels').doc(channelId).delete();
    console.log('Channel removed successfully!');
    loadChannels();
  } catch (error) {
    console.error('Error removing channel:', error);
  }
};
// Load channels and render them
async function loadChannels() {
  const channelList = document.querySelector("#data-list ul");
  channelList.innerHTML = ""; // Clear list

  const userId = auth.currentUser?.uid; // Get current user ID
  const userDoc = userId ? await db.collection('users').doc(userId).get() : null;
  const subscribedChannels = userDoc?.data()?.channels || []; 

  const querySnapshot = await db.collection("channels").get();
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    const listItem = document.createElement("li");
    listItem.className = "list-group-item d-flex justify-content-between align-items-center";
    listItem.textContent = `${data.name}`;

    const buttonContainer = document.createElement("div");
    userRole = userDoc?.data()?.role;
    // Admin: Add remove button
    if (userRole === "admin") {
      const removeButton = document.createElement("button");
      removeButton.className = "btn btn-danger btn-sm";
      removeButton.textContent = "Remove";
      removeButton.addEventListener("click", () => removeChannel(doc.id));
      buttonContainer.appendChild(removeButton);
    }
    //chat button
    const chatButton = document.createElement("button");
    chatButton.className = "btn btn-primary btn-sm";
    chatButton.textContent = "Join Chat";
    chatButton.disabled = !subscribedChannels.includes(doc.id);

    // Subscribe button
    const subscribeButton = document.createElement("button");
    subscribeButton.className = "btn btn-success btn-sm mr-2";
    subscribeButton.textContent = "Subscribe";
    subscribeButton.disabled = subscribedChannels.includes(doc.id);
    subscribeButton.addEventListener("click", () => subscribeToChannel(doc.id, subscribeButton, unsubscribeButton, chatButton));


    // Unsubscribe button
    const unsubscribeButton = document.createElement("button");
    unsubscribeButton.className = "btn btn-warning btn-sm";
    unsubscribeButton.textContent = "Unsubscribe";
    unsubscribeButton.disabled = !subscribedChannels.includes(doc.id);
    unsubscribeButton.addEventListener("click", () => unsubscribeFromChannel(doc.id, subscribeButton, unsubscribeButton, chatButton));
    chatButton.addEventListener("click", () => JoinChat(data.name));
    buttonContainer.appendChild(chatButton);
    buttonContainer.appendChild(subscribeButton);
    buttonContainer.appendChild(unsubscribeButton);

    listItem.appendChild(buttonContainer);
    channelList.appendChild(listItem);
  });
}

// Subscribe to a channel
const subscribeToChannel = async (channelId, subscribeButton, unsubscribeButton,chatButton) => {
  try {
    const userId = auth.currentUser?.uid; // Get current user ID
    if (!userId) throw new Error("User not logged in.");

    // Update Firestore with subscribed channel
    await db.collection('users').doc(userId).set({
      channels: firebase.firestore.FieldValue.arrayUnion(channelId)
    }, { merge: true });
    //add user to members of channel
    await db.collection('channels').doc(channelId).set({
      members: firebase.firestore.FieldValue.arrayUnion(userId)
    }, { merge: true });

    console.log('Subscribed to channel!');
    subscribeButton.disabled = true;
    unsubscribeButton.disabled = false;
    chatButton.disabled = false;

  } catch (error) {
    console.error('Error subscribing to channel:', error);
  }
};

// Unsubscribe from a channel
const unsubscribeFromChannel = async (channelId, subscribeButton, unsubscribeButton,chatButton) => {
  try {
    const userId = auth.currentUser?.uid; // Get current user ID
    if (!userId) throw new Error("User not logged in.");

    // Update Firestore to remove channel from subscriptions
    await db.collection('users').doc(userId).update({
      channels: firebase.firestore.FieldValue.arrayRemove(channelId)
    });
    //remove user from members of channel
    await db.collection('channels').doc(channelId).set({
      members: firebase.firestore.FieldValue.arrayRemove(userId)
    }, { merge: true });
    console.log('Unsubscribed from channel!');
    subscribeButton.disabled = false;
    unsubscribeButton.disabled = true;
    chatButton.disabled = true;

  } catch (error) {
    console.error('Error unsubscribing from channel:', error);
  }
};
const JoinChat = async (channelName) => {
  const userId = auth.currentUser?.uid; // Get current user ID
  if (!userId) throw new Error("User not logged in.");
  localStorage.setItem("channelName", channelName);
  window.location.href = "chat.html";
}; 

// Load channels on page load
document.addEventListener("DOMContentLoaded", () => {
  auth.onAuthStateChanged((user) => {
    if (user) {
      loadChannels();
    } else {
      document.querySelector("#data-list ul").innerHTML = "<p>Please log in to see channels.</p>";
    }
  });
});





