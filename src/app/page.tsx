import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import Image from 'next/image'
import heroImg from '../../public/img/hero2.jpg'
import { Customers } from "@/components/Customers"
import ClientHome from '@/components/ClientHome'

export default async function Home() {
  const supabase = createServerComponentClient({ cookies })

  const { data: bids, error } = await supabase
    .from('bid')
    .select(`
      *,
      project (name, location),
      user (enterprise_name, company_logo)
    `)
    .order('publication_end_date', { ascending: false })

  if (error) {
    console.error('Error fetching bids:', error)
    return <div>Error loading bids</div>
  }

  return (
    <ClientHome initialBids={bids || []}>
      <div className="flex flex-wrap">
        <div className="flex items-center w-full lg:w-1/2">
          <div className="max-w-2xl mb-8">
            <h1 className="text-4xl font-bold leading-snug tracking-tight text-gray-800 lg:text-4xl lg:leading-tight xl:text-6xl xl:leading-tight dark:text-white">
              Conectamos los mejores proveedores y constructores
            </h1>
            <p className="py-5 text-xl leading-normal text-gray-500 lg:text-xl xl:text-2xl dark:text-gray-300">
              Multiplicamos oportunidades para proveedores y aumentamos la productividad de constructoras.
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center w-full lg:w-1/2">
          <div className="">
            <Image
              src={heroImg}
              width={616}
              height={617}
              className="object-cover"
              alt="Hero Illustration"
              priority
            />
          </div>
        </div>
      </div>
      <Customers />
    </ClientHome>
  )
}