"use client"

import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SidebarInset } from "@/components/ui/sidebar";
import { Separator } from "@radix-ui/react-separator";


export default function formClient() {
    return(
        <SidebarInset>
            <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
                <Separator orientation="vertical"
                className="mr-2 data-[orientation:vertical]:h-4"
                />
                <div>
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink>Building Your Application</BreadcrumbLink>
                                <BreadcrumbSeparator/>
                                <BreadcrumbItem>
                                    <BreadcrumbPage>Cadastro Clientes</BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>
            </header>
            <div className="w-full p-6 transition-all duration-300">
                <Card className="w-full">
                    <CardHeader>
                        <CardTitle>Cadastro de Clientes</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-1">
                        <div className="flex items-center gap-4">

                        </div>

                    </CardContent>

                </Card>

            </div>
        </SidebarInset>
    )
}