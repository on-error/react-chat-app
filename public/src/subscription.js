import axios from 'axios';
import { host, notifyRoute } from './utils/APIRoutes';

const convertedVapidKey = urlBase64ToUint8Array(
  'BF41aLeWN71cfW0ha38VUGHN4UQZ9qfrd-YkaljuhRQViKsT4CRAu8r4iTYoYhSFYSrILs_oTwg9AI8ZQ-3ZOcQ'
);

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  // eslint-disable-next-line
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function sendSubscription(subscription) {
  return fetch(`${host}/subscribe`, {
    method: 'POST',
    body: JSON.stringify(subscription),
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

export function subscribeUser() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then(function (registration) {
        if (!registration.pushManager) {
          console.log('Push manager unavailable.');
          return;
        }

        registration.pushManager
          .getSubscription()
          .then(function (existedSubscription) {
            if (existedSubscription === null) {
              console.log('No subscription detected, make a request.');
              registration.pushManager
                .subscribe({
                  applicationServerKey: convertedVapidKey,
                  userVisibleOnly: true,
                })
                .then(function (newSubscription) {
                  console.log('New subscription added.');
                  sendSubscription(newSubscription);
                })
                .catch(function (e) {
                  if (Notification.permission !== 'granted') {
                    console.log('Permission was not granted.');
                  } else {
                    console.error(
                      'An error ocurred during the subscription process.',
                      e
                    );
                  }
                });
            } else {
              console.log('Existed subscription detected.');
              sendSubscription(existedSubscription);
            }
          });
      })
      .catch(function (e) {
        console.error(
          'An error ocurred during Service Worker registration.',
          e
        );
      });
  }
}

function sendNotification(payload) {
  return axios.post(notifyRoute, payload);
}

export function notify(payload) {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then(function (registration) {
        if (!registration.pushManager) {
          console.log('Push manager unavailable.');
          return;
        }

        registration.pushManager
          .getSubscription()
          .then(function (existedSubscription) {
            if (existedSubscription === null) {
              console.log('No subscription detected, make a request.');
              registration.pushManager
                .subscribe({
                  applicationServerKey: convertedVapidKey,
                  userVisibleOnly: true,
                })
                .then(function (newSubscription) {
                  console.log('New subscription added.');
                  sendNotification({ payload, subscription: newSubscription });
                })
                .catch(function (e) {
                  if (Notification.permission !== 'granted') {
                    console.log('Permission was not granted.');
                  } else {
                    console.error(
                      'An error ocurred during the subscription process.',
                      e
                    );
                  }
                });
            } else {
              console.log('Existed subscription detected.');
              sendNotification({ payload, subscription: existedSubscription });
            }
          });
      })
      .catch(function (e) {
        console.error(
          'An error ocurred during Service Worker registration.',
          e
        );
      });
  }
}
