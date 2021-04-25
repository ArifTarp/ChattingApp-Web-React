import './App.css';

import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { useRef, useState } from 'react';

firebase.initializeApp({
  // firebase configurations
  apiKey: "AIzaSyDnrTQuU95vFJSJH04WclZzurLfVeenJ9o",
  authDomain: "reactfirebase-chat-app.firebaseapp.com",
  projectId: "reactfirebase-chat-app",
  storageBucket: "reactfirebase-chat-app.appspot.com",
  messagingSenderId: "1034015288251",
  appId: "1:1034015288251:web:202142cee62828f871f29e",
  measurementId: "G-DNHX2VJ42G"
})

const auth = firebase.auth();
const firestore = firebase.firestore();

function App() {

  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header className="App-header">
        <SignOut />
      </header>
      <section>
        {user ? <ChatRoom /> : <SignIn />}
      </section>
    </div>
  );
}

function SignIn() {

  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }

  return (
    <button onClick={signInWithGoogle}>Sign in with Google</button>
  )
}

function SignOut() {
  return auth.currentUser && (
    <button onClick={() => auth.signOut()}>Sign out</button>
  )
}

function ChatRoom() {
  const dummy = useRef();

  const messagesRef = firestore.collection('messages');
  const query = messagesRef.orderBy('createdAt').limit(25);

  // listen to data with hook
  const [messages] = useCollectionData(query, { idField: 'id' });

  const [formValue, setFormValue] = useState('');

  // writing value to firestore
  const sendMessage = async (e) => {
    // prevent refresh page
    e.preventDefault();

    const { uid, photoURL } = auth.currentUser;

    // create new document in firestore
    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL
    });

    setFormValue('');

    dummy.current.scrollIntoView({ behaviour: 'smooth' });
  }

  return (
    <>
      <main>
        <div>{messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}</div>
        <div ref={dummy}></div>
      </main>

      <form onSubmit={sendMessage}>
        <input value={formValue} onChange={(e) => setFormValue(e.target.value)} />
        <button type='submit'>Send</button>
      </form>
    </>
  )
}

function ChatMessage(props) {
  const { text, uid, photoURL, createdAt } = props.message;

  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

  const date = createdAt.toDate();
  const hour = date.getHours();
  const minute = date.getMinutes();
  const second = date.getSeconds();

  return (<>
    <div className={`message ${messageClass}`}>
      <img src={photoURL} />
      <p>
        {text}
        <p>{hour + ":" + minute + ":" + second}</p>
      </p>
    </div>
  </>)
}

export default App;
