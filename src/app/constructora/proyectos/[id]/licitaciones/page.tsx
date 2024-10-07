import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import LicitacionesList from '@/components/constructora/LicitacionesList'

interface Licitacion {
  id: number
  partida: string
  publication_end_date: string
  active: boolean
  description: string
  project_id: number
  project: {
    id: number
    name: string
  }
}

interface Project {
  id: number
  name: string
}

export default async function LicitacionesPage({ params }: { params: { id: string } }) {
  const supabase = createServerComponentClient({ cookies })

  const { data: { session } } = await supabase.auth.getSession()

  if (!session?.user) {
    return <div>Por favor, inicia sesión para ver las licitaciones.</div>
  }

  const { data: userData, error: userError } = await supabase
    .from('user')
    .select('id')
    .eq('auth_user_id', session.user.id)
    .single()

  if (userError) {
    console.error('Error fetching user data:', userError)
    return <div>Error al cargar los datos del usuario. Por favor, intente de nuevo más tarde.</div>
  }

  const { data: projects, error: projectsError } = await supabase
    .from('project')
    .select('id, name')
    .eq('user_id', userData.id)

  if (projectsError) {
    console.error('Error fetching projects:', projectsError)
    return <div>Error al cargar los proyectos. Por favor, intente de nuevo más tarde.</div>
  }

  let licitacionesQuery = supabase
    .from('bid')
    .select(`
      id, 
      partida, 
      publication_end_date, 
      active, 
      description,
      project_id
    `)
    .eq('user_id', userData.id)

  if (params.id !== 'all') {
    licitacionesQuery = licitacionesQuery.eq('project_id', params.id)
  }

  const { data: licitacionesData, error: licitacionesError } = await licitacionesQuery

  if (licitacionesError) {
    console.error('Error fetching licitaciones:', licitacionesError)
    return <div>Error al cargar las licitaciones. Por favor, intente de nuevo más tarde.</div>
  }

  // Crear un mapa de proyectos para búsqueda rápida
  const projectMap = new Map(projects?.map(project => [project.id, project]) || [])

  // Asegurarse de que cada licitación tenga un objeto project
  const licitaciones: Licitacion[] = licitacionesData?.map(licitacion => {
    const project = projectMap.get(licitacion.project_id) || { id: licitacion.project_id, name: 'Proyecto Desconocido' }
    return {
      ...licitacion,
      project: project
    }
  }) || []

  return <LicitacionesList 
    initialLicitaciones={licitaciones} 
    projects={projects || []} 
    selectedProjectId={params.id} 
  />
}