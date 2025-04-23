import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  MenuItem,
  Grid,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const Petitions = () => {
  const [petitions, setPetitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    department: '',
    search: '',
  });
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchPetitions();
  }, [filters]);

  const fetchPetitions = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/petitions', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        params: filters,
      });
      setPetitions(response.data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch petitions');
      setLoading(false);
    }
  };

  const handleFilterChange = (field) => (event) => {
    setFilters({
      ...filters,
      [field]: event.target.value,
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'resolved':
        return 'success';
      case 'under_review':
        return 'warning';
      case 'assigned':
        return 'info';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Petitions</Typography>
        {user.role === 'citizen' && (
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/petitions/create')}
          >
            Create New Petition
          </Button>
        )}
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                select
                label="Status"
                value={filters.status}
                onChange={handleFilterChange('status')}
              >
                <MenuItem value="">All Status</MenuItem>
                <MenuItem value="received">Received</MenuItem>
                <MenuItem value="assigned">Assigned</MenuItem>
                <MenuItem value="under_review">Under Review</MenuItem>
                <MenuItem value="resolved">Resolved</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                select
                label="Department"
                value={filters.department}
                onChange={handleFilterChange('department')}
              >
                <MenuItem value="">All Departments</MenuItem>
                <MenuItem value="health">Health</MenuItem>
                <MenuItem value="education">Education</MenuItem>
                <MenuItem value="transport">Transport</MenuItem>
                <MenuItem value="housing">Housing</MenuItem>
                <MenuItem value="environment">Environment</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Search"
                value={filters.search}
                onChange={handleFilterChange('search')}
                placeholder="Search by title or description"
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Department</TableCell>
              <TableCell>Created At</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {petitions.map((petition) => (
              <TableRow key={petition.id}>
                <TableCell>{petition.title}</TableCell>
                <TableCell>
                  <Chip
                    label={petition.status}
                    color={getStatusColor(petition.status)}
                  />
                  {petition.urgency && (
                    <Chip
                      label="Urgent"
                      color="error"
                      size="small"
                      sx={{ ml: 1 }}
                    />
                  )}
                </TableCell>
                <TableCell>{petition.assignedDepartment || '-'}</TableCell>
                <TableCell>
                  {new Date(petition.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => navigate(`/petitions/${petition.id}`)}
                  >
                    View Details
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default Petitions; 