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
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { ToastContainer, toast } from 'react-toastify';
import APIurl from '../App'


const myrows = [
  { id: 1, title: 'Frankenstien', author: 'Mary Shelly', isbn: '000000000', format: 'Book', publication: '1923', status: 'Suggested' },
];



export default function SuggestionsTable() {

  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    fetchSuggestions();
  }, []); // The empty array ensures the effect runs only once after the initial render
  
  function fetchSuggestions(){
    fetch('/PHP/asap/TitleRequests.php')
      .then(response => response.json())
      .then(data => groupData(data));
  }
  function groupData(data) {
    var groupedArray = [[], [], [], [], []]
    for (var row of data) {
      groupedArray[(row.status - 1)].push(row);
    }

    setSuggestions(groupedArray[0])
  }


  useEffect(() => {
    console.log(suggestions);
  }, [suggestions]);

  const tableButtons = [{
    field: "markPurchase",
    headerName: " ",
    sortable: false,
    width: 100,
    renderCell: (params) => {
      const onClick = async (e) => {
        e.stopPropagation(); // don't select this row after clicking

        var thisRow = params.row;
        thisRow["status"] = 2
        const response = await fetch("/PHP/asap/UpdateTitleRequest.php", {
          method: "POST",
          body: JSON.stringify(thisRow),
          headers: {
            "Content-type": "application/json; charset=UTF-8"
          }
        });
        console.log(response.status)
        if (response.status === 200) {
          toast.success("This suggestion has been marked for purchase! The patron who made the suggestion will automatically recieve a hold on the material.");
          fetchSuggestions();
          console.log("ok");
        }
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
        setAnchorEl(event.currentTarget);
      };
      const handleClose = () => {
        setAnchorEl(null);
      };
      const handleAlreadyOwn = async () => {
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
        console.log(response.status)
        if (response.status === 200) {
          toast.success("This suggestion has been marked as already owned! The patron who made the suggestion will recieve a hold on the material.");
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
            <MenuItem onClick={handleClose}>ILL</MenuItem>
            <MenuItem onClick={handleAlreadyOwn}>Already Own</MenuItem>
            <MenuItem onClick={handleClose}>No Action</MenuItem>
          </Menu>
        </>
      )
    }
  }]

  const columns = Constants.columns.concat(tableButtons);

  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <DataGrid rows={suggestions} columns={columns} />
    </>

  );
}