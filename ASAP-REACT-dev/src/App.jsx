import { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import myLogo from './assets/jpl.png'
import './App.css'
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import './components/suggestionsTable'
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import Table from './components/table';
import SuggestionsTable from './components/suggestionsTable';
import ReviewTable from './components/ReviewTable';
import PurchaseTable from './components/PurchasedTable';
import HoldTable from './components/HoldsTable';
import ClosedTable from './components/ClosedTable';
import Login from './components/Login';
import Grid from '@mui/material/Grid';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import { grey } from '@mui/material/colors';
import useToken from './useToken';
import { ConfirmProvider } from "material-ui-confirm";
//import {BrowserRouter, Route, Switch} from 'react-router-dom';

//Check what is going on with edge
//Ask collection development if they see a need for notes

const APIurl = "/PHP/asap/TitleRequests.php"
//const APIurl = "/staticData.json"


const tableDescriptionStyle = { marginBottom: "20px", color: grey[700], fontSize: "90%" }
function App() {
  const [activeTab, setActiveTabValue] = useState(() => {
    const saved = sessionStorage.getItem("activeTab");
    return saved ? JSON.parse(saved) : '1';
  });
  const { token, setToken } = useToken();


  useEffect(() => {
    sessionStorage.setItem("activeTab", JSON.stringify(activeTab));
  }, [activeTab]);
  const handleChange = (event, newValue) => {
    setActiveTabValue(newValue);
  };

  const myrows = { id: 1, title: '', author: '', isbn: '', format: '', publication: '', status: 1 };
  const [allSuggestions, setAllSuggestions] = useState([myrows, myrows, myrows, myrows, myrows]);


  useEffect(() => {
    if (token) {
      fetch('/PHP/asap/TitleRequests.php')
        //fetch('/staticData.json')
        .then(response => response.json())
        .then(data => groupData(data));
    }
  }, []); // The empty array ensures the effect runs only once after the initial render

  function groupData(data) {
    var groupedArray = [[], [], [], [], []]
    for (var row of data) {
      groupedArray[(row.status)].push(row);
    }

    setAllSuggestions(groupedArray)
  }

  const logout = e => {
    localStorage.removeItem('token');
    setToken()
  }

  if (!token || token == "undefined") {
    return <Login setToken={setToken} />
  }
  return (
    <>
      <ConfirmProvider>
        <CssBaseline />
        <Container maxWidth="xl">
          <Box variant="plain" >
            <Grid container spacing={2} sx={{ alignItems: 'center', justifyContent: 'center' }}>
              <Grid size={1}>
                <img src="/logo.png" style={{ width: "100%" }} />
              </Grid>
              <Grid size={10} sx={{ justifyContent: 'center' }}>
                <Typography variant="h4" sx={{ marginBottom: "20px" }}>
                  Auto Suggest a Purchase
                </Typography>
              </Grid>
              <Grid size={1} sx={{ "textAlign": "right", "textTransform": "capitalize" }}>
                {JSON.parse(token).username}<br />
                <a href="#" onClick={logout}>Logout</a>
              </Grid>
            </Grid>
          </Box>
          <TabContext value={activeTab}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <TabList onChange={handleChange} aria-label="Tabs">
                <Tab label="Suggestions" value="1" />
                <Tab label="Pending Hold" value="2" />
                <Tab label="Hold placed" value="3" />
                <Tab label="Outstanding Purchase" value="4" />
                <Tab label="Closed" value="5" />
              </TabList>
            </Box>
            <TabPanel value="1">
              <div style={tableDescriptionStyle}>
                Unprocessed suggestions submitted by library patrons with an active barcode and pin.
              </div>
              <Table status={0} username={JSON.parse(token).username}></Table>
            </TabPanel>
            <TabPanel value="2">
              <div style={tableDescriptionStyle}>
                Suggestions marked for purchase or already owned, now pending a hold. A secure process will run nightly to check for holds that can be placed.
              </div>
              <Table status={1} username={JSON.parse(token).username}></Table>
            </TabPanel>
            <TabPanel value="3">
              <div style={tableDescriptionStyle}>
                Materials either marked for purchase or already owned that now have holds placed.
              </div>
              <Table status={2} username={JSON.parse(token).username}></Table>
            </TabPanel>
            <TabPanel value="4">
              <div style={tableDescriptionStyle}>
                Suggestions marked for purchase that haven't been acqiured after XX days.
              </div>
              <Table status={3} username={JSON.parse(token).username}></Table>
            </TabPanel>
            <TabPanel value="5">
              <div style={tableDescriptionStyle}>
                Suggestions that have been picked up by the patron, or manually closed.
              </div>
              <Table status={4} username={JSON.parse(token).username}></Table>
            </TabPanel>
          </TabContext>
        </Container>
        <ToastContainer
          position="bottom-right"
        />
      </ConfirmProvider>
    </>
  )
}

export default App
