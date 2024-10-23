/*
HELPS TO PLAN YOUR TIMETABLE
Copyright (C) 2024  Sarvesh Dakhore

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>. 
*/

/*
 *  This file contains the events and functions applied to
 *  the document body that is common to all sections or
 *  that doesn't fit into any particular section
 */

import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

import '../scss/main.scss';
import '../scss/course-panel.scss';
import '../scss/timetable.scss';
import '../scss/course-list.scss';
import '../css/add-on.css';

import localforage from 'localforage/dist/localforage';

import './attacher';
import './course-panel';
import './add_on';
import './timetable';

import * as Utils from './utils';

const lastUpdate = require('../../package.json')['lastUpdate'];
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut} from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';

// Firebase configuration
const firebaseConfig = {
    apiKey: 'AIzaSyCqmS3KQq0P7EaiDknKZqZQe5nULWtOXf0',
    authDomain: 'ffcs-planner.firebaseapp.com',
    projectId: 'ffcs-planner',
    storageBucket: 'ffcs-planner.appspot.com',
    messagingSenderId: '552827627156',
    appId: '1:552827627156:web:a12e6d0c3a7fc11e89f681',
    measurementId: 'G-CEW2B6Z6MQ',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const userOptDiv = document.getElementById('user-opt');
const login = document.getElementById('login-btn');
// Create GoogleAuthProvider instance
const provider = new GoogleAuthProvider();
function showUserOpt() {
    try {
        const userOptDiv = document.getElementById('user-opt');
        if (userOptDiv) {
            userOptDiv.style.setProperty('display', 'block', 'important');
        } else {
            throw new Error('Element with id "user-opt" not found');
        }
    } catch (error) {
        console.error('Error in showing user options div:', error);
    }
}

// Function to hide the div
function hideUserOpt() {
    try {
        const userOptDiv = document.getElementById('user-opt');
        if (userOptDiv) {
            userOptDiv.style.setProperty('display', 'none', 'important');
        } else {
            throw new Error('Element with id "user-opt" not found');
        }
    } catch (error) {
        console.error('Error in hiding user options div:', error);
    }
}
// Function to handle sign-in

const handleLogin = () => {
    signInWithPopup(auth, provider)
        .then((result) => {
            const user = result.user;
            console.log('Signed in as: ', user.displayName);
            showUserOpt()
            login.style.display = 'none';
        })
        .catch((error) => {
            console.error('Login error: ', error);
            hideUserOpt()
            login.style.display = 'block';
        });
};
// Wait for DOM to load and then bind the login event
window.addEventListener('load', () => {
    const loginButton = document.getElementById('login-btn');
    const userOptDiv = document.getElementById('user-opt'); // Ensure this targets the correct div
    const loginDiv = loginButton; // Ensure this targets the correct login div

    auth.onAuthStateChanged((user) => {
        if (user) {
            console.log('User already signed in: ', user.displayName);
            // Show the user options div and hide the login button
            showUserOpt()
            loginDiv.style.display = 'none';
        } else {
            console.log('No user is signed in.');
            // Hide the user options div and show the login button
            hideUserOpt()
            loginDiv.style.display = 'block';
        }
    });

    if (loginButton) {
        loginButton.addEventListener('click', handleLogin);
    }
});
// Function to handle sign-out
const handleLogout = () => {
    signOut(auth)
        .then(() => {
            console.log('User signed out successfully.');
            login.style.display = 'block'; // Show login button if no user is signed in
            userOptDiv.style.display = 'none';
        })
        .catch((error) => {
            console.error('Error signing out: ', error);
            login.style.display = 'none'; // Show login button if no user is signed in
            userOptDiv.style.display = 'block';
        });
};

// Add event listener to the logout link
document.getElementById('logout-link').addEventListener('click', (event) => {
    event.preventDefault(); // Prevent the default link behavior
    handleLogout();
});


$(function () {
    /*
        Remove focus from quick buttons once clicked
     */
    $('.quick-buttons .btn').on('click', function () {
        $(this).trigger('blur');
    });

    localforage.getItem('campus').then((campus) => {
        window.location.hash = campus || '#Vellore';
        switchCampus();

        /*
            Event to listen for hash changes
         */
        $(window).on('hashchange', () => {
            if (window.location.hash === `#${window.campus}`) {
                return;
            }

            new bootstrap.Modal($('#switch-campus-modal').get(0)).show();
        });
    });

    Utils.removeTouchHoverCSSRule();
});

/*
    Function to switch campuses
 */
window.switchCampus = () => {
    if (window.location.hash.toLowerCase() === '#chennai') {
        $('#campus').text('Chennai Campus');
        $('#last-update').text(lastUpdate.chennai);
        window.location.hash = '#Chennai';
        window.campus = 'Chennai';
    } else if (window.location.hash.toLowerCase() === '#vellore') {
        $('#campus').text('Vellore Campus');
        $('#last-update').text(lastUpdate.vellore);
        window.location.hash = '#Vellore';
        window.campus = 'Vellore';
    } else {
        window.location.hash = `#${window.campus}`;
    }

    localforage.getItem('campus').then((campus) => {
        localforage.setItem('campus', window.campus).catch(console.error);

        if (campus && campus != window.campus) {
            localforage
                .removeItem('timetableStorage')
                .then(window.location.reload());
            return;
        }

        getCourses();
        initializeTimetable();
    });
};

/*
    Redirect to the GitHub page when Ctrl + U is clicked
    instead of showing the page source code
 */
document.onkeydown = function (e) {
    if (e.ctrlKey && e.key == 'u') {
        window.open('https://github.com/vatz88/FFCSonTheGo');
        return false;
    } else {
        return true;
    }
};

/*
    Function to clear all sections
 */
window.resetPage = () => {
    clearPanel();
    clearTimetable();
    clearCourseList();
};

/*
    Prompt add to home screen
 */
window.addEventListener('beforeinstallprompt', (e) => {
    ga('send', {
        hitType: 'event',
        eventCategory: 'A2H',
        eventAction: 'Seen',
        eventLabel: `A2H Shown`,
    });

    e.userChoice.then((choiceResult) => {
        ga('send', {
            hitType: 'event',
            eventCategory: 'A2H',
            eventAction: 'click',
            eventLabel: `A2H ${choiceResult.outcome}`,
        });
    });
});
