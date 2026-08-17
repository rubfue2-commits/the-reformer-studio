import { motion } from "framer-motion";
import { pageVariants, pageTransition } from "@/lib/motion";
import type { ReactNode } from "react";

/**
 * Enveloppe une page pour lui donner une transition d'entrée/sortie douce.
 * Utilisé avec AnimatePresence dans le routing pour animer les changements d'écran.
 */
export default function PageTransition({ children }: { children: ReactNode }) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={pageTransition}
      style={{ minHeight: "100%" }}
    >
      {children}
    </motion.div>
  );
}
