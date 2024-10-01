import Link from "next/link";
import Image from "next/image";
import React from "react";
import { Container } from "@/components/Container";
import { WHATSAPP_NUMBER } from "@/utils/constants";

export function Footer() {
  const whatsappMessage = encodeURIComponent("Hola! Me gustaría saber más sobre Licibit");

  return (
    <div className="relative bg-black text-white">
      <Container>
        <div className="grid max-w-screen-xl grid-cols-1 gap-10 pt-10 mx-auto mt-5 border-t border-gray-700 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <div>
              <Link
                href="/"
                className="flex items-center space-x-2 text-2xl font-medium text-white"
              >
                <span>Licibit</span>
              </Link>
            </div>

            <div className="max-w-md mt-4 text-gray-300">
              Conectamos los mejores proveedores y constructores.
            </div>

            <div className="mt-5">
              <a
                href="https://vercel.com/?utm_source=web3templates&utm_campaign=oss"
                target="_blank"
                rel="noopener"
                className="relative block w-44"
              >
                <Image
                  src="/img/vercel.svg"
                  alt="Powered by Vercel"
                  width="212"
                  height="44"
                />
              </a>
            </div>
          </div>

          <div>
            <div className="flex flex-wrap w-full -mt-2 -ml-3 lg:ml-0">
              
            </div>
          </div>
          <div>
            <div className="flex flex-wrap w-full -mt-2 -ml-3 lg:ml-0">
              <div className="w-full px-4 py-2 text-gray-300 rounded-md hover:text-white focus:text-white focus:bg-gray-800 focus:outline-none">
                Dirección
              </div>
              <div className="w-full px-4 py-2 text-gray-300 rounded-md hover:text-white focus:text-white focus:bg-gray-800 focus:outline-none">
                Jr. Medrano Silva 165
              </div>
              <div className="w-full px-4 py-2 text-gray-300 rounded-md hover:text-white focus:text-white focus:bg-gray-800 focus:outline-none">
                Barranco
              </div>
              <div className="w-full px-4 py-2 text-gray-300 rounded-md hover:text-white focus:text-white focus:bg-gray-800 focus:outline-none">
                Lima, Perú
              </div>
            </div>
          </div>
          <div className="">
            <div>Contáctanos</div>
            <div className="flex mt-5 space-x-5 text-gray-400">
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappMessage}`}
                target="_blank"
                rel="noopener"
                className="hover:text-white"
              >
                <span className="sr-only">Whatsapp</span>
                <WhatsappIcon />
              </a>
            </div>
          </div>
        </div>

        <div className="my-10 text-sm text-center text-gray-400">
          2024 Licibit. Todos los Derechos Reservados.
        </div>
      </Container>
      <Backlink />
    </div>
  );
}

const WhatsappIcon = ({ size = 24 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
  </svg>
);

const Backlink = () => {
  return (
    <a
      href="https://web3templates.com"
      target="_blank"
      rel="noopener"
      className="absolute flex px-3 py-1 space-x-2 text-sm font-semibold text-white bg-black border border-gray-700 rounded shadow-sm place-items-center left-5 bottom-5"
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 30 30"
        fill="none"
        className="w-4 h-4"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="30" height="29.5385" rx="2.76923" fill="#ffffff" />
        <path
          d="M10.14 21.94H12.24L15.44 12.18L18.64 21.94H20.74L24.88 8H22.64L19.58 18.68L16.36 8.78H14.52L11.32 18.68L8.24 8H6L10.14 21.94Z"
          fill="#000000"
        />
      </svg>

      <span>Web3Templates</span>
    </a>
  );
};