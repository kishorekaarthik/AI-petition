import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Alert,
  CircularProgress,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const PetitionDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [petition, setPetition] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [remarks, setRemarks] = useState('');
  const [status, setStatus] = useState('');
  const [department, setDepartment] = useState('');

  useEffect(() => {
    const fetchPetition = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/api/petitions/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        setPetition(response.data);
        setStatus(response.data.status);
        setDepartment(response.data.assignedDepartment || '');
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch petition details');
      } finally {
        setLoading(false);
      }
    };

    fetchPetition();
  }, [id]);

  const handleStatusUpdate = async () => {
    try {
      await axios.put(
        `http://localhost:3001/api/petitions/${id}/status`,
        { status, remarks },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      setPetition({
        ...petition,
        status,
        statusHistory: [
          {
            status,
            remarks,
            createdAt: new Date().toISOString(),
          },
          ...petition.statusHistory,
        ],
      });
      setRemarks('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleDepartmentAssign = async () => {
    try {
      await axios.put(
        `http://localhost:3001/api/petitions/${id}/assign`,
        { department },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      setPetition({
        ...petition,
        assignedDepartment: department,
        status: 'assigned',
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to assign department');
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
    <Box maxWidth="md" mx="auto">
      <Typography variant="h4" gutterBottom>
        Petition Details
      </Typography>
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            {petition.title}
          </Typography>
          <Box display="flex" gap={1} mb={2}>
            <Chip
              label={petition.status}
              color={
                petition.status === 'resolved'
                  ? 'success'
                  : petition.status === 'under_review'
                  ? 'warning'
                  : 'primary'
              }
            />
            {petition.urgency && <Chip label="Urgent" color="error" />}
            {petition.isDuplicate && <Chip label="Duplicate" color="secondary" />}
          </Box>
          <Typography variant="body1" paragraph>
            {petition.description}
          </Typography>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" gutterBottom>
            Status History
          </Typography>
          <List>
            {petition.statusHistory?.map((history, index) => (
              <React.Fragment key={index}>
                <ListItem>
                  <ListItemText
                    primary={history.status}
                    secondary={
                      <>
                        <Typography component="span" variant="body2">
                          {history.remarks}
                        </Typography>
                        <br />
                        <Typography component="span" variant="caption" color="text.secondary">
                          {new Date(history.createdAt).toLocaleString()}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
                {index < petition.statusHistory.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>

          {user.role === 'officer' && petition.assignedDepartment === user.department && (
            <>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Update Status
              </Typography>
              <TextField
                fullWidth
                select
                label="Status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                SelectProps={{
                  native: true,
                }}
                margin="normal"
              >
                <option value="received">Received</option>
                <option value="assigned">Assigned</option>
                <option value="under_review">Under Review</option>
                <option value="resolved">Resolved</option>
              </TextField>
              <TextField
                fullWidth
                label="Remarks"
                multiline
                rows={2}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                margin="normal"
              />
              <Box mt={2}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleStatusUpdate}
                >
                  Update Status
                </Button>
              </Box>
            </>
          )}

          {user.role === 'admin' && (
            <>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Assign Department
              </Typography>
              <TextField
                fullWidth
                select
                label="Department"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                SelectProps={{
                  native: true,
                }}
                margin="normal"
              >
                <option value="">Select Department</option>
                <option value="health">Health</option>
                <option value="education">Education</option>
                <option value="transport">Transport</option>
                <option value="housing">Housing</option>
                <option value="environment">Environment</option>
              </TextField>
              <Box mt={2}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleDepartmentAssign}
                  disabled={!department}
                >
                  Assign Department
                </Button>
              </Box>
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default PetitionDetails; 