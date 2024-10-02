'use client'

import { ThemeProvider } from "next-themes"
import { Container } from "@/components/Container"
import { Customers } from "@/components/Customers"
import Licitaciones from '@/components/Licitaciones'
import { AuthModal } from "@/components/AuthModal"
import { useAuth } from "@/components/AuthProvider"

import { benefitOne, benefitTwo } from "@/components/data"
import Image from "next/image";
import heroImg from "../../public/img/hero2.jpg";
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function Home() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  const handleAuthAction = () => {
    if (user) {
      router.push('/');
    } else {
      setIsAuthModalOpen(true);
    }
  };

  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      <Container>
        <Container className="flex flex-wrap ">
          <div className="flex items-center w-full lg:w-1/2">
            <div className="max-w-2xl mb-8">
              <h1 className="text-4xl font-bold leading-snug tracking-tight text-gray-800 lg:text-4xl lg:leading-tight xl:text-6xl xl:leading-tight dark:text-white">
                Conectamos los mejores proveedores y constructores
              </h1>
              <p className="py-5 text-xl leading-normal text-gray-500 lg:text-xl xl:text-2xl dark:text-gray-300">
                Multiplicamos oportunidades para proveedores y aumentamos la productividad de constructoras.
              </p>

              <div className="flex flex-col items-start space-y-3 sm:space-x-4 sm:space-y-0 sm:items-center sm:flex-row">
                {!user && (
                  <button
                    onClick={handleAuthAction}
                    className="px-8 py-4 text-lg font-medium text-center text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2"
                  >
                    Iniciar sesión
                  </button>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center justify-center w-full lg:w-1/2">
            <div className="">
              <Image
                src={heroImg}
                width="616"
                height="617"
                className={"object-cover"}
                alt="Hero Illustration"
                loading="eager"
                placeholder="blur"
              />
            </div>
          </div>
        </Container>
        <div className="min-h-screen">
          <main className="container mx-auto px-4 py-16">
            <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">
              Licitaciones
            </h1>
            <Licitaciones />
          </main>
        </div>
        <Customers/>
      </Container>
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => {
          setIsAuthModalOpen(false);
          router.push('/');
        }}
      />
    </ThemeProvider>
  )
}