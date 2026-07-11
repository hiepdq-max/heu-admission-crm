import { RoleBasedHome } from "@/components/dashboard/role-based-home";
import {
  getMockHomeProfile,
  type MockHomeProfileKey,
} from "@/lib/role-based-home-mock";

type HomePageProps = {
  searchParams?: Promise<{
    role?: string | string[];
  }>;
};

export default async function Home({ searchParams }: HomePageProps) {
  const params = searchParams ? await searchParams : {};
  const requestedRole = Array.isArray(params.role) ? params.role[0] : params.role;
  const profile = getMockHomeProfile(requestedRole as MockHomeProfileKey);

  return <RoleBasedHome profile={profile} />;
}
