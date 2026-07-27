'use client'
import { motion } from "motion/react";

export default function Home() {
  return (
    <>
      <div className="bg-white h-screen w-full flex items-center justify-center">
        <motion.div animate={{ scale: [1.05, 0.5, 1.05, 1.05] }} exit={{ scale: 1 ,height:screen }} transition={{ duration: 2.5, times: [0, 0.5, 1], ease: [0.87, 0, 0.13, 1], repeat: Infinity, delay: 0.45, repeatDelay: 0 }} className="bg-black h-[70vmin] w-[80vmin] z-9 rounded-4xl flex items-center justify-center ">
          <motion.div animate={{ scale: [1.34, 1.2, 1.34, 1.34] }} exit={{ scale: 1 ,height:screen }} transition={{ duration: 2.5, times: [0, 0.5, 1], ease: [0.87, 0, 0.13, 1], repeat: Infinity, delay: 0.3, repeatDelay: 0 }} className="bg-white h-[70%] w-[70%] rounded-4xl  flex items-center justify-center">
            <motion.div animate={{ scale: [1.88, 1.7, 1.88, 1.88] }} exit={{ scale: 1 ,height:screen }} transition={{ duration: 2.5, times: [0, 0.5, 1], ease: [0.87, 0, 0.13, 1], repeat: Infinity, delay: 0.15, repeatDelay: 0 }} className="bg-black h-[50%] w-[50%] z-9 rounded-4xl flex items-center justify-center ">
              <motion.div animate={{ scale: [1.84, 1.7, 1.84, 1.84] }} exit={{ scale: 1 ,height:screen }} transition={{ duration: 2.5, times: [0, 0.5, 1], ease: [0.87, 0, 0.13, 1], repeat: Infinity, delay: 0, repeatDelay: 0 }} className="bg-white h-[50%] w-[50%] z-9 rounded-4xl flex items-center justify-center ">
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </>
  );
}