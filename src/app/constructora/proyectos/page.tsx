import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import ProjectList from '@/components/constructora/ProjectList'

export default async function ProyectosPage() {
  const supabase = createServerComponentClient({ cookies })

  const { data: { session } } = await supabase.auth.getSession()

  if (!session?.user) {
    // Manejar el caso de usuario no autenticado
    return <div>Por favor, inicia sesión para ver tus proyectos.</div>
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
    .select('*')
    .eq('user_id', userData.id)
    .order('created_at', { ascending: false })

  if (projectsError) {
    console.error('Error fetching projects:', projectsError)
    return <div>Error al cargar los proyectos. Por favor, intente de nuevo más tarde.</div>
  }

  return <ProjectList initialProjects={projects || []} />
}