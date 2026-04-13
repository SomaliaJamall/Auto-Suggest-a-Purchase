import { DataGrid } from '@mui/x-data-grid';
import * as Constants from '../assets/Constants';
import IconButton from '@mui/material/IconButton';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { useState, useEffect } from 'react';


const tableButtons = [{
  field: "markPurchase",
  headerName: " ",
  sortable: false,
  width: 100,
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
                  <MenuItem onClick={handleClose}>Remove</MenuItem>
                  <MenuItem onClick={handleClose}>Move back to "Suggestion" table</MenuItem>
              </Menu>
          </>
      )
  }
}]
const columns = Constants.columns.concat(tableButtons);

export default function PurchasedTable({rows}) {
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

    setSuggestions(groupedArray[1])
  }


  useEffect(() => {
    console.log(suggestions);
  }, [suggestions]);
  return (
    <DataGrid rows={suggestions} columns={columns} />
  );
}