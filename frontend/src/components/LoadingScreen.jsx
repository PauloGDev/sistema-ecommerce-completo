import React from "react";
import { motion } from "framer-motion";
import { assets } from "../assets/assets";

const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-black via-gray-900 to-black flex flex-col justify-center items-center z-50">
      {/* Logo animada */}
      <motion.img
        src={assets.logo}
        alt="Logo Sublime"
        className="w-52 h-52 object-contain"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, ease: "easeInOut" }}
      />

      {/* Barra de progresso luxuosa */}
      <motion.div
        className="mt-8 w-48 h-[3px] bg-gray-700 overflow-hidden rounded-full shadow-inner"
        initial={{ width: 0 }}
        animate={{ width: "12rem" }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
      >
        <motion.div
          className="h-full bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300"
          initial={{ x: "-100%" }}
          animate={{ x: "100%" }}
          transition={{
            repeat: Infinity,
            duration: 1.4,
            ease: "easeInOut",
          }}
        />
      </motion.div>
    </div>
  );
};

export default LoadingScreen;
