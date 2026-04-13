export const status = [
    "Suggestion", 
    "Pending Hold", 
    "Hold Placed", 
    "Outstanding Purchase", 
    "Closed"
];

export const formats = [
    "Book",
    "eBook",
    "Audiobook (Physical CD)",
    "eAudiobook",
    "DVD",
    "Music CD"
];

export const ageGroups = [
    "Adult",
    "Teen",
    "Children"
];

export const columns = [
    { field: 'barcode', headerName: 'Barcode', width: 120 },
    { field: 'title', headerName: 'Title', width: 150 },
    { field: 'author', headerName: 'Author', width: 150 },
    { field: 'identifier', headerName: 'ISBN', width: 130 },
    { field: 'bibid', headerName: 'BIBID', width: 80 },
    { field: 'agegroup', headerName: 'Age Group', width: 110, valueFormatter: (ageID) => ageGroups[ageID] },
    { field: 'format', headerName: 'Format', width: 80, valueFormatter: (formatID) => formats[formatID]},
    { field: 'publication', headerName: 'Published', width: 100 },
    { field: 'created', headerName: 'Submitted', width: 110 },
    { field: 'notes', headerName: 'Notes', width: 110 },
    { field: 'editedBy', headerName: 'Edited By', width: 110 }
];