"use client"
import { UserButton } from '@clerk/nextjs'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'

const Header = () => {

  const path = usePathname();

  return (
    <header className="border-b bg-white">
      <div className="container mx-auto p-4 flex items-center justify-between">
        <Image src={'/logo.svg'} width={120} height={40} alt='logo' />
        <ul className="hidden md:flex gap-6 text-sm font-medium">
          <Link href={'/dashboard'}>
            <li className={`transition-colors ${path === '/dashboard' ? 'text-black font-bold' : 'text-gray-500 hover:text-black'}`}>
              Dashboard
            </li>
          </Link>
          <Link href={'/dashboard/questions'}>
            <li className={`transition-colors ${path === '/dashboard/questions' ? 'text-black font-bold' : 'text-gray-500 hover:text-black'}`}>
              Questions
            </li>
          </Link>
          <Link href={'/dashboard/analytics'}>
            <li className={`transition-colors ${path === '/dashboard/analytics' ? 'text-black font-bold' : 'text-gray-500 hover:text-black'}`}>
              Analytics
            </li>
          </Link>
          <Link href={'/dashboard'}>
            <li className={`transition-colors ${path === '/dashboard/upgrade' ? 'text-black font-bold' : 'text-gray-500 hover:text-black'}`}>
              Upgrade
            </li>
          </Link>
          <Link href={'/dashboard/how-it-works'}>
            <li className={`transition-colors ${path === '/dashboard/how-it-works' ? 'text-black font-bold' : 'text-gray-500 hover:text-black'}`}>
              How it Works
            </li>
          </Link>
        </ul>
        <UserButton />
      </div>
    </header>
  );
}

export default Header;
