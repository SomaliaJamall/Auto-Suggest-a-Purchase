import { DataGrid } from '@mui/x-data-grid';
import * as Constants from '../assets/Constants';
import IconButton from '@mui/material/IconButton';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { useState, useEffect } from 'react';
import { Typography } from '@mui/material';


const tableButtons = [{
    field: "Result",
    headerName: "Result",
    sortable: false,
    width: 150,
    renderCell: (params) => {
          return (
            <>
              Result Here
            </>
          )
    }
}]
const columns = Constants.columns.concat(tableButtons);

export default function ClosedTable({ rows }) {
    const [suggestions, setSuggestions] = useState([]);

    useEffect(() => {
        fetchSuggestions();
    }, []); // The empty array ensures the effect runs only once after the initial render

    function fetchSuggestions() {
        fetch('/PHP/asap/TitleRequests.php')
            .then(response => response.json())
            .then(data => groupData(data));
    }
    function groupData(data) {
        var groupedArray = [[], [], [], [], []]
        for (var row of data) {
            groupedArray[(row.status)].push(row);
        }

        setSuggestions(groupedArray[4])
    }


    useEffect(() => {
        console.log(suggestions);
    }, [suggestions]);
    return (
        <DataGrid rows={suggestions} columns={columns} />
    );
}