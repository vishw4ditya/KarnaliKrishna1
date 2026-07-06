import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Loader2 } from 'lucide-react';

const LocationPicker = ({ onLocationSelected, initialLocation = null }) => {
  const [coords, setCoords] = useState(
    initialLocation || { lat: 27.7172, lng: 85.3240 } // Default to Kathmandu Central
  );
  const [addressLine, setAddressLine] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [detecting, setDetecting] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Initialize values
  useEffect(() => {
    if (initialLocation) {
      setCoords({ lat: initialLocation.lat, lng: initialLocation.lng });
      setAddressLine(initialLocation.addressLine || '');
      setCity(initialLocation.city || '');
      setState(initialLocation.state || '');
    }
  }, [initialLocation]);

  // Handle GPS detection
  const detectLiveLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setDetecting(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setCoords({ lat: latitude, lng: longitude });

        // Attempt Reverse Geocoding via OpenStreetMap Nominatim (Free API)
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await res.json();
          if (data && data.address) {
            const addr = data.display_name || '';
            const cityName = data.address.city || data.address.town || data.address.suburb || '';
            const stateName = data.address.state || 'Bagmati';

            setAddressLine(addr.split(',').slice(0, 3).join(','));
            setCity(cityName);
            setState(stateName);

            // Notify parent form
            onLocationSelected({
              lat: latitude,
              lng: longitude,
              addressLine: addr,
              city: cityName,
              state: stateName,
            });
          }
        } catch (err) {
          console.error("Geocoding failed, using coordinates only:", err);
          onLocationSelected({
            lat: latitude,
            lng: longitude,
            addressLine: `Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`,
            city: 'Kathmandu',
            state: 'Bagmati',
          });
        } finally {
          setDetecting(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        alert(`Failed to detect location: ${error.message}`);
        setDetecting(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleInputChange = (field, value) => {
    let updated = { lat: coords.lat, lng: coords.lng, addressLine, city, state };
    if (field === 'addressLine') {
      setAddressLine(value);
      updated.addressLine = value;
    } else if (field === 'city') {
      setCity(value);
      updated.city = value;
    } else if (field === 'state') {
      setState(value);
      updated.state = value;
    } else if (field === 'lat') {
      const latVal = parseFloat(value) || coords.lat;
      setCoords((prev) => ({ ...prev, lat: latVal }));
      updated.lat = latVal;
    } else if (field === 'lng') {
      const lngVal = parseFloat(value) || coords.lng;
      setCoords((prev) => ({ ...prev, lng: lngVal }));
      updated.lng = lngVal;
    }

    onLocationSelected(updated);
  };

  return (
    <div className="space-y-4">
      {/* Map visual section */}
      <div className="relative w-full h-64 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-inner">
        {/* We embed an interactive OpenStreetMap iframe based on current selected coordinates */}
        <iframe
          title="Map Location Picker"
          width="100%"
          height="100%"
          frameBorder="0"
          scrolling="no"
          marginHeight="0"
          marginWidth="0"
          src={`https://maps.google.com/maps?q=${coords.lat},${coords.lng}&z=15&output=embed`}
          className="filter grayscale-[15%] dark:invert dark:hue-rotate-[180deg]"
        ></iframe>

        {/* GPS float button */}
        <button
          type="button"
          onClick={detectLiveLocation}
          disabled={detecting}
          className="absolute bottom-4 right-4 flex items-center gap-1.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold px-3 py-2 rounded-lg shadow-lg hover:shadow-primary-500/20 active:scale-95 transition-all disabled:opacity-50"
        >
          {detecting ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Navigation className="w-3.5 h-3.5 fill-current" />
          )}
          <span>Detect My GPS</span>
        </button>

        {/* Center pin overlay */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <MapPin className="w-8 h-8 text-primary-500 fill-current filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.3)] animate-bounce" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs text-slate-500 dark:text-slate-400">
        <div>
          <label className="font-semibold block mb-1">Latitude</label>
          <input
            type="number"
            step="0.000001"
            value={coords.lat}
            onChange={(e) => handleInputChange('lat', e.target.value)}
            className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>
        <div>
          <label className="font-semibold block mb-1">Longitude</label>
          <input
            type="number"
            step="0.000001"
            value={coords.lng}
            onChange={(e) => handleInputChange('lng', e.target.value)}
            className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>
      </div>

      {/* Address fields */}
      <div className="space-y-3">
        <div>
          <label className="text-xs font-semibold block text-slate-500 dark:text-slate-400 mb-1">Full Delivery Address</label>
          <input
            type="text"
            required
            placeholder="e.g. House No. 45, Durbarmarg Street"
            value={addressLine}
            onChange={(e) => handleInputChange('addressLine', e.target.value)}
            className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold block text-slate-500 dark:text-slate-400 mb-1">City</label>
            <input
              type="text"
              required
              placeholder="e.g. Kathmandu, Lalitpur"
              value={city}
              onChange={(e) => handleInputChange('city', e.target.value)}
              className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
          </div>
          <div>
            <label className="text-xs font-semibold block text-slate-500 dark:text-slate-400 mb-1">State / Province</label>
            <input
              type="text"
              required
              placeholder="e.g. Bagmati"
              value={state}
              onChange={(e) => handleInputChange('state', e.target.value)}
              className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationPicker;
