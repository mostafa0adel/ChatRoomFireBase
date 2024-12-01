import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';
import 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyCBDbmBIB3x9v8RAmJJ8fut65j1BHmCets",
  authDomain: "labtask2-cb64c.firebaseapp.com",
  projectId: "labtask2-cb64c",
  storageBucket: "labtask2-cb64c.firebasestorage.app",
  messagingSenderId: "230466244503",
  appId: "1:230466244503:web:b99864da1301b2b601bed2"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();
const rtdb = firebase.database();