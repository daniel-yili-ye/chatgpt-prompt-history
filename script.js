// ==UserScript==
// @name         ChatGPT Command History v2
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  Allows navigation through command history using ⌘ + up and down arrow keys in ChatGPT.
// @author       Daniel Ye
// @match        https://chatgpt.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Array to store command history
    let messageNodes = document.querySelectorAll('[data-message-author-role="user"]');
    let commandHistory = Array.from(messageNodes).map(a => a.textContent);
    let currentIndex = commandHistory.length;

    // Change this selector to match the input field in ChatGPT
    let inputField = document.querySelector("#prompt-textarea");

    // Select the target node you want to observe for changes
    const targetNode = document.body;

    // Options for the observer (which mutations to observe)
    const config = { attributes: true, childList: true, subtree: true };

    // Callback function to execute when mutations are observed
    const callback = function(mutationsList, observer) {
        const newMessageNodes = document.querySelectorAll('[data-message-author-role="user"]');
        const newCommandHistory = Array.from(newMessageNodes).map(a => a.textContent);

        // Update command history only if there's a new message
        if (newCommandHistory.length > commandHistory.length) {
            commandHistory = newCommandHistory;

            // Adjust currentIndex only if it was at the end
            if (currentIndex === commandHistory.length - 1) {
                currentIndex = commandHistory.length;
            }
        }

        // Re-select the input field in case of page updates
        inputField = document.querySelector("#prompt-textarea");
    };

    // Create an observer instance linked to the callback function
    const observer = new MutationObserver(callback);

    // Start observing the target node for configured mutations
    observer.observe(targetNode, config);

    // Function to handle key press event
    function handleKeyPress(event) {
        const commandKey = event.metaKey || event.ctrlKey;
        if (commandKey) {
            if (event.key === "ArrowUp") {
                event.preventDefault();
                if (0 < currentIndex) {
                    currentIndex--;
                    populateInput(commandHistory[currentIndex]);
                }
            } else if (event.key === "ArrowDown") {
                event.preventDefault();
                if (currentIndex < commandHistory.length) {
                    currentIndex++;
                    if (currentIndex === commandHistory.length) {
                        populateInput("");
                    } else {
                        populateInput(commandHistory[currentIndex]);
                    }
                }
            }
        }
    }

    // Function to populate input field with command
    function populateInput(command) {
        if (inputField) {
            inputField.innerHTML = '';
            let child = document.createElement('p');
            child.innerHTML = command;
            inputField.appendChild(child)
        }
    }

    // Event listener for key press
    document.addEventListener('keydown', handleKeyPress);
})();

