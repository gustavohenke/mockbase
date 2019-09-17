# Mockbase
[![Build status](https://img.shields.io/travis/gustavohenke/mockbase.svg?style=flat-square)](https://travis-ci.org/gustavohenke/mockbase)
[![Coverage](https://img.shields.io/coveralls/github/gustavohenke/mockbase.svg?style=flat-square)](https://coveralls.io/github/gustavohenke/mockbase)

Firebase v6+ mock. Great for unit testing and [Storybooks](https://storybook.js.org).
Built-in support for TypeScript included.

However, please note that not all features are implemented.
Take a look at the [implemented features table](#implemented-features) to find out what is available and what is not.

## How to use
Wherever you would use Firebase's app or its features, you pass a Mockbase app or feature instance:

```ts
const firebase = require('firebase');
function signInWithFacebook(firebaseAuth: firebase.auth.Auth) {
  firebaseAuth.signInWithPopup(new firebase.auth.FacebookAuthProvider());
}

function addTodo(text: string, todoCollection: firebase.firestore.CollectionReference) {
  return todoCollection.add({ text });
}

const MockApp = require('mockbase');
const app = new MockApp('app name');
signInWithFacebook(app.auth());
addTodo('Clean home up', app.firestore().collection('todo'));
```

## Implemented features
| Feature group | Status |
| ------------- | ------ |
| Auth          | Partly implemented |
| Database      | Not implemented |
| Firestore     | Partly implemented |
| Messaging     | Not implemented |
| Storage       | Not implemented |

