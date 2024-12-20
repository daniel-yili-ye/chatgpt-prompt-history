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

    let commandHistory = [];
    let currentIndex = 0;
    let inputField = null;
    let initialized = false;
    let currentChatId = null;

    // Function to get current chat ID from URL
    function getCurrentChatId() {
        const match = window.location.pathname.match(/\/c\/([\w-]+)/);
        return match ? match[1] : null;
    }

    // Initialize or reinitialize the command history
    function initializeHistory() {
        const messageNodes = document.querySelectorAll('[data-message-author-role="user"]');
        const newChatId = getCurrentChatId();

        if (messageNodes.length > 0) {
            // If we're in a new chat, reset everything
            if (newChatId !== currentChatId) {
                currentChatId = newChatId;
                commandHistory = Array.from(messageNodes).map(a => a.textContent);
                currentIndex = commandHistory.length;
                console.log('ChatGPT History: Switched to new chat with', commandHistory.length, 'messages');
            }

            inputField = document.querySelector("#prompt-textarea");
            initialized = true;
            return true;
        }
        return false;
    }

    // Function to wait for chat content to load
    function waitForChat() {
        const checkInterval = setInterval(() => {
            if (initializeHistory()) {
                clearInterval(checkInterval);
                setupObserver();
            }
        }, 1000);

        setTimeout(() => {
            clearInterval(checkInterval);
            if (!initialized) {
                console.log('ChatGPT History: Failed to initialize after 30 seconds');
            }
        }, 30000);
    }

    // Setup mutation observer
    function setupObserver() {
        const observer = new MutationObserver((mutationsList, observer) => {
            // Check if we've navigated to a new chat
            const newChatId = getCurrentChatId();
            if (newChatId !== currentChatId) {
                initializeHistory();
                return;
            }

            const messageNodes = document.querySelectorAll('[data-message-author-role="user"]');
            const newHistory = Array.from(messageNodes).map(a => a.textContent);

            // Update history if it's changed
            if (JSON.stringify(newHistory) !== JSON.stringify(commandHistory)) {
                commandHistory = newHistory;
                currentIndex = commandHistory.length;
                console.log('ChatGPT History: Updated to', commandHistory.length, 'messages');
            }

            // Update input field reference if needed
            inputField = document.querySelector("#prompt-textarea");
        });

        // Observe both body (for content changes) and URL changes
        observer.observe(document.body, {
            attributes: true,
            childList: true,
            subtree: true
        });

        // Also watch for URL changes
        let lastUrl = location.href;
        new MutationObserver(() => {
            const url = location.href;
            if (url !== lastUrl) {
                lastUrl = url;
                initializeHistory();
            }
        }).observe(document, {subtree: true, childList: true});
    }

    // Function to handle key press event
    function handleKeyPress(event) {
        if (!initialized || !commandHistory.length) return;

        const commandKey = event.metaKey || event.ctrlKey;

        if (commandKey && (event.key === "ArrowUp" || event.key === "ArrowDown")) {
            event.preventDefault();

            if (event.key === "ArrowUp" && currentIndex > 0) {
                currentIndex--;
                populateInput(commandHistory[currentIndex]);
            } else if (event.key === "ArrowDown") {
                if (currentIndex < commandHistory.length - 1) {
                    currentIndex++;
                    populateInput(commandHistory[currentIndex]);
                } else if (currentIndex === commandHistory.length - 1) {
                    currentIndex = commandHistory.length;
                    populateInput("");
                }
            }

            console.log('ChatGPT History: Navigated to index', currentIndex);
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

    // Add event listener for key press
    document.addEventListener('keydown', handleKeyPress);

    // Start initialization process
    waitForChat();
})();
