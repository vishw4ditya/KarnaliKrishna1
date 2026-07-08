import React, { useState, useEffect } from 'react';
import { useAuth, api, getAssetUrl } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import LocationPicker from '../../components/LocationPicker';
import { User, Mail, Phone, MapPin, Trash2, Plus, Home, Briefcase, Landmark } from 'lucide-react';

const Profile = () => {
  const { user, setUser, addAddress, deleteAddress } = useAuth();
  const { t } = useLanguage();

  const [showAddAddress, setShowAddAddress] = useState(false);
  const [addressName, setAddressName] = useState('');
  const [addressLine, setAddressLine] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [latitude, setLatitude] = useState(27.7172);
  const [longitude, setLongitude] = useState(85.324);
  const [loading, setLoading] = useState(false);

  // Profile Edit State variables
  const [editMode, setEditMode] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editEmail, setEditEmail] = useState(user?.email || '');
  const [editPhone, setEditPhone] = useState(user?.phone || '');
  const [editPassword, setEditPassword] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);

  // Sync edits if user changes
  useEffect(() => {
    if (user) {
      setEditName(user.name || '');
      setEditEmail(user.email || '');
      setEditPhone(user.phone || '');
    }
  }, [user]);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!editName.trim() || !editEmail.trim() || !editPhone.trim()) {
      alert('Name, email, and phone are required.');
      return;
    }

    setProfileLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', editName);
      formData.append('email', editEmail);
      formData.append('phone', editPhone);
      if (editPassword.trim()) {
        const hasAlphabet = /[a-zA-Z]/.test(editPassword);
        const hasDigit = /[0-9]/.test(editPassword);
        if (!hasAlphabet || !hasDigit) {
          alert('Password must contain a mix of alphabets and digits');
          setProfileLoading(false);
          return;
        }
        formData.append('password', editPassword);
      }
      if (selectedFile) {
        formData.append('profilePhoto', selectedFile);
      }

      const res = await api.put('/auth/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (res.data.success) {
        setUser(res.data.user);
        setEditMode(false);
        setEditPassword('');
        setSelectedFile(null);
        setPreviewUrl(null);
        alert('Profile updated successfully!');
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleLocationPicked = (loc) => {
    setLatitude(loc.lat);
    setLongitude(loc.lng);
    if (loc.addressLine) setAddressLine(loc.addressLine);
    if (loc.city) setCity(loc.city);
    if (loc.state) setState(loc.state);
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    if (!addressName.trim() || !addressLine.trim() || !city.trim() || !state.trim()) {
      alert('Please fill out all address details.');
      return;
    }

    setLoading(true);
    try {
      const res = await addAddress({
        name: addressName,
        addressLine,
        city,
        state,
        latitude,
        longitude,
      });

      if (res.success) {
        setShowAddAddress(false);
        setAddressName('');
        setAddressLine('');
        setCity('');
        setState('');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to save address');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAddress = async (id) => {
    if (!window.confirm('Are you sure you want to delete this address?')) return;
    try {
      await deleteAddress(id);
    } catch (err) {
      console.error(err);
      alert('Failed to delete address');
    }
  };

  const getAddressIcon = (label) => {
    const l = label.toLowerCase();
    if (l.includes('home') || l.includes('house')) return <Home className="w-4 h-4 text-primary-500" />;
    if (l.includes('office') || l.includes('work')) return <Briefcase className="w-4 h-4 text-primary-500" />;
    return <Landmark className="w-4 h-4 text-primary-500" />;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-6 space-y-8 animate-fade-in">
      <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Your Profile</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Column: Shopper info details */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-2xl shadow-sm h-fit space-y-4">
          <div className="relative group w-20 h-20 mx-auto">
            {previewUrl ? (
              <img 
                src={previewUrl} 
                alt="Preview" 
                className="w-20 h-20 rounded-full object-cover border border-primary-500/30 shadow-md" 
              />
            ) : user?.profilePhotoUrl ? (
              <img 
                src={getAssetUrl(user.profilePhotoUrl)} 
                alt="Profile" 
                className="w-20 h-20 rounded-full object-cover border border-primary-500/30 shadow-md" 
              />
            ) : (
              <div className="w-20 h-20 bg-primary-100 dark:bg-primary-950/30 text-primary-600 rounded-full flex items-center justify-center text-2xl font-bold font-sans shadow-md">
                {user?.name?.charAt(0)}
              </div>
            )}
            {editMode && (
              <label className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center text-white text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                Change
                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
              </label>
            )}
          </div>
          
          {!editMode ? (
            <>
              <div className="space-y-1 text-center">
                <h3 className="font-extrabold text-slate-850 dark:text-white text-base leading-tight">
                  {user?.name}
                </h3>
                <span className="text-[10px] bg-slate-100 dark:bg-slate-800 font-bold uppercase text-slate-400 px-2 py-0.5 rounded-full inline-block">
                  {user?.role}
                </span>
                {user?.branchName && (
                  <p className="text-[10px] text-primary-500 font-bold mt-1">Branch: {user.branchName}</p>
                )}
              </div>

              <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-500">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <span className="truncate" title={user?.email}>{user?.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <span>{user?.phone}</span>
                </div>
              </div>

              <button
                onClick={() => setEditMode(true)}
                className="w-full mt-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-primary-50 dark:hover:bg-primary-950/30 text-slate-700 dark:text-slate-200 hover:text-primary-600 dark:hover:text-primary-400 rounded-xl text-xs font-bold transition-all"
              >
                Edit Profile
              </button>
            </>
          ) : (
            <form onSubmit={handleUpdateProfile} className="space-y-3 pt-2 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Full Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
                <input
                  type="email"
                  required
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Phone Number</label>
                <input
                  type="text"
                  required
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">New Password (Optional)</label>
                <input
                  type="password"
                  placeholder="Leave blank to keep same"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white font-semibold"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditMode(false);
                    setPreviewUrl(null);
                    setSelectedFile(null);
                    setEditPassword('');
                  }}
                  className="flex-1 py-2 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-950 transition-all text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={profileLoading}
                  className="flex-1 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold shadow-md transition-all text-center"
                >
                  {profileLoading ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Right Column: Address book */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-4">
            
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-extrabold text-slate-850 dark:text-slate-100 text-sm uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-4.5 h-4.5 text-primary-500" />
                <span>Address Book</span>
              </h3>
              {!showAddAddress && (
                <button
                  onClick={() => setShowAddAddress(true)}
                  className="flex items-center gap-1 text-xs text-primary-500 font-bold hover:underline"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add New</span>
                </button>
              )}
            </div>

            {/* Forms addition */}
            {showAddAddress ? (
              <form onSubmit={handleSaveAddress} className="space-y-4 pt-2">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400">Address Label</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Home, Office"
                    value={addressName}
                    onChange={(e) => setAddressName(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>

                <div className="border border-slate-100 dark:border-slate-800 p-4 rounded-xl">
                  <LocationPicker
                    onLocationSelected={handleLocationPicked}
                    initialLocation={{ lat: latitude, lng: longitude, addressLine, city, state }}
                  />
                </div>

                <div className="flex gap-3 justify-end text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setShowAddAddress(false)}
                    className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl"
                  >
                    {loading ? 'Saving...' : 'Save Address'}
                  </button>
                </div>
              </form>
            ) : user?.addresses && user.addresses.length > 0 ? (
              <div className="space-y-3">
                {user.addresses.map((addr) => (
                  <div
                    key={addr._id}
                    className="flex gap-4 items-start p-4 border border-slate-100 dark:border-slate-800 rounded-xl"
                  >
                    <div className="p-2 bg-slate-50 dark:bg-slate-950 rounded-lg">
                      {getAddressIcon(addr.name)}
                    </div>

                    <div className="flex-1 min-w-0 text-xs space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-slate-800 dark:text-slate-200 capitalize">{addr.name}</span>
                        {addr.isDefault && (
                          <span className="bg-primary-100 text-primary-600 px-2 py-0.5 rounded text-[8px] font-bold">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-slate-500 dark:text-slate-400">{addr.addressLine}, {addr.city}, {addr.state}</p>
                      <span className="text-[10px] text-slate-400 font-semibold block">
                        GPS Coords: {addr.latitude.toFixed(5)}, {addr.longitude.toFixed(5)}
                      </span>
                    </div>

                    <button
                      onClick={() => handleDeleteAddress(addr._id)}
                      className="p-2 text-slate-450 hover:text-rose-500 transition-colors"
                      title="Delete address"
                    >
                      <Trash2 className="w-4.5 h-4.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-slate-400 text-xs font-semibold">
                No addresses saved in your address book.
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
};

export default Profile;
