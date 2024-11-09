"use client"
import { UserButton } from '@clerk/nextjs'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import React, { useEffect } from 'react'

const Header = () => {

  const path = usePathname();
  useEffect(() => {
    console.log(path);
  }, []);

  return (
    <header className="bg-gradient-to-r from-secondary via-third-color to-fourth-color shadow-lg p-4">
      <div className="container mx-auto flex items-center justify-between">
        <Image src={'/logo.svg'} width={160} height={160} alt='logo' />
        <ul className="hidden md:flex gap-8 text-sm lg:text-base font-medium">
          <li className={`cursor-pointer transition duration-200 
            ${path === '/dashboard' ? 'text-primary font-semibold' : 'text-gray-600 hover:text-primary hover:font-semibold'}`}>
            Dashboard
          </li>
          <li className={`cursor-pointer transition duration-200 
            ${path === '/dashboard/questions' ? 'text-primary font-semibold' : 'text-gray-600 hover:text-primary hover:font-semibold'}`}>
            Questions
          </li>
          <li className={`cursor-pointer transition duration-200 
            ${path === '/dashboard/upgrade' ? 'text-primary font-semibold' : 'text-gray-600 hover:text-primary hover:font-semibold'}`}>
            Upgrade
          </li>
          <li className={`cursor-pointer transition duration-200 
            ${path === '/dashboard/howitworks' ? 'text-primary font-semibold' : 'text-gray-600 hover:text-primary hover:font-semibold'}`}>
            How it Works
          </li>
        </ul>
        <UserButton />
      </div>
    </header>
  );
}

export default Header;
