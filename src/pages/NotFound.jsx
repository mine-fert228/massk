import { Link } from "react-router-dom";

import React from 'react';
import { useNavigate } from 'react-router-dom'; // если у тебя React Router
import { motion } from 'framer-motion';

const NotFound = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex flex-col items-center justify-center text-white px-4">
            <motion.h1
                className="text-9xl font-extrabold mb-4 text-red-500 drop-shadow-lg"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6 }}
            >
                404
            </motion.h1>

            <motion.p
                className="text-2xl md:text-3xl font-light text-center mb-6"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
            >
                Такой страницы нету!
            </motion.p>

            <motion.button
                className="bg-red-600 hover:bg-red-700 transition text-white px-6 py-3 rounded-xl shadow-md"
                onClick={() => navigate('/')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                Вернуться на главную
            </motion.button>
        </div>
    );
};

export default NotFound;

