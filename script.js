// ==UserScript==
// @name         ChatGPT Command History
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Allows navigation through command history using ⌘ + up and down arrow keys in ChatGPT.
// @author       Daniel Ye
// @match        https://chat.openai.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    // Array to store command history
    var messageNodes = document.querySelectorAll('[data-message-author-role="user"]');
    var commandHistory = Array.from(messageNodes).map(a => a.textContent)
    var currentIndex = commandHistory.length;

    // Change this selector to match the input field in ChatGPT
    var inputField = document.querySelector("#prompt-textarea")

    // Select the target node you want to observe for changes
    var targetNode = document.body

    // Options for the observer (which mutations to observe)
    var config = { attributes: true, childList: true, subtree: true };

    // Callback function to execute when mutations are observed
    var callback = function(mutationsList, observer) {
        messageNodes = document.querySelectorAll('[data-message-author-role="user"]');
        commandHistory = Array.from(messageNodes).map(a => a.textContent)
        currentIndex = commandHistory.length;
        inputField = document.querySelector("#prompt-textarea");
    };
    // Create an observer instance linked to the callback function
    var observer = new MutationObserver(callback);

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
                    }
                    else {
                        populateInput(commandHistory[currentIndex]);
                    }
                }
            }
        }
    }

    // Function to populate input field with command
    function populateInput(command) {
        if (inputField) {
            inputField.value = command;
        }
    }

    // Event listener for key press
    document.addEventListener('keydown', handleKeyPress);
})();

