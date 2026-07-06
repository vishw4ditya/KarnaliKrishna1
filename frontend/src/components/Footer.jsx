import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { Mail, Phone, MapPin, ShieldCheck, Droplet, Globe, Heart } from 'lucide-react';
import logo from '../assets/logo.jpg';

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-850 pt-16 pb-8 px-4 md:px-8 mt-auto relative overflow-hidden transition-colors duration-300">
      
      {/* Decorative background water bubble */}
      <div className="absolute top-0 right-10 w-48 h-48 bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-5 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12 relative z-10 text-xs font-semibold text-slate-500 dark:text-slate-400">
        
        {/* Brand Section */}
        <div className="space-y-4">
          <Link to="/" className="flex items-center gap-2.5 text-lg font-extrabold text-slate-900 dark:text-white">
            <img src={logo} alt="KarnaliKrishna Logo" className="w-8 h-8 rounded-full object-cover border border-primary-500/30 shadow" />
            <span className="font-sans font-black tracking-tight">{t('brand')}</span>
          </Link>
          <p className="text-slate-450 dark:text-slate-400 font-medium leading-relaxed max-w-sm">
            Karnali Krishna Purifier Pvt. Ltd. provides premium water purifiers, replacement parts, and high-quality services across Nepal with automated branch logistics.
          </p>
          <div className="flex gap-3">
            <a href="#" aria-label="Facebook" className="p-2 bg-slate-100 dark:bg-slate-900 hover:bg-primary-50 dark:hover:bg-primary-950/30 hover:text-primary-500 rounded-xl transition-all flex items-center justify-center text-slate-500 dark:text-slate-400">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z"/>
              </svg>
            </a>
            <a href="#" aria-label="Instagram" className="p-2 bg-slate-100 dark:bg-slate-900 hover:bg-primary-50 dark:hover:bg-primary-950/30 hover:text-primary-500 rounded-xl transition-all flex items-center justify-center text-slate-500 dark:text-slate-400">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
            </a>
            <a href="#" aria-label="Twitter" className="p-2 bg-slate-100 dark:bg-slate-900 hover:bg-primary-50 dark:hover:bg-primary-950/30 hover:text-primary-500 rounded-xl transition-all flex items-center justify-center text-slate-500 dark:text-slate-400">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
          </div>
        </div>

        {/* Navigation Section */}
        <div className="space-y-4">
          <h4 className="text-[10px] font-black uppercase text-slate-900 dark:text-white tracking-widest flex items-center gap-1">
            <Droplet className="w-3.5 h-3.5 text-primary-500 fill-current animate-pulse" />
            Explore Services
          </h4>
          <ul className="space-y-2.5 font-bold">
            <li>
              <Link to="/" className="hover:text-primary-500 dark:hover:text-primary-400 transition-colors">
                Product Catalog
              </Link>
            </li>
            <li>
              <Link to="/support" className="hover:text-primary-500 dark:hover:text-primary-400 transition-colors">
                Customer Support Help
              </Link>
            </li>
            <li>
              <a href="#" className="hover:text-primary-500 dark:hover:text-primary-400 transition-colors">
                Purification Maintenance Guide
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-primary-500 dark:hover:text-primary-400 transition-colors">
                Water Quality Diagnostics
              </a>
            </li>
          </ul>
        </div>

        {/* Contact Info Section */}
        <div className="space-y-4">
          <h4 className="text-[10px] font-black uppercase text-slate-900 dark:text-white tracking-widest flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-primary-500" />
            Headquarters
          </h4>
          <ul className="space-y-3 font-medium">
            <li className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
              <span>Ghorahi-15, Dang, Nepal</span>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-slate-400" />
              <span>+977-82-560000 / 9857822222</span>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-slate-400" />
              <span>info@karnalikrishna.com</span>
            </li>
          </ul>
        </div>

        {/* Trust Badges Section */}
        <div className="space-y-4">
          <h4 className="text-[10px] font-black uppercase text-slate-900 dark:text-white tracking-widest flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-primary-500" />
            Our Quality Trust
          </h4>
          <div className="space-y-3 font-medium">
            <div className="flex items-start gap-2 bg-slate-100/50 dark:bg-slate-900/40 p-2.5 rounded-xl border border-slate-200/40 dark:border-slate-800/40">
              <Droplet className="w-5 h-5 text-primary-500 fill-current mt-0.5" />
              <div>
                <p className="font-extrabold text-slate-800 dark:text-slate-200">100% Pure Water Guarantee</p>
                <p className="text-[10px] text-slate-450 mt-0.5">Vigorously tested purifier systems.</p>
              </div>
            </div>
            <div className="flex items-start gap-2 bg-slate-100/50 dark:bg-slate-900/40 p-2.5 rounded-xl border border-slate-200/40 dark:border-slate-800/40">
              <Globe className="w-5 h-5 text-primary-500 mt-0.5" />
              <div>
                <p className="font-extrabold text-slate-800 dark:text-slate-200">Nationwide Delivery</p>
                <p className="text-[10px] text-slate-450 mt-0.5">Reliable branch logistics tracking.</p>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Footer Bottom Bar */}
      <div className="max-w-7xl mx-auto pt-8 border-t border-slate-200/60 dark:border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left text-[11px] text-slate-450 font-bold uppercase tracking-wider relative z-10">
        
        <div>
          &copy; {new Date().getFullYear()} Karnali Krishna Purifier Pvt. Ltd. All rights reserved.
        </div>

        <div className="flex items-center gap-1 font-extrabold text-slate-500 dark:text-slate-300">
          <span>Made with</span>
          <Heart className="w-4 h-4 text-rose-500 fill-current animate-pulse" />
          <span>for Nepal</span>
        </div>

      </div>

    </footer>
  );
};

export default Footer;
