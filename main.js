const list = document.querySelector("ul");
const form = document.querySelector("form");
const button = document.querySelector("button");

const addMovie = (movie, id) => {
    let time = movie.created_at.toDate();

    let html = `
        <li data-id="${id}">
            <div>Movie title: ${movie.title}</div>
            <div>${time}</div>
            <button class="btn btn-danger btn-sm my-2"> delete</button>
        </li>
    `;

    list.innerHTML += html;
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

    const now = new Date();
    const movie = {
        title: form.movie.value,
        created_at: firebase.firestore.Timestamp.fromDate(now)
    };

    db.collection("movies").add(movie).then(() => {
        console.log("new movie added");
    }).catch(err => {
        console.log(err);
    });
});

// deleting data
list.addEventListener("click", e => {
    if (e.target.tagName === "BUTTON") {
        const id = e.target.parentElement.getAttribute("data-id");
        db.collection("movies").doc(id).delete().then(() => {
            console.log("movie deleted");
        });
    }
});

// unscubscribe from database changes
button.addEventListener("click", () => {
    unsubscribe();
    console.log("unsubscribed from collection changes")
})