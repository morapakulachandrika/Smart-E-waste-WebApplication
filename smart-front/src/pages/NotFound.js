import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="container py-5 text-center">
      <h1>404</h1>
      <p>Page not found</p>
      <Link className="btn btn-outline-primary" to="/">Back to Home</Link>
    </div>
  );
}
