import Image from "next/image";
import { Container } from "@/components/Container";

export const Customers = () => {
  return (
    <Container>
      <div className="flex flex-col justify-center">
        <div className="text-xl text-center text-gray-700 dark:text-white mb-8">
          Con el apoyo de
        </div>

        <div className="flex flex-wrap justify-center items-center gap-12 mt-10 md:justify-around">
          <div className="w-60 h-32 relative">
            <Image
              src="/img/brands/UVLogo.png"
              alt="UV Logo"
              layout="fill"
              objectFit="contain"
              className="filter grayscale opacity-70"
            />
          </div>
          <div className="w-60 h-32 relative">
            <Image
              src="/img/brands/PacasmayoLogo.png"
              alt="Pacasmayo Logo"
              layout="fill"
              objectFit="contain"
              className="filter grayscale opacity-70"
            />
          </div>
          <div className="w-60 h-32 relative">
            <Image
              src="/img/brands/LaMezcladoraLogo.png"
              alt="La Mezcladora Logo"
              layout="fill"
              objectFit="contain"
              className="filter grayscale opacity-70"
            />
          </div>
        </div>
      </div>
    </Container>
  );
}