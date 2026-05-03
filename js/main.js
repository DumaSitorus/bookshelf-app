// Do your work here...
// console.log('Hello, world!');

const books = [];
const RENDER_EVENT = 'render-book';
const SAVED_EVENT = 'saved-book';
const STORAGE_KEY = 'BOOKSHELF_APPS';
let searchKeyword = '';
let editingBookId = null;

function generateId() {
    return +new Date();
}

function generatedBookObject(id, title, author, year, isComplete) {
    return {
        id, 
        title, 
        author, 
        year, 
        isComplete
    }
}

function findBook(bookId) {
    for (const bookItem of books) {
        if (bookItem.id === bookId) {
            return bookItem;
        }
    }
    return null;
}

function findBookIndex(bookId) {
    for (const index in books) {
        if (books[index].id === bookId) {
            return index;
        }
    }
    return -1;
}

function isStorageExist() {
    if (typeof (Storage) === undefined) {
        alert('Browser tidak mendukung local storage');
        return false;
    }
    return true;
}

function saveData() {
    if (isStorageExist()) {
        const parsed = JSON.stringify(books);
        localStorage.setItem(STORAGE_KEY, parsed);
        document.dispatchEvent(new Event(SAVED_EVENT));
    }
}

function loadDataFromStorage() {
    const serializedData = localStorage.getItem(STORAGE_KEY);
    let data = JSON.parse(serializedData);

    if (data != null) {
        for (const book of data) {
            books.push(book);
        }
    }
    document.dispatchEvent(new Event(RENDER_EVENT));
}

function makeBook(bookObject) {
    const {id, title, author, year, isComplete} = bookObject;

    const textTitle = document.createElement('h3');
    textTitle.innerText = title;
    textTitle.setAttribute('data-testid', 'bookItemTitle')

    const textAuthor = document.createElement('p');
    textAuthor.innerText = `Penulis: ${author}`;
    textAuthor.setAttribute('data-testid', 'bookItemAuthor')

    const textyear = document.createElement('p');
    textyear.innerText = `Tahun: ${year}`;
    textyear.setAttribute('data-testid', 'bookItemYear')

    const container = document.createElement('div');
    container.classList.add('data-box');
    container.setAttribute('data-bookid', id);
    container.setAttribute('data-testid', 'bookItem');

    const buttonContainer = document.createElement('div');
    buttonContainer.classList.add('button-group');

    if (isComplete) {
        const undoButton = document.createElement('button');
        undoButton.innerText = 'Belum Selesai';
        undoButton.classList.add('unfinish-btn');
        undoButton.setAttribute('data-testid', 'bookItemIsCompleteButton')
        undoButton.addEventListener('click', function () {
            undoBookFromCompleted(id);
        });

        const deleteButton = document.createElement('button');
        deleteButton.innerHTML = 'Hapus Buku';
        deleteButton.classList.add('delete-btn');
        deleteButton.setAttribute('data-testid', 'bookItemDeleteButton')
        deleteButton.addEventListener('click', function () {
            removeBookFromCompleted(id);
        });

        const editButton = document.createElement('button');
        editButton.innerHTML = 'Edit Buku';
        editButton.classList.add('edit-btn');
        editButton.setAttribute('data-testid', 'bookItemEditButton')
        editButton.addEventListener('click', function () {
            startEditBook(id);
        });

        buttonContainer.append(undoButton, deleteButton, editButton );
    } else {
        const finishButton = document.createElement('button');
        finishButton.innerText = 'Selesai Baca';
        finishButton.classList.add('finish-btn');
        finishButton.setAttribute('data-testid', 'bookItemIsCompleteButton')
        finishButton.addEventListener('click', function () {
            addBookToCompleted(id);
        });
        
        const deleteButton = document.createElement('button');
        deleteButton.innerHTML = 'Hapus Buku';
        deleteButton.classList.add('delete-btn');
        deleteButton.setAttribute('data-testid', 'bookItemDeleteButton')
        deleteButton.addEventListener('click', function () {
            removeBookFromCompleted(id);
        });

        const editButton = document.createElement('button');
        editButton.innerHTML = 'Edit Buku';
        editButton.classList.add('edit-btn');
        editButton.setAttribute('data-testid', 'bookItemEditButton')
        editButton.addEventListener('click', function () {
            startEditBook(id);
        });

        buttonContainer.append(finishButton, deleteButton, editButton);
    }

    container.append(textTitle, textAuthor, textyear, buttonContainer)
    return container;
}

function addBook() {
    const textTitle = document.getElementById('bookFormTitle').value;
    const textAuthor = document.getElementById('bookFormAuthor').value;
    const textyear = Number(document.getElementById('bookFormYear').value);
    const isCompleted = document.getElementById('bookFormIsComplete').checked;

    const generatedId = generateId();
    const bookObject = generatedBookObject(generatedId, textTitle, textAuthor, textyear, isCompleted);
    books.push(bookObject);

    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function addBookToCompleted (bookId) {
    const bookTarget = findBook(bookId);

    if (bookTarget == null) return;

    bookTarget.isComplete = true;

    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function removeBookFromCompleted (bookId) {
    const bookTarget = findBookIndex(bookId);

    if (bookTarget === -1) return;
    books.splice(bookTarget, 1);
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function undoBookFromCompleted (bookId) {
    const bookTarget = findBook(bookId);
    if (bookTarget == null) return;

    bookTarget.isComplete = false;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function searchBook(keyword) {
    searchKeyword = keyword;
    document.dispatchEvent(new Event(RENDER_EVENT));
}

function startEditBook(bookId) {
    const book = findBook(bookId);
    if (!book) return;

    document.getElementById('bookFormTitle').value = book.title;
    document.getElementById('bookFormAuthor').value = book.author;
    document.getElementById('bookFormYear').value = book.year;
    document.getElementById('bookFormIsComplete').checked = book.isComplete;

    editingBookId = bookId;

    document.getElementById('bookFormSubmit').innerHTML = 'Edit Data Buku';
}

function updateBook() {
    const book = findBook(editingBookId);
    if (!book) return;

    book.title = document.getElementById('bookFormTitle').value;
    book.author = document.getElementById('bookFormAuthor').value;
    book.year = Number(document.getElementById('bookFormYear').value);
    book.isComplete = document.getElementById('bookFormIsComplete').checked;

    editingBookId = null;

    document.getElementById('bookForm').reset();
    document.getElementById('bookFormSubmit').innerText = 'Masukkan buku ke rak';

    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

document.addEventListener('DOMContentLoaded', function (){
    const submitForm = document.getElementById('bookForm');
    submitForm.addEventListener('submit', function (event) {
        event.preventDefault();
        if (editingBookId === null) {
            addBook();
        } else {
            updateBook();
        }
        
    });

    if(isStorageExist()) { 
        loadDataFromStorage();
    }
});

document.addEventListener(SAVED_EVENT, () => {
    console.log('Data berhasil disimpan.');
});

document.getElementById('searchBook').addEventListener('submit', function (event) {
    event.preventDefault();

    const keyword = document.getElementById('searchBookTitle').value;

    searchBook(keyword);
});

document.addEventListener(RENDER_EVENT, function (){
    const incompleteBookList = document.getElementById('incompleteBookList');
    const completeBookList = document.getElementById('completeBookList');

    incompleteBookList.innerHTML = '';
    completeBookList.innerHTML = '';

    for (const bookItem of books) {
        if (searchKeyword !== '' && !bookItem.title.toLowerCase().includes(searchKeyword.toLowerCase())) {
                continue;
            }

        const bookElement = makeBook(bookItem);
        if (bookItem.isComplete) {
            completeBookList.append(bookElement);
        } else {
            incompleteBookList.append(bookElement);
        }
    }
})
