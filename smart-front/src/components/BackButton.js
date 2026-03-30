import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function BackButton({ to = -1, children }) {
  const navigate = useNavigate();
  return (
    <button className="btn btn-outline-secondary mb-3" onClick={() => navigate(to)}>
      ← {children || 'Back'}
    </button>
  );
}
