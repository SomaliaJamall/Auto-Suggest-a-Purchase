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
    renderCell: (params) => {
        //   const onClick = (e) => {
        //     e.stopPropagation(); // don't select this row after clicking

        //     var thisRow = params.row;
        //     thisRow["status"] = 2
        //     fetch("/PHP/asap/UpdateTitleRequest.php", {
        //       method: "POST",
        //       body: JSON.stringify(thisRow),
        //       headers: {
        //         "Content-type": "application/json; charset=UTF-8"
        //       }
        //     });

        //     return;
        //   };

        //   return (
        //     <>
        //       <Button variant="text" onClick={onClick}>Purchase</Button>
        //     </>
        //   )
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
                    <MenuItem onClick={handleClose}>Already Own</MenuItem>
                    <MenuItem onClick={handleClose}>No Action</MenuItem>
                </Menu>
            </>
        )
    }
}]
const columns = Constants.columns.concat(tableButtons);

export default function ReviewTable({ rows }) {

    return (
        <DataGrid rows={rows} columns={columns} />
    );
}