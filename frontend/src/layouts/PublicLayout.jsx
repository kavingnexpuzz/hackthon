import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import PublicNavbar from './PublicNavbar';
import ComplaintModal from '../components/complaint/ComplaintModal';

const PublicLayout = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalPrefill, setModalPrefill] = useState(null);

  const openComplaintModal = (prefill = null) => {
    setModalPrefill(prefill);
    setIsModalOpen(true);
  };

  const closeComplaintModal = () => {
    setIsModalOpen(false);
    setModalPrefill(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors">
      <PublicNavbar onOpenComplaintModal={() => openComplaintModal()} />
      <main className="flex-1">
        <Outlet context={{ openComplaintModal }} />
      </main>
      <footer className="border-t border-slate-200 dark:border-slate-800 py-6 text-center text-xs text-slate-500 dark:text-slate-400">
        © 2026 VET Institute of Arts and Science — Autonomous AI College Helpdesk & Complaint Tracking Agent
      </footer>
      <ComplaintModal
        isOpen={isModalOpen}
        onClose={closeComplaintModal}
        prefillData={modalPrefill}
      />
    </div>
  );
};

export default PublicLayout;
