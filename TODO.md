# TODO: Fix Issues in RandomVerse App

## 1. Private Chat Message Sending Issue
- [x] Modify `frontend/js/private.js` to add immediate local message display when sending messages
- [x] Ensure message appears instantly in chat UI before socket confirmation

## 2. Community Page getVerseByIntent Fix
- [x] Update `getVerseByIntent` in `frontend/js/community.js` to use questions endpoint pattern like main.js
- [x] Change from fetching `./verses-by-theme/${keyword}` to fetching `/questions` and filtering locally

## 3. allow editing in community page only by the user who posted.
- [x] Add edit button only for question author
- [x] Implement edit mode toggle in frontend
- [x] Add PUT endpoint for updating questions
- [x] Add CSS styles for edit functionality
- [x] Test edit functionality works correctly

## 5. Fix Private Chat Message Sending Issue
- [x] Add try-catch error handling in frontend message sending
- [x] Add error event listener for socket message errors
- [x] Add proper error handling in backend socket message sending
- [x] Remove temporary message from UI if sending fails
- [x] Display user-friendly error messages

## 4. Chat.html and Chat.js Enhancement
- [x] Evaluate if chat.html and chat.js can be improved to work as a good Bible AI
- [x] Consider integrating with existing verse database and AI memory system
- [x] Potentially add verse suggestions and better responses
- [x] Load questionMap.js for enhanced verse database access
- [x] Add verse suggestion buttons ("More like this", "Different verse")
- [x] Update reply templates to use verse.ref instead of book/chapter/verse
- [x] Add conversation memory to avoid repeating verses
- [x] Integrate with both aiMemory and questionMap for broader verse coverage
- [x] Add CSS styles for verse suggestion buttons
