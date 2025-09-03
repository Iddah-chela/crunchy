let storage;
try {
  localStorage.setItem("test", "test");
  localStorage.removeItem("test");
  storage = localStorage;
} catch (err) {
  storage = sessionStorage;
}

if (typeof initTopbar === "function") {
  initTopbar();
  }

let noteslist = JSON.parse(storage.getItem("notes")) || [];
let display = document.getElementById("noteItems");
display.innerHTML = ""; // Clear default <li> message

if (noteslist.length === 0) {
  let li = document.createElement("li");
  li.innerText = "No Items yet. Click on ";
  let a = document.createElement("a");
  a.href = "writenotes.html";
  a.classList.add("innerbtn");
  a.innerText = "+Add";
  li.appendChild(a);
  display.appendChild(li);
} else {
if (typeof initTopbar === "function") {
  initTopbar();
  }
  noteslist.forEach((note, index) => {
  let li = document.createElement("li");

  // Step 2.1: Create a <p> to show the note
  let p = document.createElement("p");
  p.innerText = note;
  
  let deletebtn = document.createElement("button");
  deletebtn.innerText = "🗑️";
  deletebtn.classList.add("innerbtn");
  deletebtn.onclick = () => {
    //remove the note at index
    noteslist.splice(index, 1);
    
    //save updated notes 
    storage.setItem("notes", JSON.stringify(noteslist));
    li.remove();
  }

  // Step 2.2: When <p> is clicked, turn it into a textarea
  p.onclick = () => {
    // Clear the li content
    li.innerHTML = "";

    // Create a textarea with the note
    let textarea = document.createElement("textarea");
    textarea.value = noteslist[index];
    textarea.style.width = "100%";
   

    // Create a Save button
    let saveBtn = document.createElement("button");
    saveBtn.innerText = "Save";
    saveBtn.classList.add("innerbtn");

    // Step 2.3: When Save is clicked, update the note
    saveBtn.onclick = () => {
      const updatedNote = textarea.value;

      // Replace the note in the array
      noteslist[index] = updatedNote;

      // Save updated notes to storage
      storage.setItem("notes", JSON.stringify(noteslist));

      // Replace textarea with updated <p>
      li.innerHTML = "";
      p.innerText = updatedNote;
      li.appendChild(p);
      li.appendChild(deletebtn);
    };
    if (typeof initTopbar === "function") {
  initTopbar();
  }

    // Add textarea and button back into the li
    li.appendChild(textarea);
    li.appendChild(saveBtn);
    ;
  };
if (typeof initTopbar === "function") {
  initTopbar();
  }
  // Initially add the paragraph (not textarea)
  li.appendChild(p);
  li.appendChild(deletebtn);
  display.appendChild(li);
});
}

let foot = document.getElementById("foot");
    let a = document.createElement("a");
    a.href = "writenotes.html";
    a.classList.add("innerbtn");
    a.classList.add("link-btn");
    a.innerText = "+Add";
    foot.appendChild(a);