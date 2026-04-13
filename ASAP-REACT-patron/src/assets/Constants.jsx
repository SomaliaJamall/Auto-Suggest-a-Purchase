export const status = [
    "Suggestion", //0
    "Pending Hold", //1
    "Hold Placed", //2
    "Outstanding Purchase", //3 
    "Closed" //4
];

export const formats = [
    "Book", //0
    "eBook", //1
    "Audiobook (Physical CD)", //2
    "eAudiobook", //3
    "DVD", //4
    "Music CD" //5
];

export const creator = [
    "Author", //Book
    "", //ebook
    "Author", //Audiobook (Physical CD)
    "", //eaudiobook
    "Director/Actors/Producer", //DVD
    "Artist" //Music CD
];

export const ageGroups = [
    "Adult",
    "Teen",
    "Children"
];

export const columns = [
    { field: 'barcode', headerName: 'Barcode', width: 130 },
    { field: 'title', headerName: 'Title', width: 100 },
    { field: 'author', headerName: 'Author', width: 150 },
    { field: 'identifier', headerName: 'ISBN', width: 150 },
    { field: 'agegroup', headerName: 'Age Group', width: 110, valueFormatter: (ageID) => ageGroups[ageID] },
    { field: 'format', headerName: 'Format', width: 100, valueFormatter: (formatID) => formats[formatID]},
    { field: 'publication', headerName: 'Published', width: 100 },
    { field: 'created', headerName: 'Submitted', width: 110 },
    { field: 'notes', headerName: 'Notes', width: 110 },
    { field: 'editedBy', headerName: 'Edited By', width: 110 }
];