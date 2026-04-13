import { DataGrid } from '@mui/x-data-grid';
import { useState, useEffect } from 'react';
import * as Constants from '../assets/Constants';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import ClearIcon from '@mui/icons-material/Clear';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Menu from '@mui/material/Menu';
import { ToastContainer, toast } from 'react-toastify';
import APIurl from '../App'
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';
import { useConfirm } from "material-ui-confirm";
import { Typography } from '@mui/material';
import Grid from '@mui/material/Grid';


function removeEscapeCharacters(obj) {
    if (typeof obj === 'string') {
        // If the value is a string, remove backslashes (double backslashes are often used for escaping)
        return obj.replace(/\\/g, '');
    } else if (Array.isArray(obj)) {
        // If the value is an array, iterate over its elements and apply the function recursively
        return obj.map(item => removeEscapeCharacters(item));
    } else if (typeof obj === 'object' && obj !== null) {
        // If the value is an object, iterate over its properties and apply the function recursively
        const newObj = {};
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                newObj[key] = removeEscapeCharacters(obj[key]);
            }
        }
        return newObj;
    } else {
        // For other types (numbers, booleans, null), return the value as is
        return obj;
    }
}

const filterStyle = {
}


export default function Table({ status, username }) {

    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectionNewStatus, setSelectionNewStatus] = useState(null);
    const [selectionTitle, setSelectionTitle] = useState("");
    const [selectionAuthor, setSelectionAuthor] = useState("");
    const [selectionID, setSelectionID] = useState("");
    const [selectionFormat, setSelectionFormat] = useState("");
    const [selectionAge, setSelectionAge] = useState("");
    const [selectedRow, setSelectedRow] = useState(null);
    const [selectionNotes, setSelectionNotes] = useState("");
    const [selectionPubDate, setSelectionPubDate] = useState(null)
    const [selectionBibID, setSelectionBibID] = useState(null)
    const [dialogName, setDialogName] = useState("Mark for Purchase");
    const [activeAgeFilter, setActiveAgeFilter] = useState(-1);
    const [activeFormatFilter, setActiveFormatFilter] = useState(-1);
    const confirmAlreadyOwn = useConfirm();
    const confirm = useConfirm();

    useEffect(() => {
        fetchSuggestions();
    }, []); // The empty array ensures the effect runs only once after the initial render

    function fetchSuggestions() {
        fetch('/PHP/asap/TitleRequests.php?status=' + status)
            .then(response => response.json())
            .then(function (data) {
                // data.created = data.created.date;
                setSuggestions(removeEscapeCharacters(data));
                setLoading(false);
            })
    }

    useEffect(() => {
        console.log(suggestions);
    }, [suggestions]);

    const suggestionsTableButtons = [{
        field: "markPurchase",
        headerName: " ",
        sortable: false,
        width: 100,
        renderCell: (params) => {
            const onClick = async (e) => {
                e.stopPropagation(); // don't select this row after clicking
                var thisRow = params.row;
                setSelectedRow(thisRow)
                setDialogName("Mark for Purchase")
                setSelectionNewStatus(1) //set item to pending purchase
                setOpenDialog(true);
                setSelectionTitle(thisRow["title"])
                setSelectionAuthor(thisRow["author"])
                setSelectionID(thisRow["identifier"])
                setSelectionFormat(thisRow["format"])
                setSelectionAge(thisRow["agegroup"])
                setSelectionNotes(thisRow["notes"])
                setSelectionPubDate(dayjs(thisRow["publication"]))
                setSelectionBibID(thisRow["bibid"])
                return;
            };

            return (
                <>
                    <Button variant="text" onClick={onClick}>Purchase</Button>
                </>
            )
        }
    }, {
        field: "otherActions",
        headerName: " ",
        sortable: false,
        width: 50,
        renderCell: (params) => {
            const onClick = (e) => {
                e.stopPropagation(); // don't select this row after clicking
                return;
            };
            const [anchorEl, setAnchorEl] = useState(null);
            const open = Boolean(anchorEl);
            const handleClick = (event) => {
                event.stopPropagation(); // don't select this row after clicking
                setAnchorEl(event.currentTarget);
            };
            const handleClose = () => {
                setAnchorEl(null);
            };

            const handleAlreadyOwn = async (event) => {
                event.stopPropagation(); // don't select this row after clicking
                setAnchorEl(null);
                const { confirmed, reason } = await confirmAlreadyOwn({
                    title: "Are you sure you want to mark this suggestion already owned?",
                    description: "The patron will be notified as soon as you mark it that a hold will be placed",
                });
                if (confirmed) {
                    const today = new Date();
                    const formattedDate = today.toLocaleDateString()
                    var thisRow = params.row;
                    thisRow["status"] = 1;
                    thisRow["action"] = "alreadyOwn";
                    thisRow["notes"] = formattedDate + " ALREADY OWN (system note)" + thisRow["notes"];
                    const response = await fetch("/PHP/asap/UpdateTitleRequest.php", {
                        method: "POST",
                        body: JSON.stringify(thisRow),
                        headers: {
                            "Content-type": "application/json; charset=UTF-8"
                        }
                    });
                    console.log(thisRow)
                    console.log(response.status)
                    if (response.status === 200) {
                        toast.success("This suggestion for '" + thisRow["title"] + "' by " + thisRow["author"] + " has been marked as already owned! The patron who made the suggestion will recieve a hold on the material and an email letting them know.");
                    } else {
                        toast.error("An error occured. The patron could not be emailed");
                    }
                    fetchSuggestions();
                }
            };


            const handleReject = async (event) => {
                event.stopPropagation(); // don't select this row after clicking
                setAnchorEl(null);
                const { confirmed, reason } = await confirm({
                    title: "Are you sure you want to reject this suggestion?",
                    description: "The patron will be notified as soon as you reject the suggestion",
                });
                if (confirmed) {
                    const today = new Date();
                    const formattedDate = today.toLocaleDateString()
                    var thisRow = params.row;
                    thisRow["status"] = 4
                    thisRow["notes"] = formattedDate + " REJECTED (system note)" + thisRow["notes"];
                    thisRow["action"] = "reject";
                    const response = await fetch("/PHP/asap/UpdateTitleRequest.php", {
                        method: "POST",
                        body: JSON.stringify(thisRow),
                        headers: {
                            "Content-type": "application/json; charset=UTF-8"
                        }
                    });
                    console.log(thisRow)
                    console.log(response.status)
                    if (response.status === 200) {
                        toast.success("This suggestion for '" + thisRow["title"] + "' by " + thisRow["author"] + " has been rejected. The patron who made the suggestion will recieve a notice that we will not be purchasing the material.");
                    } else {
                        toast.error("An error occured. The patron could not be emailed");
                    }
                    fetchSuggestions();
                }

            };

            const handleEdit = async (e) => {
                e.stopPropagation(); // don't select this row after clicking
                setAnchorEl(null);
                var thisRow = params.row;
                setSelectedRow(thisRow)
                setDialogName("Edit Suggestion")
                setSelectionNewStatus(0) //Keep item as suggestion on edit
                setOpenDialog(true);
                setSelectionTitle(thisRow["title"])
                setSelectionAuthor(thisRow["author"])
                setSelectionID(thisRow["identifier"])
                setSelectionFormat(thisRow["format"])
                setSelectionAge(thisRow["agegroup"])
                setSelectionNotes(thisRow["notes"])
                setSelectionPubDate(dayjs(thisRow["publication"]))
                setSelectionBibID(thisRow["bibid"]);
                return;
            };

            return (

                <>
                    <IconButton aria-label="moreOptions"
                        aria-controls={open ? 'basic-menu' : undefined}
                        aria-haspopup="true"
                        aria-expanded={open ? 'true' : undefined}
                        onClick={handleClick}>
                        <MoreVertIcon />
                    </IconButton>
                    <Menu
                        id="basic-menu"
                        anchorEl={anchorEl}
                        open={open}
                        onClose={handleClose}
                        MenuListProps={{
                            'aria-labelledby': 'basic-button',
                        }}
                    >
                        {/* <MenuItem onClick={handleClose}>ILL</MenuItem> */}
                        <MenuItem onClick={handleAlreadyOwn}>Already Own</MenuItem> {/*TODO:  */}
                        <MenuItem onClick={handleEdit}>Edit</MenuItem>
                        <MenuItem onClick={handleReject}>Reject Suggestion</MenuItem> {/*TODO  */}
                        {/* <MenuItem onClick={handleClose}>Close with no action</MenuItem> */}
                    </Menu>
                </>
            )
        }
    }]

    const pendingHoldTableButtons = [{
        field: "markPurchase",
        headerName: " ",
        sortable: false,
        width: 110,
        renderCell: (params) => {
            const handleUndo = async (event) => {
                event.stopPropagation(); // don't select this row after clicking
                var thisRow = params.row;
                thisRow["status"] = 0;
                thisRow["editedBy"] = username;
                const response = await fetch("/PHP/asap/UpdateTitleRequest.php", {
                    method: "POST",
                    body: JSON.stringify(thisRow),
                    headers: {
                        "Content-type": "application/json; charset=UTF-8"
                    }
                });
                console.log(thisRow)
                console.log(response.status)
                if (response.status === 200) {
                    toast.success("This suggestion for '" + thisRow["title"] + "' by " + thisRow["author"] + " has been moved back to the suggestion table for further review.");
                    fetchSuggestions();
                }
            };

            const handleEdit = async (e) => {
                e.stopPropagation(); // don't select this row after clicking
                //setAnchorEl(null);
                var thisRow = params.row;
                setSelectedRow(thisRow)
                setDialogName("Edit Suggestion")
                setSelectionNewStatus(1) //Keep item as pending on edit
                setOpenDialog(true);
                setSelectionTitle(thisRow["title"])
                setSelectionAuthor(thisRow["author"])
                setSelectionID(thisRow["identifier"])
                setSelectionFormat(thisRow["format"])
                setSelectionAge(thisRow["agegroup"])
                setSelectionNotes(thisRow["notes"])
                setSelectionPubDate(dayjs(thisRow["publication"]))
                setSelectionBibID(thisRow["bibid"]);
                return;
            };
            return (
                <>
                    {!((params.row["format"] == 4
                        || params.row["format"] == 5)
                        && (params.row["bibid"] == null
                            || params.row["bibid"] == ""))
                        && <Button variant="text" sx={{ color: "#808080 " }} onClick={handleUndo}>Undo</Button>}
                    {((params.row["format"] == 4
                        || params.row["format"] == 5)
                        && (params.row["bibid"] == null
                            || params.row["bibid"] == ""))
                        && <Button variant="text" onClick={handleEdit}>Add BIBID</Button>}
                </>
            )
        }
    }, {
        field: "otherActions",
        headerName: " ",
        sortable: false,
        width: 50,
        renderCell: (params) => {
            const onClick = (e) => {
                e.stopPropagation(); // don't select this row after clicking
                return;
            };
            const [anchorEl, setAnchorEl] = useState(null);
            const open = Boolean(anchorEl);
            const handleClick = (event) => {
                event.stopPropagation(); // don't select this row after clicking
                setAnchorEl(event.currentTarget);
            };
            const handleClose = () => {
                setAnchorEl(null);
            };

            const handleUndo = async (event) => {
                event.stopPropagation(); // don't select this row after clicking
                var thisRow = params.row;
                thisRow["status"] = 0;
                thisRow["editedBy"] = username;
                const response = await fetch("/PHP/asap/UpdateTitleRequest.php", {
                    method: "POST",
                    body: JSON.stringify(thisRow),
                    headers: {
                        "Content-type": "application/json; charset=UTF-8"
                    }
                });
                console.log(thisRow)
                console.log(response.status)
                if (response.status === 200) {
                    toast.success("This suggestion for '" + thisRow["title"] + "' by " + thisRow["author"] + " has been moved back to the suggestion table for further review.");
                } else {
                    toast.error("An error occured.");
                }
                fetchSuggestions();
            };

            const handleEdit = async (e) => {
                e.stopPropagation(); // don't select this row after clicking
                setAnchorEl(null);
                var thisRow = params.row;
                setSelectedRow(thisRow)
                setDialogName("Edit Suggestion")
                setSelectionNewStatus(1) //Keep item as pending on edit
                setOpenDialog(true);
                setSelectionTitle(thisRow["title"])
                setSelectionAuthor(thisRow["author"])
                setSelectionID(thisRow["identifier"])
                setSelectionFormat(thisRow["format"])
                setSelectionAge(thisRow["agegroup"])
                setSelectionNotes(thisRow["notes"])
                setSelectionPubDate(dayjs(thisRow["publication"]))
                setSelectionBibID(thisRow["bibid"]);
                return;
            };

            const handleReject = async (event) => {
                event.stopPropagation(); // don't select this row after clicking
                setAnchorEl(null);
                var thisRow = params.row;
                thisRow["status"] = 4
                const response = await fetch("/PHP/asap/UpdateTitleRequest.php", {
                    method: "POST",
                    body: JSON.stringify(thisRow),
                    headers: {
                        "Content-type": "application/json; charset=UTF-8"
                    }
                });
                console.log(thisRow)
                console.log(response.status)
                if (response.status === 200) {
                    toast.success("This suggestion for '" + thisRow["title"] + "' by " + thisRow["author"] + " has been rejected. The patron who made the suggestion will recieve a notice that we will not be purchasing the material.");
                    fetchSuggestions();
                }
            };


            return (
                <>
                    <IconButton aria-label="moreOptions"
                        aria-controls={open ? 'basic-menu' : undefined}
                        aria-haspopup="true"
                        aria-expanded={open ? 'true' : undefined}
                        onClick={handleClick}>
                        <MoreVertIcon />
                    </IconButton>
                    <Menu
                        id="basic-menu"
                        anchorEl={anchorEl}
                        open={open}
                        onClose={handleClose}
                        MenuListProps={{
                            'aria-labelledby': 'basic-button',
                        }}
                    >
                        {/* <MenuItem onClick={handleClose}>ILL</MenuItem> */}
                        <MenuItem onClick={handleEdit}>Edit</MenuItem>
                        {/* <MenuItem onClick={handleReject}>Reject Suggestion</MenuItem> TODO  */}
                        <MenuItem onClick={handleUndo}>Undo</MenuItem>
                        {/* <MenuItem onClick={handleClose}>Close with no action</MenuItem> */}
                    </Menu>
                </>
            )
        }
    }]

    const otherTableButtons = [{
        field: "markPurchase",
        headerName: " ",
        sortable: false,
        width: 100,
        renderCell: (params) => {
            const [anchorEl, setAnchorEl] = useState(null);
            const open = Boolean(anchorEl);
            const handleUndo = async (event) => {
                event.stopPropagation(); // don't select this row after clicking
                var thisRow = params.row;
                thisRow["status"] = 1
                const response = await fetch("/PHP/asap/UpdateTitleRequest.php", {
                    method: "POST",
                    body: JSON.stringify(thisRow),
                    headers: {
                        "Content-type": "application/json; charset=UTF-8"
                    }
                });
                console.log(thisRow)
                console.log(response.status)
                if (response.status === 200) {
                    toast.success("This suggestion for '" + thisRow["title"] + "' by " + thisRow["author"] + " has been moved back to the suggestion table for further review.");
                } else {
                    toast.error("An error occured.");
                }
                fetchSuggestions();
            };

            const handleClick = (event) => {
                event.stopPropagation(); // don't select this row after clicking
                setAnchorEl(event.currentTarget);
            };

            const handleClose = () => {
                setAnchorEl(null);
            };
            const handleEdit = async (e) => {
                e.stopPropagation(); // don't select this row after clicking
                setAnchorEl(null);
                var thisRow = params.row;
                setSelectedRow(thisRow)
                setDialogName("Edit Suggestion")
                setSelectionNewStatus(status) //Keep item status
                setOpenDialog(true);
                setSelectionTitle(thisRow["title"])
                setSelectionAuthor(thisRow["author"])
                setSelectionID(thisRow["identifier"])
                setSelectionFormat(thisRow["format"])
                setSelectionAge(thisRow["agegroup"])
                setSelectionNotes(thisRow["notes"])
                setSelectionPubDate(dayjs(thisRow["publication"]))
                setSelectionBibID(thisRow["bibid"]);
                return;
            };

            return (
                <>
                    <IconButton aria-label="moreOptions"
                        aria-controls={open ? 'basic-menu' : undefined}
                        aria-haspopup="true"
                        aria-expanded={open ? 'true' : undefined}
                        onClick={handleClick}>
                        <MoreVertIcon />
                    </IconButton>
                    <Menu
                        id="basic-menu"
                        anchorEl={anchorEl}
                        open={open}
                        onClose={handleClose}
                        MenuListProps={{
                            'aria-labelledby': 'basic-button',
                        }}
                    >
                        {/* <MenuItem onClick={handleClose}>ILL</MenuItem> */}
                        <MenuItem onClick={handleEdit}>Edit</MenuItem>
                        {/* <MenuItem onClick={handleReject}>Reject Suggestion</MenuItem> TODO  */}
                        {/* <MenuItem onClick={handleUndo}>Undo</MenuItem> */}
                        {/* <MenuItem onClick={handleClose}>Close with no action</MenuItem> */}
                    </Menu>
                </>
            )
        }
    }, {
        field: "otherActions",
        headerName: " ",
        sortable: false,
        width: 50,
        renderCell: (params) => {
            const onClick = (e) => {
                e.stopPropagation(); // don't select this row after clicking
                return;
            };
            const [anchorEl, setAnchorEl] = useState(null);
            const open = Boolean(anchorEl);
            const handleClick = (event) => {
                event.stopPropagation(); // don't select this row after clicking
                setAnchorEl(event.currentTarget);
            };
            const handleClose = () => {
                setAnchorEl(null);
            };
            const handleAlreadyOwn = async (event) => {
                event.stopPropagation(); // don't select this row after clicking
                setAnchorEl(null);
                var thisRow = params.row;
                thisRow["status"] = 5
                const response = await fetch("/PHP/asap/UpdateTitleRequest.php", {
                    method: "POST",
                    body: JSON.stringify(thisRow),
                    headers: {
                        "Content-type": "application/json; charset=UTF-8"
                    }
                });
                console.log(thisRow)
                console.log(response.status)
                if (response.status === 200) {
                    toast.success("This suggestion has been marked as already owned! The patron who made the suggestion will recieve a hold on the material.");
                } else {
                    toast.error("An error occured. The patron could not be emailed");
                }
                fetchSuggestions();
            };

            return (
                <>
                    {/* <IconButton aria-label="moreOptions"
                        aria-controls={open ? 'basic-menu' : undefined}
                        aria-haspopup="true"
                        aria-expanded={open ? 'true' : undefined}
                        onClick={handleClick}>
                        <MoreVertIcon />
                    </IconButton>
                    <Menu
                        id="basic-menu"
                        anchorEl={anchorEl}
                        open={open}
                        onClose={handleClose}
                        MenuListProps={{
                            'aria-labelledby': 'basic-button',
                        }}
                    >
                        <MenuItem onClick={handleClose}>ILL</MenuItem>
                        <MenuItem onClick={handleAlreadyOwn}>Already Own</MenuItem>
                        <MenuItem onClick={handleClose}>Close with no action</MenuItem>
                    </Menu> */}
                </>
            )
        }
    }]

    const [columns, setColumns] = useState(Constants.columns);

    useEffect(()=>{
        var tempColumns = Constants.columns;
        if (status == 0) {
            tempColumns = tempColumns.concat(suggestionsTableButtons);
            // TODO: Display unique context menu based on tab
        } else if (status == 1) {
            tempColumns = tempColumns.concat(pendingHoldTableButtons);
        } else {
            tempColumns = tempColumns.concat(otherTableButtons);
        }
        setColumns(tempColumns);
    },[status]);

    const [openContextMenu, setOpenContextMenu] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);

    const handleDialogOpen = () => {
        setOpenDialog(true);
    };

    const handleClose = () => {
        setOpenContextMenu(false);
        setOpenDialog(false);
    };

    const handleFormatChange = (event) => {
        setSelectionFormat(event.target.value);
    };

    const handleAgeChange = (event) => {
        setSelectionAge(event.target.value);
    };

    const handleAuthorChange = (event) => {
        setSelectionAuthor(event.target.value);
    };

    const handleTitleChange = (event) => {
        setSelectionTitle(event.target.value);
    };

    const handleIDChange = (event) => {
        setSelectionID(event.target.value);
    };

    const handleNotesChange = (event) => {
        setSelectionNotes(event.target.value)
    }

    const handlePubDateChange = (newValue) => {
        setSelectionPubDate(newValue)
    }

    const handleBibIDChange = (event) => {
        setSelectionBibID(event.target.value)
    }


    const updateSuggestion = async function (event) {
        const today = new Date();
        const formattedDate = today.toLocaleDateString()
        var thisRow = JSON.parse(JSON.stringify(selectedRow));
        thisRow["status"] = selectionNewStatus;
        thisRow["identifier"] = selectionID;
        thisRow["author"] = selectionAuthor;
        thisRow["title"] = selectionTitle;
        thisRow["format"] = selectionFormat;
        thisRow["agegroup"] = selectionAge;
        thisRow["editedBy"] = username;
        thisRow["notes"] = selectionNotes;
        thisRow["publication"] = selectionPubDate.format('YYYY-MM-DD');
        thisRow["bibid"] = selectionBibID;
        const response = await fetch("/PHP/asap/UpdateTitleRequest.php", {
            method: "POST",
            body: JSON.stringify(thisRow),
            headers: {
                "Content-type": "application/json; charset=UTF-8"
            }
        });
        console.log(thisRow)
        console.log(response.status)
        if (response.status === 200) {
            toast.success("This suggestion for '" + selectionTitle + "' by " + selectionAuthor + " has been updated");
            fetchSuggestions();
            console.log("ok");
            console.log(thisRow)
            handleClose();
        }
    }

    const [filterModel, setFilterModel] = useState({
        items: [
            // {
            //     field: 'identifier',
            //     operator: '=',
            //     value: '2.5',
            // },
        ],
    });

    const handleFilterClear = () => {
        var tempFilterModal = {
            items: [
            ],
        };
        setFilterModel(tempFilterModal);
        setActiveAgeFilter(-1)
        setActiveFormatFilter(-1)
    };

    const handleFilterClick = (filter, value) => {
        setActiveAgeFilter(-1)
        setActiveFormatFilter(-1)
        var tempFilterModal = {
            items: [
                { field: filter, operator: 'equals', value: String(value)}
            ],
        };
        setFilterModel(tempFilterModal);

        if (filter == "agegroup")
            setActiveAgeFilter(value)
        if (filter == "format")
            setActiveFormatFilter(value)
    };

    const isFilterActive = (filter) => {
        var tempFilterModal = filterModel;
        for (var i = 0; i < tempFilterModal.items.length; i++) {
            if (tempFilterModal.items[i].field == filter) {
                return true
            }
        }
        return false
    }

    return (
        <>
            <div style={{ margin: "8px 0" }}>
                <Grid container spacing={2}>
                    <Grid size="auto" sx={filterStyle}>
                        <Typography variant='overline' sx={{ marginRight: "4px" }}>
                            Age Range:
                        </Typography>
                        <Button sx={{ backgroundColor: !(parseInt(activeAgeFilter) == 0) ? "none" : "rgba(25, 118, 210, 0.2)" }} onClick={() => (handleFilterClick("agegroup", 0))}>Adult</Button>
                        <Button sx={{ backgroundColor: !(parseInt(activeAgeFilter) == 1) ? "none" : "rgba(25, 118, 210, 0.2)" }} onClick={() => (handleFilterClick("agegroup", 1))}>Teen</Button>
                        <Button sx={{ backgroundColor: !(parseInt(activeAgeFilter) == 2) ? "none" : "rgba(25, 118, 210, 0.2)" }} onClick={() => (handleFilterClick("agegroup", 2))}>Children</Button>
                        {
                            (isFilterActive("agegroup")) &&
                            <IconButton
                                onClick={() => (handleFilterClear())}
                                title='Clear Age Range Filter'
                            >
                                <ClearIcon />
                            </IconButton>
                        }
                    </Grid>
                    <Grid size="auto" sx={filterStyle}>
                        <Typography variant='overline' sx={{ marginRight: "4px" }}>
                            Material Format:
                        </Typography>
                        <Button sx={{ backgroundColor: !(parseInt(activeFormatFilter) == 0) ? "none" : "rgba(25, 118, 210, 0.2)" }} onClick={() => (handleFilterClick("format", 0))}>Book</Button>
                        <Button sx={{ backgroundColor: !(parseInt(activeFormatFilter) == 2) ? "none" : "rgba(25, 118, 210, 0.2)" }} onClick={() => (handleFilterClick("format", 2))}>Audiobook (CD)</Button>
                        <Button sx={{ backgroundColor: !(parseInt(activeFormatFilter) == 4) ? "none" : "rgba(25, 118, 210, 0.2)" }} onClick={() => (handleFilterClick("format", 4))}>DVD</Button>
                        <Button sx={{ backgroundColor: !(parseInt(activeFormatFilter) == 5) ? "none" : "rgba(25, 118, 210, 0.2)" }} onClick={() => (handleFilterClick("format", 5))}>Music CD</Button>
                        {
                            (isFilterActive("format")) &&
                            <IconButton
                                onClick={() => (handleFilterClear())}
                                title='Clear Format Range Filter'
                            >
                                <ClearIcon />
                            </IconButton>
                        }
                    </Grid>
                </Grid>
            </div>
            <div style={{ height: "60vh", }}>
                <DataGrid
                    width="100%"
                    rows={suggestions}
                    columns={columns}
                    sx={{
                        '& .MuiDataGrid-cell': { fontSize: '0.8rem' }
                    }}
                    loading={loading}
                    slotProps={{
                        loadingOverlay: {
                            variant: 'linear-progress',
                            noRowsVariant: 'skeleton',
                        },
                    }}
                    initialState={{
                        sorting: {
                            sortModel: [{ field: 'created', sort: 'desc' }],
                        },
                    }}
                    onFilterModelChange={(newFilterModel) => setFilterModel(newFilterModel)}
                    filterModel={filterModel}
                    getRowClassName={(params) =>
                        params.indexRelativeToCurrentPage % 2 === 0 ? 'Mui-even' : 'Mui-odd'
                    }
                />
            </div>
            <Dialog open={openDialog} onClose={handleClose} aria-labelledby="form-dialog-title">
                <DialogTitle id="form-dialog-title">{dialogName}</DialogTitle>
                <DialogContent>
                    <DialogContentText style={{ marginBottom: "10px" }}>
                        Confirm the information from the patron submitted suggestion.
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="Title"
                        label="Title"
                        type="text"
                        value={selectionTitle}
                        onChange={handleTitleChange}
                        fullWidth
                    />
                    <TextField
                        margin="dense"
                        id="author"
                        label="Author"
                        type="text"
                        value={selectionAuthor}
                        onChange={handleAuthorChange}
                        fullWidth
                    />
                    <TextField
                        margin="dense"
                        id="ISBN"
                        label="ISBN/Other ID"
                        type="text"
                        value={selectionID}
                        onChange={handleIDChange}
                        fullWidth
                    />
                    <TextField
                        margin="dense"
                        id="bibID"
                        label="BIB ID"
                        type="text"
                        value={selectionBibID}
                        onChange={handleBibIDChange}
                        fullWidth
                    />
                    <div style={{ marginTop: "10px" }}>
                        <FormControl fullWidth>
                            <InputLabel id="demo-simple-select-label">Format</InputLabel>
                            <Select
                                id="format"
                                value={selectionFormat}
                                label="Format"
                                onChange={handleFormatChange}
                            >
                                <MenuItem value="0">{Constants.formats[0]}</MenuItem>
                                <MenuItem value="1">{Constants.formats[1]}</MenuItem>
                                <MenuItem value="2">{Constants.formats[2]}</MenuItem>
                                <MenuItem value="3">{Constants.formats[3]}</MenuItem>
                                <MenuItem value="4">{Constants.formats[4]}</MenuItem>
                                <MenuItem value="5">{Constants.formats[5]}</MenuItem>
                            </Select>
                        </FormControl>
                    </div>
                    <div style={{ marginTop: "10px" }}>
                        <FormControl fullWidth>
                            <InputLabel id="demo-simple-select-label">Age</InputLabel>
                            <Select
                                id="format"
                                value={selectionAge}
                                label="Format"
                                onChange={handleAgeChange}
                            >
                                <MenuItem value="0">Adult</MenuItem>
                                <MenuItem value="1">Teen</MenuItem>
                                <MenuItem value="2">Children</MenuItem>
                            </Select>
                        </FormControl>
                    </div>
                    <div style={{ marginTop: "10px" }}>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker
                                margin="dense"
                                id="publication"
                                label="Publication"
                                value={selectionPubDate}
                                onChange={handlePubDateChange}
                                slotProps={{ textField: { fullWidth: true } }}
                            />
                        </LocalizationProvider>
                    </div>
                    <TextField
                        margin="dense"
                        id="notes"
                        label="Notes"
                        type="text"
                        value={selectionNotes}
                        onChange={handleNotesChange}
                        fullWidth
                        multiline
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={updateSuggestion} color="primary">
                        Ok
                    </Button>
                </DialogActions>
            </Dialog>
        </>

    );
}