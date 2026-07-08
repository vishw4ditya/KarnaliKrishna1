import React, { useState, useEffect } from 'react';
import { api, getAssetUrl } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import WhatsAppButton from '../../components/WhatsAppButton';
import { HelpCircle, User, Phone, MapPin } from 'lucide-react';

const Support = () => {
  const { t } = useLanguage();
  const [branchHeads, setBranchHeads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSupportHeads = async () => {
      try {
        const res = await api.get('/branches/support');
        if (res.data.success) {
          setBranchHeads(res.data.branchHeads);
        }
      } catch (err) {
        console.error('Failed to load support branch heads', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSupportHeads();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] text-slate-400">
        Loading support staff info...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-6 space-y-6">
      
      <div className="text-center max-w-xl mx-auto space-y-2 mb-8">
        <div className="w-12 h-12 bg-primary-100 dark:bg-primary-950/20 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <HelpCircle className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Customer Support</h1>
        <p className="text-sm text-slate-500">
          Got questions about products, branch inventory, or orders? Message any of our approved Branch Heads directly on WhatsApp.
        </p>
      </div>

      {branchHeads.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl text-slate-450 font-semibold text-xs">
          No active branch support staff found. Please check back later.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
          {branchHeads.map((head) => (
            <div
              key={head._id}
              className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex gap-4 hover:shadow-md transition-all"
            >
              {/* Photo */}
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-950 rounded-xl overflow-hidden flex-shrink-0 border border-slate-100 dark:border-slate-800">
                <img
                  src={getAssetUrl(head.profilePhotoUrl) || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&q=80'}
                  alt={head.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Contact Details */}
              <div className="flex-1 min-w-0 space-y-3">
                <div className="space-y-1">
                  <h4 className="font-extrabold text-slate-800 dark:text-slate-100 text-sm truncate">
                    {head.name}
                  </h4>
                  <span className="text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-400 font-bold uppercase px-2 py-0.5 rounded-full inline-block">
                    {t('branchHead')}
                  </span>
                </div>

                <div className="space-y-1 text-xs text-slate-500 font-medium">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-primary-500" />
                    <span className="truncate">{head.branchName || 'Kathmandu Central'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <span>{head.phone}</span>
                  </div>
                </div>

                {/* WhatsApp Action Button */}
                <WhatsAppButton
                  phone={head.phone}
                  name={head.name}
                  branchName={head.branchName}
                />
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default Support;
