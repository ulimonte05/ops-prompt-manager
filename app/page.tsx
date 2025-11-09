import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { AppLayout } from "@/components/app-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { templatesApi, companiesApi, promptsApi } from "@/lib/api-client";
import { FileText, Building2, MessageSquare } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function Dashboard() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect("/sign-in");
  }

  // Fetch overview data
  let templatesCount = 0;
  let companiesCount = 0;
  let promptsCount = 0;

  try {
    const [templates, companies] = await Promise.all([
      templatesApi.list(),
      companiesApi.list(),
    ]);
    
    templatesCount = templates.length;
    companiesCount = companies.length;
    
    // Count active prompts across all companies
    const promptsPromises = companies.map(company => 
      promptsApi.getAllByCompany(company.company_id).catch(() => [])
    );
    const allPrompts = (await Promise.all(promptsPromises)).flat();
    promptsCount = allPrompts.filter(p => p.is_active).length;
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
  }

  const stats = [
    {
      name: "Templates",
      value: templatesCount,
      icon: FileText,
      href: "/templates",
      description: "Reusable prompt templates",
    },
    {
      name: "Companies",
      value: companiesCount,
      icon: Building2,
      href: "/companies",
      description: "Organizations using the system",
    },
    {
      name: "Active Prompts",
      value: promptsCount,
      icon: MessageSquare,
      href: "/prompts",
      description: "Currently active prompts",
    },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your prompt orchestration system
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Link key={stat.name} href={stat.href}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {stat.name}
                    </CardTitle>
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className="text-xs text-muted-foreground">
                      {stat.description}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common tasks to get started
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/templates">
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="mr-2 h-4 w-4" />
                  Manage Templates
                </Button>
              </Link>
              <Link href="/companies">
                <Button variant="outline" className="w-full justify-start">
                  <Building2 className="mr-2 h-4 w-4" />
                  Manage Companies
                </Button>
              </Link>
              <Link href="/prompts">
                <Button variant="outline" className="w-full justify-start">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Manage Prompts
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Getting Started</CardTitle>
              <CardDescription>
                Learn how to use the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                <li>Create a template with reusable variables</li>
                <li>Add companies that will use the system</li>
                <li>Create prompts for each company (from template or custom)</li>
                <li>Manage and version your prompts</li>
              </ol>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
