import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

const PendingApproval = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-8 rounded-2xl shadow-xl">
        <div className="w-16 h-16 bg-amber-50 dark:bg-amber-950/20 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
          Registration Pending Approval
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
          Your Branch Head account application has been submitted successfully. 
          The Super Admin is currently reviewing your profile photo and branch details. 
          Please try logging in again once you receive confirmation.
        </p>
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-sm font-semibold transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Login</span>
        </Link>
      </div>
    </div>
  );
};

export default PendingApproval;
