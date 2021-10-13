const list = document.querySelector("ul");
const form = document.querySelector("#add");
const important = document.getElementById("important");
const editBtn = document.querySelector(".edit");
const deleteBtn = document.querySelector(".delete");
const search = document.querySelector(".search input");
const now = new Date();

const addMovie = (movie, id) => {
    let time = movie.created_at.toDate();

    let html = `
        <li class="list" data-id="${id}">
            <div>Title: ${movie.title}</div>
            <div>Director: ${movie.director}</div>
            <div>Summary: ${movie.summary}</div>
            <div>Created on: ${time}</div>
            <br></br>
            <input id="important" type="checkbox" class="btn-check" id="check_${id}" active="${movie.important}" data-id="${id}" data-click="important">
                <label class="btn btn-sm btn-outline-warning" for="check_${id}">
                Important
                <svg xmlns="http://www.w3.org/2000/svg" class="mb-1" height="14px" fill="currentColor" class="bi bi-star-fill" viewBox="0 0 16 16">
                    <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z"/>
                </svg>
            </label>
            <div class="btn btn-danger btn-sm my-2 edit">edit</div>
            <button class="btn btn-danger btn-sm my-2 delete">delete</button>
        </li>
    `;

    list.innerHTML += html;

    if (movie.important === true) {
        let check_id = "check_" + id;
        document.getElementById(check_id).checked = true;
    }
}

const deleteMovie = (id) => {
    const movies = document.querySelectorAll("li");
    movies.forEach(movie => {
        if(movie.getAttribute("data-id") === id) {
            movie.remove();
        }
    });
}

// get documents
const unsubscribe = db.collection("movies").onSnapshot(snapshot => {
    snapshot.docChanges().forEach(change => {
        const doc = change.doc;
        if (change.type === "added") {
            addMovie(doc.data(), doc.id);
        } else if (change.type === "removed") {
            deleteMovie(doc.id);
        }
    })
});

// add documents
form.addEventListener("submit", e => {
    e.preventDefault();

    const movie = {
        title: form.title.value,
        director: form.director.value,
        summary: form.summary.value,
        created_at: firebase.firestore.Timestamp.fromDate(now)
    };

    db.collection("movies").add(movie).then(() => {
        console.log("new movie added");
    }).catch(err => {
        console.log(err);
    });
});

// deleting & editing data
list.addEventListener("click", e => {
    if (e.target.tagName === "BUTTON") {
        const id = e.target.parentElement.getAttribute("data-id");
        db.collection("movies").doc(id).delete().then(() => {
            console.log("movie deleted");
        });
    } else if (e.target.tagName === "DIV") {
        const id = e.target.parentElement.getAttribute("data-id");
        // delete old movie & create new one
        db.collection("movies").doc(id).update({
            title: form.title.value,
            director: form.director.value,
            summary: form.summary.value,
            created_at: Date.now()
            }).then(()=>{
                console.log("movie edited")
                db.collection("movies").doc(id).delete().then(() => {
                    console.log("movie deleted");
                });
            }).catch(err => {
                console.log(err);
        });
    }
});

// unscubscribe from database changes
document.querySelector("#unsubscribe").addEventListener("click", () => {
    unsubscribe();
    console.log("unsubscribed from collection changes")
})

// filter/search by movie
const filterMovies = (term) => {
    Array.from(list.children)
        .filter((movie) => !movie.textContent.toLowerCase().includes(term))
        .forEach((movie) => movie.classList.add("filtered"));

    Array.from(list.children)
        .filter((movie) => movie.textContent.toLowerCase().includes(term))
        .forEach((movie) => movie.classList.remove("filtered"));
    
}

search.addEventListener("keyup", () => {
    const term = search.value.trim().toLowerCase();
    filterMovies(term);
}) 

// "important" selection
/* important.addEventListener("change", () => {
    const movies = document.querySelectorAll("li");
    if(important.checked === true){
        movies.forEach(note => {
        if(!movie.childNodes[1].childNodes[1].childNodes[3].checked){
          movie.classList.add("d-none");
        }
      })
    } else{
        movies.forEach(movie => {
        movie.classList.remove("d-none");
      })
    }
}) */