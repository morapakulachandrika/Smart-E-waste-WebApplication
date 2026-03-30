import React, { useState, useRef, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "leaflet/dist/leaflet.css";
import "./WasteRequestForm.css";

// Fix Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

export default function WasteRequestForm() {
  const navigate = useNavigate();
  const mapRef = useRef(null);

  const [formData, setFormData] = useState({
    deviceType: "",
    brand: "",
    model: "",
    conditionStatus: "",
    quantity: 1,
    alternateContact: "",
    address: "",
    remarks: "",
    pickupScheduledAt: "",
  });

  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [location, setLocation] = useState([12.9716, 77.5946]);
  const [showMap, setShowMap] = useState(false);
  const [previewImg, setPreviewImg] = useState(null);

  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  /* ---------------- HANDLERS ---------------- */

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  // Step 1: Open confirmation card
  const handleSubmit = (e) => {
    e.preventDefault();
    setShowConfirm(true);
  };

  // Step 2: Final submit after confirmation
  const confirmAndSubmit = async () => {
  if (submitting) return; // 🔒 prevent double submit

  try {
    setSubmitting(true);

    const userId = localStorage.getItem("userId");

    const payload = {
      ...formData,
      userId: Number(userId),
      latitude: location[0],
      longitude: location[1],
    };

    const data = new FormData();
    data.append(
      "request",
      new Blob([JSON.stringify(payload)], { type: "application/json" })
    );
    images.forEach((img) => data.append("images", img));

    await api.post("/api/requests/create", data);

    // ✅ Use toastId to prevent duplicates
    toast.success("♻️ E-Waste request submitted successfully!", {
      toastId: "ewaste-request-success"
    });

    setShowConfirm(false);
    setTimeout(() => navigate("/user-dashboard"), 1500);
  } catch {
    toast.error("❌ Failed to submit request", {
      toastId: "ewaste-request-fail"
    });
  } finally {
    setSubmitting(false);
  }
};


  const handleImageChange = (e) => {
  const newFiles = Array.from(e.target.files);

  if (images.length + newFiles.length > 5) {
    toast.error(<b>❌ You can upload only 5 images</b>);
    e.target.value = "";
    return;
  }

  setImages((prev) => [...prev, ...newFiles]);
  setPreviews((prev) => [
    ...prev,
    ...newFiles.map((f) => URL.createObjectURL(f)),
  ]);

  e.target.value = ""; // allow re-selecting same file
};


  const fetchAddress = async (lat, lng) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`
      );
      const data = await res.json();
      if (data.display_name) {
        setFormData((p) => ({ ...p, address: data.display_name }));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const useCurrentLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        setLocation([lat, lng]);
        fetchAddress(lat, lng);
        setShowMap(true);

        setTimeout(() => {
          if (mapRef.current) {
            mapRef.current.setView([lat, lng], 15);
            mapRef.current.invalidateSize();
          }
        }, 400);
      },
      () => toast.error(<b>Unable to get location</b>)
    );
  };

  function DraggableMarker() {
    useMapEvents({
      click(e) {
        setLocation([e.latlng.lat, e.latlng.lng]);
        fetchAddress(e.latlng.lat, e.latlng.lng);
      },
    });

    return (
      <Marker
        position={location}
        draggable
        eventHandlers={{
          dragend: (e) => {
            const p = e.target.getLatLng();
            setLocation([p.lat, p.lng]);
            fetchAddress(p.lat, p.lng);
          },
        }}
      />
    );
  }

  useEffect(() => {
    if (showMap && mapRef.current) {
      setTimeout(() => mapRef.current.invalidateSize(), 300);
    }
  }, [showMap]);

  const getMinDateTimeLocal = () => {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000; // offset in ms
  const localISOTime = new Date(now - offset).toISOString().slice(0, 16);
  return localISOTime;
};

const removeImage = (index) => {
  setImages((prev) => prev.filter((_, i) => i !== index));
  setPreviews((prev) => prev.filter((_, i) => i !== index));
};


  /* ---------------- UI ---------------- */

  return (
    <div className="ewp-page">
      <div className="ewp-container">
        <div className="ewp-header">
          <h2>♻️ E-Waste Pickup Request</h2>
          <button onClick={() => navigate("/user-dashboard")}>← Back</button>
        </div>

        <form onSubmit={handleSubmit} className="ewp-form">
          {/* DEVICE */}
          {/* DEVICE */}
<div className="ewp-card">
  <h3>📱 Device Information</h3>
  <div className="ewp-grid">
    {/* Device Type Dropdown */}
    <div>
      <label>Device Type</label>
      <select
        name="deviceType"
        value={formData.deviceType}
        onChange={handleChange}
        required
      >
        <option value="">Select Device</option>
        <option value="Laptop">Laptop</option>
        <option value="Desktop">Desktop</option>
        <option value="Mobile">Mobile</option>
        <option value="Tablet">Tablet</option>
        <option value="Printer">Printer</option>
        <option value="Other">Other</option>
      </select>
    </div>

    {/* Condition Dropdown */}
    <div>
      <label>Condition</label>
      <select
        name="conditionStatus"
        value={formData.conditionStatus}
        onChange={handleChange}
        required
      >
        <option value="">Select Condition</option>
        <option value="WORKING">Working</option>
        <option value="DAMAGED">Damaged</option>
        <option value="DEAD">Dead</option>
      </select>
    </div>

    {/* Brand Dropdown */}
    <div>
      <label>Brand</label>
      <select
        name="brand"
        value={formData.brand}
        onChange={handleChange}
        required
      >
        <option value="">Select Brand</option>
        <option value="Apple">Apple</option>
        <option value="Dell">Dell</option>
        <option value="HP">HP</option>
        <option value="Lenovo">Lenovo</option>
        <option value="Samsung">Samsung</option>
        <option value="Other">Other</option>
      </select>
    </div>

    {/* Model Input */}
    <div>
      <label>Model</label>
      <input
        name="model"
        value={formData.model}
        onChange={handleChange}
        placeholder="Optional"
      />
    </div>

    {/* Quantity */}
    <div className="small">
      <label>Quantity</label>
      <input
        type="number"
        min="1"
        name="quantity"
        value={formData.quantity}
        onChange={handleChange}
        required
      />
    </div>
  </div>
</div>


          {/* CONTACT */}
          <div className="ewp-card">
            <h3>📞 Contact Details</h3>
            <input name="alternateContact" value={formData.alternateContact} onChange={handleChange} required />
          </div>

          {/* PICKUP */}
          <div className="ewp-card">
            <h3>📍 Pickup Details</h3>

            <div className="ewp-actions">
              <button type="button" onClick={useCurrentLocation}>📍 Current Location</button>
              <button type="button" onClick={() => setShowMap(!showMap)}>🗺 Select on Map</button>
            </div>

            <textarea name="address" value={formData.address} onChange={handleChange} required />
            
            
            {showMap && (
              <div className="ewp-map">
                <MapContainer center={location} zoom={15} style={{ height: "100%", width: "100%" }}
                  whenCreated={(m) => {
                    mapRef.current = m;
                    setTimeout(() => m.invalidateSize(), 300);
                  }}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <DraggableMarker />
                </MapContainer>
              </div>
            )}
          </div>

          {/* Remarks / Additional Details */}
  <textarea
    name="remarks"
    value={formData.remarks}
    onChange={handleChange}
    placeholder="Additional details / remarks (optional)"
  />

  {/* Scheduled Pickup Date */}
<input
  type="datetime-local"
  name="pickupScheduledAt"
  value={formData.pickupScheduledAt}
  onChange={handleChange}
  required
  min={getMinDateTimeLocal()}   // ✅ blocks past date & time
/>;



          {/* IMAGES */}
          <div className="ewp-card">
            <h3>🖼 Upload Images</h3>
            <input
  type="file"
  multiple
  accept="image/*"
  onChange={handleImageChange}
  hidden
  id="imageUpload"
/>

<label htmlFor="imageUpload" className="ewp-add-btn">
  ➕ Add Images
</label>

<p className="ewp-hint">{images.length}/5 images selected</p>

<div className="ewp-preview">
  {previews.map((img, i) => (
    <div key={i} className="ewp-img-box">
      <img src={img} alt="" onClick={() => setPreviewImg(img)} />
      <button
        type="button"
        className="ewp-remove"
        onClick={() => removeImage(i)}
      >
        ❌
      </button>
    </div>
  ))}
</div>

           
          </div>

          <button className="ewp-submit">🚀 Submit Pickup Request</button>
        </form>
      </div>

      {previewImg && (
        <div className="ewp-modal" onClick={() => setPreviewImg(null)}>
          <img src={previewImg} alt="" />
        </div>
      )}

      {/* CONFIRMATION CARD */}
      {showConfirm && (
        <div className="ewp-modal">
          <div className="ewp-confirm-card">
            <h3>✅ Confirm Pickup Details</h3>

            <p><b>Device:</b> {formData.deviceType}</p>
            <p><b>Brand:</b> {formData.brand}</p>
            <p><b>Condition:</b> {formData.conditionStatus}</p>
            <p><b>Quantity:</b> {formData.quantity}</p>
            <p><b>Contact:</b> {formData.alternateContact}</p>
            <p><b>Date:</b> {formData.pickupScheduledAt}</p>
            <p><b>Address:</b> {formData.address}</p>

            <div className="ewp-confirm-actions">
              <button onClick={() => setShowConfirm(false)}>❌ Edit</button>
              <button onClick={confirmAndSubmit} disabled={submitting}>
                {submitting ? "Submitting..." : "✅ Confirm & Submit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
