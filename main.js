const list = document.querySelector("ul");
const form = document.querySelector("#add");
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
            <div class="form-check">
                <input class="form-check-input" type="checkbox" value="" id="important">
                    <label class="form-check-label" for="important">IMPORTANT: To watch
                </label>
            </div>
            <div class="btn btn-danger btn-sm my-2 edit">edit</div>
            <button class="btn btn-danger btn-sm my-2 delete">delete</button>
        </li>
    `;

    list.innerHTML += html;

    const checkbox = document.querySelector("#important");
    
    checkbox.addEventListener("click", e => {
        if (e.target.tagName === "INPUT") {
            e.target.parentElement.getAttribute("data-id");
            console.log("hi there")
        }
    }); 
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