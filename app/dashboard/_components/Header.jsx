"use client"
import { UserButton } from '@clerk/nextjs'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import React, { useEffect } from 'react'

const header = () => {

  const path=usePathname();
  useEffect(()=>{
    console.log(path);
    
  },[])
  return (
    <div className='flex items-center justify-between bg-secondary shadow-md'>
      <Image src={'/logo.svg'} width={200} height={200} alt='logo'/>
      <ul className='hidden md:flex gap-6  '>
        <li className={`hover:text-primary hover:font-bold transition-all cursor-pointer
          ${path=='/dashboard'&&'text-primary font-bold'}
          `}>Dashboard</li>
        <li  className={`hover:text-primary hover:font-bold transition-all cursor-pointer
          ${path=='/dashboard/questions'&&'text-primary font-bold'}
          `}>Questions</li>
        <li  className={`hover:text-primary hover:font-bold transition-all cursor-pointer
          ${path=='/dashboard/upgrade'&&'text-primary font-bold'}
          `}>Upgrade</li>
        <li  className={`hover:text-primary hover:font-bold transition-all cursor-pointer
          ${path=='/dashboard/howitworks'&&'text-primary font-bold'}
          `}>How it Works</li>
      </ul>
      <UserButton/>
    </div>
  )
}

export default header