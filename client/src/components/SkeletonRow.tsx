import React from 'react';
import { motion } from 'framer-motion';

type Props = {
  index?: number;
};

const SkeletonRow: React.FC<Props> = ({ index = 0 }) => {
  // Small staggered entrance followed by a subtle pulse — index is used to phase the entrance
  const entranceDelay = Math.min(0.5, index * 0.04);

  return (
    <motion.tr
      className="border-t border-slate-200/70 dark:border-slate-800/80"
      aria-hidden="true"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, delay: entranceDelay, ease: 'easeOut' }}
    >
      <td className="px-6 py-4">
        <motion.div
          className="h-4 w-24 rounded-full bg-slate-200/80 sm:w-40 dark:bg-slate-800"
          style={{ originX: 0.5 }}
          animate={{ scale: [0.995, 1, 0.995], opacity: [0.85, 1, 0.85] }}
          transition={{ duration: 1.4, repeat: Infinity, delay: entranceDelay }}
        />
      </td>
      <td className="px-6 py-4">
        <motion.div
          className="h-4 w-36 rounded-full bg-slate-200/80 sm:w-56 dark:bg-slate-800"
          animate={{ scale: [0.995, 1, 0.995], opacity: [0.85, 1, 0.85] }}
          transition={{ duration: 1.3, repeat: Infinity, delay: entranceDelay + 0.02 }}
        />
      </td>
      <td className="px-6 py-4">
        <motion.div
          className="h-4 w-20 rounded-full bg-slate-200/80 dark:bg-slate-800"
          animate={{ scale: [0.995, 1, 0.995], opacity: [0.85, 1, 0.85] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: entranceDelay + 0.04 }}
        />
      </td>
      <td className="px-6 py-4">
        <motion.div
          className="h-4 w-28 rounded-full bg-slate-200/80 dark:bg-slate-800"
          animate={{ scale: [0.995, 1, 0.995], opacity: [0.85, 1, 0.85] }}
          transition={{ duration: 1.25, repeat: Infinity, delay: entranceDelay + 0.03 }}
        />
      </td>
      <td className="px-6 py-4 text-right">
        <motion.div
          className="h-9 w-24 rounded-full bg-slate-200/80 inline-block dark:bg-slate-800"
          animate={{ scale: [0.995, 1, 0.995], opacity: [0.85, 1, 0.85] }}
          transition={{ duration: 1.35, repeat: Infinity, delay: entranceDelay + 0.01 }}
        />
      </td>
    </motion.tr>
  );
};

export default SkeletonRow;
