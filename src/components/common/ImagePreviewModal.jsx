import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

export default function ImagePreviewModal({ url, onClose }) {
    if (!url) return null;
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-4 md:p-10 cursor-zoom-out"
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="relative max-w-5xl w-full h-full flex items-center justify-center"
                onClick={e => e.stopPropagation()}
            >
                <img src={url} alt="Visualização" className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl" />
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition-all"
                >
                    <X size={24} />
                </button>
            </motion.div>
        </motion.div>
    );
}
