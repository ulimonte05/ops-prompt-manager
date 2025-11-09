"use client";

import { useEffect, useState } from "react";
import { AppLayout } from "@/components/app-layout";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, Building2 } from "lucide-react";
import { companiesApi, Company } from "@/lib/api-client";
import { CompanyDialog } from "@/components/company-dialog";
import { DeleteDialog } from "@/components/delete-dialog";
import { useToast } from "@/components/toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function CompaniesPage() {
  const { showToast } = useToast();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadCompanies = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await companiesApi.list();
      setCompanies(data);
    } catch (err: any) {
      setError(err.message || "Failed to load companies");
      console.error("Error loading companies:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCompanies();
  }, []);

  const handleCreate = () => {
    setSelectedCompany(null);
    setDialogOpen(true);
  };

  const handleEdit = (company: Company) => {
    setSelectedCompany(company);
    setDialogOpen(true);
  };

  const handleDelete = (company: Company) => {
    setSelectedCompany(company);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedCompany) return;
    
    try {
      await companiesApi.delete(selectedCompany.id);
      showToast("Company deleted successfully", "success");
      await loadCompanies();
      setDeleteDialogOpen(false);
      setSelectedCompany(null);
    } catch (err: any) {
      const errorMessage = err.message || "Failed to delete company";
      setError(errorMessage);
      showToast(errorMessage, "error");
    }
  };

  const handleDialogClose = (success: boolean) => {
    setDialogOpen(false);
    setSelectedCompany(null);
    if (success) {
      loadCompanies();
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Companies</h1>
            <p className="text-muted-foreground">
              Manage organizations using the prompt system
            </p>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Create Company
          </Button>
        </div>

        {error && (
          <Card className="border-destructive">
            <CardContent className="pt-6">
              <p className="text-sm text-destructive">{error}</p>
            </CardContent>
          </Card>
        )}

        {loading ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Loading companies...</p>
            </CardContent>
          </Card>
        ) : companies.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No companies yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Get started by creating your first company
                </p>
                <Button onClick={handleCreate}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Company
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Companies</CardTitle>
              <CardDescription>
                {companies.length} compan{companies.length !== 1 ? "ies" : "y"} registered
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Company ID</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Template</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {companies.map((company) => (
                    <TableRow key={company.id}>
                      <TableCell className="font-medium">{company.name}</TableCell>
                      <TableCell className="font-mono text-sm">{company.company_id}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {company.description || "—"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {company.template_id ? "Yes" : "—"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(company.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(company)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(company)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        <CompanyDialog
          open={dialogOpen}
          onClose={handleDialogClose}
          company={selectedCompany}
        />

        <DeleteDialog
          open={deleteDialogOpen}
          onClose={() => {
            setDeleteDialogOpen(false);
            setSelectedCompany(null);
          }}
          onConfirm={handleDeleteConfirm}
          title="Delete Company"
          description={`Are you sure you want to delete "${selectedCompany?.name}"? This will also delete all associated prompts. This action cannot be undone.`}
        />
      </div>
    </AppLayout>
  );
}

