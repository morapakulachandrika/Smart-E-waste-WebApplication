import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getProfile, getUserRequests } from '../services/authService';
import BackButton from '../components/BackButton';

export default function UserDashboard() {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    if (!id) return;
    getProfile(id).then(res => setProfile(res.data)).catch(console.error);
    getUserRequests(id).then(res => setRequests(res.data)).catch(console.error);
  }, [id]);

  if (!profile) return <div className="container py-5"><BackButton /><div className="card p-4">Loading...</div></div>;

  return (
    <div className="container py-5">
      <BackButton />
      <div className="row">
        <div className="col-md-4">
          <div className="card p-4 shadow">
            <h5>{profile.fullName}</h5>
            <p>{profile.email}</p>
            <p>{profile.phone}</p>
            <p>Status: <strong>{profile.status}</strong></p>
          </div>
        </div>

        <div className="col-md-8">
          <div className="card p-4 shadow">
            <h5>Your Requests</h5>
            {requests.length === 0 ? <p>No requests found</p> :
              <ul className="list-group">
                {requests.map(r => (
                  <li key={r.id} className="list-group-item d-flex justify-content-between align-items-start">
                    <div>
                      <div className="fw-bold">{r.itemName}</div>
                      <div className="small text-muted">{r.description}</div>
                    </div>
                    <span className="badge bg-secondary">{r.status}</span>
                  </li>
                ))}
              </ul>
            }
          </div>
        </div>
      </div>
    </div>
  );
}
